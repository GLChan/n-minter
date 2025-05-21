'use client'
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/app/_components/ui/Button';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { id as ethersId } from 'ethers'; // 用于获取事件签名的哈希
import { contractAddress, contractAbi } from '@/app/_lib/constants'; // 引入合约信息
import { getCollectionsByUserId } from '@/app/_lib/actions';
import { createClient } from '../_lib/supabase/client';
import { Collection } from '../_lib/types';

export default function CreateNFT() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([]);
  const [collection, setCollection] = useState('');
  const [explicit, setExplicit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // 处理中状态 (IPFS 上传 + Minting)
  const [processingStep, setProcessingStep] = useState(''); // 显示当前步骤
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ txHash: string; tokenId: string | number } | null>(null); // 成功后的交易信息
  const [mintedTokenURI, setMintedTokenURI] = useState<string | null>(null); // State for tokenURI
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // State for image URL from upload
  const { address, isConnected, chain } = useAccount(); // 获取钱包连接状态和地址
  const [collections, setCollections] = useState<Collection[]>([]);

  // 文件选择处理
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // 生成预览 URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setError(null); // 清除旧错误
    }
  };

  // 清除文件和预览
  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    // 清除 input 的值，以便可以重新选择同一个文件
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // 拖放处理 (简化示例)
  // const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
  //   event.preventDefault(); // 阻止默认行为以允许放置
  // }, []);

  // const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
  //   event.preventDefault();
  //   const droppedFiles = event.dataTransfer.files;
  //   if (droppedFiles && droppedFiles.length > 0) {
  //     const selectedFile = droppedFiles[0];
  //     // TODO: 添加文件类型和大小检查
  //     setFile(selectedFile);
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setPreviewUrl(reader.result as string);
  //     };
  //     reader.readAsDataURL(selectedFile);
  //     setError(null);
  //   }
  // }, []);

  const getCollections = async () => {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('user', user);
    if (authError || !user) {
      return;
    }
    const collections: Collection[] = await getCollectionsByUserId(user.id);
    setCollections(collections);
  }

  useEffect(() => {
    getCollections();
  }, []);


  // 属性处理
  const handleAttributeChange = (index: number, field: 'key' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { key: '', value: '' }]);
  };

  const removeAttribute = (index: number) => {
    if (attributes.length > 1) { // 至少保留一个
      const newAttributes = attributes.filter((_, i) => i !== index);
      setAttributes(newAttributes);
    } else {
      // 如果只剩一个，清空它而不是删除
      setAttributes([{ key: '', value: '' }]);
    }
  };

  // --- Wagmi Hooks ---
  const { data: writeContractResult, writeContractAsync, isPending: isMinting, error: mintError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
    hash: writeContractResult,
    confirmations: 1,  // 添加确认数
    retryDelay: 1000,
    onReplaced: (replacement) => {
      console.log('交易被替换:', replacement);
    }
  });


  // --- 核心提交逻辑 ---
  const handleCreateNFT = async () => {
    if (isProcessing) return

    if (!isConnected || !address) { setError("请先连接钱包"); return; }
    if (!file) { setError("请选择要上传的文件"); return; }
    if (!name.trim()) { setError("NFT 名称不能为空"); return; }
    // 其他验证...

    setIsProcessing(true);
    setError(null);
    setSuccessData(null);
    setMintedTokenURI(null); // Reset before new attempt
    setUploadedImageUrl(null); // Reset before new attempt
    setProcessingStep('正在上传文件和元数据...');

    try {
      // 1. 准备 FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('description', description);
      const validAttributes = attributes.filter(attr => attr.key && attr.value);
      formData.append('attributes', JSON.stringify(validAttributes));

      // 2. 调用 API Route 上传到 IPFS
      const response = await fetch('/api/nft/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `IPFS 上传失败: ${response.statusText}`);
      }

      const { tokenURI, imageURI } = await response.json();
      console.log("获取到 Token URI:", tokenURI, "Image URI:", imageURI);
      if (!tokenURI) throw new Error("未能从服务器获取 Token URI");

      setMintedTokenURI(tokenURI);
      if (imageURI) setUploadedImageUrl(imageURI);

      // 3. 更新处理步骤提示
      setProcessingStep('等待钱包确认铸造交易...');

      // 4. 调用智能合约进行铸造 (使用 writeContractAsync 返回 Promise)
      const tx = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: 'safeMint',
        args: [address, tokenURI],
      });

      console.log("铸造交易 hash:", tx);

      // isPending 状态由 useWriteContract hook 管理, UI 可以用它显示"等待钱包确认"
      // isConfirming 和 isConfirmed 由 useWaitForTransactionReceipt 管理

    } catch (err) {
      console.error("创建 NFT 过程中出错:", err);
      // 区分是上传错误还是用户拒绝交易等
      if (err instanceof Error) {
        if (err.message.includes('rejected the request')) {
          setError('用户取消了钱包操作');
        } else {
          setError(err.message || "发生未知错误");
        }
      }
      setIsProcessing(false);
      setProcessingStep('');
      setMintedTokenURI(null); // Reset on error
      setUploadedImageUrl(null); // Reset on error
    }
  };

  // --- 使用 useEffect 监听交易确认状态 ---
  useEffect(() => {
    if (!writeContractResult) return;

    console.log('交易状态:', { isConfirming, isConfirmed, receipt });

    if (isConfirming) {
      setProcessingStep("交易确认中...");
      setError(null);
    }

    if (isConfirmed && receipt) {
      console.log("交易已确认，receipt:", receipt);
      const processConfirmation = async () => {
        try {
          setIsProcessing(true);
          setProcessingStep("交易已确认，正在保存 NFT 信息...");
          setError(null);

          console.log("交易已确认:", receipt);
          console.log("receipt.transactionHash:", receipt.transactionHash);
          console.log("receipt.to:", receipt.to);
          console.log("receipt.from:", receipt.from);
          console.log("receipt.logs:", receipt.logs);

          // 尝试解析日志，查询最后一个参数作为 tokenId
          let tokenId: string | number = '未知'; // Default value

          try {
            if (!receipt.logs || receipt.logs.length === 0) {
              console.warn("警告: 交易日志为空，无法获取 Token ID");
              tokenId = 'pending';
            } else {
              // 寻找 Transfer 事件
              // ERC721 Transfer 事件签名: Transfer(address,address,uint256)
              const transferSignature = "Transfer(address,address,uint256)";
              const transferTopic = ethersId(transferSignature);

              console.log("Transfer 事件签名:", transferSignature);
              console.log("Transfer 事件 Topic0:", transferTopic);

              // 打印所有日志和它们的topics，帮助调试
              receipt.logs.forEach((log, index) => {
                console.log(`日志 ${index}:`, log);
                console.log(`日志 ${index} topics:`, log.topics);
                console.log(`日志 ${index} 地址:`, log.address);
              });

              // 查找与我们合约地址匹配且包含 Transfer 事件的日志
              const transferLog = receipt.logs.find(log =>
                // 检查合约地址
                log.address.toLowerCase() === contractAddress?.toLowerCase() &&
                // 检查事件签名
                log.topics[0] === transferTopic &&
                // Transfer 事件有 3 个参数，所以应该有 4 个 topics (包括事件签名)
                log.topics.length === 4 &&
                // 检查接收者地址 (to)
                log.topics[2] && address && log.topics[2].toLowerCase().includes(address.slice(2).toLowerCase())
              );

              if (transferLog && transferLog.topics[3]) {
                console.log("找到匹配的 Transfer 事件:", transferLog);
                // topics[3] 是 tokenId (第三个参数)
                tokenId = BigInt(transferLog.topics[3]).toString();
                console.log("解析得到的 Token ID:", tokenId);
              } else {
                console.warn("未找到匹配的 Transfer 事件");
                tokenId = 'pending';
              }
            }
          } catch (e) {
            console.error("解析 Token ID 时出错:", e);
            tokenId = 'error';
          }

          // 设置成功数据，即使 tokenId 解析失败
          setSuccessData({ txHash: receipt.transactionHash, tokenId: tokenId });

          // --- 调用 API 保存 NFT 数据 ---
          try {
            const nftDataToSave = {
              tokenId: tokenId.toString(),
              tokenURI: mintedTokenURI,
              ownerAddress: address ?? '',
              contractAddress: contractAddress,
              chainId: chain?.id ?? 0,
              name: name,
              collectionId: collection,
              description: description,
              imageUrl: uploadedImageUrl,
              attributes: attributes.filter(attr => attr.key && attr.value),
              transactionHash: receipt.transactionHash,
              status: tokenId === 'pending' || tokenId === 'error' || tokenId === '未知' ? 'pending' : 'completed'
            };

            console.log("准备保存 NFT 数据:", nftDataToSave);

            const supabase = await createClient();
            const saveResponse = await fetch('/api/nft/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify(nftDataToSave),
            });

            if (!saveResponse.ok) {
              const errorData = await saveResponse.json();
              throw new Error(errorData.details || errorData.error || `保存 NFT 数据失败: ${saveResponse.statusText}`);
            }

            const saveData = await saveResponse.json();
            console.log("NFT 数据保存成功:", saveData);

            if (tokenId === 'pending' || tokenId === 'error' || tokenId === '未知') {
              setProcessingStep("NFT 创建成功！(Token ID 将在后台处理)");
            } else {
              setProcessingStep("NFT 创建并保存成功！");
            }
            
            // NFT 创建成功后跳转到成功页面
            const successUrl = `/create/success?id=${tokenId}&image=${encodeURIComponent(uploadedImageUrl || '')}&name=${encodeURIComponent(name)}`;
            router.push(successUrl);

          } catch (saveError) {
            console.error("保存 NFT 数据到 Supabase 时出错:", saveError);
            setError(`铸造成功，但保存 NFT 信息失败: ${saveError instanceof Error ? saveError.message : 'error'}`);
            setProcessingStep("铸造成功，保存信息时出错");
          }
        } catch (error) {
          console.error("处理确认时出错:", error);
          setError(error instanceof Error ? error.message : "处理确认时出错");
        } finally {
          // 确保在所有处理完成后清理状态
          setIsProcessing(false);
          setMintedTokenURI(null);
          setUploadedImageUrl(null);
        }
      };

      processConfirmation();
    }

    if (mintError) {
      console.error("铸造交易错误:", mintError);
      setError((mintError as Error)?.message || "铸造交易失败");
      setIsProcessing(false);
      setProcessingStep('');
      setMintedTokenURI(null);
      setUploadedImageUrl(null);
    }

    // 更新处理步骤
    if (isMinting && isProcessing) {
      setProcessingStep("请在钱包中确认交易...");
    }
  }, [writeContractResult, isConfirming, isConfirmed, receipt, mintError]);


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">创建新的 NFT</h1>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">上传文件</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            支持 JPG、PNG、GIF、SVG、MP4、WEBM、MP3、WAV, GLB, GLTF 等文件格式。最大文件大小: 100MB。
          </p>

          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center">
            {previewUrl ? (
              // 显示预览和清除按钮
              <div className="relative mb-4">
                <Image src={previewUrl} alt="Preview" width={150} height={150} className="object-contain rounded-lg max-h-40" />
                <button
                  onClick={clearFile}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors duration-200 ease-in-out "
                  aria-label="清除文件"
                >
                  ✕
                </button>
              </div>
            ) : (
              // 原始上传提示
              <>
                <svg /* ... svg icon ... */ />
                <p className="mb-4">
                  <label htmlFor="file-upload" className="text-primary font-medium cursor-pointer hover:underline">点击上传</label> 或拖放文件
                </p>
              </>
            )}
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              支持 JPG, PNG, GIF... 最大 100MB。
            </p>
            <input
              type="file"
              className="hidden"
              id="file-upload"
              accept="image/*,video/*,audio/*,.glb,.gltf"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            {!previewUrl && (
              <label
                htmlFor="file-upload"
                className={`cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 py-2 px-4 rounded-lg text-sm transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                浏览文件
              </label>
            )}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                {attributes.map((attr, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="类型，如'颜色'"
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={attr.key || ''}
                        onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="名称，如'蓝色'"
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                    <button
                      type="button"
                      className="text-red-500 px-2 disabled:opacity-20"
                      aria-label="删除属性"
                      onClick={() => removeAttribute(index)}
                      disabled={isProcessing || attributes.length <= 1} // 如果只剩一个则禁用删除
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-4 flex items-center text-sm font-medium text-primary"
                onClick={addAttribute}
                disabled={isProcessing}
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
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
              >
                <option value="">不添加到合集</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>{collection.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="explicit"
                  className="mt-1 mr-2"
                  checked={explicit}
                  onChange={(e) => setExplicit(e.target.checked)}
                />
                <label htmlFor="explicit" className="text-sm">
                  我确认这个 NFT 不包含敏感或明确的成人内容
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮和提示信息 */}
        <div className="flex flex-col items-end gap-4">
          {/* 处理状态和错误/成功提示 */}
          {isProcessing && <p className="text-sm text-blue-600 dark:text-blue-400">{processingStep || '处理中...'}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {successData && !isProcessing && (
            <div className="text-green-600 dark:text-green-400 text-sm text-right">
              <p>铸造成功！正在跳转到成功页面...</p>
              <p>Token ID: {successData.tokenId}</p>
              {/* 可以添加区块浏览器链接 */}
              <a href={`https://sepolia.etherscan.io/tx/${successData.txHash}`} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
                查看交易: {successData.txHash.substring(0, 6)}...{successData.txHash.substring(successData.txHash.length - 4)}
              </a>
            </div>
          )}

          <div className="flex justify-end gap-4">
            {/* <Button variant="secondary" size="lg" disabled={isProcessing}>保存草稿</Button> */}
            <Button
              size="lg"
              onClick={handleCreateNFT}
              disabled={isProcessing || !explicit || !isConnected || !file || !name.trim()}
            >
              {isMinting ? '等待钱包确认...' : isConfirming ? '交易确认中...' : isProcessing ? '处理中...' : '创建 NFT'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 