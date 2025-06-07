// scripts/deployMarketplace.js
const { ethers } = require("hardhat");

async function main() {
  // 1. 获取部署者账户信息
  const [deployer] = await ethers.getSigners();
  console.log(`正在使用账户部署合约: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`账户余额: ${ethers.formatEther(balance)} ETH`);

  // 2. 获取 Marketplace 合约工厂
  const Marketplace = await ethers.getContractFactory("Marketplace");

  // 3. 定义构造函数所需的参数
  //    这些参数需要与您的 Marketplace.sol 的 constructor 完全匹配
  const eip712Name = "GL NFT Marketplace";      // 用于 EIP712 签名的域名，可以自定义
  const eip712Version = "1.0";                  // 版本号，可以自定义
  const platformFeeRecipient = deployer.address;  // 平台费接收地址，这里暂时用部署者地址
  const platformFeePercent = 250;                 // 平台费百分比 (基点), 250 代表 2.5%

  console.log("\n正在部署 Marketplace 合约，请稍候...");
  console.log("构造函数参数:");
  console.log(` - EIP712 Name: ${eip712Name}`);
  console.log(` - EIP712 Version: ${eip712Version}`);
  console.log(` - Initial Owner: ${deployer.address}`);
  console.log(` - Platform Fee Recipient: ${platformFeeRecipient}`);
  console.log(` - Platform Fee Percent: ${platformFeePercent} (2.5%)`);

  // 4. 部署合约
  const marketplace = await Marketplace.deploy(
    eip712Name,
    eip712Version,
    deployer.address, // initialOwner
    platformFeeRecipient,
    platformFeePercent
  );

  // 5. 等待合约部署完成
  await marketplace.waitForDeployment();
  const deployedAddress = await marketplace.getAddress();

  console.log("\n✅ Marketplace 合约已成功部署!");
  console.log(`合约地址: ${deployedAddress}`);
}

// 标准的 Hardhat 脚本执行模式
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });