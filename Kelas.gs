function getKelasData() {
  try {
    var data = getTableData('Kelas');
    return { success: true, data: data };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function saveKelas(payload) {
  try {
    
    var record = { ID: payload.id, KodeKelas: payload.kode || payload.nama, NamaKelas: payload.nama, WaliKelas: payload.wali, Kapasitas: payload.kapasitas };
    if (payload.id) {
      return updateTableRow('Kelas', 'ID', payload.id, record);
    } else {
      return insertTableRow('Kelas', record);
    }

  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function deleteKelas(id) {
  try {
    return deleteTableRow('Kelas', 'ID', id);
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
