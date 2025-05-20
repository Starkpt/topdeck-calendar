import { useSortable } from "@dnd-kit/sortable";
import classNames from "classnames";
import { useEffect, useMemo } from "react";
import Select, { StylesConfig } from "react-select";
import { useMountStatus } from "../../hooks/customHooks";
import { getColor } from "../../utils/util";
import styles from "../Item/Item.module.css";
import { SortableItemProps } from "../SchedulerTable/DayView/types";

type Game = { label: string; value: string; image: string };

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

const dotStyles: StylesConfig<Game> = {
  control: (styles) => ({ ...styles, backgroundColor: "white" }),
  option: (styles) => ({ ...styles, backgroundColor: "white" }),
  input: (styles) => ({ ...styles, height: "80px" }),
  singleValue: (styles) => ({ ...styles, width: "100%" }),
  container: (styles) => ({ ...styles, width: "100%" }),
  // menu: (styles) => ({ ...styles, backgroundColor: "black", position: "relative" }),
  menuPortal: (styles) => ({ ...styles, zIndex: 99999 }),
};

export default function DropdownSelect({
  id,
  index,
  wrapperStyles,
  containerRef,
}: SortableItemProps) {
  const { setNodeRef, listeners, isDragging, isSorting, transform, transition } = useSortable({
    id,
  });

  const mounted = useMountStatus();
  const color = useMemo(() => getColor(id), [id]);
  const fadeIn = isDragging && !mounted;

  // Update cursor style when dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "grabbing";

      return () => {
        document.body.style.cursor = "";
      };
    }
  }, [isDragging]);

  const computedStyle: React.CSSProperties & { [key: string]: string | number | undefined } = {
    ...wrapperStyles,
    transition: [transition, wrapperStyles?.transition].filter(Boolean).join(", "),
    "--translate-x": transform ? `${Math.round(transform.x)}px` : undefined,
    "--translate-y": transform ? `${Math.round(transform.y)}px` : undefined,
    "--scale-x": transform?.scaleX ? `${transform.scaleX}` : undefined,
    "--scale-y": transform?.scaleY ? `${transform.scaleY}` : undefined,
    "--index": index,
    "--color": color,
  };

  // Class names using helper function for readability
  const wrapperClassNames = classNames(styles.Wrapper, {
    [styles.fadeIn]: fadeIn,
    [styles.sorting]: isSorting,
    [styles.dragOverlay]: isDragging,
  });

  const itemClassNames = classNames(styles.Item, {
    [styles.dragging]: isDragging,
    [styles.color]: color,
  });

  return (
    <li ref={setNodeRef} className={wrapperClassNames} style={computedStyle}>
      <div
        className={itemClassNames}
        style={{
          backgroundColor: "#FFECDF",
          maxHeight: "127px",
          maxWidth: "393px",
        }}
        data-cypress="draggable-item"
        tabIndex={0}
        {...listeners}
      >
        <Select
          menuPlacement="auto"
          maxMenuHeight={200}
          menuPortalTarget={containerRef?.current || document.body} // Defaults to `document.body` if ref is undefined
          styles={dotStyles}
          options={games}
          defaultValue={games[1]}
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
              <img src={game.image} style={{ height: "60px" }} alt={`${game.label}-image`} />
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
