var Client = require('coinbase').Client;
var coinbaseClient = new Client({'apiKey':'lxESKgeyFx5sOaGD', 'apiSecret':'VLwZ3tju0mJZovCueZvfQT1fZO5rUJa7'});
const http = require('http');

/*http.createServer((request, response) => {

    request.on('error', (err) => {
        console.log("Error!");
    }).on('data', (chunk) => {
        console.log("Chunk!");
    }).on('end', () => {
        console.log("End!");
        response.statusCode = 200;
        response.end("Hello World!");
    });

}).listen(8080);*/

function intervalTest() { 
    console.log("Boop!");
}

function testCoinbase() {
    coinbaseClient.getAccounts({}, function(err, accounts) {
        accounts.forEach(function(acct) {
            console.log(acct.name + " -- " + acct.balance.amount);
        });
    });
}

//setInterval(intervalTest, 1000);

testCoinbase();
