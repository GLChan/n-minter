import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/_lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { getViemClients } from "@/app/_lib/viemClient";
import { env } from "@/app/_lib/config/env";
import { Address, decodeEventLog } from "viem";
import { MY_NFT_FACTORY_ABI } from "@/app/_lib/constants";
import { saveCollection } from "@/app/_lib/actions";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("user", user);

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("category") as string;
    const chain_id = formData.get("chainId") as string;
    const chain_network = formData.get("chainNetwork") as string;
    const creatorId = formData.get("creatorId") as string;
    const imageFile = formData.get("image") as File;
    const bannerFile = formData.get("banner") as File;
    const symbol = formData.get("symbol") as string;
    const royaltyRecipientAddress = formData.get("royaltyRecipientAddress");
    const royaltyFeeBps = formData.get("royaltyFeeBps") as string;
    const walletAddress = formData.get("walletAddress") as string;

    if (!name || !imageFile || !categoryId || !creatorId) {
      return NextResponse.json(
        { error: "缺少必要的字段：名称、图片、类别、创建者ID" },
        { status: 400 }
      );
    }

    let logo_image_url: string | null = null;
    let banner_image_url: string | null = null;

    // 上传封面图片
    if (imageFile) {
      const imageFileName = `${uuidv4()}-${imageFile.name}`;
      const { data: imageData, error: imageError } = await supabase.storage
        .from("collections")
        .upload(imageFileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (imageError) {
        console.error("上传封面图片失败:", imageError);
        return NextResponse.json(
          { error: "上传封面图片失败" },
          { status: 500 }
        );
      }
      logo_image_url = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/collections/${imageData.path}`;
    }

    // 上传横幅图片 (可选)
    if (bannerFile) {
      const bannerFileName = `${uuidv4()}-${bannerFile.name}`;
      const { data: bannerData, error: bannerError } = await supabase.storage
        .from("collections")
        .upload(bannerFileName, bannerFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (bannerError) {
        console.error("上传横幅图片失败:", bannerError);
        return NextResponse.json(
          { error: "上传横幅图片失败" },
          { status: 500 }
        );
      }
      banner_image_url = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/collections/${bannerData.path}`;
    }

    // 获取合约地址
    let account, publicClient, walletClient;
    try {
      const viem = getViemClients(parseInt(chain_id, 10));
      account = viem.account;
      publicClient = viem.publicClient;
      walletClient = viem.walletClient;
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "viem初始化错误" },
        { status: 400 }
      );
    }

    const factoryAddress = env.NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS as Address;
    const factoryABI = MY_NFT_FACTORY_ABI;

    // 获取创建费用
    const creationFee = await publicClient.readContract({
      address: factoryAddress,
      abi: factoryABI,
      functionName: "creationFee",
    });

    // 调用工厂合约的 createNFTCollection 方法
    const { request } = await publicClient.simulateContract({
      account,
      address: factoryAddress,
      abi: factoryABI,
      functionName: "createNFTCollection",
      args: [
        name,
        symbol,
        walletAddress as Address, // 用户的钱包地址
        royaltyRecipientAddress as Address,
        BigInt(royaltyFeeBps), // royaltyFeeBps 应该是 uint96 类型
      ],
      value: creationFee as bigint, // 支付创建费用
    });

    const hash = await walletClient.writeContract(request);
    console.log("Transaction hash:", hash);

    // 等待交易确认
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction receipt:", receipt);

    let contractAddress: string | null = null;

    // 从交易日志中解析 CollectionCreated 事件
    for (const log of receipt.logs) {
      try {
        const parsedLog = decodeEventLog({
          abi: factoryABI,
          eventName: "CollectionCreated",
          topics: log.topics,
          data: log.data,
        });
        // console.log(parsedLog);
        if (parsedLog.eventName === "CollectionCreated" && parsedLog.args) {
          // 兼容 args 可能为数组或对象的情况
          contractAddress = Array.isArray(parsedLog.args)
            ? parsedLog.args[0] // 通常第一个参数为新合约地址
            : (
                parsedLog.args as {
                  newCollectionAddress?: string;
                }
              ).newCollectionAddress;

          console.log("✅ 新合约地址:", contractAddress);
          // console.log("📛 名称:", name);
          // console.log("🏷️ 符号:", symbol);
          // console.log("🎨 创作者:", creator);
          // console.log("💰 版税接收人:", royaltyReceiver);
          // console.log("🪙 版税比例:", royaltyFraction.toString());
          break;
        }
      } catch (e) {
        console.log(e);
        // 忽略不匹配的日志，省略未使用变量警告
      }
    }

    if (!contractAddress) {
      console.error("未能从交易中获取合约地址");
      return NextResponse.json(
        { error: "未能从交易中获取合约地址" },
        { status: 500 }
      );
    }

    // 保存合集数据到数据库
    const data = await saveCollection({
      name,
      description,
      logo_image_url,
      banner_image_url,
      creator_id: creatorId,
      chain_id: parseInt(chain_id, 10), // 确保 chain_id 是数字类型
      contract_address: contractAddress, // 动态部署合约的地址
      chain_network,
      slug: name.toLowerCase().replace(/\s+/g, "-"), // 生成 slug
      category_id: parseInt(categoryId, 10), // 确保 category_id 是数字类型
      symbol,
      predefined_trait_types: formData.get("predefinedTraitTypes") as string,
      royalty_fee_bps: Number(royaltyFeeBps),
      royalty_recipient_address: String(royaltyRecipientAddress),
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("创建合集时发生未知错误:", error);
    return NextResponse.json({ error: "内部服务器错误" }, { status: 500 });
  }
}
