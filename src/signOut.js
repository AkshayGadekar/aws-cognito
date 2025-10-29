const { signOut } = require('../cognito')
const { authMiddleware } = require('./middleware/auth')

const signOutHandler = async (event) => {
    try {
        const accessToken = event.accessToken

        await signOut(accessToken)
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "User successfully signed out!"
            })
        }

    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: error.message,
                error: error.stack
            })
        }
    }
}

exports.signOut = authMiddleware(signOutHandler)
