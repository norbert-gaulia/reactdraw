import { getObjectFromMap, getToolById } from "../../utils/utils";
import { alertAfterUpdate } from "../../utils/alertAfterUpdate";
import { getRotateFromDiv } from "../../utils/select/getRotateFromDiv";
import { getBoxSize } from "../../utils";
export function handleDragUndo(action, ctx) {
    const data = action.data;
    const redoData = [];
    for (const obj of data) {
        const object = getObjectFromMap(ctx.objectsMap, obj.objectId);
        const div = object.containerDiv;
        const bounds = getBoxSize(object);
        const { left, top } = obj;
        redoData.push({
            objectId: obj.objectId,
            top: bounds.top,
            left: bounds.left,
        });
        div.style.left = left + "px";
        div.style.top = top + "px";
        alertAfterUpdate(object, ctx);
    }
    action.data = redoData;
    return action;
}
export function handleRotateUndo(action, ctx) {
    const data = action.data;
    const redoData = [];
    for (const obj of data) {
        const object = getObjectFromMap(ctx.objectsMap, obj.objectId);
        const div = object.containerDiv;
        const currRotate = getRotateFromDiv(div);
        redoData.push({
            objectId: obj.objectId,
            rotate: currRotate,
        });
        div.style.transform = `rotate(${obj.rotate}deg)`;
        alertAfterUpdate(object, ctx);
    }
    action.data = redoData;
    return action;
}
export function handelResizeUndo(action, ctx) {
    const object = getObjectFromMap(ctx.objectsMap, action.objectId);
    const undoData = action.data;
    const currBounds = getBoxSize(object);
    const redoBounds = { ...currBounds };
    setDivToBounds(object.containerDiv, undoData.bounds);
    const toolUsed = getToolById(ctx.drawingTools, object.toolId);
    toolUsed.onResize(object, {
        ...ctx,
        previousPoint: [currBounds.left, currBounds.top],
        newPoint: [undoData.bounds.left, undoData.bounds.top],
        shouldPreserveAspectRatio: ctx.shouldCornerResizePreserveRatio,
    });
    action.data.bounds = redoBounds;
    return action;
}
export function setDivToBounds(div, bounds) {
    div.style.left = bounds.left + "px";
    div.style.top = bounds.top + "px";
    div.style.width = bounds.right - bounds.left + "px";
    div.style.height = bounds.bottom - bounds.top + "px";
}
