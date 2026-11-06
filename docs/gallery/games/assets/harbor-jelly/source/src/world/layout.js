// Layout of the diorama. One unit ≈ one metre-ish of toy. Seen from the default camera the
// south-west corner (-x, +z) is closest; the land is a strip along the east edge.
export const HALF = 20; // block is 40 × 40
export const QX = 9; // quay face (land for x > QX)
export const LAND_Y = 1.3; // top of the land
export const FLOOR_Y = -4.2; // sea floor
export const BOTTOM_Y = -9.6; // underside of the block

export const WATER = {
  x0: -HALF,
  x1: QX,
  z0: -HALF,
  z1: HALF,
  cx: (QX - HALF) / 2,
  cz: 0,
};

// berth for the cargo ship (ship centre, heading +z)
export const BERTH = { x: QX - 2.25, z: -9.6 };
export const SHIP_ROWS = { n: 7, pitch: 1.58 };
export function shipRowZ(r) { return (r - (SHIP_ROWS.n - 1) / 2) * SHIP_ROWS.pitch; }
function BERTH_Z_ROW(r) { return BERTH.z + shipRowZ(r); }
// cranes stand over deck rows 1 and 5 of the docked ship (row pitch 1.58, rows centred on the ship)
export const CRANE_Z = [BERTH_Z_ROW(1), BERTH_Z_ROW(5)];
export const YARD = { x0: QX + 5.4, x1: HALF - 0.6, z0: -19.4, z1: -4.2 };
export const TOWN = { z0: -3.2, z1: HALF - 0.4 };

export const PIER = { z: 14.2, x0: -0.6, x1: QX, width: 1.7, y: 0.95 };
export const LIGHTHOUSE = { x: -1.8, z: 14.2 };
export const PLATFORM = { x: QX - 1.6, z: 9.4 };
