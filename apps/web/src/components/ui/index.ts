/**
 * @file index.ts
 * @description UI primitives barrel export - Reusable base components
 * 
 * Re-exports all UI primitive components. These are the building blocks
 * used throughout the application for consistent styling.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * COMPONENTS:
 * - Card    - Container with shadow and padding
 * - Button  - Styled button with variants
 * - Input   - Form text input
 * - Select  - Dropdown select input
 * - Badge   - Status/category labels
 * 
 * STYLING:
 * All components use Tailwind CSS classes.
 * See tailwind.config.js for theme customization.
 * 
 * USAGE:
 * import { Button, Card, Input } from './components/ui';
 */
export { Card } from './Card';
export { Button } from './Button';
export { Input } from './Input';
export { Select } from './Select';
export { Badge } from './Badge';
