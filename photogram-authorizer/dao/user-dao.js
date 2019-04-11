const core = require('photogram-core');
const dbConnector = core.DBConnector;

module.exports.UserDAO = function () {
    const modelName = "User";

    this.findById = async (id) => {
        const params = {
            "id": id
        }
        return await(dbConnector.findByFields(modelName, params))[0];
    }
}