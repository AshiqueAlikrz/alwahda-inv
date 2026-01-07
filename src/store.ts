import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../src/store/reportSlice';
import { setupListeners } from '@reduxjs/toolkit/query';
import { companyApiSlice } from './store/companySlice';
import { authApiSlice } from './store/authSlice';
import userSlice from './store/state/userState';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [companyApiSlice.reducerPath]: companyApiSlice.reducer,
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    userState: userSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      companyApiSlice.middleware,
      authApiSlice.middleware,
    ),
});

setupListeners(store.dispatch);
