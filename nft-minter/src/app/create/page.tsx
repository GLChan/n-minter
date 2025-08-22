"use client";
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { Button } from "@/app/_components/ui/Button";
import Image from "next/image";
import { getCollectionsByUserId } from "@/app/_lib/actions";
import { createClient } from "../_lib/supabase/client";
import { Collection } from "../_lib/types";
import { X } from "lucide-react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { useCreateNFT, CreateNFTFormInputs, Attribute } from "./useCreateNFT";

export default function CreateNFT() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateNFTFormInputs>({
    defaultValues: {
      name: "",
      description: "",
      attributes: [{ key: "", value: "" }],
      collection: "",
      explicit: false,
      contractAddress: "",
      file: null, // Initialize file as null
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes",
  });

  const { createNFT, isLoading, error, processingStep } = useCreateNFT();

  // 文件选择处理
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Create a DataTransfer object to hold the selected file as a FileList
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(selectedFile);
      setValue("file", dataTransfer.files); // Set the file value as FileList
    } else {
      setValue("file", null);
      setPreviewUrl(null);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Watch for file changes and update preview
  const fileWatch = watch("file");
  useEffect(() => {
    if (fileWatch && fileWatch.length > 0) {
      const selectedFile = fileWatch[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  }, [fileWatch]);

  // 清除文件和预览
  const clearFile = () => {
    setValue("file", null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the actual file input element
    }
  };

  const getCollections = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      // Optionally redirect to login or show an error
      return;
    }
    const fetchedCollections: Collection[] = await getCollectionsByUserId(
      user.id
    );
    setCollections(fetchedCollections);

    // If there's only one collection, pre-select it
    if (fetchedCollections.length === 1) {
      setValue("collection", fetchedCollections[0].id);
      if (fetchedCollections[0].contract_address) {
        setValue("contractAddress", fetchedCollections[0].contract_address);
      }
      if (fetchedCollections[0].predefined_trait_types) {
        const traitTypes = fetchedCollections[0].predefined_trait_types;
        if (typeof traitTypes === 'string') {
          const keyMaps: Attribute[] = JSON.parse(traitTypes);
          setValue(
            "attributes",
            keyMaps.map((attr) => ({
              key: attr.key,
              value: attr.value,
            }))
          );
        } else {
          // 如果已经是对象，直接使用
          const keyMaps = traitTypes as Attribute[];
          setValue(
            "attributes",
            keyMaps.map((attr) => ({
              key: attr.key,
              value: attr.value,
            }))
          );
        }
      }
    }
  };

  useEffect(() => {
    getCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCollectionChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const selectedId = e.target.value;
      setValue("collection", selectedId);

      const collection = collections.find((c) => c.id === selectedId);

      if (collection?.predefined_trait_types) {
        const traitTypes = collection.predefined_trait_types;
        if (typeof traitTypes === 'string') {
          const keyMaps: Attribute[] = JSON.parse(traitTypes);
          setValue(
            "attributes",
            keyMaps.map((attr) => ({
              key: attr.key,
              value: attr.value,
            }))
          );
        } else {
          // 如果已经是对象，直接使用
          const keyMaps = traitTypes as Attribute[];
          setValue(
            "attributes",
            keyMaps.map((attr) => ({
              key: attr.key,
              value: attr.value,
            }))
          );
        }
        setValue("contractAddress", collection.contract_address ?? "");
      } else {
        setValue("attributes", [{ key: "", value: "" }]);
        setValue("contractAddress", "");
      }
    },
    [collections, setValue]
  );

  const onSubmit: SubmitHandler<CreateNFTFormInputs> = async (data) => {
    createNFT(data);
    // The navigation to success page is handled inside useCreateNFT
  };

  let buttonText = "创建 NFT";
  if (isLoading) {
    buttonText = processingStep || "处理中...";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">创建新的 NFT</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">上传文件</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              支持 JPG、PNG、GIF、SVG 等文件格式。最大文件大小: 20MB。
            </p>

            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center">
              {previewUrl ? (
                <div className="relative mb-4 w-full max-w-xs h-48 flex items-center justify-center">
                  <Image
                    src={previewUrl}
                    alt="文件预览"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <p className="mb-4 text-zinc-500 dark:text-zinc-400">
                  拖放文件到此处，或
                </p>
              )}
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                选择文件
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/svg+xml"
                {...register("file", {
                  required: "请选择要上传的文件",
                })}
                onChange={handleFileChange} // Move onChange outside register
                ref={fileInputRef} // Assign ref to the input
              />
              {errors.file && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.file.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">NFT 详情</h2>
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register("name", { required: "NFT 名称不能为空" })}
                className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="NFT 名称"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                描述
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="描述您的 NFT"
              ></textarea>
            </div>

            <div className="mb-6">
              <label
                htmlFor="collection"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                集合
              </label>
              <select
                id="collection"
                {...register("collection", {
                  onChange: handleCollectionChange,
                  required: "请选择一个集合",
                })}
                value={watch("collection")} // Explicitly set value from watch
                className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">选择一个集合</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
              {errors.collection && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.collection.message}
                </p>
              )}
            </div>

            <div className="mb-6">
              <div className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                属性
              </div>
              {fields.map((item, index) => (
                <div key={item.id} className="flex gap-4 mb-3">
                  <input
                    type="text"
                    {...register(`attributes.${index}.key` as const)}
                    className="flex-1 p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    placeholder="属性名称 (例如: 大小)"
                  />
                  <input
                    type="text"
                    {...register(`attributes.${index}.value` as const)}
                    className="flex-1 p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    placeholder="属性值 (例如: 10MB)"
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="cursor-pointer p-3 text-red-800 rounded-lg hover:text-red-600 transition-colors duration-200"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={() => append({ key: "", value: "" })}
                className="mt-2 bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              >
                添加属性
              </Button>
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="explicit"
                {...register("explicit")}
                className="h-5 w-5 text-blue-600 border-zinc-300 rounded focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600"
              />
              <label
                htmlFor="explicit"
                className="ml-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                此内容包含敏感或不适宜内容
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">错误:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 text-lg"
            >
              {buttonText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
