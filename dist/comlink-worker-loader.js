function rpcWorkerLoader(content) {
    return ("import {Comlink} from 'comlinkjs';\n" + content + "\nfor(var $$ in __webpack_exports__)if ($$!='__esModule')Comlink.expose(__webpack_exports__[$$],self)");
}

module.exports = rpcWorkerLoader;
//# sourceMappingURL=comlink-worker-loader.js.map
