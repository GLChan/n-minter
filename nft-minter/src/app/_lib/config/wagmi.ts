import {
  sepolia,
  baseSepolia,
  scrollSepolia,
  optimismSepolia,
  arbitrumSepolia,
  zkSyncSepoliaTestnet,
  polygonMumbai,
  mainnet,
  polygon,
  optimism,
  arbitrum,
  holesky
} from 'viem/chains';
import { cookieStorage, createConfig, createStorage, http } from 'wagmi';

export default createConfig({
  chains: [
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
    zkSyncSepoliaTestnet,
    polygonMumbai
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),

    [holesky.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [scrollSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [zkSyncSepoliaTestnet.id]: http(),
    [polygonMumbai.id]: http()
  }
});
