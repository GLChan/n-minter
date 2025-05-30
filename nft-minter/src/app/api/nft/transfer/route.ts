import { NextResponse } from "next/server";
import { createClient } from "@/app/_lib/supabase/server";
import {
  NFTMarketStatus,
  TransactionStatus,
  TransactionType,
} from "@/app/_lib/types/enums";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    // 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    console.log("收到NFT转移请求:", body);

    const { nftId, receiverAddress } = body;

    // 基本验证
    if (!nftId || !receiverAddress) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    if (
      typeof receiverAddress !== "string" ||
      !receiverAddress.startsWith("0x")
    ) {
      return NextResponse.json(
        { error: "无效的接收方地址格式" },
        { status: 400 }
      );
    }

    // 获取NFT当前信息
    const { data: nft, error: nftError } = await supabase
      .from("nfts")
      .select("*")
      .eq("id", nftId)
      .single();

    if (nftError || !nft) {
      return NextResponse.json({ error: "找不到指定的NFT" }, { status: 404 });
    }

    // 验证NFT所有权
    if (nft.owner_id !== user.id) {
      return NextResponse.json(
        { error: "您不是该NFT的所有者，无权转移" },
        { status: 403 }
      );
    }

    // await transferNFT(receiverAddress, nft.token_id)

    // 如果NFT处于上架状态，需要先取消上架
    if (nft.list_status === NFTMarketStatus.ListedFixedPrice) {
      const { error: unlistError } = await supabase
        .from("nfts")
        .update({
          list_status: NFTMarketStatus.NotListed,
          list_price: null,
          list_currency: null,
          lister_address: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", nftId);

      if (unlistError) {
        console.error("取消NFT上架失败:", unlistError);
        return NextResponse.json(
          { error: "转移前取消NFT上架失败" },
          { status: 500 }
        );
      }
    }

    // 模拟区块链转移（实际项目中，这里应该和智能合约交互）
    // 在这个示例中，我们只是更新数据库中的所有者信息

    // 获取接收方用户ID（如果存在）
    const { data: receiverProfile, error: receiverError } = await supabase
      .from("profiles")
      .select("id")
      .eq("wallet_address", receiverAddress)
      .single();

    if (receiverError) {
      console.error("获取接收方用户信息失败:", receiverError);
      return NextResponse.json(
        { error: "获取接收方用户信息失败" },
        { status: 500 }
      );
    }

    const receiverId = receiverProfile ? receiverProfile.id : null;

    // 更新NFT所有者
    const { data: updatedNFT, error: updateError } = await supabase
      .from("nfts")
      .update({
        owner_address: receiverAddress,
        owner_id: receiverId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", nftId)
      .select();

    if (updateError) {
      console.error("更新NFT所有者失败:", updateError);
      return NextResponse.json({ error: "转移NFT失败" }, { status: 500 });
    }

    // 记录转移交易
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        nft_id: nftId,
        price: 0,
        status: TransactionStatus.Successful,
        transaction_time: new Date().toISOString(),
        transaction_type: TransactionType.Transfer,
        buyer_address: receiverAddress,
        seller_address: nft.owner_address,
        currency: "",
        transaction_hash: "", // 实际项目中应填入交易哈希
      })
      .select();

    if (transactionError) {
      console.error("记录转移交易失败:", transactionError);
      // 不抛出异常，因为NFT已经成功转移
      console.warn("NFT已转移，但未能记录交易历史");
    }

    console.log("NFT转移成功:", transaction);

    return NextResponse.json(
      {
        message: "NFT转移成功",
        data: updatedNFT,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("NFT转移处理错误:", error);
    return NextResponse.json(
      { error: "处理NFT转移请求时发生错误" },
      { status: 500 }
    );
  }
}
