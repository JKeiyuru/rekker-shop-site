// client/src/store/store.js
// Redux store configuration

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products-slice";
import adminOrderSlice from "./admin/order-slice";
import adminDeliverySlice from "./admin/delivery-slice";

import shopProductsSlice from "./shop/products-slice";
import shopCartSlice from "./shop/cart-slice";
import shopAddressSlice from "./shop/address-slice";
import shopOrderSlice from "./shop/order-slice";
import shopSearchSlice from "./shop/search-slice";
import shopReviewSlice from "./shop/review-slice";
import shopDeliverySlice from "./shop/delivery-slice";
import commonFeatureSlice from "./common-slice";
import wishlistReducer from "./shop/wishlist-slice";
import brandsReducer from "./brands-slice";
import categoriesReducer from "./categories-slice";
import promotionsReducer from "./promotions-slice";
import bundlesReducer from "./bundles-slice";
import articlesReducer from "./articles-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsSlice,
    adminOrder: adminOrderSlice,
    adminDelivery: adminDeliverySlice,
    shopProducts: shopProductsSlice,
    shopCart: shopCartSlice,
    shopAddress: shopAddressSlice,
    shopOrder: shopOrderSlice,
    shopSearch: shopSearchSlice,
    shopReview: shopReviewSlice,
    shopDelivery: shopDeliverySlice,
    shopWishlist: wishlistReducer,
    commonFeature: commonFeatureSlice,
    brands: brandsReducer,
    categories: categoriesReducer,
    promotions: promotionsReducer,
    bundles: bundlesReducer,
    articles: articlesReducer,
  },
});

export default store;