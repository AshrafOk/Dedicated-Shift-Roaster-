import React, { useState, useMemo } from 'react';
import {
  AppUser,
  UserGroup,
  UserPermission,
  USER_GROUPS,
  TEAMS,
  TeamId,
  isGlobalAdmin,
} from '../types/user';
import {
  loadUsers,
  addUser,
  updateUser,
  deleteUser,
} from '../utils/userManagement';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Shield,
  Eye,
  KeyRound,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Database,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Lock,
  X,
  HelpCircle,
} from 'lucide-react';
import { DatabaseState, exportDatabaseToCSV } from '../data/database';
import { loadTeamDatabase, resetTeamDatabase } from '../data/multiTeamDatabase';

interface AdminManagementPageProps {
  currentUser: AppUser | null;
  onBackToRoster: () => void;
  onSelectTeam: (teamId: TeamId) => void;
  onOpenImportForTeam: (teamId: TeamId) => void;
  showToast: (msg: string) => void;
}

export const AdminManagementPage: React.FC<AdminManagementPageProps> = ({
  currentUser,
  onBackToRoster,
  onSelectTeam,
  onOpenImportForTeam,
  showToast,
}) => {
  const isMaster = isGlobalAdmin(currentUser);
  const isGroupAdmin = currentUser?.permission === 'admin' && !isMaster;
  const userAssignedGroup = currentUser?.group || 'Dedicated';

  const [users, setUsers] = useState<AppUser[]>(() => loadUsers());
  // For group admins, filter defaults and locks strictly to their own group
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<UserGroup | 'All'>(() => {
    return isMaster ? 'All' : userAssignedGroup;
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  // Add User Form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newGroup, setNewGroup] = useState<UserGroup>(() => isMaster ? 'Dedicated' : userAssignedGroup);
  const [newPermission, setNewPermission] = useState<UserPermission>('view_only');
  const [newMustChangePassword, setNewMustChangePassword] = useState(true);
  const [addFormError, setAddFormError] = useState<string | null>(null);

  // Edit User Form state
  const [editGroup, setEditGroup] = useState<UserGroup>('Dedicated');
  const [editPermission, setEditPermission] = useState<UserPermission>('view_only');
  const [editMustChangePassword, setEditMustChangePassword] = useState(false);
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Refresh users from storage
  const refreshUsers = () => {
    setUsers(loadUsers());
  };

  // Filtered users list (Group admins can strictly ONLY see users in their own group)
  const visibleUsers = useMemo(() => {
    if (isMaster) {
      return users;
    }
    // Group admin only sees their own group members
    return users.filter((u) => u.group === userAssignedGroup);
  }, [users, isMaster, userAssignedGroup]);

  const filteredUsers = useMemo(() => {
    return visibleUsers.filter((u) => {
      const matchGroup =
        !isMaster
          ? u.group === userAssignedGroup
          : selectedGroupFilter === 'All' || u.group === selectedGroupFilter;

      const matchSearch =
        searchTerm === '' ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        u.group.toLowerCase().includes(searchTerm.toLowerCase());

      return matchGroup && matchSearch;
    });
  }, [visibleUsers, isMaster, userAssignedGroup, selectedGroupFilter, searchTerm]);

  // Group counts
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { All: visibleUsers.length };
    USER_GROUPS.forEach((g) => {
      counts[g] = visibleUsers.filter((u) => u.group === g).length;
    });
    return counts;
  }, [visibleUsers]);

  // Handle Add User Submit
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    if (!newUsername.trim()) {
      setAddFormError('Username is required.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setAddFormError('Password must be at least 4 characters.');
      return;
    }

    // Group admin can only add to their own group
    const targetGroup = isMaster ? newGroup : userAssignedGroup;

    try {
      addUser({
        username: newUsername.trim(),
        password: newPassword.trim(),
        group: targetGroup,
        permission: newPermission,
        mustChangePassword: newMustChangePassword,
        displayName: `${newUsername.trim()} (${targetGroup})`,
      });

      refreshUsers();
      setIsAddUserModalOpen(false);
      setNewUsername('');
      setNewPassword('');
      setNewGroup(isMaster ? 'Dedicated' : userAssignedGroup);
      setNewPermission('view_only');
      setNewMustChangePassword(true);
      showToast(`User "${newUsername.trim()}" successfully created in ${targetGroup} group.`);
    } catch (err: any) {
      setAddFormError(err?.message || 'Failed to create user.');
    }
  };

  // Open Edit User Modal
  const openEditUser = (user: AppUser) => {
    setEditingUser(user);
    setEditGroup(user.group);
    setEditPermission(user.permission);
    setEditMustChangePassword(!!user.mustChangePassword);
    setEditNewPassword('');
    setEditFormError(null);
  };

  // Handle Edit User Submit
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditFormError(null);

    try {
      const updates: Partial<AppUser> = {
        permission: editPermission,
        mustChangePassword: editMustChangePassword,
      };

      // Only Global Admin can change the user's group/team
      if (isMaster) {
        updates.group = editGroup;
        updates.displayName = `${editingUser.username} (${editGroup})`;
      }

      if (editNewPassword.trim().length > 0) {
        if (editNewPassword.trim().length < 4) {
          setEditFormError('New password must be at least 4 characters long.');
          return;
        }
        updates.password = editNewPassword.trim();
      }

      updateUser(editingUser.id, updates);
      refreshUsers();
      setEditingUser(null);
      showToast(
        isMaster && editGroup !== editingUser.group
          ? `User "${editingUser.username}" moved to ${editGroup} group with updated settings.`
          : `User "${editingUser.username}" updated successfully.`
      );
    } catch (err: any) {
      setEditFormError(err?.message || 'Failed to update user.');
    }
  };

  // Trigger Delete confirmation modal
  const openDeleteModal = (user: AppUser) => {
    if (user.username.toLowerCase() === 'ashraf') {
      showToast('Master Global Admin account "Ashraf" cannot be deleted.');
      return;
    }
    setUserToDelete(user);
  };

  // Confirmed Delete User action (No window.confirm!)
  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    try {
      deleteUser(userToDelete.id);
      refreshUsers();
      showToast(`User "${userToDelete.username}" was permanently deleted.`);
      setUserToDelete(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete user.');
    }
  };

  // Teams to display in the database directory section
  const visibleTeams = useMemo(() => {
    if (isMaster) return TEAMS;
    return TEAMS.filter((t) => t.groupName === userAssignedGroup);
  }, [isMaster, userAssignedGroup]);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Banner & Navigation */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase font-mono ${
                isMaster
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isMaster ? 'Global Administration Control' : `${userAssignedGroup} Team Admin Control`}
              </span>
              <span className="text-xs text-blue-200">
                Logged in as <strong>{currentUser?.username || 'Admin'}</strong>{' '}
                ({isMaster ? 'Master Global Admin' : `${userAssignedGroup} Group Admin`})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isMaster
                ? 'Central Roster Administration & Access Control'
                : `${userAssignedGroup} Team User Administration`}
            </h1>

            <p className="mt-2 text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              {isMaster
                ? 'Full master privileges: manage all 7 groups, add/delete users across all teams, move users between groups, and administer all 6 rosters.'
                : `Group admin privileges: manage, add, and delete users inside the ${userAssignedGroup} group, manage view/admin permissions, and reset credentials.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onBackToRoster}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-all border border-white/20 cursor-pointer shadow-sm active:scale-98"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Active Roster</span>
            </button>

            <button
              onClick={() => {
                setNewGroup(isMaster ? 'Dedicated' : userAssignedGroup);
                setIsAddUserModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30 cursor-pointer active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {isMaster ? '+ Add User to Group' : `+ Add User to ${userAssignedGroup}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Counters Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isMaster ? 'Total System Users' : `${userAssignedGroup} Team Users`}
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{visibleUsers.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isMaster ? 'Across all 7 groups' : `Dedicated to ${userAssignedGroup} roster`}
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Configured Teams</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {isMaster ? '6 Teams' : '1 Team'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isMaster ? 'Dedicated, Elite, Standard, Flex, BCN, Mgrs' : `${userAssignedGroup} Active`}
            </div>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Group Admins</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {visibleUsers.filter((u) => u.permission === 'admin').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Full team editing permission</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">View-Only Users</div>
            <div className="text-2xl font-black text-slate-700 mt-1">
              {visibleUsers.filter((u) => u.permission === 'view_only').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Protected read-only access</div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* User Groups Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Group Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {isMaster ? (
              <>
                <button
                  onClick={() => setSelectedGroupFilter('All')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedGroupFilter === 'All'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  All Groups ({groupCounts.All})
                </button>
                {USER_GROUPS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGroupFilter(g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      selectedGroupFilter === g
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {g} ({groupCounts[g] || 0})
                  </button>
                ))}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs whitespace-nowrap">
                  {userAssignedGroup} Group Members ({visibleUsers.length})
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  (Group Admin: Scoped strictly to {userAssignedGroup} team)
                </span>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">User Account</th>
                <th className="py-3 px-4">Group / Team</th>
                <th className="py-3 px-4">Permission Level</th>
                <th className="py-3 px-4">1st Login Password</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No users found matching your filter or search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isMasterUser = u.username.toLowerCase() === 'ashraf';
                  return (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {u.username.substring(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{u.username}</span>
                            {isMasterUser && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded font-mono">
                                ★ MASTER
                              </span>
                            )}
                          </div>
                          {u.displayName && (
                            <div className="text-[11px] text-slate-500 font-normal">{u.displayName}</div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.group === 'Global Admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : u.group === 'Elite'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : u.group === 'Standard'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : u.group === 'Flex'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : u.group === 'BCN'
                              ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                              : u.group === 'Managers'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                            {u.group} Group
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {u.group === 'Global Admin'
                              ? '★ Unrestricted: All 6 Teams'
                              : `🔒 Scope: ${u.group} Only (Others Locked)`}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.permission === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Admin (Edit Rights)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Only</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {u.mustChangePassword ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <KeyRound className="w-3 h-3 text-amber-600" />
                            <span>Required on next login</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Completed</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {u.createdAt || '2026-01-01'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditUser(u)}
                            className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                            title="Manage user permission and password"
                          >
                            <Edit className="w-3 h-3 text-slate-600" />
                            <span>Manage</span>
                          </button>

                          {!isMasterUser && (
                            <button
                              onClick={() => openDeleteModal(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200 active:scale-95"
                              title={`Delete user ${u.username}`}
                            >
                              <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Team Roster Database Management Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>
                {isMaster
                  ? 'Multi-Team Roster Database Directory'
                  : `${userAssignedGroup} Team Roster Database Operations`}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isMaster
                ? 'Each team maintains its own isolated 2026 daily schedule database, Excel/CSV sync, and leave balance ledger.'
                : `Manage ${userAssignedGroup} team's database, export master CSV, or import updated schedules.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleTeams.map((t) => {
            const db = loadTeamDatabase(t.id);
            return (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{t.name}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      {db.balances.length} Members
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {t.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onSelectTeam(t.id);
                      onBackToRoster();
                      showToast(`Switched active view to ${t.name}`);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Open Roster
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenImportForTeam(t.id)}
                      className="px-2 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title={`Import Excel/CSV for ${t.name}`}
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        exportDatabaseToCSV(db, 2026);
                        showToast(`Exported ${t.name} 2026 database CSV`);
                      }}
                      className="px-2 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title={`Export ${t.name} CSV`}
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <button
                      onClick={() => {
                        resetTeamDatabase(t.id);
                        showToast(`Reset ${t.name} database to default initial schedules.`);
                        refreshUsers();
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                      title={`Reset ${t.name} to default`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal 1: Add New User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isMaster ? 'Add User to Group' : `Add User to ${userAssignedGroup} Group`}
                  </h3>
                  <p className="text-xs text-slate-500">Configure username, permission, and initial password</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addFormError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{addFormError}</span>
              </div>
            )}

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. kiran_patel, standard_lead, manager_sam"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set initial password"
                  required
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assign to Group {isMaster ? '*' : '(Locked)'}
                  </label>
                  {isMaster ? (
                    <select
                      value={newGroup}
                      onChange={(e) => setNewGroup(e.target.value as UserGroup)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {USER_GROUPS.map((g) => (
                        <option key={g} value={g}>
                          {g} {g === 'Global Admin' ? '★ (Full Access)' : 'Team'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between">
                      <span>{userAssignedGroup} Group</span>
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Permission Level *
                  </label>
                  <select
                    value={newPermission}
                    onChange={(e) => setNewPermission(e.target.value as UserPermission)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="view_only">View Only (Read-Only)</option>
                    <option value="admin">Admin (Can Edit Roster)</option>
                  </select>
                </div>
              </div>

              {/* Roster Lock Policy Notice */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Strict Group Lock Policy:</strong>
                  <span>
                    {isMaster && newGroup === 'Global Admin'
                      ? 'Global Admin users can view and edit all 6 team rosters.'
                      : `Users in ${isMaster ? newGroup : userAssignedGroup} group can ONLY view the ${
                          isMaster ? newGroup : userAssignedGroup
                        } team roster. All other team rosters will be automatically locked.`}
                  </span>
                </div>
              </div>

              {/* Checkbox: User can change password on first login */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMustChangePassword}
                    onChange={(e) => setNewMustChangePassword(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      User can change the password on first login
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Prompts the user to set their personal private password upon signing in.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Manage User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Manage User: {editingUser.username}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMaster
                      ? 'Global Admin: You can move this user to any group, update permissions, or reset password'
                      : `Group Admin: Manage permissions and reset password for ${editingUser.username}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editFormError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{editFormError}</span>
              </div>
            )}

            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Group / Team {isMaster ? '(Move User)' : '(Locked)'}
                  </label>
                  {isMaster ? (
                    <select
                      value={editGroup}
                      onChange={(e) => setEditGroup(e.target.value as UserGroup)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {USER_GROUPS.map((g) => (
                        <option key={g} value={g}>
                          {g} {g === 'Global Admin' ? '★ (Full Access)' : 'Team'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between">
                      <span>{editingUser.group} Group</span>
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}
                  {!isMaster && (
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Group modification is restricted to Global Admin.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Permission Level *
                  </label>
                  <select
                    value={editPermission}
                    onChange={(e) => setEditPermission(e.target.value as UserPermission)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="view_only">View Only (Read-Only)</option>
                    <option value="admin">Admin (Can Edit Roster)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reset Password (Leave blank to keep existing)
                </label>
                <input
                  type="text"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Enter new password to reset"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editMustChangePassword}
                    onChange={(e) => setEditMustChangePassword(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Enforce password change on next login
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      User will be required to choose a new password when they sign in.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Reliable In-App Delete Confirmation Modal (NO window.confirm!) */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete User Account</h3>
                <p className="text-xs text-slate-500">This action will remove portal access</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              Are you sure you want to permanently delete user{' '}
              <strong className="text-slate-900 font-bold">{userToDelete.username}</strong> from the{' '}
              <strong className="text-blue-700 font-bold">{userToDelete.group} Group</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
