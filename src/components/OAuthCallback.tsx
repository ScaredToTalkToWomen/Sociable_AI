import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { exchangeCodeForToken } from '../services/oauth';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function OAuthCallback() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const timer = setTimeout(() => {
      handleOAuthCallback();
    }, 100);
    return () => clearTimeout(timer);
  }, [user]);

  const handleOAuthCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      console.log('OAuth Callback Debug:', {
        hasCode: !!code,
        hasState: !!state,
        error,
        errorDescription,
      });

      if (error) {
        throw new Error(errorDescription || error);
      }

      if (!code || !state) {
        throw new Error('Missing authorization code or state');
      }

      const pathParts = window.location.pathname.split('/');
      const platform = pathParts[pathParts.length - 1];

      if (!platform) {
        throw new Error('Platform not specified');
      }

      setMessage(`Connecting to ${platform}...`);

      let { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const savedSession = localStorage.getItem(`oauth_supabase_session_${platform}`);
        if (savedSession) {
          const { data, error: setSessionError } = await supabase.auth.setSession(JSON.parse(savedSession));
          if (!setSessionError && data.session) {
            session = data.session;
          }
        }
      }

      if (!session?.user) {
        throw new Error('You are not logged in. Please log in first and try connecting your Twitter account again.');
      }

      const tokenData = await exchangeCodeForToken(platform, code, state);

      const accountInfo = await fetchAccountInfo(platform, tokenData.access_token);

      console.log('Account info retrieved:', accountInfo);

      if (session?.user) {
        const expiresAt = tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null;

        const { error: dbError } = await supabase
          .from('social_accounts')
          .upsert({
            user_id: session.user.id,
            platform,
            account_name: accountInfo.name,
            account_handle: accountInfo.handle,
            is_connected: true,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || null,
            token_expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,platform',
          });

        if (dbError) {
          console.error('Failed to save account:', dbError);
          throw new Error('Failed to save account connection');
        }
      }

      localStorage.setItem(`oauth_success_${platform}`, JSON.stringify({
        platform,
        accountInfo,
        timestamp: Date.now(),
      }));

      setStatus('success');
      setMessage(`Successfully connected your ${platform} account!`);

      setTimeout(() => {
        if (window.opener) {
          window.opener.postMessage({ type: 'oauth_success', platform }, window.location.origin);
          window.close();
        } else {
          window.location.href = '/';
        }
      }, 2000);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to connect account');
    }
  };

  const fetchAccountInfo = async (
    platform: string,
    accessToken: string
  ): Promise<{ name: string; handle: string }> => {
    let url = '';
    let headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    switch (platform) {
      case 'twitter':
        url = 'https://api.twitter.com/2/users/me';
        break;
      case 'linkedin':
        url = 'https://api.linkedin.com/v2/me';
        break;
      case 'instagram':
        url = 'https://graph.instagram.com/me?fields=id,username';
        break;
      case 'facebook':
        url = 'https://graph.facebook.com/me?fields=id,name';
        break;
      case 'tiktok':
        url = 'https://open-api.tiktok.com/user/info/?fields=open_id,union_id,avatar_url,display_name';
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch account info from ${platform}`);
    }

    const data = await response.json();

    switch (platform) {
      case 'twitter':
        return {
          name: data.data.name || data.data.username,
          handle: `@${data.data.username}`,
        };
      case 'linkedin':
        return {
          name: `${data.localizedFirstName} ${data.localizedLastName}`,
          handle: data.id,
        };
      case 'instagram':
        return {
          name: data.username,
          handle: `@${data.username}`,
        };
      case 'facebook':
        return {
          name: data.name,
          handle: data.id,
        };
      case 'tiktok':
        return {
          name: data.data.user.display_name,
          handle: data.data.user.open_id,
        };
      default:
        return { name: 'Unknown', handle: 'Unknown' };
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
              <p className="text-sm text-gray-500 mt-4">This window will close automatically...</p>
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
                onClick={() => window.close()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Close Window
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
