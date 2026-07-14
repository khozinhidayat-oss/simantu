function getSiswaData(kelasId) {
  try {
    // Pada implementasi asli, ambil dari Spreadsheet 'Siswa' dan filter berdasarkan kelas yang diajar
    var data = [
      { id: 'S01', nis: '2023001', nisn: '0051234567', nama: 'Adi Putra', jk: 'L', kelas: 'X IPA 1', status: 'Aktif' },
      { id: 'S02', nis: '2023002', nisn: '0051234568', nama: 'Budi Santoso', jk: 'L', kelas: 'X IPA 1', status: 'Aktif' },
      { id: 'S03', nis: '2023003', nisn: '0051234569', nama: 'Citra Lestari', jk: 'P', kelas: 'X IPA 2', status: 'Aktif' },
      { id: 'S04', nis: '2023004', nisn: '0051234570', nama: 'Dewi Ayu', jk: 'P', kelas: 'X IPA 2', status: 'Aktif' }
    ];
    return { success: true, data: data };
  } catch(e) {
    return { success: false, message: e.toString() };
  }

function saveSiswa(payload) {
  try {
    
    var record = { ID: payload.id, NIS: payload.nis, NISN: payload.nisn, NamaSiswa: payload.nama, JenisKelamin: payload.jk, KodeKelas: payload.kelas, Status: payload.status };
    if (payload.id) {
      return updateTableRow('Siswa', 'ID', payload.id, record);
    } else {
      return insertTableRow('Siswa', record);
    }

  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function deleteSiswa(id) {
  try {
    return deleteTableRow('Siswa', 'ID', id);
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
