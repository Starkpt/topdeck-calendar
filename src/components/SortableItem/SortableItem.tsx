import { useSortable } from "@dnd-kit/sortable";
import { Item } from "../Item";
import { useMountStatus } from "../../hooks/customHooks";
import { getColor, getIndex } from "../../utils/util";
import { SortableItemProps } from "./types";

export function SortableItem({
  disabled,
  id,
  index,
  handle,
  renderItem,
  style,
  containerId,
  wrapperStyle,
  items,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef, // This will be used as the ref for the Handle component
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({ id });

  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={disabled ? undefined : setNodeRef} // Set the node reference for the item
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? listeners : undefined} // Pass listeners directly as props
      handleRef={handle ? setActivatorNodeRef : undefined} // Pass the activator ref to the Handle
      index={index}
      wrapperStyle={wrapperStyle({ index })}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id, items) : overIndex,
        containerId,
      })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      renderItem={renderItem}
    />
  );
}
