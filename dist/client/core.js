/**
 * rapidJS: Automatic serving, all-implicit-routing, pluggable fullstack scoped
 *          function modules, un-opinionated templating. 
 * 
 * Copyright (c) Thassilo Martin Schiepanski
 */
var rapidJS={};rapidJS.core=(()=>{let r;document.addEventListener("DOMContentLoaded",e=>{if(r=!!document.head.querySelector("base"),r){const t=e=>{var t=e.getAttribute("href");"a"===e.tagName.toLowerCase()&&/^#/.test(t)&&e.setAttribute("href",""+document.location.pathname+t)};document.body.addEventListener("mousedown",e=>{t(e.target)}),document.body.addEventListener("keydown",e=>{t(document.activeElement)})}});const e={};return e.toEndpoint=(r,n,t,o)=>{return new Promise((l,u)=>{var e,t;e="POST",t={body:n,pluginName:r,endpointName:o||null},fetch(document.location.pathname,{method:e,mode:"same-origin",credentials:"same-origin",headers:{"Content-Type":"application/json"},redirect:"follow",referrerPolicy:"no-referrer",body:JSON.stringify(t)}).then(async e=>{var t,r,n=e.headers.get("Content-Length");let o=0;const a=e.body.getReader();let d=[];for(;(t=await a.read())&&!t.done;)h(o/n),o+=t.value.length,d.push(t.value);h(1);let c=new Uint8Array(o),s=0;for(r of d)c.set(r,s),s+=r.length;let i=new TextDecoder("utf-8").decode(c);try{i=JSON.parse(i)}catch(e){i=String(i)}(e.status-200<99?l:u)(i)}).catch(e=>{u(e instanceof NetworkError?new NetworkError(`Could not reach endpoint${o?` '${o}'`:""} for '${r}'`):e)})});function h(e){try{t&&t(e)}catch(e){console.error(e)}}},e.ClientError=class{constructor(e,t){this.status=e,this.message=t}},e})();