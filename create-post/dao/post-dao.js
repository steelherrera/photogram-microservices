const core = require('photogram-core');
const dbConnector = core.DBConnector;

module.exports.PostDAO = function () {
    const modelName = "Post";

    this.insert = async (post) => {
        return await(dbConnector.insert(modelName, post));
    }
}