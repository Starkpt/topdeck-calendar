import { UniqueIdentifier } from "@dnd-kit/core";
import { Items } from "../../types/types";

export interface SortableItemProps {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  items: Items;
  index: number;
  handle: boolean;
  disabled?: boolean;
  style(args: any): React.CSSProperties;
  getIndex(id: UniqueIdentifier, Items: Items): number;
  renderItem(): React.ReactElement;
  wrapperStyle({ index }: { index: number }): React.CSSProperties;
}
