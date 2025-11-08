import React, { forwardRef, } from "react";
const defaultWidth = 500;
const defaultHeight = 500;
function getStyles(layout) {
    if (layout === "default") {
        return { width: defaultWidth, height: defaultHeight, maxWidth: "100%" };
    }
    if (layout === "fit") {
        return { maxWidth: "100%" };
    }
    return {
        width: layout.width,
        height: layout.width,
    };
}
const defaultStyles = {
    boxShadow: "#000000 0px 1px 3px 0px",
    borderRadius: 4,
    //   overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    fontFamily: "sans-serif",
};
export default forwardRef(function Container({ children, layout, style }, ref) {
    const styles = getStyles(layout);
    let combinedStyles = {
        ...defaultStyles,
        ...styles,
    };
    if (style !== undefined) {
        combinedStyles = {
            ...combinedStyles,
            ...style,
        };
    }
    return (React.createElement("div", { style: combinedStyles, ref: ref }, children));
});
