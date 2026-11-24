import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit3,
  FileSpreadsheet,
  Trash2,
  ArrowRight,
  Bell,
  Building2,
  Shield,
} from 'lucide-react';
import { PerjadinRecord, AppNotification } from '../types';
import {
  calcRecordGrandTotal,
  formatRupiah,
  formatTanggalIndo,
  STAGE_META,
} from '../utils/formatters';
import { exportSinglePerjadinToExcel } from '../utils/excelExport';

interface DashboardViewProps {
  records: PerjadinRecord[];
  notifications: AppNotification[];
  onCreateNew: () => void;
  onEditRecord: (record: PerjadinRecord) => void;
  onPreviewRecord: (record: PerjadinRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onGoToApproval: () => void;
  onGoToShs: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  notifications,
  onCreateNew,
  onEditRecord,
  onPreviewRecord,
  onDeleteRecord,
  onGoToApproval,
  onGoToShs,
}) => {
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.kodeArsip.toLowerCase().includes(q) ||
        r.noBku.toLowerCase().includes(q) ||
        r.uraianTugas.toLowerCase().includes(q) ||
        r.lokasiTujuan.toLowerCase().includes(q) ||
        r.pejabat.penerimaUangNama.toLowerCase().includes(q)
    );
  }, [records, search]);

  const totalRealisasi = records.reduce((s, r) => s + calcRecordGrandTotal(r), 0);
  const completedCount = records.filter((r) => r.status === 'DISETUJUI_KPA').length;
  const pendingCount = records.filter((r) => r.status !== 'DISETUJUI_KPA').length;
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      {/* Hero Banner using Uploaded Kantor Bupati Lombok Barat Background & Logo */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 min-h-[200px] flex items-end">
        <img
          src="/assets/aistudio/kantor_lobar_82404e58.jpeg"
          alt="Kantor Sekretariat Daerah Kabupaten Lombok Barat"
          className="absolute inset-0 w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(95deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.78) 55%, rgba(15, 23, 42, 0.45) 100%)',
          }}
        />
        <div className="relative z-10 w-full p-6 md:p-7 flex flex-wrap items-center justify-between gap-5 text-white">
          <div className="flex items-center gap-4 max-w-2xl">
            <img
              src="/assets/aistudio/logo_lobar_5ed90816.jpg"
              alt="Logo Kabupaten Lombok Barat"
              className="w-16 h-20 object-contain rounded-lg bg-white/95 p-1.5 shadow-sm shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-sky-300">
                Bagian Umum · Sekretariat Daerah Kabupaten Lombok Barat
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-0.5">
                Sistem Administrasi Perjalanan Dinas Terpadu
              </h1>
              <p className="text-xs md:text-[13px] text-slate-200 mt-1 leading-relaxed">
                Kuitansi, Daftar Penerimaan, Pengeluaran Riil, SPTJM, dan Laporan SPPD (KOP SETDA &amp; KOP GARUDA) mengacu pada OLD &amp; NEW SHS 2026.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onGoToShs}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition-colors cursor-pointer"
            >
              Cek Tarif SHS 2026
            </button>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat SPPD Baru
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Realisasi SPPD</div>
          <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{formatRupiah(totalRealisasi, true)}</div>
          <div className="text-[11px] text-slate-500 mt-1">{records.length} berkas SPPD tercatat</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Menunggu Persetujuan</div>
          <div className="text-xl font-bold text-amber-700 tabular-nums mt-1">{pendingCount} Berkas</div>
          <div className="text-[11px] text-slate-500 mt-1">Verifikasi Umum, Bendahara, atau KPA</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Disetujui Final / Lunas</div>
          <div className="text-xl font-bold text-emerald-700 tabular-nums mt-1">{completedCount} Berkas</div>
          <div className="text-[11px] text-slate-500 mt-1">Siap cetak &amp; arsip pertanggungjawaban</div>
        </div>

        <div
          onClick={onGoToApproval}
          className="bg-white border border-slate-200 hover:border-sky-300 rounded-xl p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            <span>Notifikasi Tahapan</span>
            <Bell className="w-3.5 h-3.5 text-sky-700" />
          </div>
          <div className="text-xl font-bold text-sky-700 tabular-nums mt-1">{unreadNotifCount} Belum Dibaca</div>
          <div className="text-[11px] text-sky-700 font-medium mt-1 inline-flex items-center gap-1">
            <span>Buka Alur Persetujuan</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main SPPD Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Daftar Berkas Administrasi Perjalanan Dinas</h2>
            <p className="text-xs text-slate-500">
              Setiap baris memuat Kuitansi, Daftar Penerimaan, Pengeluaran Riil, SPTJM, dan Laporan SPPD.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode arsip, nama, tujuan..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                <th className="px-4 py-3 font-semibold">Kode &amp; No. BKU</th>
                <th className="px-4 py-3 font-semibold min-w-[240px]">Kegiatan &amp; Pelaksana</th>
                <th className="px-4 py-3 font-semibold">Tujuan &amp; Tanggal</th>
                <th className="px-4 py-3 font-semibold">SHS &amp; KOP Laporan</th>
                <th className="px-4 py-3 font-semibold">Status Persetujuan</th>
                <th className="px-4 py-3 font-semibold text-right">Total Nilai</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => {
                const total = calcRecordGrandTotal(r);
                const meta = STAGE_META[r.status];
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-mono font-bold text-slate-900">{r.kodeArsip}</div>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">{r.noBku}</div>
                    </td>
                    <td className="px-4 py-3.5 align-top max-w-md">
                      <div className="font-semibold text-slate-900 line-clamp-2">{r.uraianTugas}</div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        a.n. <span className="font-medium text-slate-700">{r.pejabat.penerimaUangNama}</span> ({r.pelaksana.length} orang)
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      <div className="font-medium text-slate-800">{r.provinsiTujuan}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {formatTanggalIndo(r.tanggalMulai)} ({r.lamaHari} hr)
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      <div className="text-slate-800 font-medium">
                        {r.shsVersion === 'NEW_2026' ? 'NEW SHS 2026' : 'OLD SHS 2026'}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        {r.laporanSppd.kopType === 'GARUDA' ? (
                          <>
                            <Shield className="w-3 h-3 text-amber-600" />
                            <span>KOP GARUDA</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3 h-3 text-sky-700" />
                            <span>KOP SETDA</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      <span className={`font-semibold ${meta.textClass}`}>{meta.shortLabel}</span>
                    </td>
                    <td className="px-4 py-3.5 align-top text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                      {formatRupiah(total, true)}
                    </td>
                    <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onPreviewRecord(r)}
                          className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-lg border border-transparent hover:border-sky-200 cursor-pointer"
                          title="Pratinjau & Cetak 5 Dokumen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditRecord(r)}
                          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 cursor-pointer"
                          title="Edit Berkas"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exportSinglePerjadinToExcel(r)}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-200 cursor-pointer"
                          title="Export Excel (.xlsx)"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                        {confirmDeleteId === r.id ? (
                          <div className="inline-flex items-center gap-1 ml-1 bg-rose-50 border border-rose-200 rounded-lg px-2 py-0.5">
                            <button
                              onClick={() => {
                                onDeleteRecord(r.id);
                                setConfirmDeleteId(null);
                              }}
                              className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                            >
                              Hapus
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer ml-1"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(r.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 cursor-pointer"
                            title="Hapus Berkas"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Tidak ada dokumen yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
