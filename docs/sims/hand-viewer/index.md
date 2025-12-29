# ASL Hand Viewer

An interactive 3D hand visualization tool for exploring American Sign Language hand positions using three.js.

<iframe src="main.html" width="100%" height="700px" style="border:none;"></iframe>

## Features

- **3D Hand Model**: Procedurally generated hand with realistic proportions
- **Preset ASL Poses**: Quick access to common hand shapes including ASL letters A, B, C and "I Love You"
- **Individual Finger Control**: Fine-tune each finger's curl position with sliders
- **Orbit Controls**: Rotate, pan, and zoom to view the hand from any angle
- **Joint Visualization**: Toggle visibility of joint markers for educational purposes
- **Mirror Mode**: Switch between right and left hand views

## Included Poses

| Pose | Description |
|------|-------------|
| Open Hand | All fingers extended |
| Fist | All fingers fully curled |
| Point | Index finger extended, others curled |
| ASL 'A' | Fist with thumb alongside |
| ASL 'B' | Flat hand with thumb tucked |
| ASL 'C' | Curved hand forming C shape |
| I Love You | Thumb, index, and pinky extended |

## Technical Details

This visualization is built with:

- **Three.js** (r128) - 3D rendering library
- **OrbitControls** - Camera manipulation
- **Procedural geometry** - Hand built from cylinders and spheres

### Hand Model Structure

The hand model uses a hierarchical bone structure:
- Palm (base)
  - Each finger has 3-4 segments (metacarpal, proximal, middle, distal)
  - Joints between segments allow rotation for curling motion
  - Thumb has special positioning and rotation for realistic movement

### Future Enhancements

This proof-of-concept can be extended to:

1. **Load SMPL-X pose data** from datasets like SignAvatars
2. **Animate between poses** for showing sign transitions
3. **Add a more detailed hand mesh** via GLTF import
4. **Include both hands** for two-handed signs
5. **Add pose data export/import** in JSON format

## Data Sources

For production use, hand pose data can be sourced from:

- [SignAvatars](https://github.com/ZhengdiYu/SignAvatars) - 70,000+ ASL videos with SMPL-X 3D pose data
- [How2Sign](https://how2sign.github.io/) - 80+ hours of ASL with 3D pose subset
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html) - Real-time hand tracking from video
