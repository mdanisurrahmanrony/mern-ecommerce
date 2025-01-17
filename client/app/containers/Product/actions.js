/*
 *
 * Product actions
 *
 */

import { goBack } from 'connected-react-router';
import { success } from 'react-notification-system-redux';
import axios from 'axios';

import {
  FETCH_PRODUCTS,
  FETCH_STORE_PRODUCTS,
  FETCH_PRODUCT,
  FETCH_STORE_PRODUCT,
  PRODUCT_CHANGE,
  PRODUCT_EDIT_CHANGE,
  PRODUCT_SHOP_CHANGE,
  SET_PRODUCT_FORM_ERRORS,
  SET_PRODUCT_FORM_EDIT_ERRORS,
  RESET_PRODUCT,
  ADD_PRODUCT,
  REMOVE_PRODUCT,
  PRODUCT_SELECT,
  FETCH_PRODUCTS_SELECT,
  SET_PRODUCTS_LOADING,
  ADD_REVIEW,
  FETCH_REVIEWS,
  REVIEW_CHANGE,
  RESET_REVIEW,
  SET_REVIEW_FORM_ERRORS
} from './constants';

import { RESET_BRAND } from '../Brand/constants';

import handleError from '../../utils/error';
import { formatSelectOptions } from '../../helpers/select';
import { allFieldsValidation } from '../../utils/validation';

export const productChange = (name, value) => {
  let formData = {};
  formData[name] = value;
  return {
    type: PRODUCT_CHANGE,
    payload: formData
  };
};

export const productEditChange = (name, value) => {
  let formData = {};
  formData[name] = value;

  return {
    type: PRODUCT_EDIT_CHANGE,
    payload: formData
  };
};

export const productShopChange = (name, value) => {
  let formData = {};
  formData[name] = value;

  return {
    type: PRODUCT_SHOP_CHANGE,
    payload: formData
  };
};

export const handleProductSelect = value => {
  return {
    type: PRODUCT_SELECT,
    payload: value
  };
};

// fetch products api
export const fetchProducts = () => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.get(`/api/product`);

      dispatch({
        type: FETCH_PRODUCTS,
        payload: response.data.products
      });
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};

// fetch store products api
export const fetchStoreProducts = () => {
  return async (dispatch, getState) => {
    dispatch({ type: SET_PRODUCTS_LOADING, payload: true });

    try {
      const response = await axios.get(`/api/product/list`);
      dispatch({
        type: FETCH_STORE_PRODUCTS,
        payload: response.data.products
      });
    } catch (error) {
      handleError(error, dispatch);
    } finally {
      dispatch({ type: SET_PRODUCTS_LOADING, payload: false });
    }
  };
};

// fetch product api
export const fetchProduct = id => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.get(`/api/product/${id}`);

      const inventory = response.data.product.quantity;
      const product = { ...response.data.product, inventory };

      dispatch({
        type: FETCH_PRODUCT,
        payload: product
      });
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};

// fetch store product api
export const fetchStoreProduct = slug => {
  return async (dispatch, getState) => {
    dispatch({ type: SET_PRODUCTS_LOADING, payload: true });

    try {
      const response = await axios.get(`/api/product/item/${slug}`);

      const inventory = response.data.product.quantity;
      const product = { ...response.data.product, inventory };

      dispatch({
        type: FETCH_STORE_PRODUCT,
        payload: product
      });
    } catch (error) {
      handleError(error, dispatch);
    } finally {
      dispatch({ type: SET_PRODUCTS_LOADING, payload: false });
    }
  };
};

export const fetchBrandProducts = slug => {
  return async (dispatch, getState) => {
    dispatch({ type: SET_PRODUCTS_LOADING, payload: true });

    try {
      const response = await axios.get(`/api/product/list/brand/${slug}`);

      dispatch({
        type: FETCH_PRODUCTS,
        payload: response.data.products
      });
    } catch (error) {
      handleError(error, dispatch);
    } finally {
      dispatch({ type: SET_PRODUCTS_LOADING, payload: false });
    }
  };
};

export const fetchCategoryProducts = slug => {
  return async (dispatch, getState) => {
    dispatch({ type: SET_PRODUCTS_LOADING, payload: true });

    try {
      const response = await axios.get(`/api/product/list/category/${slug}`);

      dispatch({
        type: FETCH_PRODUCTS,
        payload: response.data.products
      });
    } catch (error) {
      handleError(error, dispatch);
    } finally {
      dispatch({ type: SET_PRODUCTS_LOADING, payload: false });
    }
  };
};

export const fetchProductsSelect = () => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.get(`/api/product/list/select`);

      let formattedProducts = formatSelectOptions(response.data.products, true);

      dispatch({
        type: FETCH_PRODUCTS_SELECT,
        payload: formattedProducts
      });
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};

// add product api
export const addProduct = () => {
  return async (dispatch, getState) => {
    try {
      const rules = {
        sku: 'required|min:6',
        name: 'required|min:1',
        description: 'required|min:1|max:200',
        quantity: 'required|numeric',
        price: 'required|numeric',
        taxable: 'required',
        brand: 'required',
        image: 'required'
      };

      const product = getState().product.productFormData;
      const brand = getState().brand.selectedBrands.value;

      const newProduct = {
        ...product,
        brand: brand
      };

      const { isValid, errors } = allFieldsValidation(newProduct, rules, {
        'required.sku': 'Sku is required.',
        'min.sku': 'Sku must be at least 1 character.',
        'required.name': 'Name is required.',
        'min.name': 'Name must be at least 1 characters.',
        'required.description': 'Description is required.',
        'min.description': 'Description must be at least 1 character.',
        'max.description':
          'Description may not be greater than 200 characters.',
        'required.quantity': 'Quantity is required.',
        'required.price': 'Price is required.',
        'required.taxable': 'Taxable is required.',
        'required.brand': 'Brand is required.',
        'required.image': 'Please upload files with jpg, jpeg, png format.'
      });

      if (!isValid) {
        return dispatch({ type: SET_PRODUCT_FORM_ERRORS, payload: errors });
      }
      const formData = new FormData();
      if (newProduct.image) {
        for (var key in newProduct) {
          if (newProduct.hasOwnProperty(key)) {
            formData.append(key, newProduct[key]);
          }
        }
      }
      const response = await axios.post(`/api/product/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const successfulOptions = {
        title: `${response.data.message}`,
        position: 'tr',
        autoDismiss: 1
      };

      if (response.data.success === true) {
        dispatch(success(successfulOptions));
        dispatch({
          type: ADD_PRODUCT,
          payload: response.data.product
        });
        dispatch({ type: RESET_PRODUCT });
        dispatch({ type: RESET_BRAND });
        dispatch(goBack());
      }
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};

// update Product api
export const updateProduct = () => {
  return async (dispatch, getState) => {
    try {
      const rules = {
        name: 'required|min:1',
        description: 'required|min:1|max:200'
      };

      const product = getState().product.product;

      const newProduct = {
        name: product.name,
        description: product.description
      };

      const { isValid, errors } = allFieldsValidation(newProduct, rules, {
        'required.name': 'Name is required.',
        'min.name': 'Name must be at least 1 character.',
        'required.description': 'Description is required.',
        'min.description': 'Description must be at least 1 character.',
        'max.description': 'Description may not be greater than 200 characters.'
      });

      if (!isValid) {
        return dispatch({
          type: SET_PRODUCT_FORM_EDIT_ERRORS,
          payload: errors
        });
      }

      const response = await axios.put(`/api/product/${product._id}`, {
        product: newProduct
      });

      const successfulOptions = {
        title: `${response.data.message}`,
        position: 'tr',
        autoDismiss: 1
      };

      if (response.data.success === true) {
        dispatch(success(successfulOptions));

        //dispatch(goBack());
      }
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};

// activate product api
export const activateProduct = (id, value) => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.put(`/api/product/${id}/active`, {
        product: {
          isActive: value
        }
      });

      const successfulOptions = {
        title: `${response.data.message}`,
        position: 'tr',
        autoDismiss: 1
      };

      if (response.data.success === true) {
        dispatch(success(successfulOptions));
      }
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};

// delete product api
export const deleteProduct = id => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.delete(`/api/product/delete/${id}`);

      const successfulOptions = {
        title: `${response.data.message}`,
        position: 'tr',
        autoDismiss: 1
      };

      if (response.data.success === true) {
        dispatch(success(successfulOptions));
        dispatch({
          type: REMOVE_PRODUCT,
          payload: id
        });
        dispatch(goBack());
      }
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};


/*
Product Review Actions
*/

export const reviewChange = (name, value) => {
  let formData = {};
  formData[name] = value;
  return {
    type: REVIEW_CHANGE,
    payload: formData
  };
};


export const addReview = (productId) => {
  return async (dispatch, getState) => {
    try {
      const rules = {
        title: 'required|min:6',
        review: 'required|min:1|max:200',
        rating: 'required|numeric',
        isRecommended: 'required'
      };

      const review = getState().product.reviewFormData;

      const newReview = {
        ...review,
        product:productId
      };

      const { isValid, errors } = allFieldsValidation(newReview, rules, {
        'required.title': 'Title is required.',
        'min.title': 'Title must be at least 6 character.',
        'required.review': 'Review is required.',
        'min.review': 'Review must be at least 1 characters.',
        'max.review':'Review may not be greater than 200 characters.',
        'required.rating': 'Rating is required.',
        'required.isRecommended': 'Recommendable is required.'
      });

      if (!isValid) {
        return dispatch({ type: SET_REVIEW_FORM_ERRORS, payload: errors });
      }

      const response = await axios.post(`/api/review/add`, newReview);

      const successfulOptions = {
        title: `${response.data.message}`,
        position: 'tr',
        autoDismiss: 1
      };

      if (response.data.success === true) {
        dispatch(success(successfulOptions));
        dispatch({
          type: ADD_REVIEW,
          payload: response.data.review
        });
        dispatch({ type: RESET_REVIEW });
        dispatch(goBack());
      }
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};


// fetch reviews api
export const fetchReviews = slug => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.get(`/api/review/${slug}`);

      var ratingSummary = [
        {5:0},
        {4:0},
        {3:0},
        {2:0},
        {1:0}
      ];
      var totalRating = 0;
      var totalReview = 0;

      if(response.data.reviews.length > 0){
        response.data.reviews.map((item, i) => {
            totalRating += item.rating;
            totalReview += 1;
            switch (Math.round(item.rating)) {
              case 5:
                  ratingSummary[0][5] += 1
                break;
              case 4:
                  ratingSummary[1][4] += 1
                break;
              case 3:
                  ratingSummary[2][3] += 1
                break;
              case 2:
                  ratingSummary[3][2] += 1
                break;
              case 1:
                  ratingSummary[4][1] += 1
                break;
              default:
                 0
                break;
            }
        });
      }

      dispatch({
        type: FETCH_REVIEWS,
        payload: {
          reviews:response.data.reviews,
          ratingSummary:ratingSummary,
          totalRating:totalRating,
          totalReview:totalReview
        }
      });

    } catch (error) {
      handleError(error, dispatch);
    }
  };
};
