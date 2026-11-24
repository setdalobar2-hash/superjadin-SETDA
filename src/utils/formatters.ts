import { PelaksanaPerjadin, PerjadinRecord, ApprovalStage, UserRole, JabatanKategori } from '../types';

export function formatRupiah(amount: number, withPrefix = false): string {
  const rounded = Math.round(amount || 0);
  const formatted = new Intl.NumberFormat('id-ID').format(rounded).replace(/\./g, ',');
  return withPrefix ? `Rp ${formatted}` : formatted;
}

export function formatRupiahDot(amount: number, withPrefix = false): string {
  const rounded = Math.round(amount || 0);
  const formatted = new Intl.NumberFormat('id-ID').format(rounded);
  return withPrefix ? `Rp ${formatted}` : formatted;
}

const SATUAN = [
  '',
  'Satu',
  'Dua',
  'Tiga',
  'Empat',
  'Lima',
  'Enam',
  'Tujuh',
  'Delapan',
  'Sembilan',
  'Sepuluh',
  'Sebelas',
];

function terbilangCore(n: number): string {
  n = Math.floor(Math.abs(n));
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${terbilangCore(n - 10)} Belas`;
  if (n < 100) {
    const depan = Math.floor(n / 10);
    const belakang = n % 10;
    return `${terbilangCore(depan)} Puluh${belakang ? ' ' + terbilangCore(belakang) : ''}`;
  }
  if (n < 200) {
    const sisa = n - 100;
    return `Seratus${sisa ? ' ' + terbilangCore(sisa) : ''}`;
  }
  if (n < 1000) {
    const depan = Math.floor(n / 100);
    const sisa = n % 100;
    return `${terbilangCore(depan)} Ratus${sisa ? ' ' + terbilangCore(sisa) : ''}`;
  }
  if (n < 2000) {
    const sisa = n - 1000;
    return `Seribu${sisa ? ' ' + terbilangCore(sisa) : ''}`;
  }
  if (n < 1_000_000) {
    const depan = Math.floor(n / 1000);
    const sisa = n % 1000;
    return `${terbilangCore(depan)} Ribu${sisa ? ' ' + terbilangCore(sisa) : ''}`;
  }
  if (n < 1_000_000_000) {
    const depan = Math.floor(n / 1_000_000);
    const sisa = n % 1_000_000;
    return `${terbilangCore(depan)} Juta${sisa ? ' ' + terbilangCore(sisa) : ''}`;
  }
  if (n < 1_000_000_000_000) {
    const depan = Math.floor(n / 1_000_000_000);
    const sisa = n % 1_000_000_000;
    return `${terbilangCore(depan)} Miliar${sisa ? ' ' + terbilangCore(sisa) : ''}`;
  }
  return '';
}

export function toTerbilangRupiah(amount: number): string {
  const rounded = Math.round(amount || 0);
  if (rounded === 0) return 'Nol Rupiah';
  return `${terbilangCore(rounded).trim()} Rupiah`;
}

export function toTerbilangAngka(num: number): string {
  const rounded = Math.round(num || 0);
  if (rounded === 0) return 'nol';
  return terbilangCore(rounded).trim().toLowerCase();
}

export function calcTiketTotal(p: PelaksanaPerjadin): number {
  return p.tiket.reduce((sum, item) => sum + (item.harga || 0) * (item.qty || 0), 0);
}

export function calcHarianTotal(p: PelaksanaPerjadin): number {
  return p.harian.reduce((sum, item) => sum + (item.hargaSatuan || 0) * (item.hari || 0), 0);
}

export function calcPenginapanItemTotal(item: PelaksanaPerjadin['penginapan'][number]): number {
  const raw = (item.hargaSatuan || 0) * (item.malam || 0);
  return Math.round(item.isRiil30Persen ? raw * 0.3 : raw);
}

export function calcPenginapanTotal(p: PelaksanaPerjadin): number {
  return p.penginapan.reduce((sum, item) => sum + calcPenginapanItemTotal(item), 0);
}

export function calcTaksiTotal(p: PelaksanaPerjadin): number {
  return p.taksi.reduce((sum, item) => sum + (item.hargaSatuan || 0) * (item.kali || 0), 0);
}

export function calcRepresentasiTotal(p: PelaksanaPerjadin): number {
  if (!p.representasi.aktif) return 0;
  return (p.representasi.hargaSatuan || 0) * (p.representasi.hari || 0);
}

export function calcSewaTotal(p: PelaksanaPerjadin): number {
  if (!p.sewaKendaraan.aktif) return 0;
  return (p.sewaKendaraan.hargaSatuan || 0) * (p.sewaKendaraan.hari || 0);
}

export function calcPelaksanaTotal(p: PelaksanaPerjadin): number {
  return (
    calcTiketTotal(p) +
    calcHarianTotal(p) +
    calcPenginapanTotal(p) +
    calcTaksiTotal(p) +
    calcRepresentasiTotal(p) +
    calcSewaTotal(p)
  );
}

export function calcPelaksanaRiilTotal(p: PelaksanaPerjadin): number {
  // Pengeluaran Riil: Uang Harian + Penginapan 30% + Taksi Bandara + Uang Representasi (tanpa tiket/hotel 100% berbukti)
  const penginapanRiil = p.penginapan
    .filter((x) => x.isRiil30Persen)
    .reduce((sum, x) => sum + calcPenginapanItemTotal(x), 0);
  return calcHarianTotal(p) + penginapanRiil + calcTaksiTotal(p) + calcRepresentasiTotal(p);
}

export function calcRecordGrandTotal(record: PerjadinRecord): number {
  return record.pelaksana.reduce((sum, p) => sum + calcPelaksanaTotal(p), 0);
}

export const STAGE_META: Record<
  ApprovalStage,
  { label: string; shortLabel: string; colorClass: string; textClass: string; nextStage?: ApprovalStage; responsibleRole: UserRole }
> = {
  DRAFT: {
    label: 'Draft Dokumen',
    shortLabel: 'Draft',
    colorClass: 'bg-slate-100 border-slate-200',
    textClass: 'text-slate-700',
    nextStage: 'DIAJUKAN',
    responsibleRole: 'STAF_PENGAJU',
  },
  DIAJUKAN: {
    label: 'Diajukan ke Bagian Umum',
    shortLabel: 'Diajukan',
    colorClass: 'bg-amber-50 border-amber-200',
    textClass: 'text-amber-800',
    nextStage: 'TERVERIFIKASI_UMUM',
    responsibleRole: 'VERIFIKATOR_UMUM',
  },
  TERVERIFIKASI_UMUM: {
    label: 'Terverifikasi Bagian Umum',
    shortLabel: 'Terverifikasi Umum',
    colorClass: 'bg-sky-50 border-sky-200',
    textClass: 'text-sky-800',
    nextStage: 'DISETUJUI_BENDAHARA',
    responsibleRole: 'BENDAHARA',
  },
  DISETUJUI_BENDAHARA: {
    label: 'Disetujui Bendahara (Siap Bayar)',
    shortLabel: 'Disetujui Bendahara',
    colorClass: 'bg-indigo-50 border-indigo-200',
    textClass: 'text-indigo-800',
    nextStage: 'DISETUJUI_KPA',
    responsibleRole: 'PA_KPA',
  },
  DISETUJUI_KPA: {
    label: 'Disetujui PA/KPA (Lunas / Selesai)',
    shortLabel: 'Selesai / Lunas',
    colorClass: 'bg-emerald-50 border-emerald-200',
    textClass: 'text-emerald-800',
    responsibleRole: 'PA_KPA',
  },
  REVISI: {
    label: 'Perlu Revisi Staf',
    shortLabel: 'Revisi',
    colorClass: 'bg-rose-50 border-rose-200',
    textClass: 'text-rose-800',
    nextStage: 'DIAJUKAN',
    responsibleRole: 'STAF_PENGAJU',
  },
};

export const ROLE_LABELS: Record<UserRole, { label: string; officerName: string; nip: string }> = {
  STAF_PENGAJU: {
    label: 'Staf / Pelaksana Perjadin',
    officerName: 'Operator Bagian Umum Setda',
    nip: '-',
  },
  VERIFIKATOR_UMUM: {
    label: 'Verifikator / Kabag Umum (KPA/PPTK)',
    officerName: 'LALU RIFHANDANI, S.IP',
    nip: '198807132007011001',
  },
  BENDAHARA: {
    label: 'Bendahara Pengeluaran Setda',
    officerName: 'MUHAMMAD MUSTAAN',
    nip: '197404282005011009',
  },
  PA_KPA: {
    label: 'Pengguna Anggaran / KPA',
    officerName: 'Drs. H. FAUZAN HUSNIADI, M.M',
    nip: '197408161994021002',
  },
};

export const KATEGORI_LABELS: Record<JabatanKategori, string> = {
  KDH_WKDH: 'Bupati / Wakil Bupati / Pimpinan DPRD',
  SEKDA_ESELON_II: 'Anggota DPRD / Sekda / Pejabat Eselon II',
  ESELON_III: 'Pejabat Eselon III / Golongan IV',
  ESELON_IV_STAF: 'Pejabat Eselon IV / Gol. III, II, I / Non-ASN',
};

export function formatTanggalIndo(isoDate: string): string {
  if (!isoDate) return '';
  const bulan = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2];
  return `${day} ${bulan[monthIdx] || ''} ${year}`;
}

export function getMonthNameIndo(isoDate: string): string {
  if (!isoDate) return '';
  const bulan = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const parts = isoDate.split('-');
  if (parts.length !== 3) return '';
  const monthIdx = parseInt(parts[1], 10) - 1;
  return bulan[monthIdx] || '';
}
