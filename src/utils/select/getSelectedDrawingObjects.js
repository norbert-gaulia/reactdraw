export function getSelectedDrawingObjects(selectedIds, objects) {
    return selectedIds.map((id) => {
        const object = objects.get(id);
        if (!object) {
            throw new Error("object not found in map");
        }
        return object;
    });
}
