import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}
export default function AppLayout({
    children,
}: AppLayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    function handleLogout() {
        logout();
        navigate('/login', { replace: true });
    }
    function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const search = String(formData.get('search') || '').trim();
        if (!search) {
            navigate('/customers');
            return;
        }
        navigate(`/customers?search=${encodeURIComponent(search)}`);
    }
    return (
        <div className="min-h-screen bg-[#f5f7fa]">
            {/* =====================================================
                GLOBAL TOP BAR
            ====================================================== */}
            <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-slate-700 bg-[#263b52] text-white">
                <div className="flex h-full items-center">
                    {/* Brand icon */}
                    <Link
                        to="/customers"
                        title="CustomerFlow"
                        className="flex h-14 w-14 shrink-0 items-center justify-center border-r border-white/10 transition hover:bg-white/5"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
                            <CustomerIcon />
                        </div>
                    </Link>
                    {/* Search */}
                    <div className="flex min-w-0 flex-1 items-center px-3">
                        <form
                            onSubmit={handleSearch}
                            className="relative w-full max-w-md"
                        >
                            <SearchIcon />
                            <input
                                name="search"
                                type="search"
                                placeholder="Search customers"
                                autoComplete="off"
                                className="h-9 w-full rounded-md border border-white/10 bg-white/10 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white/[0.14] focus:ring-2 focus:ring-blue-400/20"
                            />
                        </form>
                        <Link
                            to="/customers/new"
                            title="Add customer"
                            className="ml-3 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-slate-200 transition hover:border-white/40 hover:bg-white/10 hover:text-white sm:flex"
                        >
                            <PlusIcon />
                        </Link>
                    </div>
                    {/* Right actions */}
                    <div className="flex h-full shrink-0 items-center">
                        <div className="hidden h-full items-center border-l border-white/10 px-4 md:flex">
                            <div className="mr-3 text-right">
                                <p className="max-w-[150px] truncate text-xs font-semibold text-white">
                                    {user?.name || 'User'}
                                </p>
                                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    {formatRole(user?.role)}
                                </p>
                            </div>
                            <UserAvatar name={user?.name || 'User'} />
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            title="Sign out"
                            aria-label="Sign out"
                            className="flex h-14 w-12 items-center justify-center border-l border-white/10 text-slate-300 transition hover:bg-white/5 hover:text-white"
                        >
                            <LogoutIcon />
                        </button>
                    </div>
                </div>
            </header>
            {/* =====================================================
                ICON NAVIGATION RAIL
            ====================================================== */}
            <aside className="fixed bottom-0 left-0 top-14 z-40 hidden w-14 flex-col border-r border-slate-200 bg-[#334a62] sm:flex">
                <nav className="flex flex-1 flex-col items-center py-3">
                    <RailLink
                        to="/customers"
                        end
                        label="Customers"
                    >
                        <UsersIcon />
                    </RailLink>
                    <RailLink
                        to="/customers/new"
                        label="Add customer"
                    >
                        <PlusIcon />
                    </RailLink>
                    {user?.role === 'ADMIN' && (
                        <RailLink to="/users" label="User Management">
                            <UserSettingsIcon />
                        </RailLink>
                    )}
                    <div className="my-3 h-px w-7 bg-white/15" />
                    {/* These navigate to the customer workspace.
                        Notes/documents themselves are record-level features. */}
                    <RailLink
                        to="/customers"
                        label="Customer records"
                    >
                        <RecordsIcon />
                    </RailLink>
                </nav>
                <div className="flex flex-col items-center border-t border-white/10 py-3">
                    <button
                        type="button"
                        title={`${user?.name || 'User'} · ${formatRole(
                            user?.role,
                        )}`}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-200 transition hover:bg-white/10 hover:text-white"
                    >
                        <UserAvatar name={user?.name || 'User'} />
                    </button>
                </div>
            </aside>
            {/* =====================================================
                MOBILE NAVIGATION
            ====================================================== */}
            <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl sm:hidden">
                <Link
                    to="/customers"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                    title="Customers"
                >
                    <UsersIcon />
                </Link>
                <Link
                    to="/customers/new"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white"
                    title="Add customer"
                >
                    <PlusIcon />
                </Link>
                {user?.role === 'ADMIN' && (
                    <Link to="/users" title="User Management" aria-label="User Management"
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
                        <UserSettingsIcon />
                    </Link>
                )}
            </div>
            {/* =====================================================
                APPLICATION WORKSPACE
            ====================================================== */}
            <div className="pt-14 sm:pl-14">
                <main className="min-h-[calc(100vh-3.5rem)]">
                    {children}
                </main>
            </div>
        </div>
    );
}
/* =========================================================
   NAVIGATION RAIL LINK
\\\\========================================================= */
interface RailLinkProps {
    to: string;
    label: string;
    children: ReactNode;
    end?: boolean;
}
function RailLink({
    to,
    label,
    children,
    end = false,
}: RailLinkProps) {
    return (
        <NavLink
            to={to}
            end={end}
            title={label}
            aria-label={label}
            className={({ isActive }) =>
                `relative mb-1 flex h-10 w-10 items-center justify-center rounded-lg transition ${isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`
            }
        >
            {children}
        </NavLink>
    );
}
/* =========================================================
   USER
\\\\========================================================= */
function UserAvatar({ name }: { name: string }) {
    const initials =
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join('') || 'U';
    return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-[10px] font-bold text-white shadow-sm">
            {initials}
        </div>
    );
}
function formatRole(role?: string) {
    if (role === 'ADMIN') {
        return 'Administrator';
    }
    if (role === 'STAFF') {
        return 'Staff';
    }
    return role || '';
}
/* =========================================================
   ICONS
\\\\========================================================= */
function CustomerIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
function UsersIcon() {
    return (
        <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
function PlusIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    );
}
function RecordsIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 4h16v16H4z" />
            <path d="M8 8h8" />
            <path d="M8 12h8" />
            <path d="M8 16h5" />
        </svg>
    );
}
function SearchIcon() {
    return (
        <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </svg>
    );
}
function LogoutIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
        </svg>
    );
}

function UserSettingsIcon() {
    return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="8" r="3" />
            <path d="M3.5 19v-2a5.5 5.5 0 0 1 11 0v2" />
            <path d="M18 8v6M15 11h6" />
        </svg>
    );
}
