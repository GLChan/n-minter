import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/_lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log('user', user);

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const creatorId = formData.get("creatorId") as string;
    const imageFile = formData.get("image") as File;
    const bannerFile = formData.get("banner") as File;

    if (!name || !imageFile || !category || !creatorId) {
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
      logo_image_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/collections/${imageData.path}`;
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
      banner_image_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/collections/${bannerData.path}`;
    }

    // 获取 category_id
    const { data: categoryData, error: categoryError } = await supabase
      .from("collections_categories")
      .select("id")
      .eq("name", category)
      .single();

    if (categoryError || !categoryData) {
      console.error("获取合集类别ID失败:", categoryError);
      return NextResponse.json({ error: "无效的合集类别" }, { status: 400 });
    }

    const category_id = categoryData.id;

    // 保存合集数据到数据库
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .insert({
        name,
        description,
        logo_image_url,
        banner_image_url,
        creator_id: creatorId,
        slug: name.toLowerCase().replace(/\s+/g, "-"), // 生成 slug
        category_id: category_id,
      })
      .select()
      .single();

    if (collectionError) {
      console.error("保存合集数据失败:", collectionError);
      return NextResponse.json({ error: "保存合集数据失败" }, { status: 500 });
    }

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("创建合集时发生未知错误:", error);
    return NextResponse.json({ error: "内部服务器错误" }, { status: 500 });
  }
}
