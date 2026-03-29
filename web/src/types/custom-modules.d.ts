declare module 'pdfjs-dist' {
  export function getDocument(src: any): any;
}

declare module '@napi-rs/canvas' {
  export function createCanvas(width: number, height: number): {
    getContext(contextId: '2d'): unknown;
    toBuffer(type?: string): Buffer;
  };
}
