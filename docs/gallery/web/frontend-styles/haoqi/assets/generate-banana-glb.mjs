import { readFile, writeFile } from "node:fs/promises";
import { DOMParser } from "linkedom";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

const input = new URL("../public/research/source/banana-centerline.svg", import.meta.url);
const output = new URL("../public/research/source/banana-tube.glb", import.meta.url);

globalThis.DOMParser ??= DOMParser;

// GLTFExporter uses FileReader in browsers. This small Node-compatible bridge
// keeps the exporter unchanged and is sufficient for geometry-only GLB files.
globalThis.FileReader ??= class FileReader {
  result = null;
  onloadend = null;
  onerror = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer()
      .then((value) => {
        this.result = value;
        this.onloadend?.({ target: this });
      })
      .catch((error) => this.onerror?.(error));
  }
};

class SvgCurve3 extends THREE.Curve {
  constructor(curve2, curveIndex, curveCount) {
    super();
    this.curve2 = curve2;
    this.curveIndex = curveIndex;
    this.curveCount = curveCount;
  }

  getPoint(t, target = new THREE.Vector3()) {
    const point = this.curve2.getPoint(t);
    const progress = (this.curveIndex + t) / this.curveCount;

    // SOURCE: the original hello.gltf PathGeometry is genuinely three-
    // dimensional. Its control points move roughly from -11.5 to +8.7 on Z,
    // allowing crossing strokes to pass in front of / behind each other.
    // This continuous wave is our own Banana-specific reconstruction. It keeps
    // the front silhouette intact while preventing planar tube intersections.
    const depth =
      15 * Math.sin(progress * Math.PI * 8.0 - 0.5) +
      5 * Math.sin(progress * Math.PI * 17.0 + 0.7);

    // SVG uses a downward-positive Y axis. Flip it for the Three.js scene.
    return target.set(point.x, -point.y, depth);
  }
}

const svg = await readFile(input, "utf8");
const parsed = new SVGLoader().parse(svg);
const subPath = parsed.paths[0]?.subPaths[0];

if (!subPath || subPath.curves.length === 0) {
  throw new Error("No usable centerline path found in the SVG.");
}

const path3 = new THREE.CurvePath();
for (const [index, curve] of subPath.curves.entries()) {
  path3.add(new SvgCurve3(curve, index, subPath.curves.length));
}

// The radius is based on the SVG's 18px preview stroke. High segment counts
// retain the handwriting curves while remaining practical for the web.
const geometry = new THREE.TubeGeometry(path3, 840, 26, 24, false);
geometry.computeBoundingBox();

const bounds = geometry.boundingBox;
const center = new THREE.Vector3();
bounds.getCenter(center);
geometry.translate(-center.x, -center.y, -center.z);
geometry.computeBoundingSphere();
geometry.computeVertexNormals();

const material = new THREE.MeshStandardMaterial({
  color: 0x1435ff,
  roughness: 0.24,
  metalness: 0.04,
});
material.name = "inspection-blue";

const mesh = new THREE.Mesh(geometry, material);
mesh.name = "BananaTube";

const scene = new THREE.Scene();
scene.name = "BananaTubeScene";
scene.add(mesh);

const exporter = new GLTFExporter();
const arrayBuffer = await exporter.parseAsync(scene, {
  binary: true,
  onlyVisible: true,
  truncateDrawRange: true,
});

await writeFile(output, Buffer.from(arrayBuffer));

console.log(JSON.stringify({
  input: input.pathname,
  output: output.pathname,
  curves: subPath.curves.length,
  vertices: geometry.attributes.position.count,
  triangles: geometry.index.count / 3,
  radius: 26,
  tubularSegments: 840,
  radialSegments: 24,
  depthRangeApprox: [-20, 20],
}, null, 2));
