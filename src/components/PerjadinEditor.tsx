import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Wand2,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Save,
  ArrowLeft,
  Building2,
  Shield,
  FileText,
  Users,
  Receipt,
} from 'lucide-react';
import {
  PerjadinRecord,
  PelaksanaPerjadin,
  ShsVersion,
  JabatanKategori,
  KopLaporanType,
} from '../types';
import {
  SHS_PROVINCE_DATA,
  getShsProvince,
  getShsPenginapanRate,
  getShsTaksiRate,
  getShsUangRepresentasi,
  PRESET_PROGRAM_KEGIATAN,
  PRESET_PEJABAT_PA_KPA,
  DEFAULT_BENDAHARA,
  DEFAULT_PPTK,
} from '../data/shsData';
import {
  calcHarianTotal,
  calcPelaksanaTotal,
  calcPenginapanItemTotal,
  calcPenginapanTotal,
  calcRecordGrandTotal,
  calcRepresentasiTotal,
  calcSewaTotal,
  calcTaksiTotal,
  calcTiketTotal,
  formatRupiah,
  formatTanggalIndo,
  KATEGORI_LABELS,
  toTerbilangAngka,
  toTerbilangRupiah,
} from '../utils/formatters';

interface PerjadinEditorProps {
  initialRecord?: PerjadinRecord | null;
  onSave: (record: PerjadinRecord, isNew: boolean) => void;
  onCancel: () => void;
}

type EditorSection = 'ANGGARAN' | 'PELAKSANA' | 'LAPORAN';

function calcDaysBetween(startIso: string, endIso: string): number {
  if (!startIso || !endIso) return 1;
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 1;
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return diff >= 1 ? diff : 1;
}

function createEmptyRecord(): PerjadinRecord {
  const today = new Date().toISOString().slice(0, 10);
  const id = `sppd-${Date.now()}`;
  const preset = PRESET_PROGRAM_KEGIATAN[0];
  const pa = PRESET_PEJABAT_PA_KPA[0];
  const prov = getShsProvince('DKI Jakarta');

  return {
    id,
    kodeArsip: `SPPD-2026-${String(Math.floor(100 + Math.random() * 899))}`,
    noBku: `/ ${new Date().getMonth() + 1} / UM / 2026`,
    tanggalKwitansi: today,
    tahunAnggaran: '2026 / PAD',
    programKode: preset.programKode,
    programNama: preset.programNama,
    kegiatanKode: preset.kegiatanKode,
    kegiatanNama: preset.kegiatanNama,
    subKegiatanKode: preset.subKegiatanKode,
    subKegiatanNama: preset.subKegiatanNama,
    kodeRekening: preset.kodeRekening,
    uraianRekening: preset.uraianRekening,
    shsVersion: 'NEW_2026',
    provinsiTujuan: 'DKI Jakarta',
    lokasiTujuan: 'Jakarta',
    tanggalMulai: today,
    tanggalSelesai: today,
    lamaHari: 1,
    uraianTugas: 'Konsultasi dan Koordinasi Pelaksanaan Tugas Pemerintahan Daerah',
    untukPembayaran: '',
    status: 'DRAFT',
    pejabat: {
      paKpaNama: pa.nama,
      paKpaNip: pa.nip,
      paKpaJabatan: 'Pengguna Anggaran/KPA',
      kpaPptkNama: DEFAULT_PPTK,
      bendaharaNama: DEFAULT_BENDAHARA.nama,
      bendaharaNip: DEFAULT_BENDAHARA.nip,
      penerimaUangNama: '',
      penerimaUangJabatan: '',
      penerimaUangAlamat: 'Gerung, Kab. Lombok Barat',
    },
    pelaksana: [
      {
        id: `pel-${Date.now()}`,
        nama: '',
        nip: '',
        jabatan: '',
        kategori: 'ESELON_IV_STAF',
        nomorSpd: '094 /  / UMUM / 2026',
        tanggalSpd: today,
        nomorSt: '090 /  / UMUM / 2026',
        tanggalSt: today,
        tiket: [
          {
            id: `tk-${Date.now()}`,
            rute: 'Lombok - Jakarta (PP)',
            harga: 0,
            qty: 1,
            satuan: 'Orang',
          },
        ],
        harian: [
          {
            id: `hr-${Date.now()}`,
            provinsi: 'DKI Jakarta',
            hargaSatuan: prov.uangHarian,
            hari: 1,
          },
        ],
        penginapan: [],
        taksi: [
          {
            id: `tx1-${Date.now()}`,
            ruteAtauProvinsi: 'NTB',
            hargaSatuan: getShsTaksiRate('Nusa Tenggara Barat', 'NEW_2026'),
            kali: 2,
          },
          {
            id: `tx2-${Date.now()}`,
            ruteAtauProvinsi: 'DKI Jakarta',
            hargaSatuan: getShsTaksiRate('DKI Jakarta', 'NEW_2026'),
            kali: 2,
          },
        ],
        representasi: { aktif: false, label: '', hargaSatuan: 0, hari: 1 },
        sewaKendaraan: { aktif: false, label: '', hargaSatuan: 0, hari: 1 },
      },
    ],
    laporanSppd: {
      kopType: 'SETDA',
      dasarStList: [{ nomor: '090 /  / UMUM / 2026', tanggal: formatTanggalIndo(today) }],
      dasarSpdList: [{ nomor: '094 /  / UMUM / 2026', tanggal: formatTanggalIndo(today) }],
      waktuPelaksanaanText: `1 (satu) hari, tanggal ${formatTanggalIndo(today)}.`,
      kegiatanRingkas: 'Konsultasi dan Koordinasi Pelaksanaan Tugas Pemerintahan Daerah.',
      hasilPerjalananDinas: '1. Koordinasi berjalan lancar sesuai agenda.\n2. Dokumen hasil pertemuan telah dihimpun.',
      rekomendasiTindakLanjut: 'Melaporkan hasil koordinasi kepada pimpinan dan menindaklanjuti sesuai ketentuan.',
      kesimpulan: 'Pelaksanaan perjalanan dinas berjalan tertib, lancar, dan akuntabel.',
      tanggalLaporan: today,
      dokumentasiFotos: [],
    },
    history: [
      {
        id: `hist-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorRole: 'STAF_PENGAJU',
        actorName: 'Operator Bagian Umum Setda',
        fromStage: 'DRAFT',
        toStage: 'DRAFT',
        note: 'Dokumen administrasi perjalanan dinas dibuat.',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const PerjadinEditor: React.FC<PerjadinEditorProps> = ({ initialRecord, onSave, onCancel }) => {
  const isNew = !initialRecord;
  const [form, setForm] = useState<PerjadinRecord>(() =>
    initialRecord ? JSON.parse(JSON.stringify(initialRecord)) : createEmptyRecord()
  );
  const [section, setSection] = useState<EditorSection>('ANGGARAN');
  const [validationError, setValidationError] = useState<string | null>(null);

  const shsProv = getShsProvince(form.provinsiTujuan);
  const grandTotal = calcRecordGrandTotal(form);

  const updateDates = (mulai: string, selesai: string) => {
    const lama = calcDaysBetween(mulai, selesai);
    setForm((prev) => ({
      ...prev,
      tanggalMulai: mulai,
      tanggalSelesai: selesai,
      lamaHari: lama,
      laporanSppd: {
        ...prev.laporanSppd,
        waktuPelaksanaanText: `${lama} (${toTerbilangAngka(lama)}) hari, tanggal ${formatTanggalIndo(mulai)} s.d. ${formatTanggalIndo(selesai)}.`,
      },
    }));
  };

  const applyPresetProgram = (index: number) => {
    const p = PRESET_PROGRAM_KEGIATAN[index];
    if (!p) return;
    setForm((prev) => ({
      ...prev,
      programKode: p.programKode,
      programNama: p.programNama,
      kegiatanKode: p.kegiatanKode,
      kegiatanNama: p.kegiatanNama,
      subKegiatanKode: p.subKegiatanKode,
      subKegiatanNama: p.subKegiatanNama,
      kodeRekening: p.kodeRekening,
      uraianRekening: p.uraianRekening,
    }));
  };

  const applyPresetPa = (index: number) => {
    const pa = PRESET_PEJABAT_PA_KPA[index];
    if (!pa) return;
    setForm((prev) => ({
      ...prev,
      pejabat: {
        ...prev.pejabat,
        paKpaNama: pa.nama,
        paKpaNip: pa.nip,
      },
    }));
  };

  const generateUntukPembayaran = () => {
    const firstNama = form.pelaksana[0]?.nama || form.pejabat.penerimaUangNama || '...';
    const dkk = form.pelaksana.length > 1 ? ' dkk.' : '.';
    const text = `Biaya Perjalanan Dinas Luar Daerah dalam rangka ${form.uraianTugas} pada ${form.lokasiTujuan} (${form.provinsiTujuan}) selama ${form.lamaHari} (${toTerbilangAngka(
      form.lamaHari
    )}) hari dari tanggal ${formatTanggalIndo(form.tanggalMulai)} sampai dengan ${formatTanggalIndo(
      form.tanggalSelesai
    )} a.n: ${firstNama}${dkk}`;
    setForm((prev) => ({
      ...prev,
      untukPembayaran: text,
      pejabat: {
        ...prev.pejabat,
        penerimaUangNama: prev.pejabat.penerimaUangNama || prev.pelaksana[0]?.nama || '',
        penerimaUangJabatan: prev.pejabat.penerimaUangJabatan || prev.pelaksana[0]?.jabatan || '',
      },
    }));
  };

  const addPelaksana = () => {
    const prov = getShsProvince(form.provinsiTujuan);
    const malamDefault = Math.max(0, form.lamaHari - 1);
    const newPel: PelaksanaPerjadin = {
      id: `pel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nama: '',
      nip: '',
      jabatan: '',
      kategori: 'ESELON_IV_STAF',
      nomorSpd: `094 /  / UMUM / ${form.tanggalKwitansi.slice(0, 4) || '2026'}`,
      tanggalSpd: form.tanggalMulai,
      nomorSt: `090 /  / UMUM / ${form.tanggalKwitansi.slice(0, 4) || '2026'}`,
      tanggalSt: form.tanggalMulai,
      tiket: [{ id: `tk-${Date.now()}`, rute: `Lombok - ${form.provinsiTujuan} (PP)`, harga: 0, qty: 1, satuan: 'Orang' }],
      harian: [{ id: `hr-${Date.now()}`, provinsi: form.provinsiTujuan, hargaSatuan: prov.uangHarian, hari: form.lamaHari }],
      penginapan:
        malamDefault > 0
          ? [
              {
                id: `pg-${Date.now()}`,
                label: form.provinsiTujuan,
                provinsi: form.provinsiTujuan,
                hargaSatuan: getShsPenginapanRate(form.provinsiTujuan, 'ESELON_IV_STAF', form.shsVersion),
                malam: malamDefault,
                isRiil30Persen: false,
              },
            ]
          : [],
      taksi: [
        {
          id: `tx1-${Date.now()}`,
          ruteAtauProvinsi: 'NTB',
          hargaSatuan: getShsTaksiRate('Nusa Tenggara Barat', form.shsVersion),
          kali: 2,
        },
        {
          id: `tx2-${Date.now()}`,
          ruteAtauProvinsi: form.provinsiTujuan,
          hargaSatuan: getShsTaksiRate(form.provinsiTujuan, form.shsVersion),
          kali: 2,
        },
      ],
      representasi: { aktif: false, label: '', hargaSatuan: 0, hari: form.lamaHari },
      sewaKendaraan: { aktif: false, label: '', hargaSatuan: 0, hari: form.lamaHari },
    };
    setForm((prev) => ({ ...prev, pelaksana: [...prev.pelaksana, newPel] }));
  };

  const removePelaksana = (pelId: string) => {
    if (form.pelaksana.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      pelaksana: prev.pelaksana.filter((p) => p.id !== pelId),
    }));
  };

  const updatePelaksana = (pelId: string, updater: (p: PelaksanaPerjadin) => PelaksanaPerjadin) => {
    setForm((prev) => ({
      ...prev,
      pelaksana: prev.pelaksana.map((p) => (p.id === pelId ? updater(p) : p)),
    }));
  };

  const applyShsToPelaksana = (pelId: string) => {
    const prov = getShsProvince(form.provinsiTujuan);
    const malamDefault = Math.max(1, form.lamaHari - 1);
    updatePelaksana(pelId, (p) => {
      const hotelRate = getShsPenginapanRate(form.provinsiTujuan, p.kategori, form.shsVersion);
      const taksiTujuanRate = getShsTaksiRate(form.provinsiTujuan, form.shsVersion);
      const taksiNtbRate = getShsTaksiRate('Nusa Tenggara Barat', form.shsVersion);
      const repRate = getShsUangRepresentasi(p.kategori);
      const repLabel =
        p.kategori === 'KDH_WKDH' ? 'KDH/WKDH' : p.kategori === 'SEKDA_ESELON_II' ? 'Eselon II' : '';

      return {
        ...p,
        harian: [
          {
            id: p.harian[0]?.id || `hr-${Date.now()}`,
            provinsi: form.provinsiTujuan,
            hargaSatuan: prov.uangHarian,
            hari: form.lamaHari,
          },
        ],
        penginapan:
          p.penginapan.length > 0
            ? p.penginapan.map((pg, idx) =>
                idx === 0
                  ? {
                      ...pg,
                      provinsi: form.provinsiTujuan,
                      label: pg.label || form.provinsiTujuan,
                      hargaSatuan: hotelRate,
                      malam: pg.malam || malamDefault,
                    }
                  : pg
              )
            : [
                {
                  id: `pg-${Date.now()}`,
                  label: form.provinsiTujuan,
                  provinsi: form.provinsiTujuan,
                  hargaSatuan: hotelRate,
                  malam: malamDefault,
                  isRiil30Persen: false,
                },
              ],
        taksi: [
          {
            id: `tx-ntb-${Date.now()}`,
            ruteAtauProvinsi: 'NTB',
            hargaSatuan: taksiNtbRate,
            kali: 2,
          },
          {
            id: `tx-dest-${Date.now()}`,
            ruteAtauProvinsi: form.provinsiTujuan,
            hargaSatuan: taksiTujuanRate,
            kali: 2,
          },
        ],
        representasi:
          repRate > 0
            ? {
                aktif: true,
                label: repLabel,
                hargaSatuan: repRate,
                hari: form.lamaHari,
              }
            : { aktif: false, label: '', hargaSatuan: 0, hari: 0 },
      };
    });
  };

  const syncDasarLaporanFromPelaksana = () => {
    const stList = form.pelaksana
      .filter((p) => p.nomorSt.trim())
      .map((p) => ({ nomor: p.nomorSt, tanggal: formatTanggalIndo(p.tanggalSt) }));
    const spdList = form.pelaksana
      .filter((p) => p.nomorSpd.trim())
      .map((p) => ({ nomor: p.nomorSpd, tanggal: formatTanggalIndo(p.tanggalSpd) }));

    setForm((prev) => ({
      ...prev,
      laporanSppd: {
        ...prev.laporanSppd,
        dasarStList: stList.length > 0 ? stList : prev.laporanSppd.dasarStList,
        dasarSpdList: spdList.length > 0 ? spdList : prev.laporanSppd.dasarSpdList,
        kegiatanRingkas: prev.uraianTugas,
        waktuPelaksanaanText: `${prev.lamaHari} (${toTerbilangAngka(prev.lamaHari)}) hari, tanggal ${formatTanggalIndo(
          prev.tanggalMulai
        )} s.d. ${formatTanggalIndo(prev.tanggalSelesai)}.`,
      },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setForm((prev) => ({
            ...prev,
            laporanSppd: {
              ...prev.laporanSppd,
              dokumentasiFotos: [
                ...prev.laporanSppd.dokumentasiFotos,
                {
                  id: `foto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  caption: file.name.replace(/\.[^/.]+$/, ''),
                  dataUrl: reader.result as string,
                },
              ],
            },
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pelaksana.some((p) => p.nama.trim().length > 0)) {
      setValidationError('Minimal satu nama pelaksana perjalanan dinas wajib diisi.');
      setSection('PELAKSANA');
      return;
    }
    const finalRecord: PerjadinRecord = {
      ...form,
      pejabat: {
        ...form.pejabat,
        penerimaUangNama: form.pejabat.penerimaUangNama.trim() || form.pelaksana[0].nama,
        penerimaUangJabatan: form.pejabat.penerimaUangJabatan.trim() || form.pelaksana[0].jabatan,
      },
      untukPembayaran:
        form.untukPembayaran.trim() ||
        `Biaya Perjalanan Dinas Luar Daerah dalam rangka ${form.uraianTugas} pada ${form.lokasiTujuan} selama ${form.lamaHari} (${toTerbilangAngka(
          form.lamaHari
        )}) hari dari tanggal ${formatTanggalIndo(form.tanggalMulai)} sampai dengan ${formatTanggalIndo(
          form.tanggalSelesai
        )} a.n: ${form.pelaksana[0].nama}${form.pelaksana.length > 1 ? ' dkk.' : '.'}`,
      updatedAt: new Date().toISOString(),
    };
    setValidationError(null);
    onSave(finalRecord, isNew);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isNew ? 'Buat Dokumen Perjalanan Dinas Baru' : `Edit Berkas ${form.kodeArsip}`}
            </h2>
            <p className="text-xs text-slate-500">
              Otomatis terhubung ke Kuitansi, Daftar Penerimaan, Pengeluaran Riil, SPTJM, dan Laporan SPPD ({form.laporanSppd.kopType === 'GARUDA' ? 'KOP GARUDA' : 'KOP SETDA'}).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] text-slate-500 uppercase tracking-wide">Total Anggaran SPPD</div>
            <div className="text-lg font-bold text-sky-700 tabular-nums">{formatRupiah(grandTotal, true)}</div>
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Dokumen
          </button>
        </div>
      </div>

      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Section Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {(
          [
            {
              id: 'ANGGARAN',
              title: '1. Anggaran, Tujuan & Acuan SHS',
              desc: 'Kode BKU, Rekening, Pejabat, Provinsi & Standar Harga',
              icon: Receipt,
            },
            {
              id: 'PELAKSANA',
              title: `2. Pelaksana & Rincian Biaya (${form.pelaksana.length})`,
              desc: 'Tiket, Uang Harian, Hotel (30% Riil), Taksi & Representasi',
              icon: Users,
            },
            {
              id: 'LAPORAN',
              title: `3. Laporan SPPD (KOP ${form.laporanSppd.kopType})`,
              desc: 'Dasar ST/SPD, Hasil Perjadin, Rekomendasi & Dokumentasi',
              icon: FileText,
            },
          ] as { id: EditorSection; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[]
        ).map((tab) => {
          const Icon = tab.icon;
          const active = section === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                active
                  ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.title}</span>
              </div>
              <div className={`text-[11px] mt-1 ${active ? 'text-sky-100' : 'text-slate-500'}`}>{tab.desc}</div>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: ANGGARAN & SHS */}
      {section === 'ANGGARAN' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Identitas BKU & Rekening */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Identitas Kuitansi & Anggaran</h3>
              <div className="flex gap-1.5">
                {PRESET_PROGRAM_KEGIATAN.map((pr, idx) => (
                  <button
                    key={pr.kegiatanKode}
                    type="button"
                    onClick={() => applyPresetProgram(idx)}
                    className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                  >
                    {idx === 0 ? 'Preset Setda' : 'Preset KDH/WKDH'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kode Arsip Internal</label>
                <input
                  type="text"
                  value={form.kodeArsip}
                  onChange={(e) => setForm({ ...form, kodeArsip: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-sky-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor BKU</label>
                <input
                  type="text"
                  value={form.noBku}
                  onChange={(e) => setForm({ ...form, noBku: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-sky-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Kuitansi</label>
                <input
                  type="date"
                  value={form.tanggalKwitansi}
                  onChange={(e) => setForm({ ...form, tanggalKwitansi: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tahun Anggaran</label>
                <input
                  type="text"
                  value={form.tahunAnggaran}
                  onChange={(e) => setForm({ ...form, tahunAnggaran: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kode Sub Kegiatan</label>
                <input
                  type="text"
                  value={form.subKegiatanKode}
                  onChange={(e) => setForm({ ...form, subKegiatanKode: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs font-mono border border-slate-200 rounded-lg"
                />
              </div>
              <div className="col-span-8">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Sub Kegiatan</label>
                <input
                  type="text"
                  value={form.subKegiatanNama}
                  onChange={(e) => setForm({ ...form, subKegiatanNama: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kode Rekening</label>
                <input
                  type="text"
                  value={form.kodeRekening}
                  onChange={(e) => setForm({ ...form, kodeRekening: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs font-mono border border-slate-200 rounded-lg"
                />
              </div>
              <div className="col-span-8">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Uraian Rekening</label>
                <input
                  type="text"
                  value={form.uraianRekening}
                  onChange={(e) => setForm({ ...form, uraianRekening: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">Pejabat Penandatangan Kuitansi & SPTJM</h4>
                <div className="flex gap-1">
                  {PRESET_PEJABAT_PA_KPA.map((pa, idx) => (
                    <button
                      key={pa.nip}
                      type="button"
                      onClick={() => applyPresetPa(idx)}
                      className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                    >
                      {pa.nama.split(' ')[2] || pa.nama.slice(0, 10)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">PA / KPA</label>
                  <input
                    type="text"
                    value={form.pejabat.paKpaNama}
                    onChange={(e) =>
                      setForm({ ...form, pejabat: { ...form.pejabat, paKpaNama: e.target.value } })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">NIP PA / KPA</label>
                  <input
                    type="text"
                    value={form.pejabat.paKpaNip}
                    onChange={(e) =>
                      setForm({ ...form, pejabat: { ...form.pejabat, paKpaNip: e.target.value } })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bendahara Pengeluaran</label>
                  <input
                    type="text"
                    value={form.pejabat.bendaharaNama}
                    onChange={(e) =>
                      setForm({ ...form, pejabat: { ...form.pejabat, bendaharaNama: e.target.value } })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">KPA / PPTK</label>
                  <input
                    type="text"
                    value={form.pejabat.kpaPptkNama}
                    onChange={(e) =>
                      setForm({ ...form, pejabat: { ...form.pejabat, kpaPptkNama: e.target.value } })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Yang Menerima Uang (Utama)</label>
                  <input
                    type="text"
                    placeholder="Otomatis dari pelaksana 1 jika kosong"
                    value={form.pejabat.penerimaUangNama}
                    onChange={(e) =>
                      setForm({ ...form, pejabat: { ...form.pejabat, penerimaUangNama: e.target.value } })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jabatan Penerima</label>
                  <input
                    type="text"
                    value={form.pejabat.penerimaUangJabatan}
                    onChange={(e) =>
                      setForm({ ...form, pejabat: { ...form.pejabat, penerimaUangJabatan: e.target.value } })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tujuan, Tanggal & Acuan SHS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Tujuan, Jadwal & Standar Harga Satuan (SHS)</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Acuan Tarif SHS 2026</label>
                <select
                  value={form.shsVersion}
                  onChange={(e) => setForm({ ...form, shsVersion: e.target.value as ShsVersion })}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50"
                >
                  <option value="NEW_2026">NEW SHS PERJADIN 2026 (38 Provinsi)</option>
                  <option value="OLD_2026">OLD SHS PERJADIN 2026 (34 Provinsi)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Provinsi Tujuan (Acuan SHS)</label>
                <select
                  value={form.provinsiTujuan}
                  onChange={(e) => setForm({ ...form, provinsiTujuan: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                >
                  {SHS_PROVINCE_DATA.map((p) => (
                    <option key={p.no} value={p.provinsi}>
                      {p.no}. {p.provinsi}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live SHS Ceiling Reference Strip */}
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs space-y-1.5">
              <div className="font-bold text-sky-900 flex items-center justify-between">
                <span>
                  Acuan {form.shsVersion === 'NEW_2026' ? 'NEW SHS 2026' : 'OLD SHS 2026'} — {shsProv.provinsi}
                </span>
                <span className="font-mono text-[11px] text-sky-700">
                  Harian: {formatRupiah(shsProv.uangHarian, true)} · Taksi:{' '}
                  {formatRupiah(getShsTaksiRate(shsProv.provinsi, form.shsVersion), true)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-700 tabular-nums">
                <div>
                  <span className="text-slate-500 block">Hotel KDH/WKDH</span>
                  <span className="font-semibold">
                    {formatRupiah(getShsPenginapanRate(shsProv.provinsi, 'KDH_WKDH', form.shsVersion), true)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hotel Sekda/Es.II</span>
                  <span className="font-semibold">
                    {formatRupiah(getShsPenginapanRate(shsProv.provinsi, 'SEKDA_ESELON_II', form.shsVersion), true)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hotel Es.III/Gol.IV</span>
                  <span className="font-semibold">
                    {formatRupiah(getShsPenginapanRate(shsProv.provinsi, 'ESELON_III', form.shsVersion), true)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hotel Es.IV/Staf</span>
                  <span className="font-semibold">
                    {formatRupiah(getShsPenginapanRate(shsProv.provinsi, 'ESELON_IV_STAF', form.shsVersion), true)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kota / Lokasi Tujuan Lengkap</label>
              <input
                type="text"
                value={form.lokasiTujuan}
                onChange={(e) => setForm({ ...form, lokasiTujuan: e.target.value })}
                placeholder="Contoh: Kabupaten Bangli, Provinsi Bali"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Berangkat</label>
                <input
                  type="date"
                  value={form.tanggalMulai}
                  onChange={(e) => updateDates(e.target.value, form.tanggalSelesai)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Kembali</label>
                <input
                  type="date"
                  value={form.tanggalSelesai}
                  onChange={(e) => updateDates(form.tanggalMulai, e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lama (Hari)</label>
                <input
                  type="number"
                  min={1}
                  value={form.lamaHari}
                  onChange={(e) => setForm({ ...form, lamaHari: Math.max(1, Number(e.target.value) || 1) })}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Uraian Tugas / Maksud Perjalanan Dinas</label>
              <textarea
                rows={2}
                value={form.uraianTugas}
                onChange={(e) => setForm({ ...form, uraianTugas: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Redaksi &ldquo;Untuk Pembayaran&rdquo; pada Kuitansi
                </label>
                <button
                  type="button"
                  onClick={generateUntukPembayaran}
                  className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Buat Redaksi Otomatis
                </button>
              </div>
              <textarea
                rows={3}
                value={form.untukPembayaran}
                onChange={(e) => setForm({ ...form, untukPembayaran: e.target.value })}
                placeholder="Klik 'Buat Redaksi Otomatis' setelah mengisi daftar pelaksana..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
              <div className="text-[11px] text-slate-500 mt-1 italic">
                Banyaknya uang (terbilang): {toTerbilangRupiah(grandTotal)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PELAKSANA & RINCIAN BIAYA */}
      {section === 'PELAKSANA' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Pelaksana & Rincian Biaya ({form.shsVersion === 'NEW_2026' ? 'NEW SHS 2026' : 'OLD SHS 2026'} — {form.provinsiTujuan})
              </h3>
              <p className="text-xs text-slate-500">
                Gunakan tombol &ldquo;Terapkan Tarif SHS&rdquo; di tiap pelaksana untuk mengisi Uang Harian, Plafon Hotel, Taksi, dan Uang Representasi sesuai kategori jabatan.
              </p>
            </div>
            <button
              type="button"
              onClick={addPelaksana}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Pelaksana
            </button>
          </div>

          {form.pelaksana.map((pel, idx) => {
            const pelTotal = calcPelaksanaTotal(pel);
            const hotelMax = getShsPenginapanRate(form.provinsiTujuan, pel.kategori, form.shsVersion);
            const taksiMax = getShsTaksiRate(form.provinsiTujuan, form.shsVersion);
            const overHotel = pel.penginapan.some((pg) => pg.hargaSatuan > getShsPenginapanRate(pg.provinsi || form.provinsiTujuan, pel.kategori, form.shsVersion));

            return (
              <div key={pel.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                {/* Pelaksana Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {pel.nama || `Pelaksana #${idx + 1} (Belum diisi)`}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {KATEGORI_LABELS[pel.kategori]} · Plafon Hotel SHS: {formatRupiah(hotelMax, true)} · Plafon Taksi Tujuan: {formatRupiah(taksiMax, true)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-sky-700 tabular-nums mr-2">
                      Subtotal: {formatRupiah(pelTotal, true)}
                    </span>
                    <button
                      type="button"
                      onClick={() => applyShsToPelaksana(pel.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      Terapkan Tarif SHS
                    </button>
                    {form.pelaksana.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePelaksana(pel.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 cursor-pointer"
                        title="Hapus Pelaksana"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {overHotel && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Peringatan SHS: Salah satu tarif penginapan melebihi batas maksimal {form.shsVersion === 'NEW_2026' ? 'NEW SHS 2026' : 'OLD SHS 2026'} untuk kategori jabatan ini.
                    </span>
                  </div>
                )}

                {/* Identity & SPD/ST */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={pel.nama}
                      onChange={(e) => updatePelaksana(pel.id, (p) => ({ ...p, nama: e.target.value }))}
                      placeholder="Contoh: Hj. NURUL ADHA"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">NIP (isi &ldquo;-&rdquo; jika Non-ASN/KDH)</label>
                    <input
                      type="text"
                      value={pel.nip}
                      onChange={(e) => updatePelaksana(pel.id, (p) => ({ ...p, nip: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jabatan</label>
                    <input
                      type="text"
                      value={pel.jabatan}
                      onChange={(e) => updatePelaksana(pel.id, (p) => ({ ...p, jabatan: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kategori Golongan SHS</label>
                    <select
                      value={pel.kategori}
                      onChange={(e) =>
                        updatePelaksana(pel.id, (p) => ({ ...p, kategori: e.target.value as JabatanKategori }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <option value="KDH_WKDH">Bupati / Wabup / Pimpinan DPRD</option>
                      <option value="SEKDA_ESELON_II">Sekda / Anggota DPRD / Eselon II</option>
                      <option value="ESELON_III">Pejabat Eselon III / Gol. IV</option>
                      <option value="ESELON_IV_STAF">Eselon IV / Gol. III-I / Non-ASN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor SPD</label>
                    <input
                      type="text"
                      value={pel.nomorSpd}
                      onChange={(e) => updatePelaksana(pel.id, (p) => ({ ...p, nomorSpd: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal SPD</label>
                    <input
                      type="date"
                      value={pel.tanggalSpd}
                      onChange={(e) => updatePelaksana(pel.id, (p) => ({ ...p, tanggalSpd: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor Surat Tugas (ST)</label>
                    <input
                      type="text"
                      value={pel.nomorSt}
                      onChange={(e) => updatePelaksana(pel.id, (p) => ({ ...p, nomorSt: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal ST</label>
                    <input
                      type="date"
                      value={pel.tanggalSt}
                      onChange={(e) => updatePelaksana(pel.id, (p) => ({ ...p, tanggalSt: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Cost Grids */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                  {/* a. Tiket Pesawat */}
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        a. Tiket Pesawat ({formatRupiah(calcTiketTotal(pel), true)})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updatePelaksana(pel.id, (p) => ({
                            ...p,
                            tiket: [
                              ...p.tiket,
                              { id: `tk-${Date.now()}`, rute: 'Lombok - Tujuan', harga: 0, qty: 1, satuan: 'Orang' },
                            ],
                          }))
                        }
                        className="text-[11px] text-sky-700 font-semibold hover:underline cursor-pointer"
                      >
                        + Rute Tiket
                      </button>
                    </div>
                    {pel.tiket.map((t) => (
                      <div key={t.id} className="grid grid-cols-12 gap-1.5 items-center">
                        <input
                          type="text"
                          value={t.rute}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              tiket: p.tiket.map((x) => (x.id === t.id ? { ...x, rute: e.target.value } : x)),
                            }))
                          }
                          placeholder="Rute"
                          className="col-span-5 px-2 py-1 text-xs border border-slate-200 rounded"
                        />
                        <input
                          type="number"
                          value={t.harga}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              tiket: p.tiket.map((x) =>
                                x.id === t.id ? { ...x, harga: Number(e.target.value) || 0 } : x
                              ),
                            }))
                          }
                          placeholder="Harga"
                          className="col-span-4 px-2 py-1 text-xs font-mono border border-slate-200 rounded text-right"
                        />
                        <input
                          type="number"
                          min={1}
                          value={t.qty}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              tiket: p.tiket.map((x) =>
                                x.id === t.id ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x
                              ),
                            }))
                          }
                          className="col-span-2 px-2 py-1 text-xs font-mono border border-slate-200 rounded text-center"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              tiket: p.tiket.filter((x) => x.id !== t.id),
                            }))
                          }
                          className="col-span-1 text-rose-500 hover:text-rose-700 flex justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* b. Uang Harian */}
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        b. Uang Harian ({formatRupiah(calcHarianTotal(pel), true)})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updatePelaksana(pel.id, (p) => ({
                            ...p,
                            harian: [
                              ...p.harian,
                              {
                                id: `hr-${Date.now()}`,
                                provinsi: form.provinsiTujuan,
                                hargaSatuan: shsProv.uangHarian,
                                hari: form.lamaHari,
                              },
                            ],
                          }))
                        }
                        className="text-[11px] text-sky-700 font-semibold hover:underline cursor-pointer"
                      >
                        + Baris Harian
                      </button>
                    </div>
                    {pel.harian.map((h) => (
                      <div key={h.id} className="grid grid-cols-12 gap-1.5 items-center">
                        <input
                          type="text"
                          value={h.provinsi}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              harian: p.harian.map((x) => (x.id === h.id ? { ...x, provinsi: e.target.value } : x)),
                            }))
                          }
                          className="col-span-5 px-2 py-1 text-xs border border-slate-200 rounded"
                        />
                        <input
                          type="number"
                          value={h.hargaSatuan}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              harian: p.harian.map((x) =>
                                x.id === h.id ? { ...x, hargaSatuan: Number(e.target.value) || 0 } : x
                              ),
                            }))
                          }
                          className="col-span-4 px-2 py-1 text-xs font-mono border border-slate-200 rounded text-right"
                        />
                        <input
                          type="number"
                          min={1}
                          value={h.hari}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              harian: p.harian.map((x) =>
                                x.id === h.id ? { ...x, hari: Math.max(1, Number(e.target.value) || 1) } : x
                              ),
                            }))
                          }
                          className="col-span-2 px-2 py-1 text-xs font-mono border border-slate-200 rounded text-center"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              harian: p.harian.filter((x) => x.id !== h.id),
                            }))
                          }
                          className="col-span-1 text-rose-500 hover:text-rose-700 flex justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* c. Uang Penginapan */}
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        c. Uang Penginapan ({formatRupiah(calcPenginapanTotal(pel), true)})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updatePelaksana(pel.id, (p) => ({
                            ...p,
                            penginapan: [
                              ...p.penginapan,
                              {
                                id: `pg-${Date.now()}`,
                                label: form.provinsiTujuan,
                                provinsi: form.provinsiTujuan,
                                hargaSatuan: hotelMax,
                                malam: Math.max(1, form.lamaHari - 1),
                                isRiil30Persen: false,
                              },
                            ],
                          }))
                        }
                        className="text-[11px] text-sky-700 font-semibold hover:underline cursor-pointer"
                      >
                        + Penginapan
                      </button>
                    </div>
                    {pel.penginapan.map((pg) => (
                      <div key={pg.id} className="space-y-1 bg-slate-50 p-2 rounded border border-slate-100">
                        <div className="grid grid-cols-12 gap-1.5 items-center">
                          <input
                            type="text"
                            value={pg.label}
                            onChange={(e) =>
                              updatePelaksana(pel.id, (p) => ({
                                ...p,
                                penginapan: p.penginapan.map((x) =>
                                  x.id === pg.id ? { ...x, label: e.target.value } : x
                                ),
                              }))
                            }
                            placeholder="Lokasi / Tgl"
                            className="col-span-5 px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                          />
                          <input
                            type="number"
                            value={pg.hargaSatuan}
                            onChange={(e) =>
                              updatePelaksana(pel.id, (p) => ({
                                ...p,
                                penginapan: p.penginapan.map((x) =>
                                  x.id === pg.id ? { ...x, hargaSatuan: Number(e.target.value) || 0 } : x
                                ),
                              }))
                            }
                            className="col-span-4 px-2 py-1 text-xs font-mono border border-slate-200 rounded bg-white text-right"
                          />
                          <input
                            type="number"
                            min={1}
                            value={pg.malam}
                            onChange={(e) =>
                              updatePelaksana(pel.id, (p) => ({
                                ...p,
                                penginapan: p.penginapan.map((x) =>
                                  x.id === pg.id ? { ...x, malam: Math.max(1, Number(e.target.value) || 1) } : x
                                ),
                              }))
                            }
                            className="col-span-2 px-2 py-1 text-xs font-mono border border-slate-200 rounded bg-white text-center"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updatePelaksana(pel.id, (p) => ({
                                ...p,
                                penginapan: p.penginapan.filter((x) => x.id !== pg.id),
                              }))
                            }
                            className="col-span-1 text-rose-500 hover:text-rose-700 flex justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pg.isRiil30Persen}
                              onChange={(e) =>
                                updatePelaksana(pel.id, (p) => ({
                                  ...p,
                                  penginapan: p.penginapan.map((x) =>
                                    x.id === pg.id ? { ...x, isRiil30Persen: e.target.checked } : x
                                  ),
                                }))
                              }
                            />
                            <span>Hitung 30% (Tanpa Bukti Hotel — masuk Pengeluaran Riil)</span>
                          </label>
                          <span className="font-mono font-semibold text-slate-800">
                            {formatRupiah(calcPenginapanItemTotal(pg), true)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* d. Taxi Bandara */}
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        d. Taxi Bandara ({formatRupiah(calcTaksiTotal(pel), true)})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updatePelaksana(pel.id, (p) => ({
                            ...p,
                            taksi: [
                              ...p.taksi,
                              { id: `tx-${Date.now()}`, ruteAtauProvinsi: form.provinsiTujuan, hargaSatuan: taksiMax, kali: 2 },
                            ],
                          }))
                        }
                        className="text-[11px] text-sky-700 font-semibold hover:underline cursor-pointer"
                      >
                        + Baris Taksi
                      </button>
                    </div>
                    {pel.taksi.map((tx) => (
                      <div key={tx.id} className="grid grid-cols-12 gap-1.5 items-center">
                        <input
                          type="text"
                          value={tx.ruteAtauProvinsi}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              taksi: p.taksi.map((x) =>
                                x.id === tx.id ? { ...x, ruteAtauProvinsi: e.target.value } : x
                              ),
                            }))
                          }
                          className="col-span-5 px-2 py-1 text-xs border border-slate-200 rounded"
                        />
                        <input
                          type="number"
                          value={tx.hargaSatuan}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              taksi: p.taksi.map((x) =>
                                x.id === tx.id ? { ...x, hargaSatuan: Number(e.target.value) || 0 } : x
                              ),
                            }))
                          }
                          className="col-span-4 px-2 py-1 text-xs font-mono border border-slate-200 rounded text-right"
                        />
                        <input
                          type="number"
                          min={1}
                          value={tx.kali}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              taksi: p.taksi.map((x) =>
                                x.id === tx.id ? { ...x, kali: Math.max(1, Number(e.target.value) || 1) } : x
                              ),
                            }))
                          }
                          className="col-span-2 px-2 py-1 text-xs font-mono border border-slate-200 rounded text-center"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              taksi: p.taksi.filter((x) => x.id !== tx.id),
                            }))
                          }
                          className="col-span-1 text-rose-500 hover:text-rose-700 flex justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Representasi & Sewa Kendaraan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <label className="flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={pel.representasi.aktif}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              representasi: {
                                ...p.representasi,
                                aktif: e.target.checked,
                                label:
                                  p.representasi.label ||
                                  (p.kategori === 'KDH_WKDH' ? 'KDH/WKDH' : 'Eselon II'),
                                hargaSatuan:
                                  p.representasi.hargaSatuan || getShsUangRepresentasi(p.kategori) || 150000,
                                hari: p.representasi.hari || form.lamaHari,
                              },
                            }))
                          }
                        />
                        <span>e. Uang Representasi (Otomatis SPTJM)</span>
                      </span>
                      <span className="font-mono text-sky-700">
                        {formatRupiah(calcRepresentasiTotal(pel), true)}
                      </span>
                    </label>
                    {pel.representasi.aktif && (
                      <div className="grid grid-cols-12 gap-2">
                        <input
                          type="text"
                          value={pel.representasi.label}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              representasi: { ...p.representasi, label: e.target.value },
                            }))
                          }
                          placeholder="KDH/WKDH / Eselon II"
                          className="col-span-5 px-2 py-1 text-xs border border-slate-200 rounded"
                        />
                        <input
                          type="number"
                          value={pel.representasi.hargaSatuan}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              representasi: { ...p.representasi, hargaSatuan: Number(e.target.value) || 0 },
                            }))
                          }
                          className="col-span-4 px-2 py-1 text-xs font-mono border border-slate-200 rounded text-right"
                        />
                        <input
                          type="number"
                          min={1}
                          value={pel.representasi.hari}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              representasi: { ...p.representasi, hari: Math.max(1, Number(e.target.value) || 1) },
                            }))
                          }
                          className="col-span-3 px-2 py-1 text-xs font-mono border border-slate-200 rounded text-center"
                        />
                      </div>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <label className="flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={pel.sewaKendaraan.aktif}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              sewaKendaraan: {
                                ...p.sewaKendaraan,
                                aktif: e.target.checked,
                                label: p.sewaKendaraan.label || form.provinsiTujuan,
                                hargaSatuan: p.sewaKendaraan.hargaSatuan || 1300000,
                                hari: p.sewaKendaraan.hari || form.lamaHari,
                              },
                            }))
                          }
                        />
                        <span>f. Sewa Kendaraan Dalam Kota</span>
                      </span>
                      <span className="font-mono text-sky-700">{formatRupiah(calcSewaTotal(pel), true)}</span>
                    </label>
                    {pel.sewaKendaraan.aktif && (
                      <div className="grid grid-cols-12 gap-2">
                        <input
                          type="text"
                          value={pel.sewaKendaraan.label}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              sewaKendaraan: { ...p.sewaKendaraan, label: e.target.value },
                            }))
                          }
                          className="col-span-5 px-2 py-1 text-xs border border-slate-200 rounded"
                        />
                        <input
                          type="number"
                          value={pel.sewaKendaraan.hargaSatuan}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              sewaKendaraan: { ...p.sewaKendaraan, hargaSatuan: Number(e.target.value) || 0 },
                            }))
                          }
                          className="col-span-4 px-2 py-1 text-xs font-mono border border-slate-200 rounded text-right"
                        />
                        <input
                          type="number"
                          min={1}
                          value={pel.sewaKendaraan.hari}
                          onChange={(e) =>
                            updatePelaksana(pel.id, (p) => ({
                              ...p,
                              sewaKendaraan: { ...p.sewaKendaraan, hari: Math.max(1, Number(e.target.value) || 1) },
                            }))
                          }
                          className="col-span-3 px-2 py-1 text-xs font-mono border border-slate-200 rounded text-center"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 3: LAPORAN SPPD KOP GARUDA / KOP SETDA */}
      {section === 'LAPORAN' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pengaturan Laporan Pelaksanaan Perjalanan Dinas</h3>
              <p className="text-xs text-slate-500">
                Terhubung langsung dengan data ST, SPD, dan daftar tanda tangan pelaksana. Pilih KOP SETDA atau KOP GARUDA sesuai pejabat yang melaksanakan perjalanan dinas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={syncDasarLaporanFromPelaksana}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Sinkronkan Dasar ST/SPD
              </button>
              <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                {(
                  [
                    { id: 'SETDA', label: 'KOP SETDA', icon: Building2 },
                    { id: 'GARUDA', label: 'KOP GARUDA', icon: Shield },
                  ] as { id: KopLaporanType; label: string; icon: React.ComponentType<{ className?: string }> }[]
                ).map((k) => {
                  const Icon = k.icon;
                  const active = form.laporanSppd.kopType === k.id;
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          laporanSppd: { ...prev.laporanSppd, kopType: k.id },
                        }))
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        active
                          ? k.id === 'GARUDA'
                            ? 'bg-amber-600 text-white'
                            : 'bg-sky-700 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {k.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Waktu Pelaksanaan (Teks Laporan)</label>
              <input
                type="text"
                value={form.laporanSppd.waktuPelaksanaanText}
                onChange={(e) =>
                  setForm({
                    ...form,
                    laporanSppd: { ...form.laporanSppd, waktuPelaksanaanText: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Laporan (Gerung)</label>
              <input
                type="date"
                value={form.laporanSppd.tanggalLaporan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    laporanSppd: { ...form.laporanSppd, tanggalLaporan: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">II. Kegiatan</label>
            <textarea
              rows={2}
              value={form.laporanSppd.kegiatanRingkas}
              onChange={(e) =>
                setForm({
                  ...form,
                  laporanSppd: { ...form.laporanSppd, kegiatanRingkas: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">III. Hasil Perjalanan Dinas</label>
            <textarea
              rows={6}
              value={form.laporanSppd.hasilPerjalananDinas}
              onChange={(e) =>
                setForm({
                  ...form,
                  laporanSppd: { ...form.laporanSppd, hasilPerjalananDinas: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">IV. Rekomendasi Tindak Lanjut</label>
              <textarea
                rows={4}
                value={form.laporanSppd.rekomendasiTindakLanjut}
                onChange={(e) =>
                  setForm({
                    ...form,
                    laporanSppd: { ...form.laporanSppd, rekomendasiTindakLanjut: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">V. Kesimpulan</label>
              <textarea
                rows={4}
                value={form.laporanSppd.kesimpulan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    laporanSppd: { ...form.laporanSppd, kesimpulan: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Dokumentasi Foto Upload */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Dokumentasi Kegiatan (Lampiran Laporan SPPD)</h4>
                <p className="text-[11px] text-slate-500">Unggah foto kegiatan untuk otomatis dicetak pada bagian Dokumentasi Kegiatan.</p>
              </div>
              <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Unggah Foto
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            {form.laporanSppd.dokumentasiFotos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {form.laporanSppd.dokumentasiFotos.map((foto) => (
                  <div key={foto.id} className="border border-slate-200 rounded-lg p-2 space-y-2">
                    <img
                      src={foto.dataUrl}
                      alt={foto.caption}
                      className="w-full h-36 object-cover rounded"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={foto.caption}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            laporanSppd: {
                              ...form.laporanSppd,
                              dokumentasiFotos: form.laporanSppd.dokumentasiFotos.map((f) =>
                                f.id === foto.id ? { ...f, caption: e.target.value } : f
                              ),
                            },
                          })
                        }
                        placeholder="Keterangan foto"
                        className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            laporanSppd: {
                              ...form.laporanSppd,
                              dokumentasiFotos: form.laporanSppd.dokumentasiFotos.filter((f) => f.id !== foto.id),
                            },
                          })
                        }
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
};
