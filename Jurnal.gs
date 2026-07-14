function getJurnalData(userEmail) {
  try {
    var data = getTableData('Jurnal');
    return { success: true, data: data };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function saveJurnal(payload) {
  try {
    
    var record = { ID: payload.id, Tanggal: payload.tanggal, KodeJadwal: payload.jadwalId, MateriPokok: payload.materi, Kegiatan: payload.aktivitas, Catatan: payload.kendala };
    if (payload.id) {
      return updateTableRow('Jurnal', 'ID', payload.id, record);
    } else {
      return insertTableRow('Jurnal', record);
    }

  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function deleteJurnal(id) {
  try {
    return deleteTableRow('Jurnal', 'ID', id);
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
