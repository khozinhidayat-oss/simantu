function getMapelData() {
  try {
    var data = getTableData('Mapel');
    return { success: true, data: data };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function saveMapel(payload) {
  try {
    
    var record = { ID: payload.id, KodeMapel: payload.kode || payload.nama, NamaMapel: payload.nama, KKM: payload.kkm, Tingkat: payload.tingkat };
    if (payload.id) {
      return updateTableRow('Mapel', 'ID', payload.id, record);
    } else {
      return insertTableRow('Mapel', record);
    }

  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function deleteMapel(id) {
  try {
    return deleteTableRow('Mapel', 'ID', id);
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
