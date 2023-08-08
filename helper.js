const {users, urlDatabase } = require('./database.js');

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

// create a function to fetch users URLs
const urlsForUser = (userID, urlDatabase) => {
  let userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

// function implementing getUserByEmail
const getUserByEmail = (email) => {
  const existingUser = Object.values(users).find(
    (user) => user.email === email
  );
  return existingUser;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };