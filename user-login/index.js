const core = require('photogram-core');
const Utils = core.Utils;
const UserDAO = require('./dao/user-dao').UserDAO;
const schema = require("./schema.json");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
    context.callbackWaitsForEmptyEventLoop = false;
    let output = {};
    console.log("Inside handler, event: " + JSON.stringify(event));
    const userDao = new UserDAO();
    try{
        const user = JSON.parse(event.body);
        const validation = Utils.validateSchema(user, schema);
        if(validation.valid){
            const dbUser = await(userDao.findByUsername(user.username));
            if(dbUser){
                if(bcrypt.compareSync(user.pass, dbUser.pass)){
                    const token = jwt.sign({
                        id: dbUser.id,
                    }, core.config.jwt.secretKey);
                    console.log("Token: " + token);
                    delete dbUser.pass;
                    output = toResponse(200, {
                        "token": token,
                        "user": dbUser
                    });
                    const dbResponse = await(userDao.updateSessionToken(user.username, token));
                    console.log("Db response: " + JSON.stringify(dbResponse));
                }
            }else{
                output = toResponse(404, "User not found.");
            }
        }else{
            console.error("Schema error: " + JSON.stringify(validation));
            throw new Error(Utils.buildSchemaErrorsMessage(validation.errors));
        }
    }catch(exc){
        console.error("Exception: " + exc.message);
        output = toResponse(500, "Internal server error.");
    }finally{
        console.log("Inside handler, output: " + JSON.stringify(output));
        context.succeed(output);
    }
};