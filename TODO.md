# TODO: Implement Facebook-like Threaded Comments

## Steps to Complete

- [x] Update `getComments` in `supabase.ts` to fetch all comments (including replies) and structure them into a threaded format.
- [x] Modify `Comments.tsx` to render comments recursively, showing replies indented under parent comments.
- [x] Add reply functionality: a "Reply" button that opens an input field for replying to a specific comment.
- [x] Update `addComment` to handle `parent_comment_id` when adding replies.
- [x] Test the threaded comment system to ensure replies are properly nested and displayed.
