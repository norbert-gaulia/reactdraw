import React from "react";
import { UndoIcon } from "@jzohdi/jsx-icons";
import { getToolById } from "../../utils/utils";
const undoTool = {
    id: "react-draw-undo-tool",
    tooltip: "Undo",
    icon: React.createElement(UndoIcon, null),
    getDisplayMode(ctx) {
        if (ctx.undoStack.length > 0) {
            return "show";
        }
        return "disabled";
    },
    handleContext(ctx) {
        const lastAction = ctx.undoStack.pop();
        if (!lastAction) {
            return;
        }
        if (lastAction.toolType === "top-bar-tool") {
            return handleTopBarUndo(ctx, lastAction);
        }
        if (lastAction.toolType === "batch") {
            return handleBatchAction(ctx, lastAction);
        }
    },
};
export default undoTool;
function handleTopBarUndo(ctx, action) {
    const toolId = action.toolId;
    const tool = getToolById(ctx.drawingTools, toolId);
    const handlers = tool.undoHandlers;
    const actionKey = action.action;
    if (!handlers) {
        console.error("tool:", tool, "does not implement undo functionality");
        return;
    }
    const handler = handlers[actionKey];
    if (!handler) {
        console.error("tool:", tool, "does not implement undo action:", actionKey);
    }
    const result = handler(action, ctx);
    if (ctx.shouldKeepHistory) {
        ctx.redoStack.push(result);
    }
}
function handleBatchAction(ctx, action) {
    const data = action.data;
    const result = [];
    for (const obj of data) {
        const toolId = obj.toolId;
        const tool = getToolById(ctx.drawingTools, toolId);
        const handlers = tool.undoHandlers;
        const actionKey = obj.action;
        if (!handlers) {
            console.error("tool:", tool, "does not implement undo functionality");
            return;
        }
        const handler = handlers[actionKey];
        if (!handler) {
            console.error("tool:", tool, "does not implement action:", actionKey);
            return;
        }
        result.push(handler(obj, ctx));
    }
    action.data = result;
    if (ctx.shouldKeepHistory) {
        ctx.redoStack.push(action);
    }
}
