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

  // 在测试开始前打印 Hardhat 账户数量进行调试
  before(async function() {
    const signers = await ethers.getSigners();
    console.log(`测试开始: 检测到 ${signers.length} 个签名者账户`);
    
    if (signers.length < 2) {
      console.warn("警告: 测试需要至少 2 个账户，请检查 Hardhat 配置");
    }
  });

  // 建议定义一个函数来处理部署逻辑，方便在多个测试中复用
  async function deployMyNFTFixture() {
    // 获取签名者账户
    const signers = await ethers.getSigners();
    
    // 确保至少有一个账户
    if (signers.length === 0) {
      throw new Error("没有签名者账户");
    }
    
    const owner = signers[0];
    // 如果没有第二个账户，使用第一个代替
    const addr1 = signers.length > 1 ? signers[1] : signers[0];

    console.log("Owner address:", await owner.getAddress());
    console.log("Addr1 address:", await addr1.getAddress());

    // 获取合约工厂
    const MyNFTFactory = await ethers.getContractFactory("MyNFT");

    // 部署合约
    const myNFT = await MyNFTFactory.deploy();

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

      // 检查实际的名称和符号
      expect(await myNFT.name()).to.equal("MyNFT");
      expect(await myNFT.symbol()).to.equal("MNFT");
    });
  });

  // ==============================================
  //         ↓↓↓ 新增的铸造测试块 ↓↓↓
  // ==============================================
  describe("铸造 (Minting)", function () {

    it("应该允许 owner 铸造一个新的 NFT 给指定地址，并设置正确的 Token URI", async function () {
      // 1. 准备
      const { myNFT, owner, addr1 } = await deployMyNFTFixture();
      const recipientAddress = await addr1.getAddress(); // 使用 getAddress() 获取地址
      const expectedTokenId = 1; // 第一个 token ID 是 1 (查看合约的 _tokenIds = 1)
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
      const recipientAddress = await addr1.getAddress(); // 使用 getAddress() 获取地址
      const expectedTokenId = 1; // 第一个 token ID
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

    it("每次铸造应该递增 tokenId", async function() {
      const { myNFT, owner } = await deployMyNFTFixture();
      const ownerAddress = await owner.getAddress();
      
      // 铸造第一个 NFT，预期 ID 为 1
      await myNFT.safeMint(ownerAddress, "ipfs://test/1");
      
      // 铸造第二个 NFT，预期 ID 为 2
      await expect(myNFT.safeMint(ownerAddress, "ipfs://test/2"))
        .to.emit(myNFT, "Transfer")
        .withArgs(ZeroAddress, ownerAddress, 2);
        
      // 验证所有权
      expect(await myNFT.ownerOf(1)).to.equal(ownerAddress);
      expect(await myNFT.ownerOf(2)).to.equal(ownerAddress);
      
      // 验证 URI
      expect(await myNFT.tokenURI(1)).to.equal("ipfs://test/1");
      expect(await myNFT.tokenURI(2)).to.equal("ipfs://test/2");
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