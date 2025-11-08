import { TrashCanIcon } from "@jzohdi/jsx-icons";
import React from "react";
import { CLEAR_ALL_BUTTON_CLASSES } from "../constants";
import { useStyles } from "../Styles/hooks";
import { makeid } from "../utils";
import { batchDelete } from "../utils/utils";
const ClearAllButton = ({ getContext }) => {
    const classes = useStyles(CLEAR_ALL_BUTTON_CLASSES);
    const buttonId = React.useRef(makeid(6));
    const handleClearAll = () => {
        const ctx = getContext();
        if (ctx.objectsMap.size === 0) {
            return;
        }
        const objectKeys = ctx.objectsMap.keys();
        batchDelete(Array.from(objectKeys), ctx);
    };
    return (React.createElement("button", { className: classes, id: buttonId.current, onClick: handleClearAll },
        React.createElement("div", { style: { padding: "0px 5px", height: 20 } },
            React.createElement(TrashCanIcon, { width: 15, height: 20 })),
        React.createElement("label", { htmlFor: buttonId.current, style: { padding: "0px 10px", pointerEvents: "none" } }, "Clear All")));
};
export default ClearAllButton;
