import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/app/_components/ui/Button';
import useSupabaseClient from '@/app/_lib/supabase/client';
import { Camera, Upload, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// 用户接口定义
interface User {
  username: string;
  bio: string;
  email?: string;
  avatar?: string;
  wallet_address?: string;
  external_link?: string;
}

interface SettingsTabProps {
  user: User;
  onProfileUpdated?: () => void; // 可选回调，仅用于通知父组件更新已完成
}

// 输入字段组件
const InputField = ({
  label,
  id,
  ...props
}: {
  label: string;
  id: string
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
      {label}
    </label>
    <input
      id={id}
      className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      {...props}
    />
  </div>
);

export function SettingsTab({ user, onProfileUpdated }: SettingsTabProps) {
  // 更新：使用我们自定义的Supabase客户端创建方法
  const supabase = useSupabaseClient();
  const { verifiedUserData } = useAuth();

  // 文件输入引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 表单状态
  const [formData, setFormData] = React.useState<User>({
    username: user.username || '',
    bio: user.bio || '',
    email: user.email || '',
    avatar: user.avatar || '',
    external_link: user.external_link || '',
    wallet_address: user.wallet_address || '',
  });

  // 头像上传状态
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 保存成功状态
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 当外部user数据变化时更新本地状态
  useEffect(() => {
    setFormData({
      username: user.username || '',
      bio: user.bio || '',
      email: user.email || '',
      avatar: user.avatar || '',
      external_link: user.external_link || '',
      wallet_address: user.wallet_address || '',
    });
    setAvatarPreview(user.avatar || '');
  }, [user]);

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // 清除成功/错误状态
    setSaveSuccess(false);
    setSaveError(null);
  };

  // 处理头像选择
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setUploadError('请选择图片文件');
      return;
    }

    // 验证文件大小（不超过2MB）
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('图片大小不能超过2MB');
      return;
    }

    setAvatarFile(file);
    setUploadError(null);

    // 创建预览URL
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 触发文件选择对话框
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 上传头像到Supabase
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      setIsUploading(true);
      setUploadError(null); // 清除之前的错误信息

      // 创建唯一文件名
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('开始上传头像:', {
        bucket: 'avatars',
        filePath,
        fileSize: avatarFile.size,
        fileType: avatarFile.type
      });

      // 获取当前Supabase会话
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);

      // 如果没有Supabase会话，尝试刷新会话
      if (!session) {
        console.log('没有找到Supabase会话，尝试刷新...');

        // 检查SIWE会话是否有效
        const siweResponse = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!siweResponse.ok) {
          setUploadError('身份验证失败，无法上传图片');
          return null;
        }

        const siweData = await siweResponse.json();

        if (!siweData.authenticated) {
          setUploadError('未登录，请先连接钱包并登录');
          return null;
        }

        console.log('SIWE会话有效，但Supabase会话缺失，请重新登录或刷新页面');
        setUploadError('会话状态异常，请刷新页面后重试');
        return null;
      }

      // 上传到Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true  // 更改为true，允许覆盖
        });

      if (error) {
        console.error('头像上传失败:', error);
        setUploadError(`头像上传失败: ${JSON.stringify(error)}`);
        return null;
      }

      console.log('头像上传成功:', data);

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('获取到的公共URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('上传过程中出错:', error);
      setUploadError(`上传过程发生错误: ${JSON.stringify(error)}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploading) return;

    try {
      setIsUploading(true);
      setSaveSuccess(false);
      setSaveError(null);

      // 验证钱包地址
      if (!verifiedUserData?.wallet) {
        setSaveError('未连接钱包，无法保存设置');
        return;
      }

      // 如果有新头像，先上传
      let avatarUrl = formData.avatar;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      // 准备更新数据
      const updates = {
        username: formData.username,
        bio: formData.bio,
        avatar_url: avatarUrl,
        external_link: formData.external_link,
        wallet_address: verifiedUserData.wallet, // 确保钱包地址是验证过的
        updated_at: new Date().toISOString(),
      };

      console.log('😈', verifiedUserData.wallet)
      
      // 更新或插入用户资料
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('wallet_address', verifiedUserData.wallet)

      if (error) {
        console.error('更新资料失败:', error);
        setSaveError(`保存资料失败: ${JSON.stringify(error)}`);
        return;
      }

      // 更新本地状态
      setFormData(prev => ({
        ...prev,
        avatar: avatarUrl,
      }));

      // 设置成功状态
      setSaveSuccess(true);

      // 通知父组件（如果提供了回调）
      if (onProfileUpdated) {
        onProfileUpdated();
      }

    } catch (error) {
      console.error('保存设置时出错:', error);
      setSaveError(`保存资料时发生错误: ${JSON.stringify(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-6">个人资料设置</h2>
      <div className="max-w-md space-y-6 ml-auto mr-auto">
        {/* 头像上传区域 */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4 group">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="头像预览"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                  <Camera size={40} />
                </div>
              )}
              <div
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={triggerFileInput}
              >
                <Upload size={24} className="text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <button
            type="button"
            onClick={triggerFileInput}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            更改头像
          </button>
          {uploadError && (
            <p className="text-red-500 text-sm mt-2">{uploadError}</p>
          )}
        </div>

        <InputField
          label="用户名"
          id="username"
          value={formData.username}
          onChange={handleChange}
        />
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            个人简介
          </label>
          <textarea
            id="bio"
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            value={formData.bio}
            onChange={handleChange}
          ></textarea>
        </div>
        <InputField
          label="邮箱地址 (可选)"
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
        />
        <InputField
          label="个人网站 (可选)"
          id="external_link"
          type="url"
          placeholder="https://yourwebsite.com"
          value={formData.external_link}
          onChange={handleChange}
        />

        {/* 显示保存成功或错误信息 */}
        {saveSuccess && (
          <div className="flex items-center text-green-500 text-sm gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>个人资料已更新成功</span>
          </div>
        )}

        {saveError && (
          <div className="text-red-500 text-sm">
            {saveError}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            '保存更改'
          )}
        </Button>
      </div>
    </form>
  );
} 