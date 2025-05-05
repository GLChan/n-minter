// src/app/api/upload/route.ts

import { NextResponse } from 'next/server';
import PinataClient from '@pinata/sdk';
import { Readable } from 'stream';

// 初始化 Pinata Client
const pinata = new PinataClient({ pinataJWTKey: process.env.PINATA_JWT });

// 辅助函数：将 Web Stream 转换为 Node.js Readable Stream
// Pinata SDK v2 可能需要 Node.js Stream
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  console.log("Received upload request..."); // 调试日志

  try {
    // 1. 解析 FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    const attributesString = formData.get('attributes') as string | null;

    // 基本验证
    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: '缺少 NFT 名称' }, { status: 400 });
    }

    console.log(`File received: ${file.name}, Name: ${name}`);

    // 2. 上传文件到 IPFS
    console.log("Pinning file to IPFS...");
    // 将 File 对象转换为 Pinata SDK 需要的 ReadableStream
    // 注意：Node.js 环境下 request.formData() 返回的 File 对象可能需要转换
    // @ts-ignore Readable.fromWeb is available in Node 16.15+
    const fileStream = Readable.fromWeb(file.stream());

    const fileResult = await pinata.pinFileToIPFS(fileStream, {
      pinataMetadata: {
        name: file.name, // 使用原始文件名作为 Pinata 上的名字
        // keyalues: JSON.stringify({})
      },
      pinataOptions: {
        cidVersion: 0, // 使用 CID v0 或 v1，根据你的偏好
      },
    });
    const fileIpfsHash = fileResult.IpfsHash;
    console.log("File pinned successfully:", fileIpfsHash);
    const imageURI = `ipfs://${fileIpfsHash}`; // <-- 保存文件 URI


    // 3. 构建 Metadata JSON
    let attributes = [];
    if (attributesString) {
      try {
        attributes = JSON.parse(attributesString);
        // 可选：进一步验证 attributes 结构
      } catch (e) {
        console.warn("解析 attributes 失败:", e);
        // 可以选择忽略错误或返回 400
      }
    }

    const metadata = {
      name: name,
      description: description || '', // Description 是可选的
      image: imageURI, // 标准 IPFS URI 格式
      attributes: attributes,
    };

    // 4. 上传 Metadata JSON 到 IPFS
    console.log("Pinning metadata JSON to IPFS...");
    const metadataResult = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: `${name} Metadata`, // 给 Metadata JSON 文件本身起个名字
      },
      pinataOptions: {
        cidVersion: 0,
      },
    });
    const metadataIpfsHash = metadataResult.IpfsHash;
    console.log("Metadata JSON pinned successfully:", metadataIpfsHash);

    // 5. 返回最终的 Token URI
    const tokenURI = `ipfs://${metadataIpfsHash}`;
    return NextResponse.json({ tokenURI: tokenURI, imageURI: imageURI });

  } catch (error: any) {
    console.error("IPFS 上传或处理失败:", error);
    // 检查是否是 Pinata SDK 的错误
    if (error.name === 'PinataError' || error.response?.data?.error) {
       return NextResponse.json({ error: `Pinata 服务错误: ${error.message || error.response?.data?.error}` }, { status: 500 });
    }
    return NextResponse.json({ error: `服务器内部错误: ${error.message}` }, { status: 500 });
  }
}