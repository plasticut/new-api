
function startServer(next) {
    next();
}

function stopServer(next){
    next();
}

module.exports = {
    start: startServer,
    stop: stopServer
};