const { signUp, confirmSignUp } = require('../cognito')

exports.signUp = async (event) => {
    try {
        const { name, email, password } = JSON.parse(event.body)
        if (!name || !email || !password) {
            return {
                statusCode: 422,
                body: JSON.stringify({
                    msg: 'Name, email, and password are required'
                })
            }
        }

        await signUp(name, email, password)
        
        // to do: auto verify email and confirm the account, disable auto verification

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Account created, please verify your email!"
            })
        }
    }catch (error) {
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

exports.confirmSignUp = async (event) => {
    try {
        const { email, confirmationCode } = JSON.parse(event.body)
        if (!email || !confirmationCode) {
            return {
                statusCode: 422,
                body: JSON.stringify({
                    msg: 'Email and confirmation code are required'
                })
            }
        }

        await confirmSignUp(email, confirmationCode)

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "User successfully confirmed!"
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
