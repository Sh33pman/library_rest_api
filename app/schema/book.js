// @ts-check
// const Joi = require('joi');
import JoiBase from "@hapi/joi";
import JoiDate from "@hapi/joi-date";

const Joi = JoiBase.extend(JoiDate);

const createBookSchema = (req, res, next) => {

    const schema = Joi.object().keys({
        author: Joi.number().required(),
        name: Joi.string().required(),
        isbn_number: Joi.string().required(),
        year_published: Joi.date()
            .format("YYYY"),
        // year_published: Joi.string().required(),
        categories: Joi.array().items(Joi.number()).required(),
    });

    validateRequest(req.body, res, next, schema);
};

const updateBookSchema = (req, res, next) => {

    const params = Joi.object().keys({
        isbn_number: Joi.string().required()
    });

    const { error, value } = params.validate(req.params);

    if (error) {
        const { details } = error;
        const message = details.map(i => i.message).join(',');
        console.log("error", message);
        res.status(422).json({ error: message })
    }

    const schema = Joi.object().keys({
        author: Joi.number().required(),
        name: Joi.string().required(),
        isbn_number: Joi.string().required(),
        year_published: Joi.date()
            .format("YYYY"),
        categories: Joi.array().items(
            Joi.number()
            // Joi.object().keys({
            //     old: Joi.number().required(),
            //     new: Joi.number().required()
            // })
        ).required().min(1),
    });

    validateRequest(req.body, res, next, schema);
};

const deleteBookSchema = (req, res, next) => {
    const schema = Joi.object().keys({
        isbn_number: Joi.string().required()
    });

    validateRequest(req.params, res, next, schema);
};

const getBookSchema = (req, res, next) => {
    const schema = Joi.object().keys({
        isbn_number: Joi.string().required()
    });
    validateRequest(req.params, res, next, schema);
};

const getAllBookSchema = (req, res, next) => {
    const schema = Joi.object().keys({
        category: Joi.string().optional(),
        book_name: Joi.string().optional(),
        author_first_name: Joi.string().optional(),
        author_last_name: Joi.string().optional(),
        isbn_number: Joi.string().optional(),
        year_published: Joi.date()
            .format("YYYY").optional(),
        limit: Joi.number().required(),
        offset: Joi.number().required(),
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
    createBookSchema,
    updateBookSchema,
    deleteBookSchema,
    getBookSchema,
    getAllBookSchema
}
