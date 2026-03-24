const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  console.log("Navigating to http://localhost:5173...");
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'}).catch(e => console.log('GOTO ERR', e));
  
  console.log("Done. Closing browser...");
  await browser.close();
})();
