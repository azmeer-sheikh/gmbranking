# Admin Panel Integration Guide

## Quick Start - Add Comprehensive Client Form to Admin Panel

### Step 1: Import the Component

Add this import at the top of `/pages/AdminPanel.tsx`:

```typescript
import ComprehensiveClientForm from '../components/ComprehensiveClientForm';
```

### Step 2: Add State

Add this state variable with your other state declarations:

```typescript
const [showComprehensiveForm, setShowComprehensiveForm] = useState(false);
```

### Step 3: Add Submit Handler

Add this function with your other handlers:

```typescript
const handleComprehensiveSubmit = async (formData: any) => {
  setLoading(true);
  
  const result = await api.createComprehensiveClient(formData);
  
  if (result.success) {
    toast.success('Client created successfully with all data!');
    setShowComprehensiveForm(false);
    await loadData(); // Reload clients list
  } else {
    toast.error(result.message || 'Failed to create client');
  }
  
  setLoading(false);
};
```

### Step 4: Add Button to UI

Find the section where you have the "Add New Client" button and add this button nearby:

```typescript
<Button
  onClick={() => setShowComprehensiveForm(true)}
  className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
  size="lg"
>
  <Plus className="size-5" />
  <div className="text-left">
    <div style={{ fontWeight: 700 }}>Add Comprehensive Client</div>
    <div className="text-xs opacity-90">Full multi-step setup</div>
  </div>
</Button>
```

### Step 5: Add Form Component

At the end of your return statement, before the closing tags, add:

```typescript
{/* Comprehensive Client Form */}
{showComprehensiveForm && (
  <ComprehensiveClientForm
    globalKeywords={globalKeywords}
    onSubmit={handleComprehensiveSubmit}
    onCancel={() => setShowComprehensiveForm(false)}
  />
)}
```

## Complete Integration Example

Here's a complete example showing where everything goes:

```typescript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
// ... other imports
import ComprehensiveClientForm from '../components/ComprehensiveClientForm';  // ADD THIS

export default function AdminPanel() {
  // Existing state
  const [clients, setClients] = useState<Client[]>([]);
  const [globalKeywords, setGlobalKeywords] = useState<GlobalKeyword[]>([]);
  // ... other state
  
  const [showComprehensiveForm, setShowComprehensiveForm] = useState(false);  // ADD THIS

  // Existing functions
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // ... existing code
  };

  // ADD THIS FUNCTION
  const handleComprehensiveSubmit = async (formData: any) => {
    setLoading(true);
    
    const result = await api.createComprehensiveClient(formData);
    
    if (result.success) {
      toast.success('Client created successfully with all data!');
      setShowComprehensiveForm(false);
      await loadData();
    } else {
      toast.error(result.message || 'Failed to create client');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        {/* ... existing header */}
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          {/* Existing buttons */}
          <Button onClick={() => setShowClientForm(true)}>
            <Plus className="size-4" />
            Quick Add Client
          </Button>

          {/* ADD THIS BUTTON */}
          <Button
            onClick={() => setShowComprehensiveForm(true)}
            className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-600"
          >
            <Plus className="size-5" />
            Add Comprehensive Client
          </Button>
        </div>

        {/* Tabs and existing content */}
        {/* ... */}
      </div>

      {/* ADD THIS AT THE END */}
      {showComprehensiveForm && (
        <ComprehensiveClientForm
          globalKeywords={globalKeywords}
          onSubmit={handleComprehensiveSubmit}
          onCancel={() => setShowComprehensiveForm(false)}
        />
      )}
    </div>
  );
}
```

## Testing the Integration

1. **Navigate to Admin Panel**: Go to `/admin` in your browser
2. **Click "Add Comprehensive Client"**: The multi-step form should appear
3. **Fill Out Each Step**:
   - Step 1: Basic business info
   - Step 2: Add service areas for map
   - Step 3: Select keywords
   - Step 4: Add analytics metrics
   - Step 5: Enter SEO scores
   - Step 6: Add social media data
4. **Click "Complete & Save"**: Data should be saved to database
5. **Verify**: Check the clients list to see your new client

## Updating Main App to Use Service Areas

To display service areas on the map, add this API function:

```typescript
// In /services/database-api.ts (already added)
export async function getClientServiceAreas(clientId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/service-areas/${clientId}`, { headers });
    const data = await response.json();
    return data.areas || [];
  } catch (error) {
    console.error('Error fetching service areas:', error);
    return [];
  }
}
```

Then in your Map component:

```typescript
const [serviceAreas, setServiceAreas] = useState([]);

useEffect(() => {
  if (selectedClientId) {
    fetchServiceAreas();
  }
}, [selectedClientId]);

const fetchServiceAreas = async () => {
  const areas = await api.getClientServiceAreas(selectedClientId);
  setServiceAreas(areas);
};

// In map rendering:
{serviceAreas.map((area) => (
  <Circle
    key={area.id}
    center={{ lat: area.latitude, lng: area.longitude }}
    radius={area.radius_km * 1000}
    options={{
      fillColor: area.is_primary ? '#FFD700' : '#00C47E',
      fillOpacity: 0.2,
      strokeColor: area.is_primary ? '#FFD700' : '#00C47E',
      strokeOpacity: 0.8,
      strokeWeight: 2,
    }}
  />
))}
```

## Database Migration

Before using the form, run the migration:

The migration file is already created at:
`/supabase/migrations/20241212000000_add_client_comprehensive_data.sql`

Supabase will automatically detect and run this migration.

## Features Enabled

Once integrated, you can:

✅ Manually add clients with complete data through 6-step form
✅ Add multiple service areas with map coordinates and radius
✅ Select keywords from global list
✅ Add custom analytics metrics
✅ Enter complete SEO analysis scores
✅ Add social media stats for multiple platforms
✅ Add demographic data

All data dynamically updates across the entire application based on selected client!

## Troubleshooting

**Form doesn't appear:**
- Check console for errors
- Verify `globalKeywords` is loaded
- Ensure `showComprehensiveForm` state is working

**Submit fails:**
- Check network tab for API errors
- Verify database migration ran successfully
- Check server logs for detailed error messages

**Data doesn't appear in main app:**
- Ensure client selection is working
- Check if data was saved (look in database or use GET endpoint)
- Verify main app is fetching comprehensive data

## Next Steps

1. Add the comprehensive form to Admin Panel (follow steps above)
2. Test adding a client with all data
3. Update Map View to display service areas
4. Update other tabs (SEO, Social, Analytics) to fetch from new tables
5. Add edit functionality for existing comprehensive clients

That's it! You now have a fully functional comprehensive client management system!
