# React Draw Vanilla JS Demos

The `demos` folder contains lightweight React applications that showcase how to use `@jzohdi/react-draw` without TypeScript. Each demo is intentionally minimal and mirrors the functionality that previously lived in the TypeScript Next.js example.

## Available demos

### `basic-react`
A Vite powered React app that renders the default toolbars and menus from the library. It demonstrates how to wire the core drawing tools together and keep the UI minimal.

### `save-image`
Builds on the basic example and adds a "Download as SVG" action that serializes the current canvas to an SVG string. This mirrors the Storybook "Save Canvas As Image" customization and shows how to access the React Draw context from vanilla React code.

## Running a demo locally

```bash
cd demos/basic-react   # or demos/save-image
npm install
npm run dev
```

Both demos use [Vite](https://vitejs.dev/) for bundling. During development the demo imports the package from the repository root using a file dependency. When publishing, update the dependency to point to the released version instead.
