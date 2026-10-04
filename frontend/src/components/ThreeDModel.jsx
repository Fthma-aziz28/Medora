import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

function AnimatedSphere() {
    const meshRef = useRef();
    
    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        meshRef.current.rotation.y = time * 0.2;
        meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.2;
    });

    return (
        <Sphere args={[1, 100, 200]} ref={meshRef} scale={2}>
            <MeshDistortMaterial 
                color="#051F20" 
                attach="material" 
                distort={0.4} 
                speed={2} 
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
}

export default function ThreeDModel() {
    return (
        <div style={{ height: '300px', width: '100%', borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.2)' }}>
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 5, 2]} intensity={1} />
                <AnimatedSphere />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}
