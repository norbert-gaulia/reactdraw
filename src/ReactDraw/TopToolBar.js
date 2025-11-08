import React from "react";
import ToolIconWrapper from "./ToolIconWrapper";
import ToolTip from "../Alerts/ToolTip";
import { useStyles } from "../Styles/hooks";
import { TOP_BAR_CONTAINER_CLASSES } from "../constants";
import { isActionTool, isDrawingTool, } from "../types";
export function TopToolBar({ tools, onSelectDrawingTool, onClickActionTool, currentTool, }) {
    const classes = useStyles(TOP_BAR_CONTAINER_CLASSES);
    return (React.createElement("div", { className: classes }, tools
        .filter((tool) => !!tool.icon)
        .map((tool, i) => {
        const tooltip = tool.tooltip;
        return (React.createElement(ToolTip, { text: tooltip, position: "top", key: tool.id },
            React.createElement(ToolIconWrapper, { selected: tool.id === currentTool, onSelect: () => {
                    if (isDrawingTool(tool)) {
                        return onSelectDrawingTool(tool);
                    }
                    else if (isActionTool(tool)) {
                        return onClickActionTool(tool.handleContext);
                    }
                } }, tool.icon)));
    })));
}
