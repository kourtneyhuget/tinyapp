
// helper function to check if email exists in object when a user is registering or undefined if not found
const getUserByEmail = (email, database) => {
  for (let value in database) {
    if (database[value].email === email) {
      return database[value];
    }
  }
};

// helper function to store URL information under a specific userId
const urlsForUser = (id, database) => {
  const userDb = {};
  for (let key in database) {
    if (database[key].userId === id) {
      userDb[key] = {
        longURL: database[key].longURL,
        userId: id
      };
    }
  } return userDb;
};

//function to create a random string for shortURL or userId 
const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  const length = 6;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };