function getGuruData() {
  try {
    var data = getTableData('Guru');
    return { success: true, data: data };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function saveGuru(payload) {
  try {
    
    var record = { ID: payload.id, KodeGuru: payload.kode || ('G'+Math.floor(Math.random()*1000)), NamaGuru: payload.nama, NIP: payload.nip, NoHP: payload.nohp, Email: payload.email, Status: payload.status, JenisKelamin: payload.jk };
    if (payload.id) {
      return updateTableRow('Guru', 'ID', payload.id, record);
    } else {
      return insertTableRow('Guru', record);
    }

  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function deleteGuru(id) {
  try {
    return deleteTableRow('Guru', 'ID', id);
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
