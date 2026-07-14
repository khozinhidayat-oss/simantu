function getActiveSpreadsheet() {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      return ss;
    }
  } catch(e) {
    throw new Error("Aplikasi tidak terikat pada file Spreadsheet. Jalankan script ini langsung dari file Spreadsheet.");
  }
  
  throw new Error("Tidak ada Spreadsheet yang aktif. Pastikan aplikasi dijalankan dari container (bound script).");
}

function getTableData(sheetName) {
  var ss = getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getDisplayValues();
  if (data.length <= 1) return [];
  var headers = data.shift();
  return data.map(function(row) {
    var obj = {};
    headers.forEach(function(header, colIndex) {
      obj[header] = row[colIndex];
    });
    return obj;
  });
}

function insertTableRow(sheetName, record) {
  var ss = getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Tabel " + sheetName + " tidak ditemukan.");
  var headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  if(!headers || headers.length === 0 || headers[0] === "") {
      // Initialize headers if empty
      headers = Object.keys(record);
      if(headers.indexOf('ID') === -1) headers.unshift('ID');
      if(headers.indexOf('CreatedAt') === -1) headers.push('CreatedAt');
      sheet.appendRow(headers);
  }
  
  var newId = Utilities.getUuid();
  var rowData = headers.map(function(header) {
    if (header === 'ID') return record['ID'] || newId;
    if (header === 'CreatedAt' || header === 'UpdatedAt') return new Date();
    return record[header] !== undefined ? record[header] : '';
  });
  sheet.appendRow(rowData);
  return { success: true, message: "Data berhasil ditambahkan.", id: newId };
}

function updateTableRow(sheetName, idColName, idValue, record) {
  var ss = getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Tabel " + sheetName + " tidak ditemukan.");
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) throw new Error("Tabel kosong.");
  var headers = data[0];
  var idIndex = headers.indexOf(idColName);
  if (idIndex === -1) throw new Error("Kolom " + idColName + " tidak ditemukan.");
  
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][idIndex] == idValue) {
      rowIndex = i + 1;
      break;
    }
  }
  if (rowIndex === -1) throw new Error("Data tidak ditemukan.");
  
  var rowData = [];
  headers.forEach(function(header, i) {
    if (record[header] !== undefined) {
      rowData.push(record[header]);
    } else {
      rowData.push(data[rowIndex-1][i]);
    }
  });
  
  var updatedAtIndex = headers.indexOf('UpdatedAt');
  if (updatedAtIndex !== -1) rowData[updatedAtIndex] = new Date();
  
  sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  return { success: true, message: "Data berhasil diperbarui." };
}

function deleteTableRow(sheetName, idColName, idValue) {
  var ss = getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Tabel " + sheetName + " tidak ditemukan.");
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) throw new Error("Tabel kosong.");
  var idIndex = data[0].indexOf(idColName);
  
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][idIndex] == idValue) {
      rowIndex = i + 1;
      break;
    }
  }
  if (rowIndex === -1) throw new Error("Data tidak ditemukan.");
  sheet.deleteRow(rowIndex);
  return { success: true, message: "Data berhasil dihapus." };
}

function getSheetData(sheetName) {
  return getTableData(sheetName);
}
