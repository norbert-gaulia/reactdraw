import React, { useRef } from "react";
import { makeid } from "../utils";
export default function LineWidthPicker({ onUpdate, styleKey, styleValue, }) {
    const id = useRef(makeid(5));
    const handleChange = (e) => {
        const value = e.target.value;
        onUpdate(styleKey, value);
    };
    return (React.createElement("div", null,
        React.createElement("div", { style: { textAlign: "left", marginBottom: 5 } },
            React.createElement("label", { style: { fontWeight: "bold" }, htmlFor: id.current }, "line width")),
        React.createElement("div", { style: { width: "100%" } },
            React.createElement("input", { id: id.current, value: styleValue, onChange: handleChange, type: "number", style: {
                    boxSizing: "border-box",
                    width: 168,
                    height: 30,
                    borderRadius: 5,
                    paddingLeft: 10,
                    fontSize: 19,
                    lineHeight: "1.6",
                }, min: "0", step: "1" }))));
}
