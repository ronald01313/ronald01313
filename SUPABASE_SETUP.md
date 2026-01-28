# Supabase Integration Setup Guide

Your BlogApp is now connected to Supabase! Follow these steps to complete the setup.

## 1. Environment Variables
Your `.env.local` file has been created with Supabase credentials:
```
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_KEY=sb_publishable_FsgxFae-RQ1hDRAY5oZ2ew_0ebjHvY0
```

Make sure to **keep this file private** and never commit it to version control.

## 2. Create the Posts Table in Supabase

1. Go to your Supabase dashboard: https://app.supabase.com/
2. Select your project
3. Go to the **SQL Editor** tab
4. Click **"New query"**
5. Copy the SQL from `database_schema.sql` file in your project
6. Paste it into the SQL Editor and click **"Run"**

This will create the `posts` table with the necessary structure and security policies.

## 3. Features Integrated

✅ **Create Posts** - Add new blog posts to the database
✅ **Read Posts** - Fetch and display all posts from Supabase
✅ **Delete Posts** - Remove posts with confirmation
✅ **Dynamic Updates** - Posts update in real-time after creation/deletion
✅ **Loading States** - Shows loading indicator while fetching data

## 4. File Structure

```
app/
├── lib/
│   └── supabase.ts          # Supabase client and functions
├── components/
│   ├── CreatePost.tsx       # Create post form (connected to DB)
│   ├── DeletePost.tsx       # Delete post component (connected to DB)
│   ├── Login.tsx
│   └── Register.tsx
└── routes/
    └── home.tsx             # Main page with Supabase integration
```

## 5. Database Functions Available

The following functions are available in `app/lib/supabase.ts`:

- `fetchPosts()` - Get all posts from Supabase
- `createPost(post)` - Create a new post
- `deletePost(postId)` - Delete a post by ID
- `updatePost(postId, updates)` - Update a post

## 6. Running the App

```bash
npm run dev
```

The app will:
1. Load all posts from Supabase on startup
2. Display them on the homepage
3. Allow you to create, view, and delete posts
4. Automatically refresh the list after operations

## 7. Important Notes

⚠️ **Security**: The current setup uses public access policies. For production:
- Implement proper authentication
- Restrict RLS policies to authenticated users
- Use row-level security to ensure users can only see their own posts
- Move to a private (secret) Supabase key for sensitive operations

## 8. Troubleshooting

**Posts not showing?**
- Check browser console for errors
- Verify your Supabase credentials in `.env.local`
- Make sure the `posts` table exists in your database

**Can't create posts?**
- Check network tab for API errors
- Verify RLS policies are enabled on the posts table
- Check Supabase logs for permission errors

**Environment variables not loading?**
- Make sure variables start with `VITE_` for Vite to expose them
- Restart your dev server after updating `.env.local`

## Next Steps

1. Implement user authentication with Supabase Auth
2. Add user-specific post management (only see your posts)
3. Add edit functionality for posts
4. Implement search and filtering
5. Add comments and likes features
