import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DropdownSelect from "../DropdownSelect/DropdownSelect";
import { SortableItemProps } from "./types";

export function DayView({
  // id,
  // index,
  // handle,
  // renderItem,
  // style,
  // wrapperStyles,
  id,
  items,
  containerId,
}: SortableItemProps) {
  // return (
  //   <Item
  //     ref={disabled ? undefined : setNodeRef} // Set the node reference for the item
  //     value={id}
  //     dragging={isDragging}
  //     sorting={isSorting}
  //     handle={handle}
  //     handleProps={handle ? listeners : undefined} // Pass listeners directly as props
  //     handleRef={handle ? setActivatorNodeRef : undefined} // Pass the activator ref to the Handle
  //     index={index}
  //     wrapperStyle={wrapperStyle({ index })}
  //     style={style({
  //       index,
  //       value: id,
  //       isDragging,
  //       isSorting,
  //       overIndex: over ? getIndex(over.id, items) : overIndex,
  //       containerId,
  //     })}
  //     color={getColor(id)}
  //     transition={transition}
  //     transform={transform}
  //     fadeIn={mountedWhileDragging}
  //     listeners={listeners}
  //     renderItem={renderItem}
  //   />
  // );

  // return renderItem ? (
  //   renderItem({
  //     ref,
  //     index,
  //     style,
  //     dragOverlay: Boolean(dragOverlay),
  //     dragging: Boolean(dragging),
  //     sorting: Boolean(sorting),
  //     fadeIn: Boolean(fadeIn),
  //     listeners,
  //     transition,
  //     transform,
  //     value,
  //   })
  // ) : (

  // );

  return (
    <SortableContext items={items[containerId]} strategy={verticalListSortingStrategy}>
      {items[containerId]?.length ? (
        items[containerId]?.map((value, index) => (
          <DropdownSelect
            id={id}
            key={index}
            value={value}
            containerId={""}
            items={items}
            handle={false}
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
