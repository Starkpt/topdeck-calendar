import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";
import { handleAddColumn, handleRemove } from "../../features/data/data";
import { RootState } from "../../store/store";
import { Props } from "../../types/types";
import { DroppableContainer } from "../DroppableContainer";
import { SortableItem } from "../SortableItem";

const PLACEHOLDER_ID = "placeholder";

export const WeekView = ({
  columns,
  handle = false,
  containerStyle,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  renderItem,
  strategy = verticalListSortingStrategy,
  vertical = false,
  scrollable,
  minimal = false,
}: Props) => {
  const { items, activeId, containers } = useSelector(
    (state: RootState) => state.data,
    shallowEqual
  );

  const dispatch = useDispatch<Dispatch>();

  const isSortingContainer = activeId ? containers.includes(activeId) : false;

  return (
    <div
      style={{
        display: "inline-grid",
        boxSizing: "border-box",
        padding: 20,
        gridAutoFlow: vertical ? "row" : "column",
      }}
    >
      <SortableContext
        items={containers.filter((containerId) => containerId !== PLACEHOLDER_ID)} // Exclude PLACEHOLDER_ID
        strategy={vertical ? verticalListSortingStrategy : horizontalListSortingStrategy}
      >
        {containers.map((containerId) => {
          if (containerId === PLACEHOLDER_ID) {
            return null; // Skip rendering as a sortable container
          }

          return (
            <DroppableContainer
              key={containerId}
              id={containerId}
              label={minimal ? undefined : `Column ${containerId}`}
              columns={columns}
              items={items[containerId]}
              scrollable={scrollable}
              style={containerStyle}
              unstyled={minimal}
              onRemove={() => dispatch(handleRemove(containerId))}
            >
              <SortableContext items={items[containerId]} strategy={strategy}>
                {items[containerId]?.length ? (
                  items[containerId]?.map((value, index) => (
                    <SortableItem
                      key={value}
                      id={value}
                      index={index}
                      handle={handle}
                      style={getItemStyles}
                      wrapperStyles={wrapperStyle}
                      renderItem={renderItem}
                      containerId={containerId}
                      items={items}
                      disabled={isSortingContainer}
                    />
                  ))
                ) : (
                  <div>
                    <p>No events</p>
                  </div>
                )}
              </SortableContext>
            </DroppableContainer>
          );
        })}

        <DroppableContainer
          id={PLACEHOLDER_ID}
          disabled={isSortingContainer}
          items={[]}
          onClick={() => dispatch(handleAddColumn())}
          placeholder
        >
          + Add column
        </DroppableContainer>
      </SortableContext>
    </div>
  );
};
