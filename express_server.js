const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const getUserByEmail = (email) => {
  const existingUser = Object.values(users).find(
    (user) => user.email === email
  );
  return existingUser;
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

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = "http://www.lighthouselabs.ca";
  res.redirect(longURL);
});

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

// To generate a 6-character random alphanumeric string:
const randomString = generateRandomString(6);
console.log(randomString);

// POST endpoint for handling login
app.post("/login", (req, res) => {
  const { username } = req.body;

// Set the cookie named "username" with the value from the request body
  res.cookie("username", username);

// Redirect the browser back to the /urls page
  res.redirect("/urls");
});

// Sample user data (this should come from your authentication system)
const users = {
  user123: {
    id: "user123",
    username: "john_doe",
  },
};

// GET /login endpoint
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/urls", (req, res) => {
  const username = req.cookies["username"];
  const user = users[username];

  const templateVars = {
    username: user ? user.username + "hellos" : null,
    urlDatabase,
    // ... any other vars
  };
  res.render("urls_index", templateVars);
});

// Define your /logout route
app.post("/logout", (req, res) => {
  // Clear the username cookie to log out the user
  res.clearCookie("username");

  // Redirect the user back to the /urls page
  res.redirect("/urls");
});

// GET endpoint for /register
app.get("/register", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { username };
  res.render("registration", templateVars);
});

// Global user object (you may have this in your existing code)
let user = {};

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is missing
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  // Check if the email is already registered

  if (getUserByEmail(email)) {
    return res.status(400).json({ error: "Email is already registered." });
  }

  // Generate a random user ID
  const userID = generateRandomString(6);

  // Create the new user object
  const newUser = {
    id: userID,
    email: email,
    password: password, // Remember, this is plain text for now (will be fixed later)
  };
  users[userID] = newUser;

  // Return a success response
  res.status(200).json({ message: "Registration successful." });
});
// Add the new user to the global users object
//users[username] = newUser;
//});

app.get("/profile", (req, res) => {
  const username = req.cookies.username;
  // Fetch the specific user object using the user_id cookie value
  const user = users[req.cookies.user_id];

  // Render the profile template and pass the entire user object to the template
  res.render("profile", { user });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
