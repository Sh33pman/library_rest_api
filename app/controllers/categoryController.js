// @ts-check
import moment from 'moment';
import dbQuery from '../db/dev/db_Query';
import { empty } from '../helpers/validation';
import { errorMessage, successMessage, status } from '../helpers/status';


const createCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        const createCategoryQuery = `INSERT INTO  categories( name, description,  operation_by_user) VALUES($1, $2, $3)
        returning *`;
        const values = [name, description, req.user.username];
        const { rows } = await dbQuery.query(createCategoryQuery, values);

        const dbResponse = rows[0];
        successMessage.data = dbResponse;

        console.log("CREATED CATEGORY: => ", dbResponse)
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

    try {
        let getAllCategoriesQuery = buildGetAllCategoriesQuery(req.query);

        const { rows } = await dbQuery.query(getAllCategoriesQuery);
        const dbResponse = rows;

        let refactoredRes = refactorGetAllCategoriesRes(dbResponse)

        successMessage.data = refactoredRes.data
        successMessage.count = refactoredRes.count
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch categories';
        return res.status(status.error).send(errorMessage);
    }
};

function refactorGetAllCategoriesRes(dbResponse) {

    let data = (dbResponse || []).map(category => {
        return {
            "category_id": category.category_id,
            "name": category.name,
            "description": category.description,
            "operation_by_user": category.operation_by_user
        }
    });

    let res = {
        data: data,
        count: dbResponse && dbResponse[0] && dbResponse[0].full_count || 0
    }

    return res;
}

function buildGetAllCategoriesQuery(payload) {
    const { limit, offset, name } = payload;
    let query = 'SELECT * , count(*) OVER() AS full_count FROM categories ';

    if (name) {
        query += ` WHERE LOWER(name) LIKE LOWER('%${name}%') `
    }

    query += ` ORDER BY name DESC `;

    if (limit && parseInt(limit) !== -1) {
        query += ` LIMIT ${limit}`
        query += ` OFFSET ${offset}`
    }

    return query;

}

const getCategory = async (req, res) => {
    const { category_id } = req.params;

    try {
        const getAllCategoriesQuery = `SELECT * FROM categories WHERE category_id=$1 ORDER BY name DESC`;
        const { rows } = await dbQuery.query(getAllCategoriesQuery, [category_id]);
        const dbResponse = (rows && rows[0]) || {};
        delete dbResponse.operation_by_user
        delete dbResponse.count
        successMessage.data = dbResponse;

        delete successMessage.count
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
        const dbResponse = await dbQuery.query(deleteCategoryQuery, [category_id]);

        if (dbResponse && dbResponse.code === "23503") {
            errorMessage.error = 'Cannot Delete this category because it is linked to other entities';
            return res.status(status.notfound).send(errorMessage);
        }

        if (dbResponse.rows && dbResponse.rows.length === 0) {
            errorMessage.error = 'There is no category with this Id';
            return res.status(status.notfound).send(errorMessage);
        }

        successMessage.data = {};
        successMessage.data.message = 'Category deleted successfully';
        delete successMessage.count
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
        const updateCategory = `UPDATE categories SET name=$1, description=$2 , operation_by_user=$3 WHERE category_id=$4  returning *`;
        // const values = [name, description, "Edvaldo", category_id];
        const values = [name, description, req.user.username, category_id];
        const response = await dbQuery.query(updateCategory, values);
        const dbResult = response.rows[0];

        if (!dbResult) {
            errorMessage.error = 'Failed to update Category. Id not found';
            return res.status(status.error).send(errorMessage);
        }

        delete successMessage.count
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