export type ShsVersion = 'NEW_2026' | 'OLD_2026';

export type JabatanKategori = 'KDH_WKDH' | 'SEKDA_ESELON_II' | 'ESELON_III' | 'ESELON_IV_STAF';

export type ApprovalStage =
  | 'DRAFT'
  | 'DIAJUKAN'
  | 'TERVERIFIKASI_UMUM'
  | 'DISETUJUI_BENDAHARA'
  | 'DISETUJUI_KPA'
  | 'REVISI';

export type UserRole =
  | 'STAF_PENGAJU'
  | 'VERIFIKATOR_UMUM'
  | 'BENDAHARA'
  | 'PA_KPA';

export type KopLaporanType = 'SETDA' | 'GARUDA';

export interface ShsProvinceRate {
  no: number;
  provinsi: string;
  uangHarian: number;
  taksiOld: number;
  taksiNew: number;
  penginapanOld: {
    KDH_WKDH: number;
    SEKDA_ESELON_II: number;
    ESELON_III: number;
    ESELON_IV_STAF: number;
  };
  penginapanNew: {
    KDH_WKDH: number;
    SEKDA_ESELON_II: number;
    ESELON_III: number;
    ESELON_IV_STAF: number;
  };
}

export interface TiketItem {
  id: string;
  rute: string;
  harga: number;
  qty: number;
  satuan: 'Orang' | 'Kali';
}

export interface PenginapanItem {
  id: string;
  label: string; // e.g., "Jakarta" or "11 - 12 Mei 2026"
  provinsi: string;
  hargaSatuan: number;
  malam: number;
  isRiil30Persen: boolean;
}

export interface HarianItem {
  id: string;
  provinsi: string;
  hargaSatuan: number;
  hari: number;
}

export interface TaksiItem {
  id: string;
  ruteAtauProvinsi: string;
  hargaSatuan: number;
  kali: number;
}

export interface PelaksanaPerjadin {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  kategori: JabatanKategori;
  nomorSpd: string;
  tanggalSpd: string;
  nomorSt: string;
  tanggalSt: string;
  tiket: TiketItem[];
  harian: HarianItem[];
  penginapan: PenginapanItem[];
  taksi: TaksiItem[];
  representasi: {
    aktif: boolean;
    label: string;
    hargaSatuan: number;
    hari: number;
  };
  sewaKendaraan: {
    aktif: boolean;
    label: string;
    hargaSatuan: number;
    hari: number;
  };
}

export interface ApprovalHistoryItem {
  id: string;
  timestamp: string;
  actorRole: UserRole;
  actorName: string;
  fromStage: ApprovalStage;
  toStage: ApprovalStage;
  note: string;
}

export interface LaporanSppdData {
  kopType: KopLaporanType;
  dasarStList: { nomor: string; tanggal: string }[];
  dasarSpdList: { nomor: string; tanggal: string }[];
  waktuPelaksanaanText: string;
  kegiatanRingkas: string;
  hasilPerjalananDinas: string;
  rekomendasiTindakLanjut: string;
  kesimpulan: string;
  tanggalLaporan: string;
  dokumentasiFotos: { id: string; caption: string; dataUrl: string }[];
}

export interface PejabatPenandatangan {
  paKpaNama: string;
  paKpaNip: string;
  paKpaJabatan: string;
  kpaPptkNama: string;
  bendaharaNama: string;
  bendaharaNip: string;
  penerimaUangNama: string;
  penerimaUangJabatan: string;
  penerimaUangAlamat: string;
}

export interface PerjadinRecord {
  id: string;
  kodeArsip: string;
  noBku: string;
  tanggalKwitansi: string;
  tahunAnggaran: string;
  programKode: string;
  programNama: string;
  kegiatanKode: string;
  kegiatanNama: string;
  subKegiatanKode: string;
  subKegiatanNama: string;
  kodeRekening: string;
  uraianRekening: string;
  shsVersion: ShsVersion;
  provinsiTujuan: string;
  lokasiTujuan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  lamaHari: number;
  uraianTugas: string;
  untukPembayaran: string;
  status: ApprovalStage;
  pejabat: PejabatPenandatangan;
  pelaksana: PelaksanaPerjadin[];
  laporanSppd: LaporanSppdData;
  history: ApprovalHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  recordId: string;
  kodeArsip: string;
  title: string;
  message: string;
  stage: ApprovalStage;
  targetRole: UserRole | 'ALL';
  actorName: string;
  createdAt: string;
  read: boolean;
}
