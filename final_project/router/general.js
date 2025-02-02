const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // get list of all books
  return res.status(200).send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // get isbn
  const isbn = req.params.isbn;

  // check if book exists
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }
  return res.status(404).json({message: `Could not find book with isbn ${isbn}: does not exist`})
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // get requested author
  const author = req.params.author;

  // get list of books matched to author
  return res.status(200).json(Object.values(books).filter(
    book => {return (book.author == author)}));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // get title
  const title = req.params.title;

  // get lists of books matched to title
  return res.status(200).json(Object.values(books).filter(
    book => {return book.title == title}))
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // get isbn
  const isbn = req.params.isbn

  // check if book exists
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json(
    {message: `Could not find book with isbn ${isbn}: does not exist`})
});

// async-await for testing '/' endpoint
async function getAllBooks() {
  let res = await axios.get('http://localhost:5000/')
  console.log(res.data);
};

// async-await for testing '/isbn/:isbn' endpoint
async function getByISBN() {
  let res = await axios.get('http://localhost:5000/isbn/1')
  console.log(res.data);
};

// async-await for testing '/author/:author' endpoint
async function getByAuthor() {
  let res = await axios.get('http://localhost:5000/author/Chinua Achebe')
  console.log(res.data);
};

// async-await for testing '/title/:title' endpoint
async function getByTitle() {
  let res = await axios.get('http://localhost:5000/title/Things Fall Apart')
  console.log(res.data);
};

getAllBooks();
getByISBN();
getByAuthor();
getByTitle();

module.exports.general = public_users;
