'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, UserCog, Users, Eye, Mail } from 'lucide-react';

interface Agent {
  id: string;
  code: string;
  name: string;
  email: string;
  invitationCode: string;
  totalReferrals: number;
  activeReferrals: number;
  status: 'active' | 'inactive';
}

const agents: Agent[] = [
  {
    id: '1',
    code: 'PB-AG001',
    name: 'Marcus Chen',
    email: 'marcus@nextrade.pro',
    invitationCode: 'NXT-MRC-7X2K',
    totalReferrals: 847,
    activeReferrals: 623,
    status: 'active',
  },
  {
    id: '2',
    code: 'PB-AG002',
    name: 'Sarah Johnson',
    email: 'sarah.j@nextrade.pro',
    invitationCode: 'NXT-SJH-4P9W',
    totalReferrals: 512,
    activeReferrals: 389,
    status: 'active',
  },
  {
    id: '3',
    code: 'PB-AG003',
    name: 'Raj Patel',
    email: 'raj.p@nextrade.pro',
    invitationCode: 'NXT-RJP-8M3F',
    totalReferrals: 298,
    activeReferrals: 201,
    status: 'active',
  },
  {
    id: '4',
    code: 'PB-AG004',
    name: 'Elena Volkov',
    email: 'elena.v@nextrade.pro',
    invitationCode: 'NXT-ELV-2Q6T',
    totalReferrals: 156,
    activeReferrals: 98,
    status: 'inactive',
  },
  {
    id: '5',
    code: 'PB-AG005',
    name: 'David Kim',
    email: 'david.k@nextrade.pro',
    invitationCode: 'NXT-DKK-5R1N',
    totalReferrals: 73,
    activeReferrals: 41,
    status: 'active',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback - do nothing
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-mono text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
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

export default function AgentManagement() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Management</h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitor and manage sub-agents and their referral networks
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <UserCog className="h-4 w-4" />
          <span>
            {agents.length} agents &middot; {agents.reduce((a, ag) => a + ag.totalReferrals, 0)} total
            referrals
          </span>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {agents.map((agent) => (
          <motion.div
            key={agent.id}
            variants={item}
            whileHover={{ y: -2 }}
            className="rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/15"
          >
            {/* Agent Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                    agent.status === 'active'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                      : 'bg-gradient-to-br from-gray-600 to-gray-700'
                  }`}
                >
                  {agent.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-gray-500 font-mono">{agent.code}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        agent.status === 'active'
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-gray-500/15 text-gray-400'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          agent.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                        }`}
                      />
                      {agent.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{agent.email}</span>
            </div>

            {/* Invitation Code */}
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Invitation Code
              </p>
              <CopyButton text={agent.invitationCode} />
            </div>

            {/* Referral Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="h-3 w-3 text-gray-500" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                    Total
                  </span>
                </div>
                <p className="text-lg font-bold text-white">{agent.totalReferrals}</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                    Active
                  </span>
                </div>
                <p className="text-lg font-bold text-green-400">{agent.activeReferrals}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-gray-400">Active Ratio</span>
                <span className="text-[11px] font-medium text-white">
                  {agent.totalReferrals > 0
                    ? ((agent.activeReferrals / agent.totalReferrals) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      agent.totalReferrals > 0
                        ? (agent.activeReferrals / agent.totalReferrals) * 100
                        : 0
                    }%`,
                  }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                />
              </div>
            </div>

            {/* View Referrals Button */}
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/15">
              <Eye className="h-3.5 w-3.5" />
              View Referrals
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}