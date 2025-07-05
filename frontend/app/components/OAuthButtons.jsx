'use client';

import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import { signIn } from 'next-auth/react';

export default function OAuthButtons() {
  const handleOAuthSignIn = (provider) => {
    signIn(provider, {
      callbackUrl: `${window.location.origin}/dashboard`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleOAuthSignIn('google')}
          type="button"
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <FcGoogle className="h-5 w-5" />
        </button>

        <button
          onClick={() => handleOAuthSignIn('facebook')}
          type="button"
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <FaFacebook className="h-5 w-5 text-blue-600" />
        </button>

        <button
          onClick={() => handleOAuthSignIn('twitter')}
          type="button"
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <FaTwitter className="h-5 w-5 text-blue-400" />
        </button>
      </div>
    </div>
  );
}
