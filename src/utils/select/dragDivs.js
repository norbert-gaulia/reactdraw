import { getBoxSize } from "..";
export function dragDivs(objects, prevPoint, newPoint) {
    const [currentMouseX, currentMouseY] = newPoint;
    const [prevMouseX, prevMouseY] = prevPoint;
    const newLeft = currentMouseX - prevMouseX;
    const newTop = currentMouseY - prevMouseY;
    for (const obj of objects) {
        const div = obj.containerDiv;
        const bounds = getBoxSize(obj);
        const { left, top } = bounds;
        div.style.top = top + newTop + "px";
        div.style.left = left + newLeft + "px";
    }
}
