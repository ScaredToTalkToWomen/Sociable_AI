import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function TwitterOAuthRedirect() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Twitter authentication...');

  useEffect(() => {
    handleTwitterCallback();
  }, []);

  const handleTwitterCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      if (error) {
        const friendlyError = error === 'access_denied'
          ? 'You cancelled the Twitter authorization. Please try again if you want to connect your account.'
          : errorDescription || error;
        throw new Error(friendlyError);
      }

      if (!code) {
        throw new Error('Authorization failed: Missing authorization code from Twitter.');
      }

      const savedUsername = sessionStorage.getItem('oauth_username_twitter') || '';

      setMessage('Connecting to Twitter...');

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to connect Twitter account: ${response.status}. ${errorText || 'Please try again or contact support.'}`);
      }

      const data = await response.json();

      sessionStorage.removeItem('oauth_username_twitter');

      if (!user) {
        throw new Error('You are not logged in. Please log in first and try connecting your Twitter account again.');
      }

      const displayUsername = savedUsername || data.username || 'Twitter Account';
      const accountHandle = displayUsername.startsWith('@') ? displayUsername : `@${displayUsername}`;

      const { error: dbError } = await supabase.from('social_accounts').insert({
        user_id: user.id,
        platform: 'twitter',
        account_name: data.name || displayUsername,
        account_handle: accountHandle,
        access_token: 'connected',
        refresh_token: null,
        token_expires_at: null,
        is_connected: true,
      });

      if (dbError) {
        if (dbError.code === '23505') {
          throw new Error('This Twitter account is already connected to your profile.');
        }
        throw new Error(`Failed to save account: ${dbError.message}`);
      }

      setStatus('success');
      setMessage('Successfully connected your Twitter account!');

      // Open Twitter in a new tab
      window.open('https://twitter.com', '_blank');

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      console.error('Twitter OAuth callback error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to connect Twitter account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting Account</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="bg-green-100 rounded-full p-4 inline-block mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                Return to App
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
