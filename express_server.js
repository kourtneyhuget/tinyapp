const express = require("express");
const PORT = 8080;
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

const bodyParser = require("body-parser");
const { request } = require("express");
app.use(bodyParser.urlencoded({ extended: true }));

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
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

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

// helper function for DRY code
const ifEmail = (email) => {
  for (let value in users) {
    if (users[value].email === email) {
      return value;
    }
  }
  return false;
};

app.set("view engine", "ejs");

// all the read routes
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// looking for user_id in cookies
// looking to see if cookie exists in database on routes that are protected
// redirect to register
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  if (req.cookies['user_id']) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
/* 
if (the cookie) {
res.render("" , templateVars)
} else {
redirect to login
}
*/

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
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

// // all my create routes
app.post("/login", (req, res) => {
  if (!ifEmail(req.body.email)) {
    res.status(403).send('Incorrect email');
  } else {
    const id = ifEmail(req.body.email);
    if (users[id].password !== req.body.password) {
      res.status(403).send('Incorrect password');
    } else {
      res.cookie('user_id', id);
    }
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  const longBodyURL = req.body.longURL;
  // urlDatabase[shortURL] = [userID][req.cookies["user_id"]];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longBodyURL;
  console.log(urlDatabase[shortURL]);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newLongUrl;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Field is empty');
  } else if (ifEmail(req.body.email)) {
    res.status(400).send('Email exists');
  } else {
    const newUserRandomID = generateRandomString();
    users[newUserRandomID] = {
      id: newUserRandomID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', newUserRandomID);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// all my delete routes
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


