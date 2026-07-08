'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  Ban,
  PauseCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
} from 'lucide-react';

interface MockUser {
  id: string;
  uid: string;
  username: string;
  email: string;
  role: 'user' | 'sub_agent' | 'super_admin';
  balance: number;
  status: 'active' | 'suspended' | 'banned';
  joined: string;
}

const mockUsers: MockUser[] = [
  { id: '1', uid: 'USR-001247', username: 'alex_trader', email: 'alex@mail.com', role: 'user', balance: 12450.5, status: 'active', joined: '2025-01-15' },
  { id: '2', uid: 'USR-001246', username: 'sarah_crypto', email: 'sarah@mail.com', role: 'user', balance: 8320.0, status: 'active', joined: '2025-01-14' },
  { id: '3', uid: 'USR-001245', username: 'mike_r', email: 'mike@mail.com', role: 'sub_agent', balance: 45200.75, status: 'active', joined: '2025-01-12' },
  { id: '4', uid: 'USR-001244', username: 'john_doe', email: 'john@mail.com', role: 'user', balance: 0, status: 'suspended', joined: '2025-01-10' },
  { id: '5', uid: 'USR-001243', username: 'emma_w', email: 'emma@mail.com', role: 'user', balance: 3200.0, status: 'active', joined: '2025-01-09' },
  { id: '6', uid: 'USR-001242', username: 'david_k', email: 'david@mail.com', role: 'user', balance: 15670.25, status: 'banned', joined: '2025-01-08' },
  { id: '7', uid: 'USR-001241', username: 'lisa_m', email: 'lisa@mail.com', role: 'sub_agent', balance: 28900.0, status: 'active', joined: '2025-01-07' },
  { id: '8', uid: 'USR-001240', username: 'tom_h', email: 'tom@mail.com', role: 'user', balance: 675.5, status: 'active', joined: '2025-01-06' },
  { id: '9', uid: 'USR-001239', username: 'anna_p', email: 'anna@mail.com', role: 'user', balance: 2100.0, status: 'active', joined: '2025-01-05' },
  { id: '10', uid: 'USR-001238', username: 'chris_b', email: 'chris@mail.com', role: 'user', balance: 4520.0, status: 'suspended', joined: '2025-01-04' },
  { id: '11', uid: 'USR-001237', username: 'rachel_s', email: 'rachel@mail.com', role: 'user', balance: 9840.0, status: 'active', joined: '2025-01-03' },
  { id: '12', uid: 'USR-001236', username: 'james_l', email: 'james@mail.com', role: 'user', balance: 310.25, status: 'active', joined: '2025-01-02' },
];

type RoleFilter = 'all' | 'user' | 'sub_agent';

const roleBadge = (role: string) => {
  switch (role) {
    case 'super_admin':
      return (
        <span className="inline-flex items-center rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400 ring-1 ring-blue-500/20">
          Super Admin
        </span>
      );
    case 'sub_agent':
      return (
        <span className="inline-flex items-center rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-purple-400 ring-1 ring-purple-500/20">
          Sub Agent
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-gray-300 ring-1 ring-gray-500/20">
          User
        </span>
      );
  }
};

const statusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          Active
        </span>
      );
    case 'suspended':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-400">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
          Suspended
        </span>
      );
    case 'banned':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          Banned
        </span>
      );
    default:
      return null;
  }
};

const ITEMS_PER_PAGE = 8;

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionOpenId, setActionOpenId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((u) => {
      const matchesSearch =
        search === '' ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.uid.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setActionOpenId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-sm text-gray-400 mt-1">Manage all platform users and their permissions</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by username, email, or UID..."
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
          {(['all', 'user', 'sub_agent'] as RoleFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setRoleFilter(filter);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                roleFilter === filter
                  ? 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {filter === 'all' ? 'All' : filter === 'user' ? 'Users' : 'Sub-Agents'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  UID
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Username
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Role
                </th>
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Balance
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 hidden lg:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-400">
                    {user.uid}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-white">{user.username}</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 hidden md:table-cell">
                    {user.email}
                  </td>
                  <td className="px-4 py-3.5">{roleBadge(user.role)}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm text-white">
                    ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3.5">{statusBadge(user.status)}</td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs hidden lg:table-cell">
                    {user.joined}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setActionOpenId(actionOpenId === user.id ? null : user.id)
                        }
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      <AnimatePresence>
                        {actionOpenId === user.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-white/10 bg-[#111827] p-1.5 shadow-xl z-20"
                          >
                            <button
                              onClick={() => setActionOpenId(null)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </button>
                            <button
                              onClick={() => setActionOpenId(null)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-yellow-400 hover:bg-yellow-500/5 transition-colors"
                            >
                              <PauseCircle className="h-3.5 w-3.5" />
                              Suspend
                            </button>
                            <button
                              onClick={() => setActionOpenId(null)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-500/5 transition-colors"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Ban
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <Search className="mx-auto h-8 w-8 text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">No users found matching your criteria</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
            <p className="text-xs text-gray-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{' '}
              {filteredUsers.length} users
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}