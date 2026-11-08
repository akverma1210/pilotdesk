const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('pilotdesk', {
  platform: process.platform,
  version: '1.0.0',
});
