const { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, InitiateAuthCommand, GlobalSignOutCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand, GetUserCommand } = require('@aws-sdk/client-cognito-identity-provider')

const region = process.env.REGION
const UserPoolId = process.env.COGNITO_USER_POOL_ID
const ClientId = process.env.COGNITO_CLIENT_ID

const client = new CognitoIdentityProviderClient({
    region
})

exports.signUp = async (name, email, password) => {
    const command = new SignUpCommand({
        ClientId,
        Username: email,
        Password: password,
        UserAttributes: [
            { Name: 'name', Value: name },
            { Name: 'email', Value: email }
        ]
    })

    await client.send(command)
}

exports.confirmSignUp = async (email, confirmationCode) => {
    console.log('Confirming sign up for email:', email, 'with confirmation code:', confirmationCode.toString())
    const command  = new ConfirmSignUpCommand({
        ClientId,
        Username: email,
        ConfirmationCode: confirmationCode.toString()
    })

    await client.send(command)
}

exports.signIn = async (email, password) => {
    const command = new InitiateAuthCommand({
        ClientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password
        }
    })

    const response = await client.send(command)

    return response
}

exports.signOut = async (AccessToken) => {
    const command = new GlobalSignOutCommand({
        AccessToken
    })

    await client.send(command)
}

exports.forgotPassword = async (email) => {
    const command = new ForgotPasswordCommand({
        ClientId,
        Username: email
    })

    await client.send(command)
}

exports.confirmForgotPassword = async (email, code, newPassword) => {
    const command = new ConfirmForgotPasswordCommand({
        ClientId,
        Username: email,
        ConfirmationCode: code.toString(),
        Password: newPassword
    })

    await client.send(command)
}

exports.getUserInfo = async (AccessToken) => {
    const command = new GetUserCommand({
        AccessToken
    })

    const response = await client.send(command)

    return response
}
