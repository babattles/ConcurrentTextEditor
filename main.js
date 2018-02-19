const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const {ipcMain} = require('electron');
const {Menu} = require('electron');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null; 
let authWindow = null;

// Menu Bar Template
const template = [
  {
  label: 'File',
  submenu: [
    {
      label: 'Open File',
      click: () => {
        if (win) {
          // tell index.js to open a file
          win.webContents.send('open-file', 'ping');
        }
      }
    },
    {
      label: 'Save File',
      click: () => {
        if (win) {
          // tell index.js to save the file
          win.webContents.send('save-file', 'ping');
        }
      }
    },
    {
      label: 'Close File',
      click: () => {
        if (win) {
          // tell index.js to close the file
          win.webContents.send('close-file', 'ping');
        }
      }
    }
  ]
  },
  {
      label: 'Edit',
    submenu: [
        {
          role: 'undo'
      },
        {
          role: 'redo'
      },
        {
          type: 'separator'
      },
        {
          role: 'cut'
      },
        {
          role: 'copy'
      },
        {
          role: 'paste'
      },
        {
          role: 'pasteandmatchstyle'
       },
        {
          role: 'delete'
      },
        {
          role: 'selectall'
         }
    ]
  },
  {
    label: 'Window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      },
      {
        role: 'toggledevtools'
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Learn More',
          click () { require('electron').shell.openExternal('https://github.com/babattles/HiveText') }
      }
    ]
  }
];

/* Create the browser window. */
function createWindow () {
  if (process.platform === 'darwin') {
    template.unshift({
      label: 'HiveText',
      submenu: [
        {
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    })
    template[1].submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'Speech',
        submenu: [
          {
            role: 'startspeaking'
          },
          {
            role: 'stopspeaking'
          }
        ]
      }
    )
    template[3].submenu = [
      {
        role: 'close'
      },
      {
        role: 'minimize'
      },
      {
        role: 'zoom'
      },
      {
        type: 'separator'
      },
      {
        role: 'front'
      },
      {
        role: 'toggledevtools'
      }
    ]
  } else {
    template.unshift({
      label: 'Electron',
      submenu: [
        {
          role: 'quit'
        }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  win = new BrowserWindow({
    //frame: false,
    //resizeable: false,
    width: 1000, 
    height: 900,
    backgroundColor: '#2a2a2a',
    icon: path.join(__dirname, '/Icon.png')
  });

  // and load the index.html of the app.
  
  win.loadURL(url.format({
    pathname: path.join(__dirname, '/app/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  /**
  * Uncomment line below to enable developer tools when opening this window
  */
  //win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// Listen for message to open the Auth Window (auth.html)
ipcMain.on('open-auth-window', (event, arg) => {
    if (authWindow) {
        return;
    }

    authWindow = new BrowserWindow({
        parent: win, 
        modal: true, 
        show: false,
        width: 500,
        height: 575,
        backgroundColor: '#2a2a2a',
        frame: false
    });

    authWindow.loadURL('file://' + __dirname + '/app/auth.html');

    authWindow.once('ready-to-show', () => {
        authWindow.show();
    });

    /**
     * Uncomment line below to enable developer tools when opening this window
     */
    //authWindow.webContents.openDevTools();

    authWindow.on('closed', function () {
        authWindow = null;
    });
});

// Listen for message to close auth window
ipcMain.on('close-auth-window', (event, arg) => {
  if (authWindow) {
      authWindow.close();
  }
});

// Listen for message to update the username
ipcMain.on('update-username', (event, arg) => {
  // close the auth window
  if (authWindow) {
      authWindow.close();
  }
  // tell index.js to update the username
  win.webContents.send('update-username-reply', 'pong');
});