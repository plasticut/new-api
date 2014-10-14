var config = require('./config');
var server = require(config.pathUncovered + 'server.js');
function startServer(next) {
    server.start(next);
}

function stopServer(next){
    next();
}

module.exports = {
    start: startServer,
    stop: stopServer
};