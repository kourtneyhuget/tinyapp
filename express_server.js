const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const { request, response } = require("express");
const app = express();

const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['keys1', 'keys2']
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// object to store shortURL/longURL and the userId
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userId: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userId: "aJ48lW" }
};

// object to store all user information when registered
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// all the read routes
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

// if user does not exist page will not display, message to login or register will show
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const userDb = urlsForUser(userId, urlDatabase);
  const user = users[userId];
  if (!user) {
    res.status(403).send('Please login or register');
  } else {
    const templateVars = {
      urls: userDb,
      user: user
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// only logged in/registered users can create new short URLS
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    user: user
  };
  if (userId) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// only logged in/registered users can go to specific shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    res.status(403).send('Please login or register');
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: user
  };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.redirect('/login');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// // all the create routes

// if user information is not in database, return incorrect email or password message
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    res.status(403).send('Incorrect email');
    return;
  }

  const passwordGood = bcrypt.compareSync(req.body.password, user.password);
  if (!passwordGood) {
    res.status(403).send('Incorrect password');
    return;
  }
  // starts cookie session associated to user_id
  req.session.user_id = user.id;
  return res.redirect('/urls');
});

// assign shortURL a randomly generated string to assign with longURL in database 
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userId = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: userId
  };
  res.redirect(`/urls/${shortURL}`);
});

// if user_id is in database, store URL information under user-id so only that user has access
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.newLongURL;
  const userDb = urlsForUser(req.session.user_id, urlDatabase);
  for (let key in userDb) {
    if (key === shortURL) {
      urlDatabase[shortURL].longURL = newLongURL;
      return res.redirect("/urls");
    }
  }
  res.status(403).send('You do not have access to edit');
});

// logout deletes cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// hash password that user inputs and store hashed password in users object
app.post("/register", (req, res) => {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!req.body.email || !req.body.password) {
    res.status(400).send('Field is empty');
    return;
  }

  const user = getUserByEmail(req.body.email, users);
  if (user) {
    res.status(400).send('Email exists');
    return;
  }
  const newUserRandomID = generateRandomString();
  users[newUserRandomID] = {
    id: newUserRandomID,
    email: req.body.email,
    password: hashedPassword
  };
  req.session.user_id = newUserRandomID;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// all the delete routes
// only logged in/registered users are able to delete URLS associated to their user_id
app.post("/urls/:shortURL/delete", (req, res) => {
  const userDb = urlsForUser(req.session.user_id, urlDatabase);
  if (req.params.shortURL in userDb) {
    delete urlDatabase[req.params.shortURL];
  } else {
    res.status(403).send("You do not have access to delete\n");
  }
  res.redirect("/urls");
});


