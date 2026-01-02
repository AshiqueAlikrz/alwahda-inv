import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


const environment = import.meta.env;

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: environment.VITE_DOMAIN_URL,
  }),
  tagTypes: ['Invoices', 'Service', 'userItems'],
  endpoints: (builder) => ({
    getUsers: builder.query<any, void>({
      query: () => '/reports/getInvoice',
      providesTags: ['Invoices'],
    }),
    getUsersById: builder.query<any, string | undefined>({
      query: (id) => `/reports/items/${id}`,
      providesTags: ['userItems'],
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
    createService: builder.mutation<any, Omit<any, 'id'>>({
      query: (body) => ({
        url: '/reports/createService',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Service'],
    }),
    getDailyReports: builder.query<any, void>({
      query: () => `/reports/dailyreports`,
      providesTags: ['Invoices'],
    }),
    getMonthlyReports: builder.query<any, void>({
      query: () => `/reports/monthlyreports`,
      providesTags: ['Invoices'],
    }),
    getAllservices: builder.query<any, void>({
      query: () => `/reports/getService`,
      providesTags: ['Service'],
    }),
    getDashboardReport: builder.query<any, void>({
      query: () => `/reports/dashboardreports`,
    }),
    getAllService: builder.query<any, void>({
      query: () => `/reports/getService`,
      providesTags: ['Service'],
    }),
    updateItem: builder.mutation<
      any,
      { id: string; editId: string; body: any }
    >({
      query: ({ id, editId, body }) => ({
        url: `/reports/editinvoice/${id}/item/${editId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['userItems'],
    }),
    updateInvoice: builder.mutation<any, { invoiceId: string; body: any }>({
      query: ({ invoiceId, body }) => ({
        url: `/reports/editinvoice/${invoiceId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Invoices'],
    }),
    updateService: builder.mutation<any, { serviceId: string; body: any }>({
      query: ({ serviceId, body }) => ({
        url: `/reports/editservice/${serviceId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Service'],
    }),
    deleteService: builder.mutation<any, { serviceId: string }>({
      query: ({ serviceId }) => ({
        url: `/reports/deleteservice/${serviceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
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
  useGetAllservicesQuery,
  useUpdateItemMutation,
  useGetDashboardReportQuery,
  useGetAllServiceQuery,
  useCreateServiceMutation,
  useUpdateInvoiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = apiSlice;

// export const { setReportData } = todosSlice.actions;

// export default todosSlice.reducer;
