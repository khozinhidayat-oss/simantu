function getSiswaForPenilaian(filter) {
  try {
    var siswaData = getTableData('Siswa');
    var mapelData = getTableData('Mapel');
    var nilaiData = getTableData('Nilai');
    
    var siswa = siswaData.filter(function(s) { return s.KodeKelas === filter.kelas; });
    var m = mapelData.find(function(m) { return m.KodeMapel === filter.mapel; });
    
    var data = siswa.map(function(s) {
      var n = nilaiData.find(function(nl) { 
        return nl.KodeSiswa === s.ID && nl.KodeMapel === filter.mapel && nl.JenisNilai === filter.jenisNilai; 
      });
      return {
        id: s.ID,
        nis: s.NIS,
        nama: s.NamaSiswa,
        nilai: n ? n.Nilai : null
      };
    });
    
    return { success: true, data: data, kkm: m ? m.KKM : 75 };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function savePenilaian(payload) {
  try {
    payload.data.forEach(function(d) {
      var record = {
        KodeSiswa: d.siswaId,
        KodeMapel: payload.mapel,
        JenisNilai: payload.jenisNilai,
        Nilai: d.nilai,
        Semester: 'Ganjil',
        TahunAjaran: '2023/2024'
      };
      
      var nilaiData = getTableData('Nilai');
      var existing = nilaiData.find(function(nl) { 
        return nl.KodeSiswa === d.siswaId && nl.KodeMapel === payload.mapel && nl.JenisNilai === payload.jenisNilai; 
      });
      
      if(existing) {
        updateTableRow('Nilai', 'ID', existing.ID, record);
      } else {
        insertTableRow('Nilai', record);
      }
    });
    return { success: true, message: "Data nilai berhasil disimpan!" };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
