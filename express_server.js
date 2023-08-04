const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// add router 

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// sending HTML

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  console.log("urlDatabase", urlDatabase);
    const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
});

function generateRandomString() {
  
}


app.get("/u/:id", (req, res) => {
  const longURL = "http://www.lighthouselabs.ca"
  res.redirect(longURL);
});


function generateRandomString(length) {
  const alphanumericChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumericChars.length);
    result += alphanumericChars.charAt(randomIndex);
  }
  
  return result;
}

// To generate a 6-character random alphanumeric string:
const randomString = generateRandomString(6);
console.log(randomString);


// Serve the login form page 
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// POST endpoint for handling login
app.post('/login', (req, res) => {
  const { username } = req.body;

  // Set the cookie named "username" with the value from the request body
  res.cookie('username', username);

  // Redirect the browser back to the /urls page
  res.redirect('/urls');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});