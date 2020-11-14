// @ts-check
const Joi = require('joi');

const createAuthorSchema = (req, res, next) => {

    const schema = Joi.object().keys({
        first_name: Joi.string().required(),
        last_name: Joi.string().required()
    });

    validateRequest(req.body, res, next, schema);
};

const updateAuthorSchema = (req, res, next) => {

    const params = Joi.object().keys({
        author_id: Joi.number().required()
    });

    const { error, value } = params.validate(req.params);

    if (error) {
        const { details } = error;
        const message = details.map(i => i.message).join(',');
        console.log("error", message);
        res.status(422).json({ error: message })
    }

    const schema = Joi.object().keys({
        first_name: Joi.string().required(),
        last_name: Joi.string().required()
    });

    validateRequest(req.body, res, next, schema);
};

const deleteAuthorSchema = (req, res, next) => {
    const schema = Joi.object().keys({
        author_id: Joi.number().required()
    });

    validateRequest(req.params, res, next, schema);
};

const getAuthorSchema = (req, res, next) => {
    const schema = Joi.object().keys({
        author_id: Joi.number().required()
    });
    validateRequest(req.params, res, next, schema);
};

const getAllAuthorSchema = (req, res, next) => {
    const schema = Joi.object().keys({
        limit: Joi.number().required(),
        offset: Joi.number().required(),
        first_name: Joi.string().optional(),
        last_name: Joi.string().optional(),
    });

    console.log(req.query)
    validateRequest(req.query, res, next, schema);
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
    createAuthorSchema,
    updateAuthorSchema,
    deleteAuthorSchema,
    getAuthorSchema,
    getAllAuthorSchema
}
