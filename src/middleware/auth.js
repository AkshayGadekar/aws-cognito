const { getUserInfo } = require('../../cognito')

exports.authMiddleware = (handler) => {
    return async (event) => {
        try {
            const authHeader = event.headers.authorization || event.headers.Authorization
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return {
                    statusCode: 401,
                    body: JSON.stringify({
                        msg: 'Unauthorized - Missing or invalid authorization header'
                    })
                }
            }

            const accessToken = authHeader.split(' ')[1]
            
            const userInfo = await getUserInfo(accessToken)

            event.accessToken = accessToken
            
            // Add user info to event for use in handler
            event.user = {
                username: userInfo.Username,
                attributes: {}
            }
            
            // Parse user attributes
            if (userInfo.UserAttributes) {
                userInfo.UserAttributes.forEach(attr => {
                    event.user.attributes[attr.Name] = attr.Value
                })
            }

            // Call the original handler
            return await handler(event)
            
        } catch (error) {
            console.error('Auth middleware error:', error)
            return {
                statusCode: 401,
                body: JSON.stringify({
                    msg: error.message,
                    error: error.stack
                })
            }
        }
    }
}
