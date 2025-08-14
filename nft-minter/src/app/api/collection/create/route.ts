import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/_lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { getViemClients } from "@/app/_lib/viemClient";
import { env } from "@/app/_lib/config/env";
import { Address, decodeEventLog } from "viem";
import { MY_NFT_FACTORY_ABI } from "@/app/_lib/constants";
import { saveCollection } from "@/app/_lib/actions";
import { SupabaseClient } from "@supabase/supabase-js";

interface CollectionFormData {
  name: string;
  description: string;
  categoryId: string;
  chain_id: string;
  chain_network: string;
  creatorId: string;
  imageFile: File;
  bannerFile: File;
  symbol: string;
  royaltyRecipientAddress: string;
  royaltyFeeBps: string;
  walletAddress: string;
  predefinedTraitTypes: string;
}

interface UploadResult {
  logo_image_url: string | null;
  banner_image_url: string | null;
}

// 处理用户认证
async function authenticateUser() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("Unauthorized");
  }
  
  return { supabase, user };
}

// 验证表单数据
function validateFormData(formData: FormData): CollectionFormData {
  const name = formData.get("name") as string;
  const imageFile = formData.get("image") as File;
  const categoryId = formData.get("category") as string;
  const creatorId = formData.get("creatorId") as string;

  if (!name || !imageFile || !categoryId || !creatorId) {
    throw new Error("缺少必要的字段：名称、图片、类别、创建者ID");
  }

  return {
    name,
    description: formData.get("description") as string,
    categoryId,
    chain_id: formData.get("chainId") as string,
    chain_network: formData.get("chainNetwork") as string,
    creatorId,
    imageFile,
    bannerFile: formData.get("banner") as File,
    symbol: formData.get("symbol") as string,
    royaltyRecipientAddress: formData.get("royaltyRecipientAddress") as string,
    royaltyFeeBps: formData.get("royaltyFeeBps") as string,
    walletAddress: formData.get("walletAddress") as string,
    predefinedTraitTypes: formData.get("predefinedTraitTypes") as string,
  };
}


// 通用文件上传函数
async function uploadFile(supabase: SupabaseClient, file: File, bucket: string): Promise<string> {
  const fileName = `${uuidv4()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`上传文件失败: ${error.message}`);
  }

  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
}

// 处理图片上传
async function uploadImages(supabase: SupabaseClient, imageFile: File, bannerFile?: File): Promise<UploadResult> {
  const logo_image_url = await uploadFile(supabase, imageFile, "collections");
  
  let banner_image_url: string | null = null;
  if (bannerFile) {
    banner_image_url = await uploadFile(supabase, bannerFile, "collections");
  }

  return { logo_image_url, banner_image_url };
}

// 处理合约部署
async function deployContract(formData: CollectionFormData) {
  const viem = getViemClients(parseInt(formData.chain_id, 10));
  const { account, publicClient, walletClient } = viem;

  const factoryAddress = env.NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS as Address;
  const factoryABI = MY_NFT_FACTORY_ABI;

  const creationFee = await publicClient.readContract({
    address: factoryAddress,
    abi: factoryABI,
    functionName: "creationFee",
  });

  const { request } = await publicClient.simulateContract({
    account,
    address: factoryAddress,
    abi: factoryABI,
    functionName: "createNFTCollection",
    args: [
      formData.name,
      formData.symbol,
      formData.walletAddress as Address,
      formData.royaltyRecipientAddress as Address,
      BigInt(formData.royaltyFeeBps),
    ],
    value: creationFee as bigint,
  });

  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

// 解析合约地址
  for (const log of receipt.logs) {
    try {
      const parsedLog = decodeEventLog({
        abi: factoryABI,
        eventName: "CollectionCreated",
        topics: log.topics,
        data: log.data,
      });

      if (parsedLog.eventName === "CollectionCreated" && parsedLog.args) {
        const contractAddress = Array.isArray(parsedLog.args)
          ? parsedLog.args[0]
          : (parsedLog.args as { newCollectionAddress?: string }).newCollectionAddress;

        if (contractAddress) {
          console.log("✅ 新合约地址:", contractAddress);
          return contractAddress;
        }
      }
    } catch (e) {
      // 忽略不匹配的日志
      console.error("解析日志时出错:", e);
      continue;
    }
  }

  throw new Error("未能从交易中获取合约地址");
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await authenticateUser();
    console.log("user", user);

    const formData = await req.formData();
    const validatedData = validateFormData(formData);

    const { logo_image_url, banner_image_url } = await uploadImages(
      supabase,
      validatedData.imageFile,
      validatedData.bannerFile
    );

    const contractAddress = await deployContract(validatedData);

    const data = await saveCollection({
      name: validatedData.name,
      description: validatedData.description,
      logo_image_url,
      banner_image_url,
      creator_id: validatedData.creatorId,
      chain_id: parseInt(validatedData.chain_id, 10),
      contract_address: contractAddress,
      chain_network: validatedData.chain_network,
      slug: validatedData.name.toLowerCase().replace(/\s+/g, "-"),
      category_id: parseInt(validatedData.categoryId, 10),
      symbol: validatedData.symbol,
      predefined_trait_types: validatedData.predefinedTraitTypes,
      royalty_fee_bps: Number(validatedData.royaltyFeeBps),
      royalty_recipient_address: validatedData.royaltyRecipientAddress,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("创建合集时发生错误:", error);
    
    if (error instanceof Error) {
      let statusCode;

      switch (true) {
        case error.message === "Unauthorized":
          statusCode = 401;
          break;
        case error.message.includes("缺少必要的字段"):
        case error.message.includes("viem初始化错误"):
          statusCode = 400;
          break;
        default:
          statusCode = 500;
          break;
      }
      return NextResponse.json({ error: error.message }, { status: statusCode });
    }

    return NextResponse.json({ error: "内部服务器错误" }, { status: 500 });
  }
}