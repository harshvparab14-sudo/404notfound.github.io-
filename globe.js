// globe.js — renders a glowing node-and-arc globe using Three.js (ES module, loaded via CDN import map)
import * as THREE from 'three';

export function initGlobe(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const RADIUS = 3;

  // --- Faint wireframe sphere shell ---
  const shellGeo = new THREE.SphereGeometry(RADIUS, 24, 18);
  const shellMat = new THREE.MeshBasicMaterial({
    color: 0x1c4d44,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });
  globeGroup.add(new THREE.Mesh(shellGeo, shellMat));

  // --- Point cloud (fibonacci sphere distribution) ---
  const POINT_COUNT = 900;
  const positions = new Float32Array(POINT_COUNT * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const nodePositions = [];

  for (let i = 0; i < POINT_COUNT; i++) {
    const y = 1 - (i / (POINT_COUNT - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    positions[i * 3] = x * RADIUS;
    positions[i * 3 + 1] = y * RADIUS;
    positions[i * 3 + 2] = z * RADIUS;
    nodePositions.push(new THREE.Vector3(x * RADIUS, y * RADIUS, z * RADIUS));
  }

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pointsMat = new THREE.PointsMaterial({
    color: 0x6fe3c4,
    size: 0.035,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  globeGroup.add(new THREE.Points(pointsGeo, pointsMat));

  // --- Arcs connecting random "career data" nodes ---
  const ARC_COUNT = 14;
  const arcMat = new THREE.LineBasicMaterial({
    color: 0xc9a15a,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending
  });
  const arcs = [];

  function randomNode() {
    return nodePositions[Math.floor(Math.random() * nodePositions.length)];
  }

  for (let i = 0; i < ARC_COUNT; i++) {
    const a = randomNode();
    const b = randomNode();
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.setLength(RADIUS * 1.4);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const curvePoints = curve.getPoints(40);
    const geo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const line = new THREE.Line(geo, arcMat.clone());
    line.userData.pulsePhase = Math.random() * Math.PI * 2;
    globeGroup.add(line);
    arcs.push(line);
  }

  // --- Small glowing "active node" markers ---
  const markerGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  for (let i = 0; i < 10; i++) {
    const p = randomNode();
    const m = new THREE.Mesh(markerGeo, markerMat.clone());
    m.position.copy(p);
    m.userData.pulsePhase = Math.random() * Math.PI * 2;
    globeGroup.add(m);
    arcs.push(m); // reuse pulse loop
  }

  globeGroup.position.x = 1.6; // sit toward the right side, behind the paper card
  globeGroup.rotation.z = 0.35;

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    globeGroup.rotation.y = t * 0.12;

    arcs.forEach((obj) => {
      const phase = obj.userData.pulsePhase || 0;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + phase);
      if (obj.material) obj.material.opacity = obj.isLine ? 0.25 + pulse * 0.5 : 0.4 + pulse * 0.6;
    });

    renderer.render(scene, camera);
  }
  animate();
}
