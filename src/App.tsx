import {
  CollisionDetection,
  DndContext,
  DragOverEvent,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
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
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";

import { DroppableContainer, SortableItem, Trash } from "./components";
import { renderContainerDragOverlay } from "./components/Container/utils";
import { renderSortableItemDragOverlay } from "./components/SortableItem/utils";
import { onDragCancel, onDragEnd, onDragOver, onDragStart } from "./components/utils";
import { handleAddColumn, handleRemove, setContainers } from "./features/data/data";

import { RootState } from "./store/store";

import useCollisionDetection from "./components/useCollisionDetection";
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
  const { items, activeId, containers } = useSelector(
    (state: RootState) => state.data,
    shallowEqual
  );
  const dispatch = useDispatch<Dispatch>();

  const initialized = useRef<boolean>(false);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef<boolean>(false);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;

  // Set up initial containers
  useEffect(() => {
    if (!initialized.current) {
      dispatch(setContainers(Object.keys(items)));
      initialized.current = true;
    }
  }, [items, dispatch]);

  // Reset recentlyMovedToNewContainer ref
  useEffect(() => {
    recentlyMovedToNewContainer.current = false;
  }, [activeId]);

  const collisionDetectionStrategy: CollisionDetection = useCollisionDetection(
    recentlyMovedToNewContainer,
    lastOverId
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter })
  );

  const dragOverlayContent = useMemo(() => {
    if (!activeId) return null;

    return containers.includes(activeId)
      ? renderContainerDragOverlay({ containerId: activeId, items, columns, handle })
      : renderSortableItemDragOverlay({ id: activeId, items, handle });
  }, [activeId, containers, items, columns, handle]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={onDragStart}
      onDragOver={(event: DragOverEvent) => onDragOver(event, recentlyMovedToNewContainer)}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      cancelDrop={cancelDrop}
      modifiers={modifiers}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
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
          items={containers.filter((containerId) => containerId !== PLACEHOLDER_ID)} // Exclude PLACEHOLDER_ID
          strategy={vertical ? verticalListSortingStrategy : horizontalListSortingStrategy}
        >
          {containers.map((containerId) => {
            if (containerId === PLACEHOLDER_ID) {
              return null; // Skip rendering as a sortable container
            }

            return (
              <DroppableContainer
                key={containerId}
                id={containerId}
                label={minimal ? undefined : `Column ${containerId}`}
                columns={columns}
                items={items[containerId]}
                scrollable={scrollable}
                style={containerStyle}
                unstyled={minimal}
                onRemove={() => dispatch(handleRemove(containerId))}
              >
                <SortableContext items={items[containerId]} strategy={strategy}>
                  {items[containerId]?.length ? (
                    items[containerId]?.map((value, index) => (
                      <SortableItem
                        key={value}
                        id={value}
                        index={index}
                        handle={handle}
                        style={getItemStyles}
                        wrapperStyle={wrapperStyle}
                        renderItem={renderItem}
                        containerId={containerId}
                        items={items}
                        disabled={isSortingContainer}
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

      {trashable && activeId && !containers.includes(activeId) ? <Trash id={TRASH_ID} /> : null}
    </DndContext>
  );
}
