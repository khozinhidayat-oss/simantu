function getJadwalData(userEmail) {
  try {
    var data = getTableData('Jadwal');
    if(userEmail) {
      var user = Session.getActiveUser().getEmail();
      var guruData = getTableData('User');
      var userObj = guruData.find(function(g) { return g.Username === user; });
      if(userObj && userObj.KodeGuru) {
        data = data.filter(function(d) { return d.KodeGuru === userObj.KodeGuru; });
      }
    }
    return { success: true, data: data };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function saveJadwal(payload) {
  try {
    
    var record = { ID: payload.id, Hari: payload.hari, JamMulai: payload.jamMulai, JamSelesai: payload.jamSelesai, KodeMapel: payload.mapel, KodeKelas: payload.kelas };
    if (payload.id) {
      return updateTableRow('Jadwal', 'ID', payload.id, record);
    } else {
      return insertTableRow('Jadwal', record);
    }

  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function deleteJadwal(id) {
  try {
    return deleteTableRow('Jadwal', 'ID', id);
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
