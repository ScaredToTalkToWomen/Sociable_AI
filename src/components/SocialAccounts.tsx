import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Share2, Loader2, CheckCircle2, Plus } from 'lucide-react';
import { SocialMediaLogin } from './SocialMediaLogin';

export function SocialAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: '𝕏', color: 'bg-black' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-600' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black' },
  ];

  useEffect(() => {
    if (user) {
      loadAccounts();
    }

    const handleOAuthMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'oauth_success') {
        const platform = event.data.platform;
        const oauthData = localStorage.getItem(`oauth_success_${platform}`);

        if (oauthData && user) {
          try {
            const data = JSON.parse(oauthData);

            const { data: existingAccount } = await supabase
              .from('social_accounts')
              .select('id')
              .eq('user_id', user.id)
              .eq('platform', platform)
              .eq('account_handle', data.accountInfo.handle)
              .maybeSingle();

            if (existingAccount) {
              await supabase
                .from('social_accounts')
                .update({
                  access_token: data.tokenData.access_token,
                  refresh_token: data.tokenData.refresh_token,
                  token_expires_at: data.tokenData.expires_in
                    ? new Date(Date.now() + data.tokenData.expires_in * 1000).toISOString()
                    : null,
                  is_connected: true,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingAccount.id);
            } else {
              await supabase.from('social_accounts').insert({
                user_id: user.id,
                platform: platform,
                account_name: data.accountInfo.name,
                account_handle: data.accountInfo.handle,
                access_token: data.tokenData.access_token,
                refresh_token: data.tokenData.refresh_token,
                token_expires_at: data.tokenData.expires_in
                  ? new Date(Date.now() + data.tokenData.expires_in * 1000).toISOString()
                  : null,
                is_connected: true,
              });
            }

            localStorage.removeItem(`oauth_success_${platform}`);
            await loadAccounts();
            setShowAddMenu(false);
          } catch (error) {
            console.error('Error saving OAuth data:', error);
          }
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [user]);

  const loadAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      setSelectedPlatform(platform);
      setShowLoginPage(true);
    }
  };

  const handleLogin = async (credentials: { username: string; password: string }) => {
    if (!selectedPlatform) return;

    setConnecting(selectedPlatform.id);

    try {
      const { error: insertError } = await supabase
        .from('social_accounts')
        .insert({
          user_id: user?.id,
          platform: selectedPlatform.id,
          account_name: selectedPlatform.name,
          account_handle: credentials.username.startsWith('@') ? credentials.username : `@${credentials.username}`,
          access_token: 'connected',
          refresh_token: null,
          token_expires_at: null,
        });

      if (insertError) {
        throw new Error(`Failed to save account: ${insertError.message}`);
      }

      await loadAccounts();
      setShowAddMenu(false);
      setShowLoginPage(false);

      // Redirect to the social media platform
      const platformUrls: Record<string, string> = {
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
      };

      const platformUrl = platformUrls[selectedPlatform.id];
      if (platformUrl) {
        window.open(platformUrl, '_blank');
      }

      setSelectedPlatform(null);
    } catch (error: any) {
      console.error('Error connecting account:', error);
      throw error;
    } finally {
      setConnecting(null);
    }
  };

  const handleCloseLogin = () => {
    setShowLoginPage(false);
    setSelectedPlatform(null);
    setConnecting(null);
  };

  const handleDisconnectAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      loadAccounts();
    } catch (error) {
      console.error('Error disconnecting account:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Accounts</h1>
          <p className="text-gray-600 mt-1">Connect your social media accounts</p>
        </div>
        <Button onClick={() => setShowAddMenu(!showAddMenu)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {showAddMenu && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connect New Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {platforms.map((platform) => {
                const isConnected = accounts.some((acc) => acc.platform === platform.id);
                const isConnecting = connecting === platform.id;

                return (
                  <Button
                    key={platform.id}
                    variant="outline"
                    onClick={() => handleConnectAccount(platform.id)}
                    disabled={isConnecting || isConnected}
                    className="h-auto py-4 justify-start"
                  >
                    <div className={`${platform.color} p-2 rounded-lg text-lg mr-3`}>
                      {platform.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{platform.name}</div>
                      {isConnected && (
                        <div className="text-xs text-green-600">Already connected</div>
                      )}
                      {isConnecting && (
                        <div className="text-xs text-blue-600">Connecting...</div>
                      )}
                    </div>
                    {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="text-center py-12">
              <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No accounts connected
              </h3>
              <p className="text-gray-600">
                Connect your social media accounts to start automating
              </p>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => {
            const platform = platforms.find((p) => p.id === account.platform);
            return (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`${platform?.color} p-3 rounded-lg text-2xl`}>
                      {platform?.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {account.account_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {account.account_handle}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          Connected
                        </span>
                        <button
                          onClick={() => handleDisconnectAccount(account.id)}
                          className="text-xs text-red-600 hover:text-red-800 hover:underline"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {showLoginPage && selectedPlatform && (
        <SocialMediaLogin
          platform={selectedPlatform}
          onBack={handleCloseLogin}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}
