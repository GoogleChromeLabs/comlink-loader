function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var loaderUtils = _interopDefault(require('loader-utils'));

function loader() {}

loader.pitch = function (request) {
    var options = loaderUtils.getOptions(this) || {};
    var multi = options.multiple || options.multi || options.singleton === false;
    return ("\n    import {Comlink} from 'comlinkjs';\n    " + (multi ? '' : 'var inst;') + "\n    export default function f() {\n      " + (multi ? 'var inst =' : 'inst = inst ||') + " Comlink.proxy(require('!worker-loader?" + (JSON.stringify(options)) + "!" + (path.resolve(__dirname, 'comlink-worker-loader.js')) + "!" + request + "')());\n      return this instanceof f ? new inst : inst;\n    }\n  ").replace(/\n\s*/g, '').replace(/\\/g, '\\\\');
};

module.exports = loader;
//# sourceMappingURL=comlink-loader.js.map
