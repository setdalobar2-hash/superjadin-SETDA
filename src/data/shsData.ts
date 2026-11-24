import { ShsProvinceRate, ShsVersion, JabatanKategori } from '../types';

export const SHS_PROVINCE_DATA: ShsProvinceRate[] = [
  {
    no: 1,
    provinsi: 'Aceh',
    uangHarian: 360000,
    taksiOld: 123000,
    taksiNew: 127000,
    penginapanOld: { KDH_WKDH: 4420000, SEKDA_ESELON_II: 3526000, ESELON_III: 1294000, ESELON_IV_STAF: 556000 },
    penginapanNew: { KDH_WKDH: 4420000, SEKDA_ESELON_II: 3526000, ESELON_III: 1294000, ESELON_IV_STAF: 556000 },
  },
  {
    no: 2,
    provinsi: 'Sumatera Utara',
    uangHarian: 370000,
    taksiOld: 232000,
    taksiNew: 308000,
    penginapanOld: { KDH_WKDH: 4960000, SEKDA_ESELON_II: 1518000, ESELON_III: 1100000, ESELON_IV_STAF: 530000 },
    penginapanNew: { KDH_WKDH: 4960000, SEKDA_ESELON_II: 2195000, ESELON_III: 1100000, ESELON_IV_STAF: 699000 },
  },
  {
    no: 3,
    provinsi: 'Riau',
    uangHarian: 370000,
    taksiOld: 94000,
    taksiNew: 101000,
    penginapanOld: { KDH_WKDH: 3820000, SEKDA_ESELON_II: 3119000, ESELON_III: 1650000, ESELON_IV_STAF: 852000 },
    penginapanNew: { KDH_WKDH: 3820000, SEKDA_ESELON_II: 3119000, ESELON_III: 1650000, ESELON_IV_STAF: 852000 },
  },
  {
    no: 4,
    provinsi: 'Kepulauan Riau',
    uangHarian: 370000,
    taksiOld: 137000,
    taksiNew: 165000,
    penginapanOld: { KDH_WKDH: 4275000, SEKDA_ESELON_II: 1854000, ESELON_III: 1037000, ESELON_IV_STAF: 792000 },
    penginapanNew: { KDH_WKDH: 5344000, SEKDA_ESELON_II: 2318000, ESELON_III: 1297000, ESELON_IV_STAF: 792000 },
  },
  {
    no: 5,
    provinsi: 'Jambi',
    uangHarian: 370000,
    taksiOld: 147000,
    taksiNew: 147000,
    penginapanOld: { KDH_WKDH: 4000000, SEKDA_ESELON_II: 3337000, ESELON_III: 1212000, ESELON_IV_STAF: 580000 },
    penginapanNew: { KDH_WKDH: 5000000, SEKDA_ESELON_II: 4102000, ESELON_III: 1225000, ESELON_IV_STAF: 580000 },
  },
  {
    no: 6,
    provinsi: 'Sumatera Barat',
    uangHarian: 380000,
    taksiOld: 190000,
    taksiNew: 190000,
    penginapanOld: { KDH_WKDH: 5236000, SEKDA_ESELON_II: 3332000, ESELON_III: 1353000, ESELON_IV_STAF: 650000 },
    penginapanNew: { KDH_WKDH: 5236000, SEKDA_ESELON_II: 3332000, ESELON_III: 1353000, ESELON_IV_STAF: 701000 },
  },
  {
    no: 7,
    provinsi: 'Sumatera Selatan',
    uangHarian: 380000,
    taksiOld: 128000,
    taksiNew: 179000,
    penginapanOld: { KDH_WKDH: 5850000, SEKDA_ESELON_II: 3083000, ESELON_III: 1571000, ESELON_IV_STAF: 861000 },
    penginapanNew: { KDH_WKDH: 5850000, SEKDA_ESELON_II: 3083000, ESELON_III: 1955000, ESELON_IV_STAF: 861000 },
  },
  {
    no: 8,
    provinsi: 'Lampung',
    uangHarian: 380000,
    taksiOld: 167000,
    taksiNew: 168000,
    penginapanOld: { KDH_WKDH: 4491000, SEKDA_ESELON_II: 2067000, ESELON_III: 1140000, ESELON_IV_STAF: 580000 },
    penginapanNew: { KDH_WKDH: 4491000, SEKDA_ESELON_II: 2488000, ESELON_III: 1425000, ESELON_IV_STAF: 580000 },
  },
  {
    no: 9,
    provinsi: 'Bengkulu',
    uangHarian: 380000,
    taksiOld: 109000,
    taksiNew: 109000,
    penginapanOld: { KDH_WKDH: 2071000, SEKDA_ESELON_II: 1628000, ESELON_III: 1546000, ESELON_IV_STAF: 630000 },
    penginapanNew: { KDH_WKDH: 2140000, SEKDA_ESELON_II: 1628000, ESELON_III: 1546000, ESELON_IV_STAF: 692000 },
  },
  {
    no: 10,
    provinsi: 'Bangka Belitung',
    uangHarian: 410000,
    taksiOld: 90000,
    taksiNew: 97000,
    penginapanOld: { KDH_WKDH: 3827000, SEKDA_ESELON_II: 2838000, ESELON_III: 1957000, ESELON_IV_STAF: 622000 },
    penginapanNew: { KDH_WKDH: 3827000, SEKDA_ESELON_II: 2838000, ESELON_III: 1957000, ESELON_IV_STAF: 649000 },
  },
  {
    no: 11,
    provinsi: 'Banten',
    uangHarian: 370000,
    taksiOld: 446000,
    taksiNew: 536000,
    penginapanOld: { KDH_WKDH: 5725000, SEKDA_ESELON_II: 2373000, ESELON_III: 1000000, ESELON_IV_STAF: 718000 },
    penginapanNew: { KDH_WKDH: 5725000, SEKDA_ESELON_II: 2373000, ESELON_III: 1204000, ESELON_IV_STAF: 724000 },
  },
  {
    no: 12,
    provinsi: 'Jawa Barat',
    uangHarian: 430000,
    taksiOld: 166000,
    taksiNew: 200000,
    penginapanOld: { KDH_WKDH: 5381000, SEKDA_ESELON_II: 2755000, ESELON_III: 1006000, ESELON_IV_STAF: 570000 },
    penginapanNew: { KDH_WKDH: 5381000, SEKDA_ESELON_II: 2755000, ESELON_III: 1201000, ESELON_IV_STAF: 686000 },
  },
  {
    no: 13,
    provinsi: 'DKI Jakarta',
    uangHarian: 530000,
    taksiOld: 256000,
    taksiNew: 256000,
    penginapanOld: { KDH_WKDH: 5850000, SEKDA_ESELON_II: 1490000, ESELON_III: 992000, ESELON_IV_STAF: 730000 },
    penginapanNew: { KDH_WKDH: 8720000, SEKDA_ESELON_II: 2063000, ESELON_III: 992000, ESELON_IV_STAF: 730000 },
  },
  {
    no: 14,
    provinsi: 'Jawa Tengah',
    uangHarian: 370000,
    taksiOld: 75000,
    taksiNew: 108000,
    penginapanOld: { KDH_WKDH: 4242000, SEKDA_ESELON_II: 1480000, ESELON_III: 954000, ESELON_IV_STAF: 600000 },
    penginapanNew: { KDH_WKDH: 5303000, SEKDA_ESELON_II: 1850000, ESELON_III: 1201000, ESELON_IV_STAF: 750000 },
  },
  {
    no: 15,
    provinsi: 'DI Yogyakarta',
    uangHarian: 420000,
    taksiOld: 118000,
    taksiNew: 267000,
    penginapanOld: { KDH_WKDH: 5017000, SEKDA_ESELON_II: 2695000, ESELON_III: 1384000, ESELON_IV_STAF: 845000 },
    penginapanNew: { KDH_WKDH: 5017000, SEKDA_ESELON_II: 2695000, ESELON_III: 1384000, ESELON_IV_STAF: 845000 },
  },
  {
    no: 16,
    provinsi: 'Jawa Timur',
    uangHarian: 410000,
    taksiOld: 194000,
    taksiNew: 233000,
    penginapanOld: { KDH_WKDH: 4400000, SEKDA_ESELON_II: 1605000, ESELON_III: 1076000, ESELON_IV_STAF: 664000 },
    penginapanNew: { KDH_WKDH: 4449000, SEKDA_ESELON_II: 2007000, ESELON_III: 1153000, ESELON_IV_STAF: 814000 },
  },
  {
    no: 17,
    provinsi: 'Bali',
    uangHarian: 480000,
    taksiOld: 159000,
    taksiNew: 227000,
    penginapanOld: { KDH_WKDH: 4890000, SEKDA_ESELON_II: 1946000, ESELON_III: 990000, ESELON_IV_STAF: 910000 },
    penginapanNew: { KDH_WKDH: 6848000, SEKDA_ESELON_II: 2433000, ESELON_III: 1685000, ESELON_IV_STAF: 1138000 },
  },
  {
    no: 18,
    provinsi: 'Nusa Tenggara Barat',
    uangHarian: 440000,
    taksiOld: 231000,
    taksiNew: 231000,
    penginapanOld: { KDH_WKDH: 3500000, SEKDA_ESELON_II: 2648000, ESELON_III: 1418000, ESELON_IV_STAF: 580000 },
    penginapanNew: { KDH_WKDH: 4375000, SEKDA_ESELON_II: 2648000, ESELON_III: 1418000, ESELON_IV_STAF: 907000 },
  },
  {
    no: 19,
    provinsi: 'Nusa Tenggara Timur',
    uangHarian: 430000,
    taksiOld: 108000,
    taksiNew: 116000,
    penginapanOld: { KDH_WKDH: 3000000, SEKDA_ESELON_II: 1493000, ESELON_III: 1355000, ESELON_IV_STAF: 550000 },
    penginapanNew: { KDH_WKDH: 3750000, SEKDA_ESELON_II: 2133000, ESELON_III: 1355000, ESELON_IV_STAF: 688000 },
  },
  {
    no: 20,
    provinsi: 'Kalimantan Barat',
    uangHarian: 380000,
    taksiOld: 135000,
    taksiNew: 171000,
    penginapanOld: { KDH_WKDH: 2654000, SEKDA_ESELON_II: 1538000, ESELON_III: 1125000, ESELON_IV_STAF: 538000 },
    penginapanNew: { KDH_WKDH: 2654000, SEKDA_ESELON_II: 1923000, ESELON_III: 1125000, ESELON_IV_STAF: 538000 },
  },
  {
    no: 21,
    provinsi: 'Kalimantan Tengah',
    uangHarian: 360000,
    taksiOld: 111000,
    taksiNew: 134000,
    penginapanOld: { KDH_WKDH: 4901000, SEKDA_ESELON_II: 3391000, ESELON_III: 1160000, ESELON_IV_STAF: 659000 },
    penginapanNew: { KDH_WKDH: 4901000, SEKDA_ESELON_II: 3391000, ESELON_III: 1160000, ESELON_IV_STAF: 659000 },
  },
  {
    no: 22,
    provinsi: 'Kalimantan Selatan',
    uangHarian: 380000,
    taksiOld: 150000,
    taksiNew: 180000,
    penginapanOld: { KDH_WKDH: 4797000, SEKDA_ESELON_II: 3316000, ESELON_III: 1500000, ESELON_IV_STAF: 540000 },
    penginapanNew: { KDH_WKDH: 4797000, SEKDA_ESELON_II: 3316000, ESELON_III: 1500000, ESELON_IV_STAF: 697000 },
  },
  {
    no: 23,
    provinsi: 'Kalimantan Timur',
    uangHarian: 430000,
    taksiOld: 450000,
    taksiNew: 533000,
    penginapanOld: { KDH_WKDH: 4000000, SEKDA_ESELON_II: 2188000, ESELON_III: 1507000, ESELON_IV_STAF: 804000 },
    penginapanNew: { KDH_WKDH: 4000000, SEKDA_ESELON_II: 2188000, ESELON_III: 1507000, ESELON_IV_STAF: 804000 },
  },
  {
    no: 24,
    provinsi: 'Kalimantan Utara',
    uangHarian: 430000,
    taksiOld: 102000,
    taksiNew: 218000,
    penginapanOld: { KDH_WKDH: 4000000, SEKDA_ESELON_II: 2735000, ESELON_III: 1507000, ESELON_IV_STAF: 804000 },
    penginapanNew: { KDH_WKDH: 4000000, SEKDA_ESELON_II: 2735000, ESELON_III: 1507000, ESELON_IV_STAF: 904000 },
  },
  {
    no: 25,
    provinsi: 'Sulawesi Utara',
    uangHarian: 370000,
    taksiOld: 138000,
    taksiNew: 138000,
    penginapanOld: { KDH_WKDH: 4919000, SEKDA_ESELON_II: 2290000, ESELON_III: 924000, ESELON_IV_STAF: 782000 },
    penginapanNew: { KDH_WKDH: 4919000, SEKDA_ESELON_II: 2290000, ESELON_III: 1207000, ESELON_IV_STAF: 978000 },
  },
  {
    no: 26,
    provinsi: 'Gorontalo',
    uangHarian: 370000,
    taksiOld: 240000,
    taksiNew: 265000,
    penginapanOld: { KDH_WKDH: 4168000, SEKDA_ESELON_II: 2549000, ESELON_III: 1431000, ESELON_IV_STAF: 764000 },
    penginapanNew: { KDH_WKDH: 4168000, SEKDA_ESELON_II: 3107000, ESELON_III: 1606000, ESELON_IV_STAF: 955000 },
  },
  {
    no: 27,
    provinsi: 'Sulawesi Barat',
    uangHarian: 410000,
    taksiOld: 313000,
    taksiNew: 313000,
    penginapanOld: { KDH_WKDH: 4076000, SEKDA_ESELON_II: 2581000, ESELON_III: 1075000, ESELON_IV_STAF: 704000 },
    penginapanNew: { KDH_WKDH: 4076000, SEKDA_ESELON_II: 3098000, ESELON_III: 1344000, ESELON_IV_STAF: 704000 },
  },
  {
    no: 28,
    provinsi: 'Sulawesi Selatan',
    uangHarian: 430000,
    taksiOld: 145000,
    taksiNew: 187000,
    penginapanOld: { KDH_WKDH: 4820000, SEKDA_ESELON_II: 1550000, ESELON_III: 1020000, ESELON_IV_STAF: 732000 },
    penginapanNew: { KDH_WKDH: 4820000, SEKDA_ESELON_II: 1938000, ESELON_III: 1423000, ESELON_IV_STAF: 745000 },
  },
  {
    no: 29,
    provinsi: 'Sulawesi Tengah',
    uangHarian: 370000,
    taksiOld: 165000,
    taksiNew: 165000,
    penginapanOld: { KDH_WKDH: 2309000, SEKDA_ESELON_II: 2027000, ESELON_III: 1567000, ESELON_IV_STAF: 951000 },
    penginapanNew: { KDH_WKDH: 2309000, SEKDA_ESELON_II: 2027000, ESELON_III: 1679000, ESELON_IV_STAF: 951000 },
  },
  {
    no: 30,
    provinsi: 'Sulawesi Tenggara',
    uangHarian: 380000,
    taksiOld: 171000,
    taksiNew: 171000,
    penginapanOld: { KDH_WKDH: 2475000, SEKDA_ESELON_II: 2059000, ESELON_III: 1297000, ESELON_IV_STAF: 786000 },
    penginapanNew: { KDH_WKDH: 3088800, SEKDA_ESELON_II: 2574000, ESELON_III: 1297000, ESELON_IV_STAF: 786000 },
  },
  {
    no: 31,
    provinsi: 'Maluku',
    uangHarian: 380000,
    taksiOld: 240000,
    taksiNew: 288000,
    penginapanOld: { KDH_WKDH: 3467000, SEKDA_ESELON_II: 3240000, ESELON_III: 1048000, ESELON_IV_STAF: 667000 },
    penginapanNew: { KDH_WKDH: 3467000, SEKDA_ESELON_II: 3240000, ESELON_III: 1059000, ESELON_IV_STAF: 667000 },
  },
  {
    no: 32,
    provinsi: 'Maluku Utara',
    uangHarian: 430000,
    taksiOld: 215000,
    taksiNew: 215000,
    penginapanOld: { KDH_WKDH: 3440000, SEKDA_ESELON_II: 3175000, ESELON_III: 1079000, ESELON_IV_STAF: 600000 },
    penginapanNew: { KDH_WKDH: 4611600, SEKDA_ESELON_II: 3843000, ESELON_III: 1160000, ESELON_IV_STAF: 605000 },
  },
  {
    no: 33,
    provinsi: 'Papua',
    uangHarian: 580000,
    taksiOld: 431000,
    taksiNew: 513000,
    penginapanOld: { KDH_WKDH: 3859000, SEKDA_ESELON_II: 3318000, ESELON_III: 2521000, ESELON_IV_STAF: 829000 },
    penginapanNew: { KDH_WKDH: 3859000, SEKDA_ESELON_II: 3318000, ESELON_III: 2521000, ESELON_IV_STAF: 1038000 },
  },
  {
    no: 34,
    provinsi: 'Papua Barat',
    uangHarian: 480000,
    taksiOld: 182000,
    taksiNew: 236000,
    penginapanOld: { KDH_WKDH: 3872000, SEKDA_ESELON_II: 3212000, ESELON_III: 2056000, ESELON_IV_STAF: 718000 },
    penginapanNew: { KDH_WKDH: 3872000, SEKDA_ESELON_II: 3341000, ESELON_III: 2056000, ESELON_IV_STAF: 967000 },
  },
  {
    no: 35,
    provinsi: 'Papua Barat Daya',
    uangHarian: 480000,
    taksiOld: 182000,
    taksiNew: 236000,
    penginapanOld: { KDH_WKDH: 3872000, SEKDA_ESELON_II: 3212000, ESELON_III: 2056000, ESELON_IV_STAF: 718000 },
    penginapanNew: { KDH_WKDH: 3872000, SEKDA_ESELON_II: 3341000, ESELON_III: 2056000, ESELON_IV_STAF: 967000 },
  },
  {
    no: 36,
    provinsi: 'Papua Tengah',
    uangHarian: 580000,
    taksiOld: 431000,
    taksiNew: 513000,
    penginapanOld: { KDH_WKDH: 3859000, SEKDA_ESELON_II: 3318000, ESELON_III: 2521000, ESELON_IV_STAF: 829000 },
    penginapanNew: { KDH_WKDH: 3859000, SEKDA_ESELON_II: 3318000, ESELON_III: 2521000, ESELON_IV_STAF: 1038000 },
  },
  {
    no: 37,
    provinsi: 'Papua Selatan',
    uangHarian: 580000,
    taksiOld: 431000,
    taksiNew: 513000,
    penginapanOld: { KDH_WKDH: 3859000, SEKDA_ESELON_II: 3318000, ESELON_III: 2521000, ESELON_IV_STAF: 829000 },
    penginapanNew: { KDH_WKDH: 5673000, SEKDA_ESELON_II: 4877000, ESELON_III: 3706000, ESELON_IV_STAF: 1526000 },
  },
  {
    no: 38,
    provinsi: 'Papua Pegunungan',
    uangHarian: 580000,
    taksiOld: 431000,
    taksiNew: 513000,
    penginapanOld: { KDH_WKDH: 3859000, SEKDA_ESELON_II: 3318000, ESELON_III: 2521000, ESELON_IV_STAF: 829000 },
    penginapanNew: { KDH_WKDH: 5711000, SEKDA_ESELON_II: 4911000, ESELON_III: 3731000, ESELON_IV_STAF: 1536000 },
  },
];

export function getShsProvince(provinsi: string): ShsProvinceRate {
  const found = SHS_PROVINCE_DATA.find(
    (p) => p.provinsi.toLowerCase() === provinsi.toLowerCase()
  );
  return found || SHS_PROVINCE_DATA[12]; // default DKI Jakarta
}

export function getShsPenginapanRate(
  provinsi: string,
  kategori: JabatanKategori,
  version: ShsVersion
): number {
  const prov = getShsProvince(provinsi);
  const table = version === 'NEW_2026' ? prov.penginapanNew : prov.penginapanOld;
  return table[kategori];
}

export function getShsTaksiRate(provinsi: string, version: ShsVersion): number {
  const prov = getShsProvince(provinsi);
  return version === 'NEW_2026' ? prov.taksiNew : prov.taksiOld;
}

export function getShsUangRepresentasi(kategori: JabatanKategori): number {
  if (kategori === 'KDH_WKDH') return 250000;
  if (kategori === 'SEKDA_ESELON_II') return 150000;
  return 0;
}

export const PRESET_PROGRAM_KEGIATAN = [
  {
    label: 'Bagian Umum — Rapat Koordinasi & Konsultasi SKPD',
    programKode: '4.01.01.',
    programNama: 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
    kegiatanKode: '4.01.01.2.06.',
    kegiatanNama: 'Administrasi Umum Perangkat Daerah',
    subKegiatanKode: '4.01.01.2.06.0009.',
    subKegiatanNama: 'Penyelenggaraan Rapat Koordinasi dan Konsultasi SKPD',
    kodeRekening: '5.1.02.04.001.00001.',
    uraianRekening: 'Belanja Perjalanan Dinas Biasa',
  },
  {
    label: 'KDH / WKDH — Dana Penunjang Operasional Kepala Daerah',
    programKode: '4.01.01.',
    programNama: 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
    kegiatanKode: '4.01.01.2.11.',
    kegiatanNama: 'Administrasi Keuangan dan Operasional Kepala Daerah dan Wakil Kepala Daerah',
    subKegiatanKode: '4.01.01.2.11.0004.',
    subKegiatanNama: 'Penyediaan Dana Penunjang Operasional Kepala Daerah dan Wakil Kepala Daerah',
    kodeRekening: '5.1.02.04.001.00001.',
    uraianRekening: 'Belanja Perjalanan Dinas Biasa',
  },
];

export const PRESET_PEJABAT_PA_KPA = [
  {
    nama: 'Drs. H. FAUZAN HUSNIADI, M.M',
    nip: '197408161994021002',
    jabatan: 'Asisten Administrasi Umum / Pengguna Anggaran (KPA)',
  },
  {
    nama: 'H. SAEFUL AKHKAM, S.Ag., M.Hum',
    nip: '197306162006041008',
    jabatan: 'Penjabat Sekretaris Daerah / Pengguna Anggaran',
  },
  {
    nama: 'H. AKHMAD SAIKHU, S.E. M.M',
    nip: '196708201997031004',
    jabatan: 'Asisten Perekonomian dan Pembangunan / KPA',
  },
];

export const DEFAULT_BENDAHARA = {
  nama: 'MUHAMMAD MUSTAAN',
  nip: '197404282005011009',
};

export const DEFAULT_PPTK = 'LALU RIFHANDANI, S.IP';
