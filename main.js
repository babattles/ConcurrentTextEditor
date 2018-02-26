const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const { ipcMain } = require('electron');
const { Menu } = require('electron');
const https = require('https');




//Enables live-reload
require('electron-reload')(__dirname);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null;
let authWindow = null;
let gAuthCode = null;
let googleAuthWin = null;
let gAuthToken = null;




/* Create the browser window. */
function createWindow() {
    // Menu Bar Template
    const template = [{
            label: 'File',
            submenu: [{
                    label: 'Open File',
                    accelerator: 'CommandOrControl+O',
                    click: () => {
                        if (win) {
                            // tell index.js to open a file
                            win.webContents.send('open-file', 'ping');
                            enableClose();
                        }
                    }
                },
                {
                    label: 'Save File',
                    accelerator: 'CommandOrControl+S',
                    click: () => {
                        if (win) {
                            // tell index.js to save the file
                            win.webContents.send('save-file', 'ping');
                        }
                    }
                },
                {
                    label: 'Save File As',
                    accelerator: 'CommandOrControl+Shift+S',
                    click: () => {
                        if (win) {
                            // tell index.js to save the file
                            win.webContents.send('save-file-as', 'ping');
                        }
                    }
                },
                {
                    label: 'Close File',
                    accelerator: 'CommandOrControl+W',
                    click: () => {
                        if (win) {
                            // tell index.js to close the file
                            win.webContents.send('close-file', 'ping');
                            disableClose();
                        }
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [{
                    role: 'undo'
                },
                {
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Increase Font Size',
                    accelerator: 'CommandOrControl+=',
                    click: () => {
                        if (win) {
                            // tell index.js to increase the font size
                            win.webContents.send('increase-font', 'ping');
                        }
                    }
                },
                {
                    label: 'Decrease Font Size',
                    accelerator: 'CommandOrControl+-',
                    click: () => {
                        if (win) {
                            // tell index.js to increase the font size
                            win.webContents.send('decrease-font', 'ping');
                        }
                    }
                },
                {
                    label: 'Reset Font Size',
                    click: () => {
                        if (win) {
                            // tell index.js to increase the font size
                            win.webContents.send('reset-font', 'ping');
                        }
                    }
                },
                {
                    label: 'Line Number',
                    click: () => {
                        if (win) {
                            win.webContents.send('line-number', 'ping');
                        }
                    }
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
                },
                {
                    type: 'separator'
                },
                {
                    label: "Theme",
                    submenu: [{
                            label: "Dark",
                            click: () => {
                                if (win) {
                                    // tell index.js to change the theme to dark
                                    win.webContents.send('change-theme', 'dark');
                                }
                            }
                        }, 
                        {
                            label: "Light",
                            click: () => {
                                if (win) {
                                    // tell index.js to change the theme to light
                                    win.webContents.send('change-theme', 'light');
                                }
                            }
                        }
                    ]
                },
            ]
        },
        {
            label: 'Window',
            submenu: [{
                    role: 'minimize'
                },
                {
                    role: 'toggledevtools'
                }
            ]
        },
        {
            label: 'Help',
            submenu: [{
                label: 'Learn More',
                click() { require('electron').shell.openExternal('https://github.com/babattles/HiveText') }
            }]
        }
    ];
    if (process.platform === 'darwin') {
        template.unshift({
            label: 'HiveText',
            submenu: [{
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
        template[1].submenu.push({
            type: 'separator'
        }, {
            label: 'Speech',
            submenu: [{
                    role: 'startspeaking'
                },
                {
                    role: 'stopspeaking'
                }
            ]
        })
        template[3].submenu = [{
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
            submenu: [{
                role: 'quit'
            }]
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
        icon: path.join(__dirname, '/app/img/Icon.png')
    });

    // and load the index.html of the app.

    win.loadURL(url.format({
        pathname: path.join(__dirname, '/app/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    menu.items[1].submenu.items[3].enabled = false;

    enableClose = function() {
        menu.items[1].submenu.items[3].enabled = true;
    }

    disableClose = function() {
        menu.items[1].submenu.items[3].enabled = false;
    }

    /**
     * Uncomment line below to enable developer tools when opening this window
     */
    // win.webContents.openDevTools();

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
app.on('ready', () => {
    createWindow();
});

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
        height: 650,
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

    authWindow.on('closed', function() {
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

// Listen for message to close the file
ipcMain.on('close-file-please', (event, arg) => {
    if (win) {
        win.webContents.send('close-file', 'ping');
    }
});

//close dragged file
ipcMain.on('close-dragged', (event, arg) => {
    enableClose();
});

ipcMain.on('google-auth', (event, arg) => {

    googlePopUp(function() {
        if (gAuthCode){
            getToken(function(){
                if (gAuthToken) {
                    googleAuthWin.removeAllListeners('closed');
                    setImmediate(() => googleAuthWin.close());
                    authWindow.webContents.send('token', gAuthToken); 
                }
            });
        }
    });   
});

function googlePopUp(_callback) {
    
    googleAuthWin = new BrowserWindow({
            parent: authWindow,
            modal: true,
            width: 800,
            height: 650,
            backgroundColor: '#2a2a2a',
            frame: false
        });

        //URL to open
        var gAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth?"
            + "scope=profile+email+https://www.googleapis.com/auth/firebase&"
            //+ "scope=https://www.googleapis.com/auth/firebase&"
            + "response_type=code&"
            + "redirect_uri=com.googleusercontent.apps.254482798300-tn0q68a55m8taeiktgiue1gdq6btukjk:redirect_uri_path&"
            + "client_id=254482798300-tn0q68a55m8taeiktgiue1gdq6btukjk.apps.googleusercontent.com";

        googleAuthWin.loadURL(gAuthUrl);

        googleAuthWin.once('ready-to-show', () => {
            googleAuthWin.show();
        });

        /**
         * Uncomment line below to enable developer tools when opening this window
         */
        //googleAuthWin.webContents.openDevTools();

        //Get Auth Code
        googleAuthWin.webContents.on('will-navigate', (event, args) => {
            const query = url.parse(args, true).query;
            if (query) {
                if (query.error) {
                    return new Error(`There was an error: ${query.error}`);
                } else if (query.code){

                    //set AuthCode
                    gAuthCode = query.code;
                    console.log(query);
                }
            }
            _callback();
        });
};

function getToken (_callback) {
    var postData = "code="+gAuthCode+"&"
        + "client_id=254482798300-tn0q68a55m8taeiktgiue1gdq6btukjk.apps.googleusercontent.com&"
        + "client_secret=KXEUaUZ0VlHVESbOQ95KpnBf&"
        + "redirect_uri=com.googleusercontent.apps.254482798300-tn0q68a55m8taeiktgiue1gdq6btukjk:redirect_uri_path&"
        + "grant_type=authorization_code";

    var postOptions = {
        host: "www.googleapis.com",
        port: 443,
        path: "/oauth2/v4/token",
        method: 'POST',
        headers: {

            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var data = "";
    var request = https.request(postOptions, function(response) {
        response.on('data', function(chunk) {
            if (chunk) {
                data += chunk.toString('utf8');

            }
        }).on('end', () => {
            console.log('gAuthToken: ',data);
            gAuthToken = JSON.parse(data); 
            _callback();
        });

    }).on("error", function(e) {

        console.log(e);

    });

    request.write(postData);
    request.end();
}


// enable close menu option
ipcMain.on("enable-close", (event, arg) => {
    enableClose();
});

// disable close menu option
ipcMain.on("disable-close", (event, arg) => {
    disableClose();
});
