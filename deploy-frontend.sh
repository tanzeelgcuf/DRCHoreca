#!/bin/bash
# deploy-frontend.sh - Updated deployment script

echo "🚀 Building and deploying DRC Tax Platform to server..."

# Build the application for production
echo "📦 Building application..."
REACT_APP_ENV=production npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors above."
    exit 1
fi

echo "✅ Build successful!"

# Create the directory on the server if it doesn't exist
echo "📁 Creating/preparing server directory..."
ssh tanzeelrehman913@34.30.198.6 "sudo mkdir -p /var/www/html/hotel && sudo chown tanzeelrehman913:tanzeelrehman913 /var/www/html/hotel"

if [ $? -ne 0 ]; then
    echo "❌ Failed to create server directory. Trying alternative approach..."
    
    # Alternative: try to create in home directory first, then move
    echo "📁 Creating directory in home folder first..."
    ssh tanzeelrehman913@34.30.198.6 "mkdir -p ~/hotel_temp"
    
    # Upload to home directory first
    echo "📤 Uploading files to home directory..."
    scp -r build/* tanzeelrehman913@34.30.198.6:~/hotel_temp/
    
    # Move files with sudo
    echo "📋 Moving files to web directory..."
    ssh tanzeelrehman913@34.30.198.6 "sudo mkdir -p /var/www/html/hotel && sudo cp -r ~/hotel_temp/* /var/www/html/hotel/ && sudo chown -R www-data:www-data /var/www/html/hotel && rm -rf ~/hotel_temp"
    
    echo "✅ Alternative deployment complete!"
else
    # Direct upload if directory creation succeeded
    echo "📤 Uploading files directly..."
    scp -r build/* tanzeelrehman913@34.30.198.6:/var/www/html/hotel/
    
    # Set proper permissions
    echo "🔒 Setting proper permissions..."
    ssh tanzeelrehman913@34.30.198.6 "sudo chown -R www-data:www-data /var/www/html/hotel"
    
    echo "✅ Direct deployment complete!"
fi

echo ""
echo "🎉 Deployment finished!"
echo "🌐 Your application should be available at: http://34.30.198.6/hotel"
echo ""
echo "🔧 To test the deployment:"
echo "   1. Visit: http://34.30.198.6/hotel"
echo "   2. Login with: demo / demo"
echo "   3. Check browser console for any errors"
echo ""
echo "📝 If you encounter issues:"
echo "   - Check server logs: ssh tanzeelrehman913@34.30.198.6 'sudo tail -f /var/log/apache2/error.log'"
echo "   - Verify backend API: curl http://34.30.198.6:8080/api/v1/health"
echo "   - Check file permissions: ssh tanzeelrehman913@34.30.198.6 'ls -la /var/www/html/hotel/'"