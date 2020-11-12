// @ts-check
import moment from 'moment';
import dbQuery from '../db/dev/db_Query';
import { empty } from '../helpers/validation';
import { errorMessage, successMessage, status } from '../helpers/status';

// isbn_number VARCHAR(100) PRIMARY KEY,
// name VARCHAR(100) NOT NULL,
// author VARCHAR(100) NOT NULL,
// year_published VARCHAR(100) NOT NULL

// ■ /book - POST - insert a new book with fields: author, name, categories, isbn_number, year_published
// ■ /book/{id} - DELETE - delete a book
// ■ /book/{id} - PUT - update a book
// ■ /book - GET - retrieve books allowing filtering and paging
// ■ /book/{id} - GET - retrieve a specific book
const createBook = async (req, res) => {
    const { author, name, categories, isbn_number, year_published } = req.body;

    if (empty(author) || empty(name) || empty(isbn_number) || empty(year_published)) {
        errorMessage.error = 'Author, Name, ISBN and Year Pubblished is required';
        return res.status(status.bad).send(errorMessage);
    }

    if (categories.length > 0) {
        errorMessage.error = 'Categories is required required';
        return res.status(status.bad).send(errorMessage);
    }


    try {

        const createBookQuery = `INSERT INTO  books(isbn_number, name, author, year_published) VALUES($1, $2, $3, $4) returning *`;
        const values = [isbn_number, name, author, year_published];

        const { rows } = await dbQuery.query(createBookQuery, values);
        const dbResponse = rows[0];

        let bookCategoryRes = await insertBookCategory(req, res);

        if (!bookCategoryRes) {
            errorMessage.error = 'Unable to create Book';
            return res.status(status.error).send(errorMessage);
        }

        successMessage.data = dbResponse;
        return res.status(status.created).send(successMessage);

    } catch (error) {
        if (error.routine === '_bt_check_unique') {
            errorMessage.error = 'This book ISBN has been created already';
            return res.status(status.conflict).send(errorMessage);
        }
        console.log(error)
        errorMessage.error = 'Unable to create Book';
        return res.status(status.error).send(errorMessage);
    }
};


const insertBookCategory = async (req, res) => {
    const { author, name, categories, isbn_number, year_published } = req.body;

    try {

        let insertBookCategoryQuery = `INSERT INTO  book_categories(category_id, isbn_number) VALUES`;
        categories.array.forEach((category, idx) => {
            insertBookCategoryQuery += `('${category}', '${isbn_number}') `
            if (!(idx === (categories.length - 1))) {
                insertBookCategoryQuery += `, `
            }
        });

        console.log(insertBookCategoryQuery)

        const { rows } = await dbQuery.query(insertBookCategoryQuery);

        return rows[0];
    } catch (error) {
        console.log(error)
        errorMessage.error = 'Unable to create Book';
        return res.status(status.error).send(errorMessage);
    }
}


const getAllBooks = async (req, res) => {
    // const { first_name, last_name } = req.body;

    const getAllBooksQuery = 'SELECT * FROM books ORDER BY name DESC';
    try {
        const { rows } = await dbQuery.query(getAllBooksQuery);
        const dbResponse = rows;

        if (dbResponse[0] === undefined) {
            errorMessage.error = 'No Books found';
            return res.status(status.bad).send(errorMessage);
        }

        successMessage.data = dbResponse;
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch books';
        return res.status(status.error).send(errorMessage);
    }
};

const getBook = async (req, res) => {
    const { book_id } = req.params;


    try {
        const getAllBooksQuery = `SELECT * FROM books WHERE book_id=$1 ORDER BY first_name DESC`;
        const { rows } = await dbQuery.query(getAllBooksQuery, [book_id]);
        const dbResponse = rows;

        if (dbResponse[0] === undefined) {
            errorMessage.error = 'No Books found';
            return res.status(status.bad).send(errorMessage);
        }

        successMessage.data = dbResponse;
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch books';
        return res.status(status.error).send(errorMessage);
    }
    // const { book_id } = req.params;


    // try {
    //     const getAllBooksQuery = `SELECT * FROM books WHERE book_id=$1 ORDER BY first_name DESC`;
    //     const { rows } = await dbQuery.query(getAllBooksQuery, [book_id]);
    //     const dbResponse = rows;

    //     if (dbResponse[0] === undefined) {
    //         errorMessage.error = 'No Books found';
    //         return res.status(status.bad).send(errorMessage);
    //     }

    //     successMessage.data = dbResponse;
    //     return res.status(status.success).send(successMessage);
    // } catch (error) {
    //     console.log(error)
    //     errorMessage.error = 'An error occured while trying to fetch books';
    //     return res.status(status.error).send(errorMessage);
    // }
};


// const deleteBook = async (req, res) => {
//     const { book_id } = req.params;

//     try {
//         const deleteBookQuery = 'DELETE FROM books WHERE book_id=$1 returning *';
//         const { rows } = await dbQuery.query(deleteBookQuery, [book_id]);
//         const dbResponse = rows[0];

//         if (!dbResponse) {
//             errorMessage.error = 'There is no book with this Id';
//             return res.status(status.notfound).send(errorMessage);
//         }

//         successMessage.data = {};
//         successMessage.data.message = 'Book deleted successfully';
//         return res.status(status.success).send(successMessage);
//     } catch (error) {
//         console.log(error)
//         errorMessage.error = 'Failed to delete Book';
//         return res.status(status.error).send(error);
//     }
// };


// const updateBook = async (req, res) => {
//     const { book_id } = req.params;
//     const { first_name, last_name } = req.body;

//     try {

//         const updateBook = `UPDATE books SET first_name=$1, last_name=$2 WHERE book_id=$3 returning *`;
//         const values = [first_name, last_name, book_id];
//         const response = await dbQuery.query(updateBook, values);
//         const dbResult = response.rows[0];
//         delete dbResult.password;
//         successMessage.data = dbResult;
//         return res.status(status.success).send(successMessage);

//     } catch (error) {
//         console.log(error)

//         // if (error.routine === '_bt_check_unique') {
//         //     errorMessage.error = 'Name is taken already';
//         //     return res.status(status.conflict).send(errorMessage);
//         // }

//         errorMessage.error = 'Failed to update Book';
//         return res.status(status.error).send(errorMessage);
//     }
// };

export {
    createBook,
    getAllBooks,
    getBook,
    deleteBook,
    updateBook,
};