import React, { useEffect, useMemo, useRef, useState } from "react";
import { TopToolBar } from "./TopToolBar";
import { getNumFrom, makeNewBoundingDiv } from "../utils";
import { BottomToolBar } from "./BottomToolBar";
import { ERASE_TOOL_ID, SELECT_TOOL_ID } from "../constants";
import { getCurrentHighestZIndex, getObjectFromMap, getRelativePoint, getTouchCoords, isNotUndefined, } from "../utils/utils";
import { getSelectedIdsFromFullState, selectElement, unselectAll, } from "../utils/select/utils";
import { getSelectedDrawingObjects } from "../utils/select/getSelectedDrawingObjects";
import { pushActionToStack } from "../utils/pushActionToStack";
import { AlertMessage } from "../Alerts";
import { alertSelected } from "../TopBarTools/SelectTool";
function makeToolsList(drawingTools, actionTools, position) {
    const drawTools = drawingTools.filter(t => {
        if (position === "top") {
            return !t.postition || t.postition.view === position;
        }
        return !!t.postition && t.postition.view === position;
    });
    const actions = actionTools.filter(t => {
        if (position === "bottom") {
            return !t.postition || t.postition.view === position;
        }
        return !!t.postition && t.postition.view === position;
    });
    return [...drawTools].concat(actions).sort((a, b) => {
        if (!a.postition?.order && !b.postition?.order) {
            return 0;
        }
        if (!a.postition?.order) {
            return 1;
        }
        if (!b.postition?.order) {
            return -1;
        }
        return a.postition.order - b.postition.order;
    });
}
export default function ReactDraw({ children, id = "main", drawingTools, hideTopBar, actionTools = [], hideBottomBar, shouldKeepHistory = true, shouldSelectAfterCreate = true, isResponsive = false, shouldCornerResizePreserveRatio = false, styleComponents, menuComponents = [], onLoad, contextGetter, }) {
    const drawingAreaRef = useRef(null);
    const [currentDrawingTool, setCurrentDrawingTool] = useState(drawingTools[0]);
    const renderedElementsMap = useRef(new Map());
    const currDrawObj = useRef(null);
    const drawingAreaId = useRef(`drawing-area-container-${id}`);
    const previousMousePos = useRef(null);
    const latestEvent = useRef(null);
    const customState = useRef(setupCustomStateSpace(drawingTools));
    const undoStack = useRef([]);
    const redoStack = useRef([]);
    const objectToSelect = useRef(null);
    const globalStyles = useRef(setupGlobalStyles(drawingTools));
    // bottomToolsDisplayMap is used to set whether the bottom tool should be display | hidden | show
    const [bottomToolsDisplayMap, setBottomToolsDisplayMap] = useState(new Map());
    const topBarTools = useMemo(() => makeToolsList(drawingTools, actionTools, "top"), [drawingTools, actionTools]);
    const bottomBarTools = useMemo(() => makeToolsList(drawingTools, actionTools, "bottom"), [drawingTools, actionTools]);
    const makeBottomBarDisplayMap = () => {
        const bottomDisplayMap = new Map();
        return actionTools.reduce((prev, curr) => {
            prev.set(curr.id, curr.getDisplayMode(getReactDrawContext()));
            return prev;
        }, bottomDisplayMap);
    };
    const updateBottomToolDisplayMap = () => {
        const newMap = makeBottomBarDisplayMap();
        if (newMap.size !== bottomToolsDisplayMap.size) {
            return setBottomToolsDisplayMap(newMap);
        }
        const newMapKeys = newMap.keys();
        for (const key of newMapKeys) {
            if (newMap.get(key) !== bottomToolsDisplayMap.get(key)) {
                return setBottomToolsDisplayMap(newMap);
            }
        }
    };
    useEffect(() => {
        updateBottomToolDisplayMap();
        if (onLoad) {
            onLoad(getReactDrawContext());
        }
    }, []);
    useEffect(() => {
        if (currentDrawingTool.id === SELECT_TOOL_ID) {
            const obj = objectToSelect.current;
            if (obj) {
                const ctx = getReactDrawContext();
                unselectEverything(ctx);
                ctx.fullState[SELECT_TOOL_ID].selectedIds = [obj.id];
                selectElement(obj, ctx);
                objectToSelect.current = null;
            }
        }
        updateBottomToolDisplayMap();
    }, [currentDrawingTool]);
    /**
     * Assumes that the object is on the view and in the renderedMap
     * Changes the tool to the select tool if not already.
     * then selects the object
     * @param data
     */
    const selectObject = (data) => {
        if (currentDrawingTool.id !== SELECT_TOOL_ID) {
            objectToSelect.current = data;
            return setCurrentDrawingTool(getToolById(drawingTools, SELECT_TOOL_ID));
        }
        const ctx = getReactDrawContext();
        unselectEverything(ctx);
        ctx.fullState[SELECT_TOOL_ID].selectedIds = [data.id];
        selectElement(data, ctx);
        updateBottomToolDisplayMap();
        alertSelected(getToolById(drawingTools, SELECT_TOOL_ID), ctx);
    };
    const getReactDrawContext = (viewC) => {
        const viewContainer = viewC || getViewContainer();
        const fullState = customState.current;
        return {
            viewContainer,
            objectsMap: renderedElementsMap.current,
            lastEvent: latestEvent.current,
            prevMousePosition: previousMousePos,
            drawingTools: drawingTools,
            fullState,
            undoStack: undoStack.current,
            redoStack: redoStack.current,
            shouldKeepHistory,
            shouldCornerResizePreserveRatio,
            selectDrawingTool: handleSelectDrawingTool,
            selectObject,
            shouldSelectAfterCreate,
            globalStyles: globalStyles.current
        };
    };
    function alertToolOfKeydown(e) {
        if (currentDrawingTool.onKeyPress) {
            currentDrawingTool.onKeyPress(e, getReactDrawContext());
            updateBottomToolDisplayMap();
        }
    }
    const getViewContainer = () => {
        const viewContainer = drawingAreaRef.current;
        if (!viewContainer) {
            throw new Error("no view container while resizing");
        }
        return viewContainer;
    };
    /**
     * @param eventTarget The target of the mouse or touch event
     * @param relativePoint a point [x, y] relative to the drawing area box
     * @returns
     */
    function startDraw(relativePoint) {
        const ctx = getReactDrawContext();
        const styles = { ...globalStyles.current };
        const currentMaxZindex = getCurrentHighestZIndex(ctx);
        const nextZindex = currentMaxZindex + 1;
        styles.zIndex = nextZindex.toString();
        const newDrawingData = makeNewBoundingDiv(relativePoint, styles, currentDrawingTool.id);
        currDrawObj.current = newDrawingData;
        ctx.viewContainer.append(newDrawingData.containerDiv);
        currentDrawingTool.onDrawStart(newDrawingData, ctx);
    }
    function drawing(relativePoint) {
        // need to do this first because currentDrawing data is null during
        // select mode.
        const currentDrawingData = currDrawObj.current;
        if (!currentDrawingData) {
            return;
        }
        const ctx = getReactDrawContext();
        currentDrawingData.coords.push(relativePoint);
        currentDrawingTool.onDrawing(currentDrawingData, ctx);
    }
    function endDraw(relativePoint) {
        const currentDrawingData = currDrawObj.current;
        // currentSelectMode.current = null;
        previousMousePos.current = null;
        currDrawObj.current = null;
        if (!currentDrawingData) {
            return;
        }
        currentDrawingData.coords.push(relativePoint);
        renderedElementsMap.current.set(currentDrawingData.id, currentDrawingData);
        currentDrawingTool.onDrawEnd(currentDrawingData, getReactDrawContext());
        updateBottomToolDisplayMap();
    }
    useEffect(() => {
        const container = drawingAreaRef.current;
        if (!container) {
            return;
        }
        function startDrawMouse(e) {
            latestEvent.current = e;
            const startPoint = [e.clientX, e.clientY];
            const relativePoint = getRelativePoint(startPoint, container);
            startDraw(relativePoint);
        }
        function drawMouse(e) {
            latestEvent.current = e;
            const point = [e.clientX, e.clientY];
            const relativePoint = getRelativePoint(point, container);
            drawing(relativePoint);
        }
        function endDrawMouse(e) {
            latestEvent.current = e;
            const point = [e.clientX, e.clientY];
            const relativePoint = getRelativePoint(point, container);
            endDraw(relativePoint);
        }
        function startDrawTouch(e) {
            latestEvent.current = e;
            e.preventDefault();
            const startPoint = getTouchCoords(e);
            const relativePoint = getRelativePoint(startPoint, container);
            startDraw(relativePoint);
        }
        function drawTouch(e) {
            latestEvent.current = e;
            e.preventDefault();
            const point = getTouchCoords(e);
            const relativePoint = getRelativePoint(point, container);
            drawing(relativePoint);
        }
        function endDrawTouch(e) {
            latestEvent.current = e;
            e.preventDefault();
            const startPoint = getTouchCoords(e);
            const relativePoint = getRelativePoint(startPoint, container);
            endDraw(relativePoint);
        }
        container.addEventListener("mousedown", startDrawMouse);
        container.addEventListener("mouseup", endDrawMouse);
        container.addEventListener("mousemove", drawMouse);
        container.addEventListener("touchstart", startDrawTouch, {
            passive: false,
        });
        container.addEventListener("touchmove", drawTouch, { passive: false });
        container.addEventListener("touchcancel", endDrawTouch, { passive: true });
        container.addEventListener("touchend", endDrawTouch, { passive: true });
        container.addEventListener("mouseleave", endDrawMouse);
        window.addEventListener("keydown", alertToolOfKeydown);
        return () => {
            container.removeEventListener("mousedown", startDrawMouse);
            container.removeEventListener("mouseup", endDrawMouse);
            container.removeEventListener("mousemove", drawMouse);
            container.removeEventListener("touchstart", startDrawTouch);
            container.removeEventListener("touchmove", drawTouch);
            container.removeEventListener("touchcancel", endDrawTouch);
            container.removeEventListener("touchend", endDrawTouch);
            container.removeEventListener("mouseleave", endDrawMouse);
            window.removeEventListener("keydown", alertToolOfKeydown);
            // avoid leaks. ex: if unmount while select tool, there would be leaked dom event handlers
            // container b/c ref will be gone
            const ctx = getReactDrawContext(container);
            for (const tool of drawingTools) {
                if (tool.onUnMount) {
                    tool.onUnMount(ctx);
                }
            }
        };
    }, [currentDrawingTool]);
    const responsiveSize = useRef({ width: 0, height: 0 });
    useEffect(() => {
        function handleResize() {
            const ctx = getReactDrawContext();
            const { viewContainer } = ctx;
            const newWidth = viewContainer.offsetWidth;
            const newHeight = viewContainer.offsetHeight;
            // adjust top, left and width, height of each object
            const heightRatio = newHeight / responsiveSize.current.height;
            const widthRatio = newWidth / responsiveSize.current.width;
            ctx.objectsMap.forEach((value) => {
                value.containerDiv.style.height = (value.containerDiv.offsetHeight * heightRatio) + "px";
                value.containerDiv.style.width = (value.containerDiv.offsetWidth * widthRatio) + "px";
                const prevLeft = getNumFrom(value.containerDiv.style.left);
                const prevTop = getNumFrom(value.containerDiv.style.top);
                const newLeft = prevLeft * widthRatio;
                const newTop = prevTop * heightRatio;
                value.containerDiv.style.left = newLeft + "px";
                value.containerDiv.style.top = newTop + 'px';
                const tool = getToolById(ctx.drawingTools, value.toolId);
                tool.onResize(value, { ...ctx,
                    shouldPreserveAspectRatio: shouldCornerResizePreserveRatio,
                    previousPoint: [prevLeft, prevTop],
                    newPoint: [newLeft, newTop] });
            });
            responsiveSize.current = { width: newWidth, height: newHeight };
        }
        const { viewContainer } = getReactDrawContext();
        if (!viewContainer) {
            return;
        }
        // 
        responsiveSize.current.width = viewContainer.offsetWidth;
        responsiveSize.current.height = viewContainer.offsetHeight;
        let observer = null;
        if (isResponsive) {
            // window.addEventListener("resize", handleResize);
            observer = new ResizeObserver(handleResize);
            observer.observe(viewContainer);
        }
        return () => {
            // window.removeEventListener("resize", handleResize);
            observer?.disconnect();
        };
    }, []);
    const handleSelectDrawingTool = (tool) => {
        const toolId = tool.id;
        if (currentDrawingTool.id !== toolId) {
            const selectedTool = getToolById(drawingTools, toolId);
            if (!!selectedTool) {
                const currentTool = currentDrawingTool;
                const currentCtx = getReactDrawContext();
                if (currentTool.onUnPickTool) {
                    currentTool.onUnPickTool(currentCtx);
                }
                if (selectedTool.onPickTool) {
                    selectedTool.onPickTool(currentCtx);
                }
                setCurrentDrawingTool(selectedTool);
                updateBottomToolDisplayMap();
            }
        }
    };
    const dispatchActionToolCtx = (cb) => {
        const ctx = getReactDrawContext();
        cb(ctx);
        updateBottomToolDisplayMap();
    };
    /**
      if single selected object return those
      if multiple return union
      if none return default */
    const handleGetEditProps = () => {
        const ctx = getReactDrawContext();
        const selectedIds = getSelectedIdsFromFullState(ctx);
        if (selectedIds.length === 0) {
            const styles = globalStyles.current;
            return styles;
        }
        const styles = getEditStylesFromSelected(selectedIds, ctx);
        return styles;
    };
    const handleUpdateStyles = (key, value) => {
        const ctx = getReactDrawContext();
        const selectedIds = getSelectedIdsFromFullState(ctx);
        if (selectedIds.length === 0) {
            globalStyles.current[key] = value;
            return [];
        }
        const selectObjects = selectedIds.map((id) => getObjectFromMap(ctx.objectsMap, id));
        const allActions = selectObjects.map((obj) => {
            const tool = getToolById(ctx.drawingTools, obj.toolId);
            const handlers = tool.styleHandlers;
            if (handlers && handlers[key]) {
                return handlers[key](obj, value, ctx);
            }
            return undefined;
        });
        // TODO: notify
        pushStyleUpdateToStack(allActions, ctx);
        return allActions;
    };
    const pushStyleUpdateToStack = (actions, ctx) => {
        const filterUndefined = actions.filter((isNotUndefined));
        if (filterUndefined.length === 0) {
            return;
        }
        const action = {
            data: filterUndefined,
            objectId: "",
            toolId: "",
            toolType: "batch",
            action: "batch"
        };
        pushActionToStack(action, ctx);
    };
    useEffect(() => {
        if (contextGetter) {
            contextGetter(getReactDrawContext);
        }
    }, []);
    return (React.createElement(React.Fragment, null,
        !hideTopBar && (React.createElement(TopToolBar, { tools: topBarTools, onClickActionTool: dispatchActionToolCtx, onSelectDrawingTool: handleSelectDrawingTool, currentTool: currentDrawingTool.id })),
        React.createElement("div", { id: drawingAreaId.current, style: {
                position: "relative",
                width: "100%",
                flex: 1,
                overflow: 'hidden',
                boxSizing: "border-box",
            }, ref: drawingAreaRef },
            React.createElement(AlertMessage, null),
            children),
        !hideBottomBar && (React.createElement(BottomToolBar, { displayMap: bottomToolsDisplayMap, tools: bottomBarTools, onSelectDrawingTool: handleSelectDrawingTool, onClickActionTool: dispatchActionToolCtx, stylesMenu: {
                getEditProps: handleGetEditProps,
                styleComponents: styleComponents,
                onUpdateStyle: handleUpdateStyles,
            } }, menuComponents.map((MenuItem, i) => {
            return React.createElement(MenuItem, { key: i, getContext: getReactDrawContext });
        }))),
        React.createElement("style", null, `
		#${drawingAreaId.current} {
			cursor: ${currentDrawingTool.cursor || "default"};
		}
	  `)));
}
function getToolById(tools, id) {
    const tool = tools.find((t) => t.id === id);
    if (!tool) {
        throw new Error("could not find the used tool");
    }
    return tool;
}
function setupCustomStateSpace(tools) {
    const state = {
        [SELECT_TOOL_ID]: {
            selectedIds: [],
            handlers: {},
            prevPoint: null,
        },
        [ERASE_TOOL_ID]: {
            deletedObjects: new Map(),
        },
    };
    return tools.reduce((prev, curr) => {
        if (prev[curr.id] === undefined) {
            prev[curr.id] = {};
        }
        if (curr.setupCustomState) {
            prev[curr.id] = Object.assign(prev[curr.id], curr.setupCustomState(state));
        }
        return prev;
    }, state);
}
function unselectEverything(ctx) {
    const currSelected = ctx.fullState[SELECT_TOOL_ID].selectedIds;
    if (currSelected.length > 0) {
        const objects = getSelectedDrawingObjects(currSelected, ctx.objectsMap);
        unselectAll(objects, ctx);
    }
    return;
}
const defaultEditableProps = {
    lineWidth: "4",
    zIndex: "1",
    color: "#000000",
    fontSize: "14",
    background: "transparent",
    opacity: "1",
};
// TODO: accept default styles as a react-draw prop
function setupGlobalStyles(topBarTools) {
    const styles = {
        ...defaultEditableProps,
    };
    return styles;
}
function getEditStylesFromSelected(selectedIds, ctx) {
    const styles = {};
    const selectedObjects = selectedIds.map((i) => getObjectFromMap(ctx.objectsMap, i));
    // count so that only shared keys are allowed
    const counter = {};
    for (const object of selectedObjects) {
        const tool = getToolById(ctx.drawingTools, object.toolId);
        if (tool.styleHandlers) {
            const toolsAllowedStyles = Object.keys(tool.styleHandlers);
            for (const key of toolsAllowedStyles) {
                // TODO
                const currentObjectValue = object.style[key];
                if (currentObjectValue) {
                    styles[key] = currentObjectValue;
                    counter[key] = (counter[key] || 0) + 1;
                }
                else {
                    console.error("could not get style value for key:", key, "from object", object);
                }
            }
        }
    }
    for (const key in counter) {
        if (counter[key] !== selectedObjects.length) {
            delete styles[key];
        }
    }
    //   console.log("getEditStylesFromSelected:", styles);
    return styles;
}
