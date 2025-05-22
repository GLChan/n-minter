"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/app/_components/ui/Button";
import { X } from "lucide-react";
import { getCollectionCategories } from "@/app/_lib/data-service";
import { CollectionCategory } from "@/app/_lib/types";
import { createClient } from "../_lib/supabase/client";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

export default function CreateCollectionPage() {
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionImage, setCollectionImage] = useState<File | null>(null);
  const [collectionImagePreview, setCollectionImagePreview] = useState<
    string | null
  >(null);
  const [collectionBanner, setCollectionBanner] = useState<File | null>(null);
  const [collectionBannerPreview, setCollectionBannerPreview] = useState<
    string | null
  >(null);
  const [collectionCategory, setCollectionCategory] = useState("");
  const [categories, setCategories] = useState<CollectionCategory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 压缩配置选项
  const options = {
    maxSizeMB: 1, // (可选) 图片最大大小，单位 MB
    maxWidthOrHeight: 1024, // (可选) 图片最大宽度或高度
    useWebWorker: true, // (可选) 尽可能使用 Web Worker，推荐！
    initialQuality: 0.8, // (可选) 初始压缩质量，范围 0-1
    //  alwaysKeepResolution: true, // (可选) 保持原始分辨率，但可能会导致 maxSizeMB 失效
    //  fileType: 'image/jpeg', // (可选) 强制输出文件类型
    //  onProgress: (p) => { // (可选) 压缩进度回调
    //    console.log(`压缩进度: ${p}%`);
    //  }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await getCollectionCategories();
      setCategories(fetchedCategories);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isProcessing) return;

    if (!collectionName.trim()) {
      setError("合集名称不能为空");
      return;
    }
    if (!collectionImage) {
      setError("请上传合集封面");
      return;
    }
    if (!collectionCategory) {
      setError("请选择合集类别");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStep("正在上传图片...");

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("用户未认证，请先登录。");
      }

      const formData = new FormData();
      formData.append("name", collectionName);
      formData.append("description", collectionDescription);
      formData.append("category", collectionCategory);
      formData.append("creatorId", user.id);
      if (collectionImage) {
        setProcessingStep("正在压缩封面图片...");
        const compressedImage = await imageCompression(collectionImage, options);
        formData.append("image", compressedImage);
      }
      if (collectionBanner) {
        setProcessingStep("正在压缩横幅图片...");
        const compressedBanner = await imageCompression(
          collectionBanner,
          options
        );
        formData.append("banner", compressedBanner);
      }

      setProcessingStep("正在创建合集...");
      const response = await fetch("/api/collection/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `创建合集失败: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("合集创建成功:", result);
      setProcessingStep("合集创建成功！");
      router.push(`/collections/${result.id}`); // 跳转到新创建的合集详情页
    } catch (err) {
      console.error("创建合集过程中出错:", err);
      setError(err instanceof Error ? err.message : "发生未知错误");
      setProcessingStep("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">创建新合集</h1>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">上传合集封面</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            支持 JPG、PNG、GIF、SVG 等图片格式。
          </p>

          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center">
            {collectionImagePreview ? (
              <div className="relative mb-4">
                <img
                  src={collectionImagePreview}
                  alt="合集图片预览"
                  className="object-contain rounded-lg max-h-40"
                />
                <button
                  onClick={() => {
                    setCollectionImage(null);
                    setCollectionImagePreview(null);
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 ease-in-out flex items-center justify-center"
                  aria-label="清除文件"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <p className="mb-4">
                  <label
                    htmlFor="image-upload"
                    className="text-primary font-medium cursor-pointer hover:underline"
                  >
                    点击上传
                  </label>{" "}
                  或拖放文件
                </p>
              </>
            )}
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              支持 JPG, PNG, GIF...
            </p>
            <input
              type="file"
              className="hidden"
              id="image-upload"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                setCollectionImage(file);
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setCollectionImagePreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setCollectionImagePreview(null);
                }
              }}
            />
            {!collectionImagePreview && (
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 py-2 px-4 rounded-lg text-sm transition-colors"
              >
                浏览文件
              </label>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">合集详情</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                placeholder="给你的合集起个名字"
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                描述
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="详细描述你的合集（选填）"
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                value={collectionDescription}
                onChange={(e) => setCollectionDescription(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="banner-upload"
                className="block text-sm font-medium mb-2"
              >
                合集横幅 (可选)
              </label>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                建议尺寸：1400x350 像素。
              </p>
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center">
                {collectionBannerPreview ? (
                  <div className="relative mb-4 w-full h-48">
                    <img
                      src={collectionBannerPreview}
                      alt="合集横幅预览"
                      className="object-cover w-full h-full rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setCollectionBanner(null);
                        setCollectionBannerPreview(null);
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 ease-in-out flex items-center justify-center"
                      aria-label="清除文件"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="mb-4">
                      <label
                        htmlFor="banner-upload"
                        className="text-primary font-medium cursor-pointer hover:underline"
                      >
                        点击上传
                      </label>{" "}
                      或拖放文件
                    </p>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  id="banner-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    setCollectionBanner(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCollectionBannerPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setCollectionBannerPreview(null);
                    }
                  }}
                />
                {!collectionBannerPreview && (
                  <label
                    htmlFor="banner-upload"
                    className="cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 py-2 px-4 rounded-lg text-sm transition-colors"
                  >
                    浏览文件
                  </label>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium mb-2"
              >
                类别 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={collectionCategory}
                onChange={(e) => setCollectionCategory(e.target.value)}
                required
              >
                <option value="">选择一个类别</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            size="lg"
            onClick={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? "创建中..." : "创建合集"}
          </Button>
        </div>
      </div>
    </div>
  );
}
