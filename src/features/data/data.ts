import { UniqueIdentifier } from "@dnd-kit/core";
import { createSlice } from "@reduxjs/toolkit";
import { Items } from "../../types/types";
import { createRange } from "../../utils/util";

export type ItemsType = {
  // Dynamic keys with number[] or string[] as values
  [key: string]: UniqueIdentifier[];
};

const itemCount = 3;

export const data = createSlice({
  name: "days",
  initialState: {
    items: {
      A: createRange(itemCount, (index) => index * 1 + 2),
      B: createRange(itemCount, (index) => index * 2 + 5),
      C: createRange(itemCount, (index) => index * 3 + 8),
      // D: createRange(itemCount, (index) => `D${index + 1}`)
    } as ItemsType,
    clonedItems: [] as Items | null[],
    containers: [] as UniqueIdentifier[],
    activeId: null,
    movedToNewContainer: false,
  },
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    },
    setClonedItems: (state, action) => {
      state.clonedItems = action.payload;
    },
    setContainers: (state, action) => {
      state.containers = action.payload;
    },
    setActiveId: (state, action) => {
      state.activeId = action.payload;
    },

    // TODO: Fix handleRemove logic
    handleRemove: (state, action) => {
      setContainers(state.containers.filter((id) => id !== action.payload));
    },
    handleAddColumn: (state) => {
      const newContainerId = getNextContainerId(state.items); // Use helper function to get next ID

      state.containers.push(newContainerId); // Append new container ID
      state.items[newContainerId] = []; // Add empty array for the new container
    },
  },
});

// Helper function to get the next container ID
export const getNextContainerId = (items: ItemsType): string => {
  const containerIds = Object.keys(items);
  const lastContainerId = containerIds[containerIds.length - 1];
  const nextContainerId = String.fromCharCode(lastContainerId.charCodeAt(0) + 1); // Increment char

  return nextContainerId;
};

// Action creators are generated for each case reducer function
export const {
  setItems,
  setClonedItems,
  setActiveId,
  setContainers,
  handleRemove,
  handleAddColumn,
} = data.actions;

export default data.reducer;
