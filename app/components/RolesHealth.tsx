'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Link,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface RoleHealth {
  id: string;
  clientName: string;
  roleTitle: string;
  calendarLink: string;
  calendarStatus: 'Active' | 'Broken';
  introEmailStatus: 'Set up' | 'Error' | 'Not set up';
  recruiters: string;
  lastActivity: string;
  notes: string;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getHealthColor(role: RoleHealth): {
  bg: string;
  border: string;
  label: string;
} {
  const hasBroken =
    role.calendarStatus === 'Broken' || role.introEmailStatus === 'Error';
  const hasWarning = role.introEmailStatus === 'Not set up';

  if (hasBroken)
    return {
      bg: 'bg-red-500/5',
      border: 'border-red-500/30',
      label: 'Critical',
    };
  if (hasWarning)
    return {
      bg: 'bg-yellow-500/5',
      border: 'border-yellow-500/30',
      label: 'Attention',
    };
  return {
    bg: 'bg-green-500/5',
    border: 'border-green-500/30',
    label: 'Healthy',
  };
}

const emptyForm: Omit<RoleHealth, 'id'> = {
  clientName: '',
  roleTitle: '',
  calendarLink: '',
  calendarStatus: 'Active',
  introEmailStatus: 'Set up',
  recruiters: '',
  lastActivity: '',
  notes: '',
};

export default function RolesHealth() {
  const [roles, setRoles] = useState<RoleHealth[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<RoleHealth, 'id'>>(emptyForm);

  useEffect(() => {
    setRoles(
      JSON.parse(localStorage.getItem('contrario_roles_health') || '[]')
    );
  }, []);

  const saveRoles = (r: RoleHealth[]) => {
    setRoles(r);
    localStorage.setItem('contrario_roles_health', JSON.stringify(r));
  };

  const addRole = () => {
    if (!form.clientName.trim() || !form.roleTitle.trim()) return;
    saveRoles([...roles, { id: genId(), ...form }]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const updateRole = () => {
    if (!editingId) return;
    saveRoles(roles.map((r) => (r.id === editingId ? { ...r, ...form } : r)));
    setForm(emptyForm);
    setEditingId(null);
  };

  const deleteRole = (id: string) => {
    saveRoles(roles.filter((r) => r.id !== id));
  };

  const startEdit = (role: RoleHealth) => {
    setEditingId(role.id);
    setForm({
      clientName: role.clientName,
      roleTitle: role.roleTitle,
      calendarLink: role.calendarLink,
      calendarStatus: role.calendarStatus,
      introEmailStatus: role.introEmailStatus,
      recruiters: role.recruiters,
      lastActivity: role.lastActivity,
      notes: role.notes,
    });
  };

  const toggleCalendarStatus = (id: string) => {
    saveRoles(
      roles.map((r) =>
        r.id === id
          ? {
              ...r,
              calendarStatus:
                r.calendarStatus === 'Active' ? 'Broken' : 'Active',
            }
          : r
      )
    );
  };

  const RoleForm = ({ isEdit }: { isEdit: boolean }) => (
    <div className="bg-bg-card border border-gray-700 rounded-xl p-4 mb-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
          placeholder="Client name"
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          autoFocus
        />
        <input
          className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
          placeholder="Role title"
          value={form.roleTitle}
          onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
        />
      </div>
      <input
        className="w-full bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
        placeholder="Calendar link (URL)"
        value={form.calendarLink}
        onChange={(e) => setForm({ ...form, calendarLink: e.target.value })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none"
          value={form.calendarStatus}
          onChange={(e) =>
            setForm({
              ...form,
              calendarStatus: e.target.value as 'Active' | 'Broken',
            })
          }
        >
          <option value="Active">Calendar: Active</option>
          <option value="Broken">Calendar: Broken</option>
        </select>
        <select
          className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none"
          value={form.introEmailStatus}
          onChange={(e) =>
            setForm({
              ...form,
              introEmailStatus: e.target.value as
                | 'Set up'
                | 'Error'
                | 'Not set up',
            })
          }
        >
          <option value="Set up">Intro Email: Set up</option>
          <option value="Error">Intro Email: Error</option>
          <option value="Not set up">Intro Email: Not set up</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
          placeholder="Recruiters (comma-separated)"
          value={form.recruiters}
          onChange={(e) => setForm({ ...form, recruiters: e.target.value })}
        />
        <input
          type="date"
          className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none"
          value={form.lastActivity}
          onChange={(e) => setForm({ ...form, lastActivity: e.target.value })}
        />
      </div>
      <textarea
        className="w-full bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none resize-none"
        placeholder="Notes"
        rows={2}
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      <div className="flex gap-2">
        <button
          onClick={isEdit ? updateRole : addRole}
          className="bg-accent hover:bg-accent-dim text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1"
        >
          <Save size={14} /> {isEdit ? 'Update' : 'Add Role'}
        </button>
        <button
          onClick={() => {
            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1"
        >
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Roles Health</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className="bg-accent hover:bg-accent-dim text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1"
        >
          <Plus size={14} /> Add Role
        </button>
      </div>

      {(showForm || editingId) && <RoleForm isEdit={!!editingId} />}

      {roles.length === 0 && !showForm ? (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
          <p>No roles tracked yet. Add a role to monitor its health.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => {
            const health = getHealthColor(role);
            return (
              <div
                key={role.id}
                className={`${health.bg} border ${health.border} rounded-xl p-4`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">
                        {role.clientName}
                      </span>
                      <span className="text-gray-500">&rarr;</span>
                      <span className="text-gray-300">{role.roleTitle}</span>
                      {health.label === 'Critical' && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle size={10} /> Critical
                        </span>
                      )}
                      {health.label === 'Attention' && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle size={10} /> Needs Attention
                        </span>
                      )}
                      {health.label === 'Healthy' && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={10} /> Healthy
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Calendar</p>
                        <button
                          onClick={() => toggleCalendarStatus(role.id)}
                          className={`text-xs px-2 py-1 rounded ${
                            role.calendarStatus === 'Active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {role.calendarStatus}
                        </button>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Intro Email
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            role.introEmailStatus === 'Set up'
                              ? 'bg-green-500/20 text-green-400'
                              : role.introEmailStatus === 'Error'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {role.introEmailStatus}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Recruiters</p>
                        <p className="text-gray-300 text-xs">
                          {role.recruiters || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Last Activity
                        </p>
                        <p className="text-gray-300 text-xs">
                          {role.lastActivity || '—'}
                        </p>
                      </div>
                    </div>

                    {role.calendarLink && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-accent">
                        <Link size={10} />
                        <a
                          href={role.calendarLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate"
                        >
                          {role.calendarLink}
                        </a>
                      </div>
                    )}

                    {role.notes && (
                      <p className="mt-2 text-xs text-gray-400">
                        {role.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(role)}
                      className="text-gray-400 hover:text-accent p-1"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="text-gray-400 hover:text-red-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
