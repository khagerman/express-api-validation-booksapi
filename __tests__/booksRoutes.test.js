process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

const { SECRET_KEY } = require("../config");

beforeEach(async function () {
  await db.query("DELETE FROM books");

  let b1 = await Book.create({
    isbn: "12345",
    amazon_url: "http://a.co/eobPtX2",
    author: "Lala Lala",
    language: "english",
    pages: 200,
    publisher: "Fancy Press",
    title: "Cool Title",
    year: 2000,
  });
});

/** GET all books */
describe("GET /books/", function () {
  test("can get list of books", async function () {
    let response = await request(app).get("/books");

    expect(response.body).toEqual({
      books: [
        {
          isbn: "12345",
          amazon_url: "http://a.co/eobPtX2",
          author: "Lala Lala",
          language: "english",
          pages: 200,
          publisher: "Fancy Press",
          title: "Cool Title",
          year: 2000,
        },
      ],
    });
  });
});
/** GET a book */

describe("GET /books/:isbn", function () {
  test("can get book", async function () {
    let response = await request(app).get("/books/12345");

    expect(response.body).toEqual({
      book: {
        isbn: "12345",
        amazon_url: "http://a.co/eobPtX2",
        author: "Lala Lala",
        language: "english",
        pages: 200,
        publisher: "Fancy Press",
        title: "Cool Title",
        year: 2000,
      },
    });
  });

  test("404 on missing book", async function () {
    let response = await request(app).get("/books/19");
    expect(response.statusCode).toEqual(404);
  });
});

/** POST a book */

describe("POST /books/", function () {
  test("can add a book", async function () {
    const response = await request(app).post(`/books`).send({
      isbn: "15",
      amazon_url: "www.google.com",
      author: "Lo Lala",
      language: "english",
      pages: 20,
      publisher: "Fancy/Not Press",
      title: "Cooler Title",
      year: 2006,
    });

    expect(response.body).toEqual({
      book: {
        isbn: "15",
        amazon_url: "www.google.com",
        author: "Lo Lala",
        language: "english",
        pages: 20,
        publisher: "Fancy/Not Press",
        title: "Cooler Title",
        year: 2006,
      },
    });
  });
  test("can't add a book with missing information", async function () {
    const response = await request(app).post(`/books`).send({
      isbn: "815",
      amazon_url: "www.google.com",

      language: "english",
      pages: 20,
      publisher: "Fancy/Not Press",
      title: "Cooler Title",
      year: 2006,
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});
describe("PUT /books/isbn", function () {
  test("can edit a book", async function () {
    const response = await request(app).put(`/books/12345`).send({
      author: "Lala Lala",
      language: "english",
      pages: 200,
      publisher: "Fancy Press",
      title: "Cool Titleeeeeeee",
      year: 2000,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.book.title).toBe("Cool Titleeeeeeee");
  });
  test("Can't edit a book without requirements", async function () {
    const response = await request(app).put(`/books/12345`).send({
      author: "Lala Lala",
      language: "english",
      pages: 200,
      publisher: "Fancy Press",

      year: 2000,
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});
describe("DELETE /books/:isbn", function () {
  test("Deletes a book", async function () {
    const response = await request(app).delete(`/books/12345`);
    expect(response.body).toEqual({ message: "Book deleted" });
  });
});
afterAll(async function () {
  await db.end();
});
