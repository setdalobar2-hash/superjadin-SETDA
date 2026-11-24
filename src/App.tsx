import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  BookOpen,
  FileSpreadsheet,
  Plus,
  Bell,
  X,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import {
  AppNotification,
  ApprovalStage,
  KopLaporanType,
  PerjadinRecord,
  UserRole,
} from './types';
import { SEED_NOTIFICATIONS, SEED_RECORDS } from './data/seedRecords';
import { ROLE_LABELS, STAGE_META } from './utils/formatters';
import { DashboardView } from './components/DashboardView';
import { DocumentPreviewSuite } from './components/DocumentPreviewSuite';
import { PerjadinEditor } from './components/PerjadinEditor';
import { ApprovalWorkflowView } from './components/ApprovalWorkflowView';
import { ShsReferenceView } from './components/ShsReferenceView';
import { ExcelExportCenter } from './components/ExcelExportCenter';

type NavView = 'DASHBOARD' | 'PREVIEW' | 'EDITOR' | 'APPROVAL' | 'SHS' | 'EXCEL';

interface ToastItem {
  id: string;
  title: string;
  message: string;
}

const STORAGE_RECORDS_KEY = 'siperjadin_lobar_records_v1';
const STORAGE_NOTIFS_KEY = 'siperjadin_lobar_notifications_v1';
const STORAGE_ROLE_KEY = 'siperjadin_lobar_role_v1';

export default function App() {
  const [records, setRecords] = useState<PerjadinRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RECORDS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback to seed
    }
    return SEED_RECORDS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NOTIFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback to seed
    }
    return SEED_NOTIFICATIONS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROLE_KEY) as UserRole | null;
      if (saved && ROLE_LABELS[saved]) return saved;
    } catch {
      // ignore
    }
    return 'VERIFIKATOR_UMUM';
  });

  const [view, setView] = useState<NavView>('DASHBOARD');
  const [activeRecordId, setActiveRecordId] = useState<string>(SEED_RECORDS[0]?.id || '');
  const [editingRecord, setEditingRecord] = useState<PerjadinRecord | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(records));
    } catch {
      // ignore storage quota errors
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ROLE_KEY, currentRole);
    } catch {
      // ignore
    }
  }, [currentRole]);

  const pushNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    const toastId = newNotif.id;
    setToasts((prev) => [...prev, { id: toastId, title: newNotif.title, message: newNotif.message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 5500);
  };

  const handleSaveRecord = (saved: PerjadinRecord, isNew: boolean) => {
    setRecords((prev) => {
      if (isNew) return [saved, ...prev];
      return prev.map((r) => (r.id === saved.id ? saved : r));
    });
    setActiveRecordId(saved.id);
    setEditingRecord(null);
    setView('PREVIEW');

    pushNotification({
      recordId: saved.id,
      kodeArsip: saved.kodeArsip,
      title: isNew ? 'Berkas SPPD Baru Dibuat' : 'Berkas SPPD Diperbarui',
      message: `${saved.kodeArsip} (${saved.lokasiTujuan}) telah ${isNew ? 'dibuat' : 'diperbarui'} dan tersinkron ke 5 dokumen.`,
      stage: saved.status,
      targetRole: 'ALL',
      actorName: ROLE_LABELS[currentRole].officerName,
    });
  };

  const handleDeleteRecord = (recordId: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
    if (activeRecordId === recordId) {
      const next = records.find((r) => r.id !== recordId);
      setActiveRecordId(next?.id || '');
    }
  };

  const handleUpdateKopType = (recordId: string, kopType: KopLaporanType) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              laporanSppd: { ...r.laporanSppd, kopType },
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleTransitionStage = (recordId: string, toStage: ApprovalStage, note: string) => {
    const targetRecord = records.find((r) => r.id === recordId);
    if (!targetRecord) return;

    const actor = ROLE_LABELS[currentRole];
    const now = new Date().toISOString();

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          status: toStage,
          updatedAt: now,
          history: [
            ...r.history,
            {
              id: `hist-${Date.now()}`,
              timestamp: now,
              actorRole: currentRole,
              actorName: actor.officerName,
              fromStage: r.status,
              toStage,
              note,
            },
          ],
        };
      })
    );

    const nextMeta = STAGE_META[toStage];
    const notifTitleMap: Record<ApprovalStage, string> = {
      DRAFT: 'Kembali ke Draft',
      DIAJUKAN: 'Pengajuan Baru — Verifikasi Bagian Umum',
      TERVERIFIKASI_UMUM: 'Lolos Verifikasi Umum → Menunggu Bendahara',
      DISETUJUI_BENDAHARA: 'Disetujui Bendahara → Menunggu Pengesahan PA/KPA',
      DISETUJUI_KPA: 'Disetujui Penuh (PA/KPA) — Lunas / Selesai',
      REVISI: 'Dokumen Dikembalikan untuk Revisi',
    };

    pushNotification({
      recordId: targetRecord.id,
      kodeArsip: targetRecord.kodeArsip,
      title: notifTitleMap[toStage],
      message: `${targetRecord.kodeArsip} (${targetRecord.pejabat.penerimaUangNama}) berubah status menjadi "${nextMeta.label}". Catatan: ${note}`,
      stage: toStage,
      targetRole: toStage === 'DISETUJUI_KPA' ? 'ALL' : nextMeta.responsibleRole,
      actorName: actor.officerName,
    });
  };

  const handleResetDemo = () => {
    setRecords(SEED_RECORDS);
    setNotifications(SEED_NOTIFICATIONS);
    setActiveRecordId(SEED_RECORDS[0].id);
    setView('DASHBOARD');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeRecord = records.find((r) => r.id === activeRecordId) || records[0];

  const navItems: { id: NavView; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'DASHBOARD', label: 'Beranda', icon: LayoutDashboard },
    { id: 'PREVIEW', label: 'Dokumen & Cetak', icon: FileText },
    { id: 'APPROVAL', label: 'Persetujuan', icon: CheckSquare, badge: unreadCount },
    { id: 'SHS', label: 'Standar Harga (SHS)', icon: BookOpen },
    { id: 'EXCEL', label: 'Export Excel', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 relative">
      {/* Subtle fixed background image of Kantor Bupati Lombok Barat with soft readability wash */}
      <div className="no-print fixed inset-0 pointer-events-none z-0 opacity-[0.06]">
        <img
          src="/assets/aistudio/kantor_lobar_82404e58.jpeg"
          alt=""
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Top Navigation Bar (3-zone contract) */}
      <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand & Crest */}
          <div
            onClick={() => setView('DASHBOARD')}
            className="flex items-center gap-3 cursor-pointer shrink-0"
          >
            <img
              src="/assets/aistudio/logo_lobar_5ed90816.jpg"
              alt="Logo Lombok Barat"
              className="w-9 h-11 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight text-slate-900">
                SIPERJADIN <span className="text-sky-700 font-bold">LOMBAR</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Bagian Umum · Setda Kab. Lombok Barat
              </div>
            </div>
          </div>

          {/* Zone 2: Primary Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-sky-50 text-sky-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-sky-700 text-white rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Notification Bell & Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                onClick={() => setNotifDrawerOpen((o) => !o)}
                className="relative p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                title="Notifikasi Persetujuan"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDrawerOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">Notifikasi Persetujuan Terbaru</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() =>
                            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                          }
                          className="text-[11px] font-semibold text-sky-700 hover:underline cursor-pointer"
                        >
                          Baca Semua
                        </button>
                      )}
                      <button
                        onClick={() => setNotifDrawerOpen(false)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                          );
                          setActiveRecordId(n.recordId);
                          setView('APPROVAL');
                          setNotifDrawerOpen(false);
                        }}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer ${
                          n.read ? 'bg-white border-slate-100' : 'bg-sky-50 border-sky-200'
                        }`}
                      >
                        <div className="font-bold text-slate-900">{n.title}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setEditingRecord(null);
                setView('EDITOR');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>SPPD Baru</span>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Secondary Nav */}
        <div className="lg:hidden border-t border-slate-100 px-3 py-1.5 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive ? 'bg-sky-50 text-sky-800' : 'text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {view === 'DASHBOARD' && (
          <DashboardView
            records={records}
            notifications={notifications}
            onCreateNew={() => {
              setEditingRecord(null);
              setView('EDITOR');
            }}
            onEditRecord={(rec) => {
              setEditingRecord(rec);
              setView('EDITOR');
            }}
            onPreviewRecord={(rec) => {
              setActiveRecordId(rec.id);
              setView('PREVIEW');
            }}
            onDeleteRecord={handleDeleteRecord}
            onGoToApproval={() => setView('APPROVAL')}
            onGoToShs={() => setView('SHS')}
          />
        )}

        {view === 'PREVIEW' && activeRecord && (
          <div className="space-y-4">
            {/* Record Switcher Bar */}
            <div className="no-print bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setView('DASHBOARD')}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Kembali ke Beranda"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Pratinjau &amp; Cetak 5 Dokumen Resmi Terpadu
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Format sesuai Kuitansi, Daftar Penerimaan, Pengeluaran Riil, SPTJM, dan Laporan SPPD (KOP SETDA / GARUDA).
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={activeRecord.id}
                  onChange={(e) => setActiveRecordId(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 max-w-xs sm:max-w-sm"
                >
                  {records.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.kodeArsip} — {r.pejabat.penerimaUangNama} ({r.provinsiTujuan})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setEditingRecord(activeRecord);
                    setView('EDITOR');
                  }}
                  className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Edit Berkas
                </button>
              </div>
            </div>

            <DocumentPreviewSuite record={activeRecord} onUpdateKopType={handleUpdateKopType} />
          </div>
        )}

        {view === 'EDITOR' && (
          <PerjadinEditor
            initialRecord={editingRecord}
            onSave={handleSaveRecord}
            onCancel={() => {
              setEditingRecord(null);
              setView('DASHBOARD');
            }}
          />
        )}

        {view === 'APPROVAL' && (
          <ApprovalWorkflowView
            records={records}
            notifications={notifications}
            currentRole={currentRole}
            onChangeRole={setCurrentRole}
            onTransitionStage={handleTransitionStage}
            onMarkNotificationRead={(id) =>
              setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
            }
            onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
            onOpenPreview={(recordId) => {
              setActiveRecordId(recordId);
              setView('PREVIEW');
            }}
          />
        )}

        {view === 'SHS' && <ShsReferenceView />}

        {view === 'EXCEL' && <ExcelExportCenter records={records} />}
      </main>

      {/* Footer */}
      <footer className="no-print relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Bagian Umum Sekretariat Daerah Kabupaten Lombok Barat · Standar Harga Satuan (OLD &amp; NEW SHS) Tahun 2026
        </div>
        <button
          onClick={handleResetDemo}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Pulihkan Data Awal</span>
        </button>
      </footer>

      {/* Automatic Stage Notification Toasts */}
      {toasts.length > 0 && (
        <div className="no-print fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full px-4 sm:px-0">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 text-white rounded-xl p-3.5 shadow-xl border border-slate-700 flex items-start justify-between gap-3"
            >
              <div>
                <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" />
                  <span>{t.title}</span>
                </div>
                <div className="text-[11px] text-slate-200 mt-1 leading-relaxed">{t.message}</div>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
