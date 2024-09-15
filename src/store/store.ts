import { configureStore } from "@reduxjs/toolkit";
import data from "../features/data/data";

const store = configureStore({
  reducer: {
    data: data,
  },
});

// Correctly define RootState based on the Redux store
export type RootState = ReturnType<typeof store.getState>;

export default store;
