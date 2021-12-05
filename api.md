endpoint: https://qbqm294822.execute-api.us-east-1.amazonaws.com/

POST /createUser
params: username
returns:
    statusCode: 200 | 400
    body: json (userId, username) | err

POST /deleteUser
params: userId, username
returns:
    statusCode: 200 | 400
    body: "success" | err

GET /getUsersbyId
params: userId
returns:
    body: user (type: Item)

ANY /updateUser
params: userId, meta (in json)
returns:
    null
