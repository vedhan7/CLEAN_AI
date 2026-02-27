const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

  console.log("Navigating to report page...");
  await page.goto('http://localhost:5173/report', { waitUntil: 'networkidle2' });

  // Wait a moment for any async rendering errors to pop up
  await new Promise(resolve => setTimeout(resolve, 2000));

  await browser.close();
  console.log("Done.");
})();
