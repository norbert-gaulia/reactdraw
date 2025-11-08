import React, { useRef } from "react";
import { makeid } from "../utils";
function ColorPicker({ onUpdate, styleKey, label, styleValue, }) {
    const id = useRef(makeid(5));
    const handleChange = (e) => {
        const value = e.target.value;
        const hex = value === "transparent" ? value : "#" + value;
        onUpdate(styleKey, hex);
    };
    return (React.createElement("div", null,
        React.createElement("div", { style: { textAlign: "left", marginBottom: 5 } },
            React.createElement("label", { style: { fontWeight: "bold" }, htmlFor: id.current }, label)),
        React.createElement("div", { style: { display: "flex" } },
            React.createElement("span", { style: {
                    display: "inline-block",
                    borderRadius: 5,
                    width: 30,
                    height: 30,
                    backgroundColor: styleValue,
                } }),
            React.createElement("div", { style: { marginLeft: 10, display: "flex" } },
                React.createElement("span", { style: {
                        borderRadius: "5px 0px 0px 5px",
                        width: 30,
                        padding: 5,
                        fontWeight: "bold",
                        fontSize: 18,
                        textAlign: "center",
                        color: "grey",
                        backgroundColor: "lightgray",
                    } }, "#"),
                React.createElement("input", { id: id.current, value: styleValue.replace("#", ""), onChange: handleChange, style: { width: 80, borderRadius: "0px 5px 5px 0px" } })))));
}
export default ColorPicker;
