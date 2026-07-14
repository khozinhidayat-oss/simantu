// Helper functions for the application

function getCurrentUser(sessionId) {
  var session = checkSession(sessionId);
  if (session.success) {
    return session.session;
  }
  return null;
}

function validateUser(username, password) {
  if (!username || username.trim() === '') {
    return { valid: false, message: 'Username wajib diisi.' };
  }
  if (!password || password.trim() === '') {
    return { valid: false, message: 'Password wajib diisi.' };
  }
  return { valid: true };
}

function hashPassword(password) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  var txtHash = '';
  for (var i = 0; i < rawHash.length; i++) {
    var hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}
