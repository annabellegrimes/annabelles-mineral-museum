// Interactive 3D specimen viewer (React Three Fiber).
// Loaded lazily, so three.js is only downloaded when someone opens a model.
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Lightformer, useProgress } from '@react-three/drei';
import { Box3, Vector3, MeshBasicMaterial, DoubleSide } from 'three';
import { Reset as ResetIcon, Spin as SpinIcon, Sun as SunIcon, Expand as ExpandIcon, Shrink as ShrinkIcon } from './Icons.jsx';

const FIT_SIZE = 2; // models are scaled so their largest dimension is 2 units

function Model({ url, flat, onLoaded }) {
  const { scene } = useGLTF(url); // Draco + meshopt decoding supported
  const invalidate = useThree((s) => s.invalidate);

  // Normalise position & scale: Polycam exports can be in any orientation / units.
  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const s = FIT_SIZE / (Math.max(size.x, size.y, size.z) || 1);
    return { scale: s, offset: center.multiplyScalar(-s) };
  }, [scene]);

  // "Scan colours" mode: show the baked photographic texture without extra shading.
  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (!o.isMesh) return;
      o.userData.original ??= o.material;
      const orig = o.userData.original;
      if (flat) {
        o.userData.flat ??= new MeshBasicMaterial({
          map: orig.map ?? null,
          color: orig.color ?? 0xffffff,
          vertexColors: !!orig.vertexColors,
          transparent: !!orig.transparent,
          opacity: orig.opacity ?? 1,
          alphaTest: orig.alphaTest ?? 0,
          side: DoubleSide,
        });
        o.material = o.userData.flat;
      } else {
        o.material = orig;
      }
    });
    invalidate();
  }, [scene, flat, invalidate]);

  useEffect(() => { onLoaded?.(); }, [onLoaded]);

  return (
    <group scale={scale} position={offset}>
      <primitive object={scene} />
    </group>
  );
}

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

class Boundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { this.props.onError?.(error); }
  render() { return this.state.error ? null : this.props.children; }
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
        <Boundary onError={onError}>
          <Suspense fallback={null}>
            <Model url={src} flat={flat} onLoaded={() => setLoaded(true)} />
            <Studio />
          </Suspense>
        </Boundary>
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
