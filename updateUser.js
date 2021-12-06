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
    const requestBody = JSON.parse(event.body)
    var item = {
        userId: requestBody.userId
    }
    var meta = requestBody.meta
    Object.entries(meta).forEach(([key, value]) => {
        item[key] = value
    })
    try {
        await dynamoDBClient.put({
            TableName: "users",
            Item: item
        }).promise()
    } catch (err) {
        statusCode = 400
    } finally {
        body = JSON.stringify(body)
    }
    return {
        statusCode,
        body,
        headers
    }
}

