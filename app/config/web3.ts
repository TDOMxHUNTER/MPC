
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon } from '@reown/appkit/networks'

// 1. Get projectId from environment or use the provided one
const projectId = '2a3cb8da4f7f897a2306f192152dfa98'

// Define Monad testnet
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Testnet Explorer',
      url: 'https://testnet.monadexplorer.com/',
    },
  },
  testnet: true,
}

// 2. Set up the Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, arbitrum, polygon, monadTestnet],
  projectId,
  ssr: true
})

// 3. Configure the metadata
const metadata = {
  name: 'Monad Profile Card',
  description: 'Create and customize your Monad profile card',
  url: 'https://monad-profile.replit.app',
  icons: ['https://docs.monad.xyz/img/monad_logo.png']
}

// 4. Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum, polygon, monadTestnet],
  defaultNetwork: monadTestnet,
  metadata,
  features: {
    analytics: true,
  }
})

export { projectId, wagmiAdapter }
