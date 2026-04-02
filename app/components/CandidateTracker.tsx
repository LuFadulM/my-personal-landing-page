'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  ChevronDown,
  ChevronRight,
  Filter,
  Building2,
  Briefcase,
  UserPlus,
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

interface Role {
  id: string;
  clientId: string;
  title: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  introEmailSent: boolean;
  introEmailDate: string;
  replied: boolean;
  notes: string;
  clientId: string;
  roleId: string;
}

function getDaysSince(dateStr: string): number {
  if (!dateStr) return 0;
  const sent = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24));
}

function needsFollowUp(c: Candidate): boolean {
  return c.introEmailSent && !c.replied && getDaysSince(c.introEmailDate) >= 2;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function CandidateTracker() {
  const [clients, setClients] = useState<Client[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterFollowUp, setFilterFollowUp] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [addingRoleFor, setAddingRoleFor] = useState<string | null>(null);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [addingCandFor, setAddingCandFor] = useState<string | null>(null);
  const [editingCand, setEditingCand] = useState<string | null>(null);
  const [candForm, setCandForm] = useState({
    name: '',
    email: '',
    status: 'Pending' as 'Approved' | 'Pending' | 'Rejected',
    introEmailSent: false,
    introEmailDate: '',
    replied: false,
    notes: '',
  });

  useEffect(() => {
    setClients(JSON.parse(localStorage.getItem('contrario_clients') || '[]'));
    setRoles(JSON.parse(localStorage.getItem('contrario_roles') || '[]'));
    setCandidates(JSON.parse(localStorage.getItem('contrario_candidates') || '[]'));
  }, []);

  const saveClients = (c: Client[]) => {
    setClients(c);
    localStorage.setItem('contrario_clients', JSON.stringify(c));
  };
  const saveRoles = (r: Role[]) => {
    setRoles(r);
    localStorage.setItem('contrario_roles', JSON.stringify(r));
  };
  const saveCandidates = (c: Candidate[]) => {
    setCandidates(c);
    localStorage.setItem('contrario_candidates', JSON.stringify(c));
  };

  const addClient = () => {
    if (!newClientName.trim()) return;
    saveClients([...clients, { id: genId(), name: newClientName.trim() }]);
    setNewClientName('');
    setShowAddClient(false);
  };

  const deleteClient = (clientId: string) => {
    saveClients(clients.filter((c) => c.id !== clientId));
    const roleIds = roles.filter((r) => r.clientId === clientId).map((r) => r.id);
    saveRoles(roles.filter((r) => r.clientId !== clientId));
    saveCandidates(candidates.filter((c) => !roleIds.includes(c.roleId)));
  };

  const addRole = (clientId: string) => {
    if (!newRoleTitle.trim()) return;
    saveRoles([...roles, { id: genId(), clientId, title: newRoleTitle.trim() }]);
    setNewRoleTitle('');
    setAddingRoleFor(null);
  };

  const deleteRole = (roleId: string) => {
    saveRoles(roles.filter((r) => r.id !== roleId));
    saveCandidates(candidates.filter((c) => c.roleId !== roleId));
  };

  const resetCandForm = () => {
    setCandForm({
      name: '',
      email: '',
      status: 'Pending',
      introEmailSent: false,
      introEmailDate: '',
      replied: false,
      notes: '',
    });
  };

  const addCandidate = (roleId: string) => {
    if (!candForm.name.trim()) return;
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    saveCandidates([
      ...candidates,
      {
        id: genId(),
        ...candForm,
        clientId: role.clientId,
        roleId,
      },
    ]);
    resetCandForm();
    setAddingCandFor(null);
  };

  const updateCandidate = (id: string) => {
    saveCandidates(
      candidates.map((c) => (c.id === id ? { ...c, ...candForm } : c))
    );
    resetCandForm();
    setEditingCand(null);
  };

  const deleteCandidate = (id: string) => {
    saveCandidates(candidates.filter((c) => c.id !== id));
  };

  const startEdit = (c: Candidate) => {
    setEditingCand(c.id);
    setCandForm({
      name: c.name,
      email: c.email,
      status: c.status,
      introEmailSent: c.introEmailSent,
      introEmailDate: c.introEmailDate,
      replied: c.replied,
      notes: c.notes,
    });
  };

  const toggleSet = (set: Set<string>, id: string): Set<string> => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  const filteredCandidates = (roleId: string) => {
    return candidates
      .filter((c) => c.roleId === roleId)
      .filter((c) => filterStatus === 'All' || c.status === filterStatus)
      .filter((c) => !filterFollowUp || needsFollowUp(c));
  };

  const statusColor = (s: string) => {
    if (s === 'Approved') return 'bg-green-500/20 text-green-400';
    if (s === 'Rejected') return 'bg-red-500/20 text-red-400';
    return 'bg-yellow-500/20 text-yellow-400';
  };

  const CandidateForm = ({
    roleId,
    isEdit,
    candId,
  }: {
    roleId: string;
    isEdit: boolean;
    candId?: string;
  }) => (
    <div className="bg-bg border border-gray-700 rounded-lg p-4 mt-2 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
          placeholder="Name"
          value={candForm.name}
          onChange={(e) => setCandForm({ ...candForm, name: e.target.value })}
        />
        <input
          className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
          placeholder="Email"
          value={candForm.email}
          onChange={(e) => setCandForm({ ...candForm, email: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none"
          value={candForm.status}
          onChange={(e) =>
            setCandForm({
              ...candForm,
              status: e.target.value as 'Approved' | 'Pending' | 'Rejected',
            })
          }
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <button
            type="button"
            onClick={() =>
              setCandForm({ ...candForm, introEmailSent: !candForm.introEmailSent })
            }
            className={`w-10 h-5 rounded-full transition-colors ${
              candForm.introEmailSent ? 'bg-accent' : 'bg-gray-600'
            } relative`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                candForm.introEmailSent ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
          Intro Email Sent
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <button
            type="button"
            onClick={() => setCandForm({ ...candForm, replied: !candForm.replied })}
            className={`w-10 h-5 rounded-full transition-colors ${
              candForm.replied ? 'bg-accent' : 'bg-gray-600'
            } relative`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                candForm.replied ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
          Replied
        </label>
      </div>
      {candForm.introEmailSent && (
        <input
          type="date"
          className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none"
          value={candForm.introEmailDate}
          onChange={(e) =>
            setCandForm({ ...candForm, introEmailDate: e.target.value })
          }
        />
      )}
      <textarea
        className="w-full bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none resize-none"
        placeholder="Notes"
        rows={2}
        value={candForm.notes}
        onChange={(e) => setCandForm({ ...candForm, notes: e.target.value })}
      />
      <div className="flex gap-2">
        <button
          onClick={() =>
            isEdit ? updateCandidate(candId!) : addCandidate(roleId)
          }
          className="bg-accent hover:bg-accent-dim text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1"
        >
          <Save size={14} /> {isEdit ? 'Update' : 'Add'}
        </button>
        <button
          onClick={() => {
            resetCandForm();
            setAddingCandFor(null);
            setEditingCand(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Candidate Tracker</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <Filter size={14} className="text-gray-400" />
            <select
              className="bg-bg-card border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-accent outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filterFollowUp}
              onChange={(e) => setFilterFollowUp(e.target.checked)}
              className="accent-accent"
            />
            Follow-up only
          </label>
          <button
            onClick={() => setShowAddClient(true)}
            className="bg-accent hover:bg-accent-dim text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1"
          >
            <Building2 size={14} /> Add Client
          </button>
        </div>
      </div>

      {showAddClient && (
        <div className="bg-bg-card border border-gray-700 rounded-lg p-4 mb-4 flex gap-2">
          <input
            className="flex-1 bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
            placeholder="Client name"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addClient()}
            autoFocus
          />
          <button
            onClick={addClient}
            className="bg-accent hover:bg-accent-dim text-white text-sm px-4 py-2 rounded-lg"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowAddClient(false);
              setNewClientName('');
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-3">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-bg-card border border-gray-800 rounded-xl overflow-hidden"
          >
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-bg-hover transition-colors"
              onClick={() =>
                setExpandedClients(toggleSet(expandedClients, client.id))
              }
            >
              <div className="flex items-center gap-2">
                {expandedClients.has(client.id) ? (
                  <ChevronDown size={16} className="text-accent" />
                ) : (
                  <ChevronRight size={16} className="text-gray-400" />
                )}
                <Building2 size={16} className="text-accent" />
                <span className="font-semibold text-white">{client.name}</span>
                <span className="text-xs text-gray-500">
                  ({roles.filter((r) => r.clientId === client.id).length} roles)
                </span>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setAddingRoleFor(client.id);
                    setNewRoleTitle('');
                  }}
                  className="text-gray-400 hover:text-accent text-xs flex items-center gap-1"
                >
                  <Briefcase size={12} /> Add Role
                </button>
                <button
                  onClick={() => deleteClient(client.id)}
                  className="text-gray-500 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {expandedClients.has(client.id) && (
              <div className="px-4 pb-4 space-y-2">
                {addingRoleFor === client.id && (
                  <div className="flex gap-2 ml-6">
                    <input
                      className="flex-1 bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
                      placeholder="Role title (e.g. Founding Sales Engineer)"
                      value={newRoleTitle}
                      onChange={(e) => setNewRoleTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addRole(client.id)}
                      autoFocus
                    />
                    <button
                      onClick={() => addRole(client.id)}
                      className="bg-accent hover:bg-accent-dim text-white text-sm px-3 py-2 rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingRoleFor(null)}
                      className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {roles
                  .filter((r) => r.clientId === client.id)
                  .map((role) => (
                    <div key={role.id} className="ml-6">
                      <div
                        className="flex items-center justify-between py-2 cursor-pointer hover:bg-bg-hover/50 rounded px-2 -mx-2 transition-colors"
                        onClick={() =>
                          setExpandedRoles(toggleSet(expandedRoles, role.id))
                        }
                      >
                        <div className="flex items-center gap-2">
                          {expandedRoles.has(role.id) ? (
                            <ChevronDown size={14} className="text-accent-light" />
                          ) : (
                            <ChevronRight size={14} className="text-gray-500" />
                          )}
                          <Briefcase size={14} className="text-accent-light" />
                          <span className="text-sm text-gray-200">
                            {role.title}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({filteredCandidates(role.id).length} candidates)
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setAddingCandFor(role.id);
                              resetCandForm();
                            }}
                            className="text-gray-400 hover:text-accent text-xs flex items-center gap-1"
                          >
                            <UserPlus size={12} /> Add Candidate
                          </button>
                          <button
                            onClick={() => deleteRole(role.id)}
                            className="text-gray-500 hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {expandedRoles.has(role.id) && (
                        <div className="ml-6 mt-1 space-y-2">
                          {addingCandFor === role.id && (
                            <CandidateForm roleId={role.id} isEdit={false} />
                          )}

                          {filteredCandidates(role.id).map((cand) => (
                            <div key={cand.id}>
                              {editingCand === cand.id ? (
                                <CandidateForm
                                  roleId={role.id}
                                  isEdit={true}
                                  candId={cand.id}
                                />
                              ) : (
                                <div className="bg-bg border border-gray-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium text-white text-sm">
                                        {cand.name}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${statusColor(
                                          cand.status
                                        )}`}
                                      >
                                        {cand.status}
                                      </span>
                                      {cand.introEmailSent && (
                                        <span className="text-xs text-green-400">
                                          Email sent
                                        </span>
                                      )}
                                      {cand.replied && (
                                        <span className="text-xs text-blue-400">
                                          Replied
                                        </span>
                                      )}
                                      {needsFollowUp(cand) && (
                                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
                                          Follow-up needed ({getDaysSince(cand.introEmailDate)}d)
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {cand.email}
                                      {cand.notes && ` — ${cand.notes}`}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => startEdit(cand)}
                                      className="text-gray-400 hover:text-accent p-1"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button
                                      onClick={() => deleteCandidate(cand.id)}
                                      className="text-gray-400 hover:text-red-400 p-1"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {filteredCandidates(role.id).length === 0 &&
                            addingCandFor !== role.id && (
                              <p className="text-xs text-gray-500 py-2">
                                No candidates match filters.
                              </p>
                            )}
                        </div>
                      )}
                    </div>
                  ))}

                {roles.filter((r) => r.clientId === client.id).length === 0 && (
                  <p className="text-xs text-gray-500 ml-6 py-2">
                    No roles yet. Add a role to get started.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {clients.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Building2 size={48} className="mx-auto mb-3 opacity-50" />
            <p>No clients yet. Add a client to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
