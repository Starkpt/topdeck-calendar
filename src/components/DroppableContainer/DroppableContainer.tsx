import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useMemo } from "react";

import { Container, ContainerProps } from "../Container";
import { animateLayoutChanges } from "../../utils/util";

interface DroppableContainerProps extends ContainerProps {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  style?: React.CSSProperties;
}

export const DroppableContainer: React.FC<DroppableContainerProps> = ({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  ...props
}) => {
  const { active, attributes, isDragging, listeners, over, setNodeRef, transition, transform } =
    useSortable({
      id,
      data: {
        type: "container",
        children: items,
      },
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

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      {...props}
    >
      {children}
    </Container>
  );
};
