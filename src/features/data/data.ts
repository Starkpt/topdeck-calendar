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
    clonedItems: [],
    activeId: null,
  },
  reducers: {
    setItems: (state, action) => {
      state.clonedItems = action.payload;
    },
    setClonedItems: (state, action) => {
      state.clonedItems = action.payload;
    },

    setActiveId: (state, action) => {
      state.activeId = action.payload;
    },

    onDragCancel: (state) => {
      if (state.clonedItems) {
        // Reset items to their original state in case items have been
        // Dragged across containers
        setItems(state.clonedItems);
      }

      setActiveId(null);
    },
  },
});

// Action creators are generated for each case reducer function
export const { setItems, setClonedItems, setActiveId } = data.actions;

export default data.reducer;
