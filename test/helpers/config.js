var path = require('path');
var _ = require('lodash');
var fs = require('fs');

var pathCovered = path.resolve(__dirname + '/../../lib') + '/'; // covered
var pathUncovered = path.resolve(__dirname + '/../../../lib') + '/'; // uncovered

if (!fs.existsSync(pathUncovered)) {
    pathUncovered = pathCovered;
}

var config = require(pathUncovered + 'config');

config.database.database = config.database.database  + '-test';

module.exports = _.extend(config, {
    pathCovered: pathCovered,
    pathUncovered: pathUncovered,
});