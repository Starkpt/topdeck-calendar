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
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";

import { Trash } from "./components";
import { renderContainerDragOverlay } from "./components/Container/utils";
import { renderSortableItemDragOverlay } from "./components/DayView/utils";
import { onDragCancel, onDragEnd, onDragOver, onDragStart } from "./components/utils";
import { WeekView } from "./components/WeekView";
import { setContainers } from "./features/data/data";

import { RootState } from "./store/store";

import useCollisionDetection from "./components/useCollisionDetection";
import { Props } from "./types/types";
import {
  dropAnimation,
  coordinateGetter as multipleContainersCoordinateGetter,
} from "./utils/util";

const TRASH_ID = "void";

export default function MultipleContainers({
  adjustScale = false,
  cancelDrop,
  columns,
  handle = false,
  coordinateGetter = multipleContainersCoordinateGetter,
  modifiers,
  trashable = true,
}: Props) {
  const { items, activeId, containers } = useSelector(
    (state: RootState) => state.data,
    shallowEqual
  );
  const dispatch = useDispatch<Dispatch>();

  const initialized = useRef<boolean>(false);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef<boolean>(false);

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
      <WeekView columns={columns} />

      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {dragOverlayContent}
        </DragOverlay>,
        document.body
      )}

      {trashable && activeId && !containers.includes(activeId) && <Trash id={TRASH_ID} />}
    </DndContext>
  );
}
