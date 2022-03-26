import ProductInputComponent from './ProductManageComponent/ProductInputComponent';
import ProductStateComponent from './ProductManageComponent/ProductsStateComponent';
import CoinInputComponent from './CoinManageComponent/CoinInputComponent';

import VendingMachineProductManager from '../domains/VendingMachineProductManager';
import VendingMachineCoinManager from '../domains/VendingMachineCoinManager';
import CoinsStateComponent from './CoinManageComponent/CoinsStateComponent';

import { $, on } from '../dom';
import { ROUTES } from '../constants';

export default class NavigatorComponent {
  private $productInfoSection: HTMLElement = $('.product-info-section');
  private $chargeCoinSection: HTMLElement = $('.charge-coin-section');
  private $navProductButton = $('.nav__product-button') as HTMLButtonElement;
  private $navChargeButton = $('.nav__charge-button') as HTMLButtonElement;
  private $coinInput = $(
    '.charge-form-section__coin-input'
  ) as HTMLInputElement;
  private $productInput = $(
    '.product-info-form__product-input'
  ) as HTMLInputElement;

  private vendingMachineProductManager = new VendingMachineProductManager();
  private vendingMachineCoinManager = new VendingMachineCoinManager();

  constructor() {
    new ProductStateComponent(this.vendingMachineProductManager);
    new ProductInputComponent(this.vendingMachineProductManager);
    new CoinInputComponent(this.vendingMachineCoinManager);
    new CoinsStateComponent();

    on(this.$navProductButton, 'click', this.onClickNavProductButton);
    on(this.$navChargeButton, 'click', this.onClickNavChargeButton);
    on(window, 'popstate', this.onPopstateRoute);
    this.routeURLVisit(window.location.pathname);
  }

  private routeURLVisit(pathname: string): void {
    if (
      !Object.values(ROUTES).some((route) => route === window.location.pathname)
    ) {
      window.history.replaceState(null, null, '/');

      return;
    }

    if (pathname === ROUTES.COINS) {
      this.renderCoinComponent();
      window.history.pushState({}, '', ROUTES.COINS);

      return;
    }

    if (pathname === ROUTES.PRODUCTS) {
      this.renderProductComponent();
      window.history.pushState({}, '', ROUTES.PRODUCTS);

      return;
    }
  }

  private onPopstateRoute = (): void => {
    if (window.location.pathname === ROUTES.COINS) {
      this.renderCoinComponent();
    }

    if (
      window.location.pathname === ROUTES.PRODUCTS ||
      window.location.pathname === '/'
    ) {
      this.renderProductComponent();
    }
  };

  private onClickNavProductButton = (e: Event): void => {
    e.preventDefault();
    this.renderProductComponent();
    window.history.pushState({}, '', ROUTES.PRODUCTS);
  };

  private onClickNavChargeButton = (e: Event): void => {
    e.preventDefault();
    this.renderCoinComponent();
    window.history.pushState({}, '', ROUTES.COINS);
  };

  private renderProductComponent(): void {
    this.$productInfoSection.classList.remove('hide');
    this.$chargeCoinSection.classList.add('hide');
    this.$navProductButton.classList.add('nav__button--focused');
    this.$navChargeButton.classList.remove('nav__button--focused');
    this.$productInput.focus();
  }

  private renderCoinComponent(): void {
    this.$productInfoSection.classList.add('hide');
    this.$chargeCoinSection.classList.remove('hide');
    this.$navProductButton.classList.remove('nav__button--focused');
    this.$navChargeButton.classList.add('nav__button--focused');
    this.$coinInput.focus();
  }
}
