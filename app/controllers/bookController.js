// @ts-check
import moment from 'moment';
import dbQuery from '../db/dev/db_Query';
import { empty, isEmpty } from '../helpers/validation';
import { errorMessage, successMessage, status } from '../helpers/status';
import pool from '../db/dev/pool';
import { query } from 'express';

const createBook = async (req, res) => {
    const { author, name, categories, isbn_number, year_published } = req.body;

    try {
        await pool.query("BEGIN");

        const createBookQuery = `INSERT INTO  books(isbn_number, name, author, year_published, operation_by_user) VALUES($1, $2, $3, $4, $5) returning *`;
        const values = [isbn_number, name, author, year_published, req.user.username];

        const { rows } = await dbQuery.query(createBookQuery, values);
        const dbResponse = rows[0];

        let bookCategoryRes = await insertBookCategory(req, res);

        if (!Array.isArray(bookCategoryRes)) {
            pool.query("ROLLBACK");
            errorMessage.error = bookCategoryRes.message;
            return res.status(status.error).send(errorMessage);
        }

        successMessage.data = dbResponse;
        successMessage.data.categories = bookCategoryRes;
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
        let insertBookCategoryQuery = `INSERT INTO  book_categories(category_id, isbn_number, operation_by_user) VALUES `;
        insertBookCategoryQuery += buildCategoryInsertQuery(categories, isbn_number, req)
        let res = await dbQuery.query(insertBookCategoryQuery);

        let insertedBookCategoriesQuery = `SELECT * FROM book_categories WHERE isbn_number=$1`;
        let { rows } = await dbQuery.query(insertedBookCategoriesQuery, [isbn_number]);

        let insertedCategories = (rows || []).map(item => item.category_id);

        return insertedCategories;
    } catch (error) {
        if (error.code === '23503') {
            error.message = `FOREIGN KEY VIOLATION `;
            error.constraint === 'fk_category' ? error.message += `. One of the categories does does not exist on the categories table` : error.message += `. The ISBN does not exist on table books`
        }
        return error
    }
}

function buildCategoryInsertQuery(categories, isbn_number, req) {
    let insertBookCategoryQuery = ``;

    (categories || []).forEach((category, idx) => {
        insertBookCategoryQuery += `(${category}, '${isbn_number}', '${req.user.username}') `;
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


        console.log(getAllBooksQuery)

        const { rows } = await dbQuery.query(getAllBooksQuery);

        let refactoredRes = refactorRows(rows)

        successMessage.data = refactoredRes;
        successMessage.count = refactoredRes.length

        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch books';
        return res.status(status.error).send(errorMessage);
    }
}

function buildSearchCriteriaQuery(parms) {
    const { author_first_name, author_last_name, category, book_name, isbn_number, year_published, limit, offset } = parms
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

    if (category) {
        searchCriteria += `${searchCriteria !== '' ? "OR " : ""} LOWER(c.name) LIKE LOWER('%${category}%')`
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
    const { author_first_name, author_last_name, book_name, isbn_number, year_published, category } = params
    return !(isEmpty(author_first_name) && isEmpty(author_last_name) && isEmpty(book_name) && isEmpty(isbn_number) && isEmpty(year_published) && isEmpty(category))


}

function refactorRows(rows) {

    let books = [];

    (rows || []).forEach((book, idx) => {
        let isBookFound = books.findIndex(b => b.isbn_number === book.isbn_number);
        if (isBookFound > -1) {
            books[isBookFound].categories.push({
                category_id: book.category_id,
                name: book.category_name,
                description: book.category_description
            })
        } else {
            book.categories = [
                {
                    category_id: book.category_id,
                    name: book.category_name,
                    description: book.category_description
                }
            ];
            books.push(book)
        }
    });


    return books

}

const getBook = async (req, res) => {
    const { isbn_number } = req.params;

    try {

        const getAllBooksQuery = buildGetBookQuery(isbn_number);
        const { rows } = await dbQuery.query(getAllBooksQuery);
        const dbResponse = rows[0];

        // let categories = await getCategoriesByISBN(isbn_number)
        // if (categories && categories.length > 0) {
        //     dbResponse.categories = categories
        // }

        delete successMessage.count;
        successMessage.data = dbResponse || {};
        console.log(successMessage)
        return res.status(status.success).send(successMessage);
        // const getAllBooksQuery = `SELECT * FROM books WHERE isbn_number=$1`;
        // const { rows } = await dbQuery.query(getAllBooksQuery, [isbn_number]);
        // const dbResponse = rows[0];

        // let categories = await getCategoriesByISBN(isbn_number)
        // if (categories && categories.length > 0) {
        //     dbResponse.categories = categories
        // }

        // delete successMessage.count;
        // successMessage.data = dbResponse || {};
        // console.log(successMessage)
        // return res.status(status.success).send(successMessage);

    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch book';
        return res.status(status.error).send(errorMessage);
    }
};

function buildGetBookQuery(isbn_number) {
    let query = `SELECT b.isbn_number, b.name, b.author, b.year_published
                ,a.first_name, a.last_name , categoriesByIsbnResult.categories
                FROM books AS b 
                JOIN authors AS a ON a.author_id = b.author 
                LEFT JOIN (
                            SELECT 
                            t.isbn_number,
                            array_to_json(array_agg(t)) AS categories
                        FROM (
                            SELECT c.category_id, bc.isbn_number, c.name
                            FROM book_categories  AS bc
                            JOIN categories AS c ON bc.category_id = c.category_id
                            WHERE bc.isbn_number ='${isbn_number}'
                        ) as t 
                        GROUP BY t.isbn_number
                        ) AS categoriesByIsbnResult
                ON b.isbn_number = categoriesByIsbnResult.isbn_number
                WHERE b.isbn_number= '${isbn_number}' 
    `;


    return query;

}

async function getCategoriesByISBN(isbn_number) {

    try {

        let insertBookCategoryQuery = `SELECT c.category_id , c.name, c.description 
        FROM book_categories AS bc
        JOIN categories AS c ON c.category_id = bc.category_id
        JOIN authors AS a ON a.author_id = 
        WHERE isbn_number = $1`;
        const { rows } = await dbQuery.query(insertBookCategoryQuery, [isbn_number]);
        return rows
    } catch (error) {
        console.log("Failed to get All categories")
        console.log(error)
        return [];
    }
}

const deleteBook = async (req, res) => {
    const { isbn_number } = req.params;

    try {
        await pool.query("BEGIN");

        const deleteBookCategories = 'DELETE FROM book_categories WHERE isbn_number=$1 returning *';
        const deletedBookCategories = await dbQuery.query(deleteBookCategories, [isbn_number]);

        const deleteBookQuery = 'DELETE FROM books WHERE isbn_number=$1 returning *';
        const { rows } = await dbQuery.query(deleteBookQuery, [isbn_number]);
        const dbResponse = rows[0];

        if (!dbResponse) {
            errorMessage.error = 'There is no book with this Id';
            return res.status(status.notfound).send(errorMessage);
        }

        successMessage.data = {};
        successMessage.data.message = 'Book deleted successfully';
        pool.query("COMMIT");
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error);
        errorMessage.error = 'Failed to delete Book';
        pool.query("ROLLBACK");
        return res.status(status.error).send(error);
    }
};

const updateBook = async (req, res) => {
    const { isbn_number } = req.params;

    try {
        await pool.query("BEGIN");
        let updateBookQuery = ``;
        updateBookQuery += buildUpdateBookQuery(req, isbn_number)

        const response = await dbQuery.query(updateBookQuery);
        const dbResult = response.rows[0];
        successMessage.data = dbResult;

        let categories = await updateBookCategories(req, isbn_number)


        if (!dbResult || dbResult === null) {
            pool.query("ROLLBACK");
            errorMessage.error = 'Failed to update Book. ISBN was not found';
            return res.status(status.error).send(errorMessage);
        }

        if (!categories || categories === null) {
            pool.query("ROLLBACK");
            errorMessage.error = 'Failed to update Book';
            return res.status(status.error).send(errorMessage);
        }

        successMessage.data.categories = categories
        pool.query("COMMIT");
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log("UPDATE BOOKS ERROR")

        console.log(error);
        pool.query("ROLLBACK");
        errorMessage.error = 'Failed to update Book';
        return res.status(status.error).send(errorMessage);
    }
};

function buildUpdateBookQuery(req, isbn_number) {
    const { author, name, categories, year_published } = req.body;
    let updateBookQuery = `UPDATE books SET `;

    if (author) {
        updateBookQuery += ` author = ${author}, `;
    }

    updateBookQuery += ` operation_by_user = '${req.user.username}', `;

    if (name) {
        updateBookQuery += ` name = '${name}', `;
    }

    if (year_published) {
        updateBookQuery += ` year_published = '${year_published}'`;
    }

    updateBookQuery = updateBookQuery.replace(/,\s*$/, "");


    updateBookQuery += ` WHERE isbn_number = '${isbn_number}'  returning *`;
    return updateBookQuery;
}

async function updateBookCategories(req, isbn_number) {
    const { categories } = req.body;
    try {
        let values = ``;
        (categories || []).forEach(item => {
            values += `(${item.new}, ${isbn_number}, ${item.old}, '${req.user.username}'),`
        });

        values = values.replace(/,\s*$/, "");

        let updateBookCategoryQuery = `update public.book_categories as bc set
        category_id = c.category_id, operation_by_user = c.operation_by_user 
        from (values ${values}) as c(category_id, isbn_number, old_category_id, operation_by_user) 
        where bc.isbn_number::int = c.isbn_number AND c.old_category_id = bc.category_id returning *`;


        const { rows } = await dbQuery.query(updateBookCategoryQuery);
        let result = (rows || []).map(item => item.category_id)
        return result;
    } catch (error) {
        console.log("UPDATE BOOKS CATEGORY ERROR")
        console.log(error);
        return null
    }
}

export {
    createBook,
    getAllBooks,
    getBook,
    updateBook,
    deleteBook,
};





