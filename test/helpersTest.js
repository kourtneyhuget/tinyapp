const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function () {
  // unit test to confirm is email exists within testUser object, the object is returned
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers);
    assert.isObject(testUsers, "returns a user that exists in database");
  });
  // unit test to confirm if email does not exist within testUser object, undefined will be returned
  it('should return undefined if an email is not in our users database', function () {
    const user = getUserByEmail("userTest@example.com", testUsers);
    const expectedOutput = "undefined";
    assert.isUndefined(user, "Returns undefined");
  });
});