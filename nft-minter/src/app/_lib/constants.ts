export const sessionCookieName = "session";
export const secureCookieName = "secure";

export const PINATA_IPFS_GATEWAY_BASE =
  "https://azure-many-sole-7.mypinata.cloud/ipfs/";

export const COOKIE_KEYS = {
  JWT: "jwt",
};
export const EMITTER_EVENTS = {
  SIGN_IN: "sign_in",
  SIGN_OUT: "sign_out",
};
export const JWT_CONFIG = {
  ISSUER: "YOUR_ISSUER",
  AUDIENCE: "YOUR_AUDIENCE",
};

import MyNFTFactory from "@/../artifacts/contracts/MyNFTFactory.sol/MyNFTFactory.json";
export const MY_NFT_FACTORY_ABI = MyNFTFactory.abi;
export const MY_NFT_FACTORY_ADDRESS =
  env.NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS as `0x${string}`;

import Marketplace from "@/../artifacts/contracts/Marketplace.sol/Marketplace.json";
export const MARKETPLACE_ABI = Marketplace.abi;
export const MARKETPLACE_CONTRACT_ADDRESS =
  env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;
export const MARKETPLACE_NAME = "GL NFT Marketplace";
export const MARKETPLACE_VERSION = "1.0";

import MyNFT from "@/../artifacts/contracts/MyNFT.sol/MyNFT.json";
import { env } from "./config/env";
export const MY_NFT_ABI = MyNFT.abi;

import IERC20 from "@/../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";
export const ERC20_ABI = IERC20.abi;

export const CHAINS_MAP: Record<string, string> = {
  "1": "mainnet",
  "137": "polygon",
  "10": "optimism",
  "42161": "arbitrum",
  "17000": "holesky",
  "11155111": "sepolia",
  "84532": "baseSepolia",
  "534351": "scrollSepolia",
  "420": "optimismSepolia",
  "421614": "arbitrumSepolia",
  "300": "zkSyncSepoliaTestnet",
  "80001": "polygonMumbai",
};

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const SECONDS_IN_A_DAY = 86400;
