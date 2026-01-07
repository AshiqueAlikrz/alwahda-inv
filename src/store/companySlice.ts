import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const environment = import.meta.env;

export const companyApiSlice = createApi({
  reducerPath: 'companyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: environment.VITE_DOMAIN_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token'); 
      if (token) {
        headers.set('Authorization', `Bearer ${token}`); 
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAllCompanies: builder.query<any, void>({
      query: () => ({
        url: '/reports/allcompany',
      }),
    }),
  }),
});

export const { useGetAllCompaniesQuery } = companyApiSlice;
