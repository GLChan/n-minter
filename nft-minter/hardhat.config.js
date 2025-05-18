require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      // 默认配置会自动创建10个测试账户，无需手动配置
      // 删除自定义账户配置，使用默认的
    },
    // localhost: {
    //   url: "http://127.0.0.1:8545",
    //   chainId: 31337,
    //   accounts: {
    //     mnemonic: "test test test test test test test test test test test junk"
    //   }
    // }
  }
};
