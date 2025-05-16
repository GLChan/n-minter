"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/app/_components/Navbar';
import { Footer } from '@/app/_components/Footer';
import { Button } from '@/app/_components/ui/Button';

// 平台特点数据
const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <path d="M12 8v8"></path>
        <path d="M8 12h8"></path>
      </svg>
    ),
    title: '创建NFT',
    description: '简单几步即可将您的艺术作品、音乐或收藏品转化为NFT，无需编程知识。'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M16 12l-4 4-4-4"></path>
        <path d="M12 8v7"></path>
      </svg>
    ),
    title: '低费用',
    description: '我们采用Layer 2解决方案，大幅降低Gas费用，让创作者和收藏家都能负担得起。'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
      </svg>
    ),
    title: '多链支持',
    description: '支持以太坊、Polygon、Solana等多个区块链，为用户提供更多选择和灵活性。'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
    title: '安全保障',
    description: '所有交易通过智能合约和多重签名技术加密保护，确保资产的安全。'
  }
];

// 团队成员数据
const teamMembers = [
  {
    name: '陈明',
    role: '创始人 & CEO',
    bio: '区块链技术专家，拥有10年互联网创业经验，曾参与多个成功的Web3项目。',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=faces&q=80'
  },
  {
    name: '林小雨',
    role: '产品设计总监',
    bio: '资深UI/UX设计师，专注于创造简洁易用的数字产品体验，曾为多家科技公司设计产品。',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces&q=80'
  },
  {
    name: '张晓峰',
    role: '技术负责人',
    bio: '全栈开发工程师，专注于区块链和智能合约开发，为多个NFT项目提供技术支持。',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces&q=80'
  },
  {
    name: '王佳',
    role: '市场总监',
    bio: '数字营销专家，拥有丰富的社区运营和品牌建设经验，热衷于推广Web3技术。',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=faces&q=80'
  }
];

// 常见问题数据
const faqs = [
  {
    question: '什么是NFT？',
    answer: 'NFT（非同质化代币）是一种基于区块链技术的数字资产，每个NFT都是唯一的，不可替代的。它们可以代表数字艺术、音乐、视频、游戏内物品等，通过区块链技术确保所有权和真实性。'
  },
  {
    question: '如何创建我的第一个NFT？',
    answer: '创建NFT非常简单：1) 注册并连接您的钱包；2) 点击"创建"按钮；3) 上传您的数字作品；4) 填写详细信息如标题、描述和定价；5) 支付一次性铸造费用；6) 确认交易后，您的NFT就创建成功了！'
  },
  {
    question: '在平台上交易NFT需要支付哪些费用？',
    answer: '我们的平台收取较低的交易费用，通常为销售价格的2.5%。此外，根据您选择的区块链，您可能需要支付网络的Gas费用。我们采用Layer 2解决方案，大大降低了这部分成本。'
  },
  {
    question: '我可以用什么加密货币在平台上交易？',
    answer: '我们支持多种加密货币，包括ETH、USDC、MATIC等。具体支持的货币类型取决于您选择使用的区块链网络。'
  },
  {
    question: '如何保护我的NFT资产安全？',
    answer: '保护您的NFT安全的最佳方式是妥善保管您的钱包私钥和助记词，使用硬件钱包存储高价值资产，启用双因素认证，并警惕各类钓鱼网站和欺诈行为。'
  }
];

export default function AboutPage() {
  return (
    <>
      {/* 页面标题 */}
      < div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800" >
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">关于我们</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-3xl mx-auto text-lg">
            我们致力于打造便捷、安全的NFT创作和交易平台，连接创作者与收藏家，共建Web3艺术生态
          </p>
        </div>
      </div >

      {/* 使命和愿景 */}
      < section className="py-12 md:py-16" >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-2xl font-bold mb-4">我们的使命</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                我们的使命是通过区块链技术赋能创作者，打破传统艺术市场的壁垒，让每一位创作者都能公平地获得其作品的价值，同时为收藏家提供发现独特数字艺术品的机会。
              </p>
              <h2 className="text-2xl font-bold mb-4">我们的愿景</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                我们期望在未来五年内成为亚洲领先的NFT交易平台，构建一个无国界的数字艺术生态系统，让更多人了解和参与NFT创作与收藏，推动Web3技术在文化创意领域的应用。
              </p>
              <div className="flex gap-4">
                <Link href="/collections">
                  <Button variant="primary">探索合集</Button>
                </Link>
                <Link href="/create">
                  <Button variant="outline">开始创作</Button>
                </Link>
              </div>
            </div>
            <div className="relative h-72 md:h-96 order-1 md:order-2">
              <Image
                src="https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800&auto=format&fit=crop&q=80"
                alt="Digital Art Exhibition"
                fill
                className="object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </section >

      {/* 平台特点 */}
      < section className="py-12 md:py-16 bg-zinc-50 dark:bg-zinc-900" >
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">平台特点</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-100 dark:border-zinc-700">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* 团队介绍 */}
      < section className="py-12 md:py-16" >
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">我们的团队</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 overflow-hidden">
                <div className="relative w-full h-64">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 text-sm mb-3">{member.role}</p>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* 常见问题 */}
      < section className="py-12 md:py-16 bg-zinc-50 dark:bg-zinc-900" >
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">常见问题</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-100 dark:border-zinc-700">
                <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* 联系我们 */}
      < section className="py-12 md:py-16" >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">联系我们</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            有任何问题或建议？我们很乐意听取您的意见。您可以通过以下方式联系我们，或在社交媒体上关注我们获取最新资讯。
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
            <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
          <Button>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            联系我们
          </Button>
        </div>
      </section >
    </>
  );
} 