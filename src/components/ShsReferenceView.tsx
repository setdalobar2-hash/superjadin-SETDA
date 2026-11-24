import React, { useMemo, useState } from 'react';
import { Search, FileSpreadsheet, ArrowUpRight, Info } from 'lucide-react';
import { SHS_PROVINCE_DATA } from '../data/shsData';
import { formatRupiah } from '../utils/formatters';
import { exportShsComparisonToExcel } from '../utils/excelExport';

export const ShsReferenceView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'CHANGED' | 'NEW_PROVINCES'>('ALL');

  const filtered = useMemo(() => {
    return SHS_PROVINCE_DATA.filter((row) => {
      const matchesText = row.provinsi.toLowerCase().includes(query.trim().toLowerCase());
      if (!matchesText) return false;
      if (filterMode === 'NEW_PROVINCES') return row.no >= 35;
      if (filterMode === 'CHANGED') {
        return (
          row.taksiNew !== row.taksiOld ||
          row.penginapanNew.KDH_WKDH !== row.penginapanOld.KDH_WKDH ||
          row.penginapanNew.SEKDA_ESELON_II !== row.penginapanOld.SEKDA_ESELON_II ||
          row.penginapanNew.ESELON_III !== row.penginapanOld.ESELON_III ||
          row.penginapanNew.ESELON_IV_STAF !== row.penginapanOld.ESELON_IV_STAF
        );
      }
      return true;
    });
  }, [query, filterMode]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Standar Harga Satuan (SHS) Perjalanan Dinas Luar Daerah Tahun 2026
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perbandingan acuan <span className="font-semibold text-slate-700">OLD SHS PERJADIN 2026</span> (34 Provinsi) dan{' '}
            <span className="font-semibold text-sky-700">NEW SHS PERJADIN 2026</span> (38 Provinsi) untuk verifikasi Kuitansi, Pengeluaran Riil, dan SPTJM.
          </p>
        </div>

        <button
          onClick={exportShsComparisonToExcel}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Tabel SHS (.xlsx)
        </button>
      </div>

      {/* Policy Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Uang Representasi Luar Daerah</div>
          <div className="mt-1.5 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Bupati / Wabup / Pimpinan DPRD</span>
              <span className="font-bold font-mono text-slate-900">Rp 250.000 / hari</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Sekda / Anggota DPRD / Eselon II</span>
              <span className="font-bold font-mono text-slate-900">Rp 150.000 / hari</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Ketentuan Penginapan Tanpa Bukti</div>
          <div className="mt-1.5 text-xs text-slate-700 leading-relaxed">
            Apabila pelaksana tidak menggunakan fasilitas hotel atau tidak melampirkan bukti penginapan, dibayarkan sebesar{' '}
            <span className="font-bold text-sky-700">30%</span> dari tarif plafon SHS dan dicantumkan pada{' '}
            <span className="font-semibold">Surat Pernyataan Pengeluaran Riil</span>.
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pembaruan Penting NEW SHS 2026</div>
          <div className="mt-1.5 text-xs text-slate-700 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <span>
              Penyesuaian plafon Hotel KDH/WKDH DKI Jakarta (Rp 8.720.000), Bali (Rp 6.848.000), tarif Taksi baru, serta penambahan 4 provinsi baru Papua.
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari provinsi tujuan (mis. DKI Jakarta, Bali, Jawa Timur)..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-600"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(
            [
              { id: 'ALL', label: `Semua Provinsi (${SHS_PROVINCE_DATA.length})` },
              { id: 'CHANGED', label: 'Ada Kenaikan Tarif' },
              { id: 'NEW_PROVINCES', label: '4 Provinsi Baru (35–38)' },
            ] as { id: 'ALL' | 'CHANGED' | 'NEW_PROVINCES'; label: string }[]
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterMode === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* SHS Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px]">
                <th className="px-3 py-3 font-semibold w-10 text-center">No</th>
                <th className="px-3 py-3 font-semibold min-w-[160px]">Provinsi</th>
                <th className="px-3 py-3 font-semibold text-right">Uang Harian</th>
                <th className="px-3 py-3 font-semibold text-right">Taksi (OLD → NEW)</th>
                <th className="px-3 py-3 font-semibold text-right">Hotel KDH / WKDH (OLD → NEW)</th>
                <th className="px-3 py-3 font-semibold text-right">Hotel Sekda / Es.II (OLD → NEW)</th>
                <th className="px-3 py-3 font-semibold text-right">Hotel Es.III / Gol.IV (OLD → NEW)</th>
                <th className="px-3 py-3 font-semibold text-right">Hotel Es.IV / Staf (OLD → NEW)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.no} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2.5 text-center font-mono text-slate-500">{row.no}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-900">
                    {row.provinsi}
                    {row.no >= 35 && (
                      <span className="ml-1.5 text-[10px] font-medium text-sky-700">· Baru di NEW SHS</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums font-semibold text-slate-800">
                    {formatRupiah(row.uangHarian, true)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    <RateCell oldVal={row.taksiOld} newVal={row.taksiNew} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    <RateCell oldVal={row.penginapanOld.KDH_WKDH} newVal={row.penginapanNew.KDH_WKDH} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    <RateCell oldVal={row.penginapanOld.SEKDA_ESELON_II} newVal={row.penginapanNew.SEKDA_ESELON_II} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    <RateCell oldVal={row.penginapanOld.ESELON_III} newVal={row.penginapanNew.ESELON_III} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    <RateCell oldVal={row.penginapanOld.ESELON_IV_STAF} newVal={row.penginapanNew.ESELON_IV_STAF} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Provinsi tidak ditemukan pada tabel SHS.
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

function RateCell({ oldVal, newVal }: { oldVal: number; newVal: number }) {
  const changed = newVal !== oldVal;
  return (
    <div className="inline-flex flex-col items-end">
      <span className={`font-semibold ${changed ? 'text-sky-700' : 'text-slate-800'}`}>
        {formatRupiah(newVal, true)}
      </span>
      {changed ? (
        <span className="text-[10px] text-slate-400 inline-flex items-center gap-0.5">
          <span>OLD: {formatRupiah(oldVal)}</span>
          <ArrowUpRight className="w-2.5 h-2.5 text-emerald-600" />
        </span>
      ) : (
        <span className="text-[10px] text-slate-400">Tetap</span>
      )}
    </div>
  );
}
