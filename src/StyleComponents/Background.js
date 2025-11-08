import React from "react";
import ColorPicker from "./ColorPicker";
const BackgroundStyle = (props) => {
    return React.createElement(ColorPicker, { ...props, label: "background" });
};
export default BackgroundStyle;
