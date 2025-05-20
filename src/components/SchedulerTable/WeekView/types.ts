import { UniqueIdentifier } from "@dnd-kit/core";

export type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

export interface WeekViewProps {
  columns?: number;
  containerStyle?: React.CSSProperties;
  vertical?: boolean;
  scrollable?: boolean;
  minimal?: boolean;
  containerRef?: React.Ref<HTMLDivElement>;
}
