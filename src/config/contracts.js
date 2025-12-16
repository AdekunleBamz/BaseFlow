// BaseFlow contract configuration
// Replace CONTRACT_ADDRESS with your deployed contract address

export const BASEFLOW_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x2314197354797917EE7C22eBdc61dB32dcDEf30B';

// Base Mainnet DEX Routers
export const DEX_ROUTERS = {
  uniswapV3: '0x2626664c2603336E57B271c5C0b26F421741e481', // Uniswap V3 SwapRouter
  aerodrome: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43', // Aerodrome Router
  baseSwap: '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86', // BaseSwap Router
  sushiswap: '0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891', // SushiSwap Router
};

// Common tokens on Base
export const TOKENS = {
  ETH: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logo: '/images/tokens/eth.png',
  },
  WETH: {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    logo: '/images/tokens/weth.png',
  },
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: '/images/tokens/usdc.png',
  },
  USDbC: {
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    symbol: 'USDbC',
    name: 'USD Base Coin',
    decimals: 6,
    logo: '/images/tokens/usdbc.png',
  },
  DAI: {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logo: '/images/tokens/dai.png',
  },
  cbETH: {
    address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    symbol: 'cbETH',
    name: 'Coinbase Wrapped Staked ETH',
    decimals: 18,
    logo: '/images/tokens/cbeth.png',
  },
  AERO: {
    address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    symbol: 'AERO',
    name: 'Aerodrome',
    decimals: 18,
    logo: '/images/tokens/aero.png',
  },
  BRETT: {
    address: '0x532f27101965dd16442E59d40670FaF5eBB142E4',
    symbol: 'BRETT',
    name: 'Brett',
    decimals: 18,
    logo: '/images/tokens/brett.png',
  },
  DEGEN: {
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    symbol: 'DEGEN',
    name: 'Degen',
    decimals: 18,
    logo: '/images/tokens/degen.png',
  },
  TOSHI: {
    address: '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4',
    symbol: 'TOSHI',
    name: 'Toshi',
    decimals: 18,
    logo: '/images/tokens/toshi.png',
  },
};

export const TOKEN_LIST = Object.values(TOKENS);

// BaseFlow ABI (Lite Version)
export const BASEFLOW_ABI = [
  // Read functions
  {
    inputs: [],
    name: "swapFee",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "automationFee",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getDexRouters",
    outputs: [{ type: "address[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "router", type: "address" }],
    name: "isDexRouter",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "orderId", type: "uint256" }],
    name: "dcaOrders",
    outputs: [
      { name: "user", type: "address" },
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "amountPerInterval", type: "uint256" },
      { name: "intervalsRemaining", type: "uint256" },
      { name: "intervalDuration", type: "uint256" },
      { name: "lastExecutionTime", type: "uint256" },
      { name: "active", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "orderId", type: "uint256" }],
    name: "limitOrders",
    outputs: [
      { name: "user", type: "address" },
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "amountIn", type: "uint256" },
      { name: "minAmountOut", type: "uint256" },
      { name: "expiry", type: "uint256" },
      { name: "active", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserDCAOrders",
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserLimitOrders",
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "collectedFeesETH",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "token", type: "address" }],
    name: "collectedFeesToken",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  // Write functions
  {
    inputs: [
      { name: "_tokenIn", type: "address" },
      { name: "_tokenOut", type: "address" },
      { name: "_amountIn", type: "uint256" },
      { name: "_minAmountOut", type: "uint256" },
      { name: "_dexRouter", type: "address" },
      { name: "_swapData", type: "bytes" }
    ],
    name: "swap",
    outputs: [{ type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "_tokenIn", type: "address" },
      { name: "_tokenOut", type: "address" },
      { name: "_totalAmount", type: "uint256" },
      { name: "_intervals", type: "uint256" },
      { name: "_intervalDuration", type: "uint256" }
    ],
    name: "createDCAOrder",
    outputs: [{ type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "_orderId", type: "uint256" }],
    name: "cancelDCAOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "_tokenIn", type: "address" },
      { name: "_tokenOut", type: "address" },
      { name: "_amountIn", type: "uint256" },
      { name: "_minAmountOut", type: "uint256" },
      { name: "_duration", type: "uint256" }
    ],
    name: "createLimitOrder",
    outputs: [{ type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "_orderId", type: "uint256" }],
    name: "cancelLimitOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Admin functions
  {
    inputs: [{ name: "_router", type: "address" }],
    name: "addDex",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "_swapFee", type: "uint256" },
      { name: "_automationFee", type: "uint256" }
    ],
    name: "setFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_token", type: "address" }],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "_keeper", type: "address" },
      { name: "_status", type: "bool" }
    ],
    name: "setKeeper",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "tokenIn", type: "address" },
      { indexed: true, name: "tokenOut", type: "address" },
      { indexed: false, name: "amountIn", type: "uint256" },
      { indexed: false, name: "amountOut", type: "uint256" }
    ],
    name: "Swap",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "orderId", type: "uint256" },
      { indexed: true, name: "user", type: "address" }
    ],
    name: "DCAOrderCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "orderId", type: "uint256" },
      { indexed: false, name: "amountOut", type: "uint256" }
    ],
    name: "DCAOrderExecuted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "orderId", type: "uint256" }
    ],
    name: "DCAOrderCancelled",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "orderId", type: "uint256" },
      { indexed: true, name: "user", type: "address" }
    ],
    name: "LimitOrderCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "orderId", type: "uint256" },
      { indexed: false, name: "amountOut", type: "uint256" }
    ],
    name: "LimitOrderExecuted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "orderId", type: "uint256" }
    ],
    name: "LimitOrderCancelled",
    type: "event"
  }
];

// ERC20 ABI for token approvals
export const ERC20_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function"
  }
];
