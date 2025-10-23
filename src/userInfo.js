const { getUserInfo } = require('../cognito')

exports.userInfo = async (event) => {
    try {
        const accessToken = event.headers.authorization.split(' ')[1]
        if (!accessToken) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    msg: 'Unauthorized'
                })
            }
        }

        const userInfo = await getUserInfo(accessToken)

        // Format the response
        const userData = {
            username: userInfo.Username,
            attributes: {}
        }

        // Parse user attributes
        if (userInfo.UserAttributes) {
            userInfo.UserAttributes.forEach(attr => {
                userData.attributes[attr.Name] = attr.Value
            })
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "User information retrieved successfully",
                user: userData,
            })
        }

    } catch (error) {
        console.error(error)
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: error.message,
                error: error.stack
            })
        }
    }
}
