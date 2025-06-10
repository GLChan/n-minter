import { NextResponse } from "next/server";
import { recordTransaction } from "@/app/_lib/actions";
import { TransactionType } from "@/app/_lib/types/enums";

export async function POST(request: Request) {
  try {
    const transactionData: {
      nftId: string;
      buyerAddress: string;
      sellerAddress: string;
      price: string;
      transactionType: TransactionType;
      transactionHash: string;
    } = await request.json();

    if (!transactionData) {
      return NextResponse.json({ error: "Missing transaction data" }, { status: 400 });
    }

    // 调用后端 action 来保存交易
    const savedTransaction = await recordTransaction(transactionData);

    return NextResponse.json({ success: true, transaction: savedTransaction }, { status: 200 });
  } catch (error) {
    console.error("记录交易 API 失败:", error);
    return NextResponse.json(
      { error: "Failed to record transaction", details: (error as Error).message },
      { status: 500 }
    );
  }
}