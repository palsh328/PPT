'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SettingsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Redirect to role-specific profile page
    switch (user?.role) {
      case 'ADMIN':
        router.push('/admin/profile');
        break;
      case 'SELLER':
        router.push('/seller/profile');
        break;
      case 'CUSTOMER':
      default:
        router.push('/profile');
        break;
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}