import {
  closestCenter,
  CollisionDetection,
  DndContext,
  DragOverEvent,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";

import { DroppableContainer, SortableItem, Trash } from "./components";
import { renderContainerDragOverlay } from "./components/Container/utils";
import { renderSortableItemDragOverlay } from "./components/SortableItem/utils";
import { onDragCancel, onDragEnd, onDragOver, onDragStart } from "./components/utils";
import { handleAddColumn, handleRemove, setContainers } from "./features/data/data";

import { RootState } from "./store/store";

import { Props } from "./types/types";
import {
  dropAnimation,
  coordinateGetter as multipleContainersCoordinateGetter,
} from "./utils/util";

const TRASH_ID = "void";
const PLACEHOLDER_ID = "placeholder";

export default function MultipleContainers({
  adjustScale = false,
  cancelDrop,
  columns,
  handle = false,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  trashable = true,
  vertical = false,
  scrollable,
}: Props) {
  const data = useSelector((state: RootState) => state.data, shallowEqual);
  const dispatch = useDispatch<Dispatch>();

  const initialized = useRef(false);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = data.activeId ? data.containers.includes(data.activeId) : false;

  // Set up initial containers
  useEffect(() => {
    if (!initialized.current) {
      dispatch(setContainers(Object.keys(data.items)));
      initialized.current = true;
    }
  }, [data.items, dispatch]);

  // Reset recentlyMovedToNewContainer ref
  useEffect(() => {
    recentlyMovedToNewContainer.current = false;
  }, [data.activeId]);

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (data.activeId && data.activeId in data.items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in data.items
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

        if (overId in data.items) {
          const containerItems = data.items[overId];

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
        lastOverId.current = data.activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [data]
  );

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter })
  );

  const dragOverlayContent = useMemo(() => {
    if (!data.activeId) return null;

    return data.containers.includes(data.activeId)
      ? renderContainerDragOverlay({
          containerId: data.activeId,
          items: data.items,
          columns,
          handle,
        })
      : renderSortableItemDragOverlay({ id: data.activeId, items: data.items, handle });
  }, [data.activeId, data.containers, data.items, columns, handle]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={onDragStart}
      onDragOver={(event: DragOverEvent) => onDragOver(event, recentlyMovedToNewContainer)}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      cancelDrop={cancelDrop}
      modifiers={modifiers}
    >
      <div
        style={{
          display: "inline-grid",
          boxSizing: "border-box",
          padding: 20,
          gridAutoFlow: vertical ? "row" : "column",
        }}
      >
        <SortableContext
          items={data.containers.filter((containerId) => containerId !== PLACEHOLDER_ID)} // Exclude PLACEHOLDER_ID
          strategy={vertical ? verticalListSortingStrategy : horizontalListSortingStrategy}
        >
          {data.containers.map((containerId) => {
            if (containerId === PLACEHOLDER_ID) {
              return null; // Skip rendering as a sortable container
            }

            return (
              <DroppableContainer
                key={containerId}
                id={containerId}
                label={minimal ? undefined : `Column ${containerId}`}
                columns={columns}
                items={data.items[containerId]}
                scrollable={scrollable}
                style={containerStyle}
                unstyled={minimal}
                //TODO: onRemove={() => dispatch(handleRemove(containerId))}
              >
                <SortableContext items={data.items[containerId]} strategy={strategy}>
                  {data.items[containerId]?.length ? (
                    data.items[containerId]?.map((value, index) => (
                      <SortableItem
                        disabled={isSortingContainer}
                        key={value}
                        id={value}
                        index={index}
                        handle={handle}
                        style={getItemStyles}
                        wrapperStyle={wrapperStyle}
                        renderItem={renderItem}
                        containerId={containerId}
                        getIndex={() => index}
                        items={data.items}
                      />
                    ))
                  ) : (
                    <div>
                      <p>Nothing to see</p>
                    </div>
                  )}
                </SortableContext>
              </DroppableContainer>
            );
          })}
          <DroppableContainer
            id={PLACEHOLDER_ID}
            disabled={isSortingContainer}
            items={[]} // No items, this is just a placeholder
            onClick={() => dispatch(handleAddColumn())}
            placeholder
          >
            + Add column
          </DroppableContainer>
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {dragOverlayContent}
        </DragOverlay>,
        document.body
      )}

      {trashable && data.activeId && !data?.containers.includes(data.activeId) ? (
        <Trash id={TRASH_ID} />
      ) : null}
    </DndContext>
  );
}
