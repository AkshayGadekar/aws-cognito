const { validateFields } = require('./validations')

exports.makeAttributes = ({name, email, phoneNumber, gender, timeZone, birthdate, picture}) => {
    const attributes = []
    
    if (name) {
        validateFields({ name })
        attributes.push({ Name: 'name', Value: name })
    }

    if (email) {
        validateFields({ email })
        attributes.push({ Name: 'email', Value: email })
    }

    if (phoneNumber) {
        validateFields({ phoneNumber })
        attributes.push({ Name: 'phone_number', Value: phoneNumber })
    }

    if (gender) {
        validateFields({ gender })
        attributes.push({ Name: 'gender', Value: gender })
    }

    if (timeZone) {
        validateFields({ timeZone })
        attributes.push({ Name: 'zoneinfo', Value: timeZone })
    }

    if (birthdate) {
        validateFields({ birthdate })
        attributes.push({ Name: 'birthdate', Value: birthdate })
    }

    if (picture) {
        validateFields({ picture })
        attributes.push({ Name: 'picture', Value: picture })
    }

    attributes.push({ Name: 'updated_at', Value: Date.now().toString() }) // in milliseconds

    return attributes
}
