const { signOut } = require('../cognito')

exports.signOut = async (event) => {
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
