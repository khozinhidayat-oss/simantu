function getModulData(userEmail) {
  try {
    var data = getTableData('ModulAjar');
    return { success: true, data: data };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function saveModul(payload) {
  try {
    
    var record = { ID: payload.id, KodeMapel: payload.kode, JudulModul: payload.nama, Materi: payload.materi, Status: payload.status, LinkFile: payload.lampiran };
    if (payload.id) {
      return updateTableRow('ModulAjar', 'ID', payload.id, record);
    } else {
      return insertTableRow('ModulAjar', record);
    }

  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function deleteModul(id) {
  try {
    return deleteTableRow('ModulAjar', 'ID', id);
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
