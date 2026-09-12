const PageJadwal = (() => {
  let el, filter = 'semua';
  let _ICONS;
  function mount() { el = document.getElementById('page-jadwal'); Store.subscribe((section) => { if (section === 'jadwal') render(); }); }

  function render() {
    if (!el) return;
    const all = Store.get().jadwal;
    _ICONS = (typeof ICONS !== 'undefined' ? ICONS : (window.ICONS || {}));
    const list = filter === 'semua' ? all : all.filter((j) => j.type === filter);

    el.innerHTML = `
      <div class="page-head">
        <div class="page-title">Penjadwalan</div>
        <div class="page-subtitle">Jadwal pakan, lampu, dan lainnya</div>
      </div>

      <div class="chip-row">
        ${chip('semua', 'Semua')}${chip('pakan', 'Pakan')}${chip('lampu', 'Lampu')}${chip('lainnya', 'Lainnya')}
      </div>

      <div class="card">
        ${list.length ? list.map(row).join('') : empty()}
      </div>
    `;

    el.querySelectorAll('.chip').forEach((c) => (c.onclick = () => { filter = c.dataset.f; render(); }));
    el.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => openForm(all.find((j) => j.id === b.dataset.edit))));
    el.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => {
      KandangSocket.sendCommand('delete_jadwal', { id: b.dataset.del });
      Store.deleteJadwal(b.dataset.del);
      Toast.show('Jadwal dihapus', 'success');
    }));
    el.querySelectorAll('[data-toggle]').forEach((sw) => (sw.onchange = (e) => {
      const id = sw.dataset.toggle;
      KandangSocket.sendCommand('update_jadwal', { id, active: e.target.checked });
      Store.updateJadwal(id, { active: e.target.checked });
    }));
  }

  function chip(f, label) { return `<div class="chip ${filter === f ? 'active' : ''}" data-f="${f}">${label}</div>`; }

  function typeMeta(type) {
    const _ICONS = (typeof ICONS !== 'undefined' ? ICONS : (window.ICONS || {}));
    const map = {
      pakan: { icon: _ICONS.feed || '', bg: 'var(--feed-soft)', color: 'var(--feed)' },
      lampu: { icon: _ICONS.lamp || '', bg: 'var(--light-soft)', color: 'var(--light)' },
      lainnya: { icon: _ICONS.calendar || '', bg: 'var(--surface-alt)', color: 'var(--text-secondary)' },
    };
    return map[type] || map.lainnya;
  }

  function row(j) {
    const m = typeMeta(j.type);
    return `<div class="list-item">
      <div class="li-icon" style="background:${m.bg};color:${m.color}">${m.icon}</div>
      <div class="li-main"><div class="li-title">${j.label}</div><div class="li-sub">${j.time} · ${j.type}</div></div>
      <label class="switch" style="margin-right:6px"><input type="checkbox" data-toggle="${j.id}" ${j.active ? 'checked' : ''}><span class="track"></span></label>
      <button class="icon-btn" style="width:32px;height:32px" data-edit="${j.id}">${_ICONS.edit || ''}</button>
      <button class="icon-btn" style="width:32px;height:32px" data-del="${j.id}">${_ICONS.trash || ''}</button>
    </div>`;
  }
  function empty() { return `<div class="empty-state">${_ICONS.calendar || ''}<div class="es-title">Belum ada jadwal</div><div class="es-sub">Ketuk tombol + untuk menambah</div></div>`; }

  function openForm(existing) {
    const isEdit = !!existing;
    Modal.open(`
      <div class="modal-head"><h3>${isEdit ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3><button class="icon-btn" id="jd-close">${_ICONS.close || ''}</button></div>
      <div class="field">
        <label>Jenis</label>
        <select id="jd-type">
          <option value="pakan" ${existing && existing.type === 'pakan' ? 'selected' : ''}>Pakan</option>
          <option value="lampu" ${existing && existing.type === 'lampu' ? 'selected' : ''}>Lampu</option>
          <option value="lainnya" ${existing && existing.type === 'lainnya' ? 'selected' : ''}>Lainnya</option>
        </select>
      </div>
      <div class="field">
        <label>Label</label>
        <input type="text" id="jd-label" value="${existing ? existing.label : ''}" placeholder="Contoh: Pakan Pagi">
      </div>
      <div class="field">
        <label>Waktu</label>
        <input type="time" id="jd-time" value="${existing ? existing.time : '06:00'}">
      </div>
      <div class="field-hint" style="margin-bottom:14px">Jadwal ini akan disinkronkan ke ESP32 dan berjalan otomatis pada waktu yang ditentukan.</div>
      <button class="btn btn-primary w-full" id="jd-save">${isEdit ? 'Simpan Perubahan' : 'Tambah Jadwal'}</button>
    `);
    document.getElementById('jd-close').onclick = Modal.close;
    document.getElementById('jd-save').onclick = () => {
      const type = document.getElementById('jd-type').value;
      const label = document.getElementById('jd-label').value.trim() || 'Tanpa label';
      const time = document.getElementById('jd-time').value;
      if (isEdit) {
        KandangSocket.sendCommand('update_jadwal', { id: existing.id, type, label, time });
        Store.updateJadwal(existing.id, { type, label, time });
      } else {
        KandangSocket.sendCommand('add_jadwal', { jenis: type, waktu: time, label, active: true });
        Store.addJadwal({ type, label, time });
      }
      Modal.close();
      Toast.show('Jadwal tersimpan', 'success');
    };
  }

  return { mount, render, openForm };
})();
