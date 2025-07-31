import { configureStore } from '@reduxjs/toolkit';
import pollSlice from './pollSlice';

export const store = configureStore({
  reducer: {
    poll: pollSlice,
  },
});

export default store;
