import React, { createContext, useRef, useEffect } from "react";
import cssFromState from "./makeStyles";
import * as componentStyles from "./ComponentStyles";
// export type StylesContextValue = [GetStylesFn, UpdateStylesFn];
export const StylesContext = createContext(() => "");
function classNamesToMap(classNames) {
    const classNamesMap = new Map();
    if (!classNames) {
        return classNamesMap;
    }
    for (const key in classNames) {
        const value = classNames[key];
        if (value !== undefined) {
            classNamesMap.set(key, value);
        }
    }
    return classNamesMap;
}
function deepMergeStyles(reactDrawStyles, userStyles) {
    for (const key in userStyles) {
        const value = userStyles[key];
        if (typeof value === undefined)
            continue;
        if (typeof value === "string" || typeof value === "number") {
            reactDrawStyles[key] = value;
        }
        else if (typeof value === "object" &&
            reactDrawStyles[key] === undefined) {
            reactDrawStyles[key] = value;
        }
        else if (typeof value === "object") {
            deepMergeStyles(reactDrawStyles[key], value);
        }
    }
}
function mergeStyles(reactDrawStyles, userDefinedStyles, classNamesMap) {
    if (!userDefinedStyles) {
        return reactDrawStyles;
    }
    for (const key in userDefinedStyles) {
        if (key === undefined)
            continue;
        const userStyles = userDefinedStyles[key];
        if (userStyles === undefined)
            continue;
        if (reactDrawStyles[key] === undefined) {
            reactDrawStyles[key] = userStyles;
            classNamesMap.set(key, key);
        }
        else {
            deepMergeStyles(reactDrawStyles[key], userStyles);
        }
    }
    return reactDrawStyles;
}
function makeStylesMap(classNamesMap) {
    return Object.values(componentStyles).reduce((acc, curr) => {
        if (acc[curr.key]) {
            throw new Error("duplicate key while creating css styles");
        }
        acc[curr.key] = curr.styles;
        const currClassNames = classNamesMap.get(curr.key);
        if (currClassNames !== undefined) {
            classNamesMap.set(curr.key, currClassNames + " " + curr.key);
        }
        classNamesMap.set(curr.key, curr.key);
        return acc;
    }, {});
}
export function StylesProvider({ children, styles, classNames, }) {
    const classNamesMap = useRef(classNamesToMap(classNames));
    const stylesMap = useRef(mergeStyles(makeStylesMap(classNamesMap.current), styles, classNamesMap.current));
    const styleRef = useRef(null);
    useEffect(() => {
        const styleTag = styleRef.current;
        if (!styleTag) {
            return;
        }
        classNamesMap.current = classNamesToMap(classNames);
        stylesMap.current = mergeStyles(makeStylesMap(classNamesMap.current), styles, classNamesMap.current);
        styleTag.innerHTML = cssFromState(stylesMap.current);
    }, [styles]);
    const getClasses = (key) => {
        const classes = classNamesMap.current.get(key);
        if (classes === undefined) {
            throw new Error("Could not find key in classNames map");
        }
        return classes;
    };
    // const renderClientCss = (cssString: string) => {
    //   if (typeof window === undefined) {
    //     return cssString;
    //   }
    //   return cssString.replace(/&#x27;/g, "'");
    // };
    return (React.createElement(StylesContext.Provider, { value: getClasses },
        React.createElement("style", { id: "react-draw-styles", ref: styleRef }),
        children));
}
