// Shared loader for specimen scans, used by the full viewer and the gallery cards.
import { Component, useEffect, useLayoutEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Sphere, Vector3, MeshBasicMaterial, DoubleSide } from 'three';

/**
 * Loads a GLB, centres it, and scales it to a predictable size:
 *  fit="box"    → largest dimension = `size`
 *  fit="sphere" → bounding-sphere radius = `size` (stays in frame while turning)
 * Each instance works on a clone, so the gallery and viewer never fight over one scene graph.
 */
export function SpecimenModel({ url, fit = 'box', size = 2, flat = false, onLoaded }) {
  const { scene: original } = useGLTF(url); // Draco + meshopt decoding supported
  const scene = useMemo(() => original.clone(true), [original]);
  const invalidate = useThree((s) => s.invalidate);

  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const center = box.getCenter(new Vector3());
    let s;
    if (fit === 'sphere') {
      const sphere = box.getBoundingSphere(new Sphere());
      s = size / (sphere.radius || 1);
    } else {
      const dims = box.getSize(new Vector3());
      s = size / (Math.max(dims.x, dims.y, dims.z) || 1);
    }
    return { scale: s, offset: center.multiplyScalar(-s) };
  }, [scene, fit, size]);

  // "Scan colours" mode: show the captured texture without added shading.
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

/** Catches model load/parse failures so one bad scan can't take down the page. */
export class ModelErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { this.props.onError?.(error); }
  render() { return this.state.error ? null : this.props.children; }
}
