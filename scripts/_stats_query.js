const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ log: [] });

async function main() {
  const gunung = await p.gunung.findMany({
    include: { basecamps: { include: { pos: true } } }
  });

  const totalGunung = gunung.length;
  const totalBasecamp = gunung.reduce((s, g) => s + g.basecamps.length, 0);
  const totalPos = gunung.reduce((s, g) => s + g.basecamps.reduce((ss, b) => ss + b.pos.length, 0), 0);
  const avgElev = Math.round(gunung.reduce((s, g) => s + g.ketinggian, 0) / gunung.length);

  const sortedElev = [...gunung].sort((a, b) => b.ketinggian - a.ketinggian);
  const sortedElevAsc = [...gunung].sort((a, b) => a.ketinggian - b.ketinggian);

  const withPos = gunung.map(g => ({
    nama: g.nama, prov: g.provinsi,
    totalPos: g.basecamps.reduce((s, b) => s + b.pos.length, 0)
  })).sort((a, b) => b.totalPos - a.totalPos);

  const withJalur = gunung.map(g => ({
    nama: g.nama, prov: g.provinsi, totalJalur: g.basecamps.length
  })).sort((a, b) => b.totalJalur - a.totalJalur);

  const buka = gunung.filter(g => g.statusJalur === 'Buka')
    .sort((a, b) => b.ketinggian - a.ketinggian);

  const perProv = {};
  gunung.forEach(g => { perProv[g.provinsi] = (perProv[g.provinsi] || 0) + 1; });

  const statusCount = {};
  gunung.forEach(g => { statusCount[g.statusJalur] = (statusCount[g.statusJalur] || 0) + 1; });

  const vulkCount = {};
  gunung.forEach(g => { vulkCount[g.statusVulkanik] = (vulkCount[g.statusVulkanik] || 0) + 1; });

  const allBc = [];
  gunung.forEach(g => g.basecamps.forEach(b => allBc.push({
    nama: b.nama, jalur: b.jalurVia, gunung: g.nama, posCount: b.pos.length
  })));
  allBc.sort((a, b) => b.posCount - a.posCount);

  // Gunung tanpa basecamp sama sekali
  const tanpaBasecamp = gunung.filter(g => g.basecamps.length === 0).map(g => g.nama);

  const result = {
    totalGunung,
    totalBasecamp,
    totalPos,
    avgElev,
    maxElev: sortedElev[0].ketinggian,
    minElev: sortedElevAsc[0].ketinggian,
    top5PosTerbanyak: withPos.slice(0, 5),
    top5JalurTerbanyak: withJalur.slice(0, 5),
    top5Tertinggi: sortedElev.slice(0, 5).map(g => ({ nama: g.nama, ketinggian: g.ketinggian, prov: g.provinsi, status: g.statusJalur })),
    top5TertinggiBuka: buka.slice(0, 5).map(g => ({ nama: g.nama, ketinggian: g.ketinggian, prov: g.provinsi })),
    top5Terendah: sortedElevAsc.slice(0, 5).map(g => ({ nama: g.nama, ketinggian: g.ketinggian, prov: g.provinsi })),
    perProv,
    statusJalurCount: statusCount,
    statusVulkanikCount: vulkCount,
    topBcByPos: allBc.slice(0, 5),
    tanpaBasecampCount: tanpaBasecamp.length,
    tanpaBasecamp
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error).finally(() => p.$disconnect());
