// test/MyNFT.test.ts

const { expect } = require("chai"); // 使用 require
const { ethers } = require("hardhat"); // 使用 require
const { ZeroAddress } = require("ethers"); // 使用 require // Ethers v6 推荐显式导入 ZeroAddress

// --- TypeChain (推荐，如果已配置) ---
// 如果你的 Hardhat 项目配置了 TypeChain (通常 hardhat-toolbox 包含),
// 编译后会在 'typechain-types' 目录下生成类型。
// 导入合约类型可以获得更好的类型检查和自动补全。
// import { MyNFT } from "../typechain-types"; // 取消注释并确保路径正确

describe("MyNFT 合约", function () {

  // 建议定义一个函数来处理部署逻辑，方便在多个测试中复用
  async function deployMyNFTFixture() {
    // ethers.getSigners() 返回一个包含多个签名者对象的数组
    // 通常第一个是部署者 (owner)，第二个及以后可用于模拟其他用户 (addr1, addr2...)
    const [owner, addr1] = await ethers.getSigners();

    // 获取合约工厂
    const MyNFTFactory = await ethers.getContractFactory("MyNFT");

    // 部署合约 (如果构造函数需要参数，在这里传递)
    // 例子: const myNFT = await MyNFTFactory.deploy("NFT Name", "SYMBOL");
    // 如果使用了 TypeChain，可以进行类型断言或直接使用类型化的 Factory
    const myNFT = await MyNFTFactory.deploy();
    // const myNFT = await MyNFTFactory.deploy() as MyNFT; // 使用 TypeChain 类型断言

    // 等待部署完成
    await myNFT.waitForDeployment();

    // 返回部署后的合约实例，方便测试用例使用
    return { myNFT, owner, addr1 };
  }

  // 测试场景：部署
  describe("部署 (Deployment)", function () {
    it("应该成功部署合约", async function () {
      // 使用 fixture 函数来部署合约
      const { myNFT } = await deployMyNFTFixture();

      // 获取部署地址
      const deployedAddress = await myNFT.getAddress();

      // (可选) 打印地址
      console.log("MyNFT 合约部署地址:", deployedAddress);

      // 断言：验证地址有效性
      expect(deployedAddress).to.be.a('string');
      expect(deployedAddress).to.have.lengthOf(42);
      expect(deployedAddress).to.be.properAddress; // 检查地址格式
      expect(deployedAddress).to.not.equal(ZeroAddress); // 检查非零地址
    });

    it("应该设置正确的初始状态 (例如 name 和 symbol)", async function () {
      const { myNFT } = await deployMyNFTFixture();

      // --- (可选) 检查初始状态 ---
      // 确保将 "Your NFT Name" 和 "YNFT" 替换为你合约实际的返回值
      const expectedName = "Your NFT Name";
      const expectedSymbol = "YNFT";

      // 如果你的 MyNFT.sol 实现了 name() 和 symbol()
      // expect(await myNFT.name()).to.equal(expectedName);
      // expect(await myNFT.symbol()).to.equal(expectedSymbol);

      // 如果你的合约设置了 Owner (通常是部署者)
      // const [deployer] = await ethers.getSigners();
      // expect(await myNFT.owner()).to.equal(deployer.address);
    });
  });

  // ==============================================
  //         ↓↓↓ 新增的铸造测试块 ↓↓↓
  // ==============================================
  describe("铸造 (Minting)", function () {

    it("应该允许 owner 铸造一个新的 NFT 给指定地址，并设置正确的 Token URI", async function () {
      // 1. 准备
      const { myNFT, owner, addr1 } = await deployMyNFTFixture();
      const recipientAddress = addr1.address;
      const expectedTokenId = 0; // 假设第一个 token ID 是 0
      const testTokenURI = "ipfs://test-metadata/0"; // 定义一个测试用的 Token URI

      // 2. 执行操作并检查事件
      //    在调用 safeMint 时，需要传入 recipient 和 tokenURI 两个参数
      await expect(myNFT.connect(owner).safeMint(recipientAddress, testTokenURI))
        .to.emit(myNFT, "Transfer")
        .withArgs(ZeroAddress, recipientAddress, expectedTokenId);

      // 3. 检查状态变更
      expect(await myNFT.ownerOf(expectedTokenId)).to.equal(recipientAddress);
      expect(await myNFT.balanceOf(recipientAddress)).to.equal(1);
      // 新增：检查 Token URI 是否设置正确
      expect(await myNFT.tokenURI(expectedTokenId)).to.equal(testTokenURI);
    });

    // --- 修改第二个测试用例的逻辑和描述 ---
    it("应该允许任何地址调用 safeMint 来铸造 NFT (因为函数是 public)", async function () {
      // 1. 准备
      const { myNFT, owner, addr1 } = await deployMyNFTFixture();
      const recipientAddress = addr1.address; // 让 addr1 给自己铸造
      const expectedTokenId = 0; // 第一个 token ID
      const testTokenURI = "ipfs://test-metadata/1";

      // 2. 执行操作并检查事件
      //    让 addr1 (非 owner) 调用 public 的 safeMint 函数
      //    我们期望它能成功，并触发 Transfer 事件
      await expect(myNFT.connect(addr1).safeMint(recipientAddress, testTokenURI))
        .to.emit(myNFT, "Transfer")
        .withArgs(ZeroAddress, recipientAddress, expectedTokenId);

      // 3. 检查状态变更
      expect(await myNFT.ownerOf(expectedTokenId)).to.equal(recipientAddress);
      expect(await myNFT.balanceOf(recipientAddress)).to.equal(1);
      expect(await myNFT.tokenURI(expectedTokenId)).to.equal(testTokenURI);
    });

    // --- 在这里添加更多铸造相关的测试 ---
    // 例如:
    // - 测试铸造时 URI 是否正确设置 (如果 safeMint 包含 URI 参数)
    // - 测试铸造数量限制 (如果有)
    // - 测试铸造是否需要付费 (payable)
    // - 测试铸造第二个 NFT 时 tokenId 是否正确递增

  });


  // --- 在这里添加其他功能的测试场景 (describe 块) ---
  // describe("所有权 (Ownership)", function() {
  //   it("应该正确转移 NFT", async function() { ... });
  // });

});