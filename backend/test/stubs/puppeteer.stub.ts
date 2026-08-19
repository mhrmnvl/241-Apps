/**
 * Stands in for `puppeteer` under Jest.
 *
 * The package is ESM-only and Jest cannot transform it, so importing anything
 * that reaches `PdfService` — which is to say the whole `ReportCardModule`,
 * because its controller imports the PDF export use case — fails at parse time
 * with `SyntaxError: Unexpected token 'export'`. That put the report-card
 * module out of reach of any end-to-end test, including the one guarding who
 * may read whose marks.
 *
 * Mapping the package here lets a spec import the real module graph and stub
 * only the leaf, the same trick `file-type.stub.ts` plays.
 *
 * Nothing asserts on puppeteer's behaviour, and `launch` deliberately rejects:
 * a test that renders a PDF by accident should fail loudly rather than hang
 * waiting for a browser that was never going to start.
 */
export default {
  launch(): Promise<never> {
    return Promise.reject(
      new Error(
        'puppeteer is stubbed under Jest — a test reached real PDF rendering',
      ),
    );
  },
};
