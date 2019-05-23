const core = require('photogram-core');
const dbConnector = core.DBConnector;

module.exports.UserDAO = function () {
    const modelName = "User";

    this.findById = async (id) => {
        const params = {
            "id": id
        };
        const result = await(dbConnector.findByFields(modelName, params));
        return result[0];
    }
}