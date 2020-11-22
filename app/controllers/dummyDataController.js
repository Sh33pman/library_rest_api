// @ts-check
import moment from 'moment';
import dbQuery from '../db/dev/db_Query';
import { empty, isEmpty } from '../helpers/validation';
import { errorMessage, successMessage, status } from '../helpers/status';
import pool from '../db/dev/pool';



const loadDummyData = async (req, res) => {
    const { first_name, last_name } = req.body;
    console.log(`🗂️  => INSERTING DUMMY DATA ...`)

    try {
        successMessage.data = {
            categories: 0,
            books: 0,
            authors: 0,
            book_categories: 0
        }

        await pool.query("BEGIN");
        const insertCategoryRes = await insertCategories();
        const insertAuthorRes = await insertAuthors();
        const insertBookRes = await insertBooks();
        const insertBookCategoryRes = await insertBookCategories();

        successMessage.data.categories = insertCategoryRes;
        successMessage.data.authors = insertAuthorRes;
        successMessage.data.books = insertBookRes;
        successMessage.data.book_categories = insertBookCategoryRes;

        pool.query("COMMIT");
        return res.status(status.created).send(successMessage);
    } catch (error) {
        pool.query("ROLLBACK");
        // console.log(error)
        errorMessage.error = 'INSERT DUMMY DATA';
        errorMessage.message = error.message;
        return res.status(status.error).send(errorMessage);
    }
};

async function insertCategories() {
    try {
        const query = `INSERT INTO categories(name,description, operation_by_user)
        VALUES 
                 ('Ation', 'this is action', 'EDVALDO'), 
                 ('Drama', 'this is Drama', 'EDVALDO'),
                 ('Fiction', 'this is Fiction', 'EDVALDO'),
                 ('Science', 'this is Science', 'EDVALDO'),
                 ('Thrilher', 'this is Thrilher', 'EDVALDO'), 
                 ('Documentary', 'this is Documentary', 'EDVALDO'),
                 ('War', 'this is War', 'EDVALDO'),
                 ('Investigation', 'this is Investigation', 'EDVALDO'),
                ('Horror', 'this is Horror', 'EDVALDO'), 
                ('Commedy', 'this is Commedy', 'EDVALDO'),
                ('Imagination', 'this is Imagination', 'EDVALDO'),
                ('Africa', 'this is Africa', 'EDVALDO'),
                ('Bibliograpgy', 'this is Bibliograpgy', 'EDVALDO'),
                ('Dance', 'this is Dance', 'EDVALDO'),
                ('Happiness', 'this is Investigation', 'EDVALDO')
        returning *`;
        const res = await dbQuery.query(query);

        if (res.name === 'error') {
            console.log(res)
            pool.query("ROLLBACK");
            throw Error("Failed to insert categories")
        }
        const numOfRows = (res && res.rowCount) || 0;
        return numOfRows
    } catch (error) {
        pool.query("ROLLBACK");
        console.log(error)
        errorMessage.error = 'Failed to insert categories';
        throw error
        return null
    }
}

async function insertAuthors() {
    try {
        const query = `INSERT INTO authors(first_name,last_name, operation_by_user)
        VALUES 
                 ('Pulo', 'Pulo SURNAME', 'EDVALDO'), 
                 ('Cambuti', 'Cambuti SURNAME', 'EDVALDO'),
                 ('Domingos', 'Domingos SURNAME', 'EDVALDO'),
                 ('Braulio', 'Braulio SURNAME', 'EDVALDO'),
                ('John', 'Paul', 'EDVALDO'), 
                ('Edy', 'Murphy', 'EDVALDO'),
                ('Rogan', 'Joe', 'EDVALDO'),
                ('Felix', 'Stuart', 'EDVALDO'),
                ('Ruth', 'Martins', 'EDVALDO'), 
                ('Bella', 'Murphy', 'EDVALDO'),
                ('Junior', 'Morgan', 'EDVALDO'),
                ('Joao', 'Felix', 'EDVALDO'),
                ('Morgan', 'Vice', 'EDVALDO'), 
                ('Phillip', 'Eurico ', 'EDVALDO'),
                ('Jose', 'Edmilsom', 'EDVALDO'),
                ('Bravo', 'Martins', 'EDVALDO') returning *`;
        const res = await dbQuery.query(query);

        if (res.name === 'error') {
            pool.query("ROLLBACK");
            throw Error("Failed to insert authors")
        }
        const numOfRows = (res && res.rowCount) || 0;
        return numOfRows
    } catch (error) {
        pool.query("ROLLBACK");
        console.log(error)
        errorMessage.error = 'Failed to insert authors';
        throw error
        return null
    }
}
async function insertBooks() {
    try {
        const query = `INSERT INTO books(isbn_number,name, author,year_published, operation_by_user)
        VALUES 
                 ('1', 'Impacat.com', 1,'2020', 'EDVALDO'), 
                 ('2', 'Nona', 2,'2019', 'EDVALDO'),
                 ('3', 'AWZ', 3,'2018', 'EDVALDO'),
                 ('4', 'Fintech', 4,'2017', 'EDVALDO'),
                ('5', 'In Search of Lost Time ', 1,'2020', 'EDVALDO'), 
                ('6', 'Ulysses', 2,'2019', 'EDVALDO'),
                ('7', 'Don Quixote', 3,'2018', 'EDVALDO'),
                ('8', 'The Great Gatsby', 4,'2017', 'EDVALDO'),
                ('9', 'One Hundred Years of Solitude', 1,'2020', 'EDVALDO'), 
                ('10', 'Moby Dick', 2,'2019', 'EDVALDO'),
                ('11', 'War and Peace', 3,'2018', 'EDVALDO'),
                ('12', 'Lolita ', 4,'2017', 'EDVALDO'),
                ('13', 'Hamlet', 1,'2020', 'EDVALDO'), 
                ('14', 'The Catcher in the Rye', 2,'2019', 'EDVALDO'),
                ('15', 'The Odyssey', 3,'2018', 'EDVALDO'),
                ('16', 'The Brothers Karamazov', 4,'2017', 'EDVALDO'),
                ('17', 'Crime and Punishment', 1,'2017', 'EDVALDO'),
                ('18', 'Madame Bovary', 2,'2017', 'EDVALDO'),
                ('19', 'The Divine Comedy', 3,'2017', 'EDVALDO'),
                ('20', 'Candide', 4,'2017', 'EDVALDO') returning *`;

        const res = await dbQuery.query(query);

        if (res.name === 'error') {
            pool.query("ROLLBACK");
            console.log(res)
            throw Error("Failed to insert books")
        }
        const numOfRows = (res && res.rowCount) || 0;
        return numOfRows
    } catch (error) {
        pool.query("ROLLBACK");
        console.log(error)
        errorMessage.error = 'Failed to insert books';
        throw error
        return null
    }
}
async function insertBookCategories() {
    try {
        const query = `INSERT INTO book_categories(category_id,isbn_number,operation_by_user)
        VALUES 
                 (1, 1,  'EDVALDO'), 
                 (2, 1, 'EDVALDO'),
                 (2, 2,  'EDVALDO'),
                 (1, 3, 'EDVALDO'),
                 (2, 3, 'EDVALDO'),
                 (3, 3, 'EDVALDO'),
                 (4, 4, 'EDVALDO'),
                 (3, 4, 'EDVALDO'),
                (5, 5,  'EDVALDO'), 
                (6, 5, 'EDVALDO'),
                (7, 5,  'EDVALDO'),
                (8, 6, 'EDVALDO'),
                (9, 6, 'EDVALDO'),
                (10, 7, 'EDVALDO'),
                (11, 7, 'EDVALDO'),
                (12, 8, 'EDVALDO'),
                (13, 8,  'EDVALDO'), 
                (14, 9, 'EDVALDO'),
                (15, 9,  'EDVALDO'),
                (5, 10, 'EDVALDO'),
                (2, 10, 'EDVALDO'),
                (1, 11, 'EDVALDO'),
                (9, 11, 'EDVALDO'),
                (10, 12, 'EDVALDO'),
                (11, 12,  'EDVALDO'), 
                (12, 13, 'EDVALDO'),
                (13, 13,  'EDVALDO'),
                (14, 14, 'EDVALDO'),
                (15, 14, 'EDVALDO'),
                (1, 16, 'EDVALDO'),
                (1, 17, 'EDVALDO'),
                (8, 18, 'EDVALDO'),
                (13, 18, 'EDVALDO'),
                (14, 19, 'EDVALDO'),
                (15, 20, 'EDVALDO') returning *`;

        const res = await dbQuery.query(query);

        if (res.name === 'error') {
            pool.query("ROLLBACK");
            throw Error("Failed to insert book categories")
        }
        const numOfRows = (res && res.rowCount) || 0;
        return numOfRows
    } catch (error) {
        pool.query("ROLLBACK");
        errorMessage.error = 'Failed to insert book categories';
        throw error
        return null
    }
}




export {
    loadDummyData,
};