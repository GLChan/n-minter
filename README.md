# n-minter


## 简版 NFT 铸造平台

### ✅ 功能目标（MVP）：
- 上传图片（支持预览）
- 填写标题 / 描述
- 铸造 NFT 到链上（ERC721）
- 钱包连接 + 查看已 mint 的 NFT

---

## 🛠️ 技术栈：

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js（App Router） + Tailwind CSS |
| 合约开发 | Solidity + Hardhat |
| 合约交互 | Ethers.js + Wagmi v1 |
| 钱包连接 | RainbowKit |
| 图片存储 | NFT.Storage / Web3.Storage（基于 IPFS） |
| 铸造 NFT | ERC721 合约 + IPFS metadata |
| 部署 | Vercel（前端）+ Polygon Mumbai（测试网） |

---

## 🪜 第一步：搭建项目骨架（Zora 风格）

你可以使用以下 starter：

```bash
npx create-next-app@latest nft-minter --typescript
cd nft-minter

npm install wagmi viem ethers tailwindcss @rainbow-me/rainbowkit
npx tailwindcss init -p
```

> ✅ 配置 wagmi + RainbowKit（多链支持，体验接近 Zora）  
> ✅ 添加钱包连接按钮（像 Zora 的右上角连接入口）

---

## 📦 第二步：合约部分（ERC721）

创建一个极简但可扩展的合约（支持 mint + 设置 metadata）：

```solidity
// contracts/MyNFT.sol
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721URIStorage {
    uint256 public tokenCounter;

    constructor() ERC721("MyNFT", "MNFT") {
        tokenCounter = 0;
    }

    function mintNFT(address recipient, string memory tokenURI)
        public
        returns (uint256)
    {
        uint256 newItemId = tokenCounter;
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        tokenCounter++;
        return newItemId;
    }
}
```

使用 Hardhat 编译 + 部署：

```bash
npx hardhat init
```

---

## 🌐 第三步：NFT.Storage + 铸造流程（Zora 同款上传 → 铸造）

参考：
- [NFT.Storage 官方 JS 示例](https://github.com/nftstorage/nft.storage/tree/main/packages/example)
- 关键步骤：
  - 上传图片到 IPFS（得到 CID）
  - 构建 metadata（JSON）
  - 上传 metadata 到 IPFS（再拿 CID）
  - 将 metadata CID 转成 tokenURI，写入合约的 `mintNFT`

> Zora 内部也用了类似的 IPFS 架构（metadata → CID → 链上存储）

---

## 🖼️ 第四步：前端 UI（Zora 风格）

- 使用 Tailwind + Dropzone 制作上传区域（可拖拽）
- 展示上传后预览图（像 Zora 那种）
- 输入标题 / 描述 → 点按钮 mint
- 调用合约，发起 mint 交易（Ethers.js）

---

## 🔁 第五步：NFT 展示页面

- 利用 `tokenURI` 拉取 metadata 并展示
- 可使用 OpenSea API 或自己读合约 + IPFS
- 支持查看我已铸造的 NFT（基于钱包地址）

---

## ✅ 补充建议：

- 可以参考 Zora 的 **[protocol-core repo](https://github.com/ourzora/zora-protocol)**（虽然偏复杂，但能看设计）
- UI 上保持清爽的白色背景、现代感（像 [mint.fun](https://mint.fun) 那种感觉）

---

## 🎁 Bonus：我可以给你提供什么？

- 🏗️ 一个 Zora 风格的前端 + 合约 starter template
- ✍️ 每日拆分任务（刷题 + 项目进展）
- 🧪 Mock 面试内容准备（Web3 + 前端 + Solidity）

你想我现在就帮你起一个 starter 项目结构吗？可以直接拿来开始做。