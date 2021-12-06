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
    try {
        await dynamoDBClient.delete({
            TableName: 'users',
            Key: {
                 userId: requestBody.userId
            }
        }).promise()
        body = `User with userId ${requestBody.userId} deleted`
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

