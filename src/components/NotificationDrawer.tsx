import React from 'react';
import {
  X,
  Bell,
  Radio,
  Flame,
  ExternalLink,
  Clock,
  Settings,
  Trash2,
} from 'lucide-react';
import { BreakingAlert, NewsArticle } from '../types/news';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: BreakingAlert[];
  onSelectAlert: (alert: BreakingAlert) => void;
  onOpenSettings: () => void;
  onClearAlerts: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onSelectAlert,
  onOpenSettings,
  onClearAlerts,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#070d1d] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-[#030611] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <h2 className="font-bold text-sm font-radar text-white uppercase tracking-wider">
              Radar Breaking Bulletins ({alerts.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Notification settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action sub-bar */}
        <div className="px-4 py-2 bg-[#050a17] border-b border-slate-850 flex items-center justify-between text-[11px] font-mono-radar text-slate-400">
          <span>PRIORITY DISPATCH QUEUE</span>
          {alerts.length > 0 && (
            <button
              onClick={onClearAlerts}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>CLEAR ALL</span>
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-20 text-slate-500 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs font-mono-radar">No unread breaking bulletins at this moment.</p>
              <p className="text-[11px] text-slate-600">The radar will sound and alert when new high-impact dispatches are intercepted.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert)}
                className="p-3.5 rounded-xl bg-[#0b1329] border border-red-950 hover:border-red-600/70 transition-all cursor-pointer space-y-2 group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.2 rounded font-radar uppercase tracking-wider">
                      {alert.urgency}
                    </span>
                    <span className="text-[10px] font-mono-radar text-slate-400 font-semibold">
                      {alert.category}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono-radar text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold font-radar text-white group-hover:text-red-400 transition-colors leading-snug">
                  {alert.title}
                </h4>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {alert.summary}
                </p>

                <div className="pt-1 flex items-center justify-between text-[10px] font-mono-radar text-slate-500 border-t border-slate-800">
                  <span>Source: {alert.source}</span>
                  <span className="text-red-400 group-hover:underline">VIEW REPORT &rarr;</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#030611] border-t border-slate-800 text-center">
          <button
            onClick={onOpenSettings}
            className="text-xs text-slate-400 hover:text-white font-mono-radar underline cursor-pointer"
          >
            Configure Alert Categories & Geolocation Rules
          </button>
        </div>
      </div>
    </div>
  );
};
