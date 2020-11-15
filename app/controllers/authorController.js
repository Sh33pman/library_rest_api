// @ts-check
import moment from 'moment';
import dbQuery from '../db/dev/db_Query';
import { empty, isEmpty } from '../helpers/validation';
import { errorMessage, successMessage, status } from '../helpers/status';



const createAuthor = async (req, res) => {
    const { first_name, last_name } = req.body;

    const createAuthorQuery = `INSERT INTO  authors(first_name, last_name, operation_by_user) VALUES($1, $2, $3) returning *`;
    const values = [first_name, last_name, req.user.username];

    try {
        const { rows } = await dbQuery.query(createAuthorQuery, values);
        const dbResponse = rows[0];
        successMessage.data = dbResponse;

        return res.status(status.created).send(successMessage);

    } catch (error) {

        console.log(error)
        errorMessage.error = 'Unable to create Author';
        return res.status(status.error).send(errorMessage);
    }
};


const getAllAuthors = async (req, res) => {

    try {

        const getAllAuthorsQuery = buildGetAllAuthorsQuery(req.query)
        const { rows } = await dbQuery.query(getAllAuthorsQuery);
        const dbResponse = rows;

        successMessage.data = dbResponse;
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch authors';
        return res.status(status.error).send(errorMessage);
    }
};

function buildGetAllAuthorsQuery(payload) {
    const { limit, offset, last_name, first_name } = payload;
    let query = `SELECT * FROM authors `;

    let isSearchCriteriaProvided = !(isEmpty(last_name) && isEmpty(first_name));

    if (isSearchCriteriaProvided) {
        query += `WHERE `

        if (first_name) {
            query += `  LOWER(first_name) LIKE LOWER('%${first_name}%') `
        }

        if (last_name) {
            query += `${first_name ? "OR " : ""} LOWER(last_name) LIKE LOWER('%${last_name}%') `
        }
    }

    query += ` ORDER BY first_name DESC `;

    if (limit) {
        query += ` LIMIT ${limit}`
    }

    if (offset) {
        query += ` OFFSET ${offset}`
    }

    return query


}

const getAuthor = async (req, res) => {
    const { author_id } = req.params;


    try {
        const getAllAuthorsQuery = `SELECT * FROM authors WHERE author_id=$1 ORDER BY first_name DESC`;
        const { rows } = await dbQuery.query(getAllAuthorsQuery, [author_id]);
        const dbResponse = rows;

        if (dbResponse[0] === undefined) {
            errorMessage.error = 'No Authors found';
            return res.status(status.bad).send(errorMessage);
        }

        successMessage.data = dbResponse[0];
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch authors';
        return res.status(status.error).send(errorMessage);
    }
};


const deleteAuthor = async (req, res) => {
    const { author_id } = req.params;

    try {
        const deleteAuthorQuery = 'DELETE FROM authors WHERE author_id=$1 returning *';
        const { rows } = await dbQuery.query(deleteAuthorQuery, [author_id]);
        const dbResponse = rows[0];

        if (!dbResponse) {
            errorMessage.error = 'There is no author with this Id';
            return res.status(status.notfound).send(errorMessage);
        }

        successMessage.data = {};
        successMessage.data.message = 'Author deleted successfully';
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'Failed to delete Author';
        return res.status(status.error).send(error);
    }
};


const updateAuthor = async (req, res) => {
    const { author_id } = req.params;
    const { first_name, last_name } = req.body;

    try {

        const updateAuthor = `UPDATE authors SET first_name=$1, last_name=$2, operation_by_user=$3  WHERE author_id=$4 returning *`;
        const values = [first_name, last_name, req.user.username, author_id];
        const response = await dbQuery.query(updateAuthor, values);
        const dbResult = response.rows[0];

        if (!dbResult) {
            errorMessage.error = 'Failed to update Author. Id not found';
            return res.status(status.error).send(errorMessage);
        }

        successMessage.data = dbResult;
        return res.status(status.success).send(successMessage);

    } catch (error) {
        console.log(error)
        errorMessage.error = 'Failed to update Author';
        return res.status(status.error).send(errorMessage);
    }
};

export {
    createAuthor,
    getAllAuthors,
    getAuthor,
    deleteAuthor,
    updateAuthor,
};