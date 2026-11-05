/* Cubism motion3 curve evaluation shared by the viewer and its Core validation. */
(function (root) {
  'use strict';
  const cubic = (a, b, c, d, t) => {
    const s = 1 - t;
    return s * s * s * a + 3 * s * s * t * b + 3 * s * t * t * c + t * t * t * d;
  };
  function compile(data) {
    return {
      duration: data.Meta.Duration,
      curves: data.Curves.map(curve => {
        if (curve.Target !== 'Parameter') throw new Error('Unsupported motion target: ' + curve.Target);
        const s = curve.Segments, segments = [];
        let start = [s[0], s[1]];
        for (let i = 2; i < s.length;) {
          const type = s[i++];
          if (type === 1) {
            const points = [start, [s[i], s[i + 1]], [s[i + 2], s[i + 3]], [s[i + 4], s[i + 5]]];
            segments.push({type, points}); start = points[3]; i += 6;
          } else {
            if (![0, 2, 3].includes(type)) throw new Error('Unsupported segment type: ' + type);
            const end = [s[i], s[i + 1]];
            segments.push({type, points: [start, end]}); start = end; i += 2;
          }
        }
        return {id: curve.Id, first: [s[0], s[1]], segments};
      }),
    };
  }
  function value(curve, time) {
    if (time <= curve.first[0]) return curve.first[1];
    for (const segment of curve.segments) {
      const p = segment.points, end = p[p.length - 1];
      if (time > end[0]) continue;
      if (segment.type === 2) return p[0][1];
      if (segment.type === 3) return end[1];
      if (segment.type === 0) {
        const t = end[0] === p[0][0] ? 1 : (time - p[0][0]) / (end[0] - p[0][0]);
        return p[0][1] + (end[1] - p[0][1]) * t;
      }
      // Motion3 Bezier control-point times need not be equally spaced.
      let lo = 0, hi = 1;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (cubic(p[0][0], p[1][0], p[2][0], p[3][0], mid) < time) lo = mid;
        else hi = mid;
      }
      return cubic(p[0][1], p[1][1], p[2][1], p[3][1], (lo + hi) / 2);
    }
    const last = curve.segments[curve.segments.length - 1];
    return last ? last.points[last.points.length - 1][1] : curve.first[1];
  }
  function apply(raw, motion, time, indices) {
    for (const curve of motion.curves) {
      const i = indices.get(curve.id);
      if (i === undefined) throw new Error('Motion references unknown parameter: ' + curve.id);
      raw.parameters.values[i] = value(curve, time);
    }
  }
  root.Live2DMotion = {compile, value, apply};
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Live2DMotion;
})(typeof globalThis !== 'undefined' ? globalThis : this);
