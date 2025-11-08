import { pushActionToStack } from "./pushActionToStack";
import { borderFromStyles } from "./updateStyles/color";
import { getInnerEleFromSvg } from "./updateStyles/utils";
import { deleteObjectAndNotify, getObjectFromMap } from "./utils";
export function saveCreateToUndoStack(data, ctx) {
    if (!ctx.shouldKeepHistory) {
        return;
    }
    const newAction = {
        toolId: data.toolId,
        toolType: "top-bar-tool",
        objectId: data.id,
        action: "create",
        data: null,
    };
    pushActionToStack(newAction, ctx);
}
export function undoCreate(action, ctx) {
    const object = getObjectFromMap(ctx.objectsMap, action.objectId);
    deleteObjectAndNotify(action.objectId, ctx);
    action.data = object;
    action.action = "delete";
    return action;
}
export function redoDelete(action, ctx) {
    const object = action.data;
    if (!object) {
        throw new Error("redo delete but no data exists");
    }
    ctx.objectsMap.set(object.id, object);
    ctx.viewContainer.appendChild(object.containerDiv);
    action.data = null;
    action.action = "create";
    return action;
}
/**
 * Expects action.data to be in the form of:
 * {
 * 	  objectId: DrawingData
 * }
 */
export function recreateDeletedObjects(action, ctx) {
    const data = action.data;
    if (!data || typeof data !== "object") {
        throw new Error("malformed data");
    }
    //   console.log(data);
    for (const [objectId, object] of data.entries()) {
        ctx.viewContainer.appendChild(object.containerDiv);
        ctx.objectsMap.set(objectId, object);
    }
    action.action = "create";
    action.data = Array.from(data.keys());
    return action;
}
export function deleteCreatedObjects(action, ctx) {
    const data = action.data;
    if (!data || !Array.isArray(data)) {
        console.error(action);
        throw new Error("malformed data");
    }
    action.data = new Map();
    for (const objectId of data) {
        action.data.set(objectId, getObjectFromMap(ctx.objectsMap, objectId));
        deleteObjectAndNotify(objectId, ctx);
    }
    action.action = "delete";
    return action;
}
export function undoEleOpacity(action, ctx) {
    const object = getObjectFromMap(ctx.objectsMap, action.objectId);
    const curr = object.style.opacity;
    const styleToSave = action.data;
    const ele = object.element;
    if (!styleToSave || !ele) {
        throw new Error();
    }
    object.style.opacity = styleToSave;
    ele.style.opacity = object.style.opacity;
    action.data = curr;
    return action;
}
export function undoEleLineWidth(action, ctx) {
    const object = getObjectFromMap(ctx.objectsMap, action.objectId);
    const curr = object.style.lineWidth;
    const styleToSave = action.data;
    const ele = object.element;
    if (!styleToSave || !ele) {
        throw new Error();
    }
    object.style.lineWidth = styleToSave;
    ele.style.border = borderFromStyles(object.style);
    action.data = curr;
    return action;
}
// TODO: Generalize?
export function undoEleBackgroundColor(action, ctx) {
    const object = getObjectFromMap(ctx.objectsMap, action.objectId);
    const currColor = object.style.background;
    const colorTo = action.data;
    const ele = object.element;
    if (!colorTo || !ele) {
        throw new Error();
    }
    object.style.background = colorTo;
    ele.style.backgroundColor = colorTo;
    action.data = currColor;
    return action;
}
export function undoEleBorderColor(action, ctx) {
    const object = getObjectFromMap(ctx.objectsMap, action.objectId);
    const currColor = object.style.color;
    const colorTo = action.data;
    const ele = object.element;
    if (!colorTo || !ele) {
        throw new Error();
    }
    object.style.color = colorTo;
    ele.style.border = borderFromStyles(object.style);
    action.data = currColor;
    return action;
}
export function undoSvgPathColor(action, ctx) {
    return undoSvgStyle(action, ctx, "color", "stroke");
}
export function undoSvgPathFill(action, ctx) {
    return undoSvgStyle(action, ctx, "background", "fill");
}
function undoSvgStyle(action, ctx, dataKey, svgKey) {
    const object = getObjectFromMap(ctx.objectsMap, action.objectId);
    const currColor = object.style[dataKey];
    const colorTo = action.data;
    const svg = object.element;
    if (!svg) {
        throw new Error();
    }
    let path = svg.querySelector("path");
    if (!path) {
        path = svg.querySelector("line");
    }
    if (!path) {
        throw new Error();
    }
    object.style[dataKey] = colorTo;
    path.style[svgKey] = colorTo;
    action.data = currColor;
    return action;
}
export function undoSvgPathWidth(action, ctx) {
    const object = getObjectFromMap(ctx.objectsMap, action.objectId);
    const currStyle = object.style.lineWidth;
    const styleTo = action.data;
    const path = getInnerEleFromSvg(object);
    object.style.lineWidth = styleTo;
    path.style.strokeWidth = styleTo + "px";
    action.data = currStyle;
    return action;
}
