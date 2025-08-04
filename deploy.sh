#!/bin/bash

# VR Panorama Tour Deployment Script

echo "🚀 Starting deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running type check..."
npm run build --dry-run || {
    echo "❌ Type check failed. Please fix TypeScript errors before deploying."
    exit 1
}

# Build for production
echo "🏗️ Building for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed. dist directory not found."
    exit 1
fi

# Optimize images (if imagemagick is available)
if command -v convert &> /dev/null; then
    echo "🖼️ Optimizing images..."
    find dist -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | while read file; do
        convert "$file" -strip -quality 85 "$file"
    done
fi

# Create deployment archive
echo "📦 Creating deployment archive..."
tar -czf panorama-tour-$(date +%Y%m%d-%H%M%S).tar.gz dist/

echo "✅ Deployment package created successfully!"
echo "📁 Files are ready in the dist/ directory"
echo "📦 Archive created: panorama-tour-$(date +%Y%m%d-%H%M%S).tar.gz"

# Optional: Deploy to specific platform
if [ "$1" = "netlify" ]; then
    echo "🌐 Deploying to Netlify..."
    npx netlify deploy --prod --dir=dist
elif [ "$1" = "vercel" ]; then
    echo "🌐 Deploying to Vercel..."
    npx vercel --prod
elif [ "$1" = "github" ]; then
    echo "🌐 Deploying to GitHub Pages..."
    # Add GitHub Pages deployment logic here
else
    echo "💡 To deploy to a platform, run:"
    echo "   ./deploy.sh netlify  # Deploy to Netlify"
    echo "   ./deploy.sh vercel   # Deploy to Vercel"
    echo "   ./deploy.sh github   # Deploy to GitHub Pages"
fi

echo "🎉 Deployment script completed!"
