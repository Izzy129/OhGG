const WebSocket = require("ws");

class Bot {
    constructor(server, origin, id, userExt) {
        this.id = id;
        this.userExt = userExt;
        this.ws = null;
        this.server = server;
        this.stopped = false;
        this.useProxy = false;
        this.headers = {
            'Accept-Encoding': 'gzip, deflate',
			'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
			'Cache-Control': 'no-cache',
			'Origin': origin,
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
        };
        this.connectInterval = setTimeout(() => {
            this.connect();
        }, id * 250);
    }

    connect() {
        if (this.stopped) return;

        this.ws = new WebSocket(this.server, {
            headers: this.headers,
            agent: this.useProxy ? this.userExt.ProxyManager.agent : undefined
        });
        this.ws.binaryType = 'arraybuffer';
		this.ws.onopen = this.onopen.bind(this);
		this.ws.onmessage = this.onmessage.bind(this);
		this.ws.onclose = this.onclose.bind(this);
        this.ws.onerror = this.onerror.bind(this);
    }

    send(data) {
        if (this.ws && this.ws.readyState === 1) this.ws.send(data);
    }

    stop() {
        clearTimeout(this.connectInterval);
        if (this.ws) this.ws.close();
        this.stopped = true;
        this.onopen = this.onmessage = null;
        this.ws = null;
    }

    moveTo() {}
    onopen() {}
    onmessage(msg) {}
    onclose(e) {}
    onopen(e) {}

    split() {
        this.send(Buffer.from([17]));
    }

    eject() {
        this.send(Buffer.from([21]));
    }

}

module.exports = Bot;