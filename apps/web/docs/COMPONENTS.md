# SST Dashboard - Component Guide

> Guide to the dashboard's component architecture

## Component Structure

```
src/components/
├── features/          # Feature-specific components
│   ├── PlayerDashboard.tsx
│   ├── VehicleDashboard.tsx
│   ├── EconomyDashboard.tsx
│   ├── ItemSearch.tsx
│   ├── GrantItem.tsx
│   ├── PlayerManager.tsx
│   ├── MarketEditor.tsx
│   ├── LogViewer.tsx
│   ├── PlayerHistory.tsx
│   ├── FullPageMap.tsx
│   ├── DayZMap.tsx
│   ├── PlayerModal.tsx
│   ├── InventoryTree.tsx
│   ├── ConnectionBar.tsx
│   ├── ServerSettings.tsx
│   ├── UserManagement.tsx
│   ├── LoginPage.tsx
│   ├── ApiConfig.tsx
│   └── index.ts
└── ui/                # Reusable UI primitives
    ├── Button.tsx
    ├── Card.tsx
    ├── Badge.tsx
    ├── Input.tsx
    ├── Select.tsx
    └── index.ts
```

## UI Primitives

### Button

```tsx
import { Button } from './components/ui';

<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>

<Button variant="danger" icon={<Trash2 />}>
  Delete
</Button>
```

**Variants:** `primary`, `secondary`, `success`, `danger`, `ghost`
**Sizes:** `sm`, `md`, `lg`

### Card

```tsx
import { Card } from './components/ui';

<Card 
  title="Player Stats" 
  icon={<Users />}
  actions={<Button>Refresh</Button>}
>
  Content here
</Card>
```

### Badge

```tsx
import { Badge } from './components/ui';

<Badge variant="success">Online</Badge>
<Badge variant="error">Dead</Badge>
```

**Variants:** `default`, `success`, `warning`, `error`, `info`

### Input

```tsx
import { Input } from './components/ui';

<Input 
  label="Player ID"
  placeholder="Enter Steam64 ID"
  error={errors.playerId}
  icon={<User />}
/>
```

### Select

```tsx
import { Select } from './components/ui';

<Select 
  label="Category"
  options={[
    { value: 'weapons', label: 'Weapons' },
    { value: 'ammo', label: 'Ammunition' }
  ]}
/>
```

---

## Feature Components

### Dashboard Views

These are the main tab content components:

| Component | Tab | Description |
|-----------|-----|-------------|
| `PlayerDashboard` | Dashboard | Server stats overview |
| `PlayerManager` | Players | Player management |
| `ItemSearch` | Items | Item database search |
| `FullPageMap` | Map | Full-screen player map |
| `VehicleDashboard` | Vehicles | Vehicle tracking |
| `MarketEditor` | Market | Expansion market editing |
| `EconomyDashboard` | Economy | Economy analysis |
| `LogViewer` | Logs | Server log viewer |
| `PlayerHistory` | History | Position history |
| `UserManagement` | Users | Dashboard users (admin) |
| `ServerSettings` | Settings | Server configuration |

### Shared Components

| Component | Description |
|-----------|-------------|
| `ConnectionBar` | Header connection status |
| `LoginPage` | Authentication form |
| `PlayerModal` | Player detail overlay |
| `InventoryTree` | Hierarchical inventory view |
| `DayZMap` | Embeddable map widget |
| `GrantItem` | Item grant interface |

---

## Adding a New Feature

### 1. Create the Component

```tsx
// src/components/features/MyFeature.tsx

import React, { useState, useEffect } from 'react';
import { Card, Button } from '../ui';

interface MyFeatureProps {
  isConnected: boolean;
}

export const MyFeature: React.FC<MyFeatureProps> = ({ isConnected }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadData();
    }
  }, [isConnected]);

  const loadData = async () => {
    setLoading(true);
    try {
      // API call here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="My Feature">
      {/* Content */}
    </Card>
  );
};
```

### 2. Export from Index

```tsx
// src/components/features/index.ts

export { MyFeature } from './MyFeature';
```

### 3. Add Tab in App.tsx

```tsx
// In App.tsx

type TabType = 'dashboard' | 'myfeature' | ...;

// In navigation
{
  id: 'myfeature',
  icon: <MyIcon />,
  label: 'My Feature'
}

// In renderContent()
case 'myfeature':
  return <MyFeature isConnected={isConnected} />;
```

---

## Styling Guide

### Tailwind Classes

The project uses Tailwind CSS with a dark theme. Common patterns:

```tsx
// Card backgrounds
className="bg-surface-800 border border-surface-700"

// Text colors
className="text-surface-100"  // Primary text
className="text-surface-400"  // Secondary text

// Accent colors
className="text-accent-500"   // Blue accent
className="bg-accent-600"     // Blue background

// Status colors
className="text-green-400"    // Success
className="text-red-400"      // Error
className="text-yellow-400"   // Warning
```

### Custom Theme

See `tailwind.config.js` for theme customization:

```js
theme: {
  extend: {
    colors: {
      surface: { /* dark grays */ },
      accent: { /* blue accent */ }
    }
  }
}
```

---

## State Management

### Local State

Most components use React's `useState` and `useEffect`:

```tsx
const [data, setData] = useState<DataType | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Shared State

For cross-component state:

1. Lift state to common parent (App.tsx)
2. Pass via props
3. Use context for deep nesting (not currently implemented)

### Server State

API data fetched via `services/api.ts`:

```tsx
import { getDashboard } from '../services/api';

const data = await getDashboard();
```

---

## Testing

Currently no tests implemented. Recommended setup:

```bash
npm install -D vitest @testing-library/react
```

```tsx
// MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```
