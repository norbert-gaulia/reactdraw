export function pushActionToStack(action, ctx) {
    if (ctx.shouldKeepHistory) {
        ctx.undoStack.push(action);
        // console.log("before:", ctx.redoStack);
        ctx.redoStack.splice(0);
        // console.log("after:", ctx.redoStack);
    }
}
