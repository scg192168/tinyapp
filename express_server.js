const express = require("express");
const cookieSession = require("cookie-session"); //require cookie-session
const bcrypt = require("bcryptjs");
const app = express();
const { users, urlDatabase } = require("./database");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helper");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

// add route
app.get("/", (req, res) => {
  res.send("Hello!");
});

// add command if/else loop
app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if (!user) {
    res.send("User is not logged in");
    return;
  }
  let userURLs = urlsForUser(userID, urlDatabase);
  const templateVars = {
    user,
    urlDatabase: userURLs,
  };
  res.render("urls_index", templateVars);
});

// add route
app.get("/urls/new", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    res.redirect("/login");
  } else {
    const user = users[userID];
    const templateVars = { user };
    res.render("urls_new", templateVars);
  }
});

// add route
app.get("/urls/:id", (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if (!user) {
    res.send("User is not logged in");
    return;
  }
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]?.longURL;
  if (!longURL) {
    return res.status(404).send("<p>URL not found</p>");
  }
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send("<p>Access forbidden</p>");
  }
  const templateVars = {
    shortURL,
    longURL,
    user,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]?.longURL;
  if (!longURL) {
    return res.status(404).send("<p>URL not found</p>");
  } else {
    res.redirect(longURL);
  }
});

// POST endpoint for handling  urls
app.post("/urls", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    return res.status(401).send("<p>User much login to create new URLs<p>");
  }
  const id = generateRandomString(6);
  urlDatabase[id] = { longURL: req.body.longURL, userID: userID };
  res.redirect("/urls");
});

// POST endpoint for handling updating urls
app.post("/urls/:id/update", (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if (!user) {
    return res.send("User is not logged in");
  }
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]?.longURL;
  if (!longURL) {
    return res.status(404).send("<p>URL not found</p>");
  }
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send("<p>Access forbidden</p>");
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// POST endpoint for handling deleting urls
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if (!user) {
    return res.send("User is not logged in");
  }
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]?.longURL;
  if (!longURL) {
    return res.status(404).send("<p>URL not found</p>");
  }
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send("<p>Access forbidden</p>");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// GET endpoint for /register
app.get("/register", (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[userID] };
    res.render("registration", templateVars);
  }
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
  // Hash the password with bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Generate a random user ID
  const userID = generateRandomString(6);
  const newUser = {
    id: userID,
    email: email,
    password: hashedPassword,
  };
  users[userID] = newUser;

  req.session.user_id = userID;
  res.redirect("/urls");
});

// GET /login endpoint
app.get("/login", (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[userID] };
    res.render("login", templateVars);
  }
});

// POST endpoint for handling login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is missing
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = getUserByEmail(email);
  console.log(password);
  console.log(user.password);
  console.log(user);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).json({ error: "User not found" });
  }

  // Set the cookie named "user.id" with the value from the request body
  req.session.user_id = user.id;

  // Redirect the browser back to the /urls page
  res.redirect("/urls");
});

// Define /logout route
app.post("/logout", (req, res) => {
  // Clear the username cookie to log out the user
  req.session.user_id = null;
  // Redirect the user back to the /urls page
  res.redirect("/login");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
