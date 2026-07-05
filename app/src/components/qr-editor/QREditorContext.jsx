import React, { createContext, useContext, useState } from 'react';

const QREditorContext = createContext(null);

export const useQREditor = () => {
  return useContext(QREditorContext);
};

export const QREditorProvider = ({ children }) => {
  // Shape Settings
  const [moduleShape, setModuleShape] = useState('square'); // square, dots, rounded, extra-rounded, classys, horizontal-lines, vertical-lines
  const [markerOuterShape, setMarkerOuterShape] = useState('square');
  const [markerInnerShape, setMarkerInnerShape] = useState('square');

  // Color Settings (Solid or Gradient)
  const [foregroundType, setForegroundType] = useState('solid'); // 'solid' | 'gradient'
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [foregroundGradient, setForegroundGradient] = useState({
    type: 'linear',
    rotation: 135,
    colorStops: [{ offset: 0, color: '#434343' }, { offset: 1, color: '#000000' }]
  });

  const [backgroundType, setBackgroundType] = useState('solid'); // 'solid' | 'gradient'
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundGradient, setBackgroundGradient] = useState({
    type: 'linear',
    rotation: 135,
    colorStops: [{ offset: 0, color: '#ffffff' }, { offset: 1, color: '#e6e6e6' }]
  });

  // Logo & Text Settings
  const [logoImage, setLogoImage] = useState(null); // base64 or url
  const [logoSize, setLogoSize] = useState(50); // 0-100
  const [logoPos, setLogoPos] = useState({ x: 50, y: 50 }); // percentage 0-100
  const [logoStrokeWidth, setLogoStrokeWidth] = useState(5);
  const [logoStrokeColor, setLogoStrokeColor] = useState(null);

  const [textValue, setTextValue] = useState('');
  const [textFont, setTextFont] = useState('Arial');
  const [textColor, setTextColor] = useState(null);
  const [textSize, setTextSize] = useState(30);
  const [textBold, setTextBold] = useState(false);
  const [textPos, setTextPos] = useState({ x: 50, y: 50 }); // percentage 0-100
  const [textStrokeWidth, setTextStrokeWidth] = useState(7);
  const [textStrokeColor, setTextStrokeColor] = useState(null);

  // Spacing (Padding)
  const [padding, setPadding] = useState(15); // 0 - 100

  // Apply a template preset
  const applyPreset = (preset) => {
    if (preset.moduleShape) setModuleShape(preset.moduleShape);
    if (preset.markerOuterShape) setMarkerOuterShape(preset.markerOuterShape);
    if (preset.markerInnerShape) setMarkerInnerShape(preset.markerInnerShape);
    
    if (preset.foregroundType) setForegroundType(preset.foregroundType);
    if (preset.foregroundColor) setForegroundColor(preset.foregroundColor);
    if (preset.foregroundGradient) setForegroundGradient(preset.foregroundGradient);
    
    if (preset.backgroundType) setBackgroundType(preset.backgroundType);
    if (preset.backgroundColor) setBackgroundColor(preset.backgroundColor);
    if (preset.backgroundGradient) setBackgroundGradient(preset.backgroundGradient);
    
    // reset or set logo/text if preset dictates
    if (preset.padding !== undefined) setPadding(preset.padding);
  };

  const value = {
    moduleShape, setModuleShape,
    markerOuterShape, setMarkerOuterShape,
    markerInnerShape, setMarkerInnerShape,
    foregroundType, setForegroundType,
    foregroundColor, setForegroundColor,
    foregroundGradient, setForegroundGradient,
    backgroundType, setBackgroundType,
    backgroundColor, setBackgroundColor,
    backgroundGradient, setBackgroundGradient,
    logoImage, setLogoImage,
    logoSize, setLogoSize,
    logoPos, setLogoPos,
    logoStrokeWidth, setLogoStrokeWidth,
    logoStrokeColor, setLogoStrokeColor,
    textValue, setTextValue,
    textFont, setTextFont,
    textColor, setTextColor,
    textSize, setTextSize,
    textBold, setTextBold,
    textPos, setTextPos,
    textStrokeWidth, setTextStrokeWidth,
    textStrokeColor, setTextStrokeColor,
    padding, setPadding,
    applyPreset
  };

  return (
    <QREditorContext.Provider value={value}>
      {children}
    </QREditorContext.Provider>
  );
};
