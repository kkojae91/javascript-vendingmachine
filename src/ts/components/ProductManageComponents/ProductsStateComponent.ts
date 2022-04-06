import { Product } from '../../types/vendingMachineProductManager';

import renderSnackBar from '../../dom/snackBar';
import { on, $, focusEditInput, $$, emit } from '../../dom/domHelper';
import focusWrongInput from '../../dom/checkErrorMessage';

import { DELETE_PRODUCT_CONFIRM_MESSAGE } from '../../constants/errorMessage';

import {
  checkValidLengthProductName,
  checkValidProductPrice,
  checkValidProductQuantity,
} from '../../validation/checkProduct';
import {
  generateTemplate,
  generateEditTemplate,
} from './productStateTemplates';

export default class ProductStateComponent {
  private $productTableTbody = $<HTMLElement>('.product-table tbody');
  private $snackBarContainer = $<HTMLElement>('.snack-bar-container');

  constructor(private vendingMachineProductManager) {
    on(
      $<HTMLButtonElement>('.product-info-form__add-button'),
      '@productInputSubmit',
      this.addProduct
    );
    on(
      $<HTMLElement>('.consumer-product-table__tbody'),
      '@subtractProductQuantity',
      this.subtractProductQuantity
    );
    on(this.$productTableTbody, 'click', this.onClickProductList);
    on(this.$productTableTbody, 'keyup', this.onKeyupProductList);
  }

  private subtractProductQuantity = ({ detail: { editProduct } }): void => {
    this.vendingMachineProductManager.editQuantity(editProduct);

    const target = Array.from($$('.product-table__info-tr')).find(
      (product) => product.dataset.productName === editProduct.name
    );

    target.querySelector('.product-table__product-quantity').textContent =
      editProduct.quantity;
  };

  private addProduct = ({ detail: { newProduct } }): void => {
    this.$productTableTbody.insertAdjacentHTML(
      'beforeend',
      generateTemplate(newProduct)
    );
  };

  private approveEditProduct(target) {
    const parentElement: HTMLTableRowElement = target.closest(
      '.product-table__info-tr'
    );
    const $editProductNameInput = $<HTMLInputElement>(
      '.product-table__product-name-input--edit'
    );
    const $editProductPriceInput = $<HTMLInputElement>(
      '.product-table__product-price-input--edit'
    );
    const $editProductQuantityInput = $<HTMLInputElement>(
      '.product-table__product-quantity-input--edit'
    );

    try {
      checkValidLengthProductName($editProductNameInput.value);
      checkValidProductPrice($editProductPriceInput.valueAsNumber);
      checkValidProductQuantity($editProductQuantityInput.valueAsNumber);

      const editedProduct: Product = {
        name: $editProductNameInput.value,
        price: $editProductPriceInput.valueAsNumber,
        quantity: $editProductQuantityInput.valueAsNumber,
      };

      this.vendingMachineProductManager.editProduct(
        parentElement.dataset.productName,
        editedProduct
      );

      emit(this.$productTableTbody, '@editConsumerProduct', {
        detail: {
          previousProductName: parentElement.dataset.productName,
          editedProduct,
        },
      });

      parentElement.innerHTML = generateTemplate(editedProduct);
      parentElement.dataset.productName = $editProductNameInput.value;

      renderSnackBar(
        this.$snackBarContainer,
        `상품이 정상적으로 수정되었습니다. 수정된 상품을 확인해주세요.`,
        'success'
      );
    } catch ({ message }) {
      focusWrongInput({
        message,
        $nameInput: $editProductNameInput,
        $priceInput: $editProductPriceInput,
        $quantityInput: $editProductQuantityInput,
      });
      renderSnackBar(this.$snackBarContainer, message, 'error');
    }
  }

  private readyEditProduct(target) {
    const parentElement: HTMLTableRowElement = target.closest(
      '.product-table__info-tr'
    );
    const targetProduct: Product =
      this.vendingMachineProductManager.getTargetProduct(
        parentElement.dataset.productName
      );

    parentElement.innerHTML = generateEditTemplate(targetProduct);

    focusEditInput(
      parentElement.querySelector('.product-table__product-name-input--edit')
    );
  }

  private deleteProduct(target): void {
    const parentElement: HTMLTableRowElement = target.closest(
      '.product-table__info-tr'
    );
    const grandParentElement: HTMLElement = target.closest('tbody');
    const targetProductName = parentElement.dataset.productName;

    if (!window.confirm(DELETE_PRODUCT_CONFIRM_MESSAGE(targetProductName))) {
      return;
    }

    this.vendingMachineProductManager.deleteProduct(targetProductName);

    grandParentElement.removeChild(parentElement);

    renderSnackBar(
      this.$snackBarContainer,
      '상품이 정상적으로 삭제되었습니다.',
      'success'
    );

    emit(this.$productTableTbody, '@deleteConsumerProduct', {
      detail: {
        deleteProductName: targetProductName,
      },
    });
  }

  private onKeyupProductList = ({ target, key }) => {
    if (!target.matches('.product-table__input--edit')) return;
    if (key !== 'Enter') return;

    this.approveEditProduct(target);
  };

  private onClickProductList = ({ target }): void => {
    if (target.matches('.product-table__confirm-button')) {
      this.approveEditProduct(target);

      return;
    }

    if (target.matches('.product-table__edit-button')) {
      this.readyEditProduct(target);

      return;
    }

    if (target.matches('.product-table__delete-button')) {
      this.deleteProduct(target);

      return;
    }
  };
}
