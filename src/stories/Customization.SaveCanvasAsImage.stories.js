import React, { useRef } from "react";
import { ReactDraw, selectTool, freeDrawTool, circleTool } from "../index";
const meta = {
    title: "Customization Examples/Save Canvas As Image",
    component: ReactDraw,
};
export default meta;
function Wrapper(args) {
    const contextGetterRef = useRef();
    const setContextGetter = (getCtx) => {
        contextGetterRef.current = getCtx;
    };
    const handleDownload = () => {
        const getter = contextGetterRef.current;
        if (!getter)
            throw new Error("Ctx getter not set");
        const ctx = getter();
        // naive image capture: HTML to canvas via foreignObject (works best in modern browsers)
        const node = ctx.viewContainer;
        const svg = new XMLSerializer().serializeToString(node.cloneNode(true));
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "reactdraw-canvas.svg";
        a.click();
        URL.revokeObjectURL(url);
    };
    return (React.createElement("div", { style: { display: "flex", gap: 10 } },
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
            React.createElement("button", { onClick: handleDownload }, "Download as SVG")),
        React.createElement(ReactDraw, { ...args, contextGetter: setContextGetter, drawingTools: [selectTool, freeDrawTool, circleTool] })));
}
export const SaveCanvasAsImage = {
    render: (args) => React.createElement(Wrapper, { ...args }),
};
