import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { MutableRefObject } from "react";

import {
  getNextContainerId,
  setActiveId,
  setClonedItems,
  setContainers,
  setItems,
} from "../features/data/data";
import store from "../store/store";
import { findContainer } from "../utils/util";

const TRASH_ID = "void";
const PLACEHOLDER_ID = "placeholder";

export const onDragStart = (event: DragStartEvent) => {
  // Access the store state once for better consistency
  const { items } = store.getState().data;
  const dispatch = store.dispatch;

  // Ensure that event.active.id exists
  if (event.active.id) {
    // Dispatch actions to set active ID and clone the current items
    dispatch(setActiveId(event.active.id));
    dispatch(setClonedItems(items));
  }
};

export const onDragOver = (
  event: DragOverEvent,
  recentlyMovedToNewContainer: MutableRefObject<boolean>
) => {
  // Access the state only once for better consistency
  const { items } = store.getState().data;
  const dispatch = store.dispatch;

  // Get the ID of the container the dragged item is over
  const overId = event.over?.id;

  // Early return if there's no valid overId, or it's the trash, or active item is in the items array
  if (!overId || overId === TRASH_ID || event.active.id in items) {
    return;
  }

  // Find the scheduledEvents for both the active (dragged) item and the item it is currently over
  const overContainer = findContainer(overId, items);
  const activeContainer = findContainer(event.active.id, items);

  // If either container is not found, exit early
  if (!overContainer || !activeContainer) {
    return;
  }

  // If the active item is being dragged over a different container
  if (activeContainer !== overContainer) {
    const activeItems = items[activeContainer];
    const overItems = items[overContainer];

    // Find the index of the active item in its current container
    const activeIndex = activeItems.findIndex((item) => item === event.active.id);
    // Find the index of the over item in its container
    const overIndex = overItems.findIndex((item) => item === overId);

    let newIndex: number;

    // If overId is a container, add the item to the end
    if (overId in items) {
      newIndex = overItems.length + 1;
    } else {
      // Determine if the active item is being dragged below the item it is currently over
      const isBelowOverItem =
        event.over &&
        event.active.rect.current.translated &&
        event.active.rect.current.translated.top > event.over.rect.top + event.over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
    }

    // Flag that the item was recently moved to a new container
    recentlyMovedToNewContainer.current = true;

    // Dispatch the updated items state
    dispatch(
      setItems({
        ...items,
        // Remove the item from the active container
        [activeContainer]: items[activeContainer].filter(
          (item: unknown) => item !== event.active.id
        ),
        // Add the item to the new container at the calculated newIndex
        [overContainer]: [
          ...items[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...items[overContainer].slice(newIndex, items[overContainer].length),
        ],
      })
    );
  }
};

export const onDragEnd = (event: DragEndEvent) => {
  const { items, scheduledEvents, activeId } = store.getState().data;
  const dispatch = store.dispatch;

  // 1. Check if the dragged item is part of the scheduledEvents and if there is a valid drop target
  if (event.active.id in items && event.over?.id) {
    const activeIndex = scheduledEvents.indexOf(event.active.id);
    const overIndex = scheduledEvents.indexOf(event.over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      const newContainers = arrayMove(scheduledEvents, activeIndex, overIndex);
      dispatch(setContainers(newContainers));
    }
  }

  // 2. Find the container where the active item originated
  const activeContainer = findContainer(event.active.id, items);

  if (!activeContainer) {
    dispatch(setActiveId(null)); // If no container found, clear the active ID
    return;
  }

  const overId = event.over?.id;

  // 3. If there's no valid drop target, clear the active ID
  if (!overId) {
    dispatch(setActiveId(null));
    return;
  }

  // 4. If the item is dragged to the trash bin, remove it from the current container
  if (overId === TRASH_ID) {
    dispatch(
      setItems({
        ...items,
        [activeContainer]: items[activeContainer].filter((id) => id !== activeId),
      })
    );
    dispatch(setActiveId(null));
    return;
  }

  // 5. If the item is dropped in a placeholder, create a new container and move the item there
  if (overId === PLACEHOLDER_ID) {
    const newContainerId = getNextContainerId(items);

    dispatch(setContainers([...scheduledEvents, newContainerId]));
    dispatch(
      setItems({
        ...items,
        [activeContainer]: items[activeContainer].filter((id) => id !== activeId),
        [newContainerId]: [event.active.id], // Add the active item to the new container
      })
    );
    dispatch(setActiveId(null));
    return;
  }

  // 6. Find the container where the item was dropped
  const overContainer = findContainer(overId, items);

  if (overContainer) {
    const activeIndex = items[activeContainer].findIndex((item) => item === event.active.id);
    const overIndex = items[overContainer].findIndex((item) => item === overId);

    // Ensure the active and over indices are valid and not the same
    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      // Move the item in the target container
      const updatedItems = arrayMove(items[overContainer], activeIndex, overIndex);

      dispatch(
        setItems({
          ...items,
          [overContainer]: updatedItems,
        })
      );
    }
  }

  // 7. Clear the active ID after the drag operation is done
  dispatch(setActiveId(null));
};

export const onDragCancel = () => {
  // Access the state only once for better consistency
  const { clonedItems } = store.getState().data;
  const dispatch = store.dispatch;

  // Early return if clonedItems is falsy
  if (!clonedItems) {
    dispatch(setActiveId(null));
    return;
  }

  // Reset items to their original state using clonedItems
  dispatch(setItems(clonedItems));

  // Clear the active ID
  dispatch(setActiveId(null));
};
