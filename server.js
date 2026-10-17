'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const ROOT = __dirname;
const recent = new Map();
const MAX_BODY = 20_000;
const MAX_PER_MINUTE = 15;
const systemInstruction = `Kamu adalah AI Pintar by Kenz, asisten ramah berbahasa Indonesia. Jawab jelas, cerdas, terstruktur, dan sesuai tingkat pemahaman pengguna. Untuk soal sekolah, jelaskan langkahnya. Untuk coding, berikan kode yang dapat dijalankan dan cara pakai. Jangan mengklaim sudah menjalankan kode atau memeriksa internet jika belum dilakukan. Jangan bantu membuat phishing, pencuri kredensial, malware, ransomware, keylogger, pencurian akun, atau kode untuk merusak/mengakses sistem tanpa izin. Untuk permintaan berbahaya, tolak singkat dan tawarkan alternatif defensif/edukasi yang aman. Jangan meminta password, OTP, atau API key pengguna.`;
function send(res, status, body, type='application/json; charset=utf-8') {
  res.writeHead(status, {'Content-Type':type,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'});
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}
function readBody(req) { return new Promise((resolve,reject)=>{let data='';req.on('data',chunk=>{data+=chunk;if(data.length>MAX_BODY){reject(new Error('Pesan terlalu panjang.'));req.destroy();}});req.on('end',()=>resolve(data));req.on('error',reject);}); }
const server = http.createServer(async (req,res)=>{
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/health' && req.method === 'GET') return send(res,200,{ok:true,aiConfigured:Boolean(API_KEY),model:MODEL});
  if (url.pathname === '/api/chat') {
    if (req.method !== 'POST') return send(res,405,{error:'Gunakan POST.'});
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local').toString().split(',')[0].trim();
    const now=Date.now(); const history=(recent.get(ip)||[]).filter(t=>now-t<60_000);
    if(history.length>=MAX_PER_MINUTE)return send(res,429,{error:'Batas sementara tercapai. Coba lagi sebentar.'});
    history.push(now);recent.set(ip,history);
    let body;try{body=JSON.parse(await readBody(req));}catch(e){return send(res,400,{error:'Pesan tidak valid atau terlalu panjang.'});}
    const message=typeof body.message==='string'?body.message.trim():'';
    if(!message)return send(res,400,{error:'Pesan masih kosong.'});
    if(message.length>8000)return send(res,413,{error:'Pesan terlalu panjang (maksimum 8.000 karakter).'});
    if(!API_KEY)return send(res,503,{error:'AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY di environment server, lalu restart.'});
    try {
      const upstream=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,{
        method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':API_KEY},
        body:JSON.stringify({systemInstruction:{parts:[{text:systemInstruction}]},contents:[{role:'user',parts:[{text:message}]}],generationConfig:{temperature:0.7,maxOutputTokens:4096}}),signal:AbortSignal.timeout(45_000)
      });
      const data=await upstream.json().catch(()=>({}));
      if(!upstream.ok){const msg=data?.error?.message||`Penyedia AI membalas status ${upstream.status}.`;return send(res,502,{error:msg});}
      const reply=(data?.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('\n').trim();
      if(!reply)return send(res,502,{error:'AI tidak mengembalikan jawaban. Coba pertanyaan lain.'});
      return send(res,200,{reply,model:MODEL});
    } catch(e){return send(res,502,{error:e.name==='TimeoutError'?'AI terlalu lama merespons. Coba lagi.':'Koneksi ke layanan AI gagal. Periksa jaringan server.'});}
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res,405,{error:'Method tidak didukung.'});
  let target = url.pathname === '/' ? path.join(ROOT,'index.html') : path.join(ROOT,decodeURIComponent(url.pathname).replace(/^\/+/,''));
  if(!target.startsWith(ROOT) || !fs.existsSync(target) || !fs.statSync(target).isFile())return send(res,404,{error:'Tidak ditemukan.'});
  const ext=path.extname(target).toLowerCase();const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
  res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'SAMEORIGIN'});
  if(req.method==='HEAD')return res.end();fs.createReadStream(target).pipe(res);
});
server.listen(PORT,'0.0.0.0',()=>console.log(`TOOLS BY KENZ berjalan di http://localhost:${PORT}`));
