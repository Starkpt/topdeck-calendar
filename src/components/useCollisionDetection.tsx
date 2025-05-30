import {
  closestCenter,
  CollisionDetection,
  DroppableContainer,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { MutableRefObject, useCallback } from "react";
import store from "../store/store";

const TRASH_ID = "void";

/**
 * Custom collision detection strategy optimized for multiple scheduledEvents
 *
 * - First, find any droppable scheduledEvents intersecting with the pointer.
 * - If there are none, find intersecting scheduledEvents with the active draggable.
 * - If there are no intersecting scheduledEvents, return the last matched intersection
 *
 */
export default function useCollisionDetection(
  recentlyMovedToNewContainer: MutableRefObject<boolean>,
  lastOverId: MutableRefObject<UniqueIdentifier | null>
) {
  const { activeId, items } = store.getState().data;

  return useCallback(
    (args: Parameters<CollisionDetection>[0]) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container: DroppableContainer) => container.id in items
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        if (overId === TRASH_ID) {
          // If the intersecting droppable is the trash, return early
          // Remove this if you're not using trashable functionality in your app
          return intersections;
        }

        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter((container) => {
                return container.id !== overId && containerItems.includes(container.id);
              }),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items, lastOverId, recentlyMovedToNewContainer]
  );
}
