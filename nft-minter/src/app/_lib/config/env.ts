import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    JWT_SECRET_KEY: z.string(),
    // 私钥，用于服务器端签名交易
    PRIVATE_KEY: z.string(),
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_APP_BASE_URL: z.string().min(1),
    NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS: z.string().startsWith("0x"),
    NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS: z.string().startsWith("0x"),

    NEXT_PUBLIC_SUPABASE_URL: z.string(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
    NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS:
      process.env.NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS,
    NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS,
  },
});
