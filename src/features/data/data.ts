import { UniqueIdentifier } from "@dnd-kit/core";
import { createSlice } from "@reduxjs/toolkit";
import { Items } from "../../types/types";
import { createRange, findContainer } from "../../utils/util";
import { arrayMove } from "@dnd-kit/sortable";

const TRASH_ID = "void";
const PLACEHOLDER_ID = "placeholder";
const empty: UniqueIdentifier[] = [];

export type ItemsType = {
  // Dynamic keys with number[] or string[] as values
  [key: string]: number[] | string[];
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
      state.containers = Object.keys(action.payload);
    },
    setActiveId: (state, action) => {
      state.activeId = action.payload;
    },

    onDragStart: (state, action) => {
      setActiveId(action.payload.active.id);
      setClonedItems(state.items);
    },
    onDragOver: (state, action) => {
      const overId = action.payload.over?.id;

      if (overId == null || overId === TRASH_ID || action.payload.active.id in state.items) {
        return;
      }

      const overContainer = findContainer(overId, state.items);
      const activeContainer = findContainer(action.payload.active.id, state.items);

      if (!overContainer || !activeContainer) {
        return;
      }

      if (activeContainer !== overContainer) {
        const activeItems = state.items[activeContainer];
        const overItems = state.items[overContainer];
        const overIndex = overItems.indexOf(overId);
        const activeIndex = activeItems.indexOf(action.payload.active?.id);

        let newIndex: number;
        if (overId in state.items) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            action.payload.over &&
            action.payload.active.rect.current.translated &&
            action.payload.active.rect.current.translated.top >
              action.payload.over.rect.top + action.payload.over.rect.height;
          const modifier = isBelowOverItem ? 1 : 0;
          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        state.movedToNewContainer = true;

        setItems({
          ...state.items,
          [activeContainer]: state.items[activeContainer].filter(
            (item: unknown) => item !== action.payload.active.id
          ),
          [overContainer]: [
            ...state.items[overContainer].slice(0, newIndex),
            state.items[activeContainer][activeIndex],
            ...state.items[overContainer].slice(newIndex, state.items[overContainer].length),
          ],
        });
      }
    },
    onDragEnd: (state, action) => {
      if (action.payload.active.id in state.items && action.payload.over?.id) {
        const activeIndex = state.containers.indexOf(action.payload.active.id);
        const overIndex = state.containers.indexOf(action.payload.over.id);
        const containers = arrayMove(state.containers, activeIndex, overIndex);

        setContainers(containers);
      }

      const activeContainer = findContainer(action.payload.active.id, state.items);

      if (!activeContainer) {
        setActiveId(null);
        return;
      }

      const overId = action.payload.over.id;

      if (overId == null) {
        setActiveId(null);
        return;
      }

      if (overId === TRASH_ID) {
        setItems({
          ...state.items,
          [activeContainer]: state.items[activeContainer].filter((id) => id !== state.activeId),
        });
        setActiveId(null);
        return;
      }

      if (overId === PLACEHOLDER_ID) {
        const newContainerId = getNextContainerId(state.items);

        setContainers([...state.containers, newContainerId]);
        setItems({
          ...state.items,
          [activeContainer]: state.items[activeContainer].filter((id) => id !== state.activeId),
          [newContainerId]: [action.payload.active.id],
        });
        setActiveId(null);
        return;
      }

      const overContainer = findContainer(overId, state.items);

      if (overContainer) {
        const activeIndex = state.items[activeContainer].indexOf(action.payload.active.id);
        const overIndex = state.items[overContainer].indexOf(overId);
        const containers = arrayMove(state.containers[overContainer], activeIndex, overIndex);

        if (activeIndex !== overIndex) {
          setItems({
            ...state.items,
            [overContainer]: containers,
          });
        }
      }

      setActiveId(null);
      return;
    },
    onDragCancel: (state) => {
      if (state.clonedItems) {
        // Reset items to their original state in case items have been
        // Dragged across containers
        setItems(state.clonedItems);
      }

      setActiveId(null);
    },

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
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
  handleRemove,
  handleAddColumn,
} = data.actions;

export default data.reducer;
