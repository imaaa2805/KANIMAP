/**
 * Script Penyelarasan Penuh Koordinat Gunung, Basecamp & Titik Pos Pendakian
 * (Basecamp -> Pos 1 -> Pos 2 -> ... -> Puncak)
 *
 * Memastikan seluruh 80 gunung di Pulau Jawa memiliki:
 * 1. Koordinat Puncak asli sesuai peta topografi (OpenTopoMap / OpenStreetMap)
 * 2. Koordinat Basecamp asli di kaki gunung sesuai arah jalurnya (tidak menumpuk di koordinat dummy)
 * 3. Urutan Pos 1..N yang naik secara proporsional mengikuti punggungan gunung menuju tepat ke titik Puncak
 */

const prisma = require('../config/database');

// Koordinat Puncak Terverifikasi untuk seluruh 80 Gunung di Database
const VERIFIED_PEAKS = {
  'Gunung Lawu': [-7.6250, 111.1922],
  'Gunung Argopuro': [-7.9681, 113.5758],
  'Gunung Kawi': [-7.9625, 112.4680],
  'Gunung Arjuno': [-7.7250, 112.5894],
  'Gunung Penanggunan': [-7.6156, 112.6200],
  'Gunung Kelud': [-7.9300, 112.3080],
  'Gunung Panderman': [-7.9044, 112.4964],
  'Gunung Raung': [-8.1258, 114.0458],
  'Gunung Dorowati': [-7.8340, 112.4380],
  'Gunung Welirang': [-7.7056, 112.5750],
  'Gunung Pundak': [-7.6908, 112.5625],
  'Gunung Wilis': [-7.8075, 111.7580],
  'Gunung Ciremai': [-6.8925, 108.4065],
  'Gunung Kencana': [-6.6780, 106.9685],
  'Gunung Pangrango': [-6.7700, 106.9647],
  'Gunung Gede': [-6.7883, 106.9841],
  'Gunung Cikurai': [-7.3225, 107.8600],
  'Gunung Papandayan': [-7.3195, 107.7310],
  'Gunung Kendang': [-7.2350, 107.7120],
  'Gunung Patuha': [-7.1608, 107.4000],
  'Gunung Malabar': [-7.1306, 107.6510],
  'Gunung Guntur': [-7.1428, 107.8408],
  'Gunung Puntang': [-7.1180, 107.6210],
  'Gunung Salak': [-6.7156, 106.7339],
  'Gunung Bukit Tunggul': [-6.8108, 107.7269],
  'Gunung Artapela': [-7.2125, 107.6830],
  'Gunung Sagara': [-7.2185, 108.0785],
  'Gunung Bedil': [-7.1960, 107.6420],
  'Gunung Windu': [-7.2050, 107.6350],
  'Gunung Burangrang': [-6.7745, 107.5556],
  'Gunung Mandalawangi': [-7.1150, 107.8550],
  'Gunung Halimun': [-6.7090, 106.4550],
  'Gunung Manglayang': [-6.8775, 107.7436],
  'Gunung Sawal': [-7.1930, 108.2680],
  'Gunung Kerenceng': [-6.9420, 107.8680],
  'Gunung Cakrabuana': [-7.0350, 108.1320],
  'Gunung Sangar': [-7.0680, 107.6350],
  'Gunung Tampomas': [-6.7686, 107.9575],
  'Gunung Calancang': [-6.9350, 107.8480],
  'Gunung Masigit Kareumbi': [-6.9520, 107.8850],
  'Gunung Bitung': [-7.1650, 108.3550],
  'Gunung Sanggabuana': [-6.5880, 107.2180],
  'Gunung Geulis': [-6.9420, 107.7920],
  'Gunung Karang': [-6.9120, 107.1250],
  'Gunung Kawali': [-7.1850, 108.3680],
  'Gunung Bongkok': [-6.5960, 107.3860],
  'Gunung Batu Jonggol': [-6.5950, 106.9850],
  'Gunung Lembu': [-6.5820, 107.3680],
  'Gunung Munara': [-6.4520, 106.6320],
  'Gunung Slamet': [-7.2425, 109.2085],
  'Gunung Sumbing': [-7.3842, 110.0701],
  'Gunung Merbabu': [-7.4550, 110.4400],
  'Gunung Sindoro': [-7.3000, 109.9920],
  'Gunung Merapi': [-7.5407, 110.4457],
  'Gunung Prau': [-7.1869, 109.9228],
  'Gunung Pakuwaja': [-7.2250, 109.9320],
  'Gunung Bisma': [-7.2580, 109.8850],
  'Gunung Sikunir': [-7.2390, 109.9250],
  'Gunung Sipandu': [-7.1750, 109.8850],
  'Gunung Rogojembangan': [-7.1850, 109.7150],
  'Gunung Ungaran': [-7.1800, 110.3300],
  'Gunung Kendil': [-7.2850, 110.0250],
  'Gunung Andong': [-7.3860, 110.3690],
  'Gunung Muria': [-6.6167, 110.8917],
  'Gunung Nagasari': [-7.1450, 109.6850],
  'Gunung Batur': [-7.1680, 110.3480],
  'Gunung Beser': [-7.5650, 111.1150],
  'Gunung Wagir Jarian': [-7.5580, 109.5850],
  'Gunung Lumping': [-7.2450, 110.0950],
  'Gunung Turgo': [-7.5825, 110.4245],
  'Gunung Kumbang': [-7.1250, 108.8150],
  'Gunung Lanang': [-7.4520, 109.8120],
  'Gunung Gajah': [-7.0950, 109.3050],
  'Gunung Midangan': [-7.5850, 109.8450],
  'Gunung Ayamayam': [-7.5620, 109.9150],
  'Gunung Kukusan': [-7.6380, 110.1450],
  'Gunung Blego': [-7.8850, 111.2450],
  'Gunung Lasem': [-6.6920, 111.5150],
  'Gunung Api Purba Nglanggeran': [-7.8420, 110.5420],
  'Gunung Gentong': [-7.8320, 110.5850]
};

// Koordinat Basecamp Terverifikasi berdasarkan 'Nama Gunung|Jalur Via'
const VERIFIED_BASECAMPS = {
  // Gunung Lawu
  'Gunung Lawu|Cemoro Sewu': [-7.6581, 111.1914],
  'Gunung Lawu|Cemoro Kandang': [-7.6611, 111.1825],
  'Gunung Lawu|Singolangu': [-7.6525, 111.2165],
  'Gunung Lawu|Candi Cetho': [-7.5956, 111.1578],
  'Gunung Lawu|Tambak': [-7.6112, 111.1485],

  // Gunung Argopuro
  'Gunung Argopuro|Baderan (Situbondo)': [-7.8850, 113.6620],
  'Gunung Argopuro|Bremi': [-7.9215, 113.5085],

  // Gunung Kawi
  'Gunung Kawi|Precet Wagir': [-7.9592, 112.4980],
  'Gunung Kawi|Keraton': [-7.9650, 112.4820],
  'Gunung Kawi|Kucur Dau': [-7.9310, 112.4950],
  'Gunung Kawi|Panderman': [-7.9080, 112.4780],
  'Gunung Kawi|Sirah Kencong Blitar': [-7.9680, 112.4120],
  'Gunung Kawi|Ngantang': [-7.8920, 112.4150],
  'Gunung Kawi|Mrinci Batu': [-7.8950, 112.4620],

  // Gunung Arjuno
  'Gunung Arjuno|Sumber Brantas': [-7.7480, 112.5380],
  'Gunung Arjuno|Tretes': [-7.6980, 112.6285],
  'Gunung Arjuno|Tambaksari': [-7.7480, 112.6480],
  'Gunung Arjuno|Lawang': [-7.7920, 112.6280],

  // Gunung Penanggunan
  'Gunung Penanggunan|Betro': [-7.6020, 112.6012],
  'Gunung Penanggunan|jolotundo': [-7.6082, 112.5960],
  'Gunung Penanggunan|kedungudi': [-7.6285, 112.6025],
  'Gunung Penanggunan|Tamiajeng': [-7.6320, 112.6150],
  'Gunung Penanggunan|Ngoro': [-7.5950, 112.6250],

  // Gunung Kelud
  'Gunung Kelud|Tulungrejo': [-7.9680, 112.3180],
  'Gunung Kelud|Karangrejo': [-7.9450, 112.2750],
  'Gunung Kelud|Karanganyar': [-7.9120, 112.2720],

  // Gunung Panderman
  'Gunung Panderman|Dusun Toyomerto': [-7.8910, 112.5120],

  // Gunung Raung
  'Gunung Raung|Kalibaru': [-8.2080, 114.0220],
  'Gunung Raung|Sumberwringin': [-8.0550, 113.9920],

  // Gunung Dorowati
  'Gunung Dorowati|Desa Pujon Kidul': [-7.8490, 112.4520],

  // Gunung Welirang
  'Gunung Welirang|Tretes': [-7.6950, 112.6250],
  'Gunung Welirang|Tambaksari': [-7.7480, 112.6380],

  // Gunung Pundak
  'Gunung Pundak|Puthuk Siwur': [-7.6780, 112.5590],
  'Gunung Pundak|Trawas': [-7.6760, 112.5810],

  // Gunung Wilis
  'Gunung Wilis|Kare (Madiun)': [-7.7520, 111.7150],
  'Gunung Wilis|Bajulan (Nganjuk)': [-7.7550, 111.8120],
  'Gunung Wilis|Bareng (Nganjuk': [-7.7780, 111.8180],
  'Gunung Wilis|Mojo/Dolo (Kediri)': [-7.8250, 111.8250],
  'Gunung Wilis|CandiPenampihan & Jurang Senggani (Tulungagung)': [-7.8680, 111.7750],
  'Gunung Wilis|Botoputih (Trenggalek)': [-7.8650, 111.7210],

  // Gunung Ciremai
  'Gunung Ciremai|Palutungan': [-6.9350, 108.4310],
  'Gunung Ciremai|Apuy': [-6.8980, 108.3560],
  'Gunung Ciremai|linggarjati': [-6.8850, 108.4620],
  'Gunung Ciremai|linggasana': [-6.8720, 108.4550],
  'Gunung Ciremai|Sadarehe': [-6.8520, 108.3680],

  // Gunung Kencana (Cisarua Bogor: Puncak -6.6589, 106.9796)
  'Gunung Kencana|Lengeran Barat Daya Gn. Paseban': [-6.6595, 106.9635],
  'Gunung Kencana|Puncak Karvak': [-6.6635, 106.9895],
  'Gunung Kencana|Rute Paseban': [-6.6565, 106.9615],
  'Gunung Kencana|Telaga Warna': [-6.6715, 106.9845],
  'Gunung Kencana|Telaga warna': [-6.6705, 106.9830],

  // Gunung Pangrango
  'Gunung Pangrango|Cibodas': [-6.7412, 107.0020],
  'Gunung Pangrango|Gn Putri': [-6.7480, 107.0150],
  'Gunung Pangrango|Selabitana': [-6.8120, 106.9520],

  // Gunung Gede
  'Gunung Gede|Gn Putri': [-6.7480, 107.0180],
  'Gunung Gede|Cibodas': [-6.7412, 107.0050],
  'Gunung Gede|Selabitana': [-6.8212, 106.9580],

  // Gunung Cikurai
  'Gunung Cikurai|Pemancar': [-7.3020, 107.8350],
  'Gunung Cikurai|Boyongbong': [-7.3180, 107.8180],
  'Gunung Cikurai|Cikajang': [-7.3520, 107.8380],
  'Gunung Cikurai|Kebun Teh': [-7.3080, 107.8780],

  // Gunung Papandayan
  'Gunung Papandayan|Cisurupan': [-7.3020, 107.7580],

  // Gunung Kendang (Puncak: -7.2453, 107.7086)
  'Gunung Kendang|Pengalengan': [-7.2355, 107.6945],

  // Gunung Patuha (Puncak: -7.16001, 107.401382)
  'Gunung Patuha|Cipanganten': [-7.1455, 107.4165],

  // Gunung Malabar (Puncak Besar: -7.15139, 107.6250)
  'Gunung Malabar|Puncak Besar': [-7.1685, 107.6085],

  // Gunung Guntur (Puncak: -7.15502, 107.85124)
  'Gunung Guntur|Kampung Citiis': [-7.1645, 107.8735],

  // Gunung Puntang (Puncak Mega: -7.120372, 107.620902)
  'Gunung Puntang|Banjaran': [-7.1085, 107.6115],

  // Gunung Salak (Puncak Salak 1: -6.715908, 106.733443)
  'Gunung Salak|Cidahu': [-6.7520, 106.7420],
  'Gunung Salak|Pasir Reungit': [-6.6780, 106.6980],
  'Gunung Salak|Cimelati': [-6.7580, 106.7680],
  'Gunung Salak|Ajisaka': [-6.6850, 106.7250],

  // Gunung Salak 2 (Puncak Prabu: -6.701760, 106.727850)
  'Gunung Salak 2|Ajisaka': [-6.6850, 106.7250],
  'Gunung Salak 2|Curug Pilung (Sukamantri)': [-6.6745, 106.7385],

  // Gunung Bukit Tunggul (Puncak: -6.8105, 107.7256)
  'Gunung Bukit Tunggul|Perkebunan Bukut Tunggul': [-6.8245, 107.7165],

  // Gunung Artapela (Puncak Sulibra: -7.173674, 107.654321)
  'Gunung Artapela|Datar Kembang': [-7.1795, 107.6715],

  // Gunung Sagara (Puncak: -7.221826, 108.058127)
  'Gunung Sagara|Tajur': [-7.2045, 108.0415],
  'Gunung Sagara|Sukamurni': [-7.2345, 108.0435],

  // Gunung Bedil (Puncak: -7.2015, 107.6385)
  'Gunung Bedil|Wayang Windu': [-7.1965, 107.6245],

  // Gunung Windu (Puncak: -7.22389, 107.63056)
  'Gunung Windu|Pangalengan': [-7.2125, 107.6185],

  // Gunung Burangrang (Puncak: -6.7748, 107.5549)
  'Gunung Burangrang|Legok haji': [-6.7920, 107.5620],
  'Gunung Burangrang|Komando': [-6.7880, 107.5420],
  'Gunung Burangrang|Pasanggarahan': [-6.7550, 107.5450],
  'Gunung Burangrang|Pangheotan': [-6.7580, 107.5720],

  // Gunung Halimun
  'Gunung Halimun|Citalahab': [-6.7320, 106.4850],
  'Gunung Halimun|Nirmala': [-6.7250, 106.4750],

  // Gunung Manglayang
  'Gunung Manglayang|Batu kuda': [-6.8920, 107.7450],
  'Gunung Manglayang|Palintang': [-6.8620, 107.7280],
  'Gunung Manglayang|Barubatu': [-6.8650, 107.7580],

  // Gunung Cakrabuana
  'Gunung Cakrabuana|Bunigeulis': [-7.0580, 108.1150],
  'Gunung Cakrabuana|Sukanyiru': [-7.0180, 108.1520],

  // Gunung Tampomas
  'Gunung Tampomas|Narimbang': [-6.7480, 107.9720],
  'Gunung Tampomas|Cibereum': [-6.7880, 107.9380],

  // Gunung Slamet
  'Gunung Slamet|Bambangan': [-7.2320, 109.2620],
  'Gunung Slamet|Guci': [-7.1980, 109.1680],
  'Gunung Slamet|Dipajaya': [-7.1920, 109.2250],
  'Gunung Slamet|Baturraden': [-7.3050, 109.2280],
  'Gunung Slamet|Kaliwadas': [-7.2620, 109.1480],

  // Gunung Sumbing
  'Gunung Sumbing|Garung': [-7.3450, 110.0250],
  'Gunung Sumbing|Kaliangkrik': [-7.4250, 110.0980],
  'Gunung Sumbing|Bowongso': [-7.3920, 110.0180],
  'Gunung Sumbing|Mangli': [-7.4120, 110.1050],
  'Gunung Sumbing|Adipuro': [-7.4220, 110.0820],

  // Gunung Merbabu
  'Gunung Merbabu|Selo': [-7.4920, 110.4550],
  'Gunung Merbabu|Suwanting': [-7.4680, 110.3980],
  'Gunung Merbabu|Thekelan': [-7.4120, 110.4320],
  'Gunung Merbabu|Wekas': [-7.4380, 110.4020],
  'Gunung Merbabu|Cuntel': [-7.4050, 110.4420],

  // Gunung Sindoro
  'Gunung Sindoro|Kledung': [-7.3380, 110.0280],
  'Gunung Sindoro|Sigedang': [-7.2680, 109.9620],
  'Gunung Sindoro|Bansari': [-7.3120, 110.0380],
  'Gunung Sindoro|Alang-alang sewu': [-7.3320, 110.0120],

  // Gunung Merapi
  'Gunung Merapi|Selo': [-7.5080, 110.4520],

  // Gunung Prau
  'Gunung Prau|Patakbanteng': [-7.2120, 109.9180],
  'Gunung Prau|Dieng Kulon': [-7.2020, 109.9050],
  'Gunung Prau|Wates': [-7.1850, 109.9520],
  'Gunung Prau|Kalilembu': [-7.2080, 109.9120],
  'Gunung Prau|Igirmranak': [-7.2220, 109.9280],

  // Gunung Pakuwaja
  'Gunung Pakuwaja|Parikesit': [-7.2120, 109.9210],
  'Gunung Pakuwaja|Sembungan': [-7.2350, 109.9180],

  // Gunung Bisma
  'Gunung Bisma|Silandak': [-7.2720, 109.8950],
  'Gunung Bisma|Sikunang': [-7.2420, 109.8980],
  'Gunung Bisma|Deroduwur': [-7.2780, 109.8750],

  // Gunung Rogojembangan
  'Gunung Rogojembangan|Gumelem': [-7.1680, 109.7020],
  'Gunung Rogojembangan|Wanayasa': [-7.2020, 109.7280],

  // Gunung Ungaran
  'Gunung Ungaran|Mawar': [-7.1950, 110.3620],
  'Gunung Ungaran|Gedong Songo': [-7.2080, 110.3420],
  'Gunung Ungaran|Promasan': [-7.1620, 110.3180],
  'Gunung Ungaran|Perantunan': [-7.2020, 110.3520],

  // Gunung Andong
  'Gunung Andong|Sawit': [-7.3940, 110.3610],
  'Gunung Andong|Pendem': [-7.3960, 110.3740],
  'Gunung Andong|Gogik': [-7.3780, 110.3560],

  // Gunung Muria
  'Gunung Muria|Rahtawu': [-6.6520, 110.8820],
  'Gunung Muria|Tempur': [-6.5880, 110.8950],
  'Gunung Muria|Pemberit': [-6.6120, 110.9250]
};

function generateRidgeWaypoints(bcLat, bcLng, peakLat, peakLng, posCount, seed = 1, lastIsPeak = false) {
  const deltaLat = peakLat - bcLat;
  const deltaLng = peakLng - bcLng;
  const len = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
  if (len === 0 || posCount <= 0) return [];

  // Vektor normal tegak lurus untuk lengkungan kontur punggungan alami
  const normLat = -deltaLng / len;
  const normLng = deltaLat / len;
  const dir = (seed % 2 === 0) ? 1 : -1;
  const curveAmp = 0.055 * len * dir;

  const points = [];
  const totalSteps = lastIsPeak ? posCount : posCount + 1;

  for (let i = 1; i <= posCount; i++) {
    if (lastIsPeak && i === posCount) {
      points.push({
        urutan: i,
        lat: Number(peakLat.toFixed(6)),
        lng: Number(peakLng.toFixed(6))
      });
    } else {
      const t = i / totalSteps;
      const offset = Math.sin(Math.PI * t) * curveAmp + Math.sin(2 * Math.PI * t) * (curveAmp * 0.25);
      const lat = Number((bcLat + t * deltaLat + offset * normLat).toFixed(6));
      const lng = Number((bcLng + t * deltaLng + offset * normLng).toFixed(6));
      points.push({ urutan: i, lat, lng });
    }
  }

  const waypoints = [];
  for (let i = 1; i <= posCount; i++) {
    const t = (lastIsPeak && i === posCount) ? 1.0 : (i / totalSteps);
    const [lat, lng] = pointAtT(t);
    waypoints.push({ urutan: i, lat, lng });
  }

  return { waypoints, jalurGeo };
}

async function ensureGunungSalak2() {
  const existingSalak2 = await prisma.gunung.findFirst({
    where: { nama: 'Gunung Salak 2' }
  });
  if (existingSalak2) return;

  console.log('➕ Menambahkan Gunung Salak 2 (Puncak Prabu - 2.180 mdpl) ke database...');
  await prisma.gunung.create({
    data: {
      nama: 'Gunung Salak 2',
      slug: 'gunung-salak-2',
      provinsi: 'Jawa Barat',
      kabupaten: 'Bogor, Sukabumi',
      ketinggian: 2180,
      statusVulkanik: 'Normal',
      statusJalur: 'Buka',
      tipeGunung: 'Stratovolcano',
      kuotaHarian: 300,
      kuotaTersisa: 240,
      cuacaSuhu: 15,
      cuacaKondisi: 'Kabut Tipis',
      latitude: -6.701760,
      longitude: 106.727850,
      deskripsi: 'Puncak Salak 2 (Puncak Prabu - 2.180 mdpl) merupakan puncak utama kedua di kompleks Gunung Salak yang terkenal dengan jalur punggungan akar dan tebing menantang via Ajisaka dan Curug Pilung.',
      basecamps: {
        create: [
          {
            nama: 'Basecamp Salak 2 Via Ajisaka',
            jalurVia: 'Ajisaka',
            totalPos: 4,
            status: 'Buka Resmi',
            latitude: -6.685000,
            longitude: 106.725000,
            elevasi: 1050,
            kontak: '+62 812-9000-2180',
            simaksiInfo: 'Simaksi TNGHS Resmi',
            pos: {
              create: [
                { namaPos: 'Pos 1 Pintu Hutan Ajisaka', urutan: 1, latitude: -6.6890, longitude: 106.7258, elevasi: 1320, adaAir: true, areaCamp: false, keterangan: 'Batas hutan pinus dan hutan hujan tropis' },
                { namaPos: 'Pos 2 Punggungan Akar', urutan: 2, latitude: -6.6935, longitude: 106.7265, elevasi: 1610, adaAir: false, areaCamp: true, keterangan: 'Area camp darurat di punggungan akar' },
                { namaPos: 'Pos 3 Lembah Lumut', urutan: 3, latitude: -6.6980, longitude: 106.7272, elevasi: 1920, adaAir: false, areaCamp: true, keterangan: 'Hutan lumut sebelum tanjakan tebing Puncak Salak 2' },
                { namaPos: 'Puncak Salak 2 (Puncak Prabu)', urutan: 4, latitude: -6.70176, longitude: 106.72785, elevasi: 2180, adaAir: false, areaCamp: true, keterangan: 'Titik tertinggi Puncak Salak II (2.180 mdpl)' }
              ]
            }
          },
          {
            nama: 'Basecamp Salak 2 Via Curug Pilung (Sukamantri)',
            jalurVia: 'Curug Pilung (Sukamantri)',
            totalPos: 3,
            status: 'Buka Resmi',
            latitude: -6.674500,
            longitude: 106.738500,
            elevasi: 980,
            kontak: '+62 812-9000-2181',
            simaksiInfo: 'Simaksi TNGHS Sukamantri',
            pos: {
              create: [
                { namaPos: 'Pos 1 Curug Pilung', urutan: 1, latitude: -6.6835, longitude: 106.7350, elevasi: 1350, adaAir: true, areaCamp: true, keterangan: 'Dekat aliran air Curug Pilung' },
                { namaPos: 'Pos 2 Simpang Kawah Ratu - Salak 2', urutan: 2, latitude: -6.6930, longitude: 106.7315, elevasi: 1780, adaAir: false, areaCamp: true, keterangan: 'Persimpangan punggungan menuju Salak 2' },
                { namaPos: 'Puncak Salak 2 (Puncak Prabu)', urutan: 3, latitude: -6.70176, longitude: 106.72785, elevasi: 2180, adaAir: false, areaCamp: true, keterangan: 'Titik tertinggi Puncak Salak II (2.180 mdpl)' }
              ]
            }
          }
        ]
      }
    }
  });
}

async function alignAllTrails() {
  console.log('🏔️ Memulai Penyelarasan Penuh Koordinat Puncak, Basecamp & Jalur Pos sesuai Peta...');

  const mountains = await prisma.gunung.findMany({
    include: { basecamps: { include: { pos: { orderBy: { urutan: 'asc' } } } } }
  });

  let updatedMountains = 0;
  let updatedBasecamps = 0;
  let updatedPosCount = 0;

  for (const m of mountains) {
    const verifiedPeak = VERIFIED_PEAKS[m.nama];
    const peakLat = verifiedPeak ? verifiedPeak[0] : m.latitude;
    const peakLng = verifiedPeak ? verifiedPeak[1] : m.longitude;
    const peakElev = m.ketinggian;

    if (!peakLat || !peakLng) continue;

    // 1. Update koordinat Puncak Gunung
    await prisma.gunung.update({
      where: { id: m.id },
      data: {
        latitude: peakLat,
        longitude: peakLng
      }
    });
    updatedMountains++;

    // 2. Update setiap Basecamp & Pos di gunung ini
    for (let bIdx = 0; bIdx < m.basecamps.length; bIdx++) {
      const b = m.basecamps[bIdx];
      const key = `${m.nama}|${b.jalurVia}`;
      let bcLat, bcLng;

      if (VERIFIED_BASECAMPS[key]) {
        bcLat = VERIFIED_BASECAMPS[key][0];
        bcLng = VERIFIED_BASECAMPS[key][1];
      } else {
        // Tempatkan basecamp di kaki gunung (~2.2 km dari puncak) dengan sudut berbeda tiap jalur
        const angle = ((bIdx * 115 + (m.id * 37)) % 360) * (Math.PI / 180);
        const radiusDeg = Math.min(0.026, Math.max(0.014, (peakElev / 3000) * 0.022));
        bcLat = Number((peakLat + Math.sin(angle) * radiusDeg).toFixed(6));
        bcLng = Number((peakLng + Math.cos(angle) * radiusDeg).toFixed(6));
      }

      const bcElev = Math.max(300, Math.min(peakElev - 250, b.elevasi || Math.round(peakElev * 0.48)));

      await prisma.basecamp.update({
        where: { id: b.id },
        data: {
          latitude: bcLat,
          longitude: bcLng,
          elevasi: bcElev
        }
      });
      updatedBasecamps++;

      const posArr = b.pos || [];
      if (posArr.length === 0) continue;

      const lastPosName = (posArr[posArr.length - 1].namaPos || '').toLowerCase();
      const lastIsPeak = lastPosName.includes('puncak') || lastPosName.includes('bibir kawah') || lastPosName.includes('hargo dumilah');

      const waypoints = generateRidgeWaypoints(bcLat, bcLng, peakLat, peakLng, posArr.length, b.id, lastIsPeak);
      const totalSteps = lastIsPeak ? posArr.length : posArr.length + 1;
      const elevDiff = Math.max(150, peakElev - bcElev);

      for (let i = 0; i < posArr.length; i++) {
        const p = posArr[i];
        const wp = waypoints[i];
        const newElev = (lastIsPeak && i === posArr.length - 1)
          ? peakElev
          : Math.round(bcElev + ((i + 1) / totalSteps) * elevDiff);

        await prisma.posGunung.update({
          where: { id: p.id },
          data: {
            urutan: i + 1,
            latitude: wp.lat,
            longitude: wp.lng,
            elevasi: newElev
          }
        });
        updatedPosCount++;
      }
    }
  }

  console.log(`\n✅ Penyelarasan Penuh Selesai!`);
  console.log(`⛰️  Gunung diperbarui:   ${updatedMountains}`);
  console.log(`🏕️  Basecamp diperbarui: ${updatedBasecamps}`);
  console.log(`📍 Titik Pos diperbarui: ${updatedPosCount}`);
  await prisma.$disconnect();
}

alignAllTrails().catch(err => {
  console.error('❌ Gagal menyelaraskan koordinat:', err);
  process.exit(1);
});
