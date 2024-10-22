import { useSortable } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import Select, { StylesConfig } from "react-select";
import { useMountStatus } from "../../hooks/customHooks";
import { getColor } from "../../utils/util";
import { SortableItemProps } from "../DayView/types";

const dotStyles: StylesConfig = {
  control: (styles) => ({ ...styles, backgroundColor: "white" }),
  option: (styles) => ({ ...styles, backgroundColor: "white" }),
  input: (styles) => ({ ...styles, height: "80px" }),
  placeholder: (styles) => ({ ...styles }),
  singleValue: (styles) => ({ ...styles, width: "100%" }),
  container: (styles) => ({ ...styles, width: "100%" }),
  // menu: (styles) => ({ ...styles, backgroundColor: "black", position: "relative" }),
  menuPortal: (styles) => ({ ...styles, zIndex: 99999 }),
};

type Game = { label: string; value: string; image: string };

export default function DropdownSelect({
  // renderItem,
  // containerId,
  // styles,
  // strategy,
  // items,
  id,
  index,
  handle,
  style,
  wrapperStyles,
  value,
}: SortableItemProps) {
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const games: Game[] = [
    { label: "Dragon Ball Super W", value: "dbsw", image: "/dbsw.png" },
    { label: "Dragon Ball Super B", value: "dbsb", image: "/dbsb.png" },
    { label: "Magic: the Gathering", value: "mtg", image: "/mtg.png" },
    { label: "Flesh & Blood", value: "fab", image: "/fab.png" },
    { label: "Yu-Gi-Oh!", value: "ygo", image: "/ygu.png" },
    { label: "Vanguard", value: "vng", image: "/vng.png" },
    { label: "One Piece", value: "op", image: "/op.png" },
    { label: "Pokémon", value: "pkm", image: "/pkm.png" },
    { label: "Lorcana", value: "lcn", image: "/lcn.png" },
  ];

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

  const fadeIn = mountedWhileDragging;
  const sorting = isSorting;
  const dragging = isDragging;
  const dragOverlay = true;
  const color = getColor(id);
  // const wrapperStyle = wrapperStyles({ index });

  useEffect(() => {
    if (!dragOverlay) return;

    document.body.style.cursor = "grabbing";

    return () => {
      document.body.style.cursor = "";
    };
  }, [dragOverlay]);

  return (
    <li
      ref={isDisabled ? undefined : setNodeRef}
      // className={classNames(styles.Wrapper, {
      //   [styles.fadeIn]: fadeIn,
      //   [styles.sorting]: sorting,
      //   [styles.dragOverlay]: dragOverlay,
      // })}
      // style={
      //   {
      //     ...wrapperStyle,
      //     transition: [transition, wrapperStyle?.transition].filter(Boolean).join(", "),
      //     "--translate-x": transform ? `${Math.round(transform.x)}px` : undefined,
      //     "--translate-y": transform ? `${Math.round(transform.y)}px` : undefined,
      //     "--scale-x": transform?.scaleX ? `${transform.scaleX}` : undefined,
      //     "--scale-y": transform?.scaleY ? `${transform.scaleY}` : undefined,
      //     "--index": index,
      //     "--color": color,
      //   } as React.CSSProperties
      // }
    >
      <div
        // className={classNames(styles.Item, {
        //   [styles.dragging]: dragging,
        //   [styles.withHandle]: handle,
        //   [styles.dragOverlay]: dragOverlay,
        //   [styles.disabled]: isDisabled,
        //   [styles.color]: color,
        // })}
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
        <Select
          // {...props}
          // menuPortalTarget={ref?.current} // Target the ref as the portal target
          styles={dotStyles}
          options={games}
          defaultValue={games[1]}
          formatGroupLabel={(e) => <p>{e.label}</p>}
          formatOptionLabel={(game) => (
            <div
              className="game-option"
              style={{
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src={game?.image} style={{ height: "60px" }} alt="game-image" />
            </div>
          )}
        />
        {/* 
          <span className={styles.Actions}>
            {onRemove ? <Remove className={styles.Remove} onClick={onRemove} /> : null}
            {handle ? <Handle ref={handleRef} {...handleProps} /> : null}
          </span> 
        */}
      </div>
    </li>
  );
}
