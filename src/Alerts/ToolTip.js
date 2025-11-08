import React from "react";
// import { ReactChild } from "../types";
import { useAlerts } from "./hooks";
//TODO: make label on mobile?
export default function ToolTip({ children, text, position, disabled, }) {
    const [state, setState] = useAlerts();
    if (!children) {
        return React.createElement(React.Fragment, null);
    }
    if (!text) {
        return React.createElement(React.Fragment, null, children);
    }
    const handleMouseEnter = () => {
        if (!disabled && !isTouchDevice()) {
            setState({ ...state, message: text, position: position });
        }
    };
    const handleMouseLeave = () => {
        if (state.message !== null) {
            setState({ ...state, message: null });
        }
    };
    return (React.createElement("span", { onMouseOver: handleMouseEnter, onMouseLeave: handleMouseLeave, "aria-label": `label mouse listener ${text}` }, children));
}
function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
