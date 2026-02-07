# R2 Image Selector - Gallery Integration

Your admin panel now has an integrated R2 image gallery selector that makes image management much easier!

## New Features

### 1. Browse R2 Gallery Dialog

When adding images to products or categories, you can now:
- **Browse existing R2 images** in a beautiful gallery view
- **Upload new images** directly from the dialog
- **Select multiple images** at once for product galleries
- **Search images** by filename
- **See image details** (size, filename) on hover

### 2. Enhanced Image Upload Component

All image fields now have two options:
- **Upload** - Upload a new image from your computer
- **Browse Gallery** - Open the R2 gallery selector

### 3. Multiple Image Selection

For product gallery images, you can now:
- **Select from Gallery** - Choose multiple images at once
- **Add Single Image** - Add one image at a time
- Each image can still be uploaded individually or selected from gallery

## How to Use

### Single Image Selection (Product Image, Category Image, etc.)

1. Click the **"Browse Gallery"** button next to the image field
2. In the dialog that opens:
   - Browse existing images in your R2 storage
   - Use the search box to find specific images
   - Click **"Upload"** to add new images from your computer
   - Click **"Refresh"** to reload the gallery
3. Click on an image to select it (green checkmark appears)
4. Click **"Confirm Selection"** to apply

### Multiple Image Selection (Product Gallery Images)

1. Scroll to the **"Gallery Images"** section
2. Click **"Select from Gallery"** button
3. In the dialog:
   - Click multiple images to select them
   - Selected count shows at the top
   - Click **"Clear selection"** to start over
   - Upload new images if needed
4. Click **"Confirm Selection"** to add all selected images

### Uploading from the Dialog

1. Open any image selector dialog
2. Click the **"Upload"** button in the dialog header
3. Choose one or more images from your computer
4. Images are automatically:
   - Compressed and optimized
   - Uploaded to R2
   - Added to the gallery
   - Pre-selected for you

## Features

### Visual Gallery View
- Grid layout with image thumbnails
- Hover to see filename and file size
- Selected images highlighted with green border
- Responsive design (works on mobile too)

### Smart Image Management
- All images auto-optimized before upload
- PNG transparency preserved
- Compression saves storage costs
- Fast loading with lazy images

### Multi-Selection
- Select as many images as needed
- Selected count indicator
- Easy to clear and start over
- Perfect for product galleries

### Search & Filter
- Search images by filename
- Real-time filtering
- Refresh to reload gallery
- Empty state when no images found

## Where It Works

The R2 image selector is available in:

### Products Tab
- ✅ Product Image (main)
- ✅ Gallery Images (multiple)
- ✅ Try-On Image

### Categories Tab
- ✅ Category Image

### Offers Tab
- ✅ Offer Image

### Other Sections
- ✅ Any section using the ImageUpload component

## Benefits

### Before (Old Way)
- Upload image → Copy URL → Paste in form
- Or manually type/paste URLs
- Hard to remember which images you have
- No visual preview of existing images

### After (New Way)
- Click "Browse Gallery" → Select → Done
- See all your images visually
- Upload new images without leaving the form
- Select multiple at once for galleries
- Search to find images quickly

## Dialog Features Explained

### Header Section
- **Title** - What you're selecting (e.g., "Select Product Image")
- **Description** - Helpful hint about selection mode
- **Close button** - Cancel and close dialog

### Toolbar
- **Search box** - Filter images by filename
- **Refresh button** - Reload gallery (with spinner when loading)
- **Upload button** - Add new images from computer

### Gallery Grid
- **5 columns** on large screens
- **4 columns** on desktop
- **3 columns** on tablet
- **2 columns** on mobile
- Images show filename and size on hover
- Selected images have green border + checkmark

### Footer
- **Selection count** - Shows how many selected
- **Clear selection** - Quick way to deselect all
- **Cancel** - Close without applying
- **Confirm** - Apply selection and close

## Tips

### Fast Workflow
1. Click "Browse Gallery" on any image field
2. If image not found, click "Upload" in dialog
3. Select your uploaded image
4. Click "Confirm" - Done!

### Bulk Gallery Setup
1. Go to product form gallery section
2. Click "Select from Gallery"
3. Click all images you want (5, 10, 20+)
4. Confirm - all images added instantly

### Finding Images
1. Type filename in search box
2. Gallery filters in real-time
3. Select your image
4. Search clears when you close dialog

### Uploading Multiple
1. Click "Upload" in dialog
2. Select multiple files (Ctrl/Cmd + Click)
3. Watch progress bar
4. All images auto-selected when done
5. Just confirm to add them all

## Technical Details

### Components Created
- **R2ImageSelectorDialog** - Main gallery dialog
- **MultipleImageUpload** - Multiple image field component
- **Enhanced ImageUpload** - Added gallery button

### Data Flow
1. Dialog fetches images from `/api/r2-list`
2. User selects image(s)
3. URL(s) passed back to form
4. Form updates with new URL(s)

### Performance
- Lazy loading for images
- Grid layout optimized for scrolling
- Search filters client-side (fast)
- Upload shows progress bar

## Common Use Cases

### Adding a New Product
1. Fill in product name, description, price
2. For main image: Click "Browse Gallery" or "Upload"
3. For gallery: Click "Select from Gallery", choose 3-5 images
4. Save product

### Updating Product Images
1. Edit existing product
2. Click "Browse Gallery" on image field
3. Select new image from R2
4. Old image URL replaced automatically

### Reusing Images Across Products
1. Upload image once
2. Use "Browse Gallery" on other products
3. Select same image
4. No need to re-upload

### Creating Category with Image
1. Add new category
2. Click "Browse Gallery" for category image
3. Select image or upload new one
4. Save category

## Notes

- All uploads are compressed automatically
- Images stored in R2 for 99.99% reliability
- Gallery shows all images in your R2 bucket
- Deleted images removed from gallery immediately
- Dialog state resets when closed
- Multi-select only in gallery images section
- Single select everywhere else

Enjoy the streamlined image management workflow!
