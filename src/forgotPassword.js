const { forgotPassword, confirmForgotPassword } = require('../cognito')

exports.forgotPassword = async (event) => {
    try {
        const { email } = JSON.parse(event.body)

        await forgotPassword(email)
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Password reset initiated. Please check your email for the confirmation code."
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

exports.confirmForgotPassword = async (event) => {
    try {
        const { email, code, newPassword } = JSON.parse(event.body)

        await confirmForgotPassword(email, code, newPassword)
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Password has been sucessfully reset."
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
