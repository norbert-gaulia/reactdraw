import { getBoxSize } from "..";
const MARGIN_OF_ERROR = 0.01;
/**
 * takes dx or dy and returns one of these number based on the current aspect ratio.
 * for example if direction is N (north) and dx is larger than the aspect ratio, this
 * function will return a new dY that is calculated on dx.
 * @param dx
 * @param dy
 * @param data
 * @param ctx
 * @param direction
 * @returns
 */
export function forcePreserveAspectRatio([dX, dY], data, { direction, targetAspectRatio }) {
    const aspectX = getXFunction(direction);
    const aspectY = getYFunction(direction);
    const reverseFlag = getReverseFlag(direction);
    const dirFlag = getDirectionFlag(direction, dX, dY);
    const inputs = {
        dX,
        dY,
        currAR: targetAspectRatio,
        dirFlag,
        reverseFlag,
    };
    console.log(targetAspectRatio);
    const pointsWithAspect = [aspectX(inputs), aspectY(inputs)];
    return pointsWithAspect;
}
function getXFunction(direction) {
    return (input) => {
        const dir = direction[0];
        const x = Math.abs(input.dX);
        const y = Math.abs(input.dY);
        const changeAr = x / y;
        switch (dir) {
            case "E":
            case "W":
                if (input.dY === 0) {
                    return input.dX;
                }
                // if the change in aspect is greater than the current,
                // means that X is greater in proportion and therefore should be used as
                // the source of size = return dX (no change)
                if (changeAr > input.currAR) {
                    return input.dX;
                }
                const output = y * input.currAR * input.dirFlag * input.reverseFlag;
                return output;
            default:
                return input.dX;
        }
    };
}
function getYFunction(direction) {
    return (input) => {
        const x = Math.abs(input.dX);
        const y = Math.abs(input.dY);
        const dir = direction[0];
        const changeAr = x / y;
        switch (dir) {
            case "N":
            case "S":
                if (input.dX === 0) {
                    return input.dY;
                }
                // if the change in aspect is less than the current,
                // means that Y is greater in proportion and therefore should be used as
                // the source of size = return dY (no change)
                if (changeAr < input.currAR) {
                    return input.dY;
                }
                const output = (x / input.currAR) * input.dirFlag * input.reverseFlag;
                return output;
            default:
                return input.dY;
        }
    };
}
function getReverseFlag(direction) {
    if (direction[1] === "S" || direction[1] === "W") {
        return -1;
    }
    return 1;
}
function getDirectionFlag(direction, dX, dY) {
    const dir = direction[0];
    switch (dir) {
        case "N":
            return dX < 0 ? 1 : -1;
        case "S":
            return dX < 0 ? -1 : 1;
        case "E":
            return dY < 0 ? 1 : -1;
        case "W":
            return dY < 0 ? -1 : 1;
    }
    throw new Error("should not get here" + JSON.stringify({ direction, dX, dY }));
}
export function getCurrentAspectRatio(data) {
    const { width, height } = getBoxSize(data);
    // const currentAspectRatio = round(width / height, 5);
    return width / height;
}
export function getAspectRatioInput(data, ctx, direction) {
    return {
        targetAspectRatio: getCurrentAspectRatio(data),
        direction,
    };
}
