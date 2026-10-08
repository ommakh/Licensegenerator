import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SVGRenderer } from "three/examples/jsm/renderers/SVGRenderer.js";
import { BoxCFTReport, BoxComponentItem, BoxDimensions, BoxTypeId, CameraPresetView } from "../types";
import { toInches } from "../lib/cftCalculator";
import { createContactShadowTexture, createCrateStampTexture, createProceduralWoodTexture } from "../lib/textures";

interface Box3DViewerProps {
  report: BoxCFTReport;
  dims: BoxDimensions;
  boxType: BoxTypeId;
  lidOpenAngle: number; // 0 (closed) to 1 (fully open)
  explodeFactor: number; // 0 (assembled) to 1 (fully exploded)
  showDimensions: boolean;
  hasPlywoodTop?: boolean;
  deckMode?: "full_slat" | "only_blocks"; // Full Slat vs Only Blocks selection
  appliedTextureUrl?: string | null;
  cameraPreset?: CameraPresetView | null;
  onHoverComponent?: (comp: BoxComponentItem | null) => void;
  onDoubleClickComponent?: (comp: BoxComponentItem | null) => void;
}

export const Box3DViewer: React.FC<Box3DViewerProps> = ({
  report,
  dims,
  boxType,
  lidOpenAngle,
  explodeFactor,
  showDimensions,
  hasPlywoodTop = false,
  deckMode = "full_slat",
  appliedTextureUrl,
  cameraPreset,
  onHoverComponent,
  onDoubleClickComponent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHover, setActiveHover] = useState<BoxComponentItem | null>(null);
  const [isSoftwareRenderer, setIsSoftwareRenderer] = useState<boolean>(false);

  const onHoverRef = useRef(onHoverComponent);
  onHoverRef.current = onHoverComponent;

  const onDoubleClickRef = useRef(onDoubleClickComponent);
  onDoubleClickRef.current = onDoubleClickComponent;

  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer | SVGRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    boxRoot: THREE.Group;
    explodedRoot: THREE.Group;
    lidGroup: THREE.Group;
    dimRoot: THREE.Group;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    interactableMeshes: Array<THREE.Mesh & { compData?: BoxComponentItem; originalMat?: THREE.Material }>;
    hoveredMesh: (THREE.Mesh & { originalMat?: THREE.Material }) | null;
    woodMat: THREE.MeshStandardMaterial;
    accentWoodMat: THREE.MeshStandardMaterial;
    skidMat: THREE.MeshStandardMaterial;
    blockMat: THREE.MeshStandardMaterial;
    plyMat: THREE.MeshStandardMaterial;
    stampMat: THREE.MeshStandardMaterial;
    highlightMat: THREE.MeshStandardMaterial;
    currentLidAngle: number;
    targetLidAngle: number;
    currentExplode: number;
    targetExplode: number;
    reqId: number;
  } | null>(null);

  // Initialize Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    let renderer: THREE.WebGLRenderer | SVGRenderer;
    let usingSoftware = false;

    try {
      const webglRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
      });
      webglRenderer.debug.checkShaderErrors = false; // Prevents false VALIDATE_STATUS 1282 errors in virtualized/container WebGL
      webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      webglRenderer.setSize(width, height);
      webglRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      webglRenderer.toneMappingExposure = 1.15;
      renderer = webglRenderer;
    } catch (err) {
      console.warn("Hardware WebGL unavailable or disabled in current environment. Using 3D Vector Software Renderer.", err);
      const svgRenderer = new SVGRenderer();
      svgRenderer.setSize(width, height);
      svgRenderer.overdraw = 0.5;
      renderer = svgRenderer;
      usingSoftware = true;
      setIsSoftwareRenderer(true);
    }

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f8fafc");

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.8, 3.2, 4.4);

    const controls = new OrbitControls(camera, renderer.domElement as unknown as HTMLElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 25;
    controls.minDistance = 1;
    controls.target.set(0, 0.6, 0);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8ee, 1.3);
    dirLight.position.set(6, 10, 7);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xdde8f5, 0.7);
    fillLight.position.set(-6, 5, -5);
    scene.add(fillLight);

    // Soft Ground Contact Shadow (Bulletproof on all WebGL contexts without depth-pass overhead)
    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.005;
    if (usingSoftware) {
      shadowPlane.visible = false;
    }
    scene.add(shadowPlane);

    // Materials
    const woodTex = createProceduralWoodTexture("#d6b588", "#9f7949");
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.72,
      metalness: 0.04,
      color: 0xf5dfb8,
    });

    const accentTex = createProceduralWoodTexture("#c49f6f", "#8a6639");
    const accentWoodMat = new THREE.MeshStandardMaterial({
      map: accentTex,
      roughness: 0.68,
      metalness: 0.05,
      color: 0xedd0a4,
    });

    const skidMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.85,
      metalness: 0.02,
      color: 0xd4b27c,
    });

    const blockMat = new THREE.MeshStandardMaterial({
      roughness: 0.9,
      metalness: 0.02,
      color: 0x966838,
    });

    const plyMat = new THREE.MeshStandardMaterial({
      map: accentTex,
      roughness: 0.65,
      color: 0xf1dfc7,
    });

    const stampTex = createCrateStampTexture();
    const stampMat = new THREE.MeshStandardMaterial({
      map: stampTex,
      roughness: 0.7,
      color: 0xf5dfb8,
    });

    const highlightMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.55,
      roughness: 0.3,
    });

    // Groups
    const boxRoot = new THREE.Group();
    scene.add(boxRoot);

    const explodedRoot = new THREE.Group();
    boxRoot.add(explodedRoot);

    const lidGroup = new THREE.Group();
    explodedRoot.add(lidGroup);

    const dimRoot = new THREE.Group();
    scene.add(dimRoot);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    threeRef.current = {
      renderer,
      scene,
      camera,
      controls,
      boxRoot,
      explodedRoot,
      lidGroup,
      dimRoot,
      raycaster,
      mouse,
      interactableMeshes: [],
      hoveredMesh: null,
      woodMat,
      accentWoodMat,
      skidMat,
      blockMat,
      plyMat,
      stampMat,
      highlightMat,
      currentLidAngle: 0,
      targetLidAngle: 0,
      currentExplode: 0,
      targetExplode: 0,
      reqId: 0,
    };

    // Hover Mouse Events
    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMouseLeave = () => {
      mouse.x = -999;
      mouse.y = -999;
      if (threeRef.current?.hoveredMesh) {
        threeRef.current.hoveredMesh.material = threeRef.current.hoveredMesh.originalMat!;
        threeRef.current.hoveredMesh = null;
      }
      setActiveHover(null);
      if (onHoverRef.current) onHoverRef.current(null);
    };

    // Double-click to open editable L×B×H/T modal
    const onDoubleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clickMouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(clickMouse, camera);
      const intersects = raycaster.intersectObjects(threeRef.current?.interactableMeshes || [], false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh & { compData?: BoxComponentItem };
        if (hit.compData) {
          if (onDoubleClickRef.current) onDoubleClickRef.current(hit.compData);
          return;
        }
      }
      if (onDoubleClickRef.current) onDoubleClickRef.current(null);
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseleave", onMouseLeave);
    renderer.domElement.addEventListener("dblclick", onDoubleClick);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Render loop
    const animate = () => {
      const state = threeRef.current;
      if (!state) return;

      state.currentLidAngle += (state.targetLidAngle - state.currentLidAngle) * 0.12;
      state.lidGroup.rotation.x = -state.currentLidAngle * (Math.PI * 0.65);

      controls.update();

      // Raycasting for interactive hover
      if (state.mouse.x !== -999 && state.interactableMeshes.length > 0) {
        state.raycaster.setFromCamera(state.mouse, camera);
        const intersects = state.raycaster.intersectObjects(state.interactableMeshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh & { compData?: BoxComponentItem; originalMat?: THREE.Material };
          if (hit !== state.hoveredMesh) {
            if (state.hoveredMesh && state.hoveredMesh.originalMat) {
              state.hoveredMesh.material = state.hoveredMesh.originalMat;
            }
            state.hoveredMesh = hit;
            hit.material = state.highlightMat;
            if (hit.compData) {
              setActiveHover(hit.compData);
              if (onHoverRef.current) onHoverRef.current(hit.compData);
            }
          }
        } else {
          if (state.hoveredMesh && state.hoveredMesh.originalMat) {
            state.hoveredMesh.material = state.hoveredMesh.originalMat;
            state.hoveredMesh = null;
          }
          setActiveHover(null);
          if (onHoverRef.current) onHoverRef.current(null);
        }
      }

      renderer.render(scene, camera);
      state.reqId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(threeRef.current?.reqId || 0);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseleave", onMouseLeave);
      renderer.domElement.removeEventListener("dblclick", onDoubleClick);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if ("dispose" in renderer && typeof renderer.dispose === "function") {
        renderer.dispose();
      }
      threeRef.current = null;
    };
  }, []);

  // Update Lid and Explode targets
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;
    state.targetLidAngle = lidOpenAngle;
    state.targetExplode = explodeFactor;
  }, [lidOpenAngle, explodeFactor]);

  // Camera Presets
  useEffect(() => {
    if (!cameraPreset) return;
    const state = threeRef.current;
    if (!state) return;
    const { camera, controls } = state;
    const lIn = toInches(dims.length, dims.unit);
    const wIn = toInches(dims.width, dims.unit);
    const hIn = toInches(dims.height, dims.unit);
    const maxDim = Math.max(lIn, wIn, hIn, 12);
    const dist = 4.2 * (maxDim / 36);

    controls.target.set(0, 0.6, 0);

    if (cameraPreset === "FRONT") {
      camera.position.set(0, 0.7, dist);
    } else if (cameraPreset === "BACK") {
      camera.position.set(0, 0.7, -dist);
    } else if (cameraPreset === "LEFT") {
      camera.position.set(-dist, 0.7, 0);
    } else if (cameraPreset === "RIGHT") {
      camera.position.set(dist, 0.7, 0);
    } else if (cameraPreset === "TOP") {
      camera.position.set(0, dist * 1.3, 0.001);
    } else if (cameraPreset === "ISO") {
      camera.position.set(dist * 0.75, dist * 0.65, dist * 0.85);
    }
    controls.update();
  }, [cameraPreset, dims]);

  // Build Geometry dynamically when dims, boxType, report.components, deckMode, or explodeFactor change
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;

    const {
      explodedRoot,
      lidGroup,
      dimRoot,
      woodMat,
      accentWoodMat,
      skidMat,
      blockMat,
      plyMat,
      stampMat,
    } = state;

    // Clear old meshes
    while (explodedRoot.children.length > 0) {
      explodedRoot.remove(explodedRoot.children[0]);
    }
    while (lidGroup.children.length > 0) {
      lidGroup.remove(lidGroup.children[0]);
    }
    explodedRoot.add(lidGroup);

    while (dimRoot.children.length > 0) {
      dimRoot.remove(dimRoot.children[0]);
    }
    state.interactableMeshes = [];
    state.hoveredMesh = null;

    const lIn = toInches(dims.length, dims.unit);
    const wIn = toInches(dims.width, dims.unit);
    const hIn = toInches(dims.height, dims.unit);

    const maxDimIn = Math.max(lIn, wIn, hIn, 12);
    const worldScale = 2.4 / maxDimIn;

    const L = lIn * worldScale;
    const W = wIn * worldScale;
    const H = hIn * worldScale;
    const exp = explodeFactor;

    // Helper: Register a mesh with its exact component data
    const registerPart = (mesh: THREE.Mesh, comp?: BoxComponentItem | null) => {
      if (!comp) return;
      (mesh as any).compData = comp;
      (mesh as any).originalMat = mesh.material;
      state.interactableMeshes.push(mesh as any);
    };

    // Helper: Find component by ID or Category
    const findComp = (id: string, cat?: string) => {
      return (
        report.components.find((c) => c.id === id) ||
        (cat ? report.components.find((c) => c.category === cat) : undefined)
      );
    };

    // =========================================================================
    // TYPE 1: 4-WAY INDUSTRIAL BLOCK PALLET
    // =========================================================================
    if (boxType === "type1_block_pallet") {
      const runnerComp = findComp("pal_runners", "RUNNERS_SKIDS");
      const blockComp = findComp("pal_blocks", "SPACER_BLOCKS");
      const stringerComp = findComp("pal_stringers", "BATTENS_CLEATS");
      const slatComp = findComp("pal_top_slats", "DECK_SLATS");

      const runnerTh = (runnerComp ? toInches(runnerComp.thickness, dims.unit) : 1.0) * worldScale;
      const runnerW = (runnerComp ? toInches(runnerComp.width, dims.unit) : 4.0) * worldScale;
      const runnerL = (runnerComp ? toInches(runnerComp.length, dims.unit) : lIn) * worldScale;

      const blockL = (blockComp ? toInches(blockComp.length, dims.unit) : 4.0) * worldScale;
      const blockW = (blockComp ? toInches(blockComp.width, dims.unit) : 4.0) * worldScale;
      const blockH = (blockComp ? toInches(blockComp.thickness, dims.unit) : 3.5) * worldScale;

      const stringerTh = (stringerComp ? toInches(stringerComp.thickness, dims.unit) : 1.25) * worldScale;
      const stringerW = (stringerComp ? toInches(stringerComp.width, dims.unit) : 3.5) * worldScale;
      const stringerL = (stringerComp ? toInches(stringerComp.length, dims.unit) : lIn) * worldScale;

      const slatTh = (slatComp ? toInches(slatComp.thickness, dims.unit) : 0.85) * worldScale;
      const slatW = (slatComp ? toInches(slatComp.width, dims.unit) : 4.0) * worldScale;

      // 1. Bottom Runner Boards (Render only if present in components)
      const runnerQty = runnerComp && runnerComp.qty > 0 ? runnerComp.qty : 0;
      const runnerZ: number[] = [];

      if (runnerQty > 0) {
        const botRunnerGeo = new THREE.BoxGeometry(runnerL, runnerTh, runnerW);
        for (let i = 0; i < runnerQty; i++) {
          const fraction = runnerQty === 1 ? 0.5 : i / (runnerQty - 1);
          const z = -W / 2 + runnerW / 2 + fraction * (W - runnerW);
          runnerZ.push(z);

          const runner = new THREE.Mesh(botRunnerGeo, woodMat.clone());
          runner.position.set(0, runnerTh / 2 - exp * 0.45, z);
          runner.castShadow = true;
          runner.receiveShadow = true;
          explodedRoot.add(runner);
          registerPart(runner, runnerComp);
        }
      } else {
        runnerZ.push(-W / 2 + runnerW / 2, 0, W / 2 - runnerW / 2);
      }

      // 2. Solid Spacer Blocks (Render only if present in components)
      const blockQty = blockComp && blockComp.qty > 0 ? blockComp.qty : 0;
      if (blockQty > 0) {
        const blockGeo = new THREE.BoxGeometry(blockL, blockH, blockW);
        const blockY = runnerTh + blockH / 2;

        const linesCount = Math.max(1, runnerZ.length);
        const blocksPerLine = Math.max(1, Math.round(blockQty / linesCount));
        let blocksPlaced = 0;

        for (let lIdx = 0; lIdx < linesCount; lIdx++) {
          const z = runnerZ[lIdx];
          const countForThisLine = Math.min(blocksPerLine, blockQty - blocksPlaced);
          for (let bIdx = 0; bIdx < countForThisLine; bIdx++) {
            const fracX = countForThisLine === 1 ? 0.5 : bIdx / (countForThisLine - 1);
            const x = -L / 2 + blockL / 2 + fracX * (L - blockL);
            const block = new THREE.Mesh(blockGeo, blockMat.clone());
            block.position.set(x, blockY - exp * 0.2, z);
            block.castShadow = true;
            explodedRoot.add(block);
            registerPart(block, blockComp);
            blocksPlaced++;
            if (blocksPlaced >= blockQty) break;
          }
          if (blocksPlaced >= blockQty) break;
        }
      }

      // 3. Middle Stringer Battens (Render only if present in components)
      const stringerQty = stringerComp && stringerComp.qty > 0 ? stringerComp.qty : 0;
      if (stringerQty > 0) {
        const stringerGeo = new THREE.BoxGeometry(stringerL, stringerTh, stringerW);
        const stringerY = runnerTh + blockH + stringerTh / 2;
        for (let i = 0; i < stringerQty; i++) {
          const fraction = stringerQty === 1 ? 0.5 : i / (stringerQty - 1);
          const z = -W / 2 + stringerW / 2 + fraction * (W - stringerW);
          const stringer = new THREE.Mesh(stringerGeo, accentWoodMat.clone());
          stringer.position.set(0, stringerY + exp * 0.15, z);
          stringer.castShadow = true;
          explodedRoot.add(stringer);
          registerPart(stringer, stringerComp);
        }
      }

      // 4. Top Deck: FULL SLAT vs ONLY BLOCKS Option Selection
      const isOnlyBlocks = deckMode === "only_blocks";
      const topY = runnerTh + blockH + stringerTh + slatTh / 2;

      if (!isOnlyBlocks) {
        if (hasPlywoodTop) {
          const plyGeo = new THREE.BoxGeometry(L, slatTh, W);
          const plyMesh = new THREE.Mesh(plyGeo, plyMat.clone());
          plyMesh.position.set(0, topY + exp * 0.65, 0);
          plyMesh.castShadow = true;
          explodedRoot.add(plyMesh);
          registerPart(plyMesh, slatComp || report.components[0]);
        } else if (slatComp && slatComp.qty > 0) {
          const slatQty = slatComp.qty;
          const slatGeo = new THREE.BoxGeometry(slatW, slatTh, W);
          for (let i = 0; i < slatQty; i++) {
            const fraction = slatQty === 1 ? 0.5 : i / (slatQty - 1);
            const x = -L / 2 + slatW / 2 + fraction * (L - slatW);
            const slat = new THREE.Mesh(slatGeo, woodMat.clone());
            slat.position.set(x, topY + exp * 0.65, 0);
            slat.castShadow = true;
            explodedRoot.add(slat);
            registerPart(slat, slatComp);
          }
        }
      }
    }

    // =========================================================================
    // TYPE 2: PLYWOOD EXPORT PACKAGING BOX WITH BATTENS
    // =========================================================================
    else if (boxType === "type2_plywood_cleated") {
      const skidComp = findComp("ply_base_skids", "RUNNERS_SKIDS");
      const baseSheetComp = findComp("ply_base_sheet");
      const sidePanelComp = findComp("ply_side_panels", "SIDE_WALLS");
      const endPanelComp = findComp("ply_end_panels", "END_WALLS");
      const beltComp = findComp("ply_belt_cleats");
      const rimComp = findComp("ply_perimeter_battens", "BATTENS_CLEATS");
      const lidSheetComp = findComp("ply_lid_sheet", "LID_COVER");
      const lidCleatComp = findComp("ply_lid_cleats");

      const plyTh = 0.5 * worldScale;
      const skidH = (skidComp ? toInches(skidComp.thickness, dims.unit) : 3.0) * worldScale;
      const skidW = (skidComp ? toInches(skidComp.width, dims.unit) : 3.0) * worldScale;
      const battenW = 3.0 * worldScale;
      const battenTh = 0.75 * worldScale;
      const wallH = Math.max(0.1, H - skidH - 2 * plyTh);
      const sideY = skidH + plyTh + wallH / 2;

      // 1. Forklift Skid Runners
      if (skidComp && skidComp.qty > 0) {
        const skidGeo = new THREE.BoxGeometry(L, skidH, skidW);
        const qty = skidComp.qty;
        for (let i = 0; i < qty; i++) {
          const frac = qty === 1 ? 0.5 : i / (qty - 1);
          const z = -W / 2 + skidW / 2 + frac * (W - skidW);
          const skid = new THREE.Mesh(skidGeo, skidMat.clone());
          skid.position.set(0, skidH / 2 - exp * 0.5, z);
          skid.castShadow = true;
          explodedRoot.add(skid);
          registerPart(skid, skidComp);
        }
      }

      // 2. Base Floor Plywood Sheet
      if (baseSheetComp && baseSheetComp.qty > 0) {
        const botPlyGeo = new THREE.BoxGeometry(L, plyTh, W);
        const botPly = new THREE.Mesh(botPlyGeo, plyMat.clone());
        botPly.position.set(0, skidH + plyTh / 2 - exp * 0.2, 0);
        botPly.castShadow = true;
        explodedRoot.add(botPly);
        registerPart(botPly, baseSheetComp);
      }

      // 3. Side Wall Plywood Panels
      if (sidePanelComp && sidePanelComp.qty > 0) {
        const sidePlyGeo = new THREE.BoxGeometry(L, wallH, plyTh);
        // Front Panel
        const frontPly = new THREE.Mesh(sidePlyGeo, plyMat.clone());
        frontPly.position.set(0, sideY, W / 2 - plyTh / 2 + exp * 0.6);
        frontPly.castShadow = true;
        explodedRoot.add(frontPly);
        registerPart(frontPly, sidePanelComp);

        if (sidePanelComp.qty > 1) {
          // Back Panel
          const backPly = new THREE.Mesh(sidePlyGeo, plyMat.clone());
          backPly.position.set(0, sideY, -W / 2 + plyTh / 2 - exp * 0.6);
          backPly.castShadow = true;
          explodedRoot.add(backPly);
          registerPart(backPly, sidePanelComp);
        }
      }

      // 4. End Wall Plywood Panels
      if (endPanelComp && endPanelComp.qty > 0) {
        const endPlyGeo = new THREE.BoxGeometry(plyTh, wallH, W - 2 * plyTh);
        const leftPly = new THREE.Mesh(endPlyGeo, plyMat.clone());
        leftPly.position.set(-L / 2 + plyTh / 2 - exp * 0.6, sideY, 0);
        leftPly.castShadow = true;
        explodedRoot.add(leftPly);
        registerPart(leftPly, endPanelComp);

        if (endPanelComp.qty > 1) {
          const rightPly = new THREE.Mesh(endPlyGeo, plyMat.clone());
          rightPly.position.set(L / 2 - plyTh / 2 + exp * 0.6, sideY, 0);
          rightPly.castShadow = true;
          explodedRoot.add(rightPly);
          registerPart(rightPly, endPanelComp);
        }
      }

      // 5. Belt Cleats
      if (beltComp && beltComp.qty > 0) {
        const frontBeltGeo = new THREE.BoxGeometry(L, battenW, battenTh);
        const frontBelt = new THREE.Mesh(frontBeltGeo, woodMat.clone());
        frontBelt.position.set(0, sideY, W / 2 + battenTh / 2 + exp * 0.65);
        explodedRoot.add(frontBelt);
        registerPart(frontBelt, beltComp);

        const backBelt = new THREE.Mesh(frontBeltGeo, woodMat.clone());
        backBelt.position.set(0, sideY, -W / 2 - battenTh / 2 - exp * 0.65);
        explodedRoot.add(backBelt);
        registerPart(backBelt, beltComp);

        const endBeltGeo = new THREE.BoxGeometry(battenTh, battenW, W);
        const leftBelt = new THREE.Mesh(endBeltGeo, woodMat.clone());
        leftBelt.position.set(-L / 2 - battenTh / 2 - exp * 0.65, sideY, 0);
        explodedRoot.add(leftBelt);
        registerPart(leftBelt, beltComp);

        const rightBelt = new THREE.Mesh(endBeltGeo, woodMat.clone());
        rightBelt.position.set(L / 2 + battenTh / 2 + exp * 0.65, sideY, 0);
        explodedRoot.add(rightBelt);
        registerPart(rightBelt, beltComp);
      }

      // 6. Perimeter Framing Battens
      if (rimComp && rimComp.qty > 0) {
        const topRimY = sideY + wallH / 2 - battenW / 2;
        const botRimY = sideY - wallH / 2 + battenW / 2;
        const frontBeltGeo = new THREE.BoxGeometry(L, battenW, battenTh);
        const endBeltGeo = new THREE.BoxGeometry(battenTh, battenW, W);

        const frontTopRim = new THREE.Mesh(frontBeltGeo, woodMat.clone());
        frontTopRim.position.set(0, topRimY, W / 2 + battenTh / 2 + exp * 0.65);
        explodedRoot.add(frontTopRim);
        registerPart(frontTopRim, rimComp);

        const backTopRim = new THREE.Mesh(frontBeltGeo, woodMat.clone());
        backTopRim.position.set(0, topRimY, -W / 2 - battenTh / 2 - exp * 0.65);
        explodedRoot.add(backTopRim);
        registerPart(backTopRim, rimComp);

        const leftTopRim = new THREE.Mesh(endBeltGeo, woodMat.clone());
        leftTopRim.position.set(-L / 2 - battenTh / 2 - exp * 0.65, topRimY, 0);
        explodedRoot.add(leftTopRim);
        registerPart(leftTopRim, rimComp);

        const rightTopRim = new THREE.Mesh(endBeltGeo, woodMat.clone());
        rightTopRim.position.set(L / 2 + battenTh / 2 + exp * 0.65, topRimY, 0);
        explodedRoot.add(rightTopRim);
        registerPart(rightTopRim, rimComp);

        const frontBotRim = new THREE.Mesh(frontBeltGeo, woodMat.clone());
        frontBotRim.position.set(0, botRimY, W / 2 + battenTh / 2 + exp * 0.65);
        explodedRoot.add(frontBotRim);
        registerPart(frontBotRim, rimComp);

        const backBotRim = new THREE.Mesh(frontBeltGeo, woodMat.clone());
        backBotRim.position.set(0, botRimY, -W / 2 - battenTh / 2 - exp * 0.65);
        explodedRoot.add(backBotRim);
        registerPart(backBotRim, rimComp);
      }

      // 7. Top Lid with In-Line Reinforcement Cleats
      if (lidSheetComp && lidSheetComp.qty > 0) {
        const lidY = skidH + plyTh + wallH;
        lidGroup.position.set(0, lidY + exp * 0.85, -W / 2);

        const topPlyGeo = new THREE.BoxGeometry(L, plyTh, W);
        const topPly = new THREE.Mesh(topPlyGeo, plyMat.clone());
        topPly.position.set(0, plyTh / 2, W / 2);
        topPly.castShadow = true;
        lidGroup.add(topPly);
        registerPart(topPly, lidSheetComp);

        if (lidCleatComp && lidCleatComp.qty > 0) {
          const lidCleatGeo = new THREE.BoxGeometry(battenW, battenTh, W);
          [-L / 3, L / 3].forEach((x) => {
            const cleat = new THREE.Mesh(lidCleatGeo, woodMat.clone());
            cleat.position.set(x, plyTh + battenTh / 2, W / 2);
            lidGroup.add(cleat);
            registerPart(cleat, lidCleatComp);
          });
        }
      }
    }

    // =========================================================================
    // TYPE 3: OPEN-SLATTED WOODEN CRATE / SKELETON CRATE
    // =========================================================================
    else if (boxType === "type3_skeleton_crate") {
      const skidComp = findComp("skel_skids", "RUNNERS_SKIDS");
      const floorComp = findComp("skel_floor_slats", "DECK_SLATS");
      const cornerComp = findComp("skel_corner_cleats", "CORNER_POSTS");
      const sideComp = findComp("skel_horizontal_side_slats", "SIDE_WALLS");
      const endComp = findComp("skel_horizontal_end_slats", "END_WALLS");
      const topComp = findComp("skel_top_frames", "LID_COVER");

      const skidH = (skidComp ? toInches(skidComp.thickness, dims.unit) : 2.5) * worldScale;
      const skidW = (skidComp ? toInches(skidComp.width, dims.unit) : 3.0) * worldScale;
      const slatTh = (floorComp ? toInches(floorComp.thickness, dims.unit) : 0.75) * worldScale;
      const slatW = (floorComp ? toInches(floorComp.width, dims.unit) : 3.0) * worldScale;
      const postH = Math.max(0.1, H - skidH - slatTh);

      // 1. Base Skid Runners
      if (skidComp && skidComp.qty > 0) {
        const skidGeo = new THREE.BoxGeometry(L, skidH, skidW);
        const qty = skidComp.qty;
        for (let i = 0; i < qty; i++) {
          const frac = qty === 1 ? 0.5 : i / (qty - 1);
          const z = -W / 2 + skidW / 2 + frac * (W - skidW);
          const skid = new THREE.Mesh(skidGeo, skidMat.clone());
          skid.position.set(0, skidH / 2 - exp * 0.45, z);
          skid.castShadow = true;
          explodedRoot.add(skid);
          registerPart(skid, skidComp);
        }
      }

      // 2. Base Floor Slats
      if (floorComp && floorComp.qty > 0) {
        const floorCount = floorComp.qty;
        const floorGeo = new THREE.BoxGeometry(slatW, slatTh, W);
        for (let i = 0; i < floorCount; i++) {
          const frac = floorCount === 1 ? 0.5 : i / (floorCount - 1);
          const x = -L / 2 + slatW / 2 + frac * (L - slatW);
          const fSlat = new THREE.Mesh(floorGeo, woodMat.clone());
          fSlat.position.set(x, skidH + slatTh / 2 - exp * 0.2, 0);
          fSlat.castShadow = true;
          explodedRoot.add(fSlat);
          registerPart(fSlat, floorComp);
        }
      }

      // 3. External Corner Joint Cleats
      if (cornerComp && cornerComp.qty > 0) {
        const postY = skidH + slatTh + postH / 2;
        const extCleatGeo = new THREE.BoxGeometry(slatW, postH, slatTh);
        [
          { x: -L / 2 + slatW / 2, z: W / 2 + slatTh / 2 + exp * 0.55 },
          { x: L / 2 - slatW / 2, z: W / 2 + slatTh / 2 + exp * 0.55 },
          { x: -L / 2 + slatW / 2, z: -W / 2 - slatTh / 2 - exp * 0.55 },
          { x: L / 2 - slatW / 2, z: -W / 2 - slatTh / 2 - exp * 0.55 },
        ].slice(0, cornerComp.qty).forEach((p) => {
          const post = new THREE.Mesh(extCleatGeo, accentWoodMat.clone());
          post.position.set(p.x, postY, p.z);
          post.castShadow = true;
          explodedRoot.add(post);
          registerPart(post, cornerComp);
        });
      }

      // 4. Long Side Spaced Slats
      if (sideComp && sideComp.qty > 0) {
        const rows = Math.max(1, Math.round(sideComp.qty / 2));
        const sideSlatGeo = new THREE.BoxGeometry(L, slatW, slatTh);
        for (let r = 0; r < rows; r++) {
          const fracY = rows === 1 ? 0.5 : r / (rows - 1);
          const y = skidH + slatTh + slatW / 2 + fracY * (postH - slatW);

          const f = new THREE.Mesh(sideSlatGeo, woodMat.clone());
          f.position.set(0, y, W / 2 - slatTh / 2 + exp * 0.55);
          f.castShadow = true;
          explodedRoot.add(f);
          registerPart(f, sideComp);

          const b = new THREE.Mesh(sideSlatGeo, woodMat.clone());
          b.position.set(0, y, -W / 2 + slatTh / 2 - exp * 0.55);
          b.castShadow = true;
          explodedRoot.add(b);
          registerPart(b, sideComp);
        }
      }

      // 5. Short End Spaced Slats
      if (endComp && endComp.qty > 0) {
        const rows = Math.max(1, Math.round(endComp.qty / 2));
        const endSlatGeo = new THREE.BoxGeometry(slatTh, slatW, W - 2 * slatTh);
        for (let r = 0; r < rows; r++) {
          const fracY = rows === 1 ? 0.5 : r / (rows - 1);
          const y = skidH + slatTh + slatW / 2 + fracY * (postH - slatW);

          const l = new THREE.Mesh(endSlatGeo, accentWoodMat.clone());
          l.position.set(-L / 2 + slatTh / 2 - exp * 0.55, y, 0);
          l.castShadow = true;
          explodedRoot.add(l);
          registerPart(l, endComp);

          const ri = new THREE.Mesh(endSlatGeo, accentWoodMat.clone());
          ri.position.set(L / 2 - slatTh / 2 + exp * 0.55, y, 0);
          ri.castShadow = true;
          explodedRoot.add(ri);
          registerPart(ri, endComp);
        }
      }

      // 6. Top Ring Framing Slats
      if (topComp && topComp.qty > 0) {
        const topY = skidH + slatTh + postH;
        lidGroup.position.set(0, topY + exp * 0.7, -W / 2);
        const topSlatGeo = new THREE.BoxGeometry(L, slatTh, slatW);
        [-W / 2 + slatW / 2, W / 2 - slatW / 2].forEach((zRel) => {
          const topSlat = new THREE.Mesh(topSlatGeo, woodMat.clone());
          topSlat.position.set(0, slatTh / 2, W / 2 + zRel);
          topSlat.castShadow = true;
          lidGroup.add(topSlat);
          registerPart(topSlat, topComp);
        });
      }
    }

    // =========================================================================
    // TYPE 4: HEAVY MACHINE BASE SKID PALLET
    // =========================================================================
    else if (boxType === "type4_machine_skid") {
      const runnerComp = findComp("mach_long_skids", "RUNNERS_SKIDS");
      const crossComp = findComp("mach_cross_battens", "BATTENS_CLEATS");
      const deckComp = findComp("mach_deck_planks", "DECK_SLATS");
      const blockComp = findComp("mach_spacer_blocks", "SPACER_BLOCKS");

      const runnerH = (runnerComp ? toInches(runnerComp.thickness, dims.unit) : 3.5) * worldScale;
      const runnerW = (runnerComp ? toInches(runnerComp.width, dims.unit) : 3.5) * worldScale;
      const crossTh = (crossComp ? toInches(crossComp.thickness, dims.unit) : 1.5) * worldScale;
      const crossW = (crossComp ? toInches(crossComp.width, dims.unit) : 4.0) * worldScale;
      const deckTh = (deckComp ? toInches(deckComp.thickness, dims.unit) : 1.25) * worldScale;
      const deckW = (deckComp ? toInches(deckComp.width, dims.unit) : 5.0) * worldScale;

      // 1. Heavy Longitudinal Skid Beams
      if (runnerComp && runnerComp.qty > 0) {
        const runnerGeo = new THREE.BoxGeometry(L, runnerH, runnerW);
        const count = runnerComp.qty;
        for (let i = 0; i < count; i++) {
          const frac = count === 1 ? 0.5 : i / (count - 1);
          const z = -W / 2 + runnerW / 2 + frac * (W - runnerW);
          const beam = new THREE.Mesh(runnerGeo, skidMat.clone());
          beam.position.set(0, runnerH / 2 - exp * 0.5, z);
          beam.castShadow = true;
          explodedRoot.add(beam);
          registerPart(beam, runnerComp);
        }
      }

      // 2. Cross Support Stringers
      if (crossComp && crossComp.qty > 0) {
        const crossGeo = new THREE.BoxGeometry(crossW, crossTh, W);
        const crossY = runnerH + crossTh / 2;
        const count = crossComp.qty;
        for (let i = 0; i < count; i++) {
          const frac = count === 1 ? 0.5 : i / (count - 1);
          const x = -L / 2 + crossW / 2 + frac * (L - crossW);
          const cross = new THREE.Mesh(crossGeo, accentWoodMat.clone());
          cross.position.set(x, crossY + exp * 0.2, 0);
          cross.castShadow = true;
          explodedRoot.add(cross);
          registerPart(cross, crossComp);
        }
      }

      // 3. Thick Heavy-Duty Deck Planks (FULL SLAT vs ONLY BLOCKS)
      const isOnlyBlocks = deckMode === "only_blocks";
      if (!isOnlyBlocks && deckComp && deckComp.qty > 0) {
        const deckGeo = new THREE.BoxGeometry(deckW, deckTh, W);
        const deckY = runnerH + crossTh + deckTh / 2;
        const plankCount = deckComp.qty;
        for (let i = 0; i < plankCount; i++) {
          const frac = plankCount === 1 ? 0.5 : i / (plankCount - 1);
          const x = -L / 2 + deckW / 2 + frac * (L - deckW);
          const plank = new THREE.Mesh(deckGeo, woodMat.clone());
          plank.position.set(x, deckY + exp * 0.65, 0);
          plank.castShadow = true;
          explodedRoot.add(plank);
          registerPart(plank, deckComp);
        }
      }
    }

    // =========================================================================
    // TYPE 5: SOLID PINE WOOD MACHINERY BOX
    // =========================================================================
    else if (boxType === "type5_solid_pine_box") {
      const skidComp = findComp("solid_skids", "RUNNERS_SKIDS");
      const floorComp = findComp("solid_floor_planks", "DECK_SLATS");
      const sideComp = findComp("solid_side_planks", "SIDE_WALLS");
      const endComp = findComp("solid_end_planks", "END_WALLS");
      const cleatComp = findComp("solid_corner_cleats", "CORNER_POSTS");
      const lidPlankComp = findComp("solid_lid_planks", "LID_COVER");
      const lidBattenComp = findComp("solid_lid_battens");

      const skidH = (skidComp ? toInches(skidComp.thickness, dims.unit) : 3.0) * worldScale;
      const skidW = (skidComp ? toInches(skidComp.width, dims.unit) : 3.5) * worldScale;
      const plankTh = (floorComp ? toInches(floorComp.thickness, dims.unit) : 1.0) * worldScale;
      const plankW = (floorComp ? toInches(floorComp.width, dims.unit) : 6.0) * worldScale;
      const cleatW = (cleatComp ? toInches(cleatComp.width, dims.unit) : 3.0) * worldScale;
      const cleatTh = (cleatComp ? toInches(cleatComp.thickness, dims.unit) : 1.0) * worldScale;

      // 1. Skid Runners
      if (skidComp && skidComp.qty > 0) {
        const skidGeo = new THREE.BoxGeometry(L, skidH, skidW);
        const count = skidComp.qty;
        for (let i = 0; i < count; i++) {
          const frac = count === 1 ? 0.5 : i / (count - 1);
          const z = -W / 2 + skidW / 2 + frac * (W - skidW);
          const skid = new THREE.Mesh(skidGeo, skidMat.clone());
          skid.position.set(0, skidH / 2 - exp * 0.5, z);
          skid.castShadow = true;
          explodedRoot.add(skid);
          registerPart(skid, skidComp);
        }
      }

      // 2. Solid Timber Floor Planks
      if (floorComp && floorComp.qty > 0) {
        const floorPlanks = floorComp.qty;
        const floorGeo = new THREE.BoxGeometry(L, plankTh, plankW);
        for (let i = 0; i < floorPlanks; i++) {
          const frac = floorPlanks === 1 ? 0.5 : i / (floorPlanks - 1);
          const z = -W / 2 + plankW / 2 + frac * (W - plankW);
          const fPlank = new THREE.Mesh(floorGeo, woodMat.clone());
          fPlank.position.set(0, skidH + plankTh / 2 - exp * 0.25, z);
          fPlank.castShadow = true;
          explodedRoot.add(fPlank);
          registerPart(fPlank, floorComp);
        }
      }

      // 3. Side Wall Solid Planks
      if (sideComp && sideComp.qty > 0) {
        const tiers = Math.max(1, Math.round(sideComp.qty / 2));
        const sidePlankGeo = new THREE.BoxGeometry(L, plankW, plankTh);
        for (let t = 0; t < tiers; t++) {
          const y = skidH + plankTh + plankW / 2 + t * plankW;
          const frontPlank = new THREE.Mesh(sidePlankGeo, t === 1 ? stampMat : woodMat.clone());
          frontPlank.position.set(0, y, W / 2 - plankTh / 2 + exp * 0.6);
          frontPlank.castShadow = true;
          explodedRoot.add(frontPlank);
          registerPart(frontPlank, sideComp);

          const backPlank = new THREE.Mesh(sidePlankGeo, woodMat.clone());
          backPlank.position.set(0, y, -W / 2 + plankTh / 2 - exp * 0.6);
          backPlank.castShadow = true;
          explodedRoot.add(backPlank);
          registerPart(backPlank, sideComp);
        }
      }

      // 4. End Wall Solid Planks
      if (endComp && endComp.qty > 0) {
        const tiers = Math.max(1, Math.round(endComp.qty / 2));
        const endPlankGeo = new THREE.BoxGeometry(plankTh, plankW, W - 2 * plankTh);
        for (let t = 0; t < tiers; t++) {
          const y = skidH + plankTh + plankW / 2 + t * plankW;
          const leftPlank = new THREE.Mesh(endPlankGeo, accentWoodMat.clone());
          leftPlank.position.set(-L / 2 + plankTh / 2 - exp * 0.6, y, 0);
          leftPlank.castShadow = true;
          explodedRoot.add(leftPlank);
          registerPart(leftPlank, endComp);

          const rightPlank = new THREE.Mesh(endPlankGeo, accentWoodMat.clone());
          rightPlank.position.set(L / 2 - plankTh / 2 + exp * 0.6, y, 0);
          rightPlank.castShadow = true;
          explodedRoot.add(rightPlank);
          registerPart(rightPlank, endComp);
        }
      }

      // 5. Corner Cleats
      if (cleatComp && cleatComp.qty > 0) {
        const wallH = (sideComp ? Math.max(1, Math.round(sideComp.qty / 2)) : 3) * plankW;
        const cleatGeo = new THREE.BoxGeometry(cleatW, wallH, cleatTh);
        const cleatY = skidH + plankTh + wallH / 2;
        [
          { x: -L / 2 + cleatW / 2, z: W / 2 - cleatTh / 2 + exp * 0.65 },
          { x: L / 2 - cleatW / 2, z: W / 2 - cleatTh / 2 + exp * 0.65 },
          { x: -L / 2 + cleatW / 2, z: -W / 2 + cleatTh / 2 - exp * 0.65 },
          { x: L / 2 - cleatW / 2, z: -W / 2 + cleatTh / 2 - exp * 0.65 },
        ].slice(0, cleatComp.qty).forEach((p) => {
          const cleat = new THREE.Mesh(cleatGeo, skidMat.clone());
          cleat.position.set(p.x, cleatY, p.z);
          explodedRoot.add(cleat);
          registerPart(cleat, cleatComp);
        });
      }

      // 6. Solid Pine Lid
      if (lidPlankComp && lidPlankComp.qty > 0) {
        const wallH = (sideComp ? Math.max(1, Math.round(sideComp.qty / 2)) : 3) * plankW;
        const lidY = skidH + plankTh + wallH;
        lidGroup.position.set(0, lidY + exp * 0.85, -W / 2);

        const lidPlanks = lidPlankComp.qty;
        const lidPlankGeo = new THREE.BoxGeometry(L, plankTh, plankW);
        for (let i = 0; i < lidPlanks; i++) {
          const frac = lidPlanks === 1 ? 0.5 : i / (lidPlanks - 1);
          const zRel = plankW / 2 + frac * (W - plankW);
          const lp = new THREE.Mesh(lidPlankGeo, woodMat.clone());
          lp.position.set(0, plankTh / 2, zRel);
          lp.castShadow = true;
          lidGroup.add(lp);
          registerPart(lp, lidPlankComp);
        }

        if (lidBattenComp && lidBattenComp.qty > 0) {
          const battenGeo = new THREE.BoxGeometry(cleatW, cleatTh, W);
          const bQty = lidBattenComp.qty;
          for (let i = 0; i < bQty; i++) {
            const frac = bQty === 1 ? 0.5 : i / (bQty - 1);
            const x = -L / 3 + frac * ((2 * L) / 3);
            const batten = new THREE.Mesh(battenGeo, accentWoodMat.clone());
            batten.position.set(x, plankTh + cleatTh / 2, W / 2);
            lidGroup.add(batten);
            registerPart(batten, lidBattenComp);
          }
        }
      }
    }

    // =========================================================================
    // DYNAMIC RENDERING OF USER-ADDED / CUSTOM COMPONENTS
    // =========================================================================
    const knownStandardIds = new Set([
      "pal_runners", "pal_blocks", "pal_stringers", "pal_top_slats",
      "ply_base_skids", "ply_base_sheet", "ply_side_panels", "ply_end_panels",
      "ply_belt_cleats", "ply_perimeter_battens", "ply_lid_sheet", "ply_lid_cleats",
      "skel_skids", "skel_floor_slats", "skel_corner_cleats", "skel_horizontal_side_slats",
      "skel_horizontal_end_slats", "skel_top_frames",
      "mach_long_skids", "mach_cross_battens", "mach_deck_planks", "mach_spacer_blocks",
      "solid_skids", "solid_floor_planks", "solid_side_planks", "solid_end_planks",
      "solid_corner_cleats", "solid_lid_planks", "solid_lid_battens",
    ]);

    const customItems = report.components.filter(
      (c) => !knownStandardIds.has(c.id) || c.id.startsWith("custom_") || c.category === "CUSTOM"
    );

    customItems.forEach((customComp, customIndex) => {
      if (customComp.qty <= 0) return;
      const cL = toInches(customComp.length, dims.unit) * worldScale;
      const cW = toInches(customComp.width, dims.unit) * worldScale;
      const cTh = toInches(customComp.thickness, dims.unit) * worldScale;

      const isBlock =
        customComp.materialType === "hardwood_block" || customComp.category === "SPACER_BLOCKS";
      const isPly =
        customComp.materialType === "plywood" || customComp.category === "PLYWOOD_PANELS";

      const mat = isPly ? plyMat.clone() : isBlock ? blockMat.clone() : woodMat.clone();

      for (let k = 0; k < customComp.qty; k++) {
        let geo: THREE.BufferGeometry;
        let xPos = 0;
        let yPos = H / 2;
        let zPos = 0;

        if (isBlock) {
          geo = new THREE.BoxGeometry(cL, cTh, cW);
          const frac = customComp.qty === 1 ? 0.5 : k / (customComp.qty - 1);
          xPos = -L / 2 + cL / 2 + frac * (L - cL);
          yPos = cTh / 2 + customIndex * 0.1 * worldScale;
          zPos = (k % 2 === 0 ? 1 : -1) * (W / 4);
        } else if (isPly) {
          geo = new THREE.BoxGeometry(cL, cTh, cW);
          xPos = 0;
          yPos = H + cTh / 2 + (customIndex + 1) * 0.1 * worldScale + exp * 0.8;
          zPos = 0;
        } else {
          // Extra solid wood slat / batten / cleat
          geo = new THREE.BoxGeometry(cL, cTh, cW);
          const frac = customComp.qty === 1 ? 0.5 : k / (customComp.qty - 1);
          xPos = -L / 2 + cW / 2 + frac * (L - cW);
          yPos = H + cTh / 2 + customIndex * 0.05 * worldScale + exp * 0.7;
          zPos = 0;
        }

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(xPos, yPos, zPos);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        explodedRoot.add(mesh);
        registerPart(mesh, customComp);
      }
    });

    // 3D Dimension Helpers
    if (showDimensions) {
      const lineMat = new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 2 });

      // Length Dimension (X)
      const lPts = [
        new THREE.Vector3(-L / 2, 0.05, W / 2 + 0.25),
        new THREE.Vector3(L / 2, 0.05, W / 2 + 0.25),
      ];
      const lGeo = new THREE.BufferGeometry().setFromPoints(lPts);
      dimRoot.add(new THREE.Line(lGeo, lineMat));

      // Width Dimension (Z)
      const wPts = [
        new THREE.Vector3(L / 2 + 0.25, 0.05, -W / 2),
        new THREE.Vector3(L / 2 + 0.25, 0.05, W / 2),
      ];
      const wGeo = new THREE.BufferGeometry().setFromPoints(wPts);
      dimRoot.add(new THREE.Line(wGeo, lineMat));

      // Height Dimension (Y)
      const hPts = [
        new THREE.Vector3(-L / 2 - 0.25, 0, W / 2),
        new THREE.Vector3(-L / 2 - 0.25, H, W / 2),
      ];
      const hGeo = new THREE.BufferGeometry().setFromPoints(hPts);
      dimRoot.add(new THREE.Line(hGeo, lineMat));
    }
  }, [boxType, dims, explodeFactor, showDimensions, hasPlywoodTop, deckMode, report, report.components]);

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-50 rounded-2xl overflow-hidden border border-zinc-200">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Hover Component HUD Card */}
      {activeHover && (
        <div className="absolute top-4 left-4 z-20 pointer-events-none bg-zinc-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl border border-amber-500/40 shadow-lg max-w-xs animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>3D Inspected Component</span>
          </div>
          <div className="text-sm font-bold text-white mt-0.5 leading-snug">
            {activeHover.name}
          </div>
          {activeHover.subtitle && (
            <div className="text-[11px] text-zinc-300">
              {activeHover.subtitle}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-700/70 text-xs">
            <div>
              <span className="text-zinc-400 block text-[10px]">Cut Size (L×B×T):</span>
              <span className="font-semibold text-amber-300">
                {activeHover.length}&quot; × {activeHover.width}&quot; × {activeHover.thickness}&quot;
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Assembly Qty:</span>
              <span className="font-semibold text-white">
                {activeHover.qty} pcs
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Piece CFT:</span>
              <span className="font-mono text-white font-medium">
                {activeHover.pieceCft.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Total Component CFT:</span>
              <span className="font-mono text-amber-400 font-bold">
                {activeHover.totalCft.toFixed(3)} CFT
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hint badge */}
      <div className="absolute bottom-3 left-3 pointer-events-none text-[10px] text-zinc-500 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-zinc-200 shadow-2xs">
        Click &amp; drag to rotate 3D &bull; Scroll to zoom &bull; Hover any piece for CFT
      </div>

      {/* Software Mode indicator if WebGL hardware was disabled in container */}
      {isSoftwareRenderer && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-amber-50/95 border border-amber-300 text-amber-900 rounded-lg text-[10px] font-semibold shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>3D Vector Mode (Hardware WebGL restricted in container)</span>
        </div>
      )}
    </div>
  );
};
