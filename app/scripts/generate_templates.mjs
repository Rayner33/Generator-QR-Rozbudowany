import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";
const dom = new JSDOM();
global.window = dom.window;
global.document = dom.window.document;
import QRCodeStyling from "qr-code-styling";
import { qrTemplates } from "../src/components/qr-editor/qr-templates.js";

async function generate() {
  if (!fs.existsSync("../public/templates")) fs.mkdirSync("../public/templates", { recursive: true });
  for (const t of qrTemplates) {
    const margin = 15 / 100 * 120;
    const fgGradient = t.foregroundType === "gradient" ? {
      type: t.foregroundGradient?.type || "linear",
      rotation: ((t.foregroundGradient?.rotation !== undefined ? t.foregroundGradient?.rotation : 135) - 90) * Math.PI / 180,
      colorStops: t.foregroundGradient?.colorStops || []
    } : undefined;
    const bgGradient = t.backgroundType === "gradient" ? {
      type: t.backgroundGradient?.type || "linear",
      rotation: ((t.backgroundGradient?.rotation !== undefined ? t.backgroundGradient?.rotation : 135) - 90) * Math.PI / 180,
      colorStops: t.backgroundGradient?.colorStops || []
    } : undefined;
    const qrCode = new QRCodeStyling({
      width: 240,
      height: 240,
      type: "svg",
      data: "https://qrc-ai.com",
      margin: margin / 2,
      qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "L" },
      dotsOptions: {
        type: t.moduleShape === "classys" ? "square" : (t.moduleShape === "classy-pt" ? "square" : t.moduleShape),
        color: t.foregroundType === "solid" ? t.foregroundColor : undefined,
        gradient: fgGradient
      },
      backgroundOptions: { color: "transparent" },
      cornersSquareOptions: {
        type: t.markerOuterShape,
        color: t.foregroundType === "solid" ? t.foregroundColor : undefined
      },
      cornersDotOptions: {
        type: t.markerInnerShape,
        color: t.foregroundType === "solid" ? t.foregroundColor : undefined
      }
    });
    const blob = await qrCode.getRawData("svg");
    let svgText = await blob.text();
    const moduleType = t.moduleShape === "classys" ? "square" : (t.moduleShape === "classy-pt" ? "square" : t.moduleShape);
    let css = "";
    if (moduleType === "square") css += "rect { shape-rendering: crispEdges; } ";
    if (t.markerOuterShape === "square") css += "[id^=\"clip-path-corners-square-color\"] path { shape-rendering: crispEdges; } ";
    if (t.markerInnerShape === "square") css += "[id^=\"clip-path-corners-dot-color\"] path, [id^=\"clip-path-corners-dot-color\"] rect { shape-rendering: crispEdges; } ";
    if (css) svgText = svgText.replace(/<svg([^>]*)>/, `<svg$1><style>${css}</style>`);
    fs.writeFileSync(`../public/templates/${t.id}.svg`, svgText);
    console.log(`Generated ${t.id}.svg`);
  }
}
generate().catch(console.error);
