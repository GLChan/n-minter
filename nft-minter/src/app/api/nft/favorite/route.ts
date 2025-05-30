import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/_lib/supabase/server";
import { getUserInfo } from "@/app/_lib/actions";
import {
  addNFTToFavorites,
  removeNFTFromFavorites,
  isNFTFavorited,
} from "@/app/_lib/actions";

// 处理GET请求，检查NFT是否被收藏
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const nftId = searchParams.get("nftId");

    if (!nftId) {
      return NextResponse.json(
        { error: "缺少必要参数: nftId" },
        { status: 400 }
      );
    }

    // 获取当前用户信息
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "未授权", favorited: false },
        { status: 200 }
      );
    }

    // 检查NFT是否已收藏
    const favorited = await isNFTFavorited(user.id, nftId);

    return NextResponse.json({ favorited });
  } catch (error) {
    console.error("处理收藏状态查询出错:", error);
    return NextResponse.json(
      {
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}

// 处理POST请求，添加/移除收藏
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nftId, action } = body;

    if (!nftId || !action) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    if (action !== "add" && action !== "remove") {
      return NextResponse.json(
        { error: '无效的操作类型，必须是 "add" 或 "remove"' },
        { status: 400 }
      );
    }

    // 获取当前用户
    const user = await getUserInfo();

    if (!user || !user.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    let result;

    // 根据操作类型执行相应的功能
    if (action === "add") {
      result = await addNFTToFavorites(user.id, nftId);
    } else {
      result = await removeNFTFromFavorites(user.id, nftId);
    }

    if (!result) {
      return NextResponse.json(
        { error: "操作失败，可能是因为NFT不存在或已被删除" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      action: action,
      message: action === "add" ? "NFT已成功添加到收藏" : "NFT已从收藏中移除",
    });
  } catch (error) {
    console.error("处理收藏操作出错:", error);
    return NextResponse.json(
      {
        error: "处理收藏操作失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
