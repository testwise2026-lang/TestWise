import { NextResponse } from 'next/server';

// Polyfills for browser APIs required by pdfjs-dist in Node.js server environments
if (typeof (globalThis as any).DOMMatrix === 'undefined') {
  class NodeDOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;
    isIdentity = true;

    constructor(init?: any) {
      if (Array.isArray(init)) {
        if (init.length === 6) {
          this.a = this.m11 = init[0] ?? 1;
          this.b = this.m12 = init[1] ?? 0;
          this.c = this.m21 = init[2] ?? 0;
          this.d = this.m22 = init[3] ?? 1;
          this.e = this.m41 = init[4] ?? 0;
          this.f = this.m42 = init[5] ?? 0;
        } else if (init.length === 16) {
          this.m11 = this.a = init[0];
          this.m12 = this.b = init[1];
          this.m21 = this.c = init[4];
          this.m22 = this.d = init[5];
          this.m41 = this.e = init[12];
          this.m42 = this.f = init[13];
        }
      } else if (init && typeof init === 'object') {
        this.a = init.a ?? 1;
        this.b = init.b ?? 0;
        this.c = init.c ?? 0;
        this.d = init.d ?? 1;
        this.e = init.e ?? 0;
        this.f = init.f ?? 0;
      }
    }

    translate(x = 0, y = 0) {
      this.e += x;
      this.f += y;
      this.m41 = this.e;
      this.m42 = this.f;
      return this;
    }

    scale(sx = 1, sy = sx) {
      this.a *= sx;
      this.d *= sy;
      this.m11 = this.a;
      this.m22 = this.d;
      return this;
    }

    multiplySelf() { return this; }
    preMultiplySelf() { return this; }
    invertSelf() { return this; }
    setTransform() { return this; }
    getTransform() { return [this.a, this.b, this.c, this.d, this.e, this.f]; }
  }
  (globalThis as any).DOMMatrix = NodeDOMMatrix;
}

if (typeof (globalThis as any).Path2D === 'undefined') {
  class NodePath2D {
    addPath() {}
    closePath() {}
    moveTo() {}
    lineTo() {}
    bezierCurveTo() {}
    quadraticCurveTo() {}
    arc() {}
    arcTo() {}
    ellipse() {}
    rect() {}
  }
  (globalThis as any).Path2D = NodePath2D;
}

if (typeof (globalThis as any).ImageData === 'undefined') {
  class NodeImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
    constructor(w = 1, h = 1) {
      this.width = w;
      this.height = h;
      this.data = new Uint8ClampedArray(w * h * 4);
    }
  }
  (globalThis as any).ImageData = NodeImageData;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Support pdf-parse v2 (PDFParse class) as well as fallback to v1 function
    const pdfParseModule = require('pdf-parse');
    let extractedText = '';

    if (typeof pdfParseModule === 'function') {
      const data = await pdfParseModule(buffer);
      extractedText = data?.text || '';
    } else if (pdfParseModule.PDFParse) {
      const parser = new pdfParseModule.PDFParse({ data: buffer });
      const result = await parser.getText();
      extractedText = result?.text || '';
      if (typeof parser.destroy === 'function') {
        try {
          await parser.destroy();
        } catch {
          // ignore cleanup error
        }
      }
    } else if (typeof pdfParseModule.default === 'function') {
      const data = await pdfParseModule.default(buffer);
      extractedText = data?.text || '';
    } else {
      throw new Error('Unsupported PDF parsing module interface');
    }

    const trimmedText = extractedText.trim();
    if (!trimmedText) {
      return NextResponse.json({
        error: 'No readable text could be extracted from this PDF. Please ensure the document contains selectable text rather than scanned images.'
      }, { status: 400 });
    }

    return NextResponse.json({ text: trimmedText });
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse PDF' }, { status: 500 });
  }
}


