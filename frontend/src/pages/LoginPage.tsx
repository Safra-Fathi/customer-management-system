import {
    useState,
    type FormEvent,
} from 'react';

import {
    Navigate,
    useNavigate,
} from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
    const {
        login,
        user,
        isLoading,
    } = useAuth();

    const navigate = useNavigate();

    const [email, setEmail] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState('');

    const [submitting, setSubmitting] =
        useState(false);

    if (isLoading) {
        return (
            <main className="auth-background flex min-h-screen items-center justify-center">
                <div className="auth-grid" />

                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-white" />

                    <p className="text-sm font-medium text-slate-300">
                        Loading workspace...
                    </p>
                </div>
            </main>
        );
    }

    if (user) {
        return (
            <Navigate
                to="/customers"
                replace
            />
        );
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError('');
        setSubmitting(true);

        try {
            await login(
                email.trim(),
                password,
            );

            navigate(
                '/customers',
                {
                    replace: true,
                },
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to sign in. Please try again.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="auth-background flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
            {/* Animated grid */}
            <div className="auth-grid" />

            {/* Decorative glow */}
            <div className="pointer-events-none absolute left-[12%] top-[20%] h-32 w-32 rounded-full bg-indigo-400/10 blur-3xl" />

            <div className="pointer-events-none absolute bottom-[15%] right-[15%] h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

            {/* Main content */}
            <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/15 bg-white/5 shadow-2xl backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr]">

                {/* ============================================
                    LEFT BRAND PANEL
                ============================================ */}

                <section className="hidden min-h-[650px] flex-col justify-between p-12 text-white lg:flex">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-lg backdrop-blur-md">
                                <CustomerIcon />
                            </div>

                            <div>
                                <p className="text-sm font-semibold tracking-wide text-white">
                                    CustomerFlow
                                </p>

                                <p className="text-xs text-slate-400">
                                    Relationship Management
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-lg">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-medium text-indigo-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />

                            Customer Relationship Platform
                        </div>

                        <h1 className="text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl">
                            Manage every customer
                            relationship in
                            <span className="bg-gradient-to-r from-indigo-300 to-sky-300 bg-clip-text text-transparent">
                                {' '}
                                one place.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-md text-[15px] leading-7 text-slate-300">
                            A secure workspace for managing
                            customer profiles, addresses,
                            documents, notes and complete
                            activity history.
                        </p>

                        <div className="mt-10 grid grid-cols-2 gap-4">
                            <Feature
                                icon={<ProfileIcon />}
                                title="Customer Profiles"
                                description="Individual and business records"
                            />

                            <Feature
                                icon={<DocumentIcon />}
                                title="Documents"
                                description="Secure customer attachments"
                            />

                            <Feature
                                icon={<ActivityIcon />}
                                title="Activity History"
                                description="Track important changes"
                            />

                            <Feature
                                icon={<ShieldIcon />}
                                title="Role Security"
                                description="Admin and staff access"
                            />
                        </div>
                    </div>

                    <p className="text-xs text-slate-500">
                        Secure internal customer management workspace
                    </p>
                </section>

                {/* ============================================
                    LOGIN PANEL
                ============================================ */}

                <section className="flex min-h-[650px] items-center bg-slate-50/95 px-6 py-10 sm:px-10 lg:px-12">
                    <div className="mx-auto w-full max-w-sm">

                        {/* Mobile logo */}
                        <div className="mb-9 flex items-center gap-3 lg:hidden">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
                                <CustomerIcon />
                            </div>

                            <div>
                                <p className="font-semibold text-slate-900">
                                    CustomerFlow
                                </p>

                                <p className="text-xs text-slate-500">
                                    Relationship Management
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-indigo-600">
                                Welcome back
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                Sign in to your workspace
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Enter your credentials to access
                                customer management.
                            </p>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
                            >
                                <div className="mt-0.5 shrink-0">
                                    <ErrorIcon />
                                </div>

                                <span>
                                    {error}
                                </span>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-5"
                        >
                            {/* Email */}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <EmailIcon />
                                    </div>

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value,
                                            )
                                        }
                                        required
                                        autoComplete="email"
                                        placeholder="you@company.com"
                                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>
                            </div>

                            {/* Password */}

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <LockIcon />
                                    </div>

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value,
                                            )
                                        }
                                        required
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (current) =>
                                                    !current,
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 transition hover:text-slate-700"
                                    >
                                        {showPassword
                                            ? <EyeOffIcon />
                                            : <EyeIcon />
                                        }
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:-translate-y-0.5 hover:from-indigo-500 hover:to-indigo-600 hover:shadow-xl hover:shadow-indigo-600/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in

                                        <ArrowIcon />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 border-t border-slate-200 pt-6">
                            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                                <ShieldSmallIcon />

                                Authorized personnel only
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}


/* =========================================================
   FEATURE
========================================================= */

function Feature({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-300">
                {icon}
            </div>

            <p className="text-sm font-semibold text-white">
                {title}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
                {description}
            </p>
        </div>
    );
}


/* =========================================================
   ICONS
========================================================= */

function CustomerIcon() {
    return (
        <svg
            width="22"
            height="22"
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

function ProfileIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
    );
}

function DocumentIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
        </svg>
    );
}

function ActivityIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

function EmailIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
            />

            <path d="m3 7 9 6 9-6" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <rect
                x="4"
                y="10"
                width="16"
                height="11"
                rx="2"
            />

            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
    );
}

function EyeIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle
                cx="12"
                cy="12"
                r="3"
            />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="m3 3 18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a16 16 0 0 1-2.1 3.2" />
            <path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.5 8 10 8a10.7 10.7 0 0 0 5.4-1.5" />
        </svg>
    );
}

function ErrorIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <circle
                cx="12"
                cy="12"
                r="10"
            />

            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="transition-transform group-hover:translate-x-1"
        >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </svg>
    );
}

function ShieldSmallIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}