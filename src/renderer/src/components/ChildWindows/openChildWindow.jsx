export const openChildWindow = (name, type, config, data) => {
  console.log(name, type, config, data);
  const apipreload = name === 'tag-form' ? window.metadataEditingApi : window.api;
  /* window.api.showChild({ */
  apipreload.showChild({
    name: name,
    winConfig: {
      width: config.width,
      height: config.height,
      show: config.show,
      parent: config.parent || null,
      resizable: config.resizable,
      preload: config.preload,
      sandbox: config.sandbox,
      webSecurity: config.webSecurity,
      contextIsolation: config.contextIsolation
    },
    data: { listType: type, results: data }
  });
};
