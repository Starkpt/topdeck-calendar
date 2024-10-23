import { UniqueIdentifier } from "@dnd-kit/core";
import { Items } from "../../types/types";
import { findContainer, getColor, getIndex } from "../../utils/util";
import { Item } from "../Item";

export function renderSortableItemDragOverlay({
  id,
  items,
  handle = false,
  getItemStyles = () => ({}),
}: {
  id: UniqueIdentifier;
  items: Items;
  handle: boolean;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: { index: number }): React.CSSProperties;
}) {
  return (
    <Item
      value={id}
      handle={handle}
      style={getItemStyles({
        containerId: findContainer(id, items) as UniqueIdentifier,
        overIndex: -1,
        index: getIndex(id, items),
        value: id,
        isSorting: true,
        isDragging: true,
        isDragOverlay: true,
      })}
      color={getColor(id)}
      dragOverlay
    />
  );
}
