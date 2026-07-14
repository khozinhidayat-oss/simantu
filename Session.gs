function createSession(user) {
  var sessionId = Utilities.getUuid();
  var cache = CacheService.getScriptCache();
  
  var sessionData = {
    sessionId: sessionId,
    id: user.id,
    email: user.email,
    kodeGuru: user.kodeGuru,
    namaGuru: user.nama,
    role: user.role,
    status: user.status,
    loginTime: new Date().getTime()
  };
  
  // Cache for 6 hours
  cache.put('session_' + sessionId, JSON.stringify(sessionData), 21600);
  return sessionData;
}

function checkSession(sessionId) {
  try {
    if (!sessionId) return { success: false, message: 'Session tidak valid.' };
    
    var cache = CacheService.getScriptCache();
    var sessionString = cache.get('session_' + sessionId);
    
    if (sessionString) {
      return { success: true, session: JSON.parse(sessionString) };
    }
    return { success: false, message: 'Session berakhir.' };
  } catch (e) {
    return { success: false, message: 'Gagal mengecek session.' };
  }
}

function clearSession(sessionId) {
  if (sessionId) {
    CacheService.getScriptCache().remove('session_' + sessionId);
  }
}
