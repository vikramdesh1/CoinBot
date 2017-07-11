/*const http = require('http');

http.createServer((request, response) => {

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

setInterval(intervalTest, 1000);
