# AI Social Media Automation App

A comprehensive AI-powered social media automation platform built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **AI Content Creator**: Generate engaging social media posts with AI assistance
- **Multi-Platform Support**: Manage content for Twitter, LinkedIn, Instagram, and Facebook
- **Content Scheduler**: Schedule posts for optimal engagement times
- **Analytics Dashboard**: Track performance metrics across all platforms
- **Social Account Management**: Connect and manage multiple social accounts
- **User Authentication**: Secure email/password authentication with Supabase

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Row Level Security)
- **Icons**: Lucide React
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Deployment

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set the build command: `npm run build`
3. Set the publish directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Manual Deployment

The built files are in the `dist` directory. You can deploy them to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps

## Database Setup

The database schema is automatically applied via Supabase migrations. The schema includes:

- **profiles**: User profile information
- **social_accounts**: Connected social media accounts
- **content_posts**: Created and scheduled posts
- **analytics_data**: Performance metrics
- **ai_suggestions**: AI-generated content suggestions

All tables have Row Level Security (RLS) enabled for data protection.

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── Auth.tsx           # Authentication component
│   ├── DashboardView.tsx  # Main dashboard
│   ├── AICreator.tsx      # AI content generator
│   ├── ContentLibrary.tsx # Content management
│   ├── SchedulerView.tsx  # Post scheduler
│   ├── AnalyticsView.tsx  # Analytics dashboard
│   ├── SocialAccounts.tsx # Account management
│   └── SettingsView.tsx   # User settings
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── lib/
│   └── supabase.ts        # Supabase client
├── App.tsx                # Main app component
└── main.tsx              # App entry point
```

## Features Overview

### Dashboard
- Overview of key metrics
- Recent posts
- Quick statistics

### AI Content Creator
- Generate AI-powered content
- Multi-platform selection
- Save as drafts

### Content Library
- View all posts
- Filter by status
- Delete posts

### Scheduler
- Schedule future posts
- Multi-platform publishing
- Calendar view

### Analytics
- Engagement metrics
- Platform-specific data
- Performance tracking

### Social Accounts
- Connect accounts
- Manage multiple platforms
- View connection status

### Settings
- Profile management
- Account information
- User preferences

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.
