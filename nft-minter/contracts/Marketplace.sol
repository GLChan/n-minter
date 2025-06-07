// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title 一个基于链下签名订单簿的去中心化 NFT 市场
 * @notice 该合约不存储挂单或报价状态，只负责验证签名并执行原子交换。
 * @dev 所有订单在链下创建和签名，只有在成交时才由其中一方提交到链上执行。
 */
contract Marketplace is Ownable, ReentrancyGuard, EIP712 {
    // --- 订单结构体 ---
    // 这是在链下创建并由用户签名的数据结构。
    struct Order {
        address seller;         // 卖家地址
        address buyer;          // 买家地址 (如果为 address(0)，则为公开订单，任何人可购买)
        address nftAddress;     // NFT 合约地址
        uint256 tokenId;        // NFT Token ID
        address currency;       // 支付货币的 ERC20 地址 (例如 WETH)
        uint256 price;          // 价格 (以 currency 的最小单位)
        uint256 nonce;          // 防止重放攻击的随机数，与签名者地址绑定
        uint256 deadline;       // 订单过期时间戳 (Unix aTimestamp)
    }

    // --- 状态变量 ---
    address public platformFeeRecipient;
    uint256 public platformFeePercent;
    
    // 跟踪每个用户的 nonce。用户可以通过 incrementNonce() 使自己之前的所有签名失效。
    mapping(address => uint256) public userNonces;
    // 跟踪已成交或已取消的订单哈希，防止重放攻击。
    mapping(bytes32 => bool) public orderStatus;

    // --- 事件 ---
    event OrderFulfilled(bytes32 indexed orderHash, address indexed seller, address indexed buyer, address nftAddress, uint256 tokenId, uint256 price);
    event OrderCancelled(bytes32 indexed orderHash, address indexed nftAddress, uint256 indexed tokenId, address user);
    event PlatformFeePercentUpdated(uint256 oldFeePercent, uint256 newFeePercent);
    event PlatformFeeRecipientUpdated(address oldRecipient, address newRecipient);
    
    // --- EIP712 签名验证相关 ---
    bytes32 private constant _ORDER_TYPEHASH = keccak256(
        "Order(address seller,address buyer,address nftAddress,uint256 tokenId,address currency,uint256 price,uint256 nonce,uint256 deadline)"
    );

    constructor(
        string memory name, // EIP712 域名，例如 "My NFT Marketplace"
        string memory version, // EIP712 版本，例如 "1"
        address initialOwner,
        address _platformFeeRecipient,
        uint256 _platformFeePercent
    ) EIP712(name, version) Ownable(initialOwner) {
        require(_platformFeeRecipient != address(0), "Recipient cannot be zero");
        platformFeeRecipient = _platformFeeRecipient;
        platformFeePercent = _platformFeePercent;
    }
    
    // --- 管理员功能 ---
    function setPlatformFeePercent(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 10000, "Fee percent cannot exceed 10000"); // basis points
        emit PlatformFeePercentUpdated(platformFeePercent, _newFeePercent);
        platformFeePercent = _newFeePercent;
    }

    function setPlatformFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Recipient cannot be zero");
        emit PlatformFeeRecipientUpdated(platformFeeRecipient, _newRecipient);
        platformFeeRecipient = _newRecipient;
    }


    // --- 核心交易功能 ---

    /**
     * @notice 【场景一：买家购买】执行一个由卖家签名的销售订单。
     * @param order 包含所有订单信息的结构体，由卖家签名。
     * @param signature 卖家的 EIP712 签名。
     */
    function fulfillOrder(Order calldata order, bytes calldata signature) external nonReentrant {
        // 1. 验证订单基础信息
        require(block.timestamp < order.deadline, "Order: Expired");
        
        address signer = order.seller;
        bytes32 orderHash = _hashOrder(order);

        // 2. 验证订单状态，防止重放
        require(!orderStatus[orderHash], "Order: Already handled");

        // 3. 验证签名是否来自卖家
        require(_verifySignature(signer, orderHash, signature), "Order: Invalid signature");

        // 4. 标记订单为已完成
        orderStatus[orderHash] = true;

        // 5. 确定买家身份
        address buyer = msg.sender; // 交易的发起者是买家
        if (order.buyer != address(0)) {
            require(buyer == order.buyer, "Order: Not for you"); // 如果是私下销售，验证买家身份
        }

        // 6. 执行原子交换
        _executeTrade(buyer, order.seller, order.nftAddress, order.tokenId, order.currency, order.price);
        
        emit OrderFulfilled(orderHash, order.seller, buyer, order.nftAddress, order.tokenId, order.price);
    }
    
    /**
     * @notice 【场景二：卖家接受报价】执行一个由买家签名的报价订单。
     * @param order 包含所有报价信息的结构体，由买家签名。
     * @param signature 买家的 EIP712 签名。
     */
    function fulfillOffer(Order calldata order, bytes calldata signature) external nonReentrant {
        // 1. 验证订单基础信息
        require(block.timestamp < order.deadline, "Offer: Expired");

        address signer = order.buyer; // 在此场景下，签署者是买家
        address seller = msg.sender; // 交易的发起者是卖家
        bytes32 orderHash = _hashOrder(order);

        // 2. 验证订单状态
        require(!orderStatus[orderHash], "Offer: Already handled");

        // 3. 验证此报价是否是给当前卖家的
        require(seller == order.seller, "Offer: Not for you");

        // 4. 验证买家的签名
        require(_verifySignature(signer, orderHash, signature), "Offer: Invalid buyer signature");

        // 5. 标记订单为已完成
        orderStatus[orderHash] = true;

        // 6. 执行原子交换
        _executeTrade(order.buyer, seller, order.nftAddress, order.tokenId, order.currency, order.price);

        emit OrderFulfilled(orderHash, seller, order.buyer, order.nftAddress, order.tokenId, order.price);
    }
    
    // --- 订单管理功能 ---
    /**
     * @notice 在链上取消一个已签名的订单，使其永久失效。
     */
    function cancelOrder(Order calldata order) external {
        address user = msg.sender;
        // 订单的签署方（卖家或买家）可以取消自己的订单
        require(user == order.seller || user == order.buyer, "Not a party to the order");

        bytes32 orderHash = _hashOrder(order);
        require(!orderStatus[orderHash], "Order: Already handled");

        orderStatus[orderHash] = true;
        emit OrderCancelled(orderHash, order.nftAddress, order.tokenId, user);
    }
    
    /**
     * @notice 递增用户的 nonce，这将使用户所有使用旧 nonce 的签名全部失效。
     */
    function incrementNonce() external {
        userNonces[msg.sender]++;
    }

    // --- 内部辅助函数 ---
    function _hashOrder(Order calldata order) internal view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            _ORDER_TYPEHASH,
            order.seller,
            order.buyer,
            order.nftAddress,
            order.tokenId,
            order.currency,
            order.price,
            order.nonce,
            order.deadline
        )));
    }

    function _verifySignature(address signer, bytes32 digest, bytes calldata signature) internal pure returns (bool) {
        return ECDSA.recover(digest, signature) == signer;
    }

    function _executeTrade(address buyer, address seller, address nftAddress, uint256 tokenId, address currency, uint256 price) internal {
        // 前提：买家已授权本合约可操作其 currency 代币，卖家已授权本合约可操作其 NFT
        IERC721 nft = IERC721(nftAddress);
        require(nft.ownerOf(tokenId) == seller, "Seller no longer owns NFT");

        // a. 计算费用
        uint256 platformFee = (price * platformFeePercent) / 10000;
        (address royaltyRecipient, uint256 royaltyFee) = _getRoyaltyInfo(nftAddress, tokenId, price);
        require(platformFee + royaltyFee <= price, "Fees exceed price");
        uint256 sellerProceeds = price - platformFee - royaltyFee;
        
        // b. 转移资金 (从买家到各方)
        IERC20 token = IERC20(currency);
        // 为了安全和gas效率，建议前端一次性授权足够的金额给合约，而不是在交易中分开授权
        require(token.transferFrom(buyer, seller, sellerProceeds), "Transfer to seller failed");
        if (platformFee > 0) { require(token.transferFrom(buyer, platformFeeRecipient, platformFee), "Platform fee transfer failed"); }
        if (royaltyFee > 0 && royaltyRecipient != address(0)) { require(token.transferFrom(buyer, royaltyRecipient, royaltyFee), "Royalty fee transfer failed"); }
        
        // c. 转移 NFT (从卖家到买家)
        nft.safeTransferFrom(seller, buyer, tokenId);
    }

    function _getRoyaltyInfo(address _nftAddress, uint256 _tokenId, uint256 _price) internal view returns (address, uint256) {
        try IERC2981(_nftAddress).royaltyInfo(_tokenId, _price) returns (address receiver, uint256 royaltyAmount) {
            return (receiver, royaltyAmount);
        } catch { return (address(0), 0); }
    }
}