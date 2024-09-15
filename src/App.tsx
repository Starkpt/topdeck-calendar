import {
  closestCenter,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
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
import { createPortal, unstable_batchedUpdates } from "react-dom";

import { DroppableContainer, SortableItem, Trash } from "./components";
import { decrement, increment } from "./features/counter/counterSlice";

import {
  dropAnimation,
  findContainer,
  getIndex,
  coordinateGetter as multipleContainersCoordinateGetter,
} from "./utils/util";

import { useDispatch, useSelector } from "react-redux";
import { renderContainerDragOverlay } from "./components/Container/utils";
import { renderSortableItemDragOverlay } from "./components/SortableItem/utils";
import {
  getNextContainerId,
  handleAddColumn as handleStoreAddColumn,
  handleRemove as handleStoreRemove,
  setActiveId as setStoreActiveId,
  setClonedItems as setStoreClonedItems,
  setContainers as setStoreContainers,
  setItems as setStoreItems,
} from "./features/data/data";
import { Props } from "./types/types";

const TRASH_ID = "void";
const PLACEHOLDER_ID = "placeholder";
const empty: UniqueIdentifier[] = [];

export default function MultipleContainers({
  adjustScale = false,
  cancelDrop,
  columns,
  handle = false,
  // items: initialItems,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
  scrollable,
}: Props) {
  const data = useSelector((state) => state?.data);
  const count = useSelector((state) => state?.counter?.value);
  const storeItems = useSelector((state) => state?.data?.items);
  // const storeClonedItems = useSelector((state) => state?.data?.clonedItems);
  const dispatch = useDispatch();

  // console.log({ storeItems, storeClonedItems });

  // const [items, setItems] = useState<Items>(() => storeItems);
  // const [containers, setContainers] = useState(Object.keys(data.items) as UniqueIdentifier[]);
  // const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = data.activeId ? data.containers.includes(data.activeId) : false;

  useMemo(() => {
    console.log({ containers: data.containers, cont: data.containers });
  }, [data]);

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
                // console.log({
                //   containerItems,
                //   id: container.id,
                // });
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
  // const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const onDragStart = ({ active }: DragStartEvent) => {
    // setActiveId(active.id);
    // setClonedItems(items);
    dispatch(setStoreActiveId(active.id));
    dispatch(setStoreClonedItems(data.items));
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id;

    // console.log(over);

    if (overId == null || overId === TRASH_ID || active.id in data.items) {
      return;
    }

    const overContainer = findContainer(overId, data.items);
    const activeContainer = findContainer(active.id, data.items);

    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      // setItems((items) => {
      //   const activeItems = items[activeContainer];
      //   const overItems = items[overContainer];
      //   const overIndex = overItems.indexOf(overId);
      //   const activeIndex = activeItems.indexOf(active.id);
      //   let newIndex: number;
      //   if (overId in items) {
      //     newIndex = overItems.length + 1;
      //   } else {
      //     const isBelowOverItem =
      //       over &&
      //       active.rect.current.translated &&
      //       active.rect.current.translated.top > over.rect.top + over.rect.height;
      //     const modifier = isBelowOverItem ? 1 : 0;
      //     newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      //   }
      //   recentlyMovedToNewContainer.current = true;
      //   return {
      //     ...items,
      //     [activeContainer]: data.items[activeContainer].filter((item: unknown) => item !== active.id),
      //     [overContainer]: [
      //       ...items[overContainer].slice(0, newIndex),
      //       items[activeContainer][activeIndex],
      //       ...items[overContainer].slice(newIndex, items[overContainer].length),
      //     ],
      //   };
      // });
    }
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id in data.items && over?.id) {
      // setContainers((containers) => {
      //   const activeIndex = containers.indexOf(active.id);
      //   const overIndex = containers.indexOf(over.id);
      //   return arrayMove(containers, activeIndex, overIndex);
      // });
    }

    const activeContainer = findContainer(active.id, data.items);

    if (!activeContainer) {
      dispatch(setStoreActiveId(null));
      // setActiveId(null);
      return;
    }

    const overId = over?.id;

    if (overId == null) {
      dispatch(setStoreActiveId(null));
      // setActiveId(null);
      return;
    }

    if (overId === TRASH_ID) {
      // setItems((items) => ({
      //   ...items,
      //   [activeContainer]: items[activeContainer].filter((id) => id !== data.activeId),
      // }));
      dispatch(
        setStoreItems({
          ...data.items,
          [activeContainer]: data.items[activeContainer].filter(
            (id: string) => id !== data.activeId
          ),
        })
      );
      dispatch(setStoreActiveId(null));
      // setActiveId(null);
      return;
    }

    if (overId === PLACEHOLDER_ID) {
      const newContainerId = getNextContainerId(storeItems);

      unstable_batchedUpdates(() => {
        dispatch(setStoreContainers([...data.containers, newContainerId]));
        dispatch(
          setStoreItems({
            ...storeItems,
            [activeContainer]: storeItems[activeContainer].filter(
              (id: string) => id !== data.activeId
            ),
            [newContainerId]: [active.id],
          })
        );
        dispatch(setStoreActiveId(null));
        // setStoreItems((items) => ({
        //   ...items,
        //   [activeContainer]: items[activeContainer].filter((id) => id !== activeId),
        //   [newContainerId]: [active.id],
        // }));
      });
      return;
    }

    const overContainer = findContainer(overId, data.items);

    if (overContainer) {
      const activeIndex = data.items[activeContainer].indexOf(active.id);
      const overIndex = data.items[overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        // setItems((items) => ({
        //   ...items,
        //   [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex),
        // }));
      }
    }

    // setActiveId(null);
    dispatch(setStoreActiveId(null));
  };

  const onDragCancel = () => {
    if (data.clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      // setItems(clonedItems);
      // setClonedItems(clonedItems);
      dispatch(setStoreClonedItems(data.clonedItems));
    }

    // setActiveId(null);
    dispatch(setStoreActiveId(null));
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [data]);
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
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      cancelDrop={cancelDrop}
      onDragCancel={onDragCancel}
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
        <div>
          <div>
            <button aria-label="Increment value" onClick={() => dispatch(increment())}>
              Increment
            </button>
            <span>{count}</span>
            <button aria-label="Decrement value" onClick={() => dispatch(decrement())}>
              Decrement
            </button>
          </div>
        </div>
        <SortableContext
          items={[...data.containers, PLACEHOLDER_ID]}
          strategy={vertical ? verticalListSortingStrategy : horizontalListSortingStrategy}
        >
          {data.containers.map((containerId) => {
            const test = data.items[containerId];

            return (
              <DroppableContainer
                key={containerId}
                id={containerId}
                // label={minimal ? undefined : `Column ${containerId}`}
                columns={columns}
                items={data.items[containerId]}
                scrollable={scrollable}
                style={containerStyle}
                unstyled={minimal}
                onRemove={() => {
                  // handleRemove(containerId);
                  handleStoreRemove(containerId);
                }}
                // disabled
              >
                <SortableContext items={data.items[containerId]} strategy={strategy}>
                  {test?.length ? (
                    test.map((value, index) => {
                      return (
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
                          getIndex={getIndex}
                          items={data.items}
                        />
                      );
                    })
                  ) : (
                    <div>
                      <p>Nothing to see</p>
                    </div>
                  )}
                </SortableContext>
              </DroppableContainer>
            );
          })}
          {minimal ? undefined : (
            <DroppableContainer
              id={PLACEHOLDER_ID}
              disabled={isSortingContainer}
              items={empty}
              onClick={() => dispatch(handleStoreAddColumn())}
              placeholder
            >
              + Add column
            </DroppableContainer>
          )}
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {data.activeId
            ? data.containers.includes(data.activeId)
              ? renderContainerDragOverlay({
                  containerId: data.activeId,
                  items: data.items,
                  columns,
                  handle,
                })
              : renderSortableItemDragOverlay({ id: data.activeId, items: data.items, handle })
            : null}
        </DragOverlay>,
        document.body
      )}
      {trashable && data.activeId && !data.containers.includes(data.activeId) ? (
        <Trash id={TRASH_ID} />
      ) : null}
    </DndContext>
  );
}
