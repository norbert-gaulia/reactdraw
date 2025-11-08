import React, { useRef } from "react";
import { ReactDraw, getViewCenterPoint, createImage, selectTool, textAreaTool, circleTool, freeDrawTool, } from "../index";
const imageToolId = "custom-image-tool";
const imageTool = {
    id: imageToolId,
    onDrawStart() { },
    onDrawing() { },
    onDrawEnd() { },
    onResize() { },
};
const meta = {
    title: "Customization Examples/Add Images To Canvas",
    component: ReactDraw,
};
export default meta;
function Wrapper(args) {
    const contextGetterRef = useRef();
    const setContextGetter = (getCtx) => {
        contextGetterRef.current = getCtx;
    };
    const handleAddImage = async () => {
        const getter = contextGetterRef.current;
        if (!getter)
            throw new Error("Ctx getter not set");
        const ctx = getter();
        const center = getViewCenterPoint(ctx);
        const loading = document.createElement("p");
        loading.innerHTML = " loading...";
        await createImage(ctx, {
            pointA: center,
            pointB: [center[0] + 160, center[1] + 120],
            toolId: imageTool.id,
            url: "https://picsum.photos/320/240",
            showLoading: true,
            loadingElement: loading,
        });
    };
    return (React.createElement("div", { style: { display: "flex", gap: 10 } },
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
            React.createElement("button", { onClick: handleAddImage }, "Add Random Image")),
        React.createElement(ReactDraw, { ...args, contextGetter: setContextGetter, drawingTools: [
                selectTool,
                imageTool,
                freeDrawTool,
                circleTool,
                textAreaTool,
            ], hideTopBar: false })));
}
export const AddImages = {
    render: (args) => React.createElement(Wrapper, { ...args }),
};
