export const sessionCookieName = 'session';
export const secureCookieName = 'secure';

export const PINATA_IPFS_GATEWAY_BASE = 'https://azure-many-sole-7.mypinata.cloud/ipfs/'

export const COOKIE_KEYS = {
  JWT: 'jwt'
};
export const EMITTER_EVENTS = {
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out'
};
export const JWT_CONFIG = {
  ISSUER: 'YOUR_ISSUER',
  AUDIENCE: 'YOUR_AUDIENCE',
}

import MyNFTFactory from "@/../artifacts/contracts/MyNFTFactory.sol/MyNFTFactory.json";
export const MY_NFT_FACTORY_ABI = MyNFTFactory.abi;
export const MY_NFT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS as `0x${string}`;

import Marketplace from "@/../artifacts/contracts/Marketplace.sol/Marketplace.json";
export const MARKETPLACE_ABI = Marketplace.abi;
export const MARKETPLACE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;

import MyNFT from "@/../artifacts/contracts/MyNFT.sol/MyNFT.json";
export const MY_NFT_ABI = MyNFT.abi;
