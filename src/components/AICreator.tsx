import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

export function AICreator() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: '𝕏' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://samyog.app.n8n.cloud/webhook/receive-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          userId: user?.id,
          email: user?.email,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.generatedContent || `🚀 ${prompt}\n\nI'm excited to share this with you! This is an AI-generated post that's optimized for engagement across social platforms.\n\n#SocialMedia #AI #Automation`;
        setGeneratedContent(content);
      } else {
        const content = `🚀 ${prompt}\n\nI'm excited to share this with you! This is an AI-generated post that's optimized for engagement across social platforms.\n\n#SocialMedia #AI #Automation`;
        setGeneratedContent(content);
      }
    } catch (error) {
      console.error('Error calling webhook:', error);
      const content = `🚀 ${prompt}\n\nI'm excited to share this with you! This is an AI-generated post that's optimized for engagement across social platforms.\n\n#SocialMedia #AI #Automation`;
      setGeneratedContent(content);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent || selectedPlatforms.length === 0) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('content_posts').insert({
        user_id: user!.id,
        content: generatedContent,
        platforms: selectedPlatforms,
        status: 'draft',
      });

      if (error) throw error;

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setGeneratedContent('');
        setPrompt('');
        setSelectedPlatforms([]);
      }, 2000);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Content Creator</h1>
        <p className="text-gray-600 mt-1">Generate engaging social media posts with AI</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Create Your Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">What would you like to post about?</Label>
            <Textarea
              id="prompt"
              placeholder="E.g., Share tips about productivity, announce a new product, celebrate a milestone..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-2 min-h-[100px]"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="min-h-[150px]"
            />

            <div>
              <Label>Select Platforms</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{platform.icon}</div>
                    <div className="text-sm font-medium">{platform.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || saved || selectedPlatforms.length === 0}
              className="w-full"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
