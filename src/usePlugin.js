const { transformFileSync } = require("@babel/core");
const insertPlugin = require("./plugin/insert-plugin");
const path = require("path");

// @babel/core 的 transformSync 方法 : 编译代码，并引入插件
const { code } = transformFileSync(path.join(__dirname, "./test.js"), {
  plugins: [insertPlugin],
  parserOpts: {
    sourceType: "unambiguous",
    plugins: ["jsx"],
  },
});

/**
 *
 *
console.log("=======>")
console.log("filename:/Users/wkh/code/project/babel/insert-console-log/src/test.js, (1, 0)", 1);

function func() {
  console.log("=======>")
  console.info("filename:/Users/wkh/code/project/babel/insert-console-log/src/test.js, (4, 2)", 2);
}

export default class Test {
  say() {
    console.log("=======>")
    console.debug("filename:/Users/wkh/code/project/babel/insert-console-log/src/test.js, (9, 4)", 3);
  }

  render() {
    return <div>{[console.log("=======>"), console.error("filename:/Users/wkh/code/project/babel/insert-console-log/src/test.js, (12, 17)", 4)]}</div>;
  }

}
 */
console.log(code);
