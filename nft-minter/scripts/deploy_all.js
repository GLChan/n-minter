// scripts/deploy_all.js
async function main() {
  // 获取部署者账户（通常是第一个签名者）
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const weiAmount = (await deployer.provider.getBalance(deployer.address)).toString();
  console.log("Account balance:", ethers.formatEther(weiAmount));

  // 部署 MyNFTFactory 合约
  // 构造函数参数: initialFactoryOwner
  const MyNFTFactory = await ethers.getContractFactory("MyNFTFactory");
  const myNFTFactory = await MyNFTFactory.deploy(deployer.address);
  await myNFTFactory.waitForDeployment(); // 等待合约部署完成
  const myNFTFactoryAddress = await myNFTFactory.getAddress();
  console.log("MyNFTFactory deployed to:", myNFTFactoryAddress);

  // 部署 Marketplace 合约
  // 构造函数参数: initialOwner, _platformFeeRecipient, _platformFeePercent
  const platformFeeRecipientAddress = deployer.address; // 平台费接收地址，这里也用部署者
  const platformFeePercent = 250; // 例如 2.5% (250 / 10000)

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    deployer.address, // initialOwner
    platformFeeRecipientAddress,
    platformFeePercent
  );
  await marketplace.waitForDeployment(); // 等待合约部署完成
  const marketplaceAddress = await marketplace.getAddress();
  console.log("Marketplace deployed to:", marketplaceAddress);

  console.log("\n--- Deployment Summary ---");
  console.log(`MyNFTFactory: ${myNFTFactoryAddress}`);
  console.log(`Marketplace: ${marketplaceAddress}`);
  console.log(`   - Marketplace Owner: ${deployer.address}`);
  console.log(`   - Platform Fee Recipient: ${platformFeeRecipientAddress}`);
  console.log(`   - Platform Fee Percent: ${platformFeePercent / 100}%`);

  // MyNFT.sol 不需要直接通过脚本部署，它是由 MyNFTFactory 的 createNFTCollection 函数部署的。
  // 如果你想在部署脚本中也创建一个 NFT 合集，可以这样做（可选）：
  // console.log("\nCreating a test MyNFT collection via factory...");
  // const creationFee = await myNFTFactory.creationFee();
  // const tx = await myNFTFactory.createNFTCollection(
  //   "My First Hardhat Collection", // _name
  //   "MFHC",                        // _symbol
  //   deployer.address,              // _collectionOwner
  //   deployer.address,              // _royaltyReceiver
  //   500,                           // _royaltyFraction (5%)
  //   { value: creationFee }         // 支付创建费用
  // );
  // const receipt = await tx.wait();
  // const collectionCreatedEvent = receipt.logs.find(log => log.eventName === 'CollectionCreated'); // 根据实际事件名称和合约调整
  // if (collectionCreatedEvent) {
  //   const newCollectionAddress = collectionCreatedEvent.args.newCollectionAddress;
  //   console.log(`New MyNFT collection created at: ${newCollectionAddress}`);
  // } else {
  //   console.log("Could not find CollectionCreated event in transaction logs.");
  // }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });