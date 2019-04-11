const core = require('photogram-core');
const Utils = core.Utils;
const UserDAO = require('./dao/user-dao').UserDAO;
const uniqid = require('uniqid');
const schema = require("./schema.json");
const bcrypt = require('bcrypt');

const toResponse = function(code, message){
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
    let output = {};
    console.log("Inside handler, event: " + JSON.stringify(event));
    const userDao = new UserDAO();
    try{
        const user = JSON.parse(event.body);
        const validation = Utils.validateSchema(user, schema);
        if(validation.valid){
            user.id = uniqid();
            user.pass = bcrypt.hashSync(user.pass, process.env.salt || 10);
            const insertionResponse = await(userDao.insert(user));
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
        context.succeed(output);
    }
};
