import React, { forwardRef, useMemo } from "react";
import classNames from "classnames";

import { Handle, Remove } from "../Item";

import styles from "./Container.module.css";

export interface Props {
  children: React.ReactNode;
  columns?: number;
  label?: string;
  style?: React.CSSProperties;
  horizontal?: boolean;
  hover?: boolean;
  handleProps?: React.HTMLAttributes<HTMLDivElement | HTMLButtonElement>;
  scrollable?: boolean;
  shadow?: boolean;
  placeholder?: boolean;
  unstyled?: boolean;
  onClick?(): void;
  onRemove?(): void;
}

export const Container = forwardRef<HTMLDivElement | HTMLButtonElement, Props>(
  (
    {
      children,
      columns = 1,
      handleProps,
      horizontal = false,
      hover = false,
      onClick,
      onRemove,
      label,
      placeholder = false,
      style,
      scrollable = false,
      shadow = false,
      unstyled = false,
      ...props
    }: Props,
    ref
  ) => {
    // Memoize the component type to avoid unnecessary re-renders
    const Component = useMemo(() => (onClick ? "button" : "div"), [onClick]);

    return (
      <Component
        {...props}
        // ref={ref}
        ref={ref as React.Ref<HTMLButtonElement> & React.Ref<HTMLDivElement>} // Cast ref here
        style={
          {
            ...style,
            "--columns": columns,
          } as React.CSSProperties
        }
        className={classNames(styles.Container, {
          [styles.unstyled]: unstyled,
          [styles.horizontal]: horizontal,
          [styles.hover]: hover,
          [styles.placeholder]: placeholder,
          [styles.scrollable]: scrollable,
          [styles.shadow]: shadow,
        })}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        {label && (
          <div className={styles.Header}>
            {label}
            <div className={styles.Actions}>
              {onRemove && <Remove onClick={onRemove} />}
              <Handle {...handleProps} />
            </div>
          </div>
        )}
        {placeholder ? children : <ul>{children}</ul>}
      </Component>
    );
  }
);
