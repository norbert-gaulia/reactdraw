import React, { forwardRef } from "react";
import Container from "./Container";
import { Children } from "react";
import { AlertMessageProvider } from "../Alerts";
import ReactDraw from "./ReactDraw";
import { StylesProvider } from "../Styles/context";
export default forwardRef(function ReactDrawWrapper({ children, styles, style, classNames, ...props }, ref) {
    const { layout } = validateProps(children, props.layout);
    return (React.createElement(StylesProvider, { styles: styles, classNames: classNames },
        React.createElement(AlertMessageProvider, null,
            React.createElement(Container, { layout: layout, ref: ref, style: style },
                React.createElement(ReactDraw, { ...props }, children)))));
});
function validateProps(children, layout) {
    const numChildren = Children.count(children);
    if (numChildren > 1) {
        throw new Error("ReactDraw expects either 0 or 1 children, detected more.");
    }
    if (layout === undefined) {
        layout = "default";
    }
    return { numChildren, layout };
}
