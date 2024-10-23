import { UniqueIdentifier } from "@dnd-kit/core";
import { Items } from "../../types/types";
import { SortingStrategy } from "@dnd-kit/sortable";

export interface SortableItemProps {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  items: Items;
  index?: number;
  handle: boolean;
  disabled?: boolean;
  value: UniqueIdentifier;
  // strategy: SortingStrategy;
  style?(args: any): React.CSSProperties;
  wrapperStyles?: React.CSSProperties;
}
