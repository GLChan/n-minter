# NFT 铸造平台

这是一个基于 Next.js 和 Hardhat 构建的简版 NFT 铸造平台，参考了 Zora 的设计理念。该平台允许用户连接钱包并铸造自己的 NFT。

## 项目概述

NFT 铸造平台提供了一个用户友好的界面，让用户能够：
- 连接钱包（如 MetaMask）
- 上传 NFT 艺术作品及元数据
- 铸造 ERC-721 标准的 NFT
- 查看已铸造的 NFT

该项目采用了现代化的 Web3 开发工具和最佳实践，适合作为学习区块链开发的入门项目或快速构建 NFT 相关应用的基础。

## 技术栈

### 前端
- **Next.js 15.3.1** - React 框架
- **React 19** - 用户界面库
- **TailwindCSS 4** - CSS 框架
- **RainbowKit 2** - 钱包连接 UI 组件
- **wagmi 2** - React Hooks 用于以太坊
- **ethers.js 6** - 以太坊工具库
- **viem** - 类型安全的以太坊交互

### 智能合约
- **Solidity 0.8.20** - 合约编程语言 
- **Hardhat** - 开发环境
- **OpenZeppelin Contracts** - 安全的智能合约库

## 项目结构

```
nft-minter/
├── contracts/              # 智能合约代码
│   └── MyNFT.sol           # NFT 主合约
├── scripts/                # 部署和测试脚本
│   ├── deploy.js           # 合约部署脚本
│   └── mint.js             # NFT 铸造测试脚本
├── src/                    # 前端应用源码
│   └── app/                # Next.js App Router
│       ├── page.tsx        # 主页面
│       ├── layout.tsx      # 应用布局
│       └── globals.css     # 全局样式
├── public/                 # 静态资源
├── hardhat.config.js       # Hardhat 配置
├── next.config.ts          # Next.js 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 项目依赖
```

## 智能合约

项目使用 ERC-721 标准创建 NFT 合约。主合约 `MyNFT.sol` 基于 OpenZeppelin 的 `ERC721URIStorage` 实现，提供安全的 NFT 铸造功能。

### 主要功能

- **safeMint**: 安全铸造新的 NFT 并分配给指定地址
  - 参数：接收地址、Token URI（指向 NFT 元数据的链接）
  - 返回：新铸造的 NFT 的 Token ID

## 快速开始

### 前置要求

- Node.js 18.x 或更高版本
- npm 或 yarn
- MetaMask 钱包或其他兼容的以太坊钱包

### 安装

1. 克隆仓库
```bash
git clone https://github.com/yourusername/nft-minter.git
cd nft-minter
```

2. 安装依赖
```bash
npm install
```

### 本地开发

1. 启动本地区块链
```bash
npx hardhat node
```

2. 部署合约到本地网络
```bash
npm run deploy:contracts
```

3. 启动前端开发服务器
```bash
npm run dev
```

4. 在浏览器中访问 [http://localhost:3000](http://localhost:3000)

## 使用指南

### 连接钱包

1. 点击页面上的"连接钱包"按钮
2. 从弹出的提供商列表中选择您的钱包（例如 MetaMask）
3. 授权连接请求

### 铸造 NFT

1. 上传 NFT 图像文件（支持 JPG、PNG、GIF 等）
2. 填写 NFT 元数据（名称、描述等）
3. 点击"铸造"按钮
4. 确认钱包中的交易请求
5. 等待交易确认

### 查看已铸造的 NFT

铸造成功后，您可以在"我的 NFT"部分查看已铸造的 NFT，或在 OpenSea 等市场上查看（如果部署到公共测试网或主网）。

## 开发日志

### 04-21
- ✅ 本地部署了合约（MyNFT）
- ✅ 用脚本成功调用 mintNFT 方法完成了 NFT 铸造！

## 未来计划

- 添加批量铸造功能
- 集成 IPFS 用于 NFT 资产和元数据存储
- 增加 NFT 铸造活动创建功能
- 支持多种 NFT 标准（ERC-1155）
- 添加铸造费用和版税设置

## 许可证

MIT


```
npx hardhat clean
npx hardhat node
npx hardhat test ./test/MyNFT.test.ts
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/deploy.js --network sepolia
```

React
Nextjs - App Router
Supabase SSR
RainbowKit wagmi viem
Next-Auth
