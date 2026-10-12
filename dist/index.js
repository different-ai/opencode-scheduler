var __defProp = Object.defineProperty;
var __export = (target, all4) => {
  for (var name in all4)
    __defProp(target, name, { get: all4[name], enumerable: true });
};

// node_modules/@opencode/plugin/dist/promise/plugin.js
var plugin_exports = {};
__export(plugin_exports, {
  define: () => define
});
function define(plugin) {
  return plugin;
}

// node_modules/@opencode/schema/dist/agent.js
var agent_exports = {};
__export(agent_exports, {
  Agent: () => agent_exports,
  Color: () => Color,
  Event: () => Event7,
  ID: () => ID8,
  Info: () => Info7,
  Name: () => Name
});

// node_modules/effect/dist/Pipeable.js
var pipeArguments = (self, args2) => {
  switch (args2.length) {
    case 0:
      return self;
    case 1:
      return args2[0](self);
    case 2:
      return args2[1](args2[0](self));
    case 3:
      return args2[2](args2[1](args2[0](self)));
    case 4:
      return args2[3](args2[2](args2[1](args2[0](self))));
    case 5:
      return args2[4](args2[3](args2[2](args2[1](args2[0](self)))));
    case 6:
      return args2[5](args2[4](args2[3](args2[2](args2[1](args2[0](self))))));
    case 7:
      return args2[6](args2[5](args2[4](args2[3](args2[2](args2[1](args2[0](self)))))));
    case 8:
      return args2[7](args2[6](args2[5](args2[4](args2[3](args2[2](args2[1](args2[0](self))))))));
    case 9:
      return args2[8](args2[7](args2[6](args2[5](args2[4](args2[3](args2[2](args2[1](args2[0](self)))))))));
    default: {
      let ret = self;
      for (let i = 0, len = args2.length; i < len; i++) {
        ret = args2[i](ret);
      }
      return ret;
    }
  }
};
var Prototype = {
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var Class = /* @__PURE__ */ (function() {
  function PipeableBase() {
  }
  PipeableBase.prototype = Prototype;
  return PipeableBase;
})();

// node_modules/effect/dist/Function.js
var dual = function(arity, body) {
  if (typeof arity === "function") {
    return function() {
      return arity(arguments) ? body.apply(this, arguments) : (self) => body(self, ...arguments);
    };
  }
  switch (arity) {
    case 0:
    case 1:
      throw new RangeError(`Invalid arity ${arity}`);
    case 2:
      return function(a, b) {
        if (arguments.length >= 2) {
          return body(a, b);
        }
        return function(self) {
          return body(self, a);
        };
      };
    case 3:
      return function(a, b, c) {
        if (arguments.length >= 3) {
          return body(a, b, c);
        }
        return function(self) {
          return body(self, a, b);
        };
      };
    default:
      return function() {
        if (arguments.length >= arity) {
          return body.apply(this, arguments);
        }
        const args2 = arguments;
        return function(self) {
          return body(self, ...args2);
        };
      };
  }
};
var identity = (a) => a;
var constant = (value3) => () => value3;
var constTrue = /* @__PURE__ */ constant(true);
var constFalse = /* @__PURE__ */ constant(false);
var constNull = /* @__PURE__ */ constant(null);
var constUndefined = /* @__PURE__ */ constant(void 0);
var constVoid = constUndefined;
function pipe(a, ...args2) {
  return pipeArguments(a, args2);
}
function flow(ab, bc, cd, de, ef, fg, gh, hi, ij) {
  switch (arguments.length) {
    case 1:
      return ab;
    case 2:
      return function() {
        return bc(ab.apply(this, arguments));
      };
    case 3:
      return function() {
        return cd(bc(ab.apply(this, arguments)));
      };
    case 4:
      return function() {
        return de(cd(bc(ab.apply(this, arguments))));
      };
    case 5:
      return function() {
        return ef(de(cd(bc(ab.apply(this, arguments)))));
      };
    case 6:
      return function() {
        return fg(ef(de(cd(bc(ab.apply(this, arguments))))));
      };
    case 7:
      return function() {
        return gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))));
      };
    case 8:
      return function() {
        return hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments))))))));
      };
    case 9:
      return function() {
        return ij(hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))))));
      };
  }
  return;
}
function memoize(f) {
  const cache = /* @__PURE__ */ new WeakMap();
  return (a) => {
    const cached3 = cache.get(a);
    if (cached3 !== void 0) return cached3;
    const result3 = f(a);
    cache.set(a, result3);
    return result3;
  };
}
function memoizeIdempotent(f) {
  const cache = /* @__PURE__ */ new WeakMap();
  return (a) => {
    const cached3 = cache.get(a);
    if (cached3 !== void 0) return cached3;
    const result3 = f(a);
    cache.set(a, result3);
    cache.set(result3, result3);
    return result3;
  };
}

// node_modules/effect/dist/internal/equal.js
var getAllObjectKeys = (obj) => {
  const keys4 = new Set(Reflect.ownKeys(obj));
  if (obj.constructor === Object) return keys4;
  if (obj instanceof Error) {
    keys4.delete("stack");
  }
  const proto = Object.getPrototypeOf(obj);
  let current = proto;
  while (current !== null && current !== Object.prototype) {
    const ownKeys = Reflect.ownKeys(current);
    for (let i = 0; i < ownKeys.length; i++) {
      keys4.add(ownKeys[i]);
    }
    current = Object.getPrototypeOf(current);
  }
  if (keys4.has("constructor") && typeof obj.constructor === "function" && proto === obj.constructor.prototype) {
    keys4.delete("constructor");
  }
  return keys4;
};
var byReferenceInstances = /* @__PURE__ */ new WeakSet();

// node_modules/effect/dist/Predicate.js
function isString(input) {
  return typeof input === "string";
}
function isNumber(input) {
  return typeof input === "number";
}
function isBoolean(input) {
  return typeof input === "boolean";
}
function isBigInt(input) {
  return typeof input === "bigint";
}
function isSymbol(input) {
  return typeof input === "symbol";
}
function isPropertyKey(u) {
  return isString(u) || isNumber(u) || isSymbol(u);
}
function isFunction(input) {
  return typeof input === "function";
}
function isUndefined(input) {
  return input === void 0;
}
function isNotUndefined(input) {
  return input !== void 0;
}
function isNotNullish(input) {
  return input != null;
}
function isNever(_) {
  return false;
}
function isUnknown(_) {
  return true;
}
function isObject(input) {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}
function isObjectKeyword(input) {
  return typeof input === "object" && input !== null || isFunction(input);
}
var hasProperty = /* @__PURE__ */ dual(2, (self, property) => isObjectKeyword(self) && property in self);
var isTagged = /* @__PURE__ */ dual(2, (self, tag2) => hasProperty(self, "_tag") && self["_tag"] === tag2);
function isError(input) {
  return input instanceof Error;
}
function isIterable(input) {
  return hasProperty(input, Symbol.iterator) || isString(input);
}

// node_modules/effect/dist/Hash.js
var symbol = "~effect/interfaces/Hash";
var hash = (self) => {
  switch (typeof self) {
    case "number":
      return number(self);
    case "bigint":
      return string(self.toString(10));
    case "boolean":
      return string(String(self));
    case "symbol":
      return string(String(self));
    case "string":
      return string(self);
    case "undefined":
      return string("undefined");
    case "function":
    case "object": {
      if (self === null) {
        return string("null");
      } else if (self instanceof Date) {
        if (Number.isNaN(self.getTime())) {
          return string("Invalid Date");
        }
        return string(self.toISOString());
      } else if (self instanceof RegExp) {
        return string(self.toString());
      } else {
        if (byReferenceInstances.has(self)) {
          return random(self);
        }
        if (hashCache.has(self)) {
          return hashCache.get(self);
        }
        const h = withVisitedTracking(self, () => {
          if (isHash(self)) {
            return self[symbol]();
          } else if (typeof self === "function") {
            return random(self);
          } else if (self instanceof DataView) {
            return array(new Uint8Array(self.buffer, self.byteOffset, self.byteLength));
          } else if (Array.isArray(self) || ArrayBuffer.isView(self)) {
            return array(self);
          } else if (self instanceof Map) {
            return hashMap(self);
          } else if (self instanceof Set) {
            return hashSet(self);
          }
          return structure(self);
        });
        hashCache.set(self, h);
        return h;
      }
    }
    default:
      throw new Error(`BUG: unhandled typeof ${typeof self} - please report an issue at https://github.com/Effect-TS/effect/issues`);
  }
};
var random = (self) => {
  if (!randomHashCache.has(self)) {
    randomHashCache.set(self, number(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
  }
  return randomHashCache.get(self);
};
var combine = /* @__PURE__ */ dual(2, (self, b) => self * 53 ^ b);
var optimize = (n) => n & 3221225471 | n >>> 1 & 1073741824;
var isHash = (u) => hasProperty(u, symbol);
var number = (n) => {
  if (n !== n) {
    return string("NaN");
  }
  if (n === Infinity) {
    return string("Infinity");
  }
  if (n === -Infinity) {
    return string("-Infinity");
  }
  let h = n | 0;
  if (h !== n) {
    h ^= n * 4294967295;
  }
  while (n > 4294967295) {
    h ^= n /= 4294967295;
  }
  return optimize(h);
};
var string = (str) => {
  let h = 5381, i = str.length;
  while (i) {
    h = h * 33 ^ str.charCodeAt(--i);
  }
  return optimize(h);
};
var structureKeys = (o, keys4) => {
  let h = 12289;
  for (const key of keys4) {
    h ^= combine(hash(key), hash(o[key]));
  }
  return optimize(h);
};
var structure = (o) => structureKeys(o, getAllObjectKeys(o));
var iterableWith = (seed, f) => (iter) => {
  let h = seed;
  for (const element of iter) {
    h ^= f(element);
  }
  return optimize(h);
};
var array = /* @__PURE__ */ iterableWith(6151, hash);
var hashMap = /* @__PURE__ */ iterableWith(/* @__PURE__ */ string("Map"), ([k, v]) => combine(hash(k), hash(v)));
var hashSet = /* @__PURE__ */ iterableWith(/* @__PURE__ */ string("Set"), hash);
var randomHashCache = /* @__PURE__ */ new WeakMap();
var hashCache = /* @__PURE__ */ new WeakMap();
var visitedObjects = /* @__PURE__ */ new WeakSet();
function withVisitedTracking(obj, fn3) {
  if (visitedObjects.has(obj)) {
    return string("[Circular]");
  }
  visitedObjects.add(obj);
  const result3 = fn3();
  visitedObjects.delete(obj);
  return result3;
}

// node_modules/effect/dist/Equal.js
var symbol2 = "~effect/interfaces/Equal";
function equals() {
  if (arguments.length === 1) {
    return (self) => compareBoth(self, arguments[0]);
  }
  return compareBoth(arguments[0], arguments[1]);
}
function compareBoth(self, that) {
  if (self === that) return true;
  if (self == null || that == null) return false;
  const selfType = typeof self;
  if (selfType !== typeof that) {
    return false;
  }
  if (selfType === "number" && self !== self && that !== that) {
    return true;
  }
  if (selfType !== "object" && selfType !== "function") {
    return false;
  }
  if (byReferenceInstances.has(self) || byReferenceInstances.has(that)) {
    return false;
  }
  return withCache(self, that, compareObjects);
}
function withVisitedTracking2(self, that, fn3) {
  const hasLeft = visitedLeft.has(self);
  const hasRight = visitedRight.has(that);
  if (hasLeft && hasRight) {
    return true;
  }
  if (hasLeft || hasRight) {
    return false;
  }
  visitedLeft.add(self);
  visitedRight.add(that);
  const result3 = fn3();
  visitedLeft.delete(self);
  visitedRight.delete(that);
  return result3;
}
var visitedLeft = /* @__PURE__ */ new WeakSet();
var visitedRight = /* @__PURE__ */ new WeakSet();
function compareObjects(self, that) {
  if (hash(self) !== hash(that)) {
    return false;
  } else if (self instanceof Date) {
    if (!(that instanceof Date)) return false;
    const selfTime = self.getTime();
    const thatTime = that.getTime();
    return selfTime === thatTime || Number.isNaN(selfTime) && Number.isNaN(thatTime);
  } else if (self instanceof RegExp) {
    if (!(that instanceof RegExp)) return false;
    return self.toString() === that.toString();
  }
  const selfIsEqual = isEqual(self);
  const thatIsEqual = isEqual(that);
  if (selfIsEqual !== thatIsEqual) return false;
  const bothEquals = selfIsEqual && thatIsEqual;
  if (typeof self === "function" && !bothEquals) {
    return false;
  }
  return withVisitedTracking2(self, that, () => {
    if (bothEquals) {
      return self[symbol2](that);
    } else if (Array.isArray(self)) {
      if (!Array.isArray(that) || self.length !== that.length) {
        return false;
      }
      return compareArrays(self, that);
    } else if (ArrayBuffer.isView(self)) {
      const selfIsDataView = self instanceof DataView;
      if (!ArrayBuffer.isView(that) || self.byteLength !== that.byteLength || selfIsDataView !== that instanceof DataView) {
        return false;
      }
      if (selfIsDataView) {
        const thatDataView = that;
        return compareTypedArrays(new Uint8Array(self.buffer, self.byteOffset, self.byteLength), new Uint8Array(thatDataView.buffer, thatDataView.byteOffset, thatDataView.byteLength));
      }
      return compareTypedArrays(self, that);
    } else if (self instanceof Map) {
      if (!(that instanceof Map) || self.size !== that.size) {
        return false;
      }
      return compareMaps(self, that);
    } else if (self instanceof Set) {
      if (!(that instanceof Set) || self.size !== that.size) {
        return false;
      }
      return compareSets(self, that);
    }
    return compareRecords(self, that);
  });
}
function withCache(self, that, f) {
  let selfMap = equalityCache.get(self);
  if (!selfMap) {
    selfMap = /* @__PURE__ */ new WeakMap();
    equalityCache.set(self, selfMap);
  } else if (selfMap.has(that)) {
    return selfMap.get(that);
  }
  const result3 = f(self, that);
  selfMap.set(that, result3);
  let thatMap = equalityCache.get(that);
  if (!thatMap) {
    thatMap = /* @__PURE__ */ new WeakMap();
    equalityCache.set(that, thatMap);
  }
  thatMap.set(self, result3);
  return result3;
}
var equalityCache = /* @__PURE__ */ new WeakMap();
function compareArrays(self, that) {
  for (let i = 0; i < self.length; i++) {
    if (!compareBoth(self[i], that[i])) {
      return false;
    }
  }
  return true;
}
function compareTypedArrays(self, that) {
  if (self.length !== that.length) {
    return false;
  }
  for (let i = 0; i < self.length; i++) {
    if (self[i] !== that[i]) {
      return false;
    }
  }
  return true;
}
function compareRecords(self, that) {
  const selfKeys = getAllObjectKeys(self);
  const thatKeys = getAllObjectKeys(that);
  if (selfKeys.size !== thatKeys.size) {
    return false;
  }
  for (const key of selfKeys) {
    if (!thatKeys.has(key) || !compareBoth(self[key], that[key])) {
      return false;
    }
  }
  return true;
}
function makeCompareMap(keyEquivalence, valueEquivalence) {
  return function compareMaps2(self, that) {
    const thatEntries = Array.from(that);
    for (const [selfKey, selfValue] of self) {
      let found = false;
      for (let i = 0; i < thatEntries.length; i++) {
        const [thatKey, thatValue] = thatEntries[i];
        if (keyEquivalence(selfKey, thatKey) && valueEquivalence(selfValue, thatValue)) {
          thatEntries[i] = thatEntries[thatEntries.length - 1];
          thatEntries.pop();
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }
    return true;
  };
}
var compareMaps = /* @__PURE__ */ makeCompareMap(compareBoth, compareBoth);
function makeCompareSet(equivalence) {
  return function compareSets2(self, that) {
    const thatValues = Array.from(that);
    for (const selfValue of self) {
      let found = false;
      for (let i = 0; i < thatValues.length; i++) {
        const thatValue = thatValues[i];
        if (equivalence(selfValue, thatValue)) {
          thatValues[i] = thatValues[thatValues.length - 1];
          thatValues.pop();
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }
    return true;
  };
}
var compareSets = /* @__PURE__ */ makeCompareSet(compareBoth);
var isEqual = (u) => hasProperty(u, symbol2);
var asEquivalence = () => equals;
var byReferenceUnsafe = (obj) => {
  byReferenceInstances.add(obj);
  return obj;
};

// node_modules/effect/dist/Reducer.js
function make(combine2, initialValue, combineAll) {
  return {
    combine: combine2,
    initialValue,
    combineAll: combineAll ?? ((collection) => {
      let out = initialValue;
      for (const value3 of collection) {
        out = combine2(out, value3);
      }
      return out;
    })
  };
}

// node_modules/effect/dist/Equivalence.js
var make2 = (isEquivalent) => (self, that) => self === that || isEquivalent(self, that);
var isStrictEquivalent = (x, y) => x === y;
var strictEqual = () => isStrictEquivalent;
function Array_(item) {
  return make2((self, that) => {
    if (self.length !== that.length) return false;
    for (let i = 0; i < self.length; i++) {
      if (!item(self[i], that[i])) return false;
    }
    return true;
  });
}
function Struct(fields) {
  const keys4 = Reflect.ownKeys(fields);
  return make2((self, that) => {
    for (const key of keys4) {
      if (!fields[key](self[key], that[key])) return false;
    }
    return true;
  });
}

// node_modules/effect/dist/internal/array.js
var isArrayNonEmpty = (self) => self.length > 0;

// node_modules/effect/dist/internal/doNotation.js
var let_ = (map11) => dual(3, (self, name, f) => map11(self, (a) => ({
  ...a,
  [name]: f(a)
})));
var bindTo = (map11) => dual(2, (self, name) => map11(self, (a) => ({
  [name]: a
})));
var bind = (map11, flatMap6) => dual(3, (self, name, f) => flatMap6(self, (a) => map11(f(a), (b) => ({
  ...a,
  [name]: b
}))));

// node_modules/effect/dist/internal/record.js
function assignProperty(self, key, value3) {
  if (key === "__proto__") {
    Object.defineProperty(self, key, {
      value: value3,
      writable: true,
      enumerable: true,
      configurable: true
    });
  } else {
    ;
    self[key] = value3;
  }
}
function assignProperties(self, source) {
  for (const key of Reflect.ownKeys(source)) {
    if (Object.prototype.propertyIsEnumerable.call(source, key)) {
      assignProperty(self, key, source[key]);
    }
  }
}

// node_modules/effect/dist/Option.js
var Option_exports = {};
__export(Option_exports, {
  Do: () => Do,
  all: () => all,
  andThen: () => andThen,
  as: () => as,
  asVoid: () => asVoid,
  bind: () => bind2,
  bindTo: () => bindTo2,
  composeK: () => composeK,
  contains: () => contains,
  containsWith: () => containsWith,
  exists: () => exists,
  filter: () => filter,
  filterMap: () => filterMap,
  firstSomeOf: () => firstSomeOf,
  flatMap: () => flatMap,
  flatMapNullishOr: () => flatMapNullishOr,
  flatten: () => flatten,
  fromIterable: () => fromIterable,
  fromNullOr: () => fromNullOr,
  fromNullishOr: () => fromNullishOr,
  fromUndefinedOr: () => fromUndefinedOr,
  gen: () => gen,
  getFailure: () => getFailure2,
  getOrElse: () => getOrElse,
  getOrNull: () => getOrNull,
  getOrThrow: () => getOrThrow,
  getOrThrowWith: () => getOrThrowWith,
  getOrUndefined: () => getOrUndefined,
  getSuccess: () => getSuccess2,
  isNone: () => isNone2,
  isOption: () => isOption2,
  isSome: () => isSome2,
  let: () => let_2,
  lift2: () => lift2,
  liftNullishOr: () => liftNullishOr,
  liftPredicate: () => liftPredicate,
  liftThrowable: () => liftThrowable,
  makeCombinerFailFast: () => makeCombinerFailFast,
  makeEquivalence: () => makeEquivalence,
  makeOrder: () => makeOrder,
  makeReducer: () => makeReducer,
  makeReducerFailFast: () => makeReducerFailFast,
  map: () => map,
  match: () => match,
  none: () => none2,
  orElse: () => orElse,
  orElseResult: () => orElseResult,
  orElseSome: () => orElseSome,
  partitionMap: () => partitionMap,
  product: () => product,
  productMany: () => productMany,
  reduceCompact: () => reduceCompact,
  some: () => some2,
  tap: () => tap,
  toArray: () => toArray,
  toRefinement: () => toRefinement,
  void: () => void_,
  zipLeft: () => zipLeft,
  zipRight: () => zipRight,
  zipWith: () => zipWith
});

// node_modules/effect/dist/Combiner.js
function make3(combine2) {
  return {
    combine: combine2
  };
}

// node_modules/effect/dist/Redactable.js
var symbolRedactable = /* @__PURE__ */ Symbol.for("~effect/Redactable");
var isRedactable = (u) => hasProperty(u, symbolRedactable);
function redact(u) {
  if (isRedactable(u)) return getRedacted(u);
  return u;
}
function getRedacted(redactable) {
  return redactable[symbolRedactable](globalThis[currentFiberTypeId]?.context ?? emptyContext);
}
var currentFiberTypeId = "~effect/Fiber/currentFiber";
var emptyMap = /* @__PURE__ */ new Map();
var emptyContext = {
  "~effect/Context": {},
  base: emptyMap,
  depth: 0,
  mapUnsafe: emptyMap,
  pipe() {
    return pipeArguments(this, arguments);
  }
};

// node_modules/effect/dist/Formatter.js
function format(input, options2) {
  const space = options2?.space ?? 0;
  const ancestors = /* @__PURE__ */ new WeakSet();
  const gap = !space ? "" : typeof space === "number" ? " ".repeat(space) : space;
  const ind = (d) => gap.repeat(d);
  const wrap = (v, body) => {
    const ctor = v?.constructor;
    return ctor && ctor !== Object.prototype.constructor && ctor.name ? `${ctor.name}(${body})` : body;
  };
  const ownKeys = (o) => {
    try {
      return Reflect.ownKeys(o);
    } catch {
      return ["[ownKeys threw]"];
    }
  };
  function recur3(v, d = 0) {
    if (typeof v === "string") return JSON.stringify(v);
    if (typeof v === "number" || v == null || typeof v === "boolean" || typeof v === "symbol") return String(v);
    if (typeof v === "bigint") return String(v) + "n";
    if (typeof v === "object" || typeof v === "function") {
      if (ancestors.has(v)) return CIRCULAR;
      ancestors.add(v);
      let output;
      if (symbolRedactable in v) {
        output = recur3(getRedacted(v), d);
      } else if (Array.isArray(v)) {
        output = !gap || v.length <= 1 ? `[${v.map((x) => recur3(x, d)).join(",")}]` : `[
${ind(d + 1)}${v.map((x) => recur3(x, d + 1)).join(",\n" + ind(d + 1))}
${ind(d)}]`;
      } else if (v instanceof Date) {
        output = formatDate(v);
      } else if (!options2?.ignoreToString && hasProperty(v, "toString") && typeof v["toString"] === "function" && v["toString"] !== Object.prototype.toString && v["toString"] !== Array.prototype.toString) {
        const s = safeToString(v);
        output = v instanceof Error && v.cause ? `${s} (cause: ${recur3(v.cause, d)})` : s;
      } else if (Symbol.iterator in v) {
        output = `${v.constructor.name}(${recur3(Array.from(v), d)})`;
      } else {
        const keys4 = ownKeys(v);
        if (!gap || keys4.length <= 1) {
          const body = `{${keys4.map((k) => `${formatPropertyKey(k)}:${recur3(v[k], d)}`).join(",")}}`;
          output = wrap(v, body);
        } else {
          const body = `{
${keys4.map((k) => `${ind(d + 1)}${formatPropertyKey(k)}: ${recur3(v[k], d + 1)}`).join(",\n")}
${ind(d)}}`;
          output = wrap(v, body);
        }
      }
      ancestors.delete(v);
      return output;
    }
    return String(v);
  }
  return recur3(input, 0);
}
var CIRCULAR = "[Circular]";
function formatPropertyKey(name) {
  return typeof name === "string" ? JSON.stringify(name) : String(name);
}
function formatPath(path) {
  return path.map((key) => `[${formatPropertyKey(key)}]`).join("");
}
function formatDate(date) {
  try {
    return date.toISOString();
  } catch {
    return "Invalid Date";
  }
}
function safeToString(input) {
  try {
    const s = input.toString();
    return typeof s === "string" ? s : String(s);
  } catch {
    return "[toString threw]";
  }
}
function formatJson(input, options2) {
  const ancestors = [];
  return JSON.stringify(input, function(key, value3) {
    const original = Object.getOwnPropertyDescriptor(this, key)?.value;
    const redacted = hasProperty(original, symbolRedactable) ? redact(original) : redact(value3);
    if (typeof redacted === "bigint") {
      return format(redacted);
    }
    if (typeof redacted !== "object" || redacted === null) {
      return redacted;
    }
    while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) {
      ancestors.pop();
    }
    if (ancestors.includes(redacted)) {
      return void 0;
    }
    ancestors.push(redacted);
    return redacted;
  }, options2?.space) ?? "null";
}

// node_modules/effect/dist/Inspectable.js
var NodeInspectSymbol = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
var toJson = (input) => {
  try {
    input = redact(input);
    if (hasProperty(input, "toJSON") && isFunction(input["toJSON"]) && input["toJSON"].length === 0) {
      return input.toJSON();
    } else if (Array.isArray(input)) {
      return input.map(toJson);
    }
    return input;
  } catch {
    return "[toJSON threw]";
  }
};
var toStringUnknown = (u, whitespace = 2) => {
  if (typeof u === "string") {
    return u;
  }
  try {
    return typeof u === "object" ? formatJson(u, {
      space: whitespace
    }) : format(u, {
      space: whitespace
    });
  } catch {
    return String(u);
  }
};
var BaseProto = {
  toJSON() {
    return toJson(this);
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  toString() {
    return format(this.toJSON());
  }
};
var Class2 = class {
  /**
   * Node.js custom inspection method.
   *
   * **When to use**
   *
   * Use to expose the class JSON representation to Node.js inspection.
   *
   * @since 2.0.0
   */
  [NodeInspectSymbol]() {
    return this.toJSON();
  }
  /**
   * Returns a formatted string representation of this object.
   *
   * **When to use**
   *
   * Use to format the class JSON representation as a string.
   *
   * @since 2.0.0
   */
  toString() {
    return format(this.toJSON());
  }
};

// node_modules/effect/dist/Utils.js
var SingleShotGen = class _SingleShotGen {
  called = false;
  self;
  constructor(self) {
    this.self = self;
  }
  /**
   * Yields the stored value once, then completes with the value sent back in.
   *
   * **When to use**
   *
   * Use to advance a `SingleShotGen` through its single yield and completion
   * step.
   *
   * @since 2.0.0
   */
  next(a) {
    return this.called ? {
      value: a,
      done: true
    } : (this.called = true, {
      value: this.self,
      done: false
    });
  }
  /**
   * Creates a fresh single-shot iterator over the stored value.
   *
   * **When to use**
   *
   * Use to iterate the wrapped value again without reusing the consumed
   * iterator state.
   *
   * @since 2.0.0
   */
  [Symbol.iterator]() {
    return new _SingleShotGen(this.self);
  }
};
var pickInternalCall = () => {
  const InternalTypeId = "~effect/Utils/internal";
  const standard = {
    [InternalTypeId]: (body) => {
      return body();
    }
  };
  const forced = {
    [InternalTypeId]: (body) => {
      try {
        return body();
      } finally {
      }
    }
  };
  const isNotOptimizedAway = standard[InternalTypeId](() => new Error().stack)?.includes(InternalTypeId) === true;
  return isNotOptimizedAway ? standard[InternalTypeId] : forced[InternalTypeId];
};
var internalCall = /* @__PURE__ */ pickInternalCall();

// node_modules/effect/dist/internal/core.js
var EffectTypeId = `~effect/Effect`;
var ExitTypeId = `~effect/Exit`;
var effectVariance = {
  _A: identity,
  _E: identity,
  _R: identity
};
var identifier = `${EffectTypeId}/identifier`;
var args = `${EffectTypeId}/args`;
var evaluate = `${EffectTypeId}/evaluate`;
var contA = `${EffectTypeId}/successCont`;
var contE = `${EffectTypeId}/failureCont`;
var contAll = `${EffectTypeId}/ensureCont`;
var Yield = /* @__PURE__ */ Symbol.for("effect/Effect/Yield");
var PipeInspectableProto = {
  pipe() {
    return pipeArguments(this, arguments);
  },
  toJSON() {
    return {
      ...this
    };
  },
  toString() {
    return format(this.toJSON(), {
      ignoreToString: true,
      space: 2
    });
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  }
};
var StructuralProto = {
  [symbol]() {
    return structureKeys(this, Object.keys(this));
  },
  [symbol2](that) {
    const selfKeys = Object.keys(this);
    const thatKeys = Object.keys(that);
    if (selfKeys.length !== thatKeys.length) return false;
    for (let i = 0; i < selfKeys.length; i++) {
      if (selfKeys[i] !== thatKeys[i] || !equals(this[selfKeys[i]], that[selfKeys[i]])) {
        return false;
      }
    }
    return true;
  }
};
var EffectProto = {
  [EffectTypeId]: effectVariance,
  ...PipeInspectableProto,
  [Symbol.iterator]() {
    return new SingleShotGen(this);
  },
  toJSON() {
    return {
      _id: "Effect",
      op: this[identifier],
      ...args in this ? {
        args: this[args]
      } : void 0
    };
  }
};
var isEffect = (u) => hasProperty(u, EffectTypeId);
var isExit = (u) => hasProperty(u, ExitTypeId);
var CauseTypeId = "~effect/Cause";
var CauseReasonTypeId = "~effect/Cause/Reason";
var isCause = (self) => hasProperty(self, CauseTypeId);
var isCauseReason = (self) => hasProperty(self, CauseReasonTypeId);
var CauseImpl = class {
  [CauseTypeId];
  reasons;
  constructor(failures) {
    this[CauseTypeId] = CauseTypeId;
    this.reasons = failures;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
  toJSON() {
    return {
      _id: "Cause",
      failures: this.reasons.map((f) => f.toJSON())
    };
  }
  toString() {
    return `Cause(${format(this.reasons)})`;
  }
  [NodeInspectSymbol]() {
    return this.toJSON();
  }
  [symbol2](that) {
    return isCause(that) && this.reasons.length === that.reasons.length && this.reasons.every((e, i) => equals(e, that.reasons[i]));
  }
  [symbol]() {
    return array(this.reasons);
  }
};
var annotationsMap = /* @__PURE__ */ new WeakMap();
var ReasonBase = class {
  [CauseReasonTypeId];
  annotations;
  _tag;
  constructor(_tag, annotations, originalError) {
    this[CauseReasonTypeId] = CauseReasonTypeId;
    this._tag = _tag;
    if (annotations !== constEmptyAnnotations && typeof originalError === "object" && originalError !== null && annotations.size > 0) {
      const prevAnnotations = annotationsMap.get(originalError);
      if (prevAnnotations) {
        annotations = new Map([...prevAnnotations, ...annotations]);
      }
      annotationsMap.set(originalError, annotations);
    }
    this.annotations = annotations;
  }
  annotate(annotations, options2) {
    if (annotations.mapUnsafe.size === 0) return this;
    const newAnnotations = new Map(this.annotations);
    annotations.mapUnsafe.forEach((value3, key) => {
      if (options2?.overwrite !== true && newAnnotations.has(key)) return;
      newAnnotations.set(key, value3);
    });
    const self = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    self.annotations = newAnnotations;
    return self;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
  toString() {
    return format(this);
  }
  [NodeInspectSymbol]() {
    return this.toString();
  }
};
var constEmptyAnnotations = /* @__PURE__ */ new Map();
var Fail = class extends ReasonBase {
  error;
  constructor(error, annotations = constEmptyAnnotations) {
    super("Fail", annotations, error);
    this.error = error;
  }
  toString() {
    return `Fail(${format(this.error)})`;
  }
  toJSON() {
    return {
      _tag: "Fail",
      error: this.error
    };
  }
  [symbol2](that) {
    return isFailReason(that) && equals(this.error, that.error) && equals(this.annotations, that.annotations);
  }
  [symbol]() {
    return combine(string(this._tag))(combine(hash(this.error))(hash(this.annotations)));
  }
};
var causeFromReasons = (reasons) => new CauseImpl(reasons);
var causeEmpty = /* @__PURE__ */ new CauseImpl([]);
var causeFail = (error) => new CauseImpl([new Fail(error)]);
var Die = class extends ReasonBase {
  defect;
  constructor(defect, annotations = constEmptyAnnotations) {
    super("Die", annotations, defect);
    this.defect = defect;
  }
  toString() {
    return `Die(${format(this.defect)})`;
  }
  toJSON() {
    return {
      _tag: "Die",
      defect: this.defect
    };
  }
  [symbol2](that) {
    return isDieReason(that) && equals(this.defect, that.defect) && equals(this.annotations, that.annotations);
  }
  [symbol]() {
    return combine(string(this._tag))(combine(hash(this.defect))(hash(this.annotations)));
  }
};
var causeDie = (defect) => new CauseImpl([new Die(defect)]);
var causeAnnotate = /* @__PURE__ */ dual((args2) => isCause(args2[0]), (self, annotations, options2) => {
  if (annotations.mapUnsafe.size === 0) return self;
  return new CauseImpl(self.reasons.map((f) => f.annotate(annotations, options2)));
});
var isFailReason = (self) => self._tag === "Fail";
var isDieReason = (self) => self._tag === "Die";
var isInterruptReason = (self) => self._tag === "Interrupt";
function defaultEvaluate(_fiber) {
  return exitDie(`Effect.evaluate: Not implemented`);
}
var makePrimitiveProto = (options2) => ({
  ...EffectProto,
  [identifier]: options2.op,
  [evaluate]: options2[evaluate] ?? defaultEvaluate,
  [contA]: options2[contA],
  [contE]: options2[contE],
  [contAll]: options2[contAll]
});
var makePrimitive = (options2) => {
  const Proto5 = makePrimitiveProto(options2);
  return function() {
    const self = Object.create(Proto5);
    self[args] = options2.single === false ? arguments : arguments[0];
    return self;
  };
};
var makeExit = (options2) => {
  const Proto5 = {
    [ExitTypeId]: ExitTypeId,
    _tag: options2.op,
    get [options2.prop]() {
      return this[args];
    },
    ...makePrimitiveProto(options2),
    toString() {
      return `${options2.op}(${format(this[args])})`;
    },
    toJSON() {
      return {
        _id: "Exit",
        _tag: options2.op,
        [options2.prop]: this[args]
      };
    },
    [symbol2](that) {
      return isExit(that) && that._tag === this._tag && equals(this[args], that[args]);
    },
    [symbol]() {
      return combine(string(options2.op), hash(this[args]));
    }
  };
  return function(value3) {
    const self = Object.create(Proto5);
    self[args] = value3;
    return self;
  };
};
var exitSucceed = /* @__PURE__ */ makeExit({
  op: "Success",
  prop: "value",
  [evaluate](fiber3) {
    const cont = fiber3.getCont(contA);
    return cont ? cont[contA](this[args], fiber3, this) : fiber3.yieldWith(this);
  }
});
var StackTraceKey = {
  key: "effect/Cause/StackTrace"
};
var InterruptorStackTrace = {
  key: "effect/Cause/InterruptorStackTrace"
};
var exitFailCause = /* @__PURE__ */ makeExit({
  op: "Failure",
  prop: "cause",
  [evaluate](fiber3) {
    let cause = this[args];
    let annotated = false;
    if (fiber3.currentStackFrame) {
      cause = causeAnnotate(cause, {
        mapUnsafe: /* @__PURE__ */ new Map([[StackTraceKey.key, fiber3.currentStackFrame]])
      });
      annotated = true;
    }
    let cont = fiber3.getCont(contE);
    while (fiber3.interruptible && fiber3._interruptedCause && cont) {
      cont = fiber3.getCont(contE);
    }
    return cont ? cont[contE](cause, fiber3, annotated ? void 0 : this) : fiber3.yieldWith(annotated ? exitFailCause(cause) : this);
  }
});
var exitFail = (e) => exitFailCause(causeFail(e));
var exitDie = (defect) => exitFailCause(causeDie(defect));
var withFiber = /* @__PURE__ */ makePrimitive({
  op: "WithFiber",
  [evaluate](fiber3) {
    return this[args](fiber3);
  }
});
var YieldableError = /* @__PURE__ */ (function() {
  class YieldableError2 extends globalThis.Error {
  }
  const proto = /* @__PURE__ */ makePrimitiveProto({
    op: "YieldableError",
    [evaluate]() {
      return exitFail(this);
    }
  });
  delete proto.toString;
  Object.assign(YieldableError2.prototype, proto);
  return YieldableError2;
})();
var Error2 = /* @__PURE__ */ (function() {
  const plainArgsSymbol = /* @__PURE__ */ Symbol.for("effect/Data/Error/plainArgs");
  return class Base extends YieldableError {
    constructor(args2) {
      super(args2?.message, args2?.cause ? {
        cause: args2.cause
      } : void 0);
      if (args2) {
        assignProperties(this, args2);
        Object.defineProperty(this, plainArgsSymbol, {
          value: args2,
          enumerable: false
        });
      }
    }
    toJSON() {
      return {
        ...this[plainArgsSymbol],
        ...this
      };
    }
  };
})();
var TaggedError = (tag2) => {
  class Base6 extends Error2 {
    _tag = tag2;
  }
  ;
  Base6.prototype.name = tag2;
  return Base6;
};
var NoSuchElementErrorTypeId = "~effect/Cause/NoSuchElementError";
var isNoSuchElementError = (u) => hasProperty(u, NoSuchElementErrorTypeId);
var NoSuchElementError = class extends (/* @__PURE__ */ TaggedError("NoSuchElementError")) {
  [NoSuchElementErrorTypeId] = NoSuchElementErrorTypeId;
  constructor(message) {
    super({
      message
    });
  }
};
var DoneTypeId = "~effect/Cause/Done";
var isDone = (u) => hasProperty(u, DoneTypeId);
var DoneVoid = {
  [DoneTypeId]: DoneTypeId,
  _tag: "Done",
  value: void 0
};
var Done = (value3) => {
  if (value3 === void 0) return DoneVoid;
  return {
    [DoneTypeId]: DoneTypeId,
    _tag: "Done",
    value: value3
  };
};
var doneVoid = /* @__PURE__ */ exitFail(DoneVoid);
var done = (value3) => {
  if (value3 === void 0) return doneVoid;
  return exitFail(Done(value3));
};

// node_modules/effect/dist/internal/option.js
var TypeId = "~effect/data/Option";
var CommonProto = {
  [TypeId]: {
    _A: (_) => _
  },
  ...PipeInspectableProto,
  [Symbol.iterator]() {
    return new SingleShotGen(this);
  }
};
var SomeProto = /* @__PURE__ */ Object.defineProperty(/* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto), {
  _tag: "Some",
  _op: "Some",
  [symbol2](that) {
    return isOption(that) && isSome(that) && equals(this.value, that.value);
  },
  [symbol]() {
    return combine(hash(this._tag))(hash(this.value));
  },
  toString() {
    return `some(${format(this.value)})`;
  },
  toJSON() {
    return {
      _id: "Option",
      _tag: this._tag,
      value: toJson(this.value)
    };
  }
}), "valueOrUndefined", {
  get() {
    return this.value;
  }
});
var NoneHash = /* @__PURE__ */ hash("None");
var NoneProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto), {
  _tag: "None",
  _op: "None",
  valueOrUndefined: void 0,
  [symbol2](that) {
    return isOption(that) && isNone(that);
  },
  [symbol]() {
    return NoneHash;
  },
  toString() {
    return `none()`;
  },
  toJSON() {
    return {
      _id: "Option",
      _tag: this._tag
    };
  }
});
var isOption = (input) => hasProperty(input, TypeId);
var isNone = (fa) => fa._tag === "None";
var isSome = (fa) => fa._tag === "Some";
var none = /* @__PURE__ */ Object.create(NoneProto);
var some = (value3) => {
  const a = Object.create(SomeProto);
  a.value = value3;
  return a;
};

// node_modules/effect/dist/internal/result.js
var TypeId2 = "~effect/data/Result";
var CommonProto2 = {
  [TypeId2]: {
    /* v8 ignore next 2 */
    _A: (_) => _,
    _E: (_) => _
  },
  ...PipeInspectableProto,
  [Symbol.iterator]() {
    return new SingleShotGen(this);
  }
};
var SuccessProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto2), {
  _tag: "Success",
  _op: "Success",
  [symbol2](that) {
    return isResult(that) && isSuccess(that) && equals(this.success, that.success);
  },
  [symbol]() {
    return combine(hash(this._tag))(hash(this.success));
  },
  toString() {
    return `success(${format(this.success)})`;
  },
  toJSON() {
    return {
      _id: "Result",
      _tag: this._tag,
      value: toJson(this.success)
    };
  }
});
var FailureProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto2), {
  _tag: "Failure",
  _op: "Failure",
  [symbol2](that) {
    return isResult(that) && isFailure(that) && equals(this.failure, that.failure);
  },
  [symbol]() {
    return combine(hash(this._tag))(hash(this.failure));
  },
  toString() {
    return `failure(${format(this.failure)})`;
  },
  toJSON() {
    return {
      _id: "Result",
      _tag: this._tag,
      failure: toJson(this.failure)
    };
  }
});
var isResult = (input) => hasProperty(input, TypeId2);
var isFailure = (result3) => result3._tag === "Failure";
var isSuccess = (result3) => result3._tag === "Success";
var fail = (failure) => {
  const a = Object.create(FailureProto);
  a.failure = failure;
  return a;
};
var succeed = (success) => {
  const a = Object.create(SuccessProto);
  a.success = success;
  return a;
};
var getFailure = (self) => isSuccess(self) ? none : some(self.failure);
var getSuccess = (self) => isFailure(self) ? none : some(self.success);

// node_modules/effect/dist/Order.js
function make4(compare) {
  return (self, that) => self === that ? 0 : compare(self, that);
}
var Number2 = /* @__PURE__ */ make4((self, that) => {
  if (globalThis.Number.isNaN(self) && globalThis.Number.isNaN(that)) return 0;
  if (globalThis.Number.isNaN(self)) return -1;
  if (globalThis.Number.isNaN(that)) return 1;
  return self < that ? -1 : 1;
});
var BigInt2 = /* @__PURE__ */ make4((self, that) => self < that ? -1 : 1);
var mapInput = /* @__PURE__ */ dual(2, (self, f) => make4((b1, b2) => self(f(b1), f(b2))));
var Date2 = /* @__PURE__ */ mapInput(Number2, (date) => date.getTime());
function Struct2(fields) {
  const keys4 = Object.keys(fields);
  return make4((self, that) => {
    for (const key of keys4) {
      const o = fields[key](self[key], that[key]);
      if (o !== 0) {
        return o;
      }
    }
    return 0;
  });
}
var isLessThan = (O) => dual(2, (self, that) => O(self, that) === -1);
var isGreaterThan = (O) => dual(2, (self, that) => O(self, that) === 1);
var isLessThanOrEqualTo = (O) => dual(2, (self, that) => O(self, that) !== 1);
var isGreaterThanOrEqualTo = (O) => dual(2, (self, that) => O(self, that) !== -1);
var min = (O) => dual(2, (self, that) => self === that || O(self, that) < 1 ? self : that);
var max = (O) => dual(2, (self, that) => self === that || O(self, that) > -1 ? self : that);
var clamp = (O) => dual(2, (self, options2) => min(O)(options2.maximum, max(O)(options2.minimum, self)));
var isBetween = (O) => dual(2, (self, options2) => !isLessThan(O)(self, options2.minimum) && !isGreaterThan(O)(self, options2.maximum));

// node_modules/effect/dist/Option.js
var none2 = () => none;
var some2 = some;
var isOption2 = isOption;
var isNone2 = isNone;
var isSome2 = isSome;
var match = /* @__PURE__ */ dual(2, (self, {
  onNone: onNone2,
  onSome: onSome2
}) => isNone2(self) ? onNone2() : onSome2(self.value));
var toRefinement = (f) => (a) => isSome2(f(a));
var fromIterable = (collection) => {
  for (const a of collection) {
    return some2(a);
  }
  return none2();
};
var getSuccess2 = getSuccess;
var getFailure2 = getFailure;
var getOrElse = /* @__PURE__ */ dual(2, (self, onNone2) => isNone2(self) ? onNone2() : self.value);
var orElse = /* @__PURE__ */ dual(2, (self, that) => isNone2(self) ? that() : self);
var orElseSome = /* @__PURE__ */ dual(2, (self, onNone2) => isNone2(self) ? some2(onNone2()) : self);
var orElseResult = /* @__PURE__ */ dual(2, (self, that) => isNone2(self) ? map(that(), succeed) : map(self, fail));
var firstSomeOf = (collection) => {
  let out = none2();
  for (out of collection) {
    if (isSome2(out)) {
      return out;
    }
  }
  return out;
};
var fromNullishOr = (a) => a == null ? none2() : some2(a);
var fromUndefinedOr = (a) => a === void 0 ? none2() : some2(a);
var fromNullOr = (a) => a === null ? none2() : some2(a);
var liftNullishOr = (f) => (...a) => fromNullishOr(f(...a));
var getOrNull = /* @__PURE__ */ getOrElse(constNull);
var getOrUndefined = /* @__PURE__ */ getOrElse(constUndefined);
var liftThrowable = (f) => (...a) => {
  try {
    return some2(f(...a));
  } catch {
    return none2();
  }
};
var getOrThrowWith = /* @__PURE__ */ dual(2, (self, onNone2) => {
  if (isSome2(self)) {
    return self.value;
  }
  throw onNone2();
});
var getOrThrow = /* @__PURE__ */ getOrThrowWith(() => new Error("getOrThrow called on a None"));
var map = /* @__PURE__ */ dual(2, (self, f) => isNone2(self) ? none2() : some2(f(self.value)));
var as = /* @__PURE__ */ dual(2, (self, b) => map(self, () => b));
var asVoid = /* @__PURE__ */ as(void 0);
var void_ = /* @__PURE__ */ some2(void 0);
var flatMap = /* @__PURE__ */ dual(2, (self, f) => isNone2(self) ? none2() : f(self.value));
var andThen = /* @__PURE__ */ dual(2, (self, f) => flatMap(self, (a) => {
  const b = isFunction(f) ? f(a) : f;
  return isOption2(b) ? b : some2(b);
}));
var flatMapNullishOr = /* @__PURE__ */ dual(2, (self, f) => isNone2(self) ? none2() : fromNullishOr(f(self.value)));
var flatten = /* @__PURE__ */ flatMap(identity);
var zipRight = /* @__PURE__ */ dual(2, (self, that) => flatMap(self, () => that));
var zipLeft = /* @__PURE__ */ dual(2, (self, that) => tap(self, () => that));
var composeK = /* @__PURE__ */ dual(2, (afb, bfc) => (a) => flatMap(afb(a), bfc));
var tap = /* @__PURE__ */ dual(2, (self, f) => flatMap(self, (a) => map(f(a), () => a)));
var product = (self, that) => isSome2(self) && isSome2(that) ? some2([self.value, that.value]) : none2();
var productMany = (self, collection) => {
  if (isNone2(self)) {
    return none2();
  }
  const out = [self.value];
  for (const o of collection) {
    if (isNone2(o)) {
      return none2();
    }
    out.push(o.value);
  }
  return some2(out);
};
var all = (input) => {
  if (Symbol.iterator in input) {
    const out2 = [];
    for (const o of input) {
      if (isNone2(o)) {
        return none2();
      }
      out2.push(o.value);
    }
    return some2(out2);
  }
  const out = {};
  for (const key of Object.keys(input)) {
    const o = input[key];
    if (isNone2(o)) {
      return none2();
    }
    assignProperty(out, key, o.value);
  }
  return some2(out);
};
var zipWith = /* @__PURE__ */ dual(3, (self, that, f) => map(product(self, that), ([a, b]) => f(a, b)));
var reduceCompact = /* @__PURE__ */ dual(3, (self, b, f) => {
  let out = b;
  for (const oa of self) {
    if (isSome2(oa)) {
      out = f(out, oa.value);
    }
  }
  return out;
});
var toArray = (self) => isNone2(self) ? [] : [self.value];
var partitionMap = /* @__PURE__ */ dual(2, (self, f) => {
  if (isNone2(self)) {
    return [none2(), none2()];
  }
  const e = f(self.value);
  return isFailure(e) ? [some2(e.failure), none2()] : [none2(), some2(e.success)];
});
var filterMap = /* @__PURE__ */ dual(2, (self, f) => {
  if (isNone2(self)) {
    return none2();
  }
  const next = f(self.value);
  return isSuccess(next) ? some2(next.success) : none2();
});
var filter = /* @__PURE__ */ dual(2, (self, predicate) => isNone2(self) ? none2() : predicate(self.value) ? some2(self.value) : none2());
var makeEquivalence = (isEquivalent) => make2((x, y) => isNone2(x) ? isNone2(y) : isNone2(y) ? false : isEquivalent(x.value, y.value));
var makeOrder = (O) => make4((self, that) => isSome2(self) ? isSome2(that) ? O(self.value, that.value) : 1 : -1);
var lift2 = (f) => dual(2, (self, that) => zipWith(self, that, f));
var liftPredicate = /* @__PURE__ */ dual(2, (b, predicate) => predicate(b) ? some2(b) : none2());
var containsWith = (isEquivalent) => dual(2, (self, a) => isNone2(self) ? false : isEquivalent(self.value, a));
var contains = /* @__PURE__ */ containsWith(/* @__PURE__ */ asEquivalence());
var exists = /* @__PURE__ */ dual(2, (self, refinement) => isNone2(self) ? false : refinement(self.value));
var bindTo2 = /* @__PURE__ */ bindTo(map);
var let_2 = /* @__PURE__ */ let_(map);
var bind2 = /* @__PURE__ */ bind(map, flatMap);
var Do = /* @__PURE__ */ some2({});
var gen = (...args2) => {
  const f = args2.length === 1 ? args2[0] : args2[1].bind(args2[0]);
  const iterator = f();
  let state = iterator.next();
  while (!state.done) {
    const current = state.value;
    if (isNone2(current)) {
      return current;
    }
    state = iterator.next(current.value);
  }
  return some2(state.value);
};
function makeReducer(combiner2) {
  return make((self, that) => {
    if (isNone2(self)) return that;
    if (isNone2(that)) return self;
    return some2(combiner2.combine(self.value, that.value));
  }, none2());
}
function makeCombinerFailFast(combiner2) {
  return make3((self, that) => {
    if (isNone2(self) || isNone2(that)) return none2();
    return some2(combiner2.combine(self.value, that.value));
  });
}
function makeReducerFailFast(reducer2) {
  const combine2 = makeCombinerFailFast(reducer2).combine;
  const initialValue = some2(reducer2.initialValue);
  return make(combine2, initialValue, (collection) => {
    let out = initialValue;
    for (const value3 of collection) {
      out = combine2(out, value3);
      if (isNone2(out)) return out;
    }
    return out;
  });
}

// node_modules/effect/dist/Result.js
var succeed2 = succeed;
var fail2 = fail;
var try_ = (evaluate2) => {
  if (isFunction(evaluate2)) {
    try {
      return succeed2(evaluate2());
    } catch (e) {
      return fail2(e);
    }
  } else {
    try {
      return succeed2(evaluate2.try());
    } catch (e) {
      return fail2(evaluate2.catch(e));
    }
  }
};
var isResult2 = isResult;
var isFailure2 = isFailure;
var isSuccess2 = isSuccess;
var makeEquivalence2 = (success, failure) => make2((x, y) => isFailure2(x) ? isFailure2(y) && failure(x.failure, y.failure) : isSuccess2(y) && success(x.success, y.success));
var mapError = /* @__PURE__ */ dual(2, (self, f) => isFailure2(self) ? fail2(f(self.failure)) : self);
var map2 = /* @__PURE__ */ dual(2, (self, f) => isSuccess2(self) ? succeed2(f(self.success)) : self);
var match2 = /* @__PURE__ */ dual(2, (self, {
  onFailure,
  onSuccess
}) => isFailure2(self) ? onFailure(self.failure) : onSuccess(self.success));
var getOrElse2 = /* @__PURE__ */ dual(2, (self, onFailure) => isFailure2(self) ? onFailure(self.failure) : self.success);
var flatMap2 = /* @__PURE__ */ dual(2, (self, f) => isFailure2(self) ? fail2(self.failure) : f(self.success));

// node_modules/effect/dist/Iterable.js
var filter2 = /* @__PURE__ */ dual(2, (self, predicate) => ({
  [Symbol.iterator]() {
    const iterator = self[Symbol.iterator]();
    let i = 0;
    return {
      next() {
        let result3 = iterator.next();
        while (!result3.done) {
          if (predicate(result3.value, i++)) {
            return {
              done: false,
              value: result3.value
            };
          }
          result3 = iterator.next();
        }
        return {
          done: true,
          value: void 0
        };
      }
    };
  }
}));

// node_modules/effect/dist/Record.js
var map3 = /* @__PURE__ */ dual(2, (self, f) => {
  const out = {
    ...self
  };
  for (const key of keys(self)) {
    assignProperty(out, key, f(self[key], key));
  }
  return out;
});
var keys = (self) => Object.keys(self);

// node_modules/effect/dist/Array.js
var Array2 = globalThis.Array;
var fromIterable2 = (collection) => Array2.isArray(collection) ? collection : Array2.from(collection);
var ensure = (self) => Array2.isArray(self) ? self : [self];
var append = /* @__PURE__ */ dual(2, (self, last) => [...self, last]);
var appendAll = /* @__PURE__ */ dual(2, (self, that) => fromIterable2(self).concat(fromIterable2(that)));
var isArray = Array2.isArray;
var isArrayNonEmpty2 = isArrayNonEmpty;
var isReadonlyArrayNonEmpty = isArrayNonEmpty;
var takeWhile = /* @__PURE__ */ dual(2, (self, predicate) => {
  let i = 0;
  const out = [];
  for (const a of self) {
    if (!predicate(a, i)) {
      break;
    }
    out.push(a);
    i++;
  }
  return out;
});
var hashBucketsAdd = (buckets, value3) => {
  const hash2 = hash(value3);
  const bucket = buckets.get(hash2);
  if (bucket === void 0) {
    buckets.set(hash2, [value3]);
    return true;
  }
  for (const previous of bucket) {
    if (equals(previous, value3)) {
      return false;
    }
  }
  bucket.push(value3);
  return true;
};
var union = /* @__PURE__ */ dual(2, (self, that) => {
  const a = fromIterable2(self);
  const b = fromIterable2(that);
  if (isReadonlyArrayNonEmpty(a)) {
    return isReadonlyArrayNonEmpty(b) ? dedupe(appendAll(a, b)) : a;
  }
  return b;
});
var empty = () => [];
var map4 = /* @__PURE__ */ dual(2, (self, f) => self.map(f));
var getSomes = (self) => {
  const out = [];
  for (const a of self) {
    if (isSome2(a)) {
      out.push(a.value);
    }
  }
  return out;
};
var partition = /* @__PURE__ */ dual(2, (self, f) => {
  const excluded = [];
  const satisfying = [];
  let i = 0;
  for (const a of self) {
    const result3 = f(a, i++);
    if (isSuccess2(result3)) {
      satisfying.push(result3.success);
    } else {
      excluded.push(result3.failure);
    }
  }
  return [excluded, satisfying];
});
var dedupe = (self) => {
  const input = fromIterable2(self);
  if (input.length < 2) {
    return [...input];
  }
  const buckets = /* @__PURE__ */ new Map();
  const out = [];
  for (const value3 of input) {
    if (hashBucketsAdd(buckets, value3)) {
      out.push(value3);
    }
  }
  return out;
};
var reducer = /* @__PURE__ */ make((a, b) => a.concat(b), []);
function makeReducerConcat() {
  return reducer;
}

// node_modules/effect/dist/BigDecimal.js
var FINITE_INT_REGEXP = /^[+-]?\d+$/;
var TypeId3 = "~effect/BigDecimal";
var BigDecimalProto = {
  [TypeId3]: TypeId3,
  [symbol]() {
    const normalized = normalize(this);
    return combine(hash(normalized.value), number(normalized.scale));
  },
  [symbol2](that) {
    return isBigDecimal(that) && equals2(this, that);
  },
  toString() {
    return `BigDecimal(${format2(this)})`;
  },
  toJSON() {
    return {
      _id: "BigDecimal",
      value: String(this.value),
      scale: this.scale
    };
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var isBigDecimal = (u) => hasProperty(u, TypeId3);
var make5 = (value3, scale2) => {
  const o = Object.create(BigDecimalProto);
  o.value = value3;
  o.scale = scale2;
  return o;
};
var makeNormalizedUnsafe = (value3, scale2) => {
  if (value3 !== bigint0 && value3 % bigint10 === bigint0) {
    throw new RangeError("Value must be normalized");
  }
  const o = make5(value3, scale2);
  o.normalized = o;
  return o;
};
var bigint0 = /* @__PURE__ */ BigInt(0);
var bigint1 = /* @__PURE__ */ BigInt(1);
var bigint_1 = /* @__PURE__ */ BigInt(-1);
var bigint10 = /* @__PURE__ */ BigInt(10);
var zero = /* @__PURE__ */ makeNormalizedUnsafe(bigint0, 0);
var normalize = (self) => {
  if (self.normalized === void 0) {
    if (self.value === bigint0) {
      self.normalized = zero;
    } else {
      const digits = `${self.value}`;
      let trail = 0;
      for (let i = digits.length - 1; i >= 0; i--) {
        if (digits[i] === "0") {
          trail++;
        } else {
          break;
        }
      }
      if (trail === 0) {
        self.normalized = self;
      }
      const value3 = BigInt(digits.substring(0, digits.length - trail));
      const scale2 = self.scale - trail;
      self.normalized = makeNormalizedUnsafe(value3, scale2);
    }
  }
  return self.normalized;
};
var scale = /* @__PURE__ */ dual(2, (self, scale2) => {
  if (scale2 > self.scale) {
    return make5(self.value * bigint10 ** BigInt(scale2 - self.scale), scale2);
  }
  if (scale2 < self.scale) {
    return make5(self.value / bigint10 ** BigInt(self.scale - scale2), scale2);
  }
  return self;
});
var sum = /* @__PURE__ */ dual(2, (self, that) => {
  if (that.value === bigint0) {
    return self;
  }
  if (self.value === bigint0) {
    return that;
  }
  if (self.scale > that.scale) {
    return make5(scale(that, self.scale).value + self.value, self.scale);
  }
  if (self.scale < that.scale) {
    return make5(scale(self, that.scale).value + that.value, that.scale);
  }
  return make5(self.value + that.value, self.scale);
});
var Order = /* @__PURE__ */ make4((self, that) => {
  const scmp = Number2(sign(self), sign(that));
  if (scmp !== 0) {
    return scmp;
  }
  if (self.scale > that.scale) {
    return BigInt2(self.value, scale(that, self.scale).value);
  }
  if (self.scale < that.scale) {
    return BigInt2(scale(self, that.scale).value, that.value);
  }
  return BigInt2(self.value, that.value);
});
var isLessThan2 = /* @__PURE__ */ isLessThan(Order);
var isGreaterThan2 = /* @__PURE__ */ isGreaterThan(Order);
var sign = (n) => n.value === bigint0 ? 0 : n.value < bigint0 ? -1 : 1;
var abs = (n) => n.value < bigint0 ? make5(-n.value, n.scale) : n;
var Equivalence = /* @__PURE__ */ make2((self, that) => {
  if (self.scale > that.scale) {
    return scale(that, self.scale).value === self.value;
  }
  if (self.scale < that.scale) {
    return scale(self, that.scale).value === that.value;
  }
  return self.value === that.value;
});
var equals2 = /* @__PURE__ */ dual(2, (self, that) => Equivalence(self, that));
var fromString = (s) => {
  if (s === "") {
    return some2(zero);
  }
  let base2;
  let exp;
  const seperator = s.search(/[eE]/);
  if (seperator !== -1) {
    const trail = s.slice(seperator + 1);
    base2 = s.slice(0, seperator);
    exp = Number(trail);
    if (base2 === "" || !Number.isSafeInteger(exp) || !FINITE_INT_REGEXP.test(trail)) {
      return none2();
    }
  } else {
    base2 = s;
    exp = 0;
  }
  let digits;
  let offset;
  const dot = base2.search(/\./);
  if (dot !== -1) {
    const lead = base2.slice(0, dot);
    const trail = base2.slice(dot + 1);
    digits = `${lead}${trail}`;
    offset = trail.length;
  } else {
    digits = base2;
    offset = 0;
  }
  if (!FINITE_INT_REGEXP.test(digits)) {
    return none2();
  }
  const scale2 = offset - exp;
  if (!Number.isSafeInteger(scale2)) {
    return none2();
  }
  return some2(make5(BigInt(digits), scale2));
};
var format2 = (n) => {
  const normalized = normalize(n);
  if (Math.abs(normalized.scale) >= 16) {
    return toExponential(normalized);
  }
  const negative = normalized.value < bigint0;
  const absolute = negative ? `${normalized.value}`.substring(1) : `${normalized.value}`;
  let before;
  let after;
  if (normalized.scale >= absolute.length) {
    before = "0";
    after = "0".repeat(normalized.scale - absolute.length) + absolute;
  } else {
    const location = absolute.length - normalized.scale;
    if (location > absolute.length) {
      const zeros = location - absolute.length;
      before = `${absolute}${"0".repeat(zeros)}`;
      after = "";
    } else {
      after = absolute.slice(location);
      before = absolute.slice(0, location);
    }
  }
  const complete = after === "" ? before : `${before}.${after}`;
  return negative ? `-${complete}` : complete;
};
var toExponential = (n) => {
  if (isZero(n)) {
    return "0e+0";
  }
  const normalized = normalize(n);
  const digits = `${abs(normalized).value}`;
  const head3 = digits.slice(0, 1);
  const tail = digits.slice(1);
  let output = `${isNegative(normalized) ? "-" : ""}${head3}`;
  if (tail !== "") {
    output += `.${tail}`;
  }
  const exp = tail.length - normalized.scale;
  return `${output}e${exp >= 0 ? "+" : ""}${exp}`;
};
var isZero = (n) => n.value === bigint0;
var isNegative = (n) => n.value < bigint0;
var isPositive = (n) => n.value > bigint0;
var isBigDecimalArgs = (args2) => isBigDecimal(args2[0]);
var truncate = /* @__PURE__ */ dual(isBigDecimalArgs, (self, scale2 = 0) => {
  if (self.scale <= scale2) {
    return self;
  }
  return make5(self.value / bigint10 ** BigInt(self.scale - scale2), scale2);
});
var ceil = /* @__PURE__ */ dual(isBigDecimalArgs, (self, scale2 = 0) => {
  const truncated = truncate(self, scale2);
  if (isPositive(self) && isLessThan2(truncated, self)) {
    return sum(truncated, make5(bigint1, scale2));
  }
  return truncated;
});
var floor = /* @__PURE__ */ dual(isBigDecimalArgs, (self, scale2 = 0) => {
  const truncated = truncate(self, scale2);
  if (isNegative(self) && isGreaterThan2(truncated, self)) {
    return sum(truncated, make5(bigint_1, scale2));
  }
  return truncated;
});

// node_modules/effect/dist/Boolean.js
var Boolean2 = globalThis.Boolean;
var ReducerOr = /* @__PURE__ */ make((a, b) => a || b, false);

// node_modules/effect/dist/Effectable.js
var Prototype2 = (options2) => makePrimitiveProto({
  op: options2.label,
  [evaluate]: options2.evaluate
});

// node_modules/effect/dist/Context.js
var ServiceTypeId = "~effect/Context/Service";
var Service = function() {
  function KeyClass() {
  }
  const self = KeyClass;
  Object.setPrototypeOf(self, ServiceProto);
  const init = (key, options2) => {
    self.key = key;
    if (options2?.defaultValue) {
      self[ReferenceTypeId] = ReferenceTypeId;
      self.defaultValue = options2.defaultValue;
    }
    if (options2?.make) {
      ;
      self.make = options2.make;
    }
    if (options2?.fiberCached) {
      cacheKeys.add(key);
    }
    return self;
  };
  return arguments.length > 0 ? init(arguments[0], arguments[1]) : init;
};
var ServiceProto = {
  [ServiceTypeId]: ServiceTypeId,
  .../* @__PURE__ */ Prototype2({
    label: "Service",
    evaluate(fiber3) {
      return exitSucceed(get(fiber3.context, this));
    }
  }),
  toJSON() {
    return {
      _id: "Service",
      key: this.key
    };
  },
  of(self) {
    return self;
  },
  context(self) {
    return make6(this, self);
  },
  use(f) {
    return withFiber((fiber3) => f(get(fiber3.context, this)));
  },
  useSync(f) {
    return withFiber((fiber3) => exitSucceed(f(get(fiber3.context, this))));
  }
};
var cacheKeys = /* @__PURE__ */ new Set();
var ReferenceTypeId = "~effect/Context/Reference";
var TypeId4 = "~effect/Context";
var MaxDepth = 8;
var FlattenAfterBaseHits = 8;
var makeImpl = (cacheRoot, base2, overlay, depth) => {
  const self = Object.create(Proto);
  self.cacheRoot = cacheRoot ?? self;
  self.base = base2;
  self.overlay = overlay;
  self.depth = depth;
  self._flat = void 0;
  self.baseHits = 0;
  return self;
};
var applyOverlays = (map11, overlay) => {
  if (!overlay) return;
  applyOverlays(map11, overlay.parent);
  map11.set(overlay.key, overlay.value);
};
var flatten2 = (self) => {
  if (self._flat) return self._flat;
  if (!self.overlay) return self._flat = self.base;
  const map11 = new Map(self.base);
  applyOverlays(map11, self.overlay);
  return self._flat = map11;
};
var withFlat = (self, f) => {
  const map11 = new Map(self.mapUnsafe);
  f(map11);
  return makeUnsafe(map11);
};
var notFound = /* @__PURE__ */ Symbol();
var lookup = (self, key) => {
  const impl = self;
  for (let overlay = impl.overlay; overlay; overlay = overlay.parent) {
    if (overlay.key === key) return overlay.value;
  }
  const value3 = impl.base.get(key);
  if (value3 === void 0 && !impl.base.has(key)) return notFound;
  if (impl.overlay && ++impl.baseHits >= FlattenAfterBaseHits) {
    impl.base = flatten2(impl);
    impl.overlay = void 0;
    impl.depth = 0;
  }
  return value3;
};
var makeUnsafe = (mapUnsafe) => makeImpl(void 0, mapUnsafe, void 0, 0);
var Proto = {
  get mapUnsafe() {
    return flatten2(this);
  },
  ...PipeInspectableProto,
  [TypeId4]: {
    _Services: (_) => _
  },
  toJSON() {
    return {
      _id: "Context",
      services: Array.from(this.mapUnsafe).map(([key, value3]) => ({
        key,
        value: value3
      }))
    };
  },
  [symbol2](that) {
    if (!isContext(that)) return false;
    const self = this.mapUnsafe;
    const other = that.mapUnsafe;
    if (self.size !== other.size) return false;
    for (const [key, value3] of self) {
      if (!other.has(key) || !equals(value3, other.get(key))) return false;
    }
    return true;
  },
  [symbol]() {
    return number(this.mapUnsafe.size);
  }
};
var hasSameCache = (self, that) => self.cacheRoot === that.cacheRoot;
var isContext = (u) => hasProperty(u, TypeId4);
var isReference = (u) => !!u[ReferenceTypeId];
var empty2 = () => emptyContext2;
var emptyContext2 = /* @__PURE__ */ makeUnsafe(/* @__PURE__ */ new Map());
var make6 = (key, service3) => makeUnsafe(/* @__PURE__ */ new Map([[key.key, service3]]));
var add = /* @__PURE__ */ dual(3, (self, key, service3) => addUnsafe(self, key.key, service3));
var addUnsafe = (self, key, service3) => {
  const impl = self;
  const cacheRoot = cacheKeys.has(key) ? void 0 : impl.cacheRoot;
  if (impl.depth >= MaxDepth) {
    const map11 = new Map(impl.mapUnsafe);
    map11.set(key, service3);
    return makeImpl(cacheRoot, map11, void 0, 0);
  }
  return makeImpl(cacheRoot, impl.base, {
    key,
    value: service3,
    parent: impl.overlay
  }, impl.depth + 1);
};
var getOrUndefined2 = /* @__PURE__ */ dual(2, (self, key) => getOrUndefinedUnsafe(self, key.key));
var getOrUndefinedUnsafe = (self, key) => {
  const value3 = lookup(self, key);
  return value3 === notFound ? void 0 : value3;
};
var getUnsafe = /* @__PURE__ */ dual(2, (self, service3) => {
  const value3 = lookup(self, service3.key);
  if (value3 === notFound) {
    if (isReference(service3)) return getDefaultValue(service3);
    throw serviceNotFoundError(service3);
  }
  return value3;
});
var get = getUnsafe;
var defaultValueCacheKey = "~effect/Context/defaultValue";
var getDefaultValue = (ref) => {
  if (defaultValueCacheKey in ref) {
    return ref[defaultValueCacheKey];
  }
  return ref[defaultValueCacheKey] = ref.defaultValue();
};
var serviceNotFoundError = (service3) => {
  const error = new Error(`Service not found${service3.key ? `: ${String(service3.key)}` : ""}`);
  if (error.stack) {
    const lines = error.stack.split("\n");
    lines.splice(1, 3);
    error.stack = lines.join("\n");
  }
  return error;
};
var getOption = /* @__PURE__ */ dual(2, (self, service3) => {
  const value3 = lookup(self, service3.key);
  if (value3 !== notFound) return some2(value3);
  return isReference(service3) ? some2(getDefaultValue(service3)) : none2();
});
var merge = /* @__PURE__ */ dual(2, (self, that) => {
  if (self.mapUnsafe.size === 0) return that;
  if (that.mapUnsafe.size === 0) return self;
  return withFlat(self, (map11) => that.mapUnsafe.forEach((value3, key) => map11.set(key, value3)));
});
var mergeAll = (...ctxs) => {
  const map11 = /* @__PURE__ */ new Map();
  for (let i = 0; i < ctxs.length; i++) {
    ctxs[i].mapUnsafe.forEach((value3, key) => {
      map11.set(key, value3);
    });
  }
  return makeUnsafe(map11);
};
var Reference = Service;

// node_modules/effect/dist/Duration.js
var TypeId5 = "~effect/time/Duration";
var bigint02 = /* @__PURE__ */ BigInt(0);
var bigint12 = /* @__PURE__ */ BigInt(1);
var bigint2 = /* @__PURE__ */ BigInt(2);
var bigint102 = /* @__PURE__ */ BigInt(10);
var bigint1e3 = /* @__PURE__ */ BigInt(1e3);
var roundTiesAwayFromZero = (input) => BigInt(input < 0 ? Math.ceil(input - 0.5) : Math.floor(input + 0.5));
var roundMillisToNanos = (millis2) => roundTiesAwayFromZero(millis2 * 1e6);
var parseNanos = (input, scale2) => {
  const decimalIndex = input.indexOf(".");
  if (decimalIndex === -1) return BigInt(input) * scale2;
  const isNegative2 = input[0] === "-";
  const fractional = input.slice(decimalIndex + 1);
  const fractionalScale = bigint102 ** BigInt(fractional.length);
  const scaled = (BigInt(input.slice(isNegative2 ? 1 : 0, decimalIndex)) * fractionalScale + BigInt(fractional)) * scale2;
  const rounded = scaled / fractionalScale + (scaled % fractionalScale * bigint2 >= fractionalScale ? bigint12 : bigint02);
  return isNegative2 ? -rounded : rounded;
};
var DURATION_REGEXP = /^(-?\d+(?:\.\d+)?)\s+(nanos?|micros?|millis?|seconds?|minutes?|hours?|days?|weeks?)$/;
var fromInputUnsafe = (input) => {
  switch (typeof input) {
    case "number":
      return millis(input);
    case "bigint":
      return nanos(input);
    case "string": {
      if (input === "Infinity") {
        return infinity;
      }
      if (input === "-Infinity") {
        return negativeInfinity;
      }
      const match8 = DURATION_REGEXP.exec(input);
      if (!match8) break;
      const [_, valueStr, unit] = match8;
      if (unit === "nano" || unit === "nanos") {
        return nanos(parseNanos(valueStr, bigint12));
      }
      if (unit === "micro" || unit === "micros") {
        return nanos(parseNanos(valueStr, bigint1e3));
      }
      const value3 = Number(valueStr);
      switch (unit) {
        case "milli":
        case "millis":
          return millis(value3);
        case "second":
        case "seconds":
          return seconds(value3);
        case "minute":
        case "minutes":
          return minutes(value3);
        case "hour":
        case "hours":
          return hours(value3);
        case "day":
        case "days":
          return days(value3);
        case "week":
        case "weeks":
          return weeks(value3);
      }
      break;
    }
    case "object": {
      if (input === null) break;
      if (TypeId5 in input) return input;
      if (Array.isArray(input)) {
        if (input.length !== 2 || !input.every(isNumber)) {
          return invalid(input);
        }
        if (Number.isNaN(input[0]) || Number.isNaN(input[1])) {
          return zero2;
        }
        if (input[0] === -Infinity || input[1] === -Infinity) {
          return negativeInfinity;
        }
        if (input[0] === Infinity || input[1] === Infinity) {
          return infinity;
        }
        return make7(roundTiesAwayFromZero(input[0] * 1e9 + input[1]));
      }
      const obj = input;
      let millis2 = 0;
      if (obj.weeks) millis2 += obj.weeks * 6048e5;
      if (obj.days) millis2 += obj.days * 864e5;
      if (obj.hours) millis2 += obj.hours * 36e5;
      if (obj.minutes) millis2 += obj.minutes * 6e4;
      if (obj.seconds) millis2 += obj.seconds * 1e3;
      if (obj.milliseconds) millis2 += obj.milliseconds;
      if (!obj.microseconds && !obj.nanoseconds) return make7(millis2);
      return make7(roundTiesAwayFromZero(millis2 * 1e6 + (obj.microseconds ?? 0) * 1e3 + (obj.nanoseconds ?? 0)));
    }
  }
  return invalid(input);
};
var invalid = (input) => {
  throw new Error(`Invalid Input: ${input}`);
};
var fromInput = /* @__PURE__ */ liftThrowable(fromInputUnsafe);
var zeroDurationValue = {
  _tag: "Millis",
  millis: 0
};
var infinityDurationValue = {
  _tag: "Infinity"
};
var negativeInfinityDurationValue = {
  _tag: "NegativeInfinity"
};
var DurationProto = {
  [TypeId5]: TypeId5,
  [symbol]() {
    switch (this.value._tag) {
      case "Millis": {
        const nanos2 = this.value.millis * 1e6;
        return Number.isFinite(nanos2) ? hash(roundTiesAwayFromZero(nanos2)) : number(this.value.millis);
      }
      case "Nanos":
        return hash(this.value.nanos);
      default:
        return structure(this.value);
    }
  },
  [symbol2](that) {
    return isDuration(that) && equals3(this, that);
  },
  toString() {
    switch (this.value._tag) {
      case "Infinity":
        return "Infinity";
      case "NegativeInfinity":
        return "-Infinity";
      case "Nanos":
        return `${this.value.nanos} nanos`;
      case "Millis":
        return `${this.value.millis} millis`;
    }
  },
  toJSON() {
    switch (this.value._tag) {
      case "Millis":
        return {
          _id: "Duration",
          _tag: "Millis",
          millis: this.value.millis
        };
      case "Nanos":
        return {
          _id: "Duration",
          _tag: "Nanos",
          nanos: String(this.value.nanos)
        };
      case "Infinity":
        return {
          _id: "Duration",
          _tag: "Infinity"
        };
      case "NegativeInfinity":
        return {
          _id: "Duration",
          _tag: "NegativeInfinity"
        };
    }
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var make7 = (input) => {
  const duration = Object.create(DurationProto);
  if (typeof input === "number") {
    if (isNaN(input) || input === 0 || Object.is(input, -0)) {
      duration.value = zeroDurationValue;
    } else if (!Number.isFinite(input)) {
      duration.value = input > 0 ? infinityDurationValue : negativeInfinityDurationValue;
    } else if (!Number.isInteger(input)) {
      duration.value = {
        _tag: "Nanos",
        nanos: roundMillisToNanos(input)
      };
    } else {
      duration.value = {
        _tag: "Millis",
        millis: input
      };
    }
  } else if (input === bigint02) {
    duration.value = zeroDurationValue;
  } else {
    duration.value = {
      _tag: "Nanos",
      nanos: input
    };
  }
  return duration;
};
var isDuration = (u) => hasProperty(u, TypeId5);
var zero2 = /* @__PURE__ */ make7(0);
var infinity = /* @__PURE__ */ make7(Infinity);
var negativeInfinity = /* @__PURE__ */ make7(-Infinity);
var nanos = (nanos2) => make7(nanos2);
var millis = (millis2) => make7(millis2);
var seconds = (seconds2) => make7(seconds2 * 1e3);
var minutes = (minutes2) => make7(minutes2 * 6e4);
var hours = (hours2) => make7(hours2 * 36e5);
var days = (days2) => make7(days2 * 864e5);
var weeks = (weeks2) => make7(weeks2 * 6048e5);
var toMillis = (self) => match3(fromInputUnsafe(self), {
  onMillis: identity,
  onNanos: (nanos2) => Number(nanos2) / 1e6,
  onInfinity: () => Infinity,
  onNegativeInfinity: () => -Infinity
});
var toNanosUnsafe = (input) => {
  const self = fromInputUnsafe(input);
  switch (self.value._tag) {
    case "Infinity":
    case "NegativeInfinity":
      throw new Error("Cannot convert infinite duration to nanos");
    case "Nanos":
      return self.value.nanos;
    case "Millis":
      return roundMillisToNanos(self.value.millis);
  }
};
var toNanos = /* @__PURE__ */ liftThrowable(toNanosUnsafe);
var match3 = /* @__PURE__ */ dual(2, (self, options2) => {
  switch (self.value._tag) {
    case "Millis":
      return options2.onMillis(self.value.millis);
    case "Nanos":
      return options2.onNanos(self.value.nanos);
    case "Infinity":
      return options2.onInfinity();
    case "NegativeInfinity":
      return (options2.onNegativeInfinity ?? options2.onInfinity)();
  }
});
var matchPair = /* @__PURE__ */ dual(3, (self, that, options2) => {
  if (self.value._tag === "Infinity" || self.value._tag === "NegativeInfinity" || that.value._tag === "Infinity" || that.value._tag === "NegativeInfinity") return options2.onInfinity(self, that);
  if (self.value._tag === "Millis") {
    return that.value._tag === "Millis" ? options2.onMillis(self.value.millis, that.value.millis) : options2.onNanos(toNanosUnsafe(self), that.value.nanos);
  } else {
    return options2.onNanos(self.value.nanos, toNanosUnsafe(that));
  }
});
var Equivalence2 = (self, that) => matchPair(self, that, {
  onMillis: (self2, that2) => self2 === that2,
  onNanos: (self2, that2) => self2 === that2,
  onInfinity: (self2, that2) => self2.value._tag === that2.value._tag
});
var subtract = /* @__PURE__ */ dual(2, (self, that) => matchPair(self, that, {
  onMillis: (self2, that2) => make7(self2 - that2),
  onNanos: (self2, that2) => make7(self2 - that2),
  onInfinity: (self2, that2) => {
    const s = self2.value._tag;
    const t = that2.value._tag;
    if (s === "Infinity") return t === "Infinity" ? zero2 : infinity;
    if (s === "NegativeInfinity") return t === "NegativeInfinity" ? zero2 : negativeInfinity;
    return t === "Infinity" ? negativeInfinity : infinity;
  }
}));
var equals3 = /* @__PURE__ */ dual(2, (self, that) => Equivalence2(self, that));

// node_modules/effect/dist/Scheduler.js
var Scheduler = /* @__PURE__ */ Reference("effect/Scheduler", {
  fiberCached: true,
  defaultValue: () => new MixedScheduler()
});
var setImmediate = "setImmediate" in globalThis ? (f) => {
  const timer = globalThis.setImmediate(f);
  return () => globalThis.clearImmediate(timer);
} : (f) => {
  const timer = setTimeout(f, 0);
  return () => clearTimeout(timer);
};
var setMicrotask = (f) => {
  let cancelled = false;
  Promise.resolve().then(() => {
    if (!cancelled) f();
  });
  return () => {
    cancelled = true;
  };
};
var PriorityBuckets = class {
  buckets = [];
  scheduleTask(task, priority) {
    const buckets = this.buckets;
    const len = buckets.length;
    let bucket;
    let index2 = 0;
    for (; index2 < len; index2++) {
      if (buckets[index2][0] > priority) break;
      bucket = buckets[index2];
    }
    if (bucket && bucket[0] === priority) {
      bucket[1].push(task);
    } else if (index2 === len) {
      buckets.push([priority, [task]]);
    } else {
      buckets.splice(index2, 0, [priority, [task]]);
    }
  }
  drain() {
    const buckets = this.buckets;
    this.buckets = [];
    return buckets;
  }
};
var MixedScheduler = class {
  executionMode;
  setImmediate;
  constructor(executionMode = "async", setImmediateFn) {
    this.executionMode = executionMode;
    this.setImmediate = setImmediateFn ?? (executionMode === "sync" ? setMicrotask : setImmediate);
  }
  /**
   * Returns whether the fiber has reached its operation budget and should yield.
   *
   * **When to use**
   *
   * Use to decide whether a fiber should yield after consuming its current
   * operation budget.
   *
   * @since 2.0.0
   */
  shouldYield(fiber3) {
    return fiber3.currentOpCount >= fiber3.maxOpsBeforeYield;
  }
  /**
   * Creates a dispatcher that schedules work through this scheduler.
   *
   * **When to use**
   *
   * Use when you need a standalone dispatcher from a scheduler instance, for
   * example in tests that enqueue tasks and then flush them deterministically.
   *
   * @since 4.0.0
   */
  makeDispatcher() {
    return new MixedSchedulerDispatcher(this.setImmediate);
  }
};
var MixedSchedulerDispatcher = class {
  tasks = /* @__PURE__ */ new PriorityBuckets();
  running = void 0;
  setImmediate;
  constructor(setImmediateFn = setImmediate) {
    this.setImmediate = setImmediateFn;
  }
  /**
   * @since 2.0.0
   */
  scheduleTask(task, priority) {
    this.tasks.scheduleTask(task, priority);
    if (this.running === void 0) {
      this.running = this.setImmediate(this.afterScheduled);
    }
  }
  /**
   * @since 2.0.0
   */
  afterScheduled = () => {
    this.running = void 0;
    this.runTasks();
  };
  /**
   * @since 2.0.0
   */
  runTasks() {
    const buckets = this.tasks.drain();
    for (let i = 0; i < buckets.length; i++) {
      const toRun = buckets[i][1];
      for (let j = 0; j < toRun.length; j++) {
        toRun[j]();
      }
    }
  }
  /**
   * @since 2.0.0
   */
  flush() {
    while (this.tasks.buckets.length > 0) {
      if (this.running !== void 0) {
        this.running();
        this.running = void 0;
      }
      this.runTasks();
    }
  }
};
var MaxOpsBeforeYield = /* @__PURE__ */ Reference("effect/Scheduler/MaxOpsBeforeYield", {
  fiberCached: true,
  defaultValue: () => 2048
});
var PreventSchedulerYield = /* @__PURE__ */ Reference("effect/Scheduler/PreventSchedulerYield", {
  fiberCached: true,
  defaultValue: () => false
});

// node_modules/effect/dist/Data.js
var Class3 = class extends Class {
  constructor(props) {
    super();
    if (props) {
      assignProperties(this, props);
    }
  }
};
var TaggedError2 = TaggedError;

// node_modules/effect/dist/Encoding.js
var EncodingErrorTypeId = "~effect/encoding/EncodingError";
var EncodingError = class extends (/* @__PURE__ */ TaggedError2("EncodingError")) {
  /**
   * Marks this value as an encoding or decoding error for runtime guards.
   *
   * **When to use**
   *
   * Use to identify `EncodingError` instances through `isEncodingError`.
   *
   * @since 4.0.0
   */
  [EncodingErrorTypeId] = EncodingErrorTypeId;
};
var encodeBase64 = (input) => typeof input === "string" ? base64EncodeUint8Array(encoder.encode(input)) : base64EncodeUint8Array(input);
var decodeBase64 = (str) => {
  const stripped = stripCrlf(str);
  const length2 = stripped.length;
  if (length2 % 4 !== 0) {
    return fail2(new EncodingError({
      kind: "Decode",
      module: "Base64",
      input: stripped,
      message: `Length must be a multiple of 4, but is ${length2}`
    }));
  }
  const index2 = stripped.indexOf("=");
  if (index2 !== -1 && (index2 < length2 - 2 || index2 === length2 - 2 && stripped[length2 - 1] !== "=")) {
    return fail2(new EncodingError({
      kind: "Decode",
      module: "Base64",
      input: stripped,
      message: `Found a '=' character, but it is not at the end`
    }));
  }
  try {
    const missingOctets = stripped.endsWith("==") ? 2 : stripped.endsWith("=") ? 1 : 0;
    const result3 = new Uint8Array(3 * (length2 / 4) - missingOctets);
    for (let i = 0, j = 0; i < length2; i += 4, j += 3) {
      const buffer = getBase64Code(stripped.charCodeAt(i)) << 18 | getBase64Code(stripped.charCodeAt(i + 1)) << 12 | getBase64Code(stripped.charCodeAt(i + 2)) << 6 | getBase64Code(stripped.charCodeAt(i + 3));
      result3[j] = buffer >> 16;
      result3[j + 1] = buffer >> 8 & 255;
      result3[j + 2] = buffer & 255;
    }
    return succeed2(result3);
  } catch (e) {
    return fail2(new EncodingError({
      kind: "Decode",
      module: "Base64",
      input: stripped,
      message: e instanceof Error ? e.message : "Invalid input"
    }));
  }
};
var decodeBase64String = (str) => map2(decodeBase64(str), (_) => decoder.decode(_));
var encodeBase64Url = (input) => typeof input === "string" ? base64UrlEncodeUint8Array(encoder.encode(input)) : base64UrlEncodeUint8Array(input);
var decodeBase64Url = (str) => {
  const stripped = stripCrlf(str);
  const length2 = stripped.length;
  if (length2 % 4 === 1) {
    return fail2(new EncodingError({
      module: "Base64Url",
      kind: "Decode",
      input: stripped,
      message: `Length should be a multiple of 4, but is ${length2}`
    }));
  }
  if (!/^[-_A-Z0-9]*?={0,2}$/i.test(stripped)) {
    return fail2(new EncodingError({
      module: "Base64Url",
      kind: "Decode",
      input: stripped,
      message: "Invalid input"
    }));
  }
  let sanitized = length2 % 4 === 2 ? `${stripped}==` : length2 % 4 === 3 ? `${stripped}=` : stripped;
  sanitized = sanitized.replace(/-/g, "+").replace(/_/g, "/");
  return decodeBase64(sanitized);
};
var decodeBase64UrlString = (str) => map2(decodeBase64Url(str), (_) => decoder.decode(_));
var encodeHex = (input) => typeof input === "string" ? hexEncodeUint8Array(encoder.encode(input)) : hexEncodeUint8Array(input);
var randomHex = (length2) => {
  let result3 = "";
  for (let i = length2 >>> 3; i > 0; i--) {
    const word = Math.random() * 4294967296 >>> 0;
    result3 += byteToHex[word >>> 24] + byteToHex[word >>> 16 & 255] + byteToHex[word >>> 8 & 255] + byteToHex[word & 255];
  }
  return result3;
};
var decodeHex = (str) => {
  const bytes = new TextEncoder().encode(str);
  if (bytes.length % 2 !== 0) {
    return fail2(new EncodingError({
      module: "Hex",
      kind: "Decode",
      input: str,
      message: `Length must be a multiple of 2, but is ${bytes.length}`
    }));
  }
  try {
    const length2 = bytes.length / 2;
    const result3 = new Uint8Array(length2);
    for (let i = 0; i < length2; i++) {
      const a = fromHexChar(bytes[i * 2]);
      const b = fromHexChar(bytes[i * 2 + 1]);
      result3[i] = a << 4 | b;
    }
    return succeed2(result3);
  } catch (e) {
    return fail2(new EncodingError({
      module: "Hex",
      kind: "Decode",
      input: str,
      message: e instanceof Error ? e.message : "Invalid input"
    }));
  }
};
var decodeHexString = (str) => map2(decodeHex(str), (_) => decoder.decode(_));
var encoder = /* @__PURE__ */ new TextEncoder();
var decoder = /* @__PURE__ */ new TextDecoder();
var stripCrlf = (str) => str.replace(/[\n\r]/g, "");
var base64EncodeUint8Array = (bytes) => {
  const length2 = bytes.length;
  let result3 = "";
  let i;
  for (i = 2; i < length2; i += 3) {
    result3 += base64abc[bytes[i - 2] >> 2];
    result3 += base64abc[(bytes[i - 2] & 3) << 4 | bytes[i - 1] >> 4];
    result3 += base64abc[(bytes[i - 1] & 15) << 2 | bytes[i] >> 6];
    result3 += base64abc[bytes[i] & 63];
  }
  if (i === length2 + 1) {
    result3 += base64abc[bytes[i - 2] >> 2];
    result3 += base64abc[(bytes[i - 2] & 3) << 4];
    result3 += "==";
  }
  if (i === length2) {
    result3 += base64abc[bytes[i - 2] >> 2];
    result3 += base64abc[(bytes[i - 2] & 3) << 4 | bytes[i - 1] >> 4];
    result3 += base64abc[(bytes[i - 1] & 15) << 2];
    result3 += "=";
  }
  return result3;
};
function getBase64Code(charCode) {
  if (charCode >= base64codes.length) {
    throw new TypeError(`Invalid character ${String.fromCharCode(charCode)}`);
  }
  const code = base64codes[charCode];
  if (code === 255) {
    throw new TypeError(`Invalid character ${String.fromCharCode(charCode)}`);
  }
  return code;
}
var base64abc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];
var base64codes = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
var base64UrlEncodeUint8Array = (data) => base64EncodeUint8Array(data).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
var byteToHex = [];
for (let i = 0; i < 256; i++) {
  byteToHex.push(i.toString(16).padStart(2, "0"));
}
var hexEncodeUint8Array = (bytes) => {
  let result3 = "";
  for (let i = 0; i < bytes.length; i++) {
    result3 += byteToHex[bytes[i]];
  }
  return result3;
};
var fromHexChar = (byte) => {
  if (48 <= byte && byte <= 57) {
    return byte - 48;
  }
  if (97 <= byte && byte <= 102) {
    return byte - 97 + 10;
  }
  if (65 <= byte && byte <= 70) {
    return byte - 65 + 10;
  }
  throw new TypeError("Invalid input");
};

// node_modules/effect/dist/Tracer.js
var ParentSpanKey = "effect/Tracer/ParentSpan";
var ParentSpan = class extends (/* @__PURE__ */ Service()(ParentSpanKey, {
  fiberCached: true
})) {
};
var make8 = (options2) => options2;
var DisablePropagation = /* @__PURE__ */ Reference("effect/Tracer/DisablePropagation", {
  defaultValue: constFalse
});
var CurrentTraceLevel = /* @__PURE__ */ Reference("effect/Tracer/CurrentTraceLevel", {
  defaultValue: () => "Info"
});
var MinimumTraceLevel = /* @__PURE__ */ Reference("effect/Tracer/MinimumTraceLevel", {
  defaultValue: () => "All"
});
var TracerKey = "effect/Tracer";
var Tracer = /* @__PURE__ */ Reference(TracerKey, {
  fiberCached: true,
  defaultValue: () => make8({
    span: (options2) => new NativeSpan(options2)
  })
});
var NativeSpan = class {
  _tag = "Span";
  spanId;
  traceId = "native";
  sampled;
  name;
  parent;
  annotations;
  links;
  startTime;
  kind;
  status;
  attributes;
  events = [];
  constructor(options2) {
    this.name = options2.name;
    this.parent = options2.parent;
    this.annotations = options2.annotations;
    this.links = options2.links;
    this.startTime = options2.startTime;
    this.kind = options2.kind;
    this.sampled = options2.sampled;
    this.status = {
      _tag: "Started",
      startTime: options2.startTime
    };
    this.attributes = /* @__PURE__ */ new Map();
    this.traceId = getOrUndefined(options2.parent)?.traceId ?? randomHex(32);
    this.spanId = randomHex(16);
  }
  end(endTime, exit3) {
    this.status = {
      _tag: "Ended",
      endTime,
      exit: exit3,
      startTime: this.status.startTime
    };
  }
  attribute(key, value3) {
    this.attributes.set(key, value3);
  }
  event(name, startTime, attributes) {
    this.events.push([name, startTime, attributes ?? {}]);
  }
  addLinks(links) {
    this.links.push(...links);
  }
};

// node_modules/effect/dist/internal/metric.js
var FiberRuntimeMetricsKey = "effect/observability/Metric/FiberRuntimeMetricsKey";

// node_modules/effect/dist/internal/references.js
var CurrentErrorReporters = /* @__PURE__ */ Reference("effect/ErrorReporter/CurrentErrorReporters", {
  defaultValue: () => /* @__PURE__ */ new Set()
});
var CurrentStackFrame = /* @__PURE__ */ Reference("effect/References/CurrentStackFrame", {
  fiberCached: true,
  defaultValue: constUndefined
});
var TracerEnabled = /* @__PURE__ */ Reference("effect/References/TracerEnabled", {
  defaultValue: constTrue
});
var TracerTimingEnabled = /* @__PURE__ */ Reference("effect/References/TracerTimingEnabled", {
  defaultValue: constTrue
});
var TracerSpanAnnotations = /* @__PURE__ */ Reference("effect/References/TracerSpanAnnotations", {
  defaultValue: () => ({})
});
var TracerSpanLinks = /* @__PURE__ */ Reference("effect/References/TracerSpanLinks", {
  defaultValue: () => []
});
var CurrentLogAnnotations = /* @__PURE__ */ Reference("effect/References/CurrentLogAnnotations", {
  defaultValue: () => ({})
});
var CurrentLogLevel = /* @__PURE__ */ Reference("effect/References/CurrentLogLevel", {
  fiberCached: true,
  defaultValue: () => "Info"
});
var MinimumLogLevel = /* @__PURE__ */ Reference("effect/References/MinimumLogLevel", {
  fiberCached: true,
  defaultValue: () => "Info"
});
var CurrentLogSpans = /* @__PURE__ */ Reference("effect/References/CurrentLogSpans", {
  defaultValue: () => []
});

// node_modules/effect/dist/internal/stackTraceLimit.js
var isStackTraceLimitWritable = () => {
  const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
  if (desc === void 0) {
    return Object.isExtensible(Error);
  }
  return Object.hasOwn(desc, "writable") ? desc.writable === true : desc.set !== void 0;
};
var canWriteStackTraceLimit = /* @__PURE__ */ isStackTraceLimitWritable();
var getStackTraceLimit = () => Error.stackTraceLimit;
var setStackTraceLimit = (value3) => {
  if (canWriteStackTraceLimit) {
    ;
    Error.stackTraceLimit = value3;
  }
};

// node_modules/effect/dist/internal/tracer.js
var addSpanStackTrace = (options2) => {
  if (options2?.captureStackTrace === false) {
    return options2;
  } else if (options2?.captureStackTrace !== void 0 && typeof options2.captureStackTrace !== "boolean") {
    return options2;
  }
  const limit = getStackTraceLimit();
  setStackTraceLimit(3);
  const traceError = new Error();
  setStackTraceLimit(limit);
  return {
    ...options2,
    captureStackTrace: spanCleaner(() => traceError.stack)
  };
};
var makeStackCleaner = (line) => (stack) => {
  let cache;
  return () => {
    if (cache !== void 0) return cache;
    const trace = stack();
    if (!trace) return void 0;
    const lines = trace.split("\n");
    if (lines[line] !== void 0) {
      cache = lines[line].trim();
      return cache;
    }
  };
};
var spanCleaner = /* @__PURE__ */ makeStackCleaner(3);

// node_modules/effect/dist/internal/effect.js
var Interrupt = class extends ReasonBase {
  fiberId;
  constructor(fiberId3, annotations = constEmptyAnnotations) {
    super("Interrupt", annotations, "Interrupted");
    this.fiberId = fiberId3;
  }
  toString() {
    return `Interrupt(${this.fiberId})`;
  }
  toJSON() {
    return {
      _tag: "Interrupt",
      fiberId: this.fiberId
    };
  }
  [symbol2](that) {
    return isInterruptReason(that) && this.fiberId === that.fiberId && this.annotations === that.annotations;
  }
  [symbol]() {
    return combine(string(`${this._tag}:${this.fiberId}`))(random(this.annotations));
  }
};
var makeInterruptReason = (fiberId3) => new Interrupt(fiberId3);
var causeInterrupt = (fiberId3) => new CauseImpl([new Interrupt(fiberId3)]);
var findFail = (self) => {
  const reason = self.reasons.find(isFailReason);
  return reason ? succeed2(reason) : fail2(self);
};
var findError = (self) => {
  for (let i = 0; i < self.reasons.length; i++) {
    const reason = self.reasons[i];
    if (reason._tag === "Fail") {
      return succeed2(reason.error);
    }
  }
  return fail2(self);
};
var hasDies = (self) => self.reasons.some(isDieReason);
var findDefect = (self) => {
  const reason = self.reasons.find(isDieReason);
  return reason ? succeed2(reason.defect) : fail2(self);
};
var hasInterrupts = (self) => self.reasons.some(isInterruptReason);
var causeFilterInterruptors = (self) => {
  let interruptors;
  for (let i = 0; i < self.reasons.length; i++) {
    const f = self.reasons[i];
    if (f._tag !== "Interrupt") continue;
    interruptors ??= /* @__PURE__ */ new Set();
    if (f.fiberId !== void 0) {
      interruptors.add(f.fiberId);
    }
  }
  return interruptors ? succeed2(interruptors) : fail2(self);
};
var causeCombine = /* @__PURE__ */ dual(2, (self, that) => {
  if (self.reasons.length === 0) {
    return that;
  } else if (that.reasons.length === 0) {
    return self;
  }
  const newCause = new CauseImpl(union(self.reasons, that.reasons));
  return equals(self, newCause) ? self : newCause;
});
var causeMap = /* @__PURE__ */ dual(2, (self, f) => {
  let hasFail = false;
  const failures = self.reasons.map((failure) => {
    if (isFailReason(failure)) {
      hasFail = true;
      return new Fail(f(failure.error), failure.annotations);
    }
    return failure;
  });
  return hasFail ? causeFromReasons(failures) : self;
});
var causePartition = (self) => {
  const obj = {
    Fail: [],
    Die: [],
    Interrupt: []
  };
  for (let i = 0; i < self.reasons.length; i++) {
    obj[self.reasons[i]._tag].push(self.reasons[i]);
  }
  return obj;
};
var causeSquash = (self) => {
  const partitioned = causePartition(self);
  if (partitioned.Fail.length > 0) {
    return partitioned.Fail[0].error;
  } else if (partitioned.Die.length > 0) {
    return partitioned.Die[0].defect;
  } else if (partitioned.Interrupt.length > 0) {
    return new globalThis.Error("All fibers interrupted without error");
  }
  return new globalThis.Error("Empty cause");
};
var causePrettyErrors = (self, options2) => {
  const errors = [];
  const interrupts = [];
  if (self.reasons.length === 0) return errors;
  const prevStackLimit = getStackTraceLimit();
  setStackTraceLimit(1);
  for (const failure of self.reasons) {
    if (failure._tag === "Interrupt") {
      interrupts.push(failure);
      continue;
    }
    errors.push(causePrettyError(failure._tag === "Die" ? failure.defect : failure.error, failure.annotations, options2));
  }
  if (errors.length === 0) {
    const cause = new Error("The fiber was interrupted by:");
    cause.name = "InterruptCause";
    cause.stack = interruptCauseStack(cause, interrupts);
    const error = new globalThis.Error("All fibers interrupted without error", {
      cause
    });
    error.name = "InterruptError";
    error.stack = `${error.name}: ${error.message}`;
    errors.push(causePrettyError(error, interrupts[0].annotations, options2));
  }
  setStackTraceLimit(prevStackLimit);
  return errors;
};
var causePrettyError = (original, annotations, options2) => {
  const kind = typeof original;
  let error;
  if (original && kind === "object") {
    error = new globalThis.Error(causePrettyMessage(original), {
      cause: original.cause ? causePrettyError(original.cause) : void 0
    });
    if (typeof original.name === "string") {
      error.name = original.name;
    }
    if (typeof original.stack === "string") {
      error.stack = cleanErrorStack(original.stack, error, annotations);
    } else {
      const stack = `${error.name}: ${error.message}`;
      error.stack = annotations ? addStackAnnotations(stack, annotations) : stack;
    }
    if (options2?.includeCauseInStack) {
      error.stack = renderPrettyError(error);
    }
    for (const key of Object.keys(original)) {
      if (!(key in error)) {
        ;
        error[key] = original[key];
      }
    }
  } else {
    error = new globalThis.Error(!original ? `Unknown error: ${original}` : kind === "string" ? original : formatJson(original));
  }
  return error;
};
var causePrettyMessage = (u) => {
  if (typeof u.message === "string") {
    return u.message;
  } else if (typeof u.toString === "function" && u.toString !== Object.prototype.toString && u.toString !== Array.prototype.toString) {
    try {
      return u.toString();
    } catch {
    }
  }
  return formatJson(u);
};
var locationRegExp = /\((.*)\)/g;
var cleanErrorStack = (stack, error, annotations) => {
  const message = `${error.name}: ${error.message}`;
  const lines = (stack.startsWith(message) ? stack.slice(message.length) : stack).split("\n");
  const out = [message];
  for (let i = 1; i < lines.length; i++) {
    if (/(?:Generator\.next|~effect\/Effect)/.test(lines[i])) {
      break;
    }
    out.push(lines[i]);
  }
  return annotations ? addStackAnnotations(out.join("\n"), annotations) : out.join("\n");
};
var addStackAnnotations = (stack, annotations) => {
  const frame = annotations?.get(StackTraceKey.key);
  if (frame) {
    stack = `${stack}
${currentStackTrace(frame)}`;
  }
  return stack;
};
var interruptCauseStack = (error, interrupts) => {
  const out = [`${error.name}: ${error.message}`];
  for (const current of interrupts) {
    const fiberId3 = current.fiberId !== void 0 ? `#${current.fiberId}` : "unknown";
    const frame = current.annotations.get(InterruptorStackTrace.key);
    out.push(`    at fiber (${fiberId3})`);
    if (frame) out.push(currentStackTrace(frame));
  }
  return out.join("\n");
};
var currentStackTrace = (frame) => {
  const out = [];
  let current = frame;
  let i = 0;
  while (current && i < 10) {
    const stack = current.stack();
    if (stack) {
      const locationMatchAll = stack.matchAll(locationRegExp);
      let match8 = false;
      for (const [, location] of locationMatchAll) {
        match8 = true;
        out.push(`    at ${current.name} (${location})`);
      }
      if (!match8) {
        out.push(`    at ${current.name} (${stack.replace(/^at /, "")})`);
      }
    } else {
      out.push(`    at ${current.name}`);
    }
    current = current.parent;
    i++;
  }
  return out.join("\n");
};
var causePretty = (cause) => causePrettyErrors(cause).map(renderPrettyError).join("\n");
var renderPrettyError = (e) => e.cause ? `${e.stack} {
${renderErrorCause(e.cause, "  ")}
}` : e.stack;
var renderErrorCause = (cause, prefix) => {
  const lines = cause.stack.split("\n");
  let stack = `${prefix}[cause]: ${lines[0]}`;
  for (let i = 1, len = lines.length; i < len; i++) {
    stack += `
${prefix}${lines[i]}`;
  }
  if (cause.cause) {
    stack += ` {
${renderErrorCause(cause.cause, `${prefix}  `)}
${prefix}}`;
  }
  return stack;
};
var FiberTypeId = "~effect/Fiber";
var fiberVariance = {
  _A: identity,
  _E: identity
};
var fiberIdStore = {
  id: 0
};
var getCurrentFiber = () => globalThis[currentFiberTypeId];
var FiberImpl = class {
  constructor(context3, interruptible3 = true) {
    this[FiberTypeId] = fiberVariance;
    this.setContext(context3);
    this.id = ++fiberIdStore.id;
    this.currentOpCount = 0;
    this.interruptible = interruptible3;
    this._stack = [];
    this._observers = [];
    this._exit = void 0;
    this._children = void 0;
    this._interruptedCause = void 0;
    this._yielded = void 0;
    this._running = false;
    this._deferredInterrupt = false;
    this.runtimeMetrics?.recordFiberStart(this.context);
  }
  [FiberTypeId];
  id;
  interruptible;
  currentOpCount;
  _stack;
  _observers;
  _exit;
  _children;
  _interruptedCause;
  _yielded;
  _running;
  _deferredInterrupt;
  // set in setContext
  context;
  currentScheduler;
  currentTracerContext;
  currentSpan;
  currentLogLevel;
  minimumLogLevel;
  currentStackFrame;
  runtimeMetrics;
  maxOpsBeforeYield;
  currentPreventYield;
  _dispatcher = void 0;
  get currentDispatcher() {
    return this._dispatcher ??= this.currentScheduler.makeDispatcher();
  }
  getRef(ref) {
    return get(this.context, ref);
  }
  addObserver(cb) {
    if (this._exit) {
      cb(this._exit);
      return constVoid;
    }
    this._observers.push(cb);
    return () => {
      if (this._exit) return;
      const index2 = this._observers.indexOf(cb);
      if (index2 >= 0) {
        this._observers.splice(index2, 1);
      }
    };
  }
  interruptUnsafe(fiberId3, annotations) {
    if (this._exit) {
      return;
    }
    let cause = causeInterrupt(fiberId3);
    if (this.currentStackFrame) {
      cause = causeAnnotate(cause, make6(StackTraceKey, this.currentStackFrame));
    }
    if (annotations) {
      cause = causeAnnotate(cause, annotations);
    }
    this._interruptedCause = this._interruptedCause ? causeCombine(this._interruptedCause, cause) : cause;
    if (this.interruptible) {
      if (this._running) {
        this._deferredInterrupt = true;
      } else {
        this.evaluate(failCause(this._interruptedCause));
      }
    }
  }
  pollUnsafe() {
    return this._exit;
  }
  evaluate(effect2) {
    if (this._exit) {
      return;
    } else if (this._yielded !== void 0) {
      const yielded = this._yielded;
      this._yielded = void 0;
      yielded();
    }
    const exit3 = this.runLoop(effect2);
    if (exit3 === Yield) {
      return;
    }
    const interruptChildren = fiberMiddleware.interruptChildren && fiberMiddleware.interruptChildren(this);
    if (interruptChildren !== void 0) {
      return this.evaluate(flatMap3(interruptChildren, () => exit3));
    }
    this._exit = exit3;
    this.runtimeMetrics?.recordFiberEnd(this.context, this._exit);
    for (let i = 0; i < this._observers.length; i++) {
      this._observers[i](exit3);
    }
    this._observers.length = 0;
    this._stack.length = 0;
    this._children = void 0;
    this.context = empty2();
  }
  runLoop(effect2) {
    const prevFiber = globalThis[currentFiberTypeId];
    globalThis[currentFiberTypeId] = this;
    const prevRunning = this._running;
    this._running = true;
    let yielding = false;
    let current = effect2;
    this.currentOpCount = 0;
    try {
      while (true) {
        if (this._deferredInterrupt) {
          this._deferredInterrupt = false;
          current = failCause(this._interruptedCause);
        }
        this.currentOpCount++;
        if (!yielding && !this.currentPreventYield && this.currentScheduler.shouldYield(this)) {
          yielding = true;
          const prev = current;
          current = flatMap3(yieldNow, () => prev);
        }
        current = this.currentTracerContext ? this.currentTracerContext(current, this) : current[evaluate](this);
        if (current === Yield) {
          const yielded = this._yielded;
          if (ExitTypeId in yielded) {
            this._deferredInterrupt = false;
            this._yielded = void 0;
            return yielded;
          } else if (this._deferredInterrupt) {
            this._yielded = void 0;
            yielded();
            continue;
          }
          return Yield;
        }
      }
    } catch (error) {
      if (!hasProperty(current, evaluate)) {
        return exitDie(`Fiber.runLoop: Not a valid effect: ${String(current)}`);
      }
      return this.runLoop(exitDie(error));
    } finally {
      this._running = prevRunning;
      globalThis[currentFiberTypeId] = prevFiber;
    }
  }
  getCont(symbol4) {
    if (this._deferredInterrupt) {
      this._deferredInterrupt = false;
      return deferredInterruptCont;
    }
    while (true) {
      const op = this._stack.pop();
      if (!op) return void 0;
      const cont = op[contAll] && op[contAll](this);
      if (cont) {
        ;
        cont[symbol4] = cont;
        return cont;
      }
      if (op[symbol4]) return op;
    }
  }
  yieldWith(value3) {
    this._yielded = value3;
    return Yield;
  }
  children() {
    return this._children ??= /* @__PURE__ */ new Set();
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
  setContext(context3) {
    const previous = this.context;
    this.context = context3;
    if (previous !== void 0 && hasSameCache(previous, context3)) return;
    const scheduler = this.getRef(Scheduler);
    if (scheduler !== this.currentScheduler) {
      this.currentScheduler = scheduler;
      this._dispatcher = void 0;
    }
    this.currentSpan = getOrUndefinedUnsafe(context3, ParentSpanKey);
    this.currentLogLevel = this.getRef(CurrentLogLevel);
    this.minimumLogLevel = this.getRef(MinimumLogLevel);
    this.currentStackFrame = this.getRef(CurrentStackFrame);
    this.maxOpsBeforeYield = this.getRef(MaxOpsBeforeYield);
    this.currentPreventYield = this.getRef(PreventSchedulerYield);
    this.runtimeMetrics = getOrUndefinedUnsafe(context3, FiberRuntimeMetricsKey);
    const currentTracer = getOrUndefinedUnsafe(context3, TracerKey);
    this.currentTracerContext = currentTracer ? currentTracer["context"] : void 0;
  }
  get currentSpanLocal() {
    return this.currentSpan?._tag === "Span" ? this.currentSpan : void 0;
  }
};
var deferredInterruptCont = {
  [contA](_value, fiber3) {
    return failCause(fiber3._interruptedCause);
  },
  [contE](_cause, fiber3) {
    return failCause(fiber3._interruptedCause);
  }
};
var fiberMiddleware = {
  interruptChildren: void 0
};
var fiberStackAnnotations = (fiber3) => {
  if (!fiber3.currentStackFrame) return void 0;
  const annotations = /* @__PURE__ */ new Map();
  annotations.set(InterruptorStackTrace.key, fiber3.currentStackFrame);
  return makeUnsafe(annotations);
};
var fiberInterruptChildren = (fiber3) => {
  if (fiber3._children === void 0 || fiber3._children.size === 0) {
    return void 0;
  }
  return fiberInterruptAll(fiber3._children);
};
var fiberAwait = (self) => {
  const impl = self;
  if (impl._exit) return succeed3(impl._exit);
  return callback((resume) => {
    if (impl._exit) return resume(succeed3(impl._exit));
    return sync(self.addObserver((exit3) => resume(succeed3(exit3))));
  });
};
var fiberAwaitAll = (self) => callback((resume) => {
  const iter = self[Symbol.iterator]();
  const exits = [];
  let cancel = void 0;
  function loop() {
    let result3 = iter.next();
    while (!result3.done) {
      if (result3.value._exit) {
        exits.push(result3.value._exit);
        result3 = iter.next();
        continue;
      }
      cancel = result3.value.addObserver((exit3) => {
        exits.push(exit3);
        loop();
      });
      return;
    }
    resume(succeed3(exits));
  }
  loop();
  return sync(() => cancel?.());
});
var fiberInterrupt = (self) => withFiber((fiber3) => fiberInterruptAs(self, fiber3.id));
var fiberInterruptAs = /* @__PURE__ */ dual((args2) => hasProperty(args2[0], FiberTypeId), (self, fiberId3, annotations) => withFiber((parent) => {
  let ann = fiberStackAnnotations(parent);
  ann = ann && annotations ? merge(ann, annotations) : ann ?? annotations;
  self.interruptUnsafe(fiberId3, ann);
  return asVoid2(fiberAwait(self));
}));
var fiberInterruptAll = (fibers) => withFiber((parent) => {
  const annotations = fiberStackAnnotations(parent);
  let fiberArr = empty();
  for (const fiber3 of fibers) {
    fiber3.interruptUnsafe(parent.id, annotations);
    fiberArr.push(fiber3);
  }
  return asVoid2(fiberAwaitAll(fiberArr));
});
var succeed3 = exitSucceed;
var failCause = exitFailCause;
var fail3 = exitFail;
var sync = /* @__PURE__ */ makePrimitive({
  op: "Sync",
  [evaluate](fiber3) {
    const value3 = this[args]();
    const cont = fiber3.getCont(contA);
    return cont ? cont[contA](value3, fiber3) : fiber3.yieldWith(exitSucceed(value3));
  }
});
var suspend = /* @__PURE__ */ makePrimitive({
  op: "Suspend",
  [evaluate](_fiber) {
    return this[args]();
  }
});
var fromOption2 = /* @__PURE__ */ dual((args2) => args2.length >= 2 || isOption2(args2[0]), (option3, onNone2) => isNone2(option3) ? fail3(onNone2 ? onNone2() : new NoSuchElementError("Effect.fromOption: Option.none")) : succeed3(option3.value));
var fromResult = /* @__PURE__ */ match2({
  onFailure: fail3,
  onSuccess: succeed3
});
var fromNullishOr2 = (value3) => value3 == null ? fail3(new NoSuchElementError()) : succeed3(value3);
var yieldNowWith = /* @__PURE__ */ makePrimitive({
  op: "Yield",
  [evaluate](fiber3) {
    let resumed = false;
    fiber3.currentDispatcher.scheduleTask(() => {
      if (resumed) return;
      fiber3.evaluate(exitVoid);
    }, this[args] ?? 0);
    return fiber3.yieldWith(() => {
      resumed = true;
    });
  }
});
var yieldNow = /* @__PURE__ */ yieldNowWith(0);
var succeedSome = (a) => succeed3(some2(a));
var succeedNone = /* @__PURE__ */ succeed3(/* @__PURE__ */ none2());
var transposeOption = (self) => isNone2(self) ? succeedNone : map5(self.value, some2);
var failCauseSync = (evaluate2) => suspend(() => failCause(internalCall(evaluate2)));
var die = (defect) => exitDie(defect);
var failSync = (error) => suspend(() => fail3(internalCall(error)));
var void_2 = /* @__PURE__ */ succeed3(void 0);
var try_2 = (options2) => {
  const evaluate2 = typeof options2 === "function" ? options2 : options2.try;
  const catcher = typeof options2 === "function" ? (cause) => new UnknownError(cause, "An error occurred in Effect.try") : options2.catch;
  return suspend(() => {
    try {
      return succeed3(internalCall(evaluate2));
    } catch (err) {
      return fail3(internalCall(() => catcher(err)));
    }
  });
};
var promise = (evaluate2) => callbackOptions(function(resume, signal) {
  internalCall(() => evaluate2(signal)).then((a) => resume(succeed3(a)), (e) => resume(die(e)));
}, evaluate2.length !== 0);
var tryPromise = (options2) => {
  const f = typeof options2 === "function" ? options2 : options2.try;
  const catcher = typeof options2 === "function" ? (cause) => new UnknownError(cause, "An error occurred in Effect.tryPromise") : options2.catch;
  return callbackOptions(function(resume, signal) {
    const failWithCatch = (cause) => {
      try {
        resume(fail3(internalCall(() => catcher(cause))));
      } catch (err) {
        resume(die(err));
      }
    };
    try {
      internalCall(() => f(signal)).then((a) => resume(succeed3(a)), failWithCatch);
    } catch (err) {
      failWithCatch(err);
    }
  }, f.length !== 0);
};
var withFiberId = (f) => withFiber((fiber3) => f(fiber3.id));
var fiber = /* @__PURE__ */ withFiber(succeed3);
var fiberId = /* @__PURE__ */ withFiberId(succeed3);
var callbackOptions = /* @__PURE__ */ makePrimitive({
  op: "Async",
  single: false,
  [evaluate](fiber3) {
    const register = internalCall(() => this[args][0].bind(fiber3.currentScheduler));
    let resumed = false;
    let yielded = false;
    const controller = this[args][1] ? new AbortController() : void 0;
    const onCancel = register((effect2) => {
      if (resumed) return;
      resumed = true;
      if (yielded) {
        fiber3.evaluate(effect2);
      } else {
        yielded = effect2;
      }
    }, controller?.signal);
    if (yielded !== false) return yielded;
    yielded = true;
    fiber3._yielded = () => {
      resumed = true;
    };
    if (controller === void 0 && onCancel === void 0) {
      return Yield;
    }
    fiber3._stack.push(asyncFinalizer(() => {
      resumed = true;
      controller?.abort();
      return onCancel ?? exitVoid;
    }));
    return Yield;
  }
});
var asyncFinalizer = /* @__PURE__ */ makePrimitive({
  op: "AsyncFinalizer",
  [contAll](fiber3) {
    if (fiber3.interruptible) {
      fiber3.interruptible = false;
      fiber3._stack.push(setInterruptibleTrue);
    }
  },
  [contE](cause, _fiber) {
    return hasInterrupts(cause) ? flatMap3(this[args](), () => failCause(cause)) : failCause(cause);
  }
});
var callback = (register) => callbackOptions(register, register.length >= 2);
var never = /* @__PURE__ */ callback(constVoid);
var gen2 = (...args2) => suspend(() => fromIteratorUnsafe(args2.length === 1 ? args2[0]() : args2[1].call(args2[0].self)));
var fnUntraced = (body, ...pipeables) => {
  const fn3 = pipeables.length === 0 ? function() {
    return suspend(() => fromIteratorUnsafe(body.apply(this, arguments)));
  } : function() {
    let effect2 = suspend(() => fromIteratorUnsafe(body.apply(this, arguments)));
    for (let i = 0; i < pipeables.length; i++) {
      effect2 = pipeables[i](effect2, ...arguments);
    }
    return effect2;
  };
  return defineFunctionLength(body.length, fn3);
};
var defineFunctionLength = (length2, fn3) => Object.defineProperty(fn3, "length", {
  value: length2,
  configurable: true
});
var fnStackCleaner = /* @__PURE__ */ makeStackCleaner(2);
var fn = function() {
  const nameFirst = typeof arguments[0] === "string";
  const name = nameFirst ? arguments[0] : "Effect.fn";
  const spanOptions = nameFirst ? arguments[1] : void 0;
  const prevLimit = getStackTraceLimit();
  setStackTraceLimit(2);
  const defError = new globalThis.Error();
  setStackTraceLimit(prevLimit);
  if (nameFirst) {
    return (body, ...pipeables) => makeFn(name, body, defError, pipeables, nameFirst, spanOptions);
  }
  return makeFn(name, arguments[0], defError, Array.prototype.slice.call(arguments, 1), nameFirst, spanOptions);
};
var makeFn = (name, bodyOrOptions, defError, pipeables, addSpan, spanOptions) => {
  const body = typeof bodyOrOptions === "function" ? bodyOrOptions : pipeables.shift().bind(bodyOrOptions.self);
  return defineFunctionLength(body.length, function(...args2) {
    let result3 = suspend(() => {
      const iter = body.apply(this, arguments);
      return isEffect(iter) ? iter : fromIteratorUnsafe(iter);
    });
    for (let i = 0; i < pipeables.length; i++) {
      result3 = pipeables[i](result3, ...args2);
    }
    if (!isEffect(result3)) {
      return result3;
    }
    const prevLimit = getStackTraceLimit();
    setStackTraceLimit(2);
    const callError = new globalThis.Error();
    setStackTraceLimit(prevLimit);
    return updateService(addSpan ? useSpan(name, spanOptions, (span) => provideParentSpan(result3, span)) : result3, CurrentStackFrame, (prev) => ({
      name,
      stack: fnStackCleaner(() => callError.stack),
      parent: {
        name: `${name} (definition)`,
        stack: fnStackCleaner(() => defError.stack),
        parent: prev
      }
    }));
  });
};
var fnUntracedEager = (body, ...pipeables) => defineFunctionLength(body.length, pipeables.length === 0 ? function() {
  return fromIteratorEagerUnsafe(() => body.apply(this, arguments));
} : function() {
  let effect2 = fromIteratorEagerUnsafe(() => body.apply(this, arguments));
  for (const pipeable of pipeables) {
    effect2 = pipeable(effect2);
  }
  return effect2;
});
var fromIteratorEagerUnsafe = (evaluate2) => {
  try {
    const iterator = evaluate2();
    let value3 = void 0;
    while (true) {
      const state = iterator.next(value3);
      if (state.done) {
        return succeed3(state.value);
      }
      const primitive = state.value;
      if (primitive && primitive._tag === "Success") {
        value3 = primitive.value;
        continue;
      } else if (primitive && primitive._tag === "Failure") {
        return state.value;
      } else {
        let isFirstExecution = true;
        return suspend(() => {
          if (isFirstExecution) {
            isFirstExecution = false;
            return flatMap3(state.value, (value4) => fromIteratorUnsafe(iterator, value4));
          } else {
            return suspend(() => fromIteratorUnsafe(evaluate2()));
          }
        });
      }
    }
  } catch (error) {
    return die(error);
  }
};
var fromIteratorUnsafe = /* @__PURE__ */ makePrimitive({
  op: "Iterator",
  single: false,
  [contA](value3, fiber3) {
    const iter = this[args][0];
    while (true) {
      const state = iter.next(value3);
      if (state.done) return succeed3(state.value);
      if (!effectIsExit(state.value)) {
        fiber3._stack.push(this);
        return state.value;
      } else if (state.value._tag === "Failure") {
        return state.value;
      }
      value3 = state.value.value;
    }
  },
  [evaluate](fiber3) {
    return this[contA](this[args][1], fiber3);
  }
});
var as2 = /* @__PURE__ */ dual(2, (self, value3) => {
  const b = succeed3(value3);
  return flatMap3(self, (_) => b);
});
var asSome = (self) => map5(self, some2);
var flip = (self) => matchEffect(self, {
  onFailure: succeed3,
  onSuccess: fail3
});
var andThen2 = /* @__PURE__ */ dual(2, (self, f) => flatMap3(self, (a) => isEffect(f) ? f : internalCall(() => f(a))));
var tap2 = /* @__PURE__ */ dual(2, (self, f) => flatMap3(self, (a) => as2(isEffect(f) ? f : internalCall(() => f(a)), a)));
var asVoid2 = (self) => flatMap3(self, (_) => exitVoid);
var sandbox = (self) => catchCause(self, fail3);
var raceAll = (all4, options2) => withFiber((parent) => callback((resume) => {
  const effects = fromIterable2(all4);
  const len = effects.length;
  let doneCount = 0;
  let done4 = false;
  const fibers = /* @__PURE__ */ new Set();
  const failures = [];
  const onExit3 = (exit3, fiber3, i) => {
    doneCount++;
    if (exit3._tag === "Failure") {
      failures.push(...exit3.cause.reasons);
      if (doneCount >= len) {
        resume(failCause(causeFromReasons(failures)));
      }
      return;
    }
    const isWinner = !done4;
    done4 = true;
    resume(fibers.size === 0 ? exit3 : flatMap3(uninterruptible(fiberInterruptAll(fibers)), () => exit3));
    if (isWinner && options2?.onWinner) {
      options2.onWinner({
        fiber: fiber3,
        index: i,
        parentFiber: parent
      });
    }
  };
  for (let i = 0; i < len; i++) {
    const fiber3 = forkUnsafe(parent, effects[i], true, true, false);
    fibers.add(fiber3);
    fiber3.addObserver((exit3) => {
      fibers.delete(fiber3);
      onExit3(exit3, fiber3, i);
    });
    if (done4) break;
  }
  return fiberInterruptAll(fibers);
}));
var raceAllFirst = (all4, options2) => withFiber((parent) => callback((resume) => {
  let done4 = false;
  const fibers = /* @__PURE__ */ new Set();
  const onExit3 = (exit3) => {
    done4 = true;
    resume(fibers.size === 0 ? exit3 : flatMap3(uninterruptible(fiberInterruptAll(fibers)), () => exit3));
  };
  let i = 0;
  for (const effect2 of all4) {
    if (done4) break;
    const index2 = i++;
    const fiber3 = forkUnsafe(parent, effect2, true, true, false);
    fibers.add(fiber3);
    fiber3.addObserver((exit3) => {
      fibers.delete(fiber3);
      const isWinner = !done4;
      onExit3(exit3);
      if (isWinner && options2?.onWinner) {
        options2.onWinner({
          fiber: fiber3,
          index: index2,
          parentFiber: parent
        });
      }
    });
  }
  return fiberInterruptAll(fibers);
}));
var race = /* @__PURE__ */ dual((args2) => isEffect(args2[1]), (self, that, options2) => raceAll([self, that], options2));
var raceFirst = /* @__PURE__ */ dual((args2) => isEffect(args2[1]), (self, that, options2) => raceAllFirst([self, that], options2));
var flatMap3 = /* @__PURE__ */ dual(2, (self, f) => {
  const onSuccess = Object.create(OnSuccessProto);
  onSuccess[args] = self;
  onSuccess[contA] = f.length !== 1 ? (a) => f(a) : f;
  return onSuccess;
});
var OnSuccessProto = /* @__PURE__ */ makePrimitiveProto({
  op: "OnSuccess",
  [evaluate](fiber3) {
    fiber3._stack.push(this);
    return this[args];
  }
});
var matchCauseEffectEager = /* @__PURE__ */ dual(2, (self, options2) => {
  if (effectIsExit(self)) {
    return self._tag === "Success" ? options2.onSuccess(self.value) : options2.onFailure(self.cause);
  }
  return matchCauseEffect(self, options2);
});
var effectIsExit = (effect2) => ExitTypeId in effect2;
var flatMapEager = /* @__PURE__ */ dual(2, (self, f) => {
  if (effectIsExit(self)) {
    return self._tag === "Success" ? f(self.value) : self;
  }
  return flatMap3(self, f);
});
var flatten3 = (self) => flatMap3(self, identity);
var map5 = /* @__PURE__ */ dual(2, (self, f) => flatMap3(self, (a) => succeed3(internalCall(() => f(a)))));
var mapEager = /* @__PURE__ */ dual(2, (self, f) => effectIsExit(self) ? exitMap(self, f) : map5(self, f));
var mapErrorEager = /* @__PURE__ */ dual(2, (self, f) => effectIsExit(self) ? exitMapError(self, f) : mapError2(self, f));
var mapBothEager = /* @__PURE__ */ dual(2, (self, options2) => effectIsExit(self) ? exitMapBoth(self, options2) : mapBoth(self, options2));
var catchEager = /* @__PURE__ */ dual(2, (self, f) => {
  if (effectIsExit(self)) {
    if (self._tag === "Success") return self;
    const error = findError(self.cause);
    if (isFailure2(error)) return self;
    return f(error.success);
  }
  return catch_(self, f);
});
var exitIsSuccess = (self) => self._tag === "Success";
var exitIsFailure = (self) => self._tag === "Failure";
var exitFilterCause = (self) => self._tag === "Failure" ? succeed2(self.cause) : fail2(self);
var exitVoid = /* @__PURE__ */ exitSucceed(void 0);
var exitMap = /* @__PURE__ */ dual(2, (self, f) => self._tag === "Success" ? exitSucceed(f(self.value)) : self);
var exitMapError = /* @__PURE__ */ dual(2, (self, f) => {
  if (self._tag === "Success") return self;
  const error = findError(self.cause);
  if (isFailure2(error)) return self;
  return exitFail(f(error.success));
});
var exitMapBoth = /* @__PURE__ */ dual(2, (self, options2) => {
  if (self._tag === "Success") return exitSucceed(options2.onSuccess(self.value));
  const error = findError(self.cause);
  if (isFailure2(error)) return self;
  return exitFail(options2.onFailure(error.success));
});
var exitAsVoidAll = (exits) => {
  const failures = [];
  for (const exit3 of exits) {
    if (exit3._tag === "Failure") {
      failures.push(...exit3.cause.reasons);
    }
  }
  return failures.length === 0 ? exitVoid : exitFailCause(causeFromReasons(failures));
};
var service = (service3) => service3;
var serviceOption = (service3) => withFiber((fiber3) => succeed3(getOption(fiber3.context, service3)));
var serviceOptional = (service3) => withFiber((fiber3) => fromOption2(getOption(fiber3.context, service3)));
var updateContext = /* @__PURE__ */ dual(2, (self, f) => withFiber((fiber3) => {
  const prevContext = fiber3.context;
  const nextContext = f(prevContext);
  if (prevContext === nextContext) return self;
  fiber3.setContext(nextContext);
  return onExitPrimitive(self, () => {
    fiber3.setContext(prevContext);
    return void 0;
  });
}));
var updateService = /* @__PURE__ */ dual(3, (self, service3, f) => updateContext(self, (s) => {
  const prev = getUnsafe(s, service3);
  const next = f(prev);
  if (prev === next) return s;
  return add(s, service3, next);
}));
var updateServiceScoped = (service3, update2, options2) => uninterruptible(withFiber((fiber3) => {
  const original = getUnsafe(fiber3.context, service3);
  const updated = update2(original);
  fiber3.setContext(add(fiber3.context, service3, updated));
  return scopeAddFinalizerExit(getUnsafe(fiber3.context, scopeTag), (_) => {
    const current = getUnsafe(fiber3.context, service3);
    let next;
    if (options2?.reset === void 0) {
      if (current !== updated) return void_2;
      next = original;
    } else {
      next = options2.reset(original, updated, current);
    }
    fiber3.setContext(add(fiber3.context, service3, next));
    return void_2;
  });
}));
var context = () => getContext;
var getContext = /* @__PURE__ */ withFiber((fiber3) => succeed3(fiber3.context));
var contextWith = (f) => withFiber((fiber3) => f(fiber3.context));
var setContext = /* @__PURE__ */ dual(2, (self, context3) => updateContext(self, constant(context3)));
var provideContext = /* @__PURE__ */ dual(2, (self, context3) => {
  if (effectIsExit(self)) return self;
  return updateContext(self, merge(context3));
});
var provideService = function() {
  if (arguments.length === 1) {
    return dual(2, (self, impl) => provideServiceImpl(self, arguments[0], impl));
  }
  return dual(3, (self, service3, impl) => provideServiceImpl(self, service3, impl)).apply(this, arguments);
};
var provideServiceImpl = (self, service3, implementation) => updateContext(self, add(service3, implementation));
var provideServiceEffect = /* @__PURE__ */ dual(3, (self, service3, acquire) => flatMap3(acquire, (implementation) => provideService(self, service3, implementation)));
var zip = /* @__PURE__ */ dual((args2) => isEffect(args2[1]), (self, that, options2) => zipWith2(self, that, (a, a2) => [a, a2], options2));
var zipWith2 = /* @__PURE__ */ dual((args2) => isEffect(args2[1]), (self, that, f, options2) => options2?.concurrent ? map5(all2([self, that], {
  concurrency: 2
}), ([a, a2]) => internalCall(() => f(a, a2))) : flatMap3(self, (a) => map5(that, (a2) => internalCall(() => f(a, a2)))));
var filterOrFail = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, predicate, orFailWith) => filterOrElse(self, predicate, orFailWith ? (a) => fail3(orFailWith(a)) : () => fail3(new NoSuchElementError())));
var when = /* @__PURE__ */ dual(2, (self, condition) => flatMap3(condition, (pass) => pass ? asSome(self) : succeedNone));
var replicate = /* @__PURE__ */ dual(2, (self, n) => Array.from({
  length: n
}, () => self));
var replicateEffect = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, n, options2) => all2(replicate(self, n), options2));
var forever = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options2) => whileLoop({
  while: constTrue,
  body: constant(options2?.disableYield ? self : flatMap3(self, (_) => yieldNow)),
  step: constVoid
}));
var catchCause = /* @__PURE__ */ dual(2, (self, f) => {
  const onFailure = Object.create(OnFailureProto);
  onFailure[args] = self;
  onFailure[contE] = f.length !== 1 ? (cause) => f(cause) : f;
  return onFailure;
});
var OnFailureProto = /* @__PURE__ */ makePrimitiveProto({
  op: "OnFailure",
  [evaluate](fiber3) {
    fiber3._stack.push(this);
    return this[args];
  }
});
var catchCauseIf = /* @__PURE__ */ dual(3, (self, predicate, f) => catchCause(self, (cause) => {
  if (!predicate(cause)) {
    return failCause(cause);
  }
  return internalCall(() => f(cause));
}));
var catchCauseFilter = /* @__PURE__ */ dual(3, (self, filter8, f) => catchCause(self, (cause) => {
  const eb = filter8(cause);
  return isFailure2(eb) ? failCause(eb.failure) : internalCall(() => f(eb.success, cause));
}));
var catch_ = /* @__PURE__ */ dual(2, (self, f) => catchCauseFilter(self, findError, (e) => f(e)));
var catchNoSuchElement = (self) => matchEffect(self, {
  onFailure: (error) => isNoSuchElementError(error) ? succeedNone : fail3(error),
  onSuccess: succeedSome
});
var catchDefect = /* @__PURE__ */ dual(2, (self, f) => catchCauseFilter(self, findDefect, f));
var tapCause = /* @__PURE__ */ dual(2, (self, f) => catchCause(self, (cause) => andThen2(internalCall(() => f(cause)), failCause(cause))));
var tapCauseIf = /* @__PURE__ */ dual(3, (self, predicate, f) => catchCauseIf(self, predicate, (cause) => andThen2(internalCall(() => f(cause)), failCause(cause))));
var tapCauseFilter = /* @__PURE__ */ dual(3, (self, filter8, f) => catchCause(self, (cause) => {
  const result3 = filter8(cause);
  if (isFailure2(result3)) {
    return failCause(cause);
  }
  return andThen2(internalCall(() => f(result3.success, cause)), failCause(cause));
}));
var tapError = /* @__PURE__ */ dual(2, (self, f) => tapCauseFilter(self, findError, (e) => f(e)));
var tapErrorTag = /* @__PURE__ */ dual(3, (self, k, f) => {
  const predicate = Array.isArray(k) ? (e) => hasProperty(e, "_tag") && k.includes(e._tag) : isTagged(k);
  return tapError(self, (error) => predicate(error) ? f(error) : void_2);
});
var tapDefect = /* @__PURE__ */ dual(2, (self, f) => tapCauseFilter(self, findDefect, (_) => f(_)));
var catchIf = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, predicate, f, orElse2) => catchCause(self, (cause) => {
  const error = findError(cause);
  if (isFailure2(error)) return failCause(error.failure);
  if (!predicate(error.success)) {
    return orElse2 ? internalCall(() => orElse2(error.success)) : failCause(cause);
  }
  return internalCall(() => f(error.success));
}));
var catchFilter = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, filter8, f, orElse2) => catchCause(self, (cause) => {
  const error = findError(cause);
  if (isFailure2(error)) return failCause(error.failure);
  const result3 = filter8(error.success);
  if (isFailure2(result3)) {
    return orElse2 ? internalCall(() => orElse2(result3.failure)) : failCause(cause);
  }
  return internalCall(() => f(result3.success));
}));
var catchTag = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, k, f, orElse2) => {
  const pred = Array.isArray(k) ? (e) => hasProperty(e, "_tag") && k.includes(e._tag) : isTagged(k);
  return catchIf(self, pred, f, orElse2);
});
var catchTags = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, cases, orElse2) => {
  let keys4;
  return catchFilter(self, (e) => {
    keys4 ??= Object.keys(cases);
    return hasProperty(e, "_tag") && isString(e["_tag"]) && keys4.includes(e["_tag"]) ? succeed2(e) : fail2(e);
  }, (e) => internalCall(() => cases[e["_tag"]](e)), orElse2);
});
var catchReason = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, errorTag, reasonTag, f, orElse2) => catchIf(self, (e) => isTagged(e, errorTag) && hasProperty(e, "reason"), (e) => {
  const reason = e.reason;
  if (isTagged(reason, reasonTag)) return f(reason, e);
  return orElse2 ? internalCall(() => orElse2(reason, e)) : fail3(e);
}));
var catchReasons = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, errorTag, cases, orElse2) => {
  let keys4;
  return catchIf(self, (e) => isTagged(e, errorTag) && hasProperty(e, "reason") && hasProperty(e.reason, "_tag") && isString(e.reason._tag), (e) => {
    const reason = e.reason;
    keys4 ??= Object.keys(cases);
    if (keys4.includes(reason._tag)) {
      return internalCall(() => cases[reason._tag](reason, e));
    }
    return orElse2 ? internalCall(() => orElse2(reason, e)) : fail3(e);
  });
});
var unwrapReason = /* @__PURE__ */ dual(2, (self, errorTag) => catchFilter(self, (e) => {
  if (isTagged(e, errorTag) && hasProperty(e, "reason")) {
    return succeed2(e.reason);
  }
  return fail2(e);
}, fail3));
var mapError2 = /* @__PURE__ */ dual(2, (self, f) => catch_(self, (error) => failSync(() => f(error))));
var mapBoth = /* @__PURE__ */ dual(2, (self, options2) => matchEffect(self, {
  onFailure: (e) => failSync(() => options2.onFailure(e)),
  onSuccess: (a) => sync(() => options2.onSuccess(a))
}));
var orDie = (self) => catch_(self, die);
var orElseSucceed = /* @__PURE__ */ dual(2, (self, f) => catch_(self, (_) => sync(f)));
var firstSuccessOf = (effects) => suspend(() => {
  const iterator = effects[Symbol.iterator]();
  let state = iterator.next();
  if (state.done) {
    return die(new Error("Received an empty collection of effects"));
  }
  function loop(current) {
    const next = iterator.next();
    if (next.done) return current.value;
    return catch_(current.value, (_) => loop(next));
  }
  return loop(state);
});
var eventually = (self) => catch_(self, (_) => flatMap3(yieldNow, () => eventually(self)));
var ignore = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options2) => {
  if (!options2?.log) {
    return matchEffect(self, {
      onFailure: (_) => void_2,
      onSuccess: (_) => void_2
    });
  }
  const logEffect = logWithLevel(options2.log === true ? void 0 : options2.log);
  return matchCauseEffect(self, {
    onFailure(cause) {
      const failure = findFail(cause);
      return isFailure2(failure) ? failCause(failure.failure) : options2.message === void 0 ? logEffect(cause) : logEffect(options2.message, cause);
    },
    onSuccess: (_) => void_2
  });
});
var ignoreCause = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options2) => {
  if (!options2?.log) {
    return matchCauseEffect(self, {
      onFailure: (_) => void_2,
      onSuccess: (_) => void_2
    });
  }
  const logEffect = logWithLevel(options2.log === true ? void 0 : options2.log);
  return matchCauseEffect(self, {
    onFailure: (cause) => options2.message === void 0 ? logEffect(cause) : logEffect(options2.message, cause),
    onSuccess: (_) => void_2
  });
});
var option = (self) => match4(self, {
  onFailure: none2,
  onSuccess: some2
});
var result = (self) => matchEager(self, {
  onFailure: fail2,
  onSuccess: succeed2
});
var matchCauseEffect = /* @__PURE__ */ dual(2, (self, options2) => {
  const primitive = Object.create(OnSuccessAndFailureProto);
  primitive[args] = self;
  primitive[contA] = options2.onSuccess.length !== 1 ? (a) => options2.onSuccess(a) : options2.onSuccess;
  primitive[contE] = options2.onFailure.length !== 1 ? (cause) => options2.onFailure(cause) : options2.onFailure;
  return primitive;
});
var OnSuccessAndFailureProto = /* @__PURE__ */ makePrimitiveProto({
  op: "OnSuccessAndFailure",
  [evaluate](fiber3) {
    fiber3._stack.push(this);
    return this[args];
  }
});
var matchCause = /* @__PURE__ */ dual(2, (self, options2) => matchCauseEffect(self, {
  onFailure: (cause) => sync(() => options2.onFailure(cause)),
  onSuccess: (value3) => sync(() => options2.onSuccess(value3))
}));
var matchEffect = /* @__PURE__ */ dual(2, (self, options2) => matchCauseEffect(self, {
  onFailure: (cause) => {
    const fail7 = cause.reasons.find(isFailReason);
    return fail7 ? internalCall(() => options2.onFailure(fail7.error)) : failCause(cause);
  },
  onSuccess: options2.onSuccess
}));
var match4 = /* @__PURE__ */ dual(2, (self, options2) => matchEffect(self, {
  onFailure: (error) => sync(() => options2.onFailure(error)),
  onSuccess: (value3) => sync(() => options2.onSuccess(value3))
}));
var matchEager = /* @__PURE__ */ dual(2, (self, options2) => {
  if (effectIsExit(self)) {
    if (self._tag === "Success") return exitSucceed(options2.onSuccess(self.value));
    const error = findError(self.cause);
    if (isFailure2(error)) return self;
    return exitSucceed(options2.onFailure(error.success));
  }
  return match4(self, options2);
});
var matchCauseEager = /* @__PURE__ */ dual(2, (self, options2) => {
  if (effectIsExit(self)) {
    if (self._tag === "Success") return exitSucceed(options2.onSuccess(self.value));
    return exitSucceed(options2.onFailure(self.cause));
  }
  return matchCause(self, options2);
});
var exit = (self) => effectIsExit(self) ? exitSucceed(self) : exitPrimitive(self);
var exitPrimitive = /* @__PURE__ */ makePrimitive({
  op: "Exit",
  [evaluate](fiber3) {
    fiber3._stack.push(this);
    return this[args];
  },
  [contA](value3, _, exit3) {
    return succeed3(exit3 ?? exitSucceed(value3));
  },
  [contE](cause, _, exit3) {
    return succeed3(exit3 ?? exitFailCause(cause));
  }
});
var isFailure3 = /* @__PURE__ */ matchEager({
  onFailure: () => true,
  onSuccess: () => false
});
var isSuccess3 = /* @__PURE__ */ matchEager({
  onFailure: () => false,
  onSuccess: () => true
});
var delay = /* @__PURE__ */ dual(2, (self, duration) => andThen2(sleep(duration), self));
var timeoutOrElse = /* @__PURE__ */ dual(2, (self, options2) => raceFirst(self, flatMap3(sleep(options2.duration), options2.orElse)));
var timeout = /* @__PURE__ */ dual(2, (self, duration) => timeoutOrElse(self, {
  duration,
  orElse: () => fail3(new TimeoutError())
}));
var timeoutOption = /* @__PURE__ */ dual(2, (self, duration) => raceFirst(asSome(self), as2(sleep(duration), none2())));
var timed = (self) => clockWith((clock) => {
  const start = clock.monotonicTimeNanosUnsafe();
  return map5(self, (a) => [nanos(clock.monotonicTimeNanosUnsafe() - start), a]);
});
var ScopeTypeId = "~effect/Scope";
var ScopeCloseableTypeId = "~effect/Scope/Closeable";
var scopeTag = /* @__PURE__ */ Service("effect/Scope");
var scopeClose = (self, exit_) => suspend(() => scopeCloseUnsafe(self, exit_) ?? void_2);
var scopeCloseUnsafe = (self, exit_) => {
  if (self.state._tag === "Closed") return;
  const closed = {
    _tag: "Closed",
    exit: exit_
  };
  if (self.state._tag === "Empty") {
    self.state = closed;
    return;
  }
  const state = self.state;
  self.state = closed;
  if (state.finalizer !== void 0) {
    return state.finalizer(exit_);
  }
  const finalizers = state.finalizers;
  if (finalizers === void 0 || finalizers.size === 0) {
    return;
  } else if (finalizers.size === 1) {
    return finalizers.values().next().value(exit_);
  }
  return scopeCloseFinalizers(self, finalizers, exit_);
};
var combineFinalizerCause = (exit_, finalizer) => exitIsSuccess(exit_) ? finalizer : catchCause(finalizer, (cause) => failCause(causeCombine(exit_.cause, cause)));
var scopeCloseFinalizers = /* @__PURE__ */ fnUntraced(function* (self, finalizers, exit_) {
  let exits = [];
  const fibers = [];
  const arr = Array.from(finalizers.values());
  const parent = getCurrentFiber();
  for (let i = arr.length - 1; i >= 0; i--) {
    const finalizer = arr[i];
    if (self.strategy === "sequential") {
      exits.push(yield* exit(finalizer(exit_)));
    } else {
      fibers.push(forkUnsafe(parent, finalizer(exit_), true, true, "inherit"));
    }
  }
  if (fibers.length > 0) {
    exits = yield* fiberAwaitAll(fibers);
  }
  return yield* exitAsVoidAll(exits);
});
var scopeForkUnsafe = (scope3, finalizerStrategy) => {
  const newScope = scopeMakeUnsafe(finalizerStrategy);
  if (scope3.state._tag === "Closed") {
    newScope.state = scope3.state;
    return newScope;
  }
  const key = {};
  scopeAddFinalizerUnsafe(scope3, key, (exit3) => scopeClose(newScope, exit3));
  scopeAddFinalizerUnsafe(newScope, key, (_) => sync(() => scopeRemoveFinalizerUnsafe(scope3, key)));
  return newScope;
};
var scopeAddFinalizerExit = (scope3, finalizer) => {
  return suspend(() => {
    if (scope3.state._tag === "Closed") {
      return finalizer(scope3.state.exit);
    }
    scopeAddFinalizerUnsafe(scope3, {}, finalizer);
    return void_2;
  });
};
var scopeAddFinalizerUnsafe = (scope3, key, finalizer) => {
  if (scope3.state._tag === "Empty") {
    scope3.state = {
      _tag: "Open",
      finalizerKey: key,
      finalizer,
      finalizers: void 0
    };
  } else if (scope3.state._tag === "Open") {
    const state = scope3.state;
    if (state.finalizer !== void 0) {
      state.finalizers = /* @__PURE__ */ new Map([[state.finalizerKey, state.finalizer]]);
      state.finalizerKey = void 0;
      state.finalizer = void 0;
      state.finalizers.set(key, finalizer);
    } else if (state.finalizers === void 0) {
      state.finalizerKey = key;
      state.finalizer = finalizer;
    } else {
      state.finalizers.set(key, finalizer);
    }
  }
};
var scopeRemoveFinalizerUnsafe = (scope3, key) => {
  if (scope3.state._tag === "Open") {
    const state = scope3.state;
    if (state.finalizerKey === key) {
      state.finalizerKey = void 0;
      state.finalizer = void 0;
    } else if (state.finalizers !== void 0) {
      state.finalizers.delete(key);
    }
  }
};
var scopeMakeUnsafe = (finalizerStrategy = "sequential") => ({
  [ScopeCloseableTypeId]: ScopeCloseableTypeId,
  [ScopeTypeId]: ScopeTypeId,
  strategy: finalizerStrategy,
  state: constScopeEmpty
});
var constScopeEmpty = {
  _tag: "Empty"
};
var scope = scopeTag;
var provideScope = /* @__PURE__ */ provideService(scopeTag);
var scoped = (self) => withFiber((fiber3) => {
  const prev = fiber3.context;
  const scope3 = scopeMakeUnsafe();
  fiber3.setContext(add(fiber3.context, scopeTag, scope3));
  return onExitPrimitive(self, (exit3) => {
    fiber3.setContext(prev);
    return scopeCloseUnsafe(scope3, exit3);
  });
});
var scopedWith = (f) => suspend(() => {
  const scope3 = scopeMakeUnsafe();
  return onExit(f(scope3), (exit3) => suspend(() => scopeCloseUnsafe(scope3, exit3) ?? void_2));
});
var acquireRelease = (acquire, release, options2) => contextWith((context3) => uninterruptibleMask((restore) => flatMap3(scope, (scope3) => tap2(options2?.interruptible ? restore(acquire) : acquire, (a) => scopeAddFinalizerExit(scope3, (exit3) => provideContext(release(a, exit3), context3))))));
var addFinalizer = (finalizer) => flatMap3(scope, (scope3) => contextWith((context3) => scopeAddFinalizerExit(scope3, (exit3) => provideContext(finalizer(exit3), context3))));
var onExitPrimitive = /* @__PURE__ */ makePrimitive({
  op: "OnExit",
  single: false,
  [evaluate](fiber3) {
    fiber3._stack.push(this);
    return this[args][0];
  },
  [contAll](fiber3) {
    if (fiber3.interruptible && this[args][2] !== true) {
      fiber3._stack.push(setInterruptibleTrue);
      fiber3.interruptible = false;
    }
  },
  [contA](value3, _, exit3) {
    exit3 ??= exitSucceed(value3);
    const eff = this[args][1](exit3);
    return eff ? flatMap3(eff, (_2) => exit3) : exit3;
  },
  [contE](cause, _, exit3) {
    exit3 ??= exitFailCause(cause);
    const eff = this[args][1](exit3);
    return eff ? flatMap3(combineFinalizerCause(exit3, eff), (_2) => exit3) : exit3;
  }
});
var onExit = /* @__PURE__ */ dual(2, onExitPrimitive);
var ensuring = /* @__PURE__ */ dual(2, (self, finalizer) => onExit(self, (_) => finalizer));
var onExitIf = /* @__PURE__ */ dual(3, (self, predicate, f) => onExit(self, (exit3) => {
  if (!predicate(exit3)) {
    return void_2;
  }
  return f(exit3);
}));
var onExitFilter = /* @__PURE__ */ dual(3, (self, filter8, f) => onExit(self, (exit3) => {
  const b = filter8(exit3);
  return isFailure2(b) ? void_2 : f(b.success, exit3);
}));
var onError = /* @__PURE__ */ dual(2, (self, f) => onExitFilter(self, exitFilterCause, f));
var onErrorIf = /* @__PURE__ */ dual(3, (self, predicate, f) => onExitIf(self, (exit3) => {
  if (exit3._tag !== "Failure") {
    return false;
  }
  return predicate(exit3.cause);
}, (exit3) => f(exit3.cause)));
var onErrorFilter = /* @__PURE__ */ dual(3, (self, filter8, f) => onExit(self, (exit3) => {
  if (exit3._tag !== "Failure") {
    return void_2;
  }
  const result3 = filter8(exit3.cause);
  return isFailure2(result3) ? void_2 : f(result3.success, exit3.cause);
}));
var onInterrupt = /* @__PURE__ */ dual(2, (self, finalizer) => onErrorFilter(causeFilterInterruptors, finalizer)(self));
var acquireUseRelease = (acquire, use, release) => uninterruptibleMask((restore) => flatMap3(acquire, (a) => onExitPrimitive(restore(use(a)), (exit3) => release(a, exit3), true)));
var acquireDisposable = (acquire) => acquireRelease(acquire, (resource) => hasProperty(resource, Symbol.asyncDispose) ? promise(() => resource[Symbol.asyncDispose]()) : sync(() => resource[Symbol.dispose]()));
var cachedInvalidateWithTTL = /* @__PURE__ */ dual(2, (self, ttl) => sync(() => {
  const ttlMillis = toMillis(fromInputUnsafe(ttl));
  const isFinite3 = Number.isFinite(ttlMillis);
  const latch = makeLatchUnsafe(false);
  let expiresAt = 0;
  let running = false;
  let exit3;
  const wait = flatMap3(latch.await, () => exit3);
  return [withFiber((fiber3) => {
    const clock = fiber3.getRef(ClockRef);
    const now3 = isFinite3 ? clock.currentTimeMillisUnsafe() : 0;
    if (running || now3 < expiresAt) return exit3 ?? wait;
    running = true;
    latch.closeUnsafe();
    exit3 = void 0;
    return onExit(self, (exit_) => sync(() => {
      running = false;
      expiresAt = clock.currentTimeMillisUnsafe() + ttlMillis;
      exit3 = exit_;
      latch.openUnsafe();
    }));
  }), sync(() => {
    expiresAt = 0;
    latch.closeUnsafe();
    exit3 = void 0;
  })];
}));
var cachedWithTTL = /* @__PURE__ */ dual(2, (self, timeToLive) => map5(cachedInvalidateWithTTL(self, timeToLive), (tuple2) => tuple2[0]));
var cached = (self) => cachedWithTTL(self, infinity);
var interrupt = /* @__PURE__ */ withFiber((fiber3) => failCause(causeInterrupt(fiber3.id)));
var uninterruptible = (self) => withFiber((fiber3) => {
  if (!fiber3.interruptible) return self;
  fiber3.interruptible = false;
  fiber3._stack.push(setInterruptibleTrue);
  return self;
});
var setInterruptible = /* @__PURE__ */ makePrimitive({
  op: "SetInterruptible",
  [contAll](fiber3) {
    fiber3.interruptible = this[args];
    if (fiber3._interruptedCause && fiber3.interruptible) {
      return () => failCause(fiber3._interruptedCause);
    }
  }
});
var setInterruptibleTrue = /* @__PURE__ */ setInterruptible(true);
var setInterruptibleFalse = /* @__PURE__ */ setInterruptible(false);
var setFiberInterruptible = (fiber3) => {
  fiber3.interruptible = true;
  fiber3._stack.push(setInterruptibleFalse);
  if (fiber3._interruptedCause) return failCause(fiber3._interruptedCause);
};
var interruptible = (self) => withFiber((fiber3) => {
  if (fiber3.interruptible) return self;
  return setFiberInterruptible(fiber3) ?? self;
});
var uninterruptibleMask = (f) => withFiber((fiber3) => {
  if (!fiber3.interruptible) return f(identity);
  fiber3.interruptible = false;
  fiber3._stack.push(setInterruptibleTrue);
  return f(interruptible);
});
var interruptibleMask = (f) => withFiber((fiber3) => {
  if (fiber3.interruptible) return f(identity);
  const interrupted = setFiberInterruptible(fiber3);
  const effect2 = f(uninterruptible);
  return interrupted ?? effect2;
});
var abortSignal = /* @__PURE__ */ map5(/* @__PURE__ */ acquireRelease(/* @__PURE__ */ sync(() => new AbortController()), (controller) => sync(() => controller.abort())), (_) => _.signal);
var all2 = (arg, options2) => {
  if (isIterable(arg)) {
    return options2?.mode === "result" ? forEach(arg, result, options2) : forEach(arg, identity, options2);
  } else if (options2?.discard) {
    return options2.mode === "result" ? forEach(Object.values(arg), result, options2) : forEach(Object.values(arg), identity, options2);
  }
  return suspend(() => {
    const out = {};
    return as2(forEach(Object.entries(arg), ([key, effect2]) => map5(options2?.mode === "result" ? result(effect2) : effect2, (value3) => {
      assignProperty(out, key, value3);
    }), {
      discard: true,
      concurrency: options2?.concurrency
    }), out);
  });
};
var partition2 = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, f, options2) => map5(forEach(elements, (a, i) => result(f(a, i)), options2), (results) => partition(results, identity)));
var reduce = /* @__PURE__ */ dual(3, (elements, zero3, f) => {
  const arr = fromIterable2(elements);
  if (arr.length === 0) return sync(zero3);
  return suspend(() => {
    let index2 = 0;
    let state = zero3();
    return map5(whileLoop({
      while: () => index2 < arr.length,
      body: () => f(state, arr[index2], index2),
      step(next) {
        state = next;
        index2++;
      }
    }), () => state);
  });
});
var validate = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, f, options2) => flatMap3(partition2(elements, f, {
  concurrency: options2?.concurrency
}), ([excluded, satisfying]) => {
  if (isArrayNonEmpty2(excluded)) {
    return fail3(excluded);
  }
  return options2?.discard ? void_2 : succeed3(satisfying);
}));
var findFirst = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, predicate) => suspend(() => {
  const iterator = elements[Symbol.iterator]();
  const next = iterator.next();
  if (!next.done) {
    return findFirstLoop(iterator, 0, predicate, next.value);
  }
  return succeed3(none2());
}));
var findFirstLoop = (iterator, index2, predicate, value3) => flatMap3(predicate(value3, index2), (keep) => {
  if (keep) {
    return succeed3(some2(value3));
  }
  const next = iterator.next();
  if (!next.done) {
    return findFirstLoop(iterator, index2 + 1, predicate, next.value);
  }
  return succeed3(none2());
});
var findFirstFilter = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, filter8) => suspend(() => {
  const iterator = elements[Symbol.iterator]();
  const next = iterator.next();
  if (!next.done) {
    return findFirstFilterLoop(iterator, 0, filter8, next.value);
  }
  return succeed3(none2());
}));
var findFirstFilterLoop = (iterator, index2, filter8, value3) => flatMap3(filter8(value3, index2), (result3) => {
  if (isSuccess2(result3)) {
    return succeed3(some2(result3.success));
  }
  const next = iterator.next();
  if (!next.done) {
    return findFirstFilterLoop(iterator, index2 + 1, filter8, next.value);
  }
  return succeed3(none2());
});
var whileLoop = /* @__PURE__ */ makePrimitive({
  op: "While",
  [contA](value3, fiber3) {
    this[args].step(value3);
    if (this[args].while()) {
      fiber3._stack.push(this);
      return this[args].body();
    }
    return exitVoid;
  },
  [evaluate](fiber3) {
    if (this[args].while()) {
      fiber3._stack.push(this);
      return this[args].body();
    }
    return exitVoid;
  }
});
var forEach = /* @__PURE__ */ dual((args2) => typeof args2[1] === "function", (iterable, f, options2) => suspend(() => {
  const concurrencyOption = options2?.concurrency ?? 1;
  const concurrency = concurrencyOption === "unbounded" ? Number.POSITIVE_INFINITY : Math.max(1, concurrencyOption);
  if (concurrency === 1) {
    return forEachSequential(iterable, f, options2);
  }
  const items = fromIterable2(iterable);
  let length2 = items.length;
  if (length2 === 0) {
    return options2?.discard ? void_2 : succeed3([]);
  }
  const out = options2?.discard ? void 0 : new Array(length2);
  const eff = forEachConcurrent({
    f,
    out
  }, items, {
    concurrency
  });
  return eff ? as2(eff, out) : succeed3(out);
}));
var head = (self) => flatMap3(self, (elements) => {
  const result3 = elements[Symbol.iterator]().next();
  return result3.done ? fail3(new NoSuchElementError()) : succeed3(result3.value);
});
var forEachSequential = (iterable, f, options2) => suspend(() => {
  const out = options2?.discard ? void 0 : [];
  const iterator = iterable[Symbol.iterator]();
  let state = iterator.next();
  let index2 = 0;
  return as2(whileLoop({
    while: () => !state.done,
    body: () => f(state.value, index2++),
    step: (b) => {
      if (out) out.push(b);
      state = iterator.next();
    }
  }), out);
});
var iterateEagerImpl = (options2) => {
  const onItem = options2.onItem;
  const step = options2.step;
  const runSequential = (state, items, index2, end) => {
    for (; index2 < end; index2++) {
      const item = items[index2];
      const effect2 = onItem(state, item, index2);
      if (!effectIsExit(effect2)) {
        return flatMap3(exit(effect2), (itemExit) => step(state, item, itemExit, index2) ?? runSequential(state, items, index2 + 1, end) ?? void_2);
      }
      const terminal = step(state, item, effect2, index2);
      if (terminal) return terminal._tag === "Failure" ? terminal : void 0;
    }
  };
  return (state, items, opts) => {
    let index2 = 0;
    const end = opts?.end ?? items.length;
    const concurrency = opts?.concurrency ?? 1;
    if (concurrency === 1) {
      return runSequential(state, items, 0, end);
    }
    const orderedStep = opts?.orderedStep === true;
    let done4 = false;
    let parentFiber;
    let fibers;
    let resume;
    let interrupted = false;
    let terminal;
    let effect2;
    let nextIndex = index2;
    const exits = orderedStep ? new Array(end) : void 0;
    const failDefect = (error) => {
      const defect = exitDie(error);
      terminal = defect;
      done4 = true;
      interrupted = true;
      return fibers && fibers.size > 0 ? flatMap3(uninterruptible(fiberInterruptAll(Array.from(fibers))), () => defect) : defect;
    };
    const runStep = (item, exit3, currentIndex) => {
      if (!orderedStep) return step(state, item, exit3, currentIndex);
      if (terminal) return terminal;
      exits[currentIndex] = exit3;
      while (nextIndex < end) {
        const nextExit = exits[nextIndex];
        if (nextExit === void 0) return;
        exits[nextIndex] = void 0;
        const index3 = nextIndex++;
        const result3 = step(state, items[index3], nextExit, index3);
        if (result3) return result3;
      }
    };
    const go = () => {
      let paused = false;
      for (; !terminal && index2 < end; index2++) {
        const item = items[index2];
        const eff = effect2 ?? onItem(state, item, index2);
        if (effectIsExit(eff)) {
          terminal = runStep(item, eff, index2);
          if (terminal) break;
        } else if (!parentFiber) {
          return callback((cb) => {
            parentFiber = getCurrentFiber();
            fibers = /* @__PURE__ */ new Set();
            effect2 = eff;
            resume = cb;
            let result3;
            try {
              result3 = go();
            } catch (error) {
              return cb(failDefect(error));
            }
            if (result3) return cb(result3);
            return suspend(() => {
              terminal = exitVoid;
              interrupted = true;
              return fibers ? fiberInterruptAll(fibers) : void_2;
            });
          });
        } else {
          effect2 = void 0;
          const fiber3 = forkUnsafe(parentFiber, eff, true, true, "inherit");
          if (fiber3._exit) {
            terminal = runStep(item, fiber3._exit, index2);
            if (terminal) break;
            continue;
          }
          fibers.add(fiber3);
          const currentIndex = index2;
          fiber3.addObserver((exit3) => {
            fibers.delete(fiber3);
            try {
              if (terminal) {
                if (!interrupted && exit3._tag === "Failure") {
                  for (const reason of exit3.cause.reasons) {
                    if (reason._tag === "Interrupt") continue;
                    else if (terminal._tag === "Failure") {
                      ;
                      terminal.cause.reasons.push(reason);
                    } else {
                      terminal = exitFailCause(causeFromReasons([reason]));
                    }
                  }
                }
              } else {
                const result3 = runStep(item, exit3, currentIndex);
                if (result3) {
                  terminal = result3._tag === "Failure" ? exitFailCause(causeFromReasons(result3.cause.reasons.slice())) : result3;
                  go();
                }
              }
              if (paused) {
                const eff2 = go();
                if (eff2) resume(eff2);
              } else if (done4 && fibers.size === 0) {
                resume(terminal ?? void_2);
              }
            } catch (error) {
              resume(failDefect(error));
            }
          });
          if (fibers.size < concurrency) continue;
          paused = true;
          index2++;
          return;
        }
      }
      done4 = true;
      if (terminal) {
        if (fibers && fibers.size > 0) {
          const annotations = fiberStackAnnotations(parentFiber);
          fibers.forEach((f) => f.interruptUnsafe(parentFiber.id, annotations));
          return;
        }
        if (resume || terminal._tag === "Failure") {
          return terminal;
        }
      } else if (resume) {
        if (!fibers) {
          return exitVoid;
        } else if (fibers.size === 0) {
          resume(void_2);
        }
      }
    };
    return go();
  };
};
var iterateEager = () => iterateEagerImpl;
var forEachConcurrent = /* @__PURE__ */ iterateEagerImpl({
  onItem(state, item, index2) {
    return state.f(item, index2);
  },
  step(state, _, exit3, index2) {
    if (exit3._tag === "Failure") return exit3;
    else if (state.out) {
      state.out[index2] = exit3.value;
    }
  }
});
var filterOrElse = /* @__PURE__ */ dual(3, (self, predicate, orElse2) => flatMap3(self, (a) => predicate(a) ? succeed3(a) : orElse2(a)));
var filterMapOrElse = /* @__PURE__ */ dual(3, (self, filter8, orElse2) => flatMap3(self, (a) => {
  const result3 = filter8(a);
  return isFailure2(result3) ? orElse2(result3.failure) : succeed3(result3.success);
}));
var filterMapOrFail = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, filter8, orFailWith) => filterMapOrElse(self, filter8, orFailWith ? (x) => fail3(orFailWith(x)) : () => fail3(new NoSuchElementError())));
var filter3 = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, predicate, options2) => suspend(() => {
  const out = [];
  return as2(forEach(elements, (a, i) => {
    const result3 = predicate(a, i);
    if (typeof result3 === "boolean") {
      if (result3) out.push(a);
      return void_2;
    }
    return map5(result3, (keep) => {
      if (keep) {
        out.push(a);
      }
    });
  }, {
    discard: true,
    concurrency: options2?.concurrency
  }), out);
}));
var filterMap2 = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, filter8) => suspend(() => {
  const out = [];
  for (const a of elements) {
    const result3 = filter8(a);
    if (isSuccess2(result3)) {
      out.push(result3.success);
    }
  }
  return succeed3(out);
}));
var filterMapEffect = /* @__PURE__ */ dual((args2) => isIterable(args2[0]) && !isEffect(args2[0]), (elements, filter8, options2) => suspend(() => {
  const out = [];
  return as2(forEach(elements, (a) => map5(filter8(a), (result3) => {
    if (isSuccess2(result3)) {
      out.push(result3.success);
    }
  }), {
    discard: true,
    concurrency: options2?.concurrency
  }), out);
}));
var Do2 = /* @__PURE__ */ succeed3({});
var bindTo3 = /* @__PURE__ */ bindTo(map5);
var bind3 = /* @__PURE__ */ bind(map5, flatMap3);
var let_3 = /* @__PURE__ */ let_(map5);
var forkChild = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options2) => withFiber((fiber3) => {
  interruptChildrenPatch();
  return succeed3(forkUnsafe(fiber3, self, options2?.startImmediately, false, options2?.uninterruptible ?? false));
}));
var forkUnsafe = (parent, effect2, immediate = false, daemon = false, uninterruptible3 = false) => {
  const parentRuntime = parent;
  const interruptible3 = uninterruptible3 === "inherit" ? parentRuntime.interruptible : !uninterruptible3;
  const child = new FiberImpl(parentRuntime.context, interruptible3);
  if (immediate) {
    child.evaluate(effect2);
  } else {
    parentRuntime.currentDispatcher.scheduleTask(() => child.evaluate(effect2), 0);
  }
  if (!daemon && !child._exit) {
    parentRuntime.children().add(child);
    child.addObserver(() => parentRuntime._children.delete(child));
  }
  return child;
};
var forkDetach = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options2) => withFiber((fiber3) => succeed3(forkUnsafe(fiber3, self, options2?.startImmediately, true, options2?.uninterruptible))));
var awaitAllChildren = (self) => withFiber((fiber3) => {
  const initialChildren = fiber3._children && new Set(fiber3._children);
  return onExit(self, (_) => {
    let children = fiber3._children;
    if (children === void 0 || children.size === 0) {
      return void_2;
    } else if (initialChildren) {
      children = filter2(children, (child) => !initialChildren.has(child));
    }
    return asVoid2(fiberAwaitAll(children));
  });
});
var forkIn = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, scope3, options2) => withFiber((parent) => {
  const fiber3 = forkUnsafe(parent, self, options2?.startImmediately, true, options2?.uninterruptible);
  if (!fiber3._exit) {
    if (scope3.state._tag !== "Closed") {
      const key = {};
      const finalizer = () => withFiberId((interruptor) => interruptor === fiber3.id ? void_2 : fiberInterrupt(fiber3));
      scopeAddFinalizerUnsafe(scope3, key, finalizer);
      fiber3.addObserver(() => scopeRemoveFinalizerUnsafe(scope3, key));
    } else {
      fiber3.interruptUnsafe(parent.id, fiberStackAnnotations(parent));
    }
  }
  return succeed3(fiber3);
}));
var forkScoped = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options2) => flatMap3(scope, (scope3) => forkIn(self, scope3, options2)));
var runForkWith = (context3) => (effect2, options2) => {
  const fiber3 = new FiberImpl(options2?.scheduler ? add(context3, Scheduler, options2.scheduler) : context3, options2?.uninterruptible !== true);
  fiber3.evaluate(effect2);
  if (fiber3._exit) return fiber3;
  if (options2?.signal) {
    if (options2.signal.aborted) {
      fiber3.interruptUnsafe();
    } else {
      const abort = () => fiber3.interruptUnsafe();
      options2.signal.addEventListener("abort", abort, {
        once: true
      });
      fiber3.addObserver(() => options2.signal.removeEventListener("abort", abort));
    }
  }
  if (options2?.onFiberStart) {
    options2.onFiberStart(fiber3);
  }
  return fiber3;
};
var runFork = /* @__PURE__ */ runForkWith(/* @__PURE__ */ empty2());
var runCallbackWith = (context3) => {
  const runFork3 = runForkWith(context3);
  return (effect2, options2) => {
    const fiber3 = runFork3(effect2, options2);
    if (options2?.onExit) {
      fiber3.addObserver(options2.onExit);
    }
    return (interruptor) => {
      return fiber3.interruptUnsafe(interruptor);
    };
  };
};
var runCallback = /* @__PURE__ */ runCallbackWith(/* @__PURE__ */ empty2());
var runPromiseExitWith = (context3) => {
  const runFork3 = runForkWith(context3);
  return (effect2, options2) => {
    const fiber3 = runFork3(effect2, options2);
    return new Promise((resolve2) => {
      fiber3.addObserver((exit3) => resolve2(exit3));
    });
  };
};
var runPromiseExit = /* @__PURE__ */ runPromiseExitWith(/* @__PURE__ */ empty2());
var runPromiseWith = (context3) => {
  const runPromiseExit3 = runPromiseExitWith(context3);
  return (effect2, options2) => runPromiseExit3(effect2, options2).then((exit3) => {
    if (exit3._tag === "Failure") {
      throw causeSquash(exit3.cause);
    }
    return exit3.value;
  });
};
var runPromise = /* @__PURE__ */ runPromiseWith(/* @__PURE__ */ empty2());
var runSyncExitWith = (context3) => {
  const runFork3 = runForkWith(context3);
  return (effect2) => {
    if (effectIsExit(effect2)) return effect2;
    const scheduler = new MixedScheduler("sync");
    const fiber3 = runFork3(effect2, {
      scheduler
    });
    fiber3._dispatcher?.flush();
    return fiber3._exit ?? exitDie(new AsyncFiberError(fiber3));
  };
};
var runSyncExit = /* @__PURE__ */ runSyncExitWith(/* @__PURE__ */ empty2());
var runSyncWith = (context3) => {
  const runSyncExit3 = runSyncExitWith(context3);
  return (effect2) => {
    const exit3 = runSyncExit3(effect2);
    if (exit3._tag === "Failure") throw causeSquash(exit3.cause);
    return exit3.value;
  };
};
var runSync = /* @__PURE__ */ runSyncWith(/* @__PURE__ */ empty2());
var succeedTrue = /* @__PURE__ */ succeed3(true);
var succeedFalse = /* @__PURE__ */ succeed3(false);
var Latch = class {
  waiters = [];
  scheduled = void 0;
  _isOpen;
  constructor(isOpen) {
    this._isOpen = isOpen;
  }
  scheduleUnsafe(fiber3) {
    if (this.waiters.length === 0) {
      return succeedTrue;
    }
    if (this.scheduled === void 0) {
      this.scheduled = this.waiters;
      fiber3.currentDispatcher.scheduleTask(this.flushScheduled, 0);
    } else {
      for (let i = 0; i < this.waiters.length; i++) {
        this.scheduled.push(this.waiters[i]);
      }
    }
    this.waiters = [];
    return succeedTrue;
  }
  flushScheduled = () => {
    if (this.scheduled === void 0) return;
    const waiters = this.scheduled;
    this.scheduled = void 0;
    for (let i = 0; i < waiters.length; i++) {
      waiters[i](exitVoid);
    }
  };
  flushWaiters() {
    const waiters = this.waiters;
    this.waiters = [];
    this.flushScheduled();
    for (let i = 0; i < waiters.length; i++) {
      waiters[i](exitVoid);
    }
  }
  open = /* @__PURE__ */ withFiber((fiber3) => {
    if (this._isOpen) return succeedFalse;
    this._isOpen = true;
    return this.scheduleUnsafe(fiber3);
  });
  release = /* @__PURE__ */ withFiber((fiber3) => this._isOpen ? succeedFalse : this.scheduleUnsafe(fiber3));
  openUnsafe() {
    if (this._isOpen) return false;
    this._isOpen = true;
    this.flushWaiters();
    return true;
  }
  await = /* @__PURE__ */ callback((resume) => {
    if (this._isOpen) {
      return resume(void_2);
    }
    this.waiters.push(resume);
    return sync(() => {
      let index2 = this.waiters.indexOf(resume);
      if (index2 !== -1) {
        this.waiters.splice(index2, 1);
      } else if (this.scheduled !== void 0) {
        index2 = this.scheduled.indexOf(resume);
        if (index2 !== -1) {
          this.scheduled.splice(index2, 1);
        }
      }
    });
  });
  closeUnsafe() {
    if (!this._isOpen) return false;
    this._isOpen = false;
    return true;
  }
  close = /* @__PURE__ */ sync(() => this.closeUnsafe());
  whenOpen = (self) => flatMap3(this.await, () => self);
  isOpen() {
    return this._isOpen;
  }
};
var makeLatchUnsafe = (open) => new Latch(open ?? false);
var tracer = /* @__PURE__ */ withFiber((fiber3) => succeed3(fiber3.getRef(Tracer)));
var withTracer = /* @__PURE__ */ dual(2, (effect2, tracer3) => provideService(effect2, Tracer, tracer3));
var withTracerEnabled = /* @__PURE__ */ provideService(TracerEnabled);
var withTracerTiming = /* @__PURE__ */ provideService(TracerTimingEnabled);
var bigint03 = /* @__PURE__ */ BigInt(0);
var NoopSpanProto = {
  _tag: "Span",
  spanId: "noop",
  traceId: "noop",
  sampled: false,
  status: {
    _tag: "Ended",
    startTime: bigint03,
    endTime: bigint03,
    exit: exitVoid
  },
  attributes: /* @__PURE__ */ new Map(),
  links: [],
  kind: "internal",
  attribute() {
  },
  event() {
  },
  end() {
  },
  addLinks() {
  }
};
var noopSpan = (options2) => Object.assign(Object.create(NoopSpanProto), options2);
var filterDisablePropagation = (span) => {
  if (!span) return none2();
  return get(span.annotations, DisablePropagation) ? span._tag === "Span" ? filterDisablePropagation(getOrUndefined(span.parent)) : none2() : some2(span);
};
var makeSpanUnsafe = (fiber3, name, options2) => {
  const disablePropagation = !fiber3.getRef(TracerEnabled) || options2?.annotations && get(options2.annotations, DisablePropagation);
  const parent = options2?.parent !== void 0 ? some2(options2.parent) : options2?.root ? none2() : filterDisablePropagation(fiber3.currentSpan);
  let span;
  if (disablePropagation) {
    span = noopSpan({
      name,
      parent,
      annotations: add(options2?.annotations ?? empty2(), DisablePropagation, true)
    });
  } else {
    const tracer3 = fiber3.getRef(Tracer);
    const clock = fiber3.getRef(ClockRef);
    const timingEnabled = fiber3.getRef(TracerTimingEnabled);
    const annotationsFromEnv = fiber3.getRef(TracerSpanAnnotations);
    const linksFromEnv = fiber3.getRef(TracerSpanLinks);
    const level = options2?.level ?? fiber3.getRef(CurrentTraceLevel);
    const links = options2?.links !== void 0 ? [...linksFromEnv, ...options2.links] : linksFromEnv.length === 0 ? [] : linksFromEnv.slice();
    span = tracer3.span({
      name,
      parent,
      annotations: options2?.annotations ?? empty2(),
      links,
      startTime: timingEnabled ? clock.currentTimeNanosUnsafe() : BigInt(0),
      kind: options2?.kind ?? "internal",
      root: options2?.root ?? isNone2(parent),
      sampled: options2?.sampled ?? (isSome2(parent) && parent.value.sampled === false ? false : !isLogLevelGreaterThan(fiber3.getRef(MinimumTraceLevel), level))
    });
    for (const key in annotationsFromEnv) {
      span.attribute(key, annotationsFromEnv[key]);
    }
    if (options2?.attributes !== void 0) {
      for (const key in options2.attributes) {
        span.attribute(key, options2.attributes[key]);
      }
    }
  }
  return span;
};
var makeSpan = (name, options2) => withFiber((fiber3) => succeed3(makeSpanUnsafe(fiber3, name, options2)));
var makeSpanScoped = (name, options2) => uninterruptible(withFiber((fiber3) => {
  const scope3 = getUnsafe(fiber3.context, scopeTag);
  const span = makeSpanUnsafe(fiber3, name, options2 ?? {});
  const clock = fiber3.getRef(ClockRef);
  const timingEnabled = fiber3.getRef(TracerTimingEnabled);
  return as2(scopeAddFinalizerExit(scope3, (exit3) => endSpan(span, exit3, clock, timingEnabled)), span);
}));
var withSpanScoped = function() {
  const dataFirst = typeof arguments[0] !== "string";
  const name = dataFirst ? arguments[1] : arguments[0];
  const options2 = addSpanStackTrace(dataFirst ? arguments[2] : arguments[1]);
  if (dataFirst) {
    const self = arguments[0];
    return flatMap3(makeSpanScoped(name, options2), (span) => withParentSpan(self, span, options2));
  }
  return (self) => flatMap3(makeSpanScoped(name, options2), (span) => withParentSpan(self, span, options2));
};
var provideSpanStackFrame = (name, stack) => {
  stack = typeof stack === "function" ? stack : constUndefined;
  return updateService(CurrentStackFrame, (parent) => ({
    name,
    stack,
    parent
  }));
};
var spanAnnotations = TracerSpanAnnotations;
var spanLinks = TracerSpanLinks;
var linkSpans = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, span, attributes = {}) => {
  const spans = Array.isArray(span) ? span : [span];
  const links = spans.map((span2) => ({
    span: span2,
    attributes
  }));
  return updateService(self, TracerSpanLinks, (current) => [...current, ...links]);
});
var endSpan = (span, exit3, clock, timingEnabled) => sync(() => {
  if (span.status._tag === "Ended") return;
  span.end(timingEnabled ? clock.currentTimeNanosUnsafe() : bigint03, exit3);
});
var useSpan = (name, ...args2) => {
  const options2 = args2.length === 1 ? void 0 : args2[0];
  const evaluate2 = args2[args2.length - 1];
  return withFiber((fiber3) => {
    const span = makeSpanUnsafe(fiber3, name, options2);
    const clock = fiber3.getRef(ClockRef);
    const timingEnabled = fiber3.getRef(TracerTimingEnabled);
    return onExit(internalCall(() => evaluate2(span)), (exit3) => endSpan(span, exit3, clock, timingEnabled));
  });
};
var provideParentSpan = /* @__PURE__ */ provideService(ParentSpan);
var withParentSpan = function() {
  const dataFirst = isEffect(arguments[0]);
  const span = dataFirst ? arguments[1] : arguments[0];
  let options2 = dataFirst ? arguments[2] : arguments[1];
  let provideStackFrame = identity;
  if (span._tag === "Span") {
    options2 = addSpanStackTrace(options2);
    provideStackFrame = provideSpanStackFrame(span.name, options2?.captureStackTrace);
  }
  if (dataFirst) {
    return provideParentSpan(provideStackFrame(arguments[0]), span);
  }
  return (self) => provideParentSpan(provideStackFrame(self), span);
};
var withSpan = function() {
  const dataFirst = typeof arguments[0] !== "string";
  const name = dataFirst ? arguments[1] : arguments[0];
  const traceOptions = addSpanStackTrace(arguments[2]);
  if (dataFirst) {
    const self = arguments[0];
    return useSpan(name, arguments[2], (span) => withParentSpan(self, span, traceOptions));
  }
  const fnArg = typeof arguments[1] === "function" ? arguments[1] : void 0;
  const options2 = fnArg ? void 0 : arguments[1];
  return (self, ...args2) => useSpan(name, fnArg ? fnArg(...args2) : options2, (span) => withParentSpan(self, span, traceOptions));
};
var annotateSpans = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (effect2, ...args2) => updateService(effect2, TracerSpanAnnotations, (annotations) => {
  const newAnnotations = args2.length === 1 ? {
    ...annotations,
    ...args2[0]
  } : {
    ...annotations
  };
  if (args2.length === 1) {
    return newAnnotations;
  } else {
    assignProperty(newAnnotations, args2[0], args2[1]);
  }
  return newAnnotations;
}));
var annotateCurrentSpan = (...args2) => withFiber((fiber3) => {
  const span = fiber3.currentSpanLocal;
  if (span) {
    if (args2.length === 1) {
      for (const [key, value3] of Object.entries(args2[0])) {
        span.attribute(key, value3);
      }
    } else {
      span.attribute(args2[0], args2[1]);
    }
  }
  return void_2;
});
var currentSpan = /* @__PURE__ */ withFiber((fiber3) => {
  const span = fiber3.currentSpanLocal;
  return span ? succeed3(span) : fail3(new NoSuchElementError());
});
var currentParentSpan = /* @__PURE__ */ serviceOptional(ParentSpan);
var ClockRef = /* @__PURE__ */ Reference("effect/Clock", {
  defaultValue: () => new ClockImpl()
});
var MAX_TIMER_MILLIS = 2 ** 31 - 1;
var ClockImpl = class {
  currentTimeMillisUnsafe() {
    return Date.now();
  }
  currentTimeMillis = /* @__PURE__ */ sync(() => this.currentTimeMillisUnsafe());
  currentTimeNanosUnsafe() {
    return wallTimeNanos();
  }
  currentTimeNanos = /* @__PURE__ */ sync(() => this.currentTimeNanosUnsafe());
  monotonicTimeNanosUnsafe() {
    return monotonicNowNanos();
  }
  monotonicTimeNanos = /* @__PURE__ */ sync(() => this.monotonicTimeNanosUnsafe());
  sleep(duration) {
    return this.sleepMillis(toMillis(duration));
  }
  sleepMillis(millis2) {
    if (millis2 <= 0) return yieldNow;
    else if (!Number.isFinite(millis2)) return never;
    return callback((resume) => {
      const continuation = millis2 > MAX_TIMER_MILLIS ? this.sleepMillis(millis2 - MAX_TIMER_MILLIS) : void_2;
      const handle = setTimeout(() => resume(continuation), Math.min(millis2, MAX_TIMER_MILLIS));
      return sync(() => clearTimeout(handle));
    });
  }
};
var nanosPerMilli = /* @__PURE__ */ BigInt(1e6);
var monotonicNowNanos = /* @__PURE__ */ (function() {
  const processHrtime = globalThis.process?.hrtime;
  if (typeof processHrtime?.bigint === "function") {
    return () => processHrtime.bigint();
  }
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return () => BigInt(Math.round(performance.now() * 1e6));
  }
  let previous = /* @__PURE__ */ BigInt(0);
  return () => {
    const current = BigInt(Date.now()) * nanosPerMilli;
    if (current > previous) {
      previous = current;
    }
    return previous;
  };
})();
var wallTimeNanos = /* @__PURE__ */ (function() {
  const reanchorThresholdNanos = /* @__PURE__ */ BigInt(1e9);
  let origin;
  return () => {
    const monotonic = monotonicNowNanos();
    const wall = BigInt(Date.now()) * nanosPerMilli;
    if (origin === void 0) {
      origin = wall - monotonic;
    } else {
      const projected = origin + monotonic;
      const skew = wall > projected ? wall - projected : projected - wall;
      if (skew > reanchorThresholdNanos) {
        origin = wall - monotonic;
      }
    }
    return origin + monotonic;
  };
})();
var clockWith = (f) => withFiber((fiber3) => f(fiber3.getRef(ClockRef)));
var sleep = (duration) => clockWith((clock) => clock.sleep(fromInputUnsafe(duration)));
var currentTimeMillis = /* @__PURE__ */ clockWith((clock) => clock.currentTimeMillis);
var TimeoutErrorTypeId = "~effect/Cause/TimeoutError";
var TimeoutError = class extends (/* @__PURE__ */ TaggedError("TimeoutError")) {
  [TimeoutErrorTypeId] = TimeoutErrorTypeId;
  constructor(message) {
    super({
      message
    });
  }
};
var IllegalArgumentErrorTypeId = "~effect/Cause/IllegalArgumentError";
var IllegalArgumentError = class extends (/* @__PURE__ */ TaggedError("IllegalArgumentError")) {
  [IllegalArgumentErrorTypeId] = IllegalArgumentErrorTypeId;
  constructor(message) {
    super({
      message
    });
  }
};
var ExceededCapacityErrorTypeId = "~effect/Cause/ExceededCapacityError";
var ExceededCapacityError = class extends (/* @__PURE__ */ TaggedError("ExceededCapacityError")) {
  [ExceededCapacityErrorTypeId] = ExceededCapacityErrorTypeId;
  constructor(message) {
    super({
      message
    });
  }
};
var AsyncFiberErrorTypeId = "~effect/Cause/AsyncFiberError";
var AsyncFiberError = class extends (/* @__PURE__ */ TaggedError("AsyncFiberError")) {
  [AsyncFiberErrorTypeId] = AsyncFiberErrorTypeId;
  constructor(fiber3) {
    super({
      message: "An asynchronous Effect was executed with Effect.runSync",
      fiber: fiber3
    });
  }
};
var UnknownErrorTypeId = "~effect/Cause/UnknownError";
var UnknownError = class extends (/* @__PURE__ */ TaggedError("UnknownError")) {
  [UnknownErrorTypeId] = UnknownErrorTypeId;
  constructor(cause, message) {
    super({
      message,
      cause
    });
  }
};
var ConsoleRef = /* @__PURE__ */ Reference("effect/Console/CurrentConsole", {
  defaultValue: () => globalThis.console
});
var logLevelToOrder = (level) => {
  switch (level) {
    case "All":
      return Number.MIN_SAFE_INTEGER;
    case "Fatal":
      return 5e4;
    case "Error":
      return 4e4;
    case "Warn":
      return 3e4;
    case "Info":
      return 2e4;
    case "Debug":
      return 1e4;
    case "Trace":
      return 0;
    case "None":
      return Number.MAX_SAFE_INTEGER;
  }
};
var LogLevelOrder = /* @__PURE__ */ mapInput(Number2, logLevelToOrder);
var isLogLevelGreaterThan = /* @__PURE__ */ isGreaterThan(LogLevelOrder);
var CurrentLoggers = /* @__PURE__ */ Reference("effect/Loggers/CurrentLoggers", {
  defaultValue: () => /* @__PURE__ */ new Set([defaultLogger, tracerLogger])
});
var LogToStderr = /* @__PURE__ */ Reference("effect/Logger/LogToStderr", {
  defaultValue: constFalse
});
var annotateLogsScoped = function() {
  const entries3 = typeof arguments[0] === "string" ? [[arguments[0], arguments[1]]] : Object.entries(arguments[0]);
  return uninterruptible(withFiber((fiber3) => {
    const prev = fiber3.getRef(CurrentLogAnnotations);
    const next = {
      ...prev
    };
    for (let i = 0; i < entries3.length; i++) {
      const [key, value3] = entries3[i];
      assignProperty(next, key, value3);
    }
    fiber3.setContext(add(fiber3.context, CurrentLogAnnotations, next));
    return scopeAddFinalizerExit(getUnsafe(fiber3.context, scopeTag), (_) => {
      const current = fiber3.getRef(CurrentLogAnnotations);
      const next2 = {
        ...current
      };
      for (let i = 0; i < entries3.length; i++) {
        const [key, value3] = entries3[i];
        if (current[key] !== value3) continue;
        if (Object.hasOwn(prev, key)) {
          assignProperty(next2, key, prev[key]);
        } else {
          delete next2[key];
        }
      }
      fiber3.setContext(add(fiber3.context, CurrentLogAnnotations, next2));
      return void_2;
    });
  }));
};
var LoggerTypeId = "~effect/Logger";
var LoggerProto = {
  [LoggerTypeId]: {
    _Message: identity,
    _Output: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var loggerMake = (log2) => {
  const self = Object.create(LoggerProto);
  self.log = log2;
  return self;
};
var formatLabel = (key) => key.replace(/[\s="]/g, "_");
var formatLogSpan = (self, now3) => {
  const label = formatLabel(self[0]);
  return `${label}=${now3 - self[1]}ms`;
};
var logWithLevel = (level) => (...message) => {
  let cause = void 0;
  for (let i = 0, len = message.length; i < len; i++) {
    const msg = message[i];
    if (isCause(msg)) {
      if (cause) {
        ;
        message.splice(i, 1);
      } else {
        message = message.slice(0, i).concat(message.slice(i + 1));
      }
      cause = cause ? causeFromReasons(cause.reasons.concat(msg.reasons)) : msg;
      i--;
    }
  }
  if (cause === void 0) {
    cause = causeEmpty;
  }
  return withFiber((fiber3) => {
    const logLevel = level ?? fiber3.currentLogLevel;
    if (isLogLevelGreaterThan(fiber3.minimumLogLevel, logLevel)) {
      return void_2;
    }
    const clock = fiber3.getRef(ClockRef);
    const loggers = fiber3.getRef(CurrentLoggers);
    if (loggers.size > 0) {
      const date = new Date(clock.currentTimeMillisUnsafe());
      for (const logger of loggers) {
        logger.log({
          cause,
          fiber: fiber3,
          date,
          logLevel,
          message
        });
      }
    }
    return void_2;
  });
};
var colors = {
  bold: "1",
  red: "31",
  green: "32",
  yellow: "33",
  blue: "34",
  cyan: "36",
  white: "37",
  gray: "90",
  black: "30",
  bgBrightRed: "101"
};
var logLevelColors = {
  None: [],
  All: [],
  Trace: [colors.gray],
  Debug: [colors.blue],
  Info: [colors.green],
  Warn: [colors.yellow],
  Error: [colors.red],
  Fatal: [colors.bgBrightRed, colors.black]
};
var defaultDateFormat = (date) => `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}.${date.getMilliseconds().toString().padStart(3, "0")}`;
var defaultLogger = /* @__PURE__ */ loggerMake(({
  cause,
  date,
  fiber: fiber3,
  logLevel,
  message
}) => {
  const message_ = Array.isArray(message) ? message.slice() : [message];
  if (cause.reasons.length > 0) {
    message_.push(causePretty(cause));
  }
  const now3 = date.getTime();
  const spans = fiber3.getRef(CurrentLogSpans);
  let spanString = "";
  for (const span of spans) {
    spanString += ` ${formatLogSpan(span, now3)}`;
  }
  const annotations = fiber3.getRef(CurrentLogAnnotations);
  if (Object.keys(annotations).length > 0) {
    message_.push(annotations);
  }
  const console = fiber3.getRef(ConsoleRef);
  const log2 = fiber3.getRef(LogToStderr) ? console.error : console.log;
  log2(`[${defaultDateFormat(date)}] ${logLevel.toUpperCase()} (#${fiber3.id})${spanString}:`, ...message_);
});
var tracerLogger = /* @__PURE__ */ loggerMake(({
  cause,
  fiber: fiber3,
  logLevel,
  message
}) => {
  const clock = fiber3.getRef(ClockRef);
  const annotations = fiber3.getRef(CurrentLogAnnotations);
  const span = fiber3.currentSpan;
  if (span === void 0 || span._tag === "ExternalSpan") return;
  const attributes = {};
  for (const [key, value3] of Object.entries(annotations)) {
    assignProperty(attributes, key, value3);
  }
  attributes["effect.fiberId"] = fiber3.id;
  attributes["effect.logLevel"] = logLevel.toUpperCase();
  if (cause.reasons.length > 0) {
    attributes["effect.cause"] = causePretty(cause);
  }
  span.event(toStringUnknown(Array.isArray(message) && message.length === 1 ? message[0] : message), clock.currentTimeNanosUnsafe(), attributes);
});
function interruptChildrenPatch() {
  fiberMiddleware.interruptChildren ??= fiberInterruptChildren;
}
var undefined_ = /* @__PURE__ */ succeed3(void 0);
var withErrorReporting = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, options2) => onError(self, (cause) => withFiber((fiber3) => {
  reportCauseUnsafe(fiber3, cause, options2?.defectsOnly);
  return void_2;
})));
var reportCauseUnsafe = (fiber3, cause, defectsOnly) => {
  const reporters = fiber3.getRef(CurrentErrorReporters);
  if (reporters.size === 0) return;
  if (defectsOnly && !hasDies(cause)) return;
  const opts = {
    cause,
    fiber: fiber3,
    timestamp: fiber3.getRef(ClockRef).currentTimeNanosUnsafe()
  };
  reporters.forEach((reporter) => reporter.report(opts));
};

// node_modules/effect/dist/Cause.js
var isCause2 = isCause;
var isReason = isCauseReason;
var isFailReason2 = isFailReason;
var fromReasons = causeFromReasons;
var empty3 = causeEmpty;
var makeFailReason = (error) => new Fail(error);
var makeDieReason = (defect) => new Die(defect);
var makeInterruptReason2 = makeInterruptReason;
var map6 = causeMap;
var pretty = causePretty;
var isDone2 = isDone;
var done2 = done;
var IllegalArgumentError2 = IllegalArgumentError;

// node_modules/effect/dist/Effect.js
var Effect_exports = {};
__export(Effect_exports, {
  Do: () => Do3,
  Transaction: () => Transaction,
  TypeId: () => TypeId13,
  abortSignal: () => abortSignal2,
  acquireDisposable: () => acquireDisposable2,
  acquireRelease: () => acquireRelease2,
  acquireUseRelease: () => acquireUseRelease2,
  addFinalizer: () => addFinalizer2,
  all: () => all3,
  andThen: () => andThen3,
  annotateCurrentSpan: () => annotateCurrentSpan2,
  annotateLogs: () => annotateLogs,
  annotateLogsScoped: () => annotateLogsScoped2,
  annotateSpans: () => annotateSpans2,
  as: () => as3,
  asSome: () => asSome2,
  asVoid: () => asVoid3,
  awaitAllChildren: () => awaitAllChildren2,
  bind: () => bind4,
  bindTo: () => bindTo4,
  cached: () => cached2,
  cachedInvalidateWithTTL: () => cachedInvalidateWithTTL2,
  cachedWithTTL: () => cachedWithTTL2,
  callback: () => callback2,
  catch: () => catch_2,
  catchCause: () => catchCause2,
  catchCauseFilter: () => catchCauseFilter2,
  catchCauseIf: () => catchCauseIf2,
  catchDefect: () => catchDefect2,
  catchEager: () => catchEager2,
  catchFilter: () => catchFilter2,
  catchIf: () => catchIf2,
  catchNoSuchElement: () => catchNoSuchElement2,
  catchReason: () => catchReason2,
  catchReasons: () => catchReasons2,
  catchTag: () => catchTag2,
  catchTags: () => catchTags2,
  clockWith: () => clockWith2,
  context: () => context2,
  contextWith: () => contextWith2,
  currentParentSpan: () => currentParentSpan2,
  currentSpan: () => currentSpan2,
  delay: () => delay2,
  die: () => die2,
  effectify: () => effectify,
  ensuring: () => ensuring2,
  eventually: () => eventually2,
  exit: () => exit2,
  fail: () => fail5,
  failCause: () => failCause3,
  failCauseSync: () => failCauseSync2,
  failSync: () => failSync2,
  fiber: () => fiber2,
  fiberId: () => fiberId2,
  filter: () => filter4,
  filterMap: () => filterMap3,
  filterMapEffect: () => filterMapEffect2,
  filterMapOrElse: () => filterMapOrElse2,
  filterMapOrFail: () => filterMapOrFail2,
  filterOrElse: () => filterOrElse2,
  filterOrFail: () => filterOrFail2,
  findFirst: () => findFirst2,
  findFirstFilter: () => findFirstFilter2,
  firstSuccessOf: () => firstSuccessOf2,
  flatMap: () => flatMap4,
  flatMapEager: () => flatMapEager2,
  flatten: () => flatten4,
  flip: () => flip2,
  fn: () => fn2,
  fnUntraced: () => fnUntraced2,
  fnUntracedEager: () => fnUntracedEager2,
  forEach: () => forEach2,
  forever: () => forever3,
  forkChild: () => forkChild2,
  forkDetach: () => forkDetach2,
  forkIn: () => forkIn2,
  forkScoped: () => forkScoped2,
  fromNullishOr: () => fromNullishOr3,
  fromOption: () => fromOption3,
  fromResult: () => fromResult2,
  gen: () => gen3,
  head: () => head2,
  ignore: () => ignore2,
  ignoreCause: () => ignoreCause2,
  interrupt: () => interrupt2,
  interruptible: () => interruptible2,
  interruptibleMask: () => interruptibleMask2,
  isEffect: () => isEffect2,
  isFailure: () => isFailure5,
  isSuccess: () => isSuccess5,
  let: () => let_4,
  linkSpans: () => linkSpans2,
  log: () => log,
  logDebug: () => logDebug,
  logError: () => logError,
  logFatal: () => logFatal,
  logInfo: () => logInfo,
  logTrace: () => logTrace,
  logWarning: () => logWarning,
  logWithLevel: () => logWithLevel2,
  makeSpan: () => makeSpan2,
  makeSpanScoped: () => makeSpanScoped2,
  map: () => map7,
  mapBoth: () => mapBoth2,
  mapBothEager: () => mapBothEager2,
  mapEager: () => mapEager2,
  mapError: () => mapError3,
  mapErrorEager: () => mapErrorEager2,
  match: () => match6,
  matchCause: () => matchCause2,
  matchCauseEager: () => matchCauseEager2,
  matchCauseEffect: () => matchCauseEffect2,
  matchCauseEffectEager: () => matchCauseEffectEager2,
  matchEager: () => matchEager2,
  matchEffect: () => matchEffect3,
  never: () => never2,
  onError: () => onError2,
  onErrorFilter: () => onErrorFilter2,
  onErrorIf: () => onErrorIf2,
  onExit: () => onExit2,
  onExitFilter: () => onExitFilter2,
  onExitIf: () => onExitIf2,
  onExitPrimitive: () => onExitPrimitive2,
  onInterrupt: () => onInterrupt2,
  option: () => option2,
  orDie: () => orDie2,
  orElseSucceed: () => orElseSucceed2,
  partition: () => partition3,
  promise: () => promise2,
  provide: () => provide4,
  provideContext: () => provideContext2,
  provideService: () => provideService2,
  provideServiceEffect: () => provideServiceEffect2,
  race: () => race2,
  raceAll: () => raceAll2,
  raceAllFirst: () => raceAllFirst2,
  raceFirst: () => raceFirst2,
  reduce: () => reduce2,
  repeat: () => repeat2,
  repeatOrElse: () => repeatOrElse2,
  replicate: () => replicate2,
  replicateEffect: () => replicateEffect2,
  request: () => request2,
  requestUnsafe: () => requestUnsafe2,
  result: () => result2,
  retry: () => retry2,
  retryOrElse: () => retryOrElse2,
  runCallback: () => runCallback2,
  runCallbackWith: () => runCallbackWith2,
  runFork: () => runFork2,
  runForkWith: () => runForkWith2,
  runPromise: () => runPromise2,
  runPromiseExit: () => runPromiseExit2,
  runPromiseExitWith: () => runPromiseExitWith2,
  runPromiseWith: () => runPromiseWith2,
  runSync: () => runSync2,
  runSyncExit: () => runSyncExit2,
  runSyncExitWith: () => runSyncExitWith2,
  runSyncWith: () => runSyncWith2,
  sandbox: () => sandbox2,
  satisfiesErrorType: () => satisfiesErrorType,
  satisfiesServicesType: () => satisfiesServicesType,
  satisfiesSuccessType: () => satisfiesSuccessType,
  schedule: () => schedule,
  scheduleFrom: () => scheduleFrom2,
  scope: () => scope2,
  scoped: () => scoped2,
  scopedWith: () => scopedWith2,
  service: () => service2,
  serviceOption: () => serviceOption2,
  setContext: () => setContext2,
  sleep: () => sleep2,
  spanAnnotations: () => spanAnnotations2,
  spanLinks: () => spanLinks2,
  succeed: () => succeed6,
  succeedNone: () => succeedNone2,
  succeedSome: () => succeedSome2,
  suspend: () => suspend2,
  sync: () => sync3,
  tap: () => tap3,
  tapCause: () => tapCause2,
  tapCauseFilter: () => tapCauseFilter2,
  tapCauseIf: () => tapCauseIf2,
  tapDefect: () => tapDefect2,
  tapError: () => tapError2,
  tapErrorTag: () => tapErrorTag2,
  timed: () => timed2,
  timeout: () => timeout2,
  timeoutOption: () => timeoutOption2,
  timeoutOrElse: () => timeoutOrElse2,
  tracer: () => tracer2,
  track: () => track,
  trackDefects: () => trackDefects,
  trackDuration: () => trackDuration,
  trackErrors: () => trackErrors,
  trackSuccesses: () => trackSuccesses,
  transposeOption: () => transposeOption2,
  try: () => try_3,
  tryPromise: () => tryPromise2,
  tx: () => tx,
  txRetry: () => txRetry,
  undefined: () => undefined_2,
  uninterruptible: () => uninterruptible2,
  uninterruptibleMask: () => uninterruptibleMask2,
  unwrapReason: () => unwrapReason2,
  updateContext: () => updateContext2,
  updateService: () => updateService2,
  updateServiceScoped: () => updateServiceScoped2,
  useSpan: () => useSpan2,
  validate: () => validate2,
  void: () => void_4,
  when: () => when2,
  whileLoop: () => whileLoop2,
  withErrorReporting: () => withErrorReporting2,
  withExecutionPlan: () => withExecutionPlan2,
  withFiber: () => withFiber2,
  withLogSpan: () => withLogSpan,
  withLogger: () => withLogger,
  withParentSpan: () => withParentSpan2,
  withSpan: () => withSpan2,
  withSpanScoped: () => withSpanScoped2,
  withTracer: () => withTracer2,
  withTracerEnabled: () => withTracerEnabled2,
  withTracerTiming: () => withTracerTiming2,
  yieldNow: () => yieldNow2,
  yieldNowWith: () => yieldNowWith2,
  zip: () => zip2,
  zipWith: () => zipWith3
});

// node_modules/effect/dist/Exit.js
var isExit2 = isExit;
var succeed4 = exitSucceed;
var failCause2 = exitFailCause;
var fail4 = exitFail;
var void_3 = exitVoid;
var isSuccess4 = exitIsSuccess;
var isFailure4 = exitIsFailure;

// node_modules/effect/dist/Deferred.js
var TypeId6 = "~effect/Deferred";
var DeferredProto = {
  [TypeId6]: {
    _A: identity,
    _E: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var makeUnsafe2 = () => {
  const self = Object.create(DeferredProto);
  self.resumes = void 0;
  self.effect = void 0;
  return self;
};
var _await = (self) => callback((resume) => {
  if (self.effect) return resume(self.effect);
  self.resumes ??= [];
  self.resumes.push(resume);
  return sync(() => {
    const resumes = self.resumes;
    if (resumes === void 0) return;
    const index2 = resumes.indexOf(resume);
    if (index2 >= 0) resumes.splice(index2, 1);
  });
});
var completeWith = /* @__PURE__ */ dual(2, (self, effect2) => sync(() => doneUnsafe(self, effect2)));
var done3 = completeWith;
var doneUnsafe = (self, effect2) => {
  if (self.effect) return false;
  self.effect = effect2;
  if (self.resumes) {
    const resumes = self.resumes;
    self.resumes = void 0;
    for (let i = 0; i < resumes.length; i++) {
      resumes[i](effect2);
    }
  }
  return true;
};

// node_modules/effect/dist/References.js
var CurrentLogAnnotations2 = CurrentLogAnnotations;
var CurrentLogSpans2 = CurrentLogSpans;

// node_modules/effect/dist/Scope.js
var makeUnsafe3 = scopeMakeUnsafe;
var provide = provideScope;
var forkUnsafe2 = scopeForkUnsafe;
var close = scopeClose;

// node_modules/effect/dist/Layer.js
var TypeId7 = "~effect/Layer";
var MemoMapTypeId = "~effect/Layer/MemoMap";
var memoMapReuse = (entry, scope3) => {
  entry.observers++;
  return andThen2(scopeAddFinalizerExit(scope3, (exit3) => entry.finalizer(exit3)), entry.effect);
};
var isLayer = (u) => hasProperty(u, TypeId7);
var LayerProto = {
  [TypeId7]: {
    _ROut: identity,
    _E: identity,
    _RIn: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var fromBuildUnsafe = (build) => {
  const self = Object.create(LayerProto);
  self.build = build;
  return self;
};
var fromBuild = (build) => fromBuildUnsafe((memoMap, scope3) => {
  const layerScope = forkUnsafe2(scope3);
  return onExit(build(memoMap, layerScope), (exit3) => exit3._tag === "Failure" ? close(layerScope, exit3) : void_2);
});
var fromBuildMemo = (build) => {
  const self = fromBuild((memoMap, scope3) => memoMap.getOrElseMemoize(self, scope3, build));
  return self;
};
var memoMapBuild = (memoMap, layer, scope3, build) => {
  const layerScope = makeUnsafe3();
  const deferred = makeUnsafe2();
  const entry = {
    observers: 1,
    effect: _await(deferred),
    finalizer: (exit3) => suspend(() => {
      entry.observers--;
      if (entry.observers === 0) {
        memoMap.map.delete(layer);
        return close(layerScope, exit3);
      }
      return void_2;
    })
  };
  memoMap.map.set(layer, entry);
  return scopeAddFinalizerExit(scope3, entry.finalizer).pipe(flatMap3(() => build(memoMap, layerScope)), onExit((exit3) => {
    entry.effect = exit3;
    return done3(deferred, exit3);
  }));
};
var MemoMapImpl = class {
  get [MemoMapTypeId]() {
    return MemoMapTypeId;
  }
  parent;
  constructor(parent) {
    this.parent = parent;
  }
  map = /* @__PURE__ */ new Map();
  get(layer, scope3) {
    const local = this.map.get(layer);
    if (local) {
      return memoMapReuse(local, scope3);
    }
    return this.parent?.get(layer, scope3);
  }
  getOrElseMemoize(layer, scope3, build) {
    return suspend(() => {
      const existing = this.get(layer, scope3);
      if (existing) {
        return existing;
      }
      return memoMapBuild(this, layer, scope3, build);
    });
  }
};
var makeMemoMapUnsafe = () => new MemoMapImpl();
var forkMemoMapUnsafe = (parent) => new MemoMapImpl(parent);
var CurrentMemoMap = class _CurrentMemoMap extends (/* @__PURE__ */ Service()("effect/Layer/CurrentMemoMap")) {
  static forkOrCreate(self) {
    const current = getOrUndefined2(self, _CurrentMemoMap);
    return current ? forkMemoMapUnsafe(current) : makeMemoMapUnsafe();
  }
};
var buildWithMemoMap = /* @__PURE__ */ dual(3, (self, memoMap, scope3) => provideService(map5(self.build(memoMap, scope3), add(CurrentMemoMap, memoMap)), CurrentMemoMap, memoMap));
var buildWithScope = /* @__PURE__ */ dual(2, (self, scope3) => withFiber((fiber3) => buildWithMemoMap(self, CurrentMemoMap.forkOrCreate(fiber3.context), scope3)));
var succeed5 = function() {
  if (arguments.length === 1) {
    return (resource) => succeedContext(make6(arguments[0], resource));
  }
  return succeedContext(make6(arguments[0], arguments[1]));
};
var succeedContext = (context3) => fromBuildUnsafe(constant(succeed3(context3)));
var sync2 = function() {
  if (arguments.length === 1) {
    return (evaluate2) => syncContext(() => make6(arguments[0], evaluate2()));
  }
  return syncContext(() => make6(arguments[0], arguments[1]()));
};
var syncContext = (evaluate2) => fromBuildMemo(constant(sync(evaluate2)));
var effect = function() {
  if (arguments.length === 1) {
    return (effect2) => effectImpl(arguments[0], effect2);
  }
  return effectImpl(arguments[0], arguments[1]);
};
var effectImpl = (service3, effect2) => effectContext(map5(effect2, (value3) => make6(service3, value3)));
var effectContext = (effect2) => fromBuildMemo((_, scope3) => provide(effect2, scope3));
var mergeAllEffect = (layers, memoMap, scope3) => {
  const parentScope = forkUnsafe2(scope3, "parallel");
  return forEach(layers, (layer) => layer.build(memoMap, forkUnsafe2(parentScope, "sequential")), {
    concurrency: layers.length
  }).pipe(map5((context3) => mergeAll(...context3)));
};
var mergeAll2 = (...layers) => fromBuild((memoMap, scope3) => mergeAllEffect(layers, memoMap, scope3));
var provideWith = (self, that, f) => fromBuild((memoMap, scope3) => flatMap3(Array.isArray(that) ? mergeAllEffect(that, memoMap, scope3) : that.build(memoMap, scope3), (context3) => self.build(memoMap, scope3).pipe(provideContext(context3), map5((merged) => f(merged, context3)))));
var provide2 = /* @__PURE__ */ dual(2, (self, that) => provideWith(self, that, identity));

// node_modules/effect/dist/ExecutionPlan.js
var TypeId8 = "~effect/ExecutionPlan";
var Proto2 = {
  [TypeId8]: TypeId8,
  get captureRequirements() {
    const self = this;
    return contextWith((context3) => succeed3(makeProto(self.steps.map((step) => ({
      ...step,
      provide: isLayer(step.provide) ? provide2(step.provide, succeedContext(context3)) : step.provide
    })))));
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var makeProto = (steps) => {
  const self = Object.create(Proto2);
  self.steps = steps;
  return self;
};
var CurrentMetadata = /* @__PURE__ */ Reference("effect/ExecutionPlan/CurrentMetadata", {
  defaultValue: /* @__PURE__ */ constant({
    attempt: 0,
    stepIndex: 0
  })
});

// node_modules/effect/dist/Clock.js
var currentTimeMillis2 = currentTimeMillis;

// node_modules/effect/dist/internal/dateTime.js
var TypeId9 = "~effect/time/DateTime";
var TimeZoneTypeId = "~effect/time/DateTime/TimeZone";
var Proto3 = {
  [TypeId9]: TypeId9,
  pipe() {
    return pipeArguments(this, arguments);
  },
  [NodeInspectSymbol]() {
    return this.toString();
  },
  toJSON() {
    return toDateUtc(this).toJSON();
  }
};
var ProtoUtc = {
  ...Proto3,
  _tag: "Utc",
  [symbol]() {
    return number(this.epochMilliseconds);
  },
  [symbol2](that) {
    return isDateTime(that) && that._tag === "Utc" && this.epochMilliseconds === that.epochMilliseconds;
  },
  toString() {
    return `DateTime.Utc(${toDateUtc(this).toJSON()})`;
  }
};
var ProtoZoned = {
  ...Proto3,
  _tag: "Zoned",
  [symbol]() {
    return combine(number(this.epochMilliseconds))(hash(this.zone));
  },
  [symbol2](that) {
    return isDateTime(that) && that._tag === "Zoned" && this.epochMilliseconds === that.epochMilliseconds && equals(this.zone, that.zone);
  },
  toString() {
    return `DateTime.Zoned(${formatIsoZoned(this)})`;
  }
};
var ProtoTimeZone = {
  [TimeZoneTypeId]: TimeZoneTypeId,
  [NodeInspectSymbol]() {
    return this.toString();
  }
};
var ProtoTimeZoneNamed = {
  ...ProtoTimeZone,
  _tag: "Named",
  [symbol]() {
    return string(`Named:${this.id}`);
  },
  [symbol2](that) {
    return isTimeZone(that) && that._tag === "Named" && this.id === that.id;
  },
  toString() {
    return `TimeZone.Named(${this.id})`;
  },
  toJSON() {
    return {
      _id: "TimeZone",
      _tag: "Named",
      id: this.id
    };
  }
};
var ProtoTimeZoneOffset = {
  ...ProtoTimeZone,
  _tag: "Offset",
  [symbol]() {
    return string(`Offset:${this.offset}`);
  },
  [symbol2](that) {
    return isTimeZone(that) && that._tag === "Offset" && this.offset === that.offset;
  },
  toString() {
    return `TimeZone.Offset(${offsetToString(this.offset)})`;
  },
  toJSON() {
    return {
      _id: "TimeZone",
      _tag: "Offset",
      offset: this.offset
    };
  }
};
var makeZonedProto = (epochMillis, zone, partsUtc) => {
  const self = Object.create(ProtoZoned);
  self.epochMilliseconds = epochMillis;
  self.zone = zone;
  Object.defineProperty(self, "partsUtc", {
    value: partsUtc,
    enumerable: false,
    writable: true
  });
  Object.defineProperty(self, "adjustedEpochMillis", {
    value: void 0,
    enumerable: false,
    writable: true
  });
  Object.defineProperty(self, "partsAdjusted", {
    value: void 0,
    enumerable: false,
    writable: true
  });
  return self;
};
var isDateTime = (u) => hasProperty(u, TypeId9);
var isDateTimeArgs = (args2) => isDateTime(args2[0]);
var isTimeZone = (u) => hasProperty(u, TimeZoneTypeId);
var isTimeZoneOffset = (u) => isTimeZone(u) && u._tag === "Offset";
var isTimeZoneNamed = (u) => isTimeZone(u) && u._tag === "Named";
var isUtc = (self) => self._tag === "Utc";
var isZoned = (self) => self._tag === "Zoned";
var Equivalence3 = /* @__PURE__ */ make2((a, b) => a.epochMilliseconds === b.epochMilliseconds);
var Order2 = /* @__PURE__ */ make4((self, that) => self.epochMilliseconds < that.epochMilliseconds ? -1 : self.epochMilliseconds > that.epochMilliseconds ? 1 : 0);
var clamp2 = /* @__PURE__ */ clamp(Order2);
var makeUtc = (epochMillis) => {
  const self = Object.create(ProtoUtc);
  self.epochMilliseconds = epochMillis;
  Object.defineProperty(self, "partsUtc", {
    value: void 0,
    enumerable: false,
    writable: true
  });
  return self;
};
var fromDateUnsafe = (date) => {
  const epochMillis = date.getTime();
  if (Number.isNaN(epochMillis)) {
    throw new IllegalArgumentError2("Invalid date");
  }
  return makeUtc(epochMillis);
};
var makeUnsafe4 = (input) => {
  if (isDateTime(input)) {
    return input;
  } else if (input instanceof Date) {
    return fromDateUnsafe(input);
  } else if (typeof input === "object") {
    if ("epochMilliseconds" in input) {
      return fromDateUnsafe(new Date(input.epochMilliseconds));
    }
    const date = /* @__PURE__ */ new Date(0);
    setPartsDate(date, input);
    return fromDateUnsafe(date);
  } else if (typeof input === "string" && !hasZone(input)) {
    return fromDateUnsafe(/* @__PURE__ */ new Date(input + "Z"));
  }
  return fromDateUnsafe(new Date(input));
};
var hasZone = (input) => /Z|GMT|[+-]\d{2}$|[+-]\d{2}:?\d{2}$|\]$/.test(input);
var minEpochMillis = -864e13 + 12 * 60 * 60 * 1e3;
var maxEpochMillis = 864e13 - 14 * 60 * 60 * 1e3;
var makeZonedUnsafe = (input, options2) => {
  let timeZoneOption = options2?.timeZone;
  if (timeZoneOption === void 0 && isDateTime(input) && isZoned(input)) {
    return input;
  }
  const self = makeUnsafe4(input);
  if (self.epochMilliseconds < minEpochMillis || self.epochMilliseconds > maxEpochMillis) {
    throw new RangeError(`Epoch millis out of range: ${self.epochMilliseconds}`);
  }
  if (timeZoneOption === void 0 && typeof input === "object" && "timeZoneId" in input) {
    timeZoneOption = input.timeZoneId;
  }
  let zone;
  if (timeZoneOption === void 0) {
    const offset = new Date(self.epochMilliseconds).getTimezoneOffset() * -60 * 1e3;
    zone = zoneMakeOffset(offset);
  } else if (isTimeZone(timeZoneOption)) {
    zone = timeZoneOption;
  } else if (typeof timeZoneOption === "number") {
    zone = zoneMakeOffset(timeZoneOption);
  } else {
    const parsedZone = zoneFromString(timeZoneOption);
    if (isNone2(parsedZone)) {
      throw new IllegalArgumentError2(`Invalid time zone: ${timeZoneOption}`);
    }
    zone = parsedZone.value;
  }
  if (options2?.adjustForTimeZone !== true) {
    return makeZonedProto(self.epochMilliseconds, zone, self.partsUtc);
  }
  return makeZonedFromAdjusted(self.epochMilliseconds, zone, options2?.disambiguation ?? "compatible");
};
var makeZoned = /* @__PURE__ */ liftThrowable(makeZonedUnsafe);
var make9 = /* @__PURE__ */ liftThrowable(makeUnsafe4);
var zonedStringRegExp = /^(.{17,35})\[(.+)\]$/;
var makeZonedFromString = (input) => {
  const match8 = zonedStringRegExp.exec(input);
  if (match8 === null) {
    const offset = parseOffset(input);
    return offset !== null ? makeZoned(input, {
      timeZone: offset
    }) : none2();
  }
  const [, isoString, timeZone] = match8;
  return makeZoned(isoString, {
    timeZone
  });
};
var now = /* @__PURE__ */ map5(currentTimeMillis2, makeUtc);
var nowAsDate = /* @__PURE__ */ map5(currentTimeMillis2, (millis2) => new Date(millis2));
var nowUnsafe = () => makeUtc(Date.now());
var toUtc = (self) => makeUtc(self.epochMilliseconds);
var setZone = /* @__PURE__ */ dual(isDateTimeArgs, (self, zone, options2) => options2?.adjustForTimeZone === true ? makeZonedFromAdjusted(self.epochMilliseconds, zone, options2?.disambiguation ?? "compatible") : makeZonedProto(self.epochMilliseconds, zone, self.partsUtc));
var setZoneOffset = /* @__PURE__ */ dual(isDateTimeArgs, (self, offset, options2) => setZone(self, zoneMakeOffset(offset), options2));
var validZoneCache = /* @__PURE__ */ new Map();
var formatOptions = {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZoneName: "longOffset",
  fractionalSecondDigits: 3,
  hourCycle: "h23"
};
var zoneMakeIntl = (format5) => {
  const zoneId = format5.resolvedOptions().timeZone;
  if (validZoneCache.has(zoneId)) {
    return validZoneCache.get(zoneId);
  }
  const zone = Object.create(ProtoTimeZoneNamed);
  zone.id = zoneId;
  zone.format = format5;
  validZoneCache.set(zoneId, zone);
  return zone;
};
var zoneMakeNamedUnsafe = (zoneId) => {
  if (validZoneCache.has(zoneId)) {
    return validZoneCache.get(zoneId);
  }
  try {
    return zoneMakeIntl(new Intl.DateTimeFormat("en-US", {
      ...formatOptions,
      timeZone: zoneId
    }));
  } catch {
    throw new IllegalArgumentError2(`Invalid time zone: ${zoneId}`);
  }
};
var zoneMakeOffset = (offset) => {
  const zone = Object.create(ProtoTimeZoneOffset);
  zone.offset = offset;
  return zone;
};
var zoneMakeNamed = /* @__PURE__ */ liftThrowable(zoneMakeNamedUnsafe);
var zoneMakeNamedEffect = (zoneId) => try_2({
  try: () => zoneMakeNamedUnsafe(zoneId),
  catch: (e) => e
});
var zoneMakeLocal = () => zoneMakeIntl(new Intl.DateTimeFormat("en-US", formatOptions));
var offsetZoneRegExp = /^(?:GMT|[+-])/;
var zoneFromString = (zone) => {
  if (offsetZoneRegExp.test(zone)) {
    const offset = parseOffset(zone);
    return offset === null ? none2() : some2(zoneMakeOffset(offset));
  }
  return zoneMakeNamed(zone);
};
var zoneToString = (self) => {
  if (self._tag === "Offset") {
    return offsetToString(self.offset);
  }
  return self.id;
};
var setZoneNamed = /* @__PURE__ */ dual(isDateTimeArgs, (self, zoneId, options2) => map(zoneMakeNamed(zoneId), (zone) => setZone(self, zone, options2)));
var setZoneNamedUnsafe = /* @__PURE__ */ dual(isDateTimeArgs, (self, zoneId, options2) => setZone(self, zoneMakeNamedUnsafe(zoneId), options2));
var distance = /* @__PURE__ */ dual(2, (self, other) => millis(toEpochMillis(other) - toEpochMillis(self)));
var min2 = /* @__PURE__ */ min(Order2);
var max2 = /* @__PURE__ */ max(Order2);
var isGreaterThan3 = /* @__PURE__ */ isGreaterThan(Order2);
var isGreaterThanOrEqualTo2 = /* @__PURE__ */ isGreaterThanOrEqualTo(Order2);
var isLessThan3 = /* @__PURE__ */ isLessThan(Order2);
var isLessThanOrEqualTo2 = /* @__PURE__ */ isLessThanOrEqualTo(Order2);
var between = /* @__PURE__ */ isBetween(Order2);
var isFuture = (self) => map5(now, isLessThan3(self));
var isFutureUnsafe = (self) => isLessThan3(nowUnsafe(), self);
var isPast = (self) => map5(now, isGreaterThan3(self));
var isPastUnsafe = (self) => isGreaterThan3(nowUnsafe(), self);
var toDateUtc = (self) => new Date(self.epochMilliseconds);
var toDate = (self) => {
  if (self._tag === "Utc") {
    return new Date(self.epochMilliseconds);
  } else if (self.zone._tag === "Offset") {
    return new Date(self.epochMilliseconds + self.zone.offset);
  } else if (self.adjustedEpochMilliseconds !== void 0) {
    return new Date(self.adjustedEpochMilliseconds);
  }
  const parts = self.zone.format.formatToParts(self.epochMilliseconds).filter((_) => _.type !== "literal");
  const date = /* @__PURE__ */ new Date(0);
  date.setUTCFullYear(Number(parts[2].value), Number(parts[0].value) - 1, Number(parts[1].value));
  date.setUTCHours(Number(parts[3].value), Number(parts[4].value), Number(parts[5].value), Number(parts[6].value));
  self.adjustedEpochMilliseconds = date.getTime();
  return date;
};
var zonedOffset = (self) => {
  const date = toDate(self);
  return date.getTime() - toEpochMillis(self);
};
var offsetToString = (offset) => {
  const abs2 = Math.abs(offset);
  let hours2 = Math.floor(abs2 / (60 * 60 * 1e3));
  let minutes2 = Math.round(abs2 % (60 * 60 * 1e3) / (60 * 1e3));
  if (minutes2 === 60) {
    hours2 += 1;
    minutes2 = 0;
  }
  return `${offset < 0 ? "-" : "+"}${String(hours2).padStart(2, "0")}:${String(minutes2).padStart(2, "0")}`;
};
var zonedOffsetIso = (self) => offsetToString(zonedOffset(self));
var toEpochMillis = (self) => self.epochMilliseconds;
var toEpochSeconds = (self) => Math.floor(self.epochMilliseconds / 1e3);
var fromEpochSeconds = (seconds2) => makeUtc(seconds2 * 1e3);
var removeTime = (self) => withDate(self, (date) => {
  date.setUTCHours(0, 0, 0, 0);
  return makeUtc(date.getTime());
});
var dateToParts = (date) => ({
  millisecond: date.getUTCMilliseconds(),
  second: date.getUTCSeconds(),
  minute: date.getUTCMinutes(),
  hour: date.getUTCHours(),
  day: date.getUTCDate(),
  weekDay: date.getUTCDay(),
  month: date.getUTCMonth() + 1,
  year: date.getUTCFullYear()
});
var toParts = (self) => {
  if (self._tag === "Utc") {
    return toPartsUtc(self);
  } else if (self.partsAdjusted !== void 0) {
    return self.partsAdjusted;
  }
  self.partsAdjusted = withDate(self, dateToParts);
  return self.partsAdjusted;
};
var toPartsUtc = (self) => {
  if (self.partsUtc !== void 0) {
    return self.partsUtc;
  }
  self.partsUtc = withDateUtc(self, dateToParts);
  return self.partsUtc;
};
var getPartUtc = /* @__PURE__ */ dual(2, (self, part) => toPartsUtc(self)[part]);
var getPart = /* @__PURE__ */ dual(2, (self, part) => toParts(self)[part]);
var setPartsDate = (date, parts) => {
  if (parts.year !== void 0) {
    date.setUTCFullYear(parts.year);
  }
  if (parts.month !== void 0) {
    date.setUTCMonth(parts.month - 1);
  }
  if (parts.day !== void 0) {
    date.setUTCDate(parts.day);
  }
  if (parts.weekDay !== void 0) {
    const diff = parts.weekDay - date.getUTCDay();
    date.setUTCDate(date.getUTCDate() + diff);
  }
  if (parts.hour !== void 0) {
    date.setUTCHours(parts.hour);
  }
  if (parts.minute !== void 0) {
    date.setUTCMinutes(parts.minute);
  }
  if (parts.second !== void 0) {
    date.setUTCSeconds(parts.second);
  }
  if (parts.millisecond !== void 0) {
    date.setUTCMilliseconds(parts.millisecond);
  }
};
var setParts = /* @__PURE__ */ dual(2, (self, parts) => mutate(self, (date) => setPartsDate(date, parts)));
var setPartsUtc = /* @__PURE__ */ dual(2, (self, parts) => mutateUtc(self, (date) => setPartsDate(date, parts)));
var constDayMillis = 24 * 60 * 60 * 1e3;
var makeZonedFromAdjusted = (adjustedMillis, zone, disambiguation) => {
  if (zone._tag === "Offset") {
    return makeZonedProto(adjustedMillis - zone.offset, zone);
  }
  const beforeOffset = calculateNamedOffset(adjustedMillis - constDayMillis, adjustedMillis, zone);
  const afterOffset = calculateNamedOffset(adjustedMillis + constDayMillis, adjustedMillis, zone);
  if (beforeOffset === afterOffset) {
    return makeZonedProto(adjustedMillis - beforeOffset, zone);
  }
  const isForwards = beforeOffset < afterOffset;
  const transitionMillis = beforeOffset - afterOffset;
  if (isForwards) {
    const currentAfterOffset = calculateNamedOffset(adjustedMillis - afterOffset, adjustedMillis, zone);
    if (currentAfterOffset === afterOffset) {
      return makeZonedProto(adjustedMillis - afterOffset, zone);
    }
    const before = makeZonedProto(adjustedMillis - beforeOffset, zone);
    const beforeAdjustedMillis = toDate(before).getTime();
    if (adjustedMillis !== beforeAdjustedMillis) {
      switch (disambiguation) {
        case "reject": {
          const formatted = new Date(adjustedMillis).toISOString();
          throw new RangeError(`Gap time: ${formatted} does not exist in time zone ${zone.id}`);
        }
        case "earlier":
          return makeZonedProto(adjustedMillis - afterOffset, zone);
        case "compatible":
        case "later":
          return before;
      }
    }
    return before;
  }
  const currentBeforeOffset = calculateNamedOffset(adjustedMillis - beforeOffset, adjustedMillis, zone);
  if (currentBeforeOffset === beforeOffset) {
    if (disambiguation === "earlier" || disambiguation === "compatible") {
      return makeZonedProto(adjustedMillis - beforeOffset, zone);
    }
    const laterOffset = calculateNamedOffset(adjustedMillis - beforeOffset + transitionMillis, adjustedMillis + transitionMillis, zone);
    if (laterOffset === beforeOffset) {
      return makeZonedProto(adjustedMillis - beforeOffset, zone);
    }
    if (disambiguation === "reject") {
      const formatted = new Date(adjustedMillis).toISOString();
      throw new RangeError(`Ambiguous time: ${formatted} occurs twice in time zone ${zone.id}`);
    }
  }
  return makeZonedProto(adjustedMillis - afterOffset, zone);
};
var offsetRegExp = /([+-])(\d{2}):(\d{2})$/;
var parseOffset = (offset) => {
  const match8 = offsetRegExp.exec(offset);
  if (match8 === null) {
    return null;
  }
  const [, sign2, hours2, minutes2] = match8;
  return (sign2 === "+" ? 1 : -1) * (Number(hours2) * 60 + Number(minutes2)) * 60 * 1e3;
};
var calculateNamedOffset = (utcMillis, adjustedMillis, zone) => {
  const offset = zone.format.formatToParts(utcMillis).find((_) => _.type === "timeZoneName")?.value ?? "";
  if (offset === "GMT") {
    return 0;
  }
  const result3 = parseOffset(offset);
  if (result3 === null) {
    return zonedOffset(makeZonedProto(adjustedMillis, zone));
  }
  return result3;
};
var mutate = /* @__PURE__ */ dual(isDateTimeArgs, (self, f, options2) => {
  if (self._tag === "Utc") {
    const date = toDateUtc(self);
    f(date);
    return makeUtc(date.getTime());
  }
  const adjustedDate = toDate(self);
  const newAdjustedDate = new Date(adjustedDate.getTime());
  f(newAdjustedDate);
  return makeZonedFromAdjusted(newAdjustedDate.getTime(), self.zone, options2?.disambiguation ?? "compatible");
});
var mutateUtc = /* @__PURE__ */ dual(2, (self, f) => mapEpochMillis(self, (millis2) => {
  const date = new Date(millis2);
  f(date);
  return date.getTime();
}));
var mapEpochMillis = /* @__PURE__ */ dual(2, (self, f) => {
  const millis2 = f(toEpochMillis(self));
  return self._tag === "Utc" ? makeUtc(millis2) : makeZonedProto(millis2, self.zone);
});
var withDate = /* @__PURE__ */ dual(2, (self, f) => f(toDate(self)));
var withDateUtc = /* @__PURE__ */ dual(2, (self, f) => f(toDateUtc(self)));
var match5 = /* @__PURE__ */ dual(2, (self, options2) => self._tag === "Utc" ? options2.onUtc(self) : options2.onZoned(self));
var addDuration = /* @__PURE__ */ dual(2, (self, duration) => mapEpochMillis(self, (millis2) => millis2 + toMillis(fromInputUnsafe(duration))));
var subtractDuration = /* @__PURE__ */ dual(2, (self, duration) => mapEpochMillis(self, (millis2) => millis2 - toMillis(fromInputUnsafe(duration))));
var addMillis = (date, amount) => {
  date.setTime(date.getTime() + amount);
};
var add2 = /* @__PURE__ */ dual(2, (self, parts) => mutate(self, (date) => {
  if (parts.milliseconds) {
    addMillis(date, parts.milliseconds);
  }
  if (parts.seconds) {
    addMillis(date, parts.seconds * 1e3);
  }
  if (parts.minutes) {
    addMillis(date, parts.minutes * 60 * 1e3);
  }
  if (parts.hours) {
    addMillis(date, parts.hours * 60 * 60 * 1e3);
  }
  if (parts.days) {
    date.setUTCDate(date.getUTCDate() + parts.days);
  }
  if (parts.weeks) {
    date.setUTCDate(date.getUTCDate() + parts.weeks * 7);
  }
  if (parts.months) {
    const day = date.getUTCDate();
    date.setUTCMonth(date.getUTCMonth() + parts.months + 1, 0);
    if (day < date.getUTCDate()) {
      date.setUTCDate(day);
    }
  }
  if (parts.years) {
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    date.setUTCFullYear(date.getUTCFullYear() + parts.years, month + 1, 0);
    if (day < date.getUTCDate()) {
      date.setUTCDate(day);
    }
  }
}));
var subtract2 = /* @__PURE__ */ dual(2, (self, parts) => {
  const newParts = {};
  for (const key in parts) {
    newParts[key] = -1 * parts[key];
  }
  return add2(self, newParts);
});
var startOfDate = (date, part, options2) => {
  switch (part) {
    case "second": {
      date.setUTCMilliseconds(0);
      break;
    }
    case "minute": {
      date.setUTCSeconds(0, 0);
      break;
    }
    case "hour": {
      date.setUTCMinutes(0, 0, 0);
      break;
    }
    case "day": {
      date.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "week": {
      const weekStartsOn = options2?.weekStartsOn ?? 0;
      const day = date.getUTCDay();
      const diff = (day - weekStartsOn + 7) % 7;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "month": {
      date.setUTCDate(1);
      date.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "year": {
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
      break;
    }
  }
};
var startOf = /* @__PURE__ */ dual(isDateTimeArgs, (self, part, options2) => mutate(self, (date) => startOfDate(date, part, options2)));
var endOfDate = (date, part, options2) => {
  switch (part) {
    case "second": {
      date.setUTCMilliseconds(999);
      break;
    }
    case "minute": {
      date.setUTCSeconds(59, 999);
      break;
    }
    case "hour": {
      date.setUTCMinutes(59, 59, 999);
      break;
    }
    case "day": {
      date.setUTCHours(23, 59, 59, 999);
      break;
    }
    case "week": {
      const weekStartsOn = options2?.weekStartsOn ?? 0;
      const day = date.getUTCDay();
      const diff = (day - weekStartsOn + 7) % 7;
      date.setUTCDate(date.getUTCDate() - diff + 6);
      date.setUTCHours(23, 59, 59, 999);
      break;
    }
    case "month": {
      date.setUTCMonth(date.getUTCMonth() + 1, 0);
      date.setUTCHours(23, 59, 59, 999);
      break;
    }
    case "year": {
      date.setUTCMonth(11, 31);
      date.setUTCHours(23, 59, 59, 999);
      break;
    }
  }
};
var endOf = /* @__PURE__ */ dual(isDateTimeArgs, (self, part, options2) => mutate(self, (date) => endOfDate(date, part, options2)));
var nearest = /* @__PURE__ */ dual(isDateTimeArgs, (self, part, options2) => mutate(self, (date) => {
  if (part === "millisecond") return;
  const millis2 = date.getTime();
  const start = new Date(millis2);
  startOfDate(start, part, options2);
  const startMillis = start.getTime();
  const end = new Date(millis2);
  endOfDate(end, part, options2);
  const endMillis = end.getTime() + 1;
  const diffStart = millis2 - startMillis;
  const diffEnd = endMillis - millis2;
  if (diffStart < diffEnd) {
    date.setTime(startMillis);
  } else {
    date.setTime(endMillis);
  }
}));
var intlTimeZone = (self) => {
  if (self._tag === "Named") {
    return self.id;
  }
  return offsetToString(self.offset);
};
var format3 = /* @__PURE__ */ dual(isDateTimeArgs, (self, options2) => {
  try {
    return new Intl.DateTimeFormat(options2?.locale, {
      timeZone: self._tag === "Utc" ? "UTC" : intlTimeZone(self.zone),
      ...options2
    }).format(self.epochMilliseconds);
  } catch {
    return new Intl.DateTimeFormat(options2?.locale, {
      timeZone: "UTC",
      ...options2
    }).format(toDate(self));
  }
});
var formatLocal = /* @__PURE__ */ dual(isDateTimeArgs, (self, options2) => new Intl.DateTimeFormat(options2?.locale, options2).format(self.epochMilliseconds));
var formatUtc = /* @__PURE__ */ dual(isDateTimeArgs, (self, options2) => new Intl.DateTimeFormat(options2?.locale, {
  ...options2,
  timeZone: "UTC"
}).format(self.epochMilliseconds));
var formatIntl = /* @__PURE__ */ dual(2, (self, format5) => format5.format(self.epochMilliseconds));
var formatIso = (self) => toDateUtc(self).toISOString();
var formatIsoDate = (self) => toDate(self).toISOString().slice(0, 10);
var formatIsoDateUtc = (self) => toDateUtc(self).toISOString().slice(0, 10);
var formatIsoOffset = (self) => {
  const date = toDate(self);
  return self._tag === "Utc" ? date.toISOString() : `${date.toISOString().slice(0, -1)}${zonedOffsetIso(self)}`;
};
var formatIsoZoned = (self) => self.zone._tag === "Offset" ? formatIsoOffset(self) : `${formatIsoOffset(self)}[${self.zone.id}]`;

// node_modules/effect/dist/Number.js
var Number3 = globalThis.Number;
var remainder = /* @__PURE__ */ dual(2, (self, divisor) => {
  const selfString = self.toString();
  const divisorString = divisor.toString();
  if (selfString.includes("e") || divisorString.includes("e")) {
    if (!globalThis.Number.isFinite(self) || !globalThis.Number.isFinite(divisor) || divisor === 0) {
      return NaN;
    }
    return remainderWithScientificNotation(self, divisor);
  }
  const selfDecCount = (selfString.split(".")[1] || "").length;
  const divisorDecCount = (divisorString.split(".")[1] || "").length;
  const decCount = selfDecCount > divisorDecCount ? selfDecCount : divisorDecCount;
  const selfInt = parseInt(self.toFixed(decCount).replace(".", ""));
  const divisorInt = parseInt(divisor.toFixed(decCount).replace(".", ""));
  return selfInt % divisorInt / Math.pow(10, decCount);
});
function remainderWithScientificNotation(self, divisor) {
  const [selfCoefficient, selfExponent] = toScientificInteger(self);
  const [divisorCoefficient, divisorExponent] = toScientificInteger(divisor);
  const exponent = Math.min(selfExponent, divisorExponent);
  const selfInteger = selfCoefficient * BigInt(10) ** BigInt(selfExponent - exponent);
  const divisorInteger = divisorCoefficient * BigInt(10) ** BigInt(divisorExponent - exponent);
  const out = selfInteger % divisorInteger;
  if (out === BigInt(0)) {
    return self < 0 || Object.is(self, -0) ? -0 : 0;
  }
  const remainder2 = globalThis.Number(`${out}e${exponent}`);
  return remainder2 === 0 ? Math.sign(self) * globalThis.Number.MIN_VALUE : remainder2;
}
function toScientificInteger(n) {
  const scientific = Math.abs(n).toExponential();
  const eIndex = scientific.indexOf("e");
  const digits = scientific.slice(0, eIndex).replace(".", "");
  const coefficient = BigInt(digits) * (n < 0 ? -BigInt(1) : BigInt(1));
  return [coefficient, globalThis.Number(scientific.slice(eIndex + 1)) - digits.length + 1];
}
var ReducerMax = /* @__PURE__ */ make((a, b) => Math.max(a, b), -Infinity);
var ReducerMin = /* @__PURE__ */ make((a, b) => Math.min(a, b), Infinity);

// node_modules/effect/dist/String.js
var String2 = globalThis.String;
var toUpperCase = (self) => self.toUpperCase();
var toLowerCase = (self) => self.toLowerCase();
var capitalize = (self) => {
  if (self.length === 0) return self;
  return toUpperCase(self[0]) + self.slice(1);
};
var uncapitalize = (self) => {
  if (self.length === 0) return self;
  return toLowerCase(self[0]) + self.slice(1);
};
var trim = (self) => self.trim();
var snakeToCamel = (self) => {
  if (self.length === 0) return self;
  let str = self[0];
  for (let i = 1; i < self.length; i++) {
    str += self[i] === "_" ? self[++i].toUpperCase() : self[i];
  }
  return str;
};
var camelToSnake = (self) => self.replace(/([A-Z])/g, "_$1").toLowerCase();

// node_modules/effect/dist/Pull.js
var catchDone = /* @__PURE__ */ dual(2, (effect2, f) => catchCauseFilter(effect2, filterDoneLeftover, (l) => f(l)));
var isDoneFailure = (failure) => failure._tag === "Fail" && isDone2(failure.error);
var filterDone = (cause) => {
  let done4;
  let hasFailure = false;
  for (const reason of cause.reasons) {
    if (isDoneFailure(reason)) {
      done4 ??= reason.error;
    } else if (reason._tag !== "Interrupt") {
      hasFailure = true;
    }
  }
  if (done4 === void 0) return fail2(cause);
  return hasFailure ? fail2(fromReasons(cause.reasons.filter((reason) => !isDoneFailure(reason)))) : succeed2(done4);
};
var filterDoneLeftover = (cause) => {
  const done4 = filterDone(cause);
  return isFailure2(done4) ? done4 : succeed2(done4.success.value);
};
var matchEffect2 = /* @__PURE__ */ dual(2, (self, options2) => matchCauseEffect(self, {
  onSuccess: options2.onSuccess,
  onFailure: (cause) => {
    const halt = filterDone(cause);
    return !isFailure2(halt) ? options2.onDone(halt.success.value) : options2.onFailure(halt.failure);
  }
}));

// node_modules/effect/dist/Schedule.js
var TypeId10 = "~effect/Schedule";
var CurrentMetadata2 = /* @__PURE__ */ Reference("effect/Schedule/CurrentMetadata", {
  defaultValue: /* @__PURE__ */ constant({
    input: void 0,
    output: void 0,
    duration: zero2,
    attempt: 0,
    start: 0,
    now: 0,
    elapsed: 0,
    elapsedSincePrevious: 0
  })
});
var ScheduleProto = {
  [TypeId10]: {
    _Out: identity,
    _In: identity,
    _Env: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var isSchedule = (u) => hasProperty(u, TypeId10);
var fromStep = (step) => {
  const self = Object.create(ScheduleProto);
  self.step = step;
  return self;
};
var metadataFn = () => {
  let n = 0;
  let previous;
  let start;
  return (now3, input) => {
    if (start === void 0) start = now3;
    const elapsed = now3 - start;
    const elapsedSincePrevious = previous === void 0 ? 0 : now3 - previous;
    previous = now3;
    return {
      input,
      attempt: ++n,
      start,
      now: now3,
      elapsed,
      elapsedSincePrevious
    };
  };
};
var fromStepWithMetadata = (step) => fromStep(map5(step, (f) => {
  const meta = metadataFn();
  return (now3, input) => f(meta(now3, input));
}));
var toStep = (schedule2) => catchCause(schedule2.step, (cause) => succeed3(() => failCause(cause)));
var toStepWithMetadata = (schedule2) => clockWith((clock) => map5(toStep(schedule2), (step) => {
  const metaFn = metadataFn();
  return (input) => suspend(() => {
    const now3 = clock.currentTimeMillisUnsafe();
    return flatMap3(step(now3, input), ([output, duration]) => {
      const meta = metaFn(now3, input);
      meta.output = output;
      meta.duration = duration;
      return as2(sleep(duration), meta);
    });
  });
}));
var passthrough = (self) => fromStep(map5(toStep(self), (step) => (now3, input) => matchEffect2(step(now3, input), {
  onSuccess: (result3) => succeed3([input, result3[1]]),
  onFailure: failCause,
  onDone: () => done2(input)
})));
var recurs = (times) => while_(forever2, ({
  attempt
}) => succeed3(attempt <= times));
var spaced = (duration) => {
  const decoded = fromInputUnsafe(duration);
  return fromStepWithMetadata(succeed3((meta) => succeed3([meta.attempt - 1, decoded])));
};
var while_ = /* @__PURE__ */ dual(2, (self, predicate) => fromStep(map5(toStep(self), (step) => {
  const meta = metadataFn();
  return (now3, input) => flatMap3(step(now3, input), (result3) => {
    const [output, duration] = result3;
    const eff = predicate({
      ...meta(now3, input),
      output,
      duration
    });
    return flatMap3(isEffect(eff) ? eff : succeed3(eff), (check2) => check2 ? succeed3(result3) : done2(output));
  });
})));
var forever2 = /* @__PURE__ */ spaced(zero2);

// node_modules/effect/dist/internal/layer.js
var provideLayer = (self, layer, options2) => scopedWith((scope3) => flatMap3(options2?.local ? buildWithMemoMap(layer, makeMemoMapUnsafe(), scope3) : buildWithScope(layer, scope3), (context3) => provideContext(self, context3)));
var provide3 = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, source, options2) => isContext(source) ? provideContext(self, source) : provideLayer(self, Array.isArray(source) ? mergeAll2(...source) : source, options2));

// node_modules/effect/dist/internal/schedule.js
var repeatOrElse = /* @__PURE__ */ dual(3, (self, schedule2, orElse2) => flatMap3(toStepWithMetadata(schedule2), (step) => {
  let meta = CurrentMetadata2.defaultValue();
  return catch_(forever(tap2(flatMap3(suspend(() => provideService(self, CurrentMetadata2, meta)), step), (meta_) => sync(() => {
    meta = meta_;
  })), {
    disableYield: true
  }), (error) => isDone(error) ? succeed3(error.value) : orElse2(error, meta.attempt === 0 ? none2() : some2(meta)));
}));
var retryOrElse = /* @__PURE__ */ dual(3, (self, policy, orElse2) => flatMap3(toStepWithMetadata(policy), (step) => {
  let meta = CurrentMetadata2.defaultValue();
  let lastError;
  const loop = catch_(suspend(() => provideService(self, CurrentMetadata2, meta)), (error) => {
    lastError = error;
    return flatMap3(step(error), (meta_) => {
      meta = meta_;
      return loop;
    });
  });
  return catchDone(loop, (out) => internalCall(() => orElse2(lastError, out)));
}));
var repeat = /* @__PURE__ */ dual(2, (self, options2) => {
  const schedule2 = typeof options2 === "function" ? options2(identity) : isSchedule(options2) ? options2 : buildFromOptions(options2);
  return repeatOrElse(self, schedule2, fail3);
});
var retry = /* @__PURE__ */ dual(2, (self, options2) => {
  const schedule2 = typeof options2 === "function" ? options2(identity) : isSchedule(options2) ? options2 : buildFromOptions(options2);
  return retryOrElse(self, schedule2, fail3);
});
var scheduleFrom = /* @__PURE__ */ dual(3, (self, initial, schedule2) => flatMap3(toStepWithMetadata(schedule2), (step) => {
  let meta = CurrentMetadata2.defaultValue();
  const selfWithMeta = suspend(() => provideService(self, CurrentMetadata2, meta));
  return catch_(flatMap3(step(initial), (meta_) => {
    meta = meta_;
    const body = constant(flatMap3(selfWithMeta, step));
    return whileLoop({
      while: constTrue,
      body,
      step(meta_2) {
        meta = meta_2;
      }
    });
  }), (error) => isDone(error) ? succeed3(error.value) : fail3(error));
}));
var passthroughForever = /* @__PURE__ */ passthrough(forever2);
var buildFromOptions = (options2) => {
  let schedule2 = options2.schedule ? passthrough(options2.schedule) : passthroughForever;
  if (options2.while) {
    schedule2 = while_(schedule2, ({
      input
    }) => {
      const applied = options2.while(input);
      return isEffect(applied) ? applied : succeed3(applied);
    });
  }
  if (options2.until) {
    schedule2 = while_(schedule2, ({
      input
    }) => {
      const applied = options2.until(input);
      return isEffect(applied) ? map5(applied, (b) => !b) : succeed3(!applied);
    });
  }
  if (options2.times !== void 0) {
    schedule2 = while_(schedule2, ({
      attempt
    }) => succeed3(attempt <= options2.times));
  }
  return schedule2;
};

// node_modules/effect/dist/internal/executionPlan.js
var makeEventEmitter = (onEvent, currentMetadata) => {
  let lastStepIndex = -1;
  let stepAttempt = 0;
  const emit = (event) => ignoreCause(onEvent(event));
  return {
    begin: clockWith((clock) => suspend(() => {
      const meta = currentMetadata();
      if (meta.stepIndex !== lastStepIndex) {
        lastStepIndex = meta.stepIndex;
        stepAttempt = 0;
      }
      stepAttempt++;
      const state = {
        attempt: meta.attempt,
        stepAttempt,
        stepIndex: meta.stepIndex,
        startNanos: clock.monotonicTimeNanosUnsafe()
      };
      return as2(emit({
        _tag: "AttemptStart",
        attempt: state.attempt,
        stepAttempt: state.stepAttempt,
        stepIndex: state.stepIndex
      }), state);
    })),
    end: (state, exit3) => clockWith((clock) => {
      const duration = nanos(clock.monotonicTimeNanosUnsafe() - state.startNanos);
      return emit(exit3._tag === "Success" ? {
        _tag: "AttemptSuccess",
        attempt: state.attempt,
        stepAttempt: state.stepAttempt,
        stepIndex: state.stepIndex,
        duration
      } : {
        _tag: "AttemptFailure",
        attempt: state.attempt,
        stepAttempt: state.stepAttempt,
        stepIndex: state.stepIndex,
        duration,
        cause: exit3.cause
      });
    })
  };
};
var withExecutionPlan = /* @__PURE__ */ dual((args2) => isEffect(args2[0]), (self, plan, options2) => suspend(() => {
  let i = 0;
  let meta = {
    attempt: 0,
    stepIndex: 0
  };
  const provideMeta = provideServiceEffect(CurrentMetadata, sync(() => {
    meta = {
      attempt: meta.attempt + 1,
      stepIndex: i
    };
    return meta;
  }));
  const emitter = options2?.onEvent === void 0 ? void 0 : makeEventEmitter(options2.onEvent, () => meta);
  const instrument = emitter === void 0 ? identity : (attempt) => uninterruptibleMask((restore) => flatMap3(emitter.begin, (state) => onExit(restore(attempt), (exit3) => emitter.end(state, exit3))));
  let result3;
  return flatMap3(whileLoop({
    while: () => i < plan.steps.length && (result3 === void 0 || isFailure2(result3)),
    body() {
      const step = plan.steps[i];
      let nextEffect = provideMeta(instrument(provide3(self, step.provide)));
      if (result3) {
        let attempted = false;
        const wrapped = nextEffect;
        nextEffect = suspend(() => {
          if (attempted) return wrapped;
          attempted = true;
          return fromResult(result3);
        });
        nextEffect = retry(nextEffect, scheduleFromStep(step, false));
      } else {
        const schedule2 = scheduleFromStep(step, true);
        nextEffect = schedule2 ? retry(nextEffect, schedule2) : nextEffect;
      }
      return result(nextEffect);
    },
    step(result_) {
      result3 = result_;
      i++;
    }
  }), () => fromResult(result3));
}));
var scheduleFromStep = (step, first) => {
  if (!first) {
    return buildFromOptions({
      schedule: step.schedule ? step.schedule : step.attempts ? void 0 : scheduleOnce,
      times: step.attempts,
      while: step.while
    });
  } else if (step.attempts === 1 || !(step.schedule || step.attempts)) {
    return void 0;
  }
  return buildFromOptions({
    schedule: step.schedule,
    while: step.while,
    times: step.attempts ? step.attempts - 1 : void 0
  });
};
var scheduleOnce = /* @__PURE__ */ recurs(1);

// node_modules/effect/dist/Request.js
var TypeId11 = "~effect/Request";
var requestVariance = /* @__PURE__ */ byReferenceUnsafe({
  /* c8 ignore next */
  _E: (_) => _,
  /* c8 ignore next */
  _A: (_) => _,
  /* c8 ignore next */
  _R: (_) => _
});
var RequestPrototype = {
  ...StructuralProto,
  [TypeId11]: requestVariance
};
var makeEntry = (options2) => options2;

// node_modules/effect/dist/internal/request.js
var request = /* @__PURE__ */ dual(2, (self, resolver) => {
  const withResolver = (resolver2) => callback((resume) => {
    const entry = addEntry(resolver2, self, resume, getCurrentFiber());
    return maybeRemoveEntry(resolver2, entry);
  });
  return isEffect(resolver) ? flatMap3(resolver, withResolver) : withResolver(resolver);
});
var requestUnsafe = (self, options2) => {
  const entry = addEntry(options2.resolver, self, options2.onExit, {
    context: options2.context,
    currentScheduler: get(options2.context, Scheduler)
  });
  return () => removeEntryUnsafe(options2.resolver, entry);
};
var batchPool = [];
var pendingBatches = /* @__PURE__ */ new WeakMap();
var addEntry = (resolver, request3, resume, fiber3) => {
  let batchMap = pendingBatches.get(resolver);
  if (!batchMap) {
    batchMap = /* @__PURE__ */ new Map();
    pendingBatches.set(resolver, batchMap);
  }
  let batch;
  let completed = false;
  const entry = makeEntry({
    request: request3,
    context: fiber3.context,
    uninterruptible: false,
    completeUnsafe(effect2) {
      if (completed) return;
      completed = true;
      resume(effect2);
      batch?.entrySet.delete(entry);
    }
  });
  if (resolver.preCheck !== void 0 && !resolver.preCheck(entry)) {
    return entry;
  }
  const key = resolver.batchKey(entry);
  batch = batchMap.get(key);
  if (!batch) {
    if (batchPool.length > 0) {
      batch = batchPool.pop();
      batch.key = key;
      batch.resolver = resolver;
      batch.map = batchMap;
    } else {
      const newBatch = {
        key,
        resolver,
        map: batchMap,
        entrySet: /* @__PURE__ */ new Set(),
        entries: /* @__PURE__ */ new Set(),
        delayEffect: flatMap3(suspend(() => newBatch.resolver.delay), (_) => runBatch(newBatch)),
        run: onExit(suspend(() => newBatch.resolver.runAll(Array.from(newBatch.entries), newBatch.key)), (exit3) => {
          for (const entry2 of newBatch.entrySet) {
            entry2.completeUnsafe(exit3._tag === "Success" ? exitDie(new Error("Effect.request: RequestResolver did not complete request", {
              cause: entry2.request
            })) : exit3);
          }
          newBatch.entries.clear();
          if (batchPool.length < 128) {
            newBatch.entrySet.clear();
            newBatch.key = void 0;
            newBatch.fiber = void 0;
            newBatch.resolver = void 0;
            newBatch.map = void 0;
            batchPool.push(newBatch);
          }
          return void_2;
        })
      };
      batch = newBatch;
    }
    batchMap.set(key, batch);
    batch.fiber = runForkWith(fiber3.context)(batch.delayEffect, {
      scheduler: fiber3.currentScheduler
    });
  }
  batch.entrySet.add(entry);
  batch.entries.add(entry);
  if (batch.resolver.collectWhile(batch.entries)) return entry;
  batch.fiber.interruptUnsafe(fiber3.id);
  batch.fiber = runForkWith(fiber3.context)(runBatch(batch), {
    scheduler: fiber3.currentScheduler
  });
  return entry;
};
var removeEntryUnsafe = (resolver, entry) => {
  if (entry.uninterruptible) return;
  const batchMap = pendingBatches.get(resolver);
  if (!batchMap) return;
  const key = resolver.batchKey(entry);
  const batch = batchMap.get(key);
  if (!batch) return;
  batch.entries.delete(entry);
  batch.entrySet.delete(entry);
  if (batch.entries.size === 0) {
    batchMap.delete(key);
    batch.fiber?.interruptUnsafe();
  }
};
var maybeRemoveEntry = (resolver, entry) => sync(() => removeEntryUnsafe(resolver, entry));
function runBatch(batch) {
  if (!batch.map.has(batch.key)) return void_2;
  batch.map.delete(batch.key);
  return batch.run;
}

// node_modules/effect/dist/Metric.js
var CurrentMetricAttributesKey = "effect/Metric/CurrentMetricAttributes";
var CurrentMetricAttributes = /* @__PURE__ */ Reference(CurrentMetricAttributesKey, {
  defaultValue: () => ({})
});
var MetricRegistryKey = "~effect/observability/Metric/MetricRegistryKey";
var MetricRegistry = /* @__PURE__ */ Reference(MetricRegistryKey, {
  defaultValue: () => /* @__PURE__ */ new Map()
});
var TypeId12 = "~effect/observability/Metric";
var Metric$ = class {
  [TypeId12] = TypeId12;
  #metadataCache = /* @__PURE__ */ new WeakMap();
  #metadata;
  id;
  description;
  attributes;
  constructor(id2, description, attributes) {
    this.id = id2;
    this.description = description;
    this.attributes = attributes;
  }
  valueUnsafe(context3) {
    return this.hook(context3).get(context3);
  }
  modifyUnsafe(input, context3) {
    return this.hook(context3).modify(input, context3);
  }
  updateUnsafe(input, context3) {
    return this.hook(context3).update(input, context3);
  }
  hook(context3) {
    const extraAttributes = get(context3, CurrentMetricAttributes);
    if (Object.keys(extraAttributes).length === 0) {
      if (isNotUndefined(this.#metadata)) {
        return this.#metadata.hooks;
      }
      this.#metadata = this.getOrCreate(context3, this.attributes);
      return this.#metadata.hooks;
    }
    const mergedAttributes = mergeAttributes(this.attributes, extraAttributes);
    let metadata = this.#metadataCache.get(mergedAttributes);
    if (isNotUndefined(metadata)) {
      return metadata.hooks;
    }
    metadata = this.getOrCreate(context3, mergedAttributes);
    this.#metadataCache.set(mergedAttributes, metadata);
    return metadata.hooks;
  }
  getOrCreate(context3, attributes) {
    const key = makeKey(this, attributes);
    const registry = get(context3, MetricRegistry);
    if (registry.has(key)) {
      return registry.get(key);
    }
    const hooks = this.createHooks();
    const meta = {
      id: this.id,
      type: this.type,
      description: this.description,
      attributes: attributesToRecord(attributes),
      hooks
    };
    registry.set(key, meta);
    return meta;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var update = /* @__PURE__ */ dual(2, (self, input) => contextWith((services) => sync(() => self.updateUnsafe(input, services))));
function makeKey(metric, attributes) {
  let key = `${metric.type}:${metric.id}`;
  if (isNotUndefined(metric.description)) {
    key += `:${metric.description}`;
  }
  if (isNotUndefined(attributes)) {
    key += `:${serializeAttributes(attributes)}`;
  }
  return key;
}
function serializeAttributes(attributes) {
  return JSON.stringify(Array.isArray(attributes) ? attributes : Object.entries(attributes));
}
function mergeAttributes(self, other) {
  return {
    ...attributesToRecord(self),
    ...attributesToRecord(other)
  };
}
function attributesToRecord(attributes) {
  if (isNotUndefined(attributes) && Array.isArray(attributes)) {
    return attributes.reduce((acc, [key, value3]) => {
      assignProperty(acc, key, value3);
      return acc;
    }, {});
  }
  return attributes;
}

// node_modules/effect/dist/Effect.js
var TypeId13 = EffectTypeId;
var isEffect2 = isEffect;
var all3 = all2;
var partition3 = partition2;
var reduce2 = reduce;
var validate2 = validate;
var findFirst2 = findFirst;
var findFirstFilter2 = findFirstFilter;
var forEach2 = forEach;
var head2 = head;
var whileLoop2 = whileLoop;
var promise2 = promise;
var tryPromise2 = tryPromise;
var succeed6 = succeed3;
var succeedNone2 = succeedNone;
var succeedSome2 = succeedSome;
var suspend2 = suspend;
var sync3 = sync;
var void_4 = void_2;
var undefined_2 = undefined_;
var callback2 = callback;
var never2 = never;
var Do3 = Do2;
var bindTo4 = bindTo3;
var let_4 = let_3;
var bind4 = bind3;
var gen3 = gen2;
var fail5 = fail3;
var failSync2 = failSync;
var failCause3 = failCause;
var failCauseSync2 = failCauseSync;
var die2 = die;
var try_3 = try_2;
var yieldNow2 = yieldNow;
var yieldNowWith2 = yieldNowWith;
var withFiber2 = withFiber;
var fromResult2 = fromResult;
var fromOption3 = fromOption2;
var transposeOption2 = transposeOption;
var fromNullishOr3 = fromNullishOr2;
var flatMap4 = flatMap3;
var flatten4 = flatten3;
var andThen3 = andThen2;
var tap3 = tap2;
var result2 = result;
var option2 = option;
var exit2 = exit;
var map7 = map5;
var as3 = as2;
var asSome2 = asSome;
var asVoid3 = asVoid2;
var flip2 = flip;
var zip2 = zip;
var zipWith3 = zipWith2;
var catch_2 = catch_;
var catchTag2 = catchTag;
var catchTags2 = catchTags;
var catchReason2 = catchReason;
var catchReasons2 = catchReasons;
var unwrapReason2 = unwrapReason;
var catchCause2 = catchCause;
var catchDefect2 = catchDefect;
var catchIf2 = catchIf;
var catchFilter2 = catchFilter;
var catchNoSuchElement2 = catchNoSuchElement;
var catchCauseIf2 = catchCauseIf;
var catchCauseFilter2 = catchCauseFilter;
var mapError3 = mapError2;
var mapBoth2 = mapBoth;
var orDie2 = orDie;
var tapError2 = tapError;
var tapErrorTag2 = tapErrorTag;
var tapCause2 = tapCause;
var tapCauseIf2 = tapCauseIf;
var tapCauseFilter2 = tapCauseFilter;
var tapDefect2 = tapDefect;
var eventually2 = eventually;
var retry2 = retry;
var retryOrElse2 = retryOrElse;
var sandbox2 = sandbox;
var ignore2 = ignore;
var ignoreCause2 = ignoreCause;
var withExecutionPlan2 = withExecutionPlan;
var withErrorReporting2 = withErrorReporting;
var orElseSucceed2 = orElseSucceed;
var firstSuccessOf2 = firstSuccessOf;
var timeout2 = timeout;
var timeoutOption2 = timeoutOption;
var timeoutOrElse2 = timeoutOrElse;
var delay2 = delay;
var sleep2 = sleep;
var timed2 = timed;
var raceAll2 = raceAll;
var raceAllFirst2 = raceAllFirst;
var race2 = race;
var raceFirst2 = raceFirst;
var filter4 = filter3;
var filterMap3 = filterMap2;
var filterMapEffect2 = filterMapEffect;
var filterOrElse2 = filterOrElse;
var filterMapOrElse2 = filterMapOrElse;
var filterOrFail2 = filterOrFail;
var filterMapOrFail2 = filterMapOrFail;
var when2 = when;
var match6 = match4;
var matchEager2 = matchEager;
var matchCause2 = matchCause;
var matchCauseEager2 = matchCauseEager;
var matchCauseEffectEager2 = matchCauseEffectEager;
var matchCauseEffect2 = matchCauseEffect;
var matchEffect3 = matchEffect;
var isFailure5 = isFailure3;
var isSuccess5 = isSuccess3;
var context2 = context;
var contextWith2 = contextWith;
var provide4 = provide3;
var provideContext2 = provideContext;
var setContext2 = setContext;
var service2 = service;
var serviceOption2 = serviceOption;
var updateContext2 = updateContext;
var updateService2 = updateService;
var updateServiceScoped2 = updateServiceScoped;
var provideService2 = provideService;
var provideServiceEffect2 = provideServiceEffect;
var scope2 = scope;
var scoped2 = scoped;
var scopedWith2 = scopedWith;
var acquireRelease2 = acquireRelease;
var acquireDisposable2 = acquireDisposable;
var acquireUseRelease2 = acquireUseRelease;
var addFinalizer2 = addFinalizer;
var ensuring2 = ensuring;
var onError2 = onError;
var onErrorIf2 = onErrorIf;
var onErrorFilter2 = onErrorFilter;
var onExitPrimitive2 = onExitPrimitive;
var onExit2 = onExit;
var onExitIf2 = onExitIf;
var onExitFilter2 = onExitFilter;
var cached2 = cached;
var cachedWithTTL2 = cachedWithTTL;
var cachedInvalidateWithTTL2 = cachedInvalidateWithTTL;
var interrupt2 = interrupt;
var interruptible2 = interruptible;
var onInterrupt2 = onInterrupt;
var uninterruptible2 = uninterruptible;
var uninterruptibleMask2 = uninterruptibleMask;
var interruptibleMask2 = interruptibleMask;
var abortSignal2 = abortSignal;
var forever3 = forever;
var repeat2 = repeat;
var repeatOrElse2 = repeatOrElse;
var replicate2 = replicate;
var replicateEffect2 = replicateEffect;
var schedule = /* @__PURE__ */ dual(2, (self, schedule2) => scheduleFrom2(self, void 0, schedule2));
var scheduleFrom2 = scheduleFrom;
var tracer2 = tracer;
var withTracer2 = withTracer;
var withTracerEnabled2 = withTracerEnabled;
var withTracerTiming2 = withTracerTiming;
var annotateSpans2 = annotateSpans;
var annotateCurrentSpan2 = annotateCurrentSpan;
var currentSpan2 = currentSpan;
var currentParentSpan2 = currentParentSpan;
var spanAnnotations2 = spanAnnotations;
var spanLinks2 = spanLinks;
var linkSpans2 = linkSpans;
var makeSpan2 = makeSpan;
var makeSpanScoped2 = makeSpanScoped;
var useSpan2 = useSpan;
var withSpan2 = withSpan;
var withSpanScoped2 = withSpanScoped;
var withParentSpan2 = withParentSpan;
var request2 = request;
var requestUnsafe2 = requestUnsafe;
var forkChild2 = forkChild;
var forkIn2 = forkIn;
var forkScoped2 = forkScoped;
var forkDetach2 = forkDetach;
var awaitAllChildren2 = awaitAllChildren;
var fiber2 = fiber;
var fiberId2 = fiberId;
var runFork2 = runFork;
var runForkWith2 = runForkWith;
var runCallbackWith2 = runCallbackWith;
var runCallback2 = runCallback;
var runPromise2 = runPromise;
var runPromiseWith2 = runPromiseWith;
var runPromiseExit2 = runPromiseExit;
var runPromiseExitWith2 = runPromiseExitWith;
var runSync2 = runSync;
var runSyncWith2 = runSyncWith;
var runSyncExit2 = runSyncExit;
var runSyncExitWith2 = runSyncExitWith;
var fnUntraced2 = fnUntraced;
var fn2 = fn;
var clockWith2 = clockWith;
var logWithLevel2 = logWithLevel;
var log = /* @__PURE__ */ logWithLevel();
var logFatal = /* @__PURE__ */ logWithLevel("Fatal");
var logWarning = /* @__PURE__ */ logWithLevel("Warn");
var logError = /* @__PURE__ */ logWithLevel("Error");
var logInfo = /* @__PURE__ */ logWithLevel("Info");
var logDebug = /* @__PURE__ */ logWithLevel("Debug");
var logTrace = /* @__PURE__ */ logWithLevel("Trace");
var withLogger = /* @__PURE__ */ dual(2, (effect2, logger) => updateService(effect2, CurrentLoggers, (loggers) => /* @__PURE__ */ new Set([...loggers, logger])));
var annotateLogs = /* @__PURE__ */ dual((args2) => isEffect2(args2[0]), (effect2, ...args2) => updateService(effect2, CurrentLogAnnotations2, (annotations) => {
  const newAnnotations = args2.length === 1 ? {
    ...annotations,
    ...args2[0]
  } : {
    ...annotations
  };
  if (args2.length === 1) {
    return newAnnotations;
  } else {
    assignProperty(newAnnotations, args2[0], args2[1]);
  }
  return newAnnotations;
}));
var annotateLogsScoped2 = annotateLogsScoped;
var withLogSpan = /* @__PURE__ */ dual(2, (effect2, label) => flatMap3(currentTimeMillis, (now3) => updateService(effect2, CurrentLogSpans2, (spans) => {
  const span = [label, now3];
  return [span, ...spans];
})));
var track = /* @__PURE__ */ dual((args2) => isEffect2(args2[0]), (self, metric, f) => onExit2(self, (exit3) => {
  const input = f === void 0 ? exit3 : internalCall(() => f(exit3));
  return update(metric, input);
}));
var trackSuccesses = /* @__PURE__ */ dual((args2) => isEffect2(args2[0]), (self, metric, f) => tap3(self, (value3) => {
  const input = f === void 0 ? value3 : f(value3);
  return update(metric, input);
}));
var trackErrors = /* @__PURE__ */ dual((args2) => isEffect2(args2[0]), (self, metric, f) => tapError2(self, (error) => {
  const input = f === void 0 ? error : internalCall(() => f(error));
  return update(metric, input);
}));
var trackDefects = /* @__PURE__ */ dual((args2) => isEffect2(args2[0]), (self, metric, f) => tapDefect2(self, (defect) => {
  const input = f === void 0 ? defect : internalCall(() => f(defect));
  return update(metric, input);
}));
var trackDuration = /* @__PURE__ */ dual((args2) => isEffect2(args2[0]), (self, metric, f) => clockWith2((clock) => {
  const startTime = clock.monotonicTimeNanosUnsafe();
  return onExit2(self, () => {
    const endTime = clock.monotonicTimeNanosUnsafe();
    const duration = subtract(fromInputUnsafe(endTime), fromInputUnsafe(startTime));
    const input = f === void 0 ? duration : internalCall(() => f(duration));
    return update(metric, input);
  });
}));
var Transaction = class extends (/* @__PURE__ */ Service()("effect/Effect/Transaction")) {
};
var tx = (effect2) => withFiber2((fiber3) => {
  let state = getOrUndefined2(fiber3.context, Transaction);
  if (state) {
    return effect2;
  }
  state = {
    journal: /* @__PURE__ */ new Map(),
    retry: false
  };
  let result3;
  return uninterruptibleMask2((restore) => flatMap4(whileLoop2({
    while: () => !result3,
    body: constant(restore(effect2).pipe(provideService2(Transaction, state), tapCause2(() => {
      if (!state.retry) return void_4;
      return restore(awaitPendingTransaction(state));
    }), exit2)),
    step(exit3) {
      if (state.retry || !isTransactionConsistent(state)) {
        return clearTransaction(state);
      }
      if (isSuccess4(exit3)) {
        commitTransaction(fiber3, state);
      } else {
        clearTransaction(state);
      }
      result3 = exit3;
    }
  }), () => result3));
});
var isTransactionConsistent = (state) => {
  for (const [ref, {
    version
  }] of state.journal) {
    if (ref.version !== version) {
      return false;
    }
  }
  return true;
};
var awaitPendingTransaction = (state) => suspend2(() => {
  const key = {};
  const refs = Array.from(state.journal.keys());
  const clearPending = () => {
    for (const clear of refs) {
      clear.pending.delete(key);
    }
  };
  return callback2((resume) => {
    const onCall = () => {
      clearPending();
      resume(void_4);
    };
    for (const ref of refs) {
      ref.pending.set(key, onCall);
    }
    return sync3(clearPending);
  });
});
function commitTransaction(fiber3, state) {
  for (const [ref, {
    value: value3
  }] of state.journal) {
    if (value3 !== ref.value) {
      ref.version = ref.version + 1;
      ref.value = value3;
    }
    for (const pending of ref.pending.values()) {
      fiber3.currentDispatcher.scheduleTask(pending, 0);
    }
    ref.pending.clear();
  }
}
function clearTransaction(state) {
  state.retry = false;
  state.journal.clear();
}
var txRetry = /* @__PURE__ */ flatMap4(Transaction, (state) => {
  state.retry = true;
  return interrupt2;
});
var effectify = (fn3, onError3, onSyncError) => (...args2) => callback2((resume) => {
  try {
    fn3(...args2, (err, result3) => {
      if (err) {
        resume(fail5(onError3 ? onError3(err, args2) : err));
      } else {
        resume(succeed6(result3));
      }
    });
  } catch (err) {
    resume(onSyncError ? fail5(onSyncError(err, args2)) : die2(err));
  }
});
var satisfiesSuccessType = () => (effect2) => effect2;
var satisfiesErrorType = () => (effect2) => effect2;
var satisfiesServicesType = () => (effect2) => effect2;
var mapEager2 = mapEager;
var mapErrorEager2 = mapErrorEager;
var mapBothEager2 = mapBothEager;
var flatMapEager2 = flatMapEager;
var catchEager2 = catchEager;
var fnUntracedEager2 = fnUntracedEager;

// node_modules/effect/dist/internal/schema/annotations.js
function resolve(ast) {
  return ast.checks ? ast.checks[ast.checks.length - 1].annotations : ast.annotations;
}
function resolveAt(key) {
  return (ast) => resolve(ast)?.[key];
}
var STRUCTURAL_ANNOTATION_KEY = "~structural";
var IDENTIFIER_FALLBACK_KEY = "~identifier";
var SENTINELS_ANNOTATION_KEY = "~sentinels";
var CONSTRUCTOR_ANNOTATION_KEY = "~constructor";
var jsonSchemaAnnotationKeys = ["title", "description", "default", "examples", "readOnly", "writeOnly", "format", "contentEncoding", "contentMediaType", "contentSchema"];
var resolveIdentifier = /* @__PURE__ */ resolveAt("identifier");
var resolveIdentifierFallback = /* @__PURE__ */ resolveAt(IDENTIFIER_FALLBACK_KEY);
var resolveTitle = /* @__PURE__ */ resolveAt("title");
var resolveBrands = /* @__PURE__ */ resolveAt("brands");
var getExpected = /* @__PURE__ */ memoize((ast) => {
  const identifier2 = resolve(ast)?.identifier;
  if (typeof identifier2 === "string") return identifier2;
  return ast.getExpected(getExpected);
});
var annotationExcludedKeys = /* @__PURE__ */ new Set([SENTINELS_ANNOTATION_KEY, STRUCTURAL_ANNOTATION_KEY, "representation", "arbitrary", "brands", "toJsonSchema", "toCode", "toArbitrary", "toEquivalence", "toFormatter", "toCodec", "toCodecJson", "toCodecStringTree", "toCodecIso"]);

// node_modules/effect/dist/internal/schema/parser.js
var missing = /* @__PURE__ */ Symbol();
var succeed7 = succeed4;
var missingExit = /* @__PURE__ */ succeed7(missing);
var sameExit = /* @__PURE__ */ succeed7(missing);
var toOption = (value3) => value3 === missing ? none2() : some2(value3);
var fromOptionExit = (option3) => option3._tag === "None" ? missingExit : succeed7(option3.value);

// node_modules/effect/dist/SchemaIssue.js
var TypeId14 = "~effect/SchemaIssue/Issue";
function isIssue(u) {
  return hasProperty(u, TypeId14) && u[TypeId14] === TypeId14;
}
function hasInput(issue) {
  return Object.hasOwn(issue, "input");
}
var Base = class {
  [TypeId14] = TypeId14;
  constructor(input, options2) {
    if (options2?.reportInput === true && input !== missing) {
      this.input = input;
    }
  }
};
var Filter = class extends Base {
  _tag = "Filter";
  /**
   * The filter that failed.
   */
  filter;
  /**
   * The issue that occurred.
   */
  issue;
  constructor(filter8, issue, input, options2) {
    super(input, options2);
    this.filter = filter8;
    this.issue = issue;
  }
};
var Encoding = class extends Base {
  _tag = "Encoding";
  /**
   * The schema that caused the issue.
   */
  ast;
  /**
   * The issue that occurred.
   */
  issue;
  constructor(ast, issue, input, options2) {
    super(input, options2);
    this.ast = ast;
    this.issue = issue;
  }
};
var Pointer = class extends Base {
  _tag = "Pointer";
  /**
   * The path to the location in the input that caused the issue.
   */
  path;
  /**
   * The issue that occurred.
   */
  issue;
  constructor(path, issue) {
    super();
    this.path = path;
    this.issue = issue;
  }
};
var MissingKey = class extends Base {
  _tag = "MissingKey";
  /**
   * The metadata for the issue.
   */
  annotations;
  constructor(annotations) {
    super();
    this.annotations = annotations;
  }
};
var UnexpectedKey = class extends Base {
  _tag = "UnexpectedKey";
  /**
   * The schema that caused the issue.
   */
  ast;
  constructor(ast, input, options2) {
    super(input, options2);
    this.ast = ast;
  }
};
var Composite = class extends Base {
  _tag = "Composite";
  /**
   * The schema that caused the issue.
   */
  ast;
  /**
   * The issues that occurred.
   */
  issues;
  constructor(ast, issues, input, options2) {
    super(input, options2);
    this.ast = ast;
    this.issues = issues;
  }
};
var InvalidType = class extends Base {
  _tag = "InvalidType";
  /**
   * The schema that caused the issue.
   */
  ast;
  constructor(ast, input, options2) {
    super(input, options2);
    this.ast = ast;
  }
};
var InvalidValue = class extends Base {
  _tag = "InvalidValue";
  /**
   * The metadata for the issue.
   */
  annotations;
  constructor(annotations, input, options2) {
    super(input, options2);
    this.annotations = annotations;
  }
};
function makeCompositeAtKey(compositeAst, pointerKey, pointerIssue, compositeInput, parseOptions) {
  return new Composite(compositeAst, [new Pointer([pointerKey], pointerIssue)], compositeInput, parseOptions);
}
var Forbidden = class extends Base {
  _tag = "Forbidden";
  /**
   * The metadata for the issue.
   */
  annotations;
  constructor(annotations, input, options2) {
    super(input, options2);
    this.annotations = annotations;
  }
};
var AnyOf = class extends Base {
  _tag = "AnyOf";
  /**
   * The schema that caused the issue.
   */
  ast;
  /**
   * The issues that occurred.
   */
  issues;
  constructor(ast, issues, input, options2) {
    super(input, options2);
    this.ast = ast;
    this.issues = issues;
  }
};
var OneOf = class extends Base {
  _tag = "OneOf";
  /**
   * The schema that caused the issue.
   */
  ast;
  /**
   * The schemas that were successful.
   */
  successes;
  constructor(ast, successes, input, options2) {
    super(input, options2);
    this.ast = ast;
    this.successes = successes;
  }
};
function makeFilterIssue(entry, input, options2) {
  if (isIssue(entry)) {
    return entry;
  }
  if (typeof entry === "string") {
    return new InvalidValue({
      message: entry
    }, input, options2);
  }
  const inner = typeof entry.issue === "string" ? new InvalidValue({
    message: entry.issue
  }, input, options2) : entry.issue;
  return new Pointer(entry.path, inner);
}
function makeSingle(out, input, options2) {
  if (out === void 0) {
    return void 0;
  }
  if (typeof out === "boolean") {
    return out ? void 0 : new InvalidValue(void 0, input, options2);
  }
  return makeFilterIssue(out, input, options2);
}
function normalizeFilterOutput(ast, out, input, options2) {
  if (Array.isArray(out)) {
    if (!isReadonlyArrayNonEmpty(out)) {
      return void 0;
    }
    return out.length === 1 ? makeFilterIssue(out[0], input, options2) : new Composite(ast, map4(out, (entry) => makeFilterIssue(entry, input, options2)), input, options2);
  }
  return makeSingle(out, input, options2);
}
var defaultLeafHook = (issue) => {
  const message = findMessage(issue);
  if (message !== void 0) return message;
  switch (issue._tag) {
    case "InvalidType":
      return getExpectedMessage(getExpected(issue.ast), issue);
    case "InvalidValue": {
      const expected = findExpected(issue);
      if (expected !== void 0) return getExpectedMessage(expected, issue);
      const input = formatInput(issue);
      return input === void 0 ? "Expected a valid value" : `Invalid data ${input}`;
    }
    case "MissingKey":
      return "Missing key";
    case "UnexpectedKey": {
      const input = formatInput(issue);
      return input === void 0 ? "Expected no excess property" : `Unexpected key with value ${input}`;
    }
    case "Forbidden":
      return "Forbidden operation";
    case "OneOf": {
      const input = formatInput(issue);
      return input === void 0 ? "Expected exactly one member to match" : `Expected exactly one member to match the input ${input}`;
    }
  }
};
var defaultCheckHook = (issue) => findMessage(issue.issue) ?? findMessage(issue);
function makeFormatterStandardSchemaV1(options2) {
  return (issue) => ({
    issues: toDefaultIssues(issue, [], options2?.leafHook ?? defaultLeafHook, options2?.checkHook ?? defaultCheckHook)
  });
}
function formatInput(issue) {
  return hasInput(issue) ? format(issue.input) : void 0;
}
function findExpected(issue) {
  const expected = issue.annotations?.expected;
  return typeof expected === "string" ? expected : void 0;
}
function getExpectedMessage(expected, issue) {
  const input = formatInput(issue);
  return input === void 0 ? `Expected ${expected}` : `Expected ${expected}, got ${input}`;
}
function toDefaultIssues(issue, path, leafHook, checkHook) {
  switch (issue._tag) {
    case "Filter": {
      const message = checkHook(issue);
      if (message !== void 0) {
        return [{
          path,
          message
        }];
      }
      if (issue.issue._tag !== "InvalidValue") {
        return toDefaultIssues(issue.issue, path, leafHook, checkHook);
      }
      const expected = findExpected(issue.issue);
      return [{
        path,
        message: expected === void 0 ? getExpectedMessage(formatCheck(issue.filter), issue) : getExpectedMessage(expected, issue.issue)
      }];
    }
    case "Encoding":
      return toDefaultIssues(issue.issue, path, leafHook, checkHook);
    case "Pointer":
      return toDefaultIssues(issue.issue, [...path, ...issue.path], leafHook, checkHook);
    case "Composite":
      return issue.issues.flatMap((issue2) => toDefaultIssues(issue2, path, leafHook, checkHook));
    case "AnyOf": {
      if (issue.issues.length === 0) {
        return [{
          path,
          message: findMessage(issue) ?? getExpectedMessage(getExpected(issue.ast), issue)
        }];
      }
      return issue.issues.flatMap((issue2) => toDefaultIssues(issue2, path, leafHook, checkHook));
    }
    default:
      return [{
        path,
        message: leafHook(issue)
      }];
  }
}
function formatCheck(check2) {
  const expected = check2.annotations?.expected;
  if (typeof expected === "string") return expected;
  switch (check2._tag) {
    case "Filter":
      return "<filter>";
    case "FilterGroup":
      return check2.checks.map((check3) => formatCheck(check3)).join(" & ");
  }
}
function makeFormatterDefault() {
  return (issue) => formatIssue(issue, "");
}
var defaultFormatter = /* @__PURE__ */ makeFormatterDefault();
function formatIssue(issue, path) {
  let message;
  switch (issue._tag) {
    case "Filter": {
      const annotated = defaultCheckHook(issue);
      if (annotated !== void 0) {
        message = annotated;
      } else {
        if (issue.issue._tag !== "InvalidValue") {
          return formatIssue(issue.issue, path);
        }
        const expected = findExpected(issue.issue);
        message = expected === void 0 ? getExpectedMessage(formatCheck(issue.filter), issue) : getExpectedMessage(expected, issue.issue);
      }
      break;
    }
    case "Encoding":
      return formatIssue(issue.issue, path);
    case "Pointer":
      return formatIssue(issue.issue, path + formatPath(issue.path));
    case "Composite":
    case "AnyOf": {
      if (issue._tag === "Composite" || issue.issues.length > 0) {
        return issue.issues.map((issue2) => formatIssue(issue2, path)).join("\n");
      }
      message = findMessage(issue) ?? getExpectedMessage(getExpected(issue.ast), issue);
      break;
    }
    default:
      message = defaultLeafHook(issue);
      break;
  }
  return path ? `${message}
  at ${path}` : message;
}
function findMessage(issue) {
  if (issue._tag === "Pointer") return;
  if (issue._tag === "Encoding") return findMessage(issue.issue);
  const annotations = issue._tag === "Filter" ? issue.filter.annotations : "annotations" in issue ? issue.annotations : issue.ast.annotations;
  const message = annotations?.[issue._tag === "MissingKey" ? "messageMissingKey" : issue._tag === "UnexpectedKey" ? "messageUnexpectedKey" : "message"];
  if (typeof message === "string") return message;
}

// node_modules/effect/dist/internal/schema/cause.js
function getSchemaIssue(cause) {
  let issue;
  for (const reason of cause.reasons) {
    if (!isFailReason2(reason) || !isIssue(reason.error)) {
      return void 0;
    }
    issue ??= reason.error;
  }
  return issue;
}
function getSchemaIssueOrThrow(cause, message) {
  const issue = getSchemaIssue(cause);
  if (issue === void 0) {
    throw new Error(message, {
      cause
    });
  }
  return issue;
}

// node_modules/effect/dist/SchemaGetter.js
var SchemaGetter_exports = {};
__export(SchemaGetter_exports, {
  BigInt: () => BigInt3,
  Boolean: () => Boolean3,
  Date: () => Date3,
  Getter: () => Getter,
  Number: () => Number4,
  String: () => String3,
  camelToSnake: () => camelToSnake2,
  capitalize: () => capitalize2,
  checkEffect: () => checkEffect,
  collectBracketPathEntries: () => collectBracketPathEntries,
  dateTimeUtcFromInput: () => dateTimeUtcFromInput,
  decodeBase64: () => decodeBase642,
  decodeBase64String: () => decodeBase64String2,
  decodeBase64Url: () => decodeBase64Url2,
  decodeBase64UrlString: () => decodeBase64UrlString2,
  decodeFormData: () => decodeFormData,
  decodeHex: () => decodeHex2,
  decodeHexString: () => decodeHexString2,
  decodeURLSearchParams: () => decodeURLSearchParams,
  decodeUriComponent: () => decodeUriComponent,
  encodeBase64: () => encodeBase642,
  encodeBase64Url: () => encodeBase64Url2,
  encodeFormData: () => encodeFormData,
  encodeHex: () => encodeHex2,
  encodeURLSearchParams: () => encodeURLSearchParams,
  encodeUriComponent: () => encodeUriComponent,
  fail: () => fail6,
  forbidden: () => forbidden,
  joinKeyValue: () => joinKeyValue,
  makeTreeRecord: () => makeTreeRecord,
  omit: () => omit,
  onNone: () => onNone,
  onSome: () => onSome,
  parseJson: () => parseJson,
  passthrough: () => passthrough2,
  passthroughSubtype: () => passthroughSubtype,
  passthroughSupertype: () => passthroughSupertype,
  required: () => required,
  snakeToCamel: () => snakeToCamel2,
  split: () => split,
  splitKeyValue: () => splitKeyValue,
  stringifyJson: () => stringifyJson,
  succeed: () => succeed8,
  toLowerCase: () => toLowerCase2,
  toUpperCase: () => toUpperCase2,
  transform: () => transform,
  transformOptional: () => transformOptional,
  transformOrFail: () => transformOrFail,
  trim: () => trim2,
  uncapitalize: () => uncapitalize2,
  withDefault: () => withDefault
});

// node_modules/effect/dist/DateTime.js
var DateTime_exports = {};
__export(DateTime_exports, {
  CurrentTimeZone: () => CurrentTimeZone,
  Equivalence: () => Equivalence4,
  Order: () => Order3,
  add: () => add3,
  addDuration: () => addDuration2,
  between: () => between2,
  clamp: () => clamp3,
  distance: () => distance2,
  endOf: () => endOf2,
  format: () => format4,
  formatIntl: () => formatIntl2,
  formatIso: () => formatIso2,
  formatIsoDate: () => formatIsoDate2,
  formatIsoDateUtc: () => formatIsoDateUtc2,
  formatIsoOffset: () => formatIsoOffset2,
  formatIsoZoned: () => formatIsoZoned2,
  formatLocal: () => formatLocal2,
  formatUtc: () => formatUtc2,
  fromDateUnsafe: () => fromDateUnsafe2,
  fromEpochSeconds: () => fromEpochSeconds2,
  getPart: () => getPart2,
  getPartUtc: () => getPartUtc2,
  isDateTime: () => isDateTime2,
  isFuture: () => isFuture2,
  isFutureUnsafe: () => isFutureUnsafe2,
  isGreaterThan: () => isGreaterThan4,
  isGreaterThanOrEqualTo: () => isGreaterThanOrEqualTo3,
  isLessThan: () => isLessThan4,
  isLessThanOrEqualTo: () => isLessThanOrEqualTo4,
  isPast: () => isPast2,
  isPastUnsafe: () => isPastUnsafe2,
  isTimeZone: () => isTimeZone2,
  isTimeZoneNamed: () => isTimeZoneNamed2,
  isTimeZoneOffset: () => isTimeZoneOffset2,
  isUtc: () => isUtc2,
  isZoned: () => isZoned2,
  layerCurrentZone: () => layerCurrentZone,
  layerCurrentZoneLocal: () => layerCurrentZoneLocal,
  layerCurrentZoneNamed: () => layerCurrentZoneNamed,
  layerCurrentZoneOffset: () => layerCurrentZoneOffset,
  make: () => make10,
  makeUnsafe: () => makeUnsafe5,
  makeZoned: () => makeZoned2,
  makeZonedFromString: () => makeZonedFromString2,
  makeZonedUnsafe: () => makeZonedUnsafe2,
  mapEpochMillis: () => mapEpochMillis2,
  match: () => match7,
  max: () => max4,
  min: () => min4,
  mutate: () => mutate2,
  mutateUtc: () => mutateUtc2,
  nearest: () => nearest2,
  now: () => now2,
  nowAsDate: () => nowAsDate2,
  nowInCurrentZone: () => nowInCurrentZone,
  nowUnsafe: () => nowUnsafe2,
  removeTime: () => removeTime2,
  setParts: () => setParts2,
  setPartsUtc: () => setPartsUtc2,
  setZone: () => setZone2,
  setZoneCurrent: () => setZoneCurrent,
  setZoneNamed: () => setZoneNamed2,
  setZoneNamedUnsafe: () => setZoneNamedUnsafe2,
  setZoneOffset: () => setZoneOffset2,
  startOf: () => startOf2,
  subtract: () => subtract3,
  subtractDuration: () => subtractDuration2,
  toDate: () => toDate2,
  toDateUtc: () => toDateUtc2,
  toEpochMillis: () => toEpochMillis2,
  toEpochSeconds: () => toEpochSeconds2,
  toParts: () => toParts2,
  toPartsUtc: () => toPartsUtc2,
  toUtc: () => toUtc2,
  withCurrentZone: () => withCurrentZone,
  withCurrentZoneLocal: () => withCurrentZoneLocal,
  withCurrentZoneNamed: () => withCurrentZoneNamed,
  withCurrentZoneOffset: () => withCurrentZoneOffset,
  withDate: () => withDate2,
  withDateUtc: () => withDateUtc2,
  zoneFromString: () => zoneFromString2,
  zoneMakeLocal: () => zoneMakeLocal2,
  zoneMakeNamed: () => zoneMakeNamed2,
  zoneMakeNamedEffect: () => zoneMakeNamedEffect2,
  zoneMakeNamedUnsafe: () => zoneMakeNamedUnsafe2,
  zoneMakeOffset: () => zoneMakeOffset2,
  zoneToString: () => zoneToString2,
  zonedOffset: () => zonedOffset2,
  zonedOffsetIso: () => zonedOffsetIso2
});
var isDateTime2 = isDateTime;
var isTimeZone2 = isTimeZone;
var isTimeZoneOffset2 = isTimeZoneOffset;
var isTimeZoneNamed2 = isTimeZoneNamed;
var isUtc2 = isUtc;
var isZoned2 = isZoned;
var Equivalence4 = Equivalence3;
var Order3 = Order2;
var clamp3 = clamp2;
var fromDateUnsafe2 = fromDateUnsafe;
var makeUnsafe5 = makeUnsafe4;
var fromEpochSeconds2 = fromEpochSeconds;
var makeZonedUnsafe2 = makeZonedUnsafe;
var makeZoned2 = makeZoned;
var make10 = make9;
var makeZonedFromString2 = makeZonedFromString;
var now2 = now;
var nowAsDate2 = nowAsDate;
var nowUnsafe2 = nowUnsafe;
var toUtc2 = toUtc;
var setZone2 = setZone;
var setZoneOffset2 = setZoneOffset;
var zoneMakeNamedUnsafe2 = zoneMakeNamedUnsafe;
var zoneMakeOffset2 = zoneMakeOffset;
var zoneMakeNamed2 = zoneMakeNamed;
var zoneMakeNamedEffect2 = zoneMakeNamedEffect;
var zoneMakeLocal2 = zoneMakeLocal;
var zoneFromString2 = zoneFromString;
var zoneToString2 = zoneToString;
var setZoneNamed2 = setZoneNamed;
var setZoneNamedUnsafe2 = setZoneNamedUnsafe;
var distance2 = distance;
var min4 = min2;
var max4 = max2;
var isGreaterThan4 = isGreaterThan3;
var isGreaterThanOrEqualTo3 = isGreaterThanOrEqualTo2;
var isLessThan4 = isLessThan3;
var isLessThanOrEqualTo4 = isLessThanOrEqualTo2;
var between2 = between;
var isFuture2 = isFuture;
var isFutureUnsafe2 = isFutureUnsafe;
var isPast2 = isPast;
var isPastUnsafe2 = isPastUnsafe;
var toDateUtc2 = toDateUtc;
var toDate2 = toDate;
var zonedOffset2 = zonedOffset;
var zonedOffsetIso2 = zonedOffsetIso;
var toEpochMillis2 = toEpochMillis;
var toEpochSeconds2 = toEpochSeconds;
var removeTime2 = removeTime;
var toParts2 = toParts;
var toPartsUtc2 = toPartsUtc;
var getPartUtc2 = getPartUtc;
var getPart2 = getPart;
var setParts2 = setParts;
var setPartsUtc2 = setPartsUtc;
var CurrentTimeZone = class extends (/* @__PURE__ */ Service()("effect/DateTime/CurrentTimeZone")) {
};
var setZoneCurrent = (self) => map7(CurrentTimeZone, (zone) => setZone2(self, zone));
var withCurrentZone = /* @__PURE__ */ provideService(CurrentTimeZone);
var withCurrentZoneLocal = (effect2) => provideServiceEffect2(effect2, CurrentTimeZone, sync3(zoneMakeLocal2));
var withCurrentZoneOffset = /* @__PURE__ */ dual(2, (effect2, offset) => provideService2(effect2, CurrentTimeZone, zoneMakeOffset2(offset)));
var withCurrentZoneNamed = /* @__PURE__ */ dual(2, (effect2, zone) => provideServiceEffect2(effect2, CurrentTimeZone, zoneMakeNamedEffect2(zone)));
var nowInCurrentZone = /* @__PURE__ */ flatMap4(now2, setZoneCurrent);
var mutate2 = mutate;
var mutateUtc2 = mutateUtc;
var mapEpochMillis2 = mapEpochMillis;
var withDate2 = withDate;
var withDateUtc2 = withDateUtc;
var match7 = match5;
var addDuration2 = addDuration;
var subtractDuration2 = subtractDuration;
var add3 = add2;
var subtract3 = subtract2;
var startOf2 = startOf;
var endOf2 = endOf;
var nearest2 = nearest;
var format4 = format3;
var formatLocal2 = formatLocal;
var formatUtc2 = formatUtc;
var formatIntl2 = formatIntl;
var formatIso2 = formatIso;
var formatIsoDate2 = formatIsoDate;
var formatIsoDateUtc2 = formatIsoDateUtc;
var formatIsoOffset2 = formatIsoOffset;
var formatIsoZoned2 = formatIsoZoned;
var layerCurrentZone = /* @__PURE__ */ succeed5(CurrentTimeZone);
var layerCurrentZoneOffset = (offset) => succeed5(CurrentTimeZone)(zoneMakeOffset(offset));
var layerCurrentZoneNamed = /* @__PURE__ */ flow(zoneMakeNamedEffect, /* @__PURE__ */ effect(CurrentTimeZone));
var layerCurrentZoneLocal = /* @__PURE__ */ sync2(CurrentTimeZone)(zoneMakeLocal2);

// node_modules/effect/dist/SchemaGetter.js
var Getter = class _Getter extends Class {
  run;
  constructor(run2) {
    super();
    this.run = run2;
  }
  map(f) {
    return new _Getter((oe, options2) => this.run(oe, options2).pipe(mapEager2(map(f))));
  }
  compose(other) {
    if (isPassthrough(this)) {
      return other;
    }
    if (isPassthrough(other)) {
      return this;
    }
    return new _Getter((oe, options2) => this.run(oe, options2).pipe(flatMapEager2((ot) => other.run(ot, options2))));
  }
};
function succeed8(t) {
  return new Getter(() => succeedSome2(t));
}
function fail6(f) {
  return new Getter((oe, options2) => fail5(f(oe, options2)));
}
function forbidden(message) {
  return fail6((oe, options2) => {
    const annotations = {
      message: message(oe)
    };
    return isSome2(oe) ? new Forbidden(annotations, oe.value, options2) : new Forbidden(annotations);
  });
}
var passthrough_ = /* @__PURE__ */ new Getter(succeed6);
function isPassthrough(getter) {
  return getter.run === passthrough_.run;
}
function passthrough2() {
  return passthrough_;
}
function passthroughSupertype() {
  return passthrough_;
}
function passthroughSubtype() {
  return passthrough_;
}
function onNone(f) {
  return new Getter((ot, options2) => isNone2(ot) ? f(options2) : succeed6(ot));
}
function required(annotations) {
  return onNone(() => fail5(new MissingKey(annotations)));
}
function onSome(f) {
  return new Getter((oe, options2) => isNone2(oe) ? succeedNone2 : f(oe.value, options2));
}
function checkEffect(f) {
  return onSome((t, options2) => {
    return f(t, options2).pipe(flatMapEager2((out) => {
      const issue = makeSingle(out, t, options2);
      return issue ? fail5(issue) : succeed6(some2(t));
    }));
  });
}
function transform(f) {
  return transformOptional(map(f));
}
function transformOrFail(f) {
  return onSome((e, options2) => f(e, options2).pipe(mapEager2(some2)));
}
function transformOptional(f) {
  return new Getter((oe) => succeed6(f(oe)));
}
function omit() {
  return new Getter(() => succeedNone2);
}
function withDefault(defaultValue) {
  return new Getter((o) => {
    const filtered = filter(o, isNotUndefined);
    return isSome2(filtered) ? succeed6(filtered) : mapEager2(defaultValue, some2);
  });
}
function String3() {
  return transform(globalThis.String);
}
function Number4() {
  return transform(globalThis.Number);
}
function Boolean3() {
  return transform(globalThis.Boolean);
}
function BigInt3() {
  return transform(globalThis.BigInt);
}
function Date3() {
  return transform((u) => new globalThis.Date(u));
}
function trim2() {
  return transform(trim);
}
function capitalize2() {
  return transform(capitalize);
}
function uncapitalize2() {
  return transform(uncapitalize);
}
function snakeToCamel2() {
  return transform(snakeToCamel);
}
function camelToSnake2() {
  return transform(camelToSnake);
}
function toLowerCase2() {
  return transform(toLowerCase);
}
function toUpperCase2() {
  return transform(toUpperCase);
}
function parseJson(options2) {
  return onSome((input, parseOptions) => try_3({
    try: () => some2(JSON.parse(input, options2?.reviver)),
    catch: () => new InvalidValue({
      expected: "a valid JSON string"
    }, input, parseOptions)
  }));
}
function stringifyJson(options2) {
  return onSome((input, parseOptions) => try_3({
    try: () => {
      const output = JSON.stringify(input, options2?.replacer, options2?.space);
      if (output === void 0) {
        throw new TypeError("Value cannot be represented as JSON");
      }
      return some2(output);
    },
    catch: () => new InvalidValue({
      expected: "a JSON-serializable value"
    }, input, parseOptions)
  }));
}
function splitKeyValue(options2) {
  const separator = options2?.separator ?? ",";
  const keyValueSeparator = options2?.keyValueSeparator ?? "=";
  return transform((input) => input.split(separator).reduce((acc, pair) => {
    const [key, value3] = pair.split(keyValueSeparator);
    if (key && value3) {
      assignProperty(acc, key, value3);
    }
    return acc;
  }, {}));
}
function joinKeyValue(options2) {
  const separator = options2?.separator ?? ",";
  const keyValueSeparator = options2?.keyValueSeparator ?? "=";
  return transform((input) => Object.entries(input).map(([key, value3]) => `${key}${keyValueSeparator}${value3}`).join(separator));
}
function split(options2) {
  const separator = options2?.separator ?? ",";
  return transform((input) => input === "" ? [] : input.split(separator));
}
function encodeBase642() {
  return transform(encodeBase64);
}
function encodeBase64Url2() {
  return transform(encodeBase64Url);
}
function encodeHex2() {
  return transform(encodeHex);
}
function decodeBase642() {
  return transformOrFail((input, options2) => mapErrorEager2(fromResult2(decodeBase64(input)), () => new InvalidValue({
    expected: "a valid Base64 string"
  }, input, options2)));
}
function decodeBase64String2() {
  return transformOrFail((input, options2) => match2(decodeBase64String(input), {
    onFailure: () => fail5(new InvalidValue({
      expected: "a valid Base64 string"
    }, input, options2)),
    onSuccess: succeed6
  }));
}
function decodeBase64Url2() {
  return transformOrFail((input, options2) => match2(decodeBase64Url(input), {
    onFailure: () => fail5(new InvalidValue({
      expected: "a valid Base64Url string"
    }, input, options2)),
    onSuccess: succeed6
  }));
}
function decodeBase64UrlString2() {
  return transformOrFail((input, options2) => match2(decodeBase64UrlString(input), {
    onFailure: () => fail5(new InvalidValue({
      expected: "a valid Base64Url string"
    }, input, options2)),
    onSuccess: succeed6
  }));
}
function decodeHex2() {
  return transformOrFail((input, options2) => match2(decodeHex(input), {
    onFailure: () => fail5(new InvalidValue({
      expected: "a valid hexadecimal string"
    }, input, options2)),
    onSuccess: succeed6
  }));
}
function decodeHexString2() {
  return transformOrFail((input, options2) => match2(decodeHexString(input), {
    onFailure: () => fail5(new InvalidValue({
      expected: "a valid hexadecimal string"
    }, input, options2)),
    onSuccess: succeed6
  }));
}
function encodeUriComponent() {
  return transform(encodeURIComponent);
}
function decodeUriComponent() {
  return transformOrFail((input, options2) => {
    try {
      return succeed6(globalThis.decodeURIComponent(input));
    } catch {
      return fail5(new InvalidValue({
        expected: "a valid URI component"
      }, input, options2));
    }
  });
}
function dateTimeUtcFromInput() {
  return transformOrFail((input, options2) => {
    return match(make10(input), {
      onNone: () => fail5(new InvalidValue({
        message: "Invalid DateTime input"
      }, input, options2)),
      onSome: (dt) => succeed6(toUtc2(dt))
    });
  });
}
function decodeFormData() {
  return transform((input) => makeTreeRecord(Array.from(input.entries())));
}
var collectFormDataEntries = /* @__PURE__ */ collectBracketPathEntries((value3) => typeof value3 === "string" || typeof Blob !== "undefined" && value3 instanceof Blob);
function encodeFormData() {
  return transform((input) => {
    const out = new FormData();
    if (typeof input === "object" && input !== null) {
      const entries3 = collectFormDataEntries(input);
      entries3.forEach(([key, value3]) => {
        out.append(key, value3);
      });
    }
    return out;
  });
}
function decodeURLSearchParams() {
  return transform((input) => makeTreeRecord(Array.from(input.entries())));
}
var collectURLSearchParamsEntries = /* @__PURE__ */ collectBracketPathEntries(isString);
function encodeURLSearchParams() {
  return transform((input) => {
    if (typeof input === "object" && input !== null) {
      return new URLSearchParams(collectURLSearchParamsEntries(input));
    }
    return new URLSearchParams();
  });
}
var INDEX_REGEXP = /^\d+$/;
function bracketPathToTokens(bracketPath) {
  if (bracketPath === "") {
    return [""];
  }
  const replaced = bracketPath.replace(/\[(.*?)\]/g, ".$1");
  const parts = replaced.split(".");
  const start = replaced.startsWith(".") ? 1 : 0;
  return parts.slice(start).map((part) => INDEX_REGEXP.test(part) ? globalThis.Number(part) : part);
}
function makeTreeRecord(bracketPathEntries) {
  const out = {};
  const containers = /* @__PURE__ */ new WeakSet();
  function getOrCreateContainer(self, key, shouldBeArray) {
    const current = Object.hasOwn(self, key) ? self[key] : void 0;
    if (containers.has(current) && Array.isArray(current) === shouldBeArray) {
      return current;
    }
    const container = shouldBeArray ? [] : {};
    containers.add(container);
    assignProperty(self, key, container);
    return container;
  }
  bracketPathEntries.forEach(([key, value3]) => {
    const tokens = bracketPathToTokens(key);
    let cur = out;
    tokens.forEach((token, i) => {
      const isLast = i === tokens.length - 1;
      if (Array.isArray(cur) && token === "") {
        if (isLast) {
          cur.push(value3);
        } else {
          const next = tokens[i + 1];
          const shouldBeArray = typeof next === "number" || next === "";
          const index2 = cur.length;
          cur = getOrCreateContainer(cur, index2, shouldBeArray);
        }
      } else if (isLast) {
        const hasOwn = Object.hasOwn(cur, token);
        if (hasOwn && Array.isArray(cur[token])) {
          cur[token].push(value3);
        } else if (hasOwn) {
          assignProperty(cur, token, [cur[token], value3]);
        } else {
          assignProperty(cur, token, value3);
        }
      } else {
        const next = tokens[i + 1];
        const shouldBeArray = typeof next === "number" || next === "";
        cur = getOrCreateContainer(cur, token, shouldBeArray);
      }
    });
  });
  return out;
}
function collectBracketPathEntries(isLeaf) {
  return (input) => {
    const bracketPathEntries = [];
    function append2(key, value3) {
      if (isLeaf(value3)) {
        bracketPathEntries.push([key, value3]);
      } else if (Array.isArray(value3)) {
        const allLeaves = value3.every(isLeaf);
        if (allLeaves) {
          value3.forEach((v) => {
            bracketPathEntries.push([key, v]);
          });
        } else {
          value3.forEach((v, i) => {
            append2(`${key}[${i}]`, v);
          });
        }
      } else if (typeof value3 === "object" && value3 !== null) {
        for (const [k, v] of Object.entries(value3)) {
          append2(`${key}[${k}]`, v);
        }
      }
    }
    for (const [key, value3] of Object.entries(input)) {
      append2(key, value3);
    }
    return bracketPathEntries;
  };
}

// node_modules/effect/dist/SchemaTransformation.js
var SchemaTransformation_exports = {};
__export(SchemaTransformation_exports, {
  Middleware: () => Middleware,
  Transformation: () => Transformation,
  bigDecimalFromString: () => bigDecimalFromString,
  bigintFromString: () => bigintFromString,
  capitalize: () => capitalize3,
  dateFromMillis: () => dateFromMillis,
  dateFromString: () => dateFromString,
  dateTimeUtcFromString: () => dateTimeUtcFromString,
  dateTimeZonedFromString: () => dateTimeZonedFromString,
  defectFromJson: () => defectFromJson,
  durationFromMillis: () => durationFromMillis,
  durationFromNanos: () => durationFromNanos,
  durationFromString: () => durationFromString,
  errorFromJsonError: () => errorFromJsonError,
  fromFormData: () => fromFormData,
  fromJsonString: () => fromJsonString,
  fromURLSearchParams: () => fromURLSearchParams,
  isTransformation: () => isTransformation,
  make: () => make11,
  numberFromString: () => numberFromString,
  optionFromNullOr: () => optionFromNullOr,
  optionFromNullishOr: () => optionFromNullishOr,
  optionFromOptional: () => optionFromOptional,
  optionFromOptionalKey: () => optionFromOptionalKey,
  optionFromUndefinedOr: () => optionFromUndefinedOr,
  passthrough: () => passthrough3,
  passthroughSubtype: () => passthroughSubtype2,
  passthroughSupertype: () => passthroughSupertype2,
  snakeToCamel: () => snakeToCamel3,
  splitKeyValue: () => splitKeyValue2,
  stringFromBase64String: () => stringFromBase64String,
  stringFromBase64UrlString: () => stringFromBase64UrlString,
  stringFromHexString: () => stringFromHexString,
  stringFromUriComponent: () => stringFromUriComponent,
  timeZoneFromString: () => timeZoneFromString,
  timeZoneNamedFromString: () => timeZoneNamedFromString,
  timeZoneOffsetFromNumber: () => timeZoneOffsetFromNumber,
  toLowerCase: () => toLowerCase3,
  toUpperCase: () => toUpperCase3,
  transform: () => transform2,
  transformOptional: () => transformOptional2,
  transformOrFail: () => transformOrFail2,
  trim: () => trim3,
  uint8ArrayFromBase64String: () => uint8ArrayFromBase64String,
  uncapitalize: () => uncapitalize3,
  urlFromString: () => urlFromString
});
var Middleware = class _Middleware {
  _tag = "Middleware";
  decode;
  encode;
  constructor(decode2, encode2) {
    this.decode = decode2;
    this.encode = encode2;
  }
  flip() {
    return new _Middleware(this.encode, this.decode);
  }
};
var TypeId15 = "~effect/SchemaTransformation/Transformation";
var Transformation = class _Transformation {
  [TypeId15] = TypeId15;
  _tag = "Transformation";
  decode;
  encode;
  constructor(decode2, encode2) {
    this.decode = decode2;
    this.encode = encode2;
  }
  flip() {
    return new _Transformation(this.encode, this.decode);
  }
  compose(other) {
    return new _Transformation(this.decode.compose(other.decode), other.encode.compose(this.encode));
  }
};
function isTransformation(u) {
  return hasProperty(u, TypeId15) && u[TypeId15] === TypeId15;
}
var make11 = (options2) => {
  if (isTransformation(options2)) {
    return options2;
  }
  return new Transformation(options2.decode, options2.encode);
};
function transformOrFail2(options2) {
  return new Transformation(transformOrFail(options2.decode), transformOrFail(options2.encode));
}
function transform2(options2) {
  return new Transformation(transform(options2.decode), transform(options2.encode));
}
function transformOptional2(options2) {
  return new Transformation(transformOptional(options2.decode), transformOptional(options2.encode));
}
function trim3() {
  return new Transformation(trim2(), passthrough2());
}
function snakeToCamel3() {
  return new Transformation(snakeToCamel2(), camelToSnake2());
}
function toLowerCase3() {
  return new Transformation(toLowerCase2(), passthrough2());
}
function toUpperCase3() {
  return new Transformation(toUpperCase2(), passthrough2());
}
function capitalize3() {
  return new Transformation(capitalize2(), passthrough2());
}
function uncapitalize3() {
  return new Transformation(uncapitalize2(), passthrough2());
}
function splitKeyValue2(options2) {
  return new Transformation(splitKeyValue(options2), joinKeyValue(options2));
}
var passthrough_2 = /* @__PURE__ */ new Transformation(/* @__PURE__ */ passthrough2(), /* @__PURE__ */ passthrough2());
function passthrough3() {
  return passthrough_2;
}
function passthroughSupertype2() {
  return passthrough_2;
}
function passthroughSubtype2() {
  return passthrough_2;
}
var numberFromString = /* @__PURE__ */ new Transformation(/* @__PURE__ */ Number4(), /* @__PURE__ */ String3());
var bigintFromString = /* @__PURE__ */ new Transformation(/* @__PURE__ */ BigInt3(), /* @__PURE__ */ String3());
var dateFromString = /* @__PURE__ */ new Transformation(/* @__PURE__ */ Date3(), /* @__PURE__ */ transform(formatDate));
var dateFromMillis = /* @__PURE__ */ new Transformation(/* @__PURE__ */ Date3(), /* @__PURE__ */ transform((date) => date.getTime()));
var durationFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options2) => match(fromInput(s), {
    onNone: () => fail5(new InvalidValue({
      expected: "a valid Duration string"
    }, s, options2)),
    onSome: succeed6
  }),
  encode: (duration) => succeed6(globalThis.String(duration))
});
var durationFromNanos = /* @__PURE__ */ transformOrFail2({
  decode: (i) => succeed6(nanos(i)),
  encode: (a, options2) => match(toNanos(a), {
    onNone: () => fail5(new InvalidValue({
      expected: "a Duration representable as a bigint"
    }, a, options2)),
    onSome: (nanos2) => succeed6(nanos2)
  })
});
var durationFromMillis = /* @__PURE__ */ transform2({
  decode: (i) => millis(i),
  encode: (a) => toMillis(a)
});
var isJsonError = (input) => isObject(input) && typeof input["message"] === "string";
var decodeJsonError = (input) => {
  const hasCause = Object.hasOwn(input, "cause");
  const err = hasCause ? new Error(input.message, {
    cause: decodeDefect(input.cause)
  }) : new Error(input.message);
  if (typeof input.name === "string" && input.name !== "Error") err.name = input.name;
  if (typeof input.stack === "string") err.stack = input.stack;
  return err;
};
var encodeUnknownAsJson = (input) => {
  try {
    const json = formatJson(input);
    return json === void 0 ? format(input) : JSON.parse(json);
  } catch {
    return format(input);
  }
};
var encodeJsonError = (input, options2, encodeDefect) => {
  const encoded = {
    name: input.name,
    message: typeof input.message === "string" ? input.message : ""
  };
  if (options2?.includeStack && typeof input.stack === "string") {
    encoded.stack = input.stack;
  }
  if (!options2?.excludeCause && input.cause !== void 0) {
    encoded.cause = encodeDefect(input.cause);
  }
  return encoded;
};
var makeEncodeDefect = (options2) => {
  const seen = /* @__PURE__ */ new WeakSet();
  const encode2 = (input) => {
    if (isError(input)) {
      if (seen.has(input)) {
        return "[Circular]";
      }
      seen.add(input);
      const encoded = encodeJsonError(input, options2, encode2);
      seen.delete(input);
      return encoded;
    }
    return encodeUnknownAsJson(input);
  };
  return encode2;
};
var decodeDefect = (input) => isJsonError(input) ? decodeJsonError(input) : input;
var errorFromJsonError = (options2) => transform2({
  decode: decodeJsonError,
  encode: (input) => makeEncodeDefect(options2)(input)
});
var defectFromJson = (options2) => transform2({
  decode: decodeDefect,
  encode: makeEncodeDefect(options2)
});
function optionFromNullOr() {
  return transform2({
    decode: fromNullOr,
    encode: getOrNull
  });
}
function optionFromUndefinedOr() {
  return transform2({
    decode: fromUndefinedOr,
    encode: getOrUndefined
  });
}
function optionFromNullishOr(options2) {
  return transform2({
    decode: fromNullishOr,
    encode: options2?.onNoneEncoding === null ? getOrNull : getOrUndefined
  });
}
function optionFromOptionalKey() {
  return transformOptional2({
    decode: some2,
    encode: flatten
  });
}
function optionFromOptional() {
  return transformOptional2({
    decode: (ot) => ot.pipe(filter(isNotUndefined), some2),
    encode: flatten
  });
}
var urlFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options2) => URL.canParse(s) ? succeed6(new URL(s)) : fail5(new InvalidValue({
    expected: "a valid URL string"
  }, s, options2)),
  encode: (url) => succeed6(url.href)
});
var bigDecimalFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options2) => {
    const result3 = fromString(s);
    return isNone2(result3) ? fail5(new InvalidValue({
      expected: "a valid BigDecimal string"
    }, s, options2)) : succeed6(result3.value);
  },
  encode: (bd) => succeed6(format2(bd))
});
var uint8ArrayFromBase64String = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeBase642(), /* @__PURE__ */ encodeBase642());
var stringFromBase64String = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeBase64String2(), /* @__PURE__ */ encodeBase642());
var stringFromBase64UrlString = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeBase64UrlString2(), /* @__PURE__ */ encodeBase64Url2());
var stringFromHexString = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeHexString2(), /* @__PURE__ */ encodeHex2());
var stringFromUriComponent = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeUriComponent(), /* @__PURE__ */ encodeUriComponent());
function fromJsonString(options2) {
  return new Transformation(parseJson(options2 ?? {}), stringifyJson(options2));
}
var fromFormData = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeFormData(), /* @__PURE__ */ encodeFormData());
var fromURLSearchParams = /* @__PURE__ */ new Transformation(/* @__PURE__ */ decodeURLSearchParams(), /* @__PURE__ */ encodeURLSearchParams());
var timeZoneOffsetFromNumber = /* @__PURE__ */ transform2({
  decode: (n) => zoneMakeOffset2(n),
  encode: (tz) => tz.offset
});
var timeZoneNamedFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options2) => {
    return match(zoneMakeNamed2(s), {
      onNone: () => fail5(new InvalidValue({
        expected: "a valid IANA time zone"
      }, s, options2)),
      onSome: succeed6
    });
  },
  encode: (tz) => succeed6(tz.id)
});
var timeZoneFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options2) => {
    return match(zoneFromString2(s), {
      onNone: () => fail5(new InvalidValue({
        expected: "a valid time zone"
      }, s, options2)),
      onSome: succeed6
    });
  },
  encode: (tz) => succeed6(zoneToString2(tz))
});
var dateTimeUtcFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options2) => {
    return match(make10(s), {
      onNone: () => fail5(new InvalidValue({
        expected: "a valid UTC DateTime string"
      }, s, options2)),
      onSome: (result3) => succeed6(toUtc2(result3))
    });
  },
  encode: (utc) => succeed6(formatIso2(utc))
});
var dateTimeZonedFromString = /* @__PURE__ */ transformOrFail2({
  decode: (s, options2) => {
    return match(makeZonedFromString2(s), {
      onNone: () => fail5(new InvalidValue({
        expected: "a valid Zoned DateTime string"
      }, s, options2)),
      onSome: succeed6
    });
  },
  encode: (zoned) => succeed6(formatIsoZoned2(zoned))
});

// node_modules/effect/dist/SchemaAST.js
function makeGuard(tag2) {
  return (ast) => ast._tag === tag2;
}
var isDeclaration = /* @__PURE__ */ makeGuard("Declaration");
var isNever2 = /* @__PURE__ */ makeGuard("Never");
var isLiteral = /* @__PURE__ */ makeGuard("Literal");
var isUniqueSymbol = /* @__PURE__ */ makeGuard("UniqueSymbol");
var isArrays = /* @__PURE__ */ makeGuard("Arrays");
var isObjects = /* @__PURE__ */ makeGuard("Objects");
var isUnion = /* @__PURE__ */ makeGuard("Union");
var isSuspend = /* @__PURE__ */ makeGuard("Suspend");
var Link = class {
  to;
  transformation;
  constructor(to, transformation) {
    this.to = to;
    this.transformation = transformation;
  }
};
var defaultParseOptions = {};
var Context = class {
  isOptional;
  isMutable;
  /** Used for constructor default values (e.g. `withConstructorDefault` API) */
  constructorDefault;
  annotations;
  constructor(isOptional2, isMutable2, constructorDefault = void 0, annotations = void 0) {
    this.isOptional = isOptional2;
    this.isMutable = isMutable2;
    this.constructorDefault = constructorDefault;
    this.annotations = annotations;
  }
};
var TypeId16 = "~effect/Schema";
var Base2 = class {
  [TypeId16] = TypeId16;
  annotations;
  checks;
  encoding;
  context;
  constructor(annotations = void 0, checks = void 0, encoding = void 0, context3 = void 0) {
    this.annotations = annotations;
    this.checks = checks;
    this.encoding = encoding;
    this.context = context3;
  }
  toString() {
    return `<${this._tag}>`;
  }
};
var Declaration = class _Declaration extends Base2 {
  _tag = "Declaration";
  typeParameters;
  run;
  encodingChecks;
  /**
   * Parser factory {@link flip} swaps in, so a declaration can behave
   * differently when encoding. `undefined` reuses {@link run}.
   */
  encodingRun;
  constructor(typeParameters, run2, annotations, checks, encoding, context3, encodingChecks, encodingRun) {
    super(annotations, checks, encoding, context3);
    this.typeParameters = typeParameters;
    this.run = run2;
    this.encodingChecks = encodingChecks;
    this.encodingRun = encodingRun;
  }
  /** @internal */
  getParser() {
    let run2;
    return (input, options2) => {
      if (input === missing) return missingExit;
      return (run2 ??= this.run(this.typeParameters))(input, this, options2);
    };
  }
  _rebuild(recur3, checks, encodingChecks, run2, encodingRun) {
    const tps = mapOrSame(this.typeParameters, recur3);
    return tps === this.typeParameters && checks === this.checks && encodingChecks === this.encodingChecks && run2 === this.run && encodingRun === this.encodingRun ? this : new _Declaration(tps, run2, this.annotations, checks, void 0, this.context, encodingChecks, encodingRun);
  }
  /** @internal */
  recur(recur3) {
    return this._rebuild(recur3, this.checks, this.encodingChecks, this.run, this.encodingRun);
  }
  /** @internal */
  flip(recur3) {
    return this._rebuild(recur3, this.encodingChecks, this.checks, this.encodingRun ?? this.run, this.run);
  }
  /** @internal */
  getExpected() {
    const expected = this.annotations?.expected;
    if (typeof expected === "string") return expected;
    return "<Declaration>";
  }
};
var Null = class extends Base2 {
  _tag = "Null";
  /** @internal */
  getParser() {
    return fromConst(this, null);
  }
  /** @internal */
  getExpected() {
    return "null";
  }
};
var null_ = /* @__PURE__ */ new Null();
var Undefined = class extends Base2 {
  _tag = "Undefined";
  /** @internal */
  getParser() {
    return fromConst(this, void 0);
  }
  /** @internal */
  toCodecJson() {
    return replaceEncoding(this, [undefinedToNull]);
  }
  /** @internal */
  getExpected() {
    return "undefined";
  }
};
var undefinedToNull = /* @__PURE__ */ new Link(null_, /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform(() => void 0), /* @__PURE__ */ transform(() => null)));
var undefined_3 = /* @__PURE__ */ new Undefined();
var Void = class extends Base2 {
  _tag = "Void";
  /** @internal */
  getParser() {
    const succeed9 = succeed7(void 0);
    return (input) => input === missing ? missingExit : succeed9;
  }
  /** @internal */
  toCodecJson() {
    return replaceEncoding(this, [undefinedToNull]);
  }
  /** @internal */
  getExpected() {
    return "void";
  }
};
var void_5 = /* @__PURE__ */ new Void();
var Never = class extends Base2 {
  _tag = "Never";
  /** @internal */
  getParser() {
    return fromRefinement(this, isNever);
  }
  /** @internal */
  getExpected() {
    return "never";
  }
};
var never3 = /* @__PURE__ */ new Never();
var Any = class extends Base2 {
  _tag = "Any";
  /** @internal */
  getParser() {
    return fromRefinement(this, isUnknown);
  }
  /** @internal */
  getExpected() {
    return "any";
  }
};
var any = /* @__PURE__ */ new Any();
var Unknown = class extends Base2 {
  _tag = "Unknown";
  /** @internal */
  getParser() {
    return fromRefinement(this, isUnknown);
  }
  /** @internal */
  getExpected() {
    return "unknown";
  }
};
var unknown = /* @__PURE__ */ new Unknown();
var ObjectKeyword = class extends Base2 {
  _tag = "ObjectKeyword";
  /** @internal */
  getParser() {
    return fromRefinement(this, isObjectKeyword);
  }
  /** @internal */
  getExpected() {
    return "object | array | function";
  }
};
var objectKeyword = /* @__PURE__ */ new ObjectKeyword();
var Enum = class extends Base2 {
  _tag = "Enum";
  enums;
  constructor(enums, annotations, checks, encoding, context3) {
    super(annotations, checks, encoding, context3);
    this.enums = enums;
  }
  /** @internal */
  getParser() {
    const values2 = new Set(this.enums.map(([, v]) => v));
    return fromRefinement(this, (input) => values2.has(input));
  }
  /** @internal */
  toCodecStringTree() {
    if (this.enums.some(([_, v]) => typeof v === "number")) {
      const coercions = Object.fromEntries(this.enums.map(([_, v]) => [globalThis.String(v), v]));
      return replaceEncoding(this, [new Link(new Union(Object.keys(coercions).map((k) => new Literal(k)), "anyOf"), new Transformation(transform((s) => coercions[s]), String3()))]);
    }
    return this;
  }
  /** @internal */
  getExpected() {
    return this.enums.map(([_, value3]) => JSON.stringify(value3)).join(" | ");
  }
};
function isTemplateLiteralPart(ast) {
  switch (ast._tag) {
    case "String":
    case "Number":
    case "BigInt":
      return true;
    case "Literal":
    case "TemplateLiteral":
      return !ast.checks;
    case "Union":
      return !ast.checks && ast.types.every(isTemplateLiteralPart);
    default:
      return false;
  }
}
var TemplateLiteral = class extends Base2 {
  _tag = "TemplateLiteral";
  parts;
  /** @internal */
  encodedParts;
  /** @internal */
  literals;
  /** @internal */
  suffixLengths;
  constructor(parts, annotations, checks, encoding, context3) {
    super(annotations, checks, encoding, context3);
    const encodedParts = [];
    const literals = [];
    for (const part of parts) {
      const encoded = toEncoded(part);
      if (isTemplateLiteralPart(encoded)) {
        encodedParts.push(encoded);
        literals.push(encoded._tag === "Literal" ? globalThis.String(encoded.literal) : void 0);
      } else {
        throw new Error(`Invalid TemplateLiteral part ${encoded._tag}`);
      }
    }
    const suffixLengths = new Array(encodedParts.length + 1);
    suffixLengths[encodedParts.length] = 0;
    for (let i = encodedParts.length - 1; i >= 0; i--) {
      suffixLengths[i] = suffixLengths[i + 1] + (literals[i]?.length ?? 0);
    }
    this.parts = parts;
    this.encodedParts = encodedParts;
    this.literals = literals;
    this.suffixLengths = suffixLengths;
  }
  /** @internal */
  getParser(compile) {
    const parser = compile(this.asTemplateLiteralParser());
    return (input, options2) => {
      if (input === missing) return missingExit;
      const result3 = parser(input, options2);
      if (result3._tag === "Success") {
        return sameExit;
      }
      return mapBothEager2(result3, {
        onSuccess: () => input,
        onFailure: (issue) => new Composite(this, [issue], input, options2)
      });
    };
  }
  /** @internal */
  getExpected() {
    return "string";
  }
  /** @internal */
  matchPart(s, options2) {
    return segmentTemplateLiteralParts(this, s, options2) === void 0 ? void 0 : s;
  }
  /** @internal */
  asTemplateLiteralParser() {
    const tuple2 = new Arrays(false, this.parts.map(partFromString), []);
    return decodeTo(string2, tuple2, new Transformation(transformOrFail((s, options2) => {
      const segments = segmentTemplateLiteralParts(this, s, options2);
      if (segments) return succeed6(segments);
      return fail5(new InvalidValue({
        expected: "a string matching template literal parts"
      }, s, options2));
    }), transform((parts) => parts.join(""))));
  }
};
var UniqueSymbol = class extends Base2 {
  _tag = "UniqueSymbol";
  symbol;
  constructor(symbol4, annotations, checks, encoding, context3) {
    super(annotations, checks, encoding, context3);
    this.symbol = symbol4;
  }
  /** @internal */
  getParser() {
    return fromConst(this, this.symbol);
  }
  /** @internal */
  toCodecStringTree() {
    return replaceEncoding(this, [symbolToString]);
  }
  /** @internal */
  getExpected() {
    return globalThis.String(this.symbol);
  }
};
var Literal = class extends Base2 {
  _tag = "Literal";
  literal;
  constructor(literal, annotations, checks, encoding, context3) {
    super(annotations, checks, encoding, context3);
    if (typeof literal === "number" && !globalThis.Number.isFinite(literal)) {
      throw new Error(`A numeric literal must be finite, got ${format(literal)}`);
    }
    this.literal = literal;
  }
  /** @internal */
  getParser() {
    return fromConst(this, this.literal);
  }
  /** @internal */
  matchPart(s, _options) {
    return s === globalThis.String(this.literal) ? this.literal : void 0;
  }
  /** @internal */
  toCodecJson() {
    return typeof this.literal === "bigint" ? literalToString(this) : this;
  }
  /** @internal */
  toCodecStringTree() {
    return typeof this.literal === "string" ? this : literalToString(this);
  }
  /** @internal */
  getExpected() {
    return typeof this.literal === "string" ? JSON.stringify(this.literal) : globalThis.String(this.literal);
  }
};
function literalToString(ast) {
  const literalAsString = globalThis.String(ast.literal);
  return replaceEncoding(ast, [new Link(new Literal(literalAsString), new Transformation(transform(() => ast.literal), transform(() => literalAsString)))]);
}
var String4 = class extends Base2 {
  _tag = "String";
  /** @internal */
  getParser() {
    return fromRefinement(this, isString);
  }
  /** @internal */
  matchPart(s, options2) {
    const checks = this.checks;
    return checks && !options2.disableChecks && collectIssues(checks, s, void 0, this, options2) ? void 0 : s;
  }
  /** @internal */
  getExpected() {
    return "string";
  }
};
var string2 = /* @__PURE__ */ new String4();
var Number5 = class extends Base2 {
  _tag = "Number";
  /** @internal */
  getParser() {
    return fromRefinement(this, isNumber);
  }
  /** @internal */
  matchKey(s, options2) {
    return this._match(isStringNumberRegExp, s, options2);
  }
  /** @internal */
  matchPart(s, options2) {
    return this._match(isStringFiniteRegExp, s, options2);
  }
  _match(regexp, s, options2) {
    if (!regexp.test(s)) return void 0;
    const value3 = globalThis.Number(s);
    if (options2.disableChecks || !this.checks) return value3;
    return collectIssues(this.checks, value3, void 0, this, options2) ? void 0 : value3;
  }
  /** @internal */
  toCodecJson() {
    if (this.checks && (hasCheck(this.checks, "effect/schema/isFinite") || hasCheck(this.checks, "effect/schema/isInt"))) {
      return this;
    }
    return replaceEncoding(this, [numberToJson]);
  }
  /** @internal */
  toCodecStringTree() {
    if (this.toCodecJson() === this) {
      return replaceEncoding(this, [finiteToString]);
    }
    return replaceEncoding(this, [numberToString]);
  }
  /** @internal */
  getExpected() {
    return "number";
  }
};
function hasCheck(checks, id2) {
  return checks.some((check2) => check2.annotations?.representation?.id === id2 || check2._tag === "FilterGroup" && hasCheck(check2.checks, id2));
}
var number2 = /* @__PURE__ */ new Number5();
var Boolean4 = class extends Base2 {
  _tag = "Boolean";
  /** @internal */
  getParser() {
    return fromRefinement(this, isBoolean);
  }
  /** @internal */
  getExpected() {
    return "boolean";
  }
};
var boolean = /* @__PURE__ */ new Boolean4();
var Symbol2 = class extends Base2 {
  _tag = "Symbol";
  /** @internal */
  getParser() {
    return fromRefinement(this, isSymbol);
  }
  /** @internal */
  matchKey(s, options2) {
    if (options2.disableChecks || !this.checks) return s;
    return collectIssues(this.checks, s, void 0, this, options2) ? void 0 : s;
  }
  /** @internal */
  toCodecStringTree() {
    return replaceEncoding(this, [symbolToString]);
  }
  /** @internal */
  getExpected() {
    return "symbol";
  }
};
var symbol3 = /* @__PURE__ */ new Symbol2();
var BigInt4 = class extends Base2 {
  _tag = "BigInt";
  /** @internal */
  getParser() {
    return fromRefinement(this, isBigInt);
  }
  /** @internal */
  matchPart(s, options2) {
    if (!isStringBigIntRegExp.test(s)) return void 0;
    const value3 = globalThis.BigInt(s);
    if (options2.disableChecks || !this.checks) return value3;
    return collectIssues(this.checks, value3, void 0, this, options2) ? void 0 : value3;
  }
  /** @internal */
  toCodecStringTree() {
    return replaceEncoding(this, [bigIntToString]);
  }
  /** @internal */
  getExpected() {
    return "bigint";
  }
};
var bigInt = /* @__PURE__ */ new BigInt4();
var Arrays = class _Arrays extends Base2 {
  _tag = "Arrays";
  isMutable;
  elements;
  rest;
  encodingChecks;
  constructor(isMutable2, elements, rest, annotations, checks, encoding, context3, encodingChecks) {
    super(annotations, checks, encoding, context3);
    this.isMutable = isMutable2;
    this.elements = elements;
    this.rest = rest;
    this.encodingChecks = encodingChecks;
    let hasOptional = false;
    for (let i = 0; i < elements.length; i++) {
      if (isOptional(elements[i])) {
        hasOptional = true;
      } else if (hasOptional) {
        throw new Error("A required element cannot follow an optional element. ts(1257)");
      }
    }
    if (hasOptional && rest.length > 1) {
      throw new Error("A required element cannot follow an optional element. ts(1257)");
    }
    for (let i = 1; i < rest.length; i++) {
      if (isOptional(rest[i])) {
        throw new Error("An optional element cannot follow a rest element. ts(1266)");
      }
    }
  }
  /** @internal */
  getParser(compile, compileConstructorDefault2 = compile) {
    const ast = this;
    let elements;
    let rest;
    const elementLen = ast.elements.length;
    const tailLen = Math.max(0, ast.rest.length - 1);
    function getParser(tailThreshold, index2) {
      if (index2 < elementLen) {
        return elements[index2];
      } else if (index2 >= tailThreshold) {
        return rest[index2 - tailThreshold + 1];
      }
      return rest[0];
    }
    return fnUntracedEager2(function* (input, options2) {
      if (input === missing) {
        return missing;
      }
      if (!Array.isArray(input)) {
        return yield* fail5(new InvalidType(ast, input, options2));
      }
      if (!elements) {
        elements = ast.elements.map((ast2) => ({
          ast: ast2,
          parser: compileConstructorDefault2(ast2)
        }));
        rest = ast.rest.map((ast2) => ({
          ast: ast2,
          parser: compileConstructorDefault2(ast2)
        }));
      }
      const len = input.length;
      const state = {
        ast,
        getParser,
        input,
        len,
        tailThreshold: Math.max(elementLen, len - tailLen),
        output: new globalThis.Array(len),
        issues: void 0,
        options: options2
      };
      const concurrency = resolveConcurrency(options2?.concurrency);
      const eff = parseArray(state, input, {
        concurrency: concurrency?.concurrency,
        end: ast.rest.length === 0 ? elementLen : Math.max(len, elementLen + tailLen)
      });
      if (eff) yield* eff;
      if (ast.rest.length === 0 && len > elementLen) {
        for (let i = elementLen; i <= len - 1; i++) {
          const unexpected = new UnexpectedKey(ast, input[i], options2);
          const issue = new Pointer([i], unexpected);
          if (options2.errors === "all") {
            if (state.issues) state.issues.push(issue);
            else state.issues = [issue];
          } else {
            return yield* fail5(new Composite(ast, [issue], input, options2));
          }
        }
      }
      if (state.issues) {
        return yield* fail5(new Composite(ast, state.issues, input, options2));
      }
      return state.output;
    });
  }
  _rebuild(recur3, checks, encodingChecks) {
    const elements = mapOrSame(this.elements, recur3);
    const rest = mapOrSame(this.rest, recur3);
    return elements === this.elements && rest === this.rest && checks === this.checks && encodingChecks === this.encodingChecks ? this : new _Arrays(this.isMutable, elements, rest, this.annotations, checks, void 0, this.context, encodingChecks);
  }
  /** @internal */
  recur(recur3) {
    return this._rebuild(recur3, this.checks, this.encodingChecks);
  }
  /** @internal */
  flip(recur3) {
    return this._rebuild(recur3, this.encodingChecks, this.checks);
  }
  /** @internal */
  getExpected() {
    return "array";
  }
};
var parseArray = /* @__PURE__ */ iterateEager()({
  onItem(s, item, i) {
    const value3 = i < s.len ? item : missing;
    return s.getParser(s.tailThreshold, i).parser(value3, s.options);
  },
  step(s, item, exit3, i) {
    if (exit3._tag === "Failure") {
      return wrapPropertyKeyIssue(s, s.ast, i, exit3);
    }
    const value3 = exit3 === sameExit ? item : exit3[args];
    if (value3 !== missing) {
      s.output[i] = value3;
    } else {
      const p = s.getParser(s.tailThreshold, i);
      if (isOptional(p.ast)) return;
      const issue = new Pointer([i], new MissingKey(p.ast.context?.annotations));
      if (s.options.errors === "all") {
        if (s.issues) s.issues.push(issue);
        else s.issues = [issue];
      } else {
        return fail4(new Composite(s.ast, [issue], s.input, s.options));
      }
    }
  }
});
var resolveConcurrency = (value3) => {
  value3 = value3 === "unbounded" ? Infinity : value3 ?? 1;
  return value3 > 1 ? {
    concurrency: value3
  } : void 0;
};
var wrapPropertyKeyIssue = (s, ast, key, exit3) => {
  if (exit3.cause.reasons.length === 0) {
    return exit3;
  }
  const issue = getSchemaIssue(exit3.cause);
  if (issue === void 0) {
    return failCause2(map6(exit3.cause, (issue2) => new Composite(ast, [new Pointer([key], issue2)], s.input, s.options)));
  }
  const pointer = new Pointer([key], issue);
  if (s.options.errors === "all") {
    if (s.issues) s.issues.push(pointer);
    else s.issues = [pointer];
  } else {
    return fail4(new Composite(ast, [pointer], s.input, s.options));
  }
};
var FINITE_PATTERN = "[+-]?\\d*\\.?\\d+(?:[Ee][+-]?\\d+)?";
function getIndexSignatureKeys(input, parameter, options2 = defaultParseOptions) {
  let stringKeys;
  let symbolKeys;
  function go(parameter2) {
    switch (parameter2._tag) {
      case "String":
      case "TemplateLiteral":
        return (stringKeys ??= Object.keys(input)).filter((k) => parameter2.matchPart(k, options2) !== void 0);
      case "Number":
        return (stringKeys ??= Object.keys(input)).filter((k) => parameter2.matchKey(k, options2) !== void 0);
      case "Symbol":
        return (symbolKeys ??= Object.getOwnPropertySymbols(input)).filter((k) => parameter2.matchKey(k, options2) !== void 0);
      case "Union":
        return [...new Set(parameter2.types.flatMap(go))];
      default:
        return [];
    }
  }
  return go(parameterFromPropertyKey(toEncoded(parameter)));
}
var PropertySignature = class {
  name;
  type;
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
};
function isIndexSignatureParameterSide(ast) {
  switch (ast._tag) {
    case "String":
    case "Number":
    case "Symbol":
    case "TemplateLiteral":
      return true;
    case "Union":
      return ast.types.every(isIndexSignatureParameterSide);
    default:
      return false;
  }
}
function isIndexSignatureParameter(ast) {
  return isIndexSignatureParameterSide(ast) && isIndexSignatureParameterSide(toEncoded(ast));
}
var IndexSignature = class {
  parameter;
  type;
  constructor(parameter, type) {
    if (!isIndexSignatureParameter(parameter)) {
      throw new Error(`Invalid index signature parameter ${parameter._tag}`);
    }
    this.parameter = parameter;
    this.type = type;
    if (isOptional(type) && !containsUndefined(type)) {
      throw new Error("Cannot use `Schema.optionalKey` with index signatures, use `Schema.optional` instead.");
    }
  }
};
var Objects = class _Objects extends Base2 {
  _tag = "Objects";
  propertySignatures;
  indexSignatures;
  encodingChecks;
  constructor(propertySignatures, indexSignatures, annotations, checks, encoding, context3, encodingChecks) {
    super(annotations, checks, encoding, context3);
    this.propertySignatures = propertySignatures;
    this.indexSignatures = indexSignatures;
    this.encodingChecks = encodingChecks;
    const duplicates = propertySignatures.map((ps) => ps.name).filter((name, i, arr) => arr.indexOf(name) !== i);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate identifiers: ${JSON.stringify(duplicates)}. ts(2300)`);
    }
  }
  /** @internal */
  getParser(compile, compileConstructorDefault2 = compile) {
    const ast = this;
    const expectedKeys = [];
    for (const ps of ast.propertySignatures) {
      expectedKeys.push(ps.name);
    }
    const hasProperties = expectedKeys.length;
    const indexCount = ast.indexSignatures.length;
    let expectedKeysSet = hasProperties && indexCount ? new Set(expectedKeys) : void 0;
    if (!hasProperties && !indexCount) {
      return fromRefinement(ast, isNotNullish);
    }
    let properties;
    let indexes;
    const finishIndex = (s, key, k2, inputValue, exitValue) => {
      if (exitValue._tag === "Failure") {
        return wrapPropertyKeyIssue(s, ast, key, exitValue) ?? void_3;
      }
      const value3 = exitValue === sameExit ? inputValue : exitValue[args];
      if (k2 !== missing && value3 !== missing) {
        if (hasProperties && (expectedKeysSet.has(key) || expectedKeysSet.has(k2))) return void_3;
        assignProperty(s.out, k2, value3);
      }
      return void_3;
    };
    const parseIndex = (s, key, index2, exitKey) => {
      if (!exitKey) {
        const eff = index2.parserKey(key, s.options);
        if (!effectIsExit(eff)) {
          return flatMap4(exit2(eff), (exit3) => parseIndex(s, key, index2, exit3));
        }
        exitKey = eff;
      }
      if (exitKey._tag === "Failure") {
        return wrapPropertyKeyIssue(s, ast, key, exitKey) ?? void_3;
      }
      const k2 = exitKey === sameExit ? key : exitKey[args];
      const inputValue = s.input[key];
      const result3 = index2.parserValue(inputValue, s.options);
      return effectIsExit(result3) ? finishIndex(s, key, k2, inputValue, result3) : flatMap4(exit2(result3), (exit3) => finishIndex(s, key, k2, inputValue, exit3));
    };
    const parseStringIndex = (s, key, index2) => {
      const inputValue = s.input[key];
      const result3 = index2.parserValue(inputValue, s.options);
      return effectIsExit(result3) ? finishIndex(s, key, key, inputValue, result3) : flatMap4(exit2(result3), (exit3) => finishIndex(s, key, key, inputValue, exit3));
    };
    const parseIndexes = indexCount ? iterateEager()({
      onItem: (s, [key, index2]) => parseIndex(s, key, index2),
      step: (_s, _, exit3) => exit3._tag === "Failure" ? exit3 : void 0
    }) : void 0;
    const compileMembers = () => {
      if (!properties) {
        properties = ast.propertySignatures.map((ps) => ({
          parser: compileConstructorDefault2(ps.type),
          name: ps.name,
          type: ps.type
        }));
        indexes = indexCount ? ast.indexSignatures.map((is3) => ({
          is: is3,
          parserKey: compile(parameterFromPropertyKey(is3.parameter)),
          parserValue: compileConstructorDefault2(is3.type)
        })) : void 0;
      }
      return properties;
    };
    const fallback = fnUntracedEager2(function* (input, options2) {
      if (input === missing) {
        return missing;
      }
      if (!(typeof input === "object" && input !== null && !Array.isArray(input))) {
        return yield* fail5(new InvalidType(ast, input, options2));
      }
      compileMembers();
      const record2 = input;
      const out = {};
      const state = {
        ast,
        input: record2,
        out,
        issues: void 0,
        options: options2
      };
      const errorsAllOption = options2.errors === "all";
      const onExcessPropertyError = options2.onExcessProperty === "error";
      const onExcessPropertyPreserve = options2.onExcessProperty === "preserve";
      let inputKeys;
      if (!indexCount && (onExcessPropertyError || onExcessPropertyPreserve)) {
        expectedKeysSet ??= new Set(expectedKeys);
        inputKeys = Reflect.ownKeys(record2);
        for (let i = 0; i < inputKeys.length; i++) {
          const key = inputKeys[i];
          if (!expectedKeysSet.has(key)) {
            if (onExcessPropertyError) {
              const unexpected = new UnexpectedKey(ast, record2[key], options2);
              const issue = new Pointer([key], unexpected);
              if (errorsAllOption) {
                if (state.issues) {
                  state.issues.push(issue);
                } else {
                  state.issues = [issue];
                }
                continue;
              } else {
                return yield* fail5(new Composite(ast, [issue], input, options2));
              }
            } else {
              assignProperty(out, key, record2[key]);
            }
          }
        }
      }
      const concurrency = resolveConcurrency(options2?.concurrency);
      if (hasProperties) {
        const eff = parseProperties(state, properties, concurrency);
        if (eff) yield* eff;
      }
      if (indexCount && !concurrency) {
        for (let i = 0; i < indexCount; i++) {
          const index2 = indexes[i];
          const parse = index2.is.parameter === string2 ? parseStringIndex : parseIndex;
          const keys4 = index2.is.parameter === string2 ? Object.keys(record2) : getIndexSignatureKeys(record2, index2.is.parameter, options2);
          for (let j = 0; j < keys4.length; j++) {
            const eff = parse(state, keys4[j], index2);
            if (!effectIsExit(eff)) yield* eff;
            else if (eff._tag === "Failure") return yield* eff;
          }
        }
      } else if (parseIndexes) {
        const keyPairs = empty();
        for (let i = 0; i < indexCount; i++) {
          const index2 = indexes[i];
          const keys4 = getIndexSignatureKeys(record2, index2.is.parameter, options2);
          for (let j = 0; j < keys4.length; j++) {
            keyPairs.push([keys4[j], index2]);
          }
        }
        const eff = parseIndexes(state, keyPairs, concurrency);
        if (eff) yield* eff;
      }
      if (state.issues) {
        return yield* fail5(new Composite(ast, state.issues, input, options2));
      }
      if (options2.propertyOrder === "original") {
        const keys4 = (inputKeys ?? Reflect.ownKeys(record2)).concat(expectedKeys);
        const preserved = {};
        for (const key of keys4) {
          if (Object.hasOwn(out, key)) {
            assignProperty(preserved, key, out[key]);
          }
        }
        return preserved;
      }
      return out;
    });
    if (indexCount) return fallback;
    const resume = (state, index2, pending) => {
      const property = properties[index2];
      return flatMap4(exit2(pending), (exit3) => {
        const terminal = stepProperty(state, property, exit3);
        if (terminal) return terminal;
        const done4 = () => succeed7(state.out);
        const eff = parseProperties(state, properties.slice(index2 + 1));
        return eff ? flatMapEager2(eff, done4) : done4();
      });
    };
    return (input, options2) => {
      if (input === missing) return missingExit;
      if (options2.errors === "all" || options2.onExcessProperty !== void 0 || options2.propertyOrder === "original" || options2.concurrency !== void 0) {
        return fallback(input, options2);
      }
      if (!(typeof input === "object" && input !== null && !Array.isArray(input))) {
        return fail5(new InvalidType(ast, input, options2));
      }
      const props = compileMembers();
      const record2 = input;
      const out = {};
      const state = {
        ast,
        input: record2,
        out,
        issues: void 0,
        options: options2
      };
      try {
        for (let index2 = 0; index2 < props.length; index2++) {
          const property = props[index2];
          const name = property.name;
          const hasKey = Object.hasOwn(record2, name);
          const value3 = hasKey ? record2[name] : missing;
          const exit3 = property.parser(value3, options2);
          if (!effectIsExit(exit3)) {
            return resume(state, index2, exit3);
          }
          if (exit3 === sameExit) {
            if (hasKey) assignProperty(out, name, value3);
            continue;
          }
          const terminal = stepProperty(state, property, exit3);
          if (terminal) return terminal;
        }
      } catch (error) {
        return die2(error);
      }
      return succeed7(out);
    };
  }
  _rebuild(recur3, recurParameter, checks, encodingChecks) {
    const props = mapOrSame(this.propertySignatures, (ps) => {
      const t = recur3(ps.type);
      return t === ps.type ? ps : new PropertySignature(ps.name, t);
    });
    const indexes = mapOrSame(this.indexSignatures, (is3) => {
      const p = recurParameter(is3.parameter);
      const t = recur3(is3.type);
      return p === is3.parameter && t === is3.type ? is3 : new IndexSignature(p, t);
    });
    return props === this.propertySignatures && indexes === this.indexSignatures && checks === this.checks && encodingChecks === this.encodingChecks ? this : new _Objects(props, indexes, this.annotations, checks, void 0, this.context, encodingChecks);
  }
  /** @internal */
  flip(recur3) {
    return this._rebuild(recur3, recur3, this.encodingChecks, this.checks);
  }
  /** @internal */
  recur(recur3, recurParameter = recur3) {
    return this._rebuild(recur3, recurParameter, this.checks, this.encodingChecks);
  }
  /** @internal */
  getExpected() {
    if (this.propertySignatures.length === 0 && this.indexSignatures.length === 0) return "object | array";
    return "object";
  }
};
function stepProperty(s, p, exit3) {
  if (exit3._tag === "Failure") {
    return wrapPropertyKeyIssue(s, s.ast, p.name, exit3);
  }
  if (exit3 === sameExit) return;
  const value3 = exit3[args];
  if (value3 !== missing) {
    assignProperty(s.out, p.name, value3);
    return;
  }
  delete s.out[p.name];
  if (!isOptional(p.type)) {
    const issue = new Pointer([p.name], new MissingKey(p.type.context?.annotations));
    if (s.options.errors === "all") {
      if (s.issues) s.issues.push(issue);
      else s.issues = [issue];
      return;
    } else {
      return fail4(new Composite(s.ast, [issue], s.input, s.options));
    }
  }
}
var parseProperties = /* @__PURE__ */ iterateEager()({
  onItem(s, p) {
    if (!Object.hasOwn(s.input, p.name)) {
      return p.parser(missing, s.options);
    }
    const value3 = s.input[p.name];
    assignProperty(s.out, p.name, value3);
    return p.parser(value3, s.options);
  },
  step: stepProperty
});
function combineChecks(a, b) {
  if (!a) return b;
  if (!b) return a;
  return [...a, ...b];
}
function struct(fields, checks, annotations) {
  return new Objects(Reflect.ownKeys(fields).map((key) => {
    return new PropertySignature(key, fields[key].ast);
  }), [], annotations, checks);
}
function getAST(self) {
  return self.ast;
}
function tuple(elements, checks = void 0) {
  return new Arrays(false, elements.map((e) => e.ast), [], void 0, checks);
}
function union2(members, mode, checks) {
  return new Union(members.map(getAST), mode, void 0, checks);
}
function structWithRest(ast, records) {
  if (ast.encoding || records.some((r) => r.encoding)) {
    throw new Error("StructWithRest does not support encodings");
  }
  let propertySignatures = ast.propertySignatures;
  let indexSignatures = ast.indexSignatures;
  let checks = ast.checks;
  for (const record2 of records) {
    propertySignatures = propertySignatures.concat(record2.propertySignatures);
    indexSignatures = indexSignatures.concat(record2.indexSignatures);
    checks = combineChecks(checks, record2.checks);
  }
  return new Objects(propertySignatures, indexSignatures, void 0, checks);
}
function tupleWithRest(ast, rest) {
  if (ast.encoding) {
    throw new Error("TupleWithRest does not support encodings");
  }
  return new Arrays(ast.isMutable, ast.elements, rest, void 0, ast.checks);
}
var toCandidate = /* @__PURE__ */ memoizeIdempotent((ast) => {
  while (true) {
    if (isSuspend(ast)) return unknown;
    const encoding = ast.encoding;
    if (!encoding) {
      return ast.recur?.(toCandidate, identity) ?? ast;
    }
    if (encoding.some((link2) => link2.transformation._tag === "Middleware" && link2.transformation.decode !== identity)) return unknown;
    ast = encoding[encoding.length - 1].to;
  }
});
function getCandidateTypes(ast) {
  switch (ast._tag) {
    case "Null":
      return ["null"];
    case "Undefined":
      return ["undefined"];
    case "String":
    case "TemplateLiteral":
      return ["string"];
    case "Number":
      return ["number"];
    case "Boolean":
      return ["boolean"];
    case "Symbol":
    case "UniqueSymbol":
      return ["symbol"];
    case "BigInt":
      return ["bigint"];
    case "Arrays":
      return ["array"];
    case "ObjectKeyword":
      return ["object", "array", "function"];
    case "Objects":
      return ast.propertySignatures.length || ast.indexSignatures.length ? ["object"] : ["string", "number", "boolean", "symbol", "bigint", "object", "array", "function"];
    case "Enum":
      return Array.from(new Set(ast.enums.map(([, v]) => typeof v)));
    case "Literal":
      return [typeof ast.literal];
    case "Union":
      return Array.from(new Set(ast.types.flatMap(getCandidateTypes)));
    default:
      return ["null", "undefined", "string", "number", "boolean", "symbol", "bigint", "object", "array", "function"];
  }
}
function collectSentinels(ast) {
  switch (ast._tag) {
    default:
      return [];
    case "Declaration": {
      const s = ast.annotations?.[SENTINELS_ANNOTATION_KEY];
      return Array.isArray(s) ? s : [];
    }
    case "Objects":
      return ast.propertySignatures.flatMap((ps) => {
        const type = ps.type;
        if (!isOptional(type)) {
          if (isLiteral(type)) {
            return [{
              key: ps.name,
              literal: type.literal
            }];
          }
          if (isUniqueSymbol(type)) {
            return [{
              key: ps.name,
              literal: type.symbol
            }];
          }
        }
        return [];
      });
    case "Arrays":
      return ast.elements.flatMap((e, i) => {
        if (!isOptional(e)) {
          if (isLiteral(e)) {
            return [{
              key: i,
              literal: e.literal
            }];
          }
          if (isUniqueSymbol(e)) {
            return [{
              key: i,
              literal: e.symbol
            }];
          }
        }
        return [];
      });
    case "Union": {
      if (ast.types.length === 0) return [];
      const members = ast.types.map((type) => collectSentinels(toCandidate(type)));
      return members[0].filter((s) => members.every((sentinels) => sentinels.some((o) => o.key === s.key && o.literal === s.literal)));
    }
    case "Suspend":
      return collectSentinels(ast.thunk());
  }
}
var candidateIndexCache = /* @__PURE__ */ new WeakMap();
var emptyCandidates = /* @__PURE__ */ Object.freeze([]);
function getIndex(types) {
  let index2 = candidateIndexCache.get(types);
  if (index2) return index2;
  let bySentinel;
  let sentinelCandidateCount = 0;
  let otherwise;
  let literalCandidates;
  let onlyLiterals = true;
  for (let i = 0; i < types.length; i++) {
    const a = types[i];
    const encoded = toCandidate(a);
    if (isNever2(encoded)) continue;
    if (onlyLiterals) {
      if (isLiteral(encoded) || isUniqueSymbol(encoded)) {
        literalCandidates ??= /* @__PURE__ */ new Map();
        const literal = isLiteral(encoded) ? encoded.literal : encoded.symbol;
        let arr = literalCandidates.get(literal);
        if (!arr) literalCandidates.set(literal, arr = []);
        arr.push(a);
      } else {
        onlyLiterals = false;
      }
    }
    const sentinels = collectSentinels(encoded);
    if (sentinels.length) {
      bySentinel ??= /* @__PURE__ */ new Map();
      sentinelCandidateCount++;
      for (const {
        key,
        literal
      } of sentinels) {
        let entry = bySentinel.get(key);
        if (!entry) bySentinel.set(key, entry = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Set()]);
        entry[1].add(i);
        let indexes = entry[0].get(literal);
        if (!indexes) entry[0].set(literal, indexes = /* @__PURE__ */ new Set());
        indexes.add(i);
      }
    } else {
      otherwise ??= {};
      const candidateTypes = getCandidateTypes(encoded);
      for (const t of candidateTypes) (otherwise[t] ??= []).push(i);
    }
  }
  if (onlyLiterals && literalCandidates) {
    literalCandidates.forEach(Object.freeze);
    index2 = (input) => literalCandidates.get(input) ?? emptyCandidates;
  } else if (bySentinel?.size === 1 && !otherwise) {
    const [key, [byValue]] = bySentinel.entries().next().value;
    const candidates = byValue;
    for (const [literal, indexes] of byValue) {
      candidates.set(literal, Object.freeze(Array.from(indexes, (index3) => types[index3])));
    }
    index2 = (input, isConstructor) => {
      if (isObjectKeyword(input)) {
        const value3 = Object.hasOwn(input, key) ? input[key] : void 0;
        if (value3 !== void 0) return candidates.get(value3) ?? emptyCandidates;
        if (isConstructor) return types;
      }
      return emptyCandidates;
    };
  } else if (bySentinel) {
    let commonSentinel;
    for (const entry of bySentinel) {
      if ((!commonSentinel || entry[1][0].size > commonSentinel[1][0].size) && entry[1][1].size === sentinelCandidateCount) {
        commonSentinel = entry;
      }
    }
    index2 = (input, isConstructor) => {
      const runtimeType = input === null ? "null" : Array.isArray(input) ? "array" : typeof input;
      const base2 = otherwise?.[runtimeType] ?? emptyCandidates;
      if (!isObjectKeyword(input)) return base2.map((i) => types[i]);
      const selected = new Set(base2);
      let directKey;
      if (commonSentinel) {
        const [key, [byValue]] = commonSentinel;
        const hasKey = Object.hasOwn(input, key);
        const value3 = hasKey ? input[key] : void 0;
        if (hasKey && (!isConstructor || value3 !== void 0)) {
          const match8 = byValue.get(value3);
          if (!match8) return base2.map((i) => types[i]);
          for (const i of match8) selected.add(i);
          directKey = key;
        }
      }
      if (directKey === void 0) {
        for (const [key, [byValue, all4]] of bySentinel) {
          const hasKey = Object.hasOwn(input, key);
          const value3 = hasKey ? input[key] : void 0;
          if (hasKey && (!isConstructor || value3 !== void 0)) {
            const match8 = byValue.get(value3);
            if (match8) {
              for (const i of match8) selected.add(i);
            }
          } else if (isConstructor) {
            for (const i of all4) selected.add(i);
          }
        }
      }
      for (const [key, [byValue, all4]] of bySentinel) {
        if (key === directKey) continue;
        const hasKey = Object.hasOwn(input, key);
        const value3 = hasKey ? input[key] : void 0;
        if (hasKey && (!isConstructor || value3 !== void 0)) {
          const match8 = byValue.get(value3);
          for (const i of selected) {
            if (all4.has(i) && !match8?.has(i)) selected.delete(i);
          }
        }
      }
      return Array.from(selected).sort((a, b) => a - b).map((i) => types[i]);
    };
  } else {
    index2 = (input) => {
      const runtimeType = input === null ? "null" : Array.isArray(input) ? "array" : typeof input;
      return (otherwise?.[runtimeType] ?? emptyCandidates).map((i) => types[i]).filter(filterLiterals(input));
    };
  }
  candidateIndexCache.set(types, index2);
  return index2;
}
function filterLiterals(input) {
  return (ast) => {
    const encoded = toCandidate(ast);
    return encoded._tag === "Literal" ? encoded.literal === input : encoded._tag === "UniqueSymbol" ? encoded.symbol === input : true;
  };
}
function getCandidates(input, types, isConstructor = false) {
  return getIndex(types)(input, isConstructor);
}
var Union = class _Union extends Base2 {
  _tag = "Union";
  types;
  mode;
  encodingChecks;
  constructor(types, mode, annotations, checks, encoding, context3, encodingChecks) {
    super(annotations, checks, encoding, context3);
    this.types = types;
    this.mode = mode;
    this.encodingChecks = encodingChecks;
  }
  /** @internal */
  getParser(compile, compileConstructorDefault2) {
    const ast = this;
    return (input, options2) => {
      if (input === missing) {
        return missingExit;
      }
      const candidates = getCandidates(input, ast.types, compileConstructorDefault2 !== void 0);
      if (candidates.length === 1) {
        const result3 = compile(candidates[0])(input, options2);
        if (result3._tag === "Success") return result3;
        return effectIsExit(result3) ? failSingleUnionCandidate(ast, result3.cause, input, options2) : catchCause2(result3, (cause) => failSingleUnionCandidate(ast, cause, input, options2));
      }
      const state = {
        ast,
        compile,
        input,
        out: void 0,
        successes: ast.mode === "oneOf" ? [] : void 0,
        issues: void 0,
        options: options2
      };
      const concurrency = resolveConcurrency(options2?.concurrency);
      const eff = parseUnion(state, candidates, concurrency ? {
        ...concurrency,
        orderedStep: true
      } : void 0);
      if (!eff) {
        if (state.out) return state.out;
        return fail5(new AnyOf(ast, state.issues ?? [], input, options2));
      }
      return flatMapEager2(eff, (_) => {
        if (state.out === sameExit) return succeed6(input);
        if (state.out) return state.out;
        return fail5(new AnyOf(ast, state.issues ?? [], input, options2));
      });
    };
  }
  _rebuild(recur3, checks, encodingChecks) {
    const types = mapOrSame(this.types, recur3);
    return types === this.types && checks === this.checks && encodingChecks === this.encodingChecks ? this : new _Union(types, this.mode, this.annotations, checks, void 0, this.context, encodingChecks);
  }
  /** @internal */
  recur(recur3) {
    return this._rebuild(recur3, this.checks, this.encodingChecks);
  }
  /** @internal */
  flip(recur3) {
    return this._rebuild(recur3, this.encodingChecks, this.checks);
  }
  /** @internal */
  matchPart(s, options2) {
    for (const type of this.types) {
      const out = type.matchPart(s, options2);
      if (out !== void 0) return out;
    }
    return void 0;
  }
  /** @internal */
  getExpected(getExpected2) {
    const expected = this.annotations?.expected;
    if (typeof expected === "string") return expected;
    if (this.types.length === 0) return "never";
    const types = this.types.map((type) => {
      const encoded = toEncoded(type);
      switch (encoded._tag) {
        case "Arrays": {
          const literals = encoded.elements.filter(isLiteral);
          if (literals.length > 0) {
            return `${formatIsMutable(encoded.isMutable)}[ ${literals.map((e) => getExpected2(e) + formatIsOptional(e.context?.isOptional)).join(", ")}, ... ]`;
          }
          break;
        }
        case "Objects": {
          const literals = encoded.propertySignatures.filter((ps) => isLiteral(ps.type));
          if (literals.length > 0) {
            return `{ ${literals.map((ps) => `${formatIsMutable(ps.type.context?.isMutable)}${formatPropertyKey(ps.name)}${formatIsOptional(ps.type.context?.isOptional)}: ${getExpected2(ps.type)}`).join(", ")}, ... }`;
          }
          break;
        }
      }
      return getExpected2(encoded);
    });
    return Array.from(new Set(types)).join(" | ");
  }
};
function failSingleUnionCandidate(ast, cause, input, options2) {
  const issue = getSchemaIssue(cause);
  if (!issue) return failCause2(cause);
  return fail4(new AnyOf(ast, [issue], input, options2));
}
var parseUnion = /* @__PURE__ */ iterateEager()({
  onItem(s, ast) {
    const parser = s.compile(ast);
    return parser(s.input, s.options);
  },
  step(s, candidate, exit3) {
    if (exit3._tag === "Failure") {
      const issue = getSchemaIssue(exit3.cause);
      if (issue === void 0) {
        return exit3;
      }
      if (s.issues) s.issues.push(issue);
      else s.issues = [issue];
    } else {
      if (s.out && s.successes) {
        s.successes.push(candidate);
        return fail4(new OneOf(s.ast, s.successes, s.input, s.options));
      }
      s.out = exit3;
      if (s.successes) {
        s.successes.push(candidate);
      } else {
        return void_3;
      }
    }
  }
});
var nonFiniteLiterals = /* @__PURE__ */ new Union([/* @__PURE__ */ new Literal("Infinity"), /* @__PURE__ */ new Literal("-Infinity"), /* @__PURE__ */ new Literal("NaN")], "anyOf");
function formatIsMutable(isMutable2) {
  return isMutable2 ? "" : "readonly ";
}
function formatIsOptional(isOptional2) {
  return isOptional2 ? "?" : "";
}
function memoizeThunk(f) {
  let done4 = false;
  let a;
  return () => {
    if (done4) {
      return a;
    }
    a = f();
    done4 = true;
    return a;
  };
}
var Suspend = class _Suspend extends Base2 {
  _tag = "Suspend";
  thunk;
  constructor(thunk, annotations, checks, encoding, context3) {
    if (checks) {
      throw new Error("Cannot add checks to Suspend");
    }
    super(annotations, void 0, encoding, context3);
    this.thunk = memoizeThunk(thunk);
  }
  /** @internal */
  getParser(compile) {
    let parser;
    return (input, options2) => (parser ??= compile(this.thunk()))(input, options2);
  }
  /** @internal */
  recur(recur3) {
    return new _Suspend(() => recur3(this.thunk()), this.annotations, void 0, void 0, this.context);
  }
  /** @internal */
  getExpected(getExpected2) {
    return getExpected2(this.thunk());
  }
};
var Filter2 = class _Filter extends Class {
  _tag = "Filter";
  run;
  annotations;
  /**
   * Whether the parsing process should be aborted after this check has failed.
   */
  aborted;
  constructor(run2, annotations = void 0, aborted = false) {
    super();
    this.run = run2;
    this.annotations = annotations;
    this.aborted = aborted;
  }
  annotate(annotations) {
    return new _Filter(this.run, {
      ...this.annotations,
      ...annotations
    }, this.aborted);
  }
  abort() {
    return new _Filter(this.run, this.annotations, true);
  }
  and(other, annotations) {
    return new FilterGroup([this, other], annotations);
  }
};
var FilterGroup = class _FilterGroup extends Class {
  _tag = "FilterGroup";
  checks;
  annotations;
  constructor(checks, annotations = void 0) {
    super();
    this.checks = checks;
    this.annotations = annotations;
  }
  annotate(annotations) {
    return new _FilterGroup(this.checks, {
      ...this.annotations,
      ...annotations
    });
  }
  and(other, annotations) {
    return new _FilterGroup([this, other], annotations);
  }
};
function makeFilter(filter8, annotations, aborted = false) {
  return new Filter2((input, ast, options2) => normalizeFilterOutput(ast, filter8(input, ast, options2), input, options2), annotations, aborted);
}
function makeFilterByGuard(is3, annotations) {
  return new Filter2(
    (input, _ast, options2) => is3(input) ? void 0 : new InvalidValue(void 0, input, options2),
    annotations,
    true
    // after a guard, we always want to abort
  );
}
function isFinite(annotations) {
  return makeFilter((n) => globalThis.Number.isFinite(n), {
    expected: "a finite number",
    representation: {
      id: "effect/schema/isFinite",
      payload: null
    },
    toJsonSchema: () => ({
      type: "number"
    }),
    toCode: () => ({
      runtime: "Schema.isFinite()"
    }),
    arbitrary: {
      constraint: {
        noInfinity: true,
        noNaN: true
      }
    },
    ...annotations
  });
}
var finite = /* @__PURE__ */ appendChecks(number2, [/* @__PURE__ */ isFinite()]);
var numberToJson = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union([finite, nonFiniteLiterals], "anyOf"), /* @__PURE__ */ new Transformation(/* @__PURE__ */ Number4(), /* @__PURE__ */ transform((n) => globalThis.Number.isFinite(n) ? n : globalThis.String(n))));
function isPattern(regExp, annotations) {
  const source = regExp.source;
  const pattern = new globalThis.RegExp(source, regExp.flags);
  return makeFilter((s) => {
    pattern.lastIndex = 0;
    return pattern.test(s);
  }, {
    expected: `a string matching the RegExp ${source}`,
    representation: {
      id: "effect/schema/isPattern",
      payload: {
        source,
        flags: regExp.flags
      }
    },
    toJsonSchema: () => ({
      pattern: source
    }),
    arbitrary: {
      constraint: {
        patterns: [regExp.source]
      }
    },
    ...annotations
  });
}
function modifyOwnPropertyDescriptors(ast, f) {
  const d = Object.getOwnPropertyDescriptors(ast);
  f(d);
  return Object.create(Object.getPrototypeOf(ast), d);
}
var contextOwners = /* @__PURE__ */ new WeakMap();
function getContextOwner(ast) {
  return contextOwners.get(ast) ?? ast;
}
function replaceEncoding(ast, encoding) {
  if (ast.encoding === encoding) {
    return ast;
  }
  return modifyOwnPropertyDescriptors(ast, (d) => {
    d.encoding.value = encoding;
  });
}
function replaceContext(ast, context3) {
  if (ast.context === context3) {
    return ast;
  }
  const owner = getContextOwner(ast);
  if (owner.context === context3) {
    return owner;
  }
  const out = modifyOwnPropertyDescriptors(ast, (d) => {
    d.context.value = context3;
  });
  contextOwners.set(out, owner);
  return out;
}
function getLastEncoding(ast) {
  return ast.encoding ? getLastEncoding(ast.encoding[ast.encoding.length - 1].to) : ast;
}
function annotate(ast, annotations) {
  if (ast.checks) {
    const last = ast.checks[ast.checks.length - 1];
    return replaceChecks(ast, append(ast.checks.slice(0, -1), last.annotate(annotations)));
  }
  return modifyOwnPropertyDescriptors(ast, (d) => {
    d.annotations.value = {
      ...d.annotations.value,
      ...annotations
    };
  });
}
function replaceChecks(ast, checks) {
  if (ast._tag === "Suspend" && checks) {
    throw new Error("Cannot add checks to Suspend");
  }
  if (ast.checks === checks) {
    return ast;
  }
  return modifyOwnPropertyDescriptors(ast, (d) => {
    d.checks.value = checks;
  });
}
function appendChecks(ast, checks) {
  return replaceChecks(ast, combineChecks(ast.checks, checks));
}
function mapLink(link2, f) {
  const to = f(link2.to);
  return to === link2.to ? link2 : new Link(to, link2.transformation);
}
function updateLastLink(encoding, f) {
  const links = encoding;
  const last = links[links.length - 1];
  const out = mapLink(last, f);
  return out === last ? encoding : append(encoding.slice(0, encoding.length - 1), out);
}
function applyToLastLink(f) {
  return (ast) => ast.encoding ? replaceEncoding(ast, updateLastLink(ast.encoding, f)) : ast;
}
function replaceContextLastLink(ast, context3) {
  return applyToLastLink((ast2) => replaceContext(ast2, context3))(ast);
}
function applyToSelfOrLastLinkEncodingIdempotent(f, options2) {
  function out(ast) {
    if (ast.encoding) {
      const last = ast.encoding[ast.encoding.length - 1];
      return options2?.stopAt?.(last) ? ast : replaceEncoding(ast, updateLastLink(ast.encoding, out));
    }
    return f(ast);
  }
  return memoizeIdempotent(out);
}
function middlewareDecoding(ast, middleware) {
  return appendTransformation(ast, middleware, toType(ast));
}
function middlewareEncoding(ast, middleware) {
  return appendTransformation(toEncoded(ast), middleware, ast);
}
function appendTransformation(from, transformation, to) {
  const link2 = new Link(from, transformation);
  return replaceEncoding(to, to.encoding ? [...to.encoding, link2] : [link2]);
}
function brand(ast, brand3) {
  const existing = resolveBrands(ast);
  const brands = existing ? [...existing, brand3] : [brand3];
  return annotate(ast, {
    brands
  });
}
function mapOrSame(as4, f) {
  let changed = false;
  const out = new Array(as4.length);
  for (let i = 0; i < as4.length; i++) {
    const a = as4[i];
    const fa = f(a);
    if (fa !== a) {
      changed = true;
    }
    out[i] = fa;
  }
  return changed ? out : as4;
}
function annotateKey(ast, annotations) {
  const context3 = ast.context ? new Context(ast.context.isOptional, ast.context.isMutable, ast.context.constructorDefault, {
    ...ast.context.annotations,
    ...annotations
  }) : new Context(false, false, void 0, annotations);
  return replaceContext(ast, context3);
}
var optionalKey = /* @__PURE__ */ memoizeIdempotent((ast) => {
  const context3 = ast.context ? ast.context.isOptional === false ? new Context(true, ast.context.isMutable, ast.context.constructorDefault, ast.context.annotations) : ast.context : new Context(true, false);
  return optionalKeyLastLink(replaceContext(ast, context3));
});
var optionalKeyLastLink = /* @__PURE__ */ applyToLastLink(optionalKey);
var optional = /* @__PURE__ */ memoize((ast) => optionalKey(new Union([ast, undefined_3], "anyOf")));
var mutableKey = /* @__PURE__ */ memoizeIdempotent((ast) => {
  const context3 = ast.context ? ast.context.isMutable === false ? new Context(ast.context.isOptional, true, ast.context.constructorDefault, ast.context.annotations) : ast.context : new Context(false, true);
  return mutableKeyLastLink(replaceContext(ast, context3));
});
var mutableKeyLastLink = /* @__PURE__ */ applyToLastLink(mutableKey);
function withConstructorDefault(ast, defaultValue) {
  const transformation = new Transformation(withDefault(defaultValue), passthrough2());
  const constructorDefault = new Link(unknown, transformation);
  const context3 = ast.context ? new Context(ast.context.isOptional, ast.context.isMutable, constructorDefault, ast.context.annotations) : new Context(false, false, constructorDefault);
  return replaceContext(ast, context3);
}
function decodeTo(from, to, transformation) {
  return appendTransformation(from, transformation, to);
}
function parseParameter(ast) {
  const literals = [];
  const parameters = [];
  function go(ast2) {
    switch (ast2._tag) {
      case "Literal":
        if (isPropertyKey(ast2.literal)) {
          literals.push(ast2.literal);
        }
        return;
      case "UniqueSymbol":
        literals.push(ast2.symbol);
        return;
      case "Never":
        return;
      case "Union":
        for (let i = 0; i < ast2.types.length; i++) {
          go(ast2.types[i]);
        }
        return;
      default:
        parameters.push(ast2);
    }
  }
  go(ast);
  return {
    literals,
    parameters
  };
}
function record(key, value3) {
  const {
    literals,
    parameters: indexSignatures
  } = parseParameter(key);
  return new Objects(literals.map((literal) => new PropertySignature(literal, value3)), indexSignatures.map((parameter) => new IndexSignature(parameter, value3)));
}
function isOptional(ast) {
  return ast.context?.isOptional ?? false;
}
function isMutable(ast) {
  return ast.context?.isMutable ?? false;
}
function isStructuralCheck(check2) {
  return check2.annotations?.[STRUCTURAL_ANNOTATION_KEY] === true || check2._tag === "FilterGroup" && check2.checks.every(isStructuralCheck);
}
function extractStructuralChecks(checks) {
  function extract(check2) {
    if (isStructuralCheck(check2)) return [check2];
    return check2._tag === "FilterGroup" ? check2.checks.flatMap(extract) : [];
  }
  const out = checks.flatMap(extract);
  return isArrayNonEmpty2(out) ? out : void 0;
}
var toType = /* @__PURE__ */ memoizeIdempotent((ast) => {
  if (ast.encoding) {
    return toType(replaceEncoding(ast, void 0));
  }
  const out = ast;
  const type = out.recur?.(toType) ?? out;
  const encodingChecks = type.encodingChecks;
  if (encodingChecks) {
    const checks = type === ast ? encodingChecks : isArrays(type) || isObjects(type) || isDeclaration(type) && type.typeParameters.length > 0 ? extractStructuralChecks(encodingChecks) : void 0;
    return modifyOwnPropertyDescriptors(type, (d) => {
      d.encodingChecks.value = void 0;
      d.checks.value = combineChecks(type.checks, checks);
    });
  }
  return type;
});
var toEncoded = /* @__PURE__ */ memoizeIdempotent((ast) => {
  return toType(flip3(ast));
});
function flipEncoding(ast, encoding) {
  const links = encoding;
  const len = links.length;
  const last = links[len - 1];
  const ls = [new Link(flip3(replaceEncoding(ast, void 0)), links[0].transformation.flip())];
  for (let i = 1; i < len; i++) {
    ls.unshift(new Link(flip3(links[i - 1].to), links[i].transformation.flip()));
  }
  const to = flip3(last.to);
  if (to.encoding) {
    return replaceEncoding(to, [...to.encoding, ...ls]);
  } else {
    return replaceEncoding(to, ls);
  }
}
var flip3 = /* @__PURE__ */ memoize((ast) => {
  if (ast.encoding) {
    return flipEncoding(ast, ast.encoding);
  }
  const out = ast;
  return out.flip?.(flip3) ?? out.recur?.(flip3) ?? out;
});
function containsUndefined(ast) {
  switch (ast._tag) {
    case "Undefined":
      return true;
    case "Union":
      return ast.types.some(containsUndefined);
    default:
      return false;
  }
}
function fromConst(ast, value3) {
  const succeed9 = succeed7(value3);
  return (input, options2) => {
    if (input === missing) return missingExit;
    if (input === value3) return succeed9;
    return fail5(new InvalidType(ast, input, options2));
  };
}
function fromRefinement(ast, refinement) {
  return (input, options2) => {
    if (input === missing) return missingExit;
    if (refinement(input)) return sameExit;
    return fail5(new InvalidType(ast, input, options2));
  };
}
function segmentTemplateLiteralParts(ast, input, options2) {
  const parts = ast.encodedParts;
  const literals = ast.literals;
  const inputLength = input.length;
  for (let i = 0; i < literals.length; i++) {
    const literal = literals[i];
    if (literal && !input.includes(literal)) return void 0;
  }
  if (ast.suffixLengths[0] > inputLength) return void 0;
  const out = new Array(parts.length);
  let failures;
  function go(i, pos) {
    if (i === parts.length) return pos === inputLength;
    if (failures?.has(i * (inputLength + 1) + pos)) return false;
    const part = parts[i];
    if (i === parts.length - 1) {
      const s = input.slice(pos);
      if (part.matchPart(s, options2) !== void 0) {
        out[i] = s;
        return true;
      }
    } else if (part._tag === "Literal") {
      const s = literals[i];
      if (input.startsWith(s, pos) && go(i + 1, pos + s.length)) {
        out[i] = s;
        return true;
      }
    } else {
      const maximumEnd = inputLength - ast.suffixLengths[i + 1];
      const anchor = literals[i + 1];
      let end = anchor === void 0 ? maximumEnd : input.lastIndexOf(anchor, maximumEnd);
      while (end >= pos) {
        const s = input.slice(pos, end);
        if (part.matchPart(s, options2) !== void 0 && go(i + 1, end)) {
          out[i] = s;
          return true;
        }
        if (end === 0) break;
        end = anchor === void 0 ? end - 1 : input.lastIndexOf(anchor, end - 1);
      }
    }
    failures ??= /* @__PURE__ */ new Set();
    failures.add(i * (inputLength + 1) + pos);
    return false;
  }
  return go(0, 0) ? out : void 0;
}
var enumsToLiterals = /* @__PURE__ */ memoize((ast) => {
  return new Union(ast.enums.map((e) => new Literal(e[1], {
    title: e[0]
  })), "anyOf");
});
var parameterFromPropertyKey = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  switch (ast._tag) {
    default:
      return ast;
    case "Number":
      return ast.toCodecStringTree();
    case "Union":
      return ast.recur(parameterFromPropertyKey);
  }
});
var parameterFromString = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  switch (ast._tag) {
    default:
      return ast;
    case "Symbol":
    case "UniqueSymbol":
      return ast.toCodecStringTree();
    case "Union":
      return ast.recur(parameterFromString);
  }
});
var partFromString = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  switch (ast._tag) {
    default:
      return ast;
    case "Number":
    case "Literal":
    case "BigInt":
      return ast.toCodecStringTree();
    case "Union":
      return ast.recur(partFromString);
  }
});
var STRING_PATTERN = "[\\s\\S]*?";
var isStringFiniteRegExp = /* @__PURE__ */ new globalThis.RegExp(`^${FINITE_PATTERN}$`);
var isStringNumberRegExp = /* @__PURE__ */ new globalThis.RegExp(`^(?:${FINITE_PATTERN}|Infinity|-Infinity|NaN)$`);
function isStringFinite(annotations) {
  return isPattern(isStringFiniteRegExp, {
    expected: "a string representing a finite number",
    representation: {
      id: "effect/schema/isStringFinite",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: isStringFiniteRegExp.source
    }),
    ...annotations
  });
}
var finiteString = /* @__PURE__ */ appendChecks(string2, [/* @__PURE__ */ isStringFinite()]);
var finiteToString = /* @__PURE__ */ new Link(finiteString, numberFromString);
var numberToString = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union([finiteString, nonFiniteLiterals], "anyOf"), numberFromString);
var BIGINT_PATTERN = "-?\\d+";
var isStringBigIntRegExp = /* @__PURE__ */ new globalThis.RegExp(`^${BIGINT_PATTERN}$`);
function isStringBigInt(annotations) {
  return isPattern(isStringBigIntRegExp, {
    expected: "a string representing a bigint",
    representation: {
      id: "effect/schema/isStringBigInt",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: isStringBigIntRegExp.source
    }),
    ...annotations
  });
}
var bigIntString = /* @__PURE__ */ appendChecks(string2, [/* @__PURE__ */ isStringBigInt({
  expected: "a string representing a bigint"
})]);
var bigIntToString = /* @__PURE__ */ new Link(bigIntString, bigintFromString);
var REGEXP_PATTERN = "Symbol\\((.*)\\)";
var isStringSymbolRegExp = /* @__PURE__ */ new globalThis.RegExp(`^${REGEXP_PATTERN}$`);
var symbolString = /* @__PURE__ */ appendChecks(string2, [/* @__PURE__ */ isStringSymbol()]);
var symbolToString = /* @__PURE__ */ new Link(symbolString, /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform((description) => globalThis.Symbol.for(isStringSymbolRegExp.exec(description)[1])), /* @__PURE__ */ transformOrFail((sym, options2) => {
  const key = globalThis.Symbol.keyFor(sym);
  if (key !== void 0) {
    return succeed6(globalThis.String(sym));
  }
  return fail5(new Forbidden({
    message: "cannot serialize to string, Symbol is not registered"
  }, sym, options2));
})));
function isStringSymbol(annotations) {
  return isPattern(isStringSymbolRegExp, {
    expected: "a string representing a symbol",
    representation: {
      id: "effect/schema/isStringSymbol",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: isStringSymbolRegExp.source
    }),
    ...annotations
  });
}
function collectIssues(checks, value3, issues, ast, options2) {
  for (let i = 0; i < checks.length; i++) {
    const check2 = checks[i];
    if (check2._tag === "FilterGroup") {
      issues = collectIssues(check2.checks, value3, issues, ast, options2);
      if (issues && (options2.errors !== "all" || issues[issues.length - 1].filter.aborted)) {
        return issues;
      }
    } else {
      const issue = check2.run(value3, ast, options2);
      if (issue) {
        const filter8 = new Filter(check2, issue, value3, options2);
        if (issues) issues.push(filter8);
        else issues = [filter8];
        if (options2.errors !== "all" || check2.aborted) {
          return issues;
        }
      }
    }
  }
  return issues;
}
function runChecks(checks, s) {
  const issues = collectIssues(checks, s, void 0, unknown, {
    errors: "all"
  });
  if (issues) {
    const issue = new Composite(unknown, issues);
    return fail2(issue);
  }
  return succeed2(s);
}
function getConstructorDescriptor(ast) {
  if (!isDeclaration(ast)) return void 0;
  const getDescriptor = ast.annotations?.[CONSTRUCTOR_ANNOTATION_KEY];
  return isFunction(getDescriptor) ? getDescriptor(ast.typeParameters) : void 0;
}
function isJsonLeaf(u) {
  return u === null || typeof u === "string" || typeof u === "boolean" || typeof u === "number" && globalThis.Number.isFinite(u);
}
function isStringTreeLeaf(u) {
  return u === void 0 || typeof u === "string";
}
function isTree(u, isLeaf) {
  const cache = /* @__PURE__ */ new WeakMap();
  const stack = [];
  outer: while (true) {
    if (typeof u !== "object" || u === null) {
      if (!isLeaf(u)) {
        return false;
      }
    } else {
      const value3 = u;
      const cached3 = cache.get(value3);
      if (cached3 === false) {
        return false;
      }
      if (cached3 === void 0) {
        const isArray2 = Array.isArray(value3);
        if (!isArray2) {
          const prototype = Object.getPrototypeOf(value3);
          if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
            return false;
          }
        }
        cache.set(value3, false);
        stack.push({
          value: value3,
          keys: isArray2 ? value3.length : Object.keys(value3),
          index: 0
        });
      }
    }
    while (stack.length > 0) {
      const frame = stack[stack.length - 1];
      const keys4 = frame.keys;
      if (typeof keys4 === "number") {
        if (frame.index < keys4) {
          u = frame.value[frame.index++];
          continue outer;
        }
      } else if (frame.index < keys4.length) {
        u = frame.value[keys4[frame.index++]];
        continue outer;
      }
      cache.set(frame.value, true);
      stack.pop();
    }
    return true;
  }
}
function isJson(u) {
  return isTree(u, isJsonLeaf);
}
var Json = /* @__PURE__ */ new Declaration([], () => (input, ast, options2) => isJson(input) ? sameExit : fail5(new InvalidType(ast, input, options2)), {
  representation: {
    id: "effect/schema/Json",
    payload: null
  },
  expected: "JSON value",
  toCodecJson: () => void 0,
  toCodecStringTree: () => unknownToStringTree,
  toArbitrary: () => (fc) => fc.jsonValue()
});
var MutableJson = /* @__PURE__ */ annotate(Json, {
  representation: {
    id: "effect/schema/MutableJson",
    payload: null
  }
});
var unknownToJson = /* @__PURE__ */ new Link(Json, /* @__PURE__ */ passthrough3());
var objectKeywordToJson = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union([/* @__PURE__ */ new Arrays(false, [], [Json]), /* @__PURE__ */ new Objects([], [/* @__PURE__ */ new IndexSignature(string2, Json)])], "anyOf"), /* @__PURE__ */ passthrough3());
function isStringTree(u) {
  return isTree(u, isStringTreeLeaf);
}
var StringTree = /* @__PURE__ */ new Declaration([], () => (input, ast, options2) => isStringTree(input) ? sameExit : fail5(new InvalidType(ast, input, options2)), {
  expected: "StringTree",
  toCodecStringTree: () => void 0
});
var unknownToStringTree = /* @__PURE__ */ new Link(StringTree, /* @__PURE__ */ passthrough3());

// node_modules/effect/dist/Chunk.js
var TypeId17 = "~effect/collections/Chunk";
function copy(src, srcPos, dest, destPos, len) {
  for (let i = srcPos; i < Math.min(src.length, srcPos + len); i++) {
    dest[destPos + i - srcPos] = src[i];
  }
  return dest;
}
var emptyArray = [];
var makeEquivalence3 = (isEquivalent) => make2((self, that) => self.length === that.length && toReadonlyArray(self).every((value3, i) => isEquivalent(value3, getUnsafe2(that, i))));
var _equivalence = /* @__PURE__ */ makeEquivalence3(equals);
var ChunkProto = {
  [TypeId17]: {
    _A: (_) => _
  },
  toString() {
    return `Chunk(${format(toReadonlyArray(this))})`;
  },
  toJSON() {
    return {
      _id: "Chunk",
      values: toJson(toReadonlyArray(this))
    };
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  [symbol2](that) {
    return isChunk(that) && _equivalence(this, that);
  },
  [symbol]() {
    return array(toReadonlyArray(this));
  },
  [Symbol.iterator]() {
    switch (this.backing._tag) {
      case "IArray": {
        return this.backing.array[Symbol.iterator]();
      }
      case "IEmpty": {
        return emptyArray[Symbol.iterator]();
      }
      default: {
        return toReadonlyArray(this)[Symbol.iterator]();
      }
    }
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var makeChunk = (backing) => {
  const chunk = Object.create(ChunkProto);
  chunk.backing = backing;
  switch (backing._tag) {
    case "IEmpty": {
      chunk.length = 0;
      chunk.depth = 0;
      chunk.left = chunk;
      chunk.right = chunk;
      break;
    }
    case "IConcat": {
      chunk.length = backing.left.length + backing.right.length;
      chunk.depth = 1 + Math.max(backing.left.depth, backing.right.depth);
      chunk.left = backing.left;
      chunk.right = backing.right;
      break;
    }
    case "IArray": {
      chunk.length = backing.array.length;
      chunk.depth = 0;
      chunk.left = _empty;
      chunk.right = _empty;
      break;
    }
    case "ISingleton": {
      chunk.length = 1;
      chunk.depth = 0;
      chunk.left = _empty;
      chunk.right = _empty;
      break;
    }
    case "ISlice": {
      chunk.length = backing.length;
      chunk.depth = backing.chunk.depth + 1;
      chunk.left = _empty;
      chunk.right = _empty;
      break;
    }
  }
  return chunk;
};
var isChunk = (u) => hasProperty(u, TypeId17);
var _empty = /* @__PURE__ */ makeChunk({
  _tag: "IEmpty"
});
var empty4 = () => _empty;
var of = (a) => makeChunk({
  _tag: "ISingleton",
  a
});
var fromIterable3 = (self) => isChunk(self) ? self : fromArrayUnsafe(fromIterable2(self));
var copyToArray = (self, array3, initial) => {
  switch (self.backing._tag) {
    case "IArray": {
      copy(self.backing.array, 0, array3, initial, self.length);
      break;
    }
    case "IConcat": {
      copyToArray(self.left, array3, initial);
      copyToArray(self.right, array3, initial + self.left.length);
      break;
    }
    case "ISingleton": {
      array3[initial] = self.backing.a;
      break;
    }
    case "ISlice": {
      let i = 0;
      let j = initial;
      while (i < self.length) {
        array3[j] = getUnsafe2(self, i);
        i += 1;
        j += 1;
      }
      break;
    }
  }
};
var toReadonlyArray_ = (self) => {
  switch (self.backing._tag) {
    case "IEmpty": {
      return emptyArray;
    }
    case "IArray": {
      return self.backing.array;
    }
    default: {
      const arr = new Array(self.length);
      copyToArray(self, arr, 0);
      self.backing = {
        _tag: "IArray",
        array: arr
      };
      self.left = _empty;
      self.right = _empty;
      self.depth = 0;
      return arr;
    }
  }
};
var toReadonlyArray = toReadonlyArray_;
var fromArrayUnsafe = (self) => self.length === 0 ? empty4() : self.length === 1 ? of(self[0]) : makeChunk({
  _tag: "IArray",
  array: self
});
var getUnsafe2 = /* @__PURE__ */ dual(2, (self, index2) => {
  const i = Math.floor(index2);
  switch (self.backing._tag) {
    case "IEmpty": {
      throw new Error(`Index out of bounds: ${i}`);
    }
    case "ISingleton": {
      if (index2 !== 0) {
        throw new Error(`Index out of bounds: ${i}`);
      }
      return self.backing.a;
    }
    case "IArray": {
      if (i >= self.length || i < 0) {
        throw new Error(`Index out of bounds: ${i}`);
      }
      return self.backing.array[i];
    }
    case "IConcat": {
      return i < self.left.length ? getUnsafe2(self.left, i) : getUnsafe2(self.right, i - self.left.length);
    }
    case "ISlice": {
      return getUnsafe2(self.backing.chunk, i + self.backing.offset);
    }
  }
});
var size = (self) => self.length;

// node_modules/effect/dist/Schema.js
var Schema_exports = {};
__export(Schema_exports, {
  Any: () => Any2,
  Array: () => ArraySchema,
  ArrayEnsure: () => ArrayEnsure,
  BigDecimal: () => BigDecimal,
  BigDecimalFromString: () => BigDecimalFromString,
  BigDecimalReviver: () => BigDecimalReviver,
  BigInt: () => BigInt5,
  BigIntFromString: () => BigIntFromString,
  Boolean: () => Boolean5,
  BooleanFromBit: () => BooleanFromBit,
  Cause: () => Cause,
  CauseReason: () => CauseReason,
  CauseReasonReviver: () => CauseReasonReviver,
  CauseReviver: () => CauseReviver,
  Char: () => Char,
  Chunk: () => Chunk,
  ChunkReviver: () => ChunkReviver,
  Class: () => Class4,
  Date: () => Date4,
  DateFromMillis: () => DateFromMillis,
  DateFromString: () => DateFromString,
  DateReviver: () => DateReviver,
  DateTimeUtc: () => DateTimeUtc,
  DateTimeUtcFromDate: () => DateTimeUtcFromDate,
  DateTimeUtcFromMillis: () => DateTimeUtcFromMillis,
  DateTimeUtcFromString: () => DateTimeUtcFromString,
  DateTimeUtcReviver: () => DateTimeUtcReviver,
  DateTimeZoned: () => DateTimeZoned,
  DateTimeZonedFromString: () => DateTimeZonedFromString,
  DateTimeZonedReviver: () => DateTimeZonedReviver,
  Defect: () => Defect,
  Duration: () => Duration,
  DurationFromMillis: () => DurationFromMillis,
  DurationFromNanos: () => DurationFromNanos,
  DurationFromString: () => DurationFromString,
  DurationReviver: () => DurationReviver,
  Enum: () => Enum2,
  Error: () => Error3,
  ErrorInstance: () => ErrorInstance,
  ErrorInstanceReviver: () => ErrorInstanceReviver,
  Exit: () => Exit,
  ExitReviver: () => ExitReviver,
  File: () => File,
  FileReviver: () => FileReviver,
  Finite: () => Finite,
  FiniteFromString: () => FiniteFromString,
  FormData: () => FormData2,
  FormDataReviver: () => FormDataReviver,
  Graph: () => Graph,
  GraphReviver: () => GraphReviver,
  HashMap: () => HashMap,
  HashMapReviver: () => HashMapReviver,
  HashSet: () => HashSet,
  HashSetReviver: () => HashSetReviver,
  Int: () => Int,
  Json: () => Json2,
  JsonObject: () => JsonObject,
  JsonReviver: () => JsonReviver,
  Literal: () => Literal2,
  Literals: () => Literals,
  MutableJson: () => MutableJson2,
  MutableJsonReviver: () => MutableJsonReviver,
  Natural: () => Natural,
  Never: () => Never2,
  NonEmptyArray: () => NonEmptyArray,
  NonEmptyString: () => NonEmptyString,
  Null: () => Null2,
  NullOr: () => NullOr,
  NullishOr: () => NullishOr,
  Number: () => Number6,
  NumberFromString: () => NumberFromString,
  ObjectKeyword: () => ObjectKeyword2,
  Opaque: () => Opaque,
  Option: () => Option,
  OptionFromNullOr: () => OptionFromNullOr,
  OptionFromNullishOr: () => OptionFromNullishOr,
  OptionFromOptional: () => OptionFromOptional,
  OptionFromOptionalKey: () => OptionFromOptionalKey,
  OptionFromOptionalNullOr: () => OptionFromOptionalNullOr,
  OptionFromUndefinedOr: () => OptionFromUndefinedOr,
  OptionReviver: () => OptionReviver,
  PropertyKey: () => PropertyKey,
  ReadonlyMap: () => ReadonlyMap,
  ReadonlyMapReviver: () => ReadonlyMapReviver,
  ReadonlySet: () => ReadonlySet,
  ReadonlySetReviver: () => ReadonlySetReviver,
  Record: () => Record2,
  Redacted: () => Redacted,
  RedactedFromValue: () => RedactedFromValue,
  RedactedReviver: () => RedactedReviver,
  RegExp: () => RegExp3,
  RegExpReviver: () => RegExpReviver,
  Result: () => Result,
  ResultReviver: () => ResultReviver,
  SchemaError: () => SchemaError,
  StandardSchemaV1FailureResult: () => StandardSchemaV1FailureResult,
  String: () => String5,
  StringFromBase64: () => StringFromBase64,
  StringFromBase64Url: () => StringFromBase64Url,
  StringFromHex: () => StringFromHex,
  StringFromUriComponent: () => StringFromUriComponent,
  Struct: () => Struct3,
  StructWithRest: () => StructWithRest,
  Symbol: () => Symbol3,
  TaggedClass: () => TaggedClass,
  TaggedError: () => TaggedError3,
  TaggedStruct: () => TaggedStruct,
  TaggedUnion: () => TaggedUnion,
  TemplateLiteral: () => TemplateLiteral2,
  TemplateLiteralParser: () => TemplateLiteralParser,
  TimeZone: () => TimeZone,
  TimeZoneFromString: () => TimeZoneFromString,
  TimeZoneNamed: () => TimeZoneNamed,
  TimeZoneNamedFromString: () => TimeZoneNamedFromString,
  TimeZoneNamedReviver: () => TimeZoneNamedReviver,
  TimeZoneOffset: () => TimeZoneOffset,
  TimeZoneOffsetReviver: () => TimeZoneOffsetReviver,
  TimeZoneReviver: () => TimeZoneReviver,
  Tree: () => Tree,
  Trim: () => Trim,
  Trimmed: () => Trimmed,
  Tuple: () => Tuple,
  TupleWithRest: () => TupleWithRest,
  URL: () => URL2,
  URLFromString: () => URLFromString,
  URLReviver: () => URLReviver,
  URLSearchParams: () => URLSearchParams2,
  URLSearchParamsReviver: () => URLSearchParamsReviver,
  Uint8Array: () => Uint8Array2,
  Uint8ArrayFromBase64: () => Uint8ArrayFromBase64,
  Uint8ArrayFromBase64Url: () => Uint8ArrayFromBase64Url,
  Uint8ArrayFromHex: () => Uint8ArrayFromHex,
  Uint8ArrayReviver: () => Uint8ArrayReviver,
  Undefined: () => Undefined2,
  UndefinedOr: () => UndefinedOr,
  Union: () => Union2,
  UniqueArray: () => UniqueArray,
  UniqueSymbol: () => UniqueSymbol2,
  Unknown: () => Unknown2,
  UnknownFromJsonString: () => UnknownFromJsonString,
  Void: () => Void2,
  annotate: () => annotate2,
  annotateEncoded: () => annotateEncoded,
  annotateKey: () => annotateKey2,
  asserts: () => asserts2,
  brand: () => brand2,
  catchDecoding: () => catchDecoding,
  catchDecodingWithContext: () => catchDecodingWithContext,
  catchEncoding: () => catchEncoding,
  catchEncodingWithContext: () => catchEncodingWithContext,
  check: () => check,
  declare: () => declare,
  declareConstructor: () => declareConstructor,
  decode: () => decode,
  decodeEffect: () => decodeEffect2,
  decodeExit: () => decodeExit,
  decodeOption: () => decodeOption2,
  decodePromise: () => decodePromise,
  decodeResult: () => decodeResult,
  decodeSync: () => decodeSync2,
  decodeTo: () => decodeTo2,
  decodeUnknownEffect: () => decodeUnknownEffect2,
  decodeUnknownExit: () => decodeUnknownExit2,
  decodeUnknownOption: () => decodeUnknownOption2,
  decodeUnknownPromise: () => decodeUnknownPromise,
  decodeUnknownResult: () => decodeUnknownResult2,
  decodeUnknownSync: () => decodeUnknownSync2,
  encode: () => encode,
  encodeEffect: () => encodeEffect,
  encodeExit: () => encodeExit,
  encodeKeys: () => encodeKeys,
  encodeOption: () => encodeOption2,
  encodePromise: () => encodePromise,
  encodeResult: () => encodeResult,
  encodeSync: () => encodeSync2,
  encodeTo: () => encodeTo,
  encodeUnknownEffect: () => encodeUnknownEffect2,
  encodeUnknownExit: () => encodeUnknownExit2,
  encodeUnknownOption: () => encodeUnknownOption2,
  encodeUnknownPromise: () => encodeUnknownPromise,
  encodeUnknownResult: () => encodeUnknownResult2,
  encodeUnknownSync: () => encodeUnknownSync2,
  extendTo: () => extendTo,
  fieldsAssign: () => fieldsAssign,
  flip: () => flip4,
  fromBrand: () => fromBrand,
  fromFormData: () => fromFormData2,
  fromJsonString: () => fromJsonString2,
  fromURLSearchParams: () => fromURLSearchParams2,
  instanceOf: () => instanceOf,
  is: () => is2,
  isBase64: () => isBase64,
  isBase64Reviver: () => isBase64Reviver,
  isBase64Url: () => isBase64Url,
  isBase64UrlReviver: () => isBase64UrlReviver,
  isBetween: () => isBetween2,
  isBetweenBigDecimal: () => isBetweenBigDecimal,
  isBetweenBigInt: () => isBetweenBigInt,
  isBetweenBigIntReviver: () => isBetweenBigIntReviver,
  isBetweenDate: () => isBetweenDate,
  isBetweenDateReviver: () => isBetweenDateReviver,
  isBetweenReviver: () => isBetweenReviver,
  isCapitalized: () => isCapitalized,
  isCapitalizedReviver: () => isCapitalizedReviver,
  isEndsWith: () => isEndsWith,
  isEndsWithReviver: () => isEndsWithReviver,
  isFinite: () => isFinite2,
  isFiniteReviver: () => isFiniteReviver,
  isGUID: () => isGUID,
  isGUIDReviver: () => isGUIDReviver,
  isGreaterThan: () => isGreaterThan5,
  isGreaterThanBigDecimal: () => isGreaterThanBigDecimal,
  isGreaterThanBigInt: () => isGreaterThanBigInt,
  isGreaterThanBigIntReviver: () => isGreaterThanBigIntReviver,
  isGreaterThanDate: () => isGreaterThanDate,
  isGreaterThanDateReviver: () => isGreaterThanDateReviver,
  isGreaterThanOrEqualTo: () => isGreaterThanOrEqualTo4,
  isGreaterThanOrEqualToBigDecimal: () => isGreaterThanOrEqualToBigDecimal,
  isGreaterThanOrEqualToBigInt: () => isGreaterThanOrEqualToBigInt,
  isGreaterThanOrEqualToBigIntReviver: () => isGreaterThanOrEqualToBigIntReviver,
  isGreaterThanOrEqualToDate: () => isGreaterThanOrEqualToDate,
  isGreaterThanOrEqualToDateReviver: () => isGreaterThanOrEqualToDateReviver,
  isGreaterThanOrEqualToReviver: () => isGreaterThanOrEqualToReviver,
  isGreaterThanReviver: () => isGreaterThanReviver,
  isIncludes: () => isIncludes,
  isIncludesReviver: () => isIncludesReviver,
  isInt: () => isInt,
  isInt32: () => isInt32,
  isIntReviver: () => isIntReviver,
  isLengthBetween: () => isLengthBetween,
  isLengthBetweenReviver: () => isLengthBetweenReviver,
  isLessThan: () => isLessThan5,
  isLessThanBigDecimal: () => isLessThanBigDecimal,
  isLessThanBigInt: () => isLessThanBigInt,
  isLessThanBigIntReviver: () => isLessThanBigIntReviver,
  isLessThanDate: () => isLessThanDate,
  isLessThanDateReviver: () => isLessThanDateReviver,
  isLessThanOrEqualTo: () => isLessThanOrEqualTo5,
  isLessThanOrEqualToBigDecimal: () => isLessThanOrEqualToBigDecimal,
  isLessThanOrEqualToBigInt: () => isLessThanOrEqualToBigInt,
  isLessThanOrEqualToBigIntReviver: () => isLessThanOrEqualToBigIntReviver,
  isLessThanOrEqualToDate: () => isLessThanOrEqualToDate,
  isLessThanOrEqualToDateReviver: () => isLessThanOrEqualToDateReviver,
  isLessThanOrEqualToReviver: () => isLessThanOrEqualToReviver,
  isLessThanReviver: () => isLessThanReviver,
  isLowercased: () => isLowercased,
  isLowercasedReviver: () => isLowercasedReviver,
  isMaxLength: () => isMaxLength,
  isMaxLengthReviver: () => isMaxLengthReviver,
  isMaxProperties: () => isMaxProperties,
  isMaxPropertiesReviver: () => isMaxPropertiesReviver,
  isMaxSize: () => isMaxSize,
  isMaxSizeReviver: () => isMaxSizeReviver,
  isMinLength: () => isMinLength,
  isMinLengthReviver: () => isMinLengthReviver,
  isMinProperties: () => isMinProperties,
  isMinPropertiesReviver: () => isMinPropertiesReviver,
  isMinSize: () => isMinSize,
  isMinSizeReviver: () => isMinSizeReviver,
  isMultipleOf: () => isMultipleOf,
  isMultipleOfReviver: () => isMultipleOfReviver,
  isNonEmpty: () => isNonEmpty,
  isPattern: () => isPattern2,
  isPatternReviver: () => isPatternReviver,
  isPropertiesLengthBetween: () => isPropertiesLengthBetween,
  isPropertiesLengthBetweenReviver: () => isPropertiesLengthBetweenReviver,
  isPropertyNames: () => isPropertyNames,
  isPropertyNamesReviver: () => isPropertyNamesReviver,
  isSchema: () => isSchema,
  isSchemaError: () => isSchemaError,
  isSizeBetween: () => isSizeBetween,
  isSizeBetweenReviver: () => isSizeBetweenReviver,
  isStartsWith: () => isStartsWith,
  isStartsWithReviver: () => isStartsWithReviver,
  isStringBigInt: () => isStringBigInt2,
  isStringBigIntReviver: () => isStringBigIntReviver,
  isStringFinite: () => isStringFinite2,
  isStringFiniteReviver: () => isStringFiniteReviver,
  isStringSymbol: () => isStringSymbol2,
  isStringSymbolReviver: () => isStringSymbolReviver,
  isTrimmed: () => isTrimmed,
  isTrimmedReviver: () => isTrimmedReviver,
  isULID: () => isULID,
  isULIDReviver: () => isULIDReviver,
  isUUID: () => isUUID,
  isUUIDReviver: () => isUUIDReviver,
  isUint32: () => isUint32,
  isUncapitalized: () => isUncapitalized,
  isUncapitalizedReviver: () => isUncapitalizedReviver,
  isUnique: () => isUnique,
  isUniqueReviver: () => isUniqueReviver,
  isUppercased: () => isUppercased,
  isUppercasedReviver: () => isUppercasedReviver,
  link: () => link,
  make: () => make19,
  makeFilter: () => makeFilter2,
  makeFilterGroup: () => makeFilterGroup,
  makeIsBetween: () => makeIsBetween,
  makeIsGreaterThan: () => makeIsGreaterThan,
  makeIsGreaterThanOrEqualTo: () => makeIsGreaterThanOrEqualTo,
  makeIsLessThan: () => makeIsLessThan,
  makeIsLessThanOrEqualTo: () => makeIsLessThanOrEqualTo,
  makeIsMultipleOf: () => makeIsMultipleOf,
  middlewareDecoding: () => middlewareDecoding2,
  middlewareEncoding: () => middlewareEncoding2,
  mutable: () => mutable,
  mutableKey: () => mutableKey2,
  optional: () => optional2,
  optionalKey: () => optionalKey2,
  overrideToCodecIso: () => overrideToCodecIso,
  overrideToEquivalence: () => overrideToEquivalence,
  overrideToFormatter: () => overrideToFormatter,
  readonlyKey: () => readonlyKey,
  refine: () => refine,
  required: () => required2,
  requiredKey: () => requiredKey,
  resolveAnnotations: () => resolveAnnotations,
  resolveAnnotationsKey: () => resolveAnnotationsKey,
  revealBottom: () => revealBottom,
  revealCodec: () => revealCodec,
  suspend: () => suspend3,
  tag: () => tag,
  tagDefaultOmit: () => tagDefaultOmit,
  toArbitrary: () => toArbitrary,
  toCodecArrayFromSingle: () => toCodecArrayFromSingle,
  toCodecIso: () => toCodecIso,
  toCodecJson: () => toCodecJson,
  toCodecJsonAST: () => toCodecJsonAST,
  toCodecStringTree: () => toCodecStringTree,
  toDifferJsonPatch: () => toDifferJsonPatch,
  toEncoded: () => toEncoded2,
  toEncoderXml: () => toEncoderXml,
  toEquivalence: () => toEquivalence2,
  toFormatter: () => toFormatter,
  toIso: () => toIso,
  toIsoFocus: () => toIsoFocus,
  toIsoSource: () => toIsoSource,
  toJsonSchemaDocument: () => toJsonSchemaDocument2,
  toRepresentation: () => toRepresentation2,
  toStandardJSONSchemaV1: () => toStandardJSONSchemaV1,
  toStandardSchemaV1: () => toStandardSchemaV1,
  toTaggedUnion: () => toTaggedUnion,
  toType: () => toType2,
  withConstructorDefault: () => withConstructorDefault2,
  withDecodingDefault: () => withDecodingDefault,
  withDecodingDefaultKey: () => withDecodingDefaultKey,
  withDecodingDefaultType: () => withDecodingDefaultType,
  withDecodingDefaultTypeKey: () => withDecodingDefaultTypeKey
});

// node_modules/effect/dist/internal/graph.js
var TypeId18 = "~effect/collections/Graph";
var toImpl = (graph) => graph;
var edgeEquals = (type, self, that) => (type === "directed" ? self.source === that.source && self.target === that.target : self.source === that.source && self.target === that.target || self.source === that.target && self.target === that.source) && equals(self.data, that.data);
var edgeHash = (type, edge) => type === "directed" ? hash(edge) : optimize(hash(edge.data) ^ hash(edge.source) + hash(edge.target));
var ProtoGraph = {
  [TypeId18]: {
    _N: (_) => _,
    _E: (_) => _
  },
  [Symbol.iterator]() {
    return this.nodes[Symbol.iterator]();
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  [symbol2](that) {
    if (hasProperty(that, TypeId18)) {
      const thatImpl = toImpl(that);
      if (this.nodes.size !== thatImpl.nodes.size || this.edges.size !== thatImpl.edges.size || this.type !== thatImpl.type) {
        return false;
      }
      for (const [nodeIndex, nodeData] of this.nodes) {
        if (!thatImpl.nodes.has(nodeIndex) || !equals(nodeData, thatImpl.nodes.get(nodeIndex))) {
          return false;
        }
      }
      for (const [edgeIndex, edgeData] of this.edges) {
        const otherEdge = thatImpl.edges.get(edgeIndex);
        if (otherEdge === void 0 || !edgeEquals(this.type, edgeData, otherEdge)) {
          return false;
        }
      }
      return true;
    }
    return false;
  },
  [symbol]() {
    let hash2 = string("Graph");
    hash2 = hash2 ^ string(this.type);
    hash2 = hash2 ^ number(this.nodes.size);
    hash2 = hash2 ^ number(this.edges.size);
    for (const [nodeIndex, nodeData] of this.nodes) {
      hash2 = hash2 ^ hash(nodeIndex) + hash(nodeData);
    }
    for (const [edgeIndex, edgeData] of this.edges) {
      hash2 = hash2 ^ hash(edgeIndex) + edgeHash(this.type, edgeData);
    }
    return hash2;
  },
  toJSON() {
    return {
      _id: "Graph",
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      type: this.type
    };
  },
  toString() {
    return `Graph(${this.type}, ${this.nodes.size}, ${this.edges.size})`;
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var make12 = (type, mutable2) => {
  const graph = Object.create(ProtoGraph);
  graph.type = type;
  graph.mutable = mutable2;
  graph.transforming = false;
  graph.nodes = /* @__PURE__ */ new Map();
  graph.edges = /* @__PURE__ */ new Map();
  graph.adjacency = /* @__PURE__ */ new Map();
  graph.reverseAdjacency = /* @__PURE__ */ new Map();
  graph.nextNodeIndex = 0;
  graph.nextEdgeIndex = 0;
  graph.acyclic = some2(true);
  return graph;
};
var snapshot = (graph) => {
  const impl = toImpl(graph);
  return {
    type: graph.type,
    nodes: Array.from(impl.nodes, ([index2, data]) => ({
      index: index2,
      data
    })).sort((a, b) => a.index - b.index),
    edges: Array.from(impl.edges, ([index2, edge]) => ({
      index: index2,
      source: edge.source,
      target: edge.target,
      data: edge.data
    })).sort((a, b) => a.index - b.index)
  };
};
var hydrate = (snapshot2) => {
  const graph = make12(snapshot2.type, false);
  for (const node of snapshot2.nodes) {
    graph.nodes.set(node.index, node.data);
    graph.adjacency.set(node.index, []);
    graph.reverseAdjacency.set(node.index, []);
  }
  for (const edge of snapshot2.edges) {
    graph.edges.set(edge.index, {
      source: edge.source,
      target: edge.target,
      data: edge.data
    });
    graph.adjacency.get(edge.source).push(edge.index);
    graph.reverseAdjacency.get(edge.target).push(edge.index);
    if (snapshot2.type === "undirected") {
      graph.adjacency.get(edge.target).push(edge.index);
      graph.reverseAdjacency.get(edge.source).push(edge.index);
    }
  }
  graph.nextNodeIndex = snapshot2.nodes.length === 0 ? 0 : snapshot2.nodes[snapshot2.nodes.length - 1].index + 1;
  graph.nextEdgeIndex = snapshot2.edges.length === 0 ? 0 : snapshot2.edges[snapshot2.edges.length - 1].index + 1;
  graph.acyclic = none2();
  return graph;
};

// node_modules/effect/dist/Graph.js
var TypeId19 = TypeId18;
var isGraph = (u) => hasProperty(u, TypeId19);
var EdgeIdentity = class _EdgeIdentity {
  type;
  source;
  target;
  identity;
  constructor(type, source, target, identity2) {
    this.type = type;
    this.source = source;
    this.target = target;
    this.identity = identity2;
  }
  [symbol2](that) {
    if (!(that instanceof _EdgeIdentity) || this.type !== that.type || !equals(this.identity, that.identity)) {
      return false;
    }
    if (this.type === "directed") {
      return equals(this.source, that.source) && equals(this.target, that.target);
    }
    return equals(this.source, that.source) && equals(this.target, that.target) || equals(this.source, that.target) && equals(this.target, that.source);
  }
  [symbol]() {
    const hash2 = hash(this.identity);
    return this.type === "directed" ? combine(hash(this.target))(combine(hash(this.source))(hash2)) : optimize(hash2 ^ hash(this.source) + hash(this.target));
  }
};

// node_modules/effect/dist/internal/hashMap.js
var HashMapTypeId = "~effect/collections/HashMap";
var SHIFT = 5;
var BUCKET_SIZE = 1 << SHIFT;
var MIN_ARRAY_NODE = BUCKET_SIZE / 4;
var MAX_INDEX_NODE = BUCKET_SIZE / 2;
var BITMAP_INDEX_MASK = BUCKET_SIZE - 1;
var popcount = (n) => {
  n = n - (n >>> 1 & 1431655765);
  n = (n & 858993459) + (n >>> 2 & 858993459);
  return (n + (n >>> 4) & 252645135) * 16843009 >>> 24;
};
var mask = (hash2, shift) => hash2 >>> shift & BITMAP_INDEX_MASK;
var bitpos = (hash2, shift) => 1 << mask(hash2, shift);
var index = (bitmap, bit) => popcount(bitmap & bit - 1);
function mergeLeaves(edit, shift, hash1, node1, hash2, node2) {
  if (shift > 32) {
    throw new Error("HashMap: max depth exceeded");
  }
  const bit1 = bitpos(hash1, shift);
  const bit2 = bitpos(hash2, shift);
  if (bit1 === bit2) {
    const child = mergeLeaves(edit, shift + SHIFT, hash1, node1, hash2, node2);
    return new IndexedNode(edit, bit1, [child]);
  }
  const bitmap = bit1 | bit2;
  const children = bit1 >>> 0 < bit2 >>> 0 ? [node1, node2] : [node2, node1];
  return new IndexedNode(edit, bitmap, children);
}
var Node = class {
  canEdit(edit) {
    return this.edit === edit;
  }
};
var EmptyNode = class extends Node {
  _tag = "EmptyNode";
  edit = 0;
  get size() {
    return 0;
  }
  get(_shift, _hash, _key) {
    return none2();
  }
  has(_shift, _hash, _key) {
    return false;
  }
  set(edit, _shift, hash2, key, value3, added) {
    added.value = true;
    return new LeafNode(edit, hash2, key, value3);
  }
  remove(_edit, _shift, _hash, _key, _removed) {
    return this;
  }
  iterator() {
    return [][Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
  canEdit(_edit) {
    return false;
  }
};
var LeafNode = class _LeafNode extends Node {
  _tag = "LeafNode";
  edit;
  hash;
  key;
  value;
  constructor(edit, hash2, key, value3) {
    super();
    this.edit = edit;
    this.hash = hash2;
    this.key = key;
    this.value = value3;
  }
  get size() {
    return 1;
  }
  get(_shift, hash2, key) {
    if (this.hash === hash2 && equals(this.key, key)) {
      return some2(this.value);
    }
    return none2();
  }
  has(_shift, hash2, key) {
    return this.hash === hash2 && equals(this.key, key);
  }
  set(edit, shift, hash2, key, value3, added) {
    if (this.hash === hash2 && equals(this.key, key)) {
      if (equals(this.value, value3)) {
        return this;
      }
      if (this.canEdit(edit)) {
        this.value = value3;
        return this;
      }
      return new _LeafNode(edit, hash2, key, value3);
    }
    added.value = true;
    if (this.hash === hash2) {
      return new CollisionNode(edit, hash2, [[this.key, this.value], [key, value3]]);
    }
    const newBit = bitpos(hash2, shift);
    const existingBit = bitpos(this.hash, shift);
    if (newBit === existingBit) {
      return new IndexedNode(edit, newBit, [this.set(edit, shift + SHIFT, hash2, key, value3, added)]);
    }
    const bitmap = newBit | existingBit;
    const nodes = newBit >>> 0 < existingBit >>> 0 ? [new _LeafNode(edit, hash2, key, value3), this] : [this, new _LeafNode(edit, hash2, key, value3)];
    return new IndexedNode(edit, bitmap, nodes);
  }
  remove(_edit, _shift, hash2, key, removed2) {
    if (this.hash === hash2 && equals(this.key, key)) {
      removed2.value = true;
      return void 0;
    }
    return this;
  }
  iterator() {
    return [[this.key, this.value]][Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
};
var CollisionNode = class _CollisionNode extends Node {
  _tag = "CollisionNode";
  edit;
  hash;
  entries;
  constructor(edit, hash2, entries3) {
    super();
    this.edit = edit;
    this.hash = hash2;
    this.entries = entries3;
  }
  get size() {
    return this.entries.length;
  }
  get(_shift, hash2, key) {
    if (this.hash !== hash2) {
      return none2();
    }
    for (const [k, v] of this.entries) {
      if (equals(k, key)) {
        return some2(v);
      }
    }
    return none2();
  }
  has(_shift, hash2, key) {
    if (this.hash !== hash2) {
      return false;
    }
    for (const [k] of this.entries) {
      if (equals(k, key)) {
        return true;
      }
    }
    return false;
  }
  set(edit, shift, hash2, key, value3, added) {
    if (this.hash !== hash2) {
      added.value = true;
      return mergeLeaves(edit, shift, this.hash, this, hash2, new LeafNode(edit, hash2, key, value3));
    }
    for (let i = 0; i < this.entries.length; i++) {
      if (equals(this.entries[i][0], key)) {
        if (equals(this.entries[i][1], value3)) {
          return this;
        }
        if (this.canEdit(edit)) {
          this.entries[i] = [key, value3];
          return this;
        }
        const newEntries = [...this.entries];
        newEntries[i] = [key, value3];
        return new _CollisionNode(edit, this.hash, newEntries);
      }
    }
    added.value = true;
    if (this.canEdit(edit)) {
      this.entries.push([key, value3]);
      return this;
    }
    return new _CollisionNode(edit, this.hash, [...this.entries, [key, value3]]);
  }
  remove(edit, _shift, hash2, key, removed2) {
    if (this.hash !== hash2) {
      return this;
    }
    const idx = this.entries.findIndex(([k]) => equals(k, key));
    if (idx === -1) {
      return this;
    }
    removed2.value = true;
    if (this.entries.length === 1) {
      return void 0;
    }
    if (this.entries.length === 2) {
      const remaining = this.entries[idx === 0 ? 1 : 0];
      return new LeafNode(edit, this.hash, remaining[0], remaining[1]);
    }
    if (this.canEdit(edit)) {
      this.entries.splice(idx, 1);
      return this;
    }
    const newEntries = [...this.entries];
    newEntries.splice(idx, 1);
    return new _CollisionNode(edit, this.hash, newEntries);
  }
  iterator() {
    return this.entries[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
};
var IndexedNode = class _IndexedNode extends Node {
  _tag = "IndexedNode";
  edit;
  _size;
  bitmap;
  children;
  constructor(edit, bitmap, children) {
    super();
    this.edit = edit;
    this.bitmap = bitmap;
    this.children = children;
  }
  get size() {
    if (this._size === void 0) {
      this._size = this.children.reduce((acc, child) => acc + child.size, 0);
    }
    return this._size;
  }
  get(shift, hash2, key) {
    const bit = bitpos(hash2, shift);
    if ((this.bitmap & bit) === 0) {
      return none2();
    }
    const idx = index(this.bitmap, bit);
    return this.children[idx].get(shift + SHIFT, hash2, key);
  }
  has(shift, hash2, key) {
    const bit = bitpos(hash2, shift);
    if ((this.bitmap & bit) === 0) {
      return false;
    }
    const idx = index(this.bitmap, bit);
    return this.children[idx].has(shift + SHIFT, hash2, key);
  }
  set(edit, shift, hash2, key, value3, added) {
    const bit = bitpos(hash2, shift);
    const idx = index(this.bitmap, bit);
    if ((this.bitmap & bit) !== 0) {
      const child = this.children[idx];
      const newChild = child.set(edit, shift + SHIFT, hash2, key, value3, added);
      if (child === newChild) {
        return this;
      }
      if (this.canEdit(edit)) {
        this.children[idx] = newChild;
        return this;
      }
      const newChildren = [...this.children];
      newChildren[idx] = newChild;
      return new _IndexedNode(edit, this.bitmap, newChildren);
    } else {
      added.value = true;
      const newChild = new LeafNode(edit, hash2, key, value3);
      const newBitmap = this.bitmap | bit;
      if (this.canEdit(edit)) {
        this.children.splice(idx, 0, newChild);
        this.bitmap = newBitmap;
        this._size = void 0;
        if (this.children.length > MAX_INDEX_NODE) {
          return this.expand(edit, newBitmap, this.children);
        }
        return this;
      }
      const newChildren = [...this.children];
      newChildren.splice(idx, 0, newChild);
      if (newChildren.length > MAX_INDEX_NODE) {
        return this.expand(edit, newBitmap, newChildren);
      }
      return new _IndexedNode(edit, newBitmap, newChildren);
    }
  }
  remove(edit, shift, hash2, key, removed2) {
    const bit = bitpos(hash2, shift);
    if ((this.bitmap & bit) === 0) {
      return this;
    }
    const idx = index(this.bitmap, bit);
    const child = this.children[idx];
    const newChild = child.remove(edit, shift + SHIFT, hash2, key, removed2);
    if (!removed2.value) {
      return this;
    }
    if (newChild === void 0) {
      const newBitmap = this.bitmap ^ bit;
      if (newBitmap === 0) {
        return void 0;
      }
      if (this.children.length === 2) {
        const remaining = this.children[idx === 0 ? 1 : 0];
        if (remaining._tag === "LeafNode") {
          return remaining;
        }
      }
      if (this.canEdit(edit)) {
        this.children.splice(idx, 1);
        this.bitmap = newBitmap;
        this._size = void 0;
        return this;
      }
      const newChildren2 = [...this.children];
      newChildren2.splice(idx, 1);
      return new _IndexedNode(edit, newBitmap, newChildren2);
    }
    if (child === newChild) {
      return this;
    }
    if (this.canEdit(edit)) {
      this.children[idx] = newChild;
      return this;
    }
    const newChildren = [...this.children];
    newChildren[idx] = newChild;
    return new _IndexedNode(edit, this.bitmap, newChildren);
  }
  expand(edit, bitmap, children) {
    const nodes = new globalThis.Array(BUCKET_SIZE);
    let j = 0;
    for (let i = 0; i < BUCKET_SIZE; i++) {
      if ((bitmap & 1 << i) !== 0) {
        nodes[i] = children[j++];
      }
    }
    return new ArrayNode(edit, children.length, nodes);
  }
  iterator() {
    let childIndex = 0;
    let currentIterator;
    return {
      next: () => {
        while (childIndex < this.children.length) {
          if (!currentIterator) {
            currentIterator = this.children[childIndex].iterator();
          }
          const result3 = currentIterator.next();
          if (!result3.done) {
            return result3;
          }
          currentIterator = void 0;
          childIndex++;
        }
        return {
          done: true,
          value: void 0
        };
      }
    };
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
};
var ArrayNode = class _ArrayNode extends Node {
  _tag = "ArrayNode";
  edit;
  _size;
  count;
  children;
  constructor(edit, count, children) {
    super();
    this.edit = edit;
    this.count = count;
    this.children = children;
  }
  get size() {
    if (this._size === void 0) {
      this._size = this.children.reduce((acc, child) => acc + (child?.size ?? 0), 0);
    }
    return this._size;
  }
  get(shift, hash2, key) {
    const idx = mask(hash2, shift);
    const child = this.children[idx];
    return child ? child.get(shift + SHIFT, hash2, key) : none2();
  }
  has(shift, hash2, key) {
    const idx = mask(hash2, shift);
    const child = this.children[idx];
    return child ? child.has(shift + SHIFT, hash2, key) : false;
  }
  set(edit, shift, hash2, key, value3, added) {
    const idx = mask(hash2, shift);
    const child = this.children[idx];
    if (child) {
      const newChild = child.set(edit, shift + SHIFT, hash2, key, value3, added);
      if (child === newChild) {
        return this;
      }
      if (this.canEdit(edit)) {
        this.children[idx] = newChild;
        return this;
      }
      const newChildren = [...this.children];
      newChildren[idx] = newChild;
      return new _ArrayNode(edit, this.count, newChildren);
    } else {
      added.value = true;
      const newChild = new LeafNode(edit, hash2, key, value3);
      if (this.canEdit(edit)) {
        this.children[idx] = newChild;
        this.count++;
        this._size = void 0;
        return this;
      }
      const newChildren = [...this.children];
      newChildren[idx] = newChild;
      return new _ArrayNode(edit, this.count + 1, newChildren);
    }
  }
  remove(edit, shift, hash2, key, removed2) {
    const idx = mask(hash2, shift);
    const child = this.children[idx];
    if (!child) {
      return this;
    }
    const newChild = child.remove(edit, shift + SHIFT, hash2, key, removed2);
    if (!removed2.value) {
      return this;
    }
    const newCount = this.count - (newChild ? 0 : 1);
    if (newCount < MIN_ARRAY_NODE) {
      return this.pack(edit, idx, newChild);
    }
    if (child === newChild) {
      return this;
    }
    if (this.canEdit(edit)) {
      this.children[idx] = newChild;
      if (!newChild) {
        this.count = newCount;
      }
      this._size = void 0;
      return this;
    }
    const newChildren = [...this.children];
    newChildren[idx] = newChild;
    return new _ArrayNode(edit, newCount, newChildren);
  }
  pack(edit, excludeIdx, newChild) {
    const children = [];
    let bitmap = 0;
    let bit = 1;
    for (let i = 0; i < this.children.length; i++) {
      const child = i === excludeIdx ? newChild : this.children[i];
      if (child) {
        children.push(child);
        bitmap |= bit;
      }
      bit <<= 1;
    }
    return new IndexedNode(edit, bitmap, children);
  }
  iterator() {
    let childIndex = 0;
    let currentIterator;
    return {
      next: () => {
        while (childIndex < this.children.length) {
          const child = this.children[childIndex];
          if (!child) {
            childIndex++;
            continue;
          }
          if (!currentIterator) {
            currentIterator = child.iterator();
          }
          const result3 = currentIterator.next();
          if (!result3.done) {
            return result3;
          }
          currentIterator = void 0;
          childIndex++;
        }
        return {
          done: true,
          value: void 0
        };
      }
    };
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
};
var HashMapImpl = class {
  [HashMapTypeId] = HashMapTypeId;
  _editable;
  _edit;
  _root;
  _size;
  constructor(editable, edit, root, size6) {
    this._editable = editable;
    this._edit = edit;
    this._root = root;
    this._size = size6;
  }
  get size() {
    return this._size;
  }
  [Symbol.iterator]() {
    return this._root.iterator();
  }
  [symbol2](that) {
    if (isHashMap(that)) {
      const thatImpl = that;
      if (this.size !== thatImpl.size) {
        return false;
      }
      for (const [key, value3] of this) {
        const otherValue = pipe(that, get2(key));
        if (isNone2(otherValue) || !equals(value3, otherValue.value)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  [symbol]() {
    let hash2 = string("HashMap");
    for (const [key, value3] of this) {
      hash2 = hash2 ^ hash(key) + hash(value3);
    }
    return hash2;
  }
  [NodeInspectSymbol]() {
    return toJson(this);
  }
  toString() {
    return `HashMap(${format(Array.from(this))})`;
  }
  toJSON() {
    return {
      _id: "HashMap",
      values: Array.from(this).map(([k, v]) => [toJson(k), toJson(v)])
    };
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var emptyNode = /* @__PURE__ */ new EmptyNode();
var isHashMap = (u) => hasProperty(u, HashMapTypeId);
var empty5 = () => new HashMapImpl(false, 0, emptyNode, 0);
var fromIterable4 = (entries3) => {
  let root = emptyNode;
  let size6 = 0;
  const added = {
    value: false
  };
  for (const [key, value3] of entries3) {
    const hash2 = hash(key);
    added.value = false;
    root = root.set(NaN, 0, hash2, key, value3, added);
    if (added.value) {
      size6++;
    }
  }
  return new HashMapImpl(false, 0, root, size6);
};
var get2 = /* @__PURE__ */ dual(2, (self, key) => {
  const impl = self;
  return impl._root.get(0, hash(key), key);
});
var has = /* @__PURE__ */ dual(2, (self, key) => {
  const impl = self;
  return impl._root.has(0, hash(key), key);
});
var setHash = (self, key, hash2, value3) => {
  const impl = self;
  const added = {
    value: false
  };
  const edit = impl._editable ? impl._edit : NaN;
  const newRoot = impl._root.set(edit, 0, hash2, key, value3, added);
  if (impl._editable) {
    impl._root = newRoot;
    if (added.value) {
      impl._size++;
    }
    return self;
  }
  if (impl._root === newRoot) {
    return self;
  }
  return new HashMapImpl(false, impl._edit, newRoot, impl._size + (added.value ? 1 : 0));
};
var set = /* @__PURE__ */ dual(3, (self, key, value3) => {
  return setHash(self, key, hash(key), value3);
});
var keys2 = (self) => {
  const iterator = self[Symbol.iterator]();
  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      const result3 = iterator.next();
      if (result3.done) {
        return {
          done: true,
          value: void 0
        };
      }
      return {
        done: false,
        value: result3.value[0]
      };
    }
  };
};
var entries = (self) => {
  const iterator = self[Symbol.iterator]();
  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      return iterator.next();
    }
  };
};
var size2 = (self) => self.size;

// node_modules/effect/dist/HashMap.js
var isHashMap2 = isHashMap;
var fromIterable5 = fromIterable4;
var entries2 = entries;
var toEntries = (self) => Array.from(entries2(self));
var size3 = size2;

// node_modules/effect/dist/internal/hashSet.js
var HashSetTypeId = "~effect/collections/HashSet";
var HashSetProto = {
  [symbol]() {
    return hash(HashSetTypeId);
  },
  [symbol2](that) {
    return isHashSet(that) && size4(this) === size4(that) && every2(this, (value3) => has2(that, value3));
  },
  [Symbol.iterator]() {
    return keys2(keyMap(this));
  },
  toString() {
    return `HashSet(${format(Array.from(this))})`;
  },
  toJSON() {
    return {
      _id: "HashSet",
      values: toJson(Array.from(this))
    };
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
var makeImpl2 = (keyMap2) => {
  const set2 = Object.create(HashSetProto);
  set2[HashSetTypeId] = HashSetTypeId;
  set2.keyMap = keyMap2;
  return set2;
};
var isHashSet = (u) => hasProperty(u, HashSetTypeId);
var keyMap = (self) => self.keyMap;
var fromIterable6 = (values2) => {
  let map11 = empty5();
  for (const value3 of values2) {
    map11 = set(map11, value3, true);
  }
  return makeImpl2(map11);
};
var has2 = (self, value3) => has(keyMap(self), value3);
var size4 = (self) => size2(keyMap(self));
var every2 = (self, predicate) => {
  for (const value3 of self) {
    if (!predicate(value3)) {
      return false;
    }
  }
  return true;
};

// node_modules/effect/dist/HashSet.js
var fromIterable7 = fromIterable6;
var isHashSet2 = isHashSet;
var size5 = size4;

// node_modules/effect/dist/SchemaParser.js
function makeEffect(schema) {
  const parser = runWithCompiler(constructorCompiler, toType(schema.ast));
  return (input, options2) => {
    return parser(input, options2?.disableChecks ? options2?.parseOptions ? {
      ...options2.parseOptions,
      disableChecks: true
    } : {
      disableChecks: true
    } : options2?.parseOptions);
  };
}
function makeOption(schema) {
  const parser = makeEffect(schema);
  return (input, options2) => {
    const exit3 = runSyncExit2(parser(input, options2));
    if (isSuccess4(exit3)) {
      return some2(exit3.value);
    }
    getSchemaIssueOrThrow(exit3.cause, "Option adapter can only return none for schema issues");
    return none2();
  };
}
function make15(schema) {
  const parser = makeEffect(schema);
  return (input, options2) => {
    const exit3 = runSyncExit2(parser(input, options2));
    if (isSuccess4(exit3)) {
      return exit3.value;
    }
    const issue = getSchemaIssueOrThrow(exit3.cause, "Constructor adapter can only throw schema issues");
    throw new Error("Schema validation failed", {
      cause: issue
    });
  };
}
function is(schema) {
  return _is(schema.ast);
}
function _is(ast) {
  const parser = asExit(run(toType(ast)));
  return (input) => {
    const exit3 = parser(input, defaultParseOptions);
    if (isSuccess4(exit3)) {
      return true;
    }
    getSchemaIssueOrThrow(exit3.cause, "Type guard adapter can only return false for schema issues");
    return false;
  };
}
function _issue(ast) {
  const parser = run(ast);
  return (input, options2) => {
    const exit3 = runSyncExit2(parser(input, options2));
    if (isSuccess4(exit3)) {
      return void 0;
    }
    return getSchemaIssueOrThrow(exit3.cause, "Issue adapter can only return schema issues");
  };
}
function asserts(schema, input) {
  const parser = asExit(run(toType(schema.ast)));
  const exit3 = parser(input, defaultParseOptions);
  if (isFailure4(exit3)) {
    const issue = getSchemaIssueOrThrow(exit3.cause, "Assertion adapter can only throw schema issues");
    throw new Error("Schema validation failed", {
      cause: issue
    });
  }
}
function decodeUnknownEffect(schema, options2) {
  const parser = run(schema.ast);
  return options2 === void 0 ? parser : (input, overrideOptions) => parser(input, mergeParseOptions(options2, overrideOptions));
}
var decodeEffect = decodeUnknownEffect;
function decodeUnknownExit(schema, options2) {
  return asExit(decodeUnknownEffect(schema, options2));
}
function decodeUnknownOption(schema, options2) {
  return asOption(decodeUnknownEffect(schema, options2));
}
var decodeOption = decodeUnknownOption;
function decodeUnknownResult(schema, options2) {
  return asResult(decodeUnknownEffect(schema, options2));
}
function decodeUnknownSync(schema, options2) {
  return asSync(decodeUnknownEffect(schema, options2));
}
var decodeSync = decodeUnknownSync;
function encodeUnknownEffect(schema, options2) {
  const parser = run(flip3(schema.ast));
  return options2 === void 0 ? parser : (input, overrideOptions) => parser(input, mergeParseOptions(options2, overrideOptions));
}
function encodeUnknownExit(schema, options2) {
  return asExit(encodeUnknownEffect(schema, options2));
}
function encodeUnknownOption(schema, options2) {
  return asOption(encodeUnknownEffect(schema, options2));
}
var encodeOption = encodeUnknownOption;
function encodeUnknownResult(schema, options2) {
  return asResult(encodeUnknownEffect(schema, options2));
}
function encodeUnknownSync(schema, options2) {
  return asSync(encodeUnknownEffect(schema, options2));
}
var encodeSync = encodeUnknownSync;
var mergeParseOptions = (options2, overrideOptions) => overrideOptions ? {
  ...options2,
  ...overrideOptions
} : options2;
var getValue = (value3) => {
  if (value3 === missing) {
    return fail5(new InvalidValue());
  }
  return succeed6(value3);
};
function run(ast) {
  return runWithCompiler(normalCompiler, ast);
}
function runWithCompiler(compiler, ast) {
  let parser;
  return (input, options2) => {
    const result3 = (parser ??= compiler(ast))(input, options2 ?? defaultParseOptions);
    if (result3 === sameExit) {
      return succeed6(input);
    }
    if (!effectIsExit(result3)) {
      return flatMapEager2(result3, getValue);
    }
    return result3[args] === missing ? getValue(missing) : result3;
  };
}
function asExit(parser) {
  return (input, options2) => runSyncExit2(parser(input, options2));
}
function asOption(parser) {
  const parserExit = asExit(parser);
  return (input, options2) => {
    const exit3 = parserExit(input, options2);
    if (isSuccess4(exit3)) {
      return some2(exit3.value);
    }
    getSchemaIssueOrThrow(exit3.cause, "Option adapter can only return none for schema issues");
    return none2();
  };
}
function asResult(parser) {
  const parserExit = asExit(parser);
  return (input, options2) => {
    const exit3 = parserExit(input, options2);
    if (isSuccess4(exit3)) {
      return succeed2(exit3.value);
    }
    return fail2(getSchemaIssueOrThrow(exit3.cause, "Result adapter can only return schema issues"));
  };
}
function asSync(parser) {
  const parserExit = asExit(parser);
  return (input, options2) => {
    const exit3 = parserExit(input, options2);
    if (isSuccess4(exit3)) {
      return exit3.value;
    }
    const issue = getSchemaIssueOrThrow(exit3.cause, "Sync adapter can only throw schema issues");
    throw new Error("Schema validation failed", {
      cause: issue
    });
  };
}
var normalCompiler = /* @__PURE__ */ memoize((ast) => makeParser(ast, normalCompiler));
var constructorCompiler = /* @__PURE__ */ memoize((ast) => makeParser(ast, constructorCompiler, compileConstructorDefault));
var compileDefaulted = /* @__PURE__ */ memoize((ast) => makeParser(ast, constructorCompiler, compileConstructorDefault, ast.context?.constructorDefault));
function compileConstructorDefault(ast) {
  return ast.context?.constructorDefault ? compileDefaulted(ast) : constructorCompiler(ast);
}
function applyTransformation(result3, current, transformation, options2) {
  let transformed;
  if (effectIsExit(result3) && result3._tag === "Success") {
    const optional4 = toOption(result3 === sameExit ? current : result3[args]);
    transformed = transformation._tag === "Transformation" ? transformation.decode.run(optional4, options2) : transformation.decode(succeed7(optional4), options2);
  } else if (transformation._tag === "Transformation") {
    transformed = flatMapEager2(result3, (value3) => transformation.decode.run(toOption(value3), options2));
  } else {
    transformed = transformation.decode(mapEager2(result3, toOption), options2);
  }
  return effectIsExit(transformed) && transformed._tag === "Success" ? fromOptionExit(transformed[args]) : flatMapEager2(transformed, fromOptionExit);
}
function makeConstructorParser(descriptor, compile) {
  let sourceParser;
  return (input, options2) => {
    if (input === missing) return missingExit;
    if (descriptor.isConstructed(input)) return sameExit;
    const result3 = (sourceParser ??= compile(descriptor.link.to))(input, options2);
    return applyTransformation(result3, input, descriptor.link.transformation, options2);
  };
}
function makeParser(ast, compile, compileConstructorDefault2, constructorDefault) {
  const descriptor = compileConstructorDefault2 ? getConstructorDescriptor(ast) : void 0;
  const parser = descriptor ? makeConstructorParser(descriptor, compile) : ast.getParser(compile, compileConstructorDefault2);
  const checks = ast.checks;
  const links = constructorDefault ? ast.encoding ? [...ast.encoding, constructorDefault] : [constructorDefault] : ast.encoding;
  const encodingChecks = ast.encodingChecks;
  const astOptions = (checks ? checks[checks.length - 1].annotations : ast.annotations)?.["parseOptions"];
  if (!links && !checks && !encodingChecks) {
    if (!astOptions) {
      return parser;
    }
    return (input, options2) => parser(input, mergeParseOptions(options2, astOptions));
  }
  let encodingParsers;
  const parseLocal = (input, options2) => {
    let result3 = parser(input, options2);
    if (encodingChecks && !options2.disableChecks) {
      if (effectIsExit(result3)) {
        if (result3._tag === "Success") {
          const output = result3 === sameExit ? input : result3[args];
          if (input !== missing && output !== missing) {
            const issues = collectIssues(encodingChecks, input, void 0, ast, options2);
            if (issues) {
              result3 = fail5(new Composite(ast, issues, input, options2));
            }
          }
        }
      } else {
        result3 = flatMap4(result3, (value3) => {
          if (input !== missing && value3 !== missing) {
            const issues = collectIssues(encodingChecks, input, void 0, ast, options2);
            if (issues) {
              return fail5(new Composite(ast, issues, input, options2));
            }
          }
          return succeed6(value3);
        });
      }
    }
    if (checks && !options2.disableChecks) {
      if (effectIsExit(result3)) {
        if (result3._tag === "Success") {
          const value3 = result3 === sameExit ? input : result3[args];
          if (value3 === missing) return result3;
          const issues = collectIssues(checks, value3, void 0, ast, options2);
          if (issues) {
            result3 = fail5(new Composite(ast, issues, value3, options2));
          }
        }
      } else {
        result3 = flatMap4(result3, (value3) => {
          if (value3 !== missing) {
            const issues = collectIssues(checks, value3, void 0, ast, options2);
            if (issues) {
              return fail5(new Composite(ast, issues, value3, options2));
            }
          }
          return succeed6(value3);
        });
      }
    }
    return result3;
  };
  if (!links) {
    return astOptions ? (input, options2) => parseLocal(input, mergeParseOptions(options2, astOptions)) : parseLocal;
  }
  return (input, options2) => {
    if (astOptions) {
      options2 = mergeParseOptions(options2, astOptions);
    }
    const parsers = encodingParsers ??= links.map((link2) => compile(link2.to));
    let current = input;
    let result3 = parsers[parsers.length - 1](input, options2);
    for (let i = links.length - 1; i >= 0; i--) {
      result3 = applyTransformation(result3, current, links[i].transformation, options2);
      if (i !== 0) {
        const next = parsers[i - 1];
        if (result3._tag === "Success") {
          current = result3[args];
          result3 = next(current, options2);
        } else {
          result3 = flatMapEager2(result3, (value3) => {
            const nextResult = next(value3, options2);
            return nextResult === sameExit ? succeed7(value3) : nextResult;
          });
        }
      }
    }
    if (result3._tag === "Success") {
      const value3 = result3[args];
      const local = parseLocal(value3, options2);
      return local === sameExit ? result3 : local;
    }
    result3 = catchCause2(result3, (cause) => failCauseSync2(() => map6(cause, (issue) => new Encoding(ast, issue, input, options2))));
    return flatMapEager2(result3, (value3) => {
      const local = parseLocal(value3, options2);
      return local === sameExit ? succeed7(value3) : local;
    });
  };
}

// node_modules/effect/dist/internal/schema/schema.js
var TypeId20 = "~effect/Schema/Schema";
function makeDeclarationReviver(id2, payloadSchema, revive) {
  return {
    id: id2,
    payloadSchema,
    revive
  };
}
function makeFilterReviver(id2, payloadSchema, revive) {
  return {
    id: id2,
    payloadSchema,
    revive
  };
}
var SchemaProto = {
  [TypeId20]: TypeId20,
  pipe() {
    return pipeArguments(this, arguments);
  },
  annotate(annotations) {
    return this.rebuild(annotate(this.ast, annotations));
  },
  annotateKey(annotations) {
    return this.rebuild(annotateKey(this.ast, annotations));
  },
  check(...checks) {
    return this.rebuild(appendChecks(this.ast, checks));
  }
};
function make16(ast, options2) {
  function Schema() {
  }
  const self = Object.defineProperties(Object.setPrototypeOf(Schema, SchemaProto), Object.getOwnPropertyDescriptors({
    ...options2
  }));
  self.ast = ast;
  self.rebuild = (ast2) => make16(ast2, options2);
  self.makeEffect = makeEffect(self);
  self.make = make15(self);
  self.makeOption = makeOption(self);
  return self;
}

// node_modules/effect/dist/Struct.js
var Struct_exports = {};
__export(Struct_exports, {
  Record: () => Record,
  assign: () => assign,
  evolve: () => evolve,
  evolveEntries: () => evolveEntries,
  evolveKeys: () => evolveKeys,
  get: () => get3,
  keys: () => keys3,
  lambda: () => lambda,
  makeCombiner: () => makeCombiner,
  makeEquivalence: () => makeEquivalence4,
  makeOrder: () => makeOrder2,
  makeReducer: () => makeReducer2,
  map: () => map10,
  mapOmit: () => mapOmit,
  mapPick: () => mapPick,
  omit: () => omit2,
  pick: () => pick,
  renameKeys: () => renameKeys
});
var get3 = /* @__PURE__ */ dual(2, (self, key) => self[key]);
var keys3 = (self) => Object.keys(self);
var pick = /* @__PURE__ */ dual(2, (self, keys4) => {
  return buildStruct(self, (k, v) => keys4.includes(k) ? [k, v] : void 0);
});
var omit2 = /* @__PURE__ */ dual(2, (self, keys4) => {
  return buildStruct(self, (k, v) => !keys4.includes(k) ? [k, v] : void 0);
});
var assign = /* @__PURE__ */ dual(2, (self, that) => {
  return {
    ...self,
    ...that
  };
});
var evolve = /* @__PURE__ */ dual(2, (self, e) => {
  return buildStruct(self, (k, v) => [k, Object.hasOwn(e, k) ? e[k](v) : v]);
});
var evolveKeys = /* @__PURE__ */ dual(2, (self, e) => {
  return buildStruct(self, (k, v) => [Object.hasOwn(e, k) ? e[k](k) : k, v]);
});
var evolveEntries = /* @__PURE__ */ dual(2, (self, e) => {
  return buildStruct(self, (k, v) => Object.hasOwn(e, k) ? e[k](k, v) : [k, v]);
});
var renameKeys = /* @__PURE__ */ dual(2, (self, mapping) => {
  return buildStruct(self, (k, v) => [Object.hasOwn(mapping, k) ? mapping[k] : k, v]);
});
var makeEquivalence4 = Struct;
var makeOrder2 = Struct2;
var lambda = (f) => f;
var map10 = /* @__PURE__ */ dual(2, (self, lambda2) => {
  return buildStruct(self, (k, v) => [k, lambda2(v)]);
});
var mapPick = /* @__PURE__ */ dual(3, (self, keys4, lambda2) => {
  return buildStruct(self, (k, v) => [k, keys4.includes(k) ? lambda2(v) : v]);
});
var mapOmit = /* @__PURE__ */ dual(3, (self, keys4, lambda2) => {
  return buildStruct(self, (k, v) => [k, !keys4.includes(k) ? lambda2(v) : v]);
});
function buildStruct(source, f) {
  const out = {};
  for (const k of Reflect.ownKeys(source)) {
    if (!Object.prototype.propertyIsEnumerable.call(source, k)) continue;
    const res = f(k, source[k]);
    if (res) {
      const [nk, nv] = res;
      assignProperty(out, nk, nv);
    }
  }
  return out;
}
function makeCombiner(combiners, options2) {
  const omitKeyWhen = options2?.omitKeyWhen ?? (() => false);
  return make3((self, that) => {
    const keys4 = Reflect.ownKeys(combiners);
    const out = {};
    for (const key of keys4) {
      const merge2 = combiners[key].combine(self[key], that[key]);
      if (omitKeyWhen(merge2)) continue;
      assignProperty(out, key, merge2);
    }
    return out;
  });
}
function makeReducer2(reducers, options2) {
  const combine2 = makeCombiner(reducers, options2).combine;
  const initialValue = {};
  for (const key of Reflect.ownKeys(reducers)) {
    const iv = reducers[key].initialValue;
    if (options2?.omitKeyWhen?.(iv)) continue;
    assignProperty(initialValue, key, iv);
  }
  return make(combine2, initialValue);
}
function Record(keys4, value3) {
  const out = {};
  for (const key of keys4) {
    assignProperty(out, key, value3);
  }
  return out;
}

// node_modules/effect/dist/UndefinedOr.js
function makeReducer3(combiner2) {
  return make((self, that) => {
    if (self === void 0) return that;
    if (that === void 0) return self;
    return combiner2.combine(self, that);
  }, void 0);
}

// node_modules/effect/dist/internal/errors.js
function errorWithPath(message, path) {
  if (path.length > 0) {
    message += `
  at ${formatPath(path)}`;
  }
  return new Error(message);
}

// node_modules/effect/dist/internal/schema/toArbitrary.js
var arbitraryMemoMap = /* @__PURE__ */ new WeakMap();
var suspendDepthIdentifierMap = /* @__PURE__ */ new WeakMap();
var emptyRecursionStack = [];
function arbitraryError(what) {
  return new Error(`Unable to derive an arbitrary for ${what}`);
}
var entryComparator = ([a], [b]) => equals(a, b);
function applyChecks(ast, filters, arbitrary) {
  return filters.reduce((acc, filter8) => acc.filter((a) => filter8.run(a, ast, defaultParseOptions) === void 0), arbitrary);
}
function validateArrayConstraints(constraint, label) {
  if (constraint?.minLength !== void 0 && constraint.maxLength !== void 0 && constraint.minLength > constraint.maxLength) {
    throw arbitraryError(`${label} constraints`);
  }
}
function lengthToFastCheckConstraints(constraint) {
  return constraint === void 0 || constraint.minLength === void 0 && constraint.maxLength === void 0 ? void 0 : {
    ...constraint.minLength !== void 0 ? {
      minLength: constraint.minLength
    } : {},
    ...constraint.maxLength !== void 0 ? {
      maxLength: constraint.maxLength
    } : {}
  };
}
function arrayWithConstraints(fc, item, constraint, comparator) {
  return comparator ? fc.uniqueArray(item, {
    ...constraint,
    comparator
  }) : fc.array(item, constraint);
}
function array2(fc, ctx, item, terminal = false) {
  const constraint = ctx.constraint;
  const arrayConstraints = lengthToFastCheckConstraints(constraint);
  validateArrayConstraints(arrayConstraints, "array");
  return arrayWithConstraints(fc, item, terminal ? {
    ...arrayConstraints,
    maxLength: arrayConstraints?.minLength ?? 0
  } : arrayConstraints, constraint?.unique ? equals : void 0);
}
function appendArray(fc, out, len, rest) {
  return out.chain((as4) => as4.length < len ? fc.constant(as4) : rest.map((rest2) => [...as4, ...rest2]));
}
function appendObjectEntries(out, entries3) {
  return out.chain((o) => entries3.map((entries4) => ({
    ...Object.fromEntries(entries4),
    ...o
  })));
}
var max5 = /* @__PURE__ */ makeReducer3(ReducerMax);
var min5 = /* @__PURE__ */ makeReducer3(ReducerMin);
var or = /* @__PURE__ */ makeReducer3(ReducerOr);
var concat = /* @__PURE__ */ makeReducer3(/* @__PURE__ */ makeReducerConcat());
var combiner = /* @__PURE__ */ makeCombiner({
  integer: or,
  maxLength: min5,
  minLength: max5,
  noInfinity: or,
  noNaN: or,
  patterns: concat,
  unique: or
}, {
  omitKeyWhen: isUndefined
});
function mergeOrderedBound(order, self, selfExclusive, that, thatExclusive, takeComparison) {
  if (that === void 0 || self === void 0) {
    return that === void 0 ? [self, selfExclusive] : [that, thatExclusive];
  }
  const comparison = order(self, that);
  return comparison === takeComparison ? [that, thatExclusive] : comparison === 0 ? [self, selfExclusive || thatExclusive] : [self, selfExclusive];
}
function mergeOrderedConstraints(self, that) {
  if (self === void 0) {
    return that;
  }
  if (self.order !== that.order) {
    throw new Error("Cannot merge ordered arbitrary constraints with different Order instances");
  }
  const [minimum, exclusiveMinimum] = mergeOrderedBound(self.order, self.minimum, self.exclusiveMinimum, that.minimum, that.exclusiveMinimum, -1);
  const [maximum, exclusiveMaximum] = mergeOrderedBound(self.order, self.maximum, self.exclusiveMaximum, that.maximum, that.exclusiveMaximum, 1);
  return {
    order: self.order,
    ...minimum !== void 0 ? {
      minimum
    } : {},
    ...exclusiveMinimum !== void 0 ? {
      exclusiveMinimum
    } : {},
    ...maximum !== void 0 ? {
      maximum
    } : {},
    ...exclusiveMaximum !== void 0 ? {
      exclusiveMaximum
    } : {}
  };
}
function mergeConstraint(self, that) {
  const {
    ordered: selfOrdered,
    ...selfRest
  } = self ?? {};
  const {
    ordered: thatOrdered,
    ...thatRest
  } = that;
  const ordered = thatOrdered === void 0 ? selfOrdered : mergeOrderedConstraints(selfOrdered, thatOrdered);
  const out = combiner.combine(selfRest, thatRest);
  return {
    ...out,
    ...ordered === void 0 ? {} : {
      ordered
    }
  };
}
function collectChecks(checks) {
  const filters = [];
  const arbitraries = [];
  function visit(check2) {
    if (check2.annotations?.arbitrary) {
      arbitraries.push(check2.annotations.arbitrary);
    }
    if (check2._tag !== "Filter") {
      for (const child of check2.checks) {
        visit(child);
      }
    } else {
      filters.push(check2);
    }
  }
  checks?.forEach(visit);
  return {
    filters,
    arbitraries
  };
}
function constraintContext(arbitraries) {
  const constraintAnnotations = arbitraries.map(({
    constraint
  }) => constraint).filter(isNotUndefined);
  return (ctx) => {
    const constraint = constraintAnnotations.reduce((acc, c) => mergeConstraint(acc, c), ctx.constraint);
    return {
      ...ctx,
      constraint
    };
  };
}
function resetContext(ctx) {
  return {
    ...ctx,
    constraint: void 0
  };
}
function objectEntriesConstraints(ast, constraint, requiredKeys) {
  if (constraint === void 0 || constraint.minLength === void 0 && constraint.maxLength === void 0) {
    return void 0;
  }
  if (constraint.minLength !== void 0 && ast.indexSignatures.length === 0 && constraint.minLength > ast.propertySignatures.length) {
    throw arbitraryError("object property constraints");
  }
  const out = {};
  if (constraint.minLength !== void 0) {
    out.minLength = Math.max(0, constraint.minLength - requiredKeys);
  }
  if (constraint.maxLength !== void 0) {
    out.maxLength = constraint.maxLength - requiredKeys;
    if (out.maxLength < 0) {
      throw arbitraryError("object property constraints");
    }
  }
  validateArrayConstraints(out, "object property");
  return out;
}
function objectWithOptionalCount(fc, pss, orderedNames, requiredKeys, optionalNames, constraint) {
  const requiredCount = requiredKeys.length;
  if (constraint.maxLength !== void 0 && constraint.maxLength < requiredCount) {
    throw arbitraryError("object property constraints");
  }
  const minOptional = constraint.minLength === void 0 ? 0 : Math.max(0, constraint.minLength - requiredCount);
  const maxOptional = constraint.maxLength === void 0 ? optionalNames.length : Math.min(optionalNames.length, constraint.maxLength - requiredCount);
  if (minOptional > maxOptional) {
    throw arbitraryError("object property constraints");
  }
  const full = fc.record(pss, {
    requiredKeys: [...requiredKeys, ...optionalNames]
  });
  const chosen = fc.shuffledSubarray([...optionalNames], {
    minLength: minOptional,
    maxLength: maxOptional
  });
  return fc.tuple(full, chosen).map(([base2, names]) => {
    const keep = /* @__PURE__ */ new Set([...requiredKeys, ...names]);
    const out = {};
    for (const name of orderedNames) {
      if (keep.has(name)) {
        assignProperty(out, name, base2[name]);
      }
    }
    return out;
  });
}
function toRangeConstraints(ordered, min6, max6, error) {
  const out = {};
  if (ordered?.minimum !== void 0) {
    out.min = min6(ordered.minimum, ordered.exclusiveMinimum === true);
  }
  if (ordered?.maximum !== void 0) {
    out.max = max6(ordered.maximum, ordered.exclusiveMaximum === true);
  }
  if (out.min !== void 0 && out.max !== void 0 && out.min > out.max) {
    throw arbitraryError(error);
  }
  return out;
}
function toIntegerConstraints(ordered) {
  return toRangeConstraints(ordered, (minimum, excluded) => excluded ? Math.floor(minimum) + 1 : Math.ceil(minimum), (maximum, excluded) => excluded ? Math.ceil(maximum) - 1 : Math.floor(maximum), "integer constraints");
}
function toFloatConstraints(constraint, ordered) {
  const out = {
    ...constraint?.noInfinity ? {
      noDefaultInfinity: true
    } : {},
    ...constraint?.noNaN ? {
      noNaN: true
    } : {},
    ...ordered?.minimum !== void 0 ? {
      min: ordered.minimum
    } : {},
    ...ordered?.exclusiveMinimum !== void 0 ? {
      minExcluded: ordered.exclusiveMinimum
    } : {},
    ...ordered?.maximum !== void 0 ? {
      max: ordered.maximum
    } : {},
    ...ordered?.exclusiveMaximum !== void 0 ? {
      maxExcluded: ordered.exclusiveMaximum
    } : {}
  };
  if (out.min !== void 0 && out.max !== void 0 && (out.min > out.max || out.min === out.max && (out.minExcluded || out.maxExcluded))) {
    throw arbitraryError("number constraints");
  }
  return out;
}
function toBigIntConstraints(ordered) {
  return toRangeConstraints(ordered, (minimum, excluded) => excluded ? minimum + BigInt(1) : minimum, (maximum, excluded) => excluded ? maximum - BigInt(1) : maximum, "the ordered bigint constraints");
}
function makeLazy(normal, terminal) {
  const out = (fc, ctx, recursionStack = emptyRecursionStack) => normal(fc, ctx, recursionStack);
  out.terminal = (fc, ctx, recursionStack = emptyRecursionStack) => terminal(fc, ctx, recursionStack);
  return out;
}
function same(f) {
  return makeLazy(f, f);
}
function getSuspendRecursion(fc, ast) {
  const depthIdentifier = suspendDepthIdentifierMap.get(ast) ?? fc.createDepthIdentifier();
  suspendDepthIdentifierMap.set(ast, depthIdentifier);
  return {
    maxDepth: 2,
    depthIdentifier
  };
}
function oneOf(fc, arbitraries) {
  return arbitraries.length === 0 ? void 0 : arbitraries.length === 1 ? arbitraries[0] : fc.oneof(...arbitraries);
}
var finiteNumberConstraint = {
  noInfinity: true,
  noNaN: true
};
function finiteNumberContext(ctx) {
  return {
    ...ctx,
    constraint: finiteNumberConstraint
  };
}
function applyCandidates(fc, ctx, arbitraries, base2) {
  const weighted = base2 === void 0 ? [] : [{
    arbitrary: base2,
    weight: 1
  }];
  for (const {
    candidate
  } of arbitraries) {
    if (!candidate) {
      continue;
    }
    const arbitrary = candidate.make(fc, ctx);
    if (arbitrary === void 0) {
      continue;
    }
    const weight = candidate.weight ?? 1;
    if (!globalThis.Number.isInteger(weight) || weight <= 0) {
      throw arbitraryError("a candidate with an invalid weight");
    }
    weighted.push({
      arbitrary,
      weight
    });
  }
  return weighted.length === 0 ? void 0 : weighted.length === 1 ? weighted[0].arbitrary : fc.oneof(...weighted);
}
function applyFilterLayer(ast, checks, fc, ctx, base2) {
  const out = applyCandidates(fc, ctx, checks.arbitraries, base2);
  return out === void 0 ? void 0 : applyChecks(ast, checks.filters, out);
}
function normalizeDerivation(output, hasTypeParameters) {
  if (!(typeof output === "object" && output !== null && "arbitrary" in output)) {
    return {
      arbitrary: output,
      terminal: hasTypeParameters ? void 0 : output
    };
  }
  const terminal = "terminal" in output ? output.terminal : hasTypeParameters ? void 0 : output.arbitrary;
  return {
    arbitrary: output.arbitrary,
    terminal
  };
}
function makeTypeParameters(typeParameters, fc, ctx, recursionStack, lazyNormal) {
  return typeParameters.map((tp) => ({
    arbitrary: lazyNormal ? fc.constant(null).chain(() => tp(fc, ctx, recursionStack)) : tp(fc, ctx, recursionStack),
    terminal: tp.terminal(fc, ctx, recursionStack)
  }));
}
function filterLayer(ast, checks, normalBase, terminalBase) {
  const f = constraintContext(checks.arbitraries);
  return makeLazy((fc, ctx, recursionStack) => {
    const nextCtx = f(ctx);
    return applyFilterLayer(ast, checks, fc, nextCtx, normalBase(fc, ctx, nextCtx, recursionStack));
  }, (fc, ctx, recursionStack) => {
    const nextCtx = f(ctx);
    return applyFilterLayer(ast, checks, fc, nextCtx, terminalBase(fc, ctx, nextCtx, recursionStack));
  });
}
var memoized = /* @__PURE__ */ memoize((ast) => recur(ast, []));
function recur(ast, path) {
  const annotation = resolve(ast)?.toArbitrary;
  if (annotation) {
    const typeParameters = isDeclaration(ast) ? ast.typeParameters.map((tp) => recur(tp, path)) : [];
    const checks = collectChecks(ast.checks);
    const derive = (lazyNormal) => (fc, ctx, nextCtx, recursionStack) => normalizeDerivation(annotation(makeTypeParameters(typeParameters, fc, resetContext(ctx), recursionStack, lazyNormal))(fc, nextCtx), typeParameters.length > 0)[lazyNormal ? "terminal" : "arbitrary"];
    return filterLayer(ast, checks, derive(false), derive(true));
  }
  if (ast.checks) {
    const checks = collectChecks(ast.checks);
    const lawc = recur(replaceChecks(ast, void 0), path);
    return filterLayer(ast, checks, (fc, _ctx, nextCtx, recursionStack) => lawc(fc, nextCtx, recursionStack), (fc, _ctx, nextCtx, recursionStack) => lawc.terminal(fc, nextCtx, recursionStack));
  }
  return base(ast, path);
}
function base(ast, path) {
  switch (ast._tag) {
    case "Never":
    case "Declaration":
      throw errorWithPath(`Unsupported AST ${ast._tag}`, path);
    case "Null":
      return same((fc) => fc.constant(null));
    case "Void":
    case "Undefined":
      return same((fc) => fc.constant(void 0));
    case "Unknown":
    case "Any":
      return same((fc) => fc.anything());
    case "String":
      return same((fc, ctx) => {
        const constraint = ctx.constraint;
        const patterns = constraint?.patterns;
        return patterns ? fc.oneof(...patterns.map((pattern) => fc.stringMatching(new RegExp(pattern)))) : fc.string(lengthToFastCheckConstraints(constraint));
      });
    case "Number":
      return same((fc, ctx) => {
        const constraint = ctx.constraint;
        const ordered = constraint?.ordered?.order === Number2 ? constraint.ordered : void 0;
        return constraint?.integer ? fc.integer(toIntegerConstraints(ordered)) : fc.float(toFloatConstraints(constraint, ordered));
      });
    case "Boolean":
      return same((fc) => fc.boolean());
    case "BigInt":
      return same((fc, ctx) => {
        const ordered = ctx.constraint?.ordered?.order === BigInt2 ? ctx.constraint.ordered : void 0;
        return fc.bigInt(toBigIntConstraints(ordered));
      });
    case "Symbol":
      return same((fc) => fc.string().map(Symbol.for));
    case "Literal":
      return same((fc) => fc.constant(ast.literal));
    case "UniqueSymbol":
      return same((fc) => fc.constant(ast.symbol));
    case "ObjectKeyword":
      return same((fc) => fc.oneof(fc.object(), fc.array(fc.anything())));
    case "Enum":
      return recur(enumsToLiterals(ast), path);
    case "TemplateLiteral": {
      const parts = ast.parts.map((part, i) => recur(toEncoded(part), [...path, i]));
      return same((fc, ctx, recursionStack) => fc.tuple(...parts.map((part) => part(fc, finiteNumberContext(ctx), recursionStack))).map((segments) => segments.map((segment) => globalThis.String(segment)).join("")));
    }
    case "Arrays": {
      const elements = ast.elements.map((ast2, i) => ({
        ast: ast2,
        arbitrary: recur(ast2, [...path, i])
      }));
      const len = ast.elements.length;
      const rest = ast.rest.map((ast2, i) => ({
        ast: ast2,
        arbitrary: recur(ast2, [...path, len + i])
      }));
      const terminal = (fc, ctx, recursionStack) => {
        const reset = resetContext(ctx);
        const elementArbitraries = [];
        const optionals = [];
        let length2 = 0;
        for (const element of elements) {
          const out2 = element.arbitrary.terminal(fc, reset, recursionStack);
          if (isOptional(element.ast)) {
            optionals.push(out2);
            continue;
          }
          if (out2 === void 0) {
            return void 0;
          }
          length2++;
          elementArbitraries.push(out2.map(some2));
        }
        const minLength = ctx.constraint?.minLength ?? 0;
        const needsRest = isReadonlyArrayNonEmpty(rest) && minLength > length2 + optionals.length;
        const optionalTarget = needsRest ? optionals.length : Math.max(0, minLength - length2);
        let includedOptionals = 0;
        for (const out2 of optionals) {
          if (includedOptionals >= optionalTarget || out2 === void 0) {
            elementArbitraries.push(fc.constant(none2()));
            continue;
          }
          includedOptionals++;
          length2++;
          elementArbitraries.push(out2.map(some2));
        }
        if (includedOptionals < optionalTarget) {
          return void 0;
        }
        let out = fc.tuple(...elementArbitraries).map(getSomes);
        if (isReadonlyArrayNonEmpty(rest)) {
          const [head3, ...tail] = rest;
          const restCtx = ast.elements.length === 0 ? ctx : reset;
          const minRestLength = Math.max(0, minLength - length2 - tail.length);
          const headArbitrary = minRestLength === 0 ? void 0 : head3.arbitrary.terminal(fc, reset, recursionStack);
          if (minRestLength > 0 && headArbitrary === void 0) {
            return void 0;
          }
          const restArbitrary = minRestLength === 0 ? fc.constant([]) : array2(fc, {
            ...restCtx,
            constraint: {
              ...restCtx.constraint,
              minLength: minRestLength
            }
          }, headArbitrary, true);
          out = appendArray(fc, out, len, restArbitrary);
          if (tail.length > 0) {
            const tailArbitraries = [];
            for (const element of tail) {
              const out2 = element.arbitrary.terminal(fc, reset, recursionStack);
              if (out2 === void 0) {
                return void 0;
              }
              tailArbitraries.push(out2);
            }
            const t = fc.tuple(...tailArbitraries);
            out = appendArray(fc, out, len, t);
          }
        }
        return out;
      };
      return makeLazy((fc, ctx, recursionStack) => {
        const reset = resetContext(ctx);
        const elementArbitraries = elements.map(({
          ast: ast2,
          arbitrary
        }) => {
          const out2 = arbitrary(fc, reset, recursionStack);
          return isOptional(ast2) ? out2.chain((a) => fc.boolean().map((b) => b ? some2(a) : none2())) : out2.map(some2);
        });
        let out = fc.tuple(...elementArbitraries).map((elements2) => getSomes(takeWhile(elements2, isSome2)));
        if (isReadonlyArrayNonEmpty(rest)) {
          const [head3, ...tail] = rest.map(({
            arbitrary
          }) => arbitrary(fc, reset, recursionStack));
          const restArbitrary = array2(fc, ast.elements.length === 0 ? ctx : reset, head3);
          out = appendArray(fc, out, len, restArbitrary);
          if (tail.length > 0) {
            const t = fc.tuple(...tail);
            out = appendArray(fc, out, len, t);
          }
        }
        if (ctx.recursion) {
          const terminalOut = terminal(fc, ctx, recursionStack);
          if (terminalOut !== void 0) {
            return fc.oneof(ctx.recursion, terminalOut, out);
          }
        }
        return out;
      }, terminal);
    }
    case "Objects": {
      const propertySignatures = ast.propertySignatures.map((ps) => ({
        ps,
        arbitrary: recur(ps.type, [...path, ps.name])
      }));
      const indexSignatures = ast.indexSignatures.map((is3) => ({
        is: is3,
        parameter: recur(is3.parameter, path),
        type: recur(is3.type, path)
      }));
      const terminal = (fc, ctx, recursionStack) => {
        const reset = resetContext(ctx);
        const pss = {};
        const requiredKeys = [];
        const optionals = [];
        for (const {
          ps,
          arbitrary
        } of propertySignatures) {
          const name = ps.name;
          const out2 = arbitrary.terminal(fc, reset, recursionStack);
          if (isOptional(ps.type)) {
            if (out2 !== void 0) {
              optionals.push([name, out2]);
            }
            continue;
          }
          if (out2 === void 0) {
            return void 0;
          }
          requiredKeys.push(name);
          assignProperty(pss, name, out2);
        }
        let optionalCount = Math.max(0, (ctx.constraint?.minLength ?? 0) - requiredKeys.length);
        for (const [name, out2] of optionals) {
          if (optionalCount === 0) {
            break;
          }
          optionalCount--;
          requiredKeys.push(name);
          assignProperty(pss, name, out2);
        }
        if (optionalCount > 0 && ast.indexSignatures.length === 0) {
          return void 0;
        }
        let out = fc.record(pss, {
          requiredKeys
        });
        const entriesConstraints = objectEntriesConstraints(ast, ctx.constraint, requiredKeys.length);
        const minEntries = entriesConstraints?.minLength ?? 0;
        for (const {
          parameter,
          type
        } of indexSignatures) {
          let entries3;
          if (minEntries === 0) {
            entries3 = fc.constant([]);
          } else {
            const key = parameter.terminal(fc, reset, recursionStack);
            const value3 = type.terminal(fc, reset, recursionStack);
            if (key === void 0 || value3 === void 0) {
              return void 0;
            }
            entries3 = arrayWithConstraints(fc, fc.tuple(key, value3), {
              ...entriesConstraints,
              maxLength: minEntries
            }, entryComparator);
          }
          out = appendObjectEntries(out, entries3);
        }
        return out;
      };
      return makeLazy((fc, ctx, recursionStack) => {
        const reset = resetContext(ctx);
        const pss = {};
        const orderedNames = [];
        const requiredKeys = [];
        const optionalNames = [];
        for (const {
          ps,
          arbitrary
        } of propertySignatures) {
          const name = ps.name;
          orderedNames.push(name);
          if (isOptional(ps.type)) {
            optionalNames.push(name);
          } else {
            requiredKeys.push(name);
          }
          assignProperty(pss, name, arbitrary(fc, reset, recursionStack));
        }
        const constraint = ctx.constraint;
        if (optionalNames.length > 0 && indexSignatures.length === 0 && constraint !== void 0 && (constraint.minLength !== void 0 || constraint.maxLength !== void 0)) {
          return objectWithOptionalCount(fc, pss, orderedNames, requiredKeys, optionalNames, constraint);
        }
        let out = fc.record(pss, {
          requiredKeys
        });
        const entriesConstraints = objectEntriesConstraints(ast, ctx.constraint, requiredKeys.length);
        for (const {
          parameter,
          type
        } of indexSignatures) {
          const entry = fc.tuple(parameter(fc, reset, recursionStack), type(fc, reset, recursionStack));
          const entries3 = arrayWithConstraints(fc, entry, entriesConstraints, entryComparator);
          out = appendObjectEntries(out, entries3);
        }
        return out;
      }, terminal);
    }
    case "Union": {
      const types = ast.types.map((ast2) => recur(ast2, path));
      const terminal = (fc, ctx, recursionStack) => oneOf(fc, types.map((type) => type.terminal(fc, ctx, recursionStack)).filter(isNotUndefined));
      return makeLazy((fc, ctx, recursionStack) => {
        const arbitraries = types.map((type) => type(fc, ctx, recursionStack));
        if (ctx.recursion) {
          const terminalOut = terminal(fc, ctx, recursionStack);
          if (terminalOut !== void 0) {
            return fc.oneof(ctx.recursion, terminalOut, ...arbitraries);
          }
        }
        const out = oneOf(fc, arbitraries);
        if (out === void 0) {
          throw arbitraryError("a union with no members");
        }
        return out;
      }, terminal);
    }
    case "Suspend": {
      const memo = arbitraryMemoMap.get(ast);
      if (memo) return memo;
      const get5 = memoizeThunk(() => recur(ast.thunk(), path));
      const out = makeLazy((fc, ctx, recursionStack) => {
        const recursion = getSuspendRecursion(fc, ast);
        const nextCtx = {
          ...ctx,
          recursion
        };
        const nextStack = recursionStack.includes(ast) ? recursionStack : [...recursionStack, ast];
        const terminal = get5().terminal(fc, nextCtx, nextStack);
        if (terminal === void 0) {
          throw errorWithPath("Unable to derive an arbitrary for a recursive schema without a finite generation path", path);
        }
        return fc.oneof(recursion, terminal, fc.constant(null).chain(() => get5()(fc, nextCtx, nextStack)));
      }, (fc, ctx, recursionStack) => {
        if (recursionStack.includes(ast)) {
          return void 0;
        }
        const recursion = getSuspendRecursion(fc, ast);
        return get5().terminal(fc, {
          ...ctx,
          recursion
        }, [...recursionStack, ast]);
      });
      arbitraryMemoMap.set(ast, out);
      return out;
    }
  }
}

// node_modules/effect/dist/internal/schema/toEquivalence.js
var toEquivalence = /* @__PURE__ */ memoize((ast) => {
  return recur2(ast, []);
});
function recur2(ast, path) {
  const annotation = resolve(ast)?.["toEquivalence"];
  if (annotation) {
    return annotation(isDeclaration(ast) ? ast.typeParameters.map((tp) => recur2(tp, path)) : []);
  }
  switch (ast._tag) {
    case "Never":
      return strictEqual();
    case "Declaration":
    case "Null":
    case "Undefined":
    case "Void":
    case "Unknown":
    case "Any":
    case "String":
    case "Number":
    case "Boolean":
    case "BigInt":
    case "Symbol":
    case "Literal":
    case "UniqueSymbol":
    case "ObjectKeyword":
    case "Enum":
    case "TemplateLiteral":
      return equals;
    case "Arrays": {
      const elements = ast.elements.map((e, i) => recur2(e, [...path, i]));
      const len = ast.elements.length;
      const rest = ast.rest.map((r, i) => recur2(r, [...path, len + i]));
      return make2((a, b) => {
        if (!Array.isArray(a) || !Array.isArray(b)) {
          return false;
        }
        const len2 = a.length;
        if (len2 !== b.length) {
          return false;
        }
        let i = 0;
        for (; i < Math.min(len2, ast.elements.length); i++) {
          if (!elements[i](a[i], b[i])) {
            return false;
          }
        }
        if (rest.length > 0) {
          const [head3, ...tail] = rest;
          for (; i < len2 - tail.length; i++) {
            if (!head3(a[i], b[i])) {
              return false;
            }
          }
          for (let j = 0; j < tail.length; j++) {
            if (!tail[j](a[i + j], b[i + j])) {
              return false;
            }
          }
        }
        return true;
      });
    }
    case "Objects": {
      if (ast.propertySignatures.length === 0 && ast.indexSignatures.length === 0) {
        return equals;
      }
      const propertySignatures = ast.propertySignatures.map((ps) => recur2(ps.type, [...path, ps.name]));
      const indexSignatures = ast.indexSignatures.map((is3) => recur2(is3.type, path));
      return make2((a, b) => {
        if (!isObject(a) || !isObject(b)) {
          return false;
        }
        for (let i = 0; i < propertySignatures.length; i++) {
          const ps = ast.propertySignatures[i];
          const name = ps.name;
          const aHas = Object.hasOwn(a, name);
          const bHas = Object.hasOwn(b, name);
          if (isOptional(ps.type)) {
            if (aHas !== bHas) {
              return false;
            }
          }
          if (aHas && bHas && !propertySignatures[i](a[name], b[name])) {
            return false;
          }
        }
        for (let i = 0; i < indexSignatures.length; i++) {
          const is3 = ast.indexSignatures[i];
          const aKeys = getIndexSignatureKeys(a, is3.parameter);
          const bKeys = getIndexSignatureKeys(b, is3.parameter);
          if (aKeys.length !== bKeys.length) return false;
          for (let j = 0; j < aKeys.length; j++) {
            const key = aKeys[j];
            if (!Object.hasOwn(b, key) || !indexSignatures[i](a[key], b[key])) {
              return false;
            }
          }
        }
        return true;
      });
    }
    case "Union": {
      const types = toType(ast).types;
      const compiled = new Map(types.map((candidate, i) => [candidate, [_is(candidate), recur2(ast.types[i], path)]]));
      return make2((a, b) => {
        const candidates = getCandidates(a, types);
        for (let i = 0; i < candidates.length; i++) {
          const [is3, equivalence] = compiled.get(candidates[i]);
          if (is3(a) && is3(b)) {
            return equivalence(a, b);
          }
        }
        return false;
      });
    }
    case "Suspend": {
      const get5 = memoizeThunk(() => recur2(ast.thunk(), path));
      return make2((a, b) => get5()(a, b));
    }
  }
}

// node_modules/effect/dist/JsonPointer.js
function escapeToken(token) {
  return token.replace(/~/g, "~0").replace(/\//g, "~1");
}
function unescapeToken(token) {
  return token.replace(/~1/g, "/").replace(/~0/g, "~");
}

// node_modules/effect/dist/JsonSchema.js
var META_SCHEMA_URI_DRAFT_07 = "http://json-schema.org/draft-07/schema#";
var META_SCHEMA_URI_DRAFT_2020_12 = "https://json-schema.org/draft/2020-12/schema";
function isMetaSchemaUri(value3, uri) {
  return value3 === uri || value3 === (uri.endsWith("#") ? uri.slice(0, -1) : `${uri}#`);
}
function toDocumentDraft07(document) {
  return {
    dialect: "draft-07",
    ...convertDocument(document, draft07Adapter)
  };
}
function transformSchema(node, transform3) {
  return walk(node, false, true);
  function walk(node2, inheritedResource, isRoot = false) {
    if (!isObject(node2)) return node2;
    const inEmbeddedResource = inheritedResource || !isRoot && createsResource(node2.$id);
    const out = {};
    for (const key of Object.keys(node2)) {
      const value3 = node2[key];
      let transformed = value3;
      switch (key) {
        case "$defs":
        case "properties":
        case "patternProperties":
        case "dependentSchemas":
          transformed = mapObject(value3, (value4) => walk(value4, inEmbeddedResource)) ?? value3;
          break;
        case "allOf":
        case "anyOf":
        case "oneOf":
        case "prefixItems":
          transformed = Array.isArray(value3) ? value3.map((value4) => walk(value4, inEmbeddedResource)) : value3;
          break;
        case "not":
        case "additionalProperties":
        case "propertyNames":
        case "unevaluatedProperties":
        case "items":
        case "contains":
        case "unevaluatedItems":
        case "if":
        case "then":
        case "else":
        case "contentSchema":
          transformed = walk(value3, inEmbeddedResource);
      }
      assignProperty(out, key, transformed);
    }
    transform3(out, inEmbeddedResource);
    return out;
  }
}
function rewriteRefs(schema, rewrite) {
  return transformSchema(schema, (schema2) => {
    rewriteSchemaRef(schema2, rewrite);
  });
}
function rewriteSchemaRef(schema, rewrite) {
  if (typeof schema.$ref === "string") {
    assignProperty(schema, "$ref", rewrite(schema.$ref, "$ref"));
  }
  if (typeof schema.$dynamicRef === "string") {
    assignProperty(schema, "$dynamicRef", rewrite(schema.$dynamicRef, "$dynamicRef"));
  }
}
function mapObject(value3, f) {
  if (!isObject(value3)) return void 0;
  const out = {};
  for (const key of Object.keys(value3)) {
    assignProperty(out, key, f(value3[key], key));
  }
  return out;
}
function runConverter(adapter, options2, use) {
  const locations = /* @__PURE__ */ new Map();
  const references = [];
  let rootUri = ROOT_URI;
  function convert(root, sourcePath = [], targetPath = []) {
    if (sourcePath.length === 0 && options2?.trackIds) {
      const id2 = isObject(root) ? getResourceId(root) : void 0;
      rootUri = resolveResourceUri(id2, ROOT_URI) ?? ROOT_URI;
    }
    return loop(root, sourcePath, targetPath, {
      sourceRoot: [],
      targetRoot: [],
      uri: rootUri
    });
  }
  function finish() {
    for (const [out2, value3, sourceResource] of references) {
      let reference = value3;
      const resolved = resolveUrl(value3, sourceResource);
      if (resolved !== void 0) {
        const sourcePointer = parsePointerFragment(resolved.hash);
        resolved.hash = "";
        if (sourcePointer !== void 0) {
          const targetPath = locations.get(locationKey(resolved.href, sourcePointer));
          if (targetPath !== void 0) reference = relocateReference(value3, targetPath);
        }
      }
      assignProperty(out2, "$ref", reference);
    }
  }
  const out = use(convert);
  finish();
  return out;
  function loop(node, sourcePath, targetPath, resourceScope) {
    if (typeof node === "boolean") {
      recordLocations(sourcePath, targetPath, resourceScope);
      return options2?.booleanAdapter?.(node) ?? node;
    }
    if (!isObject(node)) return node;
    let currentResourceScope = resourceScope;
    const id2 = getResourceId(node);
    if (sourcePath.length > 0 && options2?.trackIds && createsResource(id2)) {
      const uri = resolveResourceUri(id2, resourceScope.uri);
      if (uri !== void 0) {
        currentResourceScope = {
          parent: resourceScope,
          sourceRoot: sourcePath,
          targetRoot: targetPath,
          uri
        };
      }
    }
    recordLocations(sourcePath, targetPath, currentResourceScope);
    const currentResource = currentResourceScope.uri;
    const context3 = {
      isDocumentRoot: sourcePath.length === 0,
      schema(value3, sourceKey, targetKey = sourceKey) {
        return loop(value3, [...sourcePath, sourceKey], [...targetPath, targetKey], currentResourceScope);
      },
      schemaAt(value3, sourceSuffix, targetSuffix) {
        return loop(value3, [...sourcePath, ...sourceSuffix], [...targetPath, ...targetSuffix], currentResourceScope);
      },
      schemaArray(value3, sourceKey, targetKey = sourceKey) {
        return Array.isArray(value3) ? value3.map((item, index2) => loop(item, [...sourcePath, sourceKey, String(index2)], [...targetPath, targetKey, String(index2)], currentResourceScope)) : value3;
      },
      schemaMap(value3, sourceKey, targetKey = sourceKey) {
        if (!isObject(value3)) return value3;
        return mapObject(value3, (item, key) => loop(item, [...sourcePath, sourceKey, key], [...targetPath, targetKey, key], currentResourceScope));
      },
      reference(out2, value3) {
        if (typeof value3 === "string") {
          references.push([out2, value3, currentResource]);
        } else {
          assignProperty(out2, "$ref", value3);
        }
      }
    };
    return adapter(node, context3);
  }
  function getResourceId(schema) {
    return options2?.ignoreRefSiblings === true && typeof schema.$ref === "string" ? void 0 : schema.$id;
  }
  function recordLocations(sourcePath, targetPath, scope3) {
    if (scope3.parent !== void 0) recordLocations(sourcePath, targetPath, scope3.parent);
    locations.set(locationKey(scope3.uri, sourcePath.slice(scope3.sourceRoot.length)), targetPath.slice(scope3.targetRoot.length));
  }
}
var ROOT_URI = "https://effect.invalid/.json-schema/";
function resolveUrl(value3, base2) {
  return URL.canParse(value3, base2) ? new URL(value3, base2) : void 0;
}
function resolveResourceUri(value3, base2) {
  if (typeof value3 !== "string") return void 0;
  const url = resolveUrl(value3, base2);
  if (url === void 0) return void 0;
  url.hash = "";
  return url.href;
}
function parsePointerFragment(hash2) {
  if (hash2.length === 0) return [];
  let pointer;
  try {
    pointer = decodeURIComponent(hash2.slice(1));
  } catch {
    return void 0;
  }
  if (!pointer.startsWith("/")) return void 0;
  return /~(?:[^01]|$)/.test(pointer) ? void 0 : pointer.slice(1).split("/").map(unescapeToken);
}
function relocateReference(reference, targetPath) {
  const index2 = reference.indexOf("#");
  if (index2 === -1 && targetPath.length === 0) return reference;
  const uri = index2 === -1 ? reference : reference.slice(0, index2);
  return `${uri}${formatPointerFragment(targetPath)}`;
}
function formatPointerFragment(path) {
  return path.length === 0 ? "#" : `#/${path.map((token) => encodeURI(escapeToken(token)).replace(/#/g, "%23")).join("/")}`;
}
function locationKey(resource, pointer) {
  return `${resource}\0${JSON.stringify(pointer)}`;
}
function createsResource(id2) {
  return typeof id2 === "string" && id2.length > 0 && id2[0] !== "#";
}
function convertDocument(document, adapter, options2) {
  return runConverter(adapter, {
    ...options2,
    trackIds: true
  }, (convert) => ({
    schema: convert(document.schema),
    definitions: mapObject(document.definitions, (definition, key) => convert(definition, ["$defs", key], ["definitions", key]))
  }));
}
var SCHEMA_MAP_KEYWORDS = /* @__PURE__ */ new Set(["properties", "patternProperties"]);
var SCHEMA_ARRAY_KEYWORDS = /* @__PURE__ */ new Set(["allOf", "anyOf", "oneOf"]);
var JSON_SCHEMA_SINGLE_KEYWORDS = /* @__PURE__ */ new Set(["not", "additionalProperties", "propertyNames", "contains", "if", "then", "else", "contentSchema"]);
function convertSubschemaKeyword(out, key, value3, context3, singleKeywords, mapKeywords = SCHEMA_MAP_KEYWORDS) {
  let converted;
  if (mapKeywords.has(key)) converted = context3.schemaMap(value3, key);
  else if (SCHEMA_ARRAY_KEYWORDS.has(key)) converted = context3.schemaArray(value3, key);
  else if (singleKeywords.has(key)) converted = context3.schema(value3, key);
  else return false;
  assignProperty(out, key, converted);
  return true;
}
var PRE_2020_TO_2020_COLLISIONS = ["$anchor", "$defs", "$dynamicAnchor", "$dynamicRef", "$vocabulary", "contentSchema", "dependentRequired", "dependentSchemas", "maxContains", "minContains", "prefixItems", "unevaluatedItems", "unevaluatedProperties"];
var DRAFT_07_TO_2020_COLLISIONS = [...PRE_2020_TO_2020_COLLISIONS, "deprecated"];
var OPEN_API_30_TO_2020_COLLISIONS = [...PRE_2020_TO_2020_COLLISIONS, "$comment", "$id", "$schema", "const", "contains", "contentEncoding", "contentMediaType", "else", "examples", "if", "patternProperties", "propertyNames", "then"];
var ANCHOR_REGEXP = /^[A-Za-z_][-A-Za-z0-9._]*$/;
var LEGACY_ID_FRAGMENT_REGEXP = /^[A-Za-z][-A-Za-z0-9._:]*$/;
function unsupported(keyword, dialect, details) {
  throw new Error(`Cannot convert JSON Schema keyword "${keyword}" to ${dialect}: ${details}`);
}
function rejectKeywordCollisions(source, keywords, targetDialect, sourceDialect) {
  for (const keyword of keywords) {
    if (Object.hasOwn(source, keyword)) {
      unsupported(keyword, targetDialect, `it is not active in ${sourceDialect} but would become active in the target`);
    }
  }
}
var DRAFT_07_TARGET_COLLISIONS = ["additionalItems", "definitions", "dependencies"];
function convertMetaSchemaKeyword(out, value3, context3, targetUri, targetDialect) {
  if (context3.isDocumentRoot) {
    assignProperty(out, "$schema", isMetaSchemaUri(value3, META_SCHEMA_URI_DRAFT_2020_12) ? targetUri : value3);
  } else if (!isMetaSchemaUri(value3, META_SCHEMA_URI_DRAFT_2020_12)) {
    unsupported("$schema", targetDialect, "an embedded resource cannot declare a different dialect");
  }
}
function draft07Adapter(source, context3) {
  rejectKeywordCollisions(source, DRAFT_07_TARGET_COLLISIONS, "Draft-07", "Draft 2020-12");
  const out = {};
  let reference = void 0;
  let prefixItems = void 0;
  let items = void 0;
  for (const key of Object.keys(source)) {
    const value3 = source[key];
    if (convertSubschemaKeyword(out, key, value3, context3, JSON_SCHEMA_SINGLE_KEYWORDS)) continue;
    switch (key) {
      case "$ref":
        reference = value3;
        break;
      case "$schema":
        convertMetaSchemaKeyword(out, value3, context3, META_SCHEMA_URI_DRAFT_07, "Draft-07");
        break;
      case "$id":
      case "$anchor":
        break;
      case "$defs":
        assignProperty(out, "definitions", context3.schemaMap(value3, key, "definitions"));
        break;
      case "prefixItems":
        prefixItems = value3;
        break;
      case "items":
        items = value3;
        break;
      case "dependentRequired":
      case "dependentSchemas":
      case "minContains":
      case "maxContains":
        break;
      case "$dynamicRef":
      case "$dynamicAnchor":
      case "$vocabulary":
      case "unevaluatedProperties":
      case "unevaluatedItems":
        unsupported(key, "Draft-07", "the target dialect has no equivalent");
      case "required":
        if (Array.isArray(value3) && value3.length === 0) break;
        assignProperty(out, key, value3);
        break;
      default:
        assignProperty(out, key, value3);
    }
  }
  convertTuple(out, prefixItems, items, context3);
  if (Object.hasOwn(source, "contains")) {
    const minContains = source.minContains;
    const maxContains = source.maxContains;
    if (minContains !== void 0 && minContains !== 1 || maxContains !== void 0) {
      unsupported("minContains/maxContains", "Draft-07", "contains cardinality cannot be represented");
    }
    if (Object.hasOwn(source, "minContains")) assignProperty(out, "minContains", minContains);
  } else {
    if (Object.hasOwn(source, "minContains")) assignProperty(out, "minContains", source.minContains);
    if (Object.hasOwn(source, "maxContains")) assignProperty(out, "maxContains", source.maxContains);
  }
  convertDependencies(source, out, context3, "draft-07");
  convertLegacyId(source, out, "$id", "Draft-07");
  convertReference(out, reference, context3);
  return out;
}
function convertTuple(out, prefixItems, items, context3) {
  if (prefixItems === void 0) {
    if (items !== void 0) assignProperty(out, "items", context3.schema(items, "items"));
    return;
  }
  assignProperty(out, "items", context3.schemaArray(prefixItems, "prefixItems", "items"));
  if (items !== void 0) {
    assignProperty(out, "additionalItems", context3.schema(items, "items", "additionalItems"));
  }
}
function convertReference(out, reference, context3) {
  if (reference === void 0) return;
  if (typeof reference === "string" && Object.keys(out).length > 0) {
    const referenceSchema = {};
    context3.reference(referenceSchema, reference);
    appendAllOf(out, referenceSchema);
  } else {
    context3.reference(out, reference);
  }
}
function convertDependencies(source, out, context3, targetDialect) {
  const dependentRequired = isObject(source.dependentRequired) ? source.dependentRequired : void 0;
  const dependentSchemas = isObject(source.dependentSchemas) ? source.dependentSchemas : void 0;
  if (dependentRequired === void 0 && dependentSchemas === void 0) return;
  const dependencies = {};
  const keys4 = /* @__PURE__ */ new Set([...Object.keys(dependentRequired ?? {}), ...Object.keys(dependentSchemas ?? {})]);
  for (const key of keys4) {
    const required3 = dependentRequired?.[key];
    const dependency = dependentSchemas?.[key];
    const omitRequired = targetDialect === "draft-04" && Array.isArray(required3) && required3.length === 0;
    if (dependency === void 0) {
      if (!omitRequired) assignProperty(dependencies, key, required3);
    } else if (required3 === void 0 || omitRequired) {
      assignProperty(dependencies, key, context3.schemaAt(dependency, ["dependentSchemas", key], ["dependencies", key]));
    } else {
      assignProperty(dependencies, key, {
        allOf: [context3.schemaAt(dependency, ["dependentSchemas", key], ["dependencies", key, "allOf", "0"]), {
          required: required3
        }]
      });
    }
  }
  if (Object.keys(dependencies).length > 0) assignProperty(out, "dependencies", dependencies);
}
function appendAllOf(out, schema) {
  if (Array.isArray(out.allOf)) out.allOf.push(schema);
  else assignProperty(out, "allOf", [schema]);
}
function convertLegacyId(source, out, targetKey, dialect) {
  const id2 = source.$id;
  const anchor = source.$anchor;
  if (anchor === void 0) {
    if (id2 !== void 0) assignProperty(out, targetKey, id2);
    return;
  }
  if (typeof anchor !== "string" || !ANCHOR_REGEXP.test(anchor)) {
    unsupported("$anchor", dialect, "the anchor is not valid");
  }
  if (!LEGACY_ID_FRAGMENT_REGEXP.test(anchor)) {
    unsupported("$anchor", dialect, "the anchor cannot be represented as a plain-name fragment identifier");
  }
  if (id2 === void 0) {
    assignProperty(out, targetKey, `#${anchor}`);
  } else {
    unsupported("$anchor", dialect, "it cannot be combined with the schema $id");
  }
}

// node_modules/effect/dist/RegExp.js
var RegExp2 = globalThis.RegExp;
var escape = (string3) => string3.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&");

// node_modules/effect/dist/internal/schema/toJsonSchemaDocument.js
var jsonSchemaAnnotationExcludedKeys = /* @__PURE__ */ new Set([...annotationExcludedKeys, IDENTIFIER_FALLBACK_KEY, ...jsonSchemaAnnotationKeys]);
function collectJsonSchemaAnnotations(annotations, options2) {
  if (annotations === void 0) return void 0;
  const out = {};
  const title = annotations.title;
  if (typeof title === "string") out.title = title;
  const description = annotations.description;
  const expected = annotations.expected;
  if (typeof description === "string") out.description = description;
  else if (options2?.generateDescriptions === true && typeof expected === "string") out.description = expected;
  const defaultValue = annotations.default;
  if (isJson(defaultValue)) out.default = defaultValue;
  const examples = annotations.examples;
  if (Array.isArray(examples) && isJson(examples)) out.examples = examples;
  const readOnly = annotations.readOnly;
  if (typeof readOnly === "boolean") out.readOnly = readOnly;
  const writeOnly = annotations.writeOnly;
  if (typeof writeOnly === "boolean") out.writeOnly = writeOnly;
  const format5 = annotations.format;
  if (typeof format5 === "string") out.format = format5;
  const contentEncoding = annotations.contentEncoding;
  if (typeof contentEncoding === "string") out.contentEncoding = contentEncoding;
  const contentMediaType = annotations.contentMediaType;
  if (typeof contentMediaType === "string") out.contentMediaType = contentMediaType;
  const contentSchema = annotations.contentSchema;
  if (isJson(contentSchema)) out.contentSchema = contentSchema;
  if (options2?.includeAnnotationKey !== void 0) {
    for (const [key, value3] of Object.entries(annotations)) {
      if (jsonSchemaAnnotationExcludedKeys.has(key) || !options2.includeAnnotationKey(key)) {
        continue;
      }
      if (isJson(value3)) assignProperty(out, key, value3);
    }
  }
  return Object.keys(out).length === 0 ? void 0 : out;
}
function extractJsonSchemaNumberType(schema) {
  let type = schema.type === "number" || schema.type === "integer" ? schema.type : void 0;
  let out = schema;
  if (type !== void 0) {
    out = {
      ...schema
    };
    delete out.type;
  }
  if (Array.isArray(out.allOf)) {
    const members = [];
    let changed = false;
    for (const member of out.allOf) {
      const extracted = extractJsonSchemaNumberType(member);
      if (extracted.type !== void 0) {
        changed = true;
        if (type === void 0 || extracted.type === "integer") type = extracted.type;
      }
      if (Object.keys(extracted.schema).length > 0) members.push(extracted.schema);
    }
    if (changed) {
      const {
        allOf: _,
        ...rest
      } = out;
      out = members.length === 0 ? rest : {
        ...rest,
        allOf: members
      };
    }
  }
  return {
    type,
    schema: out
  };
}
function isJsonSchemaNumberEncoding(schema) {
  return Array.isArray(schema.anyOf) && schema.anyOf.length === 4 && schema.anyOf[0]?.type === "number" && schema.anyOf.slice(1).every((member) => member.type === "string");
}
var inlineableCheckKeywords = "|type|format|pattern|multipleOf|minimum|maximum|exclusiveMinimum|exclusiveMaximum|minLength|maxLength|minItems|maxItems|uniqueItems|minProperties|maxProperties|propertyNames|";
function hasOnlyKeywords(schema, allowed) {
  return Object.keys(schema).every((key) => allowed.includes(`|${key}|`));
}
function hasNoCollisions(left, rightKeys) {
  return typeof left.$ref !== "string" && rightKeys.every((key) => !Object.hasOwn(left, key));
}
var promotableAnnotationKeywords = "|title|description|default|examples|readOnly|writeOnly|";
var inlineableAnnotatedCheckKeywords = inlineableCheckKeywords + promotableAnnotationKeywords;
function appendJsonSchema(left, right, inlineCheck) {
  if (Object.keys(left).length === 0) return right;
  const rightKeys = Object.keys(right);
  if (rightKeys.length === 0) return left;
  const leftType = left.type === "number" || left.type === "integer" ? left.type : void 0;
  const isNumberEncoding = isJsonSchemaNumberEncoding(left);
  if (leftType !== void 0 || isNumberEncoding) {
    const extracted = extractJsonSchemaNumberType(right);
    if (extracted.type !== void 0) {
      const type = leftType === "integer" || extracted.type === "integer" ? "integer" : "number";
      const base2 = {
        ...left,
        type
      };
      if (isNumberEncoding) delete base2.anyOf;
      const extractedKeys = Object.keys(extracted.schema);
      if (extractedKeys.length === 0) return base2;
      return hasOnlyKeywords(extracted.schema, promotableAnnotationKeywords) && hasNoCollisions(base2, extractedKeys) ? {
        ...base2,
        ...extracted.schema
      } : appendJsonSchema(base2, extracted.schema, inlineCheck);
    }
  }
  if (inlineCheck && hasNoCollisions(left, rightKeys)) {
    return {
      ...left,
      ...right
    };
  }
  const members = Array.isArray(right.allOf) && rightKeys.length === 1 ? right.allOf : [right];
  if (Array.isArray(left.allOf)) {
    return {
      ...left,
      allOf: [...left.allOf, ...members]
    };
  }
  if (typeof left.$ref === "string") {
    return {
      allOf: [left, ...members]
    };
  }
  return {
    ...left,
    allOf: members
  };
}
function compileJsonSchema(representations, rootPaths, references, options2) {
  const definitionStates = /* @__PURE__ */ new Map();
  const compiledRepresentations = /* @__PURE__ */ new WeakMap();
  const fallbackDefinitions = /* @__PURE__ */ new Map();
  let hasAliases = false;
  const referenceKeys = Object.keys(references);
  for (const key of referenceKeys) {
    compileDefinition(key, ["references", key]);
  }
  const schemas = map4(representations, (representation, index2) => finalizeJsonSchema(recur3(representation, rootPaths[index2])));
  const definitions = {};
  for (const key of referenceKeys) {
    const compiled = definitionStates.get(key);
    if (typeof compiled !== "string") {
      assignProperty(definitions, key, finalizeJsonSchema(compiled));
    }
  }
  return {
    dialect: "draft-2020-12",
    schemas,
    definitions
  };
  function compileDefinition(key, path) {
    const compiled = definitionStates.get(key);
    if (compiled !== void 0) return typeof compiled === "string" ? compiled : key;
    if (!Object.hasOwn(references, key)) {
      throw errorWithPath(`Invalid reference ${key}`, [...path, "$ref"]);
    }
    definitionStates.set(key, null);
    const representation = references[key];
    const schema = recur3(representation, ["references", key]);
    const fallback = getIdentifierFallback(representation);
    if (fallback !== void 0) {
      const candidates = fallbackDefinitions.get(fallback);
      const match8 = candidates?.find((candidate) => equals(definitionStates.get(candidate), schema));
      if (match8 === void 0) {
        if (candidates === void 0) fallbackDefinitions.set(fallback, [key]);
        else candidates.push(key);
      } else {
        hasAliases = true;
        definitionStates.set(key, match8);
        return match8;
      }
    }
    definitionStates.set(key, schema);
    return key;
  }
  function finalizeJsonSchema(schema) {
    if (!hasAliases) return schema;
    return rewriteRefs(schema, ($ref) => $ref.replace(/^#\/\$defs\/([^/]*)/, (match8, token) => {
      const canonical = definitionStates.get(unescapeToken(token));
      return typeof canonical === "string" ? `#/$defs/${escapeToken(canonical)}` : match8;
    }));
  }
  function getIdentifierFallback(representation) {
    if (representation._tag === "Reference") return void 0;
    const annotations = representation.checks.length === 0 ? representation.annotations : representation.checks[representation.checks.length - 1].annotations;
    return typeof annotations?.identifier !== "string" && typeof annotations?.[IDENTIFIER_FALLBACK_KEY] === "string" ? annotations[IDENTIFIER_FALLBACK_KEY] : void 0;
  }
  function annotationSchemas(representation, path) {
    return representation?.schemas?.map((schema, index2) => recur3(schema, [...path, "schemas", index2])) ?? [];
  }
  function compileCheck(check2, type, path) {
    const annotations = check2.annotations;
    const callback3 = annotations?.toJsonSchema;
    if (callback3 !== void 0) {
      const schemas2 = annotationSchemas(check2.representation, [...path, "representation"]);
      const fragment = callback3({
        type,
        schemas: schemas2
      });
      const ordinary2 = collectJsonSchemaAnnotations(annotations, options2);
      const schema = ordinary2 === void 0 ? fragment : {
        ...fragment,
        ...ordinary2
      };
      const allowed = ordinary2 === void 0 ? inlineableCheckKeywords : inlineableAnnotatedCheckKeywords;
      return check2._tag === "Filter" && hasOnlyKeywords(schema, allowed) && (ordinary2 === void 0 || hasOnlyKeywords(ordinary2, promotableAnnotationKeywords)) ? [schema, true] : [schema];
    }
    if (check2._tag === "Filter") return void 0;
    const children = check2.checks.map((child, index2) => compileCheck(child, type, [...path, "checks", index2])).filter((child) => child !== void 0);
    if (children.length === 0) return void 0;
    const ordinary = collectJsonSchemaAnnotations(annotations, options2);
    const allOf = children.map(([schema]) => schema);
    return [ordinary === void 0 ? {
      allOf
    } : {
      allOf,
      ...ordinary
    }];
  }
  function recur3(representation, path) {
    if (representation._tag === "Reference") {
      const canonical = compileDefinition(representation.$ref, path);
      return {
        $ref: `#/$defs/${escapeToken(canonical)}`
      };
    }
    const cached3 = compiledRepresentations.get(representation);
    if (cached3 !== void 0) return cached3;
    let output = on(representation, path);
    const ordinary = collectJsonSchemaAnnotations(representation.annotations, options2);
    if (ordinary !== void 0) {
      output = {
        ...output,
        ...ordinary
      };
    }
    for (let index2 = 0; index2 < representation.checks.length; index2++) {
      const type = typeof output.type === "string" && isJsonSchemaType(output.type) ? output.type : void 0;
      const check2 = compileCheck(representation.checks[index2], type, [...path, "checks", index2]);
      if (check2 !== void 0) {
        output = appendJsonSchema(output, ...check2);
      }
    }
    compiledRepresentations.set(representation, output);
    return output;
  }
  function on(representation, path) {
    switch (representation._tag) {
      case "Any":
      case "Unknown":
        return {};
      case "ObjectKeyword":
        return {
          anyOf: [{
            type: "object"
          }, {
            type: "array"
          }]
        };
      case "Void":
      case "Undefined":
      case "Null":
        return {
          type: "null"
        };
      case "BigInt":
        return {
          type: "string",
          allOf: [{
            pattern: "^-?\\d+$"
          }]
        };
      case "Symbol":
      case "UniqueSymbol":
        return {
          type: "string",
          allOf: [{
            pattern: "^Symbol\\((.*)\\)$"
          }]
        };
      case "Declaration": {
        return {};
      }
      case "Suspend":
        return recur3(representation.thunk, [...path, "thunk"]);
      case "Never":
        return {
          not: {}
        };
      case "String":
        return {
          type: "string"
        };
      case "Number":
        return {
          anyOf: [{
            type: "number"
          }, {
            type: "string",
            enum: ["NaN"]
          }, {
            type: "string",
            enum: ["Infinity"]
          }, {
            type: "string",
            enum: ["-Infinity"]
          }]
        };
      case "Boolean":
        return {
          type: "boolean"
        };
      case "Literal": {
        const literal = representation.literal;
        return typeof literal === "bigint" ? {
          type: "string",
          enum: [globalThis.String(literal)]
        } : {
          type: typeof literal,
          enum: [literal]
        };
      }
      case "Enum": {
        const types = representation.enums.map(([title, literal]) => typeof literal === "number" && !globalThis.Number.isFinite(literal) ? {
          type: "string",
          enum: [globalThis.String(literal)],
          title
        } : {
          type: typeof literal,
          enum: [literal],
          title
        });
        return types.length === 0 ? {
          not: {}
        } : {
          anyOf: types
        };
      }
      case "TemplateLiteral":
        return {
          type: "string",
          pattern: `^${representation.parts.map(getPartPattern).join("")}$`
        };
      case "Arrays": {
        if (representation.rest.length > 1) {
          throw errorWithPath("Invalid schema representation document", [...path, "rest"]);
        }
        const out = {
          type: "array"
        };
        let minItems = representation.elements.length;
        const prefixItems = representation.elements.map((element, index2) => {
          if (element.isOptional) minItems--;
          const compiled = recur3(element.type, [...path, "elements", index2, "type"]);
          const annotations = collectJsonSchemaAnnotations(element.annotations, options2);
          return annotations === void 0 ? compiled : appendJsonSchema(compiled, annotations);
        });
        if (prefixItems.length > 0) {
          out.prefixItems = prefixItems;
          out.maxItems = representation.elements.length;
          if (minItems > 0) out.minItems = minItems;
        } else {
          out.items = false;
        }
        if (representation.rest.length === 1) {
          delete out.maxItems;
          const rest = recur3(representation.rest[0], [...path, "rest", 0]);
          if (Object.keys(rest).length > 0) out.items = rest;
          else delete out.items;
        }
        return out;
      }
      case "Objects": {
        if (representation.propertySignatures.length === 0 && representation.indexSignatures.length === 0) {
          return {
            anyOf: [{
              type: "object"
            }, {
              type: "array"
            }]
          };
        }
        const out = {
          type: "object"
        };
        const properties = {};
        const required3 = [];
        for (let index2 = 0; index2 < representation.propertySignatures.length; index2++) {
          const property = representation.propertySignatures[index2];
          if (typeof property.name !== "string") {
            throw errorWithPath("Invalid schema representation document", [...path, "propertySignatures", index2, "name"]);
          }
          const name = property.name;
          const compiled = recur3(property.type, [...path, "propertySignatures", index2, "type"]);
          const annotations = collectJsonSchemaAnnotations(property.annotations, options2);
          assignProperty(properties, name, annotations === void 0 ? compiled : appendJsonSchema(compiled, annotations));
          if (!property.isOptional) required3.push(name);
        }
        if (representation.propertySignatures.length > 0) out.properties = properties;
        if (required3.length > 0) out.required = required3;
        const patternProperties = {};
        const additionalProperties = [];
        for (let index2 = 0; index2 < representation.indexSignatures.length; index2++) {
          const signature = representation.indexSignatures[index2];
          let type = recur3(signature.type, [...path, "indexSignatures", index2, "type"]);
          if (Object.keys(type).length === 1 && "not" in type) type = false;
          const patterns = getParameterPatterns(signature.parameter, [...path, "indexSignatures", index2, "parameter"], /* @__PURE__ */ new Set());
          if (patterns.length === 0) {
            additionalProperties.push(type);
          } else {
            for (const pattern of patterns) {
              const previous = patternProperties[pattern];
              assignProperty(patternProperties, pattern, previous === void 0 ? type : previous === false || type === false ? false : appendJsonSchema(previous, type));
            }
          }
        }
        const hasPatternProperties = Object.keys(patternProperties).length > 0;
        if (hasPatternProperties) {
          out.patternProperties = patternProperties;
        }
        if (representation.indexSignatures.length === 0) {
          out.additionalProperties = options2?.additionalProperties ?? false;
        } else if (additionalProperties.length === 1 && representation.propertySignatures.length === 0 && !hasPatternProperties) {
          out.additionalProperties = additionalProperties[0];
        } else if (additionalProperties.length > 0) {
          out.allOf = additionalProperties.map((type) => ({
            type: "object",
            additionalProperties: type
          }));
        }
        if (typeof out.additionalProperties === "object" && out.additionalProperties !== null && Object.keys(out.additionalProperties).length === 0) {
          delete out.additionalProperties;
        }
        return out;
      }
      case "Union": {
        const types = representation.types.map((type, index2) => recur3(type, [...path, "types", index2]));
        if (types.length === 0) return {
          not: {}
        };
        if (representation.mode === "anyOf" && types.length > 1) {
          const compacted = compactEnums(types);
          if (compacted !== void 0) return compacted;
        }
        return representation.mode === "anyOf" ? {
          anyOf: types
        } : {
          oneOf: types
        };
      }
    }
  }
  function getParameterPatterns(parameter, path, seenReferences) {
    switch (parameter._tag) {
      case "Reference": {
        if (!Object.hasOwn(references, parameter.$ref)) {
          throw errorWithPath(`Invalid reference ${parameter.$ref}`, [...path, "$ref"]);
        }
        compileDefinition(parameter.$ref, path);
        if (seenReferences.has(parameter.$ref)) return [];
        const next = new Set(seenReferences).add(parameter.$ref);
        return getParameterPatterns(references[parameter.$ref], ["references", parameter.$ref], next);
      }
      case "String":
        return collectPatterns(recur3(parameter, path));
      case "TemplateLiteral":
        return [`^${parameter.parts.map(getPartPattern).join("")}$`];
      case "Union":
        return parameter.types.flatMap((type, index2) => getParameterPatterns(type, [...path, "types", index2], seenReferences));
      default:
        throw errorWithPath("Invalid schema representation document", path);
    }
  }
}
function isJsonSchemaType(input) {
  return input === "string" || input === "number" || input === "boolean" || input === "array" || input === "object" || input === "null" || input === "integer";
}
function compactEnums(schemas) {
  let sharedType = void 0;
  const values2 = [];
  for (const schema of schemas) {
    const keys4 = Object.keys(schema);
    if (keys4.length !== 2 || schema.type === void 0 || !Array.isArray(schema.enum) || schema.enum.length === 0) {
      return void 0;
    }
    if (sharedType === void 0) sharedType = schema.type;
    else if (schema.type !== sharedType) return void 0;
    values2.push(...schema.enum);
  }
  return {
    type: sharedType,
    enum: values2
  };
}
function collectPatterns(schema) {
  const patterns = [];
  if (typeof schema.pattern === "string") patterns.push(schema.pattern);
  for (const key of ["allOf", "anyOf", "oneOf"]) {
    const members = schema[key];
    if (Array.isArray(members)) {
      for (const member of members) {
        if (typeof member === "object" && member !== null && !Array.isArray(member)) {
          patterns.push(...collectPatterns(member));
        }
      }
    }
  }
  return patterns;
}
function getPartPattern(part) {
  switch (part._tag) {
    case "Literal":
      return escape(globalThis.String(part.literal));
    case "String":
      return STRING_PATTERN;
    case "Number":
      return FINITE_PATTERN;
    case "TemplateLiteral":
      return part.parts.map(getPartPattern).join("");
    case "Union":
      return part.types.map(getPartPattern).join("|");
    default:
      throw errorWithPath("Invalid schema representation document", []);
  }
}
function toJsonSchemaDocument(document, options2) {
  const output = compileJsonSchema([document.representation], [["representation"]], document.references, options2);
  return {
    dialect: output.dialect,
    schema: output.schemas[0],
    definitions: output.definitions
  };
}

// node_modules/effect/dist/internal/schema/toRepresentation.js
var defaultReferencePolicy = ({
  identifier: identifier2
}) => identifier2;
function annotationsField(annotations) {
  return annotations === void 0 ? void 0 : {
    annotations
  };
}
function toRepresentation(ast, options2) {
  const {
    references,
    representations
  } = toRepresentations([ast], options2);
  return {
    representation: representations[0],
    references
  };
}
function toRepresentations(asts, options2) {
  const references = {};
  const referenceOwners = /* @__PURE__ */ new Map();
  const buildingReferences = /* @__PURE__ */ new Set();
  const candidates = /* @__PURE__ */ new Map();
  const visitingCandidates = /* @__PURE__ */ new Set();
  for (const ast of asts) visit(ast);
  const referencePolicy = options2?.referencePolicy ?? defaultReferencePolicy;
  for (const candidatesByIdentifier of candidates.values()) {
    for (const candidate of candidatesByIdentifier.values()) {
      const requestedReference = referencePolicy({
        ast: candidate.ast,
        occurrences: candidate.occurrences,
        identifier: candidate.identifier
      });
      if (requestedReference !== void 0) {
        const separator = requestedReference === candidate.identifier || !requestedReference.endsWith("_") ? "_" : "";
        candidate.reference = getReference(requestedReference, candidate, separator);
      } else if (candidate.isRecursive) {
        candidate.reference = getReference(`${candidate.ast._tag}_`, candidate, "");
      }
    }
  }
  const representations = map4(asts, (ast) => recur3(ast));
  return {
    representations,
    references
  };
  function getReference(prefix, owner, separator = "_") {
    let candidate = prefix;
    let suffix = 0;
    while (referenceOwners.has(candidate)) {
      if (referenceOwners.get(candidate) === owner) return candidate;
      candidate = `${prefix}${separator}${++suffix}`;
    }
    referenceOwners.set(candidate, owner);
    return candidate;
  }
  function annotateReference(ast, candidate, reference) {
    const fallback = candidate.fallback;
    if (fallback !== void 0) {
      return resolveIdentifierFallback(ast) === fallback ? ast : annotate(ast, {
        [IDENTIFIER_FALLBACK_KEY]: fallback
      });
    }
    return reference === candidate.identifier ? ast : annotate(ast, {
      identifier: reference
    });
  }
  function makeReference(reference, ast) {
    if (!Object.hasOwn(references, reference) && !buildingReferences.has(reference)) {
      buildingReferences.add(reference);
      const representation = on(ast);
      buildingReferences.delete(reference);
      assignProperty(references, reference, representation);
    }
    return {
      _tag: "Reference",
      $ref: reference
    };
  }
  function getCandidate(input) {
    const ast = getLastEncoding(input);
    const owner = getContextOwner(ast);
    let identifier2 = resolveIdentifier(ast);
    const fallback = identifier2 === void 0 ? (ast !== input ? resolveIdentifier(input) : void 0) ?? resolveIdentifierFallback(ast) : void 0;
    if (fallback !== void 0) identifier2 = `${fallback}Encoded`;
    let candidatesByIdentifier = candidates.get(owner);
    if (candidatesByIdentifier === void 0) {
      candidatesByIdentifier = /* @__PURE__ */ new Map();
      candidates.set(owner, candidatesByIdentifier);
    }
    let candidate = candidatesByIdentifier.get(identifier2);
    if (candidate === void 0) {
      candidate = {
        ast: owner,
        identifier: identifier2,
        fallback,
        occurrences: 0,
        isRecursive: false,
        reference: void 0
      };
      candidatesByIdentifier.set(identifier2, candidate);
    }
    return candidate;
  }
  function visit(input) {
    const candidate = getCandidate(input);
    const ast = candidate.ast;
    candidate.occurrences++;
    if (visitingCandidates.has(candidate)) {
      candidate.isRecursive = true;
      return;
    }
    if (candidate.occurrences > 1) return;
    visitingCandidates.add(candidate);
    visitChecks(ast.checks);
    switch (ast._tag) {
      case "Declaration":
      case "Arrays":
      case "Objects":
      case "Union":
        ast.recur((child) => {
          visit(child);
          return child;
        });
        break;
      case "TemplateLiteral":
        ast.parts.forEach(visit);
        break;
      case "Suspend":
        visit(ast.thunk());
        break;
    }
    visitingCandidates.delete(candidate);
  }
  function visitChecks(checks) {
    checks?.forEach((check2) => {
      check2.annotations?.representation?.schemas?.forEach((schema) => visit(toType(schema)));
      if (check2._tag === "FilterGroup") visitChecks(check2.checks);
    });
  }
  function recur3(input) {
    const candidate = getCandidate(input);
    const ast = candidate.ast;
    const reference = candidate.reference;
    if (reference !== void 0) {
      const annotated = candidate.identifier === void 0 ? ast : annotateReference(ast, candidate, reference);
      return makeReference(reference, annotated);
    }
    return on(ast);
  }
  function on(ast) {
    const checks = fromChecks(ast.checks);
    switch (ast._tag) {
      case "Declaration":
        return {
          _tag: "Declaration",
          typeParameters: ast.typeParameters.map((ast2) => recur3(ast2)),
          checks,
          ...fromDeclarationAnnotations(ast.annotations)
        };
      case "Null":
      case "Undefined":
      case "Void":
      case "Never":
      case "Unknown":
      case "Any":
      case "String":
      case "Boolean":
      case "Number":
      case "BigInt":
      case "Symbol":
      case "ObjectKeyword":
        return {
          _tag: ast._tag,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Literal":
        return {
          _tag: "Literal",
          literal: ast.literal,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "UniqueSymbol":
        return {
          _tag: "UniqueSymbol",
          symbol: ast.symbol,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Enum":
        return {
          _tag: "Enum",
          enums: ast.enums,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "TemplateLiteral":
        return {
          _tag: "TemplateLiteral",
          parts: ast.parts.map((ast2) => recur3(ast2)),
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Arrays":
        return {
          _tag: "Arrays",
          elements: ast.elements.map((element) => {
            const projected = getLastEncoding(element);
            const annotations = projected.context?.annotations;
            return {
              isOptional: isOptional(projected),
              type: recur3(element),
              ...annotationsField(annotations)
            };
          }),
          rest: ast.rest.map((ast2) => recur3(ast2)),
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Objects":
        return {
          _tag: "Objects",
          propertySignatures: ast.propertySignatures.map((property) => {
            const projected = getLastEncoding(property.type);
            const annotations = projected.context?.annotations;
            return {
              name: property.name,
              type: recur3(property.type),
              isOptional: isOptional(projected),
              isMutable: isMutable(projected),
              ...annotationsField(annotations)
            };
          }),
          indexSignatures: ast.indexSignatures.map((index2) => ({
            parameter: recur3(index2.parameter),
            type: recur3(index2.type)
          })),
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Union":
        return {
          _tag: "Union",
          types: ast.types.map((ast2) => recur3(ast2)),
          mode: ast.mode,
          checks,
          ...annotationsField(ast.annotations)
        };
      case "Suspend":
        return {
          _tag: "Suspend",
          checks: [],
          thunk: recur3(ast.thunk()),
          ...annotationsField(ast.annotations)
        };
    }
  }
  function fromChecks(checks) {
    return checks?.map(fromCheck) ?? [];
  }
  function fromCheck(check2) {
    switch (check2._tag) {
      case "Filter":
        return {
          _tag: "Filter",
          aborted: check2.aborted,
          ...fromCheckAnnotations(check2.annotations)
        };
      case "FilterGroup":
        return {
          _tag: "FilterGroup",
          checks: map4(check2.checks, fromCheck),
          ...fromCheckAnnotations(check2.annotations)
        };
    }
  }
  function fromDeclarationAnnotations(annotations) {
    if (annotations === void 0) return void 0;
    const {
      representation,
      ...ordinary
    } = annotations;
    return {
      ...representation === void 0 ? void 0 : {
        representation
      },
      ...Object.keys(ordinary).length === 0 ? void 0 : {
        annotations: ordinary
      }
    };
  }
  function fromCheckAnnotations(annotations) {
    if (annotations === void 0) return void 0;
    const {
      representation,
      ...ordinary
    } = annotations;
    const projected = representation === void 0 ? void 0 : representation.schemas === void 0 ? representation : {
      ...representation,
      schemas: representation.schemas.map((schema) => recur3(toType(schema)))
    };
    return {
      ...projected === void 0 ? void 0 : {
        representation: projected
      },
      ...Object.keys(ordinary).length === 0 ? void 0 : {
        annotations: ordinary
      }
    };
  }
}

// node_modules/effect/dist/JsonPatch.js
function get4(oldValue, newValue) {
  const patches = [];
  getLoop(oldValue, newValue, "", patches);
  return patches;
}
function getLoop(oldValue, newValue, path, patches) {
  if (Object.is(oldValue, newValue)) return;
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    const len1 = oldValue.length;
    const len2 = newValue.length;
    const shared = Math.min(len1, len2);
    for (let i = 0; i < shared; i++) {
      getLoop(oldValue[i], newValue[i], `${path}/${i}`, patches);
    }
    for (let i = len1 - 1; i >= len2; i--) {
      patches.push({
        op: "remove",
        path: `${path}/${i}`
      });
    }
    for (let i = len1; i < len2; i++) {
      patches.push({
        op: "add",
        path: `${path}/${i}`,
        value: newValue[i]
      });
    }
    return;
  }
  if (isJsonObject(oldValue) && isJsonObject(newValue)) {
    const keys1 = Object.keys(oldValue);
    const keys22 = Object.keys(newValue);
    const allKeys = Array.from(/* @__PURE__ */ new Set([...keys1, ...keys22])).sort();
    for (const key of allKeys) {
      const keyPath = `${path}/${escapeToken(key)}`;
      const hasKey1 = Object.hasOwn(oldValue, key);
      const hasKey2 = Object.hasOwn(newValue, key);
      if (hasKey1 && hasKey2) {
        getLoop(oldValue[key], newValue[key], keyPath, patches);
      } else if (!hasKey1 && hasKey2) {
        patches.push({
          op: "add",
          path: keyPath,
          value: newValue[key]
        });
      } else {
        patches.push({
          op: "remove",
          path: keyPath
        });
      }
    }
    return;
  }
  patches.push({
    op: "replace",
    path,
    value: newValue
  });
}
function apply(patch, oldValue) {
  let doc = oldValue;
  for (const op of patch) {
    doc = applyOperation(doc, op);
  }
  return doc;
}
function isJsonObject(value3) {
  return typeof value3 === "object" && value3 !== null && !Array.isArray(value3);
}
function tokenize(pointer) {
  if (pointer === "") return [];
  if (pointer.charCodeAt(0) !== 47) {
    throw new Error(`Invalid JSON Pointer, it must start with "/": ${JSON.stringify(pointer)}`);
  }
  return pointer.split("/").slice(1).map(unescapeToken);
}
function toIndex(token) {
  if (!/^(0|[1-9]\d*)$/.test(token)) {
    throw new Error(`Invalid array index: "${token}"`);
  }
  return Number(token);
}
function applyOperation(doc, op) {
  if (op.path === "") {
    if (op.op === "remove") throw new Error("Unsupported operation at the root");
    return op.value;
  }
  const resolved = resolveParent(doc, op.path);
  if (resolved === null) {
    throw new Error(`Cannot ${op.op} at "${op.path}" (parent not found or not a container).`);
  }
  const {
    lastToken,
    parent,
    stack
  } = resolved;
  if (Array.isArray(parent)) {
    if (lastToken === "-" && op.op !== "add") {
      throw new Error(`"-" is not valid for ${op.op} at "${op.path}".`);
    }
    const index2 = lastToken === "-" ? parent.length : toIndex(lastToken);
    const maxIndex = op.op === "add" ? parent.length : parent.length - 1;
    if (index2 > maxIndex) throw new Error(`Array index out of bounds at "${op.path}".`);
    const updated = parent.slice();
    if (op.op === "add") updated.splice(index2, 0, op.value);
    else if (op.op === "remove") updated.splice(index2, 1);
    else updated[index2] = op.value;
    return rebuildFromStack(stack, updated);
  }
  if (isJsonObject(parent)) {
    if (op.op !== "add" && !Object.hasOwn(parent, lastToken)) {
      throw new Error(`Property "${lastToken}" does not exist at "${op.path}".`);
    }
    const updated = {
      ...parent
    };
    if (op.op === "remove") delete updated[lastToken];
    else assignProperty(updated, lastToken, op.value);
    return rebuildFromStack(stack, updated);
  }
  throw new Error(`Cannot ${op.op} at "${op.path}" (parent not found or not a container).`);
}
function resolveParent(doc, pointer) {
  const tokens = tokenize(pointer);
  if (tokens.length === 0) return null;
  const lastToken = tokens[tokens.length - 1];
  const stack = [];
  let cur = doc;
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    if (Array.isArray(cur)) {
      const idx = toIndex(token);
      if (idx >= cur.length) return null;
      stack.push({
        container: cur,
        token: idx
      });
      cur = cur[idx];
      continue;
    }
    if (isJsonObject(cur)) {
      if (!Object.hasOwn(cur, token)) return null;
      stack.push({
        container: cur,
        token
      });
      cur = cur[token];
      continue;
    }
    return null;
  }
  return {
    stack,
    parent: cur,
    lastToken
  };
}
function rebuildFromStack(stack, newParent) {
  let acc = newParent;
  for (let i = stack.length - 1; i >= 0; i--) {
    const {
      container,
      token
    } = stack[i];
    if (Array.isArray(container)) {
      const copy2 = container.slice();
      copy2[token] = acc;
      acc = copy2;
    } else {
      const copy2 = {
        ...container
      };
      assignProperty(copy2, token, acc);
      acc = copy2;
    }
  }
  return acc;
}

// node_modules/effect/dist/Optic.js
function makeIso(get5, set2) {
  return make17(primitiveNode("Iso", get5, set2));
}
function makeLens(get5, replace) {
  return make17(primitiveNode("Lens", get5, replace));
}
function primitiveNode(kind, get5, set2) {
  return [{
    _tag: "PrimitiveNode",
    kind,
    get: get5,
    set: set2
  }];
}
var identityOperation = {
  kind: "Iso",
  get: identity,
  set: identity
};
var PathNode = class {
  _tag = "PathNode";
  kind = "Lens";
  path;
  get;
  set;
  constructor(path) {
    this.path = path;
    this.get = (s) => {
      let out = s;
      for (let i = 0; i < path.length; i++) {
        out = out[path[i]];
      }
      return out;
    };
    this.set = (a, s) => {
      const out = cloneShallow(s);
      let current = out;
      let i = 0;
      for (; i < path.length - 1; i++) {
        const key = path[i];
        assignProperty(current, key, cloneShallow(current[key]));
        current = current[key];
      }
      assignProperty(current, path[i], a);
      return out;
    };
  }
};
var CheckNode = class {
  _tag = "CheckNode";
  kind = "Prism";
  checks;
  get;
  set = identity;
  constructor(checks) {
    this.checks = checks;
    this.get = (s) => runChecks(checks, s);
  }
};
function compose(a, b) {
  if (a.length === 0) return b;
  if (b.length === 0) return a;
  const nodes = a.slice();
  for (let i = 0; i < b.length; i++) {
    const node = b[i];
    const last = nodes[nodes.length - 1];
    if (last._tag === "PathNode" && node._tag === "PathNode") {
      nodes[nodes.length - 1] = new PathNode([...last.path, ...node.path]);
    } else if (last._tag === "CheckNode" && node._tag === "CheckNode") {
      nodes[nodes.length - 1] = new CheckNode([...last.checks, ...node.checks]);
    } else {
      nodes.push(node);
    }
  }
  return nodes;
}
function makeOptional(getResult, set2) {
  return make17(primitiveNode("Optional", getResult, set2));
}
var OptionalImpl = class {
  /** @internal */
  node;
  getResult;
  replaceResult;
  constructor(node, getResult, replaceResult) {
    this.node = node;
    this.getResult = getResult;
    this.replaceResult = replaceResult;
  }
  replace(a, s) {
    return getOrElse2(this.replaceResult(a, s), () => s);
  }
  modify(f) {
    return (s) => getOrElse2(flatMap2(this.getResult(s), (a) => this.replaceResult(f(a), s)), () => s);
  }
  compose(that) {
    return make17(compose(this.node, that.node));
  }
  key(key) {
    return make17(compose(this.node, [new PathNode([key])]));
  }
  optionalKey(key) {
    return make17(compose(this.node, primitiveNode("Lens", (s) => s[key], (a, s) => {
      const copy2 = cloneShallow(s);
      if (a === void 0) {
        if (Array.isArray(copy2) && typeof key === "number") {
          copy2.splice(key, 1);
        } else {
          delete copy2[key];
        }
      } else {
        assignProperty(copy2, key, a);
      }
      return copy2;
    })));
  }
  check(...checks) {
    return make17(compose(this.node, [new CheckNode(checks)]));
  }
  refine(refinement, annotations) {
    return make17(compose(this.node, [new CheckNode([makeFilterByGuard(refinement, annotations)])]));
  }
  tag(tag2) {
    const err = fail2(new InvalidValue({
      expected: `${JSON.stringify(tag2)} tag`
    }));
    return make17(compose(this.node, primitiveNode("Prism", (s) => s._tag === tag2 ? succeed2(s) : err, identity)));
  }
  at(key, ..._rest) {
    const err = fail2(new Pointer([key], new MissingKey(void 0)));
    return make17(compose(this.node, primitiveNode("Optional", (s) => Object.hasOwn(s, key) ? succeed2(s[key]) : err, (a, s) => {
      if (Object.hasOwn(s, key)) {
        const copy2 = cloneShallow(s);
        assignProperty(copy2, key, a);
        return succeed2(copy2);
      } else {
        return err;
      }
    })));
  }
  pick(keys4) {
    return this.compose(makeLens(pick(keys4), (p, a) => ({
      ...a,
      ...p
    })));
  }
  omit(keys4) {
    return this.compose(makeLens(omit2(keys4), (o, a) => ({
      ...a,
      ...o
    })));
  }
  notUndefined() {
    return this.refine(isNotUndefined, {
      expected: "a value other than `undefined`"
    });
  }
  forEach(f) {
    const inner = f(id());
    return makeOptional(
      // GET: collect focused Bs
      (s) => map2(this.getResult(s), (as4) => {
        const bs = [];
        for (let i = 0; i < as4.length; i++) {
          const r = inner.getResult(as4[i]);
          if (isSuccess2(r)) bs.push(r.success);
        }
        return bs;
      }),
      // SET: bs must match the number of focusable elements
      (bs, s) => flatMap2(this.getResult(s), (as4) => {
        const idxs = [];
        for (let i = 0; i < as4.length; i++) {
          if (isSuccess2(inner.getResult(as4[i]))) idxs.push(i);
        }
        if (bs.length !== idxs.length) {
          return fail2(new InvalidValue({
            message: `each: replacement length mismatch: ${bs.length} !== ${idxs.length}`
          }));
        }
        const out = as4.slice();
        for (let k = 0; k < idxs.length; k++) {
          const i = idxs[k];
          const r = inner.replaceResult(bs[k], as4[i]);
          if (isFailure2(r)) {
            return fail2(new Pointer([i], r.failure));
          }
          out[i] = r.success;
        }
        return this.replaceResult(out, s);
      })
    );
  }
  modifyAll(f) {
    return (s) => getOrElse2(flatMap2(this.getResult(s), (as4) => this.replaceResult(as4.map(f), s)), () => s);
  }
};
var IsoImpl = class extends OptionalImpl {
  get;
  set;
  constructor(node, get5, set2) {
    super(node, (s) => succeed2(get5(s)), (a) => succeed2(set2(a)));
    this.get = get5;
    this.set = set2;
  }
  replace(a, _) {
    return this.set(a);
  }
  modify(f) {
    return (s) => this.set(f(this.get(s)));
  }
};
var LensImpl = class extends OptionalImpl {
  get;
  constructor(node, get5, replace) {
    super(node, (s) => succeed2(get5(s)), (a, s) => succeed2(replace(a, s)));
    this.get = get5;
    this.replace = replace;
  }
  modify(f) {
    return (s) => this.replace(f(this.get(s)), s);
  }
};
var PrismImpl = class extends OptionalImpl {
  set;
  constructor(node, getResult, set2) {
    super(node, getResult, (a, _) => succeed2(set2(a)));
    this.set = set2;
  }
  replace(a, _) {
    return this.set(a);
  }
  modify(f) {
    return (s) => getOrElse2(map2(this.getResult(s), (a) => this.set(f(a))), () => s);
  }
};
function make17(node) {
  let op = node[0] ?? identityOperation;
  if (node.length > 1) {
    const kind = node.reduce((kind2, step) => composeKind(kind2, step.kind), "Iso");
    op = {
      kind,
      get: compileGet(node, kind),
      set: compileSet(node, kind)
    };
  }
  switch (op.kind) {
    case "Iso":
      return new IsoImpl(node, op.get, op.set);
    case "Lens":
      return new LensImpl(node, op.get, op.set);
    case "Prism":
      return new PrismImpl(node, op.get, op.set);
    case "Optional":
      return new OptionalImpl(node, op.get, op.set);
  }
}
function cloneShallow(pojo) {
  if (Array.isArray(pojo)) return pojo.slice();
  if (typeof pojo === "object" && pojo !== null) {
    const proto = Object.getPrototypeOf(pojo);
    if (proto !== Object.prototype && proto !== null) {
      throw new Error("Cannot clone object with non-Object constructor or null prototype");
    }
    return {
      ...pojo
    };
  }
  return pojo;
}
function compileGet(nodes, kind) {
  return (s) => {
    for (let i = 0; i < nodes.length; i++) {
      const op = nodes[i];
      const result3 = op.get(s);
      if (hasFailingGet(op.kind)) {
        if (isFailure2(result3)) {
          return result3;
        }
        s = result3.success;
      } else {
        s = result3;
      }
    }
    return hasFailingGet(kind) ? succeed2(s) : s;
  };
}
function compileSet(nodes, kind) {
  if (hasSourceFreeSet(kind)) {
    return (a) => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        a = nodes[i].set(a);
      }
      return a;
    };
  }
  return (a, s) => {
    const len = nodes.length;
    const sources = new Array(len);
    for (let i = 0; i < len; i++) {
      sources[i] = s;
      const op = nodes[i];
      if (hasFailingGet(op.kind)) {
        const result3 = op.get(s);
        if (isFailure2(result3)) {
          return result3;
        }
        s = result3.success;
      } else {
        s = op.get(s);
      }
    }
    for (let i = len - 1; i >= 0; i--) {
      const op = nodes[i];
      if (hasSourceFreeSet(op.kind)) {
        a = op.set(a);
      } else if (op.kind === "Lens") {
        a = op.set(a, sources[i]);
      } else {
        const result3 = op.set(a, sources[i]);
        if (isFailure2(result3)) {
          return result3;
        }
        a = result3.success;
      }
    }
    return kind === "Optional" ? succeed2(a) : a;
  };
}
function hasFailingGet(kind) {
  return kind === "Prism" || kind === "Optional";
}
function hasSourceFreeSet(kind) {
  return kind === "Iso" || kind === "Prism";
}
function composeKind(a, b) {
  if (a === "Iso") return b;
  if (b === "Iso" || a === b) return a;
  return "Optional";
}
var identityIso = /* @__PURE__ */ make17([]);
function id() {
  return identityIso;
}

// node_modules/effect/dist/internal/redacted.js
var redactedRegistry = /* @__PURE__ */ new WeakMap();
var value = (self) => {
  if (redactedRegistry.has(self)) {
    return redactedRegistry.get(self);
  } else {
    throw new Error("Unable to get redacted value" + (self.label ? ` with label: "${self.label}"` : ""));
  }
};

// node_modules/effect/dist/Redacted.js
var TypeId21 = "~effect/data/Redacted";
var isRedacted = (u) => hasProperty(u, TypeId21);
var make18 = (value3, options2) => {
  const self = Object.create(Proto4);
  if (options2?.label) {
    self.label = options2.label;
  }
  redactedRegistry.set(self, value3);
  return self;
};
var Proto4 = {
  [TypeId21]: {
    _A: (_) => _
  },
  label: void 0,
  ...PipeInspectableProto,
  toJSON() {
    return this.toString();
  },
  toString() {
    return `<redacted${isString(this.label) ? ":" + this.label : ""}>`;
  },
  [symbol]() {
    return hash(redactedRegistry.get(this));
  },
  [symbol2](that) {
    return isRedacted(that) && equals(redactedRegistry.get(this), redactedRegistry.get(that));
  }
};
var value2 = value;
var makeEquivalence5 = (isEquivalent) => make2((x, y) => isEquivalent(value2(x), value2(y)));

// node_modules/effect/dist/Schema.js
var TypeId22 = TypeId20;
function declareConstructor() {
  return (typeParameters, run2, annotations) => {
    return make19(new Declaration(typeParameters.map(getAST), (typeParameters2) => run2(typeParameters2.map((ast) => make19(ast))), annotations));
  };
}
function declare(is3, annotations) {
  return declareConstructor()([], () => (input, ast, options2) => is3(input) ? succeed6(input) : fail5(new InvalidType(ast, input, options2)), annotations);
}
function revealBottom(bottom) {
  return bottom;
}
function annotate2(annotations) {
  return (self) => self.annotate(annotations);
}
function annotateEncoded(annotations) {
  return (self) => flip4(flip4(self).annotate(annotations));
}
function annotateKey2(annotations) {
  return (self) => {
    return self.rebuild(annotateKey(self.ast, annotations));
  };
}
function revealCodec(codec) {
  return codec;
}
var SchemaErrorTypeId = "~effect/SchemaError/SchemaError";
var SchemaError = class extends (/* @__PURE__ */ TaggedError2("SchemaError")) {
  [SchemaErrorTypeId] = SchemaErrorTypeId;
  constructor(issue) {
    const stackTraceLimit = getStackTraceLimit();
    setStackTraceLimit(0);
    try {
      super({
        issue
      });
    } finally {
      setStackTraceLimit(stackTraceLimit);
    }
  }
  get message() {
    return defaultFormatter(this.issue);
  }
  toString() {
    return `SchemaError(${this.message})`;
  }
};
function isSchemaError(u) {
  return hasProperty(u, SchemaErrorTypeId) && u[SchemaErrorTypeId] === SchemaErrorTypeId;
}
function makeStandardResult(exit3) {
  return isSuccess4(exit3) ? exit3.value : {
    issues: [{
      message: pretty(exit3.cause)
    }]
  };
}
function toStandardSchemaV1(self, options2) {
  const decodeUnknownEffect3 = decodeUnknownEffect(self);
  const parseOptions = {
    errors: "all",
    ...options2?.parseOptions
  };
  const formatter = makeFormatterStandardSchemaV1(options2);
  const validate3 = (value3) => {
    const scheduler = new MixedScheduler("sync");
    const fiber3 = runFork2(match6(decodeUnknownEffect3(value3, parseOptions), {
      onFailure: formatter,
      onSuccess: (value4) => ({
        value: value4
      })
    }), {
      scheduler
    });
    fiber3.currentDispatcher?.flush();
    const exit3 = fiber3.pollUnsafe();
    if (exit3) {
      return makeStandardResult(exit3);
    }
    return new Promise((resolve2) => {
      fiber3.addObserver((exit4) => {
        resolve2(makeStandardResult(exit4));
      });
    });
  };
  if ("~standard" in self) {
    const out = self;
    if ("validate" in out["~standard"]) return out;
    Object.assign(out["~standard"], {
      validate: validate3
    });
    return out;
  } else {
    return Object.assign(self, {
      "~standard": {
        version: 1,
        vendor: "effect",
        validate: validate3
      }
    });
  }
}
function toBaseStandardJSONSchemaV1(self, target) {
  const doc2020_12 = toJsonSchemaDocument2(self);
  if (target === "draft-2020-12") {
    const schema = doc2020_12.schema;
    if (Object.keys(doc2020_12.definitions).length > 0) {
      schema.$defs = doc2020_12.definitions;
    }
    return schema;
  } else if (target === "draft-07") {
    const doc07 = toDocumentDraft07(doc2020_12);
    const schema = doc07.schema;
    if (Object.keys(doc07.definitions).length > 0) {
      schema.definitions = doc07.definitions;
    }
    return schema;
  }
  throw new globalThis.Error(`Unsupported target: ${target}`);
}
function toStandardJSONSchemaV1(self) {
  const jsonSchema = {
    input(options2) {
      return toBaseStandardJSONSchemaV1(self, options2.target);
    },
    output(options2) {
      return toBaseStandardJSONSchemaV1(toType2(self), options2.target);
    }
  };
  if ("~standard" in self) {
    const out = self;
    if ("jsonSchema" in out["~standard"]) return out;
    Object.assign(out["~standard"], {
      jsonSchema
    });
    return out;
  } else {
    return Object.assign(self, {
      "~standard": {
        version: 1,
        vendor: "effect",
        jsonSchema
      }
    });
  }
}
var is2 = is;
var asserts2 = asserts;
function decodeUnknownEffect2(schema, options2) {
  const parser = decodeUnknownEffect(schema, options2);
  return (input, options3) => {
    return fromIssueEffect(parser(input, options3));
  };
}
function fromIssueEffect(self) {
  if (effectIsExit(self)) {
    return fromIssueExit(self);
  }
  return catchCause2(self, (cause) => failCauseSync2(() => map6(cause, (issue) => new SchemaError(issue))));
}
var decodeEffect2 = decodeUnknownEffect2;
function getSchemaErrorOrThrow(cause, message) {
  let schemaError;
  for (const reason of cause.reasons) {
    if (!isFailReason2(reason) || !isSchemaError(reason.error)) {
      throw new globalThis.Error(message, {
        cause
      });
    }
    schemaError ??= reason.error;
  }
  if (schemaError === void 0) {
    throw new globalThis.Error(message, {
      cause
    });
  }
  return schemaError;
}
function runSchemaErrorPromise(self) {
  return runPromiseExit2(self).then((exit3) => {
    if (isSuccess4(exit3)) {
      return exit3.value;
    }
    throw getSchemaErrorOrThrow(exit3.cause, "Promise adapter can only reject schema errors");
  });
}
function runSchemaErrorSync(self) {
  const exit3 = runSyncExit2(self);
  if (isSuccess4(exit3)) {
    return exit3.value;
  }
  throw getSchemaErrorOrThrow(exit3.cause, "Sync adapter can only throw schema errors");
}
function decodeUnknownExit2(schema, options2) {
  const parser = decodeUnknownExit(schema, options2);
  return (input, options3) => {
    return fromIssueExit(parser(input, options3));
  };
}
function fromIssueExit(exit3) {
  return isSuccess4(exit3) ? exit3 : failCause2(map6(exit3.cause, (issue) => new SchemaError(issue)));
}
var decodeExit = decodeUnknownExit2;
var decodeUnknownOption2 = decodeUnknownOption;
var decodeOption2 = decodeOption;
function decodeUnknownResult2(schema, options2) {
  const parser = decodeUnknownResult(schema, options2);
  return (input, options3) => {
    return mapError(parser(input, options3), (issue) => new SchemaError(issue));
  };
}
var decodeResult = decodeUnknownResult2;
function decodeUnknownPromise(schema, options2) {
  const parser = decodeUnknownEffect2(schema, options2);
  return (input, options3) => {
    return runSchemaErrorPromise(parser(input, options3));
  };
}
var decodePromise = decodeUnknownPromise;
function decodeUnknownSync2(schema, options2) {
  const parser = decodeUnknownEffect2(schema, options2);
  return (input, options3) => {
    return runSchemaErrorSync(parser(input, options3));
  };
}
var decodeSync2 = decodeUnknownSync2;
function encodeUnknownEffect2(schema, options2) {
  const parser = encodeUnknownEffect(schema, options2);
  return (input, options3) => {
    return fromIssueEffect(parser(input, options3));
  };
}
var encodeEffect = encodeUnknownEffect2;
function encodeUnknownExit2(schema, options2) {
  const parser = encodeUnknownExit(schema, options2);
  return (input, options3) => {
    return fromIssueExit(parser(input, options3));
  };
}
var encodeExit = encodeUnknownExit2;
var encodeUnknownOption2 = encodeUnknownOption;
var encodeOption2 = encodeOption;
function encodeUnknownResult2(schema, options2) {
  const parser = encodeUnknownResult(schema, options2);
  return (input, options3) => {
    return mapError(parser(input, options3), (issue) => new SchemaError(issue));
  };
}
var encodeResult = encodeUnknownResult2;
function encodeUnknownPromise(schema, options2) {
  const parser = encodeUnknownEffect2(schema, options2);
  return (input, options3) => {
    return runSchemaErrorPromise(parser(input, options3));
  };
}
var encodePromise = encodeUnknownPromise;
function encodeUnknownSync2(schema, options2) {
  const parser = encodeUnknownEffect2(schema, options2);
  return (input, options3) => {
    return runSchemaErrorSync(parser(input, options3));
  };
}
var encodeSync2 = encodeUnknownSync2;
var make19 = make16;
function isSchema(u) {
  return hasProperty(u, TypeId22) && u[TypeId22] === TypeId22;
}
var optionalKey2 = /* @__PURE__ */ lambda((schema) => make19(optionalKey(schema.ast), {
  schema
}));
var requiredKey = /* @__PURE__ */ lambda((self) => self.schema);
var optional2 = /* @__PURE__ */ lambda((self) => {
  const schema = UndefinedOr(self);
  return make19(optional(self.ast), {
    schema
  });
});
var required2 = /* @__PURE__ */ lambda((self) => self.schema.members[0]);
var mutableKey2 = /* @__PURE__ */ lambda((schema) => make19(mutableKey(schema.ast), {
  schema
}));
var readonlyKey = /* @__PURE__ */ lambda((self) => self.schema);
var toType2 = /* @__PURE__ */ lambda((schema) => make19(toType(schema.ast), {
  schema
}));
var toEncoded2 = /* @__PURE__ */ lambda((schema) => make19(toEncoded(schema.ast), {
  schema
}));
var FlipTypeId = "~effect/Schema/flip";
function isFlip$(schema) {
  return hasProperty(schema, FlipTypeId) && schema[FlipTypeId] === FlipTypeId;
}
function flip4(schema) {
  if (isFlip$(schema)) {
    return schema.schema.rebuild(flip3(schema.ast));
  }
  return make19(flip3(schema.ast), {
    [FlipTypeId]: FlipTypeId,
    schema
  });
}
function Literal2(literal) {
  const out = make19(new Literal(literal), {
    literal,
    transform(to) {
      return out.pipe(decodeTo2(Literal2(to), {
        decode: transform(() => to),
        encode: transform(() => literal)
      }));
    }
  });
  return out;
}
function templateLiteralFromParts(parts) {
  return new TemplateLiteral(parts.map((part) => isSchema(part) ? part.ast : new Literal(part)));
}
function TemplateLiteral2(parts) {
  return make19(templateLiteralFromParts(parts), {
    parts
  });
}
function TemplateLiteralParser(parts) {
  return make19(templateLiteralFromParts(parts).asTemplateLiteralParser(), {
    parts
  });
}
function Enum2(enums) {
  return make19(new Enum(Object.keys(enums).filter((key) => typeof enums[enums[key]] !== "number").map((key) => [key, enums[key]])), {
    enums
  });
}
var Never2 = /* @__PURE__ */ make19(never3);
var Any2 = /* @__PURE__ */ make19(any);
var Unknown2 = /* @__PURE__ */ make19(unknown);
var Null2 = /* @__PURE__ */ make19(null_);
var Undefined2 = /* @__PURE__ */ make19(undefined_3);
var String5 = /* @__PURE__ */ make19(string2);
var Number6 = /* @__PURE__ */ make19(number2);
var Boolean5 = /* @__PURE__ */ make19(boolean);
var Symbol3 = /* @__PURE__ */ make19(symbol3);
var BigInt5 = /* @__PURE__ */ make19(bigInt);
var Void2 = /* @__PURE__ */ make19(void_5);
var ObjectKeyword2 = /* @__PURE__ */ make19(objectKeyword);
function UniqueSymbol2(symbol4) {
  return make19(new UniqueSymbol(symbol4));
}
function makeStruct(ast, fields) {
  return make19(ast, {
    fields,
    mapFields(f, options2) {
      const fields2 = f(this.fields);
      return makeStruct(struct(fields2, options2?.unsafePreserveChecks ? this.ast.checks : void 0), fields2);
    }
  });
}
function Struct3(fields) {
  return makeStruct(struct(fields, void 0), fields);
}
function fieldsAssign(fields) {
  return lambda((struct2) => struct2.mapFields(assign(fields)));
}
var canonicalPropertyKey = (key) => typeof key === "symbol" ? key : globalThis.String(key);
function encodeKeys(mapping) {
  return function(self) {
    const fields = {};
    const appliedMapping = /* @__PURE__ */ Object.create(null);
    const reverseMapping = /* @__PURE__ */ Object.create(null);
    const seenEncodedKeys = /* @__PURE__ */ new Set();
    for (const k of Reflect.ownKeys(self.fields)) {
      const encoded = toEncoded2(self.fields[k]);
      const hasMapping = Object.hasOwn(mapping, k);
      const encodedKey = hasMapping ? mapping[k] : k;
      const canonical = canonicalPropertyKey(encodedKey);
      if (seenEncodedKeys.has(canonical)) {
        throw new globalThis.Error(`Duplicate encoded keys: ${formatPropertyKey(encodedKey)}`);
      }
      seenEncodedKeys.add(canonical);
      assignProperty(fields, encodedKey, encoded);
      if (hasMapping) {
        appliedMapping[k] = encodedKey;
        reverseMapping[encodedKey] = k;
      }
    }
    return Struct3(fields).pipe(decodeTo2(self, transform2({
      decode: renameKeys(reverseMapping),
      encode: renameKeys(appliedMapping)
    })));
  };
}
function extendTo(fields, derive) {
  return (self) => {
    const f = map3(self.fields, toType2);
    const to = Struct3({
      ...f,
      ...fields
    });
    return self.pipe(decodeTo2(to, transform2({
      decode: (input) => {
        const out = {
          ...input
        };
        for (const k in fields) {
          const f2 = derive[k];
          const o = f2(input);
          if (isSome2(o)) {
            assignProperty(out, k, o.value);
          }
        }
        return out;
      },
      encode: (input) => {
        const out = {
          ...input
        };
        for (const k in fields) {
          delete out[k];
        }
        return out;
      }
    })));
  };
}
function Record2(key, value3) {
  return make19(record(key.ast, value3.ast), {
    key,
    value: value3
  });
}
function StructWithRest(schema, records) {
  return make19(structWithRest(schema.ast, records.map(getAST)), {
    schema,
    records
  });
}
function makeTuple(ast, elements) {
  return make19(ast, {
    elements,
    mapElements(f, options2) {
      const elements2 = f(this.elements);
      return makeTuple(tuple(elements2, options2?.unsafePreserveChecks ? this.ast.checks : void 0), elements2);
    }
  });
}
function Tuple(elements) {
  return makeTuple(tuple(elements), elements);
}
function TupleWithRest(schema, rest) {
  return make19(tupleWithRest(schema.ast, rest.map(getAST)), {
    schema,
    rest
  });
}
var ArraySchema = /* @__PURE__ */ lambda((schema) => make19(new Arrays(false, [], [schema.ast]), {
  value: schema
}));
var NonEmptyArray = /* @__PURE__ */ lambda((schema) => make19(new Arrays(false, [schema.ast], [schema.ast]), {
  value: schema
}));
function ArrayEnsure(schema) {
  return Union2([schema, ArraySchema(schema)]).pipe(decodeTo2(ArraySchema(toType2(schema)), transform2({
    decode: ensure,
    encode: (array3) => array3.length === 1 ? array3[0] : array3
  })));
}
function UniqueArray(item) {
  return ArraySchema(item).check(isUnique());
}
var mutable = /* @__PURE__ */ lambda((schema) => {
  return make19(new Arrays(true, schema.ast.elements, schema.ast.rest), {
    schema
  });
});
function makeUnion(ast, members) {
  return make19(ast, {
    members,
    mapMembers(f, options2) {
      const members2 = f(this.members);
      return makeUnion(union2(members2, this.ast.mode, options2?.unsafePreserveChecks ? this.ast.checks : void 0), members2);
    }
  });
}
function Union2(members, options2) {
  return makeUnion(union2(members, options2?.mode ?? "anyOf", void 0), members);
}
function Literals(literals) {
  const members = literals.map(Literal2);
  return make19(union2(members, "anyOf", void 0), {
    literals,
    members,
    mapMembers(f) {
      return Union2(f(this.members));
    },
    pick(literals2) {
      return Literals(literals2);
    },
    transform(to) {
      return Union2(members.map((member, index2) => member.transform(to[index2])));
    }
  });
}
var NullOr = /* @__PURE__ */ lambda((self) => Union2([self, Null2]));
var UndefinedOr = /* @__PURE__ */ lambda((self) => Union2([self, Undefined2]));
var NullishOr = /* @__PURE__ */ lambda((self) => Union2([self, Null2, Undefined2]));
function suspend3(f) {
  return make19(new Suspend(() => f().ast));
}
function check(...checks) {
  return (self) => self.check(...checks);
}
function refine(refinement, annotations) {
  return (schema) => make19(appendChecks(schema.ast, [makeFilterByGuard(refinement, annotations)]), {
    schema
  });
}
function brand2(identifier2) {
  return (schema) => make19(brand(schema.ast, identifier2), {
    schema,
    identifier: identifier2
  });
}
function fromBrand(identifier2, ctor) {
  return (self) => {
    return (ctor.checks ? self.check(...ctor.checks) : self).pipe(brand2(identifier2));
  };
}
function middlewareDecoding2(decode2) {
  return (schema) => make19(middlewareDecoding(schema.ast, new Middleware(decode2, identity)), {
    schema
  });
}
function middlewareEncoding2(encode2) {
  return (schema) => make19(middlewareEncoding(schema.ast, new Middleware(identity, encode2)), {
    schema
  });
}
function catchDecoding(f) {
  return catchDecodingWithContext(f);
}
function catchDecodingWithContext(f) {
  return (self) => middlewareDecoding2(catchEager2(f))(self);
}
function catchEncoding(f) {
  return catchEncodingWithContext(f);
}
function catchEncodingWithContext(f) {
  return (self) => middlewareEncoding2(catchEager2(f))(self);
}
function decodeTo2(to, transformation) {
  return (from) => {
    return make19(decodeTo(from.ast, to.ast, transformation ? make11(transformation) : passthrough3()), {
      from,
      to
    });
  };
}
function decode(transformation) {
  return (self) => {
    return decodeTo2(toType2(self), transformation)(self);
  };
}
function encodeTo(to, transformation) {
  return (from) => {
    return transformation ? decodeTo2(from, transformation)(to) : decodeTo2(from)(to);
  };
}
function encode(transformation) {
  return (self) => {
    return decodeTo2(self, transformation)(toEncoded2(self));
  };
}
function withConstructorDefault2(defaultValue) {
  return (schema) => make19(withConstructorDefault(schema.ast, defaultValue), {
    schema
  });
}
function toIssueEffect(self) {
  return catchCause2(self, (cause) => failCauseSync2(() => map6(cause, (error) => error.issue)));
}
function withDecodingDefaultKey(defaultValue, options2) {
  const encode2 = options2?.encodingStrategy === "omit" ? omit() : passthrough2();
  return (self) => {
    return optionalKey2(toEncoded2(self)).pipe(decodeTo2(self, {
      decode: withDefault(toIssueEffect(defaultValue)),
      encode: encode2
    }));
  };
}
function withDecodingDefaultTypeKey(defaultValue, options2) {
  return (self) => {
    return toType2(self).pipe(withDecodingDefaultKey(defaultValue, options2), encodeTo(optionalKey2(self)));
  };
}
function withDecodingDefault(defaultValue, options2) {
  const encode2 = options2?.encodingStrategy === "omit" ? omit() : passthrough2();
  return (self) => {
    return optional2(toEncoded2(self)).pipe(decodeTo2(self, {
      decode: withDefault(toIssueEffect(defaultValue)),
      encode: encode2
    }));
  };
}
function withDecodingDefaultType(defaultValue, options2) {
  return (self) => {
    return toType2(self).pipe(withDecodingDefault(defaultValue, options2), encodeTo(optional2(self)));
  };
}
function tag(literal) {
  return Literal2(literal).pipe(withConstructorDefault2(succeed6(literal)));
}
function tagDefaultOmit(literal) {
  return tag(literal).pipe(withDecodingDefaultKey(succeed6(literal), {
    encodingStrategy: "omit"
  }));
}
function TaggedStruct(value3, fields) {
  return Struct3({
    _tag: tag(value3),
    ...fields
  });
}
function toTaggedUnion(tag2) {
  return (self) => {
    const cases = {};
    const discriminants = [];
    const discriminantKeys = /* @__PURE__ */ new Set();
    const guards = {};
    const isAnyOf = (keys4) => (value3) => keys4.includes(value3[tag2]);
    walk(self);
    return Object.assign(self, {
      cases,
      discriminants,
      isAnyOf,
      guards,
      match: match8,
      matchOrElse
    });
    function walk(schema) {
      const ast = schema.ast;
      if (isUnion(ast) && "members" in schema && globalThis.Array.isArray(schema.members) && schema.members.every(isSchema)) {
        return schema.members.forEach(walk);
      }
      const sentinels = collectSentinels(ast);
      if (sentinels.length > 0) {
        const literal = sentinels.find((s) => s.key === tag2)?.literal;
        if (isPropertyKey(literal)) {
          const key = typeof literal === "number" ? globalThis.String(literal) : literal;
          if (discriminantKeys.has(key)) {
            throw new globalThis.Error(`Duplicate discriminant: ${globalThis.String(literal)}`);
          }
          discriminantKeys.add(key);
          discriminants.push(literal);
          assignProperty(cases, literal, schema);
          assignProperty(guards, literal, is2(toType2(schema)));
          return;
        }
      }
      throw new globalThis.Error("No literal or unique symbol found");
    }
    function match8() {
      if (arguments.length === 1) {
        const cases3 = arguments[0];
        return function(value4) {
          const key2 = value4[tag2];
          const handler2 = Object.hasOwn(cases3, key2) ? cases3[key2] : void 0;
          return handler2(value4);
        };
      }
      const value3 = arguments[0];
      const cases2 = arguments[1];
      const key = value3[tag2];
      const handler = Object.hasOwn(cases2, key) ? cases2[key] : void 0;
      return handler(value3);
    }
    function matchOrElse() {
      if (arguments.length === 2) {
        const cases3 = arguments[0];
        const orElse3 = arguments[1];
        return function(value4) {
          const key2 = value4[tag2];
          const handler2 = Object.hasOwn(cases3, key2) ? cases3[key2] ?? orElse3 : orElse3;
          return handler2(value4);
        };
      }
      const value3 = arguments[0];
      const cases2 = arguments[1];
      const orElse2 = arguments[2];
      const key = value3[tag2];
      const handler = Object.hasOwn(cases2, key) ? cases2[key] ?? orElse2 : orElse2;
      return handler(value3);
    }
  };
}
function TaggedUnion(casesByTag) {
  const cases = {};
  const members = [];
  for (const key of Object.keys(casesByTag)) {
    const member = TaggedStruct(key, casesByTag[key]);
    assignProperty(cases, key, member);
    members.push(member);
  }
  const union5 = Union2(members);
  const {
    guards,
    isAnyOf,
    match: match8,
    matchOrElse
  } = toTaggedUnion("_tag")(union5);
  return make19(union5.ast, {
    cases,
    isAnyOf,
    guards,
    match: match8,
    matchOrElse
  });
}
function Opaque() {
  return (schema) => {
    return schema;
  };
}
function instanceOf(constructor, annotations) {
  return declare((u) => u instanceof constructor, annotations);
}
function link() {
  return (encodeTo2, transformation) => {
    return new Link(encodeTo2.ast, make11(transformation));
  };
}
var makeFilter2 = makeFilter;
function makeFilterGroup(checks, annotations = void 0) {
  return new FilterGroup(checks, annotations);
}
function makeFixedDeclarationReviver(id2, schema) {
  return makeDeclarationReviver(id2, Null2, ({
    annotations
  }) => annotations === void 0 ? schema : schema.annotate(annotations));
}
var TRIMMED_PATTERN = "^\\S[\\s\\S]*\\S$|^\\S$|^$";
function isTrimmed(annotations) {
  const regExp = new globalThis.RegExp(TRIMMED_PATTERN);
  return makeFilter2((s) => s.trim() === s, {
    expected: "a string with no leading or trailing whitespace",
    representation: {
      id: "effect/schema/isTrimmed",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isTrimmed()"
    }),
    arbitrary: {
      constraint: {
        patterns: [TRIMMED_PATTERN]
      }
    },
    ...annotations
  });
}
var isTrimmedReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isTrimmed", Null2, ({
  annotations
}) => isTrimmed(annotations));
function isPattern2(regExp, annotations) {
  const source = regExp.source;
  const flags = regExp.flags;
  const runtimeRegExp = flags === "" ? `new RegExp(${format(source)})` : `new RegExp(${format(source)}, ${format(flags)})`;
  return isPattern(regExp, {
    toCode: () => ({
      runtime: `Schema.isPattern(${runtimeRegExp})`
    }),
    ...annotations
  });
}
var IsPatternPayload = /* @__PURE__ */ Struct3({
  source: String5,
  flags: String5
}).check(/* @__PURE__ */ makeFilter2((payload) => {
  const result3 = try_(() => new globalThis.RegExp(payload.source, payload.flags));
  return isSuccess2(result3) && result3.success.source === payload.source && result3.success.flags === payload.flags;
}));
var isPatternReviver = {
  id: "effect/schema/isPattern",
  payloadSchema: IsPatternPayload,
  revive: ({
    annotations,
    payload
  }) => isPattern2(new globalThis.RegExp(payload.source, payload.flags), annotations)
};
function isStringFinite2(annotations) {
  return isStringFinite({
    toCode: () => ({
      runtime: "Schema.isStringFinite()"
    }),
    ...annotations
  });
}
var isStringFiniteReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isStringFinite", Null2, ({
  annotations
}) => isStringFinite2(annotations));
function isStringBigInt2(annotations) {
  return isStringBigInt({
    toCode: () => ({
      runtime: "Schema.isStringBigInt()"
    }),
    ...annotations
  });
}
var isStringBigIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isStringBigInt", Null2, ({
  annotations
}) => isStringBigInt2(annotations));
function isStringSymbol2(annotations) {
  return isStringSymbol({
    toCode: () => ({
      runtime: "Schema.isStringSymbol()"
    }),
    ...annotations
  });
}
var isStringSymbolReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isStringSymbol", Null2, ({
  annotations
}) => isStringSymbol2(annotations));
var getUUIDRegExp = (version) => {
  if (version) {
    return new globalThis.RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
  }
  return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|[fF]{8}-[fF]{4}-[fF]{4}-[fF]{4}-[fF]{12})$/;
};
function isUUID(version, annotations) {
  const regExp = getUUIDRegExp(version);
  return isPattern2(regExp, {
    expected: version ? `a UUID v${version}` : "a UUID",
    representation: {
      id: "effect/schema/isUUID",
      payload: {
        version: version ?? null
      }
    },
    toJsonSchema: () => ({
      pattern: regExp.source,
      format: "uuid"
    }),
    toCode: () => ({
      runtime: version === void 0 ? "Schema.isUUID()" : `Schema.isUUID(${version})`
    }),
    ...annotations
  });
}
var isUUIDReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isUUID", /* @__PURE__ */ Struct3({
  version: /* @__PURE__ */ Union2([/* @__PURE__ */ Literals([1, 2, 3, 4, 5, 6, 7, 8]), Null2])
}), ({
  annotations,
  payload
}) => isUUID(payload.version ?? void 0, annotations));
var GUID_REGEXP = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
function isGUID(annotations) {
  return isPattern2(GUID_REGEXP, {
    expected: "a GUID",
    representation: {
      id: "effect/schema/isGUID",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: GUID_REGEXP.source
    }),
    toCode: () => ({
      runtime: "Schema.isGUID()"
    }),
    ...annotations
  });
}
var isGUIDReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGUID", Null2, ({
  annotations
}) => isGUID(annotations));
function isULID(annotations) {
  const regExp = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
  return isPattern2(regExp, {
    representation: {
      id: "effect/schema/isULID",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isULID()"
    }),
    ...annotations
  });
}
var isULIDReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isULID", Null2, ({
  annotations
}) => isULID(annotations));
function isBase64(annotations) {
  const regExp = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  return isPattern2(regExp, {
    expected: "a base64 encoded string",
    representation: {
      id: "effect/schema/isBase64",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isBase64()"
    }),
    ...annotations
  });
}
var isBase64Reviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isBase64", Null2, ({
  annotations
}) => isBase64(annotations));
function isBase64Url(annotations) {
  const regExp = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
  return isPattern2(regExp, {
    expected: "a base64url encoded string",
    representation: {
      id: "effect/schema/isBase64Url",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isBase64Url()"
    }),
    ...annotations
  });
}
var isBase64UrlReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isBase64Url", Null2, ({
  annotations
}) => isBase64Url(annotations));
function isStartsWith(startsWith, annotations) {
  const formatted = JSON.stringify(startsWith);
  const regExp = new globalThis.RegExp(`^${escape(startsWith)}`);
  return makeFilter2((s) => s.startsWith(startsWith), {
    expected: `a string starting with ${formatted}`,
    representation: {
      id: "effect/schema/isStartsWith",
      payload: {
        startsWith
      }
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: `Schema.isStartsWith(${format(startsWith)})`
    }),
    arbitrary: {
      constraint: {
        patterns: [regExp.source]
      }
    },
    ...annotations
  });
}
var isStartsWithReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isStartsWith", /* @__PURE__ */ Struct3({
  startsWith: String5
}), ({
  annotations,
  payload
}) => isStartsWith(payload.startsWith, annotations));
function isEndsWith(endsWith, annotations) {
  const formatted = JSON.stringify(endsWith);
  const regExp = new globalThis.RegExp(`${escape(endsWith)}$`);
  return makeFilter2((s) => s.endsWith(endsWith), {
    expected: `a string ending with ${formatted}`,
    representation: {
      id: "effect/schema/isEndsWith",
      payload: {
        endsWith
      }
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: `Schema.isEndsWith(${format(endsWith)})`
    }),
    arbitrary: {
      constraint: {
        patterns: [regExp.source]
      }
    },
    ...annotations
  });
}
var isEndsWithReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isEndsWith", /* @__PURE__ */ Struct3({
  endsWith: String5
}), ({
  annotations,
  payload
}) => isEndsWith(payload.endsWith, annotations));
function isIncludes(includes, annotations) {
  const formatted = JSON.stringify(includes);
  const regExp = new globalThis.RegExp(escape(includes));
  return makeFilter2((s) => s.includes(includes), {
    expected: `a string including ${formatted}`,
    representation: {
      id: "effect/schema/isIncludes",
      payload: {
        includes
      }
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: `Schema.isIncludes(${format(includes)})`
    }),
    arbitrary: {
      constraint: {
        patterns: [regExp.source]
      }
    },
    ...annotations
  });
}
var isIncludesReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isIncludes", /* @__PURE__ */ Struct3({
  includes: String5
}), ({
  annotations,
  payload
}) => isIncludes(payload.includes, annotations));
var UPPERCASED_PATTERN = "^[^a-z]*$";
function isUppercased(annotations) {
  const regExp = new globalThis.RegExp(UPPERCASED_PATTERN);
  return makeFilter2((s) => s.toUpperCase() === s, {
    expected: "a string with all characters in uppercase",
    representation: {
      id: "effect/schema/isUppercased",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isUppercased()"
    }),
    arbitrary: {
      constraint: {
        patterns: [UPPERCASED_PATTERN]
      }
    },
    ...annotations
  });
}
var isUppercasedReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isUppercased", Null2, ({
  annotations
}) => isUppercased(annotations));
var LOWERCASED_PATTERN = "^[^A-Z]*$";
function isLowercased(annotations) {
  const regExp = new globalThis.RegExp(LOWERCASED_PATTERN);
  return makeFilter2((s) => s.toLowerCase() === s, {
    expected: "a string with all characters in lowercase",
    representation: {
      id: "effect/schema/isLowercased",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isLowercased()"
    }),
    arbitrary: {
      constraint: {
        patterns: [LOWERCASED_PATTERN]
      }
    },
    ...annotations
  });
}
var isLowercasedReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLowercased", Null2, ({
  annotations
}) => isLowercased(annotations));
var CAPITALIZED_PATTERN = "^[^a-z]?.*$";
function isCapitalized(annotations) {
  const regExp = new globalThis.RegExp(CAPITALIZED_PATTERN);
  return makeFilter2((s) => s.charAt(0).toUpperCase() === s.charAt(0), {
    expected: "a string with the first character in uppercase",
    representation: {
      id: "effect/schema/isCapitalized",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isCapitalized()"
    }),
    arbitrary: {
      constraint: {
        patterns: [CAPITALIZED_PATTERN]
      }
    },
    ...annotations
  });
}
var isCapitalizedReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isCapitalized", Null2, ({
  annotations
}) => isCapitalized(annotations));
var UNCAPITALIZED_PATTERN = "^[^A-Z]?.*$";
function isUncapitalized(annotations) {
  const regExp = new globalThis.RegExp(UNCAPITALIZED_PATTERN);
  return makeFilter2((s) => s.charAt(0).toLowerCase() === s.charAt(0), {
    expected: "a string with the first character in lowercase",
    representation: {
      id: "effect/schema/isUncapitalized",
      payload: null
    },
    toJsonSchema: () => ({
      pattern: regExp.source
    }),
    toCode: () => ({
      runtime: "Schema.isUncapitalized()"
    }),
    arbitrary: {
      constraint: {
        patterns: [UNCAPITALIZED_PATTERN]
      }
    },
    ...annotations
  });
}
var isUncapitalizedReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isUncapitalized", Null2, ({
  annotations
}) => isUncapitalized(annotations));
var Finite = /* @__PURE__ */ make19(finite);
var isFinite2 = isFinite;
var isFiniteReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isFinite", Null2, ({
  annotations
}) => isFinite2(annotations));
function makeIsGreaterThan(options2) {
  const gt = isGreaterThan(options2.order);
  const formatter = options2.formatter ?? format;
  return (exclusiveMinimum, annotations) => {
    return makeFilter2((input) => gt(input, exclusiveMinimum), {
      expected: `a value greater than ${formatter(exclusiveMinimum)}`,
      arbitrary: {
        constraint: {
          ordered: {
            order: options2.order,
            minimum: exclusiveMinimum,
            exclusiveMinimum: true
          }
        }
      },
      ...options2.annotate?.(exclusiveMinimum),
      ...annotations
    });
  };
}
function makeIsGreaterThanOrEqualTo(options2) {
  const gte = isGreaterThanOrEqualTo(options2.order);
  const formatter = options2.formatter ?? format;
  return (minimum, annotations) => {
    return makeFilter2((input) => gte(input, minimum), {
      expected: `a value greater than or equal to ${formatter(minimum)}`,
      arbitrary: {
        constraint: {
          ordered: {
            order: options2.order,
            minimum
          }
        }
      },
      ...options2.annotate?.(minimum),
      ...annotations
    });
  };
}
function makeIsLessThan(options2) {
  const lt = isLessThan(options2.order);
  const formatter = options2.formatter ?? format;
  return (exclusiveMaximum, annotations) => {
    return makeFilter2((input) => lt(input, exclusiveMaximum), {
      expected: `a value less than ${formatter(exclusiveMaximum)}`,
      arbitrary: {
        constraint: {
          ordered: {
            order: options2.order,
            maximum: exclusiveMaximum,
            exclusiveMaximum: true
          }
        }
      },
      ...options2.annotate?.(exclusiveMaximum),
      ...annotations
    });
  };
}
function makeIsLessThanOrEqualTo(options2) {
  const lte = isLessThanOrEqualTo(options2.order);
  const formatter = options2.formatter ?? format;
  return (maximum, annotations) => {
    return makeFilter2((input) => lte(input, maximum), {
      expected: `a value less than or equal to ${formatter(maximum)}`,
      arbitrary: {
        constraint: {
          ordered: {
            order: options2.order,
            maximum
          }
        }
      },
      ...options2.annotate?.(maximum),
      ...annotations
    });
  };
}
function makeIsBetween(deriveOptions) {
  const greaterThanOrEqualTo = isGreaterThanOrEqualTo(deriveOptions.order);
  const greaterThan = isGreaterThan(deriveOptions.order);
  const lessThanOrEqualTo = isLessThanOrEqualTo(deriveOptions.order);
  const lessThan = isLessThan(deriveOptions.order);
  const formatter = deriveOptions.formatter ?? format;
  return (options2, annotations) => {
    const gte = options2.exclusiveMinimum ? greaterThan : greaterThanOrEqualTo;
    const lte = options2.exclusiveMaximum ? lessThan : lessThanOrEqualTo;
    return makeFilter2((input) => gte(input, options2.minimum) && lte(input, options2.maximum), {
      expected: `a value between ${formatter(options2.minimum)}${options2.exclusiveMinimum ? " (excluded)" : ""} and ${formatter(options2.maximum)}${options2.exclusiveMaximum ? " (excluded)" : ""}`,
      arbitrary: {
        constraint: {
          ordered: {
            order: deriveOptions.order,
            minimum: options2.minimum,
            maximum: options2.maximum,
            ...options2.exclusiveMinimum && {
              exclusiveMinimum: true
            },
            ...options2.exclusiveMaximum && {
              exclusiveMaximum: true
            }
          }
        }
      },
      ...deriveOptions.annotate?.(options2),
      ...annotations
    });
  };
}
function makeIsMultipleOf(options2) {
  return (divisor, annotations) => {
    const formatter = options2.formatter ?? format;
    return makeFilter2((input) => options2.remainder(input, divisor) === options2.zero, {
      expected: `a value that is a multiple of ${formatter(divisor)}`,
      ...options2.annotate?.(divisor),
      ...annotations
    });
  };
}
function encodeNumberPayload(number3) {
  if (!globalThis.Number.isFinite(number3)) {
    throw new globalThis.RangeError(`Expected a finite number, got ${format(number3)}`);
  }
  return number3;
}
var isGreaterThan5 = /* @__PURE__ */ makeIsGreaterThan({
  order: Number2,
  annotate: (exclusiveMinimum) => ({
    representation: {
      id: "effect/schema/isGreaterThan",
      payload: {
        exclusiveMinimum: encodeNumberPayload(exclusiveMinimum)
      }
    },
    toJsonSchema: () => ({
      exclusiveMinimum
    }),
    toCode: () => ({
      runtime: `Schema.isGreaterThan(${format(exclusiveMinimum)})`
    })
  })
});
var isGreaterThanReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGreaterThan", /* @__PURE__ */ Struct3({
  exclusiveMinimum: Finite
}), ({
  annotations,
  payload
}) => isGreaterThan5(payload.exclusiveMinimum, annotations));
var isGreaterThanOrEqualTo4 = /* @__PURE__ */ makeIsGreaterThanOrEqualTo({
  order: Number2,
  annotate: (minimum) => ({
    representation: {
      id: "effect/schema/isGreaterThanOrEqualTo",
      payload: {
        minimum: encodeNumberPayload(minimum)
      }
    },
    toJsonSchema: () => ({
      minimum
    }),
    toCode: () => ({
      runtime: `Schema.isGreaterThanOrEqualTo(${format(minimum)})`
    })
  })
});
var isGreaterThanOrEqualToReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGreaterThanOrEqualTo", /* @__PURE__ */ Struct3({
  minimum: Finite
}), ({
  annotations,
  payload
}) => isGreaterThanOrEqualTo4(payload.minimum, annotations));
var isLessThan5 = /* @__PURE__ */ makeIsLessThan({
  order: Number2,
  annotate: (exclusiveMaximum) => ({
    representation: {
      id: "effect/schema/isLessThan",
      payload: {
        exclusiveMaximum: encodeNumberPayload(exclusiveMaximum)
      }
    },
    toJsonSchema: () => ({
      exclusiveMaximum
    }),
    toCode: () => ({
      runtime: `Schema.isLessThan(${format(exclusiveMaximum)})`
    })
  })
});
var isLessThanReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLessThan", /* @__PURE__ */ Struct3({
  exclusiveMaximum: Finite
}), ({
  annotations,
  payload
}) => isLessThan5(payload.exclusiveMaximum, annotations));
var isLessThanOrEqualTo5 = /* @__PURE__ */ makeIsLessThanOrEqualTo({
  order: Number2,
  annotate: (maximum) => ({
    representation: {
      id: "effect/schema/isLessThanOrEqualTo",
      payload: {
        maximum: encodeNumberPayload(maximum)
      }
    },
    toJsonSchema: () => ({
      maximum
    }),
    toCode: () => ({
      runtime: `Schema.isLessThanOrEqualTo(${format(maximum)})`
    })
  })
});
var isLessThanOrEqualToReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLessThanOrEqualTo", /* @__PURE__ */ Struct3({
  maximum: Finite
}), ({
  annotations,
  payload
}) => isLessThanOrEqualTo5(payload.maximum, annotations));
var isBetween2 = /* @__PURE__ */ makeIsBetween({
  order: Number2,
  annotate: (options2) => {
    const exclusiveMinimum = options2.exclusiveMinimum ? true : void 0;
    const exclusiveMaximum = options2.exclusiveMaximum ? true : void 0;
    const payload = {
      minimum: encodeNumberPayload(options2.minimum),
      maximum: encodeNumberPayload(options2.maximum),
      ...exclusiveMinimum && {
        exclusiveMinimum
      },
      ...exclusiveMaximum && {
        exclusiveMaximum
      }
    };
    return {
      representation: {
        id: "effect/schema/isBetween",
        payload
      },
      toJsonSchema: () => ({
        [exclusiveMinimum ? "exclusiveMinimum" : "minimum"]: options2.minimum,
        [exclusiveMaximum ? "exclusiveMaximum" : "maximum"]: options2.maximum
      }),
      toCode: () => ({
        runtime: `Schema.isBetween({ minimum: ${format(options2.minimum)}, maximum: ${format(options2.maximum)}, exclusiveMinimum: ${format(exclusiveMinimum)}, exclusiveMaximum: ${format(exclusiveMaximum)} })`
      })
    };
  }
});
var isBetweenReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isBetween", /* @__PURE__ */ Struct3({
  minimum: Finite,
  maximum: Finite,
  exclusiveMinimum: /* @__PURE__ */ optional2(/* @__PURE__ */ Literal2(true)),
  exclusiveMaximum: /* @__PURE__ */ optional2(/* @__PURE__ */ Literal2(true))
}), ({
  annotations,
  payload
}) => isBetween2(payload, annotations));
var isMultipleOf = /* @__PURE__ */ makeIsMultipleOf({
  remainder,
  zero: 0,
  annotate: (divisor) => ({
    expected: `a value that is a multiple of ${divisor}`,
    representation: {
      id: "effect/schema/isMultipleOf",
      payload: {
        divisor
      }
    },
    toJsonSchema: () => ({
      multipleOf: divisor
    }),
    toCode: () => ({
      runtime: `Schema.isMultipleOf(${format(divisor)})`
    })
  })
});
var isMultipleOfReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMultipleOf", /* @__PURE__ */ Struct3({
  divisor: Finite
}), ({
  annotations,
  payload
}) => isMultipleOf(payload.divisor, annotations));
function isInt(annotations) {
  return makeFilter2((n) => globalThis.Number.isSafeInteger(n), {
    expected: "an integer",
    representation: {
      id: "effect/schema/isInt",
      payload: null
    },
    toJsonSchema: () => ({
      type: "integer"
    }),
    toCode: () => ({
      runtime: "Schema.isInt()"
    }),
    arbitrary: {
      constraint: {
        integer: true
      }
    },
    ...annotations
  });
}
var isIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isInt", Null2, ({
  annotations
}) => isInt(annotations));
var Int = /* @__PURE__ */ Number6.check(/* @__PURE__ */ isInt());
var Natural = /* @__PURE__ */ Int.check(/* @__PURE__ */ isGreaterThanOrEqualTo4(0));
function isInt32(annotations) {
  return new FilterGroup([isInt(), isBetween2({
    minimum: -2147483648,
    maximum: 2147483647
  })], {
    expected: "a 32-bit integer",
    ...annotations
  });
}
function isUint32(annotations) {
  return new FilterGroup([isInt(), isBetween2({
    minimum: 0,
    maximum: 4294967295
  })], {
    expected: "a 32-bit unsigned integer",
    ...annotations
  });
}
function encodeDatePayload(date) {
  if (globalThis.Number.isNaN(date.getTime())) {
    throw new globalThis.RangeError(`Expected a valid Date, got ${format(date)}`);
  }
  return date.toISOString();
}
function formatDateRuntime(date) {
  return `new Date(${format(date.getTime())})`;
}
var isGreaterThanDate = /* @__PURE__ */ makeIsGreaterThan({
  order: Date2,
  annotate: (exclusiveMinimum) => {
    const encoded = encodeDatePayload(exclusiveMinimum);
    return {
      representation: {
        id: "effect/schema/isGreaterThanDate",
        payload: {
          exclusiveMinimum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isGreaterThanDate(${formatDateRuntime(exclusiveMinimum)})`
      })
    };
  }
});
var isGreaterThanOrEqualToDate = /* @__PURE__ */ makeIsGreaterThanOrEqualTo({
  order: Date2,
  annotate: (minimum) => {
    const encoded = encodeDatePayload(minimum);
    return {
      representation: {
        id: "effect/schema/isGreaterThanOrEqualToDate",
        payload: {
          minimum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isGreaterThanOrEqualToDate(${formatDateRuntime(minimum)})`
      })
    };
  }
});
var isLessThanDate = /* @__PURE__ */ makeIsLessThan({
  order: Date2,
  annotate: (exclusiveMaximum) => {
    const encoded = encodeDatePayload(exclusiveMaximum);
    return {
      representation: {
        id: "effect/schema/isLessThanDate",
        payload: {
          exclusiveMaximum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isLessThanDate(${formatDateRuntime(exclusiveMaximum)})`
      })
    };
  }
});
var isLessThanOrEqualToDate = /* @__PURE__ */ makeIsLessThanOrEqualTo({
  order: Date2,
  annotate: (maximum) => {
    const encoded = encodeDatePayload(maximum);
    return {
      representation: {
        id: "effect/schema/isLessThanOrEqualToDate",
        payload: {
          maximum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isLessThanOrEqualToDate(${formatDateRuntime(maximum)})`
      })
    };
  }
});
var isBetweenDate = /* @__PURE__ */ makeIsBetween({
  order: Date2,
  annotate: (options2) => {
    const exclusiveMinimum = options2.exclusiveMinimum ? true : void 0;
    const exclusiveMaximum = options2.exclusiveMaximum ? true : void 0;
    const payload = {
      minimum: encodeDatePayload(options2.minimum),
      maximum: encodeDatePayload(options2.maximum),
      ...exclusiveMinimum && {
        exclusiveMinimum
      },
      ...exclusiveMaximum && {
        exclusiveMaximum
      }
    };
    return {
      representation: {
        id: "effect/schema/isBetweenDate",
        payload
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isBetweenDate({ minimum: ${formatDateRuntime(options2.minimum)}, maximum: ${formatDateRuntime(options2.maximum)}, exclusiveMinimum: ${format(exclusiveMinimum)}, exclusiveMaximum: ${format(exclusiveMaximum)} })`
      })
    };
  }
});
var isGreaterThanBigInt = /* @__PURE__ */ makeIsGreaterThan({
  order: BigInt2,
  annotate: (exclusiveMinimum) => {
    const encoded = exclusiveMinimum.toString(10);
    return {
      representation: {
        id: "effect/schema/isGreaterThanBigInt",
        payload: {
          exclusiveMinimum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isGreaterThanBigInt(${format(exclusiveMinimum)})`
      })
    };
  }
});
var isGreaterThanOrEqualToBigInt = /* @__PURE__ */ makeIsGreaterThanOrEqualTo({
  order: BigInt2,
  annotate: (minimum) => {
    const encoded = minimum.toString(10);
    return {
      representation: {
        id: "effect/schema/isGreaterThanOrEqualToBigInt",
        payload: {
          minimum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isGreaterThanOrEqualToBigInt(${format(minimum)})`
      })
    };
  }
});
var isLessThanBigInt = /* @__PURE__ */ makeIsLessThan({
  order: BigInt2,
  annotate: (exclusiveMaximum) => {
    const encoded = exclusiveMaximum.toString(10);
    return {
      representation: {
        id: "effect/schema/isLessThanBigInt",
        payload: {
          exclusiveMaximum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isLessThanBigInt(${format(exclusiveMaximum)})`
      })
    };
  }
});
var isLessThanOrEqualToBigInt = /* @__PURE__ */ makeIsLessThanOrEqualTo({
  order: BigInt2,
  annotate: (maximum) => {
    const encoded = maximum.toString(10);
    return {
      representation: {
        id: "effect/schema/isLessThanOrEqualToBigInt",
        payload: {
          maximum: encoded
        }
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isLessThanOrEqualToBigInt(${format(maximum)})`
      })
    };
  }
});
var isBetweenBigInt = /* @__PURE__ */ makeIsBetween({
  order: BigInt2,
  annotate: (options2) => {
    const exclusiveMinimum = options2.exclusiveMinimum ? true : void 0;
    const exclusiveMaximum = options2.exclusiveMaximum ? true : void 0;
    const payload = {
      minimum: options2.minimum.toString(10),
      maximum: options2.maximum.toString(10),
      ...exclusiveMinimum && {
        exclusiveMinimum
      },
      ...exclusiveMaximum && {
        exclusiveMaximum
      }
    };
    return {
      representation: {
        id: "effect/schema/isBetweenBigInt",
        payload
      },
      toJsonSchema: () => ({}),
      toCode: () => ({
        runtime: `Schema.isBetweenBigInt({ minimum: ${format(options2.minimum)}, maximum: ${format(options2.maximum)}, exclusiveMinimum: ${format(exclusiveMinimum)}, exclusiveMaximum: ${format(exclusiveMaximum)} })`
      })
    };
  }
});
var isGreaterThanBigDecimal = /* @__PURE__ */ makeIsGreaterThan({
  order: Order,
  formatter: (bd) => format2(bd)
});
var isGreaterThanOrEqualToBigDecimal = /* @__PURE__ */ makeIsGreaterThanOrEqualTo({
  order: Order,
  formatter: (bd) => format2(bd)
});
var isLessThanBigDecimal = /* @__PURE__ */ makeIsLessThan({
  order: Order,
  formatter: (bd) => format2(bd)
});
var isLessThanOrEqualToBigDecimal = /* @__PURE__ */ makeIsLessThanOrEqualTo({
  order: Order,
  formatter: (bd) => format2(bd)
});
var isBetweenBigDecimal = /* @__PURE__ */ makeIsBetween({
  order: Order,
  formatter: (bd) => format2(bd)
});
function isMinLength(minLength, annotations) {
  minLength = Math.max(0, Math.floor(minLength));
  return makeFilter2((input) => input.length >= minLength, {
    expected: `a value with a length of at least ${minLength}`,
    representation: {
      id: "effect/schema/isMinLength",
      payload: {
        minLength
      }
    },
    toJsonSchema: ({
      type
    }) => type === "array" ? {
      minItems: minLength
    } : {
      minLength
    },
    toCode: () => ({
      runtime: `Schema.isMinLength(${minLength})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        minLength
      }
    },
    ...annotations
  });
}
var isMinLengthReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMinLength", /* @__PURE__ */ Struct3({
  minLength: Natural
}), ({
  annotations,
  payload
}) => isMinLength(payload.minLength, annotations));
function isNonEmpty(annotations) {
  return isMinLength(1, annotations);
}
function isMaxLength(maxLength, annotations) {
  maxLength = Math.max(0, Math.floor(maxLength));
  return makeFilter2((input) => input.length <= maxLength, {
    expected: `a value with a length of at most ${maxLength}`,
    representation: {
      id: "effect/schema/isMaxLength",
      payload: {
        maxLength
      }
    },
    toJsonSchema: ({
      type
    }) => type === "array" ? {
      maxItems: maxLength
    } : {
      maxLength
    },
    toCode: () => ({
      runtime: `Schema.isMaxLength(${maxLength})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        maxLength
      }
    },
    ...annotations
  });
}
var isMaxLengthReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMaxLength", /* @__PURE__ */ Struct3({
  maxLength: Natural
}), ({
  annotations,
  payload
}) => isMaxLength(payload.maxLength, annotations));
function isLengthBetween(minimum, maximum, annotations) {
  minimum = Math.max(0, Math.floor(minimum));
  maximum = Math.max(0, Math.floor(maximum));
  return makeFilter2((input) => input.length >= minimum && input.length <= maximum, {
    expected: minimum === maximum ? `a value with a length of ${minimum}` : `a value with a length between ${minimum} and ${maximum}`,
    representation: {
      id: "effect/schema/isLengthBetween",
      payload: {
        minimum,
        maximum
      }
    },
    toJsonSchema: ({
      type
    }) => type === "array" ? {
      allOf: [{
        minItems: minimum
      }, {
        maxItems: maximum
      }]
    } : {
      allOf: [{
        minLength: minimum
      }, {
        maxLength: maximum
      }]
    },
    toCode: () => ({
      runtime: `Schema.isLengthBetween(${minimum}, ${maximum})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        minLength: minimum,
        maxLength: maximum
      }
    },
    ...annotations
  });
}
var isLengthBetweenReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLengthBetween", /* @__PURE__ */ Struct3({
  minimum: Natural,
  maximum: Natural
}), ({
  annotations,
  payload
}) => isLengthBetween(payload.minimum, payload.maximum, annotations));
function isMinSize(minSize, annotations) {
  minSize = Math.max(0, Math.floor(minSize));
  return makeFilter2((input) => input.size >= minSize, {
    expected: `a value with a size of at least ${minSize}`,
    representation: {
      id: "effect/schema/isMinSize",
      payload: {
        minSize
      }
    },
    toJsonSchema: () => ({}),
    toCode: () => ({
      runtime: `Schema.isMinSize(${minSize})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        minLength: minSize
      }
    },
    ...annotations
  });
}
var isMinSizeReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMinSize", /* @__PURE__ */ Struct3({
  minSize: Natural
}), ({
  annotations,
  payload
}) => isMinSize(payload.minSize, annotations));
function isMaxSize(maxSize, annotations) {
  maxSize = Math.max(0, Math.floor(maxSize));
  return makeFilter2((input) => input.size <= maxSize, {
    expected: `a value with a size of at most ${maxSize}`,
    representation: {
      id: "effect/schema/isMaxSize",
      payload: {
        maxSize
      }
    },
    toJsonSchema: () => ({}),
    toCode: () => ({
      runtime: `Schema.isMaxSize(${maxSize})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        maxLength: maxSize
      }
    },
    ...annotations
  });
}
var isMaxSizeReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMaxSize", /* @__PURE__ */ Struct3({
  maxSize: Natural
}), ({
  annotations,
  payload
}) => isMaxSize(payload.maxSize, annotations));
function isSizeBetween(minimum, maximum, annotations) {
  minimum = Math.max(0, Math.floor(minimum));
  maximum = Math.max(0, Math.floor(maximum));
  return makeFilter2((input) => input.size >= minimum && input.size <= maximum, {
    expected: minimum === maximum ? `a value with a size of ${minimum}` : `a value with a size between ${minimum} and ${maximum}`,
    representation: {
      id: "effect/schema/isSizeBetween",
      payload: {
        minimum,
        maximum
      }
    },
    toJsonSchema: () => ({}),
    toCode: () => ({
      runtime: `Schema.isSizeBetween(${minimum}, ${maximum})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        minLength: minimum,
        maxLength: maximum
      }
    },
    ...annotations
  });
}
var isSizeBetweenReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isSizeBetween", /* @__PURE__ */ Struct3({
  minimum: Natural,
  maximum: Natural
}), ({
  annotations,
  payload
}) => isSizeBetween(payload.minimum, payload.maximum, annotations));
function isMinProperties(minProperties, annotations) {
  minProperties = Math.max(0, Math.floor(minProperties));
  return makeFilter2((input) => Reflect.ownKeys(input).length >= minProperties, {
    expected: `a value with at least ${minProperties === 1 ? "1 entry" : `${minProperties} entries`}`,
    representation: {
      id: "effect/schema/isMinProperties",
      payload: {
        minProperties
      }
    },
    toJsonSchema: () => ({
      minProperties
    }),
    toCode: () => ({
      runtime: `Schema.isMinProperties(${minProperties})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        minLength: minProperties
      }
    },
    ...annotations
  });
}
var isMinPropertiesReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMinProperties", /* @__PURE__ */ Struct3({
  minProperties: Natural
}), ({
  annotations,
  payload
}) => isMinProperties(payload.minProperties, annotations));
function isMaxProperties(maxProperties, annotations) {
  maxProperties = Math.max(0, Math.floor(maxProperties));
  return makeFilter2((input) => Reflect.ownKeys(input).length <= maxProperties, {
    expected: `a value with at most ${maxProperties === 1 ? "1 entry" : `${maxProperties} entries`}`,
    representation: {
      id: "effect/schema/isMaxProperties",
      payload: {
        maxProperties
      }
    },
    toJsonSchema: () => ({
      maxProperties
    }),
    toCode: () => ({
      runtime: `Schema.isMaxProperties(${maxProperties})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        maxLength: maxProperties
      }
    },
    ...annotations
  });
}
var isMaxPropertiesReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isMaxProperties", /* @__PURE__ */ Struct3({
  maxProperties: Natural
}), ({
  annotations,
  payload
}) => isMaxProperties(payload.maxProperties, annotations));
function isPropertiesLengthBetween(minimum, maximum, annotations) {
  minimum = Math.max(0, Math.floor(minimum));
  maximum = Math.max(0, Math.floor(maximum));
  return makeFilter2((input) => Reflect.ownKeys(input).length >= minimum && Reflect.ownKeys(input).length <= maximum, {
    expected: minimum === maximum ? `a value with exactly ${minimum === 1 ? "1 entry" : `${minimum} entries`}` : `a value with between ${minimum} and ${maximum} entries`,
    representation: {
      id: "effect/schema/isPropertiesLengthBetween",
      payload: {
        minimum,
        maximum
      }
    },
    toJsonSchema: () => ({
      minProperties: minimum,
      maxProperties: maximum
    }),
    toCode: () => ({
      runtime: `Schema.isPropertiesLengthBetween(${minimum}, ${maximum})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    arbitrary: {
      constraint: {
        minLength: minimum,
        maxLength: maximum
      }
    },
    ...annotations
  });
}
var isPropertiesLengthBetweenReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isPropertiesLengthBetween", /* @__PURE__ */ Struct3({
  minimum: Natural,
  maximum: Natural
}), ({
  annotations,
  payload
}) => isPropertiesLengthBetween(payload.minimum, payload.maximum, annotations));
function isPropertyNames(keySchema, annotations) {
  const propertyNames = toEncoded2(keySchema);
  const parser = _issue(propertyNames.ast);
  return makeFilter2((input, ast, options2) => {
    const keys4 = Reflect.ownKeys(input);
    const issues = [];
    for (const key of keys4) {
      const issue = parser(key, options2);
      if (issue !== void 0) {
        issues.push(new Pointer([key], issue));
        if (options2.errors === "first") break;
      }
    }
    if (isArrayNonEmpty2(issues)) {
      return new Composite(ast, issues, input, options2);
    }
    return true;
  }, {
    expected: "an object with property names matching the schema",
    representation: {
      id: "effect/schema/isPropertyNames",
      payload: null,
      schemas: [propertyNames.ast]
    },
    toJsonSchema: ({
      schemas
    }) => ({
      propertyNames: schemas[0]
    }),
    toCode: ({
      schemas
    }) => ({
      runtime: `Schema.isPropertyNames(${schemas[0].runtime})`
    }),
    [STRUCTURAL_ANNOTATION_KEY]: true,
    ...annotations
  });
}
var isPropertyNamesReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isPropertyNames", Null2, ({
  annotations,
  schemas
}) => isPropertyNames(schemas[0], annotations));
function isUnique(annotations) {
  return makeFilter2((input) => dedupe(input).length === input.length, {
    expected: "an array with unique items",
    representation: {
      id: "effect/schema/isUnique",
      payload: null
    },
    toJsonSchema: () => ({
      uniqueItems: true
    }),
    toCode: () => ({
      runtime: "Schema.isUnique()"
    }),
    arbitrary: {
      constraint: {
        unique: true
      }
    },
    ...annotations
  });
}
var isUniqueReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isUnique", Null2, ({
  annotations
}) => isUnique(annotations));
var NonEmptyString = /* @__PURE__ */ String5.check(/* @__PURE__ */ isNonEmpty());
var Char = /* @__PURE__ */ String5.check(/* @__PURE__ */ isLengthBetween(1, 1));
function Option(value3) {
  const schema = declareConstructor()([value3], ([value4]) => (input, ast, options2) => {
    if (isOption2(input)) {
      if (isNone2(input)) {
        return succeedNone2;
      }
      return mapBothEager2(decodeUnknownEffect(value4)(input.value, options2), {
        onSuccess: some2,
        onFailure: (issue) => makeCompositeAtKey(ast, "value", issue, input, options2)
      });
    }
    return fail5(new InvalidType(ast, input, options2));
  }, {
    representation: {
      id: "effect/schema/Option",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.Option(${typeParameters[0].runtime})`,
      Type: `Option.Option<${typeParameters[0].Type}>`,
      importDeclarations: [`import * as Option from "effect/Option"`]
    }),
    expected: "Option",
    toCodec: ([value4]) => link()(Union2([Struct3({
      _tag: Literal2("Some"),
      value: value4
    }), Struct3({
      _tag: Literal2("None")
    })]), transform2({
      decode: (e) => e._tag === "None" ? none2() : some2(e.value),
      encode: (o) => isSome2(o) ? {
        _tag: "Some",
        value: o.value
      } : {
        _tag: "None"
      }
    })),
    toArbitrary: ([value4]) => (fc, ctx) => {
      const terminal = fc.constant(none2());
      const arbitrary = fc.oneof(terminal, value4.arbitrary.map(some2));
      return withRecursion(fc, ctx, terminal, arbitrary);
    },
    toEquivalence: ([value4]) => makeEquivalence(value4),
    toFormatter: ([value4]) => match({
      onNone: () => "none()",
      onSome: (t) => `some(${value4(t)})`
    })
  });
  return make19(schema.ast, {
    value: value3
  });
}
var OptionReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Option", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = Option(typeParameters[0]);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
function OptionFromNullOr(schema) {
  return NullOr(schema).pipe(decodeTo2(Option(toType2(schema)), optionFromNullOr()));
}
function OptionFromUndefinedOr(schema) {
  return UndefinedOr(schema).pipe(decodeTo2(Option(toType2(schema)), optionFromUndefinedOr()));
}
function OptionFromNullishOr(schema, options2) {
  return NullishOr(schema).pipe(decodeTo2(Option(toType2(schema)), optionFromNullishOr(options2)));
}
function OptionFromOptionalKey(schema) {
  return optionalKey2(schema).pipe(decodeTo2(Option(toType2(schema)), optionFromOptionalKey()));
}
function OptionFromOptional(schema) {
  return optional2(schema).pipe(decodeTo2(Option(toType2(schema)), optionFromOptional()));
}
function OptionFromOptionalNullOr(schema, options2) {
  const onNoneEncoding = options2 === void 0 ? "omit" : options2.onNoneEncoding;
  const noneValue = onNoneEncoding === null ? null : void 0;
  return optional2(NullOr(schema)).pipe(decodeTo2(Option(toType2(schema)), transformOptional2({
    decode: (oe) => oe.pipe(filter(isNotNullish), some2),
    encode: onNoneEncoding === "omit" ? flatten : (ot) => some2(getOrElse(flatten(ot), () => noneValue))
  })));
}
function Result(success, failure) {
  const schema = declareConstructor()([success, failure], ([success2, failure2]) => (input, ast, options2) => {
    if (!isResult2(input)) {
      return fail5(new InvalidType(ast, input, options2));
    }
    switch (input._tag) {
      case "Success":
        return mapBothEager2(decodeEffect(success2)(input.success, options2), {
          onSuccess: succeed2,
          onFailure: (issue) => makeCompositeAtKey(ast, "success", issue, input, options2)
        });
      case "Failure":
        return mapBothEager2(decodeEffect(failure2)(input.failure, options2), {
          onSuccess: fail2,
          onFailure: (issue) => makeCompositeAtKey(ast, "failure", issue, input, options2)
        });
    }
  }, {
    representation: {
      id: "effect/schema/Result",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.Result(${typeParameters[0].runtime}, ${typeParameters[1].runtime})`,
      Type: `Result.Result<${typeParameters[0].Type}, ${typeParameters[1].Type}>`,
      importDeclarations: [`import * as Result from "effect/Result"`]
    }),
    expected: "Result",
    toCodec: ([success2, failure2]) => link()(Union2([Struct3({
      _tag: Literal2("Success"),
      success: success2
    }), Struct3({
      _tag: Literal2("Failure"),
      failure: failure2
    })]), transform2({
      decode: (e) => e._tag === "Success" ? succeed2(e.success) : fail2(e.failure),
      encode: (r) => isSuccess2(r) ? {
        _tag: "Success",
        success: r.success
      } : {
        _tag: "Failure",
        failure: r.failure
      }
    })),
    toArbitrary: ([success2, failure2]) => (fc, ctx) => {
      const terminal = oneOfArbitraries(fc, success2.terminal?.map((a) => succeed2(a)), failure2.terminal?.map((e) => fail2(e)));
      const arbitrary = fc.oneof(success2.arbitrary.map((a) => succeed2(a)), failure2.arbitrary.map((e) => fail2(e)));
      return withRecursion(fc, ctx, terminal, arbitrary);
    },
    toEquivalence: ([success2, failure2]) => makeEquivalence2(success2, failure2),
    toFormatter: ([success2, failure2]) => match2({
      onSuccess: (t) => `success(${success2(t)})`,
      onFailure: (t) => `failure(${failure2(t)})`
    })
  });
  return make19(schema.ast, {
    success,
    failure
  });
}
var ResultReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Result", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = Result(typeParameters[0], typeParameters[1]);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
var RedactedOptionsPayload = /* @__PURE__ */ declare((input) => {
  if (!isObject(input)) {
    return false;
  }
  const keys4 = globalThis.Object.keys(input);
  return keys4.length > 0 && keys4.every((key) => {
    switch (key) {
      case "label":
        return typeof input[key] === "string";
      case "disallowJsonEncode":
        return input[key] === true;
      default:
        return false;
    }
  });
});
var RedactedRepresentationPayload = /* @__PURE__ */ Union2([Null2, RedactedOptionsPayload]);
function Redacted(value3, options2) {
  const label = typeof options2?.label === "string" ? options2.label : void 0;
  const disallowJsonEncode = options2?.disallowJsonEncode === true;
  const normalizedOptions = label !== void 0 ? disallowJsonEncode ? {
    label,
    disallowJsonEncode: true
  } : {
    label
  } : disallowJsonEncode ? {
    disallowJsonEncode: true
  } : void 0;
  const decodeLabel = label !== void 0 ? decodeUnknownEffect(Literal2(label)) : void 0;
  const schema = declareConstructor()([value3], ([value4]) => (input, ast, poptions) => {
    if (isRedacted(input)) {
      const label2 = decodeLabel !== void 0 ? mapErrorEager2(decodeLabel(input.label, poptions), (issue) => new Pointer(["label"], issue)) : void_4;
      return flatMapEager2(label2, () => mapBothEager2(decodeUnknownEffect(value4)(value2(input), poptions), {
        onSuccess: () => input,
        onFailure: () => {
          return new Composite(ast, [new Pointer(["value"], new InvalidValue(void 0, input, poptions))], input, poptions);
        }
      }));
    }
    return fail5(new InvalidType(ast, input, poptions));
  }, {
    representation: {
      id: "effect/schema/Redacted",
      payload: normalizedOptions ?? null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: normalizedOptions !== void 0 ? `Schema.Redacted(${typeParameters[0].runtime}, ${format(normalizedOptions)})` : `Schema.Redacted(${typeParameters[0].runtime})`,
      Type: `Redacted.Redacted<${typeParameters[0].Type}>`,
      importDeclarations: [`import * as Redacted from "effect/Redacted"`]
    }),
    expected: "Redacted",
    toCodecJson: ([value4]) => link()(value4, {
      decode: transform((e) => make18(e, {
        label
      })),
      encode: disallowJsonEncode ? forbidden((oe) => "Cannot serialize Redacted" + (isSome2(oe) && typeof oe.value.label === "string" ? ` with label: "${oe.value.label}"` : "")) : transform(value2)
    }),
    toArbitrary: ([value4]) => () => ({
      arbitrary: value4.arbitrary.map((a) => make18(a, {
        label
      })),
      terminal: value4.terminal?.map((a) => make18(a, {
        label
      }))
    }),
    toFormatter: () => globalThis.String,
    toEquivalence: ([value4]) => makeEquivalence5(value4)
  });
  return make19(schema.ast, {
    value: value3
  });
}
var RedactedReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Redacted", RedactedRepresentationPayload, ({
  annotations,
  payload,
  typeParameters
}) => {
  const schema = Redacted(typeParameters[0], payload ?? void 0);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
function RedactedFromValue(value3, options2) {
  return decodeTo2(Redacted(toType2(value3), {
    label: options2?.label,
    disallowJsonEncode: options2?.disallowEncode
  }), {
    decode: transform((t) => make18(t, {
      label: options2?.label
    })),
    encode: options2?.disallowEncode ? forbidden((oe) => "Cannot encode Redacted" + (isSome2(oe) && typeof oe.value.label === "string" ? ` with label: "${oe.value.label}"` : "")) : transform(value2)
  })(value3);
}
function CauseReason(error, defect) {
  const schema = declareConstructor()([error, defect], ([error2, defect2]) => (input, ast, options2) => {
    if (!isReason(input)) {
      return fail5(new InvalidType(ast, input, options2));
    }
    switch (input._tag) {
      case "Fail":
        return mapBothEager2(decodeUnknownEffect(error2)(input.error, options2), {
          onSuccess: makeFailReason,
          onFailure: (issue) => makeCompositeAtKey(ast, "error", issue, input, options2)
        });
      case "Die":
        return mapBothEager2(decodeUnknownEffect(defect2)(input.defect, options2), {
          onSuccess: makeDieReason,
          onFailure: (issue) => makeCompositeAtKey(ast, "defect", issue, input, options2)
        });
      case "Interrupt":
        return succeed6(input);
    }
  }, {
    representation: {
      id: "effect/schema/CauseReason",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.CauseReason(${typeParameters[0].runtime}, ${typeParameters[1].runtime})`,
      Type: `Cause.Failure<${typeParameters[0].Type}, ${typeParameters[1].Type}>`,
      importDeclarations: [`import * as Cause from "effect/Cause"`]
    }),
    expected: "Cause.Failure",
    toCodec: ([error2, defect2]) => link()(Union2([Struct3({
      _tag: Literal2("Fail"),
      error: error2
    }), Struct3({
      _tag: Literal2("Die"),
      defect: defect2
    }), Struct3({
      _tag: Literal2("Interrupt"),
      fiberId: UndefinedOr(Finite)
    })]), transform2({
      decode: (e) => {
        switch (e._tag) {
          case "Fail":
            return makeFailReason(e.error);
          case "Die":
            return makeDieReason(e.defect);
          case "Interrupt":
            return makeInterruptReason2(e.fiberId);
        }
      },
      encode: identity
    })),
    toArbitrary: ([error2, defect2]) => causeReasonToArbitrary(error2, defect2),
    toEquivalence: ([error2, defect2]) => causeReasonToEquivalence(error2, defect2),
    toFormatter: ([error2, defect2]) => causeReasonToFormatter(error2, defect2)
  });
  return make19(schema.ast, {
    error,
    defect
  });
}
var CauseReasonReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/CauseReason", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = CauseReason(typeParameters[0], typeParameters[1]);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
function causeReasonToArbitrary(error, defect) {
  return (fc, ctx) => {
    const terminal = fc.constant(makeInterruptReason2());
    const arbitrary = fc.oneof(terminal, fc.integer({
      min: 1
    }).map(makeInterruptReason2), error.arbitrary.map((e) => makeFailReason(e)), defect.arbitrary.map((d) => makeDieReason(d)));
    return withRecursion(fc, ctx, terminal, arbitrary);
  };
}
function causeReasonToEquivalence(error, defect) {
  return (a, b) => {
    if (a._tag !== b._tag) return false;
    switch (a._tag) {
      case "Fail":
        return error(a.error, b.error);
      case "Die":
        return defect(a.defect, b.defect);
      case "Interrupt":
        return a.fiberId === b.fiberId;
    }
  };
}
function causeReasonToFormatter(error, defect) {
  return (t) => {
    switch (t._tag) {
      case "Fail":
        return `Fail(${error(t.error)})`;
      case "Die":
        return `Die(${defect(t.defect)})`;
      case "Interrupt":
        return "Interrupt";
    }
  };
}
function Cause(error, defect) {
  const schema = declareConstructor()([error, defect], ([error2, defect2]) => {
    const failures = ArraySchema(CauseReason(error2, defect2));
    return (input, ast, options2) => {
      if (!isCause2(input)) {
        return fail5(new InvalidType(ast, input, options2));
      }
      return mapBothEager2(decodeUnknownEffect(failures)(input.reasons, options2), {
        onSuccess: fromReasons,
        onFailure: (issue) => makeCompositeAtKey(ast, "failures", issue, input, options2)
      });
    };
  }, {
    representation: {
      id: "effect/schema/Cause",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.Cause(${typeParameters[0].runtime}, ${typeParameters[1].runtime})`,
      Type: `Cause.Cause<${typeParameters[0].Type}, ${typeParameters[1].Type}>`,
      importDeclarations: [`import * as Cause from "effect/Cause"`]
    }),
    expected: "Cause",
    toCodec: ([error2, defect2]) => link()(ArraySchema(CauseReason(error2, defect2)), transform2({
      decode: fromReasons,
      encode: ({
        reasons: failures
      }) => failures
    })),
    toArbitrary: ([error2, defect2]) => causeToArbitrary(error2, defect2),
    toEquivalence: ([error2, defect2]) => causeToEquivalence(error2, defect2),
    toFormatter: ([error2, defect2]) => causeToFormatter(error2, defect2)
  });
  return make19(schema.ast, {
    error,
    defect
  });
}
var CauseReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Cause", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = Cause(typeParameters[0], typeParameters[1]);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
function causeToArbitrary(error, defect) {
  return (fc, ctx) => {
    const reason = causeReasonToArbitrary(error, defect)(fc, ctx);
    const terminal = fc.constant(empty3);
    const arbitrary = fc.array(reason.arbitrary).map(fromReasons);
    return withRecursion(fc, ctx, terminal, arbitrary);
  };
}
function causeToEquivalence(error, defect) {
  const failures = Array_(causeReasonToEquivalence(error, defect));
  return (a, b) => failures(a.reasons, b.reasons);
}
function causeToFormatter(error, defect) {
  const causeReason = causeReasonToFormatter(error, defect);
  return (t) => `Cause([${t.reasons.map(causeReason).join(", ")}])`;
}
var ErrorOptionsPayload = /* @__PURE__ */ declare((input) => {
  if (!isObject(input)) {
    return false;
  }
  const keys4 = globalThis.Object.keys(input);
  return keys4.length > 0 && keys4.every((key) => (key === "includeStack" || key === "excludeCause") && input[key] === true);
});
var ErrorRepresentationPayload = /* @__PURE__ */ Union2([Null2, ErrorOptionsPayload]);
var getErrorOptionsKey = (options2) => (options2?.includeStack === true ? 1 : 0) | (options2?.excludeCause === true ? 2 : 0);
var getErrorOptions = (key) => {
  switch (key) {
    case 0:
      return void 0;
    case 1:
      return {
        includeStack: true
      };
    case 2:
      return {
        excludeCause: true
      };
    case 3:
      return {
        includeStack: true,
        excludeCause: true
      };
  }
};
var errorSchemaCache = [];
function ErrorInstance(options2) {
  const key = getErrorOptionsKey(options2);
  const cached3 = errorSchemaCache[key];
  if (cached3 !== void 0) {
    return cached3;
  }
  const normalizedOptions = getErrorOptions(key);
  const schema = instanceOf(globalThis.Error, {
    representation: {
      id: "effect/schema/Error",
      payload: normalizedOptions ?? null
    },
    toCode: () => ({
      runtime: normalizedOptions !== void 0 ? `Schema.ErrorInstance(${format(normalizedOptions)})` : `Schema.ErrorInstance()`,
      Type: `globalThis.Error`
    }),
    expected: "Error",
    toCodecJson: () => link()(JsonError, errorFromJsonError(normalizedOptions)),
    toArbitrary: () => (fc) => fc.string().map((message) => new globalThis.Error(message))
  });
  errorSchemaCache[key] = schema;
  return schema;
}
var ErrorInstanceReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Error", ErrorRepresentationPayload, ({
  annotations,
  payload
}) => {
  const schema = ErrorInstance(payload ?? void 0);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
var defectSchemaCache = [];
function Defect(options2) {
  const key = getErrorOptionsKey(options2);
  const cached3 = defectSchemaCache[key];
  if (cached3 !== void 0) {
    return cached3;
  }
  const schema = Json2.pipe(decodeTo2(Unknown2, defectFromJson(getErrorOptions(key))));
  defectSchemaCache[key] = schema;
  return schema;
}
function Exit(value3, error, defect) {
  const schema = declareConstructor()([value3, error, defect], ([value4, error2, defect2]) => {
    const cause = Cause(error2, defect2);
    return (input, ast, options2) => {
      if (!isExit2(input)) {
        return fail5(new InvalidType(ast, input, options2));
      }
      switch (input._tag) {
        case "Success":
          return mapBothEager2(decodeUnknownEffect(value4)(input.value, options2), {
            onSuccess: succeed4,
            onFailure: (issue) => makeCompositeAtKey(ast, "value", issue, input, options2)
          });
        case "Failure":
          return mapBothEager2(decodeUnknownEffect(cause)(input.cause, options2), {
            onSuccess: failCause2,
            onFailure: (issue) => makeCompositeAtKey(ast, "cause", issue, input, options2)
          });
      }
    };
  }, {
    representation: {
      id: "effect/schema/Exit",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.Exit(${typeParameters[0].runtime}, ${typeParameters[1].runtime}, ${typeParameters[2].runtime})`,
      Type: `Exit.Exit<${typeParameters[0].Type}, ${typeParameters[1].Type}, ${typeParameters[2].Type}>`,
      importDeclarations: [`import * as Exit from "effect/Exit"`]
    }),
    expected: "Exit",
    toCodec: ([value4, error2, defect2]) => link()(Union2([Struct3({
      _tag: Literal2("Success"),
      value: value4
    }), Struct3({
      _tag: Literal2("Failure"),
      cause: Cause(error2, defect2)
    })]), transform2({
      decode: (e) => e._tag === "Success" ? succeed4(e.value) : failCause2(e.cause),
      encode: (exit3) => isSuccess4(exit3) ? {
        _tag: "Success",
        value: exit3.value
      } : {
        _tag: "Failure",
        cause: exit3.cause
      }
    })),
    toArbitrary: ([value4, error2, defect2]) => (fc, ctx) => {
      const cause = causeToArbitrary(error2, defect2)(fc, ctx);
      const terminal = oneOfArbitraries(fc, value4.terminal?.map((v) => succeed4(v)), cause.terminal?.map((cause2) => failCause2(cause2)));
      const arbitrary = fc.oneof(value4.arbitrary.map((v) => succeed4(v)), cause.arbitrary.map((cause2) => failCause2(cause2)));
      return withRecursion(fc, ctx, terminal, arbitrary);
    },
    toEquivalence: ([value4, error2, defect2]) => {
      const cause = causeToEquivalence(error2, defect2);
      return (a, b) => {
        if (a._tag !== b._tag) return false;
        switch (a._tag) {
          case "Success":
            return value4(a.value, b.value);
          case "Failure":
            return cause(a.cause, b.cause);
        }
      };
    },
    toFormatter: ([value4, error2, defect2]) => {
      const cause = causeToFormatter(error2, defect2);
      return (t) => {
        switch (t._tag) {
          case "Success":
            return `Exit.Success(${value4(t.value)})`;
          case "Failure":
            return `Exit.Failure(${cause(t.cause)})`;
        }
      };
    }
  });
  return make19(schema.ast, {
    value: value3,
    error,
    defect
  });
}
var ExitReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Exit", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = Exit(typeParameters[0], typeParameters[1], typeParameters[2]);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
function oneOfArbitraries(fc, a, b) {
  return a === void 0 ? b : b === void 0 ? a : fc.oneof(a, b);
}
function withRecursion(fc, ctx, terminal, arbitrary) {
  return {
    arbitrary: terminal === void 0 || ctx.recursion === void 0 ? arbitrary : fc.oneof(ctx.recursion, terminal, arbitrary),
    terminal
  };
}
function arrayFromItems(fc, item, constraints, comparator) {
  return comparator === void 0 ? fc.array(item, constraints) : fc.uniqueArray(item, {
    ...constraints,
    comparator
  });
}
function collectionArbitrary(fc, ctx, item, terminalItem, fromIterable8, comparator) {
  const constraint = ctx.constraint;
  const constraints = constraint === void 0 || constraint.minLength === void 0 && constraint.maxLength === void 0 ? void 0 : {
    ...constraint.minLength !== void 0 ? {
      minLength: constraint.minLength
    } : {},
    ...constraint.maxLength !== void 0 ? {
      maxLength: constraint.maxLength
    } : {}
  };
  if (constraints?.minLength !== void 0 && constraints.maxLength !== void 0 && constraints.minLength > constraints.maxLength) {
    throw new globalThis.Error("Unable to derive an arbitrary for size constraints");
  }
  const minLength = constraints?.minLength ?? 0;
  const terminal = minLength === 0 ? fc.constant([]) : terminalItem === void 0 ? void 0 : arrayFromItems(fc, terminalItem, {
    ...constraints,
    maxLength: minLength
  }, comparator);
  const arrays = withRecursion(fc, ctx, terminal, arrayFromItems(fc, item, constraints, comparator));
  return {
    arbitrary: arrays.arbitrary.map(fromIterable8),
    terminal: arrays.terminal?.map(fromIterable8)
  };
}
function entriesArbitrary(fc, ctx, key, value3, fromIterable8) {
  return collectionArbitrary(fc, ctx, fc.tuple(key.arbitrary, value3.arbitrary), key.terminal === void 0 || value3.terminal === void 0 ? void 0 : fc.tuple(key.terminal, value3.terminal), fromIterable8, ([a], [b]) => equals(a, b));
}
function ReadonlyMap(key, value3) {
  const schema = declareConstructor()([key, value3], ([key2, value4]) => {
    const array3 = ArraySchema(Tuple([key2, value4]));
    return (input, ast, options2) => {
      if (input instanceof globalThis.Map) {
        return mapBothEager2(decodeUnknownEffect(array3)([...input], options2), {
          onSuccess: (array4) => new globalThis.Map(array4),
          onFailure: (issue) => makeCompositeAtKey(ast, "entries", issue, input, options2)
        });
      }
      return fail5(new InvalidType(ast, input, options2));
    };
  }, {
    representation: {
      id: "effect/schema/ReadonlyMap",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.ReadonlyMap(${typeParameters[0].runtime}, ${typeParameters[1].runtime})`,
      Type: `globalThis.ReadonlyMap<${typeParameters[0].Type}, ${typeParameters[1].Type}>`
    }),
    expected: "ReadonlyMap",
    toCodec: ([key2, value4]) => link()(ArraySchema(Tuple([key2, value4])), transform2({
      decode: (e) => new globalThis.Map(e),
      encode: (map11) => [...map11.entries()]
    })),
    toArbitrary: ([key2, value4]) => (fc, ctx) => entriesArbitrary(fc, ctx, key2, value4, (as4) => new globalThis.Map(as4)),
    toEquivalence: ([key2, value4]) => makeCompareMap(key2, value4),
    toFormatter: ([key2, value4]) => (t) => {
      const size6 = t.size;
      if (size6 === 0) {
        return "ReadonlyMap(0) {}";
      }
      const entries3 = globalThis.Array.from(t.entries()).sort().map(([k, v]) => `${key2(k)} => ${value4(v)}`);
      return `ReadonlyMap(${size6}) { ${entries3.join(", ")} }`;
    }
  });
  return make19(schema.ast, {
    key,
    value: value3
  });
}
var ReadonlyMapReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/ReadonlyMap", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = ReadonlyMap(typeParameters[0], typeParameters[1]);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
function graphEncodedSchema(type, node, edge) {
  return Struct3({
    type: Literal2(type),
    nodes: ArraySchema(Struct3({
      index: Natural,
      data: node
    })),
    edges: ArraySchema(Struct3({
      index: Natural,
      source: Natural,
      target: Natural,
      data: edge
    }))
  });
}
function graphDecode(input, options2) {
  let previous = -1;
  const indexes = /* @__PURE__ */ new Set();
  for (let i = 0; i < input.nodes.length; i++) {
    const index2 = input.nodes[i].index;
    if (index2 <= previous) {
      return fail5(new Pointer(["nodes", i, "index"], new InvalidValue({
        expected: "a strictly increasing node index"
      }, index2, options2)));
    }
    previous = index2;
    indexes.add(index2);
  }
  previous = -1;
  for (let i = 0; i < input.edges.length; i++) {
    const edge = input.edges[i];
    if (edge.index <= previous) {
      return fail5(new Pointer(["edges", i, "index"], new InvalidValue({
        expected: "a strictly increasing edge index"
      }, edge.index, options2)));
    }
    previous = edge.index;
    if (!indexes.has(edge.source)) {
      return fail5(new Pointer(["edges", i, "source"], new InvalidValue({
        expected: "an encoded node index"
      }, edge.source, options2)));
    }
    if (!indexes.has(edge.target)) {
      return fail5(new Pointer(["edges", i, "target"], new InvalidValue({
        expected: "an encoded node index"
      }, edge.target, options2)));
    }
  }
  return succeed6(hydrate(input));
}
function graphEncode(input, type, options2) {
  if (!isGraph(input) || input.mutable || input.type !== type) {
    return fail5(new InvalidValue({
      expected: `an immutable ${type} Graph`
    }, input, options2));
  }
  return succeed6(snapshot(input));
}
function graphToEquivalence(node, edge) {
  return (self, that) => {
    const a = snapshot(self);
    const b = snapshot(that);
    if (a.type !== b.type || a.nodes.length !== b.nodes.length || a.edges.length !== b.edges.length) return false;
    for (let i = 0; i < a.nodes.length; i++) {
      if (a.nodes[i].index !== b.nodes[i].index || !node(a.nodes[i].data, b.nodes[i].data)) return false;
    }
    for (let i = 0; i < a.edges.length; i++) {
      const ae = a.edges[i];
      const be = b.edges[i];
      const sameEndpoints = a.type === "directed" ? ae.source === be.source && ae.target === be.target : ae.source === be.source && ae.target === be.target || ae.source === be.target && ae.target === be.source;
      if (ae.index !== be.index || !sameEndpoints || !edge(ae.data, be.data)) return false;
    }
    return true;
  };
}
function graphToArbitrary(type, node, edge) {
  return (fc, ctx) => {
    const empty7 = hydrate({
      type,
      nodes: [],
      edges: []
    });
    const terminal = fc.constant(empty7);
    const arbitrary = fc.array(node.arbitrary).chain((values2) => {
      const nodes = values2.map((data, index2) => ({
        index: index2,
        data
      }));
      if (nodes.length === 0) return terminal;
      const endpoint = fc.integer({
        min: 0,
        max: nodes.length - 1
      });
      return fc.array(fc.tuple(endpoint, endpoint, edge.arbitrary)).map((values3) => hydrate({
        type,
        nodes,
        edges: values3.map(([source, target, data], index2) => ({
          index: index2,
          source,
          target,
          data
        }))
      }));
    });
    return withRecursion(fc, ctx, terminal, arbitrary);
  };
}
function Graph(type, node, edge) {
  const schema = declareConstructor()([node, edge], ([node2, edge2]) => {
    const encoded = graphEncodedSchema(type, node2, edge2);
    return (input, ast, options2) => {
      if (!isGraph(input) || input.mutable || input.type !== type) {
        return fail5(new InvalidType(ast, input, options2));
      }
      return flatMap4(decodeUnknownEffect(encoded)(snapshot(input), options2), (snapshot2) => graphDecode(snapshot2, options2));
    };
  }, {
    representation: {
      id: "effect/schema/Graph",
      payload: type
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.Graph(${format(type)}, ${typeParameters[0].runtime}, ${typeParameters[1].runtime})`,
      Type: `Graph.Graph<${typeParameters[0].Type}, ${typeParameters[1].Type}, ${format(type)}>`,
      importDeclarations: [`import * as Graph from "effect/Graph"`]
    }),
    expected: `an immutable ${type} Graph`,
    toCodec: ([node2, edge2]) => link()(graphEncodedSchema(type, node2, edge2), transformOrFail2({
      decode: graphDecode,
      encode: (graph, options2) => graphEncode(graph, type, options2)
    })),
    toArbitrary: ([node2, edge2]) => graphToArbitrary(type, node2, edge2),
    toEquivalence: ([node2, edge2]) => graphToEquivalence(node2, edge2),
    toFormatter: () => globalThis.String
  });
  return make19(schema.ast, {
    type,
    node,
    edge
  });
}
var GraphReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Graph", /* @__PURE__ */ Literals(["directed", "undirected"]), ({
  annotations,
  payload,
  typeParameters
}) => {
  const schema = Graph(payload, typeParameters[0], typeParameters[1]);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
function HashMap(key, value3) {
  const schema = declareConstructor()([key, value3], ([key2, value4]) => {
    const entries3 = ArraySchema(Tuple([key2, value4]));
    return (input, ast, options2) => {
      if (isHashMap2(input)) {
        return mapBothEager2(decodeUnknownEffect(entries3)(toEntries(input), options2), {
          onSuccess: fromIterable5,
          onFailure: (issue) => makeCompositeAtKey(ast, "entries", issue, input, options2)
        });
      }
      return fail5(new InvalidType(ast, input, options2));
    };
  }, {
    representation: {
      id: "effect/schema/HashMap",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.HashMap(${typeParameters[0].runtime}, ${typeParameters[1].runtime})`,
      Type: `HashMap.HashMap<${typeParameters[0].Type}, ${typeParameters[1].Type}>`,
      importDeclarations: [`import * as HashMap from "effect/HashMap"`]
    }),
    expected: "HashMap",
    toCodec: ([key2, value4]) => link()(ArraySchema(Tuple([key2, value4])), transform2({
      decode: fromIterable5,
      encode: toEntries
    })),
    toArbitrary: ([key2, value4]) => (fc, ctx) => entriesArbitrary(fc, ctx, key2, value4, fromIterable5),
    toEquivalence: ([key2, value4]) => makeCompareMap(key2, value4),
    toFormatter: ([key2, value4]) => (t) => {
      const size6 = size3(t);
      if (size6 === 0) {
        return "HashMap(0) {}";
      }
      const entries3 = toEntries(t).sort().map(([k, v]) => `${key2(k)} => ${value4(v)}`);
      return `HashMap(${size6}) { ${entries3.join(", ")} }`;
    }
  });
  return make19(schema.ast, {
    key,
    value: value3
  });
}
var HashMapReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/HashMap", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = HashMap(typeParameters[0], typeParameters[1]);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
function ReadonlySet(value3) {
  const schema = declareConstructor()([value3], ([value4]) => {
    const array3 = ArraySchema(value4);
    return (input, ast, options2) => {
      if (input instanceof globalThis.Set) {
        return mapBothEager2(decodeUnknownEffect(array3)([...input], options2), {
          onSuccess: (array4) => new globalThis.Set(array4),
          onFailure: (issue) => makeCompositeAtKey(ast, "values", issue, input, options2)
        });
      }
      return fail5(new InvalidType(ast, input, options2));
    };
  }, {
    representation: {
      id: "effect/schema/ReadonlySet",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.ReadonlySet(${typeParameters[0].runtime})`,
      Type: `globalThis.ReadonlySet<${typeParameters[0].Type}>`
    }),
    expected: "ReadonlySet",
    toCodec: ([value4]) => link()(ArraySchema(value4), transform2({
      decode: (e) => new globalThis.Set(e),
      encode: (set2) => [...set2.values()]
    })),
    toArbitrary: ([value4]) => (fc, ctx) => collectionArbitrary(fc, ctx, value4.arbitrary, value4.terminal, (as4) => new globalThis.Set(as4), equals),
    toEquivalence: ([value4]) => makeCompareSet(value4),
    toFormatter: ([value4]) => (t) => {
      const size6 = t.size;
      if (size6 === 0) {
        return "ReadonlySet(0) {}";
      }
      const values2 = globalThis.Array.from(t.values()).sort().map((v) => `${value4(v)}`);
      return `ReadonlySet(${size6}) { ${values2.join(", ")} }`;
    }
  });
  return make19(schema.ast, {
    value: value3
  });
}
var ReadonlySetReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/ReadonlySet", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = ReadonlySet(typeParameters[0]);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
function HashSet(value3) {
  const schema = declareConstructor()([value3], ([value4]) => {
    const values2 = ArraySchema(value4);
    return (input, ast, options2) => {
      if (isHashSet2(input)) {
        return mapBothEager2(decodeUnknownEffect(values2)(fromIterable2(input), options2), {
          onSuccess: fromIterable7,
          onFailure: (issue) => makeCompositeAtKey(ast, "values", issue, input, options2)
        });
      }
      return fail5(new InvalidType(ast, input, options2));
    };
  }, {
    representation: {
      id: "effect/schema/HashSet",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.HashSet(${typeParameters[0].runtime})`,
      Type: `HashSet.HashSet<${typeParameters[0].Type}>`
    }),
    expected: "HashSet",
    toCodec: ([value4]) => link()(ArraySchema(value4), transform2({
      decode: fromIterable7,
      encode: fromIterable2
    })),
    toArbitrary: ([value4]) => (fc, ctx) => collectionArbitrary(fc, ctx, value4.arbitrary, value4.terminal, fromIterable7, equals),
    toEquivalence: ([value4]) => makeCompareSet(value4),
    toFormatter: ([value4]) => (t) => {
      const size6 = size5(t);
      if (size6 === 0) {
        return "HashSet(0) {}";
      }
      const values2 = globalThis.Array.from(t).sort().map((v) => `${value4(v)}`);
      return `HashSet(${size6}) { ${values2.join(", ")} }`;
    }
  });
  return make19(schema.ast, {
    value: value3
  });
}
var HashSetReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/HashSet", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = HashSet(typeParameters[0]);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
function Chunk(value3) {
  const schema = declareConstructor()([value3], ([value4]) => {
    const values2 = ArraySchema(value4);
    return (input, ast, options2) => {
      if (isChunk(input)) {
        return mapBothEager2(decodeUnknownEffect(values2)(fromIterable2(input), options2), {
          onSuccess: fromIterable3,
          onFailure: (issue) => makeCompositeAtKey(ast, "values", issue, input, options2)
        });
      }
      return fail5(new InvalidType(ast, input, options2));
    };
  }, {
    representation: {
      id: "effect/schema/Chunk",
      payload: null
    },
    toCode: ({
      typeParameters
    }) => ({
      runtime: `Schema.Chunk(${typeParameters[0].runtime})`,
      Type: `Chunk.Chunk<${typeParameters[0].Type}>`
    }),
    expected: "Chunk",
    toCodec: ([value4]) => link()(ArraySchema(value4), transform2({
      decode: fromIterable3,
      encode: fromIterable2
    })),
    toArbitrary: ([value4]) => (fc, ctx) => collectionArbitrary(fc, ctx, value4.arbitrary, value4.terminal, fromIterable3),
    toEquivalence: ([value4]) => makeEquivalence3(value4),
    toFormatter: ([value4]) => (t) => {
      const size6 = size(t);
      if (size6 === 0) {
        return "Chunk(0) {}";
      }
      const values2 = globalThis.Array.from(t).sort().map((v) => `${value4(v)}`);
      return `Chunk(${size6}) { ${values2.join(", ")} }`;
    }
  });
  return make19(schema.ast, {
    value: value3
  });
}
var ChunkReviver = /* @__PURE__ */ makeDeclarationReviver("effect/schema/Chunk", Null2, ({
  annotations,
  typeParameters
}) => {
  const schema = Chunk(typeParameters[0]);
  return annotations === void 0 ? schema : schema.annotate(annotations);
});
var RegExp3 = /* @__PURE__ */ instanceOf(globalThis.RegExp, {
  representation: {
    id: "effect/schema/RegExp",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.RegExp`,
    Type: `globalThis.RegExp`
  }),
  expected: "RegExp",
  toCodecJson: () => link()(Struct3({
    source: String5,
    flags: String5
  }), transformOrFail2({
    decode: (e, options2) => try_3({
      try: () => new globalThis.RegExp(e.source, e.flags),
      catch: () => new InvalidValue({
        expected: "valid RegExp source and flags"
      }, e, options2)
    }),
    encode: (regExp) => succeed6({
      source: regExp.source,
      flags: regExp.flags
    })
  })),
  toArbitrary: () => (fc) => fc.tuple(fc.constantFrom(
    ".",
    ".*",
    "\\d+",
    "\\w+",
    "[a-z]+",
    "[A-Z]+",
    "[0-9]+",
    "^[a-zA-Z0-9]+$",
    "^\\d{4}-\\d{2}-\\d{2}$"
    // date pattern
  ), fc.uniqueArray(fc.constantFrom("g", "i", "m", "s", "u", "y"), {
    minLength: 0,
    maxLength: 6
  }).map((flags) => flags.join(""))).map(([source, flags]) => new globalThis.RegExp(source, flags)),
  toEquivalence: () => (a, b) => a.source === b.source && a.flags === b.flags
});
var RegExpReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/RegExp", RegExp3);
var URLString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a URL"
});
var URL2 = /* @__PURE__ */ instanceOf(globalThis.URL, {
  representation: {
    id: "effect/schema/URL",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.URL`,
    Type: `globalThis.URL`
  }),
  expected: "URL",
  toCodecJson: () => link()(URLString, urlFromString),
  toArbitrary: () => (fc) => fc.webUrl().map((s) => new globalThis.URL(s)),
  toEquivalence: () => (a, b) => a.toString() === b.toString()
});
var URLReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/URL", URL2);
var URLFromString = /* @__PURE__ */ URLString.pipe(/* @__PURE__ */ decodeTo2(URL2, urlFromString));
function dateArbitraryConstraints(ordered, base2, toDate3) {
  const out = {
    ...base2
  };
  if (ordered?.minimum !== void 0) {
    const minimum = toDate3 === void 0 ? ordered.minimum : toDate3(ordered.minimum);
    const nextMin = ordered.exclusiveMinimum ? new globalThis.Date(minimum.getTime() + 1) : minimum;
    if (out.min === void 0 || nextMin.getTime() > out.min.getTime()) {
      out.min = nextMin;
    }
  }
  if (ordered?.maximum !== void 0) {
    const maximum = toDate3 === void 0 ? ordered.maximum : toDate3(ordered.maximum);
    const nextMax = ordered.exclusiveMaximum ? new globalThis.Date(maximum.getTime() - 1) : maximum;
    if (out.max === void 0 || nextMax.getTime() < out.max.getTime()) {
      out.max = nextMax;
    }
  }
  return out;
}
var DateString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a Date"
});
var Date4 = /* @__PURE__ */ declare((input) => input instanceof globalThis.Date && !globalThis.Number.isNaN(input.getTime()), {
  representation: {
    id: "effect/schema/Date",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.Date`,
    Type: `globalThis.Date`
  }),
  expected: "a valid Date",
  toCodecJson: () => link()(DateString, dateFromString),
  toArbitrary: () => (fc, ctx) => fc.date(dateArbitraryConstraints(ctx?.constraint?.ordered?.order === Date2 ? ctx.constraint.ordered : void 0, {
    noInvalidDate: true
  }))
});
var DateReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/Date", Date4);
var DateFromString = /* @__PURE__ */ DateString.pipe(/* @__PURE__ */ decodeTo2(Date4, dateFromString));
var DateFromMillis = /* @__PURE__ */ Int.pipe(/* @__PURE__ */ decodeTo2(Date4, dateFromMillis));
var Duration = /* @__PURE__ */ declare(isDuration, {
  representation: {
    id: "effect/schema/Duration",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.Duration`,
    Type: `Duration.Duration`,
    importDeclarations: [`import * as Duration from "effect/Duration"`]
  }),
  expected: "Duration",
  toCodecJson: () => link()(Union2([Struct3({
    _tag: Literal2("Infinity")
  }), Struct3({
    _tag: Literal2("NegativeInfinity")
  }), Struct3({
    _tag: Literal2("Nanos"),
    value: BigInt5
  }), Struct3({
    _tag: Literal2("Millis"),
    value: Int
  })]), transform2({
    decode: (e) => {
      switch (e._tag) {
        case "Infinity":
          return infinity;
        case "NegativeInfinity":
          return negativeInfinity;
        case "Nanos":
          return nanos(e.value);
        case "Millis":
          return millis(e.value);
      }
    },
    encode: (duration) => {
      switch (duration.value._tag) {
        case "Infinity":
          return {
            _tag: "Infinity"
          };
        case "NegativeInfinity":
          return {
            _tag: "NegativeInfinity"
          };
        case "Nanos":
          return {
            _tag: "Nanos",
            value: duration.value.nanos
          };
        case "Millis":
          return {
            _tag: "Millis",
            value: duration.value.millis
          };
      }
    }
  })),
  toArbitrary: () => (fc) => fc.oneof(fc.constant(infinity), fc.constant(negativeInfinity), fc.bigInt().map(nanos), fc.maxSafeInteger().map(millis)),
  toFormatter: () => globalThis.String,
  toEquivalence: () => Equivalence2
});
var DurationReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/Duration", Duration);
var DurationString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a Duration"
});
var DurationFromString = /* @__PURE__ */ DurationString.pipe(/* @__PURE__ */ decodeTo2(Duration, durationFromString));
var DurationFromNanos = /* @__PURE__ */ BigInt5.pipe(/* @__PURE__ */ decodeTo2(Duration, durationFromNanos));
var DurationFromMillis = /* @__PURE__ */ Number6.pipe(/* @__PURE__ */ decodeTo2(Duration, durationFromMillis));
var BigDecimalString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a BigDecimal"
});
var bigDecimalDefaultMaxScale = 20;
var bigDecimalInvalidOrderedConstraintsError = "Unable to derive an arbitrary for the ordered BigDecimal constraints";
function bigDecimalScaleValueAtScale(bd, scale2) {
  return scale(bd, scale2).value;
}
function bigDecimalMinValueAtScale(minimum, scale2, excluded) {
  return excluded ? bigDecimalScaleValueAtScale(floor(minimum, scale2), scale2) + globalThis.BigInt(1) : bigDecimalScaleValueAtScale(ceil(minimum, scale2), scale2);
}
function bigDecimalMaxValueAtScale(maximum, scale2, excluded) {
  return excluded ? bigDecimalScaleValueAtScale(ceil(maximum, scale2), scale2) - globalThis.BigInt(1) : bigDecimalScaleValueAtScale(floor(maximum, scale2), scale2);
}
function bigDecimalMaxScale(ordered) {
  return Math.max(bigDecimalDefaultMaxScale, ordered.minimum?.scale ?? 0, ordered.maximum?.scale ?? 0, ordered.exclusiveMinimum && ordered.minimum !== void 0 ? ordered.minimum.scale + 1 : 0, ordered.exclusiveMaximum && ordered.maximum !== void 0 ? ordered.maximum.scale + 1 : 0);
}
function bigDecimalValueConstraintsAtScale(ordered, scale2) {
  const constraints = {};
  if (ordered.minimum !== void 0) {
    constraints.min = bigDecimalMinValueAtScale(ordered.minimum, scale2, ordered.exclusiveMinimum === true);
  }
  if (ordered.maximum !== void 0) {
    constraints.max = bigDecimalMaxValueAtScale(ordered.maximum, scale2, ordered.exclusiveMaximum === true);
  }
  if (constraints.min !== void 0 && constraints.max !== void 0 && constraints.min > constraints.max) {
    return void 0;
  }
  return constraints;
}
function bigDecimalScaleConstraints(ordered) {
  const max6 = bigDecimalMaxScale(ordered);
  if (bigDecimalValueConstraintsAtScale(ordered, max6) === void 0) {
    throw new globalThis.Error(bigDecimalInvalidOrderedConstraintsError);
  }
  let min6 = 0;
  let high = max6;
  while (min6 < high) {
    const scale2 = min6 + Math.floor((high - min6) / 2);
    if (bigDecimalValueConstraintsAtScale(ordered, scale2) === void 0) {
      min6 = scale2 + 1;
    } else {
      high = scale2;
    }
  }
  return {
    min: min6,
    max: max6
  };
}
var BigDecimal = /* @__PURE__ */ declare(isBigDecimal, {
  representation: {
    id: "effect/schema/BigDecimal",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.BigDecimal`,
    Type: `BigDecimal.BigDecimal`,
    importDeclarations: [`import * as BigDecimal from "effect/BigDecimal"`]
  }),
  expected: "BigDecimal",
  toCodecJson: () => link()(BigDecimalString, bigDecimalFromString),
  toArbitrary: () => (fc, ctx) => {
    const ordered = ctx.constraint?.ordered?.order === Order ? ctx.constraint.ordered : void 0;
    if (ordered === void 0) {
      return fc.tuple(fc.bigInt(), fc.integer({
        min: 0,
        max: bigDecimalDefaultMaxScale
      })).map(([value3, scale2]) => make5(value3, scale2));
    }
    return fc.integer(bigDecimalScaleConstraints(ordered)).chain((scale2) => {
      const constraints = bigDecimalValueConstraintsAtScale(ordered, scale2);
      if (constraints === void 0) {
        throw new globalThis.Error(bigDecimalInvalidOrderedConstraintsError);
      }
      return fc.bigInt(constraints).map((value3) => make5(value3, scale2));
    });
  },
  toFormatter: () => (bd) => format2(bd),
  toEquivalence: () => Equivalence
});
var BigDecimalReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/BigDecimal", BigDecimal);
var BigDecimalFromString = /* @__PURE__ */ BigDecimalString.pipe(/* @__PURE__ */ decodeTo2(BigDecimal, bigDecimalFromString));
var JsonString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as JSON",
  contentMediaType: "application/json"
});
function fromJsonString2(schema, options2) {
  return JsonString.pipe(decodeTo2(schema, fromJsonString(options2)));
}
var UnknownFromJsonString = /* @__PURE__ */ fromJsonString2(Unknown2);
var File = /* @__PURE__ */ instanceOf(globalThis.File, {
  representation: {
    id: "effect/schema/File",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.File`,
    Type: `globalThis.File`
  }),
  expected: "File",
  toCodecJson: () => link()(Struct3({
    data: String5.check(isBase64()),
    type: String5,
    name: String5,
    lastModified: Int
  }), transformOrFail2({
    decode: (e, options2) => match2(decodeBase64(e.data), {
      onFailure: () => fail5(new InvalidValue({
        expected: "a valid Base64 string"
      }, e.data, options2)),
      onSuccess: (bytes) => {
        const buffer = new globalThis.Uint8Array(bytes);
        return succeed6(new globalThis.File([buffer], e.name, {
          type: e.type,
          lastModified: e.lastModified
        }));
      }
    }),
    encode: (file, options2) => tryPromise2({
      try: async () => {
        const bytes = new globalThis.Uint8Array(await file.arrayBuffer());
        return {
          data: encodeBase64(bytes),
          type: file.type,
          name: file.name,
          lastModified: file.lastModified
        };
      },
      catch: () => new InvalidValue({
        expected: "a readable File"
      }, file, options2)
    })
  }))
});
var FileReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/File", File);
var FormData2 = /* @__PURE__ */ instanceOf(globalThis.FormData, {
  representation: {
    id: "effect/schema/FormData",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.FormData`,
    Type: `globalThis.FormData`
  }),
  expected: "FormData",
  toCodecJson: () => link()(ArraySchema(Tuple([String5, Union2([Struct3({
    _tag: tag("String"),
    value: String5
  }), Struct3({
    _tag: tag("File"),
    value: File
  })])])), transformOrFail2({
    decode: (e) => {
      const out = new globalThis.FormData();
      for (const [key, entry] of e) {
        out.append(key, entry.value);
      }
      return succeed6(out);
    },
    encode: (formData) => {
      return succeed6(globalThis.Array.from(formData.entries()).map(([key, value3]) => {
        if (typeof value3 === "string") {
          return [key, {
            _tag: "String",
            value: value3
          }];
        } else {
          return [key, {
            _tag: "File",
            value: value3
          }];
        }
      }));
    }
  }))
});
var FormDataReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/FormData", FormData2);
function fromFormData2(schema) {
  return FormData2.pipe(decodeTo2(schema, fromFormData));
}
var URLSearchParams2 = /* @__PURE__ */ instanceOf(globalThis.URLSearchParams, {
  representation: {
    id: "effect/schema/URLSearchParams",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.URLSearchParams`,
    Type: `globalThis.URLSearchParams`
  }),
  expected: "URLSearchParams",
  toCodecJson: () => link()(String5.annotate({
    expected: "a query string that will be decoded as URLSearchParams"
  }), transform2({
    decode: (e) => new globalThis.URLSearchParams(e),
    encode: (params) => params.toString()
  }))
});
var URLSearchParamsReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/URLSearchParams", URLSearchParams2);
function fromURLSearchParams2(schema) {
  return URLSearchParams2.pipe(decodeTo2(schema, fromURLSearchParams));
}
var NumberFromString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a number"
}).pipe(/* @__PURE__ */ decodeTo2(Number6, numberFromString));
var FiniteFromString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a finite number"
}).pipe(/* @__PURE__ */ decodeTo2(Finite, numberFromString));
var BigIntFromString = /* @__PURE__ */ make19(bigIntString).pipe(/* @__PURE__ */ decodeTo2(BigInt5, bigintFromString));
var Trimmed = /* @__PURE__ */ String5.check(/* @__PURE__ */ isTrimmed());
var Trim = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a trimmed string"
}).pipe(/* @__PURE__ */ decodeTo2(Trimmed, /* @__PURE__ */ trim3()));
var StringFromBase64 = /* @__PURE__ */ String5.annotate({
  expected: "a base64 encoded string that will be decoded as a UTF-8 string"
}).pipe(/* @__PURE__ */ decodeTo2(String5, stringFromBase64String));
var StringFromBase64Url = /* @__PURE__ */ String5.annotate({
  expected: "a base64 (URL) encoded string that will be decoded as a UTF-8 string"
}).pipe(/* @__PURE__ */ decodeTo2(String5, stringFromBase64UrlString));
var StringFromHex = /* @__PURE__ */ String5.annotate({
  expected: "a hex encoded string that will be decoded as a UTF-8 string"
}).pipe(/* @__PURE__ */ decodeTo2(String5, stringFromHexString));
var StringFromUriComponent = /* @__PURE__ */ String5.annotate({
  expected: "a URI component encoded string that will be decoded as a UTF-8 string"
}).pipe(/* @__PURE__ */ decodeTo2(String5, stringFromUriComponent));
var PropertyKey = /* @__PURE__ */ Union2([Finite, Symbol3, String5]);
var StandardSchemaV1FailureResult = /* @__PURE__ */ Struct3({
  issues: /* @__PURE__ */ ArraySchema(/* @__PURE__ */ Struct3({
    message: String5,
    path: /* @__PURE__ */ optional2(/* @__PURE__ */ ArraySchema(/* @__PURE__ */ Union2([PropertyKey, /* @__PURE__ */ Struct3({
      key: PropertyKey
    })])))
  }))
});
var BooleanFromBit = /* @__PURE__ */ Literals([0, 1]).pipe(/* @__PURE__ */ decodeTo2(Boolean5, /* @__PURE__ */ transform2({
  decode: (bit) => bit === 1,
  encode: (bool) => bool ? 1 : 0
})));
var Base64String = /* @__PURE__ */ String5.annotate({
  expected: "a base64 encoded string that will be decoded as Uint8Array",
  format: "byte",
  contentEncoding: "base64"
});
var Uint8Array2 = /* @__PURE__ */ instanceOf(globalThis.Uint8Array, {
  representation: {
    id: "effect/schema/Uint8Array",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.Uint8Array`,
    Type: `globalThis.Uint8Array`
  }),
  expected: "Uint8Array",
  toCodecJson: () => link()(Base64String, uint8ArrayFromBase64String),
  toArbitrary: () => (fc) => fc.uint8Array()
});
var Uint8ArrayReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/Uint8Array", Uint8Array2);
var Uint8ArrayFromBase64 = /* @__PURE__ */ Base64String.pipe(/* @__PURE__ */ decodeTo2(Uint8Array2, uint8ArrayFromBase64String));
var Uint8ArrayFromBase64Url = /* @__PURE__ */ String5.annotate({
  expected: "a base64 (URL) encoded string that will be decoded as a Uint8Array"
}).pipe(/* @__PURE__ */ decodeTo2(Uint8Array2, {
  decode: /* @__PURE__ */ decodeBase64Url2(),
  encode: /* @__PURE__ */ encodeBase64Url2()
}));
var Uint8ArrayFromHex = /* @__PURE__ */ String5.annotate({
  expected: "a hex encoded string that will be decoded as a Uint8Array"
}).pipe(/* @__PURE__ */ decodeTo2(Uint8Array2, {
  decode: /* @__PURE__ */ decodeHex2(),
  encode: /* @__PURE__ */ encodeHex2()
}));
var DateTimeUtc = /* @__PURE__ */ declare((u) => isDateTime2(u) && isUtc2(u), {
  representation: {
    id: "effect/schema/DateTimeUtc",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.DateTimeUtc`,
    Type: `DateTime.Utc`,
    importDeclarations: [`import * as DateTime from "effect/DateTime"`]
  }),
  expected: "DateTime.Utc",
  toCodecJson: () => link()(String5, dateTimeUtcFromString),
  toArbitrary: () => (fc, ctx) => fc.date(dateArbitraryConstraints(ctx?.constraint?.ordered?.order === Order3 ? ctx.constraint.ordered : void 0, {
    noInvalidDate: true
  }, toDateUtc2)).map((date) => fromDateUnsafe2(date)),
  toFormatter: () => (utc) => utc.toString(),
  toEquivalence: () => Equivalence4
});
var DateTimeUtcReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/DateTimeUtc", DateTimeUtc);
var DateTimeUtcFromDate = /* @__PURE__ */ Date4.pipe(/* @__PURE__ */ decodeTo2(DateTimeUtc, {
  decode: /* @__PURE__ */ dateTimeUtcFromInput(),
  encode: /* @__PURE__ */ transform(toDateUtc2)
}));
var DateTimeUtcFromString = /* @__PURE__ */ String5.annotate({
  expected: "a string that will be decoded as a DateTime.Utc"
}).pipe(/* @__PURE__ */ decodeTo2(DateTimeUtc, dateTimeUtcFromString));
var DateTimeUtcFromMillis = /* @__PURE__ */ Int.pipe(/* @__PURE__ */ decodeTo2(DateTimeUtc, {
  decode: /* @__PURE__ */ dateTimeUtcFromInput(),
  encode: /* @__PURE__ */ transform(toEpochMillis2)
}));
var TimeZoneOffset = /* @__PURE__ */ declare(isTimeZoneOffset2, {
  representation: {
    id: "effect/schema/TimeZoneOffset",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.TimeZoneOffset`,
    Type: `DateTime.TimeZone.Offset`,
    importDeclarations: [`import * as DateTime from "effect/DateTime"`]
  }),
  expected: "DateTime.TimeZone.Offset",
  toCodecJson: () => link()(Int, timeZoneOffsetFromNumber),
  toArbitrary: () => (fc) => fc.integer({
    min: -12 * 60 * 60 * 1e3,
    max: 14 * 60 * 60 * 1e3
  }).map((n) => zoneMakeOffset2(n)),
  toFormatter: () => (tz) => zoneToString2(tz),
  toEquivalence: () => (a, b) => a.offset === b.offset
});
var TimeZoneOffsetReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/TimeZoneOffset", TimeZoneOffset);
var TimeZoneNamedString = /* @__PURE__ */ String5.annotate({
  expected: "an IANA time zone identifier"
});
var TimeZoneNamed = /* @__PURE__ */ declare(isTimeZoneNamed2, {
  representation: {
    id: "effect/schema/TimeZoneNamed",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.TimeZoneNamed`,
    Type: `DateTime.TimeZone.Named`,
    importDeclarations: [`import * as DateTime from "effect/DateTime"`]
  }),
  expected: "DateTime.TimeZone.Named",
  toCodecJson: () => link()(TimeZoneNamedString, timeZoneNamedFromString),
  toArbitrary: () => (fc) => fc.constantFrom(...["UTC", "Europe/London", "America/New_York", "Asia/Tokyo", "Australia/Sydney"].map(zoneMakeNamedUnsafe2)),
  toFormatter: () => (tz) => zoneToString2(tz),
  toEquivalence: () => (a, b) => a.id === b.id
});
var TimeZoneNamedReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/TimeZoneNamed", TimeZoneNamed);
var TimeZoneNamedFromString = /* @__PURE__ */ TimeZoneNamedString.pipe(/* @__PURE__ */ decodeTo2(TimeZoneNamed, timeZoneNamedFromString));
var TimeZoneString = /* @__PURE__ */ String5.annotate({
  expected: "a time zone string (IANA identifier or offset like +03:00)"
});
var TimeZone = /* @__PURE__ */ declare(isTimeZone2, {
  representation: {
    id: "effect/schema/TimeZone",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.TimeZone`,
    Type: `DateTime.TimeZone`,
    importDeclarations: [`import * as DateTime from "effect/DateTime"`]
  }),
  expected: "DateTime.TimeZone",
  toCodecJson: () => link()(TimeZoneString, timeZoneFromString),
  toArbitrary: () => (fc) => fc.oneof(fc.integer({
    min: -12 * 60 * 60 * 1e3,
    max: 14 * 60 * 60 * 1e3
  }).map((n) => zoneMakeOffset2(n)), fc.constantFrom(...["UTC", "Europe/London", "America/New_York", "Asia/Tokyo", "Australia/Sydney"].map(zoneMakeNamedUnsafe2))),
  toFormatter: () => (tz) => zoneToString2(tz),
  toEquivalence: () => (a, b) => zoneToString2(a) === zoneToString2(b)
});
var TimeZoneReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/TimeZone", TimeZone);
var TimeZoneFromString = /* @__PURE__ */ TimeZoneString.pipe(/* @__PURE__ */ decodeTo2(TimeZone, timeZoneFromString));
var DateTimeZonedString = /* @__PURE__ */ String5.annotate({
  expected: "a zoned DateTime string (e.g. 2024-01-01T00:00:00.000+00:00[Europe/London])"
});
var DateTimeZoned = /* @__PURE__ */ declare((u) => isDateTime2(u) && isZoned2(u), {
  representation: {
    id: "effect/schema/DateTimeZoned",
    payload: null
  },
  toCode: () => ({
    runtime: `Schema.DateTimeZoned`,
    Type: `DateTime.Zoned`,
    importDeclarations: [`import * as DateTime from "effect/DateTime"`]
  }),
  expected: "DateTime.Zoned",
  toCodecJson: () => link()(DateTimeZonedString, dateTimeZonedFromString),
  toArbitrary: () => (fc, ctx) => fc.tuple(fc.date(dateArbitraryConstraints(ctx?.constraint?.ordered?.order === Order3 ? ctx.constraint.ordered : void 0, {
    max: new globalThis.Date(864e13 - 14 * 60 * 60 * 1e3),
    min: new globalThis.Date(-864e13 + 14 * 60 * 60 * 1e3),
    noInvalidDate: true
  }, toDateUtc2)), fc.constantFrom("UTC", "Europe/London", "America/New_York", "Asia/Tokyo", "Australia/Sydney")).map(([date, zone]) => makeZonedUnsafe2(date, {
    timeZone: zone
  })),
  toFormatter: () => (zoned) => formatIsoZoned2(zoned),
  toEquivalence: () => Equivalence4
});
var DateTimeZonedReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/DateTimeZoned", DateTimeZoned);
var DateTimeZonedFromString = /* @__PURE__ */ DateTimeZonedString.pipe(/* @__PURE__ */ decodeTo2(DateTimeZoned, dateTimeZonedFromString));
var immerable = /* @__PURE__ */ globalThis.Symbol.for("immer-draftable");
var payloadToken = {};
function makeClass(Inherited, identifier2, struct2, annotations, proto) {
  const getClassSchema = getClassSchemaFactory(struct2, identifier2, annotations);
  const ClassTypeId = getClassTypeId(identifier2);
  const out = class extends Inherited {
    constructor(...[input, options2]) {
      const internalOptions = options2;
      const payload = internalOptions?.["~payload"];
      const value3 = payload?.token === payloadToken ? payload.value : struct2.make(input ?? {}, options2);
      super(value3, {
        ...options2,
        disableChecks: true,
        "~payload": {
          token: payloadToken,
          value: value3
        }
      });
    }
    static [TypeId22] = TypeId22;
    get [ClassTypeId]() {
      return ClassTypeId;
    }
    static [immerable] = true;
    static identifier = identifier2;
    static fields = struct2.fields;
    static get ast() {
      return getClassSchema(this).ast;
    }
    static pipe() {
      return pipeArguments(this, arguments);
    }
    static rebuild(ast) {
      return getClassSchema(this).rebuild(ast);
    }
    static make(input, options2) {
      return new this(input, options2);
    }
    static makeOption(input, options2) {
      return makeOption(getClassSchema(this))(input ?? {}, options2);
    }
    static makeEffect(input, options2) {
      return getClassSchema(this).makeEffect(input ?? {}, options2);
    }
    static annotate(annotations2) {
      return this.rebuild(annotate(this.ast, annotations2));
    }
    static annotateKey(annotations2) {
      return this.rebuild(annotateKey(this.ast, annotations2));
    }
    static check(...checks) {
      return this.rebuild(appendChecks(this.ast, checks));
    }
    static extend(identifier3) {
      return (schema, annotations2) => {
        const extension = isStruct(schema) ? schema : Struct3(schema);
        const fields = {
          ...struct2.fields,
          ...extension.fields
        };
        const ast = struct(fields, struct2.ast.checks, {
          identifier: identifier3
        });
        return makeClass(this, identifier3, makeStruct(appendChecks(ast, extension.ast.checks), fields), annotations2, proto);
      };
    }
    static mapFields(f, options2) {
      return struct2.mapFields(f, options2);
    }
  };
  if (proto !== void 0) {
    Object.assign(out.prototype, proto(identifier2));
  }
  return out;
}
function getClassTransformation(self) {
  return new Transformation(transform((input) => new self(input, {
    "~payload": {
      token: payloadToken,
      value: input
    }
  })), passthrough2());
}
function getClassTypeId(identifier2) {
  return `~effect/Schema/Class/${identifier2}`;
}
function getClassSchemaFactory(from, identifier2, annotations) {
  let memo;
  return (self) => {
    if (memo !== void 0) {
      return memo;
    }
    const ClassTypeId = getClassTypeId(identifier2);
    const isClassValue = (input) => input instanceof self || hasProperty(input, ClassTypeId);
    const transformation = getClassTransformation(self);
    const to = make19(new Declaration([from.ast], () => (input, ast, options2) => {
      return isClassValue(input) ? succeed6(input) : fail5(new InvalidType(ast, input, options2));
    }, {
      identifier: identifier2,
      [CONSTRUCTOR_ANNOTATION_KEY]: ([from2]) => ({
        isConstructed: isClassValue,
        link: new Link(from2, transformation)
      }),
      toCodec: ([from2]) => new Link(from2.ast, transformation),
      toArbitrary: ([from2]) => () => ({
        arbitrary: from2.arbitrary.map((args2) => new self(args2)),
        terminal: from2.terminal?.map((args2) => new self(args2))
      }),
      toFormatter: ([from2]) => (t) => `${self.identifier}(${from2(t)})`,
      [SENTINELS_ANNOTATION_KEY]: collectSentinels(from.ast),
      ...annotations
    }));
    return memo = decodeTo2(to, transformation)(from);
  };
}
function isStruct(schema) {
  return isSchema(schema);
}
var Class4 = (identifier2) => (schema, annotations) => {
  const struct2 = isStruct(schema) ? schema : Struct3(schema);
  return makeClass(Class3, identifier2, struct2, annotations, (identifier3) => ({
    toString() {
      return `${identifier3}(${format({
        ...this
      })})`;
    }
  }));
};
var TaggedClass = (identifier2) => {
  return (tagValue, schema, annotations) => {
    const struct2 = isStruct(schema) ? schema.mapFields((fields) => ({
      _tag: tag(tagValue),
      ...fields
    }), {
      unsafePreserveChecks: true
    }) : TaggedStruct(tagValue, schema);
    return Class4(identifier2 ?? tagValue)(struct2, annotations);
  };
};
var Error3 = (identifier2) => (schema, annotations) => {
  const struct2 = isStruct(schema) ? schema : Struct3(schema);
  const self = makeClass(Error2, identifier2, struct2, annotations, (identifier3) => ({
    name: identifier3
  }));
  return self;
};
var TaggedError3 = (identifier2) => {
  return (tagValue, schema, annotations) => {
    const struct2 = isStruct(schema) ? schema.mapFields((fields) => ({
      _tag: tag(tagValue),
      ...fields
    }), {
      unsafePreserveChecks: true
    }) : TaggedStruct(tagValue, schema);
    return Error3(identifier2 ?? tagValue)(struct2, annotations);
  };
};
function toArbitrary(schema) {
  const lawc = memoized(schema.ast);
  return (fc) => lawc(fc, {});
}
function overrideToFormatter(toFormatter2) {
  return (self) => {
    return self.annotate({
      toFormatter: toFormatter2
    });
  };
}
function toFormatter(schema, options2) {
  return recur3(schema.ast);
  function recur3(ast) {
    const annotation = resolve(ast)?.["toFormatter"];
    if (typeof annotation === "function") {
      return annotation(isDeclaration(ast) ? ast.typeParameters.map(recur3) : []);
    }
    if (options2?.onBefore) {
      const onBefore = options2.onBefore(ast, recur3);
      if (onBefore !== void 0) {
        return onBefore;
      }
    }
    return on(ast);
  }
  function on(ast) {
    switch (ast._tag) {
      default:
        return format;
      case "Never":
        return () => "never";
      case "Void":
        return () => "void";
      case "Arrays": {
        const elements = ast.elements.map(recur3);
        const rest = ast.rest.map(recur3);
        return (t) => {
          const out = [];
          let i = 0;
          for (; i < elements.length; i++) {
            if (t.length < i + 1) {
              if (isOptional(ast.elements[i])) {
                continue;
              }
            } else {
              out.push(elements[i](t[i]));
            }
          }
          if (rest.length > 0) {
            const [head3, ...tail] = rest;
            for (; i < t.length - tail.length; i++) {
              out.push(head3(t[i]));
            }
            for (let j = 0; j < tail.length; j++) {
              out.push(tail[j](t[i + j]));
            }
          }
          return "[" + out.join(", ") + "]";
        };
      }
      case "Objects": {
        const propertySignatures = ast.propertySignatures.map((ps) => recur3(ps.type));
        const indexSignatures = ast.indexSignatures.map((is3) => recur3(is3.type));
        if (ast.propertySignatures.length === 0 && ast.indexSignatures.length === 0) {
          return format;
        }
        return (t) => {
          const out = [];
          const visited = /* @__PURE__ */ new Set();
          for (let i = 0; i < propertySignatures.length; i++) {
            const ps = ast.propertySignatures[i];
            const name = ps.name;
            visited.add(name);
            if (isOptional(ps.type) && !Object.hasOwn(t, name)) {
              continue;
            }
            out.push(`${formatPropertyKey(name)}: ${propertySignatures[i](t[name])}`);
          }
          for (let i = 0; i < indexSignatures.length; i++) {
            const keys4 = getIndexSignatureKeys(t, ast.indexSignatures[i].parameter);
            for (const key of keys4) {
              if (visited.has(key)) {
                continue;
              }
              visited.add(key);
              out.push(`${formatPropertyKey(key)}: ${indexSignatures[i](t[key])}`);
            }
          }
          return out.length > 0 ? "{ " + out.join(", ") + " }" : "{}";
        };
      }
      case "Union": {
        const types = toType(ast).types;
        const getCandidates2 = (t) => getCandidates(t, types);
        const compiled = new Map(types.map((candidate, i) => [candidate, [_is(candidate), recur3(ast.types[i])]]));
        return (t) => {
          const candidates = getCandidates2(t);
          for (let i = 0; i < candidates.length; i++) {
            const [is3, formatter] = compiled.get(candidates[i]);
            if (is3(t)) {
              return formatter(t);
            }
          }
          return format(t);
        };
      }
      case "Suspend": {
        const get5 = memoizeThunk(() => recur3(ast.thunk()));
        return (t) => get5()(t);
      }
    }
  }
}
function overrideToEquivalence(toEquivalence3) {
  return (self) => self.annotate({
    toEquivalence: toEquivalence3
  });
}
function toEquivalence2(schema) {
  return toEquivalence(schema.ast);
}
function toRepresentation2(schema, options2) {
  return toRepresentation(schema.ast, options2);
}
function toJsonSchemaDocument2(schema, options2) {
  const document = toRepresentation(toCodecJsonAST(schema.ast), options2);
  return toJsonSchemaDocument(document, options2);
}
function toCodecJson(schema) {
  return make19(toCodecJsonAST(schema.ast), {
    schema
  });
}
var toCodecJsonAST = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  const out = toCodecJsonASTStep(ast, toCodecJsonAST);
  const context3 = ast.context;
  if (out === ast || context3 === void 0) return out;
  return replaceContextLastLink(out, withoutConstructorDefault(context3));
});
function withoutConstructorDefault(context3) {
  return context3.constructorDefault === void 0 ? context3 : new Context(context3.isOptional, context3.isMutable, void 0, context3.annotations);
}
function validateCanonicalObjectPropertyNames(ast) {
  if (ast.propertySignatures.some((ps) => typeof ps.name !== "string")) {
    throw new globalThis.Error("Objects property names must be strings", {
      cause: ast
    });
  }
}
function makeReorder(getPriority) {
  return (types) => {
    const indexMap = /* @__PURE__ */ new Map();
    for (let i = 0; i < types.length; i++) {
      indexMap.set(toEncoded(types[i]), i);
    }
    const sortedTypes = [...types].sort((a, b) => {
      a = toEncoded(a);
      b = toEncoded(b);
      const pa = getPriority(a);
      const pb = getPriority(b);
      if (pa !== pb) return pa - pb;
      return indexMap.get(a) - indexMap.get(b);
    });
    const orderChanged = sortedTypes.some((ast, index2) => ast !== types[index2]);
    if (!orderChanged) return types;
    return sortedTypes;
  };
}
var toCodecJsonReorder = /* @__PURE__ */ makeReorder((ast) => {
  switch (ast._tag) {
    case "BigInt":
    case "Symbol":
    case "UniqueSymbol":
      return 0;
    default:
      return 1;
  }
});
function toCodecJsonASTStep(ast, recur3) {
  switch (ast._tag) {
    case "Declaration": {
      const getLink = ast.annotations?.toCodecJson ?? ast.annotations?.toCodec;
      if (!isFunction(getLink)) {
        return replaceEncoding(ast, [unknownToJson]);
      }
      const typeParameters = ast.typeParameters.map((tp) => make16(toEncoded(tp)));
      const link2 = getLink(typeParameters);
      return link2 === void 0 ? ast : replaceEncoding(ast, [mapLink(link2, recur3)]);
    }
    case "Unknown":
      return replaceEncoding(ast, [unknownToJson]);
    case "ObjectKeyword":
      return replaceEncoding(ast, [objectKeywordToJson]);
    case "Undefined":
    case "Void":
    case "Literal":
    case "Number":
      return ast.toCodecJson();
    case "UniqueSymbol":
    case "Symbol":
    case "BigInt":
      return ast.toCodecStringTree();
    case "Objects": {
      validateCanonicalObjectPropertyNames(ast);
      return ast.recur(recur3, parameterFromString);
    }
    case "Union": {
      const sortedTypes = toCodecJsonReorder(ast.types);
      if (sortedTypes !== ast.types) {
        return new Union(sortedTypes, ast.mode, ast.annotations, ast.checks, ast.encoding, ast.context, ast.encodingChecks).recur(recur3);
      }
      return ast.recur(recur3);
    }
    case "Arrays":
    case "Suspend":
      return ast.recur(recur3);
  }
  return ast;
}
function toCodecIso(schema) {
  return make19(toCodecIsoAST(toType(schema.ast)));
}
var toCodecIsoAST = /* @__PURE__ */ memoize((ast) => {
  const out = toCodecIsoASTStep(ast, toCodecIsoAST);
  return out !== ast && ast.context !== void 0 ? replaceContextLastLink(out, withoutConstructorDefault(ast.context)) : out;
});
function toCodecIsoASTStep(ast, recur3) {
  switch (ast._tag) {
    case "Declaration": {
      const getLink = ast.annotations?.toCodecIso ?? ast.annotations?.toCodec;
      if (isFunction(getLink)) {
        const link2 = getLink(ast.typeParameters.map((tp) => make16(tp)));
        return replaceEncoding(ast, [mapLink(link2, recur3)]);
      }
      return ast;
    }
    case "Arrays":
    case "Objects":
    case "Union":
    case "Suspend":
      return ast.recur(recur3);
  }
  return ast;
}
function toCodecStringTree(schema) {
  return make19(toCodecStringTreeAST(schema.ast), {
    schema
  });
}
function toCodecArrayFromSingle(schema) {
  return make19(toCodecArrayFromSingleAST(schema.ast));
}
function toEncoderXml(codec, options2) {
  const rootName = resolveIdentifier(codec.ast) ?? resolveTitle(codec.ast);
  const serialize = encodeEffect(toCodecStringTree(codec));
  return (t) => serialize(t).pipe(map7((stringTree) => stringTreeToXml(stringTree, {
    rootName,
    ...options2
  })));
}
function stringTreeToXml(value3, options2) {
  const rootName = options2.rootName ?? "root";
  const arrayItemName = options2.arrayItemName ?? "item";
  const pretty2 = options2.pretty ?? true;
  const indent = options2.indent ?? "  ";
  const sortKeys = options2.sortKeys ?? true;
  const seen = /* @__PURE__ */ new Set();
  const lines = [];
  recur3(rootName, value3, 0);
  return lines.join(pretty2 ? "\n" : "");
  function push(depth, text) {
    lines.push(pretty2 ? indent.repeat(depth) + text : text);
  }
  function recur3(tagName, node, depth, originalNameForMeta) {
    const {
      attrs,
      safe
    } = xml.tagInfo(tagName, originalNameForMeta);
    if (node === void 0) {
      push(depth, `<${safe}${attrs}/>`);
    } else if (typeof node === "string") {
      push(depth, `<${safe}${attrs}>${xml.escapeText(node)}</${safe}>`);
    } else if (typeof node !== "object" || node === null) {
      push(depth, `<${safe}${attrs}>${xml.escapeText(format(node))}</${safe}>`);
    } else {
      if (seen.has(node)) throw new globalThis.Error("Cycle detected while serializing to XML.", {
        cause: node
      });
      seen.add(node);
      try {
        if (globalThis.globalThis.Array.isArray(node)) {
          if (node.length === 0) {
            push(depth, `<${safe}${attrs}/>`);
            return;
          }
          push(depth, `<${safe}${attrs}>`);
          for (const item of node) recur3(arrayItemName, item, depth + 1);
          push(depth, `</${safe}>`);
          return;
        }
        const obj = node;
        const keys4 = Object.keys(obj);
        if (sortKeys) keys4.sort();
        if (keys4.length === 0) {
          push(depth, `<${safe}${attrs}/>`);
          return;
        }
        push(depth, `<${safe}${attrs}>`);
        for (const k of keys4) {
          recur3(xml.parseTagName(k).safe, obj[k], depth + 1, k);
        }
        push(depth, `</${safe}>`);
      } finally {
        seen.delete(node);
      }
    }
  }
}
var xml = {
  escapeText(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },
  escapeAttribute(s) {
    return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },
  parseTagName(name) {
    const original = name;
    let safe = name;
    if (!/^[A-Za-z_]/.test(safe)) safe = "_" + safe;
    safe = safe.replace(/[^A-Za-z0-9._-]/g, "_");
    if (/^xml/i.test(safe)) safe = "_" + safe;
    return {
      safe,
      changed: safe !== original
    };
  },
  tagInfo(name, original) {
    const {
      changed,
      safe
    } = xml.parseTagName(name);
    const needsMeta = changed || original && original !== name;
    const attrs = needsMeta ? ` data-name="${xml.escapeAttribute(original ?? name)}"` : "";
    return {
      safe,
      attrs
    };
  }
};
var toStringTreeReorder = /* @__PURE__ */ makeReorder((ast) => {
  switch (ast._tag) {
    case "Null":
    case "Boolean":
    case "Number":
    case "BigInt":
    case "Symbol":
    case "UniqueSymbol":
      return 0;
    default:
      return 1;
  }
});
function toCodecStringTreeASTStep(ast, recur3, onMissingAnnotation) {
  switch (ast._tag) {
    case "Declaration": {
      const typeParameters = ast.typeParameters.map((tp) => make19(recur3(toEncoded(tp))));
      const getStringTreeLink = ast.annotations?.toCodecStringTree;
      if (isFunction(getStringTreeLink)) {
        const link3 = getStringTreeLink(typeParameters);
        if (link3 === void 0) return ast;
        return replaceEncoding(ast, [mapLink(link3, recur3)]);
      }
      const getJsonLink = ast.annotations?.toCodecJson;
      const jsonLink = isFunction(getJsonLink) ? getJsonLink(typeParameters) : void 0;
      const getLink = jsonLink === void 0 ? ast.annotations?.toCodec : void 0;
      const link2 = jsonLink ?? (isFunction(getLink) ? getLink(typeParameters) : void 0);
      return link2 === void 0 ? onMissingAnnotation(ast) : replaceEncoding(ast, [mapLink(link2, recur3)]);
    }
    case "Null":
      return replaceEncoding(ast, [nullToString]);
    case "Boolean":
      return replaceEncoding(ast, [booleanToString]);
    case "Unknown":
    case "ObjectKeyword":
      return replaceEncoding(ast, [unknownToStringTree]);
    case "Enum":
    case "Number":
    case "Literal":
    case "UniqueSymbol":
    case "Symbol":
    case "BigInt":
      return ast.toCodecStringTree();
    case "Objects": {
      validateCanonicalObjectPropertyNames(ast);
      return ast.recur(recur3, parameterFromString);
    }
    case "Union": {
      const sortedTypes = toStringTreeReorder(ast.types);
      if (sortedTypes !== ast.types) {
        return new Union(sortedTypes, ast.mode, ast.annotations, ast.checks, ast.encoding, ast.context, ast.encodingChecks).recur(recur3);
      }
      return ast.recur(recur3);
    }
    case "Arrays":
    case "Suspend":
      return ast.recur(recur3);
  }
  return ast;
}
var nullToString = /* @__PURE__ */ new Link(/* @__PURE__ */ new Literal("null"), /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform(() => null), /* @__PURE__ */ transform(() => "null")));
var booleanToString = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union([/* @__PURE__ */ new Literal("true"), /* @__PURE__ */ new Literal("false")], "anyOf"), /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform((s) => s === "true"), /* @__PURE__ */ String3()));
var arrayFromSingleTransformation = /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform((input) => typeof input === "string" ? [input] : input), /* @__PURE__ */ passthrough2());
var isCodecArrayFromSingleLink = (link2) => link2.transformation === arrayFromSingleTransformation;
var toCodecStringTreeAST = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  const out = toCodecStringTreeASTStep(ast, toCodecStringTreeAST, (ast2) => {
    throw new globalThis.Error("Missing structural codec for StringTree", {
      cause: ast2
    });
  });
  if (out !== ast && ast.context !== void 0) {
    return replaceContextLastLink(out, withoutConstructorDefault(ast.context));
  }
  return out;
}, {
  stopAt: isCodecArrayFromSingleLink
});
var toArrayFromSingleInputElement = (ast) => isOptional(ast) ? optionalKey(unknown) : unknown;
var toCodecArrayFromSingleAST = /* @__PURE__ */ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
  const out = toCodecArrayFromSingleASTStep(ast);
  if (isArrays(out)) {
    const ensure2 = decodeTo(new Union([new Arrays(out.isMutable, out.elements.map(toArrayFromSingleInputElement), out.rest.map(toArrayFromSingleInputElement)), string2], "anyOf"), out, arrayFromSingleTransformation);
    return isOptional(ast) ? optionalKey(ensure2) : ensure2;
  }
  return out;
}, {
  stopAt: isCodecArrayFromSingleLink
});
function toCodecArrayFromSingleASTStep(ast) {
  return ast._tag === "Declaration" || ast._tag === "Arrays" || ast._tag === "Objects" || ast._tag === "Union" || ast._tag === "Suspend" ? ast.recur(toCodecArrayFromSingleAST) : ast;
}
var isGreaterThanDateReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGreaterThanDate", /* @__PURE__ */ Struct3({
  exclusiveMinimum: Date4
}), ({
  annotations,
  payload
}) => isGreaterThanDate(payload.exclusiveMinimum, annotations));
var isGreaterThanOrEqualToDateReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGreaterThanOrEqualToDate", /* @__PURE__ */ Struct3({
  minimum: Date4
}), ({
  annotations,
  payload
}) => isGreaterThanOrEqualToDate(payload.minimum, annotations));
var isLessThanDateReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLessThanDate", /* @__PURE__ */ Struct3({
  exclusiveMaximum: Date4
}), ({
  annotations,
  payload
}) => isLessThanDate(payload.exclusiveMaximum, annotations));
var isLessThanOrEqualToDateReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLessThanOrEqualToDate", /* @__PURE__ */ Struct3({
  maximum: Date4
}), ({
  annotations,
  payload
}) => isLessThanOrEqualToDate(payload.maximum, annotations));
var isBetweenDateReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isBetweenDate", /* @__PURE__ */ Struct3({
  minimum: Date4,
  maximum: Date4,
  exclusiveMinimum: /* @__PURE__ */ optional2(/* @__PURE__ */ Literal2(true)),
  exclusiveMaximum: /* @__PURE__ */ optional2(/* @__PURE__ */ Literal2(true))
}), ({
  annotations,
  payload
}) => isBetweenDate(payload, annotations));
var isGreaterThanBigIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGreaterThanBigInt", /* @__PURE__ */ Struct3({
  exclusiveMinimum: BigInt5
}), ({
  annotations,
  payload
}) => isGreaterThanBigInt(payload.exclusiveMinimum, annotations));
var isGreaterThanOrEqualToBigIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isGreaterThanOrEqualToBigInt", /* @__PURE__ */ Struct3({
  minimum: BigInt5
}), ({
  annotations,
  payload
}) => isGreaterThanOrEqualToBigInt(payload.minimum, annotations));
var isLessThanBigIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLessThanBigInt", /* @__PURE__ */ Struct3({
  exclusiveMaximum: BigInt5
}), ({
  annotations,
  payload
}) => isLessThanBigInt(payload.exclusiveMaximum, annotations));
var isLessThanOrEqualToBigIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isLessThanOrEqualToBigInt", /* @__PURE__ */ Struct3({
  maximum: BigInt5
}), ({
  annotations,
  payload
}) => isLessThanOrEqualToBigInt(payload.maximum, annotations));
var isBetweenBigIntReviver = /* @__PURE__ */ makeFilterReviver("effect/schema/isBetweenBigInt", /* @__PURE__ */ Struct3({
  minimum: BigInt5,
  maximum: BigInt5,
  exclusiveMinimum: /* @__PURE__ */ optional2(/* @__PURE__ */ Literal2(true)),
  exclusiveMaximum: /* @__PURE__ */ optional2(/* @__PURE__ */ Literal2(true))
}), ({
  annotations,
  payload
}) => isBetweenBigInt(payload, annotations));
function toIso(schema) {
  const serializer = toCodecIso(schema);
  return makeIso(encodeSync(serializer), decodeSync(serializer));
}
function toIsoSource(_) {
  return id();
}
function toIsoFocus(_) {
  return id();
}
function overrideToCodecIso(to, transformation) {
  return (schema) => {
    return make19(annotate(schema.ast, {
      toCodecIso: () => new Link(to.ast, make11(transformation))
    }), {
      schema
    });
  };
}
function toDifferJsonPatch(schema) {
  const serializer = toCodecJson(schema);
  const get5 = encodeSync(serializer);
  const set2 = decodeSync(serializer);
  return {
    empty: [],
    diff: (oldValue, newValue) => get4(get5(oldValue), get5(newValue)),
    combine: (first, second) => [...first, ...second],
    patch: (oldValue, patch) => {
      const value3 = get5(oldValue);
      const patched = apply(patch, value3);
      return Object.is(patched, value3) ? oldValue : set2(patched);
    }
  };
}
function Tree(node) {
  const Tree$ref = suspend3(() => Tree2);
  const Tree2 = Union2([node, ArraySchema(Tree$ref), Record2(String5, Tree$ref)]);
  return Tree2;
}
var Json2 = /* @__PURE__ */ make19(/* @__PURE__ */ annotate(Json, {
  toCode: () => ({
    runtime: "Schema.Json",
    Type: "Schema.Json"
  })
}));
var JsonObject = /* @__PURE__ */ Record2(String5, Json2);
var JsonReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/Json", Json2);
var JsonError = /* @__PURE__ */ Struct3({
  message: String5,
  name: /* @__PURE__ */ optionalKey2(String5),
  stack: /* @__PURE__ */ optionalKey2(String5),
  cause: /* @__PURE__ */ optionalKey2(Json2)
});
var MutableJson2 = /* @__PURE__ */ make19(/* @__PURE__ */ annotate(MutableJson, {
  toCode: () => ({
    runtime: "Schema.MutableJson",
    Type: "Schema.MutableJson"
  })
}));
var MutableJsonReviver = /* @__PURE__ */ makeFixedDeclarationReviver("effect/schema/MutableJson", MutableJson2);
function resolveAnnotations(schema) {
  return resolve(schema.ast);
}
function resolveAnnotationsKey(schema) {
  return schema.ast.context?.annotations;
}

// node_modules/@opencode/schema/dist/event.js
var event_exports = {};
__export(event_exports, {
  Event: () => event_exports,
  ID: () => ID,
  Seq: () => Seq,
  Version: () => Version,
  durable: () => durable,
  durableMap: () => durableMap,
  ephemeral: () => ephemeral,
  inventory: () => inventory,
  latest: () => latest,
  versionedType: () => versionedType
});

// node_modules/@opencode/schema/dist/schema.js
var PositiveInt = Schema_exports.Int.check(Schema_exports.isGreaterThan(0));
var NonNegativeInt = Schema_exports.Int.check(Schema_exports.isGreaterThanOrEqualTo(0));
var RelativePath = Schema_exports.String.pipe(Schema_exports.brand("RelativePath"));
var AbsolutePath = Schema_exports.String.pipe(Schema_exports.brand("AbsolutePath"));
var optional3 = (schema) => Schema_exports.optionalKey(schema).pipe(Schema_exports.decodeTo(Schema_exports.optional(Schema_exports.toType(schema)), {
  decode: SchemaGetter_exports.passthrough({ strict: false }),
  encode: SchemaGetter_exports.transformOptional(Option_exports.filter((value3) => value3 !== void 0))
}));
var statics = (methods) => (schema) => Object.assign(schema, methods(schema));
var DateTimeUtcFromMillis2 = Schema_exports.Finite.pipe(Schema_exports.decodeTo(Schema_exports.DateTimeUtc, {
  decode: SchemaGetter_exports.transform((value3) => DateTime_exports.makeUnsafe(value3)),
  encode: SchemaGetter_exports.transform((value3) => DateTime_exports.toEpochMillis(value3))
}));

// node_modules/@opencode/schema/dist/identifier.js
var length = 26;
var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
var lastTimestamp = 0;
var counter = 0;
function ascending() {
  return create(false);
}
function descending() {
  return create(true);
}
function create(descending2, timestamp = Date.now()) {
  if (timestamp !== lastTimestamp) {
    lastTimestamp = timestamp;
    counter = 0;
  }
  counter++;
  const current = BigInt(timestamp) * 0x1000n + BigInt(counter);
  const value3 = descending2 ? ~current : current;
  const time = Array.from({ length: 6 }, (_, index2) => Number(value3 >> BigInt(40 - 8 * index2) & 0xffn).toString(16).padStart(2, "0")).join("");
  const bytes = crypto.getRandomValues(new Uint8Array(length - 12));
  return time + Array.from(bytes, (byte) => chars[byte % 62]).join("");
}

// node_modules/@opencode/schema/dist/location.js
var location_exports = {};
__export(location_exports, {
  Info: () => Info,
  Location: () => location_exports,
  PublicInfo: () => PublicInfo,
  PublicRef: () => PublicRef,
  Ref: () => Ref,
  response: () => response
});

// node_modules/@opencode/schema/dist/project-id.js
var ProjectID = Schema_exports.String.pipe(Schema_exports.brand("Project.ID"), statics((schema) => ({ global: schema.make("global") })));

// node_modules/@opencode/schema/dist/workspace-id.js
var WorkspaceID = Schema_exports.String.check(Schema_exports.isStartsWith("wrk")).pipe(Schema_exports.brand("Workspace.ID"), statics((schema) => {
  const create2 = () => schema.make("wrk_" + ascending());
  return {
    ascending: (id2) => {
      if (!id2)
        return create2();
      if (!id2.startsWith("wrk"))
        throw new Error(`ID ${id2} does not start with wrk`);
      return schema.make(id2);
    },
    create: create2
  };
}));

// node_modules/@opencode/schema/dist/location.js
var Ref = Schema_exports.Struct({
  directory: AbsolutePath,
  workspaceID: optional3(WorkspaceID)
}).annotate({ identifier: "Location.Ref" });
var PublicRef = Schema_exports.Struct(Struct_exports.omit(Ref.fields, ["workspaceID"])).annotate({
  identifier: "Location.PublicRef"
});
var Info = class extends Schema_exports.Class("Location.Info")({
  directory: AbsolutePath,
  workspaceID: optional3(WorkspaceID),
  project: Schema_exports.Struct({
    id: ProjectID,
    directory: AbsolutePath,
    canonical: AbsolutePath
  })
}) {
};
var PublicInfo = Schema_exports.Struct(Struct_exports.omit(Info.fields, ["workspaceID"])).annotate({
  identifier: "Location.PublicInfo"
});
function response(data) {
  return Schema_exports.Struct({ location: PublicRef, data });
}

// node_modules/@opencode/schema/dist/event.js
var ID = Schema_exports.String.check(Schema_exports.isStartsWith("evt_")).pipe(Schema_exports.brand("Event.ID"), statics((schema) => ({ create: () => schema.make("evt_" + ascending()) })));
var Seq = Schema_exports.Int.check(Schema_exports.isGreaterThanOrEqualTo(0)).pipe(Schema_exports.brand("Event.Seq"));
var Version = Schema_exports.Int.check(Schema_exports.isGreaterThanOrEqualTo(1)).pipe(Schema_exports.brand("Event.Version"));
var DurableEnvelope = Schema_exports.Struct({ aggregateID: Schema_exports.String, seq: Seq, version: Version });
function durable(input) {
  const data = Schema_exports.Struct(input.schema);
  const durable2 = Schema_exports.Struct({
    aggregateID: DurableEnvelope.fields.aggregateID,
    seq: DurableEnvelope.fields.seq,
    version: Schema_exports.Literal(input.durable.version).pipe(Schema_exports.decodeTo(Schema_exports.toType(Version), SchemaTransformation_exports.transform({
      decode: () => Version.make(input.durable.version),
      encode: () => input.durable.version
    })))
  });
  return Schema_exports.Struct({
    id: ID,
    created: Schema_exports.Finite,
    metadata: optional3(Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown)),
    type: Schema_exports.Literal(input.type),
    durable: durable2,
    location: optional3(location_exports.Ref),
    data
  }).annotate({ identifier: input.identifier ?? input.type }).pipe(statics(() => ({
    type: input.type,
    durability: "durable",
    durable: input.durable,
    data
  })));
}
function ephemeral(input) {
  const data = Schema_exports.Struct(input.schema);
  return Schema_exports.Struct({
    id: ID,
    created: Schema_exports.Finite,
    metadata: optional3(Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown)),
    type: Schema_exports.Literal(input.type),
    location: optional3(location_exports.Ref),
    data
  }).annotate({ identifier: input.identifier ?? input.type }).pipe(statics(() => ({
    type: input.type,
    durability: "ephemeral",
    durable: void 0,
    data
  })));
}
function inventory(...definitions) {
  return Object.freeze(definitions);
}
function latest(definitions) {
  return readonlyMap(definitions.reduce((result3, definition) => {
    const existing = result3.get(definition.type);
    if (!existing) {
      result3.set(definition.type, definition);
      return result3;
    }
    if (definition.durable && existing.durable && definition.durable.version !== existing.durable.version) {
      if (definition.durable.version > existing.durable.version)
        result3.set(definition.type, definition);
      return result3;
    }
    if (definition !== existing)
      throw new Error(`Duplicate latest event definition for ${definition.type}`);
    return result3;
  }, /* @__PURE__ */ new Map()));
}
function versionedType(type, version) {
  return `${type}.${version}`;
}
function durableMap(definitions) {
  return readonlyMap(definitions.reduce((result3, definition) => {
    if (definition.durability !== "durable")
      return result3;
    const key = versionedType(definition.type, definition.durable.version);
    if (result3.has(key))
      throw new Error(`Duplicate durable event definition for ${key}`);
    result3.set(key, definition);
    return result3;
  }, /* @__PURE__ */ new Map()));
}
function readonlyMap(map11) {
  const result3 = Object.freeze({
    get size() {
      return map11.size;
    },
    entries: () => map11.entries(),
    forEach: (callback3, thisArg) => map11.forEach((value3, key) => callback3.call(thisArg, value3, key, result3)),
    get: (key) => map11.get(key),
    has: (key) => map11.has(key),
    keys: () => map11.keys(),
    values: () => map11.values(),
    [Symbol.iterator]: () => map11[Symbol.iterator]()
  });
  return result3;
}

// node_modules/@opencode/schema/dist/model.js
var model_exports = {};
__export(model_exports, {
  Capabilities: () => Capabilities,
  Compatibility: () => Compatibility,
  Cost: () => Cost,
  Event: () => Event5,
  Family: () => Family,
  ID: () => ID6,
  Info: () => Info6,
  MaxTokensField: () => MaxTokensField,
  Model: () => model_exports,
  Overlays: () => Overlays2,
  ReasoningField: () => ReasoningField,
  Ref: () => Ref3,
  Settings: () => Settings2,
  Variant: () => Variant,
  VariantID: () => VariantID
});

// node_modules/@opencode/schema/dist/provider.js
var provider_exports = {};
__export(provider_exports, {
  Activation: () => Activation,
  Compaction: () => Compaction,
  Event: () => Event4,
  ID: () => ID5,
  Info: () => Info5,
  Overlays: () => Overlays,
  Package: () => Package,
  Provider: () => provider_exports,
  Request: () => Request,
  Settings: () => Settings,
  Transport: () => Transport
});

// node_modules/@opencode/schema/dist/integration.js
var integration_exports = {};
__export(integration_exports, {
  Attempt: () => Attempt,
  AttemptID: () => AttemptID,
  AttemptStatus: () => AttemptStatus,
  CommandAttempt: () => CommandAttempt,
  CommandAttemptStatus: () => CommandAttemptStatus,
  CommandMethod: () => CommandMethod,
  EnvMethod: () => EnvMethod,
  Event: () => Event3,
  ExternalMethod: () => ExternalMethod,
  ID: () => ID4,
  Info: () => Info4,
  Integration: () => integration_exports,
  KeyMethod: () => KeyMethod,
  Method: () => Method,
  MethodID: () => MethodID,
  OAuthMethod: () => OAuthMethod,
  Ref: () => Ref2
});

// node_modules/@opencode/schema/dist/connection.js
var connection_exports = {};
__export(connection_exports, {
  Connection: () => connection_exports,
  CredentialInfo: () => CredentialInfo,
  EnvInfo: () => EnvInfo,
  Info: () => Info3,
  Status: () => Status
});

// node_modules/@opencode/schema/dist/credential.js
var credential_exports = {};
__export(credential_exports, {
  CreateInput: () => CreateInput,
  Credential: () => credential_exports,
  Entry: () => Entry,
  Event: () => Event2,
  External: () => External,
  ID: () => ID3,
  Key: () => Key,
  OAuth: () => OAuth,
  Value: () => Value2
});

// node_modules/@opencode/schema/dist/integration-id.js
var IntegrationID = Schema_exports.String.pipe(Schema_exports.brand("Integration.ID"));
var IntegrationMethodID = Schema_exports.String.pipe(Schema_exports.brand("Integration.MethodID"));

// node_modules/@opencode/schema/dist/form.js
var form_exports = {};
__export(form_exports, {
  Answer: () => Answer,
  BooleanField: () => BooleanField,
  Detail: () => Detail,
  Event: () => Event,
  ExternalField: () => ExternalField,
  Field: () => Field,
  Fields: () => Fields,
  Form: () => form_exports,
  ID: () => ID2,
  Info: () => Info2,
  IntegerField: () => IntegerField,
  Metadata: () => Metadata,
  MultiselectField: () => MultiselectField,
  NumberField: () => NumberField,
  Option: () => Option2,
  Reply: () => Reply,
  State: () => State,
  StringField: () => StringField,
  Value: () => Value,
  When: () => When
});
var IDSchema = Schema_exports.String.check(Schema_exports.isStartsWith("frm_")).pipe(Schema_exports.brand("Form.ID"));
var ID2 = IDSchema.pipe(statics((schema) => ({ create: (id2) => schema.make(id2 ?? "frm_" + ascending()) })));
var Metadata = Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown).annotate({ identifier: "Form.Metadata" });
var Option2 = Schema_exports.Struct({
  value: Schema_exports.String,
  label: Schema_exports.String,
  description: Schema_exports.String.pipe(optional3)
}).annotate({ identifier: "Form.Option" });
var When = Schema_exports.Struct({
  key: Schema_exports.String,
  op: Schema_exports.Literals(["eq", "neq"]),
  value: Schema_exports.Union([Schema_exports.String, Schema_exports.Number, Schema_exports.Boolean])
}).annotate({ identifier: "Form.When" });
var FieldBase = {
  key: Schema_exports.String,
  title: Schema_exports.String.pipe(optional3),
  description: Schema_exports.String.pipe(optional3),
  required: Schema_exports.Boolean.pipe(optional3),
  hidden: Schema_exports.Boolean.pipe(optional3).annotate({
    description: "Skip the interactive authentication prompt and use the default unless an answer is supplied"
  }),
  when: Schema_exports.Array(When).pipe(optional3)
};
var StringField = Schema_exports.Struct({
  ...FieldBase,
  type: Schema_exports.Literal("string"),
  format: Schema_exports.Literals(["email", "uri", "date", "date-time"]).pipe(optional3),
  minLength: NonNegativeInt.pipe(optional3),
  maxLength: NonNegativeInt.pipe(optional3),
  pattern: Schema_exports.String.pipe(optional3),
  placeholder: Schema_exports.String.pipe(optional3),
  default: Schema_exports.String.pipe(optional3),
  options: Schema_exports.Array(Option2).pipe(optional3),
  custom: Schema_exports.Boolean.pipe(optional3)
}).annotate({ identifier: "Form.StringField" });
var NumberField = Schema_exports.Struct({
  ...FieldBase,
  type: Schema_exports.Literal("number"),
  minimum: Schema_exports.Number.pipe(optional3),
  maximum: Schema_exports.Number.pipe(optional3),
  default: Schema_exports.Number.pipe(optional3)
}).annotate({ identifier: "Form.NumberField" });
var IntegerField = Schema_exports.Struct({
  ...FieldBase,
  type: Schema_exports.Literal("integer"),
  minimum: Schema_exports.Number.pipe(optional3),
  maximum: Schema_exports.Number.pipe(optional3),
  default: Schema_exports.Number.pipe(optional3)
}).annotate({ identifier: "Form.IntegerField" });
var BooleanField = Schema_exports.Struct({
  ...FieldBase,
  type: Schema_exports.Literal("boolean"),
  default: Schema_exports.Boolean.pipe(optional3)
}).annotate({ identifier: "Form.BooleanField" });
var MultiselectField = Schema_exports.Struct({
  ...FieldBase,
  type: Schema_exports.Literal("multiselect"),
  options: Schema_exports.Array(Option2),
  minItems: NonNegativeInt.pipe(optional3),
  maxItems: NonNegativeInt.pipe(optional3),
  custom: Schema_exports.Boolean.pipe(optional3),
  default: Schema_exports.Array(Schema_exports.String).pipe(optional3)
}).annotate({ identifier: "Form.MultiselectField" });
var ExternalField = Schema_exports.Struct({
  key: Schema_exports.String,
  type: Schema_exports.Literal("external"),
  url: Schema_exports.String,
  title: Schema_exports.String.pipe(optional3),
  description: Schema_exports.String.pipe(optional3)
}).annotate({ identifier: "Form.ExternalField" });
var Field = Schema_exports.Union([
  StringField,
  NumberField,
  IntegerField,
  BooleanField,
  MultiselectField,
  ExternalField
]).pipe(Schema_exports.toTaggedUnion("type"), Schema_exports.annotate({ identifier: "Form.Field" }));
var Fields = Schema_exports.NonEmptyArray(Field).annotate({ identifier: "Form.Fields" });
var InfoBase = {
  id: ID2,
  // This should be typed as SessionID. It is a plain string only because MCP elicitation
  // temporarily needs the `"global"` sentinel owner, which is not a real session. Once
  // elicitations can be attributed to real sessions, revert this to SessionID. Do not rely
  // on non-session owners anywhere else.
  sessionID: Schema_exports.String,
  title: Schema_exports.String,
  metadata: Metadata.pipe(optional3)
};
var Info2 = Schema_exports.Struct({
  ...InfoBase,
  fields: Fields
}).annotate({ identifier: "Form.Info" });
var Value = Schema_exports.Union([Schema_exports.String, Schema_exports.Number, Schema_exports.Boolean, Schema_exports.Array(Schema_exports.String)]).annotate({
  identifier: "Form.Value"
});
var Answer = Schema_exports.Record(Schema_exports.String, Value).annotate({ identifier: "Form.Answer" });
var State = Schema_exports.Union([
  Schema_exports.Struct({ status: Schema_exports.Literal("pending") }),
  Schema_exports.Struct({ status: Schema_exports.Literal("answered"), answer: Answer }),
  // A message tells the asker why nobody answered, e.g. a non-interactive client.
  Schema_exports.Struct({ status: Schema_exports.Literal("cancelled"), message: Schema_exports.String.pipe(optional3) })
]).pipe(Schema_exports.toTaggedUnion("status")).annotate({ identifier: "Form.State" });
var Detail = Schema_exports.Struct({
  ...Info2.fields,
  state: State
}).annotate({ identifier: "Form.Detail" });
var Reply = Schema_exports.Struct({
  answer: Answer
}).annotate({ identifier: "Form.Reply" });
var Created = ephemeral({ type: "form.created", schema: { form: Info2 } });
var Replied = ephemeral({ type: "form.replied", schema: { id: ID2, sessionID: Schema_exports.String, answer: Answer } });
var Cancelled = ephemeral({ type: "form.cancelled", schema: { id: ID2, sessionID: Schema_exports.String } });
var Event = { Created, Replied, Cancelled, Definitions: inventory(Created, Replied, Cancelled) };

// node_modules/@opencode/schema/dist/credential.js
var ID3 = Schema_exports.String.pipe(Schema_exports.brand("Credential.ID"), statics((schema) => ({ create: () => schema.make("cred_" + ascending()) })));
var Updated = ephemeral({
  type: "credential.updated",
  schema: {}
});
var Switched = ephemeral({
  type: "credential.switched",
  schema: { integrationID: IntegrationID, credentialID: Schema_exports.NullOr(ID3) }
});
var Event2 = {
  Updated,
  Switched,
  Definitions: inventory(Updated, Switched)
};
var OAuth = Schema_exports.Struct({
  type: Schema_exports.Literal("oauth"),
  methodID: IntegrationMethodID,
  refresh: Schema_exports.String,
  access: Schema_exports.String,
  expires: NonNegativeInt,
  metadata: optional3(Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown))
}).annotate({ identifier: "Credential.OAuth" });
var Key = Schema_exports.Struct({
  type: Schema_exports.Literal("key"),
  key: Schema_exports.String,
  metadata: optional3(Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown)),
  configuration: optional3(form_exports.Answer)
}).annotate({ identifier: "Credential.Key" });
var External = Schema_exports.Struct({
  type: Schema_exports.Literal("external"),
  methodID: IntegrationMethodID,
  metadata: optional3(Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown))
}).annotate({ identifier: "Credential.External" });
var Value2 = Schema_exports.Union([OAuth, Key, External]).pipe(Schema_exports.toTaggedUnion("type")).annotate({ identifier: "Credential.Value" });
var Entry = Schema_exports.Struct({
  id: ID3,
  integrationID: IntegrationID,
  label: Schema_exports.String,
  active: Schema_exports.Boolean,
  value: Value2
}).annotate({ identifier: "Credential.Entry" });
var CreateInput = Schema_exports.Struct({
  id: optional3(ID3),
  integrationID: IntegrationID,
  label: optional3(Schema_exports.String),
  value: Value2,
  activate: optional3(Schema_exports.Boolean)
}).annotate({ identifier: "Credential.CreateInput" });

// node_modules/@opencode/schema/dist/connection.js
var Status = Schema_exports.Struct({
  status: Schema_exports.Literals(["needs_auth"]),
  message: Schema_exports.String,
  url: optional3(Schema_exports.String)
}).annotate({ identifier: "Connection.Status" });
var CredentialInfo = Schema_exports.Struct({
  type: Schema_exports.Literal("credential"),
  id: credential_exports.ID,
  label: Schema_exports.String,
  /** Whether the connection stores a key, an OAuth grant, or an external credential-source reference. */
  method: Schema_exports.Literals(["key", "oauth", "external"]),
  status: optional3(Status)
}).annotate({ identifier: "Connection.CredentialInfo" });
var EnvInfo = Schema_exports.Struct({
  type: Schema_exports.Literal("env"),
  name: Schema_exports.String,
  status: optional3(Status)
}).annotate({ identifier: "Connection.EnvInfo" });
var Info3 = Schema_exports.Union([CredentialInfo, EnvInfo]).pipe(Schema_exports.toTaggedUnion("type")).annotate({ identifier: "Connection.Info" });

// node_modules/@opencode/schema/dist/integration.js
var ID4 = IntegrationID;
var MethodID = IntegrationMethodID;
var OAuthMethod = Schema_exports.Struct({
  id: MethodID,
  type: Schema_exports.Literal("oauth"),
  label: Schema_exports.String,
  form: optional3(form_exports.Fields)
}).annotate({ identifier: "Integration.OAuthMethod" });
var CommandMethod = Schema_exports.Struct({
  id: MethodID,
  type: Schema_exports.Literal("command"),
  label: Schema_exports.String,
  command: Schema_exports.Array(Schema_exports.String)
}).annotate({ identifier: "Integration.CommandMethod" });
var KeyMethod = Schema_exports.Struct({
  type: Schema_exports.Literal("key"),
  label: optional3(Schema_exports.String),
  form: optional3(form_exports.Fields)
}).annotate({ identifier: "Integration.KeyMethod" });
var ExternalMethod = Schema_exports.Struct({
  id: MethodID,
  type: Schema_exports.Literal("external"),
  label: Schema_exports.String,
  form: optional3(form_exports.Fields)
}).annotate({ identifier: "Integration.ExternalMethod" });
var EnvMethod = Schema_exports.Struct({
  type: Schema_exports.Literal("env"),
  names: Schema_exports.Array(Schema_exports.String)
}).annotate({ identifier: "Integration.EnvMethod" });
var Method = Schema_exports.Union([OAuthMethod, CommandMethod, KeyMethod, ExternalMethod, EnvMethod]).pipe(Schema_exports.toTaggedUnion("type")).annotate({ identifier: "Integration.Method" });
var Updated2 = ephemeral({
  type: "integration.updated",
  schema: {}
});
var Event3 = { Updated: Updated2, Definitions: inventory(Updated2) };
var Ref2 = Schema_exports.Struct({
  id: ID4,
  name: Schema_exports.String,
  metadata: optional3(Schema_exports.Record(Schema_exports.String, Schema_exports.Any))
}).annotate({ identifier: "Integration.Ref" });
var Info4 = Schema_exports.Struct({
  id: ID4,
  name: Schema_exports.String,
  metadata: optional3(Schema_exports.Record(Schema_exports.String, Schema_exports.Any)),
  methods: Schema_exports.Array(Method),
  connections: Schema_exports.Array(connection_exports.Info)
}).annotate({ identifier: "Integration.Info" });
var AttemptID = Schema_exports.String.pipe(Schema_exports.brand("Integration.AttemptID"), statics((schema) => ({ create: () => schema.make("con_" + ascending()) })));
var AttemptTime = Schema_exports.Struct({
  created: Schema_exports.Number,
  expires: Schema_exports.Number
});
var Attempt = class extends Schema_exports.Class("Integration.Attempt")({
  attemptID: AttemptID,
  url: Schema_exports.String,
  instructions: Schema_exports.String,
  mode: Schema_exports.Literals(["auto", "code"]),
  time: AttemptTime
}) {
};
var AttemptStatus = Schema_exports.Union([
  Schema_exports.Struct({ status: Schema_exports.Literal("pending"), time: AttemptTime }),
  Schema_exports.Struct({ status: Schema_exports.Literal("complete"), time: AttemptTime }),
  Schema_exports.Struct({ status: Schema_exports.Literal("failed"), message: Schema_exports.String, time: AttemptTime }),
  Schema_exports.Struct({ status: Schema_exports.Literal("expired"), time: AttemptTime })
]).pipe(Schema_exports.toTaggedUnion("status")).annotate({ identifier: "Integration.AttemptStatus" });
var CommandAttempt = Schema_exports.Struct({
  attemptID: AttemptID,
  time: AttemptTime
}).annotate({ identifier: "Integration.CommandAttempt" });
var CommandAttemptStatus = Schema_exports.Union([
  Schema_exports.Struct({ status: Schema_exports.Literal("pending"), message: optional3(Schema_exports.String), time: AttemptTime }),
  Schema_exports.Struct({ status: Schema_exports.Literal("complete"), time: AttemptTime }),
  Schema_exports.Struct({ status: Schema_exports.Literal("failed"), message: Schema_exports.String, time: AttemptTime }),
  Schema_exports.Struct({ status: Schema_exports.Literal("expired"), time: AttemptTime })
]).pipe(Schema_exports.toTaggedUnion("status")).annotate({ identifier: "Integration.CommandAttemptStatus" });

// node_modules/@opencode/schema/dist/provider.js
var ID5 = Schema_exports.String.pipe(Schema_exports.brand("Provider.ID"), statics((schema) => ({
  opencode: schema.make("opencode"),
  anthropic: schema.make("anthropic"),
  openai: schema.make("openai"),
  google: schema.make("google"),
  googleVertex: schema.make("google-vertex"),
  githubCopilot: schema.make("github-copilot"),
  amazonBedrock: schema.make("amazon-bedrock"),
  azure: schema.make("azure"),
  openrouter: schema.make("openrouter"),
  mistral: schema.make("mistral"),
  gitlab: schema.make("gitlab")
})));
var Updated3 = ephemeral({ type: "provider.updated", schema: {} });
var Event4 = { Updated: Updated3, Definitions: inventory(Updated3) };
var Package = Schema_exports.String;
var Activation = Schema_exports.Literals(["auto", "enabled", "disabled"]);
var Compaction = Schema_exports.Union([
  Schema_exports.Struct({ type: Schema_exports.Literal("summary") }),
  Schema_exports.Struct({ type: Schema_exports.Literal("native") })
]).pipe(Schema_exports.toTaggedUnion("type")).annotate({ identifier: "Provider.Compaction" });
var Transport = Schema_exports.Literals(["http", "websocket"]).annotate({ identifier: "Provider.Transport" });
var Settings = Schema_exports.StructWithRest(Schema_exports.Struct({
  timeout: Schema_exports.Union([Schema_exports.Finite, Schema_exports.Literal(false)]).pipe(optional3),
  headerTimeout: Schema_exports.Union([Schema_exports.Finite, Schema_exports.Literal(false)]).pipe(optional3),
  chunkTimeout: Schema_exports.Union([Schema_exports.Finite, Schema_exports.Literal(false)]).pipe(optional3),
  compaction: Compaction.pipe(optional3),
  transport: Transport.pipe(optional3)
}), [Schema_exports.Record(Schema_exports.String, Schema_exports.Any)]).annotate({ identifier: "Provider.Settings" });
var Overlays = {
  settings: Settings.pipe(optional3),
  headers: Schema_exports.Record(Schema_exports.String, Schema_exports.String).pipe(optional3),
  body: Schema_exports.Record(Schema_exports.String, Schema_exports.Any).pipe(optional3)
};
var Request = Schema_exports.Struct({
  settings: Settings.pipe(Schema_exports.withConstructorDefault(Effect_exports.succeed({}))),
  headers: Schema_exports.Record(Schema_exports.String, Schema_exports.String),
  body: Schema_exports.Record(Schema_exports.String, Schema_exports.Any)
}).annotate({ identifier: "Provider.Request" });
var Info5 = Schema_exports.Struct({
  id: ID5,
  canonical: ID5.pipe(optional3),
  integrationID: integration_exports.ID.pipe(optional3),
  name: Schema_exports.String,
  activation: Activation,
  package: Package,
  ...Overlays
}).annotate({ identifier: "Provider.Info" }).pipe(statics(() => ({
  empty: (id2) => ({ id: id2, name: id2, activation: "auto", package: "" })
})));

// node_modules/@opencode/schema/dist/money.js
var money_exports = {};
__export(money_exports, {
  Money: () => money_exports,
  USD: () => USD,
  USDPerMillionTokens: () => USDPerMillionTokens
});
var USD = Schema_exports.Finite.pipe(Schema_exports.brand("Money.USD"), Schema_exports.annotate({ identifier: "Money.USD" }), statics((schema) => ({ zero: schema.make(0) })));
var USDPerMillionTokens = Schema_exports.Finite.pipe(Schema_exports.brand("Money.USDPerMillionTokens"), Schema_exports.annotate({ identifier: "Money.USDPerMillionTokens" }), statics((schema) => ({ zero: schema.make(0) })));

// node_modules/@opencode/schema/dist/model.js
var ID6 = Schema_exports.String.pipe(Schema_exports.brand("Model.ID"));
var Updated4 = ephemeral({ type: "model.updated", schema: {} });
var Event5 = { Updated: Updated4, Definitions: inventory(Updated4) };
var VariantID = Schema_exports.String.pipe(Schema_exports.brand("Model.VariantID"));
var Ref3 = Schema_exports.Struct({
  id: ID6,
  providerID: provider_exports.ID,
  variant: VariantID.pipe(optional3)
}).annotate({ identifier: "Model.Ref" }).pipe(statics((schema) => ({
  parse: (input) => {
    const providerEnd = input.indexOf("/");
    if (providerEnd <= 0)
      throw new Error(`Invalid model reference: ${input}`);
    const providerID = input.slice(0, providerEnd);
    const variantStart = input.indexOf("#", providerEnd + 1);
    const id2 = input.slice(providerEnd + 1, variantStart === -1 ? void 0 : variantStart);
    const variant = variantStart === -1 ? void 0 : input.slice(variantStart + 1);
    if (!id2 || providerID.includes("#") || variant !== void 0 && (!variant || variant.includes("#")))
      throw new Error(`Invalid model reference: ${input}`);
    return schema.make({
      providerID: provider_exports.ID.make(providerID),
      id: ID6.make(id2),
      ...variant ? { variant: VariantID.make(variant) } : {}
    });
  }
})));
var Family = Schema_exports.String.pipe(Schema_exports.brand("Model.Family"));
var ReasoningField = Schema_exports.Union([
  Schema_exports.Literals(["reasoning", "reasoning_content", "reasoning_text"]),
  Schema_exports.String
]).annotate({ identifier: "Model.ReasoningField" });
var MaxTokensField = Schema_exports.Literals(["max_completion_tokens", "max_tokens"]).annotate({
  identifier: "Model.MaxTokensField"
});
var Settings2 = Schema_exports.StructWithRest(
  Schema_exports.Struct({
    compaction: provider_exports.Compaction.pipe(optional3)
  }),
  // Provider packages may define arbitrary model-level options beyond OpenCode's shared compaction policy.
  [Schema_exports.Record(Schema_exports.String, Schema_exports.Any)]
).annotate({ identifier: "Model.Settings" });
var Overlays2 = {
  settings: Settings2.pipe(optional3),
  headers: Schema_exports.Record(Schema_exports.String, Schema_exports.String).pipe(optional3),
  body: Schema_exports.Record(Schema_exports.String, Schema_exports.Any).pipe(optional3)
};
var Compatibility = Schema_exports.Struct({
  reasoningField: ReasoningField.pipe(optional3),
  /** Require every assistant message to include its reasoning field, even when empty. */
  requireReasoning: Schema_exports.Boolean.pipe(optional3),
  maxTokensField: MaxTokensField.pipe(optional3),
  requireFinishReason: Schema_exports.Boolean.pipe(optional3),
  requireAssistantAfterTool: Schema_exports.Boolean.pipe(optional3),
  supportsPromptCacheKey: Schema_exports.Boolean.pipe(optional3),
  /** Supports Anthropic's thinking-prefix mismatch controls. Overrides model-ID detection. */
  supportsThinkingBlockBinding: Schema_exports.Boolean.pipe(optional3),
  /** Supports per-message effort updates. Overrides model-ID detection. */
  supportsEffortUpdates: Schema_exports.Boolean.pipe(optional3)
}).annotate({ identifier: "Model.Compatibility" });
var Capabilities = Schema_exports.Struct({
  tools: Schema_exports.Boolean,
  input: Schema_exports.Array(Schema_exports.String),
  output: Schema_exports.Array(Schema_exports.String)
}).annotate({ identifier: "Model.Capabilities" }).pipe(statics(() => ({
  default: () => ({ tools: true, input: ["text", "image"], output: ["text"] })
})));
var Cost = Schema_exports.Struct({
  tier: Schema_exports.Struct({
    type: Schema_exports.tag("context"),
    size: Schema_exports.Int
  }).pipe(optional3),
  input: money_exports.USDPerMillionTokens,
  output: money_exports.USDPerMillionTokens,
  cache: Schema_exports.Struct({
    read: money_exports.USDPerMillionTokens,
    write: money_exports.USDPerMillionTokens
  })
}).annotate({ identifier: "Model.Cost" });
var Variant = Schema_exports.Struct({
  id: VariantID,
  ...Overlays2
}).annotate({ identifier: "Model.Variant" });
var Info6 = Schema_exports.Struct({
  id: ID6,
  modelID: ID6,
  providerID: provider_exports.ID,
  canonical: provider_exports.ID.pipe(optional3),
  family: Family.pipe(optional3),
  name: Schema_exports.String,
  compatibility: Compatibility.pipe(optional3),
  package: provider_exports.Package.pipe(optional3),
  ...Overlays2,
  capabilities: Capabilities,
  variants: Schema_exports.Array(Variant),
  time: Schema_exports.Struct({
    released: Schema_exports.Finite
  }),
  cost: Schema_exports.Array(Cost),
  status: Schema_exports.Literals(["alpha", "beta", "deprecated", "active"]),
  enabled: Schema_exports.Boolean,
  limit: Schema_exports.Struct({
    context: Schema_exports.Int,
    input: Schema_exports.Int.pipe(optional3),
    output: Schema_exports.Int
  })
}).annotate({ identifier: "Model.Info" }).pipe(statics(() => ({
  default: (providerID, id2) => ({
    id: id2,
    modelID: id2,
    providerID,
    name: id2,
    capabilities: Capabilities.default(),
    variants: [],
    time: { released: 0 },
    cost: [],
    status: "active",
    enabled: true,
    limit: { context: 2e5, output: 32e3 }
  })
})));

// node_modules/@opencode/schema/dist/permission.js
var permission_exports = {};
__export(permission_exports, {
  Effect: () => Effect,
  Event: () => Event6,
  ID: () => ID7,
  Permission: () => permission_exports,
  Reply: () => Reply2,
  Request: () => Request2,
  Rule: () => Rule,
  Ruleset: () => Ruleset,
  Source: () => Source
});

// node_modules/@opencode/schema/dist/session-id.js
var SessionID = Schema_exports.String.check(Schema_exports.isStartsWith("ses")).pipe(Schema_exports.brand("SessionID"), statics((schema) => {
  const create2 = () => schema.make("ses_" + descending());
  return {
    create: create2,
    descending: (id2) => id2 === void 0 ? create2() : schema.make(id2)
  };
}));

// node_modules/@opencode/schema/dist/permission.js
var ID7 = Schema_exports.String.check(Schema_exports.isStartsWith("per")).pipe(Schema_exports.brand("Permission.ID"), statics((schema) => ({ create: (id2) => schema.make(id2 ?? "per_" + ascending()) })));
var Source = Schema_exports.Union([
  Schema_exports.Struct({
    type: Schema_exports.Literal("tool"),
    messageID: Schema_exports.String,
    id: Schema_exports.String
  })
]).annotate({ identifier: "Permission.Source" });
var RequestFields = {
  sessionID: SessionID,
  action: Schema_exports.String,
  resources: Schema_exports.Array(Schema_exports.String),
  save: Schema_exports.Array(Schema_exports.String).pipe(optional3),
  metadata: Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown).pipe(optional3),
  source: Source.pipe(optional3),
  message: Schema_exports.String.pipe(optional3)
};
var Request2 = Schema_exports.Struct({
  id: ID7,
  ...RequestFields
}).annotate({ identifier: "Permission.Request" });
var Reply2 = Schema_exports.Literals(["once", "always", "reject"]).annotate({ identifier: "Permission.Reply" });
var Asked = ephemeral({ type: "permission.asked", schema: Request2.fields });
var Replied2 = ephemeral({
  type: "permission.replied",
  schema: {
    sessionID: SessionID,
    requestID: ID7,
    reply: Reply2
  }
});
var Event6 = { Asked, Replied: Replied2, Definitions: inventory(Asked, Replied2) };
var Effect = Schema_exports.Literals(["allow", "deny", "ask"]).annotate({ identifier: "Permission.Effect" });
var Rule = Schema_exports.Struct({
  action: Schema_exports.String,
  resource: Schema_exports.String,
  effect: Effect
}).annotate({ identifier: "Permission.Rule" });
var Ruleset = Schema_exports.Array(Rule).annotate({ identifier: "Permission.Ruleset" });

// node_modules/@opencode/schema/dist/agent.js
var Updated5 = ephemeral({ type: "agent.updated", schema: {} });
var ID8 = Schema_exports.String.pipe(Schema_exports.brand("Agent.ID"));
var Name = Schema_exports.String.pipe(Schema_exports.brand("Agent.Name"));
var Color = Schema_exports.String.annotate({ identifier: "Agent.Color" });
var Info7 = Schema_exports.Struct({
  id: ID8,
  name: Name,
  model: model_exports.Ref.pipe(optional3),
  request: provider_exports.Request,
  system: Schema_exports.String.pipe(optional3),
  description: Schema_exports.String.pipe(optional3),
  mode: Schema_exports.Literals(["subagent", "primary", "all"]),
  hidden: Schema_exports.Boolean,
  color: Color.pipe(optional3),
  steps: PositiveInt.pipe(optional3),
  permissions: permission_exports.Ruleset
}).annotate({ identifier: "Agent.Info" }).pipe(statics(() => ({
  default: (id2) => ({
    id: id2,
    name: Name.make(id2),
    request: { settings: {}, headers: {}, body: {} },
    mode: "primary",
    hidden: false,
    permissions: [
      { action: "*", resource: "*", effect: "allow" },
      { action: "read", resource: "*.env", effect: "ask" },
      { action: "read", resource: "*.env.*", effect: "ask" },
      { action: "read", resource: "*.env.example", effect: "allow" }
    ]
  })
})));
var Event7 = {
  Updated: Updated5,
  Definitions: inventory(Updated5)
};

// node_modules/@opencode/schema/dist/command.js
var Updated6 = ephemeral({ type: "command.updated", schema: {} });
var Info8 = Schema_exports.Struct({
  name: Schema_exports.String,
  description: Schema_exports.String.pipe(optional3)
}).annotate({ identifier: "Command.Info" });
var Event8 = {
  Updated: Updated6,
  Definitions: inventory(Updated6)
};

// node_modules/@opencode/schema/dist/mcp.js
var TimeoutConfig = class extends Schema_exports.Class("Mcp.TimeoutConfig")({
  startup: PositiveInt.pipe(optional3).annotate({
    description: "Maximum time in milliseconds to establish and initialize the MCP server."
  }),
  catalog: PositiveInt.pipe(optional3).annotate({
    description: "Maximum time in milliseconds to wait for MCP discovery requests such as tools/list and prompts/list."
  }),
  execution: PositiveInt.pipe(optional3).annotate({
    description: "Maximum time in milliseconds to wait for MCP tool and prompt execution."
  })
}) {
};
var Protocol = Schema_exports.Literals(["legacy", "auto", "2026-07-28"]).annotate({
  identifier: "Mcp.Protocol",
  description: 'MCP protocol negotiation. "legacy" (default) opens with the initialize handshake and speaks protocol revisions up to 2025-11-25. "auto" probes for the 2026-07-28 revision and falls back to legacy when the server does not support it. "2026-07-28" requires that revision and fails otherwise.'
});
var LocalConfig = class extends Schema_exports.Class("Mcp.LocalConfig")({
  type: Schema_exports.Literal("local"),
  command: Schema_exports.String.pipe(Schema_exports.Array),
  cwd: Schema_exports.String.pipe(optional3).annotate({
    description: "Working directory for the MCP server process. Relative paths resolve from the workspace directory."
  }),
  environment: Schema_exports.Record(Schema_exports.String, Schema_exports.String).pipe(optional3),
  disabled: Schema_exports.Boolean.pipe(optional3),
  codemode: Schema_exports.Boolean.pipe(optional3).annotate({
    description: "Expose this server's tools through Code Mode. Defaults to true."
  }),
  timeout: TimeoutConfig.pipe(optional3),
  protocol: Protocol.pipe(optional3)
}) {
};
var OAuthConfig = class extends Schema_exports.Class("Mcp.OAuthConfig")({
  client_id: Schema_exports.String.pipe(optional3),
  client_secret: Schema_exports.String.pipe(optional3),
  scope: Schema_exports.String.pipe(optional3),
  callback_port: Schema_exports.Int.check(Schema_exports.isBetween({ minimum: 1, maximum: 65535 })).pipe(optional3),
  redirect_uri: Schema_exports.String.pipe(optional3),
  auth_server_metadata_url: Schema_exports.String.pipe(optional3).annotate({
    description: "URL of the OAuth or OpenID Connect authorization server metadata document. Set when the MCP server does not publish protected resource metadata that names its authorization server."
  })
}) {
};
var RemoteConfig = class extends Schema_exports.Class("Mcp.RemoteConfig")({
  type: Schema_exports.Literal("remote"),
  url: Schema_exports.String,
  headers: Schema_exports.Record(Schema_exports.String, Schema_exports.String).pipe(optional3),
  oauth: Schema_exports.Union([OAuthConfig, Schema_exports.Literal(false)]).pipe(optional3),
  disabled: Schema_exports.Boolean.pipe(optional3),
  codemode: Schema_exports.Boolean.pipe(optional3).annotate({
    description: "Expose this server's tools through Code Mode. Defaults to true."
  }),
  timeout: TimeoutConfig.pipe(optional3),
  protocol: Protocol.pipe(optional3)
}) {
};
var ServerConfig = Schema_exports.Union([LocalConfig, RemoteConfig]).pipe(Schema_exports.toTaggedUnion("type"));
var Connected = Schema_exports.Struct({ status: Schema_exports.Literal("connected") }).annotate({
  identifier: "Mcp.Status.Connected"
});
var Pending = Schema_exports.Struct({ status: Schema_exports.Literal("pending") }).annotate({
  identifier: "Mcp.Status.Pending"
});
var Disabled = Schema_exports.Struct({ status: Schema_exports.Literal("disabled") }).annotate({
  identifier: "Mcp.Status.Disabled"
});
var Failed = Schema_exports.Struct({ status: Schema_exports.Literal("failed"), error: Schema_exports.String }).annotate({
  identifier: "Mcp.Status.Failed"
});
var NeedsAuth = Schema_exports.Struct({ status: Schema_exports.Literal("needs_auth"), error: Schema_exports.String }).annotate({
  identifier: "Mcp.Status.NeedsAuth"
});
var Status2 = Schema_exports.Union([Connected, Pending, Disabled, Failed, NeedsAuth]).pipe(Schema_exports.toTaggedUnion("status"));
var Server = Schema_exports.Struct({
  name: Schema_exports.String,
  status: Status2,
  // Set for remote servers registered as OAuth integrations; lets clients act on the right integration
  // without matching by name, which could collide with provider or plugin integrations.
  integrationID: optional3(IntegrationID)
}).annotate({ identifier: "Mcp.Server" });
var Resource = Schema_exports.Struct({
  server: Schema_exports.String,
  name: Schema_exports.String,
  uri: Schema_exports.String,
  description: optional3(Schema_exports.String),
  mimeType: optional3(Schema_exports.String)
}).annotate({ identifier: "Mcp.Resource" });
var ResourceTemplate = Schema_exports.Struct({
  server: Schema_exports.String,
  name: Schema_exports.String,
  uriTemplate: Schema_exports.String,
  description: optional3(Schema_exports.String),
  mimeType: optional3(Schema_exports.String)
}).annotate({ identifier: "Mcp.ResourceTemplate" });
var ResourceCatalog = Schema_exports.Struct({
  resources: Schema_exports.Array(Resource),
  templates: Schema_exports.Array(ResourceTemplate)
}).annotate({ identifier: "Mcp.ResourceCatalog" });
var ResourceContentPart = Schema_exports.Union([
  Schema_exports.Struct({
    type: Schema_exports.Literal("text"),
    uri: Schema_exports.String,
    text: Schema_exports.String,
    mimeType: optional3(Schema_exports.String)
  }),
  Schema_exports.Struct({
    type: Schema_exports.Literal("blob"),
    uri: Schema_exports.String,
    blob: Schema_exports.String,
    mimeType: optional3(Schema_exports.String)
  })
]).pipe(Schema_exports.toTaggedUnion("type"), Schema_exports.annotate({ identifier: "Mcp.ResourceContentPart" }));
var ResourceContent = Schema_exports.Struct({
  server: Schema_exports.String,
  uri: Schema_exports.String,
  contents: Schema_exports.Array(ResourceContentPart)
}).annotate({ identifier: "Mcp.ResourceContent" });

// node_modules/@opencode/schema/dist/pty.js
var pty_exports = {};
__export(pty_exports, {
  CreateInput: () => CreateInput2,
  Event: () => Event9,
  ID: () => ID9,
  Info: () => Info9,
  Pty: () => pty_exports,
  UpdateInput: () => UpdateInput
});
var IDSchema2 = Schema_exports.String.check(Schema_exports.isStartsWith("pty")).pipe(Schema_exports.brand("PtyID"));
var ID9 = IDSchema2.pipe(statics((schema) => {
  const create2 = () => schema.make("pty_" + ascending());
  return {
    create: create2,
    ascending: (id2) => id2 === void 0 ? create2() : schema.make(id2)
  };
}));
var Info9 = Schema_exports.Struct({
  id: ID9,
  title: Schema_exports.String,
  command: Schema_exports.String,
  args: Schema_exports.Array(Schema_exports.String),
  cwd: Schema_exports.String,
  status: Schema_exports.Literals(["running", "exited"]),
  pid: NonNegativeInt,
  exitCode: optional3(NonNegativeInt)
}).annotate({ identifier: "Pty" });
var Created2 = ephemeral({ type: "pty.created", schema: { info: Info9 } });
var Updated7 = ephemeral({ type: "pty.updated", schema: { info: Info9 } });
var Exited = ephemeral({ type: "pty.exited", schema: { id: ID9, exitCode: NonNegativeInt } });
var Deleted = ephemeral({ type: "pty.deleted", schema: { id: ID9 } });
var Event9 = { Created: Created2, Updated: Updated7, Exited, Deleted, Definitions: inventory(Created2, Updated7, Exited, Deleted) };
var CreateInput2 = Schema_exports.Struct({
  command: optional3(Schema_exports.String),
  args: optional3(Schema_exports.Array(Schema_exports.String)),
  cwd: optional3(Schema_exports.String),
  title: optional3(Schema_exports.String),
  env: optional3(Schema_exports.Record(Schema_exports.String, Schema_exports.String))
});
var UpdateInput = Schema_exports.Struct({
  title: optional3(Schema_exports.String),
  size: optional3(Schema_exports.Struct({
    rows: PositiveInt,
    cols: PositiveInt
  }))
});

// node_modules/@opencode/schema/dist/session.js
var session_exports = {};
__export(session_exports, {
  Event: () => Event13,
  ForkBoundary: () => ForkBoundary,
  ID: () => ID15,
  Info: () => Info19,
  ListAnchor: () => ListAnchor,
  Metadata: () => Metadata3,
  Revert: () => Revert,
  Session: () => session_exports
});

// node_modules/@opencode/schema/dist/project.js
var project_exports = {};
__export(project_exports, {
  Commands: () => Commands,
  Current: () => Current,
  Event: () => Event10,
  ID: () => ID10,
  Icon: () => Icon,
  Info: () => Info10,
  Project: () => project_exports,
  Time: () => Time,
  UpdateInput: () => UpdateInput2,
  Vcs: () => Vcs
});
var ID10 = ProjectID;
var Vcs = Schema_exports.String.check(Schema_exports.isPattern(/^[a-z][a-z0-9._-]*$/)).annotate({
  identifier: "Project.Vcs"
});
var Current = Schema_exports.Struct({
  id: ID10,
  directory: AbsolutePath,
  canonical: AbsolutePath
}).annotate({ identifier: "Project.Current" });
var Icon = Schema_exports.Struct({
  url: optional3(Schema_exports.String),
  override: optional3(Schema_exports.String),
  color: optional3(Schema_exports.String)
}).annotate({ identifier: "Project.Icon" });
var Commands = Schema_exports.Struct({
  start: optional3(Schema_exports.String.annotate({ description: "Startup script to run when creating a new workspace (worktree)" }))
}).annotate({ identifier: "Project.Commands" });
var Time = Schema_exports.Struct({
  created: NonNegativeInt,
  updated: NonNegativeInt,
  active: NonNegativeInt
}).annotate({ identifier: "Project.Time" });
var Info10 = Schema_exports.Struct({
  id: ID10,
  canonical: AbsolutePath,
  vcs: optional3(Vcs),
  name: optional3(Schema_exports.String),
  icon: optional3(Icon),
  commands: optional3(Commands),
  time: Time,
  sandboxes: Schema_exports.Array(Schema_exports.String)
}).annotate({ identifier: "Project" });
var UpdateInput2 = Schema_exports.Struct({
  projectID: ID10,
  canonical: optional3(AbsolutePath),
  name: optional3(Schema_exports.String),
  icon: optional3(Icon),
  commands: optional3(Commands)
}).annotate({ identifier: "Project.UpdateInput" });
var Updated8 = ephemeral({ type: "project.updated", schema: Info10.fields });
var Event10 = { Updated: Updated8, Definitions: inventory(Updated8) };

// node_modules/@opencode/schema/dist/session-event.js
var session_event_exports = {};
__export(session_event_exports, {
  AgentSelected: () => AgentSelected2,
  All: () => All,
  Compaction: () => Compaction4,
  Created: () => Created4,
  Definitions: () => Definitions,
  Deleted: () => Deleted3,
  Durable: () => Durable,
  DurableDefinitions: () => DurableDefinitions,
  EphemeralDefinitions: () => EphemeralDefinitions,
  Execution: () => Execution,
  Forked: () => Forked,
  InboxCancelled: () => InboxCancelled,
  InboxDelivered: () => InboxDelivered,
  InboxDeliveryChanged: () => InboxDeliveryChanged,
  InboxEnqueued: () => InboxEnqueued,
  InstructionsUpdated: () => InstructionsUpdated,
  MessageContentUpdated: () => MessageContentUpdated,
  MetadataUpdated: () => MetadataUpdated,
  ModelSelected: () => ModelSelected2,
  Moved: () => Moved,
  Permissions: () => Permissions,
  Reasoning: () => Reasoning,
  Renamed: () => Renamed,
  RetryScheduled: () => RetryScheduled,
  RevertEvent: () => RevertEvent,
  SessionEvent: () => session_event_exports,
  Shell: () => Shell2,
  Skill: () => Skill2,
  Source: () => Source3,
  Step: () => Step,
  Synthetic: () => Synthetic3,
  Text: () => Text,
  Tool: () => Tool,
  UsageRecorded: () => UsageRecorded,
  UsageUpdated: () => UsageUpdated,
  Viewed: () => Viewed
});

// node_modules/@opencode/schema/dist/llm.js
var FinishReason = Schema_exports.Literals(["stop", "length", "tool-calls", "content-filter", "error", "unknown"]);

// node_modules/@opencode/schema/dist/tool.js
var CallID = Schema_exports.String.pipe(Schema_exports.brand("Tool.CallID"));
var Error4 = class extends Schema_exports.TaggedError()("Tool.Error", {
  message: Schema_exports.String,
  error: Schema_exports.optional(Schema_exports.Defect()),
  metadata: Schema_exports.optional(Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown))
}) {
};
var TextContent = Schema_exports.Struct({
  type: Schema_exports.Literal("text"),
  text: Schema_exports.String
}).annotate({ identifier: "Tool.TextContent" });
var FileContent = Schema_exports.Struct({
  type: Schema_exports.Literal("file"),
  uri: Schema_exports.String,
  mime: Schema_exports.String,
  name: Schema_exports.optional(Schema_exports.String)
}).annotate({ identifier: "Tool.FileContent" });
var Content = Schema_exports.Union([TextContent, FileContent]).pipe(Schema_exports.toTaggedUnion("type")).annotate({ identifier: "Tool.Content" });

// node_modules/@opencode/schema/dist/session-metadata.js
var SessionMetadata = Schema_exports.Record(Schema_exports.String, Schema_exports.Json).annotate({
  identifier: "Session.Metadata"
});

// node_modules/@opencode/schema/dist/session-message.js
var session_message_exports = {};
__export(session_message_exports, {
  AgentSelected: () => AgentSelected,
  Assistant: () => Assistant,
  AssistantContent: () => AssistantContent,
  AssistantContentEncoded: () => AssistantContentEncoded,
  AssistantReasoning: () => AssistantReasoning,
  AssistantRetry: () => AssistantRetry,
  AssistantText: () => AssistantText,
  AssistantTool: () => AssistantTool,
  Compaction: () => Compaction2,
  CompactionCompleted: () => CompactionCompleted,
  CompactionFailed: () => CompactionFailed,
  CompactionRunning: () => CompactionRunning,
  ID: () => ID14,
  Idle: () => Idle,
  Info: () => Info15,
  LocationSwitched: () => LocationSwitched,
  ModelSelected: () => ModelSelected,
  ProviderState: () => ProviderState,
  SessionMessage: () => session_message_exports,
  Shell: () => Shell,
  Skill: () => Skill,
  Synthetic: () => Synthetic,
  System: () => System,
  ToolState: () => ToolState,
  ToolStateCompleted: () => ToolStateCompleted,
  ToolStateError: () => ToolStateError,
  ToolStateRunning: () => ToolStateRunning,
  ToolStateStreaming: () => ToolStateStreaming,
  User: () => User
});

// node_modules/@opencode/schema/dist/session-provider-context.js
var session_provider_context_exports = {};
__export(session_provider_context_exports, {
  Info: () => Info11,
  Provenance: () => Provenance,
  SessionProviderContext: () => session_provider_context_exports
});
var Provenance = Schema_exports.Struct({
  providerID: provider_exports.ID,
  provider: Schema_exports.String,
  modelID: Schema_exports.String,
  route: Schema_exports.String,
  protocol: Schema_exports.String,
  /** Digest of the configured endpoint; raw URLs and query values are not persisted. */
  endpoint: Schema_exports.String
}).annotate({ identifier: "Session.ProviderContext.Provenance" });
var Info11 = Schema_exports.Struct({
  version: Schema_exports.Literal(1),
  provenance: Provenance,
  messages: Schema_exports.Json
}).annotate({ identifier: "Session.ProviderContext" });

// node_modules/@opencode/schema/dist/skill.js
var skill_exports = {};
__export(skill_exports, {
  DirectorySource: () => DirectorySource,
  EmbeddedSource: () => EmbeddedSource,
  Event: () => Event11,
  ID: () => ID11,
  Info: () => Info12,
  Name: () => Name2,
  Skill: () => skill_exports,
  Source: () => Source2,
  UrlSource: () => UrlSource
});
var ID11 = Schema_exports.String.pipe(Schema_exports.brand("Skill.ID"));
var Name2 = Schema_exports.String.pipe(Schema_exports.brand("Skill.Name"));
var DirectorySource = Schema_exports.Struct({
  type: Schema_exports.tag("directory"),
  path: AbsolutePath
}).annotate({ identifier: "Skill.DirectorySource" });
var UrlSource = Schema_exports.Struct({
  type: Schema_exports.tag("url"),
  url: Schema_exports.String
}).annotate({ identifier: "Skill.UrlSource" });
var Info12 = Schema_exports.Struct({
  id: ID11,
  name: Name2,
  description: Schema_exports.String.pipe(optional3),
  autoinvoke: Schema_exports.Boolean.pipe(optional3),
  path: AbsolutePath,
  content: Schema_exports.String
}).annotate({ identifier: "Skill.Info" });
var Updated9 = ephemeral({ type: "skill.updated", schema: {} });
var Event11 = { Updated: Updated9, Definitions: inventory(Updated9) };
var EmbeddedSource = Schema_exports.Struct({
  type: Schema_exports.tag("embedded"),
  skill: Schema_exports.suspend(() => Info12)
}).annotate({ identifier: "Skill.EmbeddedSource" });
var Source2 = Object.assign(Schema_exports.Union([DirectorySource, UrlSource, EmbeddedSource]).pipe(Schema_exports.toTaggedUnion("type"), Schema_exports.annotate({ identifier: "Skill.Source" })), {
  equals: (a, b) => {
    if (a.type !== b.type)
      return false;
    if (a.type === "directory" && b.type === "directory")
      return a.path === b.path;
    if (a.type === "url" && b.type === "url")
      return a.url === b.url;
    if (a.type === "embedded" && b.type === "embedded")
      return a.skill.id === b.skill.id;
    return false;
  },
  key: (source) => source.type === "directory" ? `directory:${source.path}` : source.type === "url" ? `url:${source.url}` : `embedded:${source.skill.id}`
});

// node_modules/@opencode/schema/dist/prompt.js
var PromptMention = Schema_exports.Struct({
  start: Schema_exports.Finite,
  end: Schema_exports.Finite,
  text: Schema_exports.String
}).annotate({ identifier: "Prompt.Mention" });
var FileSource = Schema_exports.Union([
  Schema_exports.Struct({ type: Schema_exports.Literal("inline") }),
  Schema_exports.Struct({ type: Schema_exports.Literal("uri"), uri: Schema_exports.String })
]).pipe(Schema_exports.toTaggedUnion("type")).annotate({ identifier: "Prompt.FileSource" });
var Base64 = Schema_exports.String.check(Schema_exports.isPattern(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/)).annotate({ identifier: "Prompt.Base64" });
var FileAttachment = Schema_exports.Struct({
  data: Base64,
  mime: Schema_exports.String,
  source: FileSource,
  name: Schema_exports.String.pipe(optional3),
  description: Schema_exports.String.pipe(optional3),
  mention: PromptMention.pipe(optional3)
}).annotate({ identifier: "Prompt.FileAttachment" }).pipe(statics((schema) => ({
  create: (input) => schema.make({
    data: input.data,
    mime: input.mime,
    source: input.source,
    name: input.name,
    description: input.description,
    mention: input.mention
  })
})));
var AgentAttachment = Schema_exports.Struct({
  name: Schema_exports.String,
  mention: PromptMention.pipe(optional3)
}).annotate({ identifier: "Prompt.AgentAttachment" });
var SkillAttachment = Schema_exports.Struct({
  id: skill_exports.ID,
  name: skill_exports.Name,
  text: Schema_exports.String.pipe(optional3),
  mention: PromptMention.pipe(optional3)
}).annotate({ identifier: "Prompt.SkillAttachment" });
var Prompt = Schema_exports.Struct({
  text: Schema_exports.String,
  files: Schema_exports.Array(FileAttachment).pipe(optional3),
  agents: Schema_exports.Array(AgentAttachment).pipe(optional3),
  skills: Schema_exports.Array(SkillAttachment).pipe(optional3)
}).annotate({ identifier: "Prompt" }).pipe(statics((schema) => ({
  equivalence: Schema_exports.toEquivalence(schema),
  fromUserMessage: (input) => schema.make({
    text: input.text,
    ...input.files === void 0 ? {} : { files: input.files },
    ...input.agents === void 0 ? {} : { agents: input.agents },
    ...input.skills === void 0 ? {} : { skills: input.skills }
  })
})));

// node_modules/@opencode/schema/dist/shell.js
var shell_exports = {};
__export(shell_exports, {
  CreateInput: () => CreateInput3,
  Event: () => Event12,
  ID: () => ID12,
  Info: () => Info13,
  Metadata: () => Metadata2,
  Output: () => Output,
  OutputInput: () => OutputInput,
  Shell: () => shell_exports,
  Status: () => Status3,
  Time: () => Time2
});
var IDSchema3 = Schema_exports.String.check(Schema_exports.isStartsWith("sh_")).pipe(Schema_exports.brand("Shell.ID"));
var ID12 = IDSchema3.pipe(statics((schema) => {
  const create2 = () => schema.make("sh_" + ascending());
  return {
    create: create2,
    ascending: (id2) => id2 === void 0 ? create2() : schema.make(id2)
  };
}));
var Status3 = Schema_exports.Literals(["running", "exited", "timeout", "killed"]);
var Time2 = Schema_exports.Struct({
  started: Schema_exports.Finite.annotate({ description: "Start time in milliseconds since the Unix epoch" }),
  completed: optional3(Schema_exports.Finite).annotate({
    description: "Completion time in milliseconds since the Unix epoch"
  })
});
var Metadata2 = Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown);
var Info13 = Schema_exports.Struct({
  id: ID12,
  status: Status3,
  command: Schema_exports.String,
  cwd: Schema_exports.String,
  shell: Schema_exports.String,
  // Absolute path of the file capturing combined stdout/stderr. Page through it via `output`.
  file: Schema_exports.String,
  pid: optional3(NonNegativeInt),
  exit: optional3(Schema_exports.Finite),
  signal: optional3(Schema_exports.String),
  // Always present; defaults to an empty object when the creator supplies no metadata.
  metadata: Metadata2,
  time: Time2
}).annotate({ identifier: "Shell.Info" });
var Created3 = ephemeral({ type: "shell.created", schema: { info: Info13 } });
var Exited2 = ephemeral({ type: "shell.exited", schema: { id: ID12, exit: optional3(Schema_exports.Finite), status: Status3 } });
var Deleted2 = ephemeral({ type: "shell.deleted", schema: { id: ID12 } });
var Event12 = { Created: Created3, Exited: Exited2, Deleted: Deleted2, Definitions: inventory(Created3, Exited2, Deleted2) };
var CreateInput3 = Schema_exports.Struct({
  command: Schema_exports.String,
  cwd: optional3(Schema_exports.String),
  timeout: optional3(NonNegativeInt),
  metadata: optional3(Metadata2)
});
var OutputInput = Schema_exports.Struct({
  cursor: optional3(NonNegativeInt),
  limit: optional3(NonNegativeInt)
});
var Output = Schema_exports.Struct({
  output: Schema_exports.String,
  // Absolute cursor after this page. Equals `size` once fully caught up.
  cursor: NonNegativeInt,
  // Total bytes captured so far. A consumer has more to page while `cursor < size`.
  size: NonNegativeInt,
  truncated: Schema_exports.Boolean
});

// node_modules/@opencode/schema/dist/session-error.js
var session_error_exports = {};
__export(session_error_exports, {
  Error: () => Error5,
  SessionError: () => session_error_exports
});
var Error5 = Schema_exports.Struct({
  type: Schema_exports.String,
  message: Schema_exports.String,
  status: Schema_exports.Int.check(Schema_exports.isBetween({ minimum: 100, maximum: 599 })).pipe(optional3),
  response: Schema_exports.Struct({ body: Schema_exports.String }).pipe(optional3)
}).annotate({ identifier: "Session.StructuredError" });

// node_modules/@opencode/schema/dist/snapshot.js
var snapshot_exports = {};
__export(snapshot_exports, {
  ID: () => ID13,
  Snapshot: () => snapshot_exports
});
var ID13 = Schema_exports.String.pipe(Schema_exports.brand("Snapshot.ID"));

// node_modules/@opencode/schema/dist/token-usage.js
var token_usage_exports = {};
__export(token_usage_exports, {
  Info: () => Info14,
  TokenUsage: () => token_usage_exports,
  total: () => total
});
var Info14 = Schema_exports.Struct({
  input: Schema_exports.Finite,
  output: Schema_exports.Finite,
  reasoning: Schema_exports.Finite,
  cache: Schema_exports.Struct({
    read: Schema_exports.Finite,
    write: Schema_exports.Finite
  })
}).annotate({ identifier: "TokenUsage.Info" });
function total(tokens) {
  return tokens.input + tokens.output + tokens.reasoning + tokens.cache.read + tokens.cache.write;
}

// node_modules/@opencode/schema/dist/session-message.js
var ID14 = Schema_exports.String.check(Schema_exports.isStartsWith("msg_")).pipe(Schema_exports.brand("Session.Message.ID"), statics((schema) => ({
  create: () => schema.make("msg_" + ascending()),
  fromEvent: (eventID) => schema.make(eventID.replace(/^evt_/, "msg_"))
})));
var Base3 = {
  id: ID14,
  metadata: Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown).pipe(optional3),
  time: Schema_exports.Struct({ created: DateTimeUtcFromMillis2 })
};
var ProviderState = Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown).annotate({
  identifier: "Session.Message.ProviderState"
});
var AgentSelected = Schema_exports.Struct({
  ...Base3,
  type: Schema_exports.tag("agent-switched"),
  agent: agent_exports.ID,
  previous: agent_exports.ID.pipe(optional3)
}).annotate({ identifier: "Session.Message.AgentSelected" });
var ModelSelected = Schema_exports.Struct({
  ...Base3,
  type: Schema_exports.tag("model-switched"),
  model: model_exports.Ref,
  previous: model_exports.Ref.pipe(optional3)
}).annotate({ identifier: "Session.Message.ModelSelected" });
var LocationSwitched = Schema_exports.Struct({
  ...Base3,
  type: Schema_exports.tag("location-switched"),
  location: location_exports.Ref,
  projectID: project_exports.ID.pipe(optional3),
  subpath: RelativePath.pipe(optional3),
  previous: Schema_exports.Struct({
    location: location_exports.Ref,
    projectID: project_exports.ID.pipe(optional3),
    subpath: RelativePath.pipe(optional3)
  }).pipe(optional3)
}).annotate({ identifier: "Session.Message.LocationSwitched" });
var User = Schema_exports.Struct({
  ...Base3,
  text: Prompt.fields.text,
  files: Prompt.fields.files,
  agents: Prompt.fields.agents,
  skills: Prompt.fields.skills,
  type: Schema_exports.tag("user")
}).annotate({ identifier: "Session.Message.User" });
var Synthetic = Schema_exports.Struct({
  ...Base3,
  text: Schema_exports.String,
  description: Schema_exports.String.pipe(optional3),
  type: Schema_exports.tag("synthetic")
}).annotate({ identifier: "Session.Message.Synthetic" });
var System = Schema_exports.Struct({
  ...Base3,
  type: Schema_exports.tag("system"),
  /** The model-facing update text, frozen at emit time. */
  text: Schema_exports.String,
  /** A short human-readable summary for transcript display. */
  description: Schema_exports.String.pipe(optional3)
}).annotate({ identifier: "Session.Message.System" });
var Skill = Schema_exports.Struct({
  ...Base3,
  type: Schema_exports.tag("skill"),
  skill: skill_exports.ID,
  name: skill_exports.Name,
  text: Schema_exports.String
}).annotate({ identifier: "Session.Message.Skill" });
var Shell = Schema_exports.Struct({
  ...Base3,
  type: Schema_exports.tag("shell"),
  shellID: shell_exports.ID,
  command: Schema_exports.String,
  status: shell_exports.Status,
  exit: Schema_exports.Number.pipe(optional3),
  output: shell_exports.Output.pipe(optional3),
  time: Schema_exports.Struct({
    created: DateTimeUtcFromMillis2,
    completed: DateTimeUtcFromMillis2.pipe(optional3)
  })
}).annotate({ identifier: "Session.Message.Shell" });
var ToolStateStreaming = Schema_exports.Struct({
  status: Schema_exports.tag("streaming"),
  input: Schema_exports.String
}).annotate({ identifier: "Session.Message.ToolState.Streaming" });
var ToolStateRunning = Schema_exports.Struct({
  status: Schema_exports.tag("running"),
  input: Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown),
  metadata: Schema_exports.Record(Schema_exports.String, Schema_exports.Json)
}).annotate({ identifier: "Session.Message.ToolState.Running" });
var ToolStateCompleted = Schema_exports.Struct({
  status: Schema_exports.tag("completed"),
  input: Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown),
  content: Schema_exports.NonEmptyArray(Content),
  metadata: Schema_exports.Record(Schema_exports.String, Schema_exports.Json).pipe(optional3)
}).annotate({ identifier: "Session.Message.ToolState.Completed" });
var ToolStateError = Schema_exports.Struct({
  status: Schema_exports.tag("error"),
  input: Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown),
  error: session_error_exports.Error,
  content: Schema_exports.NonEmptyArray(Content).pipe(optional3),
  metadata: Schema_exports.Record(Schema_exports.String, Schema_exports.Json).pipe(optional3)
}).annotate({ identifier: "Session.Message.ToolState.Error" });
var ToolState = Schema_exports.Union([ToolStateStreaming, ToolStateRunning, ToolStateCompleted, ToolStateError]).pipe(Schema_exports.toTaggedUnion("status"));
var AssistantTool = Schema_exports.Struct({
  type: Schema_exports.tag("tool"),
  id: Schema_exports.String,
  name: Schema_exports.String,
  executed: Schema_exports.Boolean.pipe(optional3),
  providerState: ProviderState.pipe(optional3),
  providerResultState: ProviderState.pipe(optional3),
  state: ToolState,
  time: Schema_exports.Struct({
    created: DateTimeUtcFromMillis2,
    ran: DateTimeUtcFromMillis2.pipe(optional3),
    completed: DateTimeUtcFromMillis2.pipe(optional3)
  })
}).annotate({ identifier: "Session.Message.Assistant.Tool" });
var AssistantText = Schema_exports.Struct({
  type: Schema_exports.tag("text"),
  text: Schema_exports.String,
  state: ProviderState.pipe(optional3)
}).annotate({ identifier: "Session.Message.Assistant.Text" });
var AssistantReasoning = Schema_exports.Struct({
  type: Schema_exports.tag("reasoning"),
  text: Schema_exports.String,
  state: ProviderState.pipe(optional3),
  time: Schema_exports.Struct({
    created: DateTimeUtcFromMillis2,
    completed: DateTimeUtcFromMillis2.pipe(optional3)
  }).pipe(optional3)
}).annotate({ identifier: "Session.Message.Assistant.Reasoning" });
var AssistantContent = Schema_exports.Union([AssistantText, AssistantReasoning, AssistantTool]).pipe(Schema_exports.toTaggedUnion("type"));
var AssistantContentEncoded = Schema_exports.toEncoded(AssistantContent).annotate({
  identifier: "Session.Message.AssistantContent.Encoded"
});
var AssistantRetry = Schema_exports.Struct({
  attempt: PositiveInt,
  at: DateTimeUtcFromMillis2,
  error: session_error_exports.Error
}).annotate({ identifier: "Session.Message.Assistant.Retry" });
var Assistant = Schema_exports.Struct({
  ...Base3,
  type: Schema_exports.tag("assistant"),
  agent: agent_exports.ID,
  model: model_exports.Ref,
  content: AssistantContent.pipe(Schema_exports.Array),
  snapshot: Schema_exports.Struct({
    start: snapshot_exports.ID.pipe(optional3),
    end: snapshot_exports.ID.pipe(optional3),
    files: Schema_exports.Array(RelativePath).pipe(optional3)
  }).pipe(optional3),
  finish: FinishReason.pipe(optional3),
  rawFinish: Schema_exports.String.pipe(optional3),
  providerState: ProviderState.pipe(optional3),
  cost: money_exports.USD.pipe(optional3),
  tokens: token_usage_exports.Info.pipe(optional3),
  error: session_error_exports.Error.pipe(optional3),
  retry: AssistantRetry.pipe(optional3),
  time: Schema_exports.Struct({
    created: DateTimeUtcFromMillis2,
    /** When the provider response body ended, before tool settlement. */
    streamed: DateTimeUtcFromMillis2.pipe(optional3),
    completed: DateTimeUtcFromMillis2.pipe(optional3)
  })
}).annotate({ identifier: "Session.Message.Assistant" });
var CompactionBase = { type: Schema_exports.tag("compaction"), ...Base3 };
var CompactionUsage = {
  cost: money_exports.USD.pipe(optional3),
  tokens: token_usage_exports.Info.pipe(optional3)
};
var CompactionRunning = Schema_exports.Struct({
  ...CompactionBase,
  status: Schema_exports.tag("running"),
  reason: Schema_exports.Literals(["auto", "manual"]),
  summary: Schema_exports.String,
  recent: Schema_exports.String
}).annotate({ identifier: "Session.Message.Compaction.Running" });
var CompactionCompleted = Schema_exports.Struct({
  ...CompactionBase,
  status: Schema_exports.tag("completed"),
  reason: Schema_exports.Literals(["auto", "manual"]),
  model: model_exports.Ref.pipe(optional3),
  providerState: ProviderState.pipe(optional3),
  summary: Schema_exports.String,
  recent: Schema_exports.String,
  providerContext: session_provider_context_exports.Info.pipe(optional3),
  ...CompactionUsage
}).annotate({ identifier: "Session.Message.Compaction.Completed" });
var CompactionFailed = Schema_exports.Struct({
  ...CompactionBase,
  status: Schema_exports.tag("failed"),
  reason: Schema_exports.Literals(["auto", "manual"]),
  error: session_error_exports.Error,
  ...CompactionUsage
}).annotate({ identifier: "Session.Message.Compaction.Failed" });
var Compaction2 = Schema_exports.Union([CompactionRunning, CompactionCompleted, CompactionFailed]).pipe(Schema_exports.toTaggedUnion("status"), Schema_exports.annotate({ identifier: "Session.Message.Compaction" }));
var Idle = Schema_exports.Struct({
  ...Base3,
  type: Schema_exports.tag("idle"),
  outcome: Schema_exports.Literals(["succeeded", "failed", "interrupted"])
}).annotate({ identifier: "Session.Message.Idle" });
var Info15 = Schema_exports.Union([
  AgentSelected,
  ModelSelected,
  LocationSwitched,
  User,
  Synthetic,
  System,
  Skill,
  Shell,
  Assistant,
  Compaction2,
  Idle
]).annotate({ identifier: "Session.Message.Info" });

// node_modules/@opencode/schema/dist/file-diff.js
var file_diff_exports = {};
__export(file_diff_exports, {
  FileDiff: () => file_diff_exports,
  Info: () => Info16,
  LegacyInfo: () => LegacyInfo
});
var Info16 = Schema_exports.Struct({
  file: Schema_exports.String,
  patch: Schema_exports.String,
  additions: NonNegativeInt,
  deletions: NonNegativeInt,
  status: Schema_exports.Literals(["added", "deleted", "modified"])
}).annotate({ identifier: "FileDiff.Info" });
var LegacyInfo = Schema_exports.Struct({
  file: Schema_exports.String.pipe(optional3),
  patch: Schema_exports.String.pipe(optional3),
  additions: Schema_exports.Finite,
  deletions: Schema_exports.Finite,
  status: Schema_exports.Literals(["added", "deleted", "modified"]).pipe(optional3)
}).annotate({ identifier: "FileDiff.LegacyInfo" });

// node_modules/@opencode/schema/dist/session-revert.js
var Revert = Schema_exports.Struct({
  messageID: session_message_exports.ID,
  /** Legacy V1 compatibility state. */
  partID: Schema_exports.String.pipe(optional3),
  snapshot: snapshot_exports.ID.pipe(optional3),
  files: Schema_exports.Array(file_diff_exports.Info).pipe(optional3)
}).annotate({ identifier: "Session.Revert" });
var FileDiffV1 = Schema_exports.Struct({
  path: Schema_exports.String,
  status: Schema_exports.Literals(["added", "modified", "deleted"]),
  additions: Schema_exports.Finite,
  deletions: Schema_exports.Finite,
  patch: Schema_exports.String
});
var RevertV1 = Schema_exports.Struct({
  messageID: session_message_exports.ID,
  partID: Schema_exports.String.pipe(optional3),
  snapshot: Schema_exports.String.pipe(optional3),
  diff: Schema_exports.String.pipe(optional3),
  files: Schema_exports.Array(FileDiffV1).pipe(optional3)
}).annotate({ identifier: "Session.RevertV1" });
var PersistedCurrent = Revert.pipe(Schema_exports.decodeTo(Schema_exports.Struct({ source: Schema_exports.tag("current"), revert: Schema_exports.toType(Revert) }), SchemaTransformation_exports.transform({
  decode: (revert) => ({
    source: "current",
    revert
  }),
  encode: (value3) => value3.revert
})));
var PersistedLegacy = RevertV1.pipe(Schema_exports.decodeTo(Schema_exports.Struct({ source: Schema_exports.tag("legacy"), revert: Schema_exports.toType(RevertV1) }), SchemaTransformation_exports.transform({
  decode: (revert) => ({
    source: "legacy",
    revert
  }),
  encode: (value3) => value3.revert
})));
var PersistedRevert = Schema_exports.Union([PersistedCurrent, PersistedLegacy]).pipe(Schema_exports.toTaggedUnion("source"), Schema_exports.decodeTo(Schema_exports.toType(Revert), SchemaTransformation_exports.transform({
  decode: (persisted) => {
    if (persisted.source === "current")
      return persisted.revert;
    return Revert.make({
      messageID: persisted.revert.messageID,
      partID: persisted.revert.partID,
      snapshot: persisted.revert.snapshot ? snapshot_exports.ID.make(persisted.revert.snapshot) : void 0,
      files: persisted.revert.files?.map((file) => ({
        file: file.path,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        patch: file.patch
      }))
    });
  },
  encode: (revert) => ({
    source: "current",
    revert
  })
})), Schema_exports.annotate({ identifier: "Session.Revert.Persisted" }));

// node_modules/@opencode/schema/dist/instruction.js
var instruction_exports = {};
__export(instruction_exports, {
  Delta: () => Delta,
  Hash: () => Hash,
  Instruction: () => instruction_exports,
  Key: () => Key2,
  Removed: () => Removed,
  Values: () => Values,
  removed: () => removed
});
var Key2 = Schema_exports.String.check(Schema_exports.isPattern(/^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._/-]*$/)).pipe(Schema_exports.brand("Instruction.Key"));
var Hash = Schema_exports.String.check(Schema_exports.isPattern(/^[a-f0-9]{64}$/)).pipe(Schema_exports.brand("Instruction.Hash"));
var Values = Schema_exports.Record(Key2, Hash);
var Removed = Schema_exports.Literal("removed");
var removed = Removed.make("removed");
var Delta = Schema_exports.Record(Schema_exports.String, Schema_exports.Union([Hash, Removed]));

// node_modules/@opencode/schema/dist/instruction-entry.js
var instruction_entry_exports = {};
__export(instruction_entry_exports, {
  Info: () => Info17,
  InstructionEntry: () => instruction_entry_exports,
  Key: () => Key3,
  MaxValueBytes: () => MaxValueBytes,
  Snapshot: () => Snapshot,
  ValueTooLargeError: () => ValueTooLargeError
});
var Key3 = Schema_exports.String.check(Schema_exports.isPattern(/^[a-z0-9][a-z0-9._-]*$/)).annotate({
  identifier: "InstructionEntry.Key",
  description: "Instruction entry key (lowercase alphanumerics plus . _ -)"
});
var Info17 = Schema_exports.Struct({
  key: Key3,
  value: Schema_exports.Json.annotate({ description: "JSON value attached to the session's instructions" })
}).annotate({ identifier: "InstructionEntry.Info" });
var Snapshot = Schema_exports.Array(Schema_exports.Struct({
  ...Info17.fields,
  removed: Schema_exports.Boolean
})).annotate({ identifier: "InstructionEntry.Snapshot" });
var MaxValueBytes = 256 * 1024;
var ValueTooLargeError = class extends Schema_exports.TaggedError()("InstructionEntryValueTooLargeError", {
  actualBytes: Schema_exports.Int,
  maxBytes: Schema_exports.Int,
  message: Schema_exports.String
}, { httpApiStatus: 413 }) {
};

// node_modules/@opencode/schema/dist/session-inbox.js
var session_inbox_exports = {};
__export(session_inbox_exports, {
  Compaction: () => Compaction3,
  CompactionPayload: () => CompactionPayload,
  Delivery: () => Delivery,
  Info: () => Info18,
  Item: () => Item,
  Move: () => Move,
  MovePayload: () => MovePayload,
  SessionInbox: () => session_inbox_exports,
  Synthetic: () => Synthetic2,
  SyntheticPayload: () => SyntheticPayload,
  User: () => User2,
  UserPayload: () => UserPayload
});
var Delivery = Schema_exports.Literals(["steer", "queue"]).annotate({ identifier: "Session.Inbox.Delivery" });
var UserPayload = Schema_exports.Struct({
  ...Prompt.fields,
  metadata: Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown).pipe(optional3)
}).annotate({ identifier: "Session.Inbox.UserPayload" });
var SyntheticPayload = Schema_exports.Struct({
  text: Schema_exports.String,
  description: Schema_exports.String.pipe(optional3),
  metadata: Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown).pipe(optional3)
}).annotate({ identifier: "Session.Inbox.SyntheticPayload" });
var CompactionPayload = Schema_exports.Struct({}).annotate({ identifier: "Session.Inbox.CompactionPayload" });
var MovePayload = Schema_exports.Struct({
  location: location_exports.Ref,
  projectID: project_exports.ID,
  subpath: RelativePath.pipe(optional3)
}).annotate({ identifier: "Session.Inbox.MovePayload" });
var UserItem = Schema_exports.Struct({ type: Schema_exports.tag("user"), payload: UserPayload, delivery: Delivery });
var SyntheticItem = Schema_exports.Struct({ type: Schema_exports.tag("synthetic"), payload: SyntheticPayload, delivery: Delivery });
var CompactionItem = Schema_exports.Struct({
  type: Schema_exports.tag("compaction"),
  payload: CompactionPayload,
  delivery: Delivery
});
var MoveItem = Schema_exports.Struct({ type: Schema_exports.tag("move"), payload: MovePayload, delivery: Delivery });
var Item = Schema_exports.Union([UserItem, SyntheticItem, CompactionItem, MoveItem]).pipe(Schema_exports.toTaggedUnion("type"), Schema_exports.annotate({ identifier: "Session.Inbox.Item" }));
var Enqueued = {
  id: session_message_exports.ID,
  sessionID: SessionID,
  time: Schema_exports.Struct({ created: DateTimeUtcFromMillis2 })
};
var User2 = Schema_exports.Struct({ ...Enqueued, ...UserItem.fields }).annotate({ identifier: "Session.Inbox.User" });
var Synthetic2 = Schema_exports.Struct({ ...Enqueued, ...SyntheticItem.fields }).annotate({
  identifier: "Session.Inbox.Synthetic"
});
var Compaction3 = Schema_exports.Struct({ ...Enqueued, ...CompactionItem.fields }).annotate({
  identifier: "Session.Inbox.Compaction"
});
var Move = Schema_exports.Struct({ ...Enqueued, ...MoveItem.fields }).annotate({ identifier: "Session.Inbox.Move" });
var Info18 = Schema_exports.Union([User2, Synthetic2, Compaction3, Move]).pipe(Schema_exports.toTaggedUnion("type"), Schema_exports.annotate({ identifier: "Session.Inbox.Info" }));

// node_modules/@opencode/schema/dist/session-fork.js
var session_fork_exports = {};
__export(session_fork_exports, {
  Boundary: () => Boundary,
  SessionFork: () => session_fork_exports
});
var Boundary = Schema_exports.Union([
  Schema_exports.Struct({ type: Schema_exports.Literal("before"), messageID: session_message_exports.ID }),
  Schema_exports.Struct({ type: Schema_exports.Literal("through"), messageID: session_message_exports.ID })
]).annotate({ identifier: "Session.ForkBoundary" });

// node_modules/@opencode/schema/dist/session-event.js
var Source3 = Schema_exports.Struct({
  start: NonNegativeInt,
  end: NonNegativeInt,
  text: Schema_exports.String
}).annotate({
  identifier: "Session.Event.Source"
});
var Base4 = {
  sessionID: SessionID
};
var options = {
  durable: {
    aggregate: "sessionID",
    version: 1
  }
};
var Created4 = event_exports.durable({
  type: "session.created",
  ...options,
  schema: {
    ...Base4,
    projectID: project_exports.ID,
    location: location_exports.Ref,
    subpath: RelativePath.pipe(optional3),
    parentID: SessionID.pipe(optional3),
    slug: Schema_exports.String,
    title: Schema_exports.String.pipe(optional3),
    agent: agent_exports.ID.pipe(optional3),
    model: model_exports.Ref.pipe(optional3),
    /** Host-supplied annotations resolved at creation, including any inherited from a parent. */
    metadata: SessionMetadata.pipe(optional3),
    permissions: permission_exports.Ruleset.pipe(optional3),
    version: Schema_exports.String
  }
});
var AgentSelected2 = event_exports.durable({
  type: "session.agent.selected",
  ...options,
  schema: {
    ...Base4,
    agent: agent_exports.ID,
    previous: agent_exports.ID.pipe(optional3)
  }
});
var ModelSelected2 = event_exports.durable({
  type: "session.model.selected",
  ...options,
  schema: {
    ...Base4,
    model: model_exports.Ref,
    previous: model_exports.Ref.pipe(optional3)
  }
});
var Moved = event_exports.durable({
  type: "session.moved",
  ...options,
  schema: {
    ...Base4,
    ...session_inbox_exports.MovePayload.fields
  }
});
var Renamed = event_exports.durable({
  type: "session.renamed",
  ...options,
  schema: {
    ...Base4,
    title: Schema_exports.String
  }
});
var MetadataUpdated = event_exports.durable({
  type: "session.metadata.updated",
  ...options,
  schema: {
    ...Base4,
    metadata: SessionMetadata
  }
});
var Permissions = event_exports.durable({
  type: "session.permissions",
  ...options,
  schema: {
    ...Base4,
    permissions: permission_exports.Ruleset
  }
});
var Viewed = event_exports.durable({
  type: "session.viewed",
  ...options,
  schema: {
    ...Base4,
    /** Epoch-millisecond idle watermark the viewer observed; projection never marks a newer idle transition viewed. */
    idle: Schema_exports.Finite
  }
});
var MessageContentUpdated = event_exports.durable({
  type: "session.message.content.updated",
  ...options,
  schema: {
    ...Base4,
    messageID: session_message_exports.ID,
    // Public events are framed directly, so timestamps must already be encoded.
    content: Schema_exports.Array(session_message_exports.AssistantContentEncoded)
  }
});
var UsageRecorded = event_exports.durable({
  type: "session.usage.recorded",
  ...options,
  schema: {
    ...Base4,
    source: Schema_exports.Literals(["title", "compaction"]),
    cost: money_exports.USD,
    tokens: token_usage_exports.Info
  }
});
var UsageUpdated = event_exports.ephemeral({
  type: "session.usage.updated",
  schema: {
    ...Base4,
    cost: money_exports.USD,
    tokens: token_usage_exports.Info
  }
});
var Deleted3 = event_exports.durable({
  type: "session.deleted",
  durable: {
    aggregate: "sessionID",
    version: 2
  },
  schema: Base4
});
var Forked = event_exports.durable({
  type: "session.forked",
  durable: {
    aggregate: "sessionID",
    version: 2
  },
  schema: {
    ...Base4,
    parentID: SessionID,
    boundary: session_fork_exports.Boundary,
    instructions: instruction_exports.Values.pipe(optional3),
    instructionEntries: instruction_entry_exports.Snapshot.pipe(optional3)
  }
});
var InboxRef = {
  ...Base4,
  inboxID: session_message_exports.ID
};
var InboxDelivered = event_exports.durable({
  type: "session.inbox.delivered",
  ...options,
  schema: InboxRef
});
var InboxEnqueued = event_exports.durable({
  type: "session.inbox.enqueued",
  ...options,
  schema: {
    ...InboxRef,
    item: session_inbox_exports.Item
  }
});
var InboxCancelled = event_exports.durable({
  type: "session.inbox.cancelled",
  ...options,
  schema: InboxRef
});
var InboxDeliveryChanged = event_exports.durable({
  type: "session.inbox.delivery.changed",
  ...options,
  schema: { ...InboxRef, delivery: session_inbox_exports.Delivery }
});
var Execution;
(function(Execution2) {
  Execution2.Started = event_exports.durable({ type: "session.execution.started", ...options, schema: Base4 });
  Execution2.Succeeded = event_exports.durable({ type: "session.execution.succeeded", ...options, schema: Base4 });
  Execution2.Failed = event_exports.durable({
    type: "session.execution.failed",
    ...options,
    schema: { ...Base4, error: session_error_exports.Error }
  });
  Execution2.Interrupted = event_exports.durable({
    type: "session.execution.interrupted",
    ...options,
    schema: { ...Base4, reason: Schema_exports.Literals(["user", "shutdown", "superseded", "inactivity"]) }
  });
})(Execution || (Execution = {}));
var InstructionsUpdated = event_exports.durable({
  type: "session.instructions.updated",
  durable: {
    aggregate: "sessionID",
    version: 2
  },
  schema: {
    ...Base4,
    delta: instruction_exports.Delta,
    /**
     * The rendered chronological update shown to the model, frozen at emit time.
     * Absent for the initial baseline observation and for deltas that render empty.
     */
    text: Schema_exports.String.pipe(optional3)
  }
});
var Synthetic3 = event_exports.durable({
  type: "session.synthetic",
  ...options,
  schema: {
    ...Base4,
    text: Schema_exports.String,
    description: Schema_exports.String.pipe(optional3),
    metadata: Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown).pipe(optional3)
  }
});
var Skill2;
(function(Skill3) {
  Skill3.Activated = event_exports.durable({
    type: "session.skill.activated",
    ...options,
    schema: {
      ...Base4,
      id: skill_exports.ID,
      name: skill_exports.Name,
      text: Schema_exports.String
    }
  });
})(Skill2 || (Skill2 = {}));
var Shell2;
(function(Shell3) {
  Shell3.Started = event_exports.durable({
    type: "session.shell.started",
    ...options,
    schema: {
      ...Base4,
      shell: shell_exports.Info
    }
  });
  Shell3.Ended = event_exports.durable({
    type: "session.shell.ended",
    ...options,
    schema: {
      ...Base4,
      shell: shell_exports.Info,
      output: shell_exports.Output
    }
  });
})(Shell2 || (Shell2 = {}));
var Step;
(function(Step2) {
  Step2.Started = event_exports.durable({
    type: "session.step.started",
    ...options,
    schema: {
      ...Base4,
      assistantMessageID: session_message_exports.ID,
      agent: agent_exports.ID,
      model: model_exports.Ref,
      snapshot: snapshot_exports.ID.pipe(optional3),
      /** Request dispatch time, before waiting for provider output. */
      started: NonNegativeInt
    }
  });
  Step2.Streamed = event_exports.durable({
    type: "session.step.streamed",
    ...options,
    schema: {
      ...Base4,
      assistantMessageID: session_message_exports.ID
    }
  });
  Step2.Ended = event_exports.durable({
    type: "session.step.ended",
    ...options,
    schema: {
      ...Base4,
      assistantMessageID: session_message_exports.ID,
      finish: FinishReason,
      rawFinish: Schema_exports.String.pipe(optional3),
      providerState: session_message_exports.ProviderState.pipe(optional3),
      cost: money_exports.USD,
      tokens: token_usage_exports.Info,
      snapshot: snapshot_exports.ID.pipe(optional3),
      files: Schema_exports.Array(RelativePath).pipe(optional3)
    }
  });
  Step2.Failed = event_exports.durable({
    type: "session.step.failed",
    ...options,
    schema: {
      ...Base4,
      assistantMessageID: session_message_exports.ID,
      error: session_error_exports.Error,
      finish: Schema_exports.Literals(["content-filter"]).pipe(optional3),
      rawFinish: Schema_exports.String.pipe(optional3),
      providerState: session_message_exports.ProviderState.pipe(optional3),
      cost: money_exports.USD.pipe(optional3),
      tokens: token_usage_exports.Info.pipe(optional3),
      snapshot: snapshot_exports.ID.pipe(optional3),
      files: Schema_exports.Array(RelativePath).pipe(optional3)
    }
  });
})(Step || (Step = {}));
var Text;
(function(Text2) {
  Text2.Started = event_exports.durable({
    type: "session.text.started",
    ...options,
    schema: {
      ...Base4,
      assistantMessageID: session_message_exports.ID,
      ordinal: NonNegativeInt
    }
  });
  Text2.Delta = event_exports.ephemeral({
    type: "session.text.delta",
    schema: {
      ...Base4,
      assistantMessageID: session_message_exports.ID,
      ordinal: NonNegativeInt,
      delta: Schema_exports.String
    }
  });
  Text2.Ended = event_exports.durable({
    type: "session.text.ended",
    ...options,
    schema: {
      ...Base4,
      assistantMessageID: session_message_exports.ID,
      ordinal: NonNegativeInt,
      text: Schema_exports.String,
      state: session_message_exports.ProviderState.pipe(optional3)
    }
  });
})(Text || (Text = {}));
var Reasoning;
(function(Reasoning2) {
  Reasoning2.Started = event_exports.durable({
    type: "session.reasoning.started",
    ...options,
    schema: {
      ...Base4,
      assistantMessageID: session_message_exports.ID,
      ordinal: NonNegativeInt,
      state: session_message_exports.ProviderState.pipe(optional3)
    }
  });
  Reasoning2.Delta = event_exports.ephemeral({
    type: "session.reasoning.delta",
    schema: {
      ...Base4,
      assistantMessageID: session_message_exports.ID,
      ordinal: NonNegativeInt,
      delta: Schema_exports.String
    }
  });
  Reasoning2.Ended = event_exports.durable({
    type: "session.reasoning.ended",
    ...options,
    schema: {
      ...Base4,
      assistantMessageID: session_message_exports.ID,
      ordinal: NonNegativeInt,
      text: Schema_exports.String,
      state: session_message_exports.ProviderState.pipe(optional3)
    }
  });
})(Reasoning || (Reasoning = {}));
var Tool;
(function(Tool2) {
  const ToolBase = {
    ...Base4,
    assistantMessageID: session_message_exports.ID,
    id: Schema_exports.String
  };
  let Input2;
  (function(Input3) {
    Input3.Started = event_exports.durable({
      type: "session.tool.input.started",
      ...options,
      schema: {
        ...ToolBase,
        name: Schema_exports.String
      }
    });
    Input3.Delta = event_exports.ephemeral({
      type: "session.tool.input.delta",
      schema: {
        ...ToolBase,
        delta: Schema_exports.String
      }
    });
    Input3.Ended = event_exports.durable({
      type: "session.tool.input.ended",
      ...options,
      schema: {
        ...ToolBase,
        text: Schema_exports.String
      }
    });
  })(Input2 = Tool2.Input || (Tool2.Input = {}));
  Tool2.Called = event_exports.durable({
    type: "session.tool.called",
    ...options,
    schema: {
      ...ToolBase,
      input: Schema_exports.Record(Schema_exports.String, Schema_exports.Unknown),
      executed: Schema_exports.Boolean,
      state: session_message_exports.ProviderState.pipe(optional3)
    }
  });
  Tool2.Progress = event_exports.ephemeral({
    type: "session.tool.progress",
    schema: {
      ...ToolBase,
      metadata: Schema_exports.Record(Schema_exports.String, Schema_exports.Json)
    }
  });
  Tool2.Success = event_exports.durable({
    type: "session.tool.success",
    durable: {
      aggregate: "sessionID",
      version: 2
    },
    schema: {
      ...ToolBase,
      content: Schema_exports.NonEmptyArray(Content),
      metadata: Schema_exports.Record(Schema_exports.String, Schema_exports.Json).pipe(optional3),
      executed: Schema_exports.Boolean,
      resultState: session_message_exports.ProviderState.pipe(optional3)
    }
  });
  Tool2.Failed = event_exports.durable({
    type: "session.tool.failed",
    durable: {
      aggregate: "sessionID",
      version: 2
    },
    schema: {
      ...ToolBase,
      error: session_error_exports.Error,
      content: Schema_exports.NonEmptyArray(Content).pipe(optional3),
      metadata: Schema_exports.Record(Schema_exports.String, Schema_exports.Json).pipe(optional3),
      executed: Schema_exports.Boolean,
      resultState: session_message_exports.ProviderState.pipe(optional3)
    }
  });
})(Tool || (Tool = {}));
var RetryScheduled = event_exports.durable({
  type: "session.retry.scheduled",
  ...options,
  schema: {
    ...Base4,
    assistantMessageID: session_message_exports.ID,
    attempt: PositiveInt,
    at: NonNegativeInt,
    error: session_error_exports.Error
  }
});
var Compaction4;
(function(Compaction5) {
  Compaction5.Started = event_exports.durable({
    type: "session.compaction.started",
    ...options,
    schema: {
      ...Base4,
      reason: Schema_exports.Literals(["auto", "manual"]),
      recent: Schema_exports.String,
      inputID: session_message_exports.ID.pipe(optional3)
    }
  });
  Compaction5.Delta = event_exports.ephemeral({
    type: "session.compaction.delta",
    schema: {
      ...Base4,
      text: Schema_exports.String
    }
  });
  Compaction5.Ended = event_exports.durable({
    type: "session.compaction.ended",
    ...options,
    schema: {
      ...Base4,
      reason: Compaction5.Started.data.fields.reason,
      model: session_message_exports.CompactionCompleted.fields.model,
      providerState: session_message_exports.CompactionCompleted.fields.providerState,
      providerContext: session_message_exports.CompactionCompleted.fields.providerContext,
      text: Schema_exports.String,
      recent: Schema_exports.String,
      // Repeats the internal `session.usage.recorded` figures: that event never reaches clients, and it
      // stays the accounting source for session totals and stats.
      cost: session_message_exports.CompactionCompleted.fields.cost,
      tokens: session_message_exports.CompactionCompleted.fields.tokens
    }
  });
  Compaction5.Failed = event_exports.durable({
    type: "session.compaction.failed",
    ...options,
    schema: {
      ...Base4,
      reason: Compaction5.Started.data.fields.reason,
      error: session_error_exports.Error,
      inputID: session_message_exports.ID.pipe(optional3),
      cost: session_message_exports.CompactionFailed.fields.cost,
      tokens: session_message_exports.CompactionFailed.fields.tokens
    }
  });
})(Compaction4 || (Compaction4 = {}));
var RevertEvent;
(function(RevertEvent2) {
  RevertEvent2.Staged = event_exports.durable({
    type: "session.revert.staged",
    ...options,
    schema: { ...Base4, revert: Revert }
  });
  RevertEvent2.Cleared = event_exports.durable({ type: "session.revert.cleared", ...options, schema: Base4 });
  RevertEvent2.Committed = event_exports.durable({
    type: "session.revert.committed",
    ...options,
    schema: { ...Base4, to: session_message_exports.ID }
  });
})(RevertEvent || (RevertEvent = {}));
var Definitions = event_exports.inventory(Created4, AgentSelected2, ModelSelected2, Moved, Renamed, MetadataUpdated, Permissions, Viewed, UsageUpdated, Deleted3, Forked, InboxDelivered, InboxEnqueued, InboxCancelled, InboxDeliveryChanged, Execution.Started, Execution.Succeeded, Execution.Failed, Execution.Interrupted, InstructionsUpdated, Synthetic3, Skill2.Activated, Shell2.Started, Shell2.Ended, Step.Started, Step.Streamed, Step.Ended, Step.Failed, Text.Started, Text.Delta, Text.Ended, Reasoning.Started, Reasoning.Delta, Reasoning.Ended, Tool.Input.Started, Tool.Input.Delta, Tool.Input.Ended, Tool.Called, Tool.Progress, Tool.Success, Tool.Failed, RetryScheduled, Compaction4.Started, Compaction4.Delta, Compaction4.Ended, Compaction4.Failed, RevertEvent.Staged, RevertEvent.Cleared, RevertEvent.Committed);
var DurableDefinitions = event_exports.inventory(...Definitions.filter((definition) => definition.durability === "durable"), UsageRecorded, MessageContentUpdated);
var EphemeralDefinitions = event_exports.inventory(...Definitions.filter((definition) => definition.durability === "ephemeral"));
var Durable = Schema_exports.Union(DurableDefinitions, { mode: "oneOf" }).pipe(Schema_exports.toTaggedUnion("type")).annotate({ identifier: "Session.Event.Durable" });
var All = Schema_exports.Union([Durable, ...EphemeralDefinitions], { mode: "oneOf" }).pipe(Schema_exports.toTaggedUnion("type"));

// node_modules/@opencode/schema/dist/session.js
var ID15 = SessionID;
var Metadata3 = SessionMetadata;
var Event13 = session_event_exports;
var ForkBoundary = session_fork_exports.Boundary;
var Info19 = Schema_exports.Struct({
  id: ID15,
  parentID: ID15.pipe(optional3),
  fork: Schema_exports.Struct({
    sessionID: ID15,
    boundary: ForkBoundary
  }).pipe(optional3),
  projectID: project_exports.ID,
  agent: agent_exports.ID.pipe(optional3),
  model: model_exports.Ref.pipe(optional3),
  cost: money_exports.USD,
  tokens: token_usage_exports.Info,
  /** Outcome of the last completed execution, recorded at `time.idle`. Absent until a run reaches a terminal transition. */
  outcome: Schema_exports.Literals(["succeeded", "failed", "interrupted"]).pipe(optional3),
  time: Schema_exports.Struct({
    created: DateTimeUtcFromMillis2,
    updated: DateTimeUtcFromMillis2,
    idle: DateTimeUtcFromMillis2.pipe(optional3),
    viewed: DateTimeUtcFromMillis2.pipe(optional3),
    archived: DateTimeUtcFromMillis2.pipe(optional3)
  }),
  title: Schema_exports.String.pipe(optional3),
  location: location_exports.Ref,
  subpath: RelativePath.pipe(optional3),
  metadata: Metadata3.pipe(optional3),
  /** Evaluated after the agent's rules; the last matching rule wins. */
  permissions: permission_exports.Ruleset.pipe(optional3),
  revert: Revert.pipe(optional3)
}).annotate({ identifier: "Session.Info" });
var ListAnchor = Schema_exports.Struct({
  id: ID15,
  time: Schema_exports.Finite,
  direction: Schema_exports.Literals(["previous", "next"])
}).annotate({ identifier: "Session.ListAnchor" });

// node_modules/@opencode/schema/dist/persistent-pty.js
var Info20 = Schema_exports.Struct({
  ...pty_exports.Info.fields,
  sessionID: session_exports.ID,
  foregroundProcess: Schema_exports.NullOr(Schema_exports.String),
  size: Schema_exports.Struct({ cols: PositiveInt, rows: PositiveInt }),
  output: Schema_exports.Struct({ head: NonNegativeInt, tail: NonNegativeInt })
}).annotate({ identifier: "PersistentPty.Info" });
var Handoff = Schema_exports.Struct({
  directory: Schema_exports.String,
  instanceID: Schema_exports.String,
  ticket: Schema_exports.String,
  expiresAt: Schema_exports.Number
}).annotate({ identifier: "PersistentPty.Handoff" });
var CreateInput4 = Schema_exports.Struct({
  command: optional3(Schema_exports.String),
  args: Schema_exports.Array(Schema_exports.String),
  cwd: optional3(Schema_exports.String),
  title: Schema_exports.String,
  env: Schema_exports.Record(Schema_exports.String, Schema_exports.String),
  size: optional3(Schema_exports.Struct({ cols: PositiveInt, rows: PositiveInt }))
}).annotate({ identifier: "PersistentPty.CreateInput" });
var UpdateInput3 = Schema_exports.Struct({
  attachmentID: optional3(Schema_exports.String),
  size: Schema_exports.Struct({ cols: PositiveInt, rows: PositiveInt })
}).annotate({ identifier: "PersistentPty.UpdateInput" });
var Snapshot2 = Schema_exports.Struct({
  info: Info20,
  text: Schema_exports.String,
  checkpoint: Schema_exports.Uint8Array,
  cursor: Schema_exports.Struct({ x: NonNegativeInt, y: NonNegativeInt })
}).annotate({ identifier: "PersistentPty.Snapshot" });
var ReadLines = PositiveInt.check(Schema_exports.isLessThanOrEqualTo(65535)).annotate({
  identifier: "PersistentPty.ReadLines"
});
var ReadResult = Schema_exports.Struct({
  ptyID: pty_exports.ID,
  title: Schema_exports.String,
  cwd: Schema_exports.String,
  foregroundProcess: Schema_exports.NullOr(Schema_exports.String),
  screen: Schema_exports.Struct({
    text: Schema_exports.String,
    cols: PositiveInt,
    rows: PositiveInt,
    cursor: Snapshot2.fields.cursor
  })
}).annotate({ identifier: "PersistentPty.ReadResult" });
var Added = ephemeral({ type: "persistent-pty.added", schema: { sessionID: session_exports.ID, terminal: Info20 } });
var Removed2 = ephemeral({ type: "persistent-pty.removed", schema: { sessionID: session_exports.ID, ptyID: pty_exports.ID } });
var Event14 = { Added, Removed: Removed2, Definitions: inventory(Added, Removed2) };

// node_modules/@opencode/schema/dist/reference.js
var Updated10 = ephemeral({ type: "reference.updated", schema: {} });
var Event15 = { Updated: Updated10, Definitions: inventory(Updated10) };
var LocalSource = Schema_exports.Struct({
  type: Schema_exports.Literal("local"),
  path: AbsolutePath,
  description: Schema_exports.String.pipe(optional3),
  hidden: Schema_exports.Boolean.pipe(optional3)
}).annotate({ identifier: "Reference.LocalSource" });
var GitSource = Schema_exports.Struct({
  type: Schema_exports.Literal("git"),
  repository: Schema_exports.String,
  branch: Schema_exports.String.pipe(optional3),
  description: Schema_exports.String.pipe(optional3),
  hidden: Schema_exports.Boolean.pipe(optional3)
}).annotate({ identifier: "Reference.GitSource" });
var Source4 = Schema_exports.Union([LocalSource, GitSource]).pipe(Schema_exports.toTaggedUnion("type")).annotate({ identifier: "Reference.Source" });
var Info21 = Schema_exports.Struct({
  name: Schema_exports.String,
  path: AbsolutePath,
  description: Schema_exports.String.pipe(optional3),
  hidden: Schema_exports.Boolean.pipe(optional3),
  source: Source4
}).annotate({ identifier: "Reference.Info" });

// node_modules/@opencode/schema/dist/vcs.js
var Branch = Schema_exports.Struct({
  current: optional3(Schema_exports.String),
  default: optional3(Schema_exports.String)
}).annotate({ identifier: "Vcs.Branch" });
var Info22 = Schema_exports.Struct({
  provider: optional3(Schema_exports.String),
  branch: Branch
}).annotate({ identifier: "Vcs.Info" });
var BranchList = Schema_exports.Array(Schema_exports.String).annotate({ identifier: "Vcs.BranchList" });
var Base5 = Schema_exports.Struct({
  name: Schema_exports.String,
  ref: Schema_exports.String,
  source: Schema_exports.Literals(["reflog", "default"])
}).annotate({ identifier: "Vcs.Base" });
var Mode = Schema_exports.Literals(["working", "branch", "committed"]).annotate({ identifier: "Vcs.Mode" });
var FileStatus = Schema_exports.Struct({
  file: Schema_exports.String,
  additions: NonNegativeInt,
  deletions: NonNegativeInt,
  status: Schema_exports.Literals(["added", "deleted", "modified"])
}).annotate({ identifier: "Vcs.FileStatus" });

// node_modules/@opencode/schema/dist/websearch.js
var ID16 = Schema_exports.String.pipe(Schema_exports.brand("WebSearch.ID"));
var Provider = Schema_exports.Struct({
  id: ID16,
  name: Schema_exports.String
}).annotate({ identifier: "WebSearch.Provider" });
var Input = Schema_exports.Struct({
  query: Schema_exports.String,
  providerID: ID16.pipe(optional3)
}).annotate({ identifier: "WebSearch.Input" });
var Result2 = Schema_exports.Struct({
  url: Schema_exports.String,
  title: Schema_exports.String.pipe(optional3),
  content: Schema_exports.String.pipe(optional3),
  time: Schema_exports.Struct({
    published: Schema_exports.Finite.pipe(optional3).annotate({
      description: "Publication time in milliseconds since the Unix epoch"
    })
  })
}).annotate({ identifier: "WebSearch.Result" });
var Response = class extends Schema_exports.Class("WebSearch.Response")({
  providerID: ID16,
  results: Schema_exports.Array(Result2)
}) {
};
var Updated11 = ephemeral({
  type: "websearch.updated",
  schema: {}
});
var Event16 = { Updated: Updated11, Definitions: inventory(Updated11) };

// node_modules/@opencode/schema/dist/worktree.js
var StrategyID = Schema_exports.Trim.pipe(Schema_exports.check(Schema_exports.isNonEmpty()), Schema_exports.brand("Worktree.StrategyID"));
var CreateInput5 = Schema_exports.Struct({
  projectID: project_exports.ID,
  from: optional3(AbsolutePath),
  branch: optional3(Schema_exports.Trim.pipe(Schema_exports.check(Schema_exports.isNonEmpty()))),
  directory: optional3(AbsolutePath).annotate({
    description: "Parent directory for the new worktree. Uses the project's canonical configuration, then defaults to the server's data directory under worktree/<first six project ID characters>."
  }),
  name: optional3(Schema_exports.String)
}).annotate({ identifier: "Worktree.CreateInput" });
var RemoveInput = Schema_exports.Struct({
  projectID: project_exports.ID,
  directory: AbsolutePath,
  force: Schema_exports.Boolean
}).annotate({ identifier: "Worktree.RemoveInput" });
var Info23 = Schema_exports.Struct({
  directory: AbsolutePath
}).annotate({ identifier: "Worktree.Info" });
var Directory = Schema_exports.Struct({
  directory: AbsolutePath,
  strategy: optional3(Schema_exports.String)
}).annotate({ identifier: "Worktree.Directory" });
var ListEntry = Schema_exports.Struct({
  directory: AbsolutePath,
  type: Schema_exports.Literals(["root", "worktree"])
}).annotate({ identifier: "Worktree.ListEntry" });
var OperationError = class extends Schema_exports.TaggedError()("Worktree.OperationError", {
  message: Schema_exports.String,
  forceRequired: optional3(Schema_exports.Boolean)
}) {
};
var List = Schema_exports.Array(Directory).annotate({ identifier: "Worktree.List" });
var Updated12 = ephemeral({
  type: "worktree.updated",
  schema: { projectID: project_exports.ID }
});
var Resolved = durable({
  type: "worktree.resolved",
  durable: { aggregate: "projectID", version: 1 },
  schema: {
    projectID: project_exports.ID,
    directory: AbsolutePath,
    previous: project_exports.ID,
    adopted: optional3(Schema_exports.Array(project_exports.ID))
  }
});
var Event17 = { Updated: Updated12, Resolved, Definitions: inventory(Updated12, Resolved) };

// src/index.ts
import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, unlinkSync } from "fs";
import { basename, dirname, join as join2, resolve as resolvePath } from "path";
import { homedir, platform } from "os";
import { execFileSync, execSync, spawn } from "child_process";
import { fileURLToPath } from "url";
var OPENCODE_CONFIG = join2(homedir(), ".config", "opencode");
var LEGACY_JOBS_DIR = join2(OPENCODE_CONFIG, "jobs");
var LOGS_DIR = join2(OPENCODE_CONFIG, "logs");
var SCHEDULER_DIR = join2(OPENCODE_CONFIG, "scheduler");
var SCOPES_DIR = join2(SCHEDULER_DIR, "scopes");
var SUPERVISOR_PATH = join2(SCHEDULER_DIR, "supervisor.pl");
var SCHEDULER_CONFIG = join2(OPENCODE_CONFIG, "opencode-scheduler.json");
var IS_MAC = platform() === "darwin";
var IS_LINUX = platform() === "linux";
var IS_WINDOWS = platform() === "win32";
var LAUNCH_AGENTS_DIR = join2(homedir(), "Library", "LaunchAgents");
var LAUNCHD_PREFIX = "com.opencode.job";
var SYSTEMD_USER_DIR = join2(homedir(), ".config", "systemd", "user");
var WINDOWS_TASK_ROOT = "\\OpenCode";
var WINDOWS_TASK_PREFIX = "opencode-job";
var CRON_MANAGED_PREFIX = "opencode-scheduler";
function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function normalizeWorkdirPath(input) {
  const trimmed = input.trim();
  if (!trimmed) return homedir();
  return resolvePath(trimmed);
}
function fnv1a64(input) {
  let hash2 = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const data = Buffer.from(input, "utf8");
  for (const byte of data) {
    hash2 ^= BigInt(byte);
    hash2 = hash2 * prime & 0xffffffffffffffffn;
  }
  return hash2;
}
function fnv1a64Hex(input) {
  return fnv1a64(input).toString(16).padStart(16, "0");
}
function deriveScopeId(workdir) {
  const normalized = normalizeWorkdirPath(workdir);
  const base2 = slugify(basename(normalized)) || "workspace";
  const suffix = fnv1a64Hex(normalized).slice(0, 12);
  return `${base2}-${suffix}`;
}
function scopeDir(scopeId) {
  return join2(SCOPES_DIR, scopeId);
}
function scopeJobsDir(scopeId) {
  return join2(scopeDir(scopeId), "jobs");
}
function scopeLocksDir(scopeId) {
  return join2(scopeDir(scopeId), "locks");
}
function scopeRunsDir(scopeId) {
  return join2(scopeDir(scopeId), "runs");
}
function scopeLogsDir(scopeId) {
  return join2(LOGS_DIR, "scheduler", scopeId);
}
function jobFilePath(scopeId, slug) {
  return join2(scopeJobsDir(scopeId), `${slug}.json`);
}
function scopedLogPath(scopeId, slug) {
  return join2(scopeLogsDir(scopeId), `${slug}.log`);
}
var DEFAULT_WORKDIR = process.cwd();
function defaultWorkdir() {
  return DEFAULT_WORKDIR;
}
function currentScopeId() {
  return deriveScopeId(defaultWorkdir());
}
var SUPERVISOR_SCRIPT = `#!/usr/bin/perl
use strict;
use warnings;
use JSON::PP;
use File::Basename qw(dirname);
use File::Path qw(make_path);
use POSIX qw(setsid strftime);
use Time::HiRes qw(time);

# opencode-scheduler supervisor v1

sub iso_now {
  my @t = localtime(time());
  return strftime("%Y-%m-%dT%H:%M:%S%z", @t);
}

sub read_json {
  my ($path) = @_;
  open my $fh, "<", $path or die "Failed to read $path: $!
";
  local $/;
  my $raw = <$fh>;
  close $fh;
  my $json = JSON::PP->new->utf8->relaxed;
  return $json->decode($raw);
}

sub write_json_atomic {
  my ($path, $data) = @_;
  my $tmp = "$path.tmp.$$";
  my $json = JSON::PP->new->utf8->canonical;
  open my $fh, ">", $tmp or die "Failed to write $tmp: $!
";
  print $fh $json->encode($data);
  close $fh or die "Failed to close $tmp: $!
";
  rename $tmp, $path or die "Failed to rename $tmp -> $path: $!
";
}

sub append_jsonl {
  my ($path, $data) = @_;
  my $json = JSON::PP->new->utf8->canonical;
  open my $fh, ">>", $path or die "Failed to append $path: $!
";
  print $fh $json->encode($data) . "
";
  close $fh;
}

sub pid_alive {
  my ($pid) = @_;
  return 0 if !$pid;
  return kill 0, $pid;
}

sub random_id {
  my $n = int(rand(1_000_000_000));
  return sprintf("%09d", $n);
}

my $job_path = shift @ARGV;
if (!$job_path) { die "usage: supervisor.pl <job.json>
"; }

my $job = read_json($job_path);
my $scope_id = $job->{scopeId} || "";
my $slug = $job->{slug} || "";
if (!$scope_id || !$slug) { die "job missing scopeId/slug
"; }

my $home = $ENV{HOME} || "";
if (!$home) { die "HOME is not set
"; }

my $config_root = "$home/.config/opencode";
my $scheduler_root = "$config_root/scheduler/scopes/$scope_id";
my $locks_dir = "$scheduler_root/locks";
my $runs_dir = "$scheduler_root/runs";
my $logs_dir = "$config_root/logs/scheduler/$scope_id";

make_path($locks_dir);
make_path($runs_dir);
make_path($logs_dir);

my $log_path = "$logs_dir/$slug.log";
open STDOUT, ">>", $log_path or die "Failed to open log $log_path: $!
";
open STDERR, ">&STDOUT" or die "Failed to dup stderr: $!
";
select STDOUT; $| = 1;
select STDERR; $| = 1;

my $lock_path = "$locks_dir/$slug.json";
if (-e $lock_path) {
  my $lock = eval { read_json($lock_path) };
  my $pid = ($lock && ref($lock) eq 'HASH') ? ($lock->{pid} || 0) : 0;
  if (pid_alive($pid)) {
    my $now = iso_now();
    print "
=== Scheduled run skipped (already running pid=$pid) $now ===
";
    exit 0;
  }
  unlink $lock_path;
}

my $run_id = time() . "-" . random_id();
my $started_at = iso_now();
my $t0 = time();

write_json_atomic($lock_path, { pid => $$, startedAt => $started_at, runId => $run_id });

# Update job metadata: running
$job->{lastRunAt} = $started_at;
$job->{lastRunSource} = "scheduled";
$job->{lastRunStatus} = "running";
delete $job->{lastRunExitCode};
delete $job->{lastRunError};
$job->{updatedAt} = $started_at;
write_json_atomic($job_path, $job);

# Force non-interactive scheduled runs
my $perm = { question => "deny" };
if ($ENV{OPENCODE_PERMISSION}) {
  my $existing = eval { JSON::PP->new->decode($ENV{OPENCODE_PERMISSION}) };
  if ($existing && ref($existing) eq 'HASH') {
    $perm = { %$existing, %$perm };
  }
}
$ENV{OPENCODE_PERMISSION} = JSON::PP->new->canonical->encode($perm);
$ENV{OPENCODE_SCHEDULER_RUN_ID} = $run_id;

print "
=== Scheduled run $started_at runId=$run_id ===
";

my $inv = $job->{invocation};
if (!$inv || ref($inv) ne 'HASH' || !$inv->{command} || ref($inv->{args}) ne 'ARRAY') {
  my $now = iso_now();
  print "
=== Supervisor error $now: job missing invocation.command/args ===
";
  $job->{lastRunStatus} = "failed";
  $job->{lastRunError} = "job missing invocation";
  $job->{updatedAt} = $now;
  write_json_atomic($job_path, $job);
  unlink $lock_path;
  exit 1;
}

my $command = $inv->{command};
my @args = @{ $inv->{args} };

my $workdir = $job->{workdir} || $home;

my $timeout = $job->{timeoutSeconds};
$timeout = undef if defined($timeout) && $timeout !~ /^\\d+$/;

my $timed_out = 0;
my $child_pid = fork();
if (!defined $child_pid) {
  my $now = iso_now();
  print "
=== Supervisor error $now: fork failed: $! ===
";
  $job->{lastRunStatus} = "failed";
  $job->{lastRunError} = "fork failed";
  $job->{updatedAt} = $now;
  write_json_atomic($job_path, $job);
  unlink $lock_path;
  exit 1;
}

if ($child_pid == 0) {
  chdir $workdir or die "Failed to chdir to $workdir: $!
";
  eval { setsid(); };
  exec { $command } $command, @args;
  die "Failed to exec $command: $!
";
}

if (defined($timeout) && $timeout > 0) {
  local $SIG{ALRM} = sub {
    $timed_out = 1;
    my $now = iso_now();
    print "
=== Timeout after $timeout seconds $now; sending SIGTERM ===
";
    kill 'TERM', -$child_pid;
    sleep 5;
    print "
=== Forcing SIGKILL $now ===
";
    kill 'KILL', -$child_pid;
  };
  alarm($timeout);
}

my $waited = waitpid($child_pid, 0);
my $status = $?;
alarm(0);

my $finished_at = iso_now();
my $duration_ms = int((time() - $t0) * 1000);
my $exit_code = ($status >> 8);
if ($timed_out) {
  $exit_code = 124;
}

my $final_status = "failed";
my $final_error = undef;
if ($timed_out) {
  $final_status = "failed";
  $final_error = "timeout";
} elsif ($waited != $child_pid) {
  $final_status = "failed";
  $final_error = "waitpid failed";
} elsif ($status == 0) {
  $final_status = "success";
} else {
  $final_status = "failed";
  $final_error = "exit code $exit_code";
}

$job->{lastRunStatus} = $final_status;
$job->{lastRunExitCode} = $exit_code;
$job->{lastRunError} = $final_error if defined $final_error;
$job->{updatedAt} = $finished_at;
write_json_atomic($job_path, $job);

append_jsonl("$runs_dir/$slug.jsonl", {
  runId => $run_id,
  scopeId => $scope_id,
  slug => $slug,
  startedAt => $started_at,
  finishedAt => $finished_at,
  durationMs => $duration_ms,
  status => $final_status,
  exitCode => $exit_code,
  error => $final_error,
  pid => $child_pid,
  logPath => $log_path,
});

unlink $lock_path;
print "
=== Finished $finished_at status=$final_status exitCode=$exit_code durationMs=$duration_ms ===
";
exit($exit_code);
`;
function ensureSupervisorScript() {
  ensureDir(SCHEDULER_DIR);
  writeFileSync(SUPERVISOR_PATH, SUPERVISOR_SCRIPT);
}
function normalizeFormat(format5) {
  return format5 === "json" ? "json" : "text";
}
function formatToolResult(format5, result3) {
  return format5 === "json" ? JSON.stringify(result3, null, 2) : result3.output;
}
function okResult(format5, output, data) {
  return formatToolResult(format5, { success: true, output, shouldContinue: false, data });
}
function errorResult(format5, output, data) {
  return formatToolResult(format5, { success: false, output, shouldContinue: true, data });
}
var SCHEDULED_JOB_BEST_PRACTICES_SKILL = {
  name: "scheduled-job-best-practices",
  description: "Patterns for resilient, non-interactive scheduled opencode jobs",
  suggestedPath: ".opencode/skill/scheduled-job-best-practices/SKILL.md",
  files: {
    "SKILL.md": `---
name: scheduled-job-best-practices
description: Patterns for resilient, non-interactive scheduled opencode jobs
---

## Use This Skill

Put this line at the very top of any scheduled job prompt:

@scheduled-job-best-practices

Then write your task below it.

## Core Principles

1. **No magic injection.** Do not assume placeholders like __TODAY__ exist. Compute runtime values using tools (bash) during the run.
2. **Non-interactive.** Scheduled jobs must not rely on QR codes, manual logins, or confirmation dialogs.
3. **Idempotent.** Make reruns safe (maintain a seen/state file; avoid duplicate messages).
4. **Observable.** Print a short summary at the end with status + outputs.
5. **Minimal side effects.** Write durable artifacts under outputs/ in the job workdir.

## Runtime Values: Dates

If you need local dates, compute them at runtime.

### macOS

~~~bash
TODAY="$(date +%F)"
TOMORROW="$(date -v+1d +%F)"
~~~

### Linux

~~~bash
TODAY="$(date +%F)"
TOMORROW="$(date -d 'tomorrow' +%F)"
~~~

### Portable snippet

~~~bash
if [ "$(uname)" = "Darwin" ]; then
  TODAY="$(date +%F)"
  TOMORROW="$(date -v+1d +%F)"
else
  TODAY="$(date +%F)"
  TOMORROW="$(date -d 'tomorrow' +%F)"
fi
~~~

If timezone matters, set TZ explicitly (example: TZ=America/Los_Angeles date +%F).

## Preflight Checklist

Before doing any expensive work:

- Confirm required tools are available (browser, network, etc).
- Confirm required env vars exist (source .env only if needed).
- If a dependency is missing/offline, stop early and emit a single concise reason.

## Notifications (Telegram)

Prefer the Telegram Bot API (non-interactive) over web.telegram.org.

## Output Contract

End every run with a compact summary:

- Status: success | skipped | failed
- Reason (1 line)
- Outputs written (paths)
- Notifications sent (message_id, chat_id) if applicable

## Idempotency Pattern

When notifying about \u201Cnew\u201D items (deals, alerts, etc.):

- Store a seen list in outputs/<job>/seen.json
- Only notify on items not in seen.json
- Update seen.json after sending
`
  }
};
var BUILTIN_SKILLS = {
  [SCHEDULED_JOB_BEST_PRACTICES_SKILL.name]: SCHEDULED_JOB_BEST_PRACTICES_SKILL
};
var SKILL_ALIASES = {
  "job-best-practices": SCHEDULED_JOB_BEST_PRACTICES_SKILL.name,
  "scheduled-jobs": SCHEDULED_JOB_BEST_PRACTICES_SKILL.name,
  scheduler: SCHEDULED_JOB_BEST_PRACTICES_SKILL.name
};
function normalizeSkillName(name) {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return SCHEDULED_JOB_BEST_PRACTICES_SKILL.name;
  return SKILL_ALIASES[trimmed] ?? trimmed;
}
function getBuiltinSkill(name) {
  return BUILTIN_SKILLS[normalizeSkillName(name)];
}
function listBuiltinSkills() {
  return Object.values(BUILTIN_SKILLS);
}
function installBuiltinSkill(skill, rootDir, overwrite = false) {
  const installRoot = rootDir.trim();
  if (!installRoot) {
    throw new Error("Install directory cannot be empty.");
  }
  if (!existsSync(installRoot)) {
    throw new Error(`Directory not found: ${installRoot}`);
  }
  const relativeDir = dirname(skill.suggestedPath);
  const installDir = join2(installRoot, relativeDir);
  ensureDir(installDir);
  const files = [];
  for (const [filename, content] of Object.entries(skill.files)) {
    const targetPath = join2(installDir, filename);
    if (existsSync(targetPath) && !overwrite) {
      throw new Error(`File already exists: ${targetPath} (pass overwrite=true to replace)`);
    }
    writeFileSync(targetPath, `${content.trimEnd()}
`);
    files.push(targetPath);
  }
  return { directory: installDir, files };
}
function loadPackageInfo() {
  const fallback = { name: "opencode-scheduler", version: "unknown" };
  try {
    const packagePath = join2(dirname(fileURLToPath(import.meta.url)), "..", "package.json");
    const raw = readFileSync(packagePath, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      name: typeof parsed.name === "string" ? parsed.name : fallback.name,
      version: typeof parsed.version === "string" ? parsed.version : fallback.version
    };
  } catch {
    return fallback;
  }
}
function findOpencode() {
  const override = process.env.OPENCODE_SCHEDULER_OPENCODE_PATH?.trim();
  if (override) return override;
  try {
    const resolved = execSync("command -v opencode", {
      env: { ...process.env, PATH: getEnhancedPath() + ":" + (process.env.PATH ?? "") },
      stdio: ["ignore", "pipe", "ignore"]
    }).toString().trim();
    if (resolved) {
      if (resolved.includes("/")) return resolved;
      return "opencode";
    }
  } catch {
  }
  const paths = [
    "/opt/homebrew/bin/opencode",
    "/usr/local/bin/opencode",
    join2(homedir(), ".opencode", "bin", "opencode")
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      return p;
    }
  }
  return "opencode";
}
function getEnhancedPath() {
  const paths = [
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin"
  ];
  return paths.join(":");
}
function splitCronExpression(cron) {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Invalid cron: ${cron}`);
  }
  return parts;
}
function uniqueSorted(values2) {
  return Array.from(new Set(values2)).sort((a, b) => a - b);
}
function parseCronField(field, min6, max6, label, allowSundaySeven = false) {
  if (field === "*") return null;
  if (field.startsWith("*/")) {
    const step = parseInt(field.slice(2), 10);
    if (!Number.isFinite(step) || step <= 0) {
      throw new Error(`Invalid cron ${label} step: ${field}`);
    }
    const values2 = [];
    for (let value3 = min6; value3 <= max6; value3 += step) {
      values2.push(value3);
    }
    return values2;
  }
  const parts = field.split(",");
  if (parts.length > 1) {
    const values2 = parts.map((part) => parseCronNumber(part, min6, max6, label, allowSundaySeven));
    return uniqueSorted(values2);
  }
  if (/^\d+$/.test(field)) {
    return [parseCronNumber(field, min6, max6, label, allowSundaySeven)];
  }
  throw new Error(`Invalid cron ${label} field: ${field}`);
}
function parseCronNumber(value3, min6, max6, label, allowSundaySeven) {
  const parsed = parseInt(value3, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid cron ${label} value: ${value3}`);
  }
  const normalized = allowSundaySeven && parsed === 7 ? 0 : parsed;
  if (normalized < min6 || normalized > max6) {
    throw new Error(`Invalid cron ${label} value: ${value3}`);
  }
  return normalized;
}
function validateCronExpression(cron) {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = splitCronExpression(cron);
  parseCronField(minute, 0, 59, "minute");
  parseCronField(hour, 0, 23, "hour");
  parseCronField(dayOfMonth, 1, 31, "day of month");
  parseCronField(month, 1, 12, "month");
  parseCronField(dayOfWeek, 0, 7, "day of week", true);
}
function expandLaunchdEntries(entries3, key, values2) {
  if (!values2) return entries3;
  const expanded = [];
  for (const entry of entries3) {
    for (const value3 of values2) {
      expanded.push({ ...entry, [key]: value3 });
    }
  }
  return expanded;
}
function buildLaunchdCalendars(minuteValues, hourValues, dayValues, monthValues, weekdayValues) {
  let entries3 = [{}];
  entries3 = expandLaunchdEntries(entries3, "Minute", minuteValues);
  entries3 = expandLaunchdEntries(entries3, "Hour", hourValues);
  entries3 = expandLaunchdEntries(entries3, "Day", dayValues);
  entries3 = expandLaunchdEntries(entries3, "Month", monthValues);
  entries3 = expandLaunchdEntries(entries3, "Weekday", weekdayValues);
  return entries3;
}
function cronToLaunchdCalendars(cron) {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = splitCronExpression(cron);
  const minuteValues = parseCronField(minute, 0, 59, "minute");
  const hourValues = parseCronField(hour, 0, 23, "hour");
  const dayValues = parseCronField(dayOfMonth, 1, 31, "day of month");
  const monthValues = parseCronField(month, 1, 12, "month");
  const weekdayValues = parseCronField(dayOfWeek, 0, 7, "day of week", true);
  if (dayValues && weekdayValues) {
    return [
      ...buildLaunchdCalendars(minuteValues, hourValues, dayValues, monthValues, null),
      ...buildLaunchdCalendars(minuteValues, hourValues, null, monthValues, weekdayValues)
    ];
  }
  return buildLaunchdCalendars(minuteValues, hourValues, dayValues, monthValues, weekdayValues);
}
function escapePlistString(value3) {
  return value3.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeSystemdArg(value3) {
  return value3.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function renderLaunchdCalendar(calendar) {
  return Object.entries(calendar).map(([key, value3]) => `    <key>${key}</key>
    <integer>${value3}</integer>`).join("\n");
}
var SYSTEMD_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function formatSystemdValue(value3, size6) {
  return value3.toString().padStart(size6, "0");
}
function cronToSystemdCalendars(cron) {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = splitCronExpression(cron);
  const minuteValues = parseCronField(minute, 0, 59, "minute");
  const hourValues = parseCronField(hour, 0, 23, "hour");
  const dayValues = parseCronField(dayOfMonth, 1, 31, "day of month");
  const monthValues = parseCronField(month, 1, 12, "month");
  const weekdayValues = parseCronField(dayOfWeek, 0, 7, "day of week", true);
  const minutes2 = minuteValues ? minuteValues.map((value3) => formatSystemdValue(value3, 2)) : ["*"];
  const hours2 = hourValues ? hourValues.map((value3) => formatSystemdValue(value3, 2)) : ["*"];
  const days2 = dayValues ? dayValues.map((value3) => formatSystemdValue(value3, 2)) : ["*"];
  const months = monthValues ? monthValues.map((value3) => formatSystemdValue(value3, 2)) : ["*"];
  const weekdays = weekdayValues ? weekdayValues.map((value3) => SYSTEMD_WEEKDAYS[value3] ?? "*") : ["*"];
  const calendars = [];
  const buildCalendars = (domValues, dowValues) => {
    for (const minuteValue of minutes2) {
      for (const hourValue of hours2) {
        for (const domValue of domValues) {
          for (const monthValue of months) {
            for (const dowValue of dowValues) {
              calendars.push(`${dowValue} *-${monthValue}-${domValue} ${hourValue}:${minuteValue}:00`);
            }
          }
        }
      }
    }
  };
  if (dayValues && weekdayValues) {
    buildCalendars(days2, ["*"]);
    buildCalendars(["*"], weekdays);
  } else {
    buildCalendars(days2, weekdays);
  }
  return calendars;
}
var WINDOWS_WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
var WINDOWS_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
function pad2(value3) {
  return value3.toString().padStart(2, "0");
}
function formatStartTime(hour, minute) {
  return `${pad2(hour)}:${pad2(minute)}`;
}
function windowsTaskBaseName(job) {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  return `${WINDOWS_TASK_PREFIX}-${scopeId}-${job.slug}`;
}
function windowsTaskName(baseName, index2, total2) {
  const suffix = total2 > 1 ? `-${index2 + 1}` : "";
  return `${WINDOWS_TASK_ROOT}\\${baseName}${suffix}`;
}
function quoteWindowsArg(value3) {
  if (!/[\s"]/u.test(value3)) return value3;
  return `"${value3.replace(/"/g, '""')}"`;
}
function getWindowsInvocation(job) {
  const invocation = job.invocation ?? buildOpencodeArgs(job);
  return invocation;
}
function buildWindowsTaskCommand(job) {
  const invocation = getWindowsInvocation(job);
  return [invocation.command, ...invocation.args].map((arg) => quoteWindowsArg(arg)).join(" ");
}
function maybeStep(field) {
  const match8 = field.match(/^\*\/(\d+)$/);
  if (!match8) return null;
  const step = parseInt(match8[1], 10);
  return Number.isFinite(step) && step > 0 ? step : null;
}
function ensureWindowsRepresentable(cron) {
  const [minuteField, hourField, dayField, monthField, weekdayField] = splitCronExpression(cron);
  const minuteStep = maybeStep(minuteField);
  const hourStep = maybeStep(hourField);
  if (minuteField === "*" && hourField === "*" && dayField === "*" && monthField === "*" && weekdayField === "*") {
    return [{ schedule: "MINUTE", modifier: "1", startTime: "00:00" }];
  }
  if (minuteStep !== null && hourField === "*" && dayField === "*" && monthField === "*" && weekdayField === "*") {
    if (minuteStep > 1439) {
      throw new Error(
        `Windows Task Scheduler supports at most every 1439 minutes. Use ${minuteStep} with a smaller value or switch to an hourly/daily cron.`
      );
    }
    return [{ schedule: "MINUTE", modifier: String(minuteStep), startTime: "00:00" }];
  }
  const minuteValues = parseCronField(minuteField, 0, 59, "minute");
  const hourValues = parseCronField(hourField, 0, 23, "hour");
  const dayValues = parseCronField(dayField, 1, 31, "day of month");
  const monthValues = parseCronField(monthField, 1, 12, "month");
  const weekdayValues = parseCronField(weekdayField, 0, 7, "day of week", true);
  if (hourStep !== null && minuteValues && minuteValues.length === 1 && dayField === "*" && monthField === "*" && weekdayField === "*") {
    return [{ schedule: "HOURLY", modifier: String(hourStep), startTime: formatStartTime(0, minuteValues[0]) }];
  }
  if (!minuteValues || minuteValues.length === 0 || !hourValues || hourValues.length === 0) {
    throw new Error(
      "Windows Task Scheduler requires explicit minute and hour values for this cron expression. Use formats like '0 9 * * *', '30 8 * * 1', '*/15 * * * *', or '0 */6 * * *'."
    );
  }
  if (monthValues && weekdayValues) {
    throw new Error(
      "Windows Task Scheduler cannot combine specific months with day-of-week constraints in cron. Split this into multiple jobs (for example: one monthly job and one weekly job)."
    );
  }
  if (monthValues && !dayValues) {
    throw new Error(
      "Windows Task Scheduler cannot represent 'every day in selected months'. Use explicit day-of-month values (for example '0 9 1,15 1,7 *') or create separate jobs."
    );
  }
  const plans = [];
  for (const minute of minuteValues) {
    for (const hour of hourValues) {
      const startTime = formatStartTime(hour, minute);
      if (dayValues && weekdayValues) {
        plans.push({
          schedule: "MONTHLY",
          days: dayValues.join(","),
          months: monthValues ? monthValues.map((value3) => WINDOWS_MONTHS[value3 - 1]).join(",") : void 0,
          startTime
        });
        plans.push({
          schedule: "WEEKLY",
          weekdays: weekdayValues.map((value3) => WINDOWS_WEEKDAYS[value3]).join(","),
          startTime
        });
      } else if (weekdayValues) {
        plans.push({
          schedule: "WEEKLY",
          weekdays: weekdayValues.map((value3) => WINDOWS_WEEKDAYS[value3]).join(","),
          startTime
        });
      } else if (dayValues) {
        plans.push({
          schedule: "MONTHLY",
          days: dayValues.join(","),
          months: monthValues ? monthValues.map((value3) => WINDOWS_MONTHS[value3 - 1]).join(",") : void 0,
          startTime
        });
      } else if (monthValues) {
        throw new Error(
          "Windows Task Scheduler cannot represent month-only cron constraints without day-of-month. Use explicit days or create separate jobs."
        );
      } else {
        plans.push({ schedule: "DAILY", startTime });
      }
    }
  }
  return plans;
}
function cronToWindowsTaskDefinitions(job) {
  const plans = ensureWindowsRepresentable(job.schedule);
  const baseName = windowsTaskBaseName(job);
  const command = buildWindowsTaskCommand(job);
  return plans.map((plan, index2) => {
    const args2 = ["/Create", "/F", "/TN", windowsTaskName(baseName, index2, plans.length), "/TR", command, "/SC", plan.schedule];
    if (plan.modifier) {
      args2.push("/MO", plan.modifier);
    }
    if (plan.weekdays) {
      args2.push("/D", plan.weekdays);
    }
    if (plan.days) {
      args2.push("/D", plan.days);
    }
    if (plan.months) {
      args2.push("/M", plan.months);
    }
    args2.push("/ST", plan.startTime);
    return { name: windowsTaskName(baseName, index2, plans.length), args: args2 };
  });
}
function createLaunchdPlist(job) {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  const label = `${LAUNCHD_PREFIX}.${scopeId}.${job.slug}`;
  const logFilePath = scopedLogPath(scopeId, job.slug);
  const jobPath = jobFilePath(scopeId, job.slug);
  const calendars = cronToLaunchdCalendars(job.schedule);
  const calendarXml = calendars.length === 1 ? `  <dict>
${renderLaunchdCalendar(calendars[0])}
  </dict>` : `  <array>
${calendars.map((calendar) => `  <dict>
${renderLaunchdCalendar(calendar)}
  </dict>`).join("\n")}
  </array>`;
  const programArgumentsXml = [
    `    <string>${escapePlistString("/usr/bin/perl")}</string>`,
    `    <string>${escapePlistString(SUPERVISOR_PATH)}</string>`,
    `    <string>${escapePlistString(jobPath)}</string>`
  ].join("\n");
  const workdir = job.workdir || homedir();
  const enhancedPath = getEnhancedPath();
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  
  <key>WorkingDirectory</key>
  <string>${escapePlistString(workdir)}</string>
  
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>${enhancedPath}</string>
  </dict>
  
  <key>ProgramArguments</key>
  <array>
${programArgumentsXml}
  </array>
  
  <key>StartCalendarInterval</key>
${calendarXml}
  
  <key>StandardOutPath</key>
  <string>${logFilePath}</string>
  
  <key>StandardErrorPath</key>
  <string>${logFilePath}</string>
  
  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>`;
}
function installLaunchdJob(job) {
  ensureDir(LAUNCH_AGENTS_DIR);
  ensureDir(LOGS_DIR);
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  ensureDir(scopeLogsDir(scopeId));
  ensureSupervisorScript();
  const legacyLabel = `${LAUNCHD_PREFIX}.${job.slug}`;
  const legacyPlistPath = join2(LAUNCH_AGENTS_DIR, `${legacyLabel}.plist`);
  const label = `${LAUNCHD_PREFIX}.${scopeId}.${job.slug}`;
  const plistPath = join2(LAUNCH_AGENTS_DIR, `${label}.plist`);
  try {
    execSync(`launchctl unload "${plistPath}" 2>/dev/null`, { stdio: "ignore" });
  } catch {
  }
  if (existsSync(legacyPlistPath)) {
    try {
      execSync(`launchctl unload "${legacyPlistPath}" 2>/dev/null`, { stdio: "ignore" });
    } catch {
    }
  }
  const plist = createLaunchdPlist(job);
  writeFileSync(plistPath, plist);
  execSync(`launchctl load "${plistPath}"`);
}
function uninstallLaunchdJob(job) {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  const scopedLabel = `${LAUNCHD_PREFIX}.${scopeId}.${job.slug}`;
  const scopedPlistPath = join2(LAUNCH_AGENTS_DIR, `${scopedLabel}.plist`);
  const legacyLabel = `${LAUNCHD_PREFIX}.${job.slug}`;
  const legacyPlistPath = join2(LAUNCH_AGENTS_DIR, `${legacyLabel}.plist`);
  for (const plistPath of [scopedPlistPath, legacyPlistPath]) {
    if (!existsSync(plistPath)) continue;
    try {
      execSync(`launchctl unload "${plistPath}"`, { stdio: "ignore" });
    } catch {
    }
    try {
      unlinkSync(plistPath);
    } catch {
    }
  }
}
function createSystemdService(job) {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  const logFilePath = scopedLogPath(scopeId, job.slug);
  const jobPath = jobFilePath(scopeId, job.slug);
  const workdir = job.workdir || homedir();
  const enhancedPath = getEnhancedPath();
  const execStart = ["/usr/bin/perl", SUPERVISOR_PATH, jobPath].map((arg) => `"${escapeSystemdArg(arg)}"`).join(" ");
  return `[Unit]
Description=OpenCode Job: ${job.name}

[Service]
Type=oneshot
WorkingDirectory=${workdir}
Environment="PATH=${enhancedPath}"
ExecStart=${execStart}
StandardOutput=append:${logFilePath}
StandardError=append:${logFilePath}

[Install]
WantedBy=default.target
`;
}
function createSystemdTimer(job) {
  const calendars = cronToSystemdCalendars(job.schedule);
  const calendarLines = calendars.map((calendar) => `OnCalendar=${calendar}`).join("\n");
  return `[Unit]
Description=Timer for OpenCode Job: ${job.name}

[Timer]
${calendarLines}
Persistent=true

[Install]
WantedBy=timers.target
`;
}
function installSystemdJob(job) {
  ensureDir(SYSTEMD_USER_DIR);
  ensureDir(LOGS_DIR);
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  ensureDir(scopeLogsDir(scopeId));
  ensureSupervisorScript();
  const servicePath = join2(SYSTEMD_USER_DIR, `opencode-job-${scopeId}-${job.slug}.service`);
  const timerPath = join2(SYSTEMD_USER_DIR, `opencode-job-${scopeId}-${job.slug}.timer`);
  try {
    execSync(`systemctl --user stop opencode-job-${job.slug}.timer`, { stdio: "ignore" });
    execSync(`systemctl --user disable opencode-job-${job.slug}.timer`, { stdio: "ignore" });
  } catch {
  }
  writeFileSync(servicePath, createSystemdService(job));
  writeFileSync(timerPath, createSystemdTimer(job));
  execSync("systemctl --user daemon-reload");
  execSync(`systemctl --user enable opencode-job-${scopeId}-${job.slug}.timer`);
  execSync(`systemctl --user start opencode-job-${scopeId}-${job.slug}.timer`);
}
function uninstallSystemdJob(job) {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  const scopedTimerUnit = `opencode-job-${scopeId}-${job.slug}.timer`;
  const legacyTimerUnit = `opencode-job-${job.slug}.timer`;
  for (const timerUnit of [scopedTimerUnit, legacyTimerUnit]) {
    try {
      execSync(`systemctl --user stop ${timerUnit}`, { stdio: "ignore" });
      execSync(`systemctl --user disable ${timerUnit}`, { stdio: "ignore" });
    } catch {
    }
  }
  const scopedServicePath = join2(SYSTEMD_USER_DIR, `opencode-job-${scopeId}-${job.slug}.service`);
  const scopedTimerPath = join2(SYSTEMD_USER_DIR, `opencode-job-${scopeId}-${job.slug}.timer`);
  const legacyServicePath = join2(SYSTEMD_USER_DIR, `opencode-job-${job.slug}.service`);
  const legacyTimerPath = join2(SYSTEMD_USER_DIR, `opencode-job-${job.slug}.timer`);
  for (const p of [scopedServicePath, scopedTimerPath, legacyServicePath, legacyTimerPath]) {
    if (existsSync(p)) {
      try {
        unlinkSync(p);
      } catch {
      }
    }
  }
  try {
    execSync("systemctl --user daemon-reload", { stdio: "ignore" });
  } catch {
  }
}
function installWindowsJob(job) {
  uninstallWindowsJob(job);
  const taskDefinitions = cronToWindowsTaskDefinitions(job);
  for (const task of taskDefinitions) {
    execFileSync("schtasks", task.args, { stdio: "ignore" });
  }
}
function uninstallWindowsJob(job) {
  const candidates = /* @__PURE__ */ new Set();
  const scopedBase = windowsTaskBaseName(job);
  const legacyBase = `${WINDOWS_TASK_PREFIX}-${job.slug}`;
  for (let i = 0; i < 64; i += 1) {
    const suffix = i === 0 ? "" : `-${i + 1}`;
    candidates.add(`${WINDOWS_TASK_ROOT}\\${scopedBase}${suffix}`);
    candidates.add(`${WINDOWS_TASK_ROOT}\\${legacyBase}${suffix}`);
  }
  for (const taskName of candidates) {
    try {
      execFileSync("schtasks", ["/Delete", "/TN", taskName, "/F"], { stdio: "ignore" });
    } catch {
    }
  }
}
function isCommandAvailable(command) {
  try {
    execSync(`command -v ${command}`, {
      stdio: "ignore",
      env: buildRunEnvironment()
    });
    return true;
  } catch {
    return false;
  }
}
function isSystemdUserAvailable() {
  if (!IS_LINUX) return false;
  if (!isCommandAvailable("systemctl")) return false;
  try {
    execSync("systemctl --user show-environment", {
      stdio: "ignore",
      env: buildRunEnvironment()
    });
    return true;
  } catch {
    return false;
  }
}
function isCronAvailable() {
  if (IS_WINDOWS) return false;
  return isCommandAvailable("crontab");
}
function cronBlockId(job) {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  return `${scopeId}:${job.slug}`;
}
function cronLegacyBlockId(job) {
  return `legacy:${job.slug}`;
}
function cronBlockStart(id2) {
  return `# BEGIN ${CRON_MANAGED_PREFIX} ${id2}`;
}
function cronBlockEnd(id2) {
  return `# END ${CRON_MANAGED_PREFIX} ${id2}`;
}
function shellEscapeDoubleQuoted(value3) {
  return value3.replace(/(["\\$`])/g, "\\$1");
}
function readUserCrontab() {
  try {
    return execFileSync("crontab", ["-l"], { encoding: "utf-8" });
  } catch (error) {
    const status = typeof error === "object" && error !== null ? error.status : void 0;
    const stderrValue = typeof error === "object" && error !== null && "stderr" in error ? error.stderr : void 0;
    const stderr = Buffer.isBuffer(stderrValue) ? stderrValue.toString("utf-8") : stderrValue ?? "";
    const noCrontab = status === 1 && (!stderr.trim() || /no crontab/i.test(stderr));
    if (noCrontab) return "";
    throw error;
  }
}
function writeUserCrontab(content) {
  const normalized = content.trim();
  const input = normalized ? `${normalized}
` : "";
  execFileSync("crontab", ["-"], { input });
}
function stripManagedCronBlocks(content, blockIds) {
  const lines = content ? content.split(/\r?\n/) : [];
  const retained = [];
  const prefix = `# BEGIN ${CRON_MANAGED_PREFIX} `;
  const endPrefix = `# END ${CRON_MANAGED_PREFIX} `;
  let removed2 = 0;
  for (let index2 = 0; index2 < lines.length; ) {
    const line = lines[index2];
    if (!line.startsWith(prefix)) {
      retained.push(line);
      index2 += 1;
      continue;
    }
    const id2 = line.slice(prefix.length).trim();
    let endIndex = lines.length - 1;
    for (let probe = index2 + 1; probe < lines.length; probe += 1) {
      if (lines[probe] === `${endPrefix}${id2}`) {
        endIndex = probe;
        break;
      }
    }
    if (blockIds.has(id2)) {
      removed2 += 1;
    } else {
      for (let keep = index2; keep <= endIndex; keep += 1) {
        retained.push(lines[keep]);
      }
    }
    index2 = endIndex + 1;
  }
  return {
    content: retained.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd(),
    removed: removed2
  };
}
function createCronEntry(job) {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  const jobPath = jobFilePath(scopeId, job.slug);
  const logFilePath = scopedLogPath(scopeId, job.slug);
  const escapedSupervisor = shellEscapeDoubleQuoted(SUPERVISOR_PATH);
  const escapedJobPath = shellEscapeDoubleQuoted(jobPath);
  const escapedLogPath = shellEscapeDoubleQuoted(logFilePath);
  const escapedPath = shellEscapeDoubleQuoted(getEnhancedPath());
  return `${job.schedule} PATH="${escapedPath}" /usr/bin/perl "${escapedSupervisor}" "${escapedJobPath}" >> "${escapedLogPath}" 2>&1`;
}
function installCronJob(job) {
  if (!isCronAvailable()) {
    throw new Error("cron backend is unavailable: `crontab` command not found.");
  }
  ensureDir(LOGS_DIR);
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  ensureDir(scopeLogsDir(scopeId));
  ensureSupervisorScript();
  const blockId = cronBlockId(job);
  const current = readUserCrontab();
  const stripped = stripManagedCronBlocks(current, /* @__PURE__ */ new Set([blockId, cronLegacyBlockId(job)]));
  const block = [cronBlockStart(blockId), createCronEntry(job), cronBlockEnd(blockId)].join("\n");
  const next = [stripped.content.trim(), block].filter(Boolean).join("\n\n");
  writeUserCrontab(next);
}
function uninstallCronJob(job) {
  if (!isCronAvailable()) return;
  const current = readUserCrontab();
  const stripped = stripManagedCronBlocks(current, /* @__PURE__ */ new Set([cronBlockId(job), cronLegacyBlockId(job)]));
  if (stripped.removed === 0) return;
  writeUserCrontab(stripped.content);
}
function resolveSchedulerBackend() {
  if (IS_MAC) return "launchd";
  if (IS_WINDOWS) return "schtasks";
  if (isSystemdUserAvailable()) return "systemd";
  if (isCronAvailable()) return "cron";
  if (IS_LINUX) {
    throw new Error(
      "No supported scheduler backend found: systemd --user is unavailable and `crontab` is not installed."
    );
  }
  throw new Error(
    `Unsupported platform: ${platform()}. Supported platforms: macOS (launchd), Linux (systemd or cron), Windows, and POSIX systems with cron.`
  );
}
function installJob(job) {
  const backend = resolveSchedulerBackend();
  if (backend === "launchd") {
    installLaunchdJob(job);
  } else if (backend === "systemd") {
    try {
      installSystemdJob(job);
    } catch (error) {
      if (!isCronAvailable()) {
        throw error;
      }
      installCronJob(job);
      return "cron";
    }
  } else if (backend === "schtasks") {
    installWindowsJob(job);
  } else {
    installCronJob(job);
  }
  return backend;
}
function uninstallJob(job) {
  if (IS_MAC) {
    uninstallLaunchdJob(job);
    return;
  }
  if (IS_WINDOWS) {
    uninstallWindowsJob(job);
    return;
  }
  if (IS_LINUX) {
    uninstallSystemdJob(job);
    uninstallCronJob(job);
    return;
  }
  uninstallCronJob(job);
}
function ensureScopeStorage(scopeId) {
  ensureDir(SCHEDULER_DIR);
  ensureDir(SCOPES_DIR);
  ensureDir(scopeJobsDir(scopeId));
  ensureDir(scopeLocksDir(scopeId));
  ensureDir(scopeRunsDir(scopeId));
  ensureDir(scopeLogsDir(scopeId));
}
function loadScopedJob(scopeId, slug) {
  ensureScopeStorage(scopeId);
  const path = jobFilePath(scopeId, slug);
  if (!existsSync(path)) return null;
  try {
    return normalizeJob(JSON.parse(readFileSync(path, "utf-8")));
  } catch {
    return null;
  }
}
function loadAllScopedJobs(scopeId) {
  ensureScopeStorage(scopeId);
  const files = readdirSync(scopeJobsDir(scopeId)).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    try {
      return normalizeJob(JSON.parse(readFileSync(join2(scopeJobsDir(scopeId), f), "utf-8")));
    } catch {
      return null;
    }
  }).filter(Boolean);
}
function listScopeIds() {
  ensureDir(SCOPES_DIR);
  try {
    return readdirSync(SCOPES_DIR).filter((name) => {
      try {
        return existsSync(scopeDir(name));
      } catch {
        return false;
      }
    }).sort();
  } catch {
    return [];
  }
}
function loadAllJobsAcrossScopes() {
  const scopeIds = listScopeIds();
  const out = [];
  for (const scopeId of scopeIds) {
    out.push(...loadAllScopedJobs(scopeId));
  }
  return out;
}
function loadLegacyJob(slug) {
  ensureDir(LEGACY_JOBS_DIR);
  const path = join2(LEGACY_JOBS_DIR, `${slug}.json`);
  if (!existsSync(path)) return null;
  try {
    return normalizeJob(JSON.parse(readFileSync(path, "utf-8")));
  } catch {
    return null;
  }
}
function loadAllLegacyJobs() {
  ensureDir(LEGACY_JOBS_DIR);
  const files = readdirSync(LEGACY_JOBS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    try {
      return normalizeJob(JSON.parse(readFileSync(join2(LEGACY_JOBS_DIR, f), "utf-8")));
    } catch {
      return null;
    }
  }).filter(Boolean);
}
function saveJob(job) {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  const normalizedJob = { ...job, scopeId };
  ensureScopeStorage(scopeId);
  const path = jobFilePath(scopeId, normalizedJob.slug);
  writeFileSync(path, JSON.stringify(sanitizeJob(normalizedJob), null, 2));
}
function deleteJobFile(job) {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  const path = jobFilePath(scopeId, job.slug);
  if (existsSync(path)) {
    unlinkSync(path);
  }
}
function listDirectoryFiles(dir, options2) {
  if (!existsSync(dir)) return [];
  try {
    const entries3 = readdirSync(dir, { withFileTypes: true });
    return entries3.filter((entry) => entry.isFile()).map((entry) => entry.name).filter((name) => options2?.prefix ? name.startsWith(options2.prefix) : true).filter((name) => options2?.suffix ? name.endsWith(options2.suffix) : true).map((name) => join2(dir, name)).sort();
  } catch {
    return [];
  }
}
function listDirectoryNames(dir) {
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  } catch {
    return [];
  }
}
function uniquePaths(paths) {
  return Array.from(new Set(paths)).sort();
}
function buildGlobalCleanupPlan(includeHistory) {
  const scopeIds = listScopeIds();
  const scopedJobDefinitionPaths = scopeIds.flatMap((scopeId) => listDirectoryFiles(scopeJobsDir(scopeId), { suffix: ".json" }));
  const lockPaths = scopeIds.flatMap((scopeId) => listDirectoryFiles(scopeLocksDir(scopeId), { suffix: ".json" }));
  const runHistoryPaths = includeHistory ? scopeIds.flatMap((scopeId) => listDirectoryFiles(scopeRunsDir(scopeId), { suffix: ".jsonl" })) : [];
  const schedulerLogsRoot = join2(LOGS_DIR, "scheduler");
  const logScopeIds = listDirectoryNames(schedulerLogsRoot);
  const logPaths = includeHistory ? logScopeIds.flatMap((scopeId) => listDirectoryFiles(join2(schedulerLogsRoot, scopeId), { suffix: ".log" })) : [];
  const launchdPaths = IS_MAC ? listDirectoryFiles(LAUNCH_AGENTS_DIR, { prefix: `${LAUNCHD_PREFIX}.`, suffix: ".plist" }) : [];
  const systemdPaths = IS_LINUX ? [
    ...listDirectoryFiles(SYSTEMD_USER_DIR, { prefix: "opencode-job-", suffix: ".service" }),
    ...listDirectoryFiles(SYSTEMD_USER_DIR, { prefix: "opencode-job-", suffix: ".timer" })
  ] : [];
  const jobsToUninstall = [...loadAllJobsAcrossScopes(), ...loadAllLegacyJobs()];
  return {
    scopeIds,
    jobsToUninstall,
    scopedJobDefinitionPaths: uniquePaths(scopedJobDefinitionPaths),
    legacyJobDefinitionPaths: listDirectoryFiles(LEGACY_JOBS_DIR, { suffix: ".json" }),
    lockPaths: uniquePaths(lockPaths),
    runHistoryPaths: uniquePaths(runHistoryPaths),
    logPaths: uniquePaths(logPaths),
    launchdPaths: uniquePaths(launchdPaths),
    systemdPaths: uniquePaths(systemdPaths)
  };
}
function removePaths(paths, errors) {
  const removed2 = [];
  for (const path of uniquePaths(paths)) {
    if (!existsSync(path)) continue;
    try {
      rmSync(path, { recursive: true, force: true });
      removed2.push(path);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to remove ${path}: ${msg}`);
    }
  }
  return removed2;
}
function executeGlobalCleanup(plan, options2) {
  const errors = [];
  const dryRun = options2.dryRun;
  if (!dryRun) {
    for (const job of plan.jobsToUninstall) {
      try {
        uninstallJob(job);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to uninstall scheduler entry for ${job.slug}: ${msg}`);
      }
    }
  }
  const removeOrPreview = (paths) => {
    if (dryRun) return uniquePaths(paths).filter((path) => existsSync(path));
    return removePaths(paths, errors);
  };
  const removed2 = {
    scopedJobDefinitions: removeOrPreview(plan.scopedJobDefinitionPaths),
    legacyJobDefinitions: removeOrPreview(plan.legacyJobDefinitionPaths),
    locks: removeOrPreview(plan.lockPaths),
    runHistory: options2.includeHistory ? removeOrPreview(plan.runHistoryPaths) : [],
    logs: options2.includeHistory ? removeOrPreview(plan.logPaths) : [],
    launchdUnits: removeOrPreview(plan.launchdPaths),
    systemdUnits: removeOrPreview(plan.systemdPaths)
  };
  return {
    dryRun,
    includeHistory: options2.includeHistory,
    removed: removed2,
    errors
  };
}
function formatCleanupLine(label, count, location) {
  return `- ${label}: ${count} (${location})`;
}
function formatGlobalCleanupOutput(execution) {
  const mode = execution.dryRun ? "DRY RUN (no files deleted)" : "EXECUTED";
  const lines = [
    `Global scheduler cleanup: ${mode}`,
    "",
    formatCleanupLine("Scoped job definitions", execution.removed.scopedJobDefinitions.length, `${SCOPES_DIR}/*/jobs`),
    formatCleanupLine("Legacy job definitions", execution.removed.legacyJobDefinitions.length, LEGACY_JOBS_DIR),
    formatCleanupLine("Lock files", execution.removed.locks.length, `${SCOPES_DIR}/*/locks`)
  ];
  if (execution.includeHistory) {
    lines.push(formatCleanupLine("Run history", execution.removed.runHistory.length, `${SCOPES_DIR}/*/runs`));
    lines.push(formatCleanupLine("Logs", execution.removed.logs.length, `${LOGS_DIR}/scheduler/*`));
  } else {
    lines.push("- Run history: skipped (set includeHistory=true)");
    lines.push("- Logs: skipped (set includeHistory=true)");
  }
  if (IS_MAC) {
    lines.push(formatCleanupLine("launchd plists", execution.removed.launchdUnits.length, LAUNCH_AGENTS_DIR));
  }
  if (IS_LINUX) {
    lines.push(formatCleanupLine("systemd units", execution.removed.systemdUnits.length, SYSTEMD_USER_DIR));
  }
  if (execution.errors.length > 0) {
    lines.push("");
    lines.push("Errors:");
    for (const error of execution.errors) {
      lines.push(`- ${error}`);
    }
  }
  if (execution.dryRun) {
    lines.push("");
    lines.push("Re-run with confirm=true to apply this cleanup.");
  }
  return lines.join("\n");
}
function normalizeAttachUrl(attachUrl) {
  if (attachUrl === void 0) return void 0;
  const trimmed = attachUrl.trim();
  if (!trimmed) return void 0;
  try {
    new URL(trimmed);
  } catch {
    throw new Error(`Invalid attach URL: ${attachUrl}`);
  }
  return trimmed;
}
function isRecord(value3) {
  return typeof value3 === "object" && value3 !== null && !Array.isArray(value3);
}
function normalizeRunFormat(value3) {
  if (typeof value3 !== "string") return void 0;
  const trimmed = value3.trim();
  if (trimmed === "json") return "json";
  if (trimmed === "default") return "default";
  return void 0;
}
function parseRunFormatInput(value3) {
  if (value3 === void 0) return void 0;
  if (typeof value3 === "string" && !value3.trim()) return void 0;
  const normalized = normalizeRunFormat(value3);
  if (normalized) return normalized;
  throw new Error(`Invalid runFormat: ${String(value3)} (expected: default | json)`);
}
function normalizeRunSpec(run2) {
  const normalized = { ...run2 };
  if (typeof normalized.prompt === "string") {
    const trimmed = normalized.prompt.trim();
    normalized.prompt = trimmed ? trimmed : void 0;
  }
  if (typeof normalized.command === "string") {
    const trimmed = normalized.command.trim();
    normalized.command = trimmed ? trimmed : void 0;
  }
  if (typeof normalized.arguments === "string") {
    const trimmed = normalized.arguments.trim();
    normalized.arguments = trimmed ? trimmed : void 0;
  }
  if (Array.isArray(normalized.files)) {
    const files = normalized.files.map((file) => String(file).trim()).filter(Boolean);
    normalized.files = files.length ? files : void 0;
  }
  if (typeof normalized.agent === "string") {
    const trimmed = normalized.agent.trim();
    normalized.agent = trimmed ? trimmed : void 0;
  }
  if (typeof normalized.model === "string") {
    const trimmed = normalized.model.trim();
    normalized.model = trimmed ? trimmed : void 0;
  }
  if (typeof normalized.variant === "string") {
    const trimmed = normalized.variant.trim();
    normalized.variant = trimmed ? trimmed : void 0;
  }
  if (typeof normalized.title === "string") {
    const trimmed = normalized.title.trim();
    normalized.title = trimmed ? trimmed : void 0;
  }
  if (normalized.share !== true) {
    normalized.share = void 0;
  }
  if (normalized.continue !== true) {
    normalized.continue = void 0;
  }
  if (typeof normalized.session === "string") {
    const trimmed = normalized.session.trim();
    normalized.session = trimmed ? trimmed : void 0;
  }
  if (normalized.runFormat !== "json") {
    normalized.runFormat = normalized.runFormat === "default" ? "default" : void 0;
  }
  if (typeof normalized.attachUrl === "string") {
    const trimmed = normalized.attachUrl.trim();
    normalized.attachUrl = trimmed ? trimmed : void 0;
  }
  if (typeof normalized.port === "number" && Number.isFinite(normalized.port)) {
    normalized.port = Math.floor(normalized.port);
    if (normalized.port <= 0) normalized.port = void 0;
  } else {
    normalized.port = void 0;
  }
  return normalized;
}
function validateRunSpec(run2) {
  const hasPrompt = typeof run2.prompt === "string" && run2.prompt.trim().length > 0;
  const hasCommand = typeof run2.command === "string" && run2.command.trim().length > 0;
  if (!hasPrompt && !hasCommand) {
    throw new Error("Job must have either run.prompt or run.command");
  }
  if (hasPrompt && hasCommand) {
    throw new Error("Job cannot specify both run.prompt and run.command");
  }
  if (hasCommand && run2.arguments !== void 0 && typeof run2.arguments !== "string") {
    throw new Error("run.arguments must be a string");
  }
  if (run2.attachUrl !== void 0) {
    normalizeAttachUrl(run2.attachUrl);
  }
  if (run2.port !== void 0) {
    if (!Number.isFinite(run2.port) || run2.port <= 0) {
      throw new Error("run.port must be a positive integer");
    }
  }
  if (run2.runFormat !== void 0 && run2.runFormat !== "default" && run2.runFormat !== "json") {
    throw new Error("run.runFormat must be 'default' or 'json'");
  }
}
function getJobRun(job) {
  if (job.run) {
    return job.run;
  }
  const fallbackPrompt = (job.prompt ?? "").trim();
  if (!fallbackPrompt) {
    throw new Error(`Job "${job.slug}" is missing a prompt. Update the job to include run.prompt or prompt.`);
  }
  return {
    prompt: fallbackPrompt,
    attachUrl: job.attachUrl
  };
}
function sanitizeJob(job) {
  const sanitized = { ...job };
  if (typeof sanitized.workdir === "string") {
    const trimmed = sanitized.workdir.trim();
    sanitized.workdir = trimmed ? trimmed : void 0;
  }
  if (typeof sanitized.scopeId === "string") {
    const trimmed = sanitized.scopeId.trim();
    sanitized.scopeId = trimmed ? trimmed : void 0;
  }
  if (!sanitized.scopeId) {
    sanitized.scopeId = deriveScopeId(sanitized.workdir || homedir());
  }
  if (sanitized.timeoutSeconds !== void 0) {
    const n = sanitized.timeoutSeconds;
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || Math.floor(n) !== n) {
      throw new Error("timeoutSeconds must be a non-negative integer");
    }
  }
  if (sanitized.invocation !== void 0) {
    const inv = sanitized.invocation;
    if (!inv || typeof inv !== "object") {
      throw new Error("invocation must be an object");
    }
    const rec = inv;
    if (typeof rec.command !== "string" || !rec.command.trim()) {
      throw new Error("invocation.command must be a non-empty string");
    }
    if (!Array.isArray(rec.args)) {
      throw new Error("invocation.args must be an array");
    }
    sanitized.invocation = {
      command: rec.command,
      args: rec.args.map((v) => String(v))
    };
  }
  if (sanitized.run) {
    const normalized = normalizeRunSpec(sanitized.run);
    validateRunSpec(normalized);
    sanitized.run = normalized;
  }
  if (sanitized.attachUrl !== void 0) {
    sanitized.attachUrl = normalizeAttachUrl(sanitized.attachUrl);
  }
  if (sanitized.prompt !== void 0) {
    const trimmed = sanitized.prompt.trim();
    sanitized.prompt = trimmed ? trimmed : void 0;
  }
  return sanitized;
}
function normalizeJobInvocation(raw) {
  if (!isRecord(raw)) return void 0;
  if (typeof raw.command !== "string") return void 0;
  if (!Array.isArray(raw.args)) return void 0;
  const command = raw.command.trim();
  if (!command) return void 0;
  return { command, args: raw.args.map((v) => String(v)) };
}
function normalizeJobRun(raw) {
  if (!isRecord(raw)) return void 0;
  const run2 = {};
  if (typeof raw.prompt === "string") run2.prompt = raw.prompt;
  if (typeof raw.command === "string") run2.command = raw.command;
  if (typeof raw.arguments === "string") run2.arguments = raw.arguments;
  if (Array.isArray(raw.files)) {
    run2.files = raw.files.map((file) => String(file));
  }
  if (typeof raw.agent === "string") run2.agent = raw.agent;
  if (typeof raw.model === "string") run2.model = raw.model;
  if (typeof raw.variant === "string") run2.variant = raw.variant;
  if (typeof raw.title === "string") run2.title = raw.title;
  if (typeof raw.share === "boolean") run2.share = raw.share;
  if (typeof raw.continue === "boolean") run2.continue = raw.continue;
  if (typeof raw.session === "string") run2.session = raw.session;
  const runFormat = normalizeRunFormat(raw.runFormat);
  if (runFormat) run2.runFormat = runFormat;
  if (typeof raw.attachUrl === "string") run2.attachUrl = raw.attachUrl;
  if (typeof raw.port === "number" && Number.isFinite(raw.port)) {
    run2.port = raw.port;
  }
  return run2;
}
function normalizeJob(raw) {
  if (!isRecord(raw)) return null;
  if (typeof raw.slug !== "string" || typeof raw.name !== "string" || typeof raw.schedule !== "string") {
    return null;
  }
  const job = {
    scopeId: typeof raw.scopeId === "string" ? raw.scopeId : void 0,
    slug: raw.slug,
    name: raw.name,
    schedule: raw.schedule,
    source: typeof raw.source === "string" ? raw.source : void 0,
    workdir: typeof raw.workdir === "string" ? raw.workdir : void 0,
    timeoutSeconds: typeof raw.timeoutSeconds === "number" ? raw.timeoutSeconds : void 0,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : void 0,
    lastRunAt: typeof raw.lastRunAt === "string" ? raw.lastRunAt : void 0,
    lastRunExitCode: typeof raw.lastRunExitCode === "number" ? raw.lastRunExitCode : void 0,
    lastRunError: typeof raw.lastRunError === "string" ? raw.lastRunError : void 0,
    lastRunSource: raw.lastRunSource === "manual" || raw.lastRunSource === "scheduled" ? raw.lastRunSource : void 0,
    lastRunStatus: raw.lastRunStatus === "running" || raw.lastRunStatus === "success" || raw.lastRunStatus === "failed" ? raw.lastRunStatus : void 0
  };
  if (typeof raw.prompt === "string") job.prompt = raw.prompt;
  if (typeof raw.attachUrl === "string") job.attachUrl = raw.attachUrl;
  const run2 = normalizeJobRun(raw.run);
  if (run2) job.run = run2;
  const inv = normalizeJobInvocation(raw.invocation);
  if (inv) job.invocation = inv;
  return sanitizeJob(job);
}
function findJobByName(name, options2) {
  const scopeId = options2?.scopeId ?? currentScopeId();
  const slug = slugify(name);
  let job = loadScopedJob(scopeId, slug) || loadScopedJob(scopeId, name);
  if (!job) {
    const allJobs = loadAllScopedJobs(scopeId);
    job = allJobs.find(
      (j) => j.slug === name || j.slug.endsWith(`-${slug}`) || j.name.toLowerCase() === name.toLowerCase() || j.name.toLowerCase().includes(name.toLowerCase())
    ) || null;
  }
  if (!job && options2?.allScopes) {
    const allJobs = loadAllJobsAcrossScopes();
    job = allJobs.find(
      (j) => j.slug === name || j.slug.endsWith(`-${slug}`) || j.name.toLowerCase() === name.toLowerCase() || j.name.toLowerCase().includes(name.toLowerCase())
    ) || null;
  }
  if (!job && options2?.includeLegacy) {
    job = loadLegacyJob(slug) || loadLegacyJob(name);
    if (!job) {
      const allJobs = loadAllLegacyJobs();
      job = allJobs.find(
        (j) => j.slug === name || j.slug.endsWith(`-${slug}`) || j.name.toLowerCase() === name.toLowerCase() || j.name.toLowerCase().includes(name.toLowerCase())
      ) || null;
    }
  }
  return job;
}
function updateJobRecord(job, updates) {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  const latest2 = loadScopedJob(scopeId, job.slug) || job;
  const updated = {
    ...latest2,
    ...updates,
    scopeId,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  saveJob(updated);
  return updated;
}
function getLogPath(job) {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
  return scopedLogPath(scopeId, job.slug);
}
function buildOpencodeArgs(job) {
  const command = findOpencode();
  const run2 = normalizeRunSpec(getJobRun(job));
  validateRunSpec(run2);
  const args2 = ["run"];
  if (run2.attachUrl) {
    args2.push("--attach", run2.attachUrl);
  }
  if (run2.port !== void 0) {
    args2.push("--port", String(run2.port));
  }
  if (run2.command) {
    args2.push("--command", run2.command);
  }
  if (run2.agent) {
    args2.push("--agent", run2.agent);
  }
  if (run2.model) {
    args2.push("--model", run2.model);
  }
  if (run2.variant) {
    args2.push("--variant", run2.variant);
  }
  if (run2.runFormat) {
    args2.push("--format", run2.runFormat);
  }
  if (run2.share) {
    args2.push("--share");
  }
  if (run2.title) {
    args2.push("--title", run2.title);
  }
  if (run2.continue) {
    args2.push("--continue");
  }
  if (run2.session) {
    args2.push("--session", run2.session);
  }
  for (const file of run2.files ?? []) {
    args2.push("--file", file);
  }
  args2.push("--");
  args2.push(run2.command ? run2.arguments ?? "" : run2.prompt ?? "");
  return { command, args: args2 };
}
function buildRunEnvironment() {
  const enhancedPath = getEnhancedPath();
  const existingPath = process.env.PATH;
  const combinedPath = existingPath ? `${enhancedPath}:${existingPath}` : enhancedPath;
  const basePolicy = { question: "deny" };
  const mergedPolicy = (() => {
    const raw = process.env.OPENCODE_PERMISSION;
    if (!raw) return basePolicy;
    try {
      const existing = JSON.parse(raw);
      if (isRecord(existing)) {
        return { ...existing, ...basePolicy };
      }
    } catch {
    }
    return basePolicy;
  })();
  const baseEnv = { ...process.env };
  const config = loadSchedulerConfig();
  const preserveOpencodeEnv = config.env?.preserveOpencodeEnv === true;
  const preserved = /* @__PURE__ */ new Set(["OPENCODE_PERMISSION", ...config.env?.preserve ?? []]);
  if (!preserveOpencodeEnv) {
    for (const key of Object.keys(baseEnv)) {
      if (!key.startsWith("OPENCODE_")) continue;
      if (key.startsWith("OPENCODE_SCHEDULER_")) continue;
      if (preserved.has(key)) continue;
      delete baseEnv[key];
    }
  }
  return {
    ...baseEnv,
    ...config.env?.set,
    PATH: combinedPath,
    OPENCODE_PERMISSION: JSON.stringify(mergedPolicy)
  };
}
function loadSchedulerConfig() {
  if (!existsSync(SCHEDULER_CONFIG)) return {};
  try {
    const raw = readFileSync(SCHEDULER_CONFIG, "utf-8");
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}
function getOpencodeVersion(opencodePath) {
  try {
    const output = execSync(`"${opencodePath}" --version`, { env: buildRunEnvironment() }).toString().trim();
    return output || null;
  } catch {
    return null;
  }
}
function runJobNow(job) {
  ensureDir(LOGS_DIR);
  ensureDir(scopeLogsDir(job.scopeId || deriveScopeId(job.workdir || homedir())));
  const startedAt = (/* @__PURE__ */ new Date()).toISOString();
  const logPath = getLogPath(job);
  const logStream = createWriteStream(logPath, { flags: "a" });
  const workdir = job.workdir || homedir();
  logStream.write(`
=== Manual run ${startedAt} ===
`);
  const { command, args: args2 } = buildOpencodeArgs(job);
  let child;
  try {
    child = spawn(command, args2, {
      cwd: workdir,
      env: buildRunEnvironment(),
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStream.write(`
=== Run error ${(/* @__PURE__ */ new Date()).toISOString()} ===
${message}
`);
    logStream.end();
    updateJobRecord(job, {
      lastRunStatus: "failed",
      lastRunExitCode: void 0,
      lastRunError: message
    });
    throw error;
  }
  const runningJob = updateJobRecord(job, {
    lastRunAt: startedAt,
    lastRunSource: "manual",
    lastRunStatus: "running",
    lastRunExitCode: void 0,
    lastRunError: void 0
  });
  if (child.stdout) child.stdout.pipe(logStream);
  if (child.stderr) child.stderr.pipe(logStream);
  child.on("error", (error) => {
    logStream.write(`
=== Run error ${(/* @__PURE__ */ new Date()).toISOString()} ===
${error.message}
`);
    logStream.end();
    updateJobRecord(job, {
      lastRunStatus: "failed",
      lastRunExitCode: void 0,
      lastRunError: error.message
    });
  });
  child.on("close", (code) => {
    const exitCode = typeof code === "number" ? code : void 0;
    logStream.write(`
=== Run complete (${exitCode ?? "unknown"}) ${(/* @__PURE__ */ new Date()).toISOString()} ===
`);
    logStream.end();
    updateJobRecord(job, {
      lastRunStatus: exitCode === 0 ? "success" : "failed",
      lastRunExitCode: exitCode,
      lastRunError: exitCode === 0 ? void 0 : `Exit code ${exitCode ?? "unknown"}`
    });
  });
  return { startedAt, logPath, pid: child.pid, job: runningJob };
}
function describeCron(cron) {
  const parts = cron.split(" ");
  if (parts.length !== 5) return cron;
  const [min6, hour, dom, mon, dow] = parts;
  if (mon === "*" && dom === "*") {
    if (dow === "*" && hour !== "*" && min6 !== "*" && !hour.includes("*") && !hour.includes("/")) {
      const h = parseInt(hour);
      const m = parseInt(min6);
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `daily at ${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
    }
    if (hour.startsWith("*/")) {
      return `every ${hour.slice(2)} hours`;
    }
    if (min6.startsWith("*/")) {
      return `every ${min6.slice(2)} minutes`;
    }
  }
  if (dow !== "*" && dom === "*" && mon === "*") {
    const days2 = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = days2[parseInt(dow)];
    if (day && hour !== "*") {
      const h = parseInt(hour);
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${day}s at ${displayH}:${(min6 || "00").padStart(2, "0")} ${ampm}`;
    }
  }
  return cron;
}
function formatJobDetails(job) {
  const lines = [
    `Job: ${job.name}`,
    `Slug: ${job.slug}`,
    `Schedule: ${job.schedule} (${describeCron(job.schedule)})`,
    `Working Directory: ${job.workdir || homedir()}`
  ];
  const run2 = (() => {
    try {
      return normalizeRunSpec(getJobRun(job));
    } catch {
      return void 0;
    }
  })();
  if (run2?.attachUrl) {
    lines.push(`Attach URL: ${run2.attachUrl}`);
  } else if (job.attachUrl) {
    lines.push(`Attach URL: ${job.attachUrl}`);
  }
  if (run2?.command) {
    lines.push(`Command: ${run2.command}`);
    if (run2.arguments) lines.push(`Arguments: ${run2.arguments}`);
  }
  if (run2?.prompt) {
    lines.push(`Prompt: ${run2.prompt}`);
  } else if (job.prompt) {
    lines.push(`Prompt: ${job.prompt}`);
  }
  if (run2?.files?.length) {
    lines.push(`Files: ${run2.files.join(", ")}`);
  }
  if (run2?.agent) {
    lines.push(`Agent: ${run2.agent}`);
  }
  if (run2?.model) {
    lines.push(`Model: ${run2.model}`);
  }
  if (run2?.variant) {
    lines.push(`Variant: ${run2.variant}`);
  }
  if (run2?.runFormat) {
    lines.push(`Run Format: ${run2.runFormat}`);
  }
  if (run2?.title) {
    lines.push(`Title: ${run2.title}`);
  }
  if (run2?.share) {
    lines.push("Share: true");
  }
  if (run2?.continue) {
    lines.push("Continue: true");
  }
  if (run2?.session) {
    lines.push(`Session: ${run2.session}`);
  }
  if (run2?.port !== void 0) {
    lines.push(`Port: ${run2.port}`);
  }
  lines.push(`Created: ${job.createdAt}`);
  if (job.updatedAt) {
    lines.push(`Updated: ${job.updatedAt}`);
  }
  if (job.lastRunAt) {
    lines.push(`Last Run: ${job.lastRunAt}`);
  }
  if (job.lastRunSource) {
    lines.push(`Last Run Source: ${job.lastRunSource}`);
  }
  if (job.lastRunStatus) {
    lines.push(`Last Run Status: ${job.lastRunStatus}`);
  }
  if (job.lastRunExitCode !== void 0) {
    lines.push(`Last Exit Code: ${job.lastRunExitCode}`);
  }
  if (job.lastRunError) {
    lines.push(`Last Error: ${job.lastRunError}`);
  }
  return lines.join("\n");
}
function getJobLogs(job, options2) {
  const logPath = getLogPath(job);
  if (!existsSync(logPath)) return null;
  const maxChars = options2?.maxChars ?? 5e3;
  const tailLines = options2?.tailLines;
  try {
    if (typeof tailLines === "number" && Number.isFinite(tailLines) && tailLines > 0) {
      const clampedLines = Math.max(1, Math.min(5e3, Math.floor(tailLines)));
      try {
        const output = execFileSync("tail", ["-n", String(clampedLines), logPath], {
          env: buildRunEnvironment()
        }).toString();
        return output.length > maxChars ? output.slice(-maxChars) : output;
      } catch {
        const content2 = readFileSync(logPath, "utf-8");
        const lines = content2.split(/\r?\n/);
        const output = lines.slice(-clampedLines).join("\n");
        return output.length > maxChars ? output.slice(-maxChars) : output;
      }
    }
    const content = readFileSync(logPath, "utf-8");
    return content.length > maxChars ? content.slice(-maxChars) : content;
  } catch {
    return null;
  }
}
async function handleScheduleJob(args2) {
  const format5 = normalizeFormat(args2.format);
  const slug = args2.source ? `${args2.source}-${slugify(args2.name)}` : slugify(args2.name);
  const workdir = normalizeWorkdirPath(args2.workdir || defaultWorkdir());
  const scopeId = deriveScopeId(workdir);
  if (loadScopedJob(scopeId, slug)) {
    return errorResult(
      format5,
      `Job "${slug}" already exists in this workspace scope (${scopeId}). Delete it first or use a different name.`
    );
  }
  if (loadLegacyJob(slug)) {
    return errorResult(
      format5,
      `Job "${slug}" already exists (legacy scheduler storage). Delete it first or use a different name.`
    );
  }
  const parseFiles = (raw) => {
    if (raw === void 0) return void 0;
    if (typeof raw !== "string") return void 0;
    const items = raw.split(",").map((item) => item.trim()).filter(Boolean);
    return items.length ? items : void 0;
  };
  let runFormat;
  try {
    runFormat = parseRunFormatInput(args2.runFormat);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorResult(format5, msg);
  }
  const run2 = {
    prompt: args2.prompt,
    command: args2.command,
    arguments: args2.arguments,
    files: parseFiles(args2.files),
    agent: args2.agent,
    model: args2.model,
    variant: args2.variant,
    title: args2.title,
    share: args2.share,
    continue: args2.continue,
    session: args2.session,
    runFormat,
    attachUrl: args2.attachUrl,
    port: args2.port
  };
  try {
    validateRunSpec(normalizeRunSpec(run2));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorResult(format5, `Invalid run spec: ${msg}`);
  }
  let attachUrl;
  try {
    attachUrl = normalizeAttachUrl(args2.attachUrl);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorResult(format5, msg);
  }
  try {
    validateCronExpression(args2.schedule);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorResult(format5, `Invalid cron schedule: ${msg}`);
  }
  const job = {
    scopeId,
    slug,
    name: args2.name,
    schedule: args2.schedule,
    run: normalizeRunSpec(run2),
    // keep legacy fields as well for backwards-compat / readability
    prompt: args2.prompt,
    source: args2.source,
    workdir,
    attachUrl,
    timeoutSeconds: args2.timeoutSeconds,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    job.invocation = buildOpencodeArgs(job);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorResult(format5, `Failed to build invocation: ${msg}`);
  }
  try {
    saveJob(job);
    const backend = installJob(job);
    const platformName = backend;
    const reliabilityLine = backend === "schtasks" ? "Windows note: scheduled runs use Task Scheduler directly. For advanced reliability guarantees, prefer simple cron schedules or split complex jobs." : backend === "cron" ? "Cron note: missed runs during sleep are not replayed. For catch-up behavior, use launchd or systemd when available." : "The job will run at the scheduled time. If your computer was asleep, it will catch up when it wakes.";
    const primaryLine = run2.command ? `Command: ${run2.command}${run2.arguments ? ` ${run2.arguments}` : ""}` : `Prompt: ${(run2.prompt ?? "").slice(0, 100)}${(run2.prompt ?? "").length > 100 ? "..." : ""}`;
    const attachLine = run2.attachUrl ? `Attach URL: ${run2.attachUrl}
` : "";
    return okResult(
      format5,
      `Scheduled "${args2.name}"

Schedule: ${args2.schedule} (${describeCron(args2.schedule)})
Platform: ${platformName}
Working Directory: ${workdir}
${attachLine}${primaryLine}

${reliabilityLine}

Commands:
- "run ${args2.name} now" - run immediately
- "show my jobs" - list all
- "delete job ${args2.name}" - remove`,
      { job }
    );
  } catch (error) {
    deleteJobFile(job);
    const msg = error instanceof Error ? error.message : String(error);
    return errorResult(format5, `Failed to schedule job: ${msg}`);
  }
}
async function handleListJobs(args2) {
  const format5 = normalizeFormat(args2.format);
  const scopeId = args2.allScopes ? void 0 : deriveScopeId(normalizeWorkdirPath(args2.scopeRoot || defaultWorkdir()));
  let jobs = args2.allScopes ? loadAllJobsAcrossScopes() : loadAllScopedJobs(scopeId);
  if (args2.includeLegacy) {
    jobs = [...jobs, ...loadAllLegacyJobs()];
  }
  if (args2.source) {
    jobs = jobs.filter((j) => j.source === args2.source || j.slug.startsWith(`${args2.source}-`));
  }
  if (jobs.length === 0) {
    const message = args2.source ? `No jobs found for "${args2.source}".` : 'No scheduled jobs yet.\n\nTry: "Schedule a daily job at 9am to search for standing desks"';
    return okResult(format5, message, { jobs: [] });
  }
  const lines = jobs.map((j, i) => {
    const run2 = (() => {
      try {
        return normalizeRunSpec(getJobRun(j));
      } catch {
        return void 0;
      }
    })();
    const preview = run2?.command ? `${run2.command}${run2.arguments ? ` ${run2.arguments}` : ""}` : run2?.prompt ?? j.prompt ?? "(missing prompt)";
    const trimmed = preview.trim();
    const snippet = trimmed.slice(0, 50) + (trimmed.length > 50 ? "..." : "");
    return `${i + 1}. ${j.name} (${j.slug})
   ${describeCron(j.schedule)}
   ${snippet}`;
  });
  return okResult(format5, `Scheduled Jobs

${lines.join("\n\n")}`, { jobs });
}
async function handleGetVersion(args2) {
  const format5 = normalizeFormat(args2.format);
  const packageInfo = loadPackageInfo();
  const opencodePath = findOpencode();
  const opencodeVersion = getOpencodeVersion(opencodePath);
  const lines = [
    `Scheduler Plugin: ${packageInfo.name}@${packageInfo.version}`,
    `Opencode Binary: ${opencodePath}`,
    `Opencode Version: ${opencodeVersion ?? "unknown"}`
  ];
  return okResult(format5, lines.join("\n"), {
    plugin: packageInfo,
    opencode: { path: opencodePath, version: opencodeVersion },
    platform: platform()
  });
}
async function handleGetSkill(args2) {
  const format5 = normalizeFormat(args2.format);
  const skill = getBuiltinSkill(args2.name);
  if (!skill) {
    const available = listBuiltinSkills().map((s) => s.name).join(", ");
    const requested = (args2.name ?? "").trim();
    const label = requested ? `"${requested}"` : "that name";
    return errorResult(format5, `No built-in skill found for ${label}. Available: ${available || "(none)"}`);
  }
  const renderedFiles = Object.entries(skill.files).map(([filename, content]) => `--- ${filename} ---
${content.trim()}
`).join("\n");
  const output = [
    `Skill: ${skill.name}`,
    `Description: ${skill.description}`,
    `Suggested path: ${skill.suggestedPath}`,
    "",
    "Copy the file(s) below into your repo:",
    "",
    renderedFiles
  ].join("\n");
  return okResult(format5, output, { skill });
}
async function handleInstallSkill(args2) {
  const format5 = normalizeFormat(args2.format);
  const skill = getBuiltinSkill(args2.name);
  if (!skill) {
    const available = listBuiltinSkills().map((s) => s.name).join(", ");
    const requested = (args2.name ?? "").trim();
    const label = requested ? `"${requested}"` : "that name";
    return errorResult(format5, `No built-in skill found for ${label}. Available: ${available || "(none)"}`);
  }
  const directory = args2.directory ?? defaultWorkdir();
  const overwrite = args2.overwrite === true;
  try {
    const installed = installBuiltinSkill(skill, directory, overwrite);
    const files = installed.files.map((file) => `- ${file}`).join("\n");
    const output = [
      `Installed skill: ${skill.name}`,
      `Directory: ${installed.directory}`,
      "",
      "Files:",
      files,
      "",
      `Next: add @${skill.name} to the top of scheduled job prompts.`
    ].join("\n");
    return okResult(format5, output, { skill, installed });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorResult(format5, `Failed to install skill: ${msg}`);
  }
}
async function handleGetJob(args2) {
  const format5 = normalizeFormat(args2.format);
  const job = findJobByName(args2.name);
  if (!job) {
    return errorResult(format5, `Job "${args2.name}" not found.`);
  }
  return okResult(format5, formatJobDetails(job), { job });
}
async function handleUpdateJob(args2) {
  const format5 = normalizeFormat(args2.format);
  const job = findJobByName(args2.name);
  if (!job) {
    return errorResult(format5, `Job "${args2.name}" not found.`);
  }
  const updates = {};
  const parseFiles = (raw) => {
    if (raw === void 0) return void 0;
    if (typeof raw !== "string") return void 0;
    const items = raw.split(",").map((item) => item.trim()).filter(Boolean);
    return items.length ? items : void 0;
  };
  const currentRun = (() => {
    try {
      return normalizeRunSpec(getJobRun(job));
    } catch {
      return {};
    }
  })();
  const nextRunCandidate = {
    ...currentRun,
    prompt: args2.prompt !== void 0 ? args2.prompt : currentRun.prompt,
    command: args2.command !== void 0 ? args2.command : currentRun.command,
    arguments: args2.arguments !== void 0 ? args2.arguments : currentRun.arguments,
    files: args2.files !== void 0 ? parseFiles(args2.files) : currentRun.files,
    agent: args2.agent !== void 0 ? args2.agent : currentRun.agent,
    model: args2.model !== void 0 ? args2.model : currentRun.model,
    variant: args2.variant !== void 0 ? args2.variant : currentRun.variant,
    title: args2.title !== void 0 ? args2.title : currentRun.title,
    share: args2.share !== void 0 ? args2.share : currentRun.share,
    continue: args2.continue !== void 0 ? args2.continue : currentRun.continue,
    session: args2.session !== void 0 ? args2.session : currentRun.session,
    runFormat: args2.runFormat !== void 0 ? parseRunFormatInput(args2.runFormat) : currentRun.runFormat,
    attachUrl: args2.attachUrl !== void 0 ? args2.attachUrl : currentRun.attachUrl,
    port: args2.port !== void 0 ? args2.port : currentRun.port
  };
  try {
    updates.run = normalizeRunSpec(nextRunCandidate);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorResult(format5, `Invalid run spec: ${msg}`);
  }
  if (args2.schedule !== void 0) {
    if (!args2.schedule.trim()) {
      return errorResult(format5, "Schedule cannot be empty.");
    }
    try {
      validateCronExpression(args2.schedule);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return errorResult(format5, `Invalid cron schedule: ${msg}`);
    }
    updates.schedule = args2.schedule;
  }
  if (args2.prompt !== void 0) {
    if (!args2.prompt.trim()) {
      return errorResult(format5, "Prompt cannot be empty.");
    }
    updates.prompt = args2.prompt;
  }
  if (args2.workdir !== void 0) {
    if (!args2.workdir.trim()) {
      return errorResult(format5, "Working directory cannot be empty.");
    }
    const normalizedWorkdir = normalizeWorkdirPath(args2.workdir);
    updates.workdir = normalizedWorkdir;
    updates.scopeId = deriveScopeId(normalizedWorkdir);
  }
  if (args2.attachUrl !== void 0) {
    try {
      updates.attachUrl = normalizeAttachUrl(args2.attachUrl);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return errorResult(format5, msg);
    }
  }
  if (args2.timeoutSeconds !== void 0) {
    updates.timeoutSeconds = args2.timeoutSeconds;
  }
  if (Object.keys(updates).length === 0) {
    return errorResult(format5, "No updates provided.");
  }
  const updatedJob = {
    ...job,
    ...updates,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    updatedJob.invocation = buildOpencodeArgs(updatedJob);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorResult(format5, `Failed to build invocation: ${msg}`);
  }
  try {
    const oldScopeId = job.scopeId || deriveScopeId(job.workdir || homedir());
    const nextScopeId = updatedJob.scopeId || deriveScopeId(updatedJob.workdir || homedir());
    const scopeChanged = oldScopeId !== nextScopeId;
    if (scopeChanged) {
      uninstallJob(job);
    }
    saveJob(updatedJob);
    installJob(updatedJob);
    if (scopeChanged) {
      const oldPath = jobFilePath(oldScopeId, job.slug);
      if (existsSync(oldPath)) {
        try {
          unlinkSync(oldPath);
        } catch {
        }
      }
    }
    return okResult(format5, `Updated job "${updatedJob.name}"`, { job: updatedJob });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    try {
      saveJob(job);
      installJob(job);
    } catch {
    }
    return errorResult(format5, `Failed to update job: ${msg}`);
  }
}
async function handleDeleteJob(args2) {
  const format5 = normalizeFormat(args2.format);
  const job = findJobByName(args2.name);
  if (!job) {
    return errorResult(format5, `Job "${args2.name}" not found.`);
  }
  uninstallJob(job);
  deleteJobFile(job);
  const legacyPath = join2(LEGACY_JOBS_DIR, `${job.slug}.json`);
  if (existsSync(legacyPath)) {
    try {
      unlinkSync(legacyPath);
    } catch {
    }
  }
  return okResult(format5, `Deleted job "${job.name}"`, { job });
}
async function handleCleanupGlobal(args2) {
  const format5 = normalizeFormat(args2.format);
  const includeHistory = args2.includeHistory === true;
  const dryRun = args2.confirm !== true;
  const plan = buildGlobalCleanupPlan(includeHistory);
  const execution = executeGlobalCleanup(plan, { dryRun, includeHistory });
  const output = formatGlobalCleanupOutput(execution);
  return okResult(format5, output, {
    dryRun: execution.dryRun,
    includeHistory: execution.includeHistory,
    removed: execution.removed,
    errors: execution.errors,
    scopeIds: plan.scopeIds,
    jobsConsidered: plan.jobsToUninstall.length
  });
}
async function handleRunJob(args2) {
  const format5 = normalizeFormat(args2.format);
  const job = findJobByName(args2.name);
  if (!job) {
    return errorResult(format5, `Job "${args2.name}" not found. Use list_jobs to see available jobs.`);
  }
  const parseFiles = (raw) => {
    if (raw === void 0) return void 0;
    if (typeof raw !== "string") return void 0;
    const items = raw.split(",").map((item) => item.trim()).filter(Boolean);
    return items.length ? items : void 0;
  };
  const baseRun = (() => {
    try {
      return normalizeRunSpec(getJobRun(job));
    } catch {
      return {};
    }
  })();
  const overrideCandidate = {
    ...baseRun,
    prompt: args2.prompt !== void 0 ? args2.prompt : baseRun.prompt,
    command: args2.command !== void 0 ? args2.command : baseRun.command,
    arguments: args2.arguments !== void 0 ? args2.arguments : baseRun.arguments,
    files: args2.files !== void 0 ? parseFiles(args2.files) : baseRun.files,
    agent: args2.agent !== void 0 ? args2.agent : baseRun.agent,
    model: args2.model !== void 0 ? args2.model : baseRun.model,
    variant: args2.variant !== void 0 ? args2.variant : baseRun.variant,
    title: args2.title !== void 0 ? args2.title : baseRun.title,
    share: args2.share !== void 0 ? args2.share : baseRun.share,
    continue: args2.continue !== void 0 ? args2.continue : baseRun.continue,
    session: args2.session !== void 0 ? args2.session : baseRun.session,
    runFormat: args2.runFormat !== void 0 ? parseRunFormatInput(args2.runFormat) : baseRun.runFormat,
    port: args2.port !== void 0 ? args2.port : baseRun.port,
    attachUrl: args2.attachUrl !== void 0 ? args2.attachUrl : baseRun.attachUrl
  };
  let runOverride;
  try {
    runOverride = normalizeRunSpec(overrideCandidate);
    validateRunSpec(runOverride);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorResult(format5, `Invalid run override: ${msg}`);
  }
  const runJob = {
    ...job,
    run: runOverride
  };
  let runResult;
  try {
    runResult = runJobNow(runJob);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return errorResult(format5, `Failed to start job "${job.name}": ${msg}`);
  }
  const logs = getJobLogs(runJob);
  const attachHint = runOverride.attachUrl ? `
Attach: opencode attach ${runOverride.attachUrl}` : "";
  const logSection = logs ? `
Latest logs:
${logs}` : "\nNo logs yet. Check again soon.";
  return okResult(
    format5,
    `Triggered "${job.name}" (fire-and-forget).
Logs: ${runResult.logPath}${attachHint}${logSection}`,
    {
      job: runResult.job ?? job,
      startedAt: runResult.startedAt,
      logPath: runResult.logPath,
      pid: runResult.pid
    }
  );
}
async function handleJobLogs(args2) {
  const format5 = normalizeFormat(args2.format);
  const job = findJobByName(args2.name);
  if (!job) {
    return errorResult(format5, `Job "${args2.name}" not found.`);
  }
  const tailLines = typeof args2.lines === "number" && Number.isFinite(args2.lines) ? args2.lines : 200;
  const logs = getJobLogs(job, { tailLines, maxChars: 2e4 });
  const logPath = getLogPath(job);
  if (!logs) {
    return okResult(format5, `No logs found for "${job.name}". The job may not have run yet.`, {
      job,
      logPath,
      logs: ""
    });
  }
  return okResult(format5, `Logs for ${job.name}

${logs}`, { job, logPath, logs });
}
var ScheduleJobInput = {
  type: "object",
  properties: {
    name: { type: "string", description: "A short name for the job (e.g. 'standing desk search')" },
    schedule: {
      type: "string",
      description: "Cron expression: '0 9 * * *' (daily 9am), '0 */6 * * *' (every 6h), '30 8 * * 1' (Monday 8:30am)"
    },
    prompt: { type: "string", description: "Prompt to run (legacy; prefer run fields)" },
    command: { type: "string", description: "Optional: opencode command to run (maps to --command)" },
    arguments: { type: "string", description: "Optional: arguments string for command mode" },
    files: {
      type: "string",
      description: "Optional: comma-separated list of files/dirs to attach (maps to repeated --file)"
    },
    agent: { type: "string", description: "Optional: agent to use (maps to --agent)" },
    model: { type: "string", description: "Optional: model to use (maps to --model)" },
    variant: { type: "string", description: "Optional: model variant (maps to --variant)" },
    title: { type: "string", description: "Optional: session title (maps to --title)" },
    share: { type: "boolean", description: "Optional: share session (maps to --share)" },
    continue: { type: "boolean", description: "Optional: continue last session (maps to --continue)" },
    session: { type: "string", description: "Optional: session id (maps to --session)" },
    runFormat: { type: "string", description: "Optional: run output format (maps to opencode --format: default|json)" },
    port: { type: "number", description: "Optional: server port for local server (maps to --port)" },
    source: { type: "string", description: "Optional: source app (e.g. 'marketplace') - used for filtering" },
    workdir: {
      type: "string",
      description: "Optional: working directory to run from (for MCP config). Defaults to current directory."
    },
    attachUrl: { type: "string", description: "Optional: attach URL for opencode run (e.g. http://localhost:4096)." },
    timeoutSeconds: { type: "number", description: "Optional: max runtime in seconds (0 disables)." },
    format: { type: "string", description: "Optional: output format ('text' or 'json')." }
  },
  required: ["name", "schedule"],
  additionalProperties: false
};
var ListJobsInput = {
  type: "object",
  properties: {
    source: { type: "string", description: "Filter by source app (e.g. 'marketplace')" },
    allScopes: { type: "boolean", description: "List jobs across all scopes." },
    includeLegacy: { type: "boolean", description: "Include legacy jobs from ~/.config/opencode/jobs" },
    scopeRoot: { type: "string", description: "Optional: scope root directory (defaults to current directory)." },
    format: { type: "string", description: "Optional: output format ('text' or 'json')." }
  },
  required: [],
  additionalProperties: false
};
var GetVersionInput = {
  type: "object",
  properties: {
    format: { type: "string", description: "Optional: output format ('text' or 'json')." }
  },
  required: [],
  additionalProperties: false
};
var GetSkillInput = {
  type: "object",
  properties: {
    name: { type: "string", description: "Skill name (default: scheduled-job-best-practices)" },
    format: { type: "string", description: "Optional: output format ('text' or 'json')." }
  },
  required: [],
  additionalProperties: false
};
var InstallSkillInput = {
  type: "object",
  properties: {
    name: { type: "string", description: "Skill name (default: scheduled-job-best-practices)" },
    directory: { type: "string", description: "Repo root directory to install into (defaults to current directory)." },
    overwrite: { type: "boolean", description: "Overwrite existing files (default false)." },
    format: { type: "string", description: "Optional: output format ('text' or 'json')." }
  },
  required: [],
  additionalProperties: false
};
var NamedJobInput = {
  type: "object",
  properties: {
    name: { type: "string", description: "The job name or slug" },
    format: { type: "string", description: "Optional: output format ('text' or 'json')." }
  },
  required: ["name"],
  additionalProperties: false
};
var DeleteJobInput = {
  type: "object",
  properties: {
    name: { type: "string", description: "The job name or slug to delete" },
    format: { type: "string", description: "Optional: output format ('text' or 'json')." }
  },
  required: ["name"],
  additionalProperties: false
};
var UpdateJobInput = {
  type: "object",
  properties: {
    name: { type: "string", description: "The job name or slug" },
    schedule: { type: "string", description: "Updated cron expression" },
    prompt: { type: "string", description: "Updated prompt (legacy; prefer command/arguments/etc)" },
    command: { type: "string", description: "Updated opencode command (maps to --command)" },
    arguments: { type: "string", description: "Updated command arguments string" },
    files: { type: "string", description: "Updated comma-separated list of files/dirs to attach" },
    agent: { type: "string", description: "Updated agent (maps to --agent)" },
    model: { type: "string", description: "Updated model (maps to --model)" },
    variant: { type: "string", description: "Updated model variant (maps to --variant)" },
    title: { type: "string", description: "Updated session title (maps to --title)" },
    share: { type: "boolean", description: "Updated share flag (maps to --share)" },
    continue: { type: "boolean", description: "Updated continue flag (maps to --continue)" },
    session: { type: "string", description: "Updated session id (maps to --session)" },
    runFormat: { type: "string", description: "Updated run output format (default|json)" },
    port: { type: "number", description: "Updated port (maps to --port)" },
    timeoutSeconds: { type: "number", description: "Updated timeout in seconds (0 disables)" },
    workdir: { type: "string", description: "Updated working directory" },
    attachUrl: { type: "string", description: "Updated attach URL (set to empty to clear)" },
    format: { type: "string", description: "Optional: output format ('text' or 'json')." }
  },
  required: ["name"],
  additionalProperties: false
};
var CleanupGlobalInput = {
  type: "object",
  properties: {
    includeHistory: {
      type: "boolean",
      description: "Also remove run history and logs across all scopes (default false)."
    },
    confirm: { type: "boolean", description: "Set true to execute deletion. Default is dry run with no destructive changes." },
    format: { type: "string", description: "Optional: output format ('text' or 'json')." }
  },
  required: [],
  additionalProperties: false
};
var RunJobInput = {
  type: "object",
  properties: {
    name: { type: "string", description: "The job name or slug" },
    prompt: { type: "string", description: "Override prompt for this run" },
    command: { type: "string", description: "Override command for this run" },
    arguments: { type: "string", description: "Override arguments for command mode" },
    files: { type: "string", description: "Override comma-separated files/dirs to attach" },
    agent: { type: "string", description: "Override agent" },
    model: { type: "string", description: "Override model" },
    variant: { type: "string", description: "Override variant" },
    title: { type: "string", description: "Override title" },
    share: { type: "boolean", description: "Override share flag" },
    continue: { type: "boolean", description: "Override continue flag" },
    session: { type: "string", description: "Override session id" },
    runFormat: { type: "string", description: "Override run output format (default|json)" },
    port: { type: "number", description: "Override port" },
    attachUrl: { type: "string", description: "Override attach URL" },
    format: { type: "string", description: "Optional: output format ('text' or 'json')." }
  },
  required: ["name"],
  additionalProperties: false
};
var JobLogsInput = {
  type: "object",
  properties: {
    name: { type: "string", description: "The job name or slug" },
    lines: { type: "number", description: "Number of lines from the end of the log (default 200)." },
    format: { type: "string", description: "Optional: output format ('text' or 'json')." }
  },
  required: ["name"],
  additionalProperties: false
};
var index_default = plugin_exports.define({
  id: "opencode-scheduler",
  async setup(ctx) {
    if (ctx.location.directory) {
      DEFAULT_WORKDIR = ctx.location.directory;
    }
    await ctx.tool.transform((editor) => {
      editor.add({
        name: "schedule_job",
        description: "Schedule a recurring job to run an opencode prompt. Uses launchd (Mac), systemd (Linux), Windows Task Scheduler, or cron fallback when needed.",
        input: ScheduleJobInput,
        async execute(input) {
          return { content: await handleScheduleJob(input) };
        }
      });
      editor.add({
        name: "list_jobs",
        description: "List all scheduled jobs. Optionally filter by source app.",
        input: ListJobsInput,
        async execute(input) {
          return { content: await handleListJobs(input) };
        }
      });
      editor.add({
        name: "get_version",
        description: "Show the scheduler plugin version and opencode binary info.",
        input: GetVersionInput,
        async execute(input) {
          return { content: await handleGetVersion(input) };
        }
      });
      editor.add({
        name: "get_skill",
        description: "Get built-in skill templates to copy into your project.",
        input: GetSkillInput,
        async execute(input) {
          return { content: await handleGetSkill(input) };
        }
      });
      editor.add({
        name: "install_skill",
        description: "Install a built-in skill into your repo's .opencode/skill directory.",
        input: InstallSkillInput,
        async execute(input) {
          return { content: await handleInstallSkill(input) };
        }
      });
      editor.add({
        name: "get_job",
        description: "Get details for a scheduled job",
        input: NamedJobInput,
        async execute(input) {
          return { content: await handleGetJob(input) };
        }
      });
      editor.add({
        name: "update_job",
        description: "Update a scheduled job",
        input: UpdateJobInput,
        async execute(input) {
          return { content: await handleUpdateJob(input) };
        }
      });
      editor.add({
        name: "delete_job",
        description: "Delete a scheduled job",
        input: DeleteJobInput,
        async execute(input) {
          return { content: await handleDeleteJob(input) };
        }
      });
      editor.add({
        name: "cleanup_global",
        description: "Clean up scheduler artifacts globally across all scopes. Removes job definitions everywhere; optionally remove logs and run history.",
        input: CleanupGlobalInput,
        async execute(input) {
          return { content: await handleCleanupGlobal(input) };
        }
      });
      editor.add({
        name: "run_job",
        description: "Run a scheduled job immediately",
        input: RunJobInput,
        async execute(input) {
          return { content: await handleRunJob(input) };
        }
      });
      editor.add({
        name: "job_logs",
        description: "View the latest logs from a scheduled job",
        input: JobLogsInput,
        async execute(input) {
          return { content: await handleJobLogs(input) };
        }
      });
    });
  }
});
export {
  index_default as default
};
