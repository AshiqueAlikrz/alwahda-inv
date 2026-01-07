import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Company {
  _id: string;
  companyName: string;
  businessType: string;
  purchaseDate: string;
  phoneNumber: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  company: Company;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const userSlice = createSlice({
  name: 'userState',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
    },
    // Clear on logout
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = userSlice.actions;
export default userSlice;
