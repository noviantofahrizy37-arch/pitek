const Fmt = (() => {
  function pad(n) { return n.toString().padStart(2, '0'); }

  function time(ts) {
    const d = new Date(ts);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function dateShort(ts) {
    const d = new Date(ts);
    const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${d.getDate()} ${bulan[d.getMonth()]}`;
  }

  function relative(ts) {
    const diffMs = Date.now() - ts;
    const min = Math.round(diffMs / 60000);
    if (min < 1) return 'baru saja';
    if (min < 60) return `${min} menit lalu`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr} jam lalu`;
    const day = Math.round(hr / 24);
    return `${day} hari lalu`;
  }

  function todayLabel() {
    const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const d = new Date();
    return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  }

  function num(n) { return new Intl.NumberFormat('id-ID').format(n); }

  return { time, dateShort, relative, todayLabel, num, pad };
})();
