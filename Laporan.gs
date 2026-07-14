function getLaporanData(filter) {
  try {
    var siswaData = getTableData('Siswa');
    var mapelData = getTableData('Mapel');
    var nilaiData = getTableData('Nilai');
    var absensiData = getTableData('Absensi');
    var jadwalData = getTableData('Jadwal');
    
    var siswaFiltered = siswaData.filter(function(s) { return s.KodeKelas === filter.kelas; });
    var m = mapelData.find(function(m) { return m.KodeMapel === filter.mapel; });
    
    var kkm = m ? m.KKM : 75;
    
    // Total pertemuan
    var jadwalKelasMapel = jadwalData.filter(function(j) { return j.KodeKelas === filter.kelas && j.KodeMapel === filter.mapel; });
    var absensiFiltered = absensiData.filter(function(a) { 
        return jadwalKelasMapel.find(function(j) { return j.ID === a.KodeJadwal; });
    });
    
    var uniqueDates = {};
    absensiFiltered.forEach(function(a) { uniqueDates[a.Tanggal] = true; });
    var totalPertemuan = Object.keys(uniqueDates).length || 0;
    
    var data = siswaFiltered.map(function(s) {
      var nFiltered = nilaiData.filter(function(nl) { return nl.KodeSiswa === s.ID && nl.KodeMapel === filter.mapel; });
      var totalNilai = 0;
      nFiltered.forEach(function(nl) { totalNilai += parseFloat(nl.Nilai || 0); });
      var avgNilai = nFiltered.length > 0 ? (totalNilai / nFiltered.length).toFixed(1) : 0;
      
      var hadir=0, izin=0, sakit=0, alpha=0;
      var aFiltered = absensiFiltered.filter(function(a) { return a.KodeSiswa === s.ID; });
      aFiltered.forEach(function(a) {
        if(a.StatusKehadiran === 'H') hadir++;
        else if(a.StatusKehadiran === 'I') izin++;
        else if(a.StatusKehadiran === 'S') sakit++;
        else alpha++;
      });
      
      return {
        id: s.ID,
        nis: s.NIS,
        nama: s.NamaSiswa,
        hadir: hadir,
        izin: izin,
        sakit: sakit,
        alpha: alpha,
        nilai: avgNilai,
        status: avgNilai >= kkm ? 'Tuntas' : 'Belum Tuntas'
      };
    });
    
    var totalSemuaNilai = 0;
    data.forEach(function(d) { totalSemuaNilai += parseFloat(d.nilai); });
    
    var stats = {
      totalPertemuan: totalPertemuan,
      rataHadir: totalPertemuan > 0 ? ((data.reduce(function(acc, d) { return acc + d.hadir; }, 0) / (data.length * totalPertemuan)) * 100).toFixed(0) + '%' : '0%',
      rataNilai: data.length > 0 ? (totalSemuaNilai / data.length).toFixed(1) : 0
    };
        
    return { success: true, stats: stats, data: data };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
