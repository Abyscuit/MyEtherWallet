import evmos from '@/assets/images/networks/evmos.svg';
import tokens from '@/_generated/tokens/tokens-evmos.json';

export default {
  name: 'EVMOS',
  name_long: 'Evmos',
  homePage: 'https://evmos.org/',
  blockExplorer: 'EvmEvmos',
  blockExplorerTX: 'https://evm.evmos.org/tx/[[txHash]]',
  blockExplorerAddr: 'https://evm.evmos.org/address/[[address]]',
  chainID: 9001,
  tokens: tokens,
  contracts: [],
  icon: evmos,
  currencyName: 'EVMOS',
  isTestNetwork: false,
  isEthVMSupported: {
    supported: false,
    url: null,
    blockExplorerTX: '',
    blockExplorerAddr: '',
    websocket: null
  },
  gasPriceMultiplier: 1,
  canBuy: false,
  coingeckID: 'evmos'
};
