"use strict";
// indexer/src/config.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_CONFIG = exports.ETHEREUM_NODE_URL = exports.MARKETPLACE_CONTRACT_ADDRESS = void 0;
// 替换为您的 Marketplace 合约部署后的实际地址
exports.MARKETPLACE_CONTRACT_ADDRESS = "0xYourMarketplaceContractAddressHere";
// 替换为您的以太坊节点 URL (例如 Infura 或 Alchemy 的 RPC URL)
exports.ETHEREUM_NODE_URL = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID";
// 数据库配置 (示例，实际项目中请根据您的数据库类型和连接方式进行调整)
exports.DB_CONFIG = {
    host: "localhost",
    port: 5432,
    user: "your_db_user",
    password: "your_db_password",
    database: "nft_marketplace_indexer",
};
