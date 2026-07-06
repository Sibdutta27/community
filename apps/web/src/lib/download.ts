import { toBlob, toPng } from "html-to-image";
import { jsPDF } from "jspdf";

/** Triggers a browser download for a Blob via a temporary object URL. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// 2x pixel ratio keeps the exported card crisp; cacheBust dodges stale
// cross-origin image caching that can taint the canvas.
const exportOptions = { pixelRatio: 2, cacheBust: true } as const;

/** Rasterizes a DOM node to a PNG Blob. Throws if the canvas is tainted. */
export async function exportNodeToPng(node: HTMLElement): Promise<Blob> {
  const blob = await toBlob(node, exportOptions);

  if (!blob) {
    throw new Error("Failed to render the card image.");
  }

  return blob;
}

/**
 * Rasterizes a DOM node and wraps it in a single-page PDF sized to the node's
 * own pixel dimensions (so the card keeps its aspect ratio).
 */
export async function exportNodeToPdf(node: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(node, exportOptions);
  const width = node.offsetWidth;
  const height = node.offsetHeight;

  const pdf = new jsPDF({
    orientation: width >= height ? "landscape" : "portrait",
    unit: "px",
    format: [width, height],
  });
  pdf.addImage(dataUrl, "PNG", 0, 0, width, height);

  return pdf.output("blob");
}
