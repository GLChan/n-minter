// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MyNFT.sol"; // 导入你的 MyNFT 合约
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFTFactory is Ownable {
    // 存储所有通过此工厂创建的 MyNFT 合约的地址
    address[] public deployedCollections;
    // 映射：创建者地址 => 该创建者创建的合集地址列表
    mapping(address => address[]) public collectionsByCreator;

    // (可选) 创建合集的费用
    uint256 public creationFee = 0.01 ether; // 例如 0.01 ETH

    // --- 事件 ---
    event CollectionCreated(
        address indexed newCollectionAddress, // 新部署的 MyNFT 合约地址
        address indexed creator,              // 调用工厂创建合集的用户 (msg.sender of createNFTCollection)
        address indexed collectionOwner,      // 新 MyNFT 合约的实际拥有者
        string name,
        string symbol,
        address royaltyReceiver,
        uint96 royaltyFraction
    );

    event CreationFeeUpdated(uint256 oldFee, uint256 newFee);

    /**
     * @dev 构造函数
     * @param initialFactoryOwner 工厂合约的初始拥有者
     */
    constructor(address initialFactoryOwner) Ownable(initialFactoryOwner) {}

    // --- 管理员功能 (由工厂合约的 Owner 调用) ---
    function setCreationFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = creationFee;
        creationFee = _newFee;
        emit CreationFeeUpdated(oldFee, _newFee);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Factory: No fees to withdraw");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Factory: Fee withdrawal failed");
    }

    // ---核心功能：创建新的 NFT 合集 ---
    /**
     * @notice 部署一个新的 MyNFT 合约实例
     * @param _name 新合集的名称
     * @param _symbol 新合集的符号
     * @param _collectionOwner 新部署的 MyNFT 合约的拥有者地址
     * @param _royaltyReceiver 新合集的版税接收地址
     * @param _royaltyFraction 新合集的版税比例 (基点)
     * @return 新部署的 MyNFT 合约的地址
     */
    function createNFTCollection(
        string memory _name,
        string memory _symbol,
        address _collectionOwner, // 这个地址将成为新 MyNFT 合约的 owner
        address _royaltyReceiver,
        uint96 _royaltyFraction
    ) external payable returns (address) {
        if (creationFee > 0) {
            require(msg.value >= creationFee, "Factory: Insufficient fee paid");
        }

        // 部署新的 MyNFT 合约实例，并将参数传递给 MyNFT 的构造函数
        MyNFT newNFTContract = new MyNFT(
            _name,
            _symbol,
            _collectionOwner,
            _royaltyReceiver,
            _royaltyFraction
        );

        address newCollectionAddress = address(newNFTContract);
        deployedCollections.push(newCollectionAddress);
        collectionsByCreator[msg.sender].push(newCollectionAddress); // msg.sender 是调用此工厂函数的人

        emit CollectionCreated(
            newCollectionAddress,
            msg.sender, // 调用工厂创建函数的人
            _collectionOwner, // 新 MyNFT 合约的实际拥有者
            _name,
            _symbol,
            _royaltyReceiver,
            _royaltyFraction
        );

        // (可选) 如果创建费用大于实际部署成本，多余的 msg.value 会保留在工厂合约中
        // 你可以在 withdrawFees 中处理，或者如果费用固定且仅为覆盖 Gas，则不退还
        // 如果想退还多余的ETH:
        // if (msg.value > creationFee && creationFee > 0) {
        //     payable(msg.sender).transfer(msg.value - creationFee);
        // }

        return newCollectionAddress;
    }

    // --- 视图函数 ---
    function getDeployedCollectionsCount() external view returns (uint256) {
        return deployedCollections.length;
    }

    function getCollectionsByCreatorCount(address _creator) external view returns (uint256) {
        return collectionsByCreator[_creator].length;
    }
}