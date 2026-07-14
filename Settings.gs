// Settings and Database Management

function initializeSystem() {
  return getSystemInfo();
}

function getSystemInfo() {
  var props = PropertiesService.getScriptProperties();
  var userEmail = Session.getActiveUser().getEmail();
  
  var info = {
    account: {
      email: userEmail || "Tidak dapat memuat email (izin terbatas)",
      name: "User",
      lastLogin: new Date().toISOString()
    },
    drive: getDriveInfo(),
    database: null,
    system: {
      appVersion: props.getProperty('ApplicationVersion') || '1.0.0',
      dbVersion: props.getProperty('DatabaseVersion') || '1.0.0',
      installDate: props.getProperty('ConnectedAt') || props.getProperty('InstallDate') || new Date().toISOString(),
      lastSync: props.getProperty('LastSync') || '-',
      setupStatus: props.getProperty('SetupStatus') || 'Uninitialized',
      stats: {
        guru: 0, siswa: 0, kelas: 0, mapel: 0, tableCount: 0
      }
    },
    appConfig: {}
  };

  var ss = null;
  try {
    ss = getActiveSpreadsheet();
  } catch(e) {}
  
  if (ss) {
    try {
      info.database = {
        id: ss.getId(),
        name: ss.getName(),
        url: ss.getUrl(),
        sheetCount: ss.getSheets().length,
        status: 'Terhubung'
      };
      
      // Get stats
      info.system.stats.tableCount = info.database.sheetCount;
      var guruSheet = ss.getSheetByName('Guru');
      if(guruSheet) info.system.stats.guru = Math.max(0, guruSheet.getLastRow() - 1);
      var siswaSheet = ss.getSheetByName('Siswa');
      if(siswaSheet) info.system.stats.siswa = Math.max(0, siswaSheet.getLastRow() - 1);
      var kelasSheet = ss.getSheetByName('Kelas');
      if(kelasSheet) info.system.stats.kelas = Math.max(0, kelasSheet.getLastRow() - 1);
      var mapelSheet = ss.getSheetByName('Mapel');
      if(mapelSheet) info.system.stats.mapel = Math.max(0, mapelSheet.getLastRow() - 1);
      
      // Get config
      var configSheet = ss.getSheetByName('Pengaturan');
      if(configSheet) {
         var data = configSheet.getDataRange().getValues();
         for(var i = 1; i < data.length; i++) {
            if(data[i][0]) {
               info.appConfig[data[i][0]] = data[i][1];
            }
         }
      }
    } catch(e) {
      info.database = { status: 'Tidak Terhubung', error: e.toString() };
    }
  } else {
    info.database = { status: 'Tidak Terhubung', error: 'Belum ada database yang dikonfigurasi.' };
  }
  
  return info;
}

const REQUIRED_SHEETS = [
  'Guru', 'User', 'Kelas', 'Siswa', 'Mapel', 
  'Jadwal', 'Absensi', 'ModulAjar', 'Jurnal', 
  'Nilai', 'Pengaturan', 'LogAktivitas'
];

const DEFAULT_HEADERS = {
  'User': ['ID', 'Username', 'Password', 'NamaGuru', 'KodeGuru', 'Status', 'LastLogin', 'CreatedAt', 'UpdatedAt'],
  'Guru': ['ID', 'KodeGuru', 'NamaGuru', 'NIP', 'NoHP', 'Email', 'Status', 'CreatedAt'],
  'Kelas': ['ID', 'KodeKelas', 'NamaKelas', 'WaliKelas', 'Kapasitas', 'CreatedAt'],
  'Siswa': ['ID', 'NIS', 'NISN', 'NamaSiswa', 'JenisKelamin', 'TempatLahir', 'TanggalLahir', 'KodeKelas', 'Status', 'CreatedAt'],
  'Mapel': ['ID', 'KodeMapel', 'NamaMapel', 'KKM', 'Tingkat', 'CreatedAt'],
  'Jadwal': ['ID', 'Hari', 'JamMulai', 'JamSelesai', 'KodeMapel', 'KodeGuru', 'KodeKelas', 'CreatedAt'],
  'Absensi': ['ID', 'Tanggal', 'KodeJadwal', 'KodeSiswa', 'StatusKehadiran', 'Keterangan', 'CreatedAt'],
  'ModulAjar': ['ID', 'KodeMapel', 'KodeGuru', 'JudulModul', 'Materi', 'LinkFile', 'Status', 'CreatedAt'],
  'Jurnal': ['ID', 'Tanggal', 'KodeJadwal', 'MateriPokok', 'Kegiatan', 'Catatan', 'CreatedAt'],
  'Nilai': ['ID', 'KodeSiswa', 'KodeMapel', 'JenisNilai', 'Nilai', 'Semester', 'TahunAjaran', 'CreatedAt'],
  'Pengaturan': ['Kunci', 'Nilai', 'Keterangan', 'UpdatedAt'],
  'LogAktivitas': ['ID', 'Timestamp', 'User', 'Aktivitas', 'Detail']
};

function createDatabase() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var ss = getActiveSpreadsheet();
    var props = PropertiesService.getScriptProperties();
    
    props.setProperty('SpreadsheetName', ss.getName());
    props.setProperty('SpreadsheetURL', ss.getUrl());
    props.setProperty('InstallDate', new Date().toISOString());
    props.setProperty('SetupStatus', 'Initialized');
    props.setProperty('DatabaseVersion', '1.0.0');
    props.setProperty('ConnectionStatus', 'Connected');
    props.setProperty('ConnectedAt', new Date().toISOString());
    props.setProperty('LastSync', new Date().toISOString());
    
    // Create sheets
    REQUIRED_SHEETS.forEach(function(sheetName) {
      var sheet = ss.getSheetByName(sheetName);
      if(!sheet) {
        sheet = ss.insertSheet(sheetName);
      }
      var headers = DEFAULT_HEADERS[sheetName];
      if(headers && sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      }
    });
    
    // Delete default Sheet1 if exists and not needed
    var sheet1 = ss.getSheetByName('Sheet1');
    if(sheet1 && ss.getSheets().length > 1) {
      ss.deleteSheet(sheet1);
    }
    
    // Insert initial config
    var configSheet = ss.getSheetByName('Pengaturan');
    if(configSheet && configSheet.getLastRow() === 1) {
       var configs = [
         ['NamaSekolah', 'SMA Negeri 1', 'Nama Instansi'],
         ['SemesterAktif', 'Ganjil', 'Semester Saat Ini'],
         ['TahunAjaran', '2026/2027', 'Tahun Ajaran Aktif'],
         ['Tema', 'light', 'Tema Aplikasi']
       ];
       configs.forEach(function(c) { configSheet.appendRow([c[0], c[1], c[2], new Date()]); });
    }
    
    // Insert initial Admin User if empty
    var userSheet = ss.getSheetByName('User');
    if(userSheet && userSheet.getLastRow() === 1) {
       userSheet.appendRow([Utilities.getUuid(), 'admin', 'admin123', 'Administrator', 'ADM-01', 'Aktif', '', new Date(), new Date()]);
    }
    
    logActivity('System', 'Membuat Database Baru', 'ID: ' + ss.getId());
    return { success: true, message: 'Database berhasil dibuat dan dikonfigurasi.', dbId: ss.getId() };
  } catch(e) {
    return { success: false, message: 'Gagal membuat database: ' + e.toString() };
  } finally {
    lock.releaseLock();
  }
}


function importSpreadsheet(input) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var ss = getActiveSpreadsheet();
    var props = PropertiesService.getScriptProperties();
    
    props.setProperty('SpreadsheetName', ss.getName());
    props.setProperty('SpreadsheetURL', ss.getUrl());
    props.setProperty('DatabaseVersion', '1.0.0');
    props.setProperty('ConnectionStatus', 'Connected');
    props.setProperty('ConnectedAt', new Date().toISOString());
    props.setProperty('LastSync', new Date().toISOString());
    props.setProperty('SetupStatus', 'Imported');
    
    var valRes = validateDatabase();
    logActivity('System', 'Akses Spreadsheet', 'Berhasil mengenali spreadsheet aktif: ' + ss.getId());
    return { success: true, message: 'Database berhasil dihubungkan. ' + valRes.message, validation: valRes };
  } catch(e) {
    return { success: false, message: 'Gagal mengenali Spreadsheet aktif: ' + e.message };
  } finally {
    lock.releaseLock();
  }
}

function testDatabaseConnection() {
  try {
    var ss = getActiveSpreadsheet();
    var testSheet = ss.getSheetByName('LogAktivitas') || ss.getSheets()[0];
    if(testSheet) {
        return { success: true, message: 'Koneksi ke ' + ss.getName() + ' berhasil.' };
    }
    return { success: false, message: 'Spreadsheet tidak memiliki sheet.' };
  } catch(e) {
    return { success: false, message: 'Koneksi gagal. ' + e.message };
  }
}

function validateDatabase() {
  try {
    var ss = getActiveSpreadsheet();
    var missingSheets = [];
    var missingHeaders = {};
    
    REQUIRED_SHEETS.forEach(function(sheetName) {
      var sheet = ss.getSheetByName(sheetName);
      if(!sheet) {
        missingSheets.push(sheetName);
      } else {
        var reqHeaders = DEFAULT_HEADERS[sheetName];
        if(reqHeaders) {
          if(sheet.getLastRow() === 0) {
            missingHeaders[sheetName] = reqHeaders;
          } else {
            var currHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
            var mHeaders = reqHeaders.filter(function(h) { return currHeaders.indexOf(h) === -1; });
            if(mHeaders.length > 0) {
              missingHeaders[sheetName] = mHeaders;
            }
          }
        }
      }
    });
    
    var needsFix = missingSheets.length > 0 || Object.keys(missingHeaders).length > 0;
    return { 
      valid: !needsFix, 
      missingSheets: missingSheets, 
      missingHeaders: missingHeaders,
      message: needsFix ? 'Beberapa tabel atau kolom tidak ditemukan. Silakan lakukan perbaikan otomatis.' : 'Database valid.'
    };
  } catch(e) {
    return { valid: false, message: 'Akses ke database gagal.' };
  }
}

function fixDatabase() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var ss = getActiveSpreadsheet();
    var val = validateDatabase();
    
    // Create missing sheets
    val.missingSheets.forEach(function(sn) {
      var sheet = ss.insertSheet(sn);
      sheet.appendRow(DEFAULT_HEADERS[sn]);
      sheet.getRange(1, 1, 1, DEFAULT_HEADERS[sn].length).setFontWeight("bold");
    });
    
    // Add missing headers
    for(var sn in val.missingHeaders) {
       var sheet = ss.getSheetByName(sn);
       var missing = val.missingHeaders[sn];
       if(sheet.getLastRow() === 0) {
         sheet.appendRow(DEFAULT_HEADERS[sn]);
         sheet.getRange(1, 1, 1, DEFAULT_HEADERS[sn].length).setFontWeight("bold");
       } else {
         var lc = sheet.getLastColumn();
         var hr = sheet.getRange(1, 1, 1, lc).getValues()[0];
         missing.forEach(function(h) {
           hr.push(h);
         });
         sheet.getRange(1, 1, 1, hr.length).setValues([hr]);
         sheet.getRange(1, 1, 1, hr.length).setFontWeight("bold");
       }
    }
    
    logActivity('System', 'Memperbaiki Struktur Database', 'Sheets & Headers ditambahkan');
    return { success: true, message: 'Struktur database berhasil diperbaiki.' };
  } catch(e) {
    return { success: false, message: 'Gagal memperbaiki database: ' + e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function backupDatabase() {
  try {
    var ss = getActiveSpreadsheet();
    var src = DriveApp.getFileById(ss.getId());
    var d = new Date();
    var name = 'Backup Sistem Mengajar Guru - ' + 
               d.getFullYear() + ('0' + (d.getMonth()+1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' +
               ('0' + d.getHours()).slice(-2) + ('0' + d.getMinutes()).slice(-2);
    
    var backup = src.makeCopy(name);
    logActivity('System', 'Backup Database', 'File: ' + name);
    return { success: true, message: 'Backup berhasil dibuat.', fileUrl: backup.getUrl() };
  } catch(e) {
    return { success: false, message: 'Backup gagal: ' + e.message };
  }
}

function getAvailableBackups() {
  try {
    var props = PropertiesService.getScriptProperties();
    var backupFolderId = props.getProperty('BackupFolderId');
    var result = [];
    
    if (backupFolderId) {
      var folder = DriveApp.getFolderById(backupFolderId);
      var files = folder.searchFiles('mimeType = "application/vnd.google-apps.spreadsheet"');
      while(files.hasNext()) {
        var f = files.next();
        result.push({
          id: f.getId(),
          name: f.getName(),
          date: f.getDateCreated().toISOString(),
          url: f.getUrl()
        });
      }
    } else {
      // Fallback
      var files = DriveApp.searchFiles('title contains "Backup-" and mimeType = "application/vnd.google-apps.spreadsheet"');
      while(files.hasNext()) {
        var f = files.next();
        result.push({
          id: f.getId(),
          name: f.getName(),
          date: f.getDateCreated().toISOString(),
          url: f.getUrl()
        });
      }
    }
    
    result.sort(function(a,b) { return new Date(b.date) - new Date(a.date); });
    return { success: true, backups: result };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function saveAppConfig(configObj) {
  try {
    var ss = getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Pengaturan');
    if(!sheet) return { success: false, message: 'Sheet Pengaturan tidak ditemukan.' };
    
    var data = sheet.getDataRange().getValues();
    var existingKeys = {};
    for(var i=1; i<data.length; i++) {
      existingKeys[data[i][0]] = i + 1; // row index
    }
    
    var now = new Date();
    for(var key in configObj) {
      if(existingKeys[key]) {
        sheet.getRange(existingKeys[key], 2).setValue(configObj[key]);
        sheet.getRange(existingKeys[key], 4).setValue(now);
      } else {
        sheet.appendRow([key, configObj[key], '', now]);
      }
    }
    
    logActivity('System', 'Update Konfigurasi', 'Konfigurasi aplikasi diubah');
    return { success: true, message: 'Konfigurasi berhasil disimpan.' };
  } catch(e) {
    return { success: false, message: 'Gagal menyimpan: ' + e.message };
  }
}

function logActivity(user, activity, detail) {
  try {
    var ss = getActiveSpreadsheet();
    var sheet = ss.getSheetByName('LogAktivitas');
    if(sheet) {
      sheet.appendRow([Utilities.getUuid(), new Date(), user, activity, detail || '']);
    }
  } catch(e) {}
}

function disconnectDatabase() {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('SpreadsheetID');
  props.deleteProperty('SpreadsheetName');
  props.deleteProperty('SpreadsheetURL');
  props.deleteProperty('ConnectionStatus');
  props.deleteProperty('LastSync');
  props.setProperty('SetupStatus', 'Uninitialized');
  
  return { success: true, message: 'Koneksi database berhasil diputus.' };
}
