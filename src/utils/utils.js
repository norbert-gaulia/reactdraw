import { unselectElement } from "./select/unselectElement";
import { pushActionToStack } from "./pushActionToStack";
import { makeNewBoundingDiv } from ".";
import { getZindexFromDiv } from "./readStyles";
export function setStyles(div, styles) {
    for (const key in styles) {
        div.style[key] = styles[key];
    }
    return div;
}
export function getCornerMode(id) {
    const direction = id.split("-")[2];
    if (direction === "sw") {
        return "resize-sw";
    }
    if (direction === "nw") {
        return "resize-nw";
    }
    if (direction === "se") {
        return "resize-se";
    }
    if (direction === "ne") {
        return "resize-ne";
    }
    throw new Error("corner mode id not valid");
}
export function getToolById(tools, toolId) {
    const tool = tools.find((t) => t.id === toolId);
    if (!tool) {
        throw new Error("could not find the used tool");
    }
    return tool;
}
export function deleteObjectAndNotify(objectId, ctx) {
    const { objectsMap, viewContainer } = ctx;
    const object = getObjectFromMap(ctx.objectsMap, objectId);
    // if deleting a selected element, remove select
    unselectElement(object, ctx);
    const { containerDiv, id } = object;
    viewContainer.removeChild(containerDiv);
    objectsMap.delete(id);
    const tool = getToolById(ctx.drawingTools, object.toolId);
    if (tool.onDeleteObject) {
        tool.onDeleteObject(object, ctx);
    }
}
export function getObjectFromMap(map, objectId) {
    const object = map.get(objectId);
    if (!object) {
        throw new Error("could not get object from map");
    }
    return object;
}
export function getRelativePoint(point, container) {
    if (!container) {
        throw new Error("Container not set.");
    }
    const rect = container.getBoundingClientRect();
    return [point[0] - rect.left, point[1] - rect.top];
}
export function getTouchCoords(e) {
    let touch = e.touches[0];
    if (!touch) {
        touch = e.targetTouches[0];
    }
    if (!touch) {
        touch = e.changedTouches[0];
    }
    return [touch.clientX, touch.clientY];
}
export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
export function getCenterPoint(bounds) {
    const { width, height, top, left } = bounds;
    const y = top + height / 2;
    const x = left + width / 2;
    return [x, y];
}
export function getViewCenterPoint(ctx) {
    const viewContainer = ctx.viewContainer;
    const bbox = viewContainer.getBoundingClientRect();
    return [bbox.width / 2, bbox.height / 2];
}
export function makeSureArtifactsGone(query, container) {
    const objects = container.querySelectorAll(query);
    if (objects.length > 0) {
        objects.forEach((obj) => {
            container.removeChild(obj);
        });
    }
}
export function isNotUndefined(item) {
    return item !== undefined;
}
export function batchDelete(deleteIds, ctx) {
    const action = {
        action: "batch",
        toolType: "batch",
        toolId: "",
        objectId: "",
        data: [],
    };
    const couldNotDeleteToolsSet = new Set();
    for (const objectId of deleteIds) {
        const object = getObjectFromMap(ctx.objectsMap, objectId);
        const toolId = object.toolId;
        const tool = getToolById(ctx.drawingTools, toolId);
        if (ctx.shouldKeepHistory && tool?.undoHandlers?.delete) {
            const toolAction = {
                action: "delete",
                toolType: "top-bar-tool",
                toolId: toolId,
                objectId,
                data: object,
            };
            action.data.push(toolAction);
        }
        else {
            couldNotDeleteToolsSet.add(toolId);
        }
        deleteObjectAndNotify(objectId, ctx);
    }
    if (ctx.shouldKeepHistory) {
        // const deletedObjects = new Map<>()
        pushActionToStack(action, ctx);
        if (couldNotDeleteToolsSet.size > 0) {
            for (let i = ctx.undoStack.length - 1; i >= 0; i--) {
                if (couldNotDeleteToolsSet.has(ctx.undoStack[i].toolId)) {
                    ctx.undoStack.splice(i, 1);
                    i++;
                }
            }
        }
    }
    else {
        ctx.undoStack.splice(0);
    }
}
export function createNewObject(ctx, point, toolId) {
    const styles = { ...ctx.globalStyles };
    const currentMaxZindex = getCurrentHighestZIndex(ctx);
    const nextZindex = currentMaxZindex + 1;
    styles.zIndex = nextZindex.toString();
    const newData = makeNewBoundingDiv(point, styles, toolId);
    return newData;
}
export function addObject(ctx, obj) {
    const { containerDiv, id } = obj;
    ctx.viewContainer.appendChild(containerDiv);
    const currentMaxZindex = getCurrentHighestZIndex(ctx);
    const nextZindex = currentMaxZindex + 1;
    updateZindex(obj, nextZindex);
    ctx.objectsMap.set(id, obj);
}
export function centerObject(ctx, obj, w, h) {
    const viewContainer = ctx.viewContainer;
    const viewBox = viewContainer.getBoundingClientRect();
    const div = obj.containerDiv;
    if (!w || !h) {
        const { width, height } = div.getBoundingClientRect();
        w = w || width;
        h = h || height;
    }
    const top = viewBox.height / 2 - h / 2;
    const left = viewBox.width / 2 - w / 2;
    div.style.top = top + "px";
    div.style.left = left + "px";
    div.style.height = h + "px";
    div.style.width = w + "px";
}
export function makeDeleteAction(ctx) {
    const initialAction = {
        toolId: "",
        toolType: "top-bar-tool",
        objectId: "",
        data: [],
        action: "delete",
    };
    return initialAction;
}
export function collectObjectsForDeleteAction(action, ctx) {
    const data = action.data;
    if (!data || !Array.isArray(data)) {
        console.error(action);
        throw new Error("malformed data");
    }
    action.data = {};
    for (const objectId of data) {
        const object = getObjectFromMap(ctx.objectsMap, objectId);
        action.data[objectId] = object;
    }
    action.action = "delete";
    return action;
}
export function getCurrentHighestZIndex(ctx) {
    if (ctx.objectsMap.size === 0) {
        return 0;
    }
    const allObjects = Array.from(ctx.objectsMap.values());
    allObjects.sort((a, b) => {
        return getZindexFromDiv(b.containerDiv) - getZindexFromDiv(a.containerDiv);
    });
    return getZindexFromDiv(allObjects[0].containerDiv);
}
export function updateZindex(obj, zIndex) {
    obj.style.zIndex = zIndex.toString();
    obj.containerDiv.style.zIndex = zIndex.toString();
}
