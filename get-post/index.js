const core = require('photogram-core');
const PostDAO = require('./dao/post-dao').PostDAO;

const toResponse = (code, message) => {
    return {
        "statusCode": code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin" : "*",
            "Access-Control-Allow-Credentials": true,
            "Access-Control-Allow-Headers": "*"
        },
        "body": JSON.stringify({
            code: code,
            message: message
        })
    };
};

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let message = {};
    if(event.Records && event.Records[0] && event.Records[0].Sns && event.Records[0].Sns.Message){
        message = JSON.parse(event.Records[0].Sns.Message);
    }
    let output = {};
    console.log("Inside handler, event: " + JSON.stringify(event));
    const user = JSON.parse(event.requestContext.authorizer.user);
    const postDao = new PostDAO();
    try{
        const posts = postDao.getPostsByUserId(event.pathParameters.id);
        output = toResponse(200, { "posts": posts });
    }catch(exc){
        console.error("Exception: " + exc.message);
        output = toResponse(500, "Error interno, intente nuevamente más tarde.");
    }finally{
        console.log("Inside handler, output: " + JSON.stringify(output));
        context.succeed(output);
    }
};