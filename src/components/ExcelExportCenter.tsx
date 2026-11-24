import React from 'react';
import { FileSpreadsheet, Download, Table2, Layers, BookOpen } from 'lucide-react';
import { PerjadinRecord } from '../types';
import {
  exportAllRecordsToExcel,
  exportShsComparisonToExcel,
  exportSinglePerjadinToExcel,
} from '../utils/excelExport';
import { calcRecordGrandTotal, formatRupiah, formatTanggalIndo, STAGE_META } from '../utils/formatters';

interface ExcelExportCenterProps {
  records: PerjadinRecord[];
}

export const ExcelExportCenter: React.FC<ExcelExportCenterProps> = ({ records }) => {
  const totalBudget = records.reduce((s, r) => s + calcRecordGrandTotal(r), 0);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Menu Export Excel (.xlsx) Administrasi Perjalanan Dinas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unduh buku kerja Excel resmi berisi Kuitansi, Daftar Penerimaan, Rekap Pengeluaran Riil, SPTJM, Laporan SPPD, serta Standar Harga Satuan (OLD &amp; NEW SHS 2026).
          </p>
        </div>

        <button
          onClick={() => exportAllRecordsToExcel(records)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Rekapitulasi Seluruh SPPD (.xlsx)
        </button>
      </div>

      {/* 3 Main Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Table2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Rekapitulasi BKU &amp; Pelaksana</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mengekspor seluruh {records.length} berkas SPPD beserta rincian biaya per pelaksana (Tiket, Uang Harian, Hotel 30%/100%, Taksi, Representasi, Sewa) dengan total{' '}
              <span className="font-semibold text-slate-900">{formatRupiah(totalBudget, true)}</span>.
            </p>
          </div>
          <button
            onClick={() => exportAllRecordsToExcel(records)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Unduh Rekap BKU (.xlsx)
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Paket Lengkap 5 Sheet Per SPPD</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Setiap SPPD di bawah menghasilkan 1 file Excel dengan 5 tab lengkap: <span className="font-medium">1. Kuitansi</span>,{' '}
              <span className="font-medium">2. Daftar Penerimaan</span>, <span className="font-medium">3. Pengeluaran Riil</span>,{' '}
              <span className="font-medium">4. SPTJM</span>, dan <span className="font-medium">5. Laporan SPPD</span>.
            </p>
          </div>
          <div className="text-[11px] text-slate-500">Pilih berkas pada daftar tabel di bawah untuk mengunduh.</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Referensi OLD vs NEW SHS 2026</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mengekspor tabel lengkap perbandingan 38 provinsi mencakup Uang Harian, Biaya Taksi OLD/NEW, serta plafon Hotel 4 tingkatan jabatan.
            </p>
          </div>
          <button
            onClick={exportShsComparisonToExcel}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Unduh Matriks SHS 2026 (.xlsx)
          </button>
        </div>
      </div>

      {/* Per-Record Export Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Unduh Paket Excel Per Berkas SPPD</h3>
          <span className="text-xs text-slate-500">{records.length} berkas tersedia</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                <th className="px-4 py-3 font-semibold">Kode / No. BKU</th>
                <th className="px-4 py-3 font-semibold">Pelaksana &amp; Tujuan</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Acuan SHS &amp; KOP</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Total Nilai</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-900">{r.kodeArsip}</div>
                    <div className="font-mono text-[11px] text-slate-500">{r.noBku}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{r.pejabat.penerimaUangNama}</div>
                    <div className="text-[11px] text-slate-500">
                      {r.lokasiTujuan} · {r.pelaksana.length} pelaksana
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {formatTanggalIndo(r.tanggalMulai)} – {formatTanggalIndo(r.tanggalSelesai)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">
                      {r.shsVersion === 'NEW_2026' ? 'NEW SHS 2026' : 'OLD SHS 2026'}
                    </div>
                    <div className="text-[11px] text-slate-500">KOP {r.laporanSppd.kopType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${STAGE_META[r.status].textClass}`}>
                      {STAGE_META[r.status].shortLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-slate-900">
                    {formatRupiah(calcRecordGrandTotal(r), true)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => exportSinglePerjadinToExcel(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold rounded-lg cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      5 Sheet (.xlsx)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
