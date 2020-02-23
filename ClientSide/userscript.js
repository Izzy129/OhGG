// ==UserScript==
// @name         200bots.ga Oh!GG
// @namespace    http://200bots.ga/BotzGeneration
// @version      1.1
// @description  Free Agario Clone Bots 2020
// @author       test114514
// @match        http://de.agar.bio/
// @match        http://ogar.be/
// @match        https://powerline.io/
// @match        https://deeeep.io/*
// @match        http://cellcraft.io/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.1/socket.io.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

WebSocket.prototype._send = WebSocket.prototype.send;

(function(weapon, userScript) {

    console.log("[Script] 200bots.ga Oh!GG");
    console.log("[Script] Recoded by Izzy#2447");
    console.log("[Script] Full Credits go to 200bots.ga");

    if (window.$) $.prototype.tab = function() {}
    window.SocketIO = io;
    window.userScriptVersion = userScript.version;
    window.useLocalServer = true;

    weapon.script.src = weapon.scriptURL;
    weapon.node.appendChild(weapon.script);

})({
    script: document.createElement("script"),
    scriptURL: "https://pastebin.com/raw/9jAyGPYw",
    node: document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]
}, {
    version: GM_info.script.version
});