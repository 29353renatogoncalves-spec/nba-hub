const crypto = require('crypto');
const http = require('http');

function solveChallenge(data) {
  const matches = [...data.matchAll(/toNumbers\(["']([a-f0-9]+)["']\)/g)].map(m => m[1]);
  if (matches.length < 3) return null;
  const key = Buffer.from(matches[0], 'hex');
  const iv = Buffer.from(matches[1], 'hex');
  const ciphertext = Buffer.from(matches[2], 'hex');
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('hex');
}

function requestWithCookie(path, cookie) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'Renato-NBA-HUB.infinityfreeapp.com',
      port: 80,
      path: path,
      method: 'GET',
      headers: {
        'Host': 'Renato-NBA-HUB.infinityfreeapp.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Cookie': `__test=${cookie}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.end();
  });
}

(async () => {
  // First get challenge
  const firstReq = await new Promise(res => {
    http.get('http://Renato-NBA-HUB.infinityfreeapp.com/', (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(d));
    });
  });

  const cookie = solveChallenge(firstReq);
  console.log('Solved cookie:', cookie);

  const res1 = await requestWithCookie('/', cookie);
  console.log('Result for / :', res1.status, res1.headers, res1.body.slice(0, 500));
})();
