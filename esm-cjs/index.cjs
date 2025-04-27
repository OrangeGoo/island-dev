async function foo() {
  const { add } = await import("./util.mjs");
  console.log(add(1, 2));
}

foo();

// 根本原因 模块加载机制
// CJS 模块是同步加载的，ESM 模块是异步加载的
