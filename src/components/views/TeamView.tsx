import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, UserCheck, Activity, Trash2, Key } from 'lucide-react';
import { auth } from '../../lib/firebase';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  status: 'Active' | 'Pending';
}

export const TeamView = ({ activeTab }: { activeTab: string }) => {
  const [currentSub, setCurrentSub] = useState('Invite members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Manager' | 'Viewer'>('Viewer');
  const [members, setMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Daniel Musembi', email: 'musembidaniel615@gmail.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Zian Wang', email: 'zian.wang@musembitech.com', role: 'Manager', status: 'Active' },
    { id: '3', name: 'Safi Kiprotich', email: 'safi@workspace.corp', role: 'Viewer', status: 'Pending' }
  ]);

  const [logs, setLogs] = useState([
    { actor: 'Daniel Musembi', action: 'Created custom REST API token key', target: 'Live Endpoint', date: 'Today, 12:44 PM' },
    { actor: 'Daniel Musembi', action: 'Added member: safi@workspace.corp', target: 'Access Control', date: 'Yesterday, 02:14 PM' },
    { actor: 'Zian Wang', action: 'Purchased Global Starter 10GB Batch', target: 'Bulk purchasing', date: '2026-06-01, 10:12 AM' }
  ]);

  useEffect(() => {
    const subTabs = ['Invite members', 'Assign roles', 'Permissions', 'Activity logs', 'User access'];
    if (subTabs.includes(activeTab)) {
      setCurrentSub(activeTab);
    }
  }, [activeTab]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    if (members.some(m => m.email.toLowerCase() === inviteEmail.toLowerCase())) {
      return alert('Member already registered or invited.');
    }

    const newM: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending'
    };

    setMembers(prev => [...prev, newM]);
    setLogs(prev => [
      { actor: 'Daniel Musembi', action: `Invited new member: ${inviteEmail}`, target: 'Access Control', date: 'Just now' },
      ...prev
    ]);
    alert(`Invite successfully dispatched to ${inviteEmail}.`);
    setInviteEmail('');
  };

  const deleteMember = (id: string, name: string) => {
    if (!window.confirm(`Revoke corporate portal access for ${name}?`)) return;
    setMembers(prev => prev.filter(m => m.id !== id));
    setLogs(prev => [
      { actor: 'Daniel Musembi', action: `Deleted member: ${name}`, target: 'Access Control', date: 'Just now' },
      ...prev
    ]);
  };

  const updateRole = (id: string, newRole: 'Admin' | 'Manager' | 'Viewer') => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    alert('Team permission matrix updated successfully.');
  };

  return (
    <div className="p-8 text-text-p bg-bg-app min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-custom pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
          <p className="text-text-s text-sm mt-1">Control multiple employee logins, delegate billing roles, and verify transaction audit histories.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-bg-card p-1 rounded-lg border border-border-custom">
          {['Invite members', 'Assign roles', 'Permissions', 'Activity logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentSub(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${currentSub === tab ? 'bg-accent text-white' : 'text-text-s hover:text-text-p'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main interactive area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Members list & Invitation */}
          {currentSub === 'Invite members' && (
            <div className="space-y-6">
              <form onSubmit={handleInvite} className="bg-bg-card border border-border-custom p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-base">Invite Corporate Member</h3>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="email"
                    required
                    className="flex-1 bg-neutral-900 border border-border-custom rounded-lg py-2.5 px-3 text-sm focus:outline-none"
                    placeholder="teammember@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <select 
                    value={inviteRole}
                    onChange={(e: any) => setInviteRole(e.target.value)}
                    className="bg-neutral-900 border border-border-custom rounded-lg py-2.5 px-3 text-sm focus:outline-none"
                  >
                    <option value="Viewer">Viewer (Read logs)</option>
                    <option value="Manager">Manager (Deploy eSIMs)</option>
                    <option value="Admin">Admin (Full Billing)</option>
                  </select>
                  <button type="submit" className="bg-accent text-white py-2.5 px-5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-accent/85 transition">
                    <UserPlus size={14} /> Send Invite
                  </button>
                </div>
              </form>

              <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg">Active Team Directory</h3>
                <div className="divide-y divide-border-custom overlow-hidden">
                  {members.map((m) => (
                    <div key={m.id} className="py-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-neutral-900 border border-border-custom rounded-lg text-accent">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{m.name} <span className="text-xs text-text-s">({m.email})</span></p>
                          <p className="text-[10px] text-text-s mt-0.5 capitalize">Role: {m.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${m.status === 'Active' ? 'bg-emerald-950/20 text-emerald-400' : 'bg-amber-950/20 text-amber-500'}`}>{m.status}</span>
                        {m.email !== auth.currentUser?.email && (
                          <button 
                            onClick={() => deleteMember(m.id, m.name)}
                            className="text-text-s hover:text-red-400 p-1.5 rounded-lg transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Setup / Assign team members roles */}
          {currentSub === 'Assign roles' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-lg">Modify Team Permission Roles</h3>
              <p className="text-text-s text-xs mt-0.5">Quickly adjust who can spend balance or allocate technical resources.</p>
              
              <div className="divide-y divide-border-custom pt-2">
                {members.map((m) => (
                  <div key={m.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{m.name}</p>
                      <p className="text-xs text-text-s mt-0.5">{m.email}</p>
                    </div>
                    <select
                      value={m.role}
                      onChange={(e) => updateRole(m.id, e.target.value as any)}
                      className="bg-neutral-900 border border-border-custom rounded-lg py-1.5 px-3 text-xs focus:outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secure Audit Activity logs */}
          {currentSub === 'Activity logs' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4 animate-fade-in">
              <h3 className="font-bold text-lg">Infrastructure Security Audit Log</h3>
              <p className="text-text-s text-xs">A comprehensive, real-time index of team actions to troubleshoot credential updates or eSIM allocations.</p>
              
              <div className="space-y-3 pt-2">
                {logs.map((log, index) => (
                  <div key={index} className="p-4 bg-black/40 border border-border-custom rounded-xl flex justify-between items-start text-xs">
                    <div className="space-y-1">
                      <p className="text-text-p font-semibold">{log.actor} <span className="text-text-s font-normal">performed</span> {log.action}</p>
                      <p className="text-[10px] text-text-s">Target vector: {log.target}</p>
                    </div>
                    <span className="text-text-s text-[10px]">{log.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General matrix overview */}
          {currentSub === 'Permissions' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-lg">Enterprise Security Hierarchy</h3>
              <p className="text-text-s text-xs">Visual blueprint detailing permission levels across roles.</p>
              
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-xs text-left text-text-s border-collapse">
                  <thead>
                    <tr className="border-b border-border-custom">
                      <th className="py-2.5">Feature capability</th>
                      <th>Admin</th>
                      <th>Manager</th>
                      <th>Viewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border-custom/50">
                      <td className="py-2.5 text-text-p">Top-up Wallet & Withdrawals</td>
                      <td className="text-emerald-400 font-bold">YES</td>
                      <td>NO</td>
                      <td>NO</td>
                    </tr>
                    <tr className="border-b border-border-custom/50">
                      <td className="py-2.5 text-text-p">Purchase / Renew eSIM contracts</td>
                      <td className="text-emerald-400 font-bold">YES</td>
                      <td className="text-emerald-400 font-bold">YES</td>
                      <td>NO</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-text-p">Audit logging / View Invoices</td>
                      <td className="text-emerald-400 font-bold">YES</td>
                      <td className="text-emerald-400 font-bold">YES</td>
                      <td className="text-emerald-400 font-bold">YES</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Audit reports sidebar widget */}
        <div className="space-y-6">
          <div className="bg-neutral-900/40 p-6 rounded-2xl border border-border-custom space-y-4">
            <h4 className="font-bold text-sm">Team Activity Metrics</h4>
            <div className="flex items-center gap-2 text-xs">
              <Activity className="text-accent" size={14} />
              <p className="text-text-s">No security compromises flagged recently</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
