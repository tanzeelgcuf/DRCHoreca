#!/bin/bash
echo "Building and deploying to server..."
npm run build
scp -r build/* tanzeelrehman913@34.30.198.6:/var/www/html/hotel/
echo "Deployment complete!"