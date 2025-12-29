# Hand Viewer MicroSim - Development Session Log

**Date:** 2025-12-29
**Project:** ASL Intelligent Textbook
**Author:** Curtis Olufson (with Claude Code assistance)

---

## Session Overview

This session focused on creating a proof-of-concept 3D hand visualization tool for displaying American Sign Language (ASL) hand positions within the intelligent textbook.

---

## Initial Requirements

The user requested guidance on creating 3D visualizations of hand positions for ASL signs with the following constraints:
- Must run in a standard web browser
- Should use three.js for 3D rendering
- Need an open data format for hand/finger positions

---

## Research Phase

### 3D Rendering Technology

**Decision: Use Three.js**

Reasoning:
- Industry-standard WebGL library for browser-based 3D
- Extensive documentation and community support
- Works well with GLTF/GLB model formats
- Built-in OrbitControls for camera manipulation
- Compatible with WebXR for potential future VR integration

### Data Source Research

Investigated available ASL hand pose datasets:

| Dataset | Type | Availability | Notes |
|---------|------|--------------|-------|
| **SignAvatars (ECCV 2024)** | 3D SMPL-X poses | Request access | Best option - 70K videos, 8.34M frames with hand pose parameters |
| **How2Sign** | Video + some 3D | CC BY-NC 4.0 | 80+ hours, 3-hour 3D subset |
| **WLASL** | Video only | Public | 2,000+ signs, requires pose extraction |
| **ASL-LEX** | Lexical features | Public | Phonological data, not 3D |
| **Handy.js** | Recognition library | MIT | 100+ poses including ASL alphabet |

**Recommendation: SignAvatars**

Reasoning:
- Most comprehensive recent dataset specifically for sign language
- Provides SMPL-X parameters with explicit hand pose data:
  - `left_hand_pose` (45 dimensions)
  - `right_hand_pose` (45 dimensions)
- Covers both isolated signs and continuous signing
- Academic/non-commercial use permitted

---

## Architecture Design

### Recommended System Architecture

```
┌─────────────────────────────────────────────────────┐
│  ASL Sign Database (JSON)                           │
│  - Sign name, description                           │
│  - Hand pose keyframes (from SignAvatars SMPL-X)    │
│  - Timing/easing data                               │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  Three.js Renderer                                  │
│  - Rigged GLTF hand model                           │
│  - Bone rotations mapped from pose data             │
│  - Orbit controls for user viewing                  │
└─────────────────────────────────────────────────────┘
```

### Proof-of-Concept Approach

For the initial implementation, decided to:
1. Build a procedural hand model (no external GLTF dependency)
2. Use simple geometry (cylinders for bones, spheres for joints)
3. Implement hierarchical bone structure for realistic finger curling
4. Add preset poses for common ASL hand shapes
5. Provide manual finger control sliders for experimentation

---

## Implementation Details

### File Structure

```
docs/sims/hand-viewer/
├── main.html      # HTML structure with three.js CDN imports
├── script.js      # 3D hand model, animation, controls
├── local.css      # Dark theme UI styling
└── index.md       # MkDocs documentation page
```

### Hand Model Design

**Anatomical Proportions**

Used realistic relative proportions for the hand:

```javascript
const PALM_WIDTH = 1.0;
const PALM_HEIGHT = 1.2;
const PALM_DEPTH = 0.25;

// Finger segment lengths [metacarpal, proximal, middle, distal]
const FINGER_LENGTHS = {
    thumb:  [0.4, 0.35, 0.3, 0.0],  // 3 segments
    index:  [0.5, 0.45, 0.3, 0.25], // 4 segments
    middle: [0.5, 0.5, 0.35, 0.25], // 4 segments (longest)
    ring:   [0.5, 0.45, 0.3, 0.25], // 4 segments
    pinky:  [0.5, 0.35, 0.25, 0.2]  // 4 segments (shortest)
};
```

**Hierarchical Bone Structure**

Each finger uses nested Three.js Groups to create a parent-child hierarchy:

```
Palm (Group)
└── Finger Base (Group) - positioned on palm edge
    └── Metacarpal (Group) - slight curl
        └── Proximal (Group) - main curl joint
            └── Middle (Group) - secondary curl
                └── Distal (Group) - fingertip curl
```

This hierarchy ensures that rotating a parent joint automatically moves all child joints, creating natural finger curling behavior.

**Thumb Special Handling**

The thumb required special treatment:
- Different base position (side of palm, not top)
- Additional Z-axis rotation for opposition
- X-axis tilt for natural resting position
- Only 3 segments (no distal phalanx in simplified model)

### Pose System

**Predefined ASL Poses**

Implemented 7 preset poses with curl percentages (0-100) for each finger:

```javascript
const POSES = {
    'open': { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
    'fist': { thumb: 80, index: 100, middle: 100, ring: 100, pinky: 100 },
    'point': { thumb: 80, index: 0, middle: 100, ring: 100, pinky: 100 },
    'asl-a': { thumb: 30, index: 100, middle: 100, ring: 100, pinky: 100 },
    'asl-b': { thumb: 100, index: 0, middle: 0, ring: 0, pinky: 0 },
    'asl-c': { thumb: 40, index: 50, middle: 50, ring: 50, pinky: 50 },
    'asl-i-love-you': { thumb: 0, index: 0, middle: 100, ring: 100, pinky: 0 }
};
```

**Animation System**

Poses animate smoothly using linear interpolation:

```javascript
function animatePose() {
    const speed = 0.15;
    Object.keys(currentPose).forEach(finger => {
        if (Math.abs(currentPose[finger] - targetPose[finger]) > 0.5) {
            currentPose[finger] += (targetPose[finger] - currentPose[finger]) * speed;
        }
        updateFingerCurl(finger, currentPose[finger]);
    });
}
```

### User Interface Design

**Control Panel Features:**
1. **Pose Buttons** - Quick access to preset hand shapes
2. **Finger Sliders** - Fine-grained control (0-100% curl)
3. **Show Joints Toggle** - Educational view of joint locations
4. **Mirror Toggle** - Switch between right/left hand
5. **Reset View Button** - Return camera to default position

**Visual Design Decisions:**
- Dark theme (#1a1a2e background) to match modern educational tools
- High contrast controls for accessibility
- Purple accent color (#667eea) for interactive elements
- Responsive layout (side panel on desktop, stacked on mobile)

### Three.js Configuration

**Lighting Setup:**
```javascript
// Ambient for base visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);

// Main directional light with shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);

// Back light for depth
const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
backLight.position.set(-5, 5, -5);
```

**Materials:**
- Skin: MeshPhongMaterial with realistic skin tone (#ffdbac)
- Joints: MeshPhongMaterial with red highlight (#ff6b6b) for visibility

---

## Integration with MkDocs

Updated `mkdocs.yml` to add the Hand Viewer to the Visualizations section:

```yaml
- Visualizations:
    - Graph Viewer: sims/graph-viewer/index.md
    - Hand Viewer: sims/hand-viewer/index.md
```

The `index.md` embeds the visualization via iframe for seamless integration with the textbook.

---

## Future Enhancement Roadmap

### Phase 1: Improved Visuals
- Import professional GLTF hand model
- Add skin texture and normal maps
- Implement proper finger spread (abduction/adduction)

### Phase 2: Data Integration
- Load SignAvatars SMPL-X pose data
- Create JSON format for ASL sign definitions
- Build sign lookup/search functionality

### Phase 3: Animation
- Timeline scrubber for sign playback
- Keyframe interpolation for smooth transitions
- Support for sign sequences (words/phrases)

### Phase 4: Two-Handed Signs
- Add second hand model
- Synchronize both hands for two-handed signs
- Implement relative hand positioning

### Phase 5: Educational Features
- Annotation system for highlighting key hand shapes
- Comparison view (student attempt vs. correct form)
- Integration with sign recognition (MediaPipe)

---

## Technical Notes

### CDN Dependencies

```html
<!-- Three.js core -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- OrbitControls addon -->
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
```

### Browser Compatibility

Tested requirements:
- WebGL support (all modern browsers)
- ES6 JavaScript features
- No server-side dependencies

### Local Testing

```bash
cd /Users/dan/Documents/ws/asl-book
mkdocs serve
# Open: http://127.0.0.1:8000/asl-book/sims/hand-viewer/main.html
```

---

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `main.html` | 78 | HTML structure, CDN imports, control elements |
| `script.js` | 290 | Three.js scene, hand model, animation logic |
| `local.css` | 175 | Dark theme styling, responsive layout |
| `index.md` | 65 | Documentation and embedded viewer |

---

## Session Summary

Created a functional proof-of-concept 3D hand viewer that demonstrates:
- Browser-based 3D rendering with Three.js
- Procedural skeletal hand model with hierarchical bones
- Smooth pose animation system
- Interactive controls for educational exploration
- Integration with MkDocs intelligent textbook framework

The implementation provides a foundation for future development with real ASL pose data from datasets like SignAvatars.
