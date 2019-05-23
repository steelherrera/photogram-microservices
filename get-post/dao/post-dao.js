const core = require('photogram-core');
const dbConnector = core.DBConnector;

module.exports.PostDAO = function () {
    const modelName = "Post";

    this.getPostsByUserId = async (userId) => {
        const query = "SELECT * FROM Post INNER JOIN User ON Post.userId = User.id WHERE User.id = '" + userId + "'";
        console.log(query);
        return await(dbConnector.buildComplexQuery(modelName, query));
    };
};