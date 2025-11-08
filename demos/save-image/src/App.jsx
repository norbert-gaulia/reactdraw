import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ReactDraw,
  selectTool,
  freeDrawTool,
  circleTool,
  arrowTool,
  textAreaTool,
  undoTool,
  redoTool,
  trashTool,
  ColorStyle,
  LineWidthStyle,
  OpacityStyle,
} from "@jzohdi/react-draw";

export default function App() {
  const contextGetter = useRef(null);
  const [svgMarkup, setSvgMarkup] = useState("");

  const drawingTools = useMemo(
    () => [selectTool, freeDrawTool, circleTool, arrowTool, textAreaTool],
    []
  );
  const actionTools = useMemo(() => [undoTool, redoTool, trashTool], []);

  const handleContextGetter = useCallback((getter) => {
    contextGetter.current = getter;
  }, []);

  const getSerializedCanvas = useCallback(() => {
    const getter = contextGetter.current;
    if (!getter) {
      return null;
    }
    const ctx = getter();
    const clone = ctx.viewContainer.cloneNode(true);
    const serializer = new XMLSerializer();
    const markup = serializer.serializeToString(clone);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`;
  }, []);

  const handleDownload = useCallback(() => {
    const markup = getSerializedCanvas();
    if (!markup) {
      return;
    }
    setSvgMarkup(markup);
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reactdraw-canvas.svg";
    link.click();
    URL.revokeObjectURL(link.href);
  }, [getSerializedCanvas]);

  const handlePreview = useCallback(() => {
    const markup = getSerializedCanvas();
    if (markup) {
      setSvgMarkup(markup);
    }
  }, [getSerializedCanvas]);

  return (
    <div className="app">
      <div>
        <h1>React Draw – Save Image</h1>
        <p>Draw something, then export the canvas as an SVG image using only vanilla JavaScript React.</p>
      </div>

      <div className="controls">
        <button className="download" onClick={handleDownload} type="button">
          Download as SVG
        </button>
        <button onClick={handlePreview} type="button">
          Show SVG markup
        </button>
      </div>

      <ReactDraw
        id="save-image-demo"
        drawingTools={drawingTools}
        actionTools={actionTools}
        contextGetter={handleContextGetter}
        shouldSelectAfterCreate
        styleComponents={{
          color: { order: 1, component: ColorStyle },
          lineWidth: { order: 0, component: LineWidthStyle },
          opacity: { order: 2, component: OpacityStyle },
        }}
      />

      {svgMarkup && (
        <section className="preview" aria-live="polite">
          {svgMarkup}
        </section>
      )}
    </div>
  );
}
