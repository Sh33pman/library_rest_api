// @ts-check
const Joi = require('joi');


const createCategorySchema = (req, res, next) => {
    console.log(req.body)

    const schema = Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required()
    });

    validateRequest(req.body, res, next, schema);
};

const updateCategorySchema = (req, res, next) => {

    console.log(req.params)

    const params = Joi.object().keys({
        category_id: Joi.number().required()
    });

    const { error, value } = params.validate(req.params);

    if (error) {
        const { details } = error;
        const message = details.map(i => i.message).join(',');

        console.log("error", message);
        res.status(422).json({ error: message })
    }


    // const schema = Joi.object().keys({
    //     name: Joi.string(),
    //     description: Joi.string()
    // }).or('name', 'description');
    const schema = Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required()
    });

    validateRequest(req.body, res, next, schema);
};

const deleteCategorySchema = (req, res, next) => {
    const schema = Joi.object().keys({
        category_id: Joi.number().required()
    });
    validateRequest(req.params, res, next, schema);
};

const getCategorySchema = (req, res, next) => {
    const schema = Joi.object().keys({
        category_id: Joi.number().required()
    });
    validateRequest(req.params, res, next, schema);
};


const getAllCategorySchema = (req, res, next) => {
    const schema = Joi.object().keys({
        limit: Joi.number().required(),
        offset: Joi.number().required(),
        name: Joi.string().optional()
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
    createCategorySchema,
    updateCategorySchema,
    deleteCategorySchema,
    getCategorySchema,
    getAllCategorySchema
}
