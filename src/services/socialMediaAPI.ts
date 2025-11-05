import { getValidToken } from './tokenManager';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';

export interface PostContent {
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface PostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

async function postToTwitter(
  accessToken: string ,
  content: PostContent
): Promise<PostResult> {
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to post to Twitter');
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.data.id,
      postUrl: `https://twitter.com/i/web/status/${data.data.id}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function postToLinkedIn(
  accessToken: string,
  content: PostContent,
  userId: string
): Promise<PostResult> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content.text,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to post to LinkedIn');
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function postToFacebook(
  accessToken: string,
  content: PostContent,
  pageId: string
): Promise<PostResult> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.text,
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to post to Facebook');
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function postToInstagram(
  accessToken: string,
  content: PostContent,
  accountId: string
): Promise<PostResult> {
  try {
    if (!content.mediaUrl) {
      throw new Error('Instagram posts require an image or video');
    }

    const createResponse = await fetch(
      `https://graph.instagram.com/v18.0/${accountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: content.mediaUrl,
          caption: content.text,
          access_token: accessToken,
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(error.error?.message || 'Failed to create Instagram media');
    }

    const createData = await createResponse.json();
    const creationId = createData.id;

    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(error.error?.message || 'Failed to publish Instagram post');
    }

    const publishData = await publishResponse.json();
    return {
      success: true,
      postId: publishData.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function publishPost(
  accountId: string,
  content: PostContent
): Promise<PostResult> {
  try {
    const { data: account, error } = await supabase
      .from('social_accounts')
      .select('platform, account_handle')
      .eq('id', accountId)
      .maybeSingle();

    if (error || !account) {
      throw new Error('Account not found');
    }

    const accessToken = await getValidToken(accountId, account.platform);

    let result: PostResult;

    switch (account.platform) {
      case 'twitter':
        result = await postToTwitter(accessToken, content);
        break;
      case 'linkedin':
        result = await postToLinkedIn(accessToken, content, account.account_handle);
        break;
      case 'facebook':
        result = await postToFacebook(accessToken, content, account.account_handle);
        break;
      case 'instagram':
        result = await postToInstagram(accessToken, content, account.account_handle);
        break;
      default:
        result = {
          success: false,
          error: `Unsupported platform: ${account.platform}`,
        };
    }

    if (result.success) {
      await supabase.from('posts').insert({
        account_id: accountId,
        content: content.text,
        media_url: content.mediaUrl,
        status: 'published',
        published_at: new Date().toISOString(),
        external_post_id: result.postId,
      });
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to publish post',
    };
  }
}

export async function publishToMultipleAccounts(
  accountIds: string[],
  content: PostContent
): Promise<{ accountId: string; result: PostResult }[]> {
  const results = await Promise.all(
    accountIds.map(async (accountId) => ({
      accountId,
      result: await publishPost(accountId, content),
    }))
  );

  return results;
}

export interface VerifyUsernameResult {
  exists: boolean;
  username?: string;
  displayName?: string;
  profileUrl?: string;
  error?: string;
}

export async function verifyTwitterUsername(username: string): Promise<VerifyUsernameResult> {
  try {
    const cleanUsername = username.replace('@', '');
    const twitterBearerToken = import.meta.env.VITE_TWITTER_BEARER_TOKEN;

    const apiUrl = `${supabaseUrl}/functions/v1/verify-twitter-username`;

    console.log('Calling edge function:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        username: cleanUsername,
        bearerToken: twitterBearerToken
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', response.status, errorText);
      throw new Error(`Edge function failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Edge function response:', data);
    return data;
  } catch (error: any) {
    console.error('verifyTwitterUsername error:', error);
    return {
      exists: false,
      error: error.message || 'Failed to verify username',
    };
  }
}

export async function verifyLinkedInProfile(profileUrl: string): Promise<VerifyUsernameResult> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_LINKEDIN_ACCESS_TOKEN || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify LinkedIn profile');
    }

    const data = await response.json();
    return {
      exists: true,
      username: data.id,
      displayName: `${data.localizedFirstName} ${data.localizedLastName}`,
      profileUrl: profileUrl,
    };
  } catch (error: any) {
    return {
      exists: false,
      error: error.message || 'Failed to verify LinkedIn profile',
    };
  }
}

export async function verifyFacebookPage(pageId: string): Promise<VerifyUsernameResult> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=id,name,username&access_token=${import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN || ''}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          exists: false,
          error: 'Page not found on Facebook',
        };
      }
      throw new Error('Failed to verify Facebook page');
    }

    const data = await response.json();
    return {
      exists: true,
      username: data.username || data.id,
      displayName: data.name,
      profileUrl: `https://facebook.com/${data.username || data.id}`,
    };
  } catch (error: any) {
    return {
      exists: false,
      error: error.message || 'Failed to verify Facebook page',
    };
  }
}

export async function verifyInstagramAccount(username: string): Promise<VerifyUsernameResult> {
  try {
    const cleanUsername = username.replace('@', '');

    const response = await fetch(
      `https://graph.instagram.com/v18.0/me?fields=id,username&access_token=${import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN || ''}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to verify Instagram account');
    }

    const data = await response.json();
    if (data.username.toLowerCase() !== cleanUsername.toLowerCase()) {
      return {
        exists: false,
        error: 'Username does not match authenticated account',
      };
    }

    return {
      exists: true,
      username: data.username,
      displayName: data.username,
      profileUrl: `https://instagram.com/${data.username}`,
    };
  } catch (error: any) {
    return {
      exists: false,
      error: error.message || 'Failed to verify Instagram account',
    };
  }
}

export async function verifyUsername(platform: string, username: string): Promise<VerifyUsernameResult> {
  switch (platform) {
    case 'twitter':
      return verifyTwitterUsername(username);
    case 'linkedin':
      return verifyLinkedInProfile(username);
    case 'facebook':
      return verifyFacebookPage(username);
    case 'instagram':
      return verifyInstagramAccount(username);
    default:
      return {
        exists: false,
        error: `Platform ${platform} is not supported for verification`,
      };
  }
}
