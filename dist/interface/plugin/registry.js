/**
 * rapidJS: Automatic serving, all-implicit-routing, pluggable fullstack scoped
 *          function modules, un-opinionated templating. 
 * 
 * Copyright (c) Thassilo Martin Schiepanski
 */
"use strict";var __createBinding=this&&this.__createBinding||(Object.create?function(e,n,i,t){void 0===t&&(t=i),Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[i]}})}:function(e,n,i,t){e[t=void 0===t?i:t]=n[i]}),__setModuleDefault=this&&this.__setModuleDefault||(Object.create?function(e,n){Object.defineProperty(e,"default",{enumerable:!0,value:n})}:function(e,n){e.default=n}),__importStar=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var n={};if(null!=e)for(var i in e)"default"!==i&&Object.prototype.hasOwnProperty.call(e,i)&&__createBinding(n,e,i);return __setModuleDefault(n,e),n};Object.defineProperty(exports,"__esModule",{value:!0}),exports.initFrontendModule=exports.retrieveClientModules=exports.isClientModuleRequest=exports.integratePluginReferences=exports.bind=void 0;const config={configFilePluginScopeName:"plug-in",coreModuleIdentifier:"core",clientModuleAppName:"rapidJS",clientModuleReferenceName:{config:"config",private:"rJS__PRIVATE",public:"PUBLIC"},pluginNameRegex:/(@[a-z0-9_-]+\/)?[a-z0-9_-]+/i,pluginNameSeparator:"+",pluginRequestPrefix:"plug-in::"},path_1=require("path"),fs_1=require("fs"),Environment_1=require("../Environment"),bindings_1=require("../bindings"),pluginInterface=__importStar(require("../scope:plugin")),markup_1=require("../../utilities/markup"),naming_1=require("./naming"),pluginNameRegex=new RegExp(`^${config.pluginNameRegex.source}$`,"i"),urlPrefixRegex=new RegExp("^\\/"+config.pluginRequestPrefix,"i");function registerClientModule(e,n,i=!1){const t=bindings_1.pluginRegistry.get(e);t.clientScript=Buffer.from(n,"utf-8"),t.compoundOnly=i}function loadPlugin(n){require.cache[n]&&delete require.cache[n];let e;try{e=require.main.require(n)}catch(e){throw e.message+=` >> This error occured inside of the plug-in module; referenced by '${n}'`,e}if(!(e instanceof Function))throw new SyntaxError(`Plug-in main module does not export interface function; referenced by '${n}'`);e(pluginInterface)}function bind(e,n={}){if(n.alias&&!pluginNameRegex.test(n.alias.trim()))throw new SyntaxError(`Invalid plug-in alias given '', '${e}'`);var i=n.alias?n.alias.trim():(0,naming_1.getNameByReference)(e);if(i===config.coreModuleIdentifier)throw new SyntaxError(`Multiple plug-ins resolve to the same name '${i}'`);if(bindings_1.pluginRegistry.has(i))throw new ReferenceError(`Plug-in references '${bindings_1.pluginRegistry.get(i).reference}' and '${e}' illegally resolve to the same name: '${i}'`);e=pluginNameRegex.test(e)?e:(0,path_1.join)((0,path_1.dirname)(require.main.filename),e);bindings_1.pluginRegistry.set(i,{reference:e,environment:n.environment||Environment_1.Environment.ANY}),loadPlugin(e)}function integratePluginReferences(n,i){const e=Array.from(bindings_1.pluginRegistry.keys()).filter(e=>{e=bindings_1.pluginRegistry.get(e);return e.clientScript&&(i||e.compoundOnly)}).filter(e=>!new RegExp(`<\\s*script\\s+src=("|')\\s*\\/\\s*${config.pluginRequestPrefix}${e}\\s*\\1\\s*>`,"i").test(n));if(e.length<=1)return n;var t="/"+config.pluginRequestPrefix+e.join(config.pluginNameSeparator);return n=(0,markup_1.injectIntoHead)(n,` <script src="${t}"></script> `)}function isClientModuleRequest(e){return!!new RegExp(""+urlPrefixRegex+config.pluginNameRegex.source+`(\\${config.pluginNameSeparator}${config.pluginNameRegex.source})*`,"i").test(e)}function retrieveClientModules(e){return Buffer.from(e.replace(urlPrefixRegex,"").split(new RegExp("\\"+config.pluginNameSeparator,"g")).filter(e=>config.pluginNameRegex.test(e)&&bindings_1.pluginRegistry.has(e)&&bindings_1.pluginRegistry.get(e).clientScript).map(e=>bindings_1.pluginRegistry.get(e).clientScript).join("\n"),"utf-8")}function initFrontendModule(e,t,n){var i=(0,naming_1.getNameByCall)(__filename);if(/^\//.test(e))throw new SyntaxError(`Expecting relative path to plug-in client module upon initialization, given absolute path '${e}' for '${i}'`);var r=(0,naming_1.getPathByCall)(__filename);let o=(0,path_1.join)(r,e);if(o=0==(0,path_1.extname)(o).length?o+".js":o,!(0,fs_1.existsSync)(o))throw new ReferenceError(`Client module file for plug-in '${i}' not found at given path '${o}'`);let l=String((0,fs_1.readFileSync)(o));l=t?l.replace(new RegExp(`[^a-zA-Z0-9_.]${config.clientModuleReferenceName.config}\\s*(\\.\\s*[a-zA-Z0-9_]+)+`,"g"),e=>{const n=e.match(/\.\s*[a-zA-Z0-9_]+/g).map(e=>e.slice(1).trim());let i=t;return n.forEach(e=>{i=i&&i[e]}),i=i instanceof String?`"${i}"`:i,""+e.charAt(0)+i}):l,registerClientModule(i,` ${config.clientModuleAppName} = { ... ${config.clientModuleAppName}, ... { "${i}": (${config.clientModuleReferenceName.private} => { const ${config.clientModuleAppName} = { ...${config.clientModuleReferenceName.private}, useEndpoint: (body, progressHandler) => { return ${config.clientModuleReferenceName.private}.endpoint("${i}", body, progressHandler); }, useNamedEndpoint: (name, body, progressHandler) => { return ${config.clientModuleReferenceName.private}.endpoint("${i}", body, progressHandler, name); } }; delete ${config.clientModuleAppName}.endpoint; const ${config.clientModuleReferenceName.public} = {}; ${l}${";"!=l.slice(-1)?";":""} return ${config.clientModuleReferenceName.public}; })(${config.clientModuleAppName}.${config.coreModuleIdentifier}) } } `,n)}registerClientModule("core",String((0,fs_1.readFileSync)("../../client/core.js"))),exports.bind=bind,exports.integratePluginReferences=integratePluginReferences,exports.isClientModuleRequest=isClientModuleRequest,exports.retrieveClientModules=retrieveClientModules,exports.initFrontendModule=initFrontendModule;