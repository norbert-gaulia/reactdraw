import { CLEAR_ALL_BUTTON_CLASSES, COLORS } from "../../../constants";
const styles = {
    width: 180,
    fontSize: 16,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    borderRadius: 5,
    cursor: "pointer",
    border: "none",
    padding: "7px 10px",
    backgroundColor: COLORS.primary.light,
    "&:hover": {
        backgroundColor: COLORS.primary.main,
    },
};
export default {
    key: CLEAR_ALL_BUTTON_CLASSES,
    styles,
};
