import { jsPDF } from 'jspdf';
import { Contour, Point, DesignParams, ExportOption } from '../types';

/**
 * Generates a PDF as an ArrayBuffer (mm units, exact board size).
 * The caller can download it (web) or save/share it (mobile).
 */
export const generatePDFBytes = (
  contours: Contour[],
  ledPoints: Point[],
  params: DesignParams,
  pixelToMm: number
): ArrayBuffer => {
  const widthMm = params.canvasWidthCm * 10;
  const heightMm = params.canvasHeightCm * 10;
  const ledRadius = params.ledDiameterMm / 2;

  const doc = new jsPDF({
    orientation: widthMm > heightMm ? 'l' : 'p',
    unit: 'mm',
    format: [widthMm, heightMm]
  });

  doc.setLineWidth(0.2);

  // Paths
  if (params.exportOption === ExportOption.PATH_ONLY || params.exportOption === ExportOption.BOTH) {
    doc.setDrawColor(0, 0, 0);
    contours.forEach(contour => {
      if (contour.points.length < 2) return;
      const pts = contour.points.map(p => [p.x * pixelToMm, p.y * pixelToMm] as const);
      for (let i = 0; i < pts.length - 1; i++) {
        doc.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      }
      doc.line(pts[pts.length - 1][0], pts[pts.length - 1][1], pts[0][0], pts[0][1]);
    });
  }

  // LEDs
  if (params.exportOption === ExportOption.LEDS_ONLY || params.exportOption === ExportOption.BOTH) {
    doc.setDrawColor(255, 0, 0);
    doc.setFillColor(255, 0, 0);
    ledPoints.forEach(p => {
      const cx = p.x * pixelToMm;
      const cy = p.y * pixelToMm;
      doc.circle(cx, cy, ledRadius, 'F');
    });
  }

  return doc.output('arraybuffer');
};
