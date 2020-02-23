const Bot = require("../Bot");

class ExtendedBot extends Bot {
    constructor(server, origin, id, userExt) {
        super(server, origin, id, userExt);
        this.connected = false;
        this.spawned = false;
        this.useProxy = false;
    }

    send(data) {
        if (this.ws && this.ws.readyState === 1) this.ws.send(data);
    }

    onopen() {
        this.send(Buffer.from([254, 1, 0, 0, 0]));
        this.send(Buffer.from([255, 114, 97, 103, 79]));
        this.spawn();
        if (!this.spawnInterval) this.spawnInterval = setInterval(() => {
            if (this.stopped) return clearInterval(this.spawnInterval);
            this.spawn();
        }, 1200);
        this.userExt.connectedBots++;
        this.connected = true;
    }

    onmessage(msg) {
        let buf = msg.data;
        buf = Buffer.from(buf);
        switch (buf.readUInt8(0)) {
            case 32:
                if (!this.spawned) {
                    this.spawned = true;
                    this.userExt.spawnedBots++;
                }
                break;
        }
    }

    onclose(e) {
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

    spawn(name, buffer) {
        name = "IzzyBotzV6 " + Math.floor(Math.random() * 1000);
        buffer = new Buffer.alloc(1 + 2 * name.length);
        buffer.write(name, 1, "utf16le");
        this.send(buffer);
    }

    moveTo(x, y) {
        if (!this.spawned) return;
        const buffer = new Buffer.alloc(21);
        buffer.writeUInt8(16, 0);
        buffer.writeDoubleLE(x, 1);
        buffer.writeDoubleLE(y, 9);
        this.send(buffer);
    }

}

module.exports = ExtendedBot;