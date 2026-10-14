import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  X,
  Users,
  Key,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Sparkles,
  ArrowRight,
  Code2,
  Layers,
  UserCheck,
  Settings,
} from 'lucide-react';
import { UserRole } from '../types/roster';

interface M365IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectSimulatedUser: (role: UserRole, email: string, name: string) => void;
}

export const M365IntegrationModal: React.FC<M365IntegrationModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectSimulatedUser,
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'simulator' | 'code'>('steps');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const appRolesManifestSnippet = `{
  "appRoles": [
    {
      "allowedMemberTypes": ["User"],
      "description": "Full edit access to NOC roster shifts and leave balances",
      "displayName": "Roster Administrator",
      "id": "11111111-2222-3333-4444-555555555555",
      "isEnabled": true,
      "value": "Roster.Admin"
    },
    {
      "allowedMemberTypes": ["User"],
      "description": "Read-only access to view team shifts and directory",
      "displayName": "Roster Viewer",
      "id": "66666666-7777-8888-9999-000000000000",
      "isEnabled": true,
      "value": "Roster.Viewer"
    }
  ]
}`;

  const msalReactSnippet = `// 1. Install MSAL React:
// npm install @azure/msal-browser @azure/msal-react

import { PublicClientApplication } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";

export const msalConfig = {
  auth: {
    clientId: "YOUR_AZURE_CLIENT_ID",
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
  }
};

// In your React Component:
export function useM365UserRole() {
  const { accounts } = useMsal();
  const currentAccount = accounts[0];

  // Microsoft Entra ID injects the assigned App Role into idTokenClaims.roles
  const roles = (currentAccount?.idTokenClaims as any)?.roles || [];

  if (roles.includes("Roster.Admin")) {
    return "admin"; // Full Edit access
  }
  return "viewer";  // Read-Only access
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Microsoft 365 & Entra ID Integration
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Azure AD / SSO / RBAC
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                How to link this roster app to your M365 tenant and control who can Read vs. Edit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('steps')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'steps'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4-Step Setup Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'simulator'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Live M365 Login Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>MSAL Code & Manifest</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs leading-relaxed">
          {activeTab === 'steps' && (
            <div className="space-y-6">
              {/* Executive Overview Banner */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>How Microsoft 365 Determines "Who can View vs. Edit"</span>
                </div>
                <p>
                  In Microsoft 365, user identity is managed by <strong>Microsoft Entra ID (formerly Azure AD)</strong>. When someone logs into this app using their corporate work email (e.g. <code className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-900 font-mono text-[11px]">user@yourcompany.com</code>), Entra ID returns an ID Token containing their assigned <strong>App Role</strong> or <strong>Security Group</strong>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Role: Roster.Admin (Edit)
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Assigned to NOC Managers & Leads. Can assign shifts, edit quotas, approve leaves, and import CSV files.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      Role: Roster.Viewer (Read-Only)
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Assigned to NOC Engineers & Stakeholders. Can view monthly shifts, leave balances, and search directory without editing cells.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step by step cards */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-all space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">
                      Register the App in Microsoft Entra ID (Azure Portal)
                    </h3>
                  </div>
                  <p className="text-slate-600 pl-8">
                    1. Go to <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold inline-flex items-center gap-0.5">portal.azure.com <ExternalLink className="w-3 h-3" /></a> and navigate to <strong>Microsoft Entra ID</strong> &rarr; <strong>App registrations</strong>.
                  </p>
                  <p className="text-slate-600 pl-8">
                    2. Click <strong>+ New registration</strong>. Name it <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">Kaseya NOC Roster</code>.
                  </p>
                  <p className="text-slate-600 pl-8">
                    3. Under Supported account types, select <em>"Accounts in this organizational directory only (Single tenant)"</em>.
                  </p>
                  <p className="text-slate-600 pl-8">
                    4. Set Redirect URI (SPA): add your deployed web URL.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-all space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">
                      Define the Two Roles (Admin vs. Viewer) in App Roles
                    </h3>
                  </div>
                  <p className="text-slate-600 pl-8">
                    In your App registration menu, click <strong>App roles</strong> &rarr; <strong>Create app role</strong>:
                  </p>
                  <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-800">Role 1: Admin</div>
                      <div>Display name: <code className="text-blue-600">Roster Administrator</code></div>
                      <div>Value: <code className="text-blue-600 font-bold">Roster.Admin</code></div>
                      <div>Allowed member types: <em>Users/Groups</em></div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-800">Role 2: Viewer</div>
                      <div>Display name: <code className="text-blue-600">Roster Viewer</code></div>
                      <div>Value: <code className="text-blue-600 font-bold">Roster.Viewer</code></div>
                      <div>Allowed member types: <em>Users/Groups</em></div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-all space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">
                      Assign Users or M365 Security Groups
                    </h3>
                  </div>
                  <p className="text-slate-600 pl-8">
                    This is where you choose who can do what:
                  </p>
                  <p className="text-slate-600 pl-8">
                    1. Go to <strong>Microsoft Entra ID</strong> &rarr; <strong>Enterprise applications</strong> &rarr; select <strong>Kaseya NOC Roster</strong>.
                  </p>
                  <p className="text-slate-600 pl-8">
                    2. Click <strong>Users and groups</strong> &rarr; <strong>+ Add user/group</strong>.
                  </p>
                  <p className="text-slate-600 pl-8">
                    3. Select an employee (or an entire M365 Security Group like <em>"SG-NOC-Managers"</em>) and assign the role <strong>Roster.Admin</strong>.
                  </p>
                  <p className="text-slate-600 pl-8">
                    4. Select engineers or general staff (or <em>"SG-NOC-Engineers"</em>) and assign the role <strong>Roster.Viewer</strong>.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-all space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      4
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">
                      (Optional) Add as a Tab in Microsoft Teams
                    </h3>
                  </div>
                  <p className="text-slate-600 pl-8">
                    You can embed this web app directly inside your <strong>Microsoft Teams "NOC Team Channel"</strong>:
                  </p>
                  <p className="text-slate-600 pl-8">
                    In Teams, click the <strong>+ (Add a tab)</strong> icon in your channel &rarr; Select <strong>Website</strong> &rarr; Paste your app URL. When users open the tab, M365 handles authentication and applies their role automatically!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 text-xs space-y-1.5">
                <p className="font-bold text-sm text-indigo-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Test Microsoft 365 Single Sign-On Right Now</span>
                </p>
                <p>
                  Click on one of the simulated M365 corporate users below to instantly test how the app adapts its permissions between an <strong>M365 NOC Manager (Admin)</strong> and an <strong>M365 NOC Engineer (Read-Only Viewer)</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Simulated Admin Card */}
                <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-white shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Entra ID Role: Roster.Admin
                      </span>
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Sarah Chen</h4>
                      <p className="text-slate-500 font-mono text-[11px]">sarah.chen@kaseya.com</p>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div><strong>Group:</strong> NOC Leads & Shift Supervisors</div>
                      <div><strong>Claims:</strong> <code className="text-emerald-700">roles: ["Roster.Admin"]</code></div>
                      <div><strong>Permissions:</strong> Edit shifts, fill week-offs, adjust quotas, CSV import.</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectSimulatedUser('admin', 'sarah.chen@kaseya.com', 'Sarah Chen');
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs"
                  >
                    <span>Simulate Sign-in as Sarah (Admin)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulated Viewer Card */}
                <div className="p-5 rounded-2xl border-2 border-amber-200 bg-white shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Entra ID Role: Roster.Viewer
                      </span>
                      <Lock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Alex Kumar</h4>
                      <p className="text-slate-500 font-mono text-[11px]">alex.kumar@kaseya.com</p>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div><strong>Group:</strong> NOC Tier-1 / Tier-2 Engineers</div>
                      <div><strong>Claims:</strong> <code className="text-amber-800">roles: ["Roster.Viewer"]</code></div>
                      <div><strong>Permissions:</strong> Inspect shifts, search team directory, check quotas (Read-Only).</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectSimulatedUser('viewer', 'alex.kumar@kaseya.com', 'Alex Kumar');
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
                  >
                    <span>Simulate Sign-in as Alex (Viewer)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>Azure App Registration Manifest JSON (App Roles):</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(appRolesManifestSnippet, 'manifest')}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    {copiedKey === 'manifest' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-slate-950 text-slate-200 rounded-2xl font-mono text-[11px] overflow-x-auto border border-slate-800 shadow-inner">
                  <pre>{appRolesManifestSnippet}</pre>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Frontend React Integration (MSAL):</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(msalReactSnippet, 'msal')}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    {copiedKey === 'msal' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-slate-950 text-slate-200 rounded-2xl font-mono text-[11px] overflow-x-auto border border-slate-800 shadow-inner">
                  <pre>{msalReactSnippet}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Active App Mode: <strong className="uppercase font-mono text-slate-700">{currentRole}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
