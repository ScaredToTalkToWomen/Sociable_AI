import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { initiateOAuth } from '../services/oauth';
import { supabase } from '../lib/supabase';

interface SocialMediaLoginProps {
  platform: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  onBack: () => void;
  onLogin: (credentials: { username: string; password: string }) => Promise<void>;
}

export function SocialMediaLogin({ platform, onBack }: SocialMediaLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      console.log('Connect button clicked, session:', {
        hasSession: !!session,
        userId: session?.user?.id
      });

      if (!session?.user) {
        throw new Error('You must be logged in to connect social accounts');
      }

      const sessionData = JSON.stringify(session);
      console.log('About to initiate OAuth with session data length:', sessionData.length);
      await initiateOAuth(platform.id, sessionData);
    } catch (err: any) {
      console.error('Connect error:', err);
      setError(err.message || 'Failed to connect. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={`${platform.color} p-3 rounded-lg text-2xl`}>
              {platform.icon}
            </div>
          </div>
          <CardTitle>Connect to {platform.name}</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Authorize access to your {platform.name} account
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">What happens next?</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>You'll be redirected to {platform.name}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Authorize access to post and manage content</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>You'll be returned here after authorization</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Connect Account
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-xs text-gray-500">
              Your credentials are handled securely through OAuth 2.0
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
