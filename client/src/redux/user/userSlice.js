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
        console.log('Storing token in multiple locations from Redux');
        
        // Store in localStorage (primary)
        localStorage.setItem('auth_token', action.payload.token);
        console.log('✓ Token stored in localStorage');
        
        // Store in sessionStorage (backup)
        sessionStorage.setItem('auth_token', action.payload.token);
        console.log('✓ Token stored in sessionStorage');
        
        // Store in user object (legacy support)
        const userWithToken = { ...action.payload.user, token: action.payload.token };
        localStorage.setItem('user', JSON.stringify(userWithToken));
        console.log('✓ Token stored in user object');
        
        // Verify storage
        const storedToken = localStorage.getItem('auth_token');
        const sessionToken = sessionStorage.getItem('auth_token');
        const userToken = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        console.log('=== REDUX STORAGE VERIFICATION ===');
        console.log('localStorage token stored:', !!storedToken);
        console.log('sessionStorage token stored:', !!sessionToken);
        console.log('user object token stored:', !!userToken);
        console.log('All tokens match:', storedToken === sessionToken && sessionToken === userToken);
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
        localStorage.removeItem('user');
        sessionStorage.removeItem('auth_token');
        console.log('All auth data cleared from storage');
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
