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
        let getAllBooksQuery = ``;

        if (isSearchCriteriaProvided(req.query)) {
            getAllBooksQuery += buildSearchCriteriaQuery(req.query)
        } else {
            getAllBooksQuery += buildSearchBooksQueryWithoutSearchPArams();
        }

        getAllBooksQuery += ` ORDER BY b.name ASC `;

        if (limit && parseInt(limit) !== -1) {
            getAllBooksQuery += ` LIMIT ${limit}`
            getAllBooksQuery += ` OFFSET ${offset}`
        }



        console.log("GET ALL BOOKS => ", getAllBooksQuery)

        const { rows } = await dbQuery.query(getAllBooksQuery);

        let refactoredRes = refactorRows(rows)

        successMessage.count = (rows && rows.length) || 0
        // successMessage.count = (rows && rows[0] && rows[0].full_count) || 0
        successMessage.data = refactoredRes;
        // successMessage.data = rows;

        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch books';
        return res.status(status.error).send(errorMessage);
    }
}
function buildSearchBooksQueryWithoutSearchPArams() {
    let query = ` SELECT b.isbn_number, b.name as book_name, b.author as author_id, b.year_published
    ,a.first_name as author_name, a.last_name as author_last_name , categoriesByIsbnResult.categories
    , count(*) OVER() AS full_count
    FROM books AS b 
    JOIN authors AS a ON a.author_id = b.author 
    JOIN (
                SELECT 
                t.isbn_number,
                array_to_json(array_agg(t)) AS categories
            FROM (
                SELECT c.category_id
                ,bc.isbn_number
                , c.name
                FROM book_categories  AS bc
                JOIN categories AS c ON bc.category_id = c.category_id
                WHERE 1 = 1 
            ) as t 
            GROUP BY t.isbn_number
              ) AS categoriesByIsbnResult
    ON b.isbn_number = categoriesByIsbnResult.isbn_number
     WHERE 1 = 1  
    `;

    return query;
}

function buildSearchCriteriaQuery(parms) {
    const { author_first_name, author_last_name, category, book_name, isbn_number, year_published, limit, offset } = parms
    let query = ` SELECT b.isbn_number, b.name as book_name, b.author as author_id, b.year_published
    ,a.first_name as author_name, a.last_name as author_last_name , categoriesByIsbnResult.categories
    , count(*) OVER() AS full_count
    FROM books AS b 
    JOIN authors AS a ON a.author_id = b.author 
    JOIN (
                SELECT 
                t.isbn_number,
                array_to_json(array_agg(t)) AS categories
            FROM (
                SELECT c.category_id
                ,bc.isbn_number
                , c.name
                FROM book_categories  AS bc
                JOIN categories AS c ON bc.category_id = c.category_id
                WHERE 1 = 1 `;
    if (category && category !== "") {
        query += ` AND (LOWER(c.name) LIKE LOWER('%${category}%')) `
    }

    query += `) as t 
    GROUP BY t.isbn_number
      ) AS categoriesByIsbnResult `

    query += ` ON b.isbn_number = categoriesByIsbnResult.isbn_number
     WHERE 1 = 1 `;


    let searchParams = ``
    if (!(isEmpty(author_first_name) && isEmpty(author_last_name) && isEmpty(book_name) && isEmpty(isbn_number) && isEmpty(year_published))) {
        searchParams += `AND ( `;

        if (author_first_name && author_first_name !== "") {
            searchParams += `LOWER(a.first_name) LIKE LOWER('%${author_first_name}%') `
        }

        if (author_last_name && author_last_name !== "") {
            searchParams += ` ${searchParams !== `AND ( ` ? "AND " : ""} LOWER(a.last_name) LIKE LOWER('%${author_last_name}%') `
        }

        if (book_name && book_name !== "") {
            searchParams += `${searchParams !== `AND ( ` ? "AND " : ""} LOWER(b.name) LIKE LOWER('%${book_name}%')`
        }

        if (isbn_number && isbn_number !== "") {
            searchParams += `${searchParams !== `AND ( ` ? "AND " : ""} b.isbn_number LIKE '%${isbn_number}%' `
        }

        if (year_published && year_published !== "") {
            searchParams += ` ${searchParams !== `AND ( ` ? "AND " : ""} b.year_published LIKE '%${year_published}%' `
        }

        searchParams += `)`
    }

    query += searchParams
    return query;
}

function isSearchCriteriaProvided(params) {
    const { author_first_name, author_last_name, book_name, isbn_number, year_published, category } = params
    return !(isEmpty(author_first_name) && isEmpty(author_last_name) && isEmpty(book_name) && isEmpty(isbn_number) && isEmpty(year_published) && isEmpty(category))


}

function refactorRows(rows) {
    (rows || []).map(item => {
        delete item.full_count
        return item
    })

    return rows

}

const getBook = async (req, res) => {
    const { isbn_number } = req.params;

    try {

        const getAllBooksQuery = buildGetBookQuery(isbn_number);
        const { rows } = await dbQuery.query(getAllBooksQuery);
        const dbResponse = rows[0];

        delete successMessage.count;
        successMessage.data = dbResponse || {};
        console.log(successMessage)
        return res.status(status.success).send(successMessage);

    } catch (error) {
        console.log(error)
        errorMessage.error = 'An error occured while trying to fetch book';
        return res.status(status.error).send(errorMessage);
    }
};

function buildGetBookQuery(isbn_number) {
    let query = `SELECT b.isbn_number, b.name as book_name, b.author as author_id, b.year_published
                        ,a.first_name as author_name, a.last_name as author_last_name , 
                        categoriesByIsbnResult.categories 
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
        let deleteOldCategoriesQuery = `DELETE FROM book_categories WHERE isbn_number = '${isbn_number}'`;
        let deletedOldBookCategories = await dbQuery.query(deleteOldCategoriesQuery);

        // console.log("DELETED CATEGORIES: => ", deletedOldBookCategories)

        updateBookQuery += updateBookAndInsertBookCategories(req, isbn_number)

        const updatedBookDBResponse = await dbQuery.query(updateBookQuery);
        const updatedBookRes = updatedBookDBResponse.rows;

        // console.log("UPDATED BOOK RESPONSE: => ", updatedBookDBResponse)

        if (!updatedBookRes || updatedBookRes === null) {
            pool.query("ROLLBACK");
            errorMessage.error = 'Failed to update Book';
            // errorMessage.error = 'Failed to update Book. ISBN was not found';
            return res.status(status.error).send(errorMessage);
        }

        let categories = await getCategoriesByISBN(isbn_number)
        if (!categories || categories === null) {
            pool.query("ROLLBACK");
            errorMessage.error = 'Failed to update Book';
            return res.status(status.error).send(errorMessage);
        }

        // console.log("INSERTED CATEGORIES => ", categories)

        let getUpdatedBookQuery = `SELECT b.isbn_number, b.name as book_name, b.year_published, a.first_name as author_name, a.last_name as author_last_name,a.author_id 
        FROM books b
        JOIN authors AS a ON a.author_id = b.author
        WHERE isbn_number = '${isbn_number}'`;

        let updatedBook = await dbQuery.query(getUpdatedBookQuery);

        // console.log("UPDATED BOOK FETCHED => ", updatedBook)

        successMessage.data = updatedBook.rows[0];
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

function updateBookAndInsertBookCategories(req, isbn_number) {
    const { author, name, categories, year_published } = req.body;

    let query = ` WITH updateBook AS (
        UPDATE books SET `;

    if (name && name !== "") {
        query += `name = '${name}', `
    }

    if (author && author !== "") {
        query += `author = ${author} ,`
    }

    if (year_published && year_published !== "") {
        query += `year_published = '${year_published}' ,`
    }

    query += `operation_by_user = '${req.user.username}' `

    query += `
                    WHERE isbn_number = '${isbn_number}'
                    RETURNING *
                )
        INSERT INTO book_categories (category_id, isbn_number, operation_by_user)
        VALUES `;

    let values = ``;
    (categories || []).forEach(item => {
        values += `(${item}, '${isbn_number}', '${req.user.username}'),`
    });

    values = values.replace(/,\s*$/, "");

    query += values;

    query += ` RETURNING *;`;

    // console.log(query);

    return query

}

async function getCategoriesByISBN(isbn_number) {

    try {
        let query = `SELECT c.category_id, c.name 
        FROM categories c
        JOIN book_categories AS bc ON c.category_id = bc.category_id
        WHERE bc.isbn_number = '${isbn_number}'`;

        let categories = await dbQuery.query(query);

        // console.log("NEW CATEGORIES RES: => ", categories)
        if (categories.rows) {
            return categories.rows
        } else {
            return []
        }

    } catch (error) {
        console.log("GET BOOKS CATEGORIES ERROR")
        console.log(error);
        pool.query("ROLLBACK");
        return null;
    }

}


export {
    createBook,
    getAllBooks,
    getBook,
    updateBook,
    deleteBook,
};





