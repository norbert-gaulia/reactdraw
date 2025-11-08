import { getBoxSize } from ".";
import { getRotateFromDiv } from "./select/getRotateFromDiv";
import { getCenterPoint } from "./utils";
export function getDiffCoords(data, ctx) {
    const center = getCenterPoint(getBoxSize(data));
    const currRotation = getRotateFromDiv(data.containerDiv);
    if (currRotation === 0) {
        return [
            ctx.newPoint[0] - ctx.previousPoint[0],
            ctx.newPoint[1] - ctx.previousPoint[1],
        ];
    }
    const [relativePrevX, relativePrevY] = getPointRelativeToOther(ctx.previousPoint, center);
    const [relativeNewX, relativeNewY] = getPointRelativeToOther(ctx.newPoint, center);
    // const [rotatedPrevX, rotatedPrevY] = rotatePointAroundOrigin(relativePrevX, relativePrevY, currRotation);
    const rotatedPrev = rotatePointAroundOrigin(relativePrevX, relativePrevY, -currRotation);
    // const [rotatedNewX, rotatedNewY] = rotatePointAroundOrigin(relativeNewX, relativeNewY, currRotation);
    const rotatedNew = rotatePointAroundOrigin(relativeNewX, relativeNewY, -currRotation);
    return getPointRelativeToOther(rotatedNew, rotatedPrev);
}
/**
 * All you have to do is:
 * <ol>
 * 	<li>calculate the new center</li>
 *  <li>calculate new height and new width</li>
 *  <li>the new top left will be half of these distances from the new cneter</li>
 * <ol>
 */
export function unifiedResizeFunction(data, changeInCenter, changeInDimensions) {
    const [centerDx, centerDy] = changeInCenter;
    const [dX, dY] = changeInDimensions;
    const bounds = getBoxSize(data);
    const div = data.containerDiv;
    const currentRotation = getRotateFromDiv(div);
    const [previousCenterX, previousCenterY] = getCenterPoint(bounds);
    const [newNormalizedCenterX, newNormalizedCenterY] = rotatePointAroundOrigin(centerDx, centerDy, currentRotation);
    const newHeight = bounds.height + dY;
    const newWidth = bounds.width + dX;
    if (newWidth < 10 || newHeight < 10) {
        return false;
    }
    const distanceFromNewCenterToTop = newHeight / 2;
    const distanceFromNewCenterToLeft = newWidth / 2;
    const newNormalizedCornerX = newNormalizedCenterX - distanceFromNewCenterToLeft;
    const newNormalizedCornerY = newNormalizedCenterY + distanceFromNewCenterToTop;
    const newTop = previousCenterY - newNormalizedCornerY;
    const newLeft = newNormalizedCornerX + previousCenterX;
    div.style.top = newTop + "px";
    div.style.left = newLeft + "px";
    div.style.width = newWidth + "px";
    div.style.height = newHeight + "px";
    return true;
}
export function slideCornerOnAnAngle(currPoint, angle, yDiff) {
    const [x, y] = currPoint;
    return [x + Math.cos(x), y + Math.sin(y)];
}
export function getPointRelativeToOther(point, other) {
    const [previousCenterX, previousCenterY] = other;
    const [previousCornerX, previousCornerY] = point;
    const relativeCornerY = previousCenterY - previousCornerY;
    const relativeCornerX = previousCornerX - previousCenterX;
    return [relativeCornerX, relativeCornerY];
}
const RESIZE_ROUNDING = 5;
export function rotatePointAroundOrigin(x, y, theta) {
    // Convert theta from degrees to radians
    const radians = theta * (Math.PI / 180);
    // Apply the rotation formulas
    const rotatedX = x * Math.cos(radians) + y * Math.sin(radians);
    const rotatedY = -x * Math.sin(radians) + y * Math.cos(radians);
    return [round(rotatedX, RESIZE_ROUNDING), round(rotatedY, RESIZE_ROUNDING)];
}
export function round(num, decimals) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(num * multiplier) / multiplier;
}
export function rotatePointAroundAnotherPoint(px, py, cx, cy, theta) {
    // Convert theta from degrees to radians
    const radians = theta * (Math.PI / 180);
    // Translate point to origin
    const translatedX = px - cx;
    const translatedY = py - cy;
    // Rotate the point around the origin
    const rotatedX = translatedX * Math.cos(radians) - translatedY * Math.sin(radians);
    const rotatedY = translatedX * Math.sin(radians) + translatedY * Math.cos(radians);
    // Translate the point back
    const finalX = rotatedX + cx;
    const finalY = rotatedY + cy;
    return [round(finalX, RESIZE_ROUNDING), round(finalY, RESIZE_ROUNDING)];
}
