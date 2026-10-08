import {
    useEffect,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';

import {
    Link,
    useParams,
} from 'react-router-dom';

import { apiRequest } from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import AppLayout from '../../components/layout/AppLayout';

import {
    formatCustomerId,
    getCustomerDisplayName,
} from '../../types/customer';

import type {
    AddressType,
    CustomerProfile,
    CustomerProfileResponse,
} from '../../types/customer';

/* =========================================================
   TYPES
========================================================= */

type Tab =
    | 'overview'
    | 'addresses'
    | 'notes'
    | 'documents'
    | 'activity';

/* =========================================================
   CUSTOMER PROFILE PAGE
========================================================= */

export default function CustomerProfilePage() {
    const { id } = useParams();
    const { token, user } = useAuth();

    const [customer, setCustomer] =
        useState<CustomerProfile | null>(null);

    const [activeTab, setActiveTab] =
        useState<Tab>('overview');

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [showArchiveConfirm, setShowArchiveConfirm] =
        useState(false);

    const [archiving, setArchiving] =
        useState(false);

    const [archiveError, setArchiveError] =
        useState('');

    useEffect(() => {
        void loadCustomer();
    }, [id, token]);

    async function loadCustomer() {
        if (!id || !token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response =
                await apiRequest<CustomerProfileResponse>(
                    `/customers/${id}`,
                    {
                        token,
                    },
                );

            setCustomer(response.data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load customer profile.',
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleArchiveCustomer() {
        if (!token || !customer) {
            setArchiveError(
                'Your session is unavailable. Please sign in again.',
            );
            return;
        }

        setArchiving(true);
        setArchiveError('');

        try {
            await apiRequest(
                `/customers/${customer.id}`,
                {
                    method: 'DELETE',
                    token,
                },
            );

            setShowArchiveConfirm(false);
            await loadCustomer();
        } catch (err) {
            setArchiveError(
                err instanceof Error
                    ? err.message
                    : 'Unable to archive this customer.',
            );
        } finally {
            setArchiving(false);
        }
    }

    /* ---------------------------------------------------------
       LOADING
    --------------------------------------------------------- */

    if (loading) {
        return (
            <AppLayout>
                <div className="flex min-h-[55vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                        <p className="mt-4 text-sm font-medium text-slate-500">
                            Loading customer profile...
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    /* ---------------------------------------------------------
       ERROR
    --------------------------------------------------------- */

    if (error || !customer) {
        return (
            <AppLayout>
                <div className="mx-auto max-w-4xl py-8">
                    <Link
                        to="/customers"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                    >
                        <span aria-hidden="true">←</span>
                        Back to customers
                    </Link>

                    <div className="app-card mt-6 border-red-100 p-6">
                        <p className="font-semibold text-red-800">
                            Unable to load customer
                        </p>
                        <p className="mt-1 text-sm text-red-600">
                            {error || 'Customer not found.'}
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const displayName =
        getCustomerDisplayName(customer);

    const customerReference =
        formatCustomerId(
            customer.customerNumber,
        );

    const isArchived =
        customer.status === 'ARCHIVED';

    const canArchive =
        user?.role === 'ADMIN' &&
        !isArchived;

    return (
        <AppLayout>
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                    <Link
                        to="/customers"
                        className="font-medium text-slate-600 transition hover:text-blue-600"
                    >
                        Customers
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-mono text-xs font-semibold text-slate-400">
                        {customerReference}
                    </span>
                </div>

                <div className="mb-4 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <CustomerAvatar name={displayName} type={customer.type} />
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950">
                                    {displayName}
                                </h1>
                                <StatusBadge status={customer.status} />
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                <span className="font-mono text-xs font-semibold text-slate-500">
                                    {customerReference}
                                </span>
                                <span aria-hidden="true" className="text-slate-300">·</span>
                                <span>
                                    {customer.type === 'INDIVIDUAL'
                                        ? 'Individual customer'
                                        : 'Business customer'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                        {!isArchived && (
                            <Link
                                to={`/customers/${customer.id}/edit`}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                <EditIcon />
                                Edit customer
                            </Link>
                        )}

                        {canArchive && (
                            <button
                                type="button"
                                onClick={() => {
                                    setArchiveError('');
                                    setShowArchiveConfirm(true);
                                }}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                            >
                                <ArchiveIcon />
                                Archive
                            </button>
                        )}
                    </div>
                </div>

                {isArchived && (
                    <div className="mb-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                        <div className="mt-0.5 text-amber-600"><LockIcon /></div>
                        <div>
                            <p className="text-sm font-semibold text-amber-900">Archived customer — read-only</p>
                            <p className="mt-0.5 text-sm text-amber-700">
                                Historical information remains available, but this profile can no longer be modified.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_260px]">
                    <aside className="h-fit rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <CustomerAvatar name={displayName} type={customer.type} compact />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                                    <p className="mt-0.5 font-mono text-xs font-semibold text-slate-500">
                                        {customerReference}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {customer.type === 'INDIVIDUAL' ? 'Individual' : 'Business'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-4">
                            <SidebarField label="Email" value={customer.email} />
                            <SidebarField label="Phone" value={customer.phone} />

                            <div className="border-t border-slate-100 pt-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Related records</p>
                                <CountLink label="Addresses" count={customer.addresses?.length ?? 0} onClick={() => setActiveTab('addresses')} />
                                <CountLink label="Notes" count={customer.notes?.length ?? 0} onClick={() => setActiveTab('notes')} />
                                <CountLink label="Documents" count={customer.documents?.length ?? 0} onClick={() => setActiveTab('documents')} />
                                <CountLink label="Activity" count={customer.activities?.length ?? 0} onClick={() => setActiveTab('activity')} />
                            </div>
                        </div>
                    </aside>

                    <main className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto border-b border-slate-200 px-4">
                            <nav className="flex min-w-max gap-1">
                                <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                                <TabButton label={`Addresses (${customer.addresses?.length ?? 0})`} active={activeTab === 'addresses'} onClick={() => setActiveTab('addresses')} />
                                <TabButton label={`Notes (${customer.notes?.length ?? 0})`} active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
                                <TabButton label={`Documents (${customer.documents?.length ?? 0})`} active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
                                <TabButton label="Activity" active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} />
                            </nav>
                        </div>

                        <div className="p-4 sm:p-5">
                            {activeTab === 'overview' && <Overview customer={customer} />}
                            {activeTab === 'addresses' && <AddressesSection customer={customer} token={token} onUpdated={loadCustomer} />}
                            {activeTab === 'notes' && <NotesSection customer={customer} token={token} onUpdated={loadCustomer} />}
                            {activeTab === 'documents' && <DocumentsSection customer={customer} token={token} onUpdated={loadCustomer} />}
                            {activeTab === 'activity' && <ActivitySection customer={customer} />}
                        </div>
                    </main>

                    <aside className="h-fit rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-4 py-3">
                            <h2 className="text-sm font-semibold text-slate-900">Record details</h2>
                        </div>
                        <div className="divide-y divide-slate-100 px-4">
                            <RecordDetail label="Customer ID" value={customerReference} mono />
                            <RecordDetail label="Status"><StatusBadge status={customer.status} /></RecordDetail>
                            <RecordDetail label="Customer type" value={customer.type === 'INDIVIDUAL' ? 'Individual' : 'Business'} />
                            <RecordDetail label="Created" value={formatDateTime(customer.createdAt)} />
                            <RecordDetail label="Last updated" value={formatDateTime(customer.updatedAt)} />
                            <RecordDetail label="Activity" value={`${customer.activities?.length ?? 0} recorded actions`} />
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveTab('activity')}
                            className="w-full border-t border-slate-200 px-4 py-3 text-left text-sm font-semibold text-blue-600 transition hover:bg-slate-50"
                        >
                            View activity history
                        </button>
                    </aside>
                </div>
            </div>

            {showArchiveConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4" role="dialog" aria-modal="true" aria-labelledby="archive-customer-title">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
                        <h2 id="archive-customer-title" className="text-lg font-semibold text-slate-950">Archive customer?</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            <span className="font-semibold text-slate-800">{displayName}</span> will become read-only. Historical addresses, notes, documents and activity will remain available.
                        </p>
                        {archiveError && <ErrorMessage message={archiveError} />}
                        <div className="mt-6 flex justify-end gap-2">
                            <button type="button" disabled={archiving} onClick={() => { setShowArchiveConfirm(false); setArchiveError(''); }} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                            <button type="button" disabled={archiving} onClick={() => void handleArchiveCustomer()} className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                                {archiving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                                {archiving ? 'Archiving...' : 'Archive customer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

/* =========================================================
   OVERVIEW
========================================================= */

function Overview({ customer }: { customer: CustomerProfile }) {
    return (
        <div>
            <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-900">Customer information</h2>
                <p className="mt-1 text-sm text-slate-500">Primary identity and contact information for this record.</p>
            </div>

            <dl className="divide-y divide-slate-100 rounded-md border border-slate-200">
                <DetailRow label="Customer ID" value={formatCustomerId(customer.customerNumber)} mono />
                <DetailRow label="Customer type" value={customer.type === 'INDIVIDUAL' ? 'Individual' : 'Business'} />
                {customer.type === 'INDIVIDUAL' ? (
                    <>
                        <DetailRow label="First name" value={customer.firstName} />
                        <DetailRow label="Last name" value={customer.lastName} />
                    </>
                ) : (
                    <DetailRow label="Business name" value={customer.businessName} />
                )}
                <DetailRow label="Email address" value={customer.email} />
                <DetailRow label="Phone number" value={customer.phone} />
                <DetailRow label="Account status" value={formatStatus(customer.status)} />
            </dl>

            <div className="mt-6 flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Recent activity</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Latest recorded changes to this customer.</p>
                </div>
            </div>

            {(customer.activities?.length ?? 0) === 0 ? (
                <p className="py-6 text-sm text-slate-500">No activity has been recorded yet.</p>
            ) : (
                <div className="divide-y divide-slate-100">
                    {[...(customer.activities ?? [])].slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start justify-between gap-4 py-3">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800">{formatActivityAction(activity.action)}</p>
                                <p className="mt-0.5 truncate text-xs text-slate-500">{activity.actor?.name || 'System'}</p>
                            </div>
                            <time className="shrink-0 text-xs text-slate-400" dateTime={activity.createdAt}>{formatDateTime(activity.createdAt)}</time>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* =========================================================
   ADDRESSES
========================================================= */

function AddressesSection({
    customer,
    token,
    onUpdated,
}: {
    customer: CustomerProfile;
    token: string | null;
    onUpdated: () => Promise<void>;
}) {
    const [showForm, setShowForm] =
        useState(false);

    const [editingAddressId, setEditingAddressId] =
        useState<string | null>(null);

    const [deletingAddressId, setDeletingAddressId] =
        useState<string | null>(null);

    const [type, setType] =
        useState<AddressType>('HOME');

    const [addressLine1, setAddressLine1] =
        useState('');

    const [addressLine2, setAddressLine2] =
        useState('');

    const [city, setCity] =
        useState('');

    const [state, setState] =
        useState('');

    const [postalCode, setPostalCode] =
        useState('');

    const [country, setCountry] =
        useState('');

    const [submitting, setSubmitting] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [error, setError] =
        useState('');

    const isArchived =
        customer.status === 'ARCHIVED';

    /* =====================================================
       RESET
    ===================================================== */

    function resetForm() {
        setType('HOME');
        setAddressLine1('');
        setAddressLine2('');
        setCity('');
        setState('');
        setPostalCode('');
        setCountry('');
        setEditingAddressId(null);
        setError('');
    }

    function handleCancel() {
        resetForm();
        setShowForm(false);
    }

    /* =====================================================
       ADD ADDRESS
    ===================================================== */

    function handleAddAddress() {
        resetForm();
        setShowForm(true);
    }

    /* =====================================================
       EDIT ADDRESS
    ===================================================== */

    function handleEditAddress(
        address: CustomerProfile['addresses'][number],
    ) {
        setEditingAddressId(address.id);

        setType(address.type);

        setAddressLine1(
            address.addressLine1 ?? '',
        );

        setAddressLine2(
            address.addressLine2 ?? '',
        );

        setCity(
            address.city ?? '',
        );

        setState(
            address.state ?? '',
        );

        setPostalCode(
            address.postalCode ?? '',
        );

        setCountry(
            address.country ?? '',
        );

        setError('');
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    /* =====================================================
       CREATE / UPDATE SUBMIT
    ===================================================== */

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!token) {
            setError(
                'Your session is unavailable. Please sign in again.',
            );

            return;
        }

        if (!addressLine1.trim()) {
            setError(
                'Address Line 1 is required.',
            );

            return;
        }

        if (!city.trim()) {
            setError(
                'City is required.',
            );

            return;
        }

        if (!state.trim()) {
            setError(
                'State / Province is required.',
            );

            return;
        }

        if (!postalCode.trim()) {
            setError(
                'Postal Code is required.',
            );

            return;
        }

        if (!country.trim()) {
            setError(
                'Country is required.',
            );

            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const body = {
                type,

                addressLine1:
                    addressLine1.trim(),

                addressLine2:
                    addressLine2.trim() ||
                    undefined,

                city:
                    city.trim(),

                state:
                    state.trim(),

                postalCode:
                    postalCode.trim(),

                country:
                    country.trim(),
            };

            if (editingAddressId) {
                await apiRequest(
                    `/customers/${customer.id}/addresses/${editingAddressId}`,
                    {
                        method: 'PATCH',
                        token,
                        body: JSON.stringify(
                            body,
                        ),
                    },
                );
            } else {
                await apiRequest(
                    `/customers/${customer.id}/addresses`,
                    {
                        method: 'POST',
                        token,
                        body: JSON.stringify(
                            body,
                        ),
                    },
                );
            }

            resetForm();
            setShowForm(false);

            await onUpdated();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : editingAddressId
                        ? 'Unable to update address.'
                        : 'Unable to add address.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    /* =====================================================
       DELETE ADDRESS
    ===================================================== */

    async function handleDeleteAddress() {
        if (!deletingAddressId) {
            return;
        }

        if (!token) {
            setError(
                'Your session is unavailable. Please sign in again.',
            );

            return;
        }

        setDeleting(true);
        setError('');

        try {
            await apiRequest(
                `/customers/${customer.id}/addresses/${deletingAddressId}`,
                {
                    method: 'DELETE',
                    token,
                },
            );

            setDeletingAddressId(null);

            await onUpdated();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to delete address.',
            );
        } finally {
            setDeleting(false);
        }
    }

    /* =====================================================
       UI
    ===================================================== */

    return (
        <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Addresses
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage residential,
                            business, billing and
                            shipping addresses
                            associated with this
                            customer.
                        </p>
                    </div>

                    {!isArchived &&
                        !showForm && (
                            <button
                                type="button"
                                onClick={
                                    handleAddAddress
                                }
                                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                                + Add Address
                            </button>
                        )}
                </div>

                {isArchived && (
                    <ReadOnlyNotice />
                )}

                {/* =============================================
                    ADD / EDIT FORM
                ============================================= */}

                {showForm &&
                    !isArchived && (
                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5"
                        >
                            <div>
                                <h3 className="font-semibold text-slate-900">
                                    {editingAddressId
                                        ? 'Edit Address'
                                        : 'Add Address'}
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {editingAddressId
                                        ? 'Update the selected customer address.'
                                        : 'Add another address to the customer profile.'}
                                </p>
                            </div>

                            {error && (
                                <ErrorMessage
                                    message={
                                        error
                                    }
                                />
                            )}

                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="address-type"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Address Type
                                    </label>

                                    <select
                                        id="address-type"
                                        value={type}
                                        onChange={(
                                            event,
                                        ) =>
                                            setType(
                                                event
                                                    .target
                                                    .value as AddressType,
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                    >
                                        <option value="HOME">
                                            Home
                                        </option>

                                        <option value="BUSINESS">
                                            Business
                                        </option>

                                        <option value="BILLING">
                                            Billing
                                        </option>

                                        <option value="SHIPPING">
                                            Shipping
                                        </option>

                                        <option value="OTHER">
                                            Other
                                        </option>
                                    </select>
                                </div>

                                <AddressInput
                                    label="Address Line 1"
                                    value={
                                        addressLine1
                                    }
                                    onChange={
                                        setAddressLine1
                                    }
                                    required
                                />

                                <AddressInput
                                    label="Address Line 2"
                                    value={
                                        addressLine2
                                    }
                                    onChange={
                                        setAddressLine2
                                    }
                                />

                                <AddressInput
                                    label="City"
                                    value={city}
                                    onChange={
                                        setCity
                                    }
                                    required
                                />

                                <AddressInput
                                    label="State / Province"
                                    value={state}
                                    onChange={
                                        setState
                                    }
                                    required
                                />

                                <AddressInput
                                    label="Postal Code"
                                    value={
                                        postalCode
                                    }
                                    onChange={
                                        setPostalCode
                                    }
                                    required
                                />

                                <AddressInput
                                    label="Country"
                                    value={
                                        country
                                    }
                                    onChange={
                                        setCountry
                                    }
                                    required
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={
                                        handleCancel
                                    }
                                    disabled={
                                        submitting
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        submitting
                                    }
                                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting
                                        ? editingAddressId
                                            ? 'Updating...'
                                            : 'Saving...'
                                        : editingAddressId
                                            ? 'Update Address'
                                            : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    )}

                {/* =============================================
                    ERROR OUTSIDE FORM
                ============================================= */}

                {!showForm &&
                    error && (
                        <ErrorMessage
                            message={error}
                        />
                    )}

                {/* =============================================
                    ADDRESS LIST
                ============================================= */}

                <div className="mt-6">
                    {customer.addresses
                        .length === 0 ? (
                        <EmptyState
                            title="No addresses added"
                            description="Addresses associated with this customer will appear here."
                        />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {customer.addresses.map(
                                (address) => (
                                    <article
                                        key={
                                            address.id
                                        }
                                        className="rounded-xl border border-slate-200 p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                {formatAddressType(
                                                    address.type,
                                                )}
                                            </span>

                                            {!isArchived && (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditAddress(
                                                                address,
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setError(
                                                                '',
                                                            );

                                                            setDeletingAddressId(
                                                                address.id,
                                                            );
                                                        }}
                                                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4">
                                            <p className="font-medium text-slate-900">
                                                {
                                                    address.addressLine1
                                                }
                                            </p>

                                            {address.addressLine2 && (
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {
                                                        address.addressLine2
                                                    }
                                                </p>
                                            )}

                                            <p className="mt-2 text-sm text-slate-600">
                                                {
                                                    address.city
                                                }

                                                {address.state
                                                    ? `, ${address.state}`
                                                    : ''}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-600">
                                                {
                                                    address.postalCode
                                                }
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {
                                                    address.country
                                                }
                                            </p>
                                        </div>

                                        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                                            Added{' '}
                                            {formatDateTime(
                                                address.createdAt,
                                            )}

                                            {address.updatedAt !==
                                                address.createdAt && (
                                                    <>
                                                        {' '}
                                                        · Updated{' '}
                                                        {formatDateTime(
                                                            address.updatedAt,
                                                        )}
                                                    </>
                                                )}
                                        </p>
                                    </article>
                                ),
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* =============================================
                DELETE CONFIRMATION
            ============================================= */}

            {deletingAddressId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-address-title"
                >
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h2
                            id="delete-address-title"
                            className="text-lg font-semibold text-slate-900"
                        >
                            Delete Address?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            This address will be
                            permanently removed
                            from the customer
                            profile. The deletion
                            will still be recorded
                            in Activity History.
                        </p>

                        {error && (
                            <ErrorMessage
                                message={error}
                            />
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={
                                    deleting
                                }
                                onClick={() => {
                                    setDeletingAddressId(
                                        null,
                                    );

                                    setError('');
                                }}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    deleting
                                }
                                onClick={() =>
                                    void handleDeleteAddress()
                                }
                                className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleting
                                    ? 'Deleting...'
                                    : 'Delete Address'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* =========================================================
   INTERNAL NOTES
========================================================= */

function NotesSection({
    customer,
    token,
    onUpdated,
}: {
    customer: CustomerProfile;
    token: string | null;
    onUpdated: () => Promise<void>;
}) {
    const [note, setNote] =
        useState('');

    const [showForm, setShowForm] =
        useState(false);

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [error, setError] =
        useState('');

    const isArchived =
        customer.status === 'ARCHIVED';

    const sortedNotes = [
        ...customer.notes,
    ].sort(
        (a, b) =>
            new Date(
                b.createdAt,
            ).getTime() -
            new Date(
                a.createdAt,
            ).getTime(),
    );

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!token) {
            setError(
                'Your session is unavailable. Please sign in again.',
            );

            return;
        }

        const trimmedNote =
            note.trim();

        if (!trimmedNote) {
            setError(
                'Please enter a note.',
            );

            return;
        }

        if (
            trimmedNote.length >
            5000
        ) {
            setError(
                'Notes cannot exceed 5,000 characters.',
            );

            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await apiRequest(
                `/customers/${customer.id}/notes`,
                {
                    method: 'POST',
                    token,

                    body: JSON.stringify({
                        note: trimmedNote,
                    }),
                },
            );

            setNote('');
            setShowForm(false);

            await onUpdated();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to save the note.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    function handleCancel() {
        setNote('');
        setError('');
        setShowForm(false);
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Internal Notes
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Maintain customer
                        history, follow-ups,
                        decisions and important
                        internal account
                        information.
                    </p>
                </div>

                {!isArchived &&
                    !showForm && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(
                                    true,
                                );

                                setError('');
                            }}
                            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            + Add Note
                        </button>
                    )}
            </div>

            {isArchived && (
                <ReadOnlyNotice />
            )}

            {showForm &&
                !isArchived && (
                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5"
                    >
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                            <div>
                                <h3 className="font-semibold text-slate-900">
                                    Add Internal
                                    Note
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Notes are
                                    recorded
                                    against your
                                    user account
                                    and timestamp.
                                </p>
                            </div>

                            <span className="text-xs font-medium text-slate-400">
                                Internal use only
                            </span>
                        </div>

                        {error && (
                            <ErrorMessage
                                message={
                                    error
                                }
                            />
                        )}

                        <div className="mt-5">
                            <label
                                htmlFor="customer-note"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Note
                            </label>

                            <textarea
                                id="customer-note"
                                value={note}
                                onChange={(
                                    event,
                                ) =>
                                    setNote(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                maxLength={
                                    5000
                                }
                                rows={6}
                                autoFocus
                                placeholder="Enter relevant customer information, follow-up details, decisions or other internal notes..."
                                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            />

                            <div className="mt-1 flex justify-between gap-3 text-xs text-slate-400">
                                <span>
                                    Maximum 5,000
                                    characters
                                </span>

                                <span>
                                    {note.length.toLocaleString()}{' '}
                                    / 5,000
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={
                                    handleCancel
                                }
                                disabled={
                                    submitting
                                }
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    !note.trim()
                                }
                                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting
                                    ? 'Saving...'
                                    : 'Save Note'}
                            </button>
                        </div>
                    </form>
                )}

            <div className="mt-6">
                {sortedNotes.length ===
                    0 ? (
                    <EmptyState
                        title="No internal notes yet"
                        description="Staff notes and customer follow-up history will appear here."
                    />
                ) : (
                    <div className="space-y-4">
                        {sortedNotes.map(
                            (
                                customerNote,
                            ) => (
                                <article
                                    key={
                                        customerNote.id
                                    }
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-100 hover:shadow-md"
                                >
                                    <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {
                                                    customerNote
                                                        .author
                                                        .name
                                                }
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {
                                                    customerNote
                                                        .author
                                                        .email
                                                }
                                            </p>
                                        </div>

                                        <time
                                            dateTime={
                                                customerNote.createdAt
                                            }
                                            className="text-xs text-slate-500"
                                        >
                                            {formatDateTime(
                                                customerNote.createdAt,
                                            )}
                                        </time>
                                    </div>

                                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                                        {
                                            customerNote.note
                                        }
                                    </p>

                                    {customerNote.updatedAt !==
                                        customerNote.createdAt && (
                                            <p className="mt-4 text-xs text-slate-400">
                                                Last
                                                updated{' '}
                                                {formatDateTime(
                                                    customerNote.updatedAt,
                                                )}
                                            </p>
                                        )}
                                </article>
                            ),
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

/* =========================================================
   DOCUMENTS
========================================================= */

function DocumentsSection({
    customer,
    token,
    onUpdated,
}: {
    customer: CustomerProfile;
    token: string | null;
    onUpdated: () => Promise<void>;
}) {
    const [showForm, setShowForm] =
        useState(false);

    const [
        documentType,
        setDocumentType,
    ] = useState('');

    const [file, setFile] =
        useState<File | null>(null);

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        openingDocumentId,
        setOpeningDocumentId,
    ] = useState<string | null>(
        null,
    );

    const [error, setError] =
        useState('');

    const isArchived =
        customer.status ===
        'ARCHIVED';

    const MAX_FILE_SIZE =
        10 * 1024 * 1024;

    const ALLOWED_FILE_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
    ];

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!token) {
            setError(
                'Your session is unavailable. Please sign in again.',
            );

            return;
        }

        const trimmedDocumentType =
            documentType.trim();

        if (!trimmedDocumentType) {
            setError(
                'Please enter a document type.',
            );

            return;
        }

        if (!file) {
            setError(
                'Please select a document.',
            );

            return;
        }

        if (
            !ALLOWED_FILE_TYPES.includes(
                file.type,
            )
        ) {
            setError(
                'Only PDF, JPEG and PNG documents are allowed.',
            );

            return;
        }

        if (
            file.size >
            MAX_FILE_SIZE
        ) {
            setError(
                'The selected file exceeds the 10 MB upload limit.',
            );

            return;
        }

        const formData =
            new FormData();

        formData.append(
            'documentType',
            trimmedDocumentType,
        );

        formData.append(
            'file',
            file,
        );

        setSubmitting(true);
        setError('');

        try {
            await apiRequest(
                `/customers/${customer.id}/documents`,
                {
                    method: 'POST',
                    token,
                    body: formData,
                },
            );

            setDocumentType('');
            setFile(null);
            setShowForm(false);

            await onUpdated();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to upload the document.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    function handleCancel() {
        setDocumentType('');
        setFile(null);
        setError('');
        setShowForm(false);
    }

    async function handleOpenDocument(
        documentId: string,
    ) {
        if (!token) {
            setError(
                'Your session is unavailable. Please sign in again.',
            );

            return;
        }

        setOpeningDocumentId(
            documentId,
        );

        setError('');

        try {
            const apiUrl =
                import.meta.env
                    .VITE_API_URL;

            if (!apiUrl) {
                throw new Error(
                    'VITE_API_URL is not configured.',
                );
            }

            const response =
                await fetch(
                    `${apiUrl}/customers/${customer.id}/documents/${documentId}/download`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    },
                );

            if (!response.ok) {
                const data =
                    await response
                        .json()
                        .catch(
                            () => null,
                        );

                const message =
                    Array.isArray(
                        data?.message,
                    )
                        ? data.message.join(
                            ', ',
                        )
                        : data?.message ||
                        'Unable to open the document.';

                throw new Error(
                    message,
                );
            }

            const blob =
                await response.blob();

            const objectUrl =
                URL.createObjectURL(
                    blob,
                );

            const newWindow =
                window.open(
                    objectUrl,
                    '_blank',
                );

            if (!newWindow) {
                URL.revokeObjectURL(
                    objectUrl,
                );

                throw new Error(
                    'The browser blocked the document window. Please allow pop-ups and try again.',
                );
            }

            window.setTimeout(
                () => {
                    URL.revokeObjectURL(
                        objectUrl,
                    );
                },
                60_000,
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to open the document.',
            );
        } finally {
            setOpeningDocumentId(
                null,
            );
        }
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Documents
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Store and review
                        documents associated
                        with this customer.
                        Supported file types
                        are PDF, JPEG and PNG,
                        up to 10 MB.
                    </p>
                </div>

                {!isArchived &&
                    !showForm && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(
                                    true,
                                );

                                setError('');
                            }}
                            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            + Add Document
                        </button>
                    )}
            </div>

            {isArchived && (
                <ReadOnlyNotice />
            )}

            {showForm &&
                !isArchived && (
                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5"
                    >
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                Upload Document
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Select a
                                document and
                                describe its
                                purpose.
                            </p>
                        </div>

                        {error && (
                            <ErrorMessage
                                message={
                                    error
                                }
                            />
                        )}

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="document-type"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Document Type
                                </label>

                                <input
                                    id="document-type"
                                    type="text"
                                    value={
                                        documentType
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setDocumentType(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="e.g. Identification"
                                    required
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="document-file"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    File
                                </label>

                                <input
                                    id="document-file"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                    required
                                    onChange={(
                                        event,
                                    ) => {
                                        const selectedFile =
                                            event
                                                .target
                                                .files?.[0] ??
                                            null;

                                        setFile(
                                            selectedFile,
                                        );

                                        setError('');
                                    }}
                                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                                />

                                <p className="mt-1.5 text-xs text-slate-400">
                                    PDF, JPEG or
                                    PNG. Maximum
                                    10 MB.
                                </p>
                            </div>
                        </div>

                        {file && (
                            <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
                                <p className="break-all text-sm font-medium text-slate-800">
                                    {file.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    {formatFileSize(
                                        file.size,
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={
                                    handleCancel
                                }
                                disabled={
                                    submitting
                                }
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    !file ||
                                    !documentType.trim()
                                }
                                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting
                                    ? 'Uploading...'
                                    : 'Upload Document'}
                            </button>
                        </div>
                    </form>
                )}

            {!showForm &&
                error && (
                    <ErrorMessage
                        message={error}
                    />
                )}

            <div className="mt-6">
                {customer.documents
                    .length === 0 ? (
                    <EmptyState
                        title="No documents uploaded"
                        description="Documents associated with this customer will appear here."
                    />
                ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Document
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Type
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Size
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Uploaded By
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Uploaded
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {customer.documents.map(
                                        (
                                            document,
                                        ) => (
                                            <tr
                                                key={
                                                    document.id
                                                }
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <DocumentIcon
                                                            mimeType={
                                                                document.mimeType
                                                            }
                                                        />

                                                        <div className="min-w-0">
                                                            <p
                                                                className="max-w-xs truncate text-sm font-semibold text-slate-800"
                                                                title={
                                                                    document.fileName
                                                                }
                                                            >
                                                                {
                                                                    document.fileName
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                {formatFileKind(
                                                                    document.mimeType,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {formatDocumentType(
                                                        document.documentType,
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                    {formatFileSize(
                                                        document.fileSize,
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {
                                                            document
                                                                .uploadedBy
                                                                .name
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {
                                                            document
                                                                .uploadedBy
                                                                .email
                                                        }
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                    {formatDateTime(
                                                        document.uploadedAt,
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            void handleOpenDocument(
                                                                document.id,
                                                            )
                                                        }
                                                        disabled={
                                                            openingDocumentId ===
                                                            document.id
                                                        }
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {openingDocumentId ===
                                                            document.id
                                                            ? 'Opening...'
                                                            : 'View'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
/* =========================================================
   ACTIVITY HISTORY
========================================================= */

function ActivitySection({
    customer,
}: {
    customer: CustomerProfile;
}) {
    const activities = [
        ...(customer.activities ?? []),
    ].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
    );

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">
                    Activity History
                </h2>

                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    Review important actions performed on this
                    customer profile and the users responsible
                    for them.
                </p>
            </div>

            <div className="mt-6">
                {activities.length === 0 ? (
                    <EmptyState
                        title="No activity recorded"
                        description="Customer activity will appear here as changes are made to the profile."
                    />
                ) : (
                    <div className="relative">
                        <div className="absolute bottom-4 left-[17px] top-4 w-px bg-slate-200" />

                        <div className="space-y-5">
                            {activities.map(
                                (activity) => (
                                    <article
                                        key={activity.id}
                                        className="relative flex gap-4"
                                    >
                                        <ActivityIcon
                                            action={
                                                activity.action
                                            }
                                        />

                                        <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-4">
                                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {formatActivityAction(
                                                            activity.action,
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-600">
                                                        Performed by{' '}
                                                        <span className="font-medium text-slate-800">
                                                            {activity
                                                                .actor
                                                                ?.name ||
                                                                'Unknown user'}
                                                        </span>
                                                    </p>

                                                    {activity
                                                        .actor
                                                        ?.email && (
                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                {
                                                                    activity
                                                                        .actor
                                                                        .email
                                                                }
                                                            </p>
                                                        )}
                                                </div>

                                                <time
                                                    dateTime={
                                                        activity.createdAt
                                                    }
                                                    className="whitespace-nowrap text-xs text-slate-500"
                                                >
                                                    {formatDateTime(
                                                        activity.createdAt,
                                                    )}
                                                </time>
                                            </div>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function CustomerAvatar({
    name,
    type,
    compact = false,
}: {
    name: string;
    type: CustomerProfile['type'];
    compact?: boolean;
}) {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    return (
        <div className={`flex shrink-0 items-center justify-center rounded-md bg-blue-600 font-semibold text-white ${compact ? 'h-9 w-9 text-sm' : 'h-11 w-11 text-base'}`}>
            {initials || (type === 'BUSINESS' ? 'B' : 'C')}
        </div>
    );
}

function SidebarField({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-400">{label}</p>
            <p className="mt-1 break-words text-sm text-slate-700">{value || '—'}</p>
        </div>
    );
}

function CountLink({ label, count, onClick }: { label: string; count: number; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className="flex w-full items-center justify-between rounded px-1 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-blue-600">
            <span>{label}</span>
            <span className="font-semibold text-slate-900">{count}</span>
        </button>
    );
}

function RecordDetail({
    label,
    value,
    children,
    mono = false,
}: {
    label: string;
    value?: string;
    children?: ReactNode;
    mono?: boolean;
}) {
    return (
        <div className="py-3">
            <p className="text-xs font-medium text-slate-400">{label}</p>
            <div
                className={`mt-1 text-sm font-medium text-slate-700 ${mono ? 'font-mono' : ''
                    }`}
            >
                {children ?? value ?? '—'}
            </div>
        </div>
    );
}

function DetailRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value?: string | null;
    mono?: boolean;
}) {
    return (
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd
                className={`break-words text-sm font-medium text-slate-800 ${mono ? 'font-mono' : ''
                    }`}
            >
                {value || '—'}
            </dd>
        </div>
    );
}

function EditIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 20h4l11-11-4-4L4 16v4Z" />
            <path d="m13.5 6.5 4 4" />
        </svg>
    );
}

function ArchiveIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16v13H4z" />
            <path d="M3 4h18v3H3zM9 11h6" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
    );
}

function AddressInput({
    label,
    value,
    onChange,
    required = false,
}: {
    label: string;
    value: string;
    onChange: (
        value: string,
    ) => void;
    required?: boolean;
}) {
    const id = `address-${label
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            '-',
        )}`;

    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-slate-700"
            >
                {label}
            </label>

            <input
                id={id}
                type="text"
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                required={required}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
        </div>
    );
}

/* =========================================================
   ACTIVITY ICON
========================================================= */

function ActivityIcon({
    action,
}: {
    action: string;
}) {
    let label = '•';

    switch (action) {
        case 'CUSTOMER_CREATED':
            label = '+';
            break;

        case 'CUSTOMER_UPDATED':
            label = '✎';
            break;

        case 'CUSTOMER_ARCHIVED':
            label = 'A';
            break;

        case 'CUSTOMER_ACTIVATED':
            label = '✓';
            break;

        case 'CUSTOMER_DEACTIVATED':
            label = '−';
            break;

        case 'ADDRESS_ADDED':
        case 'ADDRESS_UPDATED':
        case 'ADDRESS_DELETED':
            label = '⌂';
            break;

        case 'NOTE_ADDED':
            label = 'N';
            break;

        case 'DOCUMENT_UPLOADED':
        case 'DOCUMENT_DELETED':
            label = 'D';
            break;

        default:
            label = '•';
            break;
    }

    return (
        <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm">
            {label}
        </div>
    );
}

/* =========================================================
   DOCUMENT ICON
========================================================= */

function DocumentIcon({
    mimeType,
}: {
    mimeType: string;
}) {
    const label =
        mimeType ===
            'application/pdf'
            ? 'PDF'
            : 'IMG';

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
            {label}
        </div>
    );
}

/* =========================================================
   INFORMATION FIELD
========================================================= */

/* =========================================================
   TAB BUTTON
========================================================= */

function TabButton({
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
            className={`relative px-4 py-4 text-sm font-semibold transition ${active
                ? 'text-indigo-700'
                : 'text-slate-500 hover:text-slate-900'
                }`}
        >
            {label}
            {active && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-indigo-600" />
            )}
        </button>
    );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
    status,
}: {
    status: CustomerProfile['status'];
}) {
    const styles =
        status === 'ACTIVE'
            ? 'bg-emerald-50 text-emerald-700'
            : status === 'INACTIVE'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-slate-200 text-slate-700';

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}
        >
            {formatStatus(status)}
        </span>
    );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-lg border border-dashed border-slate-300 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">
                {title}
            </p>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                {description}
            </p>
        </div>
    );
}

/* =========================================================
   ERROR MESSAGE
========================================================= */

function ErrorMessage({
    message,
}: {
    message: string;
}) {
    return (
        <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
            {message}
        </div>
    );
}

/* =========================================================
   READ ONLY NOTICE
========================================================= */

function ReadOnlyNotice() {
    return (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-800">
                Read-only profile
            </p>

            <p className="mt-1 text-sm text-amber-700">
                This customer is archived.
                Historical information remains
                available, but new information
                cannot be added.
            </p>
        </div>
    );
}

/* =========================================================
   FORMATTERS
========================================================= */

function formatDateTime(
    value: string,
) {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return '—';
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        },
    ).format(date);
}

function formatAddressType(
    type: AddressType,
) {
    switch (type) {
        case 'HOME':
            return 'Home';

        case 'BUSINESS':
            return 'Business';

        case 'BILLING':
            return 'Billing';

        case 'SHIPPING':
            return 'Shipping';

        case 'OTHER':
            return 'Other';

        default:
            return type;
    }
}

function formatStatus(
    status: CustomerProfile['status'],
) {
    switch (status) {
        case 'ACTIVE':
            return 'Active';

        case 'INACTIVE':
            return 'Inactive';

        case 'ARCHIVED':
            return 'Archived';

        default:
            return status;
    }
}

function formatFileSize(
    bytes: number,
) {
    if (
        !Number.isFinite(bytes) ||
        bytes < 0
    ) {
        return '—';
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const kilobytes =
        bytes / 1024;

    if (kilobytes < 1024) {
        return `${kilobytes.toFixed(
            1,
        )} KB`;
    }

    const megabytes =
        kilobytes / 1024;

    return `${megabytes.toFixed(
        1,
    )} MB`;
}

function formatFileKind(
    mimeType: string,
) {
    switch (mimeType) {
        case 'application/pdf':
            return 'PDF document';

        case 'image/jpeg':
            return 'JPEG image';

        case 'image/png':
            return 'PNG image';

        default:
            return 'Document';
    }
}

function formatDocumentType(
    value: string,
) {
    return value
        .trim()
        .replace(
            /[_-]+/g,
            ' ',
        )
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase(),
        );
}

function formatActivityAction(
    action: string,
) {
    switch (action) {
        case 'CUSTOMER_CREATED':
            return 'Customer created';

        case 'CUSTOMER_UPDATED':
            return 'Customer profile updated';

        case 'CUSTOMER_ARCHIVED':
            return 'Customer archived';

        case 'CUSTOMER_ACTIVATED':
            return 'Customer activated';

        case 'CUSTOMER_DEACTIVATED':
            return 'Customer deactivated';

        case 'ADDRESS_ADDED':
            return 'Address added';

        case 'ADDRESS_UPDATED':
            return 'Address updated';

        case 'ADDRESS_DELETED':
            return 'Address removed';

        case 'NOTE_ADDED':
            return 'Internal note added';

        case 'DOCUMENT_UPLOADED':
            return 'Document uploaded';

        case 'DOCUMENT_DELETED':
            return 'Document removed';

        default:
            return action
                .toLowerCase()
                .replace(
                    /_/g,
                    ' ',
                )
                .replace(
                    /\b\w/g,
                    (letter) =>
                        letter.toUpperCase(),
                );
    }
}