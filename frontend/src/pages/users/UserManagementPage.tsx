
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import AppLayout from '../../components/layout/AppLayout';

type Role = 'ADMIN' | 'STAFF';
type Status = 'ACTIVE' | 'INACTIVE';

interface ManagedUser {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: Status;
    createdAt: string;
}

interface UsersResponse {
    data: ManagedUser[];
}

export default function UserManagementPage() {
    const { token, user: currentUser } = useAuth();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const loadUsers = useCallback(async () => {
        if (!token) return;

        try {
            setError('');
            const response = await apiRequest<UsersResponse>(
                '/users',
                { token },
            );
            setUsers(response.data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load users',
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    async function changeStatus(account: ManagedUser) {
        if (!token || updatingId) return;

        const nextStatus: Status =
            account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        if (
            !window.confirm(
                `${nextStatus === 'INACTIVE' ? 'Deactivate' : 'Activate'} ${account.name}?`,
            )
        ) {
            return;
        }

        setUpdatingId(account.id);
        setError('');

        try {
            await apiRequest(`/users/${account.id}/status`, {
                method: 'PATCH',
                token,
                body: JSON.stringify({ status: nextStatus }),
            });

            await loadUsers();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to update user',
            );
        } finally {
            setUpdatingId(null);
        }
    }

    const filteredUsers = users.filter((account) =>
        `${account.name} ${account.email} ${account.role}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    return (
        <AppLayout>
            <div className="mx-auto max-w-6xl px-5 py-7">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">
                            User Management
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage access to CustomerFlow
                        </p>
                    </div>

                    <Link
                        to="/users/new"
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Register User
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 p-4">
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search users"
                            className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    {loading ? (
                        <p className="p-8 text-center text-sm text-slate-500">
                            Loading users...
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">User</th>
                                        <th className="px-5 py-3">Role</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Created</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((account) => (
                                        <tr key={account.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-900">
                                                    {account.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {account.email}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {account.role === 'ADMIN' ? 'Administrator' : 'Staff'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${account.status === 'ACTIVE'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    {account.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">
                                                {new Date(account.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        updatingId !== null ||
                                                        currentUser?.id === account.id
                                                    }
                                                    onClick={() => void changeStatus(account)}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    {updatingId === account.id
                                                        ? 'Updating...'
                                                        : account.status === 'ACTIVE'
                                                            ? 'Deactivate'
                                                            : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredUsers.length === 0 && (
                                <p className="p-8 text-center text-sm text-slate-500">
                                    No users found.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
