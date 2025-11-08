import React, { useMemo } from "react";
import {
  ReactDraw,
  selectTool,
  freeDrawTool,
  squareTool,
  circleTool,
  diamondTool,
  straightLineTool,
  textAreaTool,
  arrowTool,
  eraseTool,
  undoTool,
  redoTool,
  trashTool,
  duplicateTool,
  bringBackTool,
  bringForwardTool,
  ColorStyle,
  BackgroundStyle,
  LineWidthStyle,
  OpacityStyle,
  FontSizeStyle,
  ClearAllButton,
} from "@jzohdi/react-draw";

export default function App() {
  const topTools = useMemo(
    () => [
      selectTool,
      freeDrawTool,
      squareTool,
      circleTool,
      diamondTool,
      straightLineTool,
      textAreaTool,
      arrowTool,
      eraseTool,
    ],
    []
  );

  const bottomTools = useMemo(
    () => [undoTool, redoTool, trashTool, duplicateTool, bringBackTool, bringForwardTool],
    []
  );

  return (
    <div className="app">
      <header className="app__header">
        <h1>React Draw – Basic Demo</h1>
        <p>All of the drawing tools are wired up using plain JavaScript React components.</p>
      </header>
      <div className="app__canvas">
        <ReactDraw
          id="basic-demo"
          drawingTools={topTools}
          actionTools={bottomTools}
          shouldSelectAfterCreate
          styleComponents={{
            color: { order: 3, component: ColorStyle },
            background: { order: 4, component: BackgroundStyle },
            lineWidth: { order: 1, component: LineWidthStyle },
            opacity: { order: 0, component: OpacityStyle },
            fontSize: { order: 2, component: FontSizeStyle },
          }}
          menuComponents={[ClearAllButton]}
        >
          <div className="app__canvas-placeholder">Start drawing on the canvas!</div>
        </ReactDraw>
      </div>
    </div>
  );
}
