// @ts-check
import pool from './pool';

pool.on('connect', () => {
    console.log('Conneted to DB')
});

const createUserTable = () => {
    const createUserTableQuery = `CREATE TABLE IF NOT EXISTS users
    (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
    )`;


    pool.query(createUserTableQuery)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        })
}

const createAuthorTable = () => {
    const createAuthorTableQuery = `CREATE TABLE IF NOT EXISTS authors
    (
        author_id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL
    )`;

    pool.query(createAuthorTableQuery)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        })
}

const createCategoryTable = () => {
    const createCategoryTableQuery = `CREATE TABLE IF NOT EXISTS categories
    (
        category_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(100) NOT NULL
    )`;

    pool.query(createCategoryTableQuery)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        })
}

// name, author, categories, isbn_number, year_published
const createBookTable = () => {
    const createBookTableQuery = `CREATE TABLE IF NOT EXISTS books
    (
        isbn_number VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        author VARCHAR(100) NOT NULL,
        year_published VARCHAR(100) NOT NULL
    )`;

    pool.query(createBookTableQuery)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        })
}

const createBookGenreTable = () => {
    const createBookGenreTableQuery = `CREATE TABLE IF NOT EXISTS book_genres
    (
        category_id VARCHAR(100),
        isbn_number VARCHAR(100),
        CONSTRAINT pk_category_group PRIMARY KEY (category_id,isbn_number)
    )`;

    pool.query(createBookGenreTableQuery)
        .then(res => {
            console.log(res);
            pool.end();
        })
        .catch(err => {
            console.log(err);
            pool.end();
        })
}


const dropUserTable = () => {
    const dropUserTableQuery = 'DROP TABLE IF EXISTS users';
    pool.query(dropUserTableQuery)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
};

const dropAuthorTable = () => {
    const dropAuthorTableQuery = 'DROP TABLE IF EXISTS authors';
    pool.query(dropAuthorTableQuery)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
};


const dropCategoryTable = () => {
    const dropCategoryTableQuery = 'DROP TABLE IF EXISTS categories';
    pool.query(dropCategoryTableQuery)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
};


const dropBookTable = () => {
    const dropBookTableQuery = 'DROP TABLE IF EXISTS books';
    pool.query(dropBookTableQuery)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
};


const dropBookGenreTable = () => {
    const dropBookGenreTableQuery = 'DROP TABLE IF EXISTS book_genres';
    pool.query(dropBookGenreTableQuery)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
};


const createAllTables = () => {
    createUserTable();
    createAuthorTable();
    createCategoryTable();
    createBookTable();
    createBookGenreTable();
}


const dropAllTables = () => {
    dropUserTable();
    dropAuthorTable();
    dropCategoryTable();
    dropBookTable();
    dropBookGenreTable();
}

pool.on('remove', () => {
    console.log('user removed');
    process.exit(0);
})

export {
    createAllTables,
    dropAllTables
}

require('make-runnable');