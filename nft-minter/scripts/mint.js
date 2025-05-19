const hre = require("hardhat");
// import { hre } from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();

  const address = await myNFT.getAddress();
  console.log("MyNFT deployed to:", address);

  const tx = await myNFT.safeMint(
    // deployer.address,
    "0xc5ba100ac6572a396fFdDEA0Ef05704eaC29Ff70",
    "ipfs://QmdEnupa3mwoq3MMhi3y9hDMPH8iALsoByTiaZttw6MkCz"
  );

  const receipt = await tx.wait();
  console.log("交易哈希:", receipt.hash);

  // 解析 Transfer 事件获取 tokenId
  const transferEvent = receipt.logs.find(log => {
    const transferSignature = "Transfer(address,address,uint256)";
    const transferTopic = hre.ethers.id(transferSignature);
    return log.topics[0] === transferTopic;
  });

  if (transferEvent && transferEvent.topics[3]) {
    const tokenId = BigInt(transferEvent.topics[3]).toString();
    console.log("铸造的 Token ID:", tokenId);
  } else {
    console.log("未找到 Transfer 事件或无法获取 Token ID");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
