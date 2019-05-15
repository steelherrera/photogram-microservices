const core = require('photogram-core');
const Utils = core.Utils;
const PostDAO = require('./dao/post-dao').PostDAO;
const uniqid = require('uniqid');
const schema = require("./schema.json");

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
    let output = {};
    console.log("Inside handler, event: " + JSON.stringify(event));
    const postDao = new PostDAO();
    try{
        const post = JSON.parse(event.body);
        const validation = Utils.validateSchema(user, schema);
        if(validation.valid){
            post.id = uniqid();
            const insertionResponse = await(postDao.insert(post));
            console.log("Insertion response: " + JSON.stringify(insertionResponse));
            output = toResponse(200, "OK");
        }else{
            console.error("Schema error: " + JSON.stringify(validation));
            throw new Error(Utils.buildSchemaErrorsMessage(validation.errors));
        }
    }catch(exc){
        console.error("Exception: " + exc.message);
        output = toResponse(500, "Error interno, intente nuevamente más tarde.");
    }finally{
        console.log("Inside handler, output: " + JSON.stringify(output));
        context.succeed(output);
    }
};
