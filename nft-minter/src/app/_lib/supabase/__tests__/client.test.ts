// 所有 jest.mock() 调用必须放在文件的最顶部，在所有 import 语句之前
// 这样可以确保模块在被导入之前就已经被正确地模拟
jest.mock('../client', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/app/_lib/config/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://mock-url.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
  },
}));

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

import { createClient } from '../client';

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('Supabase Client Utilities', () => {

  // 在每个测试用例前重置 mock 状态
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly create a Supabase client', () => {
    // 1. 准备阶段 (Arrange)
    const mockSupabaseClient = {
      from: jest.fn(() => ({
        select: jest.fn(),
      })),
    };
    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as ReturnType<typeof createClient>);

    // 2. 执行阶段 (Act)
    // 调用我们想要测试的函数
    const client = createClient();

    // 3. 断言阶段 (Assert)
    // 验证 createClient 是否被调用了
    expect(mockCreateClient).toHaveBeenCalledTimes(1);

    // 验证 createClient 函数是否返回了正确的（我们模拟的）客户端对象
    expect(client).toBe(mockSupabaseClient);
  });
});