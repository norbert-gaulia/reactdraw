import { useContext } from "react";
import { AlertMessageContext } from "./context";
export function useAlerts() {
    const [state, setState] = useContext(AlertMessageContext);
    return [state, setState];
}
