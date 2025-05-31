// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol"; // 用于查询版税信息
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // 防止重入攻击
import "@openzeppelin/contracts/access/Ownable.sol"; // 用于管理权限，例如设置费用

contract Marketplace is Ownable, ReentrancyGuard {
    // --- 结构体 ---
    struct Listing {
        address seller; // 卖家地址
        address nftAddress; // NFT 合约地址
        uint256 tokenId; // NFT 的 Token ID
        uint256 price; // 价格 (以 wei 为单位)
        bool active; // 挂单是否仍然有效
    }

    // --- 状态变量 ---
    // 平台费用接收地址
    address public platformFeeRecipient;
    // 平台费用百分比 (以基点为单位, 例如 250 代表 2.5%)
    uint256 public platformFeePercent; // e.g., 250 for 2.5% (250/10000)

    // 存储挂单信息: NFT合约地址 -> Token ID -> Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    // --- 事件 ---
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemSold(
        address indexed nftAddress, // 哪个合集的 NFT
        uint256 indexed tokenId, // 哪个具体的 NFT
        address indexed seller, // 谁卖的
        address buyer, // 谁买的
        uint256 price, //  价格
        uint256 platformFee, // 平台费用
        uint256 royaltyFee // 版税费用
    );

    event ListingCancelled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event PlatformFeePercentUpdated(
        uint256 oldFeePercent,
        uint256 newFeePercent
    );
    event PlatformFeeRecipientUpdated(
        address oldRecipient,
        address newRecipient
    );

    // --- 构造函数 ---
    constructor(
        address initialOwner,
        address _platformFeeRecipient,
        uint256 _platformFeePercent
    ) Ownable(initialOwner) {
        require(
            _platformFeeRecipient != address(0),
            "Marketplace: Platform fee recipient cannot be zero address"
        );
        require(
            _platformFeePercent <= 10000,
            "Marketplace: Platform fee percent cannot exceed 10000 (100%)"
        ); // 10000 basis points = 100%

        platformFeeRecipient = _platformFeeRecipient;
        platformFeePercent = _platformFeePercent;
    }

    // --- 管理员功能 ---
    function setPlatformFeePercent(uint256 _newFeePercent) external onlyOwner {
        require(
            _newFeePercent <= 10000,
            "Marketplace: Platform fee percent cannot exceed 10000"
        );
        uint256 oldFeePercent = platformFeePercent;
        platformFeePercent = _newFeePercent;
        emit PlatformFeePercentUpdated(oldFeePercent, _newFeePercent);
    }

    function setPlatformFeeRecipient(address _newRecipient) external onlyOwner {
        require(
            _newRecipient != address(0),
            "Marketplace: New recipient cannot be zero address"
        );
        address oldRecipient = platformFeeRecipient;
        platformFeeRecipient = _newRecipient;
        emit PlatformFeeRecipientUpdated(oldRecipient, _newRecipient);
    }

    // --- 市场核心功能 ---

    /**
     * @notice 挂单一个 NFT 到市场上
     * @param _nftAddress NFT 合约地址
     * @param _tokenId 要挂单的 NFT 的 Token ID
     * @param _price 价格 (以 wei 为单位)
     */
    function listItem(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    ) external nonReentrant {
        require(_price > 0, "Marketplace: Price must be greater than zero");

        IERC721 nftContract = IERC721(_nftAddress);
        require(
            nftContract.ownerOf(_tokenId) == msg.sender,
            "Marketplace: You are not the owner of this NFT"
        );

        // 确保市场合约已被授权转移此 NFT
        require(
            nftContract.isApprovedForAll(msg.sender, address(this)) ||
                nftContract.getApproved(_tokenId) == address(this),
            "Marketplace: Contract not approved to transfer this NFT"
        );

        // 如果已存在挂单 (例如卖家想更新价格)，可以先取消再重新挂单，或者添加 updateListingPrice 功能
        // 为简单起见，这里假设一个 NFT 一次只有一个有效挂单，旧的会被覆盖或应先取消
        // 或者，我们可以要求 tokenId 之前没有激活的挂单
        require(
            !listings[_nftAddress][_tokenId].active,
            "Marketplace: Item is already listed. Cancel first to relist."
        );

        listings[_nftAddress][_tokenId] = Listing({
            seller: msg.sender,
            nftAddress: _nftAddress,
            tokenId: _tokenId,
            price: _price,
            active: true
        });

        emit ItemListed(msg.sender, _nftAddress, _tokenId, _price);
    }

    /**
     * @notice 从市场上购买一个 NFT
     * @param _nftAddress NFT 合约地址
     * @param _tokenId 要购买的 NFT 的 Token ID
     */
    function buyItem(
        address _nftAddress,
        uint256 _tokenId
    ) external payable nonReentrant {
        Listing storage listing = listings[_nftAddress][_tokenId]; // 使用 storage 引用以修改

        require(
            listing.active,
            "Marketplace: Item is not actively listed or already sold"
        );
        require(
            msg.value == listing.price,
            "Marketplace: Incorrect ETH amount sent. Please send exact price."
        );
        require(
            listing.seller != msg.sender,
            "Marketplace: Buyer cannot be the seller"
        );

        address seller = listing.seller;
        uint256 price = listing.price;

        // 1. 尽早标记为不活跃，以防重入时再次购买同一个挂单
        listing.active = false;

        // 2. 计算平台费用
        uint256 platformFee = (price * platformFeePercent) / 10000;

        // 3. 计算并获取版税信息
        uint256 royaltyFee = 0;
        address royaltyRecipient = address(0);
        try IERC2981(_nftAddress).royaltyInfo(_tokenId, price) returns (
            address receiver,
            uint256 royaltyAmount
        ) {
            if (receiver != address(0) && royaltyAmount > 0) {
                royaltyRecipient = receiver;
                royaltyFee = royaltyAmount;
            }
        } catch {
            // 如果合约不支持 ERC2981 或调用失败，则版税为0，不执行任何操作
        }

        // 安全检查：确保费用总和不超过价格
        require(
            platformFee + royaltyFee <= price,
            "Marketplace: Fees exceed total price"
        );

        // 4. 计算卖家应得金额
        uint256 sellerProceeds = price - platformFee - royaltyFee;

        // 5. 转移 NFT 给买家
        IERC721(_nftAddress).safeTransferFrom(seller, msg.sender, _tokenId);

        // 6. 分配资金 (使用 .call{value: ...}("") 更安全)
        if (platformFee > 0) {
            (bool successPlatform, ) = platformFeeRecipient.call{
                value: platformFee
            }("");
            require(
                successPlatform,
                "Marketplace: Platform fee transfer failed"
            );
        }

        if (royaltyFee > 0 && royaltyRecipient != address(0)) {
            (bool successRoyalty, ) = royaltyRecipient.call{value: royaltyFee}(
                ""
            );
            require(successRoyalty, "Marketplace: Royalty fee transfer failed");
        }

        // 即使 sellerProceeds 为 0 (例如全部是费用和版税)，也尝试发送
        (bool successSeller, ) = payable(seller).call{value: sellerProceeds}(
            ""
        );
        require(successSeller, "Marketplace: Seller proceeds transfer failed");

        emit ItemSold(
            _nftAddress,
            _tokenId,
            seller,
            msg.sender,
            price,
            platformFee,
            royaltyFee
        );
    }

    /**
     * @notice 取消一个挂单
     * @param _nftAddress NFT 合约地址
     * @param _tokenId 要取消挂单的 NFT 的 Token ID
     */
    function cancelListing(
        address _nftAddress,
        uint256 _tokenId
    ) external nonReentrant {
        Listing storage listing = listings[_nftAddress][_tokenId];

        require(listing.active, "Marketplace: Item is not actively listed");
        require(
            listing.seller == msg.sender,
            "Marketplace: You are not the seller of this listing"
        );

        listing.active = false;
        emit ListingCancelled(msg.sender, _nftAddress, _tokenId);
    }

    // --- 视图函数 (可选) ---
    /**
     * @notice 获取特定挂单的信息
     */
    function getListing(
        address _nftAddress,
        uint256 _tokenId
    ) external view returns (address seller, uint256 price, bool active) {
        Listing storage item = listings[_nftAddress][_tokenId];
        return (item.seller, item.price, item.active);
    }
}
