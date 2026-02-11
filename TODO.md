# TODO: Implement CRUD Operations for Images in Post and Comment Editing

## 1. Update CreatePost.tsx
- [x] Load existing blog_images when editing and display them with remove buttons
- [x] Allow adding new images while preserving existing ones unless removed
- [x] On submit: delete removed images, keep existing, upload new ones

## 2. Update Comments.tsx
- [x] Add image preview and removal in edit form
- [x] Allow uploading new images in edit mode
- [x] Update comment update logic to handle image changes

## 3. Update supabase.ts
- [x] Modify updateComment to accept image_url parameter
- [x] Add function to delete comment images from storage

## Followup Steps
- [ ] Test image CRUD in both post and comment editing
- [ ] Ensure proper cleanup of removed images from storage
