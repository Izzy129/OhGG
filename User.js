const ProxyManager = require("./ProxyManager");
const Protocol = require("./Protocols");

class User {
    constructor() {
        this.active = false;
        this.bots = [];
        this.ext = {
            connectedBots: 0,
            spawnedBots: 0,
            ProxyManager: new ProxyManager()
        };
    }

    setProtocol(origin) {
        this.host = origin.includes("https://") ? origin.split("https://")[1] : origin.split("http://")[1];

        switch (this.host) {
            case "ogar.be":
                this.amount = 300; // i recommend about 100 on ogar.be if you want to play without lag (ogar.be server can't handle it)
                this.bot = Protocol.AgarBio;
                break;

            case "agar.bio":
                this.amount = 200;
                this.bot = Protocol.AgarBio;
                break;
			case "cellcraft.io":
                this.amount = 200;
                this.bot = Protocol.AgarBio;
                break;

            case "powerline.io":
                this.amount = 100;
                this.bot = Protocol.PowerLine;
                break;

            case "deeeep.io":
                this.amount = 100;
                this.bot = Protocol.Deep;
                break;
            
        }

    }

    startBots(gameServer, Origin) {
        if (!this.active) {
            this.ext.connectedBots = this.ext.spawnedBots = 0;

            this.setProtocol(Origin);
            if (!this.bot) return;

            this.active = true;
            for (let i = 0; i < this.amount; i++) {
                this.bots.push(new this.bot(gameServer, Origin, i, this.ext));
            }
        }
    }

    stopBots() {
        if (this.active) {
            this.active = false;
            for (let i = 0; i < this.bots.length; i++) {
                this.bots[i].stop();
                this.bots[i] = null;
                delete this.bots[i];
            }
            this.bots = [];
            this.ext.connectedBots = this.ext.spawnedBots = 0;
        }
    }

    moveBots() {
        for (let i = 0, l = this.bots.length; i < l; i = (i + 1) | 0) {
            if (this.bots[i]) this.bots[i].moveTo.apply(this.bots[i], arguments);
        }
    }

    splitBots() {
        for (let i = 0, l = this.bots.length; i < l; i = (i + 1) | 0) {
            if (this.bots[i]) this.bots[i].split();
        }
    }

    ejectBots() {
        for (let i = 0, l = this.bots.length; i < l; i = (i + 1) | 0) {
            if (this.bots[i]) this.bots[i].eject();
        }
    }

}

module.exports = User;
