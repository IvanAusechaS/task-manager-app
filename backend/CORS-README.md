# CORS Configuration for Render

This is a text file that will be placed in the backend directory to provide clear documentation about the CORS configuration.

## Current CORS Strategy

The application now uses a three-level CORS configuration approach to ensure all environments work correctly:

1. **Application-level CORS** (direct-cors.js)
   - Applied directly in Express middleware
   - Sets appropriate headers for all routes
   - Handles preflight OPTIONS requests

2. **Server-level CORS** (server-cors.js)
   - Intercepts all HTTP responses at the Node.js server level
   - Modifies response headers before they're sent to the client
   - Acts as a failsafe if application middleware doesn't work

3. **Platform Configuration** (vercel.json)
   - Defines headers for the deployment platform
   - Works with both Vercel and Render
   - Provides configuration when the platform sits in front of our Node.js app

## Troubleshooting

If CORS issues persist after deployment:

1. Check the browser console for specific error messages
2. Verify that the frontend is correctly accessing the backend URL
3. Try adding your frontend URL explicitly to the allowed origins if wildcard (*) isn't working
4. Check if the platform (Render) has additional settings that might override our CORS configuration

## Testing

You can test CORS configuration using curl:

```bash
curl -X OPTIONS -H "Origin: https://your-frontend-url.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \
  -v https://your-backend-url.com/api/endpoint
```

The response should include the appropriate Access-Control-Allow-* headers.
