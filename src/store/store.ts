import { configureStore } from "@reduxjs/toolkit";
import counterSlice from "../features/counter/counterSlice";
import data from "../features/data/data";

export default configureStore({
  reducer: {
    counter: counterSlice,
    data: data,
  },
});
