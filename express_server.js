const express = require("express");
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['keys1', 'keys2']
}));

const bodyParser = require("body-parser");
const { request } = require("express");
app.use(bodyParser.urlencoded({ extended: true }));

//function to create a random string for shortURL or userId 
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  const length = 6;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

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

// helper function to store longURL information under a userId
const urlsForUser = (id) => {
  const userDb = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userId === id) {
      userDb[key] = {
        longURL: urlDatabase[key].longURL,
        userId: id
      };
    }
  } return userDb;
};

// helper function to check if email exists in object when a user is registering or null if not found
const getUserByEmail = (email, database) => {
  for (let value in database) {
    if (database[value].email === email) {
      return database[value];
    }
  }
  return null;
};

app.set("view engine", "ejs");

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

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const userDb = urlsForUser(userId);
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
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// // all the create routes
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
  // res.cookie('user_id', user.id);
  req.session.user_id = user.id;
  return res.redirect('/urls');
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userId = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: userId
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.newLongURL;
  const userDb = urlsForUser(req.session.user_id);
  for (let key in userDb) {
    if (key === shortURL) {
      urlDatabase[shortURL].longURL = newLongURL;
      return res.redirect("/urls");
    }
  }
  res.status(403).send('You do not have access to edit');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

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
app.post("/urls/:shortURL/delete", (req, res) => {
  const userDb = urlsForUser(req.session.user_id);
  if (req.params.shortURL in userDb) {
    delete urlDatabase[req.params.shortURL];
  } else {
    res.status(403).send("You do not have access to delete\n");
  }
  res.redirect("/urls");
});


