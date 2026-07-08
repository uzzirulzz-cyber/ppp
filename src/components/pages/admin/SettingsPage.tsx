'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  ShieldAlert,
  Save,
  Key,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Database,
  Copy,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';

interface InvitationCodeEntry {
  id: string;
  code: string;
  createdBy: string;
  uses: number;
  active: boolean;
}

const initialCodes: InvitationCodeEntry[] = [
  { id: '1', code: 'NXT-ALPHA-9X2K', createdBy: 'System', uses: 234, active: true },
  { id: '2', code: 'NXT-BETA-4P7W', createdBy: 'marcus', uses: 187, active: true },
  { id: '3', code: 'NXT-GAMMA-8M3F', createdBy: 'System', uses: 92, active: true },
  { id: '4', code: 'NXT-DELTA-2Q6T', createdBy: 'sarah.j', uses: 45, active: false },
  { id: '5', code: 'NXT-OMEGA-5R1N', createdBy: 'System', uses: 12, active: true },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function CopyableCode({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback - do nothing
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-mono text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          {text}
        </>
      )}
    </button>
  );
}

export default function SettingsPage() {
  const [platformName, setPlatformName] = useState('NexTrade Pro');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [minDeposit, setMinDeposit] = useState('50');
  const [maxWithdraw, setMaxWithdraw] = useState('100000');
  const [codes, setCodes] = useState<InvitationCodeEntry[]>(initialCodes);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleCode = (id: string) => {
    setCodes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const deleteCode = (id: string) => {
    setCodes((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
          <Settings className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Configure system parameters and platform settings</p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* System Settings */}
        <motion.div
          variants={item}
          className="rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
              <Settings className="h-4 w-4 text-blue-400" />
            </div>
            <h2 className="text-base font-semibold text-white">System Settings</h2>
          </div>

          <div className="space-y-5">
            {/* Platform Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Platform Name</label>
                <p className="text-[11px] text-gray-500">Display name across the platform</p>
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="h-10 w-full max-w-sm rounded-lg border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Maintenance Mode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Maintenance Mode</label>
                <p className="text-[11px] text-gray-500">Temporarily disable user access</p>
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className="flex items-center gap-3 group"
                >
                  {maintenanceMode ? (
                    <ToggleRight className="h-8 w-8 text-blue-400" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-gray-500 group-hover:text-gray-400 transition-colors" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      maintenanceMode ? 'text-blue-400' : 'text-gray-400'
                    }`}
                  >
                    {maintenanceMode ? 'Enabled' : 'Disabled'}
                  </span>
                  {maintenanceMode && (
                    <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
                      Users blocked
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Min Deposit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Minimum Deposit</label>
                <p className="text-[11px] text-gray-500">Lowest accepted deposit amount (USD)</p>
              </div>
              <div className="md:col-span-2">
                <div className="relative max-w-sm">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={minDeposit}
                    onChange={(e) => setMinDeposit(e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3.5 text-sm text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Max Withdraw */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Maximum Withdrawal</label>
                <p className="text-[11px] text-gray-500">Highest allowed withdrawal per transaction (USD)</p>
              </div>
              <div className="md:col-span-2">
                <div className="relative max-w-sm">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={maxWithdraw}
                    onChange={(e) => setMaxWithdraw(e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3.5 text-sm text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 pt-5 border-t border-white/5 flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </motion.button>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-green-400"
              >
                Settings updated successfully
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Invitation Codes */}
        <motion.div
          variants={item}
          className="rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15">
                <Key className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Invitation Codes</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Manage registration invitation codes
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Generate Code
            </motion.button>
          </div>

          <div className="space-y-3">
            {codes.map((code, index) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="flex-1 min-w-0">
                  <CopyableCode text={code.code} />
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                    <span>Created by: <span className="text-gray-300">{code.createdBy}</span></span>
                    <span>&middot;</span>
                    <span>{code.uses} uses</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleCode(code.id)}
                    className="flex items-center gap-2"
                  >
                    {code.active ? (
                      <ToggleRight className="h-7 w-7 text-blue-400" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-gray-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        code.active ? 'text-blue-400' : 'text-gray-500'
                      }`}
                    >
                      {code.active ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteCode(code.id)}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {codes.length === 0 && (
            <div className="py-8 text-center">
              <Key className="mx-auto h-8 w-8 text-gray-600 mb-2" />
              <p className="text-sm text-gray-400">No invitation codes created yet</p>
            </div>
          )}
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          variants={item}
          className="rounded-xl border border-red-500/20 bg-red-500/5 p-6"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15">
              <ShieldAlert className="h-4 w-4 text-red-400" />
            </div>
            <h2 className="text-base font-semibold text-red-400">Danger Zone</h2>
          </div>
          <p className="text-sm text-gray-400 mb-5 leading-relaxed">
            These actions are irreversible. Please be absolutely sure before proceeding.
            All data including users, transactions, trades, and settings will be permanently deleted.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-red-500/10 bg-red-500/5 p-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Reset Database</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Permanently delete all data and restore to initial state
              </p>
            </div>
            {!showResetConfirm ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all flex-shrink-0"
              >
                <Database className="h-4 w-4" />
                Reset Database
              </motion.button>
            ) : (
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResetConfirm(false)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Confirm Reset
                </motion.button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}