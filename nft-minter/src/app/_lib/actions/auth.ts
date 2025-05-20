'use server';

import { cookies } from 'next/headers';
import { COOKIE_KEYS } from '../constants';
// import { createClient } from '../supabase/server';

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
export async function signInAction({ jwt }: { jwt: string }) {
  // const supabase = await createClient()

  console.log('signInAction', jwt);
  (await cookies()).set(COOKIE_KEYS.JWT, jwt, { secure: true });
}

export async function signOutAction() {
  console.log('signOutAction');
  (await cookies()).delete(COOKIE_KEYS.JWT);
}

export async function isAuthAction() {
  const jwt = (await cookies()).get(COOKIE_KEYS.JWT)?.value;
  console.log('isAuthAction', jwt);
  return { isAuth: Boolean(jwt) };
}
