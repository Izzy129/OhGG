(function(info, user) {

    if (WebSocket.prototype._send) {
        WebSocket.prototype.send = function(pkt) {
            this._send(pkt);

            if (pkt instanceof ArrayBuffer) pkt = new DataView(pkt);
            else if (pkt instanceof DataView) pkt = pkt;
            else return;

            switch (pkt.byteLength) {
                case 21:
                    if (pkt.getInt8(0, true) === 16) {
                        user.x = pkt.getFloat64(1, true);
                        user.y = pkt.getFloat64(9, true);
                        user.byteLength = pkt.byteLength;
                    }
                    break;

                case 13:
                    if (pkt.getUint8(0, true) === 16) {
                        user.x = pkt.getInt32(1, true);
                        user.y = pkt.getInt32(5, true);
                        user.byteLength = pkt.byteLength;
                    }
                    break;

                case 10:
                    if (pkt.getUint8(0, true) === 2) { //deeeep.io
                        user.moveBuffer = pkt.buffer;
                    }
                    break;

            }

            if(info.botServer != this.url && user.server != this.url) {
                user.server = this.url;
            }
        }
    }

    (async function(guiHtml, el) {
        guiHtml = await fetch(guiHtml);
        console.log("Fetch GUI:", guiHtml.ok);
        guiHtml = await guiHtml.text();
        
        el = document.createElement("BotGUI");
        el.innerHTML = guiHtml;

        appendGUI(el);
    })(info.defaultGUI);

    class Client {
        constructor() {
            this.socket = null;
            this.active = false;
            this.started = false;
            this.setup();
            this.startMoveInterval();
        }

        setup() {

            this.socket = info.io.connect(info.botServer);

            this.socket.on("connect", () => {
                info.elements.serverStatus.innerText = "Connected";
            });

            this.socket.on("auth", msg => {
                this.socket.emit("auth", 1234);
            });

            this.socket.on("verified", () => {
                info.elements.serverStatus.innerText = "Ready";
            });

            this.socket.on("started", () => {
                info.elements.toggleButton.setAttribute("class", "btn btn-danger");
                info.elements.toggleButton.innerText = "Stop Bots";
                info.elements.serverStatus.innerText = "Running";
                this.active = true;
            });

            this.socket.on("stopped", () => {
                info.elements.toggleButton.setAttribute("class", "btn btn-success");
                info.elements.toggleButton.innerText = "Start Bots";
                info.elements.serverStatus.innerText = "Ready";
                info.elements.botCounter.innerText = "0/0";
                this.active = false;
            });

            this.socket.on("updateBotCount", msg => {
                info.elements.botCounter.innerText = `${msg.spawned}/${msg.connected}`;
            });

            this.socket.on("disconnect", () => {
                info.elements.toggleButton.setAttribute("class", "btn btn-success");
                info.elements.toggleButton.innerText = "Start Bots";
                info.elements.serverStatus.innerText = "Connecting...";
                info.elements.botCounter.innerText = "0/0";
                this.active = false;
                this.started = false;
            });
            
        }

        startBots() {
            if (user.server == "" || this.started) return;
            this.socket.emit("start", {
                GameServer: user.server,
                Origin: location.origin
            });
            this.started = true;
        }

        stopBots() {
            if (!this.started)  return;
            this.socket.emit("stop");
            this.started = false;
        }

        move(x, y) {
            this.socket.emit("move", {
                type: 0,
                x: x,
                y: y
            });
        }

        moveWithBuffer(buffer) {
            if (!buffer) return;
            this.socket.emit("move", {
                type: 1,
                buffer: buffer
            });
        }

        split() {
            this.socket.emit("split");
        }

        eject() {
            this.socket.emit("eject");
        }

        startMoveInterval() {
            switch (location.host) {
                case "deeeep.io":
                    this.moveInterval = setInterval(() => {

                        if (this.active && this.started) this.moveWithBuffer(user.moveBuffer);

                    }, 150);
                
                default:
                    this.moveInterval = setInterval(() => {
                        if (user.history.x != user.x || user.history.y != user.y) { // if moved
        
                            user.history.x = user.x;
                            user.history.y = user.y;
        
                            if (this.active && this.started) this.move(~~user.x, ~~user.y);
        
                        } else { // not moved
        
                            user.history.c++;
                            
                            if (user.history.c > 7 && this.active) {
                                if (this.active && this.started) this.move(~~user.x, ~~user.y);
                                user.history.c = 0;
                            }
        
                        }
                    }, 150);
                    break;
            }
        }
    }

    function appendGUI(el) {
        if (document.getElementsByTagName("body").length == 0) {
            console.log("Waiting for body...");
            return setTimeout(appendGUI, 100, el);
        }

        document.getElementsByTagName("body")[0].appendChild(el);
        setupElements();

        el = document.createElement("script");
        el.src = "https://ex-script.com/fstyle/OhGG/iziToast.min.js";
        document.getElementsByTagName("body")[0].appendChild(el);
        checkVersion();
    }

    function setupElements() {
        if (!document.getElementById("toggleButton")) {
            console.log("Waiting for element...");
            return setTimeout(setupElements, 100);
        }

        info.elements.toggleButton = document.getElementById("toggleButton");
        info.elements.botCounter = document.getElementById("botCounter");
        info.elements.serverStatus = document.getElementById("serverStatus");
        user.Client = new Client();
    
        info.elements.toggleButton.addEventListener("click", () => {
            if (user.Client.active) user.Client.stopBots();
            else user.Client.startBots();
        });
    }

    document.addEventListener('keydown', function(event) {
        console.log(event.keyCode, event.which);
        switch (event.keyCode || event.which) {
            case 87:
                //window.core.eject();
                break;
            case 69: //E
                user.Client.split();
                break;
            case 82: //R
                user.Client.eject();
                break;
            case 67:
                //window.client.spam();
                break;
        }
    }.bind(this));

    //Fix Esc
    switch (location.origin.split("://")[1]) {
        case "ogar.be":
            document.addEventListener('keydown', event => {
                switch (event.keyCode || event.which) {
                    case 27:
                        document.getElementById("overlays").style.display = "block";
                        break;
                }
            });
            
    }

    function checkVersion() {
        if (!window.iziToast) {
            return setTimeout(checkVersion, 100);
        }

        window.iziToast.settings({
            title: 'Information',
            theme: 'dark',
            progressBarColor: '#00ffb8',
            backgroundColor: '#333',
            position: 'topCenter',
            timeout: 5000,
            pauseOnHover: true,
            layout: 2
        });

        if (info.version != userScriptVersion) window.iziToast.question({
            close: false,
            displayMode: 'once',
            id: 'question',
            zindex: 999,
            title: '200bots.ga Information',
            message: 'There is a new update available! Do you want to update script?',
            buttons: [
                ['<button><b>YES</b></button>', function (instance, toast) {
         
                    location.href = "http://ex-script.com/fstyle/OhGG/userscript.js";
         
                }, true],
                ['<button>NO</button>', function (instance, toast) {
         
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
         
                }]
            ]
        });
        
    }

})({
    version: "1.1",
    botServer: !!window.useLocalServer ? "ws://127.0.0.1:8081" : "wss://ps.ex-script.com:8081",
    io: window.SocketIO,
    defaultGUI: "https://ex-script.com/fstyle/OhGG/BotGUI.php",
    elements: {}
}, {
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    byteLength: null,
    moveBuffer: null,
    server: '',
    history: {
        x: 0,
        y: 0,
        c: 0
    }
});