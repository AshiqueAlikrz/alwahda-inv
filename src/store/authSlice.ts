import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const environment = import.meta.env;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: environment.VITE_DOMAIN_URL,
  }),
  endpoints: (builder) => ({
    signup: builder.mutation<
      any,
      { name: string; email: string; password: string; confirmPassword: string }
    >({
      query: (body) => ({
        url: '/auth/signup',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSignupMutation } = authApi;
