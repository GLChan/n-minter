/* eslint-disable @typescript-eslint/no-require-imports */
require('@nomicfoundation/hardhat-toolbox');
require("dotenv").config({ path: '.env.local' }); // 加载 .env 文件

// 从 process.env 中获取变量，如果未定义则设置为空字符串或 undefined
const { SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;


// const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
// 检查变量是否已设置，如果需要部署，它们必须存在
if (!SEPOLIA_RPC_URL) {
  console.warn("警告: SEPOLIA_RPC_URL 未在 .env 文件中设置。");
}
if (!PRIVATE_KEY) {
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
      url: SEPOLIA_RPC_URL || "", // 如果 .env 中没有，则为空字符串
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [], // 如果 .env 中没有，则为空数组
      chainId: 11155111, // Sepolia 的 Chain ID
    },
    // localhost: {
    //   url: "http://127.0.0.1:8545",
    //   chainId: 31337,
    //   accounts: {
    //     mnemonic: "test test test test test test test test test test test junk"
    //   }
    // }
  },
  etherscan: {
    // 用于合约验证
    apiKey: ETHERSCAN_API_KEY || "",
  },
};
