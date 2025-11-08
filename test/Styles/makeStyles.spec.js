const assert = require("assert");

let cssFromState;
let keyframes;
let mediaQuery;
let basicState;
let basicTestResult;
let withKeyFrames;
let withStarOp;

before(async () => {
  const makeStylesModule = await import("../../src/Styles/makeStyles.js");
  cssFromState = makeStylesModule.default || makeStylesModule;
  const utilsModule = await import("../../src/Styles/utils.js");
  keyframes = utilsModule.keyframes;
  mediaQuery = utilsModule.mediaQuery;

  basicState = {
    className1: {
      opacity: 1,
      width: 150,
      height: "100%",
      maxHeight: "100%",
      borderRightColor: "red",
      "&:hover": {
        color: "red",
        height: 20,
      },
      "&:focus": {
        color: "blue",
      },
      "& ~ &": {
        background: "tomato",
      },
      "& + &": {
        background: "lime",
      },
      "&.something": {
        background: "orange",
      },
      ".something-else &": {
        border: "1px solid",
      },
      [mediaQuery.applyBelow(500)]: {
        width: 100,
      },
    },
    className2: {
      padding: "0.5em",
      margin: "0.5em",
    },
  };

  basicTestResult =
    `.className1:hover { color: red; height: 20px; }.className1:focus { color: blue; }.className1 ~ .className1 { background: tomato; }` +
    `.className1 + .className1 { background: lime; }.className1.something { background: orange; }.something-else .className1 { border: 1px solid; }` +
    `@media only screen and (max-width: 500px) { .className1 { width: 100px; } }.className1 { opacity: 1; width: 150px; height: 100%; max-height: 100%; border-right-color: red; }.className2 { padding: 0.5em; margin: 0.5em; }`;

  withKeyFrames = {
    className1: {
      opacity: 1,
      width: 150,
      height: "100%",
      maxHeight: "100%",
      borderRightColor: "red",
      [keyframes("animation1")]: {
        "0%": {
          opacity: 1,
          width: 200,
        },
        "100%": {
          opacity: 0,
          width: 0,
        },
      },
    },
    className2: {
      padding: "0.5em",
      margin: "0.5em",
      [keyframes("animation2")]: {
        "0%": {
          opacity: 1,
          width: 200,
        },
        "100%": {
          opacity: 0,
          width: 0,
        },
      },
    },
  };

  withStarOp = {
    "bottom-bar-container": {
      display: "flex",
      zIndex: 1000,
      width: "100%",
      overflowX: "auto",
      "*": {
        textAlign: "center",
      },
    },
  };
});

describe("styles css builder", () => {
  it("should make css", () => {
    const css = cssFromState(basicState);
    assert.equal(css, basicTestResult);
  });

  it("should make css with keyframes", () => {
    const css = cssFromState(withKeyFrames);
    const result =
      `@keyframes animation1 { 0% { opacity: 1; width: 200px; }100% { opacity: 0; width: 0px; } }.className1 { opacity: 1; width: 150px; height: 100%; max-height: 100%; border-right-color: red; }` +
      `@keyframes animation2 { 0% { opacity: 1; width: 200px; }100% { opacity: 0; width: 0px; } }.className2 { padding: 0.5em; margin: 0.5em; }`;
    assert.equal(css, result);
  });

  it("should handle star operator", () => {
    const css = cssFromState(withStarOp);
    assert.equal(
      css,
      `.bottom-bar-container * { text-align: center; }.bottom-bar-container { display: flex; z-index: 1000; width: 100%; overflow-x: auto; }`
    );
  });
});
