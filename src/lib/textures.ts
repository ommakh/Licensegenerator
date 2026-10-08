import * as THREE from "three";

/**
 * Creates high-res procedural natural wood grain canvas texture
 */
export function createProceduralWoodTexture(
  baseHex: string = "#d6b588",
  grainHex: string = "#9f7949",
  hasNails: boolean = false
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Base background fill
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  // Grain lines (fine wood grain fibers)
  ctx.strokeStyle = grainHex;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.18;

  for (let y = 0; y < 512; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    const wobble1 = Math.sin(y * 0.03) * 6;
    const wobble2 = Math.cos(y * 0.08) * 3;
    ctx.bezierCurveTo(170, y + wobble1, 340, y + wobble2, 512, y);
    ctx.stroke();
  }

  // Soft growth rings / annual bands
  ctx.globalAlpha = 0.09;
  for (let i = 0; i < 6; i++) {
    const cy = 60 + i * 80;
    const grad = ctx.createLinearGradient(0, cy - 25, 0, cy + 25);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(0.5, grainHex);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, cy - 25, 512, 50);
  }

  // Subtle natural wood knot
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = grainHex;
  ctx.beginPath();
  ctx.ellipse(380, 240, 24, 14, Math.PI / 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.ellipse(380, 240, 36, 22, Math.PI / 14, 0, Math.PI * 2);
  ctx.stroke();

  // Subtle border bevel / shadow around plank edges
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = "#4a351b";
  ctx.lineWidth = 3;
  ctx.strokeRect(1, 1, 510, 510);

  // Fasteners / Nails if requested
  if (hasNails) {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#2c2c2c";
    // Nail heads on both ends
    const nailPositions = [
      [24, 24],
      [24, 488],
      [488, 24],
      [488, 488],
    ];
    for (const [nx, ny] of nailPositions) {
      ctx.beginPath();
      ctx.arc(nx, ny, 4, 0, Math.PI * 2);
      ctx.fill();

      // Metallic highlight
      ctx.fillStyle = "#e0e0e0";
      ctx.beginPath();
      ctx.arc(nx - 1, ny - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2c2c2c";
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates cardboard kraft texture with corrugated ribbing
 */
export function createCardboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Kraft brown base
  ctx.fillStyle = "#c79e67";
  ctx.fillRect(0, 0, 512, 512);

  // Subtle paper fibers
  ctx.fillStyle = "#ad824e";
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 600; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillRect(rx, ry, Math.random() * 4 + 1, 1);
  }

  // Fluting / corrugated shadow stripes
  ctx.globalAlpha = 0.08;
  for (let x = 0; x < 512; x += 12) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, 0, 5, 512);
  }

  // Stamp / Box markings
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "#3e2723";
  ctx.font = "bold 20px monospace";
  ctx.fillText("📦 FRAGILE", 32, 64);
  ctx.font = "14px monospace";
  ctx.fillText("THIS WAY UP ↑↑", 32, 92);
  ctx.fillText("RECYCLABLE 100%", 32, 116);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates export stamp stencil texture for wooden crates (HT IPPC / Rahul Design)
 */
export function createCrateStampTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#deb887";
  ctx.fillRect(0, 0, 512, 512);

  // Stamp outline
  ctx.strokeStyle = "rgba(40, 25, 15, 0.75)";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 160, 432, 180);

  ctx.fillStyle = "rgba(40, 25, 15, 0.75)";
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("RAHUL DESIGN", 256, 210);

  ctx.font = "bold 18px sans-serif";
  ctx.fillText("IN-PACKAGING · HT-IPPC", 256, 245);

  ctx.font = "15px monospace";
  ctx.fillText("DB - TREATED FOR EXPORT", 256, 280);
  ctx.fillText("ISPM-15 COMPLIANT", 256, 305);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates soft radial contact shadow texture for ground plane under crate
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, 512, 512);
  const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 250);
  grad.addColorStop(0, "rgba(20, 25, 35, 0.45)");
  grad.addColorStop(0.35, "rgba(30, 35, 45, 0.22)");
  grad.addColorStop(0.7, "rgba(40, 45, 55, 0.06)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

