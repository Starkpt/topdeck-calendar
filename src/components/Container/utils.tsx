import { UniqueIdentifier } from "@dnd-kit/core";
import { Container } from "./Container";
import { Items } from "../../types/types";
import { Item } from "../Item";
import { getColor, getIndex } from "../../utils/util";

export interface ContainerDragOverlay {
  containerId: UniqueIdentifier;
  items: Items;
  columns?: number;
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
}

export function renderContainerDragOverlay({
  containerId,
  items,
  columns,
  handle = false,
  getItemStyles = () => ({}),
}: ContainerDragOverlay) {
  return (
    <Container
      label={`Column ${containerId}`}
      columns={columns}
      style={{ height: "100%" }}
      shadow
      unstyled={false}
    >
      {items[containerId].map((item, index) => (
        <Item
          key={index}
          value={item}
          handle={handle}
          style={getItemStyles({
            containerId,
            overIndex: -1,
            index: getIndex(item, items),
            value: item,
            isDragging: false,
            isSorting: false,
            isDragOverlay: false,
          })}
          color={getColor(item)}
        />
      ))}
    </Container>
  );
}
