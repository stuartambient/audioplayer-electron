export const openChildWindow = (name, type, data) => {
  window.api.showChild({
    name: name,
    winConfig: {
      width: 1200,
      height: 550,
      show: false,
      resizable: true,
      preload: 'metadataEditing',
      sandbox: false,
      webSecurity: false,
      contextIsolation: true
    },
    data: { listType: type, results: data }
  });
};
