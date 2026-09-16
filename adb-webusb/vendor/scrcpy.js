var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/base/audio.js
var ScrcpyAudioCodec = class _ScrcpyAudioCodec {
  static Opus = /* @__PURE__ */ new _ScrcpyAudioCodec("opus", 1869641075, "audio/opus", "opus");
  static Aac = /* @__PURE__ */ new _ScrcpyAudioCodec("aac", 6381923, "audio/aac", "mp4a.66");
  static Flac = /* @__PURE__ */ new _ScrcpyAudioCodec("flac", 1718378851, "audio/flac", "flac");
  static Raw = /* @__PURE__ */ new _ScrcpyAudioCodec("raw", 7496055, "audio/raw", "");
  optionValue;
  metadataValue;
  mimeType;
  webCodecId;
  constructor(optionValue, metadataValue, mimeType, webCodecId) {
    this.optionValue = optionValue;
    this.metadataValue = metadataValue;
    this.mimeType = mimeType;
    this.webCodecId = webCodecId;
  }
  toOptionValue() {
    return this.optionValue;
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/base/control-message-type.js
var ScrcpyControlMessageType = {
  InjectKeyCode: 0,
  InjectText: 1,
  InjectTouch: 2,
  InjectScroll: 3,
  BackOrScreenOn: 4,
  ExpandNotificationPanel: 5,
  ExpandSettingPanel: 6,
  CollapseNotificationPanel: 7,
  GetClipboard: 8,
  SetClipboard: 9,
  SetDisplayPower: 10,
  RotateDevice: 11,
  UHidCreate: 12,
  UHidInput: 13,
  UHidDestroy: 14,
  OpenHardKeyboardSettings: 15,
  StartApp: 16,
  ResetVideo: 17
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/base/device-message.js
var ScrcpyDeviceMessageParsers = class {
  #parsers = [];
  get parsers() {
    return this.#parsers;
  }
  #add(id, parser) {
    if (this.#parsers[id]) {
      throw new Error(`Duplicate parser for id ${id}`);
    }
    this.#parsers[id] = parser;
  }
  add(parser) {
    if (Array.isArray(parser.id)) {
      for (const id of parser.id) {
        this.#add(id, parser);
      }
    } else {
      this.#add(parser.id, parser);
    }
    return parser;
  }
  async parse(id, stream) {
    const parser = this.#parsers[id];
    if (!parser) {
      throw new Error(`Unknown device message id ${id}`);
    }
    return parser.parse(id, stream);
  }
  close() {
    for (const parser of this.#parsers) {
      parser.close();
    }
  }
  error(e) {
    for (const parser of this.#parsers) {
      parser.error(e);
    }
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/base/option-value.js
function isScrcpyOptionValue(value) {
  return typeof value === "object" && value !== null && "toOptionValue" in value && typeof value.toOptionValue === "function";
}
function toScrcpyOptionValue(value, empty) {
  if (isScrcpyOptionValue(value)) {
    value = value.toOptionValue();
  }
  if (value === void 0) {
    return empty;
  }
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
    throw new TypeError(`Invalid option value: ${JSON.stringify(value)}`);
  }
  return value.toString();
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/base/video.js
var ScrcpyVideoCodecId = {
  H264: 1748121140,
  H265: 1748121141,
  AV1: 6387249
};
var ScrcpyVideoCodecNameMap = /* @__PURE__ */ (() => {
  const result = /* @__PURE__ */ new Map();
  for (const key in ScrcpyVideoCodecId) {
    const value = ScrcpyVideoCodecId[key];
    result.set(value, key);
  }
  return result;
})();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/index.js
var impl_exports = {};
__export(impl_exports, {
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes,
  Crop: () => Crop,
  Defaults: () => Defaults,
  InjectScrollControlMessage: () => InjectScrollControlMessage,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController,
  SerializeOrder: () => SerializeOrder,
  SetClipboardControlMessage: () => SetClipboardControlMessage,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController,
  parseDisplay: () => parseDisplay,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/android/key-event.js
var AndroidKeyEventAction = {
  Down: 0,
  Up: 1
};
var AndroidKeyEventMeta = {
  None: 0,
  Alt: 2,
  AltLeft: 16,
  AltRight: 32,
  Shift: 1,
  ShiftLeft: 64,
  ShiftRight: 128,
  Ctrl: 4096,
  CtrlLeft: 8192,
  CtrlRight: 16384,
  Meta: 65536,
  MetaLeft: 131072,
  MetaRight: 262144,
  CapsLock: 1048576,
  NumLock: 2097152,
  ScrollLock: 4194304
};
var AndroidKeyCode = {
  AndroidHome: 3,
  AndroidBack: 4,
  AndroidCall: 5,
  AndroidEndCall: 6,
  Digit0: 7,
  Digit1: 8,
  Digit2: 9,
  Digit3: 10,
  Digit4: 11,
  Digit5: 12,
  Digit6: 13,
  Digit7: 14,
  Digit8: 15,
  Digit9: 16,
  /**
   * '*' key.
   */
  Star: 17,
  // Name not verified
  /**
   * '#' key.
   */
  Pound: 18,
  // Name not verified
  /**
   * Directional Pad Up key.
   */
  ArrowUp: 19,
  /**
   * Directional Pad Down key.
   */
  ArrowDown: 20,
  /**
   * Directional Pad Left key.
   */
  ArrowLeft: 21,
  /**
   * Directional Pad Right key.
   */
  ArrowRight: 22,
  /**
   * Directional Pad Center key.
   */
  AndroidDPadCenter: 23,
  VolumeUp: 24,
  // Name not verified
  VolumeDown: 25,
  // Name not verified
  Power: 26,
  // Name not verified
  AndroidCamera: 27,
  Clear: 28,
  // Name not verified
  KeyA: 29,
  KeyB: 30,
  KeyC: 31,
  KeyD: 32,
  KeyE: 33,
  KeyF: 34,
  KeyG: 35,
  KeyH: 36,
  KeyI: 37,
  KeyJ: 38,
  KeyK: 39,
  KeyL: 40,
  KeyM: 41,
  KeyN: 42,
  KeyO: 43,
  KeyP: 44,
  KeyQ: 45,
  KeyR: 46,
  KeyS: 47,
  KeyT: 48,
  KeyU: 49,
  KeyV: 50,
  KeyW: 51,
  KeyX: 52,
  KeyY: 53,
  KeyZ: 54,
  Comma: 55,
  Period: 56,
  AltLeft: 57,
  AltRight: 58,
  ShiftLeft: 59,
  ShiftRight: 60,
  Tab: 61,
  Space: 62,
  AndroidSymbol: 63,
  AndroidExplorer: 64,
  AndroidEnvelope: 65,
  Enter: 66,
  Backspace: 67,
  Backquote: 68,
  Minus: 69,
  Equal: 70,
  BracketLeft: 71,
  BracketRight: 72,
  Backslash: 73,
  Semicolon: 74,
  Quote: 75,
  Slash: 76,
  At: 77,
  // Name not verified
  AndroidNum: 78,
  AndroidHeadsetHook: 79,
  /**
   * Camera Focus key。
   */
  AndroidFocus: 80,
  Plus: 81,
  // Name not verified
  ContextMenu: 82,
  AndroidNotification: 83,
  AndroidSearch: 84,
  PageUp: 92,
  PageDown: 93,
  Escape: 111,
  Delete: 112,
  ControlLeft: 113,
  ControlRight: 114,
  CapsLock: 115,
  ScrollLock: 116,
  MetaLeft: 117,
  MetaRight: 118,
  AndroidFunction: 119,
  PrintScreen: 120,
  Pause: 121,
  Home: 122,
  End: 123,
  Insert: 124,
  AndroidForward: 125,
  F1: 131,
  F2: 132,
  F3: 133,
  F4: 134,
  F5: 135,
  F6: 136,
  F7: 137,
  F8: 138,
  F9: 139,
  F10: 140,
  F11: 141,
  F12: 142,
  NumLock: 143,
  Numpad0: 144,
  Numpad1: 145,
  Numpad2: 146,
  Numpad3: 147,
  Numpad4: 148,
  Numpad5: 149,
  Numpad6: 150,
  Numpad7: 151,
  Numpad8: 152,
  Numpad9: 153,
  NumpadDivide: 154,
  NumpadMultiply: 155,
  NumpadSubtract: 156,
  NumpadAdd: 157,
  NumpadDecimal: 158,
  NumpadComma: 159,
  // Name not verified
  NumpadEnter: 160,
  NumpadEquals: 161,
  // Name not verified
  NumpadLeftParen: 162,
  // Name not verified
  NumpadRightParen: 163,
  // Name not verified
  VolumeMute: 164,
  // Name not verified
  AndroidAppSwitch: 187,
  // Name not verified
  AndroidCut: 277,
  AndroidCopy: 278,
  AndroidPaste: 279
};
var AndroidKeyNames = /* @__PURE__ */ (() => Object.fromEntries(Object.entries(AndroidKeyCode).map(([k, v]) => [v, k])))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/android/motion-event.js
var AndroidMotionEventAction = {
  Down: 0,
  Up: 1,
  Move: 2,
  Cancel: 3,
  Outside: 4,
  PointerDown: 5,
  PointerUp: 6,
  HoverMove: 7,
  Scroll: 8,
  HoverEnter: 9,
  HoverExit: 10,
  ButtonPress: 11,
  ButtonRelease: 12
};
var AndroidMotionEventButton = {
  None: 0,
  Primary: 1,
  Secondary: 2,
  Tertiary: 4,
  Back: 8,
  Forward: 16,
  StylusPrimary: 32,
  StylusSecondary: 64
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/android/screen-power-mode.js
var AndroidScreenPowerMode = {
  Off: 0,
  Normal: 2
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/async/esm/promise-resolver.js
var PromiseResolver = class {
  #promise;
  get promise() {
    return this.#promise;
  }
  #resolve;
  #reject;
  #state = "running";
  get state() {
    return this.#state;
  }
  constructor() {
    this.#promise = new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
  }
  resolve = (value) => {
    this.#resolve(value);
    this.#state = "resolved";
  };
  reject = (reason) => {
    this.#reject(reason);
    this.#state = "rejected";
  };
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/async/esm/maybe-promise.js
function isPromiseLike(value) {
  return typeof value === "object" && value !== null && "then" in value;
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/struct/esm/bipedal.js
function advance(iterator, next) {
  while (true) {
    const { done, value } = iterator.next(next);
    if (done) {
      return value;
    }
    if (isPromiseLike(value)) {
      return value.then((value2) => advance(iterator, { resolved: value2 }), (error) => advance(iterator, { error }));
    }
    next = value;
  }
}
// @__NO_SIDE_EFFECTS__
function bipedal(fn, bindThis) {
  function result(...args) {
    const iterator = fn.call(this, function* (value) {
      if (isPromiseLike(value)) {
        const result2 = yield value;
        if ("resolved" in result2) {
          return result2.resolved;
        } else {
          throw result2.error;
        }
      }
      return value;
    }, ...args);
    return advance(iterator, void 0);
  }
  if (bindThis) {
    return result.bind(bindThis);
  } else {
    return result;
  }
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/struct/esm/field/serialize.js
function defaultFieldSerializer(serializer) {
  return (source, context) => {
    if ("buffer" in context) {
      const buffer2 = serializer(source, context);
      context.buffer.set(buffer2, context.index);
      return buffer2.length;
    } else {
      return serializer(source, context);
    }
  };
}
function byobFieldSerializer(size, serializer) {
  return (source, context) => {
    if ("buffer" in context) {
      context.index ??= 0;
      serializer(source, context);
      return size;
    } else {
      const buffer2 = new Uint8Array(size);
      serializer(source, {
        buffer: buffer2,
        index: 0,
        littleEndian: context.littleEndian
      });
      return buffer2;
    }
  };
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/struct/esm/field/factory.js
// @__NO_SIDE_EFFECTS__
function _field(size, type, serialize3, deserialize, options) {
  const field2 = {
    size,
    type,
    serialize: type === "default" ? defaultFieldSerializer(serialize3) : byobFieldSerializer(size, serialize3),
    deserialize: bipedal(deserialize),
    omitInit: options?.omitInit
  };
  if (options?.init) {
    field2.init = options.init;
  }
  return field2;
}
var field = _field;

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/struct/esm/buffer.js
var EmptyUint8Array = new Uint8Array(0);
function copyMaybeDifferentLength(dest, source, index, length) {
  if (source.length < length) {
    dest.set(source, index);
    dest.fill(0, index + source.length, index + length);
  } else if (source.length === length) {
    dest.set(source, index);
  } else {
    dest.set(source.subarray(0, length), index);
  }
}
// @__NO_SIDE_EFFECTS__
function buffer(lengthOrField, converter) {
  if (typeof lengthOrField === "number") {
    let serialize3;
    let deserialize2;
    let init2;
    if (lengthOrField === 0) {
      serialize3 = () => {
      };
      if (converter) {
        deserialize2 = function* () {
          return converter.convert(EmptyUint8Array);
        };
      } else {
        deserialize2 = function* () {
          return EmptyUint8Array;
        };
      }
    } else {
      serialize3 = (value, { buffer: buffer2, index }) => copyMaybeDifferentLength(buffer2, value, index, lengthOrField);
      if (converter) {
        deserialize2 = function* (then, reader) {
          const array = reader.readExactly(lengthOrField);
          return converter.convert(yield* then(array));
        };
        init2 = (value) => converter.back(value);
      } else {
        deserialize2 = function* (_then, reader) {
          const array = reader.readExactly(lengthOrField);
          return array;
        };
      }
    }
    return field(lengthOrField, "byob", serialize3, deserialize2, { init: init2 });
  }
  if ((typeof lengthOrField === "object" || typeof lengthOrField === "function") && "serialize" in lengthOrField) {
    let deserialize2;
    let init2;
    if (converter) {
      deserialize2 = function* (then, reader, context) {
        const length = yield* then(lengthOrField.deserialize(reader, context));
        const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
        return converter.convert(yield* then(array));
      };
      init2 = (value) => converter.back(value);
    } else {
      deserialize2 = function* (then, reader, context) {
        const length = yield* then(lengthOrField.deserialize(reader, context));
        const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
        return array;
      };
    }
    return field(lengthOrField.size, "default", (value, { littleEndian }) => {
      if (lengthOrField.type === "default") {
        const lengthBuffer = lengthOrField.serialize(value.length, {
          littleEndian
        });
        if (value.length === 0) {
          return lengthBuffer;
        }
        const result = new Uint8Array(lengthBuffer.length + value.length);
        result.set(lengthBuffer, 0);
        result.set(value, lengthBuffer.length);
        return result;
      } else {
        const result = new Uint8Array(lengthOrField.size + value.length);
        lengthOrField.serialize(value.length, {
          buffer: result,
          index: 0,
          littleEndian
        });
        result.set(value, lengthOrField.size);
        return result;
      }
    }, deserialize2, { init: init2 });
  }
  if (typeof lengthOrField === "string") {
    let deserialize2;
    let init2;
    if (converter) {
      deserialize2 = function* (then, reader, { dependencies }) {
        const length = dependencies[lengthOrField];
        const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
        return converter.convert(yield* then(array));
      };
      init2 = (value, dependencies) => {
        const array = converter.back(value);
        dependencies[lengthOrField] = array.length;
        return array;
      };
    } else {
      deserialize2 = function* (_then, reader, { dependencies }) {
        const length = dependencies[lengthOrField];
        const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
        return array;
      };
      init2 = (value, dependencies) => {
        const array = value;
        dependencies[lengthOrField] = array.length;
        return array;
      };
    }
    return field(0, "default", (source) => source, deserialize2, { init: init2 });
  }
  let deserialize;
  let init;
  if (converter) {
    deserialize = function* (then, reader, { dependencies }) {
      const rawLength = dependencies[lengthOrField.field];
      const length = lengthOrField.convert(rawLength);
      const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
      return converter.convert(yield* then(array));
    };
    init = (value, dependencies) => {
      const array = converter.back(value);
      dependencies[lengthOrField.field] = lengthOrField.back(array.length);
      return array;
    };
  } else {
    deserialize = function* (_then, reader, { dependencies }) {
      const rawLength = dependencies[lengthOrField.field];
      const length = lengthOrField.convert(rawLength);
      const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
      return array;
    };
    init = (value, dependencies) => {
      const array = value;
      dependencies[lengthOrField.field] = lengthOrField.back(array.length);
      return array;
    };
  }
  return field(0, "default", (source) => source, deserialize, { init });
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/struct/esm/readable.js
var ExactReadableEndedError = class extends Error {
  constructor() {
    super("ExactReadable ended");
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/struct/esm/struct.js
var StructDeserializeError = class extends Error {
  constructor(message) {
    super(message);
  }
};
var StructNotEnoughDataError = class extends StructDeserializeError {
  constructor() {
    super("The underlying readable was ended before the struct was fully deserialized");
  }
};
var StructEmptyError = class extends StructDeserializeError {
  constructor() {
    super("The underlying readable doesn't contain any more struct");
  }
};
// @__NO_SIDE_EFFECTS__
function struct(fields, options) {
  const fieldList = Object.entries(fields);
  let size = 0;
  let byob = true;
  for (const [, field2] of fieldList) {
    size += field2.size;
    if (byob && field2.type !== "byob") {
      byob = false;
    }
  }
  const littleEndian = options.littleEndian;
  const extra = options.extra ? Object.getOwnPropertyDescriptors(options.extra) : void 0;
  return {
    littleEndian,
    fields,
    extra: options.extra,
    type: byob ? "byob" : "default",
    size,
    serialize(source, bufferOrContext) {
      const temp = { ...source };
      for (const [key, field2] of fieldList) {
        if (key in temp && "init" in field2) {
          const result = field2.init?.(temp[key], temp);
          temp[key] = result;
        }
      }
      const sizes = new Array(fieldList.length);
      const buffers = new Array(fieldList.length);
      {
        const context2 = { littleEndian };
        for (const [index2, [key, field2]] of fieldList.entries()) {
          if (field2.type === "byob") {
            sizes[index2] = field2.size;
          } else {
            buffers[index2] = field2.serialize(temp[key], context2);
            sizes[index2] = buffers[index2].length;
          }
        }
      }
      const size2 = sizes.reduce((sum, size3) => sum + size3, 0);
      let externalBuffer;
      let buffer2;
      let index;
      if (bufferOrContext instanceof Uint8Array) {
        if (bufferOrContext.length < size2) {
          throw new Error("Buffer too small");
        }
        externalBuffer = true;
        buffer2 = bufferOrContext;
        index = 0;
      } else if (typeof bufferOrContext === "object" && "buffer" in bufferOrContext) {
        externalBuffer = true;
        buffer2 = bufferOrContext.buffer;
        index = bufferOrContext.index ?? 0;
        if (buffer2.length - index < size2) {
          throw new Error("Buffer too small");
        }
      } else {
        externalBuffer = false;
        buffer2 = new Uint8Array(size2);
        index = 0;
      }
      const context = {
        buffer: buffer2,
        index,
        littleEndian
      };
      for (const [index2, [key, field2]] of fieldList.entries()) {
        if (buffers[index2]) {
          buffer2.set(buffers[index2], context.index);
        } else {
          field2.serialize(temp[key], context);
        }
        context.index += sizes[index2];
      }
      if (externalBuffer) {
        return size2;
      } else {
        return buffer2;
      }
    },
    deserialize: bipedal(function* (then, reader) {
      const startPosition = reader.position;
      const result = {};
      const context = {
        dependencies: result,
        littleEndian
      };
      try {
        for (const [key, field2] of fieldList) {
          result[key] = yield* then(field2.deserialize(reader, context));
        }
      } catch (e) {
        if (!(e instanceof ExactReadableEndedError)) {
          throw e;
        }
        if (reader.position === startPosition) {
          throw new StructEmptyError();
        } else {
          throw new StructNotEnoughDataError();
        }
      }
      if (extra) {
        Object.defineProperties(result, extra);
      }
      if (options.postDeserialize) {
        return options.postDeserialize.call(result, result);
      } else {
        return result;
      }
    })
  };
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/struct/esm/extend.js
// @__NO_SIDE_EFFECTS__
function extend(base, fields, options) {
  return struct(Object.assign({}, base.fields, fields), {
    littleEndian: options?.littleEndian ?? base.littleEndian,
    extra: base.extra,
    postDeserialize: options?.postDeserialize
  });
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/no-data-view/esm/int16.js
// @__NO_SIDE_EFFECTS__
function getInt16(buffer2, offset, littleEndian) {
  return littleEndian ? (buffer2[offset] | buffer2[offset + 1] << 8) << 16 >> 16 : (buffer2[offset] << 8 | buffer2[offset + 1]) << 16 >> 16;
}
function setInt16(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = value;
    buffer2[offset + 1] = value >> 8;
  } else {
    buffer2[offset] = value >> 8;
    buffer2[offset + 1] = value;
  }
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/no-data-view/esm/int32.js
// @__NO_SIDE_EFFECTS__
function getInt32(buffer2, offset, littleEndian) {
  return littleEndian ? buffer2[offset] | buffer2[offset + 1] << 8 | buffer2[offset + 2] << 16 | buffer2[offset + 3] << 24 : buffer2[offset] << 24 | buffer2[offset + 1] << 16 | buffer2[offset + 2] << 8 | buffer2[offset + 3];
}
function setInt32(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = value;
    buffer2[offset + 1] = value >> 8;
    buffer2[offset + 2] = value >> 16;
    buffer2[offset + 3] = value >> 24;
  } else {
    buffer2[offset] = value >> 24;
    buffer2[offset + 1] = value >> 16;
    buffer2[offset + 2] = value >> 8;
    buffer2[offset + 3] = value;
  }
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/no-data-view/esm/uint16.js
// @__NO_SIDE_EFFECTS__
function getUint16BigEndian(buffer2, offset) {
  return buffer2[offset] << 8 | buffer2[offset + 1];
}
// @__NO_SIDE_EFFECTS__
function getUint16(buffer2, offset, littleEndian) {
  return littleEndian ? buffer2[offset] | buffer2[offset + 1] << 8 : buffer2[offset + 1] | buffer2[offset] << 8;
}
function setUint16(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = value;
    buffer2[offset + 1] = value >> 8;
  } else {
    buffer2[offset] = value >> 8;
    buffer2[offset + 1] = value;
  }
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/no-data-view/esm/uint32.js
// @__NO_SIDE_EFFECTS__
function getUint32BigEndian(buffer2, offset) {
  return (buffer2[offset] << 24 | buffer2[offset + 1] << 16 | buffer2[offset + 2] << 8 | buffer2[offset + 3]) >>> 0;
}
// @__NO_SIDE_EFFECTS__
function getUint32(buffer2, offset, littleEndian) {
  return littleEndian ? (buffer2[offset] | buffer2[offset + 1] << 8 | buffer2[offset + 2] << 16 | buffer2[offset + 3] << 24) >>> 0 : (buffer2[offset] << 24 | buffer2[offset + 1] << 16 | buffer2[offset + 2] << 8 | buffer2[offset + 3]) >>> 0;
}
function setUint32(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = value;
    buffer2[offset + 1] = value >> 8;
    buffer2[offset + 2] = value >> 16;
    buffer2[offset + 3] = value >> 24;
  } else {
    buffer2[offset] = value >> 24;
    buffer2[offset + 1] = value >> 16;
    buffer2[offset + 2] = value >> 8;
    buffer2[offset + 3] = value;
  }
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/no-data-view/esm/uint64.js
function getUint64(buffer2, offset, littleEndian) {
  return littleEndian ? BigInt(buffer2[offset]) | BigInt(buffer2[offset + 1]) << 8n | BigInt(buffer2[offset + 2]) << 16n | BigInt(buffer2[offset + 3]) << 24n | BigInt(buffer2[offset + 4]) << 32n | BigInt(buffer2[offset + 5]) << 40n | BigInt(buffer2[offset + 6]) << 48n | BigInt(buffer2[offset + 7]) << 56n : BigInt(buffer2[offset]) << 56n | BigInt(buffer2[offset + 1]) << 48n | BigInt(buffer2[offset + 2]) << 40n | BigInt(buffer2[offset + 3]) << 32n | BigInt(buffer2[offset + 4]) << 24n | BigInt(buffer2[offset + 5]) << 16n | BigInt(buffer2[offset + 6]) << 8n | BigInt(buffer2[offset + 7]);
}
function setUint64(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = Number(value & 0xffn);
    buffer2[offset + 1] = Number(value >> 8n & 0xffn);
    buffer2[offset + 2] = Number(value >> 16n & 0xffn);
    buffer2[offset + 3] = Number(value >> 24n & 0xffn);
    buffer2[offset + 4] = Number(value >> 32n & 0xffn);
    buffer2[offset + 5] = Number(value >> 40n & 0xffn);
    buffer2[offset + 6] = Number(value >> 48n & 0xffn);
    buffer2[offset + 7] = Number(value >> 56n & 0xffn);
  } else {
    buffer2[offset] = Number(value >> 56n & 0xffn);
    buffer2[offset + 1] = Number(value >> 48n & 0xffn);
    buffer2[offset + 2] = Number(value >> 40n & 0xffn);
    buffer2[offset + 3] = Number(value >> 32n & 0xffn);
    buffer2[offset + 4] = Number(value >> 24n & 0xffn);
    buffer2[offset + 5] = Number(value >> 16n & 0xffn);
    buffer2[offset + 6] = Number(value >> 8n & 0xffn);
    buffer2[offset + 7] = Number(value & 0xffn);
  }
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/struct/esm/number.js
// @__NO_SIDE_EFFECTS__
function number(size, serialize3, deserialize) {
  const fn = (() => fn);
  Object.assign(fn, field(size, "byob", serialize3, deserialize));
  return fn;
}
var u8 = /* @__PURE__ */ number(1, (value, { buffer: buffer2, index }) => {
  buffer2[index] = value;
}, function* (then, reader) {
  const data = yield* then(reader.readExactly(1));
  return data[0];
});
var u16 = /* @__PURE__ */ number(2, (value, { buffer: buffer2, index, littleEndian }) => {
  setUint16(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(2));
  return getUint16(data, 0, littleEndian);
});
var u32 = /* @__PURE__ */ number(4, (value, { buffer: buffer2, index, littleEndian }) => {
  setUint32(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(4));
  return getUint32(data, 0, littleEndian);
});
var s32 = /* @__PURE__ */ number(4, (value, { buffer: buffer2, index, littleEndian }) => {
  setInt32(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(4));
  return getInt32(data, 0, littleEndian);
});
var u64 = /* @__PURE__ */ number(8, (value, { buffer: buffer2, index, littleEndian }) => {
  setUint64(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(8));
  return getUint64(data, 0, littleEndian);
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/struct/esm/utils.js
var { TextEncoder, TextDecoder } = globalThis;
var SharedEncoder = /* @__PURE__ */ new TextEncoder();
var SharedDecoder = /* @__PURE__ */ new TextDecoder();
// @__NO_SIDE_EFFECTS__
function encodeUtf8(input) {
  return SharedEncoder.encode(input);
}
// @__NO_SIDE_EFFECTS__
function decodeUtf8(buffer2) {
  return SharedDecoder.decode(buffer2);
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/struct/esm/string.js
var string = (/* @__NO_SIDE_EFFECTS__ */ (lengthOrField) => {
  const field2 = buffer(lengthOrField, {
    convert: decodeUtf8,
    back: encodeUtf8
  });
  field2.as = () => field2;
  return field2;
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/control/empty.js
var EmptyControlMessage = struct({ type: u8 }, { littleEndian: false });

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/control/inject-key-code.js
var ScrcpyInjectKeyCodeControlMessage = /* @__PURE__ */ (() => struct({
  type: u8(ScrcpyControlMessageType.InjectKeyCode),
  action: u8(),
  keyCode: u32(),
  repeat: u32,
  metaState: u32()
}, { littleEndian: false }))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/control/inject-text.js
var ScrcpyInjectTextControlMessage = struct({ type: u8, text: string(u32) }, { littleEndian: false });

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/control/message-type-map.js
var ScrcpyControlMessageTypeMap = class {
  #types;
  constructor(options) {
    this.#types = options.controlMessageTypes;
  }
  get(type) {
    const value = this.#types.indexOf(type);
    if (value === -1) {
      throw new TypeError("Invalid or unsupported control message type");
    }
    return value;
  }
  fillMessageType(message, type) {
    message.type = this.get(type);
    return message;
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/control/set-screen-power-mode.js
var ScrcpySetDisplayPowerControlMessage = struct({ type: u8, mode: u8() }, { littleEndian: false });

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/control/start-app.js
var ScrcpyStartAppControlMessage = struct({
  type: u8,
  name: string(u8)
}, { littleEndian: false });

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/control/uhid.js
var ScrcpyUHidInputControlMessage = /* @__PURE__ */ (() => struct({
  type: u8(ScrcpyControlMessageType.UHidInput),
  id: u16,
  data: buffer(u16)
}, { littleEndian: false }))();
var ScrcpyUHidDestroyControlMessage = struct({ type: u8, id: u16 }, { littleEndian: false });

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/control/serializer.js
var ScrcpyControlMessageSerializer = class {
  #options;
  #typeMap;
  #scrollController;
  constructor(options) {
    this.#options = options;
    this.#typeMap = new ScrcpyControlMessageTypeMap(options);
    this.#scrollController = options.createScrollController();
  }
  injectKeyCode(message) {
    return ScrcpyInjectKeyCodeControlMessage.serialize(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.InjectKeyCode));
  }
  injectText(text) {
    return ScrcpyInjectTextControlMessage.serialize({
      text,
      type: this.#typeMap.get(ScrcpyControlMessageType.InjectText)
    });
  }
  /**
   * `pressure` is a float value between 0 and 1.
   */
  injectTouch(message) {
    return this.#options.serializeInjectTouchControlMessage(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.InjectTouch));
  }
  /**
   * `scrollX` and `scrollY` are float values between 0 and 1.
   */
  injectScroll(message) {
    return this.#scrollController.serializeScrollMessage(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.InjectScroll));
  }
  backOrScreenOn(action) {
    return this.#options.serializeBackOrScreenOnControlMessage({
      action,
      type: this.#typeMap.get(ScrcpyControlMessageType.BackOrScreenOn)
    });
  }
  setDisplayPower(mode) {
    return ScrcpySetDisplayPowerControlMessage.serialize({
      mode,
      type: this.#typeMap.get(ScrcpyControlMessageType.SetDisplayPower)
    });
  }
  expandNotificationPanel() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.ExpandNotificationPanel)
    });
  }
  expandSettingPanel() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.ExpandSettingPanel)
    });
  }
  collapseNotificationPanel() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.CollapseNotificationPanel)
    });
  }
  rotateDevice() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.RotateDevice)
    });
  }
  setClipboard(message) {
    return this.#options.serializeSetClipboardControlMessage({
      ...message,
      type: this.#typeMap.get(ScrcpyControlMessageType.SetClipboard)
    });
  }
  uHidCreate(message) {
    if (!this.#options.serializeUHidCreateControlMessage) {
      throw new Error("UHid not supported");
    }
    return this.#options.serializeUHidCreateControlMessage(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.UHidCreate));
  }
  uHidInput(message) {
    return ScrcpyUHidInputControlMessage.serialize(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.UHidInput));
  }
  uHidDestroy(id) {
    return ScrcpyUHidDestroyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.UHidDestroy),
      id
    });
  }
  startApp(name, options) {
    if (options?.searchByName) {
      name = "?" + name;
    }
    if (options?.forceStop) {
      name = "+" + name;
    }
    return ScrcpyStartAppControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.StartApp),
      name
    });
  }
  resetVideo() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.ResetVideo)
    });
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/stream.js
var { AbortController } = globalThis;
var ReadableStream = /* @__PURE__ */ (() => {
  const { ReadableStream: ReadableStream2 } = globalThis;
  if (!ReadableStream2.from) {
    ReadableStream2.from = function(iterable) {
      const iterator = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
      return new ReadableStream2({
        async pull(controller) {
          const result = await iterator.next();
          if (result.done) {
            controller.close();
            return;
          }
          controller.enqueue(result.value);
        },
        async cancel(reason) {
          await iterator.return?.(reason);
        }
      });
    };
  }
  if (!ReadableStream2.prototype[Symbol.asyncIterator] || !ReadableStream2.prototype.values) {
    ReadableStream2.prototype.values = async function* (options) {
      const reader = this.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            return;
          }
          yield value;
        }
      } finally {
        if (!options?.preventCancel) {
          await reader.cancel();
        }
        reader.releaseLock();
      }
    };
    ReadableStream2.prototype[Symbol.asyncIterator] = // eslint-disable-next-line @typescript-eslint/unbound-method
    ReadableStream2.prototype.values;
  }
  return ReadableStream2;
})();
var { WritableStream, TransformStream } = globalThis;

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/task-queue.js
var TaskQueue = class {
  #ready;
  #disposed = false;
  enqueue(task, bail = false) {
    if (this.#disposed) {
      throw new Error("TaskQueue is disposed");
    }
    if (!this.#ready) {
      try {
        const result2 = task();
        if (isPromiseLike(result2)) {
          this.#ready = result2.then(() => {
          }, (e) => {
            if (bail) {
              throw e;
            }
          });
        }
        return result2;
      } catch (e) {
        if (bail) {
          const promise = Promise.reject(e);
          void promise.catch(() => {
          });
          this.#ready = promise;
        }
        throw e;
      }
    }
    const result = this.#ready.then(() => {
      if (this.#disposed) {
        throw new Error("TaskQueue is disposed");
      }
      return task();
    });
    this.#ready = result.then(() => {
    }, (e) => {
      if (bail || this.#disposed) {
        throw e;
      }
    });
    return result;
  }
  dispose() {
    this.#disposed = true;
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/push-readable.js
var PushReadableStream = class extends ReadableStream {
  /**
   * Create a new `PushReadableStream` from a source.
   *
   * @param source If `source` returns a `Promise`, the stream will be closed
   * when the `Promise` is resolved, and be errored when the `Promise` is rejected.
   * @param strategy
   */
  constructor(source, strategy, logger) {
    let controller;
    const tasks = new TaskQueue();
    let zeroHighWaterMarkAllowEnqueue = false;
    let waterMarkLow;
    const abortController = new AbortController();
    let stopped = false;
    const enqueue = (chunk) => {
      logger?.({
        source: "producer",
        operation: "enqueue",
        value: chunk,
        phase: "start"
      });
      if (abortController.signal.aborted) {
        logger?.({
          source: "producer",
          operation: "enqueue",
          value: chunk,
          phase: "ignored"
        });
        return false;
      }
      if (controller.desiredSize === null) {
        controller.enqueue(chunk);
        throw new Error("unreachable");
      }
      if (zeroHighWaterMarkAllowEnqueue) {
        zeroHighWaterMarkAllowEnqueue = false;
        controller.enqueue(chunk);
        logger?.({
          source: "producer",
          operation: "enqueue",
          value: chunk,
          phase: "complete"
        });
        return true;
      }
      if (controller.desiredSize <= 0) {
        logger?.({
          source: "producer",
          operation: "enqueue",
          value: chunk,
          phase: "waiting"
        });
        waterMarkLow = new PromiseResolver();
        return waterMarkLow.promise.then(() => {
          controller.enqueue(chunk);
          logger?.({
            source: "producer",
            operation: "enqueue",
            value: chunk,
            phase: "complete"
          });
          return true;
        }, () => {
          logger?.({
            source: "producer",
            operation: "enqueue",
            value: chunk,
            phase: "ignored"
          });
          return false;
        });
      }
      controller.enqueue(chunk);
      logger?.({
        source: "producer",
        operation: "enqueue",
        value: chunk,
        phase: "complete"
      });
      return true;
    };
    const close = (explicit) => {
      logger?.({
        source: "producer",
        operation: "close",
        explicit,
        phase: "start"
      });
      if (abortController.signal.aborted || stopped && !explicit) {
        logger?.({
          source: "producer",
          operation: "close",
          explicit,
          phase: "ignored"
        });
        return;
      }
      controller.close();
      stopped = true;
      waterMarkLow?.reject();
      logger?.({
        source: "producer",
        operation: "close",
        explicit,
        phase: "complete"
      });
    };
    const error = (error2, explicit) => {
      logger?.({
        source: "producer",
        operation: "error",
        explicit,
        phase: "start"
      });
      stopped = true;
      controller.error(error2);
      waterMarkLow?.reject();
      logger?.({
        source: "producer",
        operation: "error",
        explicit,
        phase: "complete"
      });
    };
    super({
      start: (controller_) => {
        controller = controller_;
        const result = source({
          abortSignal: abortController.signal,
          enqueue: async (chunk) => (
            // Run `enqueue`s in serial
            // Use `async/await` to always return a `Promise`
            await tasks.enqueue(() => enqueue(chunk))
          ),
          close() {
            close(true);
          },
          error(e) {
            error(e, true);
          }
        });
        if (!stopped && isPromiseLike(result)) {
          result.then(() => close(false), (e) => error(e, false));
        }
      },
      pull: () => {
        logger?.({
          source: "consumer",
          operation: "pull",
          phase: "start"
        });
        if (waterMarkLow) {
          waterMarkLow.resolve(void 0);
          waterMarkLow = void 0;
        } else if (strategy?.highWaterMark === 0) {
          zeroHighWaterMarkAllowEnqueue = true;
        }
        logger?.({
          source: "consumer",
          operation: "pull",
          phase: "complete"
        });
      },
      cancel: (reason) => {
        logger?.({
          source: "consumer",
          operation: "cancel",
          phase: "start"
        });
        stopped = true;
        abortController.abort(reason);
        waterMarkLow?.reject();
        logger?.({
          source: "consumer",
          operation: "cancel",
          phase: "complete"
        });
      }
    }, strategy);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/try-close.js
async function tryCancel(stream) {
  try {
    await stream.cancel();
    return true;
  } catch {
    return false;
  }
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/buffered.js
var BufferedReadableStream = class {
  #buffered;
  // PERF: `subarray` is slow
  // don't use it until absolutely necessary
  #bufferedOffset = 0;
  #bufferedLength = 0;
  #position = 0;
  get position() {
    return this.#position;
  }
  stream;
  reader;
  constructor(stream) {
    this.stream = stream;
    this.reader = stream.getReader();
  }
  #readBuffered(length) {
    if (!this.#buffered) {
      return void 0;
    }
    const value = this.#buffered.subarray(this.#bufferedOffset, this.#bufferedOffset + length);
    if (this.#bufferedLength > length) {
      this.#position += length;
      this.#bufferedOffset += length;
      this.#bufferedLength -= length;
      return value;
    }
    this.#position += this.#bufferedLength;
    this.#buffered = void 0;
    this.#bufferedOffset = 0;
    this.#bufferedLength = 0;
    return value;
  }
  async #readSource(length) {
    const { done, value } = await this.reader.read();
    if (done) {
      throw new ExactReadableEndedError();
    }
    if (value.length > length) {
      this.#buffered = value;
      this.#bufferedOffset = length;
      this.#bufferedLength = value.length - length;
      this.#position += length;
      return value.subarray(0, length);
    }
    this.#position += value.length;
    return value;
  }
  iterateExactly(length) {
    let state = this.#buffered ? 0 : 1;
    return {
      next: () => {
        switch (state) {
          case 0: {
            const value = this.#readBuffered(length);
            if (value.length === length) {
              state = 2;
            } else {
              length -= value.length;
              state = 1;
            }
            return { done: false, value };
          }
          case 1:
            state = 3;
            return {
              done: false,
              value: this.#readSource(length).then((value) => {
                if (value.length === length) {
                  state = 2;
                } else {
                  length -= value.length;
                  state = 1;
                }
                return value;
              })
            };
          case 2:
            return { done: true, value: void 0 };
          case 3:
            throw new Error("Can't call `next` before previous Promise resolves");
          default:
            throw new Error("unreachable");
        }
      }
    };
  }
  readExactly = bipedal(function* (then, length) {
    let result;
    let index = 0;
    const initial = this.#readBuffered(length);
    if (initial) {
      if (initial.length === length) {
        return initial;
      }
      result = new Uint8Array(length);
      result.set(initial, index);
      index += initial.length;
      length -= initial.length;
    } else {
      result = new Uint8Array(length);
    }
    while (length > 0) {
      const value = yield* then(this.#readSource(length));
      result.set(value, index);
      index += value.length;
      length -= value.length;
    }
    return result;
  });
  /**
   * Return a readable stream with unconsumed data (if any) and
   * all data from the wrapped stream.
   * @returns A `ReadableStream`
   */
  release() {
    if (this.#bufferedLength > 0) {
      return new PushReadableStream(async (controller) => {
        const buffered = this.#buffered.subarray(this.#bufferedOffset);
        await controller.enqueue(buffered);
        controller.abortSignal.addEventListener("abort", () => {
          void tryCancel(this.reader);
        });
        while (true) {
          const { done, value } = await this.reader.read();
          if (done) {
            return;
          }
          await controller.enqueue(value);
        }
      });
    } else {
      this.reader.releaseLock();
      return this.stream;
    }
  }
  async cancel(reason) {
    await this.reader.cancel(reason);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/buffered-transform.js
var BufferedTransformStream = class {
  #readable;
  get readable() {
    return this.#readable;
  }
  #writable;
  get writable() {
    return this.#writable;
  }
  constructor(transform) {
    let bufferedStreamController;
    let writableStreamController;
    const buffered = new BufferedReadableStream(new PushReadableStream((controller) => {
      bufferedStreamController = controller;
    }));
    this.#readable = new ReadableStream({
      async pull(controller) {
        try {
          const value = await transform(buffered);
          controller.enqueue(value);
        } catch (e) {
          if (e instanceof StructEmptyError) {
            controller.close();
            return;
          }
          throw e;
        }
      },
      cancel: (reason) => {
        return writableStreamController.error(reason);
      }
    });
    this.#writable = new WritableStream({
      start(controller) {
        writableStreamController = controller;
      },
      async write(chunk) {
        await bufferedStreamController.enqueue(chunk);
      },
      abort() {
        bufferedStreamController.close();
      },
      close() {
        bufferedStreamController.close();
      }
    });
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/consumable/readable.js
var ConsumableReadableStream = class _ConsumableReadableStream extends ReadableStream {
  static async enqueue(controller, chunk) {
    const output = new Consumable(chunk);
    controller.enqueue(output);
    await output.consumed;
  }
  constructor(source, strategy) {
    let wrappedController;
    let wrappedStrategy;
    if (strategy) {
      wrappedStrategy = {};
      if ("highWaterMark" in strategy) {
        wrappedStrategy.highWaterMark = strategy.highWaterMark;
      }
      if ("size" in strategy) {
        wrappedStrategy.size = (chunk) => {
          return strategy.size(chunk.value);
        };
      }
    }
    super({
      start(controller) {
        wrappedController = {
          enqueue(chunk) {
            return _ConsumableReadableStream.enqueue(controller, chunk);
          },
          close() {
            controller.close();
          },
          error(reason) {
            controller.error(reason);
          }
        };
        return source.start?.(wrappedController);
      },
      pull() {
        return source.pull?.(wrappedController);
      },
      cancel(reason) {
        return source.cancel?.(reason);
      }
    }, wrappedStrategy);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/consumable/wrap-byte-readable.js
var ConsumableWrapByteReadableStream = class extends ReadableStream {
  constructor(stream, chunkSize, min) {
    const reader = stream.getReader({ mode: "byob" });
    let array = new Uint8Array(chunkSize);
    super({
      async pull(controller) {
        const { done, value } = await reader.read(array, { min });
        if (done) {
          controller.close();
          return;
        }
        await ConsumableReadableStream.enqueue(controller, value);
        array = new Uint8Array(value.buffer);
      },
      cancel(reason) {
        return reader.cancel(reason);
      }
    });
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/consumable/wrap-writable.js
var ConsumableWrapWritableStream = class extends WritableStream {
  constructor(stream) {
    const writer = stream.getWriter();
    super({
      write(chunk) {
        return chunk.tryConsume((chunk2) => writer.write(chunk2));
      },
      abort(reason) {
        return writer.abort(reason);
      },
      close() {
        return writer.close();
      }
    });
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/consumable/writable.js
var ConsumableWritableStream = class extends WritableStream {
  static async write(writer, value) {
    const consumable = new Consumable(value);
    await writer.write(consumable);
    await consumable.consumed;
  }
  constructor(sink, strategy) {
    let wrappedStrategy;
    if (strategy) {
      wrappedStrategy = {};
      if ("highWaterMark" in strategy) {
        wrappedStrategy.highWaterMark = strategy.highWaterMark;
      }
      if ("size" in strategy) {
        wrappedStrategy.size = (chunk) => {
          return strategy.size(chunk instanceof Consumable ? chunk.value : chunk);
        };
      }
    }
    super({
      start(controller) {
        return sink.start?.(controller);
      },
      write(chunk, controller) {
        return chunk.tryConsume((chunk2) => sink.write?.(chunk2, controller));
      },
      abort(reason) {
        return sink.abort?.(reason);
      },
      close() {
        return sink.close?.();
      }
    }, wrappedStrategy);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/task.js
var { console } = globalThis;
var createTask = /* @__PURE__ */ (() => console?.createTask?.bind(console) ?? (() => ({
  run(callback) {
    return callback();
  }
})))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/consumable.js
var Consumable = class {
  static WritableStream = ConsumableWritableStream;
  static WrapWritableStream = ConsumableWrapWritableStream;
  static ReadableStream = ConsumableReadableStream;
  static WrapByteReadableStream = ConsumableWrapByteReadableStream;
  #task;
  #resolver;
  value;
  consumed;
  constructor(value) {
    this.#task = createTask("Consumable");
    this.value = value;
    this.#resolver = new PromiseResolver();
    this.consumed = this.#resolver.promise;
  }
  consume() {
    this.#resolver.resolve();
  }
  error(error) {
    this.#resolver.reject(error);
  }
  tryConsume(callback) {
    try {
      let result = this.#task.run(() => callback(this.value));
      if (isPromiseLike(result)) {
        result = result.then((value) => {
          this.#resolver.resolve();
          return value;
        }, (e) => {
          this.#resolver.reject(e);
          throw e;
        });
      } else {
        this.#resolver.resolve();
      }
      return result;
    } catch (e) {
      this.#resolver.reject(e);
      throw e;
    }
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/stream-extra/esm/struct-deserialize.js
var StructDeserializeStream = class extends BufferedTransformStream {
  constructor(struct2) {
    super((stream) => {
      return struct2.deserialize(stream);
    });
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/control/writer.js
var ScrcpyControlMessageWriter = class {
  #writer;
  #serializer;
  constructor(writer, options) {
    this.#writer = writer;
    this.#serializer = new ScrcpyControlMessageSerializer(options);
  }
  write(message) {
    return Consumable.WritableStream.write(this.#writer, message);
  }
  injectKeyCode(message) {
    return this.write(this.#serializer.injectKeyCode(message));
  }
  injectText(text) {
    return this.write(this.#serializer.injectText(text));
  }
  /**
   * `pressure` is a float value between 0 and 1.
   */
  injectTouch(message) {
    return this.write(this.#serializer.injectTouch(message));
  }
  /**
   * `scrollX` and `scrollY` are float values between 0 and 1.
   */
  async injectScroll(message) {
    const data = this.#serializer.injectScroll(message);
    if (data) {
      await this.write(data);
    }
  }
  async backOrScreenOn(action) {
    const data = this.#serializer.backOrScreenOn(action);
    if (data) {
      await this.write(data);
    }
  }
  setScreenPowerMode(mode) {
    return this.write(this.#serializer.setDisplayPower(mode));
  }
  expandNotificationPanel() {
    return this.write(this.#serializer.expandNotificationPanel());
  }
  expandSettingPanel() {
    return this.write(this.#serializer.expandSettingPanel());
  }
  collapseNotificationPanel() {
    return this.write(this.#serializer.collapseNotificationPanel());
  }
  rotateDevice() {
    return this.write(this.#serializer.rotateDevice());
  }
  async setClipboard(message) {
    const result = this.#serializer.setClipboard(message);
    if (result instanceof Uint8Array) {
      await this.write(result);
    } else {
      await this.write(result[0]);
      await result[1];
    }
  }
  uHidCreate(message) {
    return this.write(this.#serializer.uHidCreate(message));
  }
  uHidInput(message) {
    return this.write(this.#serializer.uHidInput(message));
  }
  uHidDestroy(id) {
    return this.write(this.#serializer.uHidDestroy(id));
  }
  startApp(name, options) {
    return this.write(this.#serializer.startApp(name, options));
  }
  resetVideo() {
    return this.write(this.#serializer.resetVideo());
  }
  releaseLock() {
    this.#writer.releaseLock();
  }
  async close() {
    await this.#writer.close();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/back-or-screen-on.js
var BackOrScreenOnControlMessage = EmptyControlMessage;
function serializeBackOrScreenOnControlMessage(message) {
  if (message.action === AndroidKeyEventAction.Down) {
    return BackOrScreenOnControlMessage.serialize(message);
  }
  return void 0;
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/clipboard-stream.js
var ClipboardDeviceMessage = struct({ content: string(u32) }, { littleEndian: false });
var ClipboardStream = class extends PushReadableStream {
  #controller;
  id = 0;
  constructor() {
    let controller;
    super((controller_) => {
      controller = controller_;
    });
    this.#controller = controller;
  }
  async parse(_id, stream) {
    const message = await ClipboardDeviceMessage.deserialize(stream);
    await this.#controller.enqueue(message.content);
  }
  close() {
    this.#controller.close();
  }
  error(e) {
    this.#controller.error(e);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/control-message-types.js
var ControlMessageTypes = /* @__PURE__ */ (() => [
  /*  0 */
  ScrcpyControlMessageType.InjectKeyCode,
  /*  1 */
  ScrcpyControlMessageType.InjectText,
  /*  2 */
  ScrcpyControlMessageType.InjectTouch,
  /*  3 */
  ScrcpyControlMessageType.InjectScroll,
  /*  4 */
  ScrcpyControlMessageType.BackOrScreenOn,
  /*  5 */
  ScrcpyControlMessageType.ExpandNotificationPanel,
  /*  6 */
  ScrcpyControlMessageType.CollapseNotificationPanel,
  /*  7 */
  ScrcpyControlMessageType.GetClipboard,
  /*  8 */
  ScrcpyControlMessageType.SetClipboard,
  /*  9 */
  ScrcpyControlMessageType.SetDisplayPower,
  /* 10 */
  ScrcpyControlMessageType.RotateDevice
])();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/init.js
var VideoOrientation = {
  Unlocked: -1,
  Portrait: 0,
  Landscape: 1,
  PortraitFlipped: 2,
  LandscapeFlipped: 3
};
function toDashCase(input) {
  return input.replace(/([A-Z])/g, "-$1").toLowerCase();
}
var CodecOptionTypes = {
  repeatPreviousFrameAfter: "long",
  maxPtsGapToEncoder: "long"
};
var CodecOptions = class _CodecOptions {
  static Empty = /* @__PURE__ */ new _CodecOptions();
  options;
  constructor(options = {}) {
    for (const [key, value] of Object.entries(options)) {
      if (value === void 0) {
        continue;
      }
      if (typeof value !== "number") {
        throw new Error(`Invalid option value for ${key}: ${String(value)}`);
      }
    }
    this.options = options;
  }
  toOptionValue() {
    const entries = Object.entries(this.options).filter(([, value]) => value !== void 0);
    if (entries.length === 0) {
      return void 0;
    }
    return entries.map(([key, value]) => {
      let result = toDashCase(key);
      const type = CodecOptionTypes[key];
      if (type) {
        result += `:${type}`;
      }
      result += `=${value}`;
      return result;
    }).join(",");
  }
};
var Crop = class {
  width;
  height;
  x;
  y;
  constructor(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
  }
  toOptionValue() {
    return `${this.width}:${this.height}:${this.x}:${this.y}`;
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/defaults.js
var Defaults = {
  logLevel: "debug",
  maxSize: 0,
  bitRate: 8e6,
  maxFps: 0,
  lockVideoOrientation: VideoOrientation.Unlocked,
  tunnelForward: false,
  crop: void 0,
  sendFrameMeta: true,
  control: true,
  displayId: 0,
  showTouches: false,
  stayAwake: false,
  codecOptions: void 0
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/utils/clamp.js
function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/utils/constants.js
var DefaultServerPath = "/data/local/tmp/scrcpy-server.jar";

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/utils/omit.js
// @__NO_SIDE_EFFECTS__
function omit(value, ...keys) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/inject-touch.js
var UnsignedFloat = field(2, "byob", (source, { buffer: buffer2, index, littleEndian }) => {
  source = clamp(source, -1, 1);
  source = source === 1 ? 65535 : source * 65536;
  setUint16(buffer2, index, source, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(2));
  const value = getUint16(data, 0, littleEndian);
  return value === 65535 ? 1 : value / 65536;
});
var PointerId = {
  Mouse: -1n,
  Finger: -2n,
  VirtualMouse: -3n,
  VirtualFinger: -4n
};
var InjectTouchControlMessage = struct({
  type: u8,
  action: u8(),
  pointerId: u64,
  pointerX: u32,
  pointerY: u32,
  videoWidth: u16,
  videoHeight: u16,
  pressure: UnsignedFloat,
  buttons: u32
}, { littleEndian: false });
function serializeInjectTouchControlMessage(message) {
  return InjectTouchControlMessage.serialize(message);
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/media-stream-transformer.js
var MediaStreamRawPacket = struct({ pts: u64, data: buffer(u32) }, { littleEndian: false });
var PtsConfig = 1n << 63n;
function createMediaStreamTransformer(options) {
  if (!options.sendFrameMeta) {
    return new TransformStream({
      transform(chunk, controller) {
        controller.enqueue({
          type: "data",
          data: chunk
        });
      }
    });
  }
  const deserializeStream = new StructDeserializeStream(MediaStreamRawPacket);
  return {
    writable: deserializeStream.writable,
    readable: deserializeStream.readable.pipeThrough(new TransformStream({
      transform(packet, controller) {
        if (packet.pts === PtsConfig) {
          controller.enqueue({
            type: "configuration",
            data: packet.data
          });
          return;
        }
        controller.enqueue({
          type: "data",
          pts: packet.pts,
          data: packet.data
        });
      }
    }))
  };
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/parse-display.js
function parseDisplay(line) {
  const match = line.match(/^\s+scrcpy --display (\d+)$/);
  if (match) {
    return {
      id: Number.parseInt(match[1], 10)
    };
  }
  return void 0;
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/parse-video-stream-metadata.js
async function readString(stream, maxLength) {
  const buffer2 = await stream.readExactly(maxLength);
  return decodeUtf8(buffer2.subarray(0, buffer2.indexOf(0)));
}
async function readU16(stream) {
  const buffer2 = await stream.readExactly(2);
  return getUint16BigEndian(buffer2, 0);
}
async function readU32(stream) {
  const buffer2 = await stream.readExactly(4);
  return getUint32BigEndian(buffer2, 0);
}
async function parseVideoStreamMetadata(stream) {
  const buffered = new BufferedReadableStream(stream);
  const metadata = {
    codec: ScrcpyVideoCodecId.H264
  };
  metadata.deviceName = await readString(buffered, 64);
  metadata.width = await readU16(buffered);
  metadata.height = await readU16(buffered);
  return { stream: buffered.release(), metadata };
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/scroll-controller.js
var InjectScrollControlMessage = struct({
  type: u8,
  pointerX: u32,
  pointerY: u32,
  videoWidth: u16,
  videoHeight: u16,
  scrollX: s32,
  scrollY: s32
}, { littleEndian: false });
var ScrollController = class {
  #accumulatedX = 0;
  #accumulatedY = 0;
  processMessage(message) {
    if (message.scrollX) {
      if (Math.sign(message.scrollX) !== Math.sign(this.#accumulatedX)) {
        this.#accumulatedX = message.scrollX;
      } else {
        this.#accumulatedX += message.scrollX;
      }
    }
    if (message.scrollY) {
      if (Math.sign(message.scrollY) !== Math.sign(this.#accumulatedY)) {
        this.#accumulatedY = message.scrollY;
      } else {
        this.#accumulatedY += message.scrollY;
      }
    }
    const integerX = this.#accumulatedX | 0;
    this.#accumulatedX -= integerX;
    const integerY = this.#accumulatedY | 0;
    this.#accumulatedY -= integerY;
    if (integerX === 0 && integerY === 0) {
      return void 0;
    }
    message.scrollX = integerX;
    message.scrollY = integerY;
    return message;
  }
  serializeScrollMessage(message) {
    const processed = this.processMessage(message);
    if (!processed) {
      return void 0;
    }
    return InjectScrollControlMessage.serialize(processed);
  }
};
function createScrollController() {
  return new ScrollController();
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/serialize-order.js
var SerializeOrder = [
  "logLevel",
  "maxSize",
  "bitRate",
  "maxFps",
  "lockVideoOrientation",
  "tunnelForward",
  "crop",
  "sendFrameMeta",
  "control",
  "displayId",
  "showTouches",
  "stayAwake",
  "codecOptions"
];

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/serialize.js
function serialize(options, order) {
  return order.map((key) => toScrcpyOptionValue(options[key], "-"));
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/set-clipboard.js
var SetClipboardControlMessage = struct({ type: u8, content: string(u32) }, { littleEndian: false });
function serializeSetClipboardControlMessage(message) {
  return SetClipboardControlMessage.serialize(message);
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/impl/set-list-display.js
function setListDisplays(options) {
  options.displayId = -1;
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15/options.js
var ScrcpyOptions1_15 = class {
  static Defaults = Defaults;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults, ...init };
    if (this.value.control) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
    }
  }
  serialize() {
    return serialize(this.value, SerializeOrder);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata(stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage(message);
  }
  serializeSetClipboardControlMessage(message) {
    return serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_15_1.js
var ScrcpyOptions1_15_1 = class extends ScrcpyOptions1_15 {
  constructor(init) {
    super(init);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_16.js
var ScrcpyOptions1_16 = class extends ScrcpyOptions1_15 {
  constructor(init) {
    super(init);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_17/impl/index.js
var impl_exports2 = {};
__export(impl_exports2, {
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes,
  Crop: () => Crop,
  Defaults: () => Defaults2,
  EncoderRegex: () => EncoderRegex,
  InjectScrollControlMessage: () => InjectScrollControlMessage,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController,
  SerializeOrder: () => SerializeOrder2,
  SetClipboardControlMessage: () => SetClipboardControlMessage,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_17/impl/defaults.js
var Defaults2 = /* @__PURE__ */ (() => ({
  ...impl_exports.Defaults,
  encoderName: void 0
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_17/impl/parse-encoder.js
function parseEncoder(line, encoderNameRegex) {
  const match = line.match(encoderNameRegex);
  if (match) {
    return { type: "video", name: match[1] };
  }
  return void 0;
}
var EncoderRegex = /^\s+scrcpy --encoder-name '([^']+)'$/;

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_17/impl/serialize-order.js
var SerializeOrder2 = /* @__PURE__ */ (() => [
  ...impl_exports.SerializeOrder,
  "encoderName"
])();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_17/impl/set-list-encoder.js
function setListEncoders(options) {
  options.encoderName = "_";
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_17/options.js
var ScrcpyOptions1_17 = class {
  static Defaults = Defaults2;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults2, ...init };
    if (this.value.control) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
    }
  }
  serialize() {
    return serialize(this.value, SerializeOrder2);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata(stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage(message);
  }
  serializeSetClipboardControlMessage(message) {
    return serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_18/impl/index.js
var impl_exports3 = {};
__export(impl_exports3, {
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults3,
  EncoderRegex: () => EncoderRegex2,
  InjectScrollControlMessage: () => InjectScrollControlMessage,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_18/impl/back-or-screen-on.js
var BackOrScreenOnControlMessage2 = extend(impl_exports2.BackOrScreenOnControlMessage, { action: u8() });
function serializeBackOrScreenOnControlMessage2(message) {
  return BackOrScreenOnControlMessage2.serialize(message);
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_18/impl/control-message-types.js
var ControlMessageTypes2 = /* @__PURE__ */ (() => {
  const result = impl_exports2.ControlMessageTypes.slice();
  result.splice(6, 0, ScrcpyControlMessageType.ExpandSettingPanel);
  return result;
})();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_18/impl/init.js
var VideoOrientation2 = {
  Initial: -2,
  Unlocked: -1,
  Portrait: 0,
  Landscape: 1,
  PortraitFlipped: 2,
  LandscapeFlipped: 3
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_18/impl/defaults.js
var Defaults3 = /* @__PURE__ */ (() => ({
  ...impl_exports2.Defaults,
  logLevel: "debug",
  lockVideoOrientation: VideoOrientation2.Unlocked,
  powerOffOnClose: false
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_18/impl/parse-encoder.js
var EncoderRegex2 = /^\s+scrcpy --encoder '([^']+)'$/;

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_18/impl/serialize-order.js
var SerializeOrder3 = /* @__PURE__ */ (() => [
  ...impl_exports2.SerializeOrder,
  "powerOffOnClose"
])();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_18/options.js
var ScrcpyOptions1_18 = class {
  static Defaults = Defaults3;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults3, ...init };
    if (this.value.control) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
    }
  }
  serialize() {
    return serialize(this.value, SerializeOrder3);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex2);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata(stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_19.js
var ScrcpyOptions1_19 = class extends ScrcpyOptions1_18 {
  constructor(init) {
    super(init);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_20.js
var ScrcpyOptions1_20 = class extends ScrcpyOptions1_18 {
  constructor(init) {
    super(init);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_21/impl/index.js
var impl_exports4 = {};
__export(impl_exports4, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults4,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_21/impl/defaults.js
var Defaults4 = /* @__PURE__ */ (() => ({
  ...impl_exports3.Defaults,
  clipboardAutosync: true
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_21/impl/parse-encoder.js
var EncoderRegex3 = /^\s+scrcpy --encoder-name '([^']+)'$/;

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_21/impl/serialize.js
function toSnakeCase(input) {
  return input.replace(/([A-Z])/g, "_$1").toLowerCase();
}
function serialize2(options, defaults) {
  const result = [];
  for (const [key, value] of Object.entries(options)) {
    const serializedValue = toScrcpyOptionValue(value, void 0);
    if (serializedValue === void 0) {
      continue;
    }
    const defaultValue = toScrcpyOptionValue(defaults[key], void 0);
    if (serializedValue === defaultValue) {
      continue;
    }
    result.push(`${toSnakeCase(key)}=${serializedValue}`);
  }
  return result;
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_21/impl/set-clipboard.js
var AckClipboardDeviceMessage = struct({ sequence: u64 }, { littleEndian: false });
var SetClipboardControlMessage2 = struct({
  type: u8,
  sequence: u64,
  paste: u8(),
  content: string(u32)
}, { littleEndian: false });
var AckClipboardHandler = class {
  #resolvers = /* @__PURE__ */ new Map();
  #closed = false;
  id = 1;
  async parse(_id, stream) {
    const message = await AckClipboardDeviceMessage.deserialize(stream);
    const resolver = this.#resolvers.get(message.sequence);
    if (resolver) {
      resolver.resolve();
      this.#resolvers.delete(message.sequence);
    }
  }
  close() {
    for (const resolver of this.#resolvers.values()) {
      resolver.reject();
    }
    this.#resolvers.clear();
    this.#closed = true;
  }
  error(e) {
    for (const resolver of this.#resolvers.values()) {
      resolver.reject(e);
    }
    this.#resolvers.clear();
    this.#closed = true;
  }
  serializeSetClipboardControlMessage(message) {
    if (message.sequence === 0n) {
      return SetClipboardControlMessage2.serialize(message);
    }
    if (this.#closed) {
      throw new Error();
    }
    const resolver = new PromiseResolver();
    this.#resolvers.set(message.sequence, resolver);
    return [
      SetClipboardControlMessage2.serialize(message),
      resolver.promise
    ];
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_21/options.js
var ScrcpyOptions1_21 = class {
  static Defaults = Defaults4;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults4, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults4);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex3);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata(stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_22/impl/index.js
var impl_exports5 = {};
__export(impl_exports5, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults5,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage2,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController2,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController2,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata2,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_22/impl/defaults.js
var Defaults5 = /* @__PURE__ */ (() => ({
  ...impl_exports4.Defaults,
  downsizeOnError: true,
  sendDeviceMeta: true,
  sendDummyByte: true
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_22/impl/parse-video-stream-metadata.js
async function parseVideoStreamMetadata2(options, stream) {
  if (!options.sendDeviceMeta) {
    return { stream, metadata: { codec: ScrcpyVideoCodecId.H264 } };
  } else {
    return impl_exports4.parseVideoStreamMetadata(stream);
  }
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_22/impl/scroll-controller.js
var InjectScrollControlMessage2 = extend(impl_exports4.InjectScrollControlMessage, { buttons: s32 });
var ScrollController2 = class extends impl_exports4.ScrollController {
  serializeScrollMessage(message) {
    const processed = this.processMessage(message);
    if (!processed) {
      return void 0;
    }
    return InjectScrollControlMessage2.serialize(processed);
  }
};
function createScrollController2() {
  return new ScrollController2();
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_22/options.js
var ScrcpyOptions1_22 = class {
  static Defaults = Defaults5;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults5, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults5);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex3);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata2(this.value, stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController2();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_23/impl/index.js
var impl_exports6 = {};
__export(impl_exports6, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults6,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage2,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController2,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController2,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata2,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_23/impl/defaults.js
var Defaults6 = /* @__PURE__ */ (() => ({
  ...impl_exports5.Defaults,
  cleanup: true
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_23/impl/media-stream-transformer.js
var PtsKeyframe = 1n << 62n;
function createMediaStreamTransformer2(options) {
  if (!options.sendFrameMeta) {
    return new TransformStream({
      transform(chunk, controller) {
        controller.enqueue({
          type: "data",
          data: chunk
        });
      }
    });
  }
  const deserializeStream = new StructDeserializeStream(impl_exports5.MediaStreamRawPacket);
  return {
    writable: deserializeStream.writable,
    readable: deserializeStream.readable.pipeThrough(new TransformStream({
      transform(packet, controller) {
        if (packet.pts === impl_exports5.PtsConfig) {
          controller.enqueue({
            type: "configuration",
            data: packet.data
          });
          return;
        }
        if (packet.pts & PtsKeyframe) {
          controller.enqueue({
            type: "data",
            keyframe: true,
            pts: packet.pts & ~PtsKeyframe,
            data: packet.data
          });
          return;
        }
        controller.enqueue({
          type: "data",
          keyframe: false,
          pts: packet.pts,
          data: packet.data
        });
      }
    }))
  };
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_23/options.js
var ScrcpyOptions1_23 = class {
  static Defaults = Defaults6;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults6, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults6);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex3);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata2(this.value, stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController2();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_24/impl/defaults.js
var Defaults7 = /* @__PURE__ */ (() => ({
  ...impl_exports6.Defaults,
  powerOn: true
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_24/options.js
var ScrcpyOptions1_24 = class {
  static Defaults = Defaults7;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults7, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults7);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex3);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata2(this.value, stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController2();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_25/impl/index.js
var impl_exports7 = {};
__export(impl_exports7, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults7,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata2,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_25/impl/scroll-controller.js
var SignedFloat = field(2, "byob", (value, { buffer: buffer2, index, littleEndian }) => {
  value = clamp(value, -1, 1);
  value = value === 1 ? 32767 : value * 32768;
  setInt16(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(2));
  const value = getInt16(data, 0, littleEndian);
  return value === 32767 ? 1 : value / 32768;
});
var InjectScrollControlMessage3 = /* @__PURE__ */ (() => struct({
  type: u8(ScrcpyControlMessageType.InjectScroll),
  pointerX: u32,
  pointerY: u32,
  videoWidth: u16,
  videoHeight: u16,
  scrollX: SignedFloat,
  scrollY: SignedFloat,
  buttons: u32
}, { littleEndian: false }))();
var ScrollController3 = class {
  serializeScrollMessage(message) {
    return InjectScrollControlMessage3.serialize(message);
  }
};
function createScrollController3() {
  return new ScrollController3();
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/1_25/options.js
var ScrcpyOptions1_25 = class {
  static Defaults = Defaults7;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults7, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults7);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex3);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata2(this.value, stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_0/impl/index.js
var impl_exports8 = {};
__export(impl_exports8, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults8,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay2,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_0/impl/defaults.js
var Defaults8 = /* @__PURE__ */ (() => ({
  ...omit(impl_exports7.Defaults, "bitRate", "codecOptions", "encoderName"),
  scid: void 0,
  videoCodec: "h264",
  videoBitRate: 8e6,
  videoCodecOptions: void 0,
  videoEncoder: void 0,
  audio: true,
  audioCodec: "opus",
  audioBitRate: 128e3,
  audioCodecOptions: void 0,
  audioEncoder: void 0,
  listEncoders: false,
  listDisplays: false,
  sendCodecMeta: true
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_0/impl/init.js
var InstanceId = class _InstanceId {
  static NONE = /* @__PURE__ */ new _InstanceId(-1);
  static random() {
    return new _InstanceId(Math.random() * 2147483648 | 0);
  }
  value;
  constructor(value) {
    this.value = value;
  }
  toOptionValue() {
    if (this.value < 0) {
      return void 0;
    }
    return this.value.toString(16);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_0/impl/inject-touch.js
var InjectTouchControlMessage2 = /* @__PURE__ */ (() => struct({
  type: u8(ScrcpyControlMessageType.InjectTouch),
  action: u8(),
  pointerId: u64,
  pointerX: u32,
  pointerY: u32,
  videoWidth: u16,
  videoHeight: u16,
  pressure: impl_exports7.UnsignedFloat,
  actionButton: u32,
  buttons: u32
}, { littleEndian: false }))();
function serializeInjectTouchControlMessage2(message) {
  return InjectTouchControlMessage2.serialize(message);
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_0/impl/parse-audio-stream-metadata.js
async function parseAudioStreamMetadata(stream, options) {
  const buffered = new BufferedReadableStream(stream);
  const buffer2 = await buffered.readExactly(4);
  const codecMetadataValue = getUint32BigEndian(buffer2, 0);
  switch (codecMetadataValue) {
    case 0:
      return {
        type: "disabled"
      };
    case 1:
      return {
        type: "errored"
      };
  }
  if (options.sendCodecMeta) {
    let codec2;
    switch (codecMetadataValue) {
      case ScrcpyAudioCodec.Raw.metadataValue:
        codec2 = ScrcpyAudioCodec.Raw;
        break;
      case ScrcpyAudioCodec.Opus.metadataValue:
        codec2 = ScrcpyAudioCodec.Opus;
        break;
      case ScrcpyAudioCodec.Aac.metadataValue:
        codec2 = ScrcpyAudioCodec.Aac;
        break;
      case ScrcpyAudioCodec.Flac.metadataValue:
        codec2 = ScrcpyAudioCodec.Flac;
        break;
      default:
        throw new Error(`Unknown audio codec metadata value: ${codecMetadataValue}`);
    }
    return {
      type: "success",
      codec: codec2,
      stream: buffered.release()
    };
  }
  let codec;
  switch (options.audioCodec) {
    case "raw":
      codec = ScrcpyAudioCodec.Raw;
      break;
    case "opus":
      codec = ScrcpyAudioCodec.Opus;
      break;
    case "aac":
      codec = ScrcpyAudioCodec.Aac;
      break;
    case "flac":
      codec = ScrcpyAudioCodec.Flac;
      break;
    default:
      throw new Error(`Unknown audio codec metadata value: ${codecMetadataValue}`);
  }
  return {
    type: "success",
    codec,
    stream: new PushReadableStream(async (controller) => {
      await controller.enqueue(buffer2);
      const stream2 = buffered.release();
      const reader = stream2.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        await controller.enqueue(value);
      }
    })
  };
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_0/impl/parse-display.js
function parseDisplay2(line) {
  const match = line.match(/^\s+--display=(\d+)\s+\(([^)]+)\)$/);
  if (match) {
    const display = {
      id: Number.parseInt(match[1], 10)
    };
    if (match[2] !== "size unknown") {
      display.resolution = match[2];
    }
    return display;
  }
  return void 0;
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_0/impl/parse-encoder.js
var EncoderRegex4 = /^\s+--(video|audio)-codec=(\S+)\s+--\1-encoder='([^']+)'$/;
function parseEncoder2(line) {
  const match = line.match(EncoderRegex4);
  return match ? {
    type: match[1],
    name: match[3],
    codec: match[2]
  } : void 0;
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_0/impl/parse-video-stream-metadata.js
function toCodecId(codec) {
  switch (codec) {
    case "h264":
      return ScrcpyVideoCodecId.H264;
    case "h265":
      return ScrcpyVideoCodecId.H265;
    case "av1":
      return ScrcpyVideoCodecId.AV1;
    default:
      throw new Error(`Unknown video codec: ${codec}`);
  }
}
async function parseAsync(options, stream) {
  const buffered = new BufferedReadableStream(stream);
  let deviceName;
  if (options.sendDeviceMeta) {
    deviceName = await impl_exports7.readString(buffered, 64);
  }
  let codec;
  let width;
  let height;
  if (options.sendCodecMeta) {
    codec = await impl_exports7.readU32(buffered);
    width = await impl_exports7.readU32(buffered);
    height = await impl_exports7.readU32(buffered);
  } else {
    codec = toCodecId(options.videoCodec);
  }
  return {
    stream: buffered.release(),
    metadata: { deviceName, codec, width, height }
  };
}
function parseVideoStreamMetadata3(options, stream) {
  if (!options.sendDeviceMeta && !options.sendCodecMeta) {
    return {
      stream,
      metadata: { codec: toCodecId(options.videoCodec) }
    };
  }
  return parseAsync(options, stream);
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_0/impl/set-list-display.js
function setListDisplays2(options) {
  options.listDisplays = true;
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_0/impl/set-list-encoder.js
function setListEncoders2(options) {
  options.listEncoders = true;
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_0/options.js
var ScrcpyOptions2_0 = class {
  static Defaults = Defaults8;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults8, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults8);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay2(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_1/impl/index.js
var impl_exports9 = {};
__export(impl_exports9, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults9,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay2,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_1/impl/defaults.js
var Defaults9 = /* @__PURE__ */ (() => ({
  ...impl_exports8.Defaults,
  video: true,
  audioSource: "output"
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_1/options.js
var ScrcpyOptions2_1 = class {
  static Defaults = Defaults9;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults9, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults9);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay2(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_1_1.js
var ScrcpyOptions2_1_1 = class extends ScrcpyOptions2_1 {
  constructor(init) {
    super(init);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_2/impl/defaults.js
var Defaults10 = /* @__PURE__ */ (() => ({
  ...impl_exports9.Defaults,
  videoSource: "display",
  displayId: 0,
  cameraId: void 0,
  cameraSize: void 0,
  cameraFacing: void 0,
  cameraAr: void 0,
  cameraFps: void 0,
  cameraHighSpeed: false,
  listCameras: false,
  listCameraSizes: false
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_2/impl/parse-display.js
function parseDisplay3(line) {
  const match = line.match(/^\s+--display-id=(\d+)\s+\(([^)]+)\)$/);
  if (match) {
    const display = {
      id: Number.parseInt(match[1], 10)
    };
    if (match[2] !== "size unknown") {
      display.resolution = match[2];
    }
    return display;
  }
  return void 0;
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_2/options.js
var ScrcpyOptions2_2 = class {
  static Defaults = Defaults10;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults10, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults10);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_3/impl/index.js
var impl_exports10 = {};
__export(impl_exports10, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults10,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_3/options.js
var ScrcpyOptions2_3 = class {
  static Defaults = Defaults10;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults10, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults10);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_3_1.js
var ScrcpyOptions2_3_1 = class extends ScrcpyOptions2_3 {
  constructor(init) {
    super(init);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_4/impl/index.js
var impl_exports11 = {};
__export(impl_exports11, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes3,
  Crop: () => Crop,
  Defaults: () => Defaults10,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_4/impl/control-message-types.js
var ControlMessageTypes3 = /* @__PURE__ */ (() => [
  ...impl_exports10.ControlMessageTypes,
  ScrcpyControlMessageType.UHidCreate,
  ScrcpyControlMessageType.UHidInput,
  ScrcpyControlMessageType.OpenHardKeyboardSettings
])();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_4/impl/serialize-uhid-create.js
var UHidCreateControlMessage = struct({
  type: u8,
  id: u16,
  data: buffer(u16)
}, { littleEndian: false });
function serializeUHidCreateControlMessage(message) {
  return UHidCreateControlMessage.serialize(message);
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_4/impl/uhid-output-stream.js
var UHidOutputDeviceMessage = struct({
  id: u16,
  data: buffer(u16)
}, { littleEndian: false });
var UHidOutputStream = class extends PushReadableStream {
  #controller;
  id = 2;
  constructor() {
    let controller;
    super((controller_) => {
      controller = controller_;
    });
    this.#controller = controller;
  }
  async parse(_id, stream) {
    const message = await UHidOutputDeviceMessage.deserialize(stream);
    await this.#controller.enqueue(message);
  }
  close() {
    this.#controller.close();
  }
  error(e) {
    this.#controller.error(e);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_4/options.js
var ScrcpyOptions2_4 = class {
  static Defaults = Defaults10;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes3;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults10, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults10);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage(message);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_5.js
var ScrcpyOptions2_5 = class extends ScrcpyOptions2_4 {
  constructor(init) {
    super(init);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_6/impl/index.js
var impl_exports12 = {};
__export(impl_exports12, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes3,
  Crop: () => Crop,
  Defaults: () => Defaults11,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_6/impl/defaults.js
var Defaults11 = /* @__PURE__ */ (() => ({
  ...impl_exports11.Defaults,
  audioDup: false
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_6/options.js
var ScrcpyOptions2_6 = class {
  static Defaults = Defaults11;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes3;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults11, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults11);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage(message);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_6_1.js
var ScrcpyOptions2_6_1 = class extends ScrcpyOptions2_6 {
  constructor(init) {
    super(init);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_7/impl/index.js
var impl_exports13 = {};
__export(impl_exports13, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes4,
  Crop: () => Crop,
  Defaults: () => Defaults11,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage2,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage2,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_7/impl/control-message-types.js
var ControlMessageTypes4 = /* @__PURE__ */ (() => {
  const result = impl_exports12.ControlMessageTypes.slice();
  result.splice(14, 0, ScrcpyControlMessageType.UHidDestroy);
  return result;
})();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_7/impl/serialize-uhid-create.js
var UHidCreateControlMessage2 = struct({
  type: u8,
  id: u16,
  name: string(u8),
  data: buffer(u16)
}, { littleEndian: false });
function serializeUHidCreateControlMessage2(message) {
  return UHidCreateControlMessage2.serialize(message);
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/2_7/options.js
var ScrcpyOptions2_7 = class {
  static Defaults = Defaults11;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes4;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults11, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults11);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage2(message);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_0/impl/index.js
var impl_exports14 = {};
__export(impl_exports14, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  CaptureOrientation: () => CaptureOrientation,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes5,
  Crop: () => Crop,
  Defaults: () => Defaults12,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  LockOrientation: () => LockOrientation,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  NewDisplay: () => NewDisplay,
  Orientation: () => Orientation,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage2,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder3,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage2,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_0/impl/control-message-types.js
var ControlMessageTypes5 = /* @__PURE__ */ (() => [
  ...impl_exports13.ControlMessageTypes,
  ScrcpyControlMessageType.StartApp,
  ScrcpyControlMessageType.ResetVideo
])();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_0/impl/defaults.js
var Defaults12 = /* @__PURE__ */ (() => ({
  ...omit(impl_exports13.Defaults, "lockVideoOrientation"),
  captureOrientation: void 0,
  angle: 0,
  screenOffTimeout: void 0,
  listApps: false,
  newDisplay: void 0,
  vdSystemDecorations: true
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_0/impl/init.js
var LockOrientation = {
  Unlocked: 0,
  LockedInitial: 1,
  LockedValue: 2
};
var Orientation = {
  Orient0: 0,
  Orient90: 90,
  Orient180: 180,
  Orient270: 270
};
var CaptureOrientation = class _CaptureOrientation {
  static Unlocked = /* @__PURE__ */ (() => new _CaptureOrientation(LockOrientation.Unlocked, Orientation.Orient0, false))();
  lock;
  orientation;
  flip;
  constructor(lock, orientation, flip = false) {
    this.lock = lock;
    this.orientation = orientation;
    this.flip = flip;
  }
  toOptionValue() {
    if (this.lock === LockOrientation.Unlocked && this.orientation === Orientation.Orient0 && !this.flip) {
      return void 0;
    }
    if (this.lock === LockOrientation.LockedInitial) {
      return "@";
    }
    return (this.lock === LockOrientation.LockedValue ? "@" : "") + (this.flip ? "flip" : "") + this.orientation;
  }
};
var NewDisplay = class _NewDisplay {
  static Default = /* @__PURE__ */ new _NewDisplay();
  width;
  height;
  dpi;
  constructor(a, b, c) {
    if (a === void 0) {
      return;
    }
    if (b === void 0) {
      this.dpi = a;
      return;
    }
    this.width = a;
    this.height = b;
    this.dpi = c;
  }
  toOptionValue() {
    if (this.width === void 0 && this.height === void 0 && this.dpi === void 0) {
      return "";
    }
    if (this.width === void 0) {
      return `/${this.dpi}`;
    }
    if (this.dpi === void 0) {
      return `${this.width}x${this.height}`;
    }
    return `${this.width}x${this.height}/${this.dpi}`;
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_0/impl/parse-encoder.js
var EncoderRegex5 = /^\s+--(video|audio)-codec=(\S+)\s+--\1-encoder=(\S+)(?:\s*\((sw|hw|hybrid)\))?(?:\s*\[vendor\])?(?:\s*\(alias for (\S+)\))?$/;
function toHardwareType(value) {
  switch (value) {
    case "sw":
      return "software";
    case "hw":
      return "hardware";
    case "hybrid":
      return "hybrid";
    default:
      throw new Error(`Unknown hardware type: ${value}`);
  }
}
function parseEncoder3(line) {
  const match = line.match(EncoderRegex5);
  return match ? {
    type: match[1],
    name: match[3],
    codec: match[2],
    hardwareType: match[4] ? toHardwareType(match[4]) : void 0,
    vendor: !!match[5],
    aliasFor: match[6]
  } : void 0;
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_0/options.js
var ScrcpyOptions3_0 = class {
  static Defaults = Defaults12;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes5;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults12, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults12);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder3(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage2(message);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_0_1.js
var ScrcpyOptions3_0_1 = class extends ScrcpyOptions3_0 {
  constructor(init) {
    super(init);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_0_2.js
var ScrcpyOptions3_0_2 = class extends ScrcpyOptions3_0 {
  constructor(init) {
    super(init);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_1/impl/index.js
var impl_exports15 = {};
__export(impl_exports15, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  CaptureOrientation: () => CaptureOrientation,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes5,
  Crop: () => Crop,
  Defaults: () => Defaults13,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  LockOrientation: () => LockOrientation,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  NewDisplay: () => NewDisplay,
  Orientation: () => Orientation,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage3,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder3,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage3,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_1/impl/defaults.js
var Defaults13 = /* @__PURE__ */ (() => ({
  ...impl_exports14.Defaults,
  vdDestroyContent: false
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_1/impl/serialize-uhid-create.js
var UHidCreateControlMessage3 = struct({
  type: u8,
  id: u16,
  vendorId: u16,
  productId: u16,
  name: string(u8),
  data: buffer(u16)
}, { littleEndian: false });
function serializeUHidCreateControlMessage3(message) {
  return UHidCreateControlMessage3.serialize(message);
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_1/options.js
var ScrcpyOptions3_1 = class {
  static Defaults = Defaults13;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes5;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults13, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults13);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder3(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage3(message);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_2/impl/index.js
var impl_exports16 = {};
__export(impl_exports16, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  CaptureOrientation: () => CaptureOrientation,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes5,
  Crop: () => Crop,
  Defaults: () => Defaults14,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  LockOrientation: () => LockOrientation,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  NewDisplay: () => NewDisplay,
  Orientation: () => Orientation,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage3,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder3,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage3,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_2/impl/defaults.js
var Defaults14 = /* @__PURE__ */ (() => ({
  ...impl_exports15.Defaults,
  displayImePolicy: void 0
}))();

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_2/options.js
var ScrcpyOptions3_2 = class {
  static Defaults = Defaults14;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes5;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults14, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults14);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder3(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage3(message);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_3.js
var ScrcpyOptions3_3 = class extends ScrcpyOptions3_2 {
  constructor(init) {
    super(init);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_3_1/impl/scroll-controller.js
var ScrollController4 = class {
  serializeScrollMessage(message) {
    message = {
      ...message,
      scrollX: message.scrollX / 16,
      scrollY: message.scrollY / 16
    };
    return impl_exports16.InjectScrollControlMessage.serialize(message);
  }
};
function createScrollController4() {
  return new ScrollController4();
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_3_1/options.js
var ScrcpyOptions3_3_1 = class {
  static Defaults = Defaults14;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes5;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults14, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults14);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder3(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController4();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage3(message);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/3_3_2.js
var ScrcpyOptions3_3_2 = class extends ScrcpyOptions3_3_1 {
  constructor(init) {
    super(init);
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/codec/av1.js
var AndroidAv1Profile = {
  Main8: 1 << 0,
  Main10: 1 << 1,
  Main10Hdr10: 1 << 12,
  Main10Hdr10Plus: 1 << 13
};
var AndroidAv1Level = {
  Level2: 1 << 0,
  Level21: 1 << 1,
  Level22: 1 << 2,
  Level23: 1 << 3,
  Level3: 1 << 4,
  Level31: 1 << 5,
  Level32: 1 << 6,
  Level33: 1 << 7,
  Level4: 1 << 8,
  Level41: 1 << 9,
  Level42: 1 << 10,
  Level43: 1 << 11,
  Level5: 1 << 12,
  Level51: 1 << 13,
  Level52: 1 << 14,
  Level53: 1 << 15,
  Level6: 1 << 16,
  Level61: 1 << 17,
  Level62: 1 << 18,
  Level63: 1 << 19,
  Level7: 1 << 20,
  Level71: 1 << 21,
  Level72: 1 << 22,
  Level73: 1 << 23
};
var BitReader = class {
  #data;
  #byte;
  #bytePosition = 0;
  #bitPosition = 7;
  get byteAligned() {
    return this.#bitPosition === 7;
  }
  get ended() {
    return this.#bytePosition >= this.#data.length;
  }
  constructor(data) {
    this.#data = data;
    this.#byte = data[0];
  }
  f1() {
    const value = this.#byte >> this.#bitPosition;
    this.#bitPosition -= 1;
    if (this.#bitPosition < 0) {
      this.#bytePosition += 1;
      this.#bitPosition = 7;
      this.#byte = this.#data[this.#bytePosition];
    }
    return value & 1;
  }
  f(n) {
    let value = 0;
    for (; n > 0; n -= 1) {
      value <<= 1;
      value |= this.f1();
    }
    return value;
  }
  skip(n) {
    if (n <= this.#bitPosition + 1) {
      this.#bytePosition += 1;
      this.#bitPosition = 7;
      this.#byte = this.#data[this.#bytePosition];
      return;
    }
    n -= this.#bitPosition + 1;
    this.#bytePosition += 1;
    const bytes = n / 8 | 0;
    if (bytes > 0) {
      this.#bytePosition += bytes;
      n -= bytes * 8;
    }
    this.#bitPosition = 7 - n;
    this.#byte = this.#data[this.#bytePosition];
  }
  readBytes(n) {
    if (!this.byteAligned) {
      throw new Error("Bytes must be byte-aligned");
    }
    const value = this.#data.subarray(this.#bytePosition, this.#bytePosition + n);
    this.#bytePosition += n;
    this.#byte = this.#data[this.#bytePosition];
    return value;
  }
  getPosition() {
    return [this.#bytePosition, this.#bitPosition];
  }
  setPosition([bytePosition, bitPosition]) {
    this.#bytePosition = bytePosition;
    this.#bitPosition = bitPosition;
    this.#byte = this.#data[bytePosition];
  }
};
var ObuType = {
  SequenceHeader: 1,
  TemporalDelimiter: 2,
  FrameHeader: 3,
  TileGroup: 4,
  Metadata: 5,
  Frame: 6,
  RedundantFrameHeader: 7,
  TileList: 8,
  Padding: 15
};
var ColorPrimaries = {
  Bt709: 1,
  Unspecified: 2,
  Bt470M: 4,
  Bt470BG: 5,
  Bt601: 6,
  Smpte240: 7,
  GenericFilm: 8,
  Bt2020: 9,
  Xyz: 10,
  Smpte431: 11,
  Smpte432: 12,
  Ebu3213: 22
};
var TransferCharacteristics = {
  Bt709: 1,
  Unspecified: 2,
  Bt470M: 4,
  Bt470BG: 5,
  Bt601: 6,
  Smpte240: 7,
  Linear: 8,
  Log100: 9,
  Log100Sqrt10: 10,
  Iec61966: 11,
  Bt1361: 12,
  Srgb: 13,
  Bt2020Ten: 14,
  Bt2020Twelve: 15,
  Smpte2084: 16,
  Smpte428: 17,
  Hlg: 18
};
var MatrixCoefficients = {
  Identity: 0,
  Bt709: 1,
  Unspecified: 2,
  Fcc: 4,
  Bt470BG: 5,
  Bt601: 6,
  Smpte240: 7,
  YCgCo: 8,
  Bt2020Ncl: 9,
  Bt2020Cl: 10,
  Smpte2085: 11,
  ChromatNcl: 12,
  ChromatCl: 13,
  ICtCp: 14
};
var Av1 = class _Av1 extends BitReader {
  static ObuType = ObuType;
  static ColorPrimaries = ColorPrimaries;
  static TransferCharacteristics = TransferCharacteristics;
  static MatrixCoefficients = MatrixCoefficients;
  #Leb128Bytes = 0;
  uvlc() {
    let leadingZeros = 0;
    while (!this.f1()) {
      leadingZeros += 1;
    }
    if (leadingZeros >= 32) {
      return 2 ** 32 - 1;
    }
    const value = this.f(leadingZeros);
    return value + (1 << leadingZeros >>> 0) - 1;
  }
  leb128() {
    if (!this.byteAligned) {
      throw new Error("LEB128 must be byte-aligned");
    }
    let value = 0n;
    this.#Leb128Bytes = 0;
    for (let i = 0n; i < 8n; i += 1n) {
      const leb128_byte = this.f(8);
      value |= BigInt(leb128_byte & 127) << 7n * i;
      this.#Leb128Bytes += 1;
      if ((leb128_byte & 128) == 0) {
        break;
      }
    }
    return value;
  }
  *annexBBitstream() {
    while (!this.ended) {
      const temporal_unit_size = this.leb128();
      yield* this.temporalUnit(temporal_unit_size);
    }
  }
  *temporalUnit(sz) {
    while (sz > 0) {
      const frame_unit_size = this.leb128();
      sz -= BigInt(this.#Leb128Bytes);
      yield* this.frameUnit(frame_unit_size);
      sz -= frame_unit_size;
    }
  }
  *frameUnit(sz) {
    while (sz > 0) {
      const obu_length = this.leb128();
      sz -= BigInt(this.#Leb128Bytes);
      const obu = this.openBitstreamUnit(obu_length);
      if (obu) {
        yield obu;
      }
      sz -= obu_length;
    }
  }
  #OperatingPointIdc = 0;
  openBitstreamUnit(sz) {
    const obu_header = this.obuHeader();
    let obu_size;
    if (obu_header.obu_has_size_field) {
      obu_size = this.leb128();
    } else if (sz !== void 0) {
      obu_size = sz - 1n - (obu_header.obu_extension_flag ? 1n : 0n);
    } else {
      throw new Error("obu_has_size_field must be true");
    }
    const startPosition = this.getPosition();
    if (obu_header.obu_type !== _Av1.ObuType.SequenceHeader && obu_header.obu_type !== _Av1.ObuType.TemporalDelimiter && this.#OperatingPointIdc !== 0 && obu_header.obu_extension_header) {
      const inTemporalLayer = !!(this.#OperatingPointIdc & 1 << obu_header.obu_extension_header.temporal_id);
      const inSpatialLayer = !!(this.#OperatingPointIdc & 1 << obu_header.obu_extension_header.spatial_id + 8);
      if (!inTemporalLayer || !inSpatialLayer) {
        this.skip(Number(obu_size));
        return;
      }
    }
    let sequence_header_obu;
    switch (obu_header.obu_type) {
      case _Av1.ObuType.SequenceHeader:
        sequence_header_obu = this.sequenceHeaderObu();
        break;
    }
    const currentPosition = this.getPosition();
    const payloadBits = (currentPosition[0] - startPosition[0]) * 8 + (startPosition[1] - currentPosition[1]);
    if (obu_size > 0) {
      this.skip(Number(obu_size) * 8 - payloadBits);
    }
    return {
      obu_header,
      obu_size,
      sequence_header_obu
    };
  }
  obuHeader() {
    const obu_forbidden_bit = !!this.f1();
    if (obu_forbidden_bit) {
      throw new Error("Invalid data");
    }
    const obu_type = this.f(4);
    const obu_extension_flag = !!this.f1();
    const obu_has_size_field = !!this.f1();
    this.f1();
    let obu_extension_header;
    if (obu_extension_flag) {
      obu_extension_header = this.obuExtensionHeader();
    }
    return {
      obu_type,
      obu_extension_flag,
      obu_has_size_field,
      obu_extension_header
    };
  }
  obuExtensionHeader() {
    const temporal_id = this.f(3);
    const spatial_id = this.f(2);
    this.skip(3);
    return { temporal_id, spatial_id };
  }
  static SelectScreenContentTools = 2;
  static SelectIntegerMv = 2;
  sequenceHeaderObu() {
    const seq_profile = this.f(3);
    const still_picture = !!this.f1();
    const reduced_still_picture_header = !!this.f1();
    let timing_info_present_flag = false;
    let timing_info;
    let decoder_model_info_present_flag = false;
    let decoder_model_info;
    let initial_display_delay_present_flag = false;
    let operating_points_cnt_minus_1 = 0;
    const operating_point_idc = [];
    const seq_level_idx = [];
    const seq_tier = [];
    const decoder_model_present_for_this_op = [];
    const initial_display_delay_present_for_this_op = [];
    let operating_parameters_info;
    let initial_display_delay_minus_1;
    if (reduced_still_picture_header) {
      operating_point_idc[0] = 0;
      seq_level_idx[0] = this.f(5);
      seq_tier[0] = 0;
      decoder_model_present_for_this_op[0] = false;
      initial_display_delay_present_for_this_op[0] = false;
    } else {
      timing_info_present_flag = !!this.f1();
      if (timing_info_present_flag) {
        timing_info = this.timingInfo();
        decoder_model_info_present_flag = !!this.f1();
        if (decoder_model_info_present_flag) {
          decoder_model_info = this.decoderModelInfo();
          operating_parameters_info = [];
        }
      }
      initial_display_delay_present_flag = !!this.f1();
      if (initial_display_delay_present_flag) {
        initial_display_delay_minus_1 = [];
      }
      operating_points_cnt_minus_1 = this.f(5);
      for (let i = 0; i <= operating_points_cnt_minus_1; i += 1) {
        operating_point_idc[i] = this.f(12);
        seq_level_idx[i] = this.f(5);
        if (seq_level_idx[i] > 7) {
          seq_tier[i] = this.f1();
        } else {
          seq_tier[i] = 0;
        }
        if (decoder_model_info_present_flag) {
          decoder_model_present_for_this_op[i] = !!this.f1();
          if (decoder_model_present_for_this_op[i]) {
            operating_parameters_info[i] = this.operatingParametersInfo(decoder_model_info);
          }
        } else {
          decoder_model_present_for_this_op[i] = false;
        }
        if (initial_display_delay_present_flag) {
          initial_display_delay_present_for_this_op[i] = !!this.f1();
          if (initial_display_delay_present_for_this_op[i]) {
            initial_display_delay_minus_1[i] = this.f(4);
          }
        }
      }
    }
    const operatingPoint = this.chooseOperatingPoint();
    this.#OperatingPointIdc = operating_point_idc[operatingPoint];
    const frame_width_bits_minus_1 = this.f(4);
    const frame_height_bits_minus_1 = this.f(4);
    const max_frame_width_minus_1 = this.f(frame_width_bits_minus_1 + 1);
    const max_frame_height_minus_1 = this.f(frame_height_bits_minus_1 + 1);
    let frame_id_numbers_present_flag = false;
    let delta_frame_id_length_minus_2;
    let additional_frame_id_length_minus_1;
    if (!reduced_still_picture_header) {
      frame_id_numbers_present_flag = !!this.f1();
      if (frame_id_numbers_present_flag) {
        delta_frame_id_length_minus_2 = this.f(4);
        additional_frame_id_length_minus_1 = this.f(3);
      }
    }
    const use_128x128_superblock = !!this.f1();
    const enable_filter_intra = !!this.f1();
    const enable_intra_edge_filter = !!this.f1();
    let enable_interintra_compound = false;
    let enable_masked_compound = false;
    let enable_warped_motion = false;
    let enable_dual_filter = false;
    let enable_order_hint = false;
    let enable_jnt_comp = false;
    let enable_ref_frame_mvs = false;
    let seq_choose_screen_content_tools = false;
    let seq_force_screen_content_tools = _Av1.SelectScreenContentTools;
    let seq_choose_integer_mv = false;
    let seq_force_integer_mv = _Av1.SelectIntegerMv;
    let order_hint_bits_minus_1;
    if (!reduced_still_picture_header) {
      enable_interintra_compound = !!this.f1();
      enable_masked_compound = !!this.f1();
      enable_warped_motion = !!this.f1();
      enable_dual_filter = !!this.f1();
      enable_order_hint = !!this.f1();
      if (enable_order_hint) {
        enable_jnt_comp = !!this.f1();
        enable_ref_frame_mvs = !!this.f1();
      }
      seq_choose_screen_content_tools = !!this.f1();
      if (!seq_choose_screen_content_tools) {
        seq_force_screen_content_tools = this.f1();
      }
      if (seq_force_screen_content_tools > 0) {
        seq_choose_integer_mv = !!this.f1();
        if (!seq_choose_integer_mv) {
          seq_force_integer_mv = this.f1();
        }
      }
      if (enable_order_hint) {
        order_hint_bits_minus_1 = this.f(3);
      }
    }
    const enable_superres = !!this.f1();
    const enable_cdef = !!this.f1();
    const enable_restoration = !!this.f1();
    const color_config = this.colorConfig(seq_profile);
    const film_grain_params_present = !!this.f1();
    return {
      seq_profile,
      still_picture,
      reduced_still_picture_header,
      timing_info_present_flag,
      timing_info,
      decoder_model_info_present_flag,
      decoder_model_info,
      initial_display_delay_present_flag,
      initial_display_delay_minus_1,
      operating_points_cnt_minus_1,
      operating_point_idc,
      seq_level_idx,
      seq_tier,
      decoder_model_present_for_this_op,
      operating_parameters_info,
      initial_display_delay_present_for_this_op,
      frame_width_bits_minus_1,
      frame_height_bits_minus_1,
      max_frame_width_minus_1,
      max_frame_height_minus_1,
      frame_id_numbers_present_flag,
      delta_frame_id_length_minus_2,
      additional_frame_id_length_minus_1,
      use_128x128_superblock,
      enable_filter_intra,
      enable_intra_edge_filter,
      enable_interintra_compound,
      enable_masked_compound,
      enable_warped_motion,
      enable_dual_filter,
      enable_order_hint,
      enable_jnt_comp,
      enable_ref_frame_mvs,
      seq_choose_screen_content_tools,
      seq_force_screen_content_tools,
      seq_choose_integer_mv,
      seq_force_integer_mv,
      order_hint_bits_minus_1,
      enable_superres,
      enable_cdef,
      enable_restoration,
      color_config,
      film_grain_params_present
    };
  }
  searchSequenceHeaderObu() {
    while (!this.ended) {
      const obu = this.openBitstreamUnit();
      if (!obu) {
        continue;
      }
      if (obu.sequence_header_obu) {
        return obu.sequence_header_obu;
      }
    }
    return void 0;
  }
  timingInfo() {
    const num_units_in_display_tick = this.f(32);
    const time_scale = this.f(32);
    const equal_picture_interval = !!this.f1();
    let num_ticks_per_picture_minus_1;
    if (equal_picture_interval) {
      num_ticks_per_picture_minus_1 = this.uvlc();
    }
    return {
      num_units_in_display_tick,
      time_scale,
      equal_picture_interval,
      num_ticks_per_picture_minus_1
    };
  }
  decoderModelInfo() {
    const buffer_delay_length_minus_1 = this.f(5);
    const num_units_in_decoding_tick = this.f(32);
    const buffer_removal_time_length_minus_1 = this.f(5);
    const frame_presentation_time_length_minus_1 = this.f(5);
    return {
      buffer_delay_length_minus_1,
      num_units_in_decoding_tick,
      buffer_removal_time_length_minus_1,
      frame_presentation_time_length_minus_1
    };
  }
  operatingParametersInfo(decoderModelInfo) {
    const n = decoderModelInfo.buffer_delay_length_minus_1 + 1;
    const decoder_buffer_delay = this.f(n);
    const encoder_buffer_delay = this.f(n);
    const low_delay_mode_flag = !!this.f1();
    return {
      decoder_buffer_delay,
      encoder_buffer_delay,
      low_delay_mode_flag
    };
  }
  chooseOperatingPoint() {
    return 0;
  }
  colorConfig(seq_profile) {
    const high_bitdepth = !!this.f1();
    let twelve_bit = false;
    let BitDepth = 8;
    if (seq_profile === 2 && high_bitdepth) {
      twelve_bit = !!this.f1();
      BitDepth = twelve_bit ? 12 : 10;
    } else if (seq_profile <= 2) {
      BitDepth = high_bitdepth ? 10 : 8;
    }
    let mono_chrome = false;
    if (seq_profile === 1) {
      mono_chrome = !!this.f1();
    }
    const color_description_present_flag = !!this.f1();
    let color_primaries = _Av1.ColorPrimaries.Unspecified;
    let transfer_characteristics = _Av1.TransferCharacteristics.Unspecified;
    let matrix_coefficients = _Av1.MatrixCoefficients.Unspecified;
    if (color_description_present_flag) {
      color_primaries = this.f(8);
      transfer_characteristics = this.f(8);
      matrix_coefficients = this.f(8);
    }
    let color_range = false;
    let subsampling_x;
    let subsampling_y;
    let chroma_sample_position = 0;
    let separate_uv_delta_q = false;
    if (mono_chrome) {
      color_range = !!this.f1();
      subsampling_x = true;
      subsampling_y = true;
    } else {
      if (color_primaries === _Av1.ColorPrimaries.Bt709 && transfer_characteristics === _Av1.TransferCharacteristics.Srgb && matrix_coefficients === _Av1.MatrixCoefficients.Identity) {
        color_range = true;
        subsampling_x = false;
        subsampling_y = false;
      } else {
        color_range = !!this.f1();
        switch (seq_profile) {
          case 0:
            subsampling_x = true;
            subsampling_y = true;
            break;
          case 1:
            subsampling_x = false;
            subsampling_y = false;
            break;
          default:
            if (BitDepth == 12) {
              subsampling_x = !!this.f1();
              if (subsampling_x) {
                subsampling_y = !!this.f1();
              } else {
                subsampling_y = false;
              }
            } else {
              subsampling_x = true;
              subsampling_y = false;
            }
            break;
        }
        if (subsampling_x && subsampling_y) {
          chroma_sample_position = this.f(2);
        }
      }
      separate_uv_delta_q = !!this.f1();
    }
    return {
      high_bitdepth,
      twelve_bit,
      BitDepth,
      mono_chrome,
      color_description_present_flag,
      color_primaries,
      transfer_characteristics,
      matrix_coefficients,
      color_range,
      subsampling_x,
      subsampling_y,
      chroma_sample_position,
      separate_uv_delta_q
    };
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/codec/nalu.js
function* annexBSplitNalu(buffer2) {
  let start = -1;
  let zeroCount = 0;
  let inEmulation = false;
  for (let i = 0; i < buffer2.length; i += 1) {
    const byte = buffer2[i];
    if (inEmulation) {
      if (byte > 3) {
        throw new Error("Invalid data");
      }
      inEmulation = false;
      continue;
    }
    if (byte === 0) {
      zeroCount += 1;
      continue;
    }
    const prevZeroCount = zeroCount;
    zeroCount = 0;
    if (start === -1) {
      if (prevZeroCount >= 2 && byte === 1) {
        start = i + 1;
        continue;
      }
      throw new Error("Invalid data");
    }
    if (prevZeroCount < 2) {
      continue;
    }
    if (byte === 1) {
      yield buffer2.subarray(start, i - prevZeroCount);
      start = i + 1;
      continue;
    }
    if (prevZeroCount > 2) {
      throw new Error("Invalid data");
    }
    switch (byte) {
      case 2:
        throw new Error("Invalid data");
      case 3:
        inEmulation = true;
        break;
      default:
        break;
    }
  }
  if (inEmulation) {
    throw new Error("Invalid data");
  }
  yield buffer2.subarray(start, buffer2.length);
}
var NaluSodbBitReader = class {
  #nalu;
  // logical length is `#byteLength * 8 + (7 - #stopBitIndex)`
  #byteLength;
  #stopBitIndex;
  #zeroCount = 0;
  // logical position is `#bytePosition * 8 + (7 - #bitPosition)`
  #bytePosition = 0;
  #bitPosition = 7;
  #byte = 0;
  get byteLength() {
    return this.#byteLength;
  }
  get stopBitIndex() {
    return this.#stopBitIndex;
  }
  get bytePosition() {
    return this.#bytePosition;
  }
  get bitPosition() {
    return this.#bitPosition;
  }
  get ended() {
    return this.#bytePosition >= this.#byteLength && this.#bitPosition <= this.#stopBitIndex;
  }
  constructor(nalu) {
    this.#nalu = nalu;
    for (let i = nalu.length - 1; i >= 0; i -= 1) {
      if (this.#nalu[i] === 0) {
        continue;
      }
      const byte = nalu[i];
      for (let j = 0; j < 8; j += 1) {
        if ((byte >> j & 1) === 1) {
          this.#byteLength = i;
          this.#stopBitIndex = j;
          this.#loadByte();
          return;
        }
      }
    }
    throw new Error("Stop bit not found");
  }
  #loadByte() {
    this.#byte = this.#nalu[this.#bytePosition];
    if (this.#zeroCount === 2 && this.#byte === 3) {
      this.#zeroCount = 0;
      this.#bytePosition += 1;
      this.#loadByte();
      return;
    }
    if (this.#byte === 0) {
      this.#zeroCount += 1;
    } else {
      this.#zeroCount = 0;
    }
  }
  next() {
    if (this.ended) {
      throw new Error("Bit index out of bounds");
    }
    const value = this.#byte >> this.#bitPosition & 1;
    this.#bitPosition -= 1;
    if (this.#bitPosition < 0) {
      this.#bytePosition += 1;
      this.#bitPosition = 7;
      this.#loadByte();
    }
    return value;
  }
  read(length) {
    if (length > 32) {
      throw new Error("Read length too large");
    }
    let result = 0;
    for (let i = 0; i < length; i += 1) {
      result = result << 1 | this.next();
    }
    return result;
  }
  /**
   * Throws an error if the current position is invalid for `skip`.
   *
   * Usually it will throw if `ended` is `true`,
   * except when the bit position is at the stop bit,
   * in which case `ended` will be `true`, but it won't throw.
   * `skip` can skip all remaining bits, and stop at the end position.
   * The next `next` call will throw since there is no more bits to read.
   */
  #checkSkipPosition() {
    if (this.#bytePosition >= this.#byteLength && this.#bitPosition < this.#stopBitIndex) {
      throw new Error("Bit index out of bounds");
    }
  }
  skip(length) {
    if (length <= this.#bitPosition + 1) {
      this.#bitPosition -= length;
      this.#checkSkipPosition();
      return;
    }
    length -= this.#bitPosition + 1;
    this.#bytePosition += 1;
    this.#bitPosition = 7;
    this.#loadByte();
    this.#checkSkipPosition();
    for (; length >= 8; length -= 8) {
      this.#bytePosition += 1;
      this.#loadByte();
      this.#checkSkipPosition();
    }
    this.#bitPosition = 7 - length;
    this.#checkSkipPosition();
  }
  decodeExponentialGolombNumber() {
    let length = 0;
    while (this.next() === 0) {
      length += 1;
    }
    if (length === 0) {
      return 0;
    }
    return (1 << length | this.read(length)) - 1;
  }
  #save() {
    return {
      zeroCount: this.#zeroCount,
      bytePosition: this.#bytePosition,
      bitPosition: this.#bitPosition,
      byte: this.#byte
    };
  }
  #restore(state) {
    this.#zeroCount = state.zeroCount;
    this.#bytePosition = state.bytePosition;
    this.#bitPosition = state.bitPosition;
    this.#byte = state.byte;
  }
  peek(length) {
    const state = this.#save();
    const result = this.read(length);
    this.#restore(state);
    return result;
  }
  readBytes(length) {
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i += 1) {
      result[i] = this.read(8);
    }
    return result;
  }
  peekBytes(length) {
    const state = this.#save();
    const result = this.readBytes(length);
    this.#restore(state);
    return result;
  }
};

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/codec/h264.js
var AndroidAvcProfile = {
  Baseline: 1 << 0,
  Main: 1 << 1,
  Extended: 1 << 2,
  High: 1 << 3,
  High10: 1 << 4,
  High422: 1 << 5,
  High444: 1 << 6,
  ConstrainedBaseline: 1 << 16,
  ConstrainedHigh: 1 << 19
};
var AndroidAvcLevel = {
  Level1: 1 << 0,
  Level1b: 1 << 1,
  Level11: 1 << 2,
  Level12: 1 << 3,
  Level13: 1 << 4,
  Level2: 1 << 5,
  Level21: 1 << 6,
  Level22: 1 << 7,
  Level3: 1 << 8,
  Level31: 1 << 9,
  Level32: 1 << 10,
  Level4: 1 << 11,
  Level41: 1 << 12,
  Level42: 1 << 13,
  Level5: 1 << 14,
  Level51: 1 << 15,
  Level52: 1 << 16,
  Level6: 1 << 17,
  Level61: 1 << 18,
  Level62: 1 << 19
};
function h264ParseSequenceParameterSet(nalu) {
  const reader = new NaluSodbBitReader(nalu);
  if (reader.next() !== 0) {
    throw new Error("Invalid data");
  }
  const nal_ref_idc = reader.read(2);
  const nal_unit_type = reader.read(5);
  if (nal_unit_type !== 7) {
    throw new Error("Invalid data");
  }
  if (nal_ref_idc === 0) {
    throw new Error("Invalid data");
  }
  const profile_idc = reader.read(8);
  const constraint_set = reader.peek(8);
  const constraint_set0_flag = !!reader.next();
  const constraint_set1_flag = !!reader.next();
  const constraint_set2_flag = !!reader.next();
  const constraint_set3_flag = !!reader.next();
  const constraint_set4_flag = !!reader.next();
  const constraint_set5_flag = !!reader.next();
  if (reader.read(2) !== 0) {
    throw new Error("Invalid data");
  }
  const level_idc = reader.read(8);
  const seq_parameter_set_id = reader.decodeExponentialGolombNumber();
  if (profile_idc === 100 || profile_idc === 110 || profile_idc === 122 || profile_idc === 244 || profile_idc === 44 || profile_idc === 83 || profile_idc === 86 || profile_idc === 118 || profile_idc === 128 || profile_idc === 138 || profile_idc === 139 || profile_idc === 134) {
    const chroma_format_idc = reader.decodeExponentialGolombNumber();
    if (chroma_format_idc === 3) {
      reader.next();
    }
    reader.decodeExponentialGolombNumber();
    reader.decodeExponentialGolombNumber();
    reader.next();
    const seq_scaling_matrix_present_flag = !!reader.next();
    if (seq_scaling_matrix_present_flag) {
      const seq_scaling_list_present_flag = [];
      for (let i = 0; i < (chroma_format_idc !== 3 ? 8 : 12); i += 1) {
        seq_scaling_list_present_flag[i] = !!reader.next();
        if (seq_scaling_list_present_flag[i])
          if (i < 6) {
          } else {
          }
      }
    }
  }
  reader.decodeExponentialGolombNumber();
  const pic_order_cnt_type = reader.decodeExponentialGolombNumber();
  if (pic_order_cnt_type === 0) {
    reader.decodeExponentialGolombNumber();
  } else if (pic_order_cnt_type === 1) {
    reader.next();
    reader.decodeExponentialGolombNumber();
    reader.decodeExponentialGolombNumber();
    const num_ref_frames_in_pic_order_cnt_cycle = reader.decodeExponentialGolombNumber();
    const offset_for_ref_frame = [];
    for (let i = 0; i < num_ref_frames_in_pic_order_cnt_cycle; i += 1) {
      offset_for_ref_frame[i] = reader.decodeExponentialGolombNumber();
    }
  }
  reader.decodeExponentialGolombNumber();
  reader.next();
  const pic_width_in_mbs_minus1 = reader.decodeExponentialGolombNumber();
  const pic_height_in_map_units_minus1 = reader.decodeExponentialGolombNumber();
  const frame_mbs_only_flag = reader.next();
  if (!frame_mbs_only_flag) {
    reader.next();
  }
  reader.next();
  const frame_cropping_flag = !!reader.next();
  let frame_crop_left_offset;
  let frame_crop_right_offset;
  let frame_crop_top_offset;
  let frame_crop_bottom_offset;
  if (frame_cropping_flag) {
    frame_crop_left_offset = reader.decodeExponentialGolombNumber();
    frame_crop_right_offset = reader.decodeExponentialGolombNumber();
    frame_crop_top_offset = reader.decodeExponentialGolombNumber();
    frame_crop_bottom_offset = reader.decodeExponentialGolombNumber();
  } else {
    frame_crop_left_offset = 0;
    frame_crop_right_offset = 0;
    frame_crop_top_offset = 0;
    frame_crop_bottom_offset = 0;
  }
  const vui_parameters_present_flag = !!reader.next();
  if (vui_parameters_present_flag) {
  }
  return {
    profile_idc,
    constraint_set,
    constraint_set0_flag,
    constraint_set1_flag,
    constraint_set2_flag,
    constraint_set3_flag,
    constraint_set4_flag,
    constraint_set5_flag,
    level_idc,
    seq_parameter_set_id,
    pic_width_in_mbs_minus1,
    pic_height_in_map_units_minus1,
    frame_mbs_only_flag,
    frame_cropping_flag,
    frame_crop_left_offset,
    frame_crop_right_offset,
    frame_crop_top_offset,
    frame_crop_bottom_offset
  };
}
function h264SearchConfiguration(buffer2) {
  let sequenceParameterSet;
  let pictureParameterSet;
  for (const nalu of annexBSplitNalu(buffer2)) {
    const naluType = nalu[0] & 31;
    switch (naluType) {
      case 7:
        sequenceParameterSet = nalu;
        if (pictureParameterSet) {
          return {
            sequenceParameterSet,
            pictureParameterSet
          };
        }
        break;
      case 8:
        pictureParameterSet = nalu;
        if (sequenceParameterSet) {
          return {
            sequenceParameterSet,
            pictureParameterSet
          };
        }
        break;
      default:
        break;
    }
  }
  throw new Error("Invalid data");
}
function h264ParseConfiguration(data) {
  const { sequenceParameterSet, pictureParameterSet } = h264SearchConfiguration(data);
  const { profile_idc: profileIndex, constraint_set: constraintSet, level_idc: levelIndex, pic_width_in_mbs_minus1, pic_height_in_map_units_minus1, frame_mbs_only_flag, frame_crop_left_offset, frame_crop_right_offset, frame_crop_top_offset, frame_crop_bottom_offset } = h264ParseSequenceParameterSet(sequenceParameterSet);
  const encodedWidth = (pic_width_in_mbs_minus1 + 1) * 16;
  const encodedHeight = (pic_height_in_map_units_minus1 + 1) * (2 - frame_mbs_only_flag) * 16;
  const cropLeft = frame_crop_left_offset * 2;
  const cropRight = frame_crop_right_offset * 2;
  const cropTop = frame_crop_top_offset * 2;
  const cropBottom = frame_crop_bottom_offset * 2;
  const croppedWidth = encodedWidth - cropLeft - cropRight;
  const croppedHeight = encodedHeight - cropTop - cropBottom;
  return {
    pictureParameterSet,
    sequenceParameterSet,
    profileIndex,
    constraintSet,
    levelIndex,
    encodedWidth,
    encodedHeight,
    cropLeft,
    cropRight,
    cropTop,
    cropBottom,
    croppedWidth,
    croppedHeight
  };
}

// ../../../../../private/tmp/scrcpy-decoder-bundle.9mzJFb/node_modules/@yume-chan/scrcpy/esm/codec/h265.js
var AndroidHevcProfile = {
  Main: 1 << 0,
  Main10: 1 << 1,
  MainStill: 1 << 2,
  Main10Hdr10: 1 << 12,
  Main10Hdr10Plus: 1 << 13
};
var AndroidHevcLevel = {
  MainTierLevel1: 1 << 0,
  HighTierLevel1: 1 << 1,
  MainTierLevel2: 1 << 2,
  HighTierLevel2: 1 << 3,
  MainTierLevel21: 1 << 4,
  HighTierLevel21: 1 << 5,
  MainTierLevel3: 1 << 6,
  HighTierLevel3: 1 << 7,
  MainTierLevel31: 1 << 8,
  HighTierLevel31: 1 << 9,
  MainTierLevel4: 1 << 10,
  HighTierLevel4: 1 << 11,
  MainTierLevel41: 1 << 12,
  HighTierLevel41: 1 << 13,
  MainTierLevel5: 1 << 14,
  HighTierLevel5: 1 << 15,
  MainTierLevel51: 1 << 16,
  HighTierLevel51: 1 << 17,
  MainTierLevel52: 1 << 18,
  HighTierLevel52: 1 << 19,
  MainTierLevel6: 1 << 20,
  HighTierLevel6: 1 << 21,
  MainTierLevel61: 1 << 22,
  HighTierLevel61: 1 << 23,
  MainTierLevel62: 1 << 24,
  HighTierLevel62: 1 << 25
};
function getSubWidthC(chroma_format_idc) {
  switch (chroma_format_idc) {
    case 0:
    case 3:
      return 1;
    case 1:
    case 2:
      return 2;
    default:
      throw new Error("Invalid chroma_format_idc");
  }
}
function getSubHeightC(chroma_format_idc) {
  switch (chroma_format_idc) {
    case 0:
    case 2:
    case 3:
      return 1;
    case 1:
      return 2;
    default:
      throw new Error("Invalid chroma_format_idc");
  }
}
function h265ParseNaluHeader(nalu) {
  const reader = new NaluSodbBitReader(nalu);
  if (reader.next() !== 0) {
    throw new Error("Invalid NALU header");
  }
  const nal_unit_type = reader.read(6);
  const nuh_layer_id = reader.read(6);
  const nuh_temporal_id_plus1 = reader.read(3);
  return {
    nal_unit_type,
    nuh_layer_id,
    nuh_temporal_id_plus1
  };
}
function h265ParseVideoParameterSet(nalu) {
  const reader = new NaluSodbBitReader(nalu);
  const vps_video_parameter_set_id = reader.read(4);
  const vps_base_layer_internal_flag = !!reader.next();
  const vps_base_layer_available_flag = !!reader.next();
  const vps_max_layers_minus1 = reader.read(6);
  const vps_max_sub_layers_minus1 = reader.read(3);
  const vps_temporal_id_nesting_flag = !!reader.next();
  reader.skip(16);
  const profileTierLevel = h265ParseProfileTierLevel(reader, true, vps_max_sub_layers_minus1);
  const vps_sub_layer_ordering_info_present_flag = !!reader.next();
  const vps_max_dec_pic_buffering_minus1 = [];
  const vps_max_num_reorder_pics = [];
  const vps_max_latency_increase_plus1 = [];
  for (let i = vps_sub_layer_ordering_info_present_flag ? 0 : vps_max_sub_layers_minus1; i <= vps_max_sub_layers_minus1; i += 1) {
    vps_max_dec_pic_buffering_minus1[i] = reader.decodeExponentialGolombNumber();
    vps_max_num_reorder_pics[i] = reader.decodeExponentialGolombNumber();
    vps_max_latency_increase_plus1[i] = reader.decodeExponentialGolombNumber();
  }
  const vps_max_layer_id = reader.read(6);
  const vps_num_layer_sets_minus1 = reader.decodeExponentialGolombNumber();
  const layer_id_included_flag = [];
  for (let i = 1; i <= vps_num_layer_sets_minus1; i += 1) {
    layer_id_included_flag[i] = [];
    for (let j = 0; j <= vps_max_layer_id; j += 1) {
      layer_id_included_flag[i][j] = !!reader.next();
    }
  }
  const vps_timing_info_present_flag = !!reader.next();
  let vps_num_units_in_tick;
  let vps_time_scale;
  let vps_poc_proportional_to_timing_flag;
  let vps_num_ticks_poc_diff_one_minus1;
  let vps_num_hrd_parameters;
  let hrd_layer_set_idx;
  let cprms_present_flag;
  let hrdParameters;
  if (vps_timing_info_present_flag) {
    vps_num_units_in_tick = reader.read(32);
    vps_time_scale = reader.read(32);
    vps_poc_proportional_to_timing_flag = !!reader.next();
    if (vps_poc_proportional_to_timing_flag) {
      vps_num_ticks_poc_diff_one_minus1 = reader.decodeExponentialGolombNumber();
    }
    vps_num_hrd_parameters = reader.decodeExponentialGolombNumber();
    hrd_layer_set_idx = [];
    cprms_present_flag = [true];
    hrdParameters = [];
    for (let i = 0; i < vps_num_hrd_parameters; i += 1) {
      hrd_layer_set_idx[i] = reader.decodeExponentialGolombNumber();
      if (i > 0) {
        cprms_present_flag[i] = !!reader.next();
      }
      hrdParameters[i] = h265ParseHrdParameters(reader, cprms_present_flag[i], vps_max_sub_layers_minus1);
    }
  }
  const vps_extension_flag = !!reader.next();
  return {
    vps_video_parameter_set_id,
    vps_base_layer_internal_flag,
    vps_base_layer_available_flag,
    vps_max_layers_minus1,
    vps_max_sub_layers_minus1,
    vps_temporal_id_nesting_flag,
    profileTierLevel,
    vps_sub_layer_ordering_info_present_flag,
    vps_max_dec_pic_buffering_minus1,
    vps_max_num_reorder_pics,
    vps_max_latency_increase_plus1,
    vps_max_layer_id,
    vps_num_layer_sets_minus1,
    layer_id_included_flag,
    vps_timing_info_present_flag,
    vps_num_units_in_tick,
    vps_time_scale,
    vps_poc_proportional_to_timing_flag,
    vps_num_ticks_poc_diff_one_minus1,
    vps_num_hrd_parameters,
    hrd_layer_set_idx,
    cprms_present_flag,
    hrdParameters,
    vps_extension_flag
  };
}
function h265ParseSequenceParameterSet(nalu) {
  const reader = new NaluSodbBitReader(nalu);
  const sps_video_parameter_set_id = reader.read(4);
  const sps_max_sub_layers_minus1 = reader.read(3);
  const sps_temporal_id_nesting_flag = !!reader.next();
  const profileTierLevel = h265ParseProfileTierLevel(reader, true, sps_max_sub_layers_minus1);
  const sps_seq_parameter_set_id = reader.decodeExponentialGolombNumber();
  const chroma_format_idc = reader.decodeExponentialGolombNumber();
  let separate_colour_plane_flag;
  if (chroma_format_idc === 3) {
    separate_colour_plane_flag = !!reader.next();
  }
  const pic_width_in_luma_samples = reader.decodeExponentialGolombNumber();
  const pic_height_in_luma_samples = reader.decodeExponentialGolombNumber();
  const conformance_window_flag = !!reader.next();
  let conf_win_left_offset;
  let conf_win_right_offset;
  let conf_win_top_offset;
  let conf_win_bottom_offset;
  if (conformance_window_flag) {
    conf_win_left_offset = reader.decodeExponentialGolombNumber();
    conf_win_right_offset = reader.decodeExponentialGolombNumber();
    conf_win_top_offset = reader.decodeExponentialGolombNumber();
    conf_win_bottom_offset = reader.decodeExponentialGolombNumber();
  }
  const bit_depth_luma_minus8 = reader.decodeExponentialGolombNumber();
  const bit_depth_chroma_minus8 = reader.decodeExponentialGolombNumber();
  const log2_max_pic_order_cnt_lsb_minus4 = reader.decodeExponentialGolombNumber();
  const sps_max_dec_pic_buffering_minus1 = [];
  const sps_max_num_reorder_pics = [];
  const sps_max_latency_increase_plus1 = [];
  const sps_sub_layer_ordering_info_present_flag = !!reader.next();
  for (let i = sps_sub_layer_ordering_info_present_flag ? 0 : sps_max_sub_layers_minus1; i <= sps_max_sub_layers_minus1; i += 1) {
    sps_max_dec_pic_buffering_minus1[i] = reader.decodeExponentialGolombNumber();
    sps_max_num_reorder_pics[i] = reader.decodeExponentialGolombNumber();
    sps_max_latency_increase_plus1[i] = reader.decodeExponentialGolombNumber();
  }
  const log2_min_luma_coding_block_size_minus3 = reader.decodeExponentialGolombNumber();
  const log2_diff_max_min_luma_coding_block_size = reader.decodeExponentialGolombNumber();
  const log2_min_luma_transform_block_size_minus2 = reader.decodeExponentialGolombNumber();
  const log2_diff_max_min_luma_transform_block_size = reader.decodeExponentialGolombNumber();
  const max_transform_hierarchy_depth_inter = reader.decodeExponentialGolombNumber();
  const max_transform_hierarchy_depth_intra = reader.decodeExponentialGolombNumber();
  const scaling_list_enabled_flag = !!reader.next();
  let sps_scaling_list_data_present_flag;
  let scalingListData;
  if (scaling_list_enabled_flag) {
    sps_scaling_list_data_present_flag = !!reader.next();
    if (sps_scaling_list_data_present_flag) {
      scalingListData = h265ParseScalingListData(reader);
    }
  }
  const amp_enabled_flag = !!reader.next();
  const sample_adaptive_offset_enabled_flag = !!reader.next();
  const pcm_enabled_flag = !!reader.next();
  let pcm_sample_bit_depth_luma_minus1;
  let pcm_sample_bit_depth_chroma_minus1;
  let log2_min_pcm_luma_coding_block_size_minus3;
  let log2_diff_max_min_pcm_luma_coding_block_size;
  let pcm_loop_filter_disabled_flag;
  if (pcm_enabled_flag) {
    pcm_sample_bit_depth_luma_minus1 = reader.read(4);
    pcm_sample_bit_depth_chroma_minus1 = reader.read(4);
    log2_min_pcm_luma_coding_block_size_minus3 = reader.decodeExponentialGolombNumber();
    log2_diff_max_min_pcm_luma_coding_block_size = reader.decodeExponentialGolombNumber();
    pcm_loop_filter_disabled_flag = !!reader.next();
  }
  const num_short_term_ref_pic_sets = reader.decodeExponentialGolombNumber();
  const shortTermRefPicSets = [];
  for (let i = 0; i < num_short_term_ref_pic_sets; i += 1) {
    shortTermRefPicSets[i] = h265ParseShortTermReferencePictureSet(reader, i, num_short_term_ref_pic_sets, shortTermRefPicSets);
  }
  const long_term_ref_pics_present_flag = !!reader.next();
  let num_long_term_ref_pics_sps;
  let lt_ref_pic_poc_lsb_sps;
  let used_by_curr_pic_lt_sps_flag;
  if (long_term_ref_pics_present_flag) {
    num_long_term_ref_pics_sps = reader.decodeExponentialGolombNumber();
    lt_ref_pic_poc_lsb_sps = [];
    used_by_curr_pic_lt_sps_flag = [];
    for (let i = 0; i < num_long_term_ref_pics_sps; i += 1) {
      lt_ref_pic_poc_lsb_sps[i] = reader.read(log2_max_pic_order_cnt_lsb_minus4 + 4);
      used_by_curr_pic_lt_sps_flag[i] = !!reader.next();
    }
  }
  const sps_temporal_mvp_enabled_flag = !!reader.next();
  const strong_intra_smoothing_enabled_flag = !!reader.next();
  const vui_parameters_present_flag = !!reader.next();
  let vuiParameters;
  if (vui_parameters_present_flag) {
    vuiParameters = h265ParseVuiParameters(reader, sps_max_sub_layers_minus1);
  }
  const sps_extension_present_flag = !!reader.next();
  let sps_range_extension_flag;
  let sps_multilayer_extension_flag;
  let sps_3d_extension_flag;
  let sps_scc_extension_flag;
  let sps_extension_4bits;
  if (sps_extension_present_flag) {
    sps_range_extension_flag = !!reader.next();
    sps_multilayer_extension_flag = !!reader.next();
    sps_3d_extension_flag = !!reader.next();
    sps_scc_extension_flag = !!reader.next();
    sps_extension_4bits = reader.read(4);
  }
  if (sps_range_extension_flag) {
    throw new Error("Not implemented");
  }
  let spsMultilayerExtension;
  if (sps_multilayer_extension_flag) {
    spsMultilayerExtension = h265ParseSpsMultilayerExtension(reader);
  }
  let sps3dExtension;
  if (sps_3d_extension_flag) {
    sps3dExtension = h265ParseSps3dExtension(reader);
  }
  if (sps_scc_extension_flag) {
    throw new Error("Not implemented");
  }
  let sps_extension_data_flag;
  if (sps_extension_4bits) {
    sps_extension_data_flag = [];
    let i = 0;
    while (!reader.ended) {
      sps_extension_data_flag[i] = !!reader.next();
      i += 1;
    }
  }
  return {
    sps_video_parameter_set_id,
    sps_max_sub_layers_minus1,
    sps_temporal_id_nesting_flag,
    profileTierLevel,
    sps_seq_parameter_set_id,
    chroma_format_idc,
    separate_colour_plane_flag,
    pic_width_in_luma_samples,
    pic_height_in_luma_samples,
    conformance_window_flag,
    conf_win_left_offset,
    conf_win_right_offset,
    conf_win_top_offset,
    conf_win_bottom_offset,
    bit_depth_luma_minus8,
    bit_depth_chroma_minus8,
    log2_max_pic_order_cnt_lsb_minus4,
    sps_sub_layer_ordering_info_present_flag,
    sps_max_dec_pic_buffering_minus1,
    sps_max_num_reorder_pics,
    sps_max_latency_increase_plus1,
    log2_min_luma_coding_block_size_minus3,
    log2_diff_max_min_luma_coding_block_size,
    log2_min_luma_transform_block_size_minus2,
    log2_diff_max_min_luma_transform_block_size,
    max_transform_hierarchy_depth_inter,
    max_transform_hierarchy_depth_intra,
    scaling_list_enabled_flag,
    sps_scaling_list_data_present_flag,
    scalingListData,
    amp_enabled_flag,
    sample_adaptive_offset_enabled_flag,
    pcm_enabled_flag,
    pcm_sample_bit_depth_luma_minus1,
    pcm_sample_bit_depth_chroma_minus1,
    log2_min_pcm_luma_coding_block_size_minus3,
    log2_diff_max_min_pcm_luma_coding_block_size,
    pcm_loop_filter_disabled_flag,
    num_short_term_ref_pic_sets,
    shortTermRefPicSets,
    long_term_ref_pics_present_flag,
    num_long_term_ref_pics_sps,
    lt_ref_pic_poc_lsb_sps,
    used_by_curr_pic_lt_sps_flag,
    sps_temporal_mvp_enabled_flag,
    strong_intra_smoothing_enabled_flag,
    vui_parameters_present_flag,
    vuiParameters,
    sps_extension_present_flag,
    sps_range_extension_flag,
    sps_multilayer_extension_flag,
    sps_3d_extension_flag,
    sps_scc_extension_flag,
    sps_extension_4bits,
    spsMultilayerExtension,
    sps3dExtension,
    sps_extension_data_flag
  };
}
function h265ParseProfileTier(reader) {
  const profile_space = reader.read(2);
  const tier_flag = !!reader.next();
  const profile_idc = reader.read(5);
  const profileCompatibilitySet = reader.peekBytes(4);
  const profile_compatibility_flag = [];
  for (let j = 0; j < 32; j += 1) {
    profile_compatibility_flag[j] = !!reader.next();
  }
  const constraintSet = reader.peekBytes(6);
  const progressive_source_flag = !!reader.next();
  const interlaced_source_flag = !!reader.next();
  const non_packed_constraint_flag = !!reader.next();
  const frame_only_constraint_flag = !!reader.next();
  let max_12bit_constraint_flag;
  let max_10bit_constraint_flag;
  let max_8bit_constraint_flag;
  let max_422chroma_constraint_flag;
  let max_420chroma_constraint_flag;
  let max_monochrome_constraint_flag;
  let intra_constraint_flag;
  let one_picture_only_constraint_flag;
  let lower_bit_rate_constraint_flag;
  let max_14bit_constraint_flag;
  if (profile_idc === 4 || profile_compatibility_flag[4] || profile_idc === 5 || profile_compatibility_flag[5] || profile_idc === 6 || profile_compatibility_flag[6] || profile_idc === 7 || profile_compatibility_flag[7] || profile_idc === 8 || profile_compatibility_flag[8] || profile_idc === 9 || profile_compatibility_flag[9] || profile_idc === 10 || profile_compatibility_flag[10] || profile_idc === 11 || profile_compatibility_flag[11]) {
    max_12bit_constraint_flag = !!reader.next();
    max_10bit_constraint_flag = !!reader.next();
    max_8bit_constraint_flag = !!reader.next();
    max_422chroma_constraint_flag = !!reader.next();
    max_420chroma_constraint_flag = !!reader.next();
    max_monochrome_constraint_flag = !!reader.next();
    intra_constraint_flag = !!reader.next();
    one_picture_only_constraint_flag = !!reader.next();
    lower_bit_rate_constraint_flag = !!reader.next();
    if (profile_idc === 5 || profile_compatibility_flag[5] || profile_idc === 9 || profile_compatibility_flag[9] || profile_idc === 10 || profile_compatibility_flag[10] || profile_idc === 11 || profile_compatibility_flag[11]) {
      max_14bit_constraint_flag = !!reader.next();
      reader.skip(33);
    } else {
      reader.skip(34);
    }
  } else if (profile_idc === 2 || profile_compatibility_flag[2]) {
    reader.skip(7);
    one_picture_only_constraint_flag = !!reader.next();
    reader.skip(35);
  } else {
    reader.skip(43);
  }
  let inbld_flag;
  if (profile_idc === 1 || profile_compatibility_flag[1] || profile_idc === 2 || profile_compatibility_flag[2] || profile_idc === 3 || profile_compatibility_flag[3] || profile_idc === 4 || profile_compatibility_flag[4] || profile_idc === 5 || profile_compatibility_flag[5] || profile_idc === 9 || profile_compatibility_flag[9] || profile_idc === 11 || profile_compatibility_flag[11]) {
    inbld_flag = !!reader.next();
  } else {
    reader.skip(1);
  }
  return {
    profile_space,
    tier_flag,
    profile_idc,
    profileCompatibilitySet,
    profile_compatibility_flag,
    constraintSet,
    progressive_source_flag,
    interlaced_source_flag,
    non_packed_constraint_flag,
    frame_only_constraint_flag,
    max_12bit_constraint_flag,
    max_10bit_constraint_flag,
    max_8bit_constraint_flag,
    max_422chroma_constraint_flag,
    max_420chroma_constraint_flag,
    max_monochrome_constraint_flag,
    intra_constraint_flag,
    one_picture_only_constraint_flag,
    lower_bit_rate_constraint_flag,
    max_14bit_constraint_flag,
    inbld_flag
  };
}
function h265ParseProfileTierLevel(reader, profilePresentFlag, maxNumSubLayersMinus1) {
  let generalProfileTier;
  if (profilePresentFlag) {
    generalProfileTier = h265ParseProfileTier(reader);
  }
  const general_level_idc = reader.read(8);
  const sub_layer_profile_present_flag = [];
  const sub_layer_level_present_flag = [];
  for (let i = 0; i < maxNumSubLayersMinus1; i += 1) {
    sub_layer_profile_present_flag[i] = !!reader.next();
    sub_layer_level_present_flag[i] = !!reader.next();
  }
  if (maxNumSubLayersMinus1 > 0) {
    for (let i = maxNumSubLayersMinus1; i < 8; i += 1) {
      reader.read(2);
    }
  }
  const subLayerProfileTier = [];
  const sub_layer_level_idc = [];
  for (let i = 0; i < maxNumSubLayersMinus1; i += 1) {
    if (sub_layer_profile_present_flag[i]) {
      subLayerProfileTier[i] = h265ParseProfileTier(reader);
    }
    if (sub_layer_level_present_flag[i]) {
      sub_layer_level_idc[i] = reader.read(8);
    }
  }
  return {
    generalProfileTier,
    general_level_idc,
    sub_layer_profile_present_flag,
    sub_layer_level_present_flag,
    subLayerProfileTier,
    sub_layer_level_idc
  };
}
function h265ParseScalingListData(reader) {
  const scaling_list = [];
  for (let sizeId = 0; sizeId < 4; sizeId += 1) {
    scaling_list[sizeId] = [];
    for (let matrixId = 0; matrixId < 6; matrixId += sizeId === 3 ? 3 : 1) {
      const scaling_list_pred_mode_flag = !!reader.next();
      if (!scaling_list_pred_mode_flag) {
        reader.decodeExponentialGolombNumber();
      } else {
        let nextCoef = 8;
        const coefNum = Math.min(64, 1 << 4 + (sizeId << 1));
        if (sizeId > 1) {
          const scaling_list_dc_coef_minus8 = reader.decodeExponentialGolombNumber();
          nextCoef = scaling_list_dc_coef_minus8 + 8;
        }
        scaling_list[sizeId][matrixId] = [];
        for (let i = 0; i < coefNum; i += 1) {
          const scaling_list_delta_coef = reader.decodeExponentialGolombNumber();
          nextCoef = (nextCoef + scaling_list_delta_coef + 256) % 256;
          scaling_list[sizeId][matrixId][i] = nextCoef;
        }
      }
    }
  }
  return scaling_list;
}
function h265ParseShortTermReferencePictureSet(reader, stRpsIdx, num_short_term_ref_pic_sets, sets) {
  let inter_ref_pic_set_prediction_flag = false;
  if (stRpsIdx !== 0) {
    inter_ref_pic_set_prediction_flag = !!reader.next();
  }
  let delta_idx_minus1 = 0;
  let delta_rps_sign = false;
  let abs_delta_rps_minus1 = 0;
  const used_by_curr_pic_flag = [];
  const use_delta_flag = [];
  let num_negative_pics = 0;
  let num_positive_pics = 0;
  const delta_poc_s0_minus1 = [];
  const used_by_curr_pic_s0_flag = [];
  const delta_poc_s1_minus1 = [];
  const used_by_curr_pic_s1_flag = [];
  if (inter_ref_pic_set_prediction_flag) {
    if (stRpsIdx === num_short_term_ref_pic_sets) {
      delta_idx_minus1 = reader.decodeExponentialGolombNumber();
    }
    delta_rps_sign = !!reader.next();
    abs_delta_rps_minus1 = reader.decodeExponentialGolombNumber();
    const RefRpsIdx = stRpsIdx - (delta_idx_minus1 + 1);
    const RefRps = sets[RefRpsIdx];
    const NumDeltaPocs_RefRpsIdx = RefRps.num_negative_pics + RefRps.num_positive_pics;
    for (let j = 0; j <= NumDeltaPocs_RefRpsIdx; j += 1) {
      used_by_curr_pic_flag[j] = !!reader.next();
      if (!used_by_curr_pic_flag[j]) {
        use_delta_flag[j] = !!reader.next();
      } else {
        use_delta_flag[j] = true;
      }
    }
    const DeltaRps = (1 - 2 * Number(delta_rps_sign)) * (abs_delta_rps_minus1 + 1);
    const RefPocS0 = [];
    const RefPocS1 = [];
    const pocS0 = [];
    const pocS1 = [];
    let dPoc = 0;
    for (let i2 = 0; i2 < RefRps.num_negative_pics; i2 += 1) {
      dPoc -= RefRps.delta_poc_s0_minus1[i2] + 1;
      RefPocS0[i2] = dPoc;
    }
    dPoc = 0;
    for (let i2 = 0; i2 < RefRps.num_positive_pics; i2 += 1) {
      dPoc += RefRps.delta_poc_s1_minus1[i2] + 1;
      RefPocS1[i2] = dPoc;
    }
    let i = 0;
    if (RefRps.num_positive_pics > 0) {
      for (let j = RefRps.num_positive_pics - 1; j >= 0; j -= 1) {
        dPoc = RefPocS1[j] + DeltaRps;
        if (dPoc < 0 && use_delta_flag[RefRps.num_negative_pics + j]) {
          pocS0[i] = dPoc;
          used_by_curr_pic_s0_flag[i] = used_by_curr_pic_flag[RefRps.num_negative_pics + j];
          i += 1;
        }
      }
    }
    if (DeltaRps < 0 && use_delta_flag[NumDeltaPocs_RefRpsIdx]) {
      pocS0[i] = DeltaRps;
      used_by_curr_pic_s0_flag[i] = used_by_curr_pic_flag[NumDeltaPocs_RefRpsIdx];
      i += 1;
    }
    for (let j = 0; j < RefRps.num_negative_pics; j += 1) {
      dPoc = RefPocS0[j] + DeltaRps;
      if (dPoc < 0 && use_delta_flag[j]) {
        pocS0[i] = dPoc;
        used_by_curr_pic_s0_flag[i] = used_by_curr_pic_flag[j];
        i += 1;
      }
    }
    num_negative_pics = i;
    let prev = 0;
    for (i = 0; i < num_negative_pics; i += 1) {
      const current = pocS0[i];
      delta_poc_s0_minus1[i] = -(current - prev - 1);
      prev = current;
    }
    i = 0;
    if (RefRps.num_negative_pics > 0) {
      for (let j = RefRps.num_negative_pics - 1; j >= 0; j -= 1) {
        dPoc = RefPocS0[j] + DeltaRps;
        if (dPoc > 0 && use_delta_flag[j]) {
          pocS1[i] = dPoc;
          used_by_curr_pic_s1_flag[i] = used_by_curr_pic_flag[j];
          i += 1;
        }
      }
    }
    if (DeltaRps > 0 && use_delta_flag[NumDeltaPocs_RefRpsIdx]) {
      pocS1[i] = DeltaRps;
      used_by_curr_pic_s1_flag[i] = used_by_curr_pic_flag[NumDeltaPocs_RefRpsIdx];
      i += 1;
    }
    for (let j = 0; j < RefRps.num_positive_pics; j += 1) {
      dPoc = RefPocS1[j] + DeltaRps;
      if (dPoc > 0 && use_delta_flag[RefRps.num_negative_pics + j]) {
        pocS1[i] = dPoc;
        used_by_curr_pic_s1_flag[i] = used_by_curr_pic_flag[RefRps.num_negative_pics + j];
        i += 1;
      }
    }
    num_positive_pics = i;
    prev = 0;
    for (i = 0; i < num_positive_pics; i += 1) {
      const current = pocS1[i];
      delta_poc_s1_minus1[i] = current - prev - 1;
      prev = current;
    }
  } else {
    num_negative_pics = reader.decodeExponentialGolombNumber();
    num_positive_pics = reader.decodeExponentialGolombNumber();
    for (let i = 0; i < num_negative_pics; i += 1) {
      delta_poc_s0_minus1[i] = reader.decodeExponentialGolombNumber();
      used_by_curr_pic_s0_flag[i] = !!reader.next();
    }
    for (let i = 0; i < num_positive_pics; i += 1) {
      delta_poc_s1_minus1[i] = reader.decodeExponentialGolombNumber();
      used_by_curr_pic_s1_flag[i] = !!reader.next();
    }
  }
  return {
    stRpsIdx,
    num_short_term_ref_pic_sets,
    inter_ref_pic_set_prediction_flag,
    delta_idx_minus1,
    delta_rps_sign,
    abs_delta_rps_minus1,
    used_by_curr_pic_flag,
    use_delta_flag,
    num_negative_pics,
    num_positive_pics,
    delta_poc_s0_minus1,
    used_by_curr_pic_s0_flag,
    delta_poc_s1_minus1,
    used_by_curr_pic_s1_flag
  };
}
var H265AspectRatioIndicator = {
  Unspecified: 0,
  Square: 1,
  _12_11: 2,
  _10_11: 3,
  _16_11: 4,
  _40_33: 5,
  _24_11: 6,
  _20_11: 7,
  _32_11: 8,
  _80_33: 9,
  _18_11: 10,
  _15_11: 11,
  _64_33: 12,
  _160_99: 13,
  _4_3: 15,
  _3_2: 16,
  _2_1: 17,
  Extended: 255
};
function h265ParseVuiParameters(reader, sps_max_sub_layers_minus1) {
  const aspect_ratio_info_present_flag = !!reader.next();
  let aspect_ratio_idc;
  let sar_width;
  let sar_height;
  if (aspect_ratio_info_present_flag) {
    aspect_ratio_idc = reader.read(8);
    if (aspect_ratio_idc === H265AspectRatioIndicator.Extended) {
      sar_width = reader.read(16);
      sar_height = reader.read(16);
    }
  }
  const overscan_info_present_flag = !!reader.next();
  let overscan_appropriate_flag;
  if (overscan_info_present_flag) {
    overscan_appropriate_flag = !!reader.next();
  }
  const video_signal_type_present_flag = !!reader.next();
  let video_format;
  let video_full_range_flag;
  let colour_description_present_flag;
  let colour_primaries;
  let transfer_characteristics;
  let matrix_coeffs;
  if (video_signal_type_present_flag) {
    video_format = reader.read(3);
    video_full_range_flag = !!reader.next();
    colour_description_present_flag = !!reader.next();
    if (colour_description_present_flag) {
      colour_primaries = reader.read(8);
      transfer_characteristics = reader.read(8);
      matrix_coeffs = reader.read(8);
    }
  }
  const chroma_loc_info_present_flag = !!reader.next();
  let chroma_sample_loc_type_top_field;
  let chroma_sample_loc_type_bottom_field;
  if (chroma_loc_info_present_flag) {
    chroma_sample_loc_type_top_field = reader.decodeExponentialGolombNumber();
    chroma_sample_loc_type_bottom_field = reader.decodeExponentialGolombNumber();
  }
  const neutral_chroma_indication_flag = !!reader.next();
  const field_seq_flag = !!reader.next();
  const frame_field_info_present_flag = !!reader.next();
  const default_display_window_flag = !!reader.next();
  let def_disp_win_left_offset;
  let def_disp_win_right_offset;
  let def_disp_win_top_offset;
  let def_disp_win_bottom_offset;
  if (default_display_window_flag) {
    def_disp_win_left_offset = reader.decodeExponentialGolombNumber();
    def_disp_win_right_offset = reader.decodeExponentialGolombNumber();
    def_disp_win_top_offset = reader.decodeExponentialGolombNumber();
    def_disp_win_bottom_offset = reader.decodeExponentialGolombNumber();
  }
  const vui_timing_info_present_flag = !!reader.next();
  let vui_num_units_in_tick;
  let vui_time_scale;
  let vui_poc_proportional_to_timing_flag;
  let vui_num_ticks_poc_diff_one_minus1;
  let vui_hrd_parameters_present_flag;
  let vui_hrd_parameters;
  if (vui_timing_info_present_flag) {
    vui_num_units_in_tick = reader.read(32);
    vui_time_scale = reader.read(32);
    vui_poc_proportional_to_timing_flag = !!reader.next();
    if (vui_poc_proportional_to_timing_flag) {
      vui_num_ticks_poc_diff_one_minus1 = reader.decodeExponentialGolombNumber();
    }
    vui_hrd_parameters_present_flag = !!reader.next();
    if (vui_hrd_parameters_present_flag) {
      vui_hrd_parameters = h265ParseHrdParameters(reader, true, sps_max_sub_layers_minus1);
    }
  }
  const bitstream_restriction_flag = !!reader.next();
  let tiles_fixed_structure_flag;
  let motion_vectors_over_pic_boundaries_flag;
  let restricted_ref_pic_lists_flag;
  let min_spatial_segmentation_idc;
  let max_bytes_per_pic_denom;
  let max_bits_per_min_cu_denom;
  let log2_max_mv_length_horizontal;
  let log2_max_mv_length_vertical;
  if (bitstream_restriction_flag) {
    tiles_fixed_structure_flag = !!reader.next();
    motion_vectors_over_pic_boundaries_flag = !!reader.next();
    restricted_ref_pic_lists_flag = !!reader.next();
    min_spatial_segmentation_idc = reader.decodeExponentialGolombNumber();
    max_bytes_per_pic_denom = reader.decodeExponentialGolombNumber();
    max_bits_per_min_cu_denom = reader.decodeExponentialGolombNumber();
    log2_max_mv_length_horizontal = reader.decodeExponentialGolombNumber();
    log2_max_mv_length_vertical = reader.decodeExponentialGolombNumber();
  }
  return {
    aspect_ratio_info_present_flag,
    aspect_ratio_idc,
    sar_width,
    sar_height,
    overscan_info_present_flag,
    overscan_appropriate_flag,
    video_signal_type_present_flag,
    video_format,
    video_full_range_flag,
    colour_description_present_flag,
    colour_primaries,
    transfer_characteristics,
    matrix_coeffs,
    chroma_loc_info_present_flag,
    chroma_sample_loc_type_top_field,
    chroma_sample_loc_type_bottom_field,
    neutral_chroma_indication_flag,
    field_seq_flag,
    frame_field_info_present_flag,
    default_display_window_flag,
    def_disp_win_left_offset,
    def_disp_win_right_offset,
    def_disp_win_top_offset,
    def_disp_win_bottom_offset,
    vui_timing_info_present_flag,
    vui_num_units_in_tick,
    vui_time_scale,
    vui_poc_proportional_to_timing_flag,
    vui_num_ticks_poc_diff_one_minus1,
    vui_hrd_parameters_present_flag,
    vui_hrd_parameters,
    bitstream_restriction_flag,
    tiles_fixed_structure_flag,
    motion_vectors_over_pic_boundaries_flag,
    restricted_ref_pic_lists_flag,
    min_spatial_segmentation_idc,
    max_bytes_per_pic_denom,
    max_bits_per_min_cu_denom,
    log2_max_mv_length_horizontal,
    log2_max_mv_length_vertical
  };
}
function h265ParseHrdParameters(reader, commonInfPresentFlag, maxNumSubLayersMinus1) {
  let nal_hrd_parameters_present_flag;
  let vcl_hrd_parameters_present_flag;
  let sub_pic_hrd_params_present_flag;
  let tick_divisor_minus2;
  let du_cpb_removal_delay_increment_length_minus1;
  let sub_pic_cpb_params_in_pic_timing_sei_flag;
  let dpb_output_delay_du_length_minus1;
  let bit_rate_scale;
  let cpb_size_scale;
  let cpb_size_du_scale;
  let initial_cpb_removal_delay_length_minus1;
  let au_cpb_removal_delay_length_minus1;
  let dpb_output_delay_length_minus1;
  if (commonInfPresentFlag) {
    nal_hrd_parameters_present_flag = !!reader.next();
    vcl_hrd_parameters_present_flag = !!reader.next();
    if (nal_hrd_parameters_present_flag || vcl_hrd_parameters_present_flag) {
      sub_pic_hrd_params_present_flag = !!reader.next();
      if (sub_pic_hrd_params_present_flag) {
        tick_divisor_minus2 = reader.read(8);
        du_cpb_removal_delay_increment_length_minus1 = reader.read(5);
        sub_pic_cpb_params_in_pic_timing_sei_flag = !!reader.next();
        dpb_output_delay_du_length_minus1 = reader.read(5);
      }
      bit_rate_scale = reader.read(4);
      cpb_size_scale = reader.read(4);
      if (sub_pic_hrd_params_present_flag) {
        cpb_size_du_scale = reader.read(4);
      }
      initial_cpb_removal_delay_length_minus1 = reader.read(5);
      au_cpb_removal_delay_length_minus1 = reader.read(5);
      dpb_output_delay_length_minus1 = reader.read(5);
    }
  }
  const fixed_pic_rate_general_flag = [];
  const fixed_pic_rate_within_cvs_flag = [];
  const elemental_duration_in_tc_minus1 = [];
  const low_delay_hrd_flag = [];
  const cpb_cnt_minus1 = [];
  const nalHrdParameters = [];
  const vclHrdParameters = [];
  for (let i = 0; i <= maxNumSubLayersMinus1; i += 1) {
    fixed_pic_rate_general_flag[i] = !!reader.next();
    if (!fixed_pic_rate_general_flag[i]) {
      fixed_pic_rate_within_cvs_flag[i] = !!reader.next();
    }
    if (fixed_pic_rate_within_cvs_flag[i]) {
      elemental_duration_in_tc_minus1[i] = reader.decodeExponentialGolombNumber();
    } else {
      low_delay_hrd_flag[i] = !!reader.next();
    }
    if (!low_delay_hrd_flag[i]) {
      cpb_cnt_minus1[i] = reader.decodeExponentialGolombNumber();
    }
    if (nal_hrd_parameters_present_flag) {
      nalHrdParameters[i] = h265ParseSubLayerHrdParameters(reader, i, getCpbCnt(cpb_cnt_minus1[i]));
    }
    if (vcl_hrd_parameters_present_flag) {
      vclHrdParameters[i] = h265ParseSubLayerHrdParameters(reader, i, getCpbCnt(cpb_cnt_minus1[i]));
    }
  }
  return {
    nal_hrd_parameters_present_flag,
    vcl_hrd_parameters_present_flag,
    sub_pic_hrd_params_present_flag,
    tick_divisor_minus2,
    du_cpb_removal_delay_increment_length_minus1,
    sub_pic_cpb_params_in_pic_timing_sei_flag,
    dpb_output_delay_du_length_minus1,
    bit_rate_scale,
    cpb_size_scale,
    cpb_size_du_scale,
    initial_cpb_removal_delay_length_minus1,
    au_cpb_removal_delay_length_minus1,
    dpb_output_delay_length_minus1,
    fixed_pic_rate_general_flag,
    fixed_pic_rate_within_cvs_flag,
    elemental_duration_in_tc_minus1,
    low_delay_hrd_flag,
    cpb_cnt_minus1,
    nalHrdParameters,
    vclHrdParameters
  };
}
function h265ParseSubLayerHrdParameters(reader, subLayerId, CpbCnt) {
  const bit_rate_value_minus1 = [];
  const cpb_size_value_minus1 = [];
  const cpb_size_du_value_minus1 = [];
  const bit_rate_du_value_minus1 = [];
  const cbr_flag = [];
  for (let i = 0; i < CpbCnt; i += 1) {
    bit_rate_value_minus1[i] = reader.decodeExponentialGolombNumber();
    cpb_size_value_minus1[i] = reader.decodeExponentialGolombNumber();
    if (subLayerId > 0) {
      cbr_flag[i] = !!reader.next();
    }
  }
  return {
    bit_rate_value_minus1,
    cpb_size_value_minus1,
    cpb_size_du_value_minus1,
    bit_rate_du_value_minus1,
    cbr_flag
  };
}
function getCpbCnt(cpb_cnt_minus_1) {
  return cpb_cnt_minus_1 + 1;
}
function h265SearchConfiguration(buffer2) {
  let videoParameterSet;
  let sequenceParameterSet;
  let pictureParameterSet;
  let count = 0;
  for (const nalu of annexBSplitNalu(buffer2)) {
    const header = h265ParseNaluHeader(nalu);
    const raw = {
      ...header,
      data: nalu,
      rbsp: nalu.subarray(2)
    };
    switch (header.nal_unit_type) {
      case 32:
        videoParameterSet = raw;
        break;
      case 33:
        sequenceParameterSet = raw;
        break;
      case 34:
        pictureParameterSet = raw;
        break;
      default:
        continue;
    }
    count += 1;
    if (count === 3) {
      return {
        videoParameterSet,
        sequenceParameterSet,
        pictureParameterSet
      };
    }
  }
  throw new Error("Invalid data");
}
function h265ParseSpsMultilayerExtension(reader) {
  const inter_view_mv_vert_constraint_flag = !!reader.next();
  return {
    inter_view_mv_vert_constraint_flag
  };
}
function h265ParseSps3dExtension(reader) {
  const iv_di_mc_enabled_flag = [];
  const iv_mv_scal_enabled_flag = [];
  iv_di_mc_enabled_flag[0] = !!reader.next();
  iv_mv_scal_enabled_flag[0] = !!reader.next();
  const log2_ivmc_sub_pb_size_minus3 = reader.decodeExponentialGolombNumber();
  const iv_res_pred_enabled_flag = !!reader.next();
  const depth_ref_enabled_flag = !!reader.next();
  const vsp_mc_enabled_flag = !!reader.next();
  const dbbp_enabled_flag = !!reader.next();
  iv_di_mc_enabled_flag[1] = !!reader.next();
  iv_mv_scal_enabled_flag[1] = !!reader.next();
  const tex_mc_enabled_flag = !!reader.next();
  const log2_texmc_sub_pb_size_minus3 = reader.decodeExponentialGolombNumber();
  const intra_contour_enabled_flag = !!reader.next();
  const intra_dc_only_wedge_enabled_flag = !!reader.next();
  const cqt_cu_part_pred_enabled_flag = !!reader.next();
  const inter_dc_only_enabled_flag = !!reader.next();
  const skip_intra_enabled_flag = !!reader.next();
  return {
    iv_di_mc_enabled_flag,
    iv_mv_scal_enabled_flag,
    log2_ivmc_sub_pb_size_minus3,
    iv_res_pred_enabled_flag,
    depth_ref_enabled_flag,
    vsp_mc_enabled_flag,
    dbbp_enabled_flag,
    tex_mc_enabled_flag,
    log2_texmc_sub_pb_size_minus3,
    intra_contour_enabled_flag,
    intra_dc_only_wedge_enabled_flag,
    cqt_cu_part_pred_enabled_flag,
    inter_dc_only_enabled_flag,
    skip_intra_enabled_flag
  };
}
function h265ParseConfiguration(data) {
  const { videoParameterSet, sequenceParameterSet, pictureParameterSet } = h265SearchConfiguration(data);
  const { profileTierLevel: { generalProfileTier: { profile_space: generalProfileSpace, tier_flag: generalTierFlag, profile_idc: generalProfileIndex, profileCompatibilitySet: generalProfileCompatibilitySet, constraintSet: generalConstraintSet }, general_level_idc: generalLevelIndex } } = h265ParseVideoParameterSet(videoParameterSet.rbsp);
  const { chroma_format_idc, pic_width_in_luma_samples: encodedWidth, pic_height_in_luma_samples: encodedHeight, conf_win_left_offset: cropLeft = 0, conf_win_right_offset: cropRight = 0, conf_win_top_offset: cropTop = 0, conf_win_bottom_offset: cropBottom = 0 } = h265ParseSequenceParameterSet(sequenceParameterSet.rbsp);
  const SubWidthC = getSubWidthC(chroma_format_idc);
  const SubHeightC = getSubHeightC(chroma_format_idc);
  const croppedWidth = encodedWidth - SubWidthC * (cropLeft + cropRight);
  const croppedHeight = encodedHeight - SubHeightC * (cropTop + cropBottom);
  return {
    videoParameterSet,
    sequenceParameterSet,
    pictureParameterSet,
    generalProfileSpace,
    generalProfileIndex,
    generalProfileCompatibilitySet,
    generalTierFlag,
    generalLevelIndex,
    generalConstraintSet,
    encodedWidth,
    encodedHeight,
    cropLeft,
    cropRight,
    cropTop,
    cropBottom,
    croppedWidth,
    croppedHeight
  };
}
export {
  AndroidAv1Level,
  AndroidAv1Profile,
  AndroidAvcLevel,
  AndroidAvcProfile,
  AndroidHevcLevel,
  AndroidHevcProfile,
  AndroidKeyCode,
  AndroidKeyEventAction,
  AndroidKeyEventMeta,
  AndroidKeyNames,
  AndroidMotionEventAction,
  AndroidMotionEventButton,
  AndroidScreenPowerMode,
  Av1,
  DefaultServerPath,
  EmptyControlMessage,
  H265AspectRatioIndicator,
  NaluSodbBitReader,
  ScrcpyAudioCodec,
  BackOrScreenOnControlMessage2 as ScrcpyBackOrScreenOnControlMessage,
  CaptureOrientation as ScrcpyCaptureOrientation,
  CodecOptions as ScrcpyCodecOptions,
  ScrcpyControlMessageSerializer,
  ScrcpyControlMessageType,
  ScrcpyControlMessageTypeMap,
  ScrcpyControlMessageWriter,
  Crop as ScrcpyCrop,
  ScrcpyDeviceMessageParsers,
  ScrcpyInjectKeyCodeControlMessage,
  InjectScrollControlMessage3 as ScrcpyInjectScrollControlMessage,
  ScrcpyInjectTextControlMessage,
  InjectTouchControlMessage2 as ScrcpyInjectTouchControlMessage,
  InstanceId as ScrcpyInstanceId,
  LockOrientation as ScrcpyLockOrientation,
  NewDisplay as ScrcpyNewDisplay,
  ScrcpyOptions1_15,
  ScrcpyOptions1_15_1,
  ScrcpyOptions1_16,
  ScrcpyOptions1_17,
  ScrcpyOptions1_18,
  ScrcpyOptions1_19,
  ScrcpyOptions1_20,
  ScrcpyOptions1_21,
  ScrcpyOptions1_22,
  ScrcpyOptions1_23,
  ScrcpyOptions1_24,
  ScrcpyOptions1_25,
  ScrcpyOptions2_0,
  ScrcpyOptions2_1,
  ScrcpyOptions2_1_1,
  ScrcpyOptions2_2,
  ScrcpyOptions2_3,
  ScrcpyOptions2_3_1,
  ScrcpyOptions2_4,
  ScrcpyOptions2_5,
  ScrcpyOptions2_6,
  ScrcpyOptions2_6_1,
  ScrcpyOptions2_7,
  ScrcpyOptions3_0,
  ScrcpyOptions3_0_1,
  ScrcpyOptions3_0_2,
  ScrcpyOptions3_1,
  ScrcpyOptions3_2,
  ScrcpyOptions3_3,
  ScrcpyOptions3_3_1,
  ScrcpyOptions3_3_2,
  ScrcpyOptions3_3_1 as ScrcpyOptions3_3_3,
  ScrcpyOptions3_3_1 as ScrcpyOptionsLatest,
  Orientation as ScrcpyOrientation,
  PointerId as ScrcpyPointerId,
  SetClipboardControlMessage2 as ScrcpySetClipboardControlMessage,
  ScrcpySetDisplayPowerControlMessage,
  UHidCreateControlMessage3 as ScrcpyUHidCreateControlMessage,
  UHidOutputDeviceMessage as ScrcpyUHidOutputDeviceMessage,
  ScrcpyVideoCodecId,
  ScrcpyVideoCodecNameMap,
  annexBSplitNalu,
  clamp,
  getSubHeightC,
  getSubWidthC,
  h264ParseConfiguration,
  h264ParseSequenceParameterSet,
  h264SearchConfiguration,
  h265ParseConfiguration,
  h265ParseHrdParameters,
  h265ParseNaluHeader,
  h265ParseScalingListData,
  h265ParseSequenceParameterSet,
  h265ParseShortTermReferencePictureSet,
  h265ParseSps3dExtension,
  h265ParseSpsMultilayerExtension,
  h265ParseSubLayerHrdParameters,
  h265ParseVideoParameterSet,
  h265ParseVuiParameters,
  h265SearchConfiguration,
  isScrcpyOptionValue,
  omit,
  toScrcpyOptionValue
};
