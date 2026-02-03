import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slice/reportSlice';
import { setupListeners } from '@reduxjs/toolkit/query';
import { companyApiSlice } from './slice/companySlice';
import { authApiSlice } from './slice/authSlice';
import userSlice from './state/userState';

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
