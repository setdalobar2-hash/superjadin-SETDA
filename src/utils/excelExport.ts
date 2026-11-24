import * as XLSX from 'xlsx';
import { PerjadinRecord } from '../types';
import { SHS_PROVINCE_DATA } from '../data/shsData';
import {
  calcHarianTotal,
  calcPelaksanaRiilTotal,
  calcPelaksanaTotal,
  calcPenginapanItemTotal,
  calcPenginapanTotal,
  calcRecordGrandTotal,
  calcRepresentasiTotal,
  calcSewaTotal,
  calcTaksiTotal,
  calcTiketTotal,
  formatTanggalIndo,
  STAGE_META,
  toTerbilangAngka,
  toTerbilangRupiah,
} from './formatters';

function setColWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map((wch) => ({ wch }));
}

export function exportSinglePerjadinToExcel(record: PerjadinRecord): void {
  const wb = XLSX.utils.book_new();
  const grandTotal = calcRecordGrandTotal(record);

  // Sheet 1: KUITANSI
  const kwitansiRows: (string | number)[][] = [
    ['PEMERINTAH KABUPATEN LOMBOK BARAT'],
    ['SEKRETARIAT DAERAH — BAGIAN UMUM'],
    ['Jl. Soekarno Hatta Giri Menang - Gerung, Kode Pos 83363'],
    [],
    ['KUITANSI PERJALANAN DINAS'],
    [],
    ['No BKU', record.noBku, '', 'Tahun Anggaran', record.tahunAnggaran],
    ['Tanggal Kuitansi', formatTanggalIndo(record.tanggalKwitansi), '', 'KPA / PPTK', record.pejabat.kpaPptkNama],
    ['Program', `${record.programKode} ${record.programNama}`, '', 'Acuan SHS', record.shsVersion === 'NEW_2026' ? 'NEW SHS 2026' : 'OLD SHS 2026'],
    ['Kegiatan', `${record.kegiatanKode} ${record.kegiatanNama}`, '', 'Status Dokumen', STAGE_META[record.status].label],
    ['Sub Kegiatan', `${record.subKegiatanKode} ${record.subKegiatanNama}`],
    ['Kode Rekening', `${record.kodeRekening} ${record.uraianRekening}`],
    [],
    ['Telah Terima Dari', 'Bendahara Pengeluaran Setda Kabupaten Lombok Barat'],
    ['Banyaknya Uang', toTerbilangRupiah(grandTotal)],
    ['Untuk Pembayaran', record.untukPembayaran],
    ['Terbilang (Rp)', grandTotal],
    [],
    ['Mengetahui / Menyetujui', '', 'Lunas Dibayar', '', 'Yang Menerima Uang'],
    ['Pengguna Anggaran / KPA', '', 'Bendahara Pengeluaran', '', `Gerung, ${formatTanggalIndo(record.tanggalKwitansi)}`],
    ['', '', '', '', ''],
    [record.pejabat.paKpaNama, '', record.pejabat.bendaharaNama, '', record.pejabat.penerimaUangNama],
    [`NIP. ${record.pejabat.paKpaNip}`, '', `NIP. ${record.pejabat.bendaharaNip}`, '', record.pejabat.penerimaUangJabatan],
  ];
  const wsKwitansi = XLSX.utils.aoa_to_sheet(kwitansiRows);
  setColWidths(wsKwitansi, [24, 48, 22, 22, 34]);
  XLSX.utils.book_append_sheet(wb, wsKwitansi, '1. Kuitansi');

  // Sheet 2: DAFTAR PENERIMAAN
  const daftarRows: (string | number)[][] = [
    ['DAFTAR PENERIMAAN UANG PERJALANAN DINAS LUAR DAERAH'],
    ['Tgl. Pelaksanaan', `${formatTanggalIndo(record.tanggalMulai)} s.d. ${formatTanggalIndo(record.tanggalSelesai)}`],
    ['Tujuan / Lamanya', `${record.lokasiTujuan} (${record.provinsiTujuan}) selama ${record.lamaHari} (${toTerbilangAngka(record.lamaHari)}) hari`],
    ['Uraian Tugas', record.uraianTugas],
    [],
    ['NO', 'NAMA / NIP / URAIAN BIAYA', 'RINCIAN PERHITUNGAN', 'HARGA SATUAN (Rp)', 'JUMLAH HARGA (Rp)', 'TOTAL PELAKSANA (Rp)'],
  ];

  record.pelaksana.forEach((p, idx) => {
    const pelTotal = calcPelaksanaTotal(p);
    daftarRows.push([
      idx + 1,
      `${p.nama} (NIP. ${p.nip || '-'}) — ${p.jabatan}`,
      `SPD: ${p.nomorSpd}`,
      '',
      '',
      pelTotal,
    ]);

    if (p.tiket.length > 0) {
      daftarRows.push(['', 'a. Tiket Pesawat', '', '', calcTiketTotal(p), '']);
      p.tiket.forEach((t) => {
        daftarRows.push(['', `   - ${t.rute}`, `${t.qty} ${t.satuan}`, t.harga, t.harga * t.qty, '']);
      });
    }
    if (p.harian.length > 0) {
      daftarRows.push(['', 'b. Uang Harian', '', '', calcHarianTotal(p), '']);
      p.harian.forEach((h) => {
        daftarRows.push(['', `   - ${h.provinsi}`, `${h.hari} Hari`, h.hargaSatuan, h.hargaSatuan * h.hari, '']);
      });
    }
    if (p.representasi.aktif) {
      daftarRows.push([
        '',
        `c. Uang Representasi (${p.representasi.label})`,
        `${p.representasi.hari} Hari`,
        p.representasi.hargaSatuan,
        calcRepresentasiTotal(p),
        '',
      ]);
    }
    if (p.penginapan.length > 0) {
      daftarRows.push(['', 'd. Uang Penginapan', '', '', calcPenginapanTotal(p), '']);
      p.penginapan.forEach((pg) => {
        daftarRows.push([
          '',
          `   - ${pg.label} (${pg.provinsi})`,
          `${pg.malam} Malam${pg.isRiil30Persen ? ' x 30%' : ''}`,
          pg.hargaSatuan,
          calcPenginapanItemTotal(pg),
          '',
        ]);
      });
    }
    if (p.taksi.length > 0) {
      daftarRows.push(['', 'e. Taxi Bandara / Transport Lokal', '', '', calcTaksiTotal(p), '']);
      p.taksi.forEach((tx) => {
        daftarRows.push(['', `   - ${tx.ruteAtauProvinsi}`, `${tx.kali} Kali`, tx.hargaSatuan, tx.hargaSatuan * tx.kali, '']);
      });
    }
    if (p.sewaKendaraan.aktif) {
      daftarRows.push([
        '',
        `f. Sewa Kendaraan (${p.sewaKendaraan.label})`,
        `${p.sewaKendaraan.hari} Hari`,
        p.sewaKendaraan.hargaSatuan,
        calcSewaTotal(p),
        '',
      ]);
    }
  });

  daftarRows.push([]);
  daftarRows.push(['', 'JUMLAH KESELURUHAN', '', '', grandTotal, grandTotal]);

  const wsDaftar = XLSX.utils.aoa_to_sheet(daftarRows);
  setColWidths(wsDaftar, [6, 44, 22, 20, 20, 22]);
  XLSX.utils.book_append_sheet(wb, wsDaftar, '2. Daftar Penerimaan');

  // Sheet 3: PENGELUARAN RIIL
  const riilRows: (string | number)[][] = [
    ['REKAPITULASI SURAT PERNYATAAN PENGELUARAN RIIL'],
    ['Arsip / Kegiatan', `${record.kodeArsip} — ${record.uraianTugas}`],
    [],
    ['No', 'Nama Pelaksana', 'NIP', 'Nomor SPD', 'Komponen Pengeluaran Riil', 'Perhitungan', 'Jumlah (Rp)'],
  ];

  let riilNo = 1;
  let grandRiil = 0;
  record.pelaksana.forEach((p) => {
    const pelRiil = calcPelaksanaRiilTotal(p);
    grandRiil += pelRiil;

    p.harian.forEach((h) => {
      riilRows.push([
        riilNo++,
        p.nama,
        p.nip || '-',
        p.nomorSpd,
        `Uang Harian (${h.provinsi})`,
        `${formatNum(h.hargaSatuan)} x ${h.hari} Hari`,
        h.hargaSatuan * h.hari,
      ]);
    });
    p.penginapan
      .filter((pg) => pg.isRiil30Persen)
      .forEach((pg) => {
        riilRows.push([
          riilNo++,
          p.nama,
          p.nip || '-',
          p.nomorSpd,
          `Uang Penginapan 30% (${pg.provinsi})`,
          `${formatNum(pg.hargaSatuan)} x ${pg.malam} Malam x 30%`,
          calcPenginapanItemTotal(pg),
        ]);
      });
    p.taksi.forEach((tx) => {
      riilRows.push([
        riilNo++,
        p.nama,
        p.nip || '-',
        p.nomorSpd,
        `Taxi Bandara (${tx.ruteAtauProvinsi})`,
        `${formatNum(tx.hargaSatuan)} x ${tx.kali} Kali`,
        tx.hargaSatuan * tx.kali,
      ]);
    });
    if (p.representasi.aktif) {
      riilRows.push([
        riilNo++,
        p.nama,
        p.nip || '-',
        p.nomorSpd,
        `Uang Representasi (${p.representasi.label})`,
        `${formatNum(p.representasi.hargaSatuan)} x ${p.representasi.hari} Hari`,
        calcRepresentasiTotal(p),
      ]);
    }
  });
  riilRows.push(['', '', '', '', 'TOTAL PENGELUARAN RIIL KESELURUHAN', '', grandRiil]);

  const wsRiil = XLSX.utils.aoa_to_sheet(riilRows);
  setColWidths(wsRiil, [6, 30, 22, 22, 34, 28, 18]);
  XLSX.utils.book_append_sheet(wb, wsRiil, '3. Pengeluaran Riil');

  // Sheet 4: SPTJM
  const sptjmRows: (string | number)[][] = [
    ['SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM) — UANG REPRESENTASI'],
    ['Kegiatan', record.uraianTugas],
    [],
    ['No', 'Nama Pelaksana', 'NIP', 'Jabatan', 'Kategori', 'Lama (Hari)', 'Tanggal Pelaksanaan', 'Tarif / Hari (Rp)', 'Total Representasi (Rp)'],
  ];
  const repPelaksana = record.pelaksana.filter((p) => p.representasi.aktif);
  repPelaksana.forEach((p, idx) => {
    sptjmRows.push([
      idx + 1,
      p.nama,
      p.nip || '-',
      p.jabatan,
      p.representasi.label,
      p.representasi.hari,
      `${formatTanggalIndo(record.tanggalMulai)} s.d. ${formatTanggalIndo(record.tanggalSelesai)}`,
      p.representasi.hargaSatuan,
      calcRepresentasiTotal(p),
    ]);
  });
  if (repPelaksana.length === 0) {
    sptjmRows.push(['-', 'Tidak ada pelaksana dengan komponen Uang Representasi pada SPPD ini.', '', '', '', '', '', '', 0]);
  }

  const wsSptjm = XLSX.utils.aoa_to_sheet(sptjmRows);
  setColWidths(wsSptjm, [6, 30, 22, 34, 16, 12, 32, 18, 22]);
  XLSX.utils.book_append_sheet(wb, wsSptjm, '4. SPTJM');

  // Sheet 5: LAPORAN SPPD
  const lapRows: (string | number)[][] = [
    ['LAPORAN PELAKSANAAN PERJALANAN DINAS'],
    ['Jenis Kop Surat', record.laporanSppd.kopType === 'GARUDA' ? 'KOP GARUDA — BUPATI LOMBOK BARAT' : 'KOP SETDA — SEKRETARIAT DAERAH KAB. LOMBOK BARAT'],
    ['Dasar Surat Tugas', record.laporanSppd.dasarStList.map((d) => `${d.nomor} (${d.tanggal})`).join('; ')],
    ['Dasar SPD', record.laporanSppd.dasarSpdList.map((d) => `${d.nomor} (${d.tanggal})`).join('; ')],
    ['Waktu Pelaksanaan', record.laporanSppd.waktuPelaksanaanText],
    ['Kegiatan', record.laporanSppd.kegiatanRingkas],
    ['Hasil Perjalanan Dinas', record.laporanSppd.hasilPerjalananDinas],
    ['Rekomendasi Tindak Lanjut', record.laporanSppd.rekomendasiTindakLanjut],
    ['Kesimpulan', record.laporanSppd.kesimpulan],
    ['Tanggal Laporan', formatTanggalIndo(record.laporanSppd.tanggalLaporan)],
  ];
  const wsLap = XLSX.utils.aoa_to_sheet(lapRows);
  setColWidths(wsLap, [28, 90]);
  XLSX.utils.book_append_sheet(wb, wsLap, '5. Laporan SPPD');

  const safeFile = `${record.kodeArsip.replace(/[^a-zA-Z0-9_-]/g, '_')}_Administrasi_Perjadin.xlsx`;
  XLSX.writeFile(wb, safeFile);
}

export function exportAllRecordsToExcel(records: PerjadinRecord[]): void {
  const wb = XLSX.utils.book_new();

  const summaryRows: (string | number)[][] = [
    ['REKAPITULASI ADMINISTRASI PERJALANAN DINAS'],
    ['BAGIAN UMUM SEKRETARIAT DAERAH KABUPATEN LOMBOK BARAT'],
    [`Diekspor pada: ${new Date().toLocaleString('id-ID')}`],
    [],
    [
      'No',
      'Kode Arsip',
      'No. BKU',
      'Tgl Kuitansi',
      'Pelaksana Utama',
      'Tujuan',
      'Lama (Hari)',
      'Acuan SHS',
      'KOP Laporan',
      'Status Persetujuan',
      'Total Biaya (Rp)',
    ],
  ];

  let totalAll = 0;
  records.forEach((r, idx) => {
    const total = calcRecordGrandTotal(r);
    totalAll += total;
    summaryRows.push([
      idx + 1,
      r.kodeArsip,
      r.noBku,
      formatTanggalIndo(r.tanggalKwitansi),
      r.pejabat.penerimaUangNama,
      `${r.lokasiTujuan} (${r.provinsiTujuan})`,
      r.lamaHari,
      r.shsVersion === 'NEW_2026' ? 'NEW SHS 2026' : 'OLD SHS 2026',
      r.laporanSppd.kopType === 'GARUDA' ? 'KOP GARUDA' : 'KOP SETDA',
      STAGE_META[r.status].label,
      total,
    ]);
  });
  summaryRows.push(['', '', '', '', '', '', '', '', '', 'TOTAL REALISASI', totalAll]);

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  setColWidths(wsSummary, [5, 16, 20, 18, 28, 30, 12, 16, 14, 28, 20]);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Rekapitulasi SPPD');

  // Detail per Pelaksana
  const detailRows: (string | number)[][] = [
    [
      'Kode Arsip',
      'Nomor SPD',
      'Nama Pelaksana',
      'NIP',
      'Jabatan',
      'Tiket (Rp)',
      'Uang Harian (Rp)',
      'Penginapan (Rp)',
      'Taksi (Rp)',
      'Representasi (Rp)',
      'Sewa Kendaraan (Rp)',
      'Total Pelaksana (Rp)',
      'Total Pengeluaran Riil (Rp)',
    ],
  ];

  records.forEach((r) => {
    r.pelaksana.forEach((p) => {
      detailRows.push([
        r.kodeArsip,
        p.nomorSpd,
        p.nama,
        p.nip || '-',
        p.jabatan,
        calcTiketTotal(p),
        calcHarianTotal(p),
        calcPenginapanTotal(p),
        calcTaksiTotal(p),
        calcRepresentasiTotal(p),
        calcSewaTotal(p),
        calcPelaksanaTotal(p),
        calcPelaksanaRiilTotal(p),
      ]);
    });
  });

  const wsDetail = XLSX.utils.aoa_to_sheet(detailRows);
  setColWidths(wsDetail, [15, 22, 28, 22, 34, 15, 16, 16, 15, 16, 18, 18, 20]);
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Rincian Per Pelaksana');

  XLSX.writeFile(wb, `Rekap_Perjadin_Bagian_Umum_Setda_Lobar_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportShsComparisonToExcel(): void {
  const wb = XLSX.utils.book_new();
  const rows: (string | number)[][] = [
    ['STANDAR HARGA SATUAN (SHS) PERJALANAN DINAS LUAR DAERAH TAHUN 2026'],
    ['PERBANDINGAN OLD SHS 2026 vs NEW SHS 2026 — KABUPATEN LOMBOK BARAT'],
    [],
    [
      'No',
      'Provinsi',
      'Uang Harian (Rp/Hari)',
      'Taksi OLD (Rp/Kali)',
      'Taksi NEW (Rp/Kali)',
      'Hotel KDH/WKDH OLD',
      'Hotel KDH/WKDH NEW',
      'Hotel Sekda/Es.II OLD',
      'Hotel Sekda/Es.II NEW',
      'Hotel Es.III/Gol.IV OLD',
      'Hotel Es.III/Gol.IV NEW',
      'Hotel Es.IV/Staf OLD',
      'Hotel Es.IV/Staf NEW',
    ],
  ];

  SHS_PROVINCE_DATA.forEach((s) => {
    rows.push([
      s.no,
      s.provinsi,
      s.uangHarian,
      s.taksiOld,
      s.taksiNew,
      s.penginapanOld.KDH_WKDH,
      s.penginapanNew.KDH_WKDH,
      s.penginapanOld.SEKDA_ESELON_II,
      s.penginapanNew.SEKDA_ESELON_II,
      s.penginapanOld.ESELON_III,
      s.penginapanNew.ESELON_III,
      s.penginapanOld.ESELON_IV_STAF,
      s.penginapanNew.ESELON_IV_STAF,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  setColWidths(ws, [5, 24, 18, 16, 16, 18, 18, 18, 18, 18, 18, 18, 18]);
  XLSX.utils.book_append_sheet(wb, ws, 'OLD vs NEW SHS 2026');

  XLSX.writeFile(wb, 'Referensi_OLD_vs_NEW_SHS_Perjadin_2026_Lombok_Barat.xlsx');
}

function formatNum(n: number): string {
  return new Intl.NumberFormat('id-ID').format(Math.round(n || 0));
}
