/**
 * rapidJS: Automatic serving, all-implicit-routing, pluggable fullstack scoped
 *          function modules, un-opinionated templating. 
 * 
 * Copyright (c) Thassilo Martin Schiepanski
 */
"use strict";var __createBinding=this&&this.__createBinding||(Object.create?function(e,t,r,i){void 0===i&&(i=r),Object.defineProperty(e,i,{enumerable:!0,get:function(){return t[r]}})}:function(e,t,r,i){e[i=void 0===i?r:i]=t[r]}),__setModuleDefault=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),__importStar=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&__createBinding(t,e,r);return __setModuleDefault(t,e),t},__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0});const config_json_1=__importDefault(require("../config.json")),fs_1=require("fs"),path_1=require("path"),output=__importStar(require("../utilities/output")),is_dev_mode_1=__importDefault(require("../utilities/mode")),normalize_1=require("../utilities/normalize"),config_server_1=__importDefault(require("../config/config.server")),rate_limiter_1=require("./rate-limiter"),registry_1=require("../interface/plugin/registry"),Entity_1=require("./entity/Entity"),StaticGetEntity_1=require("./entity/StaticGetEntity"),DynamicGetEntity_1=require("./entity/DynamicGetEntity"),PostEntity_1=require("./entity/PostEntity"),hook_1=require("./hook"),entityConstructor={BASIC:Entity_1.Entity,GET:{STATIC:StaticGetEntity_1.StaticGetEntity,DYNAMIC:DynamicGetEntity_1.DynamicGetEntity},POST:PostEntity_1.PostEntity},options={};if(config_server_1.default.ssl){const q=e=>(0,fs_1.readFileSync)(e);options.cert=config_server_1.default.ssl.certFile?q(config_server_1.default.ssl.certFile):null,options.key=config_server_1.default.ssl.keyFile?q(config_server_1.default.ssl.keyFile):null,options.dhparam=config_server_1.default.ssl.dhParam?q(config_server_1.default.ssl.dhParam):null}const protocol=config_server_1.default.port.https?"https":"http";async function handleRequest(e,t){let r;switch(e.method.toUpperCase()){case"GET":var i=(0,path_1.extname)(e.url),i=i?(0,normalize_1.normalizeExtension)(i):config_json_1.default.dynamicFileExtension;r=new entityConstructor.GET[i!=config_json_1.default.dynamicFileExtension||(0,registry_1.isClientModuleRequest)(e.url)?"STATIC":"DYNAMIC"](e,t);break;case"POST":r=new entityConstructor.POST(e,t);break;default:return new entityConstructor.BASIC(null,t).respond(405)}return(0,hook_1.createHook)(r),(0,rate_limiter_1.rateExceeded)(e.connection.remoteAddress)?(r.setHeader("Retry-After",3e4),r.respond(429)):0<config_server_1.default.limit.urlLength&&e.url.length>config_server_1.default.limit.urlLength?r.respond(414):new RegExp("/"+config_json_1.default.privateWebFilePrefix).test((0,path_1.basename)(e.url))?r.respond(403):void r.process()}require(protocol).createServer(options,(t,r)=>{handleRequest(t,r).catch(e=>{output.error(e),new entityConstructor.BASIC(t,r).respond(500)})}).listen(config_server_1.default.port[protocol],config_server_1.default.hostname,config_server_1.default.limit.requestsPending,()=>{output.log("Server started listening on port "+config_server_1.default.port[protocol]),is_dev_mode_1.default&&output.log("Running DEV MODE")}),config_server_1.default.port.https&&require("http").createServer((e,t)=>{new entityConstructor.BASIC(e,t).redirect(e.url)}).listen(config_server_1.default.port.http,config_server_1.default.hostname,config_server_1.default.limit.requestsPending,()=>{output.log(`HTTP (:${config_server_1.default.port.http}) to HTTPS (:${config_server_1.default.port.https}) redirection enabled`)});