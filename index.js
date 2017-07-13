var Client = require('coinbase').Client;
var coinbaseClient = new Client({ 'apiKey': 'lxESKgeyFx5sOaGD', 'apiSecret': 'VLwZ3tju0mJZovCueZvfQT1fZO5rUJa7' });

const minimumETHProfitMargin = 0.05;

function testCoinbase() {

    checkETHProfitMargin();

    /* coinbaseClient.getPaymentMethods({}, function(err, pms) {
        console.log(pms);
    }); */

    /* coinbaseClient.getAccounts({}, function(err, accounts) {
        console.log(accounts);
    }); */

}

function checkETHProfitMargin() { //Check profit margins and sell all if margin is higher then limit
    console.log(new Date().toString());
    coinbaseClient.getAccount("28b44d24-8162-5983-895f-08a5079bc86c", function (err, account) { //ETH Wallet
        account.getTransactions({}, function (err, txs) {
            if (err) {
                console.error(err);
                throw "Error in checkETHProfitMargin - account.getTransactions";
            }
            var lastBuy;
            for (var i = 0; i < txs.length; i++) {
                if (txs[i].type.toLowerCase() == "buy" && txs[i].status.toLowerCase() == "completed") {
                    lastBuy = txs[i];
                    break;
                }
            }
            if (lastBuy) {
                var sellParams = {
                    "amount": account.balance.amount,
                    "currency": "ETH",
                    "payment_method": "36dfb503-14ee-522f-86fc-ea62f705e4c8", //USD Wallet       
                    "quote": true
                };
                account.sell(sellParams, function (err, tx) {
                    if (err) {
                        console.error(err);
                        throw "Error in checkETHProfitMargin - account.sell (quote)";
                    }
                    var lastBuyPrice = lastBuy.native_amount.amount;
                    var currentSellPrice = tx.total.amount;
                    var currentProfitMargin = currentSellPrice / lastBuyPrice;
                    console.log("Last buy price - " + lastBuyPrice);
                    console.log("Current sell price - " + currentSellPrice);
                    console.log("Profit margin - " + parseFloat(((currentProfitMargin) - 1) * 100).toFixed(2) + "%");
                    if ((currentProfitMargin - 1) > minimumETHProfitMargin) {
                        var sellParams = {
                            "amount": account.balance.amount,
                            "currency": "ETH",
                            "payment_method": "36dfb503-14ee-522f-86fc-ea62f705e4c8"
                        }; //USD Wallet                
                        account.sell(sellParams, function (err, tx) { //SELL IT ALL
                            if (err) {
                                console.error(err);
                                throw "Error in checkETHProfitMargin - account.sell (sell)";
                            }
                            console.log("Sold all ETH for a profit margin of " + parseFloat(((currentProfitMargin) - 1) * 100).toFixed(2) + "%");
                        });
                    } else {
                        console.log("Waiting to sell...");
                    }
                    console.log("----------");
                });
            }
        });
    });
}

function testSell() {
    coinbaseClient.getAccount("28b44d24-8162-5983-895f-08a5079bc86c", function (err, account) { //ETH Wallet
        var sellParams = {
            "amount": "0.01",
            "currency": "ETH",
            "payment_method": "36dfb503-14ee-522f-86fc-ea62f705e4c8"
        }; //USD Wallet                
        account.sell(sellParams, function (err, tx) { //SELL IT ALL
            if (err) {
                console.error(err);
                throw "Error in checkETHProfitMargin - account.sell (sell)";
            }
            console.log(tx);
        });
    });
}

setInterval(checkETHProfitMargin, 10000);

//testCoinbase();
