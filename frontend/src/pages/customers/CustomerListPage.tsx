import {
    useEffect,
    useState,
} from 'react';

import { Link } from 'react-router-dom';

import { apiRequest } from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import AppLayout from '../../components/layout/AppLayout';

import {
    formatCustomerId,
    getCustomerDisplayName,
} from '../../types/customer';

import type {
    Customer,
    CustomerListResponse,
    CustomerStatus,
    CustomerType,
} from '../../types/customer';

const PAGE_SIZE = 10;

export default function CustomerListPage() {
    const { token } = useAuth();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState('');
    const [type, setType] = useState<CustomerType | ''>('');
    const [status, setStatus] = useState<CustomerStatus | ''>('');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void loadCustomers();
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, type, status, page, token]);

    async function loadCustomers() {
        if (!token) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams();

            if (search.trim()) {
                params.set(
                    'search',
                    search.trim(),
                );
            }

            if (type) {
                params.set('type', type);
            }

            if (status) {
                params.set('status', status);
            }

            params.set(
                'page',
                String(page),
            );

            params.set(
                'limit',
                String(PAGE_SIZE),
            );

            params.set(
                'sortBy',
                'createdAt',
            );

            params.set(
                'sortOrder',
                'desc',
            );

            const response =
                await apiRequest<CustomerListResponse>(
                    `/customers?${params.toString()}`,
                    {
                        token,
                    },
                );

            setCustomers(response.data);
            setTotal(response.meta.total);

            setTotalPages(
                Math.max(
                    response.meta.totalPages,
                    1,
                ),
            );

            if (
                response.meta.totalPages > 0 &&
                page > response.meta.totalPages
            ) {
                setPage(
                    response.meta.totalPages,
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load customers.',
            );
        } finally {
            setLoading(false);
        }
    }

    function resetFilters() {
        setSearch('');
        setType('');
        setStatus('');
        setPage(1);
    }

    function selectStatus(
        nextStatus: CustomerStatus | '',
    ) {
        setStatus(nextStatus);
        setPage(1);
    }

    const hasFilters = Boolean(
        search || type || status,
    );

    const startRecord =
        total === 0
            ? 0
            : (page - 1) *
            PAGE_SIZE +
            1;

    const endRecord = Math.min(
        page * PAGE_SIZE,
        total,
    );

    return (
        <AppLayout>
            <div className="min-h-[calc(100vh-3.5rem)] bg-[#f5f7fa]">
                {/* Page bar */}
                <div className="border-b border-slate-200 bg-white">
                    <div className="flex min-h-[72px] items-center justify-between gap-4 px-5 sm:px-7 lg:px-8">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                                    Customers
                                </h1>

                                {!loading && (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                        {total.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        <Link
                            to="/customers/new"
                            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <PlusIcon />

                            <span className="hidden sm:inline">
                                Add customer
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 py-5 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[1500px]">
                        {/* Status tabs */}
                        <div className="mb-4 flex items-center gap-1 overflow-x-auto border-b border-slate-200">
                            <StatusTab
                                label="All customers"
                                active={
                                    status === ''
                                }
                                onClick={() =>
                                    selectStatus('')
                                }
                            />

                            <StatusTab
                                label="Active"
                                active={
                                    status ===
                                    'ACTIVE'
                                }
                                onClick={() =>
                                    selectStatus(
                                        'ACTIVE',
                                    )
                                }
                            />

                            <StatusTab
                                label="Inactive"
                                active={
                                    status ===
                                    'INACTIVE'
                                }
                                onClick={() =>
                                    selectStatus(
                                        'INACTIVE',
                                    )
                                }
                            />

                            <StatusTab
                                label="Archived"
                                active={
                                    status ===
                                    'ARCHIVED'
                                }
                                onClick={() =>
                                    selectStatus(
                                        'ARCHIVED',
                                    )
                                }
                            />
                        </div>

                        {/* Customer workspace */}
                        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                            {/* Toolbar */}
                            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 xl:flex-row xl:items-center">
                                <div className="relative min-w-0 flex-1 xl:max-w-[520px]">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <SearchIcon />
                                    </div>

                                    <input
                                        type="search"
                                        value={
                                            search
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            setSearch(
                                                event
                                                    .target
                                                    .value,
                                            );
                                            setPage(
                                                1,
                                            );
                                        }}
                                        placeholder="Search by customer ID, name, email or phone"
                                        aria-label="Search customers"
                                        className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={
                                            type
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            setType(
                                                event
                                                    .target
                                                    .value as
                                                | CustomerType
                                                | '',
                                            );

                                            setPage(
                                                1,
                                            );
                                        }}
                                        aria-label="Filter by customer type"
                                        className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    >
                                        <option value="">
                                            All types
                                        </option>

                                        <option value="INDIVIDUAL">
                                            Individual
                                        </option>

                                        <option value="BUSINESS">
                                            Business
                                        </option>
                                    </select>

                                    <select
                                        value={
                                            status
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            setStatus(
                                                event
                                                    .target
                                                    .value as
                                                | CustomerStatus
                                                | '',
                                            );

                                            setPage(
                                                1,
                                            );
                                        }}
                                        aria-label="Filter by customer status"
                                        className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    >
                                        <option value="">
                                            All
                                            statuses
                                        </option>

                                        <option value="ACTIVE">
                                            Active
                                        </option>

                                        <option value="INACTIVE">
                                            Inactive
                                        </option>

                                        <option value="ARCHIVED">
                                            Archived
                                        </option>
                                    </select>

                                    {hasFilters && (
                                        <button
                                            type="button"
                                            onClick={
                                                resetFilters
                                            }
                                            className="h-9 rounded-md px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div
                                    role="alert"
                                    className="border-b border-red-200 bg-red-50 px-4 py-3"
                                >
                                    <div className="flex items-center gap-2 text-sm text-red-700">
                                        <ErrorIcon />

                                        <span>
                                            {
                                                error
                                            }
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Table */}
                            {loading ? (
                                <TableLoading />
                            ) : customers.length ===
                                0 ? (
                                <EmptyState
                                    filtered={
                                        hasFilters
                                    }
                                    onClear={
                                        resetFilters
                                    }
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[950px] border-collapse text-left">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-[#f8fafc] text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-500">
                                                <th className="px-4 py-3">
                                                    Customer
                                                </th>

                                                <th className="px-3 py-3">
                                                    Email
                                                </th>

                                                <th className="px-3 py-3">
                                                    Phone
                                                </th>

                                                <th className="px-3 py-3">
                                                    Type
                                                </th>

                                                <th className="px-3 py-3">
                                                    Status
                                                </th>

                                                <th className="px-3 py-3">
                                                    Created
                                                </th>

                                                <th className="w-12 px-3 py-3">
                                                    <span className="sr-only">
                                                        Open
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {customers.map(
                                                (
                                                    customer,
                                                ) => (
                                                    <CustomerRow
                                                        key={
                                                            customer.id
                                                        }
                                                        customer={
                                                            customer
                                                        }
                                                    />
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading &&
                                customers.length >
                                0 && (
                                    <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs text-slate-500">
                                            Showing{' '}
                                            <span className="font-semibold text-slate-700">
                                                {
                                                    startRecord
                                                }
                                            </span>
                                            {' – '}
                                            <span className="font-semibold text-slate-700">
                                                {
                                                    endRecord
                                                }
                                            </span>{' '}
                                            of{' '}
                                            <span className="font-semibold text-slate-700">
                                                {total.toLocaleString()}
                                            </span>{' '}
                                            customers
                                        </p>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                disabled={
                                                    page <=
                                                    1
                                                }
                                                onClick={() =>
                                                    setPage(
                                                        (
                                                            current,
                                                        ) =>
                                                            Math.max(
                                                                current -
                                                                1,
                                                                1,
                                                            ),
                                                    )
                                                }
                                                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="Previous page"
                                            >
                                                <ChevronLeftIcon />
                                            </button>

                                            <div className="flex h-8 min-w-8 items-center justify-center rounded-md bg-blue-50 px-2 text-xs font-semibold text-blue-700">
                                                {
                                                    page
                                                }
                                            </div>

                                            <span className="px-1 text-xs text-slate-400">
                                                of{' '}
                                                {
                                                    totalPages
                                                }
                                            </span>

                                            <button
                                                type="button"
                                                disabled={
                                                    page >=
                                                    totalPages
                                                }
                                                onClick={() =>
                                                    setPage(
                                                        (
                                                            current,
                                                        ) =>
                                                            Math.min(
                                                                current +
                                                                1,
                                                                totalPages,
                                                            ),
                                                    )
                                                }
                                                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="Next page"
                                            >
                                                <ChevronRightIcon />
                                            </button>
                                        </div>
                                    </div>
                                )}
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

/* =========================================================
   STATUS TAB
========================================================= */

function StatusTab({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition ${active
                    ? 'text-blue-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
        >
            {label}

            {active && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 bg-blue-600" />
            )}
        </button>
    );
}

/* =========================================================
   CUSTOMER ROW
========================================================= */

function CustomerRow({
    customer,
}: {
    customer: Customer;
}) {
    const name =
        getCustomerDisplayName(
            customer,
        );

    const customerId =
        formatCustomerId(
            customer.customerNumber,
        );

    return (
        <tr className="group transition hover:bg-[#f7faff]">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <CustomerAvatar
                        name={name}
                        business={
                            customer.type ===
                            'BUSINESS'
                        }
                    />

                    <div className="min-w-0">
                        <Link
                            to={`/customers/${customer.id}`}
                            className="block truncate text-sm font-semibold text-slate-800 transition hover:text-blue-700 hover:underline"
                        >
                            {name}
                        </Link>

                        <p className="mt-0.5 font-mono text-xs font-medium text-slate-400">
                            {customerId}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-3 py-3">
                {customer.email ? (
                    <a
                        href={`mailto:${customer.email}`}
                        className="text-sm text-slate-700 transition hover:text-blue-700 hover:underline"
                    >
                        {customer.email}
                    </a>
                ) : (
                    <span className="text-sm text-slate-400">
                        —
                    </span>
                )}
            </td>

            <td className="px-3 py-3">
                <span className="text-sm text-slate-600">
                    {customer.phone ||
                        '—'}
                </span>
            </td>

            <td className="px-3 py-3">
                <span className="text-sm text-slate-600">
                    {customer.type ===
                        'INDIVIDUAL'
                        ? 'Individual'
                        : 'Business'}
                </span>
            </td>

            <td className="px-3 py-3">
                <StatusBadge
                    status={
                        customer.status
                    }
                />
            </td>

            <td className="px-3 py-3">
                <span className="whitespace-nowrap text-sm text-slate-600">
                    {formatDate(
                        customer.createdAt,
                    )}
                </span>
            </td>

            <td className="px-3 py-3 text-right">
                <Link
                    to={`/customers/${customer.id}`}
                    title={`Open ${name}`}
                    aria-label={`Open ${name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 opacity-60 transition hover:bg-blue-50 hover:text-blue-700 group-hover:opacity-100"
                >
                    <ChevronRightIcon />
                </Link>
            </td>
        </tr>
    );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
    status,
}: {
    status: CustomerStatus;
}) {
    if (status === 'ACTIVE') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
            </span>
        );
    }

    if (status === 'INACTIVE') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Inactive
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Archived
        </span>
    );
}

/* =========================================================
   CUSTOMER AVATAR
========================================================= */

function CustomerAvatar({
    name,
    business,
}: {
    name: string;
    business: boolean;
}) {
    const initials =
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) =>
                part
                    .charAt(0)
                    .toUpperCase(),
            )
            .join('') || 'C';

    return (
        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${business
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
        >
            {initials}
        </div>
    );
}

/* =========================================================
   LOADING / EMPTY
========================================================= */

function TableLoading() {
    return (
        <div>
            {[1, 2, 3, 4, 5, 6].map(
                (item) => (
                    <div
                        key={item}
                        className="flex animate-pulse items-center gap-4 border-b border-slate-100 px-4 py-4"
                    >
                        <div className="h-9 w-9 rounded-full bg-slate-200" />

                        <div className="w-44">
                            <div className="h-3 w-32 rounded bg-slate-200" />
                            <div className="mt-2 h-2 w-20 rounded bg-slate-100" />
                        </div>

                        <div className="ml-8 hidden h-3 w-40 rounded bg-slate-100 md:block" />

                        <div className="ml-auto hidden h-6 w-20 rounded-full bg-slate-100 lg:block" />
                    </div>
                ),
            )}
        </div>
    );
}

function EmptyState({
    filtered,
    onClear,
}: {
    filtered: boolean;
    onClear: () => void;
}) {
    return (
        <div className="flex flex-col items-center px-6 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <UsersIcon />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No customers found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
                {filtered
                    ? 'No customer records match the current search or filters.'
                    : 'There are no customer records yet.'}
            </p>

            {filtered ? (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                    Clear filters
                </button>
            ) : (
                <Link
                    to="/customers/new"
                    className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    Add customer
                </Link>
            )}
        </div>
    );
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(
    value: string,
) {
    return new Date(
        value,
    ).toLocaleDateString(
        undefined,
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        },
    );
}

/* =========================================================
   ICONS
========================================================= */

function SearchIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle
                cx="11"
                cy="11"
                r="7"
            />
            <path d="m20 20-3.5-3.5" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg
            width="16"
            height="16"
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

function ChevronLeftIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

function UsersIcon() {
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

            <circle
                cx="9"
                cy="7"
                r="4"
            />

            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function ErrorIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
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