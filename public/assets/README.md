# Custom Assets

This directory is for your custom branding assets.

## Logo

Place your custom logo in this folder and reference it in your environment variables:

```bash
# Example: if you put logo.svg in this folder
NEXT_PUBLIC_LOGO_URL=/assets/logo.svg
```

## Supported Formats

- **Logo**: SVG, PNG, or any web-compatible image format
- **Social Media Images**: PNG or JPG (1200x630 for OpenGraph, 1200x600 for Twitter)

## Environment Variables

Update your `.env.local` file with the paths to your custom assets:

```bash
# Custom logo (optional)
NEXT_PUBLIC_LOGO_URL=/assets/your-logo.svg

# Social media images (optional)
NEXT_PUBLIC_OG_IMAGE_URL=/assets/og-image.png
NEXT_PUBLIC_TWITTER_IMAGE_URL=/assets/twitter-image.png

# Branding link (optional)
NEXT_PUBLIC_BRANDING_LINK_URL=https://your-website.com
```

## Default Behavior

- If no logo is provided, the app name will display as text
- If no social images are provided, `/og-image.png` is used as fallback
- Logo display can be disabled by setting `NEXT_PUBLIC_SHOW_BRANDING=false`
