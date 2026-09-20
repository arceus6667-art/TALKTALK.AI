import React from 'react';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  MessageSquare,
  GitCompare,
  GraduationCap,
  Sparkles,
  BarChart3,
  Settings,
  Database,
  PlusCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ActiveView, Workspace } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView?: (view: ActiveView) => void;
  onNavigate?: (view: ActiveView) => void;
  onOpenUpload: () => void;
  workspace?: Workspace;
  documentsCount?: number;
  collectionsCount?: number;
  conversationsCount?: number;
}

interface NavItemConfig {
  id: ActiveView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onNavigate,
  onOpenUpload,
  workspace,
  documentsCount,
  collectionsCount,
  conversationsCount
}) => {
  const handleNav = (view: ActiveView) => {
    if (onNavigate) {
      onNavigate(view);
    } else if (setActiveView) {
      setActiveView(view);
    }
  };

  const navItems: NavItemConfig[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'chat',
      label: 'Knowledge Chat',
      icon: MessageSquare,
      badge: 'Live',
      count: conversationsCount
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      count: documentsCount ?? workspace?.documentCount ?? workspace?.totalDocuments ?? 3
    },
    {
      id: 'collections',
      label: 'Collections',
      icon: FolderKanban,
      count: collectionsCount ?? workspace?.collectionsCount ?? 3
    },
    { id: 'compare', label: 'Document Compare', icon: GitCompare },
    { id: 'study', label: 'Study Mode', icon: GraduationCap },
    { id: 'research', label: 'Deep Research', icon: Sparkles, badge: 'AI+' },
    { id: 'analytics', label: 'RAG Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Pipeline', icon: Settings }
  ];

  const storageUsed = workspace?.storageUsedBytes || 4320000;
  const maxStorage = workspace?.maxStorageBytes || workspace?.storageQuotaBytes || 1073741824;
  const storagePercentage = Math.round((storageUsed / maxStorage) * 100);

  return (
    <aside
      id="talktalk-sidebar"
      className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between select-none h-screen sticky top-0 z-30 shrink-0"
    >
      {/* Brand Header */}
      <div>
        <div className="p-4 pb-3 border-b border-slate-800/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold text-base tracking-tight">
                T
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-100 text-base tracking-tight">TalkTalk</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Knowledge Assistant</p>
              </div>
            </div>
          </div>

          {/* Quick Ingest Button */}
          <button
            id="sidebar-upload-btn"
            onClick={onOpenUpload}
            className="mt-3.5 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all duration-150 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-2.5 space-y-0.5 overflow-y-auto max-h-[calc(100vh-280px)]">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Workspace Hub
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {item.count}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400/70" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Storage & User */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
        {/* Storage Meter */}
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px]">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <Database className="w-3 h-3 text-indigo-400" /> Vector Storage
            </span>
            <span className="font-mono text-slate-400">{storagePercentage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400">
            <span>{(storageUsed / (1024 * 1024)).toFixed(1)} MB used</span>
            <span>{(maxStorage / (1024 * 1024 * 1024)).toFixed(0)} GB quota</span>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
              TT
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-slate-200 truncate">Enterprise Team</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini 3.8 Flash
              </div>
            </div>
          </div>
          <span title="Zero Retention Gateway">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
          </span>
        </div>
      </div>
    </aside>
  );
};
