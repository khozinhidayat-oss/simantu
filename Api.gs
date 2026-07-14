function doPost(e) {
  try {
    var payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = {};
    }

    var method = payload.method;
    var args = payload.args || [];
    
    // Whitelist functions that can be called from frontend to avoid executing arbitrary functions
    var allowedMethods = [
      'loginWithGoogle', 'getGoogleAccountEmail', 'logout',
      'getDashboardData',
      'getTableData', 'insertData', 'updateData', 'deleteData',
      'getDashboardStats',
      'importSpreadsheet', 'validateDatabase', 'createNewDb', 'getSystemInfo',
      // Any other methods called by google.script.run
    ];

    if (allowedMethods.indexOf(method) > -1 || typeof this[method] === 'function') {
      var result;
      // If method exists
      if(typeof this[method] === 'function') {
         result = this[method].apply(this, args);
      } else {
         throw new Error("Method not found: " + method);
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      throw new Error("Method not allowed or not found: " + method);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message, stack: err.stack }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "API is running", environment: "Google Apps Script" }))
    .setMimeType(ContentService.MimeType.JSON);
}
