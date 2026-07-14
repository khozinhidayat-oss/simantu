function getJadwalHariIniForAbsensi(userEmail) {
  try {
    var jadwal = getTableData('Jadwal');
    var kelas = getTableData('Kelas');
    var mapel = getTableData('Mapel');
    
    // Map data
    var mapped = jadwal.map(function(j) {
      var k = kelas.find(function(c) { return c.KodeKelas === j.KodeKelas; });
      var m = mapel.find(function(m) { return m.KodeMapel === j.KodeMapel; });
      return {
        id: j.ID,
        mapel: m ? m.NamaMapel : j.KodeMapel,
        kelas: k ? k.NamaKelas : j.KodeKelas,
        jam: j.JamMulai + ' - ' + j.JamSelesai,
        semester: 'Ganjil' 
      };
    });
    
    return { success: true, data: mapped };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function getSiswaForAbsensi(jadwalId) {
  try {
    var jadwal = getTableData('Jadwal').find(function(j) { return j.ID === jadwalId; });
    if(!jadwal) throw new Error("Jadwal tidak ditemukan.");
    
    var siswa = getTableData('Siswa').filter(function(s) { return s.KodeKelas === jadwal.KodeKelas; });
    var mapped = siswa.map(function(s) {
      return {
        id: s.ID,
        nis: s.NIS,
        nama: s.NamaSiswa,
        jk: s.JenisKelamin
      };
    });
    
    return { success: true, data: mapped };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function saveAbsensiData(payload) {
  try {
    // payload: { tanggal, jadwalId, data: [{siswaId, status, keterangan}] }
    payload.data.forEach(function(d) {
      var record = {
        Tanggal: payload.tanggal,
        KodeJadwal: payload.jadwalId,
        KodeSiswa: d.siswaId,
        StatusKehadiran: d.status,
        Keterangan: d.keterangan || ''
      };
      insertTableRow('Absensi', record);
    });
    return { success: true, message: "Data absensi berhasil disimpan!" };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
