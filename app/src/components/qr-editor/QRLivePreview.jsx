import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { useQREditor } from './QREditorContext';

const drawFilledStroke = (targetCtx, sourceCanvas, x, y, strokeRadius) => {
  // Zabezpieczenie przed półprzezroczystymi artefaktami na krawędziach (Utwardzenie kanału Alpha)
  // Wymusza pełną nieprzezroczystość dla wygładzonych pikseli oryginalnego logo przed propagacją obrysu
  const sCtx = sourceCanvas.getContext('2d');
  const imgData = sCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const data = imgData.data;
  for (let i = 3; i < data.length; i += 4) {
    data[i] = data[i] > 10 ? 255 : 0;
  }
  sCtx.putImageData(imgData, 0, 0);

  // Rysujemy po całym promieniu od 1px do strokeRadius, by wypełnić wnętrze obrysu
  // Eliminuje to "dziury" pomiędzy obwodem a oryginalnym obrazem w przypadku cienkich detali.
  for (let r = 1; r <= strokeRadius; r += 1) {
    const steps = Math.max(8, Math.ceil(Math.PI * 2 * r));
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r;
      targetCtx.drawImage(sourceCanvas, x + dx, y + dy);
    }
  }
  // Rysowanie obwodu dla ułamkowych promieni (precyzja krawędzi)
  if (strokeRadius % 1 !== 0 && strokeRadius > 0) {
    const steps = Math.max(8, Math.ceil(Math.PI * 2 * strokeRadius));
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const dx = Math.cos(angle) * strokeRadius;
      const dy = Math.sin(angle) * strokeRadius;
      targetCtx.drawImage(sourceCanvas, x + dx, y + dy);
    }
  }
  // Zamalowanie absolutnego centrum
  targetCtx.drawImage(sourceCanvas, x, y);
};

export default function QRLivePreview({ qrData, externalDesignData = null, renderSize = 1000 }) {
  const canvasRef = useRef(null);
  const contextEditor = useQREditor();
  const editor = externalDesignData || contextEditor;
  const [qrCodeInstance] = useState(() => new QRCodeStyling({
    width: renderSize,
    height: renderSize,
    type: "svg",
    margin: 0,
    qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "H" }, // H for high error correction (better for logos)
  }));

  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      // 1. Zaktualizuj instancję (synchronicznie przed czekaniem)
      const hasOverlay = Boolean(editor.logoImage || (editor.textValue && editor.textValue.trim() !== ''));
      qrCodeInstance.update({
        data: qrData,
        qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: hasOverlay ? "H" : "M" },
        dotsOptions: { 
          type: editor.moduleShape === 'classys' ? 'square' : (editor.moduleShape === 'classy-pt' ? 'square' : editor.moduleShape), 
          color: editor.foregroundType === 'solid' ? editor.foregroundColor : undefined,
          gradient: editor.foregroundType === 'gradient' ? {
            type: editor.foregroundGradient.type,
            rotation: (editor.foregroundGradient.rotation - 90) * Math.PI / 180,
            colorStops: editor.foregroundGradient.colorStops
          } : undefined
        },
        backgroundOptions: { color: "transparent" },
        cornersSquareOptions: { 
          type: editor.markerOuterShape, 
          color: editor.foregroundType === 'solid' ? editor.foregroundColor : undefined 
        },
        cornersDotOptions: { 
          type: editor.markerInnerShape, 
          color: editor.foregroundType === 'solid' ? editor.foregroundColor : undefined 
        }
      });

      // 2. Pobierz obraz QR jako SVG
      let qrImg = null;
      try {
        const blob = await qrCodeInstance.getRawData("svg");
        if (isCancelled) return;
        if (blob) {
          qrImg = new Image();
          const url = URL.createObjectURL(blob);
          await new Promise((resolve) => {
            qrImg.onload = resolve;
            qrImg.onerror = resolve;
            qrImg.src = url;
          });
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error("Błąd podczas pobierania SVG z QRCodeStyling:", err);
      }

      if (isCancelled) return;

      // 3. Załaduj ewentualne logo asynchronicznie
      let logoImg = null;
      if (editor.logoImage) {
        logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve; 
          logoImg.src = editor.logoImage;
        });
      }

      if (isCancelled) return;

      // 4. Dopiero teraz, mając wszystkie zasoby gotowe, czyścimy i rysujemy na canvasie w jednym cyklu synchronicznym
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const size = renderSize;
      canvas.width = size;
      canvas.height = size;

      // --- RYSOWANIE TŁA ---
      if (editor.backgroundType === 'solid') {
        ctx.fillStyle = editor.backgroundColor || '#ffffff';
      } else {
        const grad = editor.backgroundGradient;
        let canvasGrad;
        if (grad.type === 'linear') {
          const angle = grad.rotation * Math.PI / 180;
          const x2 = size/2 + Math.sin(angle) * size/2;
          const y2 = size/2 - Math.cos(angle) * size/2;
          const x1 = size/2 - Math.sin(angle) * size/2;
          const y1 = size/2 + Math.cos(angle) * size/2;
          canvasGrad = ctx.createLinearGradient(x1, y1, x2, y2);
        } else {
          canvasGrad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        }
        grad.colorStops.forEach(stop => canvasGrad.addColorStop(stop.offset, stop.color));
        ctx.fillStyle = canvasGrad;
      }
      ctx.fillRect(0, 0, size, size);

      const getBackgroundFillStyle = () => ctx.fillStyle;

      // --- WARSTWA KODU QR (Dla wycinania obrysów) ---
      const qrLayerCanvas = document.createElement('canvas');
      qrLayerCanvas.width = size;
      qrLayerCanvas.height = size;
      const qrLayerCtx = qrLayerCanvas.getContext('2d');

      if (qrImg) {
        const paddingPixels = (editor.padding / 100) * (size / 2); 
        const qrDrawSize = size - (paddingPixels * 2);
        // Wielokrotne rysowanie niweluje cienkie, półprzezroczyste linie na styku modułów (efekt antyaliasingu wektorów)
        for (let i = 0; i < 5; i++) {
          qrLayerCtx.drawImage(qrImg, paddingPixels, paddingPixels, qrDrawSize, qrDrawSize);
        }
      }

      const useHolePunchForLogo = editor.backgroundType === 'gradient' || !editor.logoStrokeColor;
      const useHolePunchForText = editor.backgroundType === 'gradient' || !editor.textStrokeColor;

      let logoW, logoH, logoX, logoY;
      let textX, textY, textFontSize;

      // --- RYSOWANIE LOGO OBRYS ---
      if (logoImg) {
        const maxLogoSize = size * 0.4;
        const logoSizePx = (editor.logoSize / 100) * maxLogoSize;
        const aspect = logoImg.width / logoImg.height;
        logoW = logoSizePx;
        logoH = logoSizePx;
        if (aspect > 1) logoH = logoW / aspect;
        else logoW = logoH * aspect;

        logoX = (editor.logoPos.x / 100) * size - (logoW / 2);
        logoY = (editor.logoPos.y / 100) * size - (logoH / 2);

        if (editor.logoStrokeWidth > 0) {
          const strokeW = editor.logoStrokeWidth * (size/400);

          const offCanvas = document.createElement('canvas');
          offCanvas.width = logoW;
          offCanvas.height = logoH;
          const offCtx = offCanvas.getContext('2d');
          offCtx.drawImage(logoImg, 0, 0, logoW, logoH);
          offCtx.globalCompositeOperation = 'source-in';
          offCtx.fillStyle = 'black';
          offCtx.fillRect(0, 0, logoW, logoH);

          // Zawsze wycinamy obrys w kropkach QR
          qrLayerCtx.globalCompositeOperation = 'destination-out';
          drawFilledStroke(qrLayerCtx, offCanvas, logoX, logoY, strokeW);
          qrLayerCtx.globalCompositeOperation = 'source-over';

          // Jeśli mamy własny kolor, rysujemy obrys pod spodem (na ctx) przed nałożeniem kropek
          if (!useHolePunchForLogo) {
              const tCtx = offCanvas.getContext('2d');
              tCtx.fillStyle = useHolePunchForLogo ? 'black' : (editor.logoStrokeColor || '#ffffff');
              tCtx.fillRect(0, 0, logoW, logoH);
              
              // Zabezpieczenie przed półprzezroczystymi artefaktami na krawędziach (Utwardzenie kanału Alpha)
              // Konwertuje antyaliasing i cienie oryginalnego logo w twardą maskę o kryciu 100%.
              const imgData = tCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
              const data = imgData.data;
              for (let i = 3; i < data.length; i += 4) {
                  data[i] = data[i] > 10 ? 255 : 0;
              }
              tCtx.putImageData(imgData, 0, 0);
              
              // Wypełniamy obrys od 1px do strokeRadius
              drawFilledStroke(ctx, offCanvas, logoX, logoY, strokeW);
          }
        }
      }

      // --- RYSOWANIE TEKSTU OBRYS ---
      if (editor.textValue) {
        const maxTextSize = size * 0.3;
        textFontSize = (editor.textSize / 100) * maxTextSize;
        textX = (editor.textPos.x / 100) * size;
        textY = (editor.textPos.y / 100) * size;

        if (editor.textStrokeWidth > 0) {
          // Zawsze wycinamy dziurę w kropkach
          qrLayerCtx.globalCompositeOperation = 'destination-out';
          qrLayerCtx.font = `${editor.textBold ? 'bold' : 'normal'} ${textFontSize}px ${editor.textFont}`;
          qrLayerCtx.textAlign = 'center';
          qrLayerCtx.textBaseline = 'middle';
          qrLayerCtx.lineWidth = editor.textStrokeWidth * (size/200);
          qrLayerCtx.lineJoin = 'round';
          qrLayerCtx.strokeStyle = 'black';
          qrLayerCtx.strokeText(editor.textValue, textX, textY);
          qrLayerCtx.globalCompositeOperation = 'source-over';
          
          // Jeśli mamy własny kolor, rysujemy na ctx przed kropkami
          if (!useHolePunchForText) {
            ctx.font = `${editor.textBold ? 'bold' : 'normal'} ${textFontSize}px ${editor.textFont}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.lineWidth = editor.textStrokeWidth * (size/200);
            ctx.lineJoin = 'round';
            ctx.strokeStyle = editor.textStrokeColor;
            ctx.strokeText(editor.textValue, textX, textY);
          }
        }
      }

      // Nanosimy wyciętą (lub nie) warstwę QR na główne płótno
      ctx.drawImage(qrLayerCanvas, 0, 0);

      // --- RYSOWANIE LOGO WŁAŚCIWEGO ---
      if (logoImg) {
        ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
      }

      // --- RYSOWANIE TEKSTU WŁAŚCIWEGO ---
      if (editor.textValue) {
        ctx.font = `${editor.textBold ? 'bold' : 'normal'} ${textFontSize}px ${editor.textFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const defaultFgColor = editor.foregroundType === 'gradient' ? '#000000' : (editor.foregroundColor || '#000000');
        ctx.fillStyle = editor.textColor || defaultFgColor;
        
        if (!editor.textColor && editor.foregroundType === 'gradient') {
           const grad = editor.foregroundGradient;
           const canvasGrad = ctx.createLinearGradient(textX - textFontSize, textY, textX + textFontSize, textY);
           grad.colorStops.forEach(s => canvasGrad.addColorStop(s.offset, s.color));
           ctx.fillStyle = canvasGrad;
        }

        ctx.fillText(editor.textValue, textX, textY);
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [
    qrData,
    editor.moduleShape, editor.markerOuterShape, editor.markerInnerShape,
    editor.foregroundType, editor.foregroundColor, editor.foregroundGradient,
    editor.backgroundType, editor.backgroundColor, editor.backgroundGradient,
    editor.padding,
    editor.logoImage, editor.logoSize, editor.logoPos, editor.logoStrokeWidth, editor.logoStrokeColor,
    editor.textValue, editor.textFont, editor.textColor, editor.textSize, editor.textBold, editor.textPos, editor.textStrokeWidth, editor.textStrokeColor
  ]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full object-contain"
    />
  );
}

export const generateCustomQRDataURL = async (qrData, editor, size = 1024) => {
  const hasOverlay = Boolean(editor.logoImage || (editor.textValue && editor.textValue.trim() !== ''));
  const qrCodeInstance = new QRCodeStyling({
    width: size,
    height: size,
    type: "svg",
    margin: 0,
    qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: hasOverlay ? "H" : "M" },
    data: qrData,
    dotsOptions: { 
      type: editor.moduleShape === 'classys' ? 'square' : (editor.moduleShape === 'classy-pt' ? 'square' : editor.moduleShape), 
      color: editor.foregroundType === 'solid' ? editor.foregroundColor : undefined,
      gradient: editor.foregroundType === 'gradient' ? {
        type: editor.foregroundGradient.type,
        rotation: (editor.foregroundGradient.rotation - 90) * Math.PI / 180,
        colorStops: editor.foregroundGradient.colorStops
      } : undefined
    },
    backgroundOptions: { color: "transparent" },
    cornersSquareOptions: { 
      type: editor.markerOuterShape, 
      color: editor.foregroundType === 'solid' ? editor.foregroundColor : undefined 
    },
    cornersDotOptions: { 
      type: editor.markerInnerShape, 
      color: editor.foregroundType === 'solid' ? editor.foregroundColor : undefined 
    }
  });

  let qrImg = null;
  const blob = await qrCodeInstance.getRawData("svg");
  if (blob) {
    qrImg = new Image();
    const url = URL.createObjectURL(blob);
    await new Promise((resolve) => {
      qrImg.onload = resolve;
      qrImg.onerror = resolve;
      qrImg.src = url;
    });
    URL.revokeObjectURL(url);
  }

  let logoImg = null;
  if (editor.logoImage) {
    logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve; 
      logoImg.src = editor.logoImage;
    });
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (editor.backgroundType === 'solid') {
    ctx.fillStyle = editor.backgroundColor || '#ffffff';
  } else {
    const grad = editor.backgroundGradient;
    let canvasGrad;
    if (grad.type === 'linear') {
      const angle = grad.rotation * Math.PI / 180;
      const x2 = size/2 + Math.sin(angle) * size/2;
      const y2 = size/2 - Math.cos(angle) * size/2;
      const x1 = size/2 - Math.sin(angle) * size/2;
      const y1 = size/2 + Math.cos(angle) * size/2;
      canvasGrad = ctx.createLinearGradient(x1, y1, x2, y2);
    } else {
      canvasGrad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    }
    grad.colorStops.forEach(stop => canvasGrad.addColorStop(stop.offset, stop.color));
    ctx.fillStyle = canvasGrad;
  }
  ctx.fillRect(0, 0, size, size);

  const qrLayerCanvas = document.createElement('canvas');
  qrLayerCanvas.width = size;
  qrLayerCanvas.height = size;
  const qrLayerCtx = qrLayerCanvas.getContext('2d');

  if (qrImg) {
    const paddingPixels = (editor.padding / 100) * (size / 2); 
    const qrDrawSize = size - (paddingPixels * 2);
    // Wielokrotne rysowanie niweluje cienkie, półprzezroczyste linie na styku modułów (efekt antyaliasingu wektorów)
    for (let i = 0; i < 5; i++) {
      qrLayerCtx.drawImage(qrImg, paddingPixels, paddingPixels, qrDrawSize, qrDrawSize);
    }
  }

  const useHolePunchForLogo = editor.backgroundType === 'gradient' || !editor.logoStrokeColor;
  const useHolePunchForText = editor.backgroundType === 'gradient' || !editor.textStrokeColor;

  let logoW, logoH, logoX, logoY;
  let textX, textY, textFontSize;

  if (logoImg) {
    const maxLogoSize = size * 0.4;
    const logoSizePx = (editor.logoSize / 100) * maxLogoSize;
    const aspect = logoImg.width / logoImg.height;
    logoW = logoSizePx;
    logoH = logoSizePx;
    if (aspect > 1) logoH = logoW / aspect;
    else logoW = logoH * aspect;
    logoX = (editor.logoPos.x / 100) * size - (logoW / 2);
    logoY = (editor.logoPos.y / 100) * size - (logoH / 2);

    if (editor.logoStrokeWidth > 0) {
      const strokeW = editor.logoStrokeWidth * (size/400);
      const offCanvas = document.createElement('canvas');
      offCanvas.width = logoW;
      offCanvas.height = logoH;
      const offCtx = offCanvas.getContext('2d');
      offCtx.drawImage(logoImg, 0, 0, logoW, logoH);
      offCtx.globalCompositeOperation = 'source-in';
      offCtx.fillStyle = 'black';
      offCtx.fillRect(0, 0, logoW, logoH);

      qrLayerCtx.globalCompositeOperation = 'destination-out';
      drawFilledStroke(qrLayerCtx, offCanvas, logoX, logoY, strokeW);
      qrLayerCtx.globalCompositeOperation = 'source-over';

      if (!useHolePunchForLogo) {
        offCtx.fillStyle = editor.logoStrokeColor;
        offCtx.fillRect(0, 0, logoW, logoH);
        drawFilledStroke(ctx, offCanvas, logoX, logoY, strokeW);
      }
    }
  }

  if (editor.textValue) {
    const maxTextSize = size * 0.3;
    textFontSize = (editor.textSize / 100) * maxTextSize;
    textX = (editor.textPos.x / 100) * size;
    textY = (editor.textPos.y / 100) * size;

    if (editor.textStrokeWidth > 0) {
      qrLayerCtx.globalCompositeOperation = 'destination-out';
      qrLayerCtx.font = `${editor.textBold ? 'bold' : 'normal'} ${textFontSize}px ${editor.textFont}`;
      qrLayerCtx.textAlign = 'center';
      qrLayerCtx.textBaseline = 'middle';
      qrLayerCtx.lineWidth = editor.textStrokeWidth * (size/200);
      qrLayerCtx.lineJoin = 'round';
      qrLayerCtx.strokeStyle = 'black';
      qrLayerCtx.strokeText(editor.textValue, textX, textY);
      qrLayerCtx.globalCompositeOperation = 'source-over';
      
      if (!useHolePunchForText) {
        ctx.font = `${editor.textBold ? 'bold' : 'normal'} ${textFontSize}px ${editor.textFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = editor.textStrokeWidth * (size/200);
        ctx.lineJoin = 'round';
        ctx.strokeStyle = editor.textStrokeColor;
        ctx.strokeText(editor.textValue, textX, textY);
      }
    }
  }

  ctx.drawImage(qrLayerCanvas, 0, 0);

  if (logoImg) {
    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
  }

  if (editor.textValue) {
    ctx.font = `${editor.textBold ? 'bold' : 'normal'} ${textFontSize}px ${editor.textFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const defaultFgColor = editor.foregroundType === 'gradient' ? '#000000' : (editor.foregroundColor || '#000000');
    ctx.fillStyle = editor.textColor || defaultFgColor;
    if (!editor.textColor && editor.foregroundType === 'gradient') {
       const grad = editor.foregroundGradient;
       const canvasGrad = ctx.createLinearGradient(textX - textFontSize, textY, textX + textFontSize, textY);
       grad.colorStops.forEach(s => canvasGrad.addColorStop(s.offset, s.color));
       ctx.fillStyle = canvasGrad;
    }
    ctx.fillText(editor.textValue, textX, textY);
  }

  return canvas.toDataURL('image/png', 1.0);
};
