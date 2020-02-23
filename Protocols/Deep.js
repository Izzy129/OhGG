const Bot = require("../Bot");

class ExtendedBot extends Bot {
    constructor(server, origin, id, userExt) {
        super(server, origin, id, userExt);
        this.connected = false;
        this.spawned = false;
        this.elleIds = [0, 54, 16, 13, 40, 78];
    }

    send(data) {
        if (this.ws && this.ws.readyState === 1) this.ws.send(data);
    }

    onopen() {
        this.send(Buffer.from([10]));
        this.spawn();
        this.userExt.connectedBots++;
        this.connected = true;
    }

    onmessage(msg) {
        let buf = msg.data;
        buf = Buffer.from(buf);
        switch (buf.readUInt8(0)) {
            case 110: //dead
                if (this.spawned) {
                    this.spawned = false;
                    this.userExt.spawnedBots--;
                    this.spawn();
                }
                break;

            case 111:
                if (!this.spawned) {
                    this.send(JSON.stringify({
                        "p": 7,
                        "ellectionId": this.elleIds[Math.floor(Math.random() * this.elleIds.length)]
                    }));
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

    spawn() {
        this.send(JSON.stringify({
            "p": 1,
            "name": "IzzyBotzV6 " + Math.floor(Math.random() * 650),
            "pid": 0,
            "rId": Math.floor(Math.random() * 10000)
        }));
    }

    moveTo(buffer) {
        if (this.spawned) this.send(buffer);
    }

    chat() {
		if (this.spawned) this.send(JSON.stringify({
            "p": 4,
            "message": "Chat Spam  # " + Math.floor(Math.random() * 650),
            "te": false
        }));
    }

}

module.exports = ExtendedBot;