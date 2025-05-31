// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol"; // <--- 1. 导入 ERC2981
import "@openzeppelin/contracts/access/Ownable.sol";    // <--- 2. 导入 Ownable 用于访问控制

contract MyNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _nextTokenId = 1; // Token ID 从 1 开始

    event NFTMinted(address indexed recipient, uint256 indexed tokenId, string tokenURI);

    /**
     * @dev 构造函数 - 现在接收参数以初始化特定的合集
     * @param name_ 此 NFT 合集的名称
     * @param symbol_ 此 NFT 合集的符号
     * @param initialContractOwner 此新部署的 MyNFT 合约实例的拥有者
     * @param defaultRoyaltyReceiver_ 此合集的默认版税接收地址
     * @param defaultRoyaltyFraction_ 此合集的默认版税比例 (基点, e.g., 500 for 5%)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address initialContractOwner,
        address defaultRoyaltyReceiver_,
        uint96 defaultRoyaltyFraction_
    ) ERC721(name_, symbol_) Ownable(initialContractOwner) { // 将合约所有权赋予 initialContractOwner
        require(defaultRoyaltyReceiver_ != address(0), "MyNFT: Royalty receiver is zero address");
        _setDefaultRoyalty(defaultRoyaltyReceiver_, defaultRoyaltyFraction_);
    }

    /**
     * @dev 安全地铸造一个新的 NFT。只有此 MyNFT 合约实例的拥有者可以调用。
     */
    function safeMint(
        address recipient,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        uint256 newItemId = _nextTokenId;
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        
        emit NFTMinted(recipient, newItemId, tokenURI);
        
        _nextTokenId++;
        return newItemId;
    }

    // --- 版税管理函数 (由 MyNFT 合约的拥有者调用) ---
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        require(receiver != address(0), "MyNFT: Royalty receiver is zero address");
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) public onlyOwner {
        require(receiver != address(0), "MyNFT: Royalty receiver is zero address");
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    function resetTokenRoyalty(uint256 tokenId) public onlyOwner {
        _resetTokenRoyalty(tokenId);
    }

    // --- 接口支持 ---
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}