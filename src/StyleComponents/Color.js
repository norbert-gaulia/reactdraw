import React from "react";
import ColorPicker from "./ColorPicker";
const ColorStyle = (props) => {
    return React.createElement(ColorPicker, { ...props, label: "color" });
};
export default ColorStyle;
