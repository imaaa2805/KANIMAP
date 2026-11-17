

// ============================================================
// 🤖 AI REKOMENDASI GUNUNG — GRADE 1-5 (Pemula s/d Expert)
// ============================================================

let aiActiveGrade = 'all';
let aiRekomendasiData = null;      // cache response API
let aiFilteredData = [];           // data setelah filter

const AI_GRADE_RUBRIC = {
  all: {
    color: '#10b981',
    icon: 'psychology',
    title: 'Semua Level Grade 1–5',
    desc: 'Menampilkan seluruh gunung dari yang paling ramah pemula hingga ekspedisi ahli.',
    elevRange: 'Seluruh Ketinggian (367 – 3.676 mdpl)',
    durRange: 'Tektok Santai s/d Ekspedisi 5 Hari'
  },
  1: {
    color: '#10b981',
    icon: 'directions_walk',
    title: 'Grade 1 · Pemula Nol Pengalaman',
    desc: 'First-timer, wisata keluarga, pelajar. Jalur anak tangga wisata, bukit taman, jalur berpagar. Tidak memerlukan latihan khusus.',
    elevRange: '< 1.100 mdpl',
    durRange: '1 – 3 Jam PP (Tektok Santai)'
  },
  2: {
    color: '#06b6d4',
    icon: 'hiking',
    title: 'Grade 2 · Pemula Siap Camp',
    desc: 'Sudah yakin naik gunung, siap bermalam pertama kali. Jalur terkelola rapi, ada warung/pos, waktu tempuh moderat.',
    elevRange: '1.100 – 2.600 mdpl',
    durRange: '2 – 4.5 Jam Naik (Camp 2D1N)'
  },
  3: {
    color: '#3b82f6',
    icon: 'terrain',
    title: 'Grade 3 · Menengah',
    desc: 'Sudah pernah mendaki 2–3x. Siap menghadapi tanjakan panjang, akar pohon, sabana berangin, dan bermalam di suhu dingin.',
    elevRange: '2.500 – 3.250 mdpl',
    durRange: '5 – 8 Jam Naik (Camp 2D1N)'
  },
  4: {
    color: '#f97316',
    icon: 'landscape',
    title: 'Grade 4 · Mahir & Berpengalaman',
    desc: 'Pendaki mahir yang sering naik gunung tinggi. Siap menghadapi elevasi gain ekstrem, medan berbatu cadas, suhu beku.',
    elevRange: '> 3.000 mdpl atau medan sangat teknis',
    durRange: '7 – 12 Jam Naik (Camp 2D1N–3D2N)'
  },
  5: {
    color: '#ef4444',
    icon: 'filter_hdr',
    title: 'Grade 5 · Expert / Ekspedisi Ekstrem',
    desc: 'Mountaineer berpengalaman tinggi. Pemanjatan teknis, ekspedisi multi-hari, jalur berjurang vertikal, atau rute terpanjang Pulau Jawa.',
    elevRange: '> 3.300 mdpl / Jalur Teknis Ekstrem / Ekspedisi 3–5 Hari',
    durRange: '3 – 5 Hari atau Medan Pemanjatan Berbahaya'
  }
};

/** Buka modal AI Rekomendasi */
function openAiRekomendasiModal() {
  const modal = document.getElementById('ai-rekomendasi-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  // Render rubrik banner default
  renderAiRubricBanner(aiActiveGrade);
  // Load data jika belum ada
  if (!aiRekomendasiData) {
    fetchAiRekomendasi('all');
  } else {
    applyAiFilters();
  }
}

/** Tutup modal AI Rekomendasi */
function closeAiRekomendasiModal() {
  const modal = document.getElementById('ai-rekomendasi-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

/** Toggle Quiz Panel */
function toggleAiQuizPanel() {
  const panel = document.getElementById('ai-quiz-panel');
  if (!panel) return;
  panel.classList.toggle('hidden');
}

/** Hitung grade dari kuis dan terapkan filter */
function calculateAiQuizLevel() {
  const p = parseInt(document.getElementById('quiz-pengalaman')?.value || 1);
  const s = parseInt(document.getElementById('quiz-stamina')?.value || 1);
  const m = parseInt(document.getElementById('quiz-medan')?.value || 1);
  const avg = (p + s + m) / 3;
  let grade;
  if (avg <= 1.5) grade = 1;
  else if (avg <= 2.5) grade = 2;
  else if (avg <= 3.5) grade = 3;
  else if (avg <= 4.5) grade = 4;
  else grade = 5;

  // Close quiz, set filter, reload
  toggleAiQuizPanel();
  setAiGradeFilter(grade);
  showToast(`AI menilai Level Anda: Grade ${grade} — ${AI_GRADE_RUBRIC[grade].title}`, 'success');
}

/** Set grade filter pill aktif */
function setAiGradeFilter(grade) {
  aiActiveGrade = grade;
  // Update pill styling
  document.querySelectorAll('.ai-grade-pill').forEach(btn => {
    const bg = btn.getAttribute('data-grade') == grade
      ? getGradeActiveBg(grade)
      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high';
    // Reset classes
    btn.className = btn.className
      .replace(/bg-\S+\s?text-\S+\s?(hover:bg-\S+)?/g, '')
      .trim();
    btn.classList.add('ai-grade-pill', 'px-3', 'py-1.5', 'rounded-full', 'text-xs',
      'font-headline', 'font-bold', 'shrink-0', 'transition-all');
    if (btn.getAttribute('data-grade') == grade) {
      btn.classList.add(...getGradeActiveBg(grade).split(' '));
    } else {
      btn.classList.add('bg-surface-container', 'text-on-surface-variant', 'hover:bg-surface-container-high');
      if (btn.getAttribute('data-grade') !== 'all') btn.classList.add('flex', 'items-center', 'gap-1.5');
    }
  });

  renderAiRubricBanner(grade);
  fetchAiRekomendasi(grade);
}

function getGradeActiveBg(grade) {
  const map = {
    'all': 'bg-emerald-700 text-white',
    1: 'bg-emerald-600 text-white',
    2: 'bg-cyan-600 text-white',
    3: 'bg-blue-600 text-white',
    4: 'bg-amber-600 text-white',
    5: 'bg-red-600 text-white'
  };
  return map[grade] || 'bg-emerald-700 text-white';
}

/** Render Grade Rubric Banner */
function renderAiRubricBanner(grade) {
  const banner = document.getElementById('ai-rubric-banner');
  if (!banner) return;
  const rubric = AI_GRADE_RUBRIC[grade] || AI_GRADE_RUBRIC['all'];
  banner.innerHTML = `
    <div class="flex items-center gap-2 shrink-0">
      <span class="material-symbols-outlined text-[22px]" style="color:${rubric.color}">${rubric.icon}</span>
      <div>
        <span class="font-headline font-bold text-sm text-on-surface">${rubric.title}</span>
        <p class="text-on-surface-variant leading-relaxed mt-0.5 max-w-xl">${rubric.desc}</p>
      </div>
    </div>
    <div class="flex gap-4 sm:ml-auto shrink-0 text-[11px]">
      <div>
        <span class="font-headline font-bold text-on-surface-variant uppercase tracking-wide block">Elevasi</span>
        <span class="font-headline font-bold text-on-surface">${rubric.elevRange}</span>
      </div>
      <div>
        <span class="font-headline font-bold text-on-surface-variant uppercase tracking-wide block">Durasi</span>
        <span class="font-headline font-bold text-on-surface">${rubric.durRange}</span>
      </div>
    </div>
  `;
}

/** Fetch data AI dari API backend */
async function fetchAiRekomendasi(grade) {
  const grid = document.getElementById('ai-mountains-grid');
  const count = document.getElementById('ai-results-count');
  if (grid) grid.innerHTML = `<div class="col-span-3 flex items-center justify-center py-12 text-on-surface-variant text-xs gap-2"><span class="material-symbols-outlined animate-spin text-[20px] text-emerald-600">progress_activity</span><span>AI sedang memproses asesmen...</span></div>`;
  if (count) count.textContent = 'Memuat rekomendasi AI...';

  try {
    const prov = document.getElementById('ai-filter-prov')?.value || 'all';
    const durasi = document.getElementById('ai-filter-durasi')?.value || 'all';
    const search = document.getElementById('ai-search-input')?.value || '';

    let url = `/api/ai-rekomendasi?grade=${grade === 'all' ? 'all' : grade}&provinsi=${prov}&durasi=${durasi}`;
    if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    aiRekomendasiData = json;
    aiFilteredData = json.data || [];

    renderAiMountainCards(aiFilteredData, json);
  } catch (err) {
    console.error('Error fetchAiRekomendasi:', err);
    if (grid) grid.innerHTML = `<div class="col-span-3 flex flex-col items-center justify-center py-12 gap-3 text-on-surface-variant"><span class="material-symbols-outlined text-[36px] text-error">error</span><span class="text-xs font-semibold">Gagal memuat data. Pastikan server aktif.</span><span class="text-[11px]">${err.message}</span></div>`;
    if (count) count.textContent = 'Gagal memuat rekomendasi';
  }
}

/** Apply client-side filters (re-call API with filters) */
function applyAiFilters() {
  fetchAiRekomendasi(aiActiveGrade);
}

/** Render card gunung di grid */
function renderAiMountainCards(mountains, meta) {
  const grid = document.getElementById('ai-mountains-grid');
  const count = document.getElementById('ai-results-count');

  if (count) {
    count.textContent = `${mountains.length} Gunung Ditemukan${aiActiveGrade !== 'all' ? ` (Grade ${aiActiveGrade})` : ' (Semua Grade)'}`;
  }

  if (!mountains || mountains.length === 0) {
    grid.innerHTML = `<div class="col-span-3 flex flex-col items-center justify-center py-14 gap-3 text-on-surface-variant">
      <span class="material-symbols-outlined text-[42px]">search_off</span>
      <span class="font-headline font-bold text-sm">Tidak ada gunung yang sesuai filter</span>
      <span class="text-xs">Coba ubah filter grade, provinsi, atau kata kunci pencarian</span>
    </div>`;
    return;
  }

  grid.innerHTML = mountains.map(m => buildAiMountainCard(m)).join('');
}

function buildAiMountainCard(m) {
  const ai = m.aiAssessment;
  const img = m.gambar
    ? `<img src="${m.gambar}" alt="${m.nama}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.onerror=null;this.src='/images/kanimap-avatar.jpg'">`
    : `<div class="w-full h-full flex items-center justify-center bg-primary-container"><span class="material-symbols-outlined text-[40px] text-on-primary-container opacity-40">terrain</span></div>`;

  const statusColor = m.statusJalur === 'Buka'
    ? 'bg-emerald-500/90 text-white'
    : m.statusJalur === 'Waspada'
    ? 'bg-amber-500/90 text-white'
    : 'bg-red-600/90 text-white';

  const matchBarW = Math.min(100, Math.max(0, ai.matchScore));
  const matchColor = ai.grade <= 2 ? 'bg-emerald-500' : ai.grade === 3 ? 'bg-blue-500' : ai.grade === 4 ? 'bg-amber-500' : 'bg-red-500';

  const gradeDotColor = {1:'bg-emerald-500',2:'bg-cyan-500',3:'bg-blue-500',4:'bg-amber-500',5:'bg-red-500'}[ai.grade] || 'bg-primary';

  const bcInfo = m.basecampsCount > 0
    ? `${m.basecampsCount} Jalur/Basecamp`
    : 'Jalur data tersedia';

  return `
  <div class="ai-mountain-card group bg-surface-container-lowest rounded-2xl border border-surface-container overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer" onclick="onAiCardClick(${m.id})">
    <!-- Foto Gunung -->
    <div class="relative w-full h-40 overflow-hidden bg-surface-container shrink-0">
      ${img}
      <!-- Grade Badge -->
      <div class="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-headline font-black">
        <span class="w-2 h-2 rounded-full ${gradeDotColor} inline-block shrink-0"></span>
        ${ai.gradeBadge}
      </div>
      <!-- Status Jalur -->
      <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-headline font-bold ${statusColor}">
        ${m.statusJalur}
      </div>
      <!-- Ketinggian -->
      <div class="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/60 text-white backdrop-blur-sm text-[11px] font-mono font-bold flex items-center gap-0.5">
        <span class="material-symbols-outlined text-[13px] text-amber-300">filter_hdr</span>
        ${(m.ketinggian || 0).toLocaleString('id-ID')} mdpl
      </div>
      <!-- Match Score -->
      <div class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/60 text-white backdrop-blur-sm text-[11px] font-headline font-bold flex items-center gap-0.5">
        <span class="material-symbols-outlined text-[13px] text-emerald-400">verified</span>
        ${ai.matchScore}% match
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-3.5 flex flex-col gap-2.5 flex-1">
      <!-- Nama & Lokasi -->
      <div>
        <h4 class="font-headline font-bold text-sm text-on-surface leading-tight">${m.nama}</h4>
        <p class="text-[11px] text-on-surface-variant mt-0.5">${m.provinsi} · ${m.kabupaten || ''}</p>
      </div>

      <!-- AI Match Score Bar -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-wide">AI Match Score</span>
          <span class="text-[10px] font-mono font-bold" style="color:${ai.gradeColor}">${ai.matchScore}%</span>
        </div>
        <div class="w-full bg-surface-container rounded-full h-1.5">
          <div class="h-1.5 rounded-full ${matchColor} transition-all duration-500" style="width:${matchBarW}%"></div>
        </div>
      </div>

      <!-- AI Summary -->
      <p class="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">${ai.aiSummary}</p>

      <!-- Info Tags Row -->
      <div class="flex flex-wrap gap-1.5 text-[10px]">
        <span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-headline font-semibold flex items-center gap-0.5">
          <span class="material-symbols-outlined text-[11px]">schedule</span>
          ${ai.estimatedAscentHours}
        </span>
        <span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-headline font-semibold flex items-center gap-0.5">
          <span class="material-symbols-outlined text-[11px]">night_shelter</span>
          ${ai.recommendedDuration.split('(')[0].trim()}
        </span>
        <span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-headline font-semibold flex items-center gap-0.5">
          <span class="material-symbols-outlined text-[11px]">holiday_village</span>
          ${bcInfo}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 mt-auto pt-1 border-t border-surface-container">
        <button onclick="event.stopPropagation(); onAiCardClick(${m.id})" class="flex-1 py-1.5 rounded-xl text-[11px] font-headline font-bold flex items-center justify-center gap-1 transition-all" style="background:${ai.gradeColor}20; color:${ai.gradeColor}; border:1px solid ${ai.gradeColor}50">
          <span class="material-symbols-outlined text-[14px]">map</span>
          Lihat di Peta
        </button>
        <button onclick="event.stopPropagation(); showAiDetailModal(${m.id})" class="flex-1 py-1.5 rounded-xl text-[11px] font-headline font-bold flex items-center justify-center gap-1 bg-surface-container hover:bg-surface-container-high transition-all text-on-surface border border-surface-container">
          <span class="material-symbols-outlined text-[14px]">info</span>
          Detail AI
        </button>
      </div>
    </div>
  </div>`;
}

/** Klik card → tutup modal + pilih gunung di peta */
function onAiCardClick(mountainId) {
  closeAiRekomendasiModal();
  setTimeout(() => {
    selectMountain(mountainId, true);
    switchView('map');
  }, 150);
}

/** Tampilkan Detail AI untuk satu gunung (overlay di dalam modal) */
function showAiDetailModal(mountainId) {
  if (!aiRekomendasiData || !aiRekomendasiData.data) return;
  const m = aiRekomendasiData.data.find(x => x.id === mountainId);
  if (!m) return;
  const ai = m.aiAssessment;

  // Build a "detail overlay" over the grid
  const grid = document.getElementById('ai-mountains-grid');
  if (!grid) return;

  const gearArr = Array.isArray(ai.essentialGear)
    ? ai.essentialGear
    : (typeof ai.essentialGear === 'string' ? ai.essentialGear.split(', ') : [ai.essentialGear]);

  grid.innerHTML = `
  <div class="col-span-3">
    <button onclick="applyAiFilters()" class="mb-4 flex items-center gap-1 text-xs font-headline font-bold text-emerald-700 hover:underline">
      <span class="material-symbols-outlined text-[16px]">arrow_back</span>
      Kembali ke Daftar
    </button>
    <div class="bg-surface-container-lowest border border-surface-container rounded-2xl overflow-hidden">
      <!-- Detail Header -->
      <div class="p-4 sm:p-5 flex items-start gap-3 border-b border-surface-container" style="background:linear-gradient(135deg, ${ai.gradeColor}18, transparent)">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2" style="background:${ai.gradeColor}20;border-color:${ai.gradeColor}60">
          <span class="material-symbols-outlined text-[24px]" style="color:${ai.gradeColor}">terrain</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="font-headline font-bold text-base sm:text-lg text-on-surface">${m.nama}</h3>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-headline font-black text-white" style="background:${ai.gradeColor}">${ai.gradeBadge}</span>
          </div>
          <p class="text-xs text-on-surface-variant mt-0.5">${m.provinsi} · ${m.kabupaten || ''} · ${(m.ketinggian||0).toLocaleString('id-ID')} mdpl</p>
          <p class="text-xs text-on-surface mt-1 leading-relaxed">${ai.aiSummary}</p>
        </div>
        <div class="shrink-0 text-right">
          <span class="font-mono font-black text-2xl" style="color:${ai.gradeColor}">${ai.matchScore}%</span>
          <p class="text-[10px] text-on-surface-variant font-semibold">AI Match</p>
        </div>
      </div>

      <!-- Detail Sections -->
      <div class="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">

        <!-- Karakteristik Jalur -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="material-symbols-outlined text-[16px]" style="color:${ai.gradeColor}">alt_route</span>
            <span class="font-headline font-bold text-sm text-on-surface">Karakteristik Jalur</span>
          </div>
          <p class="text-on-surface-variant leading-relaxed">${ai.trailCharacteristics}</p>
        </div>

        <!-- Estimasi Waktu -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="material-symbols-outlined text-[16px]" style="color:${ai.gradeColor}">schedule</span>
            <span class="font-headline font-bold text-sm text-on-surface">Estimasi Pendakian</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="text-on-surface-variant">Waktu Naik</span>
              <span class="font-headline font-bold text-on-surface">${ai.estimatedAscentHours}</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="text-on-surface-variant">Rekomendasi Durasi</span>
              <span class="font-headline font-bold text-on-surface">${ai.recommendedDuration}</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface-container">
              <span class="text-on-surface-variant">Elevasi Gain</span>
              <span class="font-headline font-bold text-on-surface">±${(m.elevGain||0).toLocaleString('id-ID')} m</span>
            </div>
          </div>
        </div>

        <!-- Persiapan Fisik -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="material-symbols-outlined text-[16px]" style="color:${ai.gradeColor}">fitness_center</span>
            <span class="font-headline font-bold text-sm text-on-surface">Persiapan Fisik</span>
          </div>
          <p class="text-on-surface-variant leading-relaxed">${ai.physicalPreparation}</p>
        </div>

        <!-- Perlengkapan Wajib -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="material-symbols-outlined text-[16px]" style="color:${ai.gradeColor}">backpack</span>
            <span class="font-headline font-bold text-sm text-on-surface">Perlengkapan Wajib</span>
          </div>
          <ul class="flex flex-col gap-0.5">
            ${gearArr.map(g => `<li class="flex items-start gap-1.5 text-on-surface-variant"><span class="material-symbols-outlined text-[13px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>${g.trim()}</li>`).join('')}
          </ul>
        </div>

        <!-- Safety Advisory -->
        <div class="md:col-span-2 p-3 rounded-xl border flex items-start gap-2" style="background:${ai.gradeColor}10;border-color:${ai.gradeColor}30">
          <span class="material-symbols-outlined text-[20px] shrink-0 mt-0.5" style="color:${ai.gradeColor}">health_and_safety</span>
          <div>
            <span class="font-headline font-bold text-sm text-on-surface block mb-0.5">Peringatan Keselamatan</span>
            <p class="text-on-surface-variant leading-relaxed">${ai.safetyAdvice}</p>
          </div>
        </div>

        <!-- Basecamp tersedia -->
        ${m.basecamps && m.basecamps.length > 0 ? `
        <div class="md:col-span-2">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="material-symbols-outlined text-[16px]" style="color:${ai.gradeColor}">holiday_village</span>
            <span class="font-headline font-bold text-sm text-on-surface">Basecamp & Jalur (${m.basecamps.length} jalur)</span>
          </div>
          <div class="flex flex-wrap gap-2">
            ${m.basecamps.map(bc => `
            <span class="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface font-headline font-semibold text-[11px] flex items-center gap-1 border border-surface-container">
              <span class="material-symbols-outlined text-[13px] text-primary">signpost</span>
              Via ${bc.jalurVia} · ${bc.status}
            </span>`).join('')}
          </div>
        </div>` : ''}

      </div>

      <!-- Action Bar -->
      <div class="p-4 border-t border-surface-container flex flex-wrap gap-2">
        <button onclick="onAiCardClick(${m.id})" class="px-4 py-2 rounded-xl text-white text-xs font-headline font-bold flex items-center gap-1.5 shadow-sm active:scale-95" style="background:${ai.gradeColor}">
          <span class="material-symbols-outlined text-[15px]">map</span>
          Lihat di Peta Interaktif
        </button>
        <button onclick="onAiCardClick(${m.id}); setTimeout(()=>openTripPlannerModal(${m.id}),400)" class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-headline font-bold flex items-center gap-1.5 active:scale-95">
          <span class="material-symbols-outlined text-[15px]">schedule</span>
          Buka Trip Planner
        </button>
        <button onclick="applyAiFilters()" class="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-headline font-bold hover:bg-surface-container-high">
          Kembali
        </button>
      </div>
    </div>
  </div>`;
}
