// Drive Storage Management

const REQUIRED_FOLDERS = [
  'Database', 'Backup', 'Guru', 'Guru/Foto', 'Guru/Dokumen', 
  'ModulAjar', 'Jurnal', 'Penilaian', 'Absensi', 'Export', 'Import', 'Temp'
];

function getDriveInfo() {
  var props = PropertiesService.getScriptProperties();
  var rootId = props.getProperty('RootFolderId');
  
  if (!rootId) {
    return {
      status: 'NotConnected',
      rootId: null,
      rootUrl: null,
      lastSync: null,
      stats: { folders: 0, files: 0, storageUsed: '0 MB' }
    };
  }
  
  try {
    var rootFolder = DriveApp.getFolderById(rootId);
    
    
    // Quick stats approximation
    var folders = rootFolder.getFolders();
    var folderCount = 0;
    while(folders.hasNext()) { folders.next(); folderCount++; }
    
    var files = rootFolder.getFiles();
    var fileCount = 0;
    var totalSize = 0;
    while(files.hasNext()) { 
      var f = files.next(); 
      fileCount++; 
      totalSize += f.getSize();
    }
    var storageStr = (totalSize / (1024 * 1024)).toFixed(2) + ' MB';
    
    return {
      status: 'Connected',
      rootId: rootId,
      rootUrl: rootFolder.getUrl(),
      lastSync: props.getProperty('DriveLastSync') || '-',
      stats: { folders: folderCount, files: fileCount, storageUsed: storageStr }
    };
} catch(e) {
    return { status: 'Error', message: e.toString() };
  }
}

function getRootFolderUrl() {
  var props = PropertiesService.getScriptProperties();
  var rootId = props.getProperty('RootFolderId');
  
  if (!rootId) {
    return { success: false, isWarning: true, message: 'Folder penyimpanan belum dikonfigurasi.' };
  }
  
  try {
    var rootFolder = DriveApp.getFolderById(rootId);
    if (rootFolder.isTrashed()) {
        return { success: false, message: 'Folder Google Drive tidak ditemukan.' };
    }
    
    // Check if the folder is still accessible by trying to get its URL
    var url = rootFolder.getUrl();
    
    return { success: true, url: url };
  } catch(e) {
    var errMsg = e.toString().toLowerCase();
    if (errMsg.indexOf('permission') !== -1 || errMsg.indexOf('access') !== -1 || errMsg.indexOf('izin') !== -1) {
        return { success: false, message: 'Anda tidak memiliki izin untuk membuka folder ini.' };
    }
    return { success: false, message: 'Folder Google Drive tidak ditemukan.' };
  }
}

function connectDrive() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var props = PropertiesService.getScriptProperties();
    var existingRootId = props.getProperty('RootFolderId');
    
    var rootFolder;
    if (existingRootId) {
      try {
        rootFolder = DriveApp.getFolderById(existingRootId);
      } catch(e) {
        // Folder might be deleted
      }
    }
    
    if (!rootFolder) {
      var rootSearch = DriveApp.searchFolders("title = 'Sistem Mengajar Guru' and trashed = false");
      if (rootSearch.hasNext()) {
        rootFolder = rootSearch.next();
      } else {
        rootFolder = DriveApp.createFolder('Sistem Mengajar Guru');
      }
      props.setProperty('RootFolderId', rootFolder.getId());
      props.setProperty('RootFolderName', rootFolder.getName());
    }
    
    // Create structure
    var folderCache = { 'Sistem Mengajar Guru': rootFolder };
    
    REQUIRED_FOLDERS.forEach(function(path) {
      var parts = path.split('/');
      var parent = rootFolder;
      var currentPath = 'Sistem Mengajar Guru';
      
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        currentPath += '/' + part;
        
        if (!folderCache[currentPath]) {
          var subSearch = parent.searchFolders("title = '" + part + "' and trashed = false");
          var subFolder;
          if (subSearch.hasNext()) {
            subFolder = subSearch.next();
          } else {
            subFolder = parent.createFolder(part);
          }
          folderCache[currentPath] = subFolder;
          parent = subFolder;
        } else {
          parent = folderCache[currentPath];
        }
      }
    });
    
    props.setProperty('DatabaseFolderId', folderCache['Sistem Mengajar Guru/Database'].getId());
    props.setProperty('BackupFolderId', folderCache['Sistem Mengajar Guru/Backup'].getId());
    props.setProperty('ExportFolderId', folderCache['Sistem Mengajar Guru/Export'].getId());
    props.setProperty('ImportFolderId', folderCache['Sistem Mengajar Guru/Import'].getId());
    props.setProperty('PhotoFolderId', folderCache['Sistem Mengajar Guru/Guru/Foto'].getId());
    props.setProperty('ModulFolderId', folderCache['Sistem Mengajar Guru/ModulAjar'].getId());
    
    props.setProperty('DriveConnectionStatus', 'Connected');
    props.setProperty('DriveLastSync', new Date().toISOString());
    
    logActivity('System', 'Drive Connection', 'Tautkan Google Drive berhasil');
    
    return { success: true, message: 'Google Drive berhasil dihubungkan dan struktur folder siap.' };
  } catch(e) {
    return { success: false, message: 'Gagal menghubungkan Google Drive: ' + e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function syncDrive() {
  return connectDrive();
}

function backupDatabaseToDrive() {
  var props = PropertiesService.getScriptProperties();
  var backupFolderId = props.getProperty('BackupFolderId');
  var dbId;
  
  try {
     dbId = getActiveSpreadsheet().getId();
  } catch(e) {}
  
  if (!dbId || !backupFolderId) {
    return { success: false, message: 'Database atau folder Backup belum terhubung.' };
  }
  
  try {
    var file = DriveApp.getFileById(dbId);
    var backupFolder = DriveApp.getFolderById(backupFolderId);
    
    var date = new Date();
    var dateString = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyyMMdd-HHmm");
    var backupName = 'Backup-SistemMengajarGuru-' + dateString;
    
    var copy = file.makeCopy(backupName, backupFolder);
    logActivity('System', 'Backup Database', 'Backup dibuat: ' + backupName);
    
    return { success: true, message: 'Database berhasil di-backup menjadi ' + backupName, fileUrl: copy.getUrl() };
  } catch(e) {
    return { success: false, message: 'Gagal membuat backup: ' + e.toString() };
  }
}


function uploadFile(base64Data, filename, folderType) {
  var props = PropertiesService.getScriptProperties();
  var folderId;
  
  switch(folderType) {
    case 'FotoGuru': folderId = props.getProperty('PhotoFolderId'); break;
    case 'DokumenGuru': folderId = props.getProperty('RootFolderId'); /* Fallback */ break; 
    case 'Modul': folderId = props.getProperty('ModulFolderId'); break;
    case 'Export': folderId = props.getProperty('ExportFolderId'); break;
    case 'Import': folderId = props.getProperty('ImportFolderId'); break;
    default: folderId = props.getProperty('RootFolderId');
  }
  
  if(!folderId) return { success: false, message: 'Folder tidak ditemukan. Hubungkan Drive terlebih dahulu.' };
  
  try {
    var folder = DriveApp.getFolderById(folderId);
    var splitBase = base64Data.split(',');
    var type = splitBase[0].split(';')[0].replace('data:', '');
    var byteCharacters = Utilities.base64Decode(splitBase[1]);
    var blob = Utilities.newBlob(byteCharacters, type, filename);
    
    var file = folder.createFile(blob);
    return { success: true, url: file.getUrl(), id: file.getId(), name: file.getName() };
  } catch(e) {
    return { success: false, message: 'Gagal mengupload: ' + e.toString() };
  }
}

function downloadFile(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    return { success: true, url: file.getDownloadUrl(), name: file.getName() };
  } catch(e) {
    return { success: false, message: 'Gagal mendownload: ' + e.toString() };
  }
}
