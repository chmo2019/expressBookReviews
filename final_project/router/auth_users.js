const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // get isbn, session username, and queried review
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const review = req.query.review;
  
  // check if book exists
  if (books[isbn]) {
    // create or update review
    books[isbn].reviews[username] = {"username": username, "review": review};

    // check if review exists
    if (books[isbn].reviews[username]) {
      return res.status(200).json({message: "Successfully updated review for book with isbn: " + isbn});
    }
    // else review was created
    return res.status(201).json({message: "Successfully created review for book with isbn: " + isbn});
  }
  return res.status(404).json(
    {message: `Could not find book with isbn ${isbn}: does not exist`});
  
});

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // get isbn and session username
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // check if review exists
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({message: "Successfully deleted review for book with isbn: " + isbn});
  }
  return res.status(404).json(
    {message: `Could not delete book with isbn ${isbn}: does not exist`});
  
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
