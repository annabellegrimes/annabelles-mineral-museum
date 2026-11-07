// 3D specimens on the gallery page.
//
// Browsers allow only a handful of WebGL contexts per page, so instead of one
// canvas per card there is ONE transparent canvas fixed over the viewport, and
// each card is a drei <View> into it (scissored to the card's plate). Cards that
// are offscreen aren't drawn, and models only load once a card scrolls near.
// Loaded lazily with three.js, so the photo-only gallery stays light.
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { View, PerspectiveCamera } from '@react-three/drei';
import { SpecimenModel, ModelErrorBoundary } from './three/SpecimenModel.jsx';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Re-render on scroll/resize when the frame loop is idle (reduced-motion mode). */
function InvalidateOnScroll() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const on = () => invalidate();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, [invalidate]);
  return null;
}

export function GalleryCanvas() {
  const still = reducedMotion();
  return (
    <Canvas
      className="gallery-canvas"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      frameloop={still ? 'demand' : 'always'}
    >
      <View.Port />
      {still && <InvalidateOnScroll />}
    </Canvas>
  );
}

// Plates are 4:5. Camera distance chosen so a unit bounding sphere fits the
// plate width with a little breathing room, looking slightly down at the rock.
const FOV = 30;
const DIST = 4.2;
const TILT = (16 * Math.PI) / 180;

function Camera() {
  const ref = useRef();
  useLayoutEffect(() => { ref.current?.lookAt(0, 0, 0); }, []);
  return (
    <PerspectiveCamera
      ref={ref}
      makeDefault
      fov={FOV}
      near={0.05}
      far={50}
      position={[0, Math.sin(TILT) * DIST, Math.cos(TILT) * DIST]}
    />
  );
}

function Turntable({ hovered, phase, children }) {
  const ref = useRef();
  const still = reducedMotion();
  useFrame((_, dt) => {
    if (!ref.current || still) return;
    ref.current.rotation.y += Math.min(dt, 0.05) * (hovered ? 0.9 : 0.3);
  });
  return <group ref={ref} rotation-y={phase}>{children}</group>;
}

/** Stable per-specimen starting angle so the cards don't all face the same way. */
const phaseFor = (id) => ([...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 628) / 100;

export function CardModel({ src, id, hovered, onLoaded, onError }) {
  return (
    <View className="plate-view">
      <Camera />
      <ambientLight intensity={0.85} />
      <hemisphereLight args={['#fff8ec', '#3a3328', 0.55]} />
      <directionalLight position={[2.5, 4, 3.5]} intensity={1.25} />
      <directionalLight position={[-3, 1.5, -2]} intensity={0.35} />
      <ModelErrorBoundary onError={onError}>
        <Suspense fallback={null}>
          <Turntable hovered={hovered} phase={phaseFor(id)}>
            <SpecimenModel url={src} fit="sphere" size={1} onLoaded={onLoaded} />
          </Turntable>
        </Suspense>
      </ModelErrorBoundary>
    </View>
  );
}
