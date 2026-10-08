import {

    useEffect,

    useState,

    type FormEvent,

    type ReactNode,

} from 'react';



import {

    Link,

    useNavigate,

    useParams,

} from 'react-router-dom';



import { apiRequest } from '../../api/api';

import { useAuth } from '../../auth/AuthContext';

import AppLayout from '../../components/layout/AppLayout';



import type {

    CustomerProfile,

    CustomerProfileResponse,

    CustomerStatus,

    CustomerType,

} from '../../types/customer';



interface UpdateCustomerResponse {

    success: boolean;

    data: CustomerProfile;

}



export default function EditCustomerPage() {

    const { id } = useParams();

    const navigate = useNavigate();

    const { token } = useAuth();



    const [customer, setCustomer] =

        useState<CustomerProfile | null>(null);



    const [type, setType] =

        useState<CustomerType>('INDIVIDUAL');



    const [firstName, setFirstName] =

        useState('');



    const [lastName, setLastName] =

        useState('');



    const [businessName, setBusinessName] =

        useState('');



    const [email, setEmail] =

        useState('');



    const [phone, setPhone] =

        useState('');



    const [status, setStatus] =

        useState<CustomerStatus>('ACTIVE');



    const [loading, setLoading] =

        useState(true);



    const [submitting, setSubmitting] =

        useState(false);



    const [error, setError] =

        useState('');



    useEffect(() => {

        void loadCustomer();

    }, [id, token]);



    async function loadCustomer() {

        if (!id || !token) {

            setError(

                'Unable to load the customer.',

            );



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



            const data = response.data;



            setCustomer(data);

            setType(data.type);

            setFirstName(

                data.firstName ?? '',

            );

            setLastName(

                data.lastName ?? '',

            );

            setBusinessName(

                data.businessName ?? '',

            );

            setEmail(data.email);

            setPhone(data.phone);

            setStatus(data.status);

        } catch (err) {

            setError(

                err instanceof Error

                    ? err.message

                    : 'Unable to load the customer.',

            );

        } finally {

            setLoading(false);

        }

    }



    async function handleSubmit(

        event: FormEvent<HTMLFormElement>,

    ) {

        event.preventDefault();



        if (!id || !token) {

            setError(

                'Your session is unavailable. Please sign in again.',

            );



            return;

        }



        if (

            type === 'INDIVIDUAL' &&

            !firstName.trim()

        ) {

            setError(

                'First name is required for an individual customer.',

            );



            return;

        }



        if (

            type === 'INDIVIDUAL' &&

            !lastName.trim()

        ) {

            setError(

                'Last name is required for an individual customer.',

            );



            return;

        }



        if (

            type === 'BUSINESS' &&

            !businessName.trim()

        ) {

            setError(

                'Business name is required for a business customer.',

            );



            return;

        }



        if (!email.trim()) {

            setError(

                'Email address is required.',

            );



            return;

        }



        if (!phone.trim()) {

            setError(

                'Phone number is required.',

            );



            return;

        }



        setSubmitting(true);

        setError('');



        try {

            const body =

                type === 'INDIVIDUAL'

                    ? {

                        type,

                        firstName:

                            firstName.trim(),

                        lastName:

                            lastName.trim(),

                        businessName: null,

                        email:

                            email.trim(),

                        phone:

                            phone.trim(),

                        status,

                    }

                    : {

                        type,

                        firstName: null,

                        lastName: null,

                        businessName:

                            businessName.trim(),

                        email:

                            email.trim(),

                        phone:

                            phone.trim(),

                        status,

                    };



            await apiRequest<UpdateCustomerResponse>(

                `/customers/${id}`,

                {

                    method: 'PATCH',

                    token,

                    body: JSON.stringify(

                        body,

                    ),

                },

            );



            navigate(

                `/customers/${id}`,

            );

        } catch (err) {

            setError(

                err instanceof Error

                    ? err.message

                    : 'Unable to update the customer.',

            );

        } finally {

            setSubmitting(false);

        }

    }



    function selectType(

        customerType: CustomerType,

    ) {

        setType(customerType);

        setError('');

    }



    if (loading) {

        return (

            <AppLayout

                title="Edit Customer"

                subtitle="Customer Relationship & Profile Management"

            >

                <div className="flex min-h-[65vh] items-center justify-center">

                    <div className="text-center">

                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />



                        <p className="mt-4 text-sm font-medium text-slate-500">

                            Loading customer...

                        </p>

                    </div>

                </div>

            </AppLayout>

        );

    }



    if (!customer) {

        return (

            <AppLayout

                title="Edit Customer"

                subtitle="Customer Relationship & Profile Management"

            >

                <div className="mx-auto max-w-3xl">

                    <Link

                        to="/customers"

                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"

                    >

                        <ArrowLeftIcon />

                        Back to Customers

                    </Link>



                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">

                        <div className="flex items-start gap-4">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">

                                <ErrorIcon />

                            </div>



                            <div>

                                <h1 className="font-bold text-red-900">

                                    Unable to load customer

                                </h1>



                                <p className="mt-1 text-sm leading-6 text-red-700">

                                    {error ||

                                        'Customer not found.'}

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </AppLayout>

        );

    }



    if (

        customer.status ===

        'ARCHIVED'

    ) {

        return (

            <AppLayout

                title="Archived Customer"

                subtitle="Customer Relationship & Profile Management"

            >

                <div className="mx-auto max-w-3xl">

                    <div className="mb-6 flex items-center gap-2 text-xs font-semibold">

                        <Link

                            to="/customers"

                            className="text-indigo-600 transition hover:text-indigo-800"

                        >

                            Customers

                        </Link>



                        <ChevronRightIcon />



                        <Link

                            to={`/customers/${customer.id}`}

                            className="text-indigo-600 transition hover:text-indigo-800"

                        >

                            Profile

                        </Link>



                        <ChevronRightIcon />



                        <span className="text-slate-500">

                            Edit

                        </span>

                    </div>



                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-7 shadow-sm">

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">

                                <ArchiveIcon />

                            </div>



                            <div className="flex-1">

                                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">

                                    Read-only profile

                                </p>



                                <h1 className="mt-2 text-xl font-bold text-amber-950">

                                    This customer has been archived

                                </h1>



                                <p className="mt-2 max-w-xl text-sm leading-6 text-amber-800">

                                    Archived customer

                                    profiles cannot be

                                    edited. The existing

                                    customer information

                                    remains available from

                                    the profile.

                                </p>



                                <Link

                                    to={`/customers/${customer.id}`}

                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-950"

                                >

                                    <ArrowLeftIcon />



                                    Return to Profile

                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </AppLayout>

        );

    }



    const originalName = getCustomerName(customer);
    const hasStatusChanged = status !== customer.status;

    return (
        <AppLayout>
            <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                    <Link
                        to="/customers"
                        className="text-slate-700 transition hover:text-blue-600"
                    >
                        Customers
                    </Link>
                    <ChevronRightIcon />
                    <Link
                        to={`/customers/${customer.id}`}
                        className="max-w-[220px] truncate text-slate-700 transition hover:text-blue-600"
                    >
                        {originalName}
                    </Link>
                    <ChevronRightIcon />
                    <span>Edit</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                                Edit customer
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Update customer information, contact details and status.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                to={`/customers/${customer.id}`}
                                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex h-10 min-w-[130px] items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <SaveIcon />
                                        Save changes
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
                                <p className="font-semibold">Unable to save changes</p>
                                <p className="mt-0.5">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <section className="border-b border-slate-200 px-5 py-5 sm:px-6">
                            <div className="grid gap-5 md:grid-cols-[190px_1fr]">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Customer type
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Choose the profile type.
                                    </p>
                                </div>

                                <div>
                                    <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 p-1">
                                        <button
                                            type="button"
                                            onClick={() => selectType('INDIVIDUAL')}
                                            className={`inline-flex h-9 items-center gap-2 rounded px-4 text-sm font-semibold transition ${type === 'INDIVIDUAL'
                                                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            <PersonIcon />
                                            Individual
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => selectType('BUSINESS')}
                                            className={`inline-flex h-9 items-center gap-2 rounded px-4 text-sm font-semibold transition ${type === 'BUSINESS'
                                                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            <BuildingIcon />
                                            Business
                                        </button>
                                    </div>

                                    {type !== customer.type && (
                                        <div className="mt-3 flex max-w-2xl items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
                                            <WarningIcon />
                                            <p>
                                                Customer type will change from{' '}
                                                <strong>{formatType(customer.type)}</strong> to{' '}
                                                <strong>{formatType(type)}</strong>. Identity fields will
                                                change accordingly.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="border-b border-slate-200 px-5 py-5 sm:px-6">
                            <div className="grid gap-5 md:grid-cols-[190px_1fr]">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        {type === 'INDIVIDUAL'
                                            ? 'Customer information'
                                            : 'Business information'}
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Main identifying information.
                                    </p>
                                </div>

                                <div>
                                    {type === 'INDIVIDUAL' ? (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <FormInput
                                                label="First Name"
                                                value={firstName}
                                                onChange={setFirstName}
                                                placeholder="Enter first name"
                                                required
                                                autoComplete="given-name"
                                            />
                                            <FormInput
                                                label="Last Name"
                                                value={lastName}
                                                onChange={setLastName}
                                                placeholder="Enter last name"
                                                required
                                                autoComplete="family-name"
                                            />
                                        </div>
                                    ) : (
                                        <FormInput
                                            label="Business Name"
                                            value={businessName}
                                            onChange={setBusinessName}
                                            placeholder="Enter company or organization name"
                                            required
                                            autoComplete="organization"
                                        />
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="border-b border-slate-200 px-5 py-5 sm:px-6">
                            <div className="grid gap-5 md:grid-cols-[190px_1fr]">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Contact information
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Primary email and phone number.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormInput
                                        label="Email Address"
                                        type="email"
                                        value={email}
                                        onChange={setEmail}
                                        placeholder="customer@example.com"
                                        required
                                        autoComplete="email"
                                        icon={<EmailIcon />}
                                    />
                                    <FormInput
                                        label="Phone Number"
                                        type="tel"
                                        value={phone}
                                        onChange={setPhone}
                                        placeholder="+1 555 000 0000"
                                        required
                                        autoComplete="tel"
                                        icon={<PhoneIcon />}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="px-5 py-5 sm:px-6">
                            <div className="grid gap-5 md:grid-cols-[190px_1fr]">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Customer status
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Set whether this record is active or inactive.
                                    </p>
                                </div>

                                <div>
                                    <select
                                        value={status}
                                        onChange={(event) =>
                                            setStatus(event.target.value as CustomerStatus)
                                        }
                                        className="h-10 w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>

                                    {hasStatusChanged && (
                                        <p
                                            className={`mt-2 text-xs font-medium ${status === 'ACTIVE'
                                                ? 'text-emerald-700'
                                                : 'text-amber-700'
                                                }`}
                                        >
                                            Status will change from{' '}
                                            {customer.status === 'ACTIVE' ? 'Active' : 'Inactive'} to{' '}
                                            {status === 'ACTIVE' ? 'Active' : 'Inactive'} and will be
                                            recorded in activity history.
                                        </p>
                                    )}

                                    <p className="mt-2 text-xs text-slate-500">
                                        Archiving is handled separately from the customer profile.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-xs text-slate-500">
                                Saved edits are recorded in the customer's activity history.
                            </p>

                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/customers/${customer.id}`}
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex h-10 min-w-[130px] items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <SaveIcon />
                                            Save changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}


/* =========================================================
   COMPONENTS
========================================================= */

function FormInput({

    label,

    value,

    onChange,

    type = 'text',

    required = false,

    autoComplete,

    placeholder,

    icon,

}: {

    label: string;

    value: string;

    onChange: (

        value: string,

    ) => void;

    type?: 'text' | 'email' | 'tel';

    required?: boolean;

    autoComplete?: string;

    placeholder?: string;

    icon?: ReactNode;

}) {

    const inputId = `customer-${label

        .toLowerCase()

        .replace(

            /[^a-z0-9]+/g,

            '-',

        )}`;



    return (

        <div>

            <label

                htmlFor={inputId}

                className="mb-1.5 block text-sm font-medium text-slate-700"

            >

                {label}



                {required && (

                    <span className="ml-1 text-red-500">

                        *

                    </span>

                )}

            </label>



            <div className="relative">

                {icon && (

                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">

                        {icon}

                    </div>

                )}



                <input

                    id={inputId}

                    type={type}

                    value={value}

                    onChange={(event) =>

                        onChange(

                            event.target.value,

                        )

                    }

                    required={required}

                    autoComplete={

                        autoComplete

                    }

                    placeholder={

                        placeholder

                    }

                    className={`h-10 w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 ${icon

                        ? 'pl-11 pr-4'

                        : 'px-4'

                        }`}

                />

            </div>

        </div>

    );

}



/* =========================================================

   HELPERS

\========================================================= */



function getCustomerName(

    customer: CustomerProfile,

) {

    if (

        customer.type ===

        'BUSINESS'

    ) {

        return (

            customer.businessName ||

            'Unnamed Business'

        );

    }



    const name = [

        customer.firstName,

        customer.lastName,

    ]

        .filter(Boolean)

        .join(' ');



    return (

        name ||

        'Unnamed Customer'

    );

}



function formatType(

    type: CustomerType,

) {

    return type ===

        'INDIVIDUAL'

        ? 'Individual'

        : 'Business';

}






/* =========================================================

   ICONS

\========================================================= */



function PersonIcon() {

    return (

        <svg

            width="20"

            height="20"

            viewBox="0 0 24 24"

            fill="none"

            stroke="currentColor"

            strokeWidth="1.8"

        >

            <circle

                cx="12"

                cy="8"

                r="4"

            />



            <path d="M4 21a8 8 0 0 1 16 0" />

        </svg>

    );

}



function BuildingIcon() {

    return (

        <svg

            width="20"

            height="20"

            viewBox="0 0 24 24"

            fill="none"

            stroke="currentColor"

            strokeWidth="1.8"

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

            width="17"

            height="17"

            viewBox="0 0 24 24"

            fill="none"

            stroke="currentColor"

            strokeWidth="1.8"

            strokeLinecap="round"

            strokeLinejoin="round"

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



function PhoneIcon() {

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

            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />

        </svg>

    );

}



function ArrowLeftIcon() {

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

            <path d="M19 12H5" />

            <path d="m12 19-7-7 7-7" />

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

        >

            <path d="m9 18 6-6-6-6" />

        </svg>

    );

}



function SaveIcon() {

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

            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />

            <path d="M17 21v-8H7v8" />

            <path d="M7 3v5h8" />

        </svg>

    );

}



function WarningIcon() {

    return (

        <svg

            width="17"

            height="17"

            viewBox="0 0 24 24"

            fill="none"

            stroke="currentColor"

            strokeWidth="2"

            className="mt-0.5 shrink-0 text-amber-600"

            strokeLinecap="round"

            strokeLinejoin="round"

        >

            <path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" />

            <path d="M12 9v4" />

            <path d="M12 17h.01" />

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



function ArchiveIcon() {

    return (

        <svg

            width="20"

            height="20"

            viewBox="0 0 24 24"

            fill="none"

            stroke="currentColor"

            strokeWidth="1.9"

            strokeLinecap="round"

            strokeLinejoin="round"

        >

            <path d="M21 8v13H3V8" />

            <path d="M1 3h22v5H1z" />

            <path d="M10 12h4" />

        </svg>

    );

}



