/**
 * rapidJS: Automatic serving, all-implicit-routing, pluggable fullstack scoped
 *          function modules, un-opinionated templating. 
 * 
 * Copyright (c) Thassilo Martin Schiepanski
 */
"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.DynamicGetEntity=void 0;const config_json_1=__importDefault(require("../../config.json")),fs_1=require("fs"),path_1=require("path"),config_server_1=__importDefault(require("../../config/config.server")),markup_1=require("../../utilities/markup"),render_1=require("../../rendering/render"),locale_1=require("../../rendering/locale/locale"),ResponseError_1=require("../../interface/ResponseError/ResponseError"),registry_1=require("../../interface/plugin/registry"),server_1=require("../../live/server"),GetEntity_1=require("./GetEntity");class DynamicGetEntity extends GetEntity_1.GetEntity{constructor(e,t){super(e,t),this.origPathname=this.url.pathname,this.extension=config_json_1.default.dynamicFileExtension}localPath(){return super.localPath()+"."+this.extension}read(){let e=String(super.read());return e=String((0,render_1.renderModifiers)(e,!0)),e=(0,registry_1.integratePluginReferences)(e,this.isCompound),this.isCompound&&(e=(0,markup_1.injectIntoHead)(e,`<base href="${this.url.origin}${this.pathnameToConventional()}">`)),e=(0,server_1.integrateLiveReference)(e),Buffer.from(e,"utf-8")}respond(r){if(config_server_1.default.allowFramedLoading||this.setHeader("X-Frame-Options","SAMEORIGIN"),"2"!=r.toString().charAt(0)){r=!0===config_server_1.default.concealing404?404:r;let e=!1,t=this.url.pathname;do{if(t=(0,path_1.join)((0,path_1.dirname)((0,path_1.dirname)(t)),String(r)),this.url.pathname=t,(0,fs_1.existsSync)(this.localPath())){e=!0;break}if(this.url.pathname=this.pathnameToCompound(),(0,fs_1.existsSync)(this.localPath())){e=!0,this.isCompound=!0,this.compoundArgs=[];break}}while(t=(0,path_1.join)((0,path_1.dirname)((0,path_1.dirname)(t))),"/"!==t);return super.respond(r,e?this.read():null)}try{super.respond(r,this.read())}catch(e){if(e instanceof ResponseError_1.ResponseError)return this.respond(e.status);throw e}}process(){if(super.process(),new RegExp(`(${config_json_1.default.dynamicFileDefaultName}(\\.${config_json_1.default.dynamicFileExtension})?|\\.${config_json_1.default.dynamicFileExtension})$`).test(this.url.pathname))return this.redirect(this.url.pathname.replace(new RegExp(`(${config_json_1.default.dynamicFileDefaultName})?(\\.${config_json_1.default.dynamicFileExtension})?$`),""));if("yes"===config_server_1.default.www){if(!this.subdomain[0]||"www"!==this.subdomain[0])return this.redirect(this.url.pathname,"www."+this.url.hostname)}else if("no"===config_server_1.default.www&&this.subdomain[0]&&"www"===this.subdomain[0])return this.redirect(this.url.pathname,this.url.hostname.replace(/^www\./,""));if(this.locale){if(this.locale.language==locale_1.defaultLang)return this.redirect((this.locale.country?this.locale.country+"/":"")+this.url.pathname);this.locale.language=this.locale.language||locale_1.defaultLang}this.respond(this.processPagePath())}}exports.DynamicGetEntity=DynamicGetEntity;