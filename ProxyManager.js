const fs = require("fs");
const httpProxyAgent = require('https-proxy-agent');

(function(v) {
    v.raw = fs.readFileSync('./proxies.txt')
    .toString()
    .split('\n')
    .map(proxy => proxy.replace('\r', ''))
    .filter(proxy => !!proxy);

    for (let i = 0; i < v.raw.length; i++) {
        const proxy = v.raw[i];
        v.proxies.push(`http://${proxy}`);
        v.agents.push(new httpProxyAgent(`http://${proxy}`));
        v.unusable.push({});
    }

    class ProxyManager {
        constructor() {
            this.index = 0;
            this.host = null;
        }

        get agent() {
            if (this.index >= v.agents.length) this.index = 0;
            return v.agents[this.index++];
        }
    }

    module.exports = ProxyManager;
})({
    raw: null,
    proxies: [],
    agents: [],
    unusable: []
});