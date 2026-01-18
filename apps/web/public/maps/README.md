# Map Image Setup

Place your Chernarus map image here with the following requirements:

## Required File
- **Filename:** `chernarus.jpg`
- **Dimensions:** 15360 × 15360 pixels (exactly)
- **Format:** JPG

## Where to Get the Map
1. **iZurvive** - Export from their map tools
2. **DayZ Expansion** - Located in expansion mod files
3. **CF Tools** - Use their exported maps
4. **Community Resources** - Search for "DayZ Chernarus 15360" satellite map

## Coordinate System
The map uses DayZ world coordinates:
- X = East/West (0 → 15360)
- Z = South/North (0 → 15360)

The web application automatically flips the Z axis for proper display.

## Validation
After adding the map, test with known coordinates:
- (0, 15360) = top-left
- (15360, 15360) = top-right  
- (0, 0) = bottom-left
- (15360, 0) = bottom-right
- (7680, 7680) = exact center

## For Other Maps
For Livonia (Enoch) or Sakhal, create additional map images:
- `livonia.png` - 12800 × 12800
- `sakhal.png` - (check DayZ documentation for size)

Then update the DayZMap component to select the correct map based on server config.
