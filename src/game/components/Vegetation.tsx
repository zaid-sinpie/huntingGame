import React, { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { trees, rocks, grassClusters } from '../terrain/obstacles';

export const Vegetation: React.FC = () => {
  // Tree trunks
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  // Pine foliage (3 stacked tiers)
  const foliageTier1Ref = useRef<THREE.InstancedMesh>(null);
  const foliageTier2Ref = useRef<THREE.InstancedMesh>(null);
  const foliageTier3Ref = useRef<THREE.InstancedMesh>(null);

  // Rocks
  const rocksRef = useRef<THREE.InstancedMesh>(null);

  // Grass / Wildflowers
  const grassRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();

    // 1. Setup Instanced Trees
    if (trunkRef.current && foliageTier1Ref.current && foliageTier2Ref.current && foliageTier3Ref.current) {
      trees.forEach((tree, idx) => {
        const s = tree.scale;

        // Trunk
        dummy.position.set(tree.x, tree.y + 1.8 * s, tree.z);
        dummy.rotation.set(0, tree.rotation, 0);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        trunkRef.current!.setMatrixAt(idx, dummy.matrix);

        // Foliage Tier 1 (Bottom)
        dummy.position.set(tree.x, tree.y + 3.2 * s, tree.z);
        dummy.rotation.set(0, tree.rotation, 0);
        dummy.scale.set(s * 1.3, s * 1.1, s * 1.3);
        dummy.updateMatrix();
        foliageTier1Ref.current!.setMatrixAt(idx, dummy.matrix);

        // Foliage Tier 2 (Middle)
        dummy.position.set(tree.x, tree.y + 5.2 * s, tree.z);
        dummy.rotation.set(0, tree.rotation + 0.8, 0);
        dummy.scale.set(s * 1.05, s * 1.0, s * 1.05);
        dummy.updateMatrix();
        foliageTier2Ref.current!.setMatrixAt(idx, dummy.matrix);

        // Foliage Tier 3 (Top)
        dummy.position.set(tree.x, tree.y + 7.0 * s, tree.z);
        dummy.rotation.set(0, tree.rotation + 1.6, 0);
        dummy.scale.set(s * 0.75, s * 0.9, s * 0.75);
        dummy.updateMatrix();
        foliageTier3Ref.current!.setMatrixAt(idx, dummy.matrix);
      });

      trunkRef.current.instanceMatrix.needsUpdate = true;
      foliageTier1Ref.current.instanceMatrix.needsUpdate = true;
      foliageTier2Ref.current.instanceMatrix.needsUpdate = true;
      foliageTier3Ref.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Setup Instanced Rocks
    if (rocksRef.current) {
      rocks.forEach((rock, idx) => {
        dummy.position.set(rock.x, rock.y, rock.z);
        dummy.rotation.set(rock.rotation[0], rock.rotation[1], rock.rotation[2]);
        dummy.scale.set(rock.scale[0], rock.scale[1], rock.scale[2]);
        dummy.updateMatrix();
        rocksRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      rocksRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Setup Instanced Grass Tufts
    if (grassRef.current) {
      grassClusters.forEach((g, idx) => {
        dummy.position.set(g.x, g.y, g.z);
        dummy.rotation.set(0, g.rotation, 0);
        dummy.scale.set(g.scale, g.scale, g.scale);
        dummy.updateMatrix();
        grassRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      grassRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  return (
    <group>
      {/* Tree Trunks */}
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, trees.length]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.22, 0.35, 3.8, 8]} />
        <meshStandardMaterial color="#422919" roughness={0.9} />
      </instancedMesh>

      {/* Pine Needles Tier 1 */}
      <instancedMesh
        ref={foliageTier1Ref}
        args={[undefined, undefined, trees.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[2.2, 3.4, 7]} />
        <meshStandardMaterial color="#1e3a1f" roughness={0.8} />
      </instancedMesh>

      {/* Pine Needles Tier 2 */}
      <instancedMesh
        ref={foliageTier2Ref}
        args={[undefined, undefined, trees.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[1.7, 3.0, 7]} />
        <meshStandardMaterial color="#254826" roughness={0.8} />
      </instancedMesh>

      {/* Pine Needles Tier 3 (Crown) */}
      <instancedMesh
        ref={foliageTier3Ref}
        args={[undefined, undefined, trees.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[1.2, 2.6, 7]} />
        <meshStandardMaterial color="#2d572e" roughness={0.78} />
      </instancedMesh>

      {/* Boulders / Mountain Rocks */}
      <instancedMesh
        ref={rocksRef}
        args={[undefined, undefined, rocks.length]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1.0, 1]} />
        <meshStandardMaterial color="#555a5c" roughness={0.92} metalness={0.05} />
      </instancedMesh>

      {/* Grass Tufts & Reeds */}
      <instancedMesh
        ref={grassRef}
        args={[undefined, undefined, grassClusters.length]}
        receiveShadow
      >
        <coneGeometry args={[0.6, 1.2, 4]} />
        <meshStandardMaterial color="#4a7330" roughness={0.85} />
      </instancedMesh>
    </group>
  );
};
