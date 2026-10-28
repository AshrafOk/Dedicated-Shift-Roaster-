import React from 'react';
import { TeamId, TEAMS, AppUser, isGlobalAdmin, canUserViewTeam } from '../types/user';
import { ShieldCheck, Lock, Users, ChevronRight, Settings } from 'lucide-react';

interface TeamTopBarProps {
  activeTeamId: TeamId;
  onSelectTeam: (teamId: TeamId) => void;
  currentUser: AppUser | null;
  onOpenAdminPage: () => void;
  isAdminPageActive?: boolean;
  onBackToRoster?: () => void;
  onLockedTeamClick?: (teamName: string) => void;
}

export const TeamTopBar: React.FC<TeamTopBarProps> = ({
  activeTeamId,
  onSelectTeam,
  currentUser,
  onOpenAdminPage,
  isAdminPageActive = false,
  onBackToRoster,
  onLockedTeamClick,
}) => {
  const isMasterAdmin = isGlobalAdmin(currentUser);
  const currentTeam = TEAMS.find((t) => t.id === activeTeamId) || TEAMS[0];

  return (
    <div className="w-full bg-slate-950 text-white border-b border-slate-800 text-xs shadow-md">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between min-h-12 py-2 md:py-0 gap-2.5">
          {/* Left: 6 Team Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {TEAMS.map((team) => {
              const isActive = !isAdminPageActive && activeTeamId === team.id;
              const isUserTeam = currentUser?.group === team.groupName;
              const hasAccess = canUserViewTeam(currentUser, team.id);

              return (
                <button
                  key={team.id}
                  onClick={() => {
                    if (!hasAccess) {
                      if (onLockedTeamClick) {
                        onLockedTeamClick(team.name);
                      }
                      return;
                    }
                    if (isAdminPageActive && onBackToRoster) {
                      onBackToRoster();
                    }
                    onSelectTeam(team.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                    !hasAccess
                      ? 'bg-slate-900/60 text-slate-500 border-slate-800/80 hover:border-slate-700 cursor-not-allowed opacity-75'
                      : isActive
                      ? 'bg-blue-600 text-white border-blue-400 shadow-sm ring-1 ring-blue-300/40 cursor-pointer'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600 cursor-pointer'
                  }`}
                  title={
                    !hasAccess
                      ? `Locked: Your account (${currentUser?.username}) is restricted to ${currentUser?.group} Team.`
                      : `${team.name} - ${team.description}`
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      !hasAccess ? 'bg-slate-600' : isActive ? 'bg-white' : 'bg-slate-400'
                    }`}
                  />
                  <span>{team.name}</span>

                  {isUserTeam && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30 font-mono">
                      Your Team
                    </span>
                  )}

                  {!hasAccess && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                      <Lock className="w-2.5 h-2.5 text-amber-500" />
                      <span>Locked</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Center Title: NOC {Team} Roster - Shift & Leave Management */}
          <div className="hidden xl:flex items-center gap-2 text-slate-300 font-medium tracking-wide">
            <span className="text-slate-400">
              {isAdminPageActive
                ? 'Central Roster Administration & Group Access Control'
                : `NOC ${currentTeam.name} - Shift & Leave Management`}
            </span>
          </div>

          {/* Right: Admin Button (prominently highlighted as shown in user screenshot) */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={onOpenAdminPage}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm ${
                isAdminPageActive
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 ring-2 ring-emerald-300/60 font-extrabold'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-red-500/80 hover:border-red-400 hover:shadow-red-500/20'
              }`}
              title={
                isMasterAdmin
                  ? 'Admin Portal: Manage all 7 groups, users, permissions, and team rosters'
                  : currentUser?.permission === 'admin'
                  ? `Admin Portal: Manage ${currentUser.group} team users and permissions`
                  : 'Admin Portal (Admin permission required)'
              }
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isAdminPageActive ? 'text-slate-950' : 'text-emerald-400'}`} />
              <span>Admin</span>
              {isMasterAdmin ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-semibold border border-emerald-500/40">
                  Global
                </span>
              ) : currentUser?.permission === 'admin' ? (
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded font-mono font-semibold border border-blue-400/40">
                  {currentUser.group}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
