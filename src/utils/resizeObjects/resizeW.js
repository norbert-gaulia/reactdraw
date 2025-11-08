import { getDiffCoords, unifiedResizeFunction } from "../resizeObject";
import { forcePreserveAspectRatio } from "./aspectRatio";
/**
 * If given param "aspectRatio", the function will try to resize
 * using a possibly different dx by calculating to preserve the
 * current aspect ratio
 */
export function resizeW(data, ctx, aspectRatio) {
    let dXdY = getDiffCoords(data, ctx);
    if (aspectRatio !== undefined) {
        const [xDiff, _yDiff] = forcePreserveAspectRatio(dXdY, data, aspectRatio);
        return unifiedResizeFunction(data, [xDiff / 2, 0], [-xDiff, 0]);
    }
    return unifiedResizeFunction(data, [dXdY[0] / 2, 0], [-dXdY[0], 0]);
}
