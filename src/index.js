const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const types = require("@babel/types"); // 提供ts类型支持
const template = require("@babel/template").default;

/**
 * 源代码
 */
const sourceCode = `
    console.log(1);

    function func() {
        console.info(2);
    }

    export default class Test {
        say() {
            console.debug(3);
        }
        render() {
            return <div>{console.error(4)}</div>
        }
    }
`;

/**
 * ast
 */
const ast = parser.parse(sourceCode, {
  sourceType: "unambiguous", // 根据内容是否包含 import/export 来决定是否为 esm 还是 cjs
  plugins: ["jsx"], // 解析的文件的格式
});

/**
 * 遍历修改 ast
 */

const targetCalleeName = ["log", "info", "error", "debug"].map(
  (item) => `console.${item}`
);

traverse(ast, {
  // 修改 CallExpression 类型 的 AST
  CallExpression(path, state) {
    // // callee 的类型是 MemberExpression
    // // callee 的名字是 console
    // // callee 的属性名是 log、info、error、debug
    // if (
    //   types.isMemberExpression(path.node.callee) &&
    //   path.node.callee.object.name === "console" &&
    //   ["log", "info", "error", "debug"].includes(path.node.callee.property.name)
    // ) {
    //   const { line, column } = path.node.loc.start; // 公共属性 loc 上 获取行列信息
    //   path.node.arguments.unshift(
    //     types.stringLiteral(`filename: (${line}, ${column})`)
    //   ); // 在原有的参数前面添加一个新的参数
    // }

    if (path.node.isNew) {
      return;
    }

    // const calleeName = generate(path.node.callee).code; // callee 的字符串代码，也就是他的名字
    const calleeName = path.get("callee").toString();

    if (targetCalleeName.includes(calleeName)) {
      const { line, column } = path.node.loc.start; // 公共属性 loc 上 获取行列信息

      path.node.arguments.unshift(
        types.stringLiteral(`filename: (${line}, ${column})`)
      ); // 在原有的参数前面添加一个新的参数

      // 新增节点
      const newNode = template.expression(`console.log("=======>")`)();
      newNode.isNew = true;

      /**
       * 特殊处理 jsx中的 console
       */
      if (path.findParent((path) => path.isJSXElement())) {
        path.replaceWith(types.arrayExpression([newNode, path.node]));
        path.skip(); // 跳过子节点处理
      } else {
        path.insertBefore(newNode);
      }
    }
  },
});

/**
 * ast 转换为 字符串代码
 */
const { code, map } = generate(ast);

/**
 *
 *
console.log("filename: (2, 4)", 1);

function func() {
  console.info("filename: (5, 8)", 2);
}

export default class Test {
  say() {
    console.debug("filename: (10, 12)", 3);
  }

  render() {
    return <div>{console.error("filename: (13, 25)", 4)}</div>;
  }

}
 */

/**
 *
 *
console.log("=======>")
console.log("filename: (2, 4)", 1);

function func() {
  console.log("=======>")
  console.info("filename: (5, 8)", 2);
}

export default class Test {
  say() {
    console.log("=======>")
    console.debug("filename: (10, 12)", 3);
  }

  render() {
    return <div>{[console.log("=======>"), console.error("filename: (13, 25)", 4)]}</div>;
  }

}
 */
console.log(code);
