/**
 * rapidJS: Automatic serving, all-implicit-routing, pluggable fullstack scoped
 *          function modules, un-opinionated templating. 
 * 
 * Copyright (c) Thassilo Martin Schiepanski
 */
"use strict";var __createBinding=this&&this.__createBinding||(Object.create?function(t,e,r,n){void 0===n&&(n=r),Object.defineProperty(t,n,{enumerable:!0,get:function(){return e[r]}})}:function(t,e,r,n){t[n=void 0===n?r:n]=e[r]}),__setModuleDefault=this&&this.__setModuleDefault||(Object.create?function(t,e){Object.defineProperty(t,"default",{enumerable:!0,value:e})}:function(t,e){t.default=e}),__importStar=this&&this.__importStar||function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var r in t)"default"!==r&&Object.prototype.hasOwnProperty.call(t,r)&&__createBinding(e,t,r);return __setModuleDefault(e,t),e},__importDefault=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.PostEntity=void 0;const output=__importStar(require("../../utilities/output")),config_server_1=__importDefault(require("../../config/config.server")),endpoint_1=require("../../interface/plugin/endpoint"),Entity_1=require("./Entity");class PostEntity extends Entity_1.Entity{constructor(t,e){super(t,e)}respond(t,e){super.respond(t,e)}process(){const r=this.url.pathname.replace(/^\//,"");if(!(0,endpoint_1.has)(r))return this.respond(404);let n=!1;const i=[];this.req.on("data",t=>{n||(i.push(t),8*i.length<=config_server_1.default.maxPayloadSize||(this.respond(413),n=!0))}),this.req.on("end",()=>{n;let t;try{t=0<i.length?JSON.parse(i.toString()):null}catch(t){throw new SyntaxError(`Error parsing endpoint request body '${this.url.pathname}'`)}if(!(0,endpoint_1.has)(r,t.name))return this.respond(404);try{this.url.pathname=t.meta.pathname;var e=(0,endpoint_1.use)(r,t.body,t.name);this.respond(200,e)}catch(t){output.error(t),this.respond(t.status,t.message)}}),this.req.on("error",t=>{throw t})}getReducedRequestInfo(){var t=super.getReducedRequestInfo();return Object.assign(Object.assign({},t),{isCompound:!1})}}exports.PostEntity=PostEntity;