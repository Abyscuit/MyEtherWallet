import evmos from '@/assets/images/networks/evmos.svg';

export default {
  name: 'TEVMOS',
  name_long: 'Evmos Testnet',
  homePage: 'https://evmos.org/',
  blockExplorer: 'EvmEvmos',
  blockExplorerTX: 'https://evm.evmos.dev/tx/[[txHash]]',
  blockExplorerAddr: 'https://evm.evmos.dev/address/[[address]]',
  chainID: 9000,
  tokens: [],
  contracts: [],
  icon: evmos,
  currencyName: 'tEVMOS',
  isTestNetwork: true,
  isEthVMSupported: {
    supported: false,
    url: null,
    blockExplorerTX: '',
    blockExplorerAddr: '',
    websocket: null
  },
  gasPriceMultiplier: 1,
  canBuy: false,
  coingeckID: null
};
