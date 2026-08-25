const { app, BrowserWindow, session } = require("electron");
const path = require("path");

function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  window.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(async () => {
  await session.defaultSession.clearCache();

  const registrations = await session.defaultSession.serviceWorkers.getAllRunning();
  for (const registration of registrations) {
    await session.defaultSession.serviceWorkers.stopWorker(registration.versionId);
  }

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
