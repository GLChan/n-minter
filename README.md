# NFT 铸造平台

这是一个基于 Next.js 和 Hardhat 构建的简版 NFT 铸造平台，参考了 Zora 的设计理念。该平台允许用户连接钱包并铸造自己的 NFT。

## 简版 NFT 铸造平台

### ✅ 功能目标（MVP）：

- 钱包连接
- 创建合集（合约 Factory）
- 铸造 NFT 到链上（ERC721）
- 查看已 mint 的 NFT
- 上架/下架 NFT
- 购买/报价 NFT
- 转移 NFT

---

## 🛠️ 技术栈：

| 层级     | 技术                                 |
| -------- | ------------------------------------ |
| 前端框架 | Next.js（App Router） + Tailwind CSS |
| 合约开发 | Solidity + Hardhat                   |
| 合约交互 | Ethers.js + Wagmi v1                 |
| 钱包连接 | RainbowKit                           |
| 图片存储 | Pinata（基于 IPFS）                  |
| 铸造 NFT | ERC721 合约 + IPFS metadata          |
| 部署     | Vercel（前端）+ Sepolia（测试网）    |

---

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
