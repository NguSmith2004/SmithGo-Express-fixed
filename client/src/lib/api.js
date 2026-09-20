const API=import.meta.env.VITE_API_URL||'http://localhost:5001/api';
export async function api(path,options={}){const token=localStorage.getItem('sg_token');const res=await fetch(API+path,{headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...options});if(!res.ok){const e=await res.json().catch(()=>({message:'Request failed'}));throw Error(e.message||'Request failed')}return res.headers.get('content-type')?.includes('application/pdf')?res.blob():res.json()}
export {API};
