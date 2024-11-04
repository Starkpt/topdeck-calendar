import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { forwardRef, useMemo } from "react";

import { animateLayoutChanges } from "../../utils/util";
import { Container, ContainerProps } from "../Container";

interface DroppableContainerProps extends ContainerProps {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  style?: React.CSSProperties;
}

export const DroppableContainer = forwardRef<HTMLDivElement, DroppableContainerProps>(
  ({ children, columns = 1, disabled, id, items, style, ...props }, ref) => {
    const { active, attributes, isDragging, listeners, over, setNodeRef, transition, transform } =
      useSortable({
        id,
        data: { type: "container", children: items },
        animateLayoutChanges,
      });

    const isOverContainer = useMemo(() => {
      if (!over) {
        return false;
      }
      return (
        (id === over.id && active?.data.current?.type !== "container") || items.includes(over.id)
      );
    }, [over, id, active, items]);

    // Combine the sortable ref with the provided ref
    const combinedRef = (node: HTMLDivElement) => {
      setNodeRef(node);
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement>).current = node;
      }
    };

    return (
      <Container
        ref={disabled ? ref : combinedRef}
        hover={isOverContainer}
        columns={columns}
        handleProps={{ ...attributes, ...listeners }}
        style={{
          ...style,
          transition,
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.5 : undefined,
        }}
        {...props}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child) && "containerRef" in child.props
            ? React.cloneElement(child, { ...{ containerRef: ref } }) // Pass ref only if child supports containerRef
            : child
        )}
      </Container>
    );
  }
);
