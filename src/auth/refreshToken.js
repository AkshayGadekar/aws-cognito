const { refreshToken } = require('../cognito')

exports.refreshToken = async (event) => {
    try {
        const { refreshToken: token } = JSON.parse(event.body)
        if (!token) throw new Error('Refresh token is required')

        const response = await refreshToken(token)

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Token refreshed successfully",
                tokens: response.AuthenticationResult // Access Token and Id Token
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
