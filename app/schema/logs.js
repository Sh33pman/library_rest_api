// @ts-check
const Joi = require('joi');

const getAllLogsSchema = (req, res, next) => {
    const schema = Joi.object().keys({
        limit: Joi.number().optional(),
        offset: Joi.number().optional(),
        entity: Joi.string().optional().valid('authors', 'categories', 'books', 'book_categories', 'logs'),
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
    getAllLogsSchema
}
