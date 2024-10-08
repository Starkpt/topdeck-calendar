import { useSortable } from "@dnd-kit/sortable";
import { Handle, Item, Remove } from "../Item";
import { useMountStatus } from "../../hooks/customHooks";
import { getColor, getIndex } from "../../utils/util";
import { SortableItemProps } from "./types";
import { useEffect } from "react";
import classNames from "classnames";
import styles from "../Item/Item.module.css";
import DropdownSelect from "../DropdownSelect/DropdownSelect";

export function SortableItem({
  disabled,
  id,
  index,
  handle,
  renderItem,
  style,
  containerId,
  wrapperStyles,
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
  const fadeIn = mountedWhileDragging;
  const sorting = isSorting;
  const dragging = isDragging;
  const dragOverlay = true;
  const color = getColor(id);
  const wrapperStyle = wrapperStyles({ index });

  useEffect(() => {
    if (!dragOverlay) return;

    document.body.style.cursor = "grabbing";

    return () => {
      document.body.style.cursor = "";
    };
  }, [dragOverlay]);

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
    <li
      ref={disabled ? undefined : setNodeRef}
      className={classNames(styles.Wrapper, {
        [styles.fadeIn]: fadeIn,
        [styles.sorting]: sorting,
        [styles.dragOverlay]: dragOverlay,
      })}
      style={
        {
          ...wrapperStyle,
          transition: [transition, wrapperStyle?.transition].filter(Boolean).join(", "),
          "--translate-x": transform ? `${Math.round(transform.x)}px` : undefined,
          "--translate-y": transform ? `${Math.round(transform.y)}px` : undefined,
          "--scale-x": transform?.scaleX ? `${transform.scaleX}` : undefined,
          "--scale-y": transform?.scaleY ? `${transform.scaleY}` : undefined,
          "--index": index,
          "--color": color,
        } as React.CSSProperties
      }
    >
      <div
        className={classNames(styles.Item, {
          [styles.dragging]: dragging,
          [styles.withHandle]: handle,
          [styles.dragOverlay]: dragOverlay,
          [styles.disabled]: disabled,
          [styles.color]: color,
        })}
        style={{
          ...style,
          backgroundColor: "#FFECDF",
          maxHeight: "127px",
          maxWidth: "393px",
        }}
        data-cypress="draggable-item"
        tabIndex={!handle ? 0 : undefined}
        {...(!handle ? listeners : undefined)} // Attach listeners only if handle is not specified
        // {...props}
      >
        <DropdownSelect />
        {/* <span className={styles.Actions}>
          {onRemove ? <Remove className={styles.Remove} onClick={onRemove} /> : null}
          {handle ? <Handle ref={handleRef} {...handleProps} /> : null}
        </span> */}
      </div>
    </li>
  );
}
