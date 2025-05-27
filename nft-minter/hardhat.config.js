require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // 确保这行在顶部，以加载 .env 文件

// 从 process.env 中获取变量，如果未定义则设置为空字符串或 undefined
const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
// const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
// 检查变量是否已设置，如果需要部署，它们必须存在
if (!sepoliaRpcUrl) {
  console.warn("警告: SEPOLIA_RPC_URL 未在 .env 文件中设置。");
}
if (!privateKey) {
  console.warn("警告: PRIVATE_KEY 未在 .env 文件中设置。部署将无法进行。");
}

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      // 默认配置会自动创建10个测试账户，无需手动配置
      // 删除自定义账户配置，使用默认的
    },
    sepolia: {
      url: sepoliaRpcUrl || "", // 使用从 .env 加载的 URL
      accounts: privateKey !== undefined ? [privateKey] : [], // 使用从 .env 加载的私钥
      // accounts 必须是一个数组，所以我们将私钥放入数组中
      // 如果 privateKey 未定义，则返回空数组，避免 Hardhat 报错
    },
    // localhost: {
    //   url: "http://127.0.0.1:8545",
    //   chainId: 31337,
    //   accounts: {
    //     mnemonic: "test test test test test test test test test test test junk"
    //   }
    // }
  },
};
