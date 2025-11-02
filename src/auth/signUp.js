const { signUp, confirmAccountByCode, confirmAccountManually, isEmailAutoVerified, markEmailAsVerified } = require('../cognito')
const { validateFields } = require('../validations')
const { makeAttributes } = require('../helpers')

exports.signUp = async (event) => {
    try {
        const { name, email, password, phoneNumber, gender, timeZone, birthdate, picture } = JSON.parse(event.body)
        if (!name || !email || !password) {
            return {
                statusCode: 422,
                body: JSON.stringify({
                    msg: 'Name, email, and password are required'
                })
            }
        }

        const attributes = makeAttributes({name, email, phoneNumber, gender, timeZone, birthdate, picture})

        // this will send the verification code to the email too, if email is added in AutoVerifiedAttributes
        await signUp(email, password, attributes)

        const isEmailAutoVerifiedByCognito = await isEmailAutoVerified()

        const msg = isEmailAutoVerifiedByCognito ? 'Account created. Please check your email for the verification code and confirm your account.'
	        : 'Account created. Please confirm your account using the confirmAccountManually API.';

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg
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

exports.confirmAccountByCode = async (event) => {
    /**
     * if you want to confirm account by confirmation code received in email from Cognito
     * this is required if email is added in AutoVerifiedAttributes
     */

    try {
        const { email, code } = JSON.parse(event.body)
        validateFields({ email, code })

        await confirmAccountByCode(email, code)

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Account successfully confirmed!"
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

exports.confirmAccountManually = async (event) => {
    /**
     * if you want to verify email and confirm account manually
     * this is required if email is not verified automatically by Cognito i.e. not added in AutoVerifiedAttributes
     * you can use an external email verification service like SendGrid, AWS SES, etc. to verify email
     * and then call this function to confirm account
     */

    try {
        const { email } = JSON.parse(event.body)
        validateFields({ email })

        await markEmailAsVerified(email)
        await confirmAccountManually(email)

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: "Account successfully confirmed!"
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
