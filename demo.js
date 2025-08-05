const task = async () => {
  return new Promise((resolve) => {
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      resolve(0);
    }, 20);
  });
};

const helmetStatic = {};

const renderToString = (title) => {
  helmetStatic.title = title;
};

async function renderPage() {
  return Promise.all(
    [1, 2, 3].map(async (title) => {
      // 1. renderToString
      renderToString(title);
      // 2. 我们可以在这里获取到helmetStatic.title
      // 执行异步逻辑
      await task();

      return `<html><head>${helmetStatic.title}</head></html>`;
    })
  );
}

// eslint-disable-next-line no-undef
renderPage().then(console.log);
