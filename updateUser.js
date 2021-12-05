const aws = require('aws-sdk');

const dynamoDBClient = new aws.DynamoDB.DocumentClient({
    region: 'us-east-1'
})

exports.handler = async (event, context, callback) => {
    var item = {
        userId: event.queryStringParameters.userId
    }
    var meta = event.queryStringParameters.meta
    Object.entries(meta).forEach(([key, value]) => {
        item[key] = value
    })

    await dynamoDBClient.put({
        TableName: "users",
        Item: item
    }).promise()
}

