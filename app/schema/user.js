// @ts-check
const Joi = require('joi');

const signUpUserSchema = (req, res, next) => {

    const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        // email: Joi.string().required(),
        name: Joi.string().required(),
        username: Joi.string().required(),
        password: Joi.string().required().min(5)
    });

    validateRequest(req.body, res, next, schema);
};

const logInUserSchema = (req, res, next) => {
    const schema = Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required().min(5)
    });

    validateRequest(req.body, res, next, schema);
};

function validateRequest(req, res, next, schema) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };

    // const { error, value } = schema.validate(req.body, options);
    const { error, value } = schema.validate(req, options);

    if (error) {
        const { details } = error;
        const message = details.map(i => i.message).join(',');

        console.log("error", message);
        res.status(422).json({ error: message })
    } else {
        req.body = value;
        next();
    }
}

export {
    signUpUserSchema,
    logInUserSchema
}
