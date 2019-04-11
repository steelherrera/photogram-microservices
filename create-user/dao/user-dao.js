const core = require('photogram-core');
const dbConnector = core.DBConnector;

module.exports.UserDAO = function () {
    const modelName = "User";

    this.insert = async (user) => {
        return await(dbConnector.insert(modelName, user));
    }
}