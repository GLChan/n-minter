import {
  createWalletClient,
  createPublicClient,
  http,
  type PublicClient,
  type WalletClient,
  type Chain,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { env } from "@/app/_lib/config/env";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  holesky,
  sepolia,
  baseSepolia,
  scrollSepolia,
  optimismSepolia,
  arbitrumSepolia,
  polygonMumbai,
} from "viem/chains";

// 支持的链映射
export const chainsMap: Record<string, Chain> = {
  "1": mainnet,
  "137": polygon,
  "10": optimism,
  "42161": arbitrum,
  "17000": holesky,
  "11155111": sepolia,
  "84532": baseSepolia,
  "534351": scrollSepolia,
  "420": optimismSepolia,
  "421614": arbitrumSepolia,
  "80001": polygonMumbai,
};

export function getViemClients(chainId: number) {
  const chain = chainsMap[chainId.toString()];
  if (!chain) throw new Error(`不支持的链 ID：${chainId}`);

  const formattedPrivateKey = env.PRIVATE_KEY.startsWith("0x")
    ? env.PRIVATE_KEY
    : "0x" + env.PRIVATE_KEY;

  const account = privateKeyToAccount(formattedPrivateKey as Hex);

  const publicClient: PublicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const walletClient: WalletClient = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  return {
    account,
    chain,
    publicClient,
    walletClient,
  };
}
