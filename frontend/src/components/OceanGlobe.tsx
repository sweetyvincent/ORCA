"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { LocationResolved, SSTResult, ChlorophyllResult } from "../lib/types";
import { Compass } from "lucide-react";

interface OceanGlobeProps {
  location: LocationResolved | null;
  sstResult: SSTResult | null;
  chlorophyllResult: ChlorophyllResult | null;
  presentationMode?: boolean;
}

export const OceanGlobe: React.FC<OceanGlobeProps> = ({
  location,
  sstResult,
  chlorophyllResult,
  presentationMode: _unusedPresentationMode = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<"composite" | "sst" | "chlorophyll">("composite");
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    globeGroup: THREE.Group;
    targetMarker: THREE.Mesh;
    scanRing: THREE.Mesh;
    targetRotation: { x: number; y: number };
    currentRotation: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02060b, 0.002);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Earth Ocean Sphere
    const sphereRadius = 75;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
    
    // Procedural deep ocean shader material
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x051326,
      emissive: 0x020a14,
      specular: 0x00f0ff,
      shininess: 30,
      wireframe: false,
      transparent: true,
      opacity: 0.94,
    });
    const globeMesh = new THREE.Mesh(sphereGeo, globeMat);
    globeGroup.add(globeMesh);

    // 2. Graticule Lines (Scientific Latitude/Longitude Grid)
    const wireGeo = new THREE.SphereGeometry(sphereRadius + 0.2, 36, 18);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // 3. Atmospheric Glow
    const atmosGeo = new THREE.SphereGeometry(sphereRadius + 4, 48, 48);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(0.0, 0.94, 1.0, 1.0) * intensity * 0.8;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // 4. Observation Particle Swarm (representing satellite telemetry tracks)
    const particleCount = 1400;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = sphereRadius + 0.8 + Math.random() * 2.5;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation between cyan and aqua
      const isAqua = Math.random() > 0.4;
      colors[i * 3] = isAqua ? 0.0 : 0.0;
      colors[i * 3 + 1] = isAqua ? 0.9 : 0.95;
      colors[i * 3 + 2] = isAqua ? 0.64 : 1.0;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particlePoints);

    // 5. Target Location Marker & Expanding Scan Ring
    const markerGeo = new THREE.SphereGeometry(1.6, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const targetMarker = new THREE.Mesh(markerGeo, markerMat);
    targetMarker.visible = false;
    globeGroup.add(targetMarker);

    const ringGeo = new THREE.RingGeometry(2.2, 3.8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const scanRing = new THREE.Mesh(ringGeo, ringMat);
    scanRing.visible = false;
    globeGroup.add(scanRing);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0c2545, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.8);
    dirLight1.position.set(120, 80, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x0077fe, 1.2);
    dirLight2.position.set(-100, -60, -80);
    scene.add(dirLight2);

    // Interaction handlers
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;
      if (sceneRef.current) {
        sceneRef.current.currentRotation.y = globeGroup.rotation.y;
        sceneRef.current.currentRotation.x = globeGroup.rotation.x;
        sceneRef.current.targetRotation.y = globeGroup.rotation.y;
        sceneRef.current.targetRotation.x = globeGroup.rotation.x;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(140, Math.min(320, camera.position.z + e.deltaY * 0.15));
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      globeGroup,
      targetMarker,
      scanRing,
      targetRotation: { x: 0.2, y: 0.0 },
      currentRotation: { x: 0.2, y: 0.0 },
    };

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Slow orbital drift if not manually dragging
      if (!isDragging) {
        // Smooth camera tween towards target rotation
        const ref = sceneRef.current;
        if (ref) {
          ref.currentRotation.x += (ref.targetRotation.x - ref.currentRotation.x) * 0.05;
          ref.currentRotation.y += (ref.targetRotation.y - ref.currentRotation.y) * 0.05;
          globeGroup.rotation.x = ref.currentRotation.x;
          globeGroup.rotation.y = ref.currentRotation.y;
        } else {
          globeGroup.rotation.y += delta * 0.04;
        }
      }

      // Animate scan ring pulse
      if (scanRing.visible) {
        const scale = 1.0 + (elapsed % 1.6) * 1.5;
        scanRing.scale.set(scale, scale, 1);
        (scanRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 - (elapsed % 1.6) * 0.6);
      }

      // Particle subtle shimmer
      particlePoints.rotation.y += delta * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    const currentMount = mountRef.current;
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("wheel", onWheel);
      renderer.dispose();
      if (currentMount) {
        currentMount.innerHTML = "";
      }
    };
  }, []);

  // Update target coordinates and animate camera to target
  useEffect(() => {
    if (!sceneRef.current || !location) return;

    const { targetMarker, scanRing, targetRotation } = sceneRef.current;
    const sphereRadius = 75;

    // Convert Lat/Lon to 3D Cartesian coordinates
    const phi = (90 - location.latitude) * (Math.PI / 180);
    const theta = (location.longitude + 180) * (Math.PI / 180);

    const x = -(sphereRadius + 0.5) * Math.sin(phi) * Math.cos(theta);
    const z = (sphereRadius + 0.5) * Math.sin(phi) * Math.sin(theta);
    const y = (sphereRadius + 0.5) * Math.cos(phi);

    targetMarker.position.set(x, y, z);
    targetMarker.visible = true;

    scanRing.position.set(x * 1.01, y * 1.01, z * 1.01);
    scanRing.lookAt(x * 2, y * 2, z * 2);
    scanRing.visible = true;

    // Animate target rotation so target faces the camera directly
    const targetRotY = -theta - Math.PI / 2;
    const targetRotX = phi - Math.PI / 2;

    targetRotation.x = targetRotX;
    targetRotation.y = targetRotY;
  }, [location]);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-gradient-to-b from-ocean-950 via-ocean-900 to-ocean-950 rounded-xl overflow-hidden border border-ocean-800/80 shadow-2xl flex flex-col">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Target Coordinates Overlay Badge */}
      {location && (
        <div className="absolute top-4 left-4 z-10 glass-panel px-3.5 py-2.5 rounded-lg border-l-2 border-l-bioglow-cyan animate-in fade-in slide-in-from-left duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bioglow-cyan animate-ping"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-bioglow-cyan font-bold">
              TARGET RESOLVED
            </span>
          </div>
          <p className="text-sm font-semibold text-white tracking-wide mt-0.5 font-mono">
            {location.location_name}
          </p>
          <p className="text-[11px] font-mono text-slate-400">
            {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E · {location.coastal_zone || "Coastal Marine"}
          </p>

          {/* Real-time Telemetry Metrics on Target */}
          {(sstResult?.latest || chlorophyllResult?.latest) && (
            <div className="mt-2 pt-2 border-t border-ocean-700/60 flex items-center gap-3 text-xs font-mono">
              {sstResult?.latest && (
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase">SST OISST</span>
                  <span className="text-bioglow-cyan font-bold">
                    {sstResult.latest.value_c}°C
                    {sstResult.anomaly && (
                      <span className="text-[10px] ml-1 text-slate-300">
                        ({sstResult.anomaly.value_c > 0 ? "+" : ""}{sstResult.anomaly.value_c}°C)
                      </span>
                    )}
                  </span>
                </div>
              )}
              {chlorophyllResult?.latest && (
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase">CHL-A VIIRS</span>
                  <span className="text-bioglow-aqua font-bold">
                    {chlorophyllResult.latest.chlorophyll_mg_m3} mg/m³
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Layer Selector & Controls */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 text-xs font-mono pointer-events-auto">
        <div className="flex items-center gap-1 bg-ocean-950/80 backdrop-blur-md p-1 rounded-lg border border-ocean-800">
          <button
            onClick={() => setActiveLayer("composite")}
            className={`px-2.5 py-1 rounded transition-all ${
              activeLayer === "composite"
                ? "bg-bioglow-cyan/20 text-bioglow-cyan font-semibold border border-bioglow-cyan/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            COMPOSITE
          </button>
          <button
            onClick={() => setActiveLayer("sst")}
            className={`px-2.5 py-1 rounded transition-all ${
              activeLayer === "sst"
                ? "bg-bioglow-cyan/20 text-bioglow-cyan font-semibold border border-bioglow-cyan/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            SST THERMAL
          </button>
          <button
            onClick={() => setActiveLayer("chlorophyll")}
            className={`px-2.5 py-1 rounded transition-all ${
              activeLayer === "chlorophyll"
                ? "bg-bioglow-aqua/20 text-bioglow-aqua font-semibold border border-bioglow-aqua/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            CHL-A BIOMASS
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-ocean-950/70 backdrop-blur-md px-2.5 py-1 rounded border border-ocean-800">
          <Compass className="w-3.5 h-3.5 text-bioglow-cyan" />
          <span>DRAG TO ROTATE · SCROLL TO ZOOM</span>
        </div>
      </div>
    </div>
  );
};
