
const { signIn } = require('../cognito')
const { validateFields } = require('../validations')

exports.signIn = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body)
        validateFields({ email, password })

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
