import React, { useRef, useState } from "react";
import { circleTool, squareTool, selectTool, freeDrawTool, diamondTool, straightLineTool, textAreaTool, eraseTool, undoTool, redoTool, trashTool, duplicateTool, bringBackTool, bringForwardTool, ColorStyle, BackgroundStyle, LineWidthStyle, OpacityStyle, arrowTool, ClearAllButton, FontSizeStyle, COLORS, serializeFreeDraw, deserializeFreeDraw, serializeObjects, deserializeData, useStyles, serializeSquare, deserializeSquare, serializeCircle, deserializeCircle, serializeDiamond, deserializeDiamond, serializeLine, deserializeLine, serializeText, deserializeTextArea, serializeArrow, deserializeArrow, getViewCenterPoint, createCircle, createImage, selectAll, duplicateSelectedObjects, bringSelectedBack, moveSelectedForward, deletedSelected, getSelectedObjects, createText, updateSelectedObjectsStyle, ReactDraw, } from "../index";
import { DownloadIcon } from "@jzohdi/jsx-icons";
const meta = {
    title: "ReactDraw",
    component: ReactDraw,
    argTypes: {
        layout: { control: "select", options: ["default", "fit"] },
        hideTopBar: { control: "boolean" },
        hideBottomBar: { control: "boolean" },
        shouldKeepHistory: { control: "boolean" },
        shouldSelectAfterCreate: { control: "boolean" },
        isResponsive: { control: "boolean" },
        shouldCornerResizePreserveRatio: { control: "boolean" },
        id: { control: "text" },
    },
};
export default meta;
const drawingTools = [
    selectTool,
    freeDrawTool,
    squareTool,
    circleTool,
    diamondTool,
    straightLineTool,
    textAreaTool,
    arrowTool,
    eraseTool,
];
const actionTools = [
    undoTool,
    redoTool,
    trashTool,
    duplicateTool,
    bringBackTool,
    bringForwardTool,
];
export const Playground = {
    args: {
        drawingTools,
        actionTools,
        shouldSelectAfterCreate: true,
        isResponsive: false,
        shouldCornerResizePreserveRatio: false,
        styleComponents: {
            color: { order: 3, component: ColorStyle },
            background: { order: 4, component: BackgroundStyle },
            lineWidth: { order: 1, component: LineWidthStyle },
            opacity: { order: 0, component: OpacityStyle },
            fontSize: { order: 2, component: FontSizeStyle },
        },
        menuComponents: [ClearAllButton],
    },
};
export const FreeDrawOnly = {
    args: {
        drawingTools: [freeDrawTool],
        hideTopBar: true,
        hideBottomBar: true,
        shouldSelectAfterCreate: false,
        shouldKeepHistory: false,
    },
};
const serializers = {
    [freeDrawTool.id]: serializeFreeDraw,
    [squareTool.id]: serializeSquare,
    [circleTool.id]: serializeCircle,
    [diamondTool.id]: serializeDiamond,
    [straightLineTool.id]: serializeLine,
    [textAreaTool.id]: serializeText,
    [arrowTool.id]: serializeArrow,
};
const deserializers = {
    [freeDrawTool.id]: deserializeFreeDraw,
    [squareTool.id]: deserializeSquare,
    [circleTool.id]: deserializeCircle,
    [diamondTool.id]: deserializeDiamond,
    [straightLineTool.id]: deserializeLine,
    [textAreaTool.id]: deserializeTextArea,
    [arrowTool.id]: deserializeArrow,
};
const inputId = "save-canvas-button";
const SaveCanvas = ({ getContext }) => {
    const classes = useStyles("saveCanvasComponent");
    const ref = useRef(null);
    const handleSaveCanvas = () => {
        const ctx = getContext();
        const data = serializeObjects(serializers, ctx);
        if (window)
            window.localStorage.setItem("react-draw-saved-data", data);
    };
    return (React.createElement("button", { className: classes, id: inputId, onClick: handleSaveCanvas, ref: ref },
        React.createElement("div", { style: { padding: "0px 5px", height: 15 } },
            React.createElement(DownloadIcon, { height: 15, width: 20 })),
        React.createElement("label", { htmlFor: inputId, style: { padding: "0px 10px", pointerEvents: "none" } }, "Save Canvas")));
};
export const SaveAndLoadJson = {
    args: {
        drawingTools,
        shouldSelectAfterCreate: true,
        menuComponents: [SaveCanvas, ClearAllButton],
        shouldKeepHistory: false,
        onLoad(ctx) {
            const savedData = localStorage.getItem("react-draw-saved-data");
            if (savedData)
                deserializeData(savedData, deserializers, ctx);
        },
        styleComponents: {
            color: { order: 3, component: ColorStyle },
            background: { order: 4, component: BackgroundStyle },
            lineWidth: { order: 1, component: LineWidthStyle },
            opacity: { order: 0, component: OpacityStyle },
            fontSize: { order: 2, component: FontSizeStyle },
        },
        styles: {
            saveCanvasComponent: {
                width: 180,
                fontSize: 16,
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                borderRadius: 5,
                cursor: "pointer",
                padding: "7px 10px",
                backgroundColor: "white",
                marginBottom: 10,
                boxSizing: "border-box",
                border: `1px solid ${COLORS.primary.main}`,
                "&:hover": { backgroundColor: COLORS.primary.light },
            },
        },
    },
};
const circleToolCopy = Object.assign({}, circleTool);
// hide from top bar by removing icon
delete circleToolCopy.icon;
const imageToolId = "my-image-tool-id";
const imageTool = {
    id: imageToolId,
    onDrawEnd() { },
    onDrawing() { },
    onDrawStart() { },
    onResize() { },
};
function ExternalControlsWrapper(args) {
    const contextGetterRef = useRef();
    const [numSelected, setNumSelected] = useState(0);
    const setContextGetter = (getCtx) => {
        contextGetterRef.current = getCtx;
    };
    const getCtx = () => {
        const getter = contextGetterRef.current;
        if (!getter)
            throw new Error("Ctx getter not set");
        return getter();
    };
    const handleSelectedToolEvent = (_event) => {
        const selected = getSelectedObjects(getCtx());
        setNumSelected(selected.length);
    };
    const handleClickAddCircle = () => {
        const ctx = getCtx();
        const centerPoint = getViewCenterPoint(ctx);
        createCircle(ctx, {
            pointA: centerPoint,
            pointB: [centerPoint[0] + 100, centerPoint[1] + 100],
            toolId: circleTool.id,
        });
    };
    const handleClickAddImage = () => {
        const ctx = getCtx();
        const centerPoint = getViewCenterPoint(ctx);
        const loadingEle = document.createElement("p");
        loadingEle.innerHTML = " loading...";
        createImage(ctx, {
            pointA: centerPoint,
            pointB: [centerPoint[0] + 100, centerPoint[1] + 100],
            toolId: imageTool.id,
            url: "https://picsum.photos/200",
            showLoading: true,
            loadingElement: loadingEle,
        });
    };
    const handleAddCustomText = (editable) => {
        const ctx = getCtx();
        const toolId = textAreaTool.id;
        if (!editable) {
            createText(ctx, { text: "hello, world", toolId, editable: false });
            return;
        }
        createText(ctx, {
            text: "hello, world",
            toolId,
            useTextToolDefaults: true,
        });
    };
    const handleSelectAll = () => selectAll(getCtx());
    const duplicateSelected = () => duplicateSelectedObjects(getCtx());
    const moveSelectedBack = () => bringSelectedBack(getCtx());
    const moveForward = () => moveSelectedForward(getCtx());
    const handleDelete = () => deletedSelected(getCtx());
    const handleUpdateStyles = (key, value) => updateSelectedObjectsStyle(getCtx(), key, value);
    if (selectTool.subscribe)
        selectTool.subscribe(handleSelectedToolEvent);
    return (React.createElement("div", null,
        React.createElement("div", { style: { display: "flex", gap: 10 } },
            React.createElement("div", { style: { paddingTop: 10, display: "flex", flexDirection: "column" } },
                React.createElement("div", null,
                    "Num Selected Items: ",
                    numSelected),
                React.createElement("button", { onClick: handleClickAddCircle }, "Add Circle"),
                React.createElement("button", { onClick: handleClickAddImage }, "Add Picture"),
                React.createElement("button", { onClick: handleSelectAll }, "Select All"),
                React.createElement("button", { onClick: duplicateSelected }, "Duplicate Selected"),
                React.createElement("button", { onClick: moveSelectedBack }, "Move Selected Back"),
                React.createElement("button", { onClick: moveForward }, "Move Selected Forward"),
                React.createElement("button", { onClick: handleDelete }, "Delete Selected"),
                React.createElement("button", { onClick: () => handleAddCustomText(true) }, "Add some editable text"),
                React.createElement("button", { onClick: () => handleAddCustomText(false) }, "Add some not editable text"),
                numSelected > 0 && (React.createElement("div", null,
                    React.createElement("label", null, "Stroke color"),
                    React.createElement("input", { type: "color", onChange: (e) => handleUpdateStyles("color", e.target.value) })))),
            React.createElement(ReactDraw, { ...args, contextGetter: setContextGetter }))));
}
export const ExternalControls = {
    render: (args) => React.createElement(ExternalControlsWrapper, { ...args }),
    args: {
        drawingTools: [selectTool, circleToolCopy, imageTool, textAreaTool],
        shouldKeepHistory: false,
        shouldSelectAfterCreate: true,
        hideTopBar: true,
    },
};
export const CustomizeStyles = {
    args: {
        drawingTools,
        actionTools,
        shouldKeepHistory: true,
        shouldSelectAfterCreate: true,
        styles: {
            toolIconWrapper: {
                "&:hover": { backgroundColor: "red" },
            },
            bottomToolButton: {
                '&[data-disabled="false"]:hover': { backgroundColor: "black" },
                '&[data-disabled="false"]:hover > svg path': {
                    fill: "white",
                    stroke: "white",
                },
            },
        },
    },
};
