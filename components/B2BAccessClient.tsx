'use client';

import { useEffect, useMemo, useState } from 'react';

type PortalAccess = 'b2c' | 'b2b';

type UserRow = {
  id: number;
  name: string;
  username: string;
  email: string;
  roles: string[];
  active: boolean;
  portals: PortalAccess[];
  b2bSections: string[];
};

type UsersResponse = {
  users: UserRow[];
  roles: string[];
};

const B2B_MENU_OPTIONS = [
  { key: 'overview', label: 'Overview' },
  { key: 'enquiries', label: 'Enquiries' },
  { key: 'distributors', label: 'Distributor Apps' },
  { key: 'installations', label: 'Installations' },
  { key: 'case-studies', label: 'Case Studies' },
  { key: 'solutions', label: 'Solutions' },
  { key: 'pages', label: 'Pages' },
  { key: 'super-settings', label: 'Super Settings' },
  { key: 'site-settings', label: 'Site Settings' },
  { key: 'scripts', label: 'Scripts' },
  { key: 'smtp', label: 'SMTP' },
  { key: 'forms', label: 'Forms Routing' },
  { key: 'access', label: 'Access' },
  { key: 'launch', label: 'Launch Control' },
  { key: 'audit', label: 'Audit Trail' },
];

export default function B2BAccessClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editingMenuUserId, setEditingMenuUserId] = useState<number | null>(null);
  const [draftMenus, setDraftMenus] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/users', { cache: 'no-store' });
        const data = (await res.json()) as Partial<UsersResponse> & { error?: string };
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load users.');
        }
        if (!alive) return;
        setUsers(Array.isArray(data.users) ? data.users : []);
        setRoles(Array.isArray(data.roles) ? data.roles : []);
      } catch (loadError) {
        if (!alive) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load users.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();

    return () => {
      alive = false;
    };
  }, []);

  const b2bUsers = useMemo(() => users.filter((user) => user.portals.includes('b2b')), [users]);

  async function updateUser(user: UserRow, next: Partial<Pick<UserRow, 'active' | 'portals' | 'b2bSections'>>) {
    setSavingId(user.id);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          active: next.active ?? user.active,
          portals: next.portals ?? user.portals,
          b2bSections: next.b2bSections ?? user.b2bSections,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user access.');
      }
      setUsers((current) => current.map((item) => {
        const updated = Array.isArray(data.updated) ? data.updated.find((entry: { userId: number }) => entry.userId === item.id) : null;
        if (!updated || item.id !== user.id) return item;
        return {
          ...item,
          active: Boolean(updated.active),
          portals: Array.isArray(updated.portals) ? updated.portals : item.portals,
          b2bSections: Array.isArray(updated.b2bSections) ? updated.b2bSections : item.b2bSections,
        };
      }));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update user access.');
    } finally {
      setSavingId(null);
    }
  }

  function togglePortal(portals: PortalAccess[], portal: PortalAccess) {
    return portals.includes(portal) ? portals.filter((item) => item !== portal) : [...portals, portal];
  }

  const b2bCount = b2bUsers.length;
  const activeB2BCount = b2bUsers.filter((user) => user.active).length;

  function openMenuEditor(user: UserRow) {
    setEditingMenuUserId(user.id);
    setDraftMenus(Array.isArray(user.b2bSections) ? user.b2bSections : []);
  }

  function toggleDraftMenu(menu: string) {
    setDraftMenus((current) => (current.includes(menu) ? current.filter((item) => item !== menu) : [...current, menu]));
  }

  async function saveMenuAccess(user: UserRow) {
    await updateUser(user, { b2bSections: draftMenus });
    setEditingMenuUserId(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">B2B Enabled</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{b2bCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Active B2B Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{activeB2BCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">WordPress Roles</p>
          <p className="text-sm text-gray-600 mt-2 leading-6">{roles.length === 0 ? 'Loading roles...' : roles.join(', ')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">B2B Access Users</h2>
            <p className="text-sm text-gray-500">Only users with B2B portal privilege are listed here.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            {roles.map((role) => (
              <span key={role} className="px-2.5 py-1 rounded-full bg-gray-100 capitalize">{role.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <p className="text-sm text-gray-500 py-10 text-center">Loading users...</p>
        ) : b2bUsers.length === 0 ? (
          <p className="text-sm text-gray-500 py-10 text-center">No users currently have B2B portal access.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">WordPress Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Active</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">B2C</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">B2B</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">B2B Menus</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {b2bUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{user.name || user.username}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{user.roles[0] ?? 'customer'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => updateUser(user, { active: !user.active })}
                        disabled={savingId === user.id}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {user.active ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                        <input
                          type="checkbox"
                          checked={user.portals.includes('b2c')}
                          onChange={() => updateUser(user, { portals: togglePortal(user.portals, 'b2c') })}
                          disabled={savingId === user.id}
                        />
                        B2C
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                        <input
                          type="checkbox"
                          checked={user.portals.includes('b2b')}
                          onChange={() => updateUser(user, { portals: togglePortal(user.portals, 'b2b') })}
                          disabled={savingId === user.id}
                        />
                        B2B
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openMenuEditor(user)}
                        disabled={savingId === user.id}
                        className="text-xs text-sky-700 hover:underline disabled:opacity-60"
                      >
                        {Array.isArray(user.b2bSections) && user.b2bSections.length > 0 ? `${user.b2bSections.length} selected` : 'All menus'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{savingId === user.id ? 'Saving...' : 'Privileges update instantly.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingMenuUserId !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">User Menu Access</h3>
              <button type="button" onClick={() => setEditingMenuUserId(null)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-500">Pick the B2B menus this user can open. Leave all unchecked to allow all menus.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {B2B_MENU_OPTIONS.map((menu) => (
                  <label key={menu.key} className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={draftMenus.includes(menu.key)} onChange={() => toggleDraftMenu(menu.key)} />
                    {menu.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setEditingMenuUserId(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  const user = users.find((entry) => entry.id === editingMenuUserId);
                  if (user) {
                    void saveMenuAccess(user);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-sm font-semibold text-white"
              >
                Save Menu Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}