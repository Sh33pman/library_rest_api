// @ts-check
import moment from 'moment';
import dbQuery from '../db/dev/db_Query';
import { empty } from '../helpers/validation';
import { errorMessage, successMessage, status } from '../helpers/status';


const createCategory = async (req, res) => {
    const { name, description } = req.body;

    if (empty(name)) {
        errorMessage.error = 'Name is required';
        return res.status(status.bad).send(errorMessage);
    }

    if (empty(description)) {
        errorMessage.error = 'description is required';
        return res.status(status.bad).send(errorMessage);
    }

    const createCategoryQuery = `INSERT INTO  categories(
                                name, description)
                                VALUES($1, $2)
                                returning *`;
    const values = [name, description];

    try {
        const { rows } = await dbQuery.query(createCategoryQuery, values);
        const dbResponse = rows[0];
        successMessage.data = dbResponse;

        return res.status(status.created).send(successMessage);

    } catch (error) {
        if (error.routine === '_bt_check_unique') {
            errorMessage.error = 'This category name has been created already';
            return res.status(status.conflict).send(errorMessage);
        }
        console.log(error)
        errorMessage.error = 'Unable to create Category';
        return res.status(status.error).send(errorMessage);
    }
};


const getAllCategories = async (req, res) => {
    // const { name, description } = req.body;

    const getAllCategoriesQuery = 'SELECT * FROM categories ORDER BY name DESC';
    try {
        const { rows } = await dbQuery.query(getAllCategoriesQuery);
        const dbResponse = rows;

        if (dbResponse[0] === undefined) {
            errorMessage.error = 'No categories found';
            return res.status(status.bad).send(errorMessage);
        }

        successMessage.data = dbResponse;
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch categories';
        return res.status(status.error).send(errorMessage);
    }
};

const getCategory = async (req, res) => {
    const { category_id } = req.params;


    try {
        const getAllCategoriesQuery = `SELECT * FROM categories WHERE category_id=$1 ORDER BY name DESC`;
        const { rows } = await dbQuery.query(getAllCategoriesQuery, [category_id]);
        const dbResponse = rows;

        if (dbResponse[0] === undefined) {
            errorMessage.error = 'No categories found';
            return res.status(status.bad).send(errorMessage);
        }

        successMessage.data = dbResponse;
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch categories';
        return res.status(status.error).send(errorMessage);
    }
};


const deleteCategory = async (req, res) => {
    const { category_id } = req.params;

    try {
        const deleteCategoryQuery = 'DELETE FROM categories WHERE category_id=$1 returning *';
        const { rows } = await dbQuery.query(deleteCategoryQuery, [category_id]);
        const dbResponse = rows[0];

        if (!dbResponse) {
            errorMessage.error = 'There is no category with this Id';
            return res.status(status.notfound).send(errorMessage);
        }

        successMessage.data = {};
        successMessage.data.message = 'Category deleted successfully';
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'Failed to delete Category';
        return res.status(status.error).send(error);
    }
};


const updateCategory = async (req, res) => {
    const { category_id } = req.params;
    const { name, description } = req.body;

    try {

        const updateCategory = `UPDATE categories
                                    SET name=$1, description=$2
                                    WHERE category_id=$3 
                                    returning *`;
        const values = [name, description, category_id];
        const response = await dbQuery.query(updateCategory, values);
        const dbResult = response.rows[0];
        delete dbResult.password;
        successMessage.data = dbResult;
        return res.status(status.success).send(successMessage);

    } catch (error) {
        console.log(error)

        if (error.routine === '_bt_check_unique') {
            errorMessage.error = 'Name is taken already';
            return res.status(status.conflict).send(errorMessage);
        }

        errorMessage.error = 'Failed to update Category';
        return res.status(status.error).send(errorMessage);
    }
};

export {
    createCategory,
    getAllCategories,
    getCategory,
    deleteCategory,
    updateCategory,
};