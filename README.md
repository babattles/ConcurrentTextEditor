# Install npm
Electron is installed using npm. To install npm, download Node.js, which can be found here: https://nodejs.org/en/
Note: This only needs to be installed once on your machine

# Instructions to run (Unix)
* Download/clone the repository
* Navigate to the project's directory (e.g. HiveText)
* Run the command `npm install electron --save-dev --save-exact`
  * This will create the node_modules directory which contains components needed to run Electron
* To start HiveText, use the command `./node_modules/.bin/electron .`
