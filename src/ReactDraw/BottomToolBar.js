import { MenuIcon, PaletteBoldIcon } from "@jzohdi/jsx-icons";
import React, { useState } from "react";
import ToolTip from "../Alerts/ToolTip";
import { BOTTOM_BAR_CONTAINER_CLASSES, BOTTOM_TOOL_BUTTON_CLASSES, MENU_BUTTON_CLASSES, MENU_CONTAINER_CLASSES, } from "../constants";
import { useStyles } from "../Styles/hooks";
import { isActionTool, isDrawingTool, } from "../types";
import StylesMenu from "./StylesMenu";
export function BottomToolBar({ tools, displayMap, onSelectDrawingTool, onClickActionTool, stylesMenu, children, }) {
    //   console.log(displayMap);
    const bottomBarContainerClasses = useStyles(BOTTOM_BAR_CONTAINER_CLASSES);
    const bottomToolButtonClasses = useStyles(BOTTOM_TOOL_BUTTON_CLASSES);
    const menuButtonClasses = useStyles(MENU_BUTTON_CLASSES);
    const menuContainerClasses = useStyles(MENU_CONTAINER_CLASSES);
    const [menuOpen, setMenuOpen] = useState(null);
    const handleToggleMenu = (key) => {
        if (key === menuOpen) {
            return setMenuOpen(null);
        }
        return setMenuOpen(key);
    };
    const hasStyleMenu = !!stylesMenu.styleComponents && !isObjEmpty(stylesMenu.styleComponents);
    const hasMenu = !!children && React.Children.count(children) > 0;
    return (React.createElement(React.Fragment, null,
        menuOpen === "styles" && (React.createElement("div", { className: menuContainerClasses },
            React.createElement(StylesMenu, { ...stylesMenu }))),
        menuOpen === "menu" && (React.createElement("div", { className: menuContainerClasses }, children)),
        React.createElement("div", { className: bottomBarContainerClasses },
            hasMenu && (React.createElement(ToolTip, { text: "Menu", position: "bottom" },
                React.createElement("button", { className: menuButtonClasses, onClick: () => handleToggleMenu("menu"), "data-open": menuOpen === "menu" },
                    React.createElement(MenuIcon, { size: 20 })))),
            hasStyleMenu && (React.createElement(ToolTip, { text: "Styles", position: "bottom" },
                React.createElement("button", { className: menuButtonClasses, onClick: () => handleToggleMenu("styles"), "data-open": menuOpen === "styles" },
                    React.createElement(PaletteBoldIcon, { size: 20 })))),
            tools.map((tool, i) => {
                const toolId = tool.id;
                const toolDisplayMode = displayMap.get(toolId) || "hide";
                const isDisabled = toolDisplayMode === "disabled";
                return (React.createElement(ToolTip, { key: tool.id, text: tool.tooltip, position: "bottom", disabled: isDisabled },
                    React.createElement("button", { className: bottomToolButtonClasses, "aria-disabled": isDisabled, "data-disabled": isDisabled, "data-mode": toolDisplayMode, disabled: isDisabled, onClick: () => {
                            if (isDrawingTool(tool)) {
                                return onSelectDrawingTool(tool);
                            }
                            else if (isActionTool(tool)) {
                                return onClickActionTool(tool.handleContext);
                            }
                        } }, tool.icon)));
            }))));
}
function isObjEmpty(obj) {
    for (var _x in obj) {
        return false;
    }
    return true;
}
