#!/bin/bash

# Build the React application
echo "Building React application..."
npm run build

# Upload to server
echo "Uploading to server..."
scp -r build/* tanzeelrehman913@34.30.198.6:/var/www/drc-hotel/

echo "Frontend deployed successfully!"