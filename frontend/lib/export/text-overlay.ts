import type { PosterConfig } from '@/types/poster';
import { formatCoordinates, formatDistance, formatElevation, hexToRgba } from '../utils';
import { getScrimAlpha, calculateScrimHeight, getBackdropGradientStyles } from '../styles/backdrop';
import { drawTextWithHalo } from './drawing';

export function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  config: PosterConfig,
  exportWidth: number,
  exportHeight: number,
  exportScale: number
) {
  const { typography, location, palette } = config;

  ctx.fillStyle = palette.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const rawTitleText = String(location.name || 'WHERE WE MET');
  const titleText = typography.titleAllCaps !== false ? rawTitleText.toUpperCase() : rawTitleText;
  const subtitleText = String(location.city || '').toUpperCase();

  // Show route stats if route data exists, otherwise show coordinates
  const hasRoute = config.route?.data != null;
  const stats = config.route?.data?.stats;
  const infoText = hasRoute && stats
    ? `${formatDistance(stats.distance)} • ${formatElevation(stats.elevationGain)}`
    : formatCoordinates(location.center);

  const showTitle = typography.showTitle !== false;
  const showSubtitle = typography.showSubtitle !== false && !!subtitleText;
  const showCoords = typography.showCoordinates !== false;

  const titleSizePx = Math.round(exportWidth * (typography.titleSize / 100));
  const subtitleSizePx = Math.round(exportWidth * (typography.subtitleSize / 100));
  const coordsSizePx = Math.round(subtitleSizePx * 0.65);

  const marginPercent = config.format.margin;
  const backdropType = typography.textBackdrop || 'gradient';

  // ============================================
  // STEP 1: Calculate title lines (for wrapping)
  // ============================================
  let titleLines: string[] = [];
  const titleLineHeight = titleSizePx * 1.15;
  const letterSpacingEm = typography.titleLetterSpacing || 0;

  if (showTitle) {
    // Match editor's padding: (margin + 4)cqw on each side
    const effectiveMaxWidthPercent = typography.maxWidth ?? (100 - 2 * marginPercent - 8);
    const maxTitleWidth = exportWidth * (effectiveMaxWidthPercent / 100);

    ctx.font = `${typography.titleWeight} ${titleSizePx}px "${typography.titleFont}"`;
    const letterSpacingPx = letterSpacingEm * titleSizePx;

    const measureTextWithSpacing = (text: string): number => {
      const baseWidth = ctx.measureText(text).width;
      const spacingWidth = text.length > 0 ? (text.length - 1) * letterSpacingPx : 0;
      return baseWidth + spacingWidth;
    };

    const fullTitleWidth = measureTextWithSpacing(titleText);

    if (fullTitleWidth > maxTitleWidth) {
      const words = titleText.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = measureTextWithSpacing(testLine);

        if (testWidth > maxTitleWidth && currentLine) {
          titleLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) titleLines.push(currentLine);
    } else {
      titleLines = [titleText];
    }
  }

  // ============================================
  // STEP 2: Calculate total content height
  // (This mirrors how CSS flexbox calculates height)
  // ============================================
  const titleTotalHeight = showTitle ? titleLines.length * titleLineHeight : 0;

  // Spacing from editor: marginTop: '0.75rem' on subtitle ≈ titleSizePx * 0.5
  const gapTitleToSubtitle = showTitle && showSubtitle ? titleSizePx * 0.5 : 0;
  const subtitleHeight = showSubtitle ? subtitleSizePx : 0;

  // Spacing from editor: marginTop: '0.5cqw' on coords ≈ subtitleSizePx * 0.7
  const gapSubtitleToCoords = showSubtitle && showCoords ? subtitleSizePx * 0.7 :
                              showTitle && showCoords ? titleSizePx * 0.5 : 0;
  const coordsHeight = showCoords ? coordsSizePx : 0;

  const totalContentHeight = titleTotalHeight + gapTitleToSubtitle + subtitleHeight + gapSubtitleToCoords + coordsHeight;

  // ============================================
  // STEP 3: Calculate starting Y position
  // (Based on typography.position - top/center/bottom)
  // ============================================
  let blockStartY: number;

  if (typography.position === 'top') {
    // Start from top with margin padding
    blockStartY = exportWidth * ((marginPercent + 3) / 100);
  } else if (typography.position === 'bottom') {
    // Position so content ends at bottom with margin padding
    const bottomPadding = exportWidth * ((marginPercent + 5) / 100);
    blockStartY = exportHeight - bottomPadding - totalContentHeight;
  } else {
    // Center vertically
    blockStartY = (exportHeight - totalContentHeight) / 2;
  }

  // ============================================
  // STEP 4: Draw backdrop/scrim
  // ============================================
  const scrimAlpha = getScrimAlpha(typography);
  const scrimHeight = calculateScrimHeight(config, true, exportScale, exportHeight) as number;

  if (backdropType !== 'none') {
    const isGradient = backdropType === 'gradient';

    ctx.save();
    if (typography.position === 'center' && !isGradient) {
      const yCenter = exportHeight / 2;
      const yTop = Math.max(0, Math.round(yCenter - scrimHeight / 2));
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = hexToRgba(palette.background, backdropType === 'strong' ? 0.95 : 0.78);

      const radius = Math.round(scrimHeight * 0.2);
      ctx.font = `${typography.titleWeight} ${titleSizePx}px ${typography.titleFont}`;
      const titleWidth = ctx.measureText(titleText).width;

      let maxTextWidth = 0;
      if (showTitle) maxTextWidth = titleWidth;
      if (showSubtitle) {
        ctx.font = `${subtitleSizePx}px ${typography.subtitleFont}`;
        const subWidth = ctx.measureText(subtitleText).width + (subtitleText.length - 1) * 0.2 * subtitleSizePx + (exportWidth * 0.16);
        maxTextWidth = Math.max(maxTextWidth, subWidth);
      }
      if (showCoords) {
        ctx.font = `${coordsSizePx}px ${typography.subtitleFont}`;
        maxTextWidth = Math.max(maxTextWidth, ctx.measureText(infoText).width);
      }

      const rectWidth = Math.min(exportWidth * 0.9, maxTextWidth * 1.2 + 40);
      const xLeft = (exportWidth - rectWidth) / 2;

      ctx.beginPath();
      ctx.roundRect(xLeft, yTop, rectWidth, scrimHeight, radius);
      ctx.fill();
      if (backdropType === 'strong') {
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 25 * exportScale;
        ctx.shadowOffsetY = 10 * exportScale;
        ctx.stroke();
      }
    } else {
      const isTop = typography.position === 'top';
      const yTop = isTop ? 0 : exportHeight - scrimHeight;
      const gradientDef = getBackdropGradientStyles(config, scrimAlpha);

      let gradient: CanvasGradient;
      if (gradientDef?.direction === 'to top') {
        gradient = ctx.createLinearGradient(0, yTop + scrimHeight, 0, yTop);
      } else {
        gradient = ctx.createLinearGradient(0, yTop, 0, yTop + scrimHeight);
      }

      if (gradientDef) {
        const bg = palette.background;
        gradientDef.stops.forEach(stop => {
          gradient.addColorStop(stop.pos, hexToRgba(bg, stop.alpha));
        });
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, yTop, exportWidth, scrimHeight);
    }
    ctx.restore();
  }

  // ============================================
  // STEP 5: Draw elements in flow order (top to bottom)
  // ============================================
  let currentY = blockStartY;

  // Draw Title
  if (showTitle && titleLines.length > 0) {
    // First line starts at currentY + half line height (for middle baseline)
    let lineY = currentY + titleLineHeight / 2;

    for (const line of titleLines) {
      drawTextWithHalo(ctx, line, exportWidth / 2, lineY, titleSizePx, {
        weight: typography.titleWeight,
        letterSpacing: letterSpacingEm,
        fontFamily: typography.titleFont,
        haloColor: palette.background,
        textColor: palette.text,
        showHalo: backdropType !== 'gradient' && backdropType !== 'none'
      });
      lineY += titleLineHeight;
    }

    currentY += titleTotalHeight + gapTitleToSubtitle;
  }

  // Draw Subtitle
  if (showSubtitle) {
    const subtitleY = currentY + subtitleHeight / 2;

    const tracking = 0.2;
    ctx.font = `${subtitleSizePx}px ${typography.subtitleFont}`;
    const textWidth = ctx.measureText(subtitleText).width + (subtitleText.length - 1) * tracking * subtitleSizePx;
    const lineWidth = exportWidth * 0.06;
    const lineGap = exportWidth * 0.02;

    ctx.save();
    ctx.strokeStyle = palette.text;
    ctx.lineWidth = Math.max(1, Math.round(exportScale * 1.5));
    ctx.globalAlpha = 0.4;

    ctx.beginPath();
    ctx.moveTo(exportWidth / 2 - textWidth / 2 - lineGap - lineWidth, subtitleY);
    ctx.lineTo(exportWidth / 2 - textWidth / 2 - lineGap, subtitleY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(exportWidth / 2 + textWidth / 2 + lineGap, subtitleY);
    ctx.lineTo(exportWidth / 2 + textWidth / 2 + lineGap + lineWidth, subtitleY);
    ctx.stroke();
    ctx.restore();

    drawTextWithHalo(ctx, subtitleText, exportWidth / 2, subtitleY, subtitleSizePx, {
      opacity: 0.9,
      letterSpacing: tracking,
      fontFamily: typography.subtitleFont,
      haloColor: palette.background,
      textColor: palette.text,
      showHalo: backdropType !== 'gradient' && backdropType !== 'none'
    });

    currentY += subtitleHeight + gapSubtitleToCoords;
  } else if (showTitle && showCoords) {
    // If no subtitle but have title and coords, add the gap
    currentY += gapSubtitleToCoords;
  }

  // Draw Coordinates/Stats
  if (showCoords) {
    const coordsY = currentY + coordsHeight / 2;

    drawTextWithHalo(ctx, infoText, exportWidth / 2, coordsY, coordsSizePx, {
      opacity: 0.6,
      letterSpacing: 0.1,
      fontFamily: typography.subtitleFont,
      haloColor: palette.background,
      textColor: palette.text,
      showHalo: backdropType !== 'gradient' && backdropType !== 'none'
    });
  }
}
