const { ethers } = require("hardhat");

async function main() {
  // 获取合约工厂
  const MyNFT = await ethers.getContractFactory("MyNFT");

  // 部署合约
  console.log("Deploying contract...");

  const myNFT = await MyNFT.deploy();

  const address = await myNFT.getAddress();  // 获取合约地址
  console.log("MyNFT deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
