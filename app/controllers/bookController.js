// @ts-check
import moment from 'moment';
import dbQuery from '../db/dev/db_Query';
import { empty, isEmpty } from '../helpers/validation';
import { errorMessage, successMessage, status } from '../helpers/status';
import pool from '../db/dev/pool';

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

    if (categories.length <= 0) {
        errorMessage.error = 'Categories is required required';
        return res.status(status.bad).send(errorMessage);
    }


    try {
        // Start Transaction
        await pool.query("BEGIN");

        const createBookQuery = `INSERT INTO  books(isbn_number, name, author, year_published) VALUES($1, $2, $3, $4) returning *`;
        const values = [isbn_number, name, author, year_published];

        console.log(createBookQuery)

        const { rows } = await dbQuery.query(createBookQuery, values);
        const dbResponse = rows[0];

        let bookCategoryRes = await insertBookCategory(req, res);

        if (bookCategoryRes !== 1) {
            pool.query("ROLLBACK");
            errorMessage.error = bookCategoryRes.message;
            return res.status(status.error).send(errorMessage);
        }

        successMessage.data = dbResponse;
        pool.query("COMMIT");
        return res.status(status.created).send(successMessage);

    } catch (error) {
        pool.query("ROLLBACK");
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
    const { categories, isbn_number, } = req.body;

    try {
        let insertBookCategoryQuery = `INSERT INTO  book_categories(category_id, isbn_number) VALUES`;
        insertBookCategoryQuery += buildCategoryInsertQuery(categories, isbn_number)
        const { rows } = await dbQuery.query(insertBookCategoryQuery);

        return 1;
    } catch (error) {
        if (error.code === '23503') {
            error.message = `FOREIGN KEY VIOLATION `;
            error.constraint === 'fk_category' ? error.message += `. One of the categories does does not exist on the categories table` : error.message += `. The ISBN does not exist on table books`
        }
        return error
    }
}

function buildCategoryInsertQuery(categories, isbn_number) {
    let insertBookCategoryQuery = ``;

    (categories || []).forEach((category, idx) => {
        insertBookCategoryQuery += `(${category}, '${isbn_number}') `;
        let isLastItem = idx === (categories.length - 1);

        if (!isLastItem) {
            insertBookCategoryQuery += `, `
        }

    });

    return insertBookCategoryQuery;
}

const getAllBooks = async (req, res) => {
    const { limit, offset } = req.query;

    try {
        let getAllBooksQuery = `select b.isbn_number, b.name as book_name, b.year_published,
		a.first_name as author_name, a.last_name as author_last_name,
		c.category_id, c.name as category_name, c.description as category_description
FROM books AS b 
JOIN authors AS a ON b.author = a.author_id
JOIN book_categories AS bc ON bc.isbn_number = b.isbn_number
JOIN categories AS c ON c.category_id = bc.category_id
WHERE  	1=1 `;

        if (isSearchCriteriaProvided(req.query)) {
            getAllBooksQuery += `AND (`
            getAllBooksQuery += buildSearchCriteriaQuery(req.query)
            getAllBooksQuery += `)`;
        }

        getAllBooksQuery += ` ORDER BY b.name DESC `;

        if (limit) {
            getAllBooksQuery += ` LIMIT ${limit}`
        }

        if (offset) {
            getAllBooksQuery += ` OFFSET ${offset}`
        }

        const { rows } = await dbQuery.query(getAllBooksQuery);
        const dbResponse = rows;

        successMessage.data = dbResponse;
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch books';
        return res.status(status.error).send(errorMessage);
    }
}

function buildSearchCriteriaQuery(parms) {
    const { author_first_name, author_last_name, book_name, isbn_number, year_published, limit, offset } = parms
    let searchCriteria = ``;

    if (author_first_name) {
        searchCriteria += `LOWER(a.first_name) LIKE LOWER('%${author_first_name}%') `
    }

    if (author_last_name) {
        searchCriteria += ` ${searchCriteria !== '' ? "OR " : ""} LOWER(a.last_name) LIKE LOWER('%${author_last_name}%') `
    }

    if (book_name) {
        searchCriteria += `${searchCriteria !== '' ? "OR " : ""} LOWER(b.name) LIKE LOWER('%${book_name}%')`
    }

    if (isbn_number) {
        searchCriteria += `${searchCriteria !== '' ? "OR " : ""} b.isbn_number LIKE '%${isbn_number}%' `
    }

    if (year_published) {
        searchCriteria += ` ${searchCriteria !== '' ? "OR " : ""} b.year_published LIKE '%${year_published}%' `
    }

    return searchCriteria;
}

function isSearchCriteriaProvided(params) {
    const { author_first_name, author_last_name, book_name, isbn_number, year_published } = params
    return !(isEmpty(author_first_name) && isEmpty(author_last_name) && isEmpty(book_name) && isEmpty(isbn_number) && isEmpty(year_published))


}

const getBook = async (req, res) => {
    const { isbn_number } = req.params;

    try {
        const getAllBooksQuery = `SELECT * FROM books WHERE isbn_number=$1 ORDER BY name DESC`;
        const { rows } = await dbQuery.query(getAllBooksQuery, [isbn_number]);
        const dbResponse = rows;

        successMessage.data = dbResponse;
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch book';
        return res.status(status.error).send(errorMessage);
    }
};


// const deleteBook = async (req, res) => {
//     const { isbn_number } = req.params;

//     try {
//         const deleteBookQuery = 'DELETE FROM books WHERE isbn_number=$1 returning *';
//         const { rows } = await dbQuery.query(deleteBookQuery, [isbn_number]);
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
//     const { isbn_number } = req.params;
//     const { first_name, last_name } = req.body;

//     try {

//         const updateBook = `UPDATE books SET first_name=$1, last_name=$2 WHERE isbn_number=$3 returning *`;
//         const values = [first_name, last_name, isbn_number];
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
    // getBook,
    // deleteBook,
    // updateBook,
};