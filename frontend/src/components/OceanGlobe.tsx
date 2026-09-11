"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { LocationResolved, SSTResult, ChlorophyllResult } from "../lib/types";
import { Waves, Thermometer, Sparkles, Activity, Eye, Compass } from "lucide-react";

interface OceanGlobeProps {
  location: LocationResolved | null;
  sstResult: SSTResult | null;
  chlorophyllResult: ChlorophyllResult | null;
  presentationMode?: boolean;
}

type VisualLayer = "composite" | "sst" | "algae" | "waves";

export const OceanGlobe: React.FC<OceanGlobeProps> = ({
  location,
  sstResult,
  chlorophyllResult,
  presentationMode: _unusedPresentationMode = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<VisualLayer>("composite");
  const [waveHeightScale, setWaveHeightScale] = useState<number>(1.0);
  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    temp: number;
    chla: number;
    waveH: number;
    visible: boolean;
  }>({ x: 0, y: 0, temp: 16.5, chla: 2.8, waveH: 1.4, visible: false });

  // Base values from props or realistic marine defaults
  const baseSST = sstResult?.latest?.value_c ?? 17.8;
  const baseChl = chlorophyllResult?.latest?.chlorophyll_mg_m3 ?? 3.4;
  const targetName = location?.location_name ?? "Coastal Marine Observatory";

  const sceneRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    oceanMesh: THREE.Mesh;
    oceanMaterial: THREE.ShaderMaterial;
    particleSystem: THREE.Points;
    buoyGroup: THREE.Group;
    sonarMarker: THREE.Mesh;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    controls: {
      isDragging: boolean;
      prevX: number;
      prevY: number;
      rotX: number;
      rotY: number;
      targetRotX: number;
      targetRotY: number;
      zoom: number;
    };
  } | null>(null);

  // Sync layer changes into shader uniforms
  useEffect(() => {
    if (sceneRefs.current?.oceanMaterial) {
      let layerCode = 0; // composite
      if (activeLayer === "sst") layerCode = 1;
      if (activeLayer === "algae") layerCode = 2;
      if (activeLayer === "waves") layerCode = 3;
      sceneRefs.current.oceanMaterial.uniforms.uLayer.value = layerCode;
    }
  }, [activeLayer]);

  // Sync SST & Chl-a updates into uniforms
  useEffect(() => {
    if (sceneRefs.current?.oceanMaterial) {
      sceneRefs.current.oceanMaterial.uniforms.uBaseSST.value = baseSST;
      sceneRefs.current.oceanMaterial.uniforms.uBaseChl.value = baseChl;
    }
  }, [baseSST, baseChl]);

  // Sync wave height scale
  useEffect(() => {
    if (sceneRefs.current?.oceanMaterial) {
      sceneRefs.current.oceanMaterial.uniforms.uWaveHeight.value = 4.2 * waveHeightScale;
    }
  }, [waveHeightScale]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Fog Setup (Deep Abyssal Blue)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020813, 0.0035);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.5, 1200);
    camera.position.set(0, 75, 140);
    camera.lookAt(0, -10, 0);

    // 3. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Custom Gerstner Ocean Wave + SST Thermal + Algal Bloom Shader
    const oceanGeo = new THREE.PlaneGeometry(280, 280, 180, 180);
    oceanGeo.rotateX(-Math.PI / 2);

    const oceanMaterial = new THREE.ShaderMaterial({
      wireframe: false,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uWaveHeight: { value: 4.2 * waveHeightScale },
        uLayer: { value: activeLayer === "composite" ? 0 : activeLayer === "sst" ? 1 : activeLayer === "algae" ? 2 : 3 },
        uBaseSST: { value: baseSST },
        uBaseChl: { value: baseChl },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uWaveHeight;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vElevation;
        varying float vTemperature;
        varying float vAlgaeConcentration;

        // Gerstner Wave Formula
        vec3 gerstner(vec3 p, float steepness, float wavelength, vec2 dir, float time, inout vec3 tangent, inout vec3 binormal) {
          float k = 2.0 * 3.14159265 / wavelength;
          float c = sqrt(9.8 / k);
          vec2 d = normalize(dir);
          float f = k * (dot(d, p.xz) - c * time * 0.85);
          float a = steepness / k;

          tangent += vec3(-d.x * d.x * (steepness * sin(f)), d.x * (steepness * cos(f)), -d.x * d.y * (steepness * sin(f)));
          binormal += vec3(-d.x * d.y * (steepness * sin(f)), d.y * (steepness * cos(f)), -d.y * d.y * (steepness * sin(f)));

          return vec3(d.x * (a * cos(f)), a * sin(f), d.y * (a * cos(f)));
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          vec3 tangent = vec3(1.0, 0.0, 0.0);
          vec3 binormal = vec3(0.0, 0.0, 1.0);

          // Synthesize primary swells & secondary chop
          vec3 waveOffset = vec3(0.0);
          waveOffset += gerstner(pos, 0.35, 60.0, vec2(1.0, 0.4), uTime * 1.1, tangent, binormal);
          waveOffset += gerstner(pos, 0.25, 34.0, vec2(0.3, 1.0), uTime * 1.3, tangent, binormal);
          waveOffset += gerstner(pos, 0.18, 18.0, vec2(-0.7, 0.6), uTime * 1.6, tangent, binormal);
          waveOffset += gerstner(pos, 0.12, 9.0, vec2(0.8, -0.5), uTime * 2.1, tangent, binormal);

          pos += waveOffset * (uWaveHeight * 0.28);
          vElevation = pos.y;

          vec3 norm = normalize(cross(binormal, tangent));
          vNormal = norm;
          vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

          // SST Gradient: Coastal upwelling cold tongue on western edge, warm stratified pool on eastern offshore
          float sstSpatialVariation = sin(pos.x * 0.015 + 0.4) * 2.8 + cos(pos.z * 0.018) * 1.6;
          vTemperature = sstSpatialVariation;

          // Algae / Chlorophyll Concentration: High in nutrient-rich coastal thermal convergence
          float chlaSpatial = sin(pos.x * 0.035 + uTime * 0.1) * cos(pos.z * 0.03 + uTime * 0.08);
          vAlgaeConcentration = clamp(0.5 + 0.5 * chlaSpatial + 0.3 * sin(pos.x * 0.08), 0.0, 1.0);

          gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform int uLayer; // 0: Composite, 1: SST, 2: Algae, 3: Waves
        uniform float uBaseSST;
        uniform float uBaseChl;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vElevation;
        varying float vTemperature;
        varying float vAlgaeConcentration;

        // Color ramp functions
        vec3 getSSTColor(float t) {
          // Cold upwelling (13°C) -> Mild (16°C) -> Stratified Warm (21°C+)
          vec3 coldBlue = vec3(0.02, 0.15, 0.38);
          vec3 mildCyan = vec3(0.0, 0.72, 0.85);
          vec3 warmAmber = vec3(0.96, 0.62, 0.08);
          vec3 hotCrimson = vec3(0.92, 0.18, 0.18);

          float norm = clamp((t - 13.0) / 9.0, 0.0, 1.0);
          if (norm < 0.35) {
            return mix(coldBlue, mildCyan, norm / 0.35);
          } else if (norm < 0.7) {
            return mix(mildCyan, warmAmber, (norm - 0.35) / 0.35);
          } else {
            return mix(warmAmber, hotCrimson, (norm - 0.7) / 0.3);
          }
        }

        vec3 getAlgaeColor(float conc, float baseVal) {
          // Oligotrophic clear blue -> Mesotrophic turquoise -> Eutrophic Bloom Fluorescent Green
          vec3 deepOcean = vec3(0.01, 0.08, 0.18);
          vec3 bioTeal = vec3(0.04, 0.58, 0.52);
          vec3 bloomGreen = vec3(0.0, 1.0, 0.55); // Fluorescent chlorophyll emission
          vec3 toxicGlow = vec3(0.2, 0.95, 0.1);

          float level = clamp(conc * (baseVal / 3.5), 0.0, 1.5);
          if (level < 0.4) {
            return mix(deepOcean, bioTeal, level / 0.4);
          } else if (level < 0.9) {
            return mix(bioTeal, bloomGreen, (level - 0.4) / 0.5);
          } else {
            return mix(bloomGreen, toxicGlow, clamp((level - 0.9) / 0.6, 0.0, 1.0));
          }
        }

        void main() {
          vec3 lightDir = normalize(vec3(0.4, 0.85, 0.5));
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 normal = normalize(vNormal);

          // Diffuse + Specular Crest Glint
          float diff = max(dot(normal, lightDir), 0.0);
          vec3 halfVector = normalize(lightDir + viewDir);
          float spec = pow(max(dot(normal, halfVector), 0.0), 48.0) * 1.8;

          // Wave crest foam calculation
          float foam = smoothstep(1.8, 3.8, vElevation);

          float effectiveTemp = uBaseSST + vTemperature;
          vec3 sstCol = getSSTColor(effectiveTemp);
          vec3 algaeCol = getAlgaeColor(vAlgaeConcentration, uBaseChl);

          vec3 finalColor = vec3(0.0);

          if (uLayer == 0) {
            // COMPOSITE: Deep thermal gradient base + glowing algae bloom plumes + foam crests
            vec3 oceanBase = mix(sstCol * 0.65, algaeCol, clamp(vAlgaeConcentration * 0.75, 0.0, 0.85));
            finalColor = oceanBase * (diff * 0.7 + 0.35);
            // Add fluorescent chlorophyll radiance
            finalColor += algaeCol * 0.28 * vAlgaeConcentration;
            // Add foam crests
            finalColor = mix(finalColor, vec3(0.85, 0.96, 1.0), foam * 0.65);
            // Add specular sun glint
            finalColor += vec3(0.9, 0.98, 1.0) * spec * 0.7;
          } else if (uLayer == 1) {
            // SST THERMAL ISOTHERMS: Pure thermal color mapping + temperature contour pulse
            float isotherm = abs(fract(effectiveTemp * 0.8) - 0.5);
            float contourLine = smoothstep(0.06, 0.0, isotherm);
            finalColor = sstCol * (diff * 0.5 + 0.5);
            finalColor += vec3(1.0, 1.0, 1.0) * contourLine * 0.35;
            finalColor = mix(finalColor, vec3(1.0), foam * 0.4);
            finalColor += vec3(1.0) * spec * 0.5;
          } else if (uLayer == 2) {
            // ALGAL BLOOM (CHLOROPHYLL): Fluorescent biological concentration field
            finalColor = algaeCol * (diff * 0.4 + 0.6);
            finalColor += vec3(0.0, 1.0, 0.6) * pow(vAlgaeConcentration, 2.0) * 0.45;
            finalColor = mix(finalColor, vec3(0.7, 1.0, 0.85), foam * 0.5);
            finalColor += vec3(0.6, 1.0, 0.8) * spec * 0.6;
          } else {
            // PHYSICAL WAVES & DYNAMICS: Deep navy oceanic fluid with high-contrast foam
            vec3 oceanNavy = vec3(0.02, 0.09, 0.22);
            vec3 waveCrestAqua = vec3(0.0, 0.75, 0.88);
            finalColor = mix(oceanNavy, waveCrestAqua, clamp((vElevation + 2.0) / 5.0, 0.0, 1.0));
            finalColor = finalColor * (diff * 0.8 + 0.3);
            finalColor = mix(finalColor, vec3(0.95, 0.98, 1.0), foam * 0.85);
            finalColor += vec3(1.0) * spec * 0.9;
          }

          // Depth / Fresnel Atmospheric Fade
          float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
          finalColor += vec3(0.0, 0.6, 0.8) * fresnel * 0.35;

          gl_FragColor = vec4(finalColor, 0.96);
        }
      `,
    });

    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMaterial);
    scene.add(oceanMesh);

    // 5. Floating Bioluminescent Phytoplankton Particle Swarm
    const particleCount = 2200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const px = (Math.random() - 0.5) * 260;
      const pz = (Math.random() - 0.5) * 260;
      const py = 1.0 + Math.random() * 4.5;

      particlePositions[i * 3] = px;
      particlePositions[i * 3 + 1] = py;
      particlePositions[i * 3 + 2] = pz;

      // Chlorophyll emerald to bioluminescent cyan colors
      const isToxic = Math.random() > 0.45;
      if (isToxic) {
        particleColors[i * 3] = 0.0;
        particleColors[i * 3 + 1] = 1.0;
        particleColors[i * 3 + 2] = 0.55; // Fluorescent green
      } else {
        particleColors[i * 3] = 0.0;
        particleColors[i * 3 + 1] = 0.88;
        particleColors[i * 3 + 2] = 1.0; // Cyan bio-glow
      }
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 6. Floating Oceanographic Research Buoy (Moored Telemetry Sounder)
    const buoyGroup = new THREE.Group();
    
    // Hull
    const hullGeo = new THREE.CylinderGeometry(2.4, 3.2, 1.8, 16);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Scientific safety yellow
      metalness: 0.3,
      roughness: 0.4,
    });
    const buoyHull = new THREE.Mesh(hullGeo, hullMat);
    buoyGroup.add(buoyHull);

    // Mast
    const mastGeo = new THREE.CylinderGeometry(0.2, 0.25, 5.5, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 });
    const buoyMast = new THREE.Mesh(mastGeo, mastMat);
    buoyMast.position.y = 3.2;
    buoyGroup.add(buoyMast);

    // Flashing Strobe Beacon on Buoy
    const beaconGeo = new THREE.SphereGeometry(0.6, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const buoyBeacon = new THREE.Mesh(beaconGeo, beaconMat);
    buoyBeacon.position.y = 6.2;
    buoyGroup.add(buoyBeacon);

    // Sounding cable into ocean depth
    const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, 30, 6);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.35 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.y = -15;
    buoyGroup.add(cable);

    buoyGroup.position.set(22, 0, -15);
    scene.add(buoyGroup);

    // 7. Interactive Sonar Probe Target Ring
    const sonarGeo = new THREE.RingGeometry(2.8, 3.6, 32);
    sonarGeo.rotateX(-Math.PI / 2);
    const sonarMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const sonarMarker = new THREE.Mesh(sonarGeo, sonarMat);
    sonarMarker.visible = false;
    scene.add(sonarMarker);

    // 8. Lights Setup
    const ambientLight = new THREE.AmbientLight(0x0a2240, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x70d6ff, 2.5);
    dirLight.position.set(80, 120, 60);
    scene.add(dirLight);

    const secondaryLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    secondaryLight.position.set(-80, 60, -80);
    scene.add(secondaryLight);

    // 9. Interactive Camera Orbit Controls
    const controls = {
      isDragging: false,
      prevX: 0,
      prevY: 0,
      rotX: 0.42,
      rotY: 0.15,
      targetRotX: 0.42,
      targetRotY: 0.15,
      zoom: 155,
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      controls.isDragging = true;
      controls.prevX = e.clientX;
      controls.prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (controls.isDragging) {
        const dx = e.clientX - controls.prevX;
        const dy = e.clientY - controls.prevY;
        controls.prevX = e.clientX;
        controls.prevY = e.clientY;

        controls.targetRotY -= dx * 0.006;
        controls.targetRotX = Math.max(0.18, Math.min(1.2, controls.targetRotX - dy * 0.005));
      }
    };

    const onMouseUp = () => {
      controls.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      controls.zoom = Math.max(65, Math.min(260, controls.zoom + e.deltaY * 0.14));
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    sceneRefs.current = {
      scene,
      camera,
      renderer,
      oceanMesh,
      oceanMaterial,
      particleSystem,
      buoyGroup,
      sonarMarker,
      raycaster,
      mouse,
      controls,
    };

    // 10. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update shader wave time
      oceanMaterial.uniforms.uTime.value = elapsed;

      // Smooth camera interpolation
      controls.rotX += (controls.targetRotX - controls.rotX) * 0.08;
      controls.rotY += (controls.targetRotY - controls.rotY) * 0.08;

      const camDist = controls.zoom;
      camera.position.x = camDist * Math.sin(controls.rotY) * Math.cos(controls.rotX);
      camera.position.y = camDist * Math.sin(controls.rotX);
      camera.position.z = camDist * Math.cos(controls.rotY) * Math.cos(controls.rotX);
      camera.lookAt(0, -5, 0);

      // Float and bob the research buoy on the wave surface
      const bx = buoyGroup.position.x;
      const bz = buoyGroup.position.z;
      // Approximate primary wave elevation at buoy coordinates
      const buoyWaveY =
        Math.sin(bx * 0.08 + elapsed * 1.6) * 1.8 +
        Math.cos(bz * 0.07 + elapsed * 1.4) * 1.4;
      buoyGroup.position.y = buoyWaveY * (waveHeightScale * 0.9);
      buoyGroup.rotation.z = Math.sin(elapsed * 1.4) * 0.12;
      buoyGroup.rotation.x = Math.cos(elapsed * 1.6) * 0.1;

      // Pulse beacon strobe
      const strobe = (Math.sin(elapsed * 4.5) + 1.0) * 0.5;
      (buoyBeacon.material as THREE.MeshBasicMaterial).color.setRGB(
        strobe * 0.2,
        0.8 + strobe * 0.2,
        1.0
      );

      // Animate floating microalgae particles with current eddies
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const pArray = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        // Swirl in surface eddies
        pArray[idx] += Math.sin(pArray[idx + 2] * 0.03 + elapsed * 0.4) * 0.06;
        pArray[idx + 2] += Math.cos(pArray[idx] * 0.03 + elapsed * 0.4) * 0.06;

        // Bob with waves
        pArray[idx + 1] = 1.2 + Math.sin(pArray[idx] * 0.06 + elapsed * 1.8) * 1.5;

        // Wrap around boundaries
        if (pArray[idx] > 130) pArray[idx] = -130;
        if (pArray[idx] < -130) pArray[idx] = 130;
        if (pArray[idx + 2] > 130) pArray[idx + 2] = -130;
        if (pArray[idx + 2] < -130) pArray[idx + 2] = 130;
      }
      posAttr.needsUpdate = true;

      // Raycast mouse cursor onto the ocean waves for Sonar Sonde
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(oceanMesh);

      if (intersects.length > 0) {
        const hit = intersects[0].point;
        sonarMarker.position.set(hit.x, hit.y + 0.3, hit.z);
        sonarMarker.visible = true;

        // Sonar ring expansion
        const scale = 1.0 + (elapsed % 1.2) * 0.8;
        sonarMarker.scale.set(scale, scale, scale);
        (sonarMarker.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1.0 - (elapsed % 1.2));

        // Derive local physical readings at this exact coordinate
        const localTemp = baseSST + Math.sin(hit.x * 0.015 + 0.4) * 2.8 + Math.cos(hit.z * 0.018) * 1.6;
        const localChl = Math.max(0.4, baseChl * (0.8 + 0.5 * Math.sin(hit.x * 0.035 + hit.z * 0.03)));
        const localWave = Math.abs(hit.y) + 1.2;

        setHoverData({
          x: Math.round(hit.x),
          y: Math.round(hit.z),
          temp: parseFloat(localTemp.toFixed(2)),
          chla: parseFloat(localChl.toFixed(2)),
          waveH: parseFloat(localWave.toFixed(2)),
          visible: true,
        });
      } else {
        sonarMarker.visible = false;
        setHoverData((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      }

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

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-b from-[#020813] via-[#031326] to-[#01060e] rounded-xl overflow-hidden border border-ocean-800/80 shadow-2xl flex flex-col select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* TOP-LEFT: Coastal Mission Sector & Ocean Telemetry HUD */}
      <div className="absolute top-3.5 left-3.5 z-10 glass-panel px-4 py-3 rounded-lg border-l-2 border-l-bioglow-cyan shadow-xl animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-bioglow-cyan animate-pulse"></span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-bioglow-cyan font-bold">
            3D OCEAN SURFACE SIMULATOR
          </span>
        </div>
        <p className="text-sm font-semibold text-white tracking-wide mt-0.5 font-mono">
          {targetName}
        </p>
        <p className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
          <span>NOAA-INCOIS MOORED BUOY TELEMETRY</span>
          <span className="text-emerald-400 font-semibold">• LIVE SOUNDING</span>
        </p>

        {/* Real-time Environmental Values */}
        <div className="mt-2.5 pt-2.5 border-t border-ocean-700/60 grid grid-cols-3 gap-3 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase flex items-center gap-1">
              <Thermometer className="w-2.5 h-2.5 text-amber-400" />
              SST THERMAL
            </span>
            <span className="text-amber-400 font-bold mt-0.5">
              {baseSST.toFixed(1)}°C
              {sstResult?.anomaly && (
                <span className="text-[10px] ml-1 text-slate-300">
                  ({sstResult.anomaly.value_c > 0 ? "+" : ""}{sstResult.anomaly.value_c}°C)
                </span>
              )}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-bioglow-aqua" />
              CHL-A ALGAE
            </span>
            <span className="text-emerald-400 font-bold mt-0.5">
              {baseChl.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">mg/m³</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase flex items-center gap-1">
              <Waves className="w-2.5 h-2.5 text-bioglow-cyan" />
              SWELL HT (Hs)
            </span>
            <span className="text-bioglow-cyan font-bold mt-0.5">
              {(1.8 * waveHeightScale).toFixed(1)} m
            </span>
          </div>
        </div>
      </div>

      {/* TOP-RIGHT: Dynamic Sonar Sonde Probe (Tracks Hover Coordinates) */}
      {hoverData.visible && (
        <div className="absolute top-3.5 right-3.5 z-10 glass-panel px-3 py-2 rounded-lg border border-bioglow-cyan/40 shadow-2xl font-mono text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-bioglow-cyan font-bold text-[10px] uppercase tracking-wider">
            <Activity className="w-3 h-3 animate-spin text-bioglow-cyan" />
            SONAR SONDE PROBE
          </div>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-200">
            <div>
              <span className="text-slate-400 text-[10px]">TEMP:</span>{" "}
              <span className="text-amber-400 font-bold">{hoverData.temp}°C</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">CHL-A:</span>{" "}
              <span className="text-emerald-400 font-bold">{hoverData.chla} mg/m³</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">WAVE:</span>{" "}
              <span className="text-bioglow-cyan font-bold">{hoverData.waveH}m</span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM-LEFT & BOTTOM-RIGHT: Multi-Layer Ocean Visualizer Controls */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-10 text-xs font-mono pointer-events-auto">
        {/* Layer Selectors: Composite vs SST vs Algae vs Waves */}
        <div className="flex items-center gap-1 bg-ocean-950/85 backdrop-blur-md p-1 rounded-lg border border-ocean-800 shadow-xl">
          <button
            onClick={() => setActiveLayer("composite")}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeLayer === "composite"
                ? "bg-bioglow-cyan/20 text-bioglow-cyan font-semibold border border-bioglow-cyan/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>COMPOSITE</span>
          </button>

          <button
            onClick={() => setActiveLayer("sst")}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeLayer === "sst"
                ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>SEA TEMP (SST)</span>
          </button>

          <button
            onClick={() => setActiveLayer("algae")}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeLayer === "algae"
                ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>ALGAE BLOOM</span>
          </button>

          <button
            onClick={() => setActiveLayer("waves")}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              activeLayer === "waves"
                ? "bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-sky-400" />
            <span>WAVE DYNAMICS</span>
          </button>
        </div>

        {/* Wave Height Choppiness Slider & Navigation Hint */}
        <div className="flex items-center gap-3 bg-ocean-950/85 backdrop-blur-md px-3 py-1 rounded-lg border border-ocean-800 shadow-xl">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="text-[10px] text-slate-400">SWELL INTENSITY:</span>
            <button
              onClick={() => setWaveHeightScale(0.6)}
              className={`px-1.5 py-0.5 text-[10px] rounded ${waveHeightScale === 0.6 ? "bg-ocean-700 text-white font-bold" : "text-slate-400 hover:text-white"}`}
            >
              CALM
            </button>
            <button
              onClick={() => setWaveHeightScale(1.0)}
              className={`px-1.5 py-0.5 text-[10px] rounded ${waveHeightScale === 1.0 ? "bg-ocean-700 text-white font-bold" : "text-slate-400 hover:text-white"}`}
            >
              MOD
            </button>
            <button
              onClick={() => setWaveHeightScale(1.6)}
              className={`px-1.5 py-0.5 text-[10px] rounded ${waveHeightScale === 1.6 ? "bg-ocean-700 text-white font-bold" : "text-slate-400 hover:text-white"}`}
            >
              SWELL
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-400 border-l border-ocean-700/60 pl-2.5">
            <Compass className="w-3 h-3 text-bioglow-cyan" />
            <span>DRAG TO ORBIT · SCROLL TO ZOOM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

