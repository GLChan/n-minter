'use client'

import { useState } from 'react';
import { Button } from '../_components/ui/Button';
import { createClient } from '../_lib/supabase/client';


export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSaveNFT = async () => {
    setLoading(true);
    try {
      const testData = {
        tokenId: "1",
        tokenURI: "ipfs://QmdEnupa3mwoq3MMhi3y9hDMPH8iALsoByTiaZttw6MkCz",
        ownerAddress: "0xc5ba100ac6572a396fFdDEA0Ef05704eaC29Ff70",
        contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        chainId: 11155111, // Sepolia
        name: "测试 NFT",
        description: "这是一个测试 NFT",
        imageUrl: "ipfs://QmdEnupa3mwoq3MMhi3y9hDMPH8iALsoByTiaZttw6MkCz",
        attributes: [
          { key: "颜色", value: "蓝色" },
          { key: "大小", value: "中等" }
        ],
        transactionHash: "0x4dc27eb3fe78c4a6a74a69f9e58029fae8c50113df6e3122087439b3d8c43677",
        status: "completed",
        creator_id: "82c84514-04a2-4c60-a3e9-479f84b5a1e3",
        owner_id: "82c84514-04a2-4c60-a3e9-479f84b5a1e3",
      };



      const supabase = await createClient();

      // const { data: { user }, error: userError } = await supabase.auth.getUser()
      // console.log('user', user)
      // console.log('userError', userError)

      const response = await fetch('/api/nft/save', {
        method: 'POST',
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.log('error', error)
      setResult(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      console.log('finally')
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">测试 NFT 属性保存</h2>
      <Button
        onClick={testSaveNFT}
        disabled={loading}
      >
        {loading ? '保存中...' : '测试保存 NFT'}
      </Button>

      {result && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">结果：</h3>
          <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg overflow-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
