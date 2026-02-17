export interface ZoomScoreThreshold {
  zoom: number;
  markerMinScore: number;
  dotMinScore: number;
}

export const ZOOM_SCORE_THRESHOLDS: ZoomScoreThreshold[] = [
  { zoom: 5, markerMinScore: 100, dotMinScore: 50 },
  { zoom: 7, markerMinScore: 50, dotMinScore: 30 },
  { zoom: 9, markerMinScore: 30, dotMinScore: 0 },
  { zoom: 11, markerMinScore: 0, dotMinScore: -50 },
];

export const SHOW_ALL_ZOOM = 13;

const MARKER_RADIUS = 6;
const DOT_RADIUS = 3;
const MARKER_STROKE = 2;
const DOT_STROKE = 0.5;

const scoreExpr: unknown[] = ['coalesce', ['get', 'score'], 0];

function radiusForThreshold(t: ZoomScoreThreshold): unknown[] {
  return [
    'step',
    scoreExpr,
    0,
    t.dotMinScore,
    DOT_RADIUS,
    t.markerMinScore,
    MARKER_RADIUS,
  ];
}

function opacityForThreshold(t: ZoomScoreThreshold): unknown[] {
  return ['step', scoreExpr, 0, t.dotMinScore, 1];
}

function strokeForThreshold(t: ZoomScoreThreshold): unknown[] {
  return [
    'step',
    scoreExpr,
    0,
    t.dotMinScore,
    DOT_STROKE,
    t.markerMinScore,
    MARKER_STROKE,
  ];
}

export function buildCircleRadiusExpression(): unknown[] {
  const result: unknown[] = ['interpolate', ['linear'], ['zoom']];
  for (const t of ZOOM_SCORE_THRESHOLDS) {
    result.push(t.zoom, radiusForThreshold(t));
  }
  result.push(SHOW_ALL_ZOOM, MARKER_RADIUS);
  return result;
}

export function buildCircleOpacityExpression(): unknown[] {
  const first = ZOOM_SCORE_THRESHOLDS[0];
  const result: unknown[] = ['step', ['zoom'], opacityForThreshold(first)];
  for (let i = 1; i < ZOOM_SCORE_THRESHOLDS.length; i++) {
    result.push(
      ZOOM_SCORE_THRESHOLDS[i].zoom,
      opacityForThreshold(ZOOM_SCORE_THRESHOLDS[i]),
    );
  }
  result.push(SHOW_ALL_ZOOM, 1);
  return result;
}

export function buildCircleStrokeWidthExpression(): unknown[] {
  const result: unknown[] = ['interpolate', ['linear'], ['zoom']];
  for (const t of ZOOM_SCORE_THRESHOLDS) {
    result.push(t.zoom, strokeForThreshold(t));
  }
  result.push(SHOW_ALL_ZOOM, MARKER_STROKE);
  return result;
}
