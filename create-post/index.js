const core = require('photogram-core');
const Utils = core.Utils;
const PostDAO = require('./dao/post-dao').PostDAO;
const AWS = require('aws-sdk');
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
    const user = JSON.parse(event.requestContext.authorizer.user);
    const postDao = new PostDAO();
    try{
        const post = JSON.parse(event.body);
        console.log("Post received: " + JSON.stringify(post));
        post.id = uniqid();
        const s3ImageInsertion = await(saveImageToS3(post, user));
        post.imageUrl = "https://s3.amazonaws.com/photogram-user-images/" + user.id + "_" + post.id;
        delete post.userPic;
        post.userId = user.id;
        console.log("Image insertion on S3 result: " + JSON.stringify(s3ImageInsertion));
        const insertionResponse = await(postDao.insert(post));
        console.log("Insertion response: " + JSON.stringify(insertionResponse));
        //const snsResponse = await (publishToSNS({ "post": post, "user": user }));
        //console.log("Response from SNS: " + JSON.stringify(snsResponse));
        output = toResponse(200, { "message": "OK" });
    }catch(exc){
        console.error("Exception: " + exc.message);
        output = toResponse(500, "Error interno, intente nuevamente más tarde.");
    }finally{
        console.log("Inside handler, output: " + JSON.stringify(output));
        context.succeed(output);
    }
};
