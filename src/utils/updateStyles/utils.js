export function actionObjToSave(data, action, saveValue) {
    const obj = {
        objectId: data.id,
        toolId: data.toolId,
        toolType: "top-bar-tool",
        action: action,
        data: saveValue,
    };
    return obj;
}
export function setContainerStyles(data) {
    const div = data.containerDiv;
    div.style.backgroundColor = data.style.background;
    div.style.borderRadius = "2px";
    div.style.boxSizing = "border-box";
    div.style.color = data.style.color;
    div.style.opacity = data.style.opacity;
    div.style.fontSize = `${data.style.fontSize}px`;
    return data;
}
export function getInnerEleFromSvg(data) {
    const svg = data.element;
    if (!svg) {
        throw new Error();
    }
    let path = svg.querySelector("path");
    if (!path) {
        path = svg.querySelector("line");
    }
    if (!path) {
        throw new Error();
    }
    return path;
}
