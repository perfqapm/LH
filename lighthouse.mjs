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
  fs.writeFileSync('lighthouse-report.html', reportHtml);

  console.log('Lighthouse Performance Score:', runnerResult.lhr.categories.performance.score * 100);

  await chrome.kill();
}

const urlToTest = 'https://example.com';
generateLighthouseReport(urlToTest)
  .then(() => console.log('Lighthouse report generated successfully.'))
  .catch(err => console.error('Error generating Lighthouse report:', err));
