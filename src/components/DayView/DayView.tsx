import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DropdownSelect from "../DropdownSelect/DropdownSelect";
import { SortableItemProps } from "./types";

export function DayView({ id, items, containerId, containerRef }: SortableItemProps) {
  return (
    <SortableContext items={items[containerId]} strategy={verticalListSortingStrategy}>
      {items[containerId]?.length ? (
        items[containerId]?.map((value, index) => (
          <DropdownSelect
            id={id}
            key={index}
            value={value}
            containerId={value}
            items={items}
            containerRef={containerRef}
          />
        ))
      ) : (
        <div>
          <p>No events</p>
        </div>
      )}
    </SortableContext>
  );
}
