import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { logout } from './state/userState';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_DOMAIN_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryWithAuth = async (
  args: any,
  api: any,
  extraOptions: any,
) => {

  const result = await rawBaseQuery(args, api, extraOptions);
  const status = result?.error?.status;


  if (status === 401) {
    localStorage.removeItem('token');
    // optional: api.dispatch(logout());
    window.location.href = '/auth/signin';
  }

  if (status === 403) {
    window.location.href = '/auth/signin';
  }

  return result;
};
