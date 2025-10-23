
const { signIn } = require('../cognito')

exports.signIn = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body)
        if (!email || !password) {
            return {
                statusCode: 422,
                body: JSON.stringify({
                    msg: 'Email and password are required'
                })
            }
        }

        const response = await signIn(email, password)

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "User successfully signed in!",
                tokens: response.AuthenticationResult // Access Token, Refresh Token and Id Token
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
