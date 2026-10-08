import {
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';
import {
    Link,
    useNavigate,
} from 'react-router-dom';

import { apiRequest } from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import AppLayout from '../../components/layout/AppLayout';

import type {
    Customer,
    CustomerType,
} from '../../types/customer';

interface CreateCustomerResponse {
    success: boolean;
    data: Customer;
}

export default function CreateCustomerPage() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [type, setType] = useState<CustomerType>('INDIVIDUAL');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!token) {
            setError('Your session is unavailable. Please sign in again.');
            return;
        }

        setError('');

        if (
            type === 'INDIVIDUAL' &&
            (!firstName.trim() || !lastName.trim())
        ) {
            setError('First name and last name are required.');
            return;
        }

        if (type === 'BUSINESS' && !businessName.trim()) {
            setError('Business name is required.');
            return;
        }

        if (!email.trim()) {
            setError('Email address is required.');
            return;
        }

        if (!phone.trim()) {
            setError('Phone number is required.');
            return;
        }

        setSubmitting(true);

        try {
            const body =
                type === 'INDIVIDUAL'
                    ? {
                        type,
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        email: email.trim(),
                        phone: phone.trim(),
                    }
                    : {
                        type,
                        businessName: businessName.trim(),
                        email: email.trim(),
                        phone: phone.trim(),
                    };

            const response =
                await apiRequest<CreateCustomerResponse>(
                    '/customers',
                    {
                        method: 'POST',
                        token,
                        body: JSON.stringify(body),
                    },
                );

            navigate(`/customers/${response.data.id}`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to create customer.',
            );
        } finally {
            setSubmitting(false);
        }
    }

    function selectType(customerType: CustomerType) {
        setType(customerType);
        setError('');
    }

    return (
        <AppLayout
            title="Add Customer"
            subtitle="Customer Relationship & Profile Management"
        >
            <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
                <div className="mb-5 flex items-center gap-2 text-sm">
                    <Link
                        to="/customers"
                        className="font-medium text-slate-600 transition hover:text-blue-600"
                    >
                        Customers
                    </Link>
                    <ChevronRightIcon />
                    <span className="text-slate-400">
                        Add customer
                    </span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                                Add customer
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Create a customer record. Addresses, notes and documents can be added from the profile afterwards.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <Link
                                to="/customers"
                                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex h-10 min-w-[145px] items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon />
                                        Create customer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="mb-5 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            <ErrorIcon />
                            <div>
                                <p className="font-semibold">
                                    Unable to create customer
                                </p>
                                <p className="mt-0.5">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <section className="border-b border-slate-200 px-5 py-5 sm:px-6">
                            <div className="grid gap-5 lg:grid-cols-[190px_1fr]">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Customer type
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Choose how this customer should be classified.
                                    </p>
                                </div>

                                <div className="inline-flex w-full max-w-md rounded-md border border-slate-300 bg-slate-50 p-1">
                                    <TypeButton
                                        selected={type === 'INDIVIDUAL'}
                                        onClick={() =>
                                            selectType('INDIVIDUAL')
                                        }
                                        icon={<PersonIcon />}
                                    >
                                        Individual
                                    </TypeButton>

                                    <TypeButton
                                        selected={type === 'BUSINESS'}
                                        onClick={() =>
                                            selectType('BUSINESS')
                                        }
                                        icon={<BuildingIcon />}
                                    >
                                        Business
                                    </TypeButton>
                                </div>
                            </div>
                        </section>

                        <section className="border-b border-slate-200 px-5 py-6 sm:px-6">
                            <div className="grid gap-6 lg:grid-cols-[190px_1fr]">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        {type === 'INDIVIDUAL'
                                            ? 'Customer information'
                                            : 'Business information'}
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {type === 'INDIVIDUAL'
                                            ? 'Enter the customer’s primary identity details.'
                                            : 'Enter the organization’s primary identity details.'}
                                    </p>
                                </div>

                                {type === 'INDIVIDUAL' ? (
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field
                                            label="First name"
                                            value={firstName}
                                            onChange={setFirstName}
                                            placeholder="Enter first name"
                                            autoComplete="given-name"
                                            required
                                        />

                                        <Field
                                            label="Last name"
                                            value={lastName}
                                            onChange={setLastName}
                                            placeholder="Enter last name"
                                            autoComplete="family-name"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="max-w-xl">
                                        <Field
                                            label="Business name"
                                            value={businessName}
                                            onChange={setBusinessName}
                                            placeholder="Enter company or organization name"
                                            autoComplete="organization"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="px-5 py-6 sm:px-6">
                            <div className="grid gap-6 lg:grid-cols-[190px_1fr]">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Contact information
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Primary email address and phone number for this customer.
                                    </p>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field
                                        label="Email address"
                                        type="email"
                                        value={email}
                                        onChange={setEmail}
                                        placeholder="customer@example.com"
                                        autoComplete="email"
                                        icon={<EmailIcon />}
                                        required
                                    />

                                    <Field
                                        label="Phone number"
                                        type="tel"
                                        value={phone}
                                        onChange={setPhone}
                                        placeholder="+1 555 000 0000"
                                        autoComplete="tel"
                                        icon={<PhoneIcon />}
                                        required
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-400">
                            Fields marked with <span className="font-bold text-red-500">*</span> are required.
                        </p>

                        <div className="flex items-center justify-end gap-2">
                            <Link
                                to="/customers"
                                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex h-10 min-w-[145px] items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon />
                                        Create customer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

function TypeButton({
    selected,
    onClick,
    icon,
    children,
}: {
    selected: boolean;
    onClick: () => void;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={`flex flex-1 items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-semibold transition ${selected
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
        >
            <span
                className={
                    selected
                        ? 'text-blue-600'
                        : 'text-slate-400'
                }
            >
                {icon}
            </span>
            {children}
        </button>
    );
}

interface FieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    placeholder?: string;
    autoComplete?: string;
    icon?: ReactNode;
}

function Field({
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    placeholder,
    autoComplete,
    icon,
}: FieldProps) {
    const id = label
        .toLowerCase()
        .replace(/\s+/g, '-');

    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-slate-700"
            >
                {label}
                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <div className="relative">
                {icon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        {icon}
                    </div>
                )}

                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    required={required}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={`h-10 w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ${icon ? 'pl-10 pr-3' : 'px-3'
                        }`}
                />
            </div>
        </div>
    );
}

function PersonIcon() {
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
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
    );
}

function BuildingIcon() {
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
            <path d="M3 21h18" />
            <path d="M6 21V4h9v17" />
            <path d="M15 9h3v12" />
            <path d="M9 8h3" />
            <path d="M9 12h3" />
            <path d="M9 16h3" />
        </svg>
    );
}

function EmailIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
        </svg>
    );
}

function PhoneIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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

function ChevronRightIcon() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-300"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

function ErrorIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="mt-0.5 shrink-0"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    );
}
