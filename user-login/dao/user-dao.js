const core = require('photogram-core');
const dbConnector = core.DBConnector;

module.exports.UserDAO = function () {
    const modelName = "User";

    this.findById = async (username) => {
        const params = {
            "username": username
        }
        return await(dbConnector.findByFields(modelName, params))[0];
    }

    this.updateSessionToken = async (username, sessionToken) => {
        const params = {
            "username": username
        };
        const set = {
            "sessionToken": sessionToken
        };
        return await(dbConnector.findByFields(modelName, set, params));
    }
}