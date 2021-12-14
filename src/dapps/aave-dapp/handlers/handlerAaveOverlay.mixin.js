import { mapState, mapGetters } from 'vuex';
import { isEmpty } from 'lodash';
import BigNumber from 'bignumber.js';

const handlerAaveOverlay = {
  props: {
    isLoadingData: {
      type: Boolean,
      default: true
    },
    userSummary: {
      type: Object,
      default: () => {}
    },
    reservesData: {
      type: Array,
      default: () => []
    },
    preSelectedToken: {
      default: () => {
        return {};
      },
      type: Object
    },
    open: {
      default: false,
      type: Boolean
    },
    close: {
      default: () => {},
      type: Function
    }
  },
  computed: {
    ...mapState('wallet', ['address']),
    ...mapGetters('external', ['fiatValue']),
    actualSelectedToken() {
      const selectedTokens = isEmpty(this.selectedToken)
        ? isEmpty(this.preSelectedToken)
          ? {}
          : this.preSelectedToken
        : this.selectedToken;
      return selectedTokens;
    },
    actualToken() {
      if (this.reservesData) {
        const token = this.reservesData.find(item => {
          if (item.symbol === this.actualSelectedToken.token) return item;
        });

        return token;
      }
      return {};
    },
    selectedTokenUSDValue() {
      return new BigNumber(this.actualToken?.price?.priceInEth || 0).times(
        this.fiatValue
      );
    },
    selectedTokenInUserSummary() {
      return this.userSummary?.reservesData?.find(item => {
        if (item.reserve.symbol === this.actualSelectedToken.token) {
          return item;
        }
      });
    },
    amountUsd() {
      const amount = this.amount ? this.amount : 0;
      return `$ ${BigNumber(this.selectedTokenUSDValue)
        .times(amount)
        .toFixed(2)}`;
    }
  }
};

export default handlerAaveOverlay;
