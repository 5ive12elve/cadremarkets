import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_MESSAGE = 'FREE SHIPPING ON ORDERS ABOVE 1500 EGP';

const initialState = {
  message: DEFAULT_MESSAGE
};

const bannerSlice = createSlice({
  name: 'banner',
  initialState,
  reducers: {
    setBannerMessage: (state, action) => {
      state.message = action.payload;
    },
    resetBannerMessage: (state) => {
      state.message = DEFAULT_MESSAGE;
    }
  }
});

export const { setBannerMessage, resetBannerMessage } = bannerSlice.actions;
export default bannerSlice.reducer; 