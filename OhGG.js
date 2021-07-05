process.on('uncaughtException', function (err) {
    console.log(err);
});

(function(module, setupSocket) {

    console.green("[Info] 200Bots.ga(Revive) Oh!GG");
	console.green("If game starts to lag, lower amount of bots in User.js")

    const ssl = {
        enable: false,
        keyPath: "/etc/letsencrypt/live/xxx/privkey.pem",
        certPath: "/etc/letsencrypt/live/xxx/cert.pem",
    }

    const options = {
        key: module.fs.existsSync(ssl.keyPath) ? module.fs.readFileSync(ssl.keyPath) : null,
        cert: module.fs.existsSync(ssl.certPath) ? module.fs.readFileSync(ssl.certPath) : null
    }

    if (options.key && options.cert) {
        ssl.enable = true;
        console.yellow("[Info] SSL enabled.");
    }

    const app = module.express();
    const server = ssl.enable ? module.https.createServer(options, app) : module.http.createServer(app);
    server.listen(8081); //port

    setupSocket(module.io.listen(server), {}, module.userClass);

})({

    express: require('express'),
    http: require('http'),
    https: require('https'),
    ColoredConsole: require('./FstyleModules/ColoredConsole'),
    io: require('socket.io'),
    userClass: require('./User.js'),
    fs: require('fs')

}, (io, users, User) => {

    io.on("connection", socket => {

        socket.userIP = socket.handshake.address.split("f:")[1] || socket.handshake.address;

        console.log("New connection from", socket.userIP);
        io.to(socket.id).emit("auth", "hello");

        socket.on("auth", code => { //auth from userscript
            if (code === 1234) {
                socket.auth = true;
                users[socket.id] = new User();
                io.to(socket.id).emit("verified");
            }
        });

        socket.on("start", msg => {
            if (socket.auth && typeof msg == "object" && msg.GameServer != "") {
                console.log("User started bots. User IP:", socket.userIP, "GameServer IP:", msg.GameServer, "Game", msg.Origin);
                users[socket.id].startBots(msg.GameServer, msg.Origin);
                io.to(socket.id).emit("started");
            }
        });

        socket.on("stop", () => {
            if (socket.auth) {
                console.log("User stopped bots. IP:", socket.userIP);
                io.to(socket.id).emit("stopped");
                users[socket.id].stopBots();
            }
        });

        socket.on("move", msg => {
            if (socket.auth) {
                switch (msg.type || 0) {
                    case 0:
                        users[socket.id].moveBots(msg.x, msg.y);
                        break;

                    case 1:
                        users[socket.id].moveBots(msg.buffer);
                        break;
                }

                io.to(socket.id).emit("updateBotCount", {
                    connected: users[socket.id].ext.connectedBots >= 0 ? users[socket.id].ext.connectedBots : 0,
                    spawned: users[socket.id].ext.spawnedBots >= 0 ? users[socket.id].ext.spawnedBots : 0
                });
            }
        });

        socket.on("split", () => {
            if (socket.auth) {
                users[socket.id].splitBots();
            }
        });

        socket.on("eject", () => {
            if (socket.auth) {
                users[socket.id].ejectBots();
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected.", socket.userIP);

            if (users[socket.id]) {
                if (users[socket.id].active) users[socket.id].stopBots();
                users[socket.id] = null;
                delete users[socket.id];
            }
        });

    });

});
