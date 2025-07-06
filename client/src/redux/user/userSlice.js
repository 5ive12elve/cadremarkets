import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  token: null,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
    },
    signInSuccess: (state, action) => {
      console.log('=== REDUX SIGNIN SUCCESS ===');
      console.log('Action payload:', action.payload);
      console.log('Token in payload:', !!action.payload.token);
      console.log('Token length:', action.payload.token ? action.payload.token.length : 0);
      
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
      
      if (typeof window !== 'undefined' && action.payload.token) {
        console.log('Storing token in localStorage from Redux');
        localStorage.setItem('auth_token', action.payload.token);
        
        // Verify storage
        const storedToken = localStorage.getItem('auth_token');
        console.log('Token stored successfully:', !!storedToken);
        console.log('Stored token length:', storedToken ? storedToken.length : 0);
        console.log('Tokens match:', storedToken === action.payload.token);
      }
    },
    signInFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateUserStart: (state) => {
      state.loading = true;
    },
    updateUserSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    deleteUserStart: (state) => {
      state.loading = true;
    },
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    },
    deleteUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    signOutUserStart: (state) => {
      state.loading = true;
    },
    signOutUserSuccess: (state) => {
      state.currentUser = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    },
    signOutUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    restoreToken: (state, action) => {
      console.log('=== REDUX RESTORE TOKEN ===');
      console.log('Token to restore:', !!action.payload);
      console.log('Token length:', action.payload ? action.payload.length : 0);
      state.token = action.payload;
    },
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateUserFailure,
  updateUserSuccess,
  updateUserStart,
  deleteUserFailure,
  deleteUserSuccess,
  deleteUserStart,
  signOutUserFailure,
  signOutUserSuccess,
  signOutUserStart,
  restoreToken,
} = userSlice.actions;

export default userSlice.reducer;
