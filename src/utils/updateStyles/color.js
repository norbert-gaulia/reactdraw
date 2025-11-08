import { actionObjToSave, getInnerEleFromSvg } from "./utils";
const colorRegex = /^(#([0-9A-F]{3}){1,2}|transparent)$/i;
function updateSvgStyle(data, dataKey, svgKey, value) {
    if (!value.match(colorRegex)) {
        return undefined;
    }
    const path = getInnerEleFromSvg(data);
    const currColor = data.style[dataKey];
    path.style[svgKey] = value;
    //   console.log(path, svgKey, value);
    data.style[dataKey] = value;
    return actionObjToSave(data, dataKey, currColor);
}
export function updateSvgPathStroke(data, value) {
    return updateSvgStyle(data, "color", "stroke", value);
}
export function updateSvgPathFill(data, value) {
    return updateSvgStyle(data, "background", "fill", value);
}
export function updateEleBackgroundColor(data, value) {
    const { ele, action } = updateEleStyle(data, value, "background");
    if (!action) {
        return action;
    }
    ele.style.backgroundColor = value;
    return action;
}
function updateEleStyle(data, value, key) {
    const ele = data.element;
    if (!ele) {
        throw new Error();
    }
    if (!value.match(colorRegex)) {
        return { ele, action: undefined };
    }
    const currColor = data.style[key];
    data.style[key] = value;
    const action = actionObjToSave(data, key, currColor);
    return {
        ele,
        action,
    };
}
export function updateEleBorderColor(data, value) {
    const { ele, action } = updateEleStyle(data, value, "color");
    if (!action) {
        return action;
    }
    ele.style.border = borderFromStyles(data.style);
    return action;
}
export function borderFromStyles(styles) {
    return `${styles.lineWidth}px solid ${styles.color}`;
}
export function updateTextColor(data, value) {
    return updateTextStyle(data, "color", "color", value);
}
export function updateTextBackgroundColor(data, value) {
    return updateTextStyle(data, "background", "backgroundColor", value);
}
function updateTextStyle(data, dataKey, divKey, value) {
    if (!value.match(colorRegex)) {
        return undefined;
    }
    const currColor = data.style[dataKey];
    data.style[dataKey] = value;
    data.containerDiv.style[divKey] = value;
    return actionObjToSave(data, dataKey, currColor);
}
