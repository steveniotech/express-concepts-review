// Local-only review server. No account data, source reports or Git files are served.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = new Map([
  ['index.html','text/html; charset=utf-8'], ['styles.css','text/css; charset=utf-8'],
  ['brand.css','text/css; charset=utf-8'], ['assets/io-tech-center-logo.png','image/png'],
  ...['lessons.js','app.js','teacher.js'].map(f=>[f,'text/javascript; charset=utf-8'])
]);
export function handler(req,res) {
  const send=(code,body,headers={})=>{res.writeHead(code,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(req.method==='HEAD'?undefined:body);};
  if(!['GET','HEAD'].includes(req.method))return send(405,'Method not allowed');
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/')return send(302,'',{Location:'/express-concepts-review/'});
  if(url.pathname==='/io-tech-learning-hub/')return send(302,'',{Location:'http://127.0.0.1:8765/io-tech-learning-hub/'});
  const before=url.pathname.startsWith('/before/express-concepts-review/');
  const base=before?'/before/express-concepts-review/':'/express-concepts-review/';
  if(!url.pathname.startsWith(base))return send(404,'Not found');
  const name=url.pathname.slice(base.length)||'index.html';
  if(!files.has(name))return send(404,'Not found');
  const filename=path.join(root,before&&['index.html','styles.css'].includes(name)?'.local/brand-review/before':'',name);
  try {
    if(fs.lstatSync(filename).isSymbolicLink())return send(404,'Not found');
    const content=fs.readFileSync(filename);
    return send(200,content,{'Content-Type':files.get(name),'Content-Length':content.length});
  } catch {return send(404,'Not found');}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const server=http.createServer(handler);
  server.on('error',e=>{console.error('Preview startup failed: '+e.code);process.exitCode=1;});
  server.listen(8772,'127.0.0.1',()=>console.log('Brand sample: http://127.0.0.1:8772/express-concepts-review/'));
}
