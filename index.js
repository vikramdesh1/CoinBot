require('dotenv').config();
var bot = require('./bot.js');
var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

const BTC_WALLET = process.env.BTC_WALLET;
const ETH_WALLET = process.env.ETH_WALLET;
const LTC_WALLET = process.env.LTC_WALLET;
const SENTRY_DSN = process.env.SENTRY_DSN;

//Refresh period
const REFRESH_PERIOD = process.env.REFRESH_PERIOD;

//Sentry
var Raven = require('raven');
Raven.config(SENTRY_DSN).install();

app.listen(3000);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html', function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200);
        res.end(data);
    })
}

io.on('connection', function (socket) {
    console.log("Front-end client connected");
});

try {
    bot.startWatchLoop(LTC_WALLET, function (output) {
        console.log(output);
        io.emit('loopUpdate', output);
    });
    /*setTimeout(function () {
        bot.startWatchLoop(BTC_WALLET, function (output) {
            console.log(output);
            io.emit('loopUpdate', output);
        });
    }, REFRESH_PERIOD / 2);*/

} catch (err) {
    console.log(err);
}