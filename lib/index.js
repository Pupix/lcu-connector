const { EventEmitter } = require('events');
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const cp = require('child_process');
const LockfileParser = require('lol-lockfile-parser');
const os = require('os');

const lockfile = new LockfileParser();
const IS_WIN = process.platform === 'win32';
const IS_MAC = process.platform === 'darwin';
const IS_WSL = process.platform === 'linux' && os.release().toLowerCase().includes('microsoft');

class LCUConnector extends EventEmitter {

    static getLCUPathFromProcess() {
        return new Promise(resolve => {
            const INSTALL_REGEX_WIN = /"--install-directory=(.*?)"/;
            const INSTALL_REGEX_MAC = /--install-directory=(.*?)( --|\n|$)/;
            const INSTALL_REGEX = IS_WIN || IS_WSL ? INSTALL_REGEX_WIN : INSTALL_REGEX_MAC;
            const command = IS_WIN ?
                `WMIC PROCESS WHERE name='LeagueClientUx.exe' GET commandline` :
                IS_WSL ?
                    `WMIC.exe PROCESS WHERE "name='LeagueClientUx.exe'" GET commandline` :
                    `ps x -o args | grep 'LeagueClientUx'`;

            cp.exec(command, (err, stdout, stderr) => {
                if (err || !stdout || stderr) {
                    resolve();
                    return;
                }

                const parts = stdout.match(INSTALL_REGEX) || [];
                const dirPath = !IS_WSL ? parts[1] : parts[1].split(path.win32.sep).join(path.sep).replace(/^([a-zA-Z]):/, match => '/mnt/' + match[0].toLowerCase());
                resolve(dirPath);
            });
        });
    }

    static isValidLCUPath(dirPath) {
        if (!dirPath) {
            return false;
        }

        const lcuClientApp = IS_MAC ? 'LeagueClient.app' : 'LeagueClient.exe';
        const common = fs.existsSync(path.join(dirPath, lcuClientApp)) && fs.existsSync(path.join(dirPath, 'Config'));
        const isGlobal = common && fs.existsSync(path.join(dirPath, 'RADS'));
        const isCN = common && fs.existsSync(path.join(dirPath, 'TQM'));
        const isGarena = common; // Garena has no other

        return isGlobal || isCN || isGarena;
    }

    constructor(executablePath) {
        super();

        if (executablePath) {
            this._dirPath = path.dirname(path.normalize(executablePath));
        }
    }

    start() {
        if (LCUConnector.isValidLCUPath(this._dirPath)) {
            this._initLockfileWatcher();
            return;
        }

        this._initProcessWatcher();
    }

    stop() {
        this._clearProcessWatcher();
        this._clearLockfileWatcher();
    }

    _initLockfileWatcher() {
        if (this._lockfileWatcher) {
            return;
        }

        const lockfilePath = path.join(this._dirPath, 'lockfile');
        this._lockfileWatcher = chokidar.watch(lockfilePath, { disableGlobbing: true });

        this._lockfileWatcher.on('add', this._onFileCreated.bind(this));
        this._lockfileWatcher.on('change', this._onFileCreated.bind(this));
        this._lockfileWatcher.on('unlink', this._onFileRemoved.bind(this));
    }

    _clearLockfileWatcher() {
        if (this._lockfileWatcher) {
            this._lockfileWatcher.close();
        }
    }

    _initProcessWatcher() {
        return LCUConnector.getLCUPathFromProcess().then(lcuPath => {
            if (lcuPath) {
                this._dirPath = lcuPath;
                this._clearProcessWatcher();
                this._initLockfileWatcher();
                return;
            }

            if (!this._processWatcher) {
                this._processWatcher = setInterval(this._initProcessWatcher.bind(this), 1000);
            }
        });
    }

    _clearProcessWatcher() {
        clearInterval(this._processWatcher);
    }

    _onFileCreated(path) {
        lockfile.read(path).then(data => {
            const result = {
                protocol: data.protocol,
                address: '127.0.0.1',
                port: data.port,
                username: 'riot',
                password: data.password
            };

            this.emit('connect', result);
        });
    }

    _onFileRemoved() {
        this.emit('disconnect');
    }
}

module.exports = LCUConnector;
