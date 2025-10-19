# Directions Feature Implementation Analysis

## ✅ What You've Already Accomplished

### 1. ✅ **Created the `getDirections` utility** (`src/lib/getDirections`)
- **Location**: `campus-chatbot/src/lib/getDirections` (file without extension)
- **Exports**:
  - `Step` type: `{ text: string; distance: string; duration: string }`
  - `DirectionsData` type with full response structure
  - `getDirections()` async function
- **Features**:
  - Fetches from `/api/directions` endpoint (your Flask backend)
  - Accepts origin, destination coordinates, and mode (walking/driving/transit)
  - Converts HTML instructions to plain text using `htmlToText()`
  - Returns structured data with distance, duration, steps, polyline

### 2. ✅ **Created the `htmlToText` utility** (`src/lib/text.ts`)
- **Purpose**: Strips HTML tags from Google Directions API responses
- **Example**: `"<b>Turn right</b>"` → `"Turn right"`
- **Used by**: `getDirections` to clean step instructions for display

### 3. ✅ **Created the `DirectionsResult` component** (`src/components/DirectionsResult.tsx`)
- **Props**: `destName`, `distanceText`, `durationText`, `steps[]`
- **Features**:
  - Displays route summary with distance and duration
  - Shows numbered list of up to 8 steps (with "...and X more steps" for longer routes)
  - **Text-to-speech**: 🔊 "Read directions" button that speaks first 6 steps
  - Stop button while speaking
  - Clean, accessible UI with proper styling

### 4. ✅ **Extended Message interface** (`src/App.tsx`)
```typescript
interface Message {
  // ...existing fields...
  directions?: {
    destName: string;
    distanceText: string;
    durationText: string;
    steps: { text: string; distance: string; duration: string }[];
  };
}
```

### 5. ✅ **Imported DirectionsResult in App.tsx**
```typescript
import DirectionsResult from "./components/DirectionsResult";
```

### 6. ✅ **Rendering DirectionsResult in message list**
```typescript
{message.directions && (
  <div className="mt-3 ml-11">
    <DirectionsResult
      destName={message.directions.destName}
      distanceText={message.directions.distanceText}
      durationText={message.directions.durationText}
      steps={message.directions.steps}
    />
  </div>
)}
```

### 7. ✅ **Backend Flask endpoint ready** (`flask_api.py`)
- Route: `POST /api/directions`
- Accepts: `{ origin: {lat, lng}, destination: {lat, lng}, mode: "walking" }`
- Returns: Google Directions API response with steps, distance, duration, polyline

---

## ⚠️ Missing Pieces

### **CRITICAL**: Configure TypeScript path alias
Your `DirectionsResult.tsx` imports from `@/lib/getDirections` but the `@` alias is not configured.

**Fix in `vite.config.ts`**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Fix in `tsconfig.app.json`**:
```jsonc
{
  "compilerOptions": {
    // ...existing options...
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**OR** just change the import in `DirectionsResult.tsx` to a relative path:
```typescript
import type { Step } from "../lib/getDirections";
```

---

## 🔧 What Still Needs to Be Done

### **Step 1**: Wire up the `getDirections` call in your chat flow

You need to add logic in `App.tsx` to:
1. Detect when a destination POI is identified
2. Get the origin (user location or campus fallback)
3. Call `getDirections(origin, dest, "walking")`
4. Add the result to the message with the `directions` field

**Example location in `App.tsx`** (in your `handleSendMessage` function):
```typescript
import { getDirections } from "./lib/getDirections";

// After you determine the destination POI and have origin coordinates:
const handleSendMessage = async (message: string) => {
  // ...your existing logic...
  
  // When you detect a directions request and have dest:
  if (lastPOI && userLocation) {
    try {
      const data = await getDirections(
        { lat: userLocation.lat, lng: userLocation.lng },
        { lat: lastPOI.lat, lng: lastPOI.lng },
        "walking"
      );
      
      // Add message with directions
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Here are the directions to ${lastPOI.name}:`,
        timestamp: new Date().toLocaleTimeString(),
        poi: lastPOI,
        directions: {
          destName: lastPOI.name,
          distanceText: data.distanceText,
          durationText: data.durationText,
          steps: data.steps,
        },
      });
    } catch (error) {
      console.error("Failed to get directions:", error);
      // Add error message
    }
  }
};
```

### **Step 2**: Ensure Flask backend is running
Make sure your Flask API is running with the `/api/directions` endpoint:
```bash
python flask_api.py
```

Verify the endpoint is accessible at `http://localhost:5000/api/directions`

### **Step 3**: Configure proxy for development
If your Vite dev server is on a different port than Flask, add a proxy in `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 📋 Testing Checklist

Once everything is wired up:

- [ ] TypeScript compiles without errors
- [ ] User can ask for directions to a location
- [ ] Origin is set (user location or fallback)
- [ ] `getDirections()` successfully fetches from backend
- [ ] DirectionsResult component renders with steps
- [ ] 🔊 "Read directions" button works
- [ ] Speech synthesis reads the route summary
- [ ] Steps are displayed with proper formatting
- [ ] Works on both mobile and desktop layouts

---

## 🎯 Summary

You've done excellent work setting up the infrastructure! You have:
- ✅ Backend endpoint ready
- ✅ Frontend API client (`getDirections`)
- ✅ UI component (`DirectionsResult`)
- ✅ Message structure extended
- ✅ Rendering logic in place

**What's left**:
1. Fix the TypeScript path alias issue (quick fix)
2. Wire up the `getDirections()` call in your message handler
3. Test the end-to-end flow

You're about 90% done! Just need to connect the dots in your chat message handler. 🚀
