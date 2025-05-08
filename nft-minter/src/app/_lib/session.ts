import type { SessionOptions } from 'iron-session';

// 会话类型
export interface SessionData {
  siwe?: {
    address: string;
  };
  issuedAt?: string;
  expirationTime?: string;
}


// 会话配置选项
export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'nft_minter_siwe_session',
  cookieOptions: {
    // 安全设置
    secure: process.env.NODE_ENV === 'production', // 生产环境下只在HTTPS下传输
    httpOnly: true, // 禁止JavaScript访问cookie
    sameSite: 'strict', // 限制跨站点请求
    // 如果您的应用需要跨子域使用，例如app.domain.com和api.domain.com
    // domain: '.yourdomain.com',
    path: '/'
  },
  // 设置较长的过期时间，允许用户在较长时间内保持登录状态
  ttl: 7 * 24 * 60 * 60, // 7天，以秒为单位
}; 