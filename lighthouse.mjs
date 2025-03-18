import fetch from 'node-fetch';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'fs';

globalThis.fetch = fetch;

async function generateLighthouseReport(url) {
  const chrome = await launch({ chromeFlags: ['--headless'] });

  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);

  const reportHtml = runnerResult.report;
  fs.writeFileSync('reports/lighthouse-report.html', reportHtml);

  console.log('Lighthouse Performance Score:', runnerResult.lhr.categories.performance.score * 100);
  console.log('Lighthouse Accessibility Score:', runnerResult.lhr.categories.accessibility.score * 100);
  console.log('Lighthouse Seo Score:', runnerResult.lhr.categories.seo.score * 100);
  console.log('Lighthouse best-practices Score:', runnerResult.lhr.categories['best-practices'].score * 100);
  
  console.log('Lighthouse First Contentful Paint:', runnerResult.lhr.audits['first-contentful-paint'].displayValue);
  console.log('Lighthouse Largest Contentful Paint:', runnerResult.lhr.audits['largest-contentful-paint'].displayValue);
  console.log('Lighthouse Total Blocking Time:', runnerResult.lhr.audits['total-blocking-time'].displayValue);
  console.log('Lighthouse Cumulative Layout Shift:', runnerResult.lhr.audits['cumulative-layout-shift'].displayValue);
  console.log('Lighthouse Speed Index:', runnerResult.lhr.audits['speed-index'].displayValue);

  await chrome.kill();
}

const urlToTest = 'https://example.com';
generateLighthouseReport(urlToTest)
  .then(() => console.log('Lighthouse report generated successfully.'))
  .catch(err => console.error('Error generating Lighthouse report:', err));
