# API Directory

This directory contains API client functions and configurations.

## Current Files:
- `apiClient.js` - Base API client with interceptors
- `auth.js` - Authentication API calls

## Team Usage:
Add new API modules as needed:
```
api/
├── apiClient.js
├── auth.js
├── events.js
├── users.js
└── ai.js
```

## Example New API Module:
```javascript
import apiClient from './apiClient';

export const eventsAPI = {
    getEvents: () => apiClient.get('/events'),
    createEvent: (data) => apiClient.post('/events', data),
    // More functions...
};
```