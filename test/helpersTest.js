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
  // unit test to confirm getUserByEmail function returns a user object when provided email in database
  it('should return an object if email exists in database ', function () {
    const user = getUserByEmail("user@example.com", testUsers);
    assert.isObject(testUsers, "testUsers is an object");
  });
  it('should return undefined if an email is not in our users database', function () {
    const user = getUserByEmail("userTest@example.com", testUsers);
    const expectedOutput = "undefined";
    assert.isUndefined(user, "Returns undefined");
  });
});