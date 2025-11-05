import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Heart, MessageCircle, Share2, Eye, Loader2, Twitter, Linkedin, Instagram, Facebook, Flame } from 'lucide-react';

type Platform = 'all' | 'twitter' | 'linkedin' | 'instagram' | 'facebook';

export function AnalyticsView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_data')
        .select('*, content_posts(content, platforms)')
        .eq('user_id', user!.id)
        .order('recorded_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalytics = selectedPlatform === 'all'
    ? analytics
    : analytics.filter(a => a.platform === selectedPlatform);

  const totalMetrics = filteredAnalytics.reduce(
    (acc, curr) => ({
      likes: acc.likes + curr.likes,
      comments: acc.comments + curr.comments,
      shares: acc.shares + curr.shares,
      views: acc.views + curr.views,
    }),
    { likes: 0, comments: 0, shares: 0, views: 0 }
  );

  const platforms = [
    { id: 'all' as Platform, name: 'All Platforms', icon: TrendingUp },
    { id: 'twitter' as Platform, name: 'Twitter', icon: Twitter },
    { id: 'linkedin' as Platform, name: 'LinkedIn', icon: Linkedin },
    { id: 'instagram' as Platform, name: 'Instagram', icon: Instagram },
    { id: 'facebook' as Platform, name: 'Facebook', icon: Facebook },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your social media performance</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isActive = selectedPlatform === platform.id;
          return (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {platform.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalMetrics.likes.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-500 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalMetrics.comments.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shares</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalMetrics.shares.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <Share2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalMetrics.views.toLocaleString()}
                </p>
              </div>
              <div className="bg-cyan-500 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Post Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAnalytics.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No analytics yet</h3>
                  <p className="text-gray-600">
                    {selectedPlatform === 'all'
                      ? 'Publish posts to start tracking your performance'
                      : `No data available for ${platforms.find(p => p.id === selectedPlatform)?.name}`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAnalytics.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded capitalize">
                          {item.platform}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(item.recorded_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-600">Likes</p>
                          <p className="text-lg font-semibold text-gray-900">{item.likes}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Comments</p>
                          <p className="text-lg font-semibold text-gray-900">{item.comments}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Shares</p>
                          <p className="text-lg font-semibold text-gray-900">{item.shares}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Views</p>
                          <p className="text-lg font-semibold text-gray-900">{item.views}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Top 10 Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTrends.slice(0, 10).map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-bold text-gray-400 w-6">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                          {trend.topic}
                        </h4>
                        <p className="text-xs text-gray-500">{trend.posts} posts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-orange-600 text-xs font-medium">
                      <TrendingUp className="w-3 h-3" />
                      {trend.growth}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const topTrends = [
  { topic: 'AIRevolution', posts: '125K', growth: '+45%' },
  { topic: 'SustainableLiving', posts: '89K', growth: '+32%' },
  { topic: 'TechInnovation', posts: '67K', growth: '+28%' },
  { topic: 'WorkFromHome', posts: '54K', growth: '+22%' },
  { topic: 'DigitalMarketing', posts: '43K', growth: '+18%' },
  { topic: 'Entrepreneurship', posts: '38K', growth: '+15%' },
  { topic: 'HealthAndWellness', posts: '35K', growth: '+12%' },
  { topic: 'FintechInnovation', posts: '31K', growth: '+10%' },
  { topic: 'CreatorEconomy', posts: '28K', growth: '+8%' },
  { topic: 'ClimateAction', posts: '25K', growth: '+6%' },
];
