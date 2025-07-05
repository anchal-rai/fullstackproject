'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function OAuthRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    
    if (token && userId) {
      // Store the token in localStorage or your preferred storage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      
      // Redirect to dashboard or intended page
      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard';
      localStorage.removeItem('redirectAfterLogin');
      
      router.push(redirectTo);
    } else {
      // Handle error case
      console.error('OAuth authentication failed');
      router.push('/login?error=oauth_failed');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-700">Completing authentication...</p>
      </div>
    </div>
  );
}
