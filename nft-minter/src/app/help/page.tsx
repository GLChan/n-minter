"use client"

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/app/_components/Navbar';
import { Footer } from '@/app/_components/Footer';

// 帮助中心分类和问题
const helpCategories = [
  {
    title: '账户与钱包',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    questions: [
      {
        question: '如何创建账户？',
        answer: '要创建账户，请点击页面右上角的"连接钱包"按钮，选择您的钱包提供商（如MetaMask、WalletConnect等），按照提示完成钱包连接。连接成功后，您就可以使用我们平台的所有功能了。'
      },
      {
        question: '支持哪些钱包？',
        answer: '我们支持多种主流钱包，包括MetaMask、WalletConnect、Coinbase Wallet、Trust Wallet等。我们会持续增加更多钱包支持，以满足用户的不同需求。'
      },
      {
        question: '如何更改我的个人资料？',
        answer: '连接钱包后，点击右上角的头像，进入"个人中心"，然后选择"编辑资料"。您可以在此更新您的用户名、简介、社交媒体链接和头像等信息。'
      }
    ]
  },
  {
    title: 'NFT创建与铸造',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    questions: [
      {
        question: '如何创建我的第一个NFT？',
        answer: '创建NFT的步骤如下：1) 确保您已连接钱包；2) 点击导航栏中的"创建"按钮；3) 上传您想铸造为NFT的数字作品（支持图片、视频、音频和3D模型）；4) 填写NFT的标题、描述、属性等详细信息；5) 设置价格和版税；6) 点击"创建"按钮完成铸造过程。'
      },
      {
        question: '铸造NFT需要支付哪些费用？',
        answer: '铸造NFT时，您需要支付网络的Gas费用（取决于您选择的区块链网络）。我们平台采用了Layer 2解决方案，大大降低了Gas费用。我们不收取额外的铸造费用，只有当NFT售出时才会收取一小部分交易费（通常为销售价格的2.5%）。'
      },
      {
        question: '我可以创建一个NFT合集吗？',
        answer: '是的，您可以创建自己的NFT合集。在"创建"页面，选择"创建合集"选项，设置合集名称、标志、封面图片、描述和类别等信息。创建合集后，您可以在该合集下铸造多个NFT，这有助于建立您的品牌标识。'
      }
    ]
  },
  {
    title: '交易与市场',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    questions: [
      {
        question: '如何购买NFT？',
        answer: '购买NFT的步骤：1) 浏览市场找到您感兴趣的NFT；2) 点击"购买"按钮；3) 确认交易详情并支付相应的加密货币；4) 交易完成后，NFT将立即转移到您的钱包中。对于拍卖形式的NFT，您需要参与出价，在拍卖结束时如果您是最高出价者，NFT将自动转移给您。'
      },
      {
        question: '如何出售我的NFT？',
        answer: '出售NFT的步骤：1) 进入您的个人中心，找到您要出售的NFT；2) 点击该NFT，进入详情页；3) 点击"出售"按钮；4) 选择销售类型（固定价格或拍卖）；5) 设置价格和出售期限；6) 确认并上架。您的NFT将立即显示在市场上供他人购买。'
      },
      {
        question: '我的销售收入何时到账？',
        answer: '当您的NFT成功售出后，销售收入将立即转入您的钱包地址。在某些情况下，可能需要几分钟时间完成区块链确认。您可以在"我的账户">"交易历史"中查看所有交易详情。'
      }
    ]
  },
  {
    title: '技术支持与问题',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    questions: [
      {
        question: '我的交易失败了怎么办？',
        answer: '交易失败可能有多种原因：1) 钱包中没有足够的加密货币支付交易费用；2) Gas价格设置过低；3) 网络拥堵。请检查您的钱包余额，确保有足够的资金支付交易费用，然后重试。如果问题持续，请联系我们的客服团队获取帮助。'
      },
      {
        question: '我忘记了钱包密码怎么办？',
        answer: '我们无法帮助恢复您的钱包密码，因为我们不存储用户的私钥或密码。请使用您钱包提供商提供的恢复方法，通常是通过您之前备份的助记词或私钥来恢复钱包访问权限。这就是为什么我们强烈建议所有用户安全备份其钱包的恢复信息。'
      },
      {
        question: '如何报告侵权内容？',
        answer: '如果您发现平台上有侵犯您知识产权的内容，请发送邮件至support@example.com提交投诉。请在邮件中提供：1) 您的联系信息；2) 被侵权作品的链接；3) 侵权内容的链接；4) 您对该作品拥有权利的声明。我们会尽快审核并采取相应措施。'
      }
    ]
  }
];

export default function HelpCenterPage() {
  return (
    <>
      {/* 页面标题 */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-4 text-center">帮助中心</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-3xl mx-auto">
            查找您需要的帮助和指南，快速解决问题
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* 搜索栏 */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索帮助主题..."
              className="w-full px-4 py-3 pl-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-3.5 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* 快速链接 */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">常见问题快速链接</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="#account-wallet" className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>账户与钱包</span>
              </div>
            </Link>
            <Link href="#nft-creation" className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span>NFT创建与铸造</span>
              </div>
            </Link>
            <Link href="#marketplace" className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span>交易与市场</span>
              </div>
            </Link>
            <Link href="#support" className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>技术支持与问题</span>
              </div>
            </Link>
          </div>
        </div>

        {/* 帮助分类 */}
        <div className="space-y-16">
          {helpCategories.map((category, categoryIndex) => (
            <section key={categoryIndex} id={
              categoryIndex === 0 ? "account-wallet" :
                categoryIndex === 1 ? "nft-creation" :
                  categoryIndex === 2 ? "marketplace" : "support"
            } className="scroll-mt-20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-semibold">{category.title}</h2>
              </div>

              <div className="space-y-6">
                {category.questions.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
                    <h3 className="text-lg font-medium mb-3">{item.question}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* 联系支持 */}
        <div className="mt-16 bg-zinc-50 dark:bg-zinc-900 rounded-xl p-8 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-semibold mb-4 text-center">没有找到您需要的答案？</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-6">
            我们的客服团队随时为您提供帮助，请通过以下方式联系我们
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Link href="mailto:support@example.com" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>发送邮件</span>
            </Link>
            <Link href="/contact" className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>联系我们</span>
            </Link>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    </>
  );
} 