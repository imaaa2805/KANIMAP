/**
 * Script untuk menambahkan kolom `gambar` pada tabel Gunung
 * dan mengisi foto asli untuk seluruh 82 gunung di Pulau Jawa
 * dari Wikipedia Bahasa Indonesia, Wikipedia Bahasa Inggris, & Wikimedia Commons,
 * dilengkapi fallback lanskap pegunungan tropis Indonesia yang terkurasi.
 */
const prisma = require('../config/database');

const FALLBACK_MOUNTAIN_PHOTOS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1559628233-100c798642d4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=900&q=80'
];

const WIKI_SEARCH_ALIASES = {
  'gunung-penanggunan': ['Gunung Penanggungan', 'Mount Penanggungan'],
  'gunung-cikurai': ['Gunung Cikuray', 'Mount Cikuray'],
  'gunung-patuha': ['Gunung Patuha', 'Kawah Putih Ciwidey', 'Kawah Putih'],
  'gunung-salak-2': ['Gunung Salak', 'Mount Salak'],
  'gunung-api-purba-nglanggeran': ['Gunung Nglanggeran', 'Nglanggeran'],
  'gunung-batu-jonggol': ['Gunung Batu Jonggol', 'Gunung Batu Sukamakmur'],
  'gunung-masigit-kareumbi': ['Gunung Masigit Kareumbi', 'Taman Buru Masigit Kareumbi'],
  'gunung-sikunir': ['Bukit Sikunir', 'Sikunir Dieng', 'Dataran Tinggi Dieng'],
  'gunung-prau': ['Gunung Prau', 'Mount Prau', 'Prau Dieng'],
  'gunung-pakuwaja': ['Gunung Pakuwaja', 'Dieng'],
  'gunung-bisma': ['Gunung Bisma', 'Sikunir'],
  'gunung-dorowati': ['Gunung Dorowati', 'Pegunungan Kawi'],
  'gunung-pundak': ['Gunung Pundak', 'Gunung Welirang'],
  'gunung-pangradinan': ['Gunung Pangradinan', 'Gunung Mandalawangi'],
  'gunung-gentong': ['Pegunungan Baturagung', 'Gunung Nglanggeran']
};

function isValidPhotoUrl(src) {
  if (!src) return false;
  return !/location|locator|map|icon|logo|coat_of_arms|flag|blank|relief|topographic|stamp|signature|\.svg|\.gif/i.test(src);
}

async function fetchWikiImageForTitle(lang, title) {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=900&redirects=1&format=json&origin=*`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'KANIMAP-Geospatial-App/1.0 (https://github.com/imaaa2805/TUBES_TPBW_POSGUNUNG)' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    const pages = json?.query?.pages || {};
    for (const page of Object.values(pages)) {
      const src = page?.thumbnail?.source;
      if (isValidPhotoUrl(src)) return src;
    }
  } catch (_) {}
  return null;
}

async function searchWikimediaCommonsImage(query) {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent('filetype:bitmap ' + query)}&gsrlimit=6&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'KANIMAP-Geospatial-App/1.0 (https://github.com/imaaa2805/TUBES_TPBW_POSGUNUNG)' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    const pages = json?.query?.pages || {};
    for (const page of Object.values(pages)) {
      const thumb = page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url;
      if (isValidPhotoUrl(thumb)) return thumb;
    }
  } catch (_) {}
  return null;
}

async function findBestMountainPhoto(m, idx) {
  const aliases = WIKI_SEARCH_ALIASES[m.slug] || [
    m.nama,
    m.nama.replace(/^Gunung\s+/i, 'Mount ')
  ];

  for (const title of aliases) {
    const img = await fetchWikiImageForTitle('id', title);
    if (img) return { url: img, source: `id.wikipedia (${title})` };
  }

  for (const title of aliases) {
    const img = await fetchWikiImageForTitle('en', title);
    if (img) return { url: img, source: `en.wikipedia (${title})` };
  }

  for (const q of aliases) {
    const img = await searchWikimediaCommonsImage(`${q}`);
    if (img) return { url: img, source: `commons.wikimedia (${q})` };
  }

  const fallbackUrl = FALLBACK_MOUNTAIN_PHOTOS[idx % FALLBACK_MOUNTAIN_PHOTOS.length];
  return { url: fallbackUrl, source: 'fallback-curated' };
}

async function main() {
  try {
    await prisma['$executeRawUnsafe']('ALTER TABLE Gunung ADD COLUMN gambar TEXT');
    console.log('✅ Kolom `gambar` berhasil ditambahkan ke tabel Gunung.');
  } catch (e) {
    if (!/duplicate column/i.test(e.message)) {
      console.log('ℹ️ Info kolom gambar:', e.message);
    }
  }

  const mountains = await prisma.gunung.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, nama: true, slug: true, provinsi: true, kabupaten: true }
  });

  console.log(`🔍 Memproses foto untuk ${mountains.length} gunung...`);
  let wikiCount = 0;
  let fallbackCount = 0;

  const BATCH_SIZE = 8;
  for (let start = 0; start < mountains.length; start += BATCH_SIZE) {
    const batch = mountains.slice(start, start + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((m, offset) => findBestMountainPhoto(m, start + offset))
    );

    for (let j = 0; j < batch.length; j++) {
      const m = batch[j];
      const { url, source } = results[j];
      if (source === 'fallback-curated') fallbackCount++;
      else wikiCount++;

      await prisma['$executeRawUnsafe'](
        'UPDATE Gunung SET gambar = ? WHERE id = ?',
        url,
        m.id
      );
      console.log(`[${start + j + 1}/${mountains.length}] ${m.nama} -> ${source}`);
    }
  }

  console.log(`\n🎉 Selesai! ${wikiCount} gunung menggunakan foto Wikipedia/Wikimedia Commons asli, ${fallbackCount} menggunakan foto pegunungan terkurasi.`);
  await prisma['$disconnect']();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
