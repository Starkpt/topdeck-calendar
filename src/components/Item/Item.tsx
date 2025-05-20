import { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";
import classNames from "classnames";
import React, { useEffect } from "react";
import { Handle, Remove } from "./components"; // Drag handle and remove components
import styles from "./Item.module.css";
import DropdownSelect from "../DropdownSelect/DropdownSelect";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface Props {
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: React.HTMLAttributes<HTMLButtonElement>;
  handleRef?: (element: HTMLElement | null) => void;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  value: React.ReactNode;
  onRemove?(): void;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        handleRef,
        index,
        listeners,
        onRemove,
        sorting,
        style,
        transition,
        transform,
        ...props
      },
      ref
    ) => {
      // Update cursor during drag overlay
      useEffect(() => {
        if (dragOverlay) {
          document.body.style.cursor = "grabbing";
          return () => {
            document.body.style.cursor = "";
          };
        }
      }, [dragOverlay]);

      // Retrieve items from Redux state
      const items = useSelector((state: RootState) => state.data.items, shallowEqual);

      // Define inline styles
      const computedStyles: React.CSSProperties = {
        ...style,
        backgroundColor: "#FFECDF",
        maxHeight: "127px",
        maxWidth: "393px",
        transition: [transition, styles?.transition].filter(Boolean).join(", "),
        "--translate-x": transform ? `${Math.round(transform.x)}px` : undefined,
        "--translate-y": transform ? `${Math.round(transform.y)}px` : undefined,
        "--scale-x": transform?.scaleX ? `${transform.scaleX}` : undefined,
        "--scale-y": transform?.scaleY ? `${transform.scaleY}` : undefined,
        "--index": index,
        "--color": color,
      } as React.CSSProperties;

      return (
        <li
          ref={ref}
          className={classNames(styles.Wrapper, {
            [styles.fadeIn]: fadeIn,
            [styles.sorting]: sorting,
            [styles.dragOverlay]: dragOverlay,
          })}
          style={computedStyles}
        >
          <div
            className={classNames(styles.Item, {
              [styles.dragging]: dragging,
              [styles.withHandle]: handle,
              [styles.dragOverlay]: dragOverlay,
              [styles.disabled]: disabled,
              [styles.color]: color,
            })}
            data-cypress="draggable-item"
            tabIndex={!handle ? 0 : undefined}
            {...(!handle ? listeners : undefined)}
            {...props}
          >
            <ul>
              <DropdownSelect
                containerId="no-container"
                id="no-id"
                items={items}
                value="no-value"
              />
            </ul>
            <span className={styles.Actions}>
              {onRemove && <Remove className={styles.Remove} onClick={onRemove} />}
              {handle && <Handle ref={handleRef} {...handleProps} />}
            </span>
          </div>
        </li>
      );
    }
  )
);
