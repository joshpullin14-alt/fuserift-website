(() => {
 const summaries=document.querySelectorAll('[data-rating-summary]');
 function render(data){for(const item of data.ratings||[]){for(const el of summaries){if(el.dataset.ratingSummary===item.fusion)el.textContent=item.count?`★ ${item.average.toFixed(1)} · ${item.count} ${item.count===1?'rating':'ratings'}`:'No ratings yet';}const form=document.querySelector(`[data-rating="${item.fusion}"] form`);if(form&&item.mine)form.querySelector(`[value="${item.mine}"]`).checked=true;}}
 async function api(kind,body){const response=await fetch('/api/'+kind,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});let data;try{data=await response.json();}catch{throw Error('Community features are temporarily unavailable. Please try again later.');}if(!response.ok)throw Error(data.error||'Unable to save. Please try again later.');return data;}
 if(summaries.length)api('ratings').then(render).catch(()=>summaries.forEach(el=>el.textContent='Ratings temporarily unavailable'));
 document.querySelectorAll('[data-api-form]').forEach(form=>form.addEventListener('submit',async event=>{
  event.preventDefault();const result=form.querySelector('.form-result'),button=form.querySelector('button[type=submit]');if(button.disabled)return;button.disabled=true;result.textContent='Sending…';result.dataset.state='pending';
  try{const fields=new FormData(form),body={};for(const [key,value]of fields)if(typeof value==='string')body[key]=value;
   if(form.dataset.apiForm==='ratings')body.stars=Number(body.stars);
   const file=fields.get('logFile');if(file?.size){if(file.size>65536||! /\.(txt|log)$/i.test(file.name))throw Error('Choose a .txt or .log file smaller than 64 KB.');body.log=await file.text();}
   const data=await api(form.dataset.apiForm,body);if(data.ratings)render(data);else form.reset();result.textContent=data.message;result.dataset.state='success';
  }catch(error){result.textContent=error.name==='TimeoutError'?'The connection timed out. Please try again.':error.message||'Unable to send. Please email support.';result.dataset.state='error';}
  finally{button.disabled=false;}
 }));
})();
