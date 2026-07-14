function loginWithGoogle(manualEmail) {
  try {
    var email = manualEmail || Session.getActiveUser().getEmail();
    
    if (!email) {
       return { success: false, message: 'Identitas Google tidak ditemukan. Pastikan setting deployment menggunakan "Execute as: User accessing the web app".' };
    }
    
    var ss;
    try {
      ss = getActiveSpreadsheet();
    } catch(e) {
      return { success: false, message: e.message };
    }
    
    var sheet = ss.getSheetByName('Guru');
    if (!sheet) {
        sheet = ss.getSheetByName('User');
    }
    if (!sheet) return { success: false, message: 'Sheet referensi pengguna tidak ditemukan.' };
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return { success: false, message: 'Data pengguna kosong.' };
    }
    
    var headers = data[0].map(function(h) { return String(h).toLowerCase().trim(); });
    
    var emailIdx = headers.indexOf('email');
    if (emailIdx === -1) {
       emailIdx = headers.indexOf('username'); // Fallback to username column
       if (emailIdx === -1) {
           return { success: false, message: 'Kolom Email tidak ditemukan di database.' };
       }
    }
    
    var statusIdx = headers.indexOf('status');
    var lastLoginIdx = headers.indexOf('lastlogin');
    var namaIdx = headers.indexOf('nama');
    if(namaIdx === -1) namaIdx = headers.indexOf('namaguru');
    var kodeGuruIdx = headers.indexOf('kodeguru');
    var roleIdx = headers.indexOf('role');
    var idIdx = headers.indexOf('id');
    
    for (var i = 1; i < data.length; i++) {
      var rowEmail = String(data[i][emailIdx]).trim();
      
      if (rowEmail.toLowerCase() === email.toLowerCase()) {
        
        var status = statusIdx > -1 ? data[i][statusIdx] : 'Aktif';
        if (status !== 'Aktif') {
          return { success: false, message: 'Akun Anda tidak aktif. Hubungi administrator.', isWarning: true };
        }
        
        // Update Last Login
        if (lastLoginIdx > -1) {
          var now = new Date();
          sheet.getRange(i + 1, lastLoginIdx + 1).setValue(now);
        }
        
        var user = {
          id: idIdx > -1 ? data[i][idIdx] : 'ID-' + i,
          email: email,
          nama: namaIdx > -1 ? data[i][namaIdx] : email,
          kodeGuru: kodeGuruIdx > -1 ? data[i][kodeGuruIdx] : '',
          role: roleIdx > -1 ? data[i][roleIdx] : 'Guru',
          status: status
        };
        
        var sessionData = createSession(user);
        
        // Log Activity
        logActivity(email, 'Login', 'Berhasil login menggunakan akun Google');
        
        return { success: true, message: 'Login berhasil.', session: sessionData };
      }
    }
    
    return { success: false, message: 'Akun ' + email + ' belum terdaftar. Silakan hubungi administrator.' };
  } catch (e) {
    return { success: false, message: 'Kesalahan server: ' + e.message };
  }
}

function getGoogleAccountEmail() {
    try {
        return Session.getActiveUser().getEmail();
    } catch(e) {
        return '';
    }
}

function logout(sessionId) {
  var session = checkSession(sessionId);
  if (session && session.success && session.session) {
      logActivity(session.session.email, 'Logout', 'Berhasil logout');
  }
  clearSession(sessionId);
  return { success: true, message: 'Anda berhasil logout.' };
}


