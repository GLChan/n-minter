require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      accounts: [
        {
          privateKey: '1816d1f299d0c62d5d1e2cb5fb48966352277393f10575965156ba290dfdc083',
          balance: '10000000000000000000000' // 初始余额 (ETH)
        }
      ]
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
