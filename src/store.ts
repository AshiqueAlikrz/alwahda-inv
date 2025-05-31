import { configureStore } from '@reduxjs/toolkit';
// import todosReducer from '../features/todos/todosSlice'
import { apiSlice } from '../src/store/reportSlice';
import { setupListeners } from '@reduxjs/toolkit/query';
// import { LocalSlice } from './store/invoiceSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    // [LocalSlice.reducerPath]: LocalSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);
