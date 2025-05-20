import { UniqueIdentifier } from "@dnd-kit/core";
import { Items } from "../../types/types";

export interface SortableItemProps {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  items: Items;
  index?: number;
  disabled?: boolean;
  value: UniqueIdentifier;
  containerRef?: React.Ref<HTMLDivElement>;
  // strategy: SortingStrategy;
  wrapperStyles?: React.CSSProperties;
}
