const aws = require('aws-sdk');

const dynamoDBClient = new aws.DynamoDB.DocumentClient({
    region: 'us-east-1'
})

exports.handler = async (event, context, callback) => {
    let body
    let statusCode = 200
    const headers = {
        "Content-Type": "application/json"
    }
    var user = await dynamoDBClient.get({
        TableName: "users",
        Key: {
            userId: event.queryStringParameters.userId
        },
    })
    .promise()
    return {
        user
    }
}

