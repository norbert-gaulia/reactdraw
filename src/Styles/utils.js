const mediaQuery = {
    applyAbove: (bp) => `@media only screen and (min-width: ${bp}px)`,
    applyBelow: (bp) => `@media only screen and (max-width: ${bp}px)`,
    between: (min, max) => `@media only screen and (min-width: ${min}px) and (max-width: ${max}px)`,
};
const keyframes = (animationName) => `@keyframes ${animationName}`;
function objstr(arg) {
    if (typeof arg === "string")
        return arg;
    if (typeof arg === "boolean")
        return "";
    return Object.keys(arg)
        .map((k) => arg[k] && k)
        .filter(Boolean)
        .join(" ");
}
function clsx(...args) {
    return args.map(objstr).join(" ");
}
export { mediaQuery, clsx, keyframes };
