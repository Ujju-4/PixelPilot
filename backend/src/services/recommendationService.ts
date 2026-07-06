import type { ImageAnalysis, Recommendation } from '../types/image';

export function buildRecommendations(analysis: ImageAnalysis): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (analysis.resolution.isLowResolution) {
    recommendations.push({
      id: 'low-resolution',
      title: 'Low resolution detected',
      description: `The shorter edge is ${Math.min(
        analysis.resolution.width,
        analysis.resolution.height,
      )}px. Upscaling will help this image hold up at larger sizes.`,
      severity: 'important',
    });
  }

  if (analysis.blur.isBlurry) {
    recommendations.push({
      id: 'blur',
      title: 'Image looks soft or out of focus',
      description: `Edge sharpness is low (variance score ${analysis.blur.varianceScore}). Sharpening can recover perceived detail.`,
      severity: 'important',
    });
  }

  if (analysis.noise.isNoisy) {
    recommendations.push({
      id: 'noise',
      title: 'Visible noise or grain detected',
      description: `Noise score ${analysis.noise.score} is above the clean-image threshold. Denoising will smooth this out.`,
      severity: 'suggested',
    });
  }

  if (analysis.exposure.classification === 'underexposed') {
    recommendations.push({
      id: 'underexposed',
      title: 'Image is underexposed',
      description: `Average brightness is ${analysis.exposure.meanBrightness}/255. Lighting correction will brighten shadows.`,
      severity: 'suggested',
    });
  }

  if (analysis.exposure.classification === 'overexposed') {
    recommendations.push({
      id: 'overexposed',
      title: 'Image is overexposed',
      description: `Average brightness is ${analysis.exposure.meanBrightness}/255. Exposure correction will recover blown-out highlights.`,
      severity: 'suggested',
    });
  }

  if (analysis.contrast.isLowContrast) {
    recommendations.push({
      id: 'low-contrast',
      title: 'Flat contrast',
      description: `Tonal spread (stdDev ${analysis.contrast.stdDev}) is low. A contrast boost will add visual depth.`,
      severity: 'suggested',
    });
  }

  if (analysis.rotation.needsCorrection) {
    recommendations.push({
      id: 'rotation',
      title: 'Embedded rotation detected',
      description: `EXIF orientation tag is ${analysis.rotation.exifOrientation}, not the default. Auto-rotation will correct the displayed orientation.`,
      severity: 'info',
    });
  }

  if (analysis.hasAlphaChannel) {
    recommendations.push({
      id: 'has-alpha',
      title: 'Transparent background detected',
      description: 'This image already has an alpha channel, so it is ready for backgrounds work without re-cutting the subject.',
      severity: 'info',
    });
  }

  if (analysis.classification.detectedTypes.includes('portrait')) {
    recommendations.push({
      id: 'portrait-detected',
      title: 'Portrait detected',
      description: 'Skin-tone pixels suggest a portrait or person is present. Background removal will isolate the subject cleanly.',
      severity: 'info',
    });
  }

  if (analysis.classification.detectedTypes.includes('product')) {
    recommendations.push({
      id: 'product-detected',
      title: 'Product image detected',
      description: 'White background with a centered subject. This is ideal for background removal to produce a transparent-cut product shot.',
      severity: 'info',
    });
  }

  if (analysis.classification.detectedTypes.includes('text-document')) {
    recommendations.push({
      id: 'text-detected',
      title: 'Text or document detected',
      description: 'High white-background ratio and minimal colour range suggest a document or text image. Use Extract Text (OCR) to copy its content.',
      severity: 'suggested',
    });
  }

  if (analysis.classification.detectedTypes.includes('screenshot')) {
    recommendations.push({
      id: 'screenshot-detected',
      title: 'Screenshot or UI image detected',
      description: 'Large uniform regions suggest this is a screenshot. Try Extract Text (OCR) if it contains readable text.',
      severity: 'info',
    });
  }

  if (analysis.classification.detectedTypes.includes('empty-space')) {
    recommendations.push({
      id: 'empty-space-detected',
      title: 'Mostly empty or uniform image',
      description: 'Very low tonal range detected — the image may be blank, solid-coloured, or heavily obscured.',
      severity: 'important',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'clean',
      title: 'No issues detected',
      description: 'Resolution, sharpness, noise, exposure, and contrast all look healthy.',
      severity: 'info',
    });
  }

  return recommendations;
}
