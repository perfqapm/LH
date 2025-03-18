import fetch from 'node-fetch';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'fs';

globalThis.fetch = fetch;
let performanceScore;
let firstContentfulPaint;

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

  performanceScore = runnerResult.lhr.categories.performance.score * 100;
  console.log('Lighthouse Performance Score:', performanceScore);

  firstContentfulPaint = runnerResult.lhr.audits['first-contentful-paint'].displayValue;
  console.log('Lighthouse First Contentful Paint:', firstContentfulPaint);
  
  // Read the existing .env file
  const envFilePath = '.env';
  const envFileContent = fs.readFileSync(envFilePath, 'utf8');
  
  // Define the dynamic variable and its value
  const dynamicVariableName = 'performanceScore';
  const dynamicVariableValue = performanceScore;
  const dynamicVariableName1 = 'firstContentfulPaint';
  const dynamicVariableValue1 = firstContentfulPaint;
  
  // Create or update the dynamic variable in the .env file content
  let updatedEnvFileContent = '';
  if (envFileContent.includes(dynamicVariableName) || envFileContent.includes(dynamicVariableName1)) {
  // If the variable already exists, update its value
  const regex = new RegExp(`${dynamicVariableName}=.*\n${dynamicVariableName1}=.*\n${dynamicVariableName2}=.*`);
  updatedEnvFileContent = envFileContent.replace(regex, `${dynamicVariableName}=${dynamicVariableValue}\n${dynamicVariableName1}=${dynamicVariableValue1}`);
  } else {
  // If the variable does not exist, append it to the content
  updatedEnvFileContent = `${envFileContent}\n${dynamicVariableName}=${dynamicVariableValue}\n${dynamicVariableName1}=${dynamicVariableValue1}`;
  }
  // Write the updated .env file content
  fs.writeFileSync(envFilePath, updatedEnvFileContent);
  console.log('Lighthouse Accessibility Score:', runnerResult.lhr.categories.accessibility.score * 100);
  console.log('Lighthouse Seo Score:', runnerResult.lhr.categories.seo.score * 100);
  console.log('Lighthouse best-practices Score:', runnerResult.lhr.categories['best-practices'].score * 100);
  
  
  console.log('Lighthouse Largest Contentful Paint:', runnerResult.lhr.audits['largest-contentful-paint'].displayValue);
  console.log('Lighthouse Total Blocking Time:', runnerResult.lhr.audits['total-blocking-time'].displayValue);
  console.log('Lighthouse Cumulative Layout Shift:', runnerResult.lhr.audits['cumulative-layout-shift'].displayValue);
  console.log('Lighthouse Speed Index:', runnerResult.lhr.audits['speed-index'].displayValue);

  await chrome.kill();
}

const urlToTest = 'https://www.robosoftin.com/';
generateLighthouseReport(urlToTest)
  .then(() => console.log('Lighthouse report generated successfully.'))
  .catch(err => console.error('Error generating Lighthouse report:', err));
