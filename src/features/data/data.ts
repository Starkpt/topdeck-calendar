import { createSlice } from "@reduxjs/toolkit";
import { createRange } from "../../utils/util";

const itemCount = 3;

export const data = createSlice({
  name: "days",
  initialState: {
    items: {
      A: createRange(itemCount, (index) => index * 1 + 2),
      B: createRange(itemCount, (index) => index * 2 + 5),
      C: createRange(itemCount, (index) => index * 3 + 8),
      // D: createRange(itemCount, (index) => `D${index + 1}`)
    },
  },
  reducers: {},
});

// Action creators are generated for each case reducer function
// export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default data.reducer;
