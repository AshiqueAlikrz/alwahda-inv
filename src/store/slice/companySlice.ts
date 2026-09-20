import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const environment = import.meta.env;

export interface CreateCompanyBody {
  companyName: string;
  businessType: string;
  phoneNumber?: string;
  purchaseDate?: string;
  expiryDate?: string;
}

export const companyApiSlice = createApi({
  reducerPath: 'companyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: environment.VITE_DOMAIN_URL,
    // prepareHeaders: (headers) => {
    //   const token = localStorage.getItem('token');
    //   if (token) {
    //     headers.set('Authorization', `Bearer ${token}`);
    //   }
    //   return headers;
    // },
  }),
  tagTypes: ['Company'],
  endpoints: (builder) => ({
    getAllCompanies: builder.query<any, void>({
      query: () => ({
        url: '/auth/allcompany',
      }),
      providesTags: ['Company'],
    }),
    createCompany: builder.mutation<any, CreateCompanyBody>({
      query: (body) => ({
        url: '/auth/company',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Company'],
    }),
  }),
});

export const { useGetAllCompaniesQuery, useCreateCompanyMutation } =
  companyApiSlice;
