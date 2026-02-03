import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const environment = import.meta.env;

export const authApiSlice = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: environment.VITE_DOMAIN_URL,
  }),
  endpoints: (builder) => ({
    signup: builder.mutation<
      any,
      {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
        companyId?: string;
      }
    >({
      query: (body) => ({
        url: '/auth/signup',
        method: 'POST',
        body,
      }),
    }),
    signIn: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({
        url: '/auth/signin',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSignupMutation, useSignInMutation } = authApiSlice;
