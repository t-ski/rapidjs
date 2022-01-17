/**
 * rapidJS: Automatic serving, all-implicit-routing, pluggable fullstack scoped
 *          function modules, un-opinionated templating. 
 * 
 * Copyright (c) Thassilo Martin Schiepanski
 */
"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.StaticGetEntity=void 0;const config_server_1=__importDefault(require("../../config/config.server")),fs_1=require("fs"),path_1=require("path"),crypto_1=require("crypto"),registry_1=require("../../interface/plugin/registry"),normalize_1=require("../../utilities/normalize"),is_dev_mode_1=__importDefault(require("../../utilities/is-dev-mode")),GetEntity_1=require("./GetEntity");class StaticGetEntity extends GetEntity_1.GetEntity{constructor(e,t){super(e,t),this.extension=(0,normalize_1.normalizeExtension)((0,path_1.extname)(this.url.pathname))}respond(e,t){if("2"!=e.toString().charAt(0)&&404!==e&&!0===config_server_1.default.concealing404)return this.respond(404);!is_dev_mode_1.default&&config_server_1.default.cachingDuration.client&&this.setHeader("Cache-Control",`public, max-age=${config_server_1.default.cachingDuration.client}, must-revalidate`),super.respond(e,t)}process(){if(super.process(),(0,registry_1.isClientModuleRequest)(this.url.pathname))return this.extension="js",super.respond(200,(0,registry_1.retrieveClientModules)(this.url.pathname));if(!(0,fs_1.existsSync)(this.localPath()))return this.respond(404);if(is_dev_mode_1.default)return this.respond(200,super.read());var e=(0,fs_1.openSync)(this.localPath(),"r"),{ino:t,size:r,mtimeMs:e}=(0,fs_1.fstatSync)(e),e=t+`-${r}-`+e,e=(0,crypto_1.createHash)("md5").update(e).digest("hex");this.setHeader("ETag",e),this.getHeader("If-None-Matched")==e&&super.respond(304),this.respond(200,super.read())}}exports.StaticGetEntity=StaticGetEntity;