function getDashboardStats(userEmail) {
  try {
    var guru = getTableData('Guru');
    var siswa = getTableData('Siswa');
    var kelas = getTableData('Kelas');
    var mapel = getTableData('Mapel');
    var jurnal = getTableData('Jurnal');
    var absensi = getTableData('Absensi');
    var jadwal = getTableData('Jadwal');
    
    var pengumumanData = getTableData('Pengaturan').filter(function(p) { return p.Kunci.indexOf('Pengumuman_') === 0; });
    var pArr = pengumumanData.map(function(p) { return { judul: p.Kunci.replace('Pengumuman_', ''), isi: p.Nilai, type: 'info' }; });
    if(pArr.length === 0) {
      pArr = [
        { judul: 'Selamat Datang', isi: 'Selamat datang di Sistem Mengajar Guru.', type: 'success' }
      ];
    }
    
    return {
      success: true,
      data: {
        jmlKelas: kelas.length,
        jmlSiswa: siswa.length,
        jmlMapel: mapel.length,
        jmlJurnal: jurnal.length,
        jmlAbsen: absensi.length,
        jadwalHariIni: jadwal.slice(0, 5), // simplified
        pengumuman: pArr
      }
    };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}
}
