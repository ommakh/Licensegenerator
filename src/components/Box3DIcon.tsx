import React from "react";
import { BoxTypeId } from "../types";

interface Box3DIconProps {
  boxId: BoxTypeId;
  size?: number; // default 56px or 64px
  className?: string;
}

export const Box3DIcon: React.FC<Box3DIconProps> = ({
  boxId,
  size = 56,
  className = "",
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title={`Accurate 3D Model: ${boxId}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          {/* Top Face Light: Warm Natural Pine */}
          <linearGradient id={`topGrad-${boxId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9E2B8" />
            <stop offset="100%" stopColor="#E9C487" />
          </linearGradient>

          {/* Left Face: Mid-Tone Diffuse Lighting */}
          <linearGradient id={`leftGrad-${boxId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4A05B" />
            <stop offset="100%" stopColor="#B37C35" />
          </linearGradient>

          {/* Right Face: Darker Shadow Tone */}
          <linearGradient id={`rightGrad-${boxId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B8803C" />
            <stop offset="100%" stopColor="#87531C" />
          </linearGradient>

          {/* Skid Hardwood Gradients (Darker Heavy Timber) */}
          <linearGradient id={`skidLeft-${boxId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9E6125" />
            <stop offset="100%" stopColor="#784210" />
          </linearGradient>
          <linearGradient id={`skidRight-${boxId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7B4212" />
            <stop offset="100%" stopColor="#562B07" />
          </linearGradient>

          {/* Plywood Sheet Gradients */}
          <linearGradient id={`plyTop-${boxId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2D6" />
            <stop offset="100%" stopColor="#F4DEB3" />
          </linearGradient>
          <linearGradient id={`plyLeft-${boxId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E5C799" />
            <stop offset="100%" stopColor="#CCA46B" />
          </linearGradient>
          <linearGradient id={`plyRight-${boxId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C89D63" />
            <stop offset="100%" stopColor="#A87A3E" />
          </linearGradient>

          {/* Cleats / Battens */}
          <linearGradient id={`cleatTop-${boxId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3CCA0" />
            <stop offset="100%" stopColor="#DFAB6A" />
          </linearGradient>
          <linearGradient id={`cleatLeft-${boxId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C98B44" />
            <stop offset="100%" stopColor="#A56A25" />
          </linearGradient>
          <linearGradient id={`cleatRight-${boxId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A56A25" />
            <stop offset="100%" stopColor="#794814" />
          </linearGradient>
        </defs>

        {/* ------------------------------------------------------------- */}
        {/* TYPE 1: 4-WAY INDUSTRIAL BLOCK PALLET (9 Solid Blocks)        */}
        {/* ------------------------------------------------------------- */}
        {boxId === "type1_block_pallet" && (
          <g>
            {/* Ground Contact Shadow */}
            <ellipse cx="50" cy="85" rx="38" ry="9" fill="rgba(80,45,15,0.18)" />

            {/* Bottom 3 Skid Runners */}
            {/* Center Runner */}
            <polygon points="50,75 74,62 74,65.5 50,78.5" fill={`url(#skidRight-${boxId})`} />
            <polygon points="26,62 50,75 50,78.5 26,65.5" fill={`url(#skidLeft-${boxId})`} />

            {/* Left Runner */}
            <polygon points="14,55 38,68 38,71.5 14,58.5" fill={`url(#skidLeft-${boxId})`} />
            <polygon points="38,68 42,65.5 42,69 38,71.5" fill={`url(#skidRight-${boxId})`} />

            {/* Right Runner */}
            <polygon points="58,65.5 62,68 62,71.5 58,69" fill={`url(#skidLeft-${boxId})`} />
            <polygon points="62,68 86,55 86,58.5 62,71.5" fill={`url(#skidRight-${boxId})`} />

            {/* 9 Solid Spacer Blocks creating clear 4-way forklift tine pockets */}
            {/* Back Row */}
            <polygon points="24,46 29,43 33,45.5 28,48.5" fill={`url(#topGrad-${boxId})`} />
            <polygon points="24,46 28,48.5 28,54.5 24,52" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="28,48.5 33,45.5 33,51.5 28,54.5" fill={`url(#rightGrad-${boxId})`} />

            <polygon points="46,34 50,31.5 54,34 50,36.5" fill={`url(#topGrad-${boxId})`} />
            <polygon points="46,34 50,36.5 50,42.5 46,40" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="50,36.5 54,34 54,40 50,42.5" fill={`url(#rightGrad-${boxId})`} />

            <polygon points="67,45.5 72,43 76,45.5 71,48" fill={`url(#topGrad-${boxId})`} />
            <polygon points="67,45.5 71,48 71,54 67,51.5" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="71,48 76,45.5 76,51.5 71,54" fill={`url(#rightGrad-${boxId})`} />

            {/* Middle Row */}
            <polygon points="15,51 20,48.5 24,51 19,53.5" fill={`url(#topGrad-${boxId})`} />
            <polygon points="15,51 19,53.5 19,60 15,57.5" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="19,53.5 24,51 24,57.5 19,60" fill={`url(#rightGrad-${boxId})`} />

            <polygon points="46,47 50,44.5 54,47 50,49.5" fill={`url(#topGrad-${boxId})`} />
            <polygon points="46,47 50,49.5 50,56 46,53.5" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="50,49.5 54,47 54,53.5 50,56" fill={`url(#rightGrad-${boxId})`} />

            <polygon points="76,51 81,48.5 85,51 80,53.5" fill={`url(#topGrad-${boxId})`} />
            <polygon points="76,51 80,53.5 80,60 76,57.5" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="80,53.5 85,51 85,57.5 80,60" fill={`url(#rightGrad-${boxId})`} />

            {/* Front Row */}
            <polygon points="34,61.5 38,59 42,61.5 38,64" fill={`url(#topGrad-${boxId})`} />
            <polygon points="34,61.5 38,64 38,70.5 34,68" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="38,64 42,61.5 42,68 38,70.5" fill={`url(#rightGrad-${boxId})`} />

            <polygon points="46,67.5 50,65 54,67.5 50,70" fill={`url(#topGrad-${boxId})`} />
            <polygon points="46,67.5 50,70 50,76.5 46,74" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="50,70 54,67.5 54,74 50,76.5" fill={`url(#rightGrad-${boxId})`} />

            <polygon points="58,61.5 62,59 66,61.5 62,64" fill={`url(#topGrad-${boxId})`} />
            <polygon points="58,61.5 62,64 62,70.5 58,68" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="62,64 66,61.5 66,68 62,70.5" fill={`url(#rightGrad-${boxId})`} />

            {/* 3 Middle Stringer Battens */}
            {/* Center Stringer */}
            <polygon points="26,58 50,71 50,73.5 26,60.5" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="50,71 74,58 74,60.5 50,73.5" fill={`url(#cleatRight-${boxId})`} />

            {/* Left Stringer */}
            <polygon points="14,51 38,64 38,66.5 14,53.5" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="38,64 42,61.5 42,64 38,66.5" fill={`url(#cleatRight-${boxId})`} />

            {/* Right Stringer */}
            <polygon points="58,61.5 62,64 62,66.5 58,64" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="62,64 86,51 86,53.5 62,66.5" fill={`url(#cleatRight-${boxId})`} />

            {/* 7 Top Deck Slats */}
            {/* Slat 1 */}
            <polygon points="50,26 54,28.2 20,47 16,44.8" fill={`url(#topGrad-${boxId})`} />
            <polygon points="16,44.8 20,47 20,49.2 16,47" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="20,47 54,28.2 54,30.4 20,49.2" fill={`url(#rightGrad-${boxId})`} />

            {/* Slat 2 */}
            <polygon points="55,28.8 59,31 25,49.8 21,47.6" fill={`url(#topGrad-${boxId})`} />
            <polygon points="21,47.6 25,49.8 25,52 21,49.8" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="25,49.8 59,31 59,33.2 25,52" fill={`url(#rightGrad-${boxId})`} />

            {/* Slat 3 */}
            <polygon points="60,31.6 64,33.8 30,52.6 26,50.4" fill={`url(#topGrad-${boxId})`} />
            <polygon points="26,50.4 30,52.6 30,54.8 26,52.6" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="30,52.6 64,33.8 64,36 30,54.8" fill={`url(#rightGrad-${boxId})`} />

            {/* Slat 4 (Center) */}
            <polygon points="65,34.4 69,36.6 35,55.4 31,53.2" fill={`url(#topGrad-${boxId})`} />
            <polygon points="31,53.2 35,55.4 35,57.6 31,55.4" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="35,55.4 69,36.6 69,38.8 35,57.6" fill={`url(#rightGrad-${boxId})`} />

            {/* Slat 5 */}
            <polygon points="70,37.2 74,39.4 40,58.2 36,56" fill={`url(#topGrad-${boxId})`} />
            <polygon points="36,56 40,58.2 40,60.4 36,58.2" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="40,58.2 74,39.4 74,41.6 40,60.4" fill={`url(#rightGrad-${boxId})`} />

            {/* Slat 6 */}
            <polygon points="75,40 79,42.2 45,61 41,58.8" fill={`url(#topGrad-${boxId})`} />
            <polygon points="41,58.8 45,61 45,63.2 41,61" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="45,61 79,42.2 79,44.4 45,63.2" fill={`url(#rightGrad-${boxId})`} />

            {/* Slat 7 (Front) */}
            <polygon points="80,42.8 84,45 50,63.8 46,61.6" fill={`url(#topGrad-${boxId})`} />
            <polygon points="46,61.6 50,63.8 50,66 46,63.8" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="50,63.8 84,45 84,47.2 50,66" fill={`url(#rightGrad-${boxId})`} />

            {/* Crisp Slat Edge Highlights */}
            <line x1="50" y1="26" x2="84" y2="45" stroke="#FFF5E0" strokeWidth="0.75" />
            <line x1="16" y1="44.8" x2="50" y2="63.8" stroke="#FFF5E0" strokeWidth="0.75" />
          </g>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TYPE 2: PLYWOOD EXPORT BOX WITH BATTENS (ISPM-15 Cleated)     */}
        {/* ------------------------------------------------------------- */}
        {boxId === "type2_plywood_cleated" && (
          <g>
            {/* Ground Shadow */}
            <ellipse cx="50" cy="86" rx="35" ry="8" fill="rgba(80,45,15,0.2)" />

            {/* 2 Bottom Skid Runners */}
            <polygon points="26,72 43,81.5 43,86 26,76.5" fill={`url(#skidLeft-${boxId})`} />
            <polygon points="43,81.5 47,79 47,83.5 43,86" fill={`url(#skidRight-${boxId})`} />

            <polygon points="53,79 70,88.5 70,93 53,83.5" fill={`url(#skidLeft-${boxId})`} />
            <polygon points="70,88.5 74,86 74,90.5 70,93" fill={`url(#skidRight-${boxId})`} />

            {/* Plywood Box Walls */}
            {/* Top Lid */}
            <polygon points="50,22 84,41 50,60 16,41" fill={`url(#plyTop-${boxId})`} />
            {/* Left Wall */}
            <polygon points="16,41 50,60 50,78 16,59" fill={`url(#plyLeft-${boxId})`} />
            {/* Right Wall */}
            <polygon points="50,60 84,41 84,59 50,78" fill={`url(#plyRight-${boxId})`} />

            {/* ISPM-15 IPPC Export Stamp Symbol */}
            <rect x="25" y="47.5" width="13" height="8" rx="0.5" fill="none" stroke="#7A4B20" strokeWidth="0.8" opacity="0.6" />
            <text x="31.5" y="51.5" fill="#7A4B20" fontSize="2.8" fontWeight="bold" textAnchor="middle" opacity="0.7">
              ISPM 15
            </text>
            <text x="31.5" y="54.5" fill="#7A4B20" fontSize="2.2" textAnchor="middle" opacity="0.7">
              HT - DB
            </text>

            {/* Continuous In-Line Perimeter & Belt Cleats */}
            {/* Top Rim Cleats */}
            <polygon points="16,40 50,59 50,61.5 16,42.5" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="50,59 84,40 84,42.5 50,61.5" fill={`url(#cleatRight-${boxId})`} />

            {/* Mid Belt Cleats */}
            <polygon points="16,49 50,68 50,70.8 16,51.8" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="50,68 84,49 84,51.8 50,70.8" fill={`url(#cleatRight-${boxId})`} />

            {/* Bottom Rim Cleats */}
            <polygon points="16,56.5 50,75.5 50,78 16,59" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="50,75.5 84,56.5 84,59 50,78" fill={`url(#cleatRight-${boxId})`} />

            {/* Corner Vertical Cleats */}
            <polygon points="15.5,40.5 18,42 18,59 15.5,57.5" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="48.5,59.2 50,60 50,78 48.5,77.2" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="50,60 51.5,59.2 51.5,77.2 50,78" fill={`url(#cleatRight-${boxId})`} />
            <polygon points="82,42 84.5,40.5 84.5,57.5 82,59" fill={`url(#cleatRight-${boxId})`} />

            {/* Lid Cross Cleat */}
            <polygon points="33,31.5 67,50.5 64,52.2 30,33.2" fill={`url(#cleatTop-${boxId})`} />
            <polygon points="30,33.2 64,52.2 64,53.8 30,34.8" fill={`url(#cleatLeft-${boxId})`} />

            {/* Edge Highlights */}
            <line x1="50" y1="22" x2="84" y2="41" stroke="#FFF7E6" strokeWidth="0.8" />
            <line x1="16" y1="41" x2="50" y2="60" stroke="#FFF7E6" strokeWidth="0.8" />
          </g>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TYPE 3: OPEN-SLATTED WOODEN CRATE (Skeleton Crate)            */}
        {/* ------------------------------------------------------------- */}
        {boxId === "type3_skeleton_crate" && (
          <g>
            {/* Ground Shadow */}
            <ellipse cx="50" cy="86" rx="34" ry="7.5" fill="rgba(80,45,15,0.18)" />

            {/* 2 Bottom Skid Runners */}
            <polygon points="26,72 44,82 44,86 26,76" fill={`url(#skidLeft-${boxId})`} />
            <polygon points="44,82 48,79.5 48,83.5 44,86" fill={`url(#skidRight-${boxId})`} />

            <polygon points="52,79.5 70,89.5 70,93.5 52,83.5" fill={`url(#skidLeft-${boxId})`} />
            <polygon points="70,89.5 74,87 74,91 70,93.5" fill={`url(#skidRight-${boxId})`} />

            {/* Dark Interior showing Floor Slats */}
            <polygon points="28,68 46,78.5 70,64.5 52,54" fill="#3D2611" opacity="0.85" />
            <polygon points="32,67 48,76 52,73.5 36,64.5" fill={`url(#topGrad-${boxId})`} opacity="0.6" />
            <polygon points="40,62 56,71 60,68.5 44,59.5" fill={`url(#topGrad-${boxId})`} opacity="0.6" />

            {/* 4 Corner Upright Posts */}
            <polygon points="48.5,24 51.5,22.5 51.5,58 48.5,59.5" fill={`url(#cleatRight-${boxId})`} />
            <polygon points="17,39 20,40.5 20,74 17,72.5" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="80,40.5 83,39 83,72.5 80,74" fill={`url(#cleatRight-${boxId})`} />
            <polygon points="48.5,59 50,60 50,81 48.5,80" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="50,60 51.5,59 51.5,80 50,81" fill={`url(#cleatRight-${boxId})`} />

            {/* 4 Spaced Horizontal Slats (True Open Gaps!) */}
            {/* Slat Level 1 (Bottom) */}
            <polygon points="17,68 48.5,78 48.5,81 17,71" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="50,81 83,68 83,65 50,78" fill={`url(#rightGrad-${boxId})`} />

            {/* Slat Level 2 */}
            <polygon points="17,58.5 48.5,68.5 48.5,71.5 17,61.5" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="50,71.5 83,58.5 83,55.5 50,68.5" fill={`url(#rightGrad-${boxId})`} />

            {/* Slat Level 3 */}
            <polygon points="17,49 48.5,59 48.5,62 17,52" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="50,62 83,49 83,46 50,59" fill={`url(#rightGrad-${boxId})`} />

            {/* Slat Level 4 (Top Rim) */}
            <polygon points="17,39.5 48.5,49.5 48.5,53 17,43" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="50,53 83,40 83,36.5 50,49.5" fill={`url(#rightGrad-${boxId})`} />

            {/* Top Perimeter Frame */}
            <polygon points="50,22 83,40 80,41.5 50,25 20,41.5 17,40" fill={`url(#topGrad-${boxId})`} />

            {/* Edge Highlights */}
            <line x1="50" y1="22" x2="83" y2="40" stroke="#FFF2DB" strokeWidth="0.8" />
            <line x1="17" y1="40" x2="50" y2="59" stroke="#FFF2DB" strokeWidth="0.8" />
          </g>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TYPE 4: HEAVY MACHINE BASE SKID PALLET                        */}
        {/* ------------------------------------------------------------- */}
        {boxId === "type4_machine_skid" && (
          <g>
            {/* Elongated Skid Ground Shadow */}
            <ellipse cx="50" cy="84" rx="42" ry="8.5" fill="rgba(80,45,15,0.2)" />

            {/* 4 Heavy Longitudinal Skid Beams */}
            <polygon points="18,60 38,71 38,75 18,64" fill={`url(#skidLeft-${boxId})`} />
            <polygon points="28,64.5 58,80 58,84 28,68.5" fill={`url(#skidLeft-${boxId})`} />
            <polygon points="38,69 68,84.5 68,88.5 38,73" fill={`url(#skidLeft-${boxId})`} />
            <polygon points="48,73.5 78,89 78,93 48,77.5" fill={`url(#skidLeft-${boxId})`} />

            {/* Spacer Blocks */}
            <polygon points="48,68 53,65.5 58,68 53,70.5" fill={`url(#topGrad-${boxId})`} />
            <polygon points="48,68 53,70.5 53,76 48,73.5" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="53,70.5 58,68 58,73.5 53,76" fill={`url(#rightGrad-${boxId})`} />

            <polygon points="68,78 73,75.5 78,78 73,80.5" fill={`url(#topGrad-${boxId})`} />
            <polygon points="68,78 73,80.5 73,86 68,83.5" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="73,80.5 78,78 78,83.5 73,86" fill={`url(#rightGrad-${boxId})`} />

            {/* Heavy Cross Battens */}
            <polygon points="22,54 52,69.5 86,51.5 56,36" fill={`url(#cleatTop-${boxId})`} />
            <polygon points="22,54 52,69.5 52,72.5 22,57" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="52,69.5 86,51.5 86,54.5 52,72.5" fill={`url(#cleatRight-${boxId})`} />

            {/* 10 Solid Thick Deck Planks */}
            {[
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9
            ].map((idx) => {
              const xStart = 56 + (idx * 2.8) - 13;
              const yStart = 34 + (idx * 1.5);
              return (
                <g key={idx}>
                  <polygon
                    points={`${xStart},${yStart} ${xStart + 2.7},${yStart + 1.4} ${xStart - 31},${yStart + 18} ${xStart - 33.7},${yStart + 16.6}`}
                    fill={`url(#topGrad-${boxId})`}
                  />
                  <polygon
                    points={`${xStart - 33.7},${yStart + 16.6} ${xStart - 31},${yStart + 18} ${xStart - 31},${yStart + 20} ${xStart - 33.7},${yStart + 18.6}`}
                    fill={`url(#leftGrad-${boxId})`}
                  />
                  <polygon
                    points={`${xStart - 31},${yStart + 18} ${xStart + 2.7},${yStart + 1.4} ${xStart + 2.7},${yStart + 3.4} ${xStart - 31},${yStart + 20}`}
                    fill={`url(#rightGrad-${boxId})`}
                  />
                </g>
              );
            })}

            {/* Top Perimeter Highlights */}
            <line x1="56" y1="34" x2="84" y2="48" stroke="#FFF5E0" strokeWidth="0.75" />
            <line x1="22" y1="52" x2="53" y2="68" stroke="#FFF5E0" strokeWidth="0.75" />
          </g>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TYPE 5: SOLID PINE WOOD MACHINERY BOX                         */}
        {/* ------------------------------------------------------------- */}
        {boxId === "type5_solid_pine_box" && (
          <g>
            {/* Ground Shadow */}
            <ellipse cx="50" cy="86" rx="34" ry="8" fill="rgba(80,45,15,0.2)" />

            {/* 2 Heavy Base Skids */}
            <polygon points="26,71 43,81 43,86 26,76" fill={`url(#skidLeft-${boxId})`} />
            <polygon points="43,81 47,78.5 47,83.5 43,86" fill={`url(#skidRight-${boxId})`} />

            <polygon points="53,78.5 70,88.5 70,93.5 53,83.5" fill={`url(#skidLeft-${boxId})`} />
            <polygon points="70,88.5 74,86 74,91 70,93.5" fill={`url(#skidRight-${boxId})`} />

            {/* 100% Solid Timber Planks Body */}
            {/* Left Wall Planks */}
            <polygon points="16,41 50,60.5 50,78 16,58.5" fill={`url(#leftGrad-${boxId})`} />
            {/* Plank Grooves on Left Wall */}
            <line x1="16" y1="46" x2="50" y2="65.5" stroke="#7A4917" strokeWidth="0.7" opacity="0.45" />
            <line x1="16" y1="50.5" x2="50" y2="70" stroke="#7A4917" strokeWidth="0.7" opacity="0.45" />
            <line x1="16" y1="55" x2="50" y2="74.5" stroke="#7A4917" strokeWidth="0.7" opacity="0.45" />

            {/* Right Wall Planks */}
            <polygon points="50,60.5 84,41 84,58.5 50,78" fill={`url(#rightGrad-${boxId})`} />
            {/* Plank Grooves on Right Wall */}
            <line x1="50" y1="65.5" x2="84" y2="46" stroke="#5E330B" strokeWidth="0.7" opacity="0.45" />
            <line x1="50" y1="70" x2="84" y2="50.5" stroke="#5E330B" strokeWidth="0.7" opacity="0.45" />
            <line x1="50" y1="74.5" x2="84" y2="55" stroke="#5E330B" strokeWidth="0.7" opacity="0.45" />

            {/* Solid Timber Corner Battens */}
            <polygon points="15,40.5 18,42 18,59 15,57.5" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="48.5,59.5 50,60.5 50,78 48.5,77" fill={`url(#cleatLeft-${boxId})`} />
            <polygon points="50,60.5 51.5,59.5 51.5,77 50,78" fill={`url(#cleatRight-${boxId})`} />
            <polygon points="82,42 85,40.5 85,57.5 82,59" fill={`url(#cleatRight-${boxId})`} />

            {/* Solid Wood Top Lid with Overhang */}
            <polygon points="50,21 85.5,41 50,61 14.5,41" fill={`url(#topGrad-${boxId})`} />
            <polygon points="14.5,41 50,61 50,63.5 14.5,43.5" fill={`url(#leftGrad-${boxId})`} />
            <polygon points="50,61 85.5,41 85.5,43.5 50,63.5" fill={`url(#rightGrad-${boxId})`} />

            {/* Lid Plank Grooves */}
            <line x1="23.5" y1="36" x2="59" y2="56" stroke="#C99450" strokeWidth="0.65" />
            <line x1="32.5" y1="31" x2="68" y2="51" stroke="#C99450" strokeWidth="0.65" />
            <line x1="41.5" y1="26" x2="77" y2="46" stroke="#C99450" strokeWidth="0.65" />

            {/* 2 Cross Reinforcing Battens on Lid */}
            <polygon points="31,30.5 65,50 62,51.8 28,32.3" fill={`url(#cleatTop-${boxId})`} />
            <polygon points="28,32.3 62,51.8 62,53.5 28,34" fill={`url(#cleatLeft-${boxId})`} />

            <polygon points="41,25 75,44.5 72,46.3 38,26.8" fill={`url(#cleatTop-${boxId})`} />
            <polygon points="38,26.8 72,46.3 72,48 38,28.5" fill={`url(#cleatLeft-${boxId})`} />

            {/* Top Rim Highlights */}
            <line x1="50" y1="21" x2="85.5" y2="41" stroke="#FFF7E6" strokeWidth="0.8" />
            <line x1="14.5" y1="41" x2="50" y2="61" stroke="#FFF7E6" strokeWidth="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
};
