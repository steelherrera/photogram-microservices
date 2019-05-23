const core = require('photogram-core');
const Utils = core.Utils;
const PostDAO = require('./dao/post-dao').PostDAO;
const AWS = require('aws-sdk');
const schema = require('./schema.json');
const uniqid = require('uniqid');

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

const saveImageToS3 = async (post, user) => {
    const s3 = new AWS.S3({
        "params": {
            "Bucket": "photogram-user-images"
        }
    });
    const fileName = user.id + "_" + post.id;
    const data = {
        "Key": fileName,
        "Body": new Buffer(post.userPic.base64.replace(/^data:image\/\w+;base64,/, ""), "base64"),
        "ContentEncoding": "base64",
        "ContentType": "image/jpeg"
    };
    return await(s3.putObject(data)).promise();
};

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let output = {};
    console.log("Inside handler, event: " + JSON.stringify(event));
    const postDao = new PostDAO();
    const user = JSON.parse(event.requestContext.authorizer.user);
    const stepfunctions = new AWS.StepFunctions();
    try{
        const post = JSON.parse(event.body);
        console.log("Post created: " + JSON.stringify(post));
        post.id = uniqid();
        const s3ImageInsertion = await(saveImageToS3(post, user));
        console.log("Image insertion on S3 result: " + JSON.stringify(s3ImageInsertion));
        delete post.userPic;
        const params = {
            "stateMachineArn": process.env.stepFunctionsARN,
            "name": user.id + "-" + Date.now(),
            "input": JSON.stringify({ "post": post, "user": user })
        };
        const result = await (stepfunctions.startExecution(params).promise());
        console.log("Response from step functions: " + JSON.stringify(result));
        output = toResponse(200, { "message": "OK" });
        /*const validation = Utils.validateSchema(user, schema);
        if(validation.valid){   
            post.id = uniqid();
            const insertionResponse = await(postDao.insert(post));
            console.log("Insertion response: " + JSON.stringify(insertionResponse));
            output = toResponse(200, "OK");
        }else{
            console.error("Schema error: " + JSON.stringify(validation));
            throw new Error(Utils.buildSchemaErrorsMessage(validation.errors));
        }*/
    }catch(exc){
        console.error("Exception: " + exc.message);
        output = toResponse(500, "Error interno, intente nuevamente más tarde.");
    }finally{
        console.log("Inside handler, output: " + JSON.stringify(output));
        context.succeed(output);
    }
};
