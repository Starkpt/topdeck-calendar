import { UniqueIdentifier } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useMemo } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";
import { handleAddColumn, handleRemove } from "../../../features/data/data";
import { RootState } from "../../../store/store";
import { DayView } from "../DayView";
import { DroppableContainer } from "../../DroppableContainer";
import { WeekViewProps } from "./types";

const PLACEHOLDER_ID = "placeholder";

export const WeekView = ({
  columns,
  containerStyle,
  vertical = false,
  scrollable,
  minimal = false,
  containerRef,
}: WeekViewProps) => {
  const dispatch = useDispatch<Dispatch>();

  // Access state context
  const { items, activeId, scheduledEvents } = useSelector(
    (state: RootState) => state.data,
    shallowEqual
  );

  // Determine if currently sorting a container
  const isSortingContainer = useMemo(
    () => (activeId ? scheduledEvents.includes(activeId) : false),
    [activeId, scheduledEvents]
  );

  // Filtered scheduledEvents for SortableContext
  const filteredContainers = useMemo(
    () => scheduledEvents.filter((containerId) => containerId !== PLACEHOLDER_ID),
    [scheduledEvents]
  );

  // Determine strategy based on vertical prop
  const sortingStrategy = vertical ? verticalListSortingStrategy : horizontalListSortingStrategy;

  // Memoized callback for adding and removing columns
  const handleAddColumnClick = useCallback(() => dispatch(handleAddColumn()), [dispatch]);
  const handleRemoveColumn = useCallback(
    (containerId: UniqueIdentifier) => () => dispatch(handleRemove(containerId)),
    [dispatch]
  );

  // Inline styles moved out of JSX for readability
  const containerGridStyle = {
    display: "inline-grid",
    padding: 20,
    gridAutoFlow: vertical ? "row" : "column",
  };

  return (
    <div style={containerGridStyle}>
      <SortableContext items={filteredContainers} strategy={sortingStrategy}>
        {scheduledEvents.map((containerId) => {
          if (containerId === PLACEHOLDER_ID) return null; // Skip placeholder in the map loop

          return (
            <DroppableContainer
              key={containerId}
              id={containerId}
              label={!minimal ? `Column ${containerId}` : undefined}
              columns={columns}
              items={items[containerId]}
              scrollable={scrollable}
              style={containerStyle}
              unstyled={minimal}
              onRemove={handleRemoveColumn(containerId)}
            >
              <DayView
                id={containerId}
                value={containerId}
                containerId={containerId}
                items={items}
                disabled={isSortingContainer}
                containerRef={containerRef}
              />
            </DroppableContainer>
          );
        })}

        {/* Add column button as a DroppableContainer */}
        <DroppableContainer
          id={PLACEHOLDER_ID}
          disabled={isSortingContainer}
          items={[]}
          onClick={handleAddColumnClick}
          placeholder
        >
          + Add column
        </DroppableContainer>
      </SortableContext>
    </div>
  );
};
