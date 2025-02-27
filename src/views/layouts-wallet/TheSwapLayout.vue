<template>
  <the-wrapper-wallet :total-left-col-items="1" :total-right-col-items="2">
    <template #leftColItem1>
      <module-swap
        :is-available="hasSwap"
        :from-token="fromToken"
        :to-token="toToken"
        :amount="amount"
      />
    </template>
    <template #rightColItem1>
      <module-tokens-value />
    </template>
    <template v-if="hasHistory && hasSwap" #rightColItem2>
      <module-transfer-history :is-swap="true" />
    </template>
  </the-wrapper-wallet>
</template>

<script>
import { mapGetters } from 'vuex';

import TheWrapperWallet from '@/core/components/TheWrapperWallet';
import ModuleSwap from '@/modules/swap/ModuleSwap';
import ModuleTokensValue from '@/modules/balance/ModuleTokensValue';
import ModuleTransferHistory from '@/modules/transfer-history/ModuleTransferHistory';
import { ROUTES_WALLET } from '@/core/configs/configRoutes';

import handlerAnalytics from '@/modules/analytics-opt-in/handlers/handlerAnalytics.mixin';

const ETH_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const DAI_TOKEN = '0x6b175474e89094c44da98b954eedeac495271d0f';

export default {
  components: {
    TheWrapperWallet,
    ModuleSwap,
    ModuleTokensValue,
    ModuleTransferHistory
  },
  mixins: [handlerAnalytics],
  beforeRouteLeave(to, from, next) {
    if (to.name === ROUTES_WALLET.NETWORK.NAME) {
      this.trackSwap('switchingNetworkOnSwap');
    }
    if (
      to.name !== ROUTES_WALLET.NETWORK.NAME &&
      to.name !== ROUTES_WALLET.SWAP.NAME
    ) {
      this.trackSwap('leavingSwapTo: ' + to.name);
    }
    next();
  },
  props: {
    fromToken: {
      type: String,
      default: ETH_TOKEN
    },
    toToken: {
      type: String,
      default: DAI_TOKEN
    },
    amount: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapGetters('global', ['hasSwap']),
    ...mapGetters('notifications', ['swapNotifications']),
    hasHistory() {
      return this.swapNotifications && this.swapNotifications.length > 0;
    }
  }
};
</script>
