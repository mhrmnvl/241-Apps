import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generatePdf(html: string): Promise<Buffer> {
    this.logger.log('Launching headless browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      this.logger.log('Creating new browser page...');
      const page = await browser.newPage();

      this.logger.log('Setting page content...');
      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      this.logger.log('Generating PDF buffer...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      this.logger.log('Closing browser...');
      await browser.close();
    }
  }
}
