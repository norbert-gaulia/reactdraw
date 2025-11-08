import React from "react";
import { TrashCanBoldIcon } from "@jzohdi/jsx-icons";
import { getSelectedIdsFromFullState } from "../../utils/select/utils";
import { batchDelete } from "../../utils/utils";
const trashTool = {
    id: "react-draw-trash-tool",
    icon: React.createElement(TrashCanBoldIcon, null),
    tooltip: "Delete selected objects",
    getDisplayMode(ctx) {
        const selectedIds = getSelectedIdsFromFullState(ctx);
        if (selectedIds.length > 0) {
            return "show";
        }
        return "disabled";
    },
    handleContext(ctx) {
        const selectedIds = getSelectedIdsFromFullState(ctx);
        if (selectedIds.length < 1) {
            return;
        }
        /// TODO: should be for self? this unloaded the work to the select tool
        batchDelete(selectedIds, ctx);
    },
};
export default trashTool;
