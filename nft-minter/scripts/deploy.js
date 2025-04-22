const { ethers } = require("hardhat");

async function main() {
  // 获取合约工厂
  const MyNFT = await ethers.getContractFactory("MyNFT");

  // 部署合约
  console.log("Deploying contract...");

  const myNFT = await MyNFT.deploy();
  // console.log("等待合约部署...");
  // await myNFT.waitForDeployment();  // 使用新的 waitForDeployment 方法
  
  const address = await myNFT.getAddress();  // 获取合约地址
  console.log("MyNFT deployed to:", address);

  // 检查合约是否成功部署
  // 检查是否成功部署
  // if (myNFT.deployTransaction) {
  //   console.log("Waiting for confirmation...");
  //   const receipt = await myNFT.deployTransaction.wait();  // 等待交易确认
  //   console.log("Transaction confirmed in block:", receipt.blockNumber);
  //   console.log("MyNFT deployed to:", myNFT.address);
  // } else {
  //   console.error("Deploy transaction was not returned.");
  // }

  // 等待合约部署确认
  // const receipt = await myNFT.deployTransaction.wait();
  // console.log("Transaction confirmed in block:", receipt.blockNumber);

  // // 输出合约地址
  // console.log("MyNFT deployed to:", myNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
