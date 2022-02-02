export const TOKEN_DECIMALS = 9;

export enum Networks {
  UNKNOW = 0,
  POLYGON_MAINNET = 137,
  POLYGON_MUMBAI = 80001,
  OTTER_FORK = 31338,
  HARDHAT = 31337,
  BSC_TESTNET = 97
}

export const RPCURL = {
  [Networks.POLYGON_MAINNET]: 'https://polygon-rpc.com',
  [Networks.POLYGON_MUMBAI]: 'https://rpc-mumbai.maticvigil.com/',
  [Networks.OTTER_FORK]: 'https://fork-rpc.otterclam.finance',
  [Networks.HARDHAT]: 'http://localhost:8545',
  [Networks.BSC_TESTNET]: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
};

export const DEFAULT_NETWORK = Networks.BSC_TESTNET;
// export const DEFAULT_NETWORK = Networks.POLYGON_MUMBAI;
// export const DEFAULT_NETWORK = Networks.HARDHAT;
