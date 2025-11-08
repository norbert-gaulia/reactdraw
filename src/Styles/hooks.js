import { useContext } from "react";
import { StylesContext } from "./context";
export function useStyles(key) {
    const getClasses = useContext(StylesContext);
    return getClasses(key);
}
