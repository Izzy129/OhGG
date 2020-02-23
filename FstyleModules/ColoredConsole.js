(function(ColorCodes) {
    if (typeof console == "object") {
        console.colors = function() {
            return Object(ColorCodes);
        }
        console.join = function(string, args) {
            for (let i in args) {
                if (typeof args[i] == "string") {
                    string += args[i];
                    if (args[parseInt(i) + 1]) string += " ";
                    else string += '\u001b[0m';
                }
            }
            return string;
        }
        for (let color in ColorCodes) {
            console[color] = function() {
                this.log(this.join(ColorCodes[color], arguments));
            }
        }
    }
})({
    black: '\u001b[30m',
    red: '\u001b[31m',
    green: '\u001b[32m',
    yellow: '\u001b[33m',
    blue: '\u001b[34m',
    magenta: '\u001b[35m',
    cyan: '\u001b[36m',
    white: '\u001b[37m'
});