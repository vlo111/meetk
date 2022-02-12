const fs = require('fs');

let html = fs.readFileSync('./build/index.html', 'utf-8');
const time = new Date().getTime();
html = html.replace(/\.js"/g, `.js?t=${time}"`);
html = html.replace(/\.css"/g, `.css?t=${time}"`);

fs.writeFileSync('./build/index.html', html);
