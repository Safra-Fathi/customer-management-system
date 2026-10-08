
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import AppLayout from '../../components/layout/AppLayout';

type Role = 'ADMIN' | 'STAFF';
type Status = 'ACTIVE' | 'INACTIVE';

export default function RegisterUserPage() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<Role>('STAFF');
    const [status, setStatus] = useState<Status>('ACTIVE');
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Full name is required.');
            return;
        }

        if (password.length < 12) {
            setError('Password must contain at least 12 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!token) {
            setError('Your session has expired. Please sign in again.');
            return;
        }

        setSaving(true);

        try {
            await apiRequest('/users', {
                method: 'POST',
                token,
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    role,
                    status,
                }),
            });

            navigate('/users', { replace: true });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to register user',
            );
        } finally {
            setSaving(false);
        }
    }

    const inputClass =
        'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10';

    return (
        <AppLayout>
            <div className="mx-auto max-w-3xl px-5 py-7">
                <Link
                    to="/users"
                    className="text-sm font-medium text-slate-500 hover:text-blue-600"
                >
                    ← Back to User Management
                </Link>

                <div className="mb-6 mt-5">
                    <h1 className="text-xl font-semibold text-slate-900">
                        Register User
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Create an account for an authorized team member.
                    </p>
                </div>

                <form
                    onSubmit={(event) => void handleSubmit(event)}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    {error && (
                        <div
                            role="alert"
                            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="block sm:col-span-2">
                            <span className="text-sm font-medium text-slate-700">
                                Full name *
                            </span>
                            <input
                                required
                                maxLength={100}
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Enter full name"
                                className={inputClass}
                            />
                        </label>

                        <label className="block sm:col-span-2">
                            <span className="text-sm font-medium text-slate-700">
                                Email address *
                            </span>
                            <input
                                required
                                type="email"
                                maxLength={255}
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="name@company.com"
                                className={inputClass}
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                Password *
                            </span>
                            <input
                                required
                                type={showPassword ? 'text' : 'password'}
                                minLength={12}
                                maxLength={128}
                                autoComplete="new-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className={inputClass}
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                Confirm password *
                            </span>
                            <input
                                required
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                className={inputClass}
                            />
                        </label>

                        <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={(event) => setShowPassword(event.target.checked)}
                            />
                            Show passwords
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                User role *
                            </span>
                            <select
                                value={role}
                                onChange={(event) => setRole(event.target.value as Role)}
                                className={inputClass}
                            >
                                <option value="STAFF">Staff</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                Account status *
                            </span>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value as Status)}
                                className={inputClass}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </label>
                    </div>

                    <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
                        <Link
                            to="/users"
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {saving ? 'Registering...' : 'Register User'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
