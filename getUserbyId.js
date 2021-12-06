const aws = require('aws-sdk');

const dynamoDBClient = new aws.DynamoDB.DocumentClient({
    region: 'us-east-1'
})

exports.handler = async (event, context, callback) => {
    let body
    let statusCode = 200
    
    const requestBody = JSON.parse(event.body)
    const headers = {
        "Content-Type": "application/json"
    }
    try {
        var user = await dynamoDBClient.get({
            TableName: "users",
            Key: {
                userId: requestBody.userId
            },
        })
        .promise()
        body = user.Item
    } catch (err) {
        statusCode = 400
        body = err
    } finally {
        body = JSON.stringify(body)
    }
    return {
        statusCode,
        body,
        headers
    }
}

