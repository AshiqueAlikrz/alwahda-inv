import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// type InvoiceItem = {
//   id: number;
//   description: string;
//   rate: number;
//   quantity: number;
//   serviceCharge: number;
//   tax: number;
//   total: number;
// };

// interface BillingData {
//   reportData: {
//     name: string;
//     date: string;
//     items: InvoiceItem[];
//     sub_total: number; // matches "sub_total" from backend
//     grand_total: number; // matches "grand_total" from backend
//     discount: number;
//     paid: boolean; // added "paid" field from backend
//   };
// }

// const initialState = {
//   reportData: [],
// };

// const todosSlice = createSlice({
//   name: 'report',
//   initialState,
//   reducers: {
//     setReportData: (state: any, action: PayloadAction<any>) => {
//       state.reportData = action.payload;
//       //   state(...payload);
//     },
//     //     todoAdded(state, action) {
//     //       state.push({
//     //         id: action.payload.id,
//     //         text: action.payload.text,
//     //         completed: false,
//     //       })
//     //     },
//     //     todoToggled(state, action) {
//     //       const todo = state.find((todo) => todo.id === action.payload)
//     //       todo.completed = !todo.completed
//     //     },
//   },
// });

const environment = import.meta.env;

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: environment.VITE_DOMAIN_URL,
  }),
  tagTypes: ['Invoices'],
  endpoints: (builder) => ({
    getUsers: builder.query<any, void>({
      query: () => '/reports/getInvoice',
      providesTags: ['Invoices'],
    }),
    getUsersById: builder.query<any, string | undefined>({
      query: (id) => `/reports/items/${id}`,
    }),
    getInvoiceById: builder.query<void, string | undefined>({
      query: (id) => `/reports/invoice/${id}`,
      providesTags: ['Invoices'],
    }),
    createInvoice: builder.mutation<any, Omit<any, 'id'>>({
      query: (body) => ({
        url: '/reports/createInvoice',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Invoices'],
    }),
    getDailyReports: builder.query<any, void>({
      query: () => `/reports/dailyreports`,
      providesTags: ['Invoices'],
    }),
    getMonthlyReports: builder.query<any, void>({
      query: () => `/reports/monthlyreports`,
      providesTags: ['Invoices'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUsersByIdQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useGetDailyReportsQuery,
  useGetMonthlyReportsQuery,
} = apiSlice;

// export const { setReportData } = todosSlice.actions;

// export default todosSlice.reducer;
