// to set up database from the js file itself

/*const express = require('express');
const path = require('path');
const app = express();

const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const dbpath = path.join(__dirname, 'goodreads.db');
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS author (
        id INTEGER PRIMARY KEY,
        name TEXT,
        birthplace TEXT,
        birthdate TEXT,
        genres TEXT,
        book_sales INTEGER,
        biography TEXT
      );
    `);

    await db.exec(`
      INSERT OR IGNORE INTO author (id, name, birthplace, birthdate, genres, book_sales, biography)
      VALUES 
        (1, 'J.K. Rowling', 'England, The United Kingdom', 'July 31st 1965', 'Fiction, Young Adult, Fantasy', 213350, 'Although she writes under the pen name J.K. Rowling, pronounced like rolling, her name when her first Harry Potter book was published was simply Joanne Rowling.'),
        (2, 'Arthur Conan Doyle', 'Edinburgh, Scotland', 'July 7th 1930', 'Fiction, Crime, Thriller', 19162, 'Sir Arthur Conan Doyle was born the third of ten siblings on 22 May 1859 in Edinburgh, Scotland.'),
        (3, 'J.R.R. Tolkien', 'Mangaung, South Africa', 'September 2nd 1973', 'Fantasy, Fiction, Childrens', 59714, 'John Ronald Reuel Tolkien, CBE was an English writer, poet, WWI veteran (a First Lieutenant in the Lancashire Fusiliers, British'),
        (4, 'William Shakespeare', 'England, The United Kingdom', 'April 26th 1564', 'Theatre, Classics, Poetry', 36987, 'William Shakespeare (baptised 26 April 1564) was an English poet and playwright, widely regarded as the greatest writer in the English language.'),
        (5, 'Stephenie Meyer', 'Connecticut, The United States', 'December 24th 1973', 'Science Fiction & Fantasy, Paranormal Romance, Young Adult', 65595, 'Stephenie Meyer is the author of the bestselling Twilight series, The Host, and The Chemist.'),
        (6, 'Agatha Christie', 'England, The United Kingdom', 'January 12th 1976', 'Mystery, Crime, Thriller', 44936, 'Agatha Christie is the best-selling author of all time.'),
        (7, 'Amish Tripathi', 'India', 'October 18th 1974', 'Mythological, historical Fiction, Fiction, Fantasy', 5549, 'Amish is an IIM (Kolkata) educated, banker turned award-winning author'),
        (8, 'Amish Tripathi', 'India', 'October 18th 1974', 'Mythological, historical Fiction, Fiction, Fantasy', 5549, 'Amish is an IIM (Kolkata) educated, banker turned award-winning author');
      `);
      app.listen(3000);
    } catch (e) {
      console.log(`${e.message}`);
      process.exit(1);
  }
}
initializeDBAndServer();*/


const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "goodreads.db");
app.use(express.json()); // MUST be added to parse JSON body
const cors = require('cors');
app.use(cors());

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();


// db.all used to get all the rows from the table 
app.get("/authors/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      author`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//visit   http://localhost:3000/author/1
//db.get used to get single book from the table
app.get("/authors/:authorId/", async(req, res) => {
  const {authorId} = req.params
  res.send(await db.get(`SELECT * FROM author WHERE id = ${authorId}`))
})


// db.run is used to create or update the data
app.post('/authors/', async (req, res) => {
  try {
    const { name, birthplace, birthdate, genres, book_sales, biography } = req.body;
    const addAuthorsQuery = `
      INSERT INTO author (name, birthplace, birthdate, genres, book_sales, biography)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const dbResponse = await db.run(addAuthorsQuery, [name, birthplace, birthdate, genres, book_sales, biography]);
    res.send({ authorId: dbResponse.lastID });
  } catch (error) {
    console.error('Error inserting author:', error);
    res.status(500).send({ error: 'Failed to add author' });
  }
});

app.put('/authors/:authorId', async (req, res) => {
  try {
    const { authorId } = req.params;
    const { newName } = req.body;

    const dbResponse = await db.run(`
      UPDATE author
      SET name = ?
      WHERE id = ?`, [newName, authorId]);

    if (dbResponse.changes === 0) {
      res.status(404).send("Author not found");
    } else {
      res.send(`Author ${authorId} updated successfully`);
      res.status(201)
    }
  } catch (error) {
    console.error("Error updating author:", error);
    res.status(500).send("Internal Server Error");
  }
});
