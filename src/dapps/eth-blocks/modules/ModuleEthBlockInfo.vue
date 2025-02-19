<template>
  <!--
    ===================================================
    Blocks Mint Tab
    ===================================================
    -->
  <v-container
    class="dapps--module-eth-block-info px-3 pb-13 pt-5 px-md-15 pb-md-15 pt-md-8"
  >
    <!--
        ===================================================
          Block Search or BlockInfo
        ===================================================
        -->
    <block-search v-if="hasSearch" class="mb-8 mb-md-5 mt-md-7" />
    <router-link
      v-else
      :to="{ name: ROUTES.MY_BLOCKS.NAME }"
      class="blue500--text"
    >
      <v-row class="align-center mt-3 mb-7 mb-md-8" no-gutters>
        <v-icon class="bluePrimary--text" size="20"> mdi-chevron-left</v-icon>
        <div>Back to all My blocks</div>
      </v-row>
    </router-link>
    <!--
      ===================================================
        NFT Image: XS AND SM
      ===================================================
      -->
    <v-row
      v-if="!loading"
      no-gutters
      class="justify-center mb-4 d-flex d-md-none align-center"
    >
      <a
        :href="handlerBlock.rawImg"
        target="_blank"
        class="border-container d-block pa-1 mx-auto cursor-image"
      >
        <v-img
          lazy-src="../assets/loading-block.svg"
          :src="handlerBlock.img"
          :max-width="$vuetify.breakpoint.xs ? '160' : '240'"
          contain
        >
          <template #placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular
                indeterminate
                color="disabledPrimary"
              ></v-progress-circular>
            </v-row>
          </template>
        </v-img>
      </a>
    </v-row>
    <v-row v-if="!loading" no-gutters class="justify-center mt-md-5">
      <!--
        ===================================================
          NFT Image: MD AND UP
        ===================================================
        -->
      <div class="d-block">
        <a
          :href="handlerBlock.rawImg"
          target="_blank"
          class="border-container d-none d-md-flex pa-1 mr-md-10 cursor-image"
        >
          <v-img
            lazy-src="../assets/loading-block.svg"
            :src="handlerBlock.img"
            max-width="332"
            contain
          >
            <template #placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular
                  indeterminate
                  color="disabledPrimary"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </a>
      </div>

      <v-col>
        <!--
        ===================================================
          NFT Title
        ===================================================
        -->
        <div
          class="d-flex flex-row align-center justify-space-between mb-4 mb-md-5"
        >
          <h2 class="text-center text-md-left">
            Block #{{ blockNumberFormatted }}
          </h2>
          <share-network
            network="twitter"
            :url="`https://www.ethvm.com/block/number/${blockRef}`"
            title="Twitter message"
            hashtags="MyEtherWallet,MEW,EthBlocks"
          >
            <mew-button class="mr-1" btn-style="light" color-theme="basic">
              <div class="d-flex align-center">
                <v-icon left>mdi-twitter</v-icon>
                <div>Share</div>
              </div>
            </mew-button>
          </share-network>
        </div>
        <!--
        ===================================================
          Block Info Alert component
        ===================================================
        -->
        <block-info
          :block-alert="alert"
          :block-number="blockRef"
          :owner="alertOwner"
          :price="alertMintPrice"
          :disable-action="isActionInProgress"
          :estimated-total-wei="estimatedTotal"
          :is-pending="hasPendingTx"
          :has-enough-eth="hasEnoughEth"
          @mint="mintBlock"
          @openSend="openSendBlockOverlay"
        />
        <!--
        ===================================================
          Block Description
        ===================================================
        -->
        <div v-if="!isReserved" class="mt-10 mt-md-5">
          <div :class="['textMedium--text', { 'mb-2': !isTestNetwork }]">
            {{ handlerBlock.description }}
          </div>
        </div>
        <!--
        ===================================================
          NFT Properties
          XS12
        ===================================================
        -->
        <div v-if="!isReserved" class="table-properties mt-10">
          <div
            class="table-properties--header py-3 px-5 textLight--text mew-caption"
          >
            properties
          </div>
          <div
            v-for="(item, index) in properties"
            :key="index"
            :class="[
              { 'table-properties--row-colored': isEven(index) },
              {
                'table-properties--last-row': index + 1 === properties.length
              },
              'd-flex flex-row justify-space-between py-3 px-5 textDark--text '
            ]"
          >
            <div>{{ item.text }}</div>
            <div>{{ item.value }}</div>
          </div>
        </div>
      </v-col>
    </v-row>
    <a
      v-if="!isReserved && !loading"
      class="d-flex flex-row-reverse mt-3"
      :href="`https://www.ethvm.com/block/number/${blockRef}`"
      target="_blank"
      @click="trackToEthVM"
    >
      View block info on EthVM
    </a>
    <blocks-loading v-else />
    <block-send
      :open="openSendOverlay"
      :close="closeSendOverlay"
      :block-number="blockNumberFormatted"
      :is-sending="isSending"
      @send="sendBlock"
    />
  </v-container>
</template>

<script>
import BlockInfo from '../components/BlockInfo.vue';
import BlockSearch from '../components/BlockSearch.vue';
import BlockSend from '../components/BlockSend.vue';
import BlocksLoading from '../components/BlocksLoading.vue';
import handlerBlock from '../handlers/handlerBlock';
import { BLOCK_ALERT } from '../handlers/helpers/blockAlertType';
import { formatIntegerToString } from '@/core/helpers/numberFormatHelper';
import { ETH_BLOCKS_ROUTE } from '../configsRoutes';
import { mapActions, mapGetters, mapState } from 'vuex';
import { validBlockNumber } from '../handlers/helpers/common';
import { toBN } from 'web3-utils';
import handlerAnalytics from '@/modules/analytics-opt-in/handlers/handlerAnalytics.mixin';

const MIN_GAS_TRANSFER = 150000;
const MIN_GAS_MINT = 350000;

export default {
  name: 'ModuleEthBlockInfo',
  components: {
    BlockInfo,
    BlockSearch,
    BlocksLoading,
    BlockSend
  },
  mixins: [handlerAnalytics],
  props: {
    blockRef: {
      type: String,
      required: true
    },
    hasSearch: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      handlerBlock: {},
      ROUTES: ETH_BLOCKS_ROUTE,
      openSendOverlay: false
    };
  },
  computed: {
    /**
     * STORE STATE
     */
    ...mapState('wallet', ['web3', 'address']),

    /**
     * STORE GETTERS
     */
    ...mapGetters('global', ['network', 'isTestNetwork', 'gasPrice']),
    ...mapGetters('ethBlocksTxs', ['getEthBlockTx']),
    ...mapGetters('wallet', ['balanceInWei']),

    /**
     * Deteremines if you have default min eth to pay
     * @returns {boolean}
     */
    hasEnoughEth() {
      if (
        this.alert === BLOCK_ALERT.OWNED ||
        this.alert === BLOCK_ALERT.AVAILABLE
      ) {
        return !toBN(this.balanceInWei).sub(toBN(this.estimatedTotal)).isNeg();
      }
      return true;
    },
    estimatedTotal() {
      if (
        this.alert === BLOCK_ALERT.OWNED ||
        this.alert === BLOCK_ALERT.AVAILABLE
      ) {
        const gasLimit =
          this.alert === BLOCK_ALERT.OWNED ? MIN_GAS_TRANSFER : MIN_GAS_MINT;
        const txFee = toBN(gasLimit).mul(toBN(this.gasPrice));
        return this.alert === BLOCK_ALERT.OWNED
          ? txFee.toString()
          : txFee.add(toBN(this.handlerBlock.mintPrice)).toString();
      }
      return '0';
    },

    /**
     * @returns {string}:
     * formatted string of the block number
     */
    blockNumberFormatted() {
      return formatIntegerToString(this.blockRef);
    },
    /**
     * @returns {boolean}:
     * if HandelrBlockInfo.loading equals false,  returns false, otherwise returns true
     */
    loading() {
      return this.handlerBlock && this.handlerBlock.loading === false
        ? false
        : true;
    },
    /**
     * @returns allert type based on the owner of the block:
     * - null -> available
     * - adrees === wallet address -> owned
     * - address !== wallet address -> not available
     */
    alert() {
      if (this.isReserved) {
        return BLOCK_ALERT.RESERVED;
      }
      if (!this.loading && this.handlerBlock.hasOwner) {
        return this.address === this.handlerBlock.owner
          ? BLOCK_ALERT.OWNED
          : BLOCK_ALERT.NOT_AVAILABLE;
      }
      return BLOCK_ALERT.AVAILABLE;
    },
    /**
     * @returns {string} block owner
     */
    alertOwner() {
      return this.loading ? '' : this.handlerBlock.owner;
    },
    /**
     * @returns {string} block mint price
     */
    alertMintPrice() {
      return this.loading ? '' : this.handlerBlock.mintPrice;
    },

    /**
     * @returns array of block properties
     */
    properties() {
      if (!this.loading) {
        const author = `${this.handlerBlock.author.substr(
          0,
          6
        )}...${this.handlerBlock.author.substr(
          this.handlerBlock.author.length - 4,
          4
        )}`;

        const _data = [
          { text: 'Number', value: this.blockNumberFormatted },
          { text: 'Date Created', value: this.handlerBlock.date },
          { text: 'Author', value: author },
          {
            text: 'Transactions',
            value: formatIntegerToString(this.handlerBlock.transactions)
          },
          {
            text: 'Gas Used',
            value: formatIntegerToString(this.handlerBlock.gasUsed)
          },
          {
            text: 'Uncles',
            value: formatIntegerToString(this.handlerBlock.transactions)
          }
        ];
        if (this.handlerBlock.extra.length > 0) {
          this.handlerBlock.extra.forEach(item => {
            _data.push({
              text: 'Extra',
              value: item.value
            });
          });
        }
        return _data;
      }
      return [];
    },
    /**
     * @returns {boolean}:
     */
    isSending() {
      return this.loading ? false : this.handlerBlock.isSending;
    },
    /**
     * Used in alert ui, disals button after user clicks send/mint to show that soemthign is happening
     * @returns {boolean}
     */
    isActionInProgress() {
      return this.loading
        ? false
        : this.handlerBlock.isMinting || this.handlerBlock.isSending;
    },
    /**
     * Determines whether or not there is a pending transaction in the current chain for current block
     * @returns {boolean}
     */
    hasPendingTx() {
      const _block = {
        blockNumber: this.blockRef.toString(),
        hash: this.handlerBlock.pendingTxHash,
        network: this.network.type.name
      };
      return this.getEthBlockTx(_block) ? true : false;
    },
    /**
     * Determines whether or not this block is reserved 1-10
     * @returns {boolean}
     */
    isReserved() {
      const _currBlock = toBN(this.blockRef);
      const RESERVED = toBN(10);
      return !_currBlock.isZero() && _currBlock.lte(RESERVED);
    }
  },
  watch: {
    /**
     * Update HandelrBlockInfo on block number change and fetch data
     */
    blockRef(newVal) {
      if (validBlockNumber(newVal)) {
        this.handlerBlock.setBlockNumber(newVal);
        this.resetBlock();
      } else {
        this.$router.push({ name: ETH_BLOCKS_ROUTE.CORE.NAME });
      }
    },
    /**
     * Update HandelrBlockInfo on network change and fetch data
     */
    network(newVal) {
      if (newVal) {
        this.handlerBlock.setNetwork(newVal);
        this.resetBlock();
      }
    },

    /**
     * Update HandelrBlockInfo on network change and fetch data
     */
    address(newVal) {
      if (newVal) {
        this.handlerBlock.setAddress(newVal);
        this.resetBlock();
      }
    },

    /**
     * Watch hasPending txs
     * if newVal - close send overlay
     * if !newVal - refetch block info
     */
    hasPendingTx(newVal, oldVal) {
      /* New Hash was asigned */ {
        if (newVal && newVal !== oldVal) {
          if (this.openSendOverlay) {
            this.closeSendOverlay();
          }
        }
        if (newVal === false) {
          this.resetBlock();
        }
      }
    }
  },
  mounted() {
    /**
     * Initiate Block Info Handler
     * if valid block number --> fetch block info
     * if !valid block number --> reroute to default eth blocks route
     */
    if (validBlockNumber(this.blockRef)) {
      this.handlerBlock = new handlerBlock(
        this.web3,
        this.network,
        this.blockRef,
        this.address
      );
      this.resetBlock();
    } else {
      this.$router.push({ name: ETH_BLOCKS_ROUTE.CORE.NAME });
    }
  },

  methods: {
    /**
     * STORE ACTIONS
     */
    ...mapActions('ethBlocksTxs', ['addEthBlockTx']),
    /**
     * tracks when user clicks ethvm from ethblocks
     */
    trackToEthVM() {
      this.trackDapp('ethBlocksToEthVM');
    },
    resetBlock() {
      this.handlerBlock.getBlock();
    },

    /**
     * Method returns whether or no number is even.
     * Used in table component, to determine row color
     * @param {number} _value
     * @returns {boolean}
     */
    isEven(_value) {
      return _value % 2 == 0;
    },
    /**
     * Method mints a blocks.
     * Responds, to child Alert component on emit 'mint' event
     */
    mintBlock() {
      this.trackDapp('ethBlocksMint');
      this.handlerBlock.mintBlock(this.balanceInWei, this.gasPrice);
    },

    /**
     * Method opens send overlay .
     * Responds, to child Alert component on emit 'openSend' event
     */
    openSendBlockOverlay() {
      this.openSendOverlay = true;
    },
    /**
     * Method closes send overlay .
     * Responds, to child Alert component on emit 'close' event
     */
    closeSendOverlay() {
      this.openSendOverlay = false;
    },
    /**
     * Method sends EthBlock .
     * Responds, to child Alert component on emit 'send' event
     * @param {string} value - to address
     */
    sendBlock(value) {
      this.trackDapp('ethBlocksSendBlock');
      this.handlerBlock.transferBlock(value, this.balanceInWei, this.gasPrice);
    }
  }
};
</script>

<style lang="scss" scoped>
.border-container {
  border: 1px solid var(--v-greyMedium-base);
  border-radius: 12px;
}

.table-properties {
  border: 1px solid var(--v-greyMedium-base);
  border-radius: 10px;
  .table-properties--header {
    background-color: var(--v-backgroundWallet-base);
    border-radius: 10px 10px 0% 0%;
  }
  .table-properties--row-colored {
    background-color: var(--v-backgroundGrey-base);
  }
  .table-properties--last-row {
    border-radius: 0% 0% 10px 10px;
  }
}
.cursor-image {
  cursor: -moz-zoom-in;
  cursor: -webkit-zoom-in;
  cursor: zoom-in;
}
</style>
