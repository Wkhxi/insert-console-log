// const { declare } = require("@babel/helper-plugin-utils");

// const parser = require("@babel/parser");
// const traverse = require("@babel/traverse").default;
// const generate = require("@babel/generator").default;
const types = require("@babel/types");
const template = require("@babel/template").default;

const targetCalleeName = ["log", "info", "error", "debug"].map(
  (item) => `console.${item}`
);

/**
 * babel 插件的形式 就是 函数返回一个 有 visitor 属性的 对象。
 */
const insertPlugin = ({ types, template }, options, dirname) => {
  return {
    visitor: {
      CallExpression(path, state) {
        if (path.node.isNew) {
          return;
        }
        const calleeName = path.get("callee").toString();
        if (targetCalleeName.includes(calleeName)) {
          const { line, column } = path.node.loc.start;
          const newNode = template.expression(
            `console.log("${
              state.filename || "unkown filename"
            }: (${line}, ${column})")`
          )();
          newNode.isNew = true;

          if (path.findParent((path) => path.isJSXElement())) {
            path.replaceWith(types.arrayExpression([newNode, path.node]));
            path.skip();
          } else {
            path.insertBefore(newNode);
          }
        }
      },

      CallExpression(path, state) {
        if (path.node.isNew) {
          return;
        }

        const calleeName = path.get("callee").toString();

        if (targetCalleeName.includes(calleeName)) {
          const { line, column } = path.node.loc.start; // 公共属性 loc 上 获取行列信息

          //  state 中可以拿到插件的配置信息 options 等，比如 filename 就可以通过 state.filename 来取
          path.node.arguments.unshift(
            types.stringLiteral(
              `filename:${
                state.filename || "unknown filename"
              }, (${line}, ${column})`
            )
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
    },
  };
};

module.exports = insertPlugin;
