import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../baseQuery';

const environment = import.meta.env;

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'Invoices',
    'Service',
    'userItems',
    'Customer',
    'Quotations',
    'QuotationTerms',
    'Proforma',
    'CvTemplates',
  ],
  endpoints: (builder) => ({
    getUsers: builder.query<any, void>({
      query: () => '/reports/getInvoice',
      providesTags: ['Invoices'],
    }),
    getUsersById: builder.query<any, string | undefined>({
      query: (id) => `/reports/items/${id}`,
      providesTags: ['userItems'],
    }),
    createQuotation: builder.mutation<
      any,
      {
        client: string;
        date: string;
        quoteNo?: string;
        items: { description: string; qty: number; price: number }[];
        terms: string[];
      }
    >({
      query: (body) => ({
        url: '/reports/createquotation',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Quotations'],
    }),
    getQuotationTerms: builder.query<{ data: string[] }, void>({
      query: () => '/reports/quotationterms',
      providesTags: ['QuotationTerms'],
    }),
    addQuotationTerm: builder.mutation<{ data: string[] }, { term: string }>({
      query: (body) => ({
        url: '/reports/quotationterms',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QuotationTerms'],
    }),
    deleteQuotationTerm: builder.mutation<{ data: string[] }, { term: string }>(
      {
        query: (body) => ({
          url: '/reports/quotationterms',
          method: 'DELETE',
          body,
        }),
        invalidatesTags: ['QuotationTerms'],
      },
    ),
    getQuotations: builder.query<any, void>({
      query: () => '/reports/quotations',
      providesTags: ['Quotations'],
    }),
    getQuotationById: builder.query<any, string | undefined>({
      query: (id) => `/reports/quotation/${id}`,
      providesTags: ['Quotations'],
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
      invalidatesTags: ['Invoices', 'Customer'],
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
      providesTags: ['Invoices'],
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
      invalidatesTags: ['userItems', 'Invoices'],
    }),
    updateInvoice: builder.mutation<any, { invoiceId: string; body: any }>({
      query: ({ invoiceId, body }) => ({
        url: `/reports/editinvoice/${invoiceId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Invoices'],
    }),
    deleteInvoice: builder.mutation<any, string>({
      query: (invoiceId) => ({
        url: `/reports/invoice/${invoiceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Invoices'],
    }),
    getProformas: builder.query<any, void>({
      query: () => '/reports/proformas',
      providesTags: ['Proforma'],
    }),
    getProformaById: builder.query<any, string | undefined>({
      query: (id) => `/reports/proformas/${id}`,
      providesTags: ['Proforma'],
    }),
    createProforma: builder.mutation<any, Omit<any, 'id'>>({
      query: (body) => ({
        url: '/reports/proformas',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Proforma'],
    }),
    convertProforma: builder.mutation<
      any,
      { proformaId: string; date: string }
    >({
      query: ({ proformaId, date }) => ({
        url: `/reports/proformas/${proformaId}/convert`,
        method: 'POST',
        body: { date },
      }),
      invalidatesTags: ['Proforma', 'Invoices', 'Customer'],
    }),
    getAllCustomers: builder.query<any, void>({
      query: () => '/reports/customers',
      providesTags: ['Customer'],
    }),
    createCustomer: builder.mutation<any, Omit<any, 'id'>>({
      query: (body) => ({
        url: '/reports/customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Customer'],
    }),
    sendInvoiceEmail: builder.mutation<
      any,
      { invoiceId: string; email: string; pdfBase64: string }
    >({
      query: ({ invoiceId, ...body }) => ({
        url: `/reports/invoice/${invoiceId}/send-email`,
        method: 'POST',
        body,
      }),
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
    getCvTemplates: builder.query<any, void>({
      query: () => '/reports/cvtemplates',
      providesTags: ['CvTemplates'],
    }),
    createCvTemplate: builder.mutation<any, any>({
      query: (body) => ({
        url: '/reports/cvtemplates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CvTemplates'],
    }),
    updateCvTemplate: builder.mutation<any, { templateId: string; body: any }>({
      query: ({ templateId, body }) => ({
        url: `/reports/cvtemplates/${templateId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['CvTemplates'],
    }),
    deleteCvTemplate: builder.mutation<any, { templateId: string }>({
      query: ({ templateId }) => ({
        url: `/reports/cvtemplates/${templateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CvTemplates'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUsersByIdQuery,
  useGetInvoiceByIdQuery,
  useCreateQuotationMutation,
  useGetQuotationsQuery,
  useGetQuotationTermsQuery,
  useAddQuotationTermMutation,
  useDeleteQuotationTermMutation,
  useGetQuotationByIdQuery,
  useCreateInvoiceMutation,
  useGetDailyReportsQuery,
  useLazyGetDailyReportsQuery,
  useGetMonthlyReportsQuery,
  useGetAllservicesQuery,
  useUpdateItemMutation,
  useGetDashboardReportQuery,
  useGetAllServiceQuery,
  useCreateServiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useUpdateServiceMutation,
  useSendInvoiceEmailMutation,
  useGetAllCustomersQuery,
  useGetProformasQuery,
  useGetProformaByIdQuery,
  useCreateProformaMutation,
  useConvertProformaMutation,
  useCreateCustomerMutation,
  useDeleteServiceMutation,
  useGetCvTemplatesQuery,
  useCreateCvTemplateMutation,
  useUpdateCvTemplateMutation,
  useDeleteCvTemplateMutation,
} = apiSlice;

// export const { setReportData } = todosSlice.actions;

// export default todosSlice.reducer;
