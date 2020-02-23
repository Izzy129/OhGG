const Bot = require("../Bot");

class ExtendedBot extends Bot {
    constructor(server, origin, id, userExt) {
        super(server, origin, id, userExt);
        this.connected = false;
        this.spawned = false;
    }

    send(data) {
        if (this.ws && this.ws.readyState === 1) this.ws.send(data);
    }

    onopen() {
        this.send(Buffer.from([191, 160, 0, 78, 0]));
        this.send(Buffer.from([0]));
        this.send(Buffer.from([7, 94, 0, 78, 0]));
        
        this.spawn();
        this.userExt.connectedBots++;
        this.connected = true;
    }

    onmessage(msg) {
        let buf = msg.data;
        buf = Buffer.from(buf);
        switch (buf.readUInt8(0)) {
            case 161: //spawn
                if (!this.spawned) {
                    this.spawned = true;
                    this.userExt.spawnedBots++;
                }
                break;

            case 164: //dead
                if (this.spawned) {
                    this.spawned = false;
                    this.userExt.spawnedBots--;
                    this.spawn();
                }
                break;

        }
    }

    onclose(e) {
        //console.log("disconnected");
        if (this.connected) {
            this.connected = false;
            this.userExt.connectedBots--;
        }
        if (this.spawned) {
            this.spawned = false;
            this.userExt.spawnedBots--;
        }

        if (!this.stopped) setTimeout(() => {
            this.connect();
        }, 500);

    }

    onerror(e) {}

    spawn() {
        this.send(Buffer.from([3, 50, 0, 48, 0, 48, 0, 98, 0, 111, 0, 116, 0, 115, 0, 46, 0, 103, 0, 97, 0, 0, 0]));
    }

}

module.exports = ExtendedBot;