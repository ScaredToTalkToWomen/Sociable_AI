import { supabase } from '../lib/supabase';
import { refreshAccessToken } from './oauth';

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export async function getValidToken(
  accountId: string,
  platform: string
): Promise<string> {
  const { data: account, error } = await supabase
    .from('social_accounts')
    .select('access_token, refresh_token, token_expires_at')
    .eq('id', accountId)
    .maybeSingle();

  if (error || !account) {
    throw new Error('Account not found');
  }

  if (!account.token_expires_at) {
    return account.access_token;
  }

  const expiresAt = new Date(account.token_expires_at);
  const now = new Date();
  const bufferMinutes = 5;
  const bufferTime = new Date(expiresAt.getTime() - bufferMinutes * 60 * 1000);

  if (now < bufferTime) {
    return account.access_token;
  }

  if (!account.refresh_token) {
    throw new Error('Token expired and no refresh token available. Please reconnect the account.');
  }

  try {
    const newTokens = await refreshAccessToken(platform, account.refresh_token);

    const newExpiresAt = newTokens.expires_in
      ? new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
      : null;

    await supabase
      .from('social_accounts')
      .update({
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token || account.refresh_token,
        token_expires_at: newExpiresAt,
      })
      .eq('id', accountId);

    return newTokens.access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh access token. Please reconnect the account.');
  }
}

export async function updateTokens(
  accountId: string,
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  }
): Promise<void> {
  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from('social_accounts')
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt,
    })
    .eq('id', accountId);

  if (error) {
    throw new Error('Failed to update tokens');
  }
}

export async function revokeToken(accountId: string, platform: string): Promise<void> {
  const { data: account } = await supabase
    .from('social_accounts')
    .select('access_token')
    .eq('id', accountId)
    .maybeSingle();

  if (!account) return;

  const revokeUrls: Record<string, string> = {
    twitter: 'https://api.twitter.com/2/oauth2/revoke',
    linkedin: 'https://www.linkedin.com/oauth/v2/revoke',
    facebook: 'https://graph.facebook.com/v18.0/me/permissions',
    instagram: 'https://graph.facebook.com/v18.0/me/permissions',
  };

  const url = revokeUrls[platform];
  if (url) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${account.access_token}`,
        },
      });
    } catch (error) {
      console.error('Failed to revoke token:', error);
    }
  }
}
