const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Add AI nav button after Trip Planner button
const plannerClose = `          <span>Trip Planner</span>
        </button>
      </nav>`;

const aiNavBtn = `          <span>Trip Planner</span>
        </button>
        <button id="nav-btn-ai" onclick="openAiRekomendasiModal()" class="nav-tab px-3.5 lg:px-4 py-2 text-xs font-headline font-bold rounded-lg text-emerald-700 hover:text-white hover:bg-emerald-700 bg-emerald-500/10 border border-emerald-600/30 transition-all flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95" title="AI Rekomendasi Gunung (Grade 1-5)">
          <span class="material-symbols-outlined text-[18px] text-emerald-600">psychology</span>
          <span>AI Rekomendasi</span>
        </button>
      </nav>`;

if (!html.includes('nav-btn-ai')) {
  html = html.replace(plannerClose, aiNavBtn);
  console.log('✅ Nav button added');
} else {
  console.log('⏭️ Nav button already exists');
}

// 2. Build modal HTML
const modalHtml = `  <!-- ==================== MODAL: AI REKOMENDASI GUNUNG (GRADE 1-5) ==================== -->
  <div id="ai-rekomendasi-modal" class="fixed inset-0 z-[9998] hidden bg-inverse-surface/65 backdrop-blur-md flex items-center justify-center p-2 sm:p-4" onclick="if(event.target===this)closeAiRekomendasiModal()">
    <div class="bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container w-full max-w-5xl overflow-hidden flex flex-col max-h-[94vh]" onclick="event.stopPropagation()">

      <!-- HEADER -->
      <div class="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 text-white flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
            <span class="material-symbols-outlined text-[26px]">psychology</span>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-headline font-bold text-lg sm:text-xl text-white">AI Rekomendasi Gunung</h3>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-headline text-[10px] font-black uppercase">Grade 1–5 · Pemula s/d Expert</span>
            </div>
            <p class="text-xs text-white/85 mt-0.5">Asesmen cerdas kecocokan gunung berdasarkan elevasi gain, medan, dan risiko pendakian.</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="toggleAiQuizPanel()" class="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-headline font-bold border border-white/20">
            <span class="material-symbols-outlined text-[15px]">quiz</span>
            <span>Cek Level Saya</span>
          </button>
          <button onclick="closeAiRekomendasiModal()" class="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10">
            <span class="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
      </div>

      <!-- QUIZ PANEL (Collapsible) -->
      <div id="ai-quiz-panel" class="hidden bg-emerald-50 border-b border-emerald-200 p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-emerald-800">smart_toy</span>
            <h4 class="font-headline font-bold text-sm text-emerald-900">AI Level Matcher — Temukan Grade Pendakian Anda</h4>
          </div>
          <button onclick="toggleAiQuizPanel()" class="text-xs text-emerald-700 hover:underline">Tutup</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div class="bg-white p-3 rounded-xl border border-emerald-100">
            <label class="font-headline font-bold text-emerald-900 block mb-1.5">1. Pengalaman naik gunung?</label>
            <select id="quiz-pengalaman" class="w-full text-xs p-2 rounded-lg border border-emerald-200 bg-surface-container focus:outline-none">
              <option value="1">Belum pernah sama sekali</option>
              <option value="2">Pernah 1–2 kali (Prau, Papandayan)</option>
              <option value="3">3–6 kali gunung tinggi (Gede, Merbabu, Lawu)</option>
              <option value="4">Sering, sudah ke Slamet/Sumbing/Ciremai</option>
              <option value="5">Expert: Raung, Semeru, Argopuro, ekspedisi</option>
            </select>
          </div>
          <div class="bg-white p-3 rounded-xl border border-emerald-100">
            <label class="font-headline font-bold text-emerald-900 block mb-1.5">2. Daya tahan menanjak?</label>
            <select id="quiz-stamina" class="w-full text-xs p-2 rounded-lg border border-emerald-200 bg-surface-container focus:outline-none">
              <option value="1">1–2 jam santai, banyak istirahat</option>
              <option value="2">3–4 jam, carrier ringan</option>
              <option value="3">5–8 jam tanjakan terjal, carrier 10–15 kg</option>
              <option value="4">8–12 jam medan berbatu & suhu beku</option>
              <option value="5">Multi-hari / teknis tebing pemanjatan</option>
            </select>
          </div>
          <div class="bg-white p-3 rounded-xl border border-emerald-100">
            <label class="font-headline font-bold text-emerald-900 block mb-1.5">3. Kesiapan menghadapi medan?</label>
            <select id="quiz-medan" class="w-full text-xs p-2 rounded-lg border border-emerald-200 bg-surface-container focus:outline-none">
              <option value="1">Tangga wisata aman, jalur berpagar</option>
              <option value="2">Jalur tanah berpetunjuk, ada warung</option>
              <option value="3">Tanjakan akar, sabana, angin kencang</option>
              <option value="4">Batuan lepas, kawah belerang, suhu ekstrem</option>
              <option value="5">Punggungan berjurang / scramble tebing</option>
            </select>
          </div>
        </div>
        <div class="mt-3 flex justify-end">
          <button onclick="calculateAiQuizLevel()" class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-headline text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95">
            <span class="material-symbols-outlined text-[15px]">auto_awesome</span>
            Terapkan Grade Rekomendasi
          </button>
        </div>
      </div>

      <!-- FILTER BAR -->
      <div class="p-3.5 sm:p-4 bg-surface-container-low border-b border-surface-container flex flex-col gap-3 shrink-0">
        <!-- Grade Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button onclick="setAiGradeFilter('all')" data-grade="all" class="ai-grade-pill px-3 py-1.5 rounded-full text-xs font-headline font-bold bg-emerald-700 text-white shrink-0">Semua</button>
          <button onclick="setAiGradeFilter(1)" data-grade="1" class="ai-grade-pill px-3 py-1.5 rounded-full text-xs font-headline font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>Grade 1 · Pemula Nol</button>
          <button onclick="setAiGradeFilter(2)" data-grade="2" class="ai-grade-pill px-3 py-1.5 rounded-full text-xs font-headline font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block shrink-0"></span>Grade 2 · Pemula Camp</button>
          <button onclick="setAiGradeFilter(3)" data-grade="3" class="ai-grade-pill px-3 py-1.5 rounded-full text-xs font-headline font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shrink-0"></span>Grade 3 · Menengah</button>
          <button onclick="setAiGradeFilter(4)" data-grade="4" class="ai-grade-pill px-3 py-1.5 rounded-full text-xs font-headline font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0"></span>Grade 4 · Mahir</button>
          <button onclick="setAiGradeFilter(5)" data-grade="5" class="ai-grade-pill px-3 py-1.5 rounded-full text-xs font-headline font-bold bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shrink-0"></span>Grade 5 · Expert</button>
        </div>
        <!-- Filters Row 2 -->
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
          <div class="sm:col-span-3">
            <select id="ai-filter-prov" onchange="applyAiFilters()" class="w-full bg-surface-container-lowest text-on-surface font-headline font-semibold text-xs px-3 py-2 rounded-xl border border-surface-container focus:outline-none focus:border-emerald-600">
              <option value="all">📍 Semua Wilayah</option>
              <option value="jabar">Jawa Barat</option>
              <option value="jateng">Jawa Tengah</option>
              <option value="diy">D.I. Yogyakarta</option>
              <option value="jatim">Jawa Timur</option>
            </select>
          </div>
          <div class="sm:col-span-3">
            <select id="ai-filter-durasi" onchange="applyAiFilters()" class="w-full bg-surface-container-lowest text-on-surface font-headline font-semibold text-xs px-3 py-2 rounded-xl border border-surface-container focus:outline-none focus:border-emerald-600">
              <option value="all">⏱️ Semua Durasi</option>
              <option value="tektok">Tektok (Half-day)</option>
              <option value="camp">Camp (2D1N)</option>
              <option value="ekspedisi">Ekspedisi (3–5 Hari)</option>
            </select>
          </div>
          <div class="sm:col-span-6 relative">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">search</span>
            <input type="text" id="ai-search-input" oninput="applyAiFilters()" placeholder="Cari nama gunung (Prau, Gede, Raung...)" class="w-full pl-8 pr-3 py-2 rounded-xl bg-surface-container-lowest text-on-surface text-xs border border-surface-container focus:outline-none focus:border-emerald-600 placeholder:text-outline">
          </div>
        </div>
      </div>

      <!-- GRADE RUBRIC BANNER -->
      <div id="ai-rubric-banner" class="shrink-0 px-4 sm:px-5 py-3 bg-surface-container-low border-b border-surface-container text-xs flex flex-col sm:flex-row sm:items-center gap-2">
        <!-- Injected via JS -->
      </div>

      <!-- RESULTS GRID -->
      <div class="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4 bg-surface">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-700 text-[18px]">verified</span>
            <span id="ai-results-count" class="font-headline font-bold text-xs text-on-surface">Memuat rekomendasi AI...</span>
          </div>
          <span class="text-[11px] text-on-surface-variant">Urutan: AI match score tertinggi</span>
        </div>
        <div id="ai-mountains-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Cards injected via JS -->
          <div class="col-span-3 flex items-center justify-center py-12 text-on-surface-variant text-xs gap-2">
            <span class="material-symbols-outlined animate-spin text-[20px] text-emerald-600">progress_activity</span>
            <span>Memproses asesmen AI...</span>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="p-3.5 sm:p-4 bg-surface-container-low border-t border-surface-container flex items-center justify-between gap-2 flex-wrap shrink-0">
        <div class="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <span class="material-symbols-outlined text-[15px] text-emerald-600">info</span>
          <span class="hidden sm:inline">Pilih gunung sesuai kesiapan fisik &amp; perlengkapan demi keselamatan di alam bebas.</span>
          <span class="sm:hidden">Pilih gunung sesuai kemampuan &amp; perlengkapan Anda.</span>
        </div>
        <button onclick="closeAiRekomendasiModal()" class="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-headline text-xs font-bold">Tutup</button>
      </div>

    </div>
  </div>

`;

// 3. Insert modal before Toast container
const toastAnchor = '  <!-- Toast Notification Container -->';
if (!html.includes('id="ai-rekomendasi-modal"')) {
  html = html.replace(toastAnchor, modalHtml + toastAnchor);
  console.log('✅ Modal inserted');
} else {
  console.log('⏭️ Modal already exists');
}

fs.writeFileSync(htmlPath, html);
console.log('✅ index.html saved. Lines:', html.split('\n').length);
