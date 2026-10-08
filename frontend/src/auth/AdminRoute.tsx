
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface AdminRouteProps {
    children: ReactNode;
}

export default function AdminRoute({
    children,
}: AdminRouteProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
                Checking permissions...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'ADMIN') {
        return <Navigate to="/customers" replace />;
    }

    return <>{children}</>;
}
