import Select, { Props, StylesConfig } from "react-select";

const dot = (color = "transparent") => ({
  alignItems: "center",
  display: "flex",

  ":before": {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: "block",
    marginRight: 8,
    height: 10,
    width: 10,
  },
});

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

export default function DropdownSelect(props: Props, { ref }) {
  const games = [
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

  return (
    <Select
      {...props}
      menuPortalTarget={document.body}
      styles={dotStyles}
      options={games}
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
      formatGroupLabel={(e) => <p>{e.label}</p>}
      // defaultValue={colourOptions[2]}
    />
  );
}
