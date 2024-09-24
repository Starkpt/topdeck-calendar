import Select, { Props, StylesConfig } from "react-select";

import MtG from "/MtG.png";

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
  input: (styles) => ({ ...styles, ...dot("#444") }),
  placeholder: (styles) => ({ ...styles, ...dot("#ccc") }),
  singleValue: (styles) => ({ ...styles, ...dot("#888") }),
};

export default function DropdownSelect(props: Props) {
  return (
    <Select
      {...props}
      menuPortalTarget={document.body}
      styles={dotStyles}
      // defaultValue={colourOptions[2]}
      options={[{ label: <img src={MtG} />, value: "test", image: "MtG.png" }]}
    />
  );
}
