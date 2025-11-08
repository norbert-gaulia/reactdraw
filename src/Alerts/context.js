import React, { createContext, useState } from "react";
const initialData = {
    color: null,
    message: null,
    position: "top",
};
export const AlertMessageContext = createContext([
    initialData,
    () => { },
]);
// type AlertProviderProps = FC<{}>;
export function AlertMessageProvider({ children, }) {
    const [state, setState] = useState(initialData);
    const updateState = (newState) => {
        setState(newState);
    };
    return (React.createElement(AlertMessageContext.Provider, { value: [state, updateState] }, children));
}
