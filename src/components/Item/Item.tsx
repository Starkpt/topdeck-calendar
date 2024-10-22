import { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";
import classNames from "classnames";
import React, { useEffect } from "react";
import { Handle, Remove } from "./components"; // Assume Handle is your drag handle component
import styles from "./Item.module.css";
import DropdownSelect from "../DropdownSelect/DropdownSelect";

interface Props {
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: React.HTMLAttributes<HTMLButtonElement>;
  handleRef?: (element: HTMLElement | null) => void;
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  value: React.ReactNode;
  onRemove?(): void;
  renderItem?(args: {
    dragOverlay: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number | undefined;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    ref: React.Ref<HTMLElement>;
    style: React.CSSProperties | undefined;
    transform: Props["transform"];
    transition: Props["transition"];
    value: Props["value"];
  }): React.ReactElement;
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
        handleRef, // This is the ref for the handle
        // height,
        index,
        listeners,
        onRemove,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        ...props
      },
      ref
    ) => {
      useEffect(() => {
        if (!dragOverlay) return;

        document.body.style.cursor = "grabbing";

        return () => {
          document.body.style.cursor = "";
        };
      }, [dragOverlay]);

      return renderItem ? (
        renderItem({
          ref,
          index,
          style,
          dragOverlay: Boolean(dragOverlay),
          dragging: Boolean(dragging),
          sorting: Boolean(sorting),
          fadeIn: Boolean(fadeIn),
          listeners,
          transition,
          transform,
          value,
        })
      ) : (
        <li
          ref={ref}
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
            {...props}
          >
            <ul>
              <DropdownSelect />
            </ul>
            <span className={styles.Actions}>
              {onRemove ? <Remove className={styles.Remove} onClick={onRemove} /> : null}
              {handle ? <Handle ref={handleRef} {...handleProps} /> : null}
            </span>
          </div>
        </li>
      );
    }
  )
);
