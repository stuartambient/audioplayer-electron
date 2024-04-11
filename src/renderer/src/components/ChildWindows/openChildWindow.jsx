export const openChildWindow = (name, type, config, data) => {
  window.api.showChild({
    name: name,
    winConfig: {
      width: config.width,
      height: config.height,
      show: config.show,
      resizable: config.resizable,
      preload: config.preload,
      sandbox: config.sandbox,
      webSecurity: config.webSecurity,
      contextIsolation: config.contextIsolation
    },
    data: { listType: type, results: data }
  });
};
