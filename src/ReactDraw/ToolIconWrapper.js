import React from "react";
import { useStyles } from "../Styles/hooks";
import { TOOL_ICON_WRAPPER_CLASSES } from "../constants";
export default function ToolIconWrapper({ children, selected, onSelect, }) {
    const classes = useStyles(TOOL_ICON_WRAPPER_CLASSES);
    return (React.createElement("button", { "data-selected": selected, className: classes, onClick: onSelect }, children));
}
