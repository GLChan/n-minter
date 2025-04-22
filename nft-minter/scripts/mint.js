// const hre = require("hardhat");
import { hre } from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();

  const address = await myNFT.getAddress();
  console.log("MyNFT deployed to:", address);

  const tx = await myNFT.safeMint(
    deployer.address,
    "ipfs://your-token-uri"
  );

  await tx.wait();
  console.log("NFT minted!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
