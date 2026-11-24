import React, { useState } from 'react';
import { Printer, FileSpreadsheet, CheckCircle2, Building2, Shield } from 'lucide-react';
import { PerjadinRecord, KopLaporanType } from '../types';
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
  formatRupiah,
  formatTanggalIndo,
  toTerbilangAngka,
  toTerbilangRupiah,
} from '../utils/formatters';
import { exportSinglePerjadinToExcel } from '../utils/excelExport';

interface DocumentPreviewSuiteProps {
  record: PerjadinRecord;
  onUpdateKopType: (recordId: string, kopType: KopLaporanType) => void;
}

type DocTab = 'KUITANSI' | 'DAFTAR' | 'RIIL' | 'SPTJM' | 'LAPORAN';

function GarudaEmblemSvg() {
  return (
    <svg viewBox="0 0 120 120" className="w-16 h-16 mx-auto mb-1" aria-label="Lambang Garuda Pancasila">
      <defs>
        <linearGradient id="garudaGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="50%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
      </defs>
      {/* Wings */}
      <path
        d="M60 22 C44 20 26 26 12 38 C16 42 22 44 28 45 C20 48 15 52 14 57 C20 58 26 58 32 57 C24 62 20 67 20 72 C27 72 34 69 40 65 L48 86 L60 92 L72 86 L80 65 C86 69 93 72 100 72 C100 67 96 62 88 57 C94 58 100 58 106 57 C105 52 100 48 92 45 C98 44 104 42 108 38 C94 26 76 20 60 22 Z"
        fill="url(#garudaGold)"
        stroke="#713f12"
        strokeWidth="1.5"
      />
      {/* Head & Neck */}
      <circle cx="60" cy="21" r="7" fill="url(#garudaGold)" stroke="#713f12" strokeWidth="1.3" />
      <path d="M65 19 L72 21 L66 24 Z" fill="#b45309" />
      {/* Tail */}
      <path d="M52 84 L48 102 L60 98 L72 102 L68 84 Z" fill="url(#garudaGold)" stroke="#713f12" strokeWidth="1.3" />
      {/* Shield */}
      <path
        d="M46 40 H74 V60 C74 71 60 79 60 79 C60 79 46 71 46 60 Z"
        fill="#ffffff"
        stroke="#713f12"
        strokeWidth="2"
      />
      <line x1="60" y1="40" x2="60" y2="79" stroke="#713f12" strokeWidth="1.4" />
      <line x1="46" y1="54" x2="74" y2="54" stroke="#713f12" strokeWidth="1.8" />
      {/* Center star */}
      <polygon points="60,47 62,52 67,52 63,55 64,60 60,57 56,60 57,55 53,52 58,52" fill="#eab308" stroke="#713f12" strokeWidth="0.8" />
      {/* Ribbon */}
      <path d="M36 96 Q60 108 84 96 L82 104 Q60 115 38 104 Z" fill="#ffffff" stroke="#713f12" strokeWidth="1.2" />
      <text x="60" y="103" textAnchor="middle" fontSize="5.2" fontWeight="bold" fill="#1e293b">
        BHINNEKA TUNGGAL IKA
      </text>
    </svg>
  );
}

function KopSetdaHeader() {
  return (
    <div className="border-b-[3px] border-double border-black pb-2 mb-4 flex items-center gap-4">
      <div className="w-16 h-20 shrink-0 flex items-center justify-center">
        <img
          src="/assets/aistudio/logo_lobar_5ed90816.jpg"
          alt="Logo Kabupaten Lombok Barat"
          className="w-16 h-20 object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 text-center font-doc-sans leading-tight text-black">
        <div className="text-[12px] font-bold tracking-wide">PEMERINTAH KABUPATEN LOMBOK BARAT</div>
        <div className="text-[18px] font-extrabold tracking-wide">SEKRETARIAT DAERAH</div>
        <div className="text-[10px]">
          Jl. Soekarno Hatta Giri Menang - Gerung Telp. (0370) 81311, 681673
        </div>
        <div className="text-[10px]">Fax : (0370) 640655, 681674 Kode Pos 83363</div>
        <div className="text-[9.5px]">Laman : www.lombokbaratkab.go.id</div>
        <div className="text-[9.5px]">Posel : sekretariat@lombokbaratkab.go.id</div>
      </div>
      <div className="w-16 shrink-0" />
    </div>
  );
}

function KopGarudaHeader() {
  return (
    <div className="border-b-[4px] border-black pb-2 mb-5 text-center font-doc-serif text-black">
      <GarudaEmblemSvg />
      <div className="text-[19px] font-bold tracking-wider uppercase mt-1">BUPATI LOMBOK BARAT</div>
    </div>
  );
}

export const DocumentPreviewSuite: React.FC<DocumentPreviewSuiteProps> = ({ record, onUpdateKopType }) => {
  const [activeTab, setActiveTab] = useState<DocTab>('KUITANSI');
  const [selectedPelaksanaIdx, setSelectedPelaksanaIdx] = useState<number>(0);

  const grandTotal = calcRecordGrandTotal(record);
  const currentPelaksana = record.pelaksana[selectedPelaksanaIdx] || record.pelaksana[0];
  const repPelaksanaList = record.pelaksana.filter((p) => p.representasi.aktif);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action & Sub-Tab Toolbar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
          {(
            [
              { id: 'KUITANSI', label: '1. Kuitansi' },
              { id: 'DAFTAR', label: '2. Daftar Penerimaan' },
              { id: 'RIIL', label: '3. Pengeluaran Riil' },
              { id: 'SPTJM', label: '4. SPTJM' },
              { id: 'LAPORAN', label: '5. Laporan SPPD' },
            ] as { id: DocTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'LAPORAN' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg mr-1">
              <button
                onClick={() => onUpdateKopType(record.id, 'SETDA')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  record.laporanSppd.kopType === 'SETDA'
                    ? 'bg-sky-700 text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                KOP SETDA
              </button>
              <button
                onClick={() => onUpdateKopType(record.id, 'GARUDA')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  record.laporanSppd.kopType === 'GARUDA'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                KOP GARUDA
              </button>
            </div>
          )}

          <button
            onClick={() => exportSinglePerjadinToExcel(record)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel (.xlsx)
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* Traveler Selector for Riil / SPTJM when multiple travelers exist */}
      {(activeTab === 'RIIL' || activeTab === 'SPTJM') && record.pelaksana.length > 0 && (
        <div className="no-print bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-600 font-medium">
            Pilih Pelaksana untuk Pratinjau {activeTab === 'RIIL' ? 'Pengeluaran Riil' : 'SPTJM'}:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {record.pelaksana.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedPelaksanaIdx(idx)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  selectedPelaksanaIdx === idx
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {idx + 1}. {p.nama}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* A4 Sheet Canvas */}
      <div className="bg-slate-200/70 p-4 md:p-8 rounded-xl overflow-x-auto">
        <div className="print-only-area bg-white text-black mx-auto w-[210mm] min-h-[297mm] p-[14mm] shadow-md border border-slate-300 font-doc-sans text-[11px] leading-snug">
          {/* 1. KUITANSI */}
          {activeTab === 'KUITANSI' && (
            <div>
              <KopSetdaHeader />

              <div className="grid grid-cols-12 gap-x-2 gap-y-1 text-[10.5px] mb-4">
                <div className="col-span-2">No BKU</div>
                <div className="col-span-5">: {record.noBku}</div>
                <div className="col-span-2">Tahun Anggaran</div>
                <div className="col-span-3">: {record.tahunAnggaran}</div>

                <div className="col-span-2">Tanggal</div>
                <div className="col-span-5">: {formatTanggalIndo(record.tanggalKwitansi)}</div>
                <div className="col-span-2">KPA/PPTK</div>
                <div className="col-span-3">: {record.pejabat.kpaPptkNama}</div>

                <div className="col-span-2">Program</div>
                <div className="col-span-3 font-mono text-[10px]">: {record.programKode}</div>
                <div className="col-span-7">: {record.programNama}</div>

                <div className="col-span-2">Kegiatan</div>
                <div className="col-span-3 font-mono text-[10px]">: {record.kegiatanKode}</div>
                <div className="col-span-7">: {record.kegiatanNama}</div>

                <div className="col-span-2">Sub Kegiatan</div>
                <div className="col-span-3 font-mono text-[10px]">: {record.subKegiatanKode}</div>
                <div className="col-span-7">: {record.subKegiatanNama}</div>

                <div className="col-span-2">Kode Rekening</div>
                <div className="col-span-3 font-mono text-[10px]">: {record.kodeRekening}</div>
                <div className="col-span-7">: {record.uraianRekening}</div>
              </div>

              <div className="text-center my-4">
                <span className="text-[18px] font-extrabold italic underline tracking-wider">KUITANSI</span>
              </div>

              <table className="w-full text-[11px] mb-5">
                <tbody>
                  <tr>
                    <td className="w-[140px] py-1 align-top">Telah Terima Dari</td>
                    <td className="w-[14px] py-1 align-top">:</td>
                    <td className="py-1 font-bold">Bendahara Pengeluaran Setda Kabupaten Lombok Barat</td>
                  </tr>
                  <tr>
                    <td className="py-1 align-top">Banyaknya Uang</td>
                    <td className="py-1 align-top">:</td>
                    <td className="py-1 font-bold italic">{toTerbilangRupiah(grandTotal)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 align-top">Untuk Pembayaran</td>
                    <td className="py-1 align-top">:</td>
                    <td className="py-1 text-justify leading-relaxed">{record.untukPembayaran}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex items-center gap-4 my-6">
                <div className="w-[140px] font-bold italic text-[13px]">Terbilang</div>
                <div className="font-bold text-[13px]">:</div>
                <div className="flex items-center justify-between w-[240px] border-b-[3px] border-double border-black pb-1 font-bold italic text-[14px]">
                  <span>Rp</span>
                  <span className="tabular-nums">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8 text-[10.5px]">
                <div className="text-center">
                  <div>Mengetahui/Menyetujui</div>
                  <div>{record.pejabat.paKpaJabatan},</div>
                  <div className="h-16 flex items-center justify-center">
                    {record.status === 'DISETUJUI_KPA' && (
                      <span className="text-[9px] text-emerald-700 border border-emerald-600 px-1.5 py-0.5 font-semibold">
                        DISETUJUI DIGITAL
                      </span>
                    )}
                  </div>
                  <div className="font-bold underline">{record.pejabat.paKpaNama}</div>
                  <div>NIP. {record.pejabat.paKpaNip}</div>
                </div>

                <div className="text-center">
                  <div>Lunas dibayar</div>
                  <div>Bendahara Pengeluaran,</div>
                  <div className="h-16 flex items-center justify-center">
                    {(record.status === 'DISETUJUI_BENDAHARA' || record.status === 'DISETUJUI_KPA') && (
                      <span className="text-[9px] text-sky-700 border border-sky-600 px-1.5 py-0.5 font-semibold">
                        VERIFIED BENDAHARA
                      </span>
                    )}
                  </div>
                  <div className="font-bold underline">{record.pejabat.bendaharaNama}</div>
                  <div>NIP. {record.pejabat.bendaharaNip}</div>
                </div>

                <div>
                  <div className="text-center">
                    <div>Gerung, &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {record.tanggalKwitansi.slice(0, 4)}</div>
                    <div>Yang Menerima Uang,</div>
                    <div className="h-16" />
                  </div>
                  <table className="w-full text-[10px]">
                    <tbody>
                      <tr>
                        <td className="w-14 align-top">Nama</td>
                        <td className="w-2 align-top">:</td>
                        <td className="font-bold underline">{record.pejabat.penerimaUangNama}</td>
                      </tr>
                      <tr>
                        <td className="align-top">Alamat</td>
                        <td className="align-top">:</td>
                        <td>{record.pejabat.penerimaUangAlamat || '-'}</td>
                      </tr>
                      <tr>
                        <td className="align-top">Jabatan</td>
                        <td className="align-top">:</td>
                        <td>{record.pejabat.penerimaUangJabatan}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. DAFTAR PENERIMAAN UANG PERJALANAN DINAS */}
          {activeTab === 'DAFTAR' && (
            <div>
              <div className="text-center font-bold underline text-[12px] mb-3">
                DAFTAR PENERIMAAN UANG PERJALANAN DINAS LUAR DAERAH
              </div>

              <table className="w-full text-[10.5px] mb-3">
                <tbody>
                  <tr>
                    <td className="w-[120px] py-0.5 align-top">Tgl. Pelaksanaan</td>
                    <td className="w-3 py-0.5 align-top">:</td>
                    <td className="py-0.5">
                      tanggal {formatTanggalIndo(record.tanggalMulai)} sampai dengan{' '}
                      {formatTanggalIndo(record.tanggalSelesai)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 align-top">Tujuan / Lamanya</td>
                    <td className="py-0.5 align-top">:</td>
                    <td className="py-0.5">
                      {record.lokasiTujuan} selama {record.lamaHari} ({toTerbilangAngka(record.lamaHari)}) hari
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 align-top">Uraian Tugas</td>
                    <td className="py-0.5 align-top">:</td>
                    <td className="py-0.5">{record.uraianTugas}</td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full border-collapse border-2 border-black text-[10px]">
                <thead>
                  <tr className="font-bold text-center bg-slate-50">
                    <th className="border border-black px-1.5 py-1 w-8">NO.</th>
                    <th className="border border-black px-2 py-1" colSpan={4}>
                      PENERIMA/URAIAN
                    </th>
                    <th className="border border-black px-2 py-1 w-24">
                      JUMLAH
                      <br />
                      HARGA
                    </th>
                    <th className="border border-black px-2 py-1 w-24">
                      TANDA
                      <br />
                      TANGAN
                    </th>
                  </tr>
                  <tr className="text-center font-bold text-[9.5px]">
                    <td className="border border-black py-0.5">1</td>
                    <td className="border border-black py-0.5" colSpan={4}>
                      2
                    </td>
                    <td className="border border-black py-0.5">3</td>
                    <td className="border border-black py-0.5">4</td>
                  </tr>
                </thead>
                <tbody>
                  {record.pelaksana.map((p, idx) => {
                    const pTotal = calcPelaksanaTotal(p);
                    const totalRowsCount =
                      1 +
                      (p.tiket.length > 0 ? 1 + p.tiket.length : 0) +
                      (p.harian.length > 0 ? 1 + p.harian.length : 0) +
                      (p.representasi.aktif ? 2 : 0) +
                      (p.penginapan.length > 0 ? 1 + p.penginapan.length : 0) +
                      (p.taksi.length > 0 ? 1 + p.taksi.length : 0) +
                      (p.sewaKendaraan.aktif ? 2 : 0) +
                      1;

                    let subIdxCode = 97; // 'a'
                    const nextLetter = () => String.fromCharCode(subIdxCode++);

                    return (
                      <React.Fragment key={p.id}>
                        {/* Header row per traveler */}
                        <tr className="border-t-2 border-black">
                          <td className="border border-black px-1.5 py-1 text-center font-bold align-top">
                            {idx + 1}.
                          </td>
                          <td className="border border-black px-2 py-1 font-bold" colSpan={4}>
                            <div className="underline">{p.nama}</div>
                            <div className="font-normal text-[9.5px]">NIP. {p.nip || '-'}</div>
                          </td>
                          <td
                            className="border border-black px-2 py-1 text-right font-bold tabular-nums align-middle"
                            rowSpan={totalRowsCount}
                          >
                            {formatRupiah(pTotal)}
                          </td>
                          <td
                            className="border border-black px-2 py-1 text-left align-top font-semibold"
                            rowSpan={totalRowsCount}
                          >
                            {idx + 1}.
                          </td>
                        </tr>

                        {/* Tiket Pesawat */}
                        {p.tiket.length > 0 && (
                          <>
                            <tr>
                              <td className="border border-black px-1 text-center font-bold">
                                {nextLetter()}.
                              </td>
                              <td className="border border-black px-2 py-0.5 font-bold" colSpan={3}>
                                Tiket Pesawat
                              </td>
                              <td className="border border-black px-2 py-0.5 text-right font-bold tabular-nums">
                                {formatRupiah(calcTiketTotal(p))}
                              </td>
                            </tr>
                            {p.tiket.map((t) => (
                              <tr key={t.id}>
                                <td className="border border-black px-1" />
                                <td className="border border-black px-3 py-0.5">{t.rute}</td>
                                <td className="border border-black px-2 py-0.5 text-right tabular-nums">
                                  {formatRupiah(t.harga)} &nbsp;x&nbsp; {t.qty}
                                </td>
                                <td className="border border-black px-2 py-0.5">{t.satuan}</td>
                                <td className="border border-black px-2 py-0.5 text-right tabular-nums">
                                  {formatRupiah(t.harga * t.qty)}
                                </td>
                              </tr>
                            ))}
                          </>
                        )}

                        {/* Uang Harian */}
                        {p.harian.length > 0 && (
                          <>
                            <tr>
                              <td className="border border-black px-1 text-center font-bold">
                                {nextLetter()}.
                              </td>
                              <td className="border border-black px-2 py-0.5 font-bold" colSpan={3}>
                                Uang Harian
                              </td>
                              <td className="border border-black px-2 py-0.5 text-right font-bold tabular-nums">
                                {formatRupiah(calcHarianTotal(p))}
                              </td>
                            </tr>
                            {p.harian.map((h) => (
                              <tr key={h.id}>
                                <td className="border border-black px-1" />
                                <td className="border border-black px-3 py-0.5">{h.provinsi}</td>
                                <td className="border border-black px-2 py-0.5 text-right tabular-nums">
                                  {formatRupiah(h.hargaSatuan)} &nbsp;x&nbsp; {h.hari}
                                </td>
                                <td className="border border-black px-2 py-0.5">Hari</td>
                                <td className="border border-black px-2 py-0.5 text-right tabular-nums">
                                  {formatRupiah(h.hargaSatuan * h.hari)}
                                </td>
                              </tr>
                            ))}
                          </>
                        )}

                        {/* Uang Representasi */}
                        {p.representasi.aktif && (
                          <>
                            <tr>
                              <td className="border border-black px-1 text-center font-bold">
                                {nextLetter()}.
                              </td>
                              <td className="border border-black px-2 py-0.5 font-bold" colSpan={3}>
                                Uang Representasi
                              </td>
                              <td className="border border-black px-2 py-0.5 text-right font-bold tabular-nums">
                                {formatRupiah(calcRepresentasiTotal(p))}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-black px-1" />
                              <td className="border border-black px-3 py-0.5">{p.representasi.label}</td>
                              <td className="border border-black px-2 py-0.5 text-right tabular-nums">
                                {formatRupiah(p.representasi.hargaSatuan)} &nbsp;x&nbsp; {p.representasi.hari}
                              </td>
                              <td className="border border-black px-2 py-0.5">Hari</td>
                              <td className="border border-black px-2 py-0.5 text-right tabular-nums">
                                {formatRupiah(calcRepresentasiTotal(p))}
                              </td>
                            </tr>
                          </>
                        )}

                        {/* Uang Penginapan */}
                        {p.penginapan.length > 0 && (
                          <>
                            <tr>
                              <td className="border border-black px-1 text-center font-bold">
                                {nextLetter()}.
                              </td>
                              <td className="border border-black px-2 py-0.5 font-bold" colSpan={3}>
                                Uang Penginapan
                              </td>
                              <td className="border border-black px-2 py-0.5 text-right font-bold tabular-nums">
                                {formatRupiah(calcPenginapanTotal(p))}
                              </td>
                            </tr>
                            {p.penginapan.map((pg) => (
                              <tr key={pg.id}>
                                <td className="border border-black px-1" />
                                <td className="border border-black px-3 py-0.5">{pg.label}</td>
                                <td className="border border-black px-2 py-0.5 text-right tabular-nums">
                                  {formatRupiah(pg.hargaSatuan)} &nbsp;x&nbsp; {pg.malam}
                                </td>
                                <td className="border border-black px-2 py-0.5">
                                  Malam{pg.isRiil30Persen ? ' x 30%' : ''}
                                </td>
                                <td className="border border-black px-2 py-0.5 text-right tabular-nums">
                                  {formatRupiah(calcPenginapanItemTotal(pg))}
                                </td>
                              </tr>
                            ))}
                          </>
                        )}

                        {/* Taxi Bandara */}
                        {p.taksi.length > 0 && (
                          <>
                            <tr>
                              <td className="border border-black px-1 text-center font-bold">
                                {nextLetter()}.
                              </td>
                              <td className="border border-black px-2 py-0.5 font-bold" colSpan={3}>
                                Taxi Bandara
                              </td>
                              <td className="border border-black px-2 py-0.5 text-right font-bold tabular-nums">
                                {formatRupiah(calcTaksiTotal(p))}
                              </td>
                            </tr>
                            {p.taksi.map((tx) => (
                              <tr key={tx.id}>
                                <td className="border border-black px-1" />
                                <td className="border border-black px-3 py-0.5">{tx.ruteAtauProvinsi}</td>
                                <td className="border border-black px-2 py-0.5 text-right tabular-nums">
                                  {formatRupiah(tx.hargaSatuan)} &nbsp;x&nbsp; {tx.kali}
                                </td>
                                <td className="border border-black px-2 py-0.5">Kali</td>
                                <td className="border border-black px-2 py-0.5 text-right tabular-nums">
                                  {formatRupiah(tx.hargaSatuan * tx.kali)}
                                </td>
                              </tr>
                            ))}
                          </>
                        )}

                        {/* Sewa Kendaraan */}
                        {p.sewaKendaraan.aktif && (
                          <>
                            <tr>
                              <td className="border border-black px-1 text-center font-bold">
                                {nextLetter()}.
                              </td>
                              <td className="border border-black px-2 py-0.5 font-bold" colSpan={3}>
                                Sewa Kendaraan
                              </td>
                              <td className="border border-black px-2 py-0.5 text-right font-bold tabular-nums">
                                {formatRupiah(calcSewaTotal(p))}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-black px-1" />
                              <td className="border border-black px-3 py-0.5">{p.sewaKendaraan.label}</td>
                              <td className="border border-black px-2 py-0.5 text-right tabular-nums">
                                {formatRupiah(p.sewaKendaraan.hargaSatuan)} &nbsp;x&nbsp; {p.sewaKendaraan.hari}
                              </td>
                              <td className="border border-black px-2 py-0.5">Hari</td>
                              <td className="border border-black px-2 py-0.5 text-right tabular-nums">
                                {formatRupiah(calcSewaTotal(p))}
                              </td>
                            </tr>
                          </>
                        )}

                        {/* Sub total row */}
                        <tr>
                          <td className="border border-black px-1" />
                          <td className="border border-black px-2 py-1 text-center font-bold" colSpan={3}>
                            JUMLAH
                          </td>
                          <td className="border border-black px-2 py-1 text-right font-bold tabular-nums">
                            {formatRupiah(pTotal)}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}

                  <tr className="border-t-2 border-black font-bold text-[11px] bg-slate-50">
                    <td className="border border-black py-1.5" />
                    <td className="border border-black px-2 py-1.5 text-center" colSpan={4}>
                      JUMLAH KESELURUHAN
                    </td>
                    <td className="border border-black px-2 py-1.5 text-right tabular-nums">
                      {formatRupiah(grandTotal)}
                    </td>
                    <td className="border border-black px-2 py-1.5" />
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-8 mt-8 text-center text-[10.5px]">
                <div>
                  <div className="mt-4">Mengetahui/Menyetujui</div>
                  <div>{record.pejabat.paKpaJabatan},</div>
                  <div className="h-16" />
                  <div className="font-bold underline">{record.pejabat.paKpaNama}</div>
                  <div>NIP. {record.pejabat.paKpaNip}</div>
                </div>
                <div>
                  <div>Gerung, &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {record.tanggalKwitansi.slice(0, 4)}</div>
                  <div>Lunas dibayar</div>
                  <div>Bendahara Pengeluaran,</div>
                  <div className="h-16" />
                  <div className="font-bold underline">{record.pejabat.bendaharaNama}</div>
                  <div>NIP. {record.pejabat.bendaharaNip}</div>
                </div>
              </div>
            </div>
          )}

          {/* 3. SURAT PERNYATAAN PENGELUARAN RIIL */}
          {activeTab === 'RIIL' && currentPelaksana && (
            <div className="font-doc-serif text-[12px] leading-relaxed">
              <div className="text-center font-bold underline text-[13px] mb-6">
                SURAT PERNYATAAN PENGELUARAN RIIL
              </div>

              <p className="mb-3">Yang bertanda tangan di bawah ini :</p>
              <table className="w-full mb-4 text-[12px]">
                <tbody>
                  <tr>
                    <td className="w-28 pl-4 py-0.5">Nama</td>
                    <td className="w-4 py-0.5">:</td>
                    <td className="font-semibold">{currentPelaksana.nama}</td>
                  </tr>
                  {currentPelaksana.nip && currentPelaksana.nip !== '-' && (
                    <tr>
                      <td className="pl-4 py-0.5">NIP</td>
                      <td className="py-0.5">:</td>
                      <td>{currentPelaksana.nip}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="pl-4 py-0.5 align-top">Jabatan</td>
                    <td className="py-0.5 align-top">:</td>
                    <td>{currentPelaksana.jabatan}</td>
                  </tr>
                </tbody>
              </table>

              <p className="mb-3 text-justify">
                Berdasarkan Surat Perjalanan Dinas (SPD) Nomor :{' '}
                <span className="font-bold">{currentPelaksana.nomorSpd}</span> tanggal{' '}
                {formatTanggalIndo(currentPelaksana.tanggalSpd)}, dengan ini menyatakan dengan
                sesungguhnya bahwa:
              </p>

              <p className="mb-2">
                1. Biaya di bawah ini yang tidak dapat diperoleh bukti-bukti pengeluarannya, meliputi :
              </p>

              <table className="w-full border-collapse border-2 border-black text-[11.5px] mb-4">
                <thead>
                  <tr className="font-bold text-center">
                    <th className="border border-black py-1 w-10">No</th>
                    <th className="border border-black py-1">Uraian</th>
                    <th className="border border-black py-1 w-36">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let no = 1;
                    const items: React.ReactNode[] = [];
                    if (currentPelaksana.harian.length > 0) {
                      items.push(
                        <tr key="riil-harian">
                          <td className="border border-black px-2 py-1 text-center align-top">{no++}.</td>
                          <td className="border border-black px-2 py-1">
                            <div className="font-semibold">Uang Harian</div>
                            {currentPelaksana.harian.map((h) => (
                              <div key={h.id} className="pl-4 flex justify-between max-w-md">
                                <span>{h.provinsi}</span>
                                <span className="tabular-nums">
                                  Rp &nbsp;{formatRupiah(h.hargaSatuan)} &nbsp;x&nbsp; {h.hari} Hari
                                </span>
                              </div>
                            ))}
                          </td>
                          <td className="border border-black px-2 py-1 align-bottom">
                            {currentPelaksana.harian.map((h) => (
                              <div key={h.id} className="flex justify-between tabular-nums">
                                <span>Rp</span>
                                <span>{formatRupiah(h.hargaSatuan * h.hari)}</span>
                              </div>
                            ))}
                          </td>
                        </tr>
                      );
                    }

                    const riilPenginapan = currentPelaksana.penginapan.filter((pg) => pg.isRiil30Persen);
                    if (riilPenginapan.length > 0) {
                      items.push(
                        <tr key="riil-penginapan">
                          <td className="border border-black px-2 py-1 text-center align-top">{no++}.</td>
                          <td className="border border-black px-2 py-1">
                            <div className="font-semibold">Uang Penginapan</div>
                            {riilPenginapan.map((pg) => (
                              <div key={pg.id} className="pl-4 flex justify-between max-w-md">
                                <span>{pg.provinsi}</span>
                                <span className="tabular-nums">
                                  Rp &nbsp;{formatRupiah(pg.hargaSatuan)} &nbsp;x&nbsp; {pg.malam} Malam x 30%
                                </span>
                              </div>
                            ))}
                          </td>
                          <td className="border border-black px-2 py-1 align-bottom">
                            {riilPenginapan.map((pg) => (
                              <div key={pg.id} className="flex justify-between tabular-nums">
                                <span>Rp</span>
                                <span>{formatRupiah(calcPenginapanItemTotal(pg))}</span>
                              </div>
                            ))}
                          </td>
                        </tr>
                      );
                    }

                    if (currentPelaksana.taksi.length > 0) {
                      items.push(
                        <tr key="riil-taksi">
                          <td className="border border-black px-2 py-1 text-center align-top">{no++}.</td>
                          <td className="border border-black px-2 py-1">
                            <div className="font-semibold">Taxi Bandara</div>
                            {currentPelaksana.taksi.map((tx) => (
                              <div key={tx.id} className="pl-4 flex justify-between max-w-md">
                                <span>{tx.ruteAtauProvinsi}</span>
                                <span className="tabular-nums">
                                  Rp &nbsp;{formatRupiah(tx.hargaSatuan)} &nbsp;x&nbsp; {tx.kali} Kali
                                </span>
                              </div>
                            ))}
                          </td>
                          <td className="border border-black px-2 py-1 align-bottom">
                            {currentPelaksana.taksi.map((tx) => (
                              <div key={tx.id} className="flex justify-between tabular-nums">
                                <span>Rp</span>
                                <span>{formatRupiah(tx.hargaSatuan * tx.kali)}</span>
                              </div>
                            ))}
                          </td>
                        </tr>
                      );
                    }

                    if (currentPelaksana.representasi.aktif) {
                      items.push(
                        <tr key="riil-rep">
                          <td className="border border-black px-2 py-1 text-center align-top">{no++}.</td>
                          <td className="border border-black px-2 py-1">
                            <div className="font-semibold">Uang Representasi</div>
                            <div className="pl-4 flex justify-between max-w-md">
                              <span>{currentPelaksana.representasi.label}</span>
                              <span className="tabular-nums">
                                Rp &nbsp;{formatRupiah(currentPelaksana.representasi.hargaSatuan)} &nbsp;x&nbsp;{' '}
                                {currentPelaksana.representasi.hari} Hari
                              </span>
                            </div>
                          </td>
                          <td className="border border-black px-2 py-1 align-bottom">
                            <div className="flex justify-between tabular-nums">
                              <span>Rp</span>
                              <span>{formatRupiah(calcRepresentasiTotal(currentPelaksana))}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    if (items.length === 0) {
                      items.push(
                        <tr key="empty">
                          <td colSpan={3} className="border border-black px-3 py-2 text-center italic">
                            Tidak ada komponen pengeluaran riil tanpa bukti pada pelaksana ini.
                          </td>
                        </tr>
                      );
                    }

                    return items;
                  })()}
                  <tr className="font-bold">
                    <td className="border border-black py-1" />
                    <td className="border border-black py-1 text-center">Jumlah</td>
                    <td className="border border-black px-2 py-1">
                      <div className="flex justify-between tabular-nums">
                        <span>Rp</span>
                        <span>{formatRupiah(calcPelaksanaRiilTotal(currentPelaksana))}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="mb-3 text-justify">
                2. Jumlah uang tersebut pada angka 1 di atas benar-benar dikeluarkan untuk pelaksanaan
                Perjalanan Dinas dimaksud dan apabila dikemudian hari terdapat kelebihan atas pembayaran,
                kami bersedia untuk menyetorkan kelebihan tersebut ke Kas Daerah.
              </p>

              <p className="mb-8">
                Demikian pernyataan ini kami buat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.
              </p>

              <div className="grid grid-cols-2 gap-8 text-center text-[11.5px]">
                <div>
                  <div>Mengetahui/Menyetujui</div>
                  <div>{record.pejabat.paKpaJabatan},</div>
                  <div className="h-20" />
                  <div className="font-bold underline">{record.pejabat.paKpaNama}</div>
                  <div>NIP. {record.pejabat.paKpaNip}</div>
                </div>
                <div>
                  <div>Gerung, &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {formatTanggalIndo(record.tanggalKwitansi)}</div>
                  <div>Pelaksana Perjalanan Dinas</div>
                  <div className="h-20" />
                  <div className="font-bold underline">{currentPelaksana.nama}</div>
                  {currentPelaksana.nip && currentPelaksana.nip !== '-' && (
                    <div>NIP. {currentPelaksana.nip}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM) */}
          {activeTab === 'SPTJM' && currentPelaksana && (
            <div className="font-doc-serif text-[12px] leading-relaxed">
              <div className="text-center font-bold underline text-[13px] mb-8">
                SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK
              </div>

              <p className="mb-4">Yang bertanda tangan di bawah ini :</p>
              <table className="w-full mb-6 text-[12px]">
                <tbody>
                  <tr>
                    <td className="w-28 pl-4 py-1">Nama</td>
                    <td className="w-4 py-1">:</td>
                    <td className="font-semibold">{currentPelaksana.nama}</td>
                  </tr>
                  {currentPelaksana.nip && currentPelaksana.nip !== '-' && (
                    <tr>
                      <td className="pl-4 py-1">NIP</td>
                      <td className="py-1">:</td>
                      <td>{currentPelaksana.nip}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="pl-4 py-1 align-top">Jabatan</td>
                    <td className="py-1 align-top">:</td>
                    <td>{currentPelaksana.jabatan}</td>
                  </tr>
                </tbody>
              </table>

              <p className="mb-4 text-justify indent-8">
                Menyatakan dengan sebenar-benarnya bahwa uang representasi yang dibayarkan telah
                sesuai dengan waktu pelaksanaan Perjalanan Dinas yaitu selama{' '}
                {record.lamaHari} ({toTerbilangAngka(record.lamaHari)}) hari, tanggal{' '}
                {formatTanggalIndo(record.tanggalMulai)} sampai dengan{' '}
                {formatTanggalIndo(record.tanggalSelesai)}
                {currentPelaksana.representasi.aktif
                  ? ` sebesar Rp ${formatRupiah(calcRepresentasiTotal(currentPelaksana))} (${toTerbilangRupiah(
                      calcRepresentasiTotal(currentPelaksana)
                    )}).`
                  : '.'}
              </p>

              <p className="mb-10 text-justify indent-8">
                Demikian pernyataan Tanggung Jawab Mutlak ini kami buat dengan sebenarnya, untuk
                dipergunakan sebagaimana mestinya.
              </p>

              <div className="grid grid-cols-2 gap-8 text-center text-[11.5px]">
                <div>
                  <div>Mengetahui/Menyetujui</div>
                  <div>{record.pejabat.paKpaJabatan},</div>
                  <div className="h-20" />
                  <div className="font-bold underline">{record.pejabat.paKpaNama}</div>
                  <div>NIP. {record.pejabat.paKpaNip}</div>
                </div>
                <div>
                  <div>Gerung, &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {formatTanggalIndo(record.tanggalKwitansi)}</div>
                  <div>Pelaksana Perjalanan Dinas</div>
                  <div className="h-20" />
                  <div className="font-bold underline">{currentPelaksana.nama}</div>
                  {currentPelaksana.nip && currentPelaksana.nip !== '-' && (
                    <div>NIP. {currentPelaksana.nip}</div>
                  )}
                </div>
              </div>

              {repPelaksanaList.length === 0 && (
                <div className="no-print mt-10 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-sans text-amber-800">
                  Catatan: Pelaksana pada SPPD ini belum mengaktifkan komponen Uang Representasi. Anda tetap
                  dapat mencetak format SPTJM di atas atau mengaktifkan Uang Representasi pada menu Editor Perjadin.
                </div>
              )}
            </div>
          )}

          {/* 5. LAPORAN PELAKSANAAN PERJALANAN DINAS (KOP SETDA / KOP GARUDA) */}
          {activeTab === 'LAPORAN' && (
            <div className="font-doc-serif text-[12px] leading-relaxed">
              {record.laporanSppd.kopType === 'GARUDA' ? <KopGarudaHeader /> : <KopSetdaHeader />}

              <div className="text-center font-bold underline text-[13px] mb-5">
                LAPORAN PELAKSANAAN PERJALANAN DINAS
              </div>

              <table className="w-full text-[12px] mb-6">
                <tbody>
                  <tr>
                    <td className="w-6 py-1 align-top font-semibold">I.</td>
                    <td className="w-36 py-1 align-top font-semibold">Dasar Pelaksanaan</td>
                    <td className="w-4 py-1 align-top">:</td>
                    <td className="py-1">
                      <div className="font-semibold">1. Surat Tugas (ST)</div>
                      <div className="pl-4 space-y-0.5 mb-1">
                        {record.laporanSppd.dasarStList.map((st, i) => (
                          <div key={i}>
                            {String.fromCharCode(97 + i)}. Nomor : {st.nomor} — Tanggal : {st.tanggal}
                          </div>
                        ))}
                      </div>
                      <div className="font-semibold">2. Surat Perjalanan Dinas (SPD)</div>
                      <div className="pl-4 space-y-0.5">
                        {record.laporanSppd.dasarSpdList.map((spd, i) => (
                          <div key={i}>
                            {String.fromCharCode(97 + i)}. Nomor : {spd.nomor} — Tanggal : {spd.tanggal}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 align-top font-semibold">II.</td>
                    <td className="py-2 align-top font-semibold">Waktu Pelaksanaan</td>
                    <td className="py-2 align-top">:</td>
                    <td className="py-2">{record.laporanSppd.waktuPelaksanaanText}</td>
                  </tr>
                  <tr>
                    <td className="py-2 align-top font-semibold">III.</td>
                    <td className="py-2 align-top font-semibold">Kegiatan</td>
                    <td className="py-2 align-top">:</td>
                    <td className="py-2 text-justify">{record.laporanSppd.kegiatanRingkas}</td>
                  </tr>
                  <tr>
                    <td className="py-2 align-top font-semibold">IV.</td>
                    <td className="py-2 align-top font-semibold">Hasil Perjalanan Dinas</td>
                    <td className="py-2 align-top">:</td>
                    <td className="py-2 text-justify whitespace-pre-line">
                      {record.laporanSppd.hasilPerjalananDinas}
                      {record.laporanSppd.rekomendasiTindakLanjut && (
                        <>
                          {'\n\n'}
                          <span className="font-bold">Rekomendasi Tindak Lanjut:</span>
                          {'\n'}
                          {record.laporanSppd.rekomendasiTindakLanjut}
                        </>
                      )}
                      {record.laporanSppd.kesimpulan && (
                        <>
                          {'\n\n'}
                          <span className="font-bold">Kesimpulan:</span>
                          {'\n'}
                          {record.laporanSppd.kesimpulan}
                        </>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="mb-6">
                Demikian laporan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
              </p>

              {record.laporanSppd.kopType === 'GARUDA' ? (
                <div className="mt-6">
                  <div className="ml-auto w-72 mb-3 text-[11.5px]">
                    <div>Dibuat di &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Gerung</div>
                    <div>Pada Tanggal : {formatTanggalIndo(record.laporanSppd.tanggalLaporan)}</div>
                    <div className="mt-1">Yang Melaksanakan Perjalanan Dinas,</div>
                  </div>
                  <table className="w-full border-collapse border border-black text-[11.5px]">
                    <thead>
                      <tr className="font-bold text-center">
                        <th className="border border-black py-1 w-12">No.</th>
                        <th className="border border-black py-1">Nama</th>
                        <th className="border border-black py-1 w-48">Tanda Tangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.pelaksana.map((p, idx) => (
                        <tr key={p.id}>
                          <td className="border border-black px-2 py-4 text-center">{idx + 1}.</td>
                          <td className="border border-black px-3 py-4">{p.nama}</td>
                          <td className="border border-black px-3 py-4" />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-8 pl-60 text-[11.5px]">
                  <div className="text-center mb-5">
                    <div>Gerung, {formatTanggalIndo(record.laporanSppd.tanggalLaporan)}</div>
                    <div>Yang Bertugas,</div>
                  </div>
                  <div className="space-y-6">
                    {record.pelaksana.map((p, idx) => (
                      <div key={p.id} className="flex items-end justify-between gap-4">
                        <div>
                          <div className="font-bold underline">
                            {idx + 1}. {p.nama}
                          </div>
                          {p.nip && p.nip !== '-' && <div className="pl-4">NIP. {p.nip}</div>}
                        </div>
                        <div className="w-36 border-b border-black" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {record.laporanSppd.dokumentasiFotos.length > 0 && (
                <div className="print-page-break mt-10 pt-6 border-t border-slate-300">
                  <div className="text-center font-bold underline text-[13px] mb-4">
                    DOKUMENTASI KEGIATAN
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {record.laporanSppd.dokumentasiFotos.map((foto) => (
                      <div key={foto.id} className="border border-slate-300 p-2 text-center">
                        <img
                          src={foto.dataUrl}
                          alt={foto.caption}
                          className="w-full h-48 object-cover mb-1.5"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-[10.5px] font-medium">{foto.caption}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sync Confirmation Strip */}
      <div className="no-print flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Seluruh dokumen (Kuitansi, Daftar Penerimaan, Pengeluaran Riil, SPTJM, dan Laporan SPPD) tersinkronisasi otomatis dari 1 sumber data.
        </span>
        <span className="font-mono">Arsip: {record.kodeArsip}</span>
      </div>
    </div>
  );
};
