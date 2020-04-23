(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("react")) : factory(root["react"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE__0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__0__;

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return SharedReducer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createSelector", function() { return createSelector; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

function on(id, cb) {
    console.log(this.ids);
    let insertIndex = this.ids.length;
    for (; insertIndex >= 0; insertIndex--) {
        if (id > this.ids[insertIndex]) {
            break;
        }
    }
    this.ids.splice(insertIndex + 1, 0, id);
    this.callbackEntity[id] = cb;
}
function off(id) {
    delete this.callbackEntity[id];
    this.ids = this.ids.filter((_id) => _id !== id);
}
function emit(arg1, arg2) {
    this.ids.forEach((id) => this.callbackEntity[id](arg1, arg2));
}
function createEmiter() {
    return { ids: [], callbackEntity: {}, on, off, emit };
}
function SharedReducer(reducer) {
    let store = reducer([][0], {});
    let tokenId = 0;
    let batchMap = {};
    const emiter = createEmiter();
    function useToken() {
        const [cachedToken, setCachedToken] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])({ id: tokenId + 1 });
        if (cachedToken.id > tokenId) {
            tokenId = cachedToken.id;
        }
        batchMap[cachedToken.id] = true;
        return [cachedToken, setCachedToken];
    }
    function mapState(mapper) {
        return () => {
            const [token, forceUpdate] = useToken();
            Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(() => {
                emiter.on(token.id, (lastStore, nextStore) => {
                    if (!batchMap[token.id] && mapper(lastStore) !== mapper(nextStore)) {
                        forceUpdate({ id: token.id });
                    }
                });
                return () => {
                    emiter.off(token.id);
                };
            }, []);
            return mapper(store);
        };
    }
    function dispatch(action) {
        const lastStore = store;
        store = reducer(store, action);
        batchMap = {};
        emiter.emit(lastStore, store);
    }
    return [mapState, dispatch];
}
function createSelector(useStates, selector) {
    return function () {
        const states = useStates.map((us) => us());
        const [mergedState, setMergedState] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(selector(states));
        Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(() => setMergedState(selector(states)), states);
        return mergedState;
    };
}


/***/ })
/******/ ]);
});