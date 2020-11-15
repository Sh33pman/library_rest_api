CREATE TABLE IF NOT EXISTS books
    (
        isbn_number VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        author INT NOT NULL,
        year_published VARCHAR(100) NOT NULL,
        CONSTRAINT fk_author 
        FOREIGN KEY(author) REFERENCES authors(author_id) 

    )
	

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS book_categories;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS categories;

SELECT * FROM public.books ORDER BY isbn_number ASC ;
SELECT * FROM public.book_categories ORDER BY isbn_number ASC; 
SELECT * FROM public.book_categories WHERE isbn_number = '33'; 
SELECT * FROM public.authors
SELECT * FROM public.categories 

INSERT INTO  books(isbn_number, name, author, year_published) 
VALUES('123456','book_1', 1, '2020') returning *

INSERT INTO  book_categories(category_id, isbn_number) 
VALUES(1, '123456')


-- author_first_name, author_last_name, book_name, isbn_number, year_published
select b.isbn_number, b.name as book_name, b.year_published,
		a.first_name as author_name, a.last_name as author_last_name,
		c.category_id, c.name as category_name, c.description as category_description
FROM books AS b 
JOIN authors AS a ON b.author = a.author_id
JOIN book_categories AS bc ON bc.isbn_number = b.isbn_number
JOIN categories AS c ON c.category_id = bc.category_id
WHERE  	1=1 
 		AND (
			LOWER(a.first_name) LIKE LOWER('%z%')   OR 
			LOWER(a.last_name) LIKE LOWER('%z%') OR
			LOWER(b.name) LIKE LOWER('%the%') OR
			b.isbn_number LIKE '%123%' OR
			b.year_published LIKE '%6%'
		)
ORDER BY b.name DESC
OFFSET 1
LIMIT 3 



update users as u set -- postgres FTW
  email = u2.email,
  first_name = u2.first_name,
  last_name = u2.last_name
from (values
  (1, 'hollis@weimann.biz', 'Hollis', 'Connell'),
  (2, 'robert@duncan.info', 'Robert', 'Duncan')
) as u2(id, email, first_name, last_name)
where u2.id = u.id;


SELECT * FROM public.book_categories WHERE isbn_number = '10'; 

update public.book_categories as bc set
    category_id = c.category_id
from (values
    (5, 33, 3),
    (1, 33, 6)  
) as c(category_id, isbn_number, old_category_id) 
where bc.isbn_number::int = c.isbn_number AND c.old_category_id = bc.category_id;

SELECT * FROM public.books ORDER BY isbn_number ASC ;

UPDATE books SET  author = 3,  
name = 'Impact.com',  year_published = '2021' 
WHERE isbn_number = 33  returning *


SELECT * FROM authors WHERE   
	LOWER(first_name) LIKE LOWER('%%') 
	OR  LOWER(last_name) LIKE LOWER('%%')  
	ORDER BY first_name DESC  
	LIMIT 10 OFFSET 1






CREATE TABLE IF NOT EXISTS books
    (
        isbn_number VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        author INT NOT NULL,
        year_published VARCHAR(100) NOT NULL,
        CONSTRAINT fk_author 
        FOREIGN KEY(author) REFERENCES authors(author_id) 

    )
	

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS book_categories;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS categories;


DROP TABLE IF EXISTS categories1;
DROP TABLE IF EXISTS logging.t_history;
DROP TRIGGER IF EXISTS change_trigger ON public.categories;
DROP FUNCTION IF EXISTS change_trigger CASCADE;

SELECT * FROM public.books ORDER BY isbn_number ASC ;
SELECT * FROM public.book_categories ORDER BY isbn_number ASC; 
SELECT * FROM public.book_categories WHERE isbn_number = '33'; 
SELECT * FROM public.authors
SELECT * FROM public.categories 

INSERT INTO  books(isbn_number, name, author, year_published) 
VALUES('123456','book_1', 1, '2020') returning *

INSERT INTO  book_categories(category_id, isbn_number) 
VALUES(1, '123456')


-- author_first_name, author_last_name, book_name, isbn_number, year_published
select b.isbn_number, b.name as book_name, b.year_published,
		a.first_name as author_name, a.last_name as author_last_name,
		c.category_id, c.name as category_name, c.description as category_description
FROM books AS b 
JOIN authors AS a ON b.author = a.author_id
JOIN book_categories AS bc ON bc.isbn_number = b.isbn_number
JOIN categories AS c ON c.category_id = bc.category_id
WHERE  	1=1 
 		AND (
			LOWER(a.first_name) LIKE LOWER('%z%')   OR 
			LOWER(a.last_name) LIKE LOWER('%z%') OR
			LOWER(b.name) LIKE LOWER('%the%') OR
			b.isbn_number LIKE '%123%' OR
			b.year_published LIKE '%6%'
		)
ORDER BY b.name DESC
OFFSET 1
LIMIT 3 



update users as u set -- postgres FTW
  email = u2.email,
  first_name = u2.first_name,
  last_name = u2.last_name
from (values
  (1, 'hollis@weimann.biz', 'Hollis', 'Connell'),
  (2, 'robert@duncan.info', 'Robert', 'Duncan')
) as u2(id, email, first_name, last_name)
where u2.id = u.id;


SELECT * FROM public.book_categories WHERE isbn_number = '44'; 

update public.book_categories as bc set
    category_id = c.category_id
from (values
    (5, 33, 3),
    (1, 33, 6)  
) as c(category_id, isbn_number, old_category_id) 
where bc.isbn_number::int = c.isbn_number AND c.old_category_id = bc.category_id;

SELECT * FROM public.books ORDER BY isbn_number ASC ;

UPDATE books SET  author = 3,  
name = 'Impact.com',  year_published = '2021' 
WHERE isbn_number = 33  returning *



	array_to_string(array_agg(employee), ',')

select distinct b.isbn_number, b.name as book_name, b.year_published,
		a.first_name as author_name, a.last_name as author_last_name,
		c.category_id, c.name as category_name, c.description as category_description
FROM books AS b
JOIN authors AS a ON b.author = a.author_id
JOIN book_categories AS bc ON bc.isbn_number = b.isbn_number
JOIN categories AS c ON c.category_id = bc.category_id
WHERE  	1=1  

ORDER BY b.name DESC  LIMIT 15 OFFSET 0



// name: 'error',
        // severity: 'ERROR',
        // code: '23503',
        // detail: 'Key (category_id)=(2) is not present in table "categories".',
        // hint: undefined,
        // position: undefined,
        // internalPosition: undefined,
        // internalQuery: undefined,
        // where: undefined,
        // schema: 'public',
        // table: 'book_categories',
        // column: undefined,
        // dataType: undefined,
        // constraint: 'fk_category',
        // file: 'ri_triggers.c',
        // line: '3266',
        // routine: 'ri_ReportViolation'


        INSERT INTO  books(isbn_number, name, author, year_published) 
VALUES('123456','book_1', 1, '2020') returning *

INSERT INTO  book_categories(category_id, isbn_number) 
VALUES(1, '123456')

select b.isbn_number, b.name, b.year_published,
		a.first_name, a.last_name,
		bc.category_id, bc.isbn_number,
		c.name,c.description
FROM books AS b 
JOIN authors AS a ON b.author = a.author_id
JOIN book_categories AS bc ON bc.isbn_number = b.isbn_number
JOIN categories AS c ON c.category_id = bc.category_id

http://localhost:5000/api/v1/book?author_first_name=z&author_last_name=z&book_name=the&isbn_number=123&year_published=9&limit=3&offset=0

http://localhost:5000/api/v1/book

http://localhost:5000/api/v1/book?&limit=3&offset=0

http://localhost:5000/api/v1/book?author_first_name=z&author_last_name=z&book_name=the&isbn_number=123&year_published=9

http://localhost:5000/api/v1/book?author_first_name=z&limit=3&offset=0

http://localhost:5000/api/v1/book?author_first_name=z&author_last_name=z&limit=3&offset=0

http://localhost:5000/api/v1/book?author_first_name=z&author_last_name=z&book_name=the&limit=3&offset=0

http://localhost:5000/api/v1/book?author_first_name=z&author_last_name=z&book_name=the&isbn_number=123&limit=3&offset=0

http://localhost:5000/api/v1/book?book_name=the&isbn_number=123&limit=3&offset=0

http://localhost:5000/api/v1/book?year_published=2019&limit=3&offset=0

http://localhost:5000/api/v1/book?author_first_name=author1&limit=3&offset=0


eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVkdmFsZG9AZ21haWwuY29tIiwidXNlcl9pZCI6MSwibmFtZSI6ImVkdmFsZG8iLCJ1c2VybmFtZSI6ImVkdmFsZG9AZ21haWwuY29tIiwiaWF0IjoxNjA1MzYxODUwLCJleHAiOjE2MDU3OTM4NTB9.AyVaijaQ-5ZKTvatXVYtiKulKCXSAl-kwRzxPGwu5-4
