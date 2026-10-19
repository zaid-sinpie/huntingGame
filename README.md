# WildHunt — 3D First-Person Open-World Hunting Game

**WildHunt** is a browser-based 3D first-person open-world hunting simulator built with **React 19**, **TypeScript**, **Vite**, **Three.js**, and **React Three Fiber**. Players explore a continuous wilderness reserve across diverse biomes (dense pine forests, rocky mountain crags, mirror lakes, and sweeping golden meadows), track wildlife through footprints, blood trails, and scent cones, hunt game with realistic rifle ballistics and optics, harvest trophies, and upgrade equipment.

---

## Key Features

### 1. Continuous Open-World Wilderness & Biomes
- **160,000 m² Explorable Wilderness**: Mathematical continuous terrain bounded by Pine Valley, Whispering Ridge, Mirror Lake, and Golden Meadow.
- **Analytical Terrain Heightmap**: Elevation and slope calculations share an identical mathematical model across rendering, character physics, and animal pathfinding.
- **Mirror Lake Basin**: Semi-transparent animated water plane, water wading mechanics, shallow river banks, and shoreline reeds.
- **Detailed Landmarks**:
  - **Pine Valley Hunting Lodge**: Rustic timber cabin with log porch, fireplace chimney, lantern, firewood stack, and picnic clearing.
  - **Eagle Crest Fire Lookout Tower**: 16-meter timber observation tower with panoramic 360-degree catwalk overlooking the wilderness.
- **Dynamic Celestial Lighting**: Moving sun/moon, ambient light transitions (Morning Mist, Bright Noon, Sunset Golden Hour, Midnight), and atmospheric distance fog.

### 2. Physics & Anti-Tunneling Collision System
- **Capsule Character Controller**: 0.45m radius capsule with eye-level camera positioning (1.65m standing, 1.0m crouching).
- **Zero Tunneling Guarantee**: Swept circle-circle and circle-box collision resolution against trees, rocks, cabins, and towers prevents clipping through objects at high speeds.
- **Cliff Slope Limits**: Slopes steeper than 54° trigger controlled downward sliding, preventing climbing sheer vertical cliffs.
- **Safe Recovery System**: If physics ever detect penetration below ground level, the player is safely recovered to the last valid ground position.

### 3. Weapons & Ballistics System
- **M700 Bolt-Action Hunting Rifle (.308 Win)**:
  - High-magnification 4x-8x optical scope with mil-dot reticle overlay and elevation scale.
  - Recoil kick with spring recovery, muzzle flash, cartridge ejection, and bolt cycling audio.
  - Realistic hit zone multipliers:
    - **Headshot**: 3.0x lethal damage.
    - **Vitals (Heart/Lungs)**: 2.5x damage + heavy bleeding.
    - **Flesh**: 1.0x baseline damage.
    - **Legs**: 0.5x damage + reduced animal flee speed.
- **Apex Carbon Composite Hunting Bow**:
  - Silent hunting option for close to medium range without spooking herds.
- **Highland 12x50 Spotter Binoculars**:
  - Optical rangefinder with live target distance readout (meters), animal species classification tag, and trophy rating.

### 4. Wildlife AI & Animal Species
5 distinct species with behavioral state machines (`IDLE`, `GRAZE`, `WANDER`, `ALERT`, `FLEE`, `ATTACK`, `WOUNDED_FLEE`, `DEAD`, `HARVESTED`):
- **Whitetail Deer & Elk**: Grazes in forest clearings; keen hearing and scent; flees at 10.5 m/s. Males feature multi-tine antlers.
- **European Wild Boar**: Roams in brush near water; aggressive charge attack if provoked.
- **Grey Wolf**: Packs stalk the northern crags; investigate sounds and flank player.
- **Grizzly Bear**: Massive predator roaming high mountain passes; charges and deals high damage if player approaches within territory.
- **Wild Rabbit**: Quick darting meadow herbivore.

### 5. Animal Tracking & Scent Simulation
- **Ground Decals**: Realistic hoof prints, paw prints, droppings, and bright blood trails stamped onto terrain.
- **Hunter Sense (`Q`)**: Thermal luminescence highlighting nearby tracks with directional arrow trajectory.
- **Wind & Scent Vector**: Wind compass arrow on HUD. Animals downwind from the player detect scent at 1.6x distance; hunting upwind allows stealthy close approaches.
- **Investigation (`E`)**: Inspect tracks to determine species, freshness, and gait.

### 6. Procedural Web Audio Engine
100% self-contained procedural synthesis using the Web Audio API — **zero external network audio requests, zero missing asset errors**:
- Altitude-varying wilderness wind gusts.
- Melodic birdsong warbles and animal calls (elk bugle, wolf howl, boar grunt, bear roar).
- Footstep variations for grass, mountain rock, wooden cabin floorboards, and shallow water.
- High-impact rifle shots, bolt cycles, reload clicks, and harvest fanfare chimes.

### 7. Progression, Shop, Missions & Persistence
- **Lodge Armory Shop (`K`)**: Purchase 12x Long-Range Scopes, Titanium Whisper Suppressors, Scent-Masking Pine Spray, Camouflage Suits, and Ammunition boxes.
- **Wilderness Contracts (`L`)**: Bounties for specific species, clean vital shots, and exploration.
- **Trophy Room (`I`)**: Career records of all harvests with weight, distance, trophy tier (Bronze, Silver, Gold, Diamond), and credit earnings.
- **Auto-Persistence**: LocalStorage save state with instant New Game reset.
- **Photo Mode (`P`)**: Scenic camera with rule-of-thirds grid, daylight adjustment, and snapshot capture.

---

## Controls Reference

| Key | Action |
| --- | --- |
| `W`, `A`, `S`, `D` | Move character |
| `Mouse` | Look around (Pointer Lock) |
| `Left Click` | Fire equipped weapon |
| `Right Click` | Aim Down Sights (ADS) / Scope Zoom |
| `Shift` | Sprint (drains stamina) |
| `Ctrl` / `C` | Crouch (stealth stance, reduces noise & visibility) |
| `Space` | Jump |
| `R` | Reload weapon |
| `E` | Harvest animal / Investigate track |
| `Q` | Toggle Hunter Sense (illuminates tracks) |
| `1`, `2`, `3` | Equip Rifle / Bow / Binoculars |
| `M` | Open World Topographic Map |
| `I` / `Tab` | Open Inventory & Trophy Lodge |
| `L` | Open Contracts & Challenges |
| `K` | Open Hunting Lodge Shop |
| `P` | Toggle Photo Mode |
| `Esc` | Pause Menu & Settings |

---

## Technology Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **3D Graphics**: Three.js 0.186 + React Three Fiber 9 + Drei 10
- **State Management**: Zustand 5
- **Icons**: Lucide React
- **Sound**: Native Web Audio API procedural synthesis
- **Testing**: Vitest 5

---

## Installation & Development

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. Click **"ENTER THE WILDERNESS"** to lock the mouse pointer and begin exploration.

### Run Automated Tests
```bash
npm test
```
Runs the 15-point automated test suite covering terrain formulas, swept obstacle collisions, wildlife state machines, and progression.

### Build Production Bundle
```bash
npm run build
```

---

## Troubleshooting

1. **Pointer Lock Not Activating**: Click anywhere on the 3D viewport or press the "ENTER THE WILDERNESS" button. Some browsers require user interaction before locking the mouse cursor.
2. **Audio Not Playing**: Modern browsers block Web Audio until the user interacts with the page. Clicking "ENTER THE WILDERNESS" automatically initializes and resumes the audio context.
3. **Resetting Saved Data**: Open the in-game Settings (`Esc` -> Settings) and click "Reset Game Save" to clear all saved trophies, currency, and inventory.
