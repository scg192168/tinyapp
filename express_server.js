const express = require("express");
const cookieParser = require("cookie-parser"); //require cookie-session
const app = express();
const { users, urlDatabase } = require("./database");

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// To generate a 6-character random alphanumeric string:
function generateRandomString(length) {
  const alphanumericChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumericChars.length);
    result += alphanumericChars.charAt(randomIndex);
  }
  return result;
}

// function implementing getUserByEmail
const getUserByEmail = (email) => {
  const existingUser = Object.values(users).find(
    (user) => user.email === email
  );
  return existingUser;
};

// add route
app.get("/", (req, res) => {
  res.send("Hello!");
});

// add command if/else loop
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
    urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// add route
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// add route
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// POST endpoint for handling  urls
app.post("/urls", (req, res) => {
  const id = generateRandomString(6);
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.cookies["user_id"] }
  res.redirect("/urls")
});


// POST endpoint for handling updating urls
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// POST endpoint for handling deleting urls
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// GET endpoint for /register
app.get("/register", (req, res) => {
  const userID = req.cookies["username"];
  const templateVars = { user: users[userID] };
  res.render("registration", templateVars);
});

// POST endpoint for register
app.post("/register", (req, res) => {
  const { email, password } = req.body;
 
  // Check if email or password is missing
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = getUserByEmail(email);
  if (user) {
    return res.status(403).json({ error: "User already exists" });
  }

   // Generate a random user ID
   const userID = generateRandomString(6);
   const newUser = {
     id: userID,
     email: email,
     password: password,
   };
   users[userID] = newUser;

  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// GET /login endpoint
app.get("/login", (req, res) => {
  const userID = req.cookies["username"];
  const templateVars = { user: users[userID] };
  res.render("login", templateVars);
});

// POST endpoint for handling login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  // Check if email or password is missing
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(403).json({ error: "User not found" });
  }

  if (user.password !== password) {
    return res.status(403).json({ error: "User not found" });
  }

  // Set the cookie named "user.id" with the value from the request body
  res.cookie("user_id", user.id);

  // Redirect the browser back to the /urls page
  res.redirect("/urls");
});

// Define /logout route
app.post("/logout", (req, res) => {
  // Clear the username cookie to log out the user
  res.clearCookie("user_id");
  // Redirect the user back to the /urls page
  res.redirect("/login");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
