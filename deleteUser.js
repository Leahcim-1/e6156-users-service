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
    let item = {
        userId: event.queryStringParameters.userId,
        username: event.queryStringParameters.username
    }
    try {
        await dynamoDBClient.delete({
            TableName: 'users',
            Item: item,
            ConditionExpression: 'attribute_not_exists(user_id)'
        }).promise()
        body = "User with userId " + item.userId + " deleted for " + item.username
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

