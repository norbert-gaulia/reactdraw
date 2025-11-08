export function isDrawingTool(tool) {
  return tool.onDrawStart !== undefined;
}

export function isActionTool(tool) {
  return tool.getDisplayMode !== undefined;
}
