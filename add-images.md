# Adding Images to How-to Guide

## Quick Setup Instructions:

You have uploaded 4 images that need to be saved to the correct locations. Here's how to add them:

### Step 1: Save the uploaded images
Save each uploaded image with these exact filenames in the `public/images/` directory:

1. **Image 1** (Profile dropdown) → Save as: `public/images/step1-profile.jpg`
2. **Image 2** (Public profile setting) → Save as: `public/images/step2-public.jpg`  
3. **Image 3** (Login page) → Save as: `public/images/step3-login.jpg`
4. **Image 4** (Track progress modal) → Save as: `public/images/step4-track.jpg`

### Step 2: Image Mapping
- **step1-profile.jpg**: Shows the Google Cloud Skills Boost profile dropdown menu with options like Dashboard, Progress, Settings
- **step2-public.jpg**: Shows the "Public visibility" section with "Make profile public" checkbox and the green URL box
- **step3-login.jpg**: Shows the StudyJams login page with "Welcome Back, Champion" and login form
- **step4-track.jpg**: Shows the "Track Your Progress" modal with URL input field

### Step 3: Verify
Once images are added:
1. Go to http://localhost:3000
2. Click "How to Join" in the sidebar
3. Navigate through the steps to see your images

### Manual Commands (if needed):
```bash
# Create directory (already done)
mkdir -p public/images

# Copy your images to the correct locations
# Example: cp ~/Downloads/your-image-1.jpg public/images/step1-profile.jpg
```

The How-to Guide component is already configured to display these images with proper captions and fallback placeholders.
