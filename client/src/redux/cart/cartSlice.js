import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: []
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      // For clothing items, consider size when checking for existing items
      const isClothing = action.payload.type === 'Clothing & Wearables';
      const existingItem = state.cartItems.find(item => {
        if (isClothing) {
          // For clothing, match both ID and selected size
          return item._id === action.payload._id && item.selectedSize === action.payload.selectedSize;
        } else {
          // For non-clothing, just match ID
          return item._id === action.payload._id;
        }
      });

      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.cartItems.push({
          ...action.payload,
          imageUrls: action.payload.imageUrls || [action.payload.imageUrl],
          quantity: action.payload.quantity || 1
        });
      }
    },
    removeFromCart: (state, action) => {
      // Handle removal by ID and optionally by size for clothing items
      if (typeof action.payload === 'object' && action.payload.itemId) {
        // Remove specific item by ID and size (for clothing)
        const { itemId, selectedSize } = action.payload;
        state.cartItems = state.cartItems.filter(item => {
          if (item.type === 'Clothing & Wearables' && selectedSize) {
            return !(item._id === itemId && item.selectedSize === selectedSize);
          } else {
            return item._id !== itemId;
          }
        });
      } else {
        // Legacy removal by ID only
      state.cartItems = state.cartItems.filter(item => item._id !== action.payload);
      }
    },
    updateCartQuantity: (state, action) => {
      const { itemId, newQuantity, selectedSize } = action.payload;
      const item = state.cartItems.find(item => {
        if (item.type === 'Clothing & Wearables' && selectedSize) {
          return item._id === itemId && item.selectedSize === selectedSize;
        } else {
          return item._id === itemId;
        }
      });
      if (item) {
        item.quantity = newQuantity;
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
    }
  }
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer; 