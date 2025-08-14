"use server";

import { cookies } from "next/headers";
import { COOKIE_KEYS } from "../constants";
import { createClient } from "../supabase/server";
import { generateWalletP } from "../utils";
import { doesUserExistByWalletAddress } from "../actions";
import { getSupabaseAdmin } from "../supabase/admin";

// {
//   "alg": "HS256"
// }
// {
//   "address": "0xc5ba100ac6572a396fFdDEA0Ef05704eaC29Ff70",
//   "chainId": 11155111,
//   "domain": "localhost:3000",
//   "nonce": "8p9YDZxl3V1HSnUrq",
//   "iat": 1747745759,
//   "iss": "YOUR_ISSUER",
//   "aud": "YOUR_AUDIENCE"
// }
export async function signInAction({
  address,
  chainId,
  nonce,
}: {
  address: string;
  chainId: number;
  nonce: string;
}) {
  console.log("signInAction", address, chainId, nonce);
  
  const supabaseAdmin = getSupabaseAdmin();
  const supabase = await createClient();

  const pwd = generateWalletP(address);
  const params = {
    email: `${address.toLowerCase()}@ethereum.wallet`,
    password: pwd,
  };

  // 判断是否存在用户
  // const { data: userData, error: userError } = await supabase.auth.getUser()
  // if (userError) {
  //   console.error('获取用户失败:', userError);
  //   return { success: false, error: userError };
  // }

  const existingUser = await doesUserExistByWalletAddress(address);
  if (!existingUser) {
    // 创建新用户
    const { data: authData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: params.email,
        password: pwd, // 随机密码
        email_confirm: true, // 自动确认邮箱
        user_metadata: {
          wallet_address: address,
        },
      });

    if (createError || !authData.user) {
      console.error("创建用户失败:", createError);
      return { success: false, error: createError };
    }

    const userId = authData.user.id;

    // 创建用户资料
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      avatar_url:
        "https://mzmlztcizgitmitugcdk.supabase.co/storage/v1/object/public/avatars//avatar.png",
      wallet_address: address,
      username: `user_${address.substring(2, 8)}`, // 生成临时用户名
    });

    if (profileError) {
      console.error("创建用户资料失败:", profileError);
      return { success: false, error: profileError };
    }
  } else {
    console.log("用户已存在:", existingUser);
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.signInWithPassword(params);

  if (sessionError) {
    console.error("创建会话失败:", sessionError);
    return { success: false, error: sessionError };
  }

  console.log("signInAction", sessionData);

  if (sessionData) {
    await supabase.auth.setSession({
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    });
  }
  // (await cookies()).set(COOKIE_KEYS.JWT, jwt, { secure: true });
  (await cookies()).set(COOKIE_KEYS.JWT, sessionData.session.access_token, {
    secure: true,
  });
}

export async function signOutAction() {
  console.log("signOutAction");
  (await cookies()).delete(COOKIE_KEYS.JWT);
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function isAuthAction() {
  const jwt = (await cookies()).get(COOKIE_KEYS.JWT)?.value;
  const isAuth = Boolean(jwt);
  return { isAuth, jwt };
}
