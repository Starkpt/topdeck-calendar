import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";
import classNames from "classnames";
import React, { useEffect } from "react";

import { Handle, Remove } from "./components";

import styles from "./Item.module.css";

import DropdownSelect from "../DropdownSelect/DropdownSelect";

export interface Props {
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: React.HTMLAttributes<HTMLButtonElement>;
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
    ref: React.Ref<HTMLLIElement>;
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
        dragOverlay = false,
        dragging = false,
        disabled = false,
        fadeIn = false,
        handle = false,
        handleProps,
        // height,
        index,
        listeners,
        onRemove,
        renderItem,
        sorting = false,
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
        if (dragOverlay) {
          document.body.style.cursor = "grabbing";
          return () => {
            document.body.style.cursor = "";
          };
        }
      }, [dragOverlay]);

      // Render using custom renderItem if provided
      if (renderItem) {
        return renderItem({
          ref,
          index,
          style,
          dragOverlay,
          dragging,
          sorting,
          fadeIn,
          listeners: listeners || {},
          transition,
          transform,
          value,
        });
      }

      // Render default item component
      return (
        <li
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
          ref={ref}
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
            {...(!handle ? listeners : undefined)}
            {...props}
            tabIndex={!handle ? 0 : undefined}
          >
            <DropdownSelect />
            <span className={styles.Actions}>
              {onRemove && <Remove className={styles.Remove} onClick={onRemove} />}
              {handle && <Handle {...handleProps} {...listeners} />}
            </span>
          </div>
        </li>
      );
    }
  )
);
