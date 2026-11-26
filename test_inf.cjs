const crypto = require('crypto');
const http = require('http');

function checkUrl(path) {
  return new Promise((resolve) => {
    http.get('http://Renato-NBA-HUB.infinityfreeapp.com' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = [...data.matchAll(/toNumbers\(["']([a-f0-9]+)["']\)/g)].map(m => m[1]);
        if (matches.length < 3) {
          resolve({ path, status: res.statusCode, body: data.slice(0, 200) });
          return;
        }
        const key = Buffer.from(matches[0], 'hex');
        const iv = Buffer.from(matches[1], 'hex');
        const ciphertext = Buffer.from(matches[2], 'hex');
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        decipher.setAutoPadding(false);
        const cookie = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('hex');

        http.get('http://Renato-NBA-HUB.infinityfreeapp.com' + path, {
          headers: {
            'Cookie': '__test=' + cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        }, (res2) => {
          let b = '';
          res2.on('data', c => b += c);
          res2.on('end', () => {
            resolve({ path, status: res2.statusCode, headers: res2.headers, body: b.slice(0, 400) });
          });
        });
      });
    });
  });
}

(async () => {
  console.log('Testing / :');
  console.log(await checkUrl('/'));
  console.log('Testing /public/ :');
  console.log(await checkUrl('/public/'));
  console.log('Testing /public/index.php :');
  console.log(await checkUrl('/public/index.php'));
  console.log('Testing /index.php :');
  console.log(await checkUrl('/index.php'));
})();
