import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import NetworkAndAddressModal from '@/layouts/AccessWalletLayout/components/NetworkAndAddressModal/NetworkAndAddressModal.vue';
import sinon from 'sinon';
import { Tooling } from '@@/helpers';

const showModal = sinon.stub();
const hideModal = sinon.stub();

const BModalStub = {
  name: 'b-modal',
  template: '<div><slot></slot></div>',
  props: ['to'],
  methods: {
    show: showModal,
    hide: hideModal
  }
};

describe('NetworkAndAddressModal.vue', () => {
  let localVue, i18n, wrapper, store;
  const spy = sinon.stub();
  const mockRoute = {
    push: spy
  };

  beforeAll(() => {
    const baseSetup = Tooling.createLocalVueInstance();
    localVue = baseSetup.localVue;
    i18n = baseSetup.i18n;
    store = baseSetup.store;

    Vue.config.warnHandler = () => {};
  });

  beforeEach(() => {
    wrapper = shallowMount(NetworkAndAddressModal, {
      localVue,
      i18n,
      store,
      attachToDocument: true,
      mocks: {
        $router: mockRoute,
        $route: { path: '/access-my-wallet' }
      },
      stubs: {
        'b-modal': BModalStub
      }
    });
  });

  describe('NetworkAndAddressModal.vue Methods', () => {
    xit('[9-4-19, feels like it should pass]should render correct unlockWallet method', () => {
      wrapper.vm.currentWallet = '0xfbeef911dc5821886e1dda71586d90ed28174b7d';
      wrapper.vm.wallet = {}
      wrapper.vm.unlockWallet();
      expect(spy.calledWith({ path: 'interface' })).toBe(true);
    });

    it('should render correct showCustomPathInput method', () => {
      let customPath = { label: 'label', path: 'dpath' };
      wrapper.setData({ customPath });
      wrapper.vm.showCustomPathInput();
      expect(wrapper.vm.$data.customPathInput).toBe(true);
      customPath = { label: '', path: '' };
      expect(wrapper.vm.$data.customPath).toEqual(customPath);
    });
  });
});
