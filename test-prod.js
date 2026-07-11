const https = require('https');

https.get('https://link-indexer-saas-app.vercel.app/dashboard', (res) => {
  let html = '';
  res.on('data', (chunk) => html += chunk);
  res.on('end', () => {
    const jsFiles = html.match(/src="(\/_next\/static\/chunks\/app\/[^"]+\.js)"/g);
    if (!jsFiles) {
      console.log('No JS files found');
      return;
    }
    
    jsFiles.forEach(jsFile => {
      const url = 'https://link-indexer-saas-app.vercel.app' + jsFile.match(/src="([^"]+)"/)[1];
      https.get(url, (res) => {
        let js = '';
        res.on('data', (chunk) => js += chunk);
        res.on('end', () => {
          if (js.includes('/system/details')) {
            console.log(url + ' STILL HAS /system/details');
          } else if (js.includes('"/system"')) {
            console.log(url + ' HAS /system (FIXED)');
          }
        });
      });
    });
  });
});
