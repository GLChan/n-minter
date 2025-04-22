import React from 'react';
import { Navbar } from '@/app/_components/Navbar';
import { Footer } from '@/app/_components/Footer';
import { Button } from '@/app/_components/ui/Button';

export default function CreateNFT() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">创建新的 NFT</h1>
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">上传文件</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                支持 JPG、PNG、GIF、SVG、MP4、WEBM、MP3、WAV, GLB, GLTF 等文件格式。最大文件大小: 100MB。
              </p>
              
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12 text-zinc-400 mb-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
                <p className="text-center mb-4">
                  <span className="text-primary font-medium">点击上传</span> 或拖放文件
                </p>
                <input 
                  type="file" 
                  className="hidden" 
                  id="file-upload" 
                  accept="image/*,video/*,audio/*,.glb,.gltf" 
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  浏览文件
                </label>
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">NFT 详情</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    名称 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    placeholder="给你的 NFT 起个名字" 
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    描述
                  </label>
                  <textarea 
                    id="description" 
                    rows={4} 
                    placeholder="详细描述你的 NFT（选填）" 
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    属性
                  </label>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                    添加属性可以帮助收藏家筛选你的 NFT。
                  </p>
                  
                  <div className="space-y-4" id="attributes-container">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="类型，如'颜色'" 
                          className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="名称，如'蓝色'" 
                          className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <button 
                        type="button" 
                        className="text-red-500 px-2"
                        aria-label="删除属性"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    className="mt-4 flex items-center text-sm font-medium text-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    添加新属性
                  </button>
                </div>
                
                <div>
                  <label htmlFor="collection" className="block text-sm font-medium mb-2">
                    选择合集
                  </label>
                  <select 
                    id="collection" 
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">不添加到合集</option>
                    <option value="digital-life">数字生活系列</option>
                    <option value="abstract-art">抽象艺术</option>
                  </select>
                </div>
                
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      id="explicit" 
                      className="mt-1 mr-2" 
                    />
                    <label htmlFor="explicit" className="text-sm">
                      我确认这个 NFT 不包含敏感或明确的成人内容
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button variant="secondary" size="lg">保存草稿</Button>
              <Button size="lg">创建 NFT</Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 