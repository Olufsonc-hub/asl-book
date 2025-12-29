// ASL Hand Viewer - Three.js 3D Hand Visualization
// Proof of concept for ASL sign visualization

let scene, camera, renderer, controls;
let hand;
let fingers = {};
let showJoints = true;
let isMirrored = false;

// Hand dimensions (relative units)
const PALM_WIDTH = 1.0;
const PALM_HEIGHT = 1.2;
const PALM_DEPTH = 0.25;

// Finger segment lengths [metacarpal, proximal, middle, distal]
const FINGER_LENGTHS = {
    thumb:  [0.4, 0.35, 0.3, 0.0],  // Thumb has no distal segment in our model
    index:  [0.5, 0.45, 0.3, 0.25],
    middle: [0.5, 0.5, 0.35, 0.25],
    ring:   [0.5, 0.45, 0.3, 0.25],
    pinky:  [0.5, 0.35, 0.25, 0.2]
};

const FINGER_WIDTHS = {
    thumb: 0.15,
    index: 0.12,
    middle: 0.13,
    ring: 0.12,
    pinky: 0.1
};

// Finger positions on palm (x offset from center)
const FINGER_POSITIONS = {
    thumb:  -0.55,
    index:  -0.32,
    middle: -0.08,
    ring:   0.18,
    pinky:  0.42
};

// Materials
let skinMaterial, jointMaterial;

// ASL Pose definitions (curl values 0-100 for each finger)
const POSES = {
    'open': { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
    'fist': { thumb: 80, index: 100, middle: 100, ring: 100, pinky: 100 },
    'point': { thumb: 80, index: 0, middle: 100, ring: 100, pinky: 100 },
    'asl-a': { thumb: 30, index: 100, middle: 100, ring: 100, pinky: 100 },
    'asl-b': { thumb: 100, index: 0, middle: 0, ring: 0, pinky: 0 },
    'asl-c': { thumb: 40, index: 50, middle: 50, ring: 50, pinky: 50 },
    'asl-i-love-you': { thumb: 0, index: 0, middle: 100, ring: 100, pinky: 0 }
};

// Current pose state
let currentPose = { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 };
let targetPose = { ...currentPose };

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    const container = document.getElementById('canvas-container');
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(2, 2, 3);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.5, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    // Materials
    skinMaterial = new THREE.MeshPhongMaterial({
        color: 0xffdbac,
        shininess: 30
    });

    jointMaterial = new THREE.MeshPhongMaterial({
        color: 0xff6b6b,
        shininess: 50
    });

    // Create hand
    createHand();

    // Add grid helper
    const gridHelper = new THREE.GridHelper(4, 10, 0x444444, 0x333333);
    scene.add(gridHelper);

    // Event listeners
    setupEventListeners();

    // Start animation
    animate();
}

function createHand() {
    hand = new THREE.Group();

    // Create palm
    const palmGeometry = new THREE.BoxGeometry(PALM_WIDTH, PALM_HEIGHT, PALM_DEPTH);
    const palm = new THREE.Mesh(palmGeometry, skinMaterial);
    palm.position.y = PALM_HEIGHT / 2;
    palm.castShadow = true;
    hand.add(palm);

    // Create fingers
    createFinger('thumb', FINGER_POSITIONS.thumb, PALM_HEIGHT * 0.3, -Math.PI / 6);
    createFinger('index', FINGER_POSITIONS.index, PALM_HEIGHT * 0.95, 0);
    createFinger('middle', FINGER_POSITIONS.middle, PALM_HEIGHT, 0);
    createFinger('ring', FINGER_POSITIONS.ring, PALM_HEIGHT * 0.95, 0);
    createFinger('pinky', FINGER_POSITIONS.pinky, PALM_HEIGHT * 0.85, 0);

    scene.add(hand);
}

function createFinger(name, xOffset, yOffset, baseAngle) {
    const lengths = FINGER_LENGTHS[name];
    const width = FINGER_WIDTHS[name];

    // Create finger group hierarchy
    const fingerBase = new THREE.Group();
    fingerBase.position.set(xOffset, yOffset, PALM_DEPTH / 2);
    fingerBase.rotation.z = baseAngle;

    if (name === 'thumb') {
        fingerBase.rotation.x = -Math.PI / 8;
    }

    hand.add(fingerBase);

    // Store finger joints for animation
    fingers[name] = {
        base: fingerBase,
        joints: []
    };

    let currentGroup = fingerBase;
    const jointNames = ['metacarpal', 'proximal', 'middle', 'distal'];

    for (let i = 0; i < lengths.length; i++) {
        if (lengths[i] === 0) continue;

        // Create joint group
        const jointGroup = new THREE.Group();

        if (i > 0) {
            jointGroup.position.y = lengths[i - 1];
        }

        currentGroup.add(jointGroup);

        // Create bone segment
        const boneGeometry = new THREE.CylinderGeometry(
            width * 0.9,  // top radius
            width,        // bottom radius
            lengths[i],   // height
            8             // segments
        );
        const bone = new THREE.Mesh(boneGeometry, skinMaterial);
        bone.position.y = lengths[i] / 2;
        bone.castShadow = true;
        jointGroup.add(bone);

        // Create joint sphere (except for fingertip)
        if (i < lengths.length - 1 && lengths[i + 1] > 0) {
            const jointGeometry = new THREE.SphereGeometry(width * 1.1, 8, 8);
            const joint = new THREE.Mesh(jointGeometry, jointMaterial);
            joint.position.y = lengths[i];
            joint.visible = showJoints;
            jointGroup.add(joint);
            fingers[name].joints.push({ group: jointGroup, sphere: joint });
        } else {
            fingers[name].joints.push({ group: jointGroup, sphere: null });
        }

        // Create fingertip (rounded end)
        if (i === lengths.length - 1 || (i < lengths.length - 1 && lengths[i + 1] === 0)) {
            const tipGeometry = new THREE.SphereGeometry(width * 0.9, 8, 8);
            const tip = new THREE.Mesh(tipGeometry, skinMaterial);
            tip.position.y = lengths[i];
            tip.castShadow = true;
            jointGroup.add(tip);
        }

        currentGroup = jointGroup;
    }
}

function updateFingerCurl(fingerName, curlPercent) {
    const finger = fingers[fingerName];
    if (!finger) return;

    // Convert percentage to radians (0% = straight, 100% = fully curled ~90 degrees per joint)
    const maxCurl = Math.PI / 2;
    const curlAngle = (curlPercent / 100) * maxCurl;

    // Apply curl to each joint (except base)
    finger.joints.forEach((joint, index) => {
        if (index === 0 && fingerName !== 'thumb') {
            // Metacarpal has less curl
            joint.group.rotation.x = curlAngle * 0.2;
        } else {
            joint.group.rotation.x = curlAngle;
        }
    });
}

function setPose(poseName) {
    const pose = POSES[poseName];
    if (!pose) return;

    targetPose = { ...pose };

    // Update UI buttons
    document.querySelectorAll('.pose-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pose === poseName);
    });

    // Update sliders
    Object.keys(pose).forEach(finger => {
        const slider = document.getElementById(`${finger}-curl`);
        if (slider) {
            slider.value = pose[finger];
            slider.nextElementSibling.textContent = `${pose[finger]}%`;
        }
    });
}

function animatePose() {
    const speed = 0.15;
    let needsUpdate = false;

    Object.keys(currentPose).forEach(finger => {
        if (Math.abs(currentPose[finger] - targetPose[finger]) > 0.5) {
            currentPose[finger] += (targetPose[finger] - currentPose[finger]) * speed;
            needsUpdate = true;
        } else {
            currentPose[finger] = targetPose[finger];
        }
        updateFingerCurl(finger, currentPose[finger]);
    });

    return needsUpdate;
}

function toggleJoints(show) {
    showJoints = show;
    Object.values(fingers).forEach(finger => {
        finger.joints.forEach(joint => {
            if (joint.sphere) {
                joint.sphere.visible = show;
            }
        });
    });
}

function toggleMirror(mirror) {
    isMirrored = mirror;
    hand.scale.x = mirror ? -1 : 1;
}

function resetView() {
    camera.position.set(2, 2, 3);
    controls.target.set(0, 0.5, 0);
    controls.update();
}

function setupEventListeners() {
    // Pose buttons
    document.querySelectorAll('.pose-btn').forEach(btn => {
        btn.addEventListener('click', () => setPose(btn.dataset.pose));
    });

    // Finger sliders
    ['thumb', 'index', 'middle', 'ring', 'pinky'].forEach(finger => {
        const slider = document.getElementById(`${finger}-curl`);
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            targetPose[finger] = value;
            e.target.nextElementSibling.textContent = `${value}%`;

            // Deactivate pose buttons when manually adjusting
            document.querySelectorAll('.pose-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        });
    });

    // Options
    document.getElementById('show-joints').addEventListener('change', (e) => {
        toggleJoints(e.target.checked);
    });

    document.getElementById('mirror-hand').addEventListener('change', (e) => {
        toggleMirror(e.target.checked);
    });

    // Reset view button
    document.getElementById('reset-view').addEventListener('click', resetView);

    // Window resize
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Smooth pose animation
    animatePose();

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
