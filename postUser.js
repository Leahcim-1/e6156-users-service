const aws = require('aws-sdk');
const uuid = require('uuid');

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
    let item = {
        userId: uuid.v4(),
        username: requestBody.username,
        googleAuthId: ""
    }
    try {
        await dynamoDBClient.put({
            TableName: 'users',
            Item: item
        }).promise()
        body = {
            userId: item.userId,
            username: item.username
        }
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

