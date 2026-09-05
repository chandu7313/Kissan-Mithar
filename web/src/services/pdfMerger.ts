import { PDFDocument } from 'pdf-lib';

export class PdfMerger {
  /**
   * Merges two or more PDF ArrayBuffers into a single PDF Document.
   * 
   * @param generatedPdfBuffer The ArrayBuffer of the system-generated PDF report.
   * @param uploadedPdfBuffer The ArrayBuffer of the uploaded external PDF file.
   * @returns A Uint8Array representing the fully merged PDF.
   */
  static async mergePdfs(generatedPdfBuffer: ArrayBuffer, uploadedPdfBuffer: ArrayBuffer): Promise<Uint8Array> {
    // 1. Create a new empty PDF
    const mergedPdf = await PDFDocument.create();

    // 2. Load the generated PDF
    const generatedDoc = await PDFDocument.load(generatedPdfBuffer);
    const generatedPages = await mergedPdf.copyPages(generatedDoc, generatedDoc.getPageIndices());
    
    // Add all pages from the generated PDF to the merged PDF
    generatedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });

    // 3. Load the uploaded PDF
    const uploadedDoc = await PDFDocument.load(uploadedPdfBuffer);
    const uploadedPages = await mergedPdf.copyPages(uploadedDoc, uploadedDoc.getPageIndices());

    // Add all pages from the uploaded PDF to the merged PDF
    uploadedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });

    // 4. Save the merged PDF and return as Uint8Array
    return await mergedPdf.save();
  }
}
