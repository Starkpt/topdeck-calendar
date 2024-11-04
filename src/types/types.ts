import { CancelDrop, KeyboardCoordinateGetter, Modifiers, UniqueIdentifier } from "@dnd-kit/core";
import { SortingStrategy } from "@dnd-kit/sortable";

export type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

export interface AppProps {
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  containerStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;
  items?: Items;
  handle?: boolean;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  trashable?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
  containerRef?: React.Ref<HTMLDivElement>;
}
