import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar, Loader2, CheckCircle2, Upload, X, Image, Video } from 'lucide-react';

export function SchedulerView() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    scheduled_for: '',
    platforms: [] as string[],
    media_urls: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const platforms = ['twitter', 'linkedin', 'instagram', 'facebook'];

  useEffect(() => {
    if (user) {
      loadScheduledPosts();
    }
  }, [user]);

  const loadScheduledPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'scheduled')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('post-media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData((prev) => ({
        ...prev,
        media_urls: [...prev.media_urls, ...uploadedUrls],
      }));
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload media. Please try again.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMedia = (urlToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      media_urls: prev.media_urls.filter((url) => url !== urlToRemove),
    }));
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.from('content_posts').insert({
        user_id: user!.id,
        content: formData.content,
        platforms: formData.platforms,
        status: 'scheduled',
        scheduled_for: new Date(formData.scheduled_for).toISOString(),
        media_urls: formData.media_urls,
      });

      if (error) throw error;

      setFormData({ content: '', scheduled_for: '', platforms: [], media_urls: [] });
      setShowScheduleForm(false);
      loadScheduledPosts();
    } catch (error) {
      console.error('Error scheduling post:', error);
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scheduler</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Schedule your posts for optimal engagement</p>
        </div>
        <Button onClick={() => setShowScheduleForm(!showScheduleForm)}>
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      {showScheduleForm && (
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Schedule New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <Label htmlFor="content" className="dark:text-gray-200">Post Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="What would you like to post?"
                  className="mt-2 min-h-[100px] dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <Label htmlFor="scheduled_for" className="dark:text-gray-200">Schedule Date & Time</Label>
                <Input
                  id="scheduled_for"
                  type="datetime-local"
                  value={formData.scheduled_for}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_for: e.target.value })
                  }
                  className="mt-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <Label className="dark:text-gray-200">Media (Images/Videos)</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      id="media-upload"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                      disabled={uploadingMedia}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('media-upload')?.click()}
                      disabled={uploadingMedia}
                      className="w-full"
                    >
                      {uploadingMedia ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Images/Videos
                        </>
                      )}
                    </Button>
                  </div>

                  {formData.media_urls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {formData.media_urls.map((url, index) => {
                        const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
                        return (
                          <div key={index} className="relative group">
                            {isVideo ? (
                              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                <Video className="w-8 h-8 text-gray-400" />
                              </div>
                            ) : (
                              <img
                                src={url}
                                alt={`Upload ${index + 1}`}
                                className="w-full aspect-video object-cover rounded-lg"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeMedia(url)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="dark:text-gray-200">Select Platforms</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`p-3 border-2 rounded-lg capitalize transition-all ${
                        formData.platforms.includes(platform)
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-white'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={saving || formData.platforms.length === 0}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Schedule Post
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScheduleForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
        {posts.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No scheduled posts
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Schedule your posts to automate your social media presence
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base mb-2 dark:text-white">
                      {new Date(post.scheduled_for).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardTitle>
                    <div className="flex gap-2">
                      {post.platforms?.map((platform: string) => (
                        <span
                          key={platform}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded capitalize"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>
                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    {post.media_urls.map((url: string, index: number) => {
                      const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
                      return (
                        <div key={index}>
                          {isVideo ? (
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                              <Video className="w-8 h-8 text-gray-400" />
                            </div>
                          ) : (
                            <img
                              src={url}
                              alt={`Media ${index + 1}`}
                              className="w-full aspect-video object-cover rounded-lg"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
