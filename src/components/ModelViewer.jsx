// Interactive 3D specimen viewer (React Three Fiber).
// Loaded lazily, so three.js is only downloaded when someone opens a model.
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Lightformer, useProgress } from '@react-three/drei';
import { SpecimenModel, ModelErrorBoundary } from './three/SpecimenModel.jsx';
import { Reset as ResetIcon, Spin as SpinIcon, Sun as SunIcon, Expand as ExpandIcon, Shrink as ShrinkIcon } from './Icons.jsx';

function Studio() {
  // Procedural environment (no network fetch) so glossy specimens catch soft highlights.
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer intensity={2.2} position={[0, 4, 2]} scale={[6, 2, 1]} />
      <Lightformer intensity={1.2} position={[-4, 1, -2]} rotation-y={Math.PI / 2} scale={[4, 3, 1]} />
      <Lightformer intensity={0.8} position={[4, -1, 1]} rotation-y={-Math.PI / 2} scale={[4, 3, 1]} />
    </Environment>
  );
}

function Progress() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <div className="viewer-overlay" aria-live="polite">
      <div className="progress">
        <span>Loading 3D scan… {Math.round(progress)}%</span>
        <div className="bar"><span style={{ width: `${progress}%` }} /></div>
      </div>
    </div>
  );
}

export default function ModelViewer({ src, title, onError }) {
  const wrapRef = useRef(null);
  const controlsRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [flat, setFlat] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [pseudo, setPseudo] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const markLoaded = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // iPhone Safari has no element fullscreen API — fall back to a fixed overlay.
  useEffect(() => {
    if (!pseudo) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setPseudo(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [pseudo]);

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (document.fullscreenEnabled && el?.requestFullscreen) {
      if (document.fullscreenElement) document.exitFullscreen();
      else el.requestFullscreen().catch(() => setPseudo((v) => !v));
    } else {
      setPseudo((v) => !v);
    }
  };

  const reset = () => {
    setAutoRotate(false);
    controlsRef.current?.reset();
  };

  const isFull = fullscreen || pseudo;

  return (
    <div
      ref={wrapRef}
      className={`viewer${pseudo ? ' is-pseudo-fullscreen' : ''}`}
      role="region"
      aria-label={`Interactive 3D model of ${title}`}
    >
      <Canvas
        camera={{ position: [0.6, 1.2, 4.7], fov: 38, near: 0.01, far: 100 }}
        dpr={[1, 2]}
        frameloop={autoRotate ? 'always' : 'demand'}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        onPointerDown={() => setInteracted(true)}
        onWheel={() => setInteracted(true)}
      >
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#fff8ec', '#2a2620', 0.6]} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} />
        <ModelErrorBoundary onError={onError}>
          <Suspense fallback={null}>
            <SpecimenModel url={src} flat={flat} onLoaded={markLoaded} />
            <Studio />
          </Suspense>
        </ModelErrorBoundary>
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          minDistance={0.6}
          maxDistance={12}
          enablePan
          screenSpacePanning
        />
      </Canvas>

      <Progress />

      {loaded && (
        <div className={`viewer-hint${interacted ? ' is-hidden' : ''}`} aria-hidden="true">
          <span className="long">Drag to rotate · scroll to zoom · right-drag to pan</span>
          <span className="short">Drag to rotate · pinch to zoom</span>
        </div>
      )}

      <div className="viewer-toolbar" role="toolbar" aria-label="3D viewer controls">
        <button type="button" className="vbtn" onClick={reset} title="Reset view">
          <ResetIcon /><span className="vlabel">Reset</span>
        </button>
        <button type="button" className="vbtn" aria-pressed={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Auto-rotate">
          <SpinIcon /><span className="vlabel">Rotate</span>
        </button>
        <button
          type="button" className="vbtn" aria-pressed={flat} onClick={() => setFlat((v) => !v)}
          title={flat ? 'Showing the scan’s own colours — click for studio lighting' : 'Show the scan’s own colours without added lighting'}
        >
          <SunIcon /><span className="vlabel">{flat ? 'Scan colours' : 'Studio light'}</span>
        </button>
        <button type="button" className="vbtn" onClick={toggleFullscreen} title={isFull ? 'Exit fullscreen' : 'Fullscreen'}>
          {isFull ? <ShrinkIcon /> : <ExpandIcon />}<span className="vlabel">{isFull ? 'Exit' : 'Fullscreen'}</span>
        </button>
      </div>
    </div>
  );
}
