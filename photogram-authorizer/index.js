const core = require('photogram-core');
const UserDAO = require('./dao/user-dao').UserDAO;
const jwt = require('jsonwebtoken');

const buildDeny = () => {
    return {
       "policyDocument":{
          "Version":"2018-08-30",
          "Statement":[
             {
                "Action":"execute-api:Invoke",
                "Effect":"Deny",
                "Resource":[
                   "*"
                ]
             }
          ]
       }
   };
};

const policyTemplate = {
    "Version": "2012-10-17",
    "Statement":[{
        "Action": "execute-api:Invoke",
        "Effect": "{{effect}}",
        "Resource": "arn:aws:execute-api:{{region}}:{{account_id}}:{{restApiId}}/{{stage}}/POST/*"
    },
    {
        "Action": "execute-api:Invoke",
        "Effect": "{{effect}}",
        "Resource": "arn:aws:execute-api:{{region}}:{{account_id}}:{{restApiId}}/{{stage}}/PUT/*"
    },
    {
        "Action": "execute-api:Invoke",
        "Effect": "{{effect}}",
        "Resource": "arn:aws:execute-api:{{region}}:{{account_id}}:{{restApiId}}/{{stage}}/GET/*"
    }]
};

const fillPolicy = (effect, methodArn) => {
    const prms = methodArn.split(':');
    const apiGatewayArnTmp = prms[5].split('/');
    const account_id = prms[4];
    const region = prms[3];
    const restApiId = apiGatewayArnTmp[0];
    const stage = apiGatewayArnTmp[1];
    policyTemplate = JSON.stringify(policyTemplate);
    policyTemplate = policyTemplate.replace(new RegExp("{{effect}}", 'g'), effect).
    replace(new RegExp("{{region}}", 'g'), region).
    replace(new RegExp("{{account_id}}", 'g'), account_id).
    replace(new RegExp("{{restApiId}}", 'g'), restApiId).
    replace(new RegExp("{{stage}}", 'g'), stage);
    return JSON.parse(policyTemplate);
};


exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    console.log("Inside handler, event: " + JSON.stringify(event));
    const userDao = new UserDAO();
    const token = event.headers["x-api-key"];
    try{
        const decodedUser = jwt.verify(token, core.config.jwt.secretKey);
        const user = await(userDao.findById(decodedUser.id));
        if(user){
            role = user.role;
            if (user.sessionToken !== token) {
                callback(null, buildDeny());
                return;
            }
        } else{
            callback("Unauthorized.");
        }
    }catch(exc){
        console.error("Exception: " + exc.message);
        callback("Internal server error.");
    }finally{
        const policy = fillPolicy("Allow", event.methodArn);
        const authResponse = {
            policyDocument: policy,
            context: {
                client: JSON.stringify(client),
                user: JSON.stringify(user)
            }
        };
        callback(null, authResponse);
    }
};