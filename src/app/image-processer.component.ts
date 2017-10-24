import { Component } from '@angular/core';

@Component({
  selector: 'image-processor',
  templateUrl: './image-processor.component.html',
  styleUrls: ['./app.component.css']
})

export class ImageProcessorComponent {
  const compositeCanvasHeight = 200;
  const compositeCanvasWidth = 200;

  imageProcessor.hexToRgb(hex) {
    // Expand shorthand form (e.g. '03F') to full form (e.g. '0033FF')
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  thresholdImage(imgEl, colorHexCode, threshold) {
    let binaryCanvas = document.createElement('canvas');
    binaryCanvas.width = imgEl.width;
    binaryCanvas.height = imgEl.height;
    let binaryCanvasContext = binaryCanvas.getContext('2d');
    binaryCanvasContext.drawImage(imgEl.getElement(), 0, 0, imgEl.width,
        imgEl.height);
    let imageData = binaryCanvasContext.getImageData(0, 0, imgEl.width,
        imgEl.height);
    let data = imageData.data;
    let rgbData = this.hexToRgb(colorHexCode);

    for (var i = 0; i < data.length; i += 4) {
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ?
          255 : 0;

      if (v === 255) {
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 0;
      } else {
        data[i] = rgbData.r;
        data[i + 1] = rgbData.g;
        data[i + 2] = rgbData.b;
      }
    }

    binaryCanvasContext.putImageData(imageData, 0, 0);

    return binaryCanvas;
  };

   compositeImage(trimmingImage, customizedImage,
      fileData, compositeType) {
    let compositeCanvas = document.createElement('canvas');

    if (fileData.width > this.compositeCanvasWidth &&
        fileData.height > this.compositeCanvasHeight) {
      compositeCanvas.height = fileData.h;
      compositeCanvas.width = fileData.w;
    } else {
      compositeCanvas.height = this.compositeCanvasHeight;
      compositeCanvas.width = this.compositeCanvasWidth;
    }

    let ctx = compositeCanvas.getContext('2d');
    ctx.drawImage(trimmingImage, 0, 0, this.compositeCanvasWidth,
        this.compositeCanvasHeight);
    let compositeImageData = ctx.getImageData(0, 0, this.compositeCanvasWidth,
        this.compositeCanvasHeight);
    let operation;

    if (compositeType === 'trimming') {
      var d = compositeImageData.data;

      for (var i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) {
          d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 255;
        } else {
          d[i + 3] = 0;
        }
      }
    }

    switch (compositeType) {
      case 'trimming':
      case 'texture-stamp':
        operation = 'source-in';
        break;

      case 'texture':
        operation = 'destination-in';
        break;

      default:
        break;
    }

    ctx.save();
    ctx.putImageData(compositeImageData, 0, 0);
    ctx.globalCompositeOperation = operation;
    ctx.translate(fileData.w / 2 + fileData.x, fileData.h / 2 + fileData.y);
    ctx.rotate(fileData.rotate * Math.PI / 180);
    // draw the image.
    // since the context is rotated, the image will be rotated as well.
    ctx.drawImage(customizedImage, -(fileData.w / 2), -(fileData.h / 2),
        fileData.w, fileData.h);
    ctx.restore();

    let trimmed = ctx.getImageData(0, 0, this.compositeCanvasWidth,
        this.compositeCanvasHeight);
    let targetCtx = document.createElement('canvas').getContext('2d');
    targetCtx.canvas.width = this.compositeCanvasWidth;
    targetCtx.canvas.height = this.compositeCanvasHeight;
    targetCtx.putImageData(trimmed, 0, 0);

    return targetCtx.canvas;
  };
}
