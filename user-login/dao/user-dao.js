const core = require('photogram-core');
const dbConnector = core.DBConnector;

module.exports.UserDAO = function () {
    const modelName = "User";

    this.findByUsername = async (username) => {
        const params = {
            "username": username
        }
        const result = await(dbConnector.findByFields(modelName, params));
        console.log(JSON.stringify(result));
        return result[0];
    }

    this.updateSessionToken = async (username, sessionToken) => {
        const params = {
            "username": username
        };
        const set = {
            "sessionToken": sessionToken
        };
        return await(dbConnector.update(modelName, set, params));
    }
}