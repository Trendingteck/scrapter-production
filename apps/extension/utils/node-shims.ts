/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// ==========================================
// 1. GLOBAL PROCESS & BUFFER
// ==========================================
export const process = {
  env: { NODE_ENV: 'production' },
  cwd: () => '/',
  platform: 'browser',
  version: 'v18.0.0',
  stdout: { write: () => true },
  stderr: { write: () => true },
  stdin: { read: () => null },
  nextTick: (cb: Function, ...args: any[]) => setTimeout(() => cb(...args), 0),
  argv: [],
  pid: 1,
  browser: true,
  on: () => {},
  addListener: () => {},
  once: () => {},
  off: () => {},
  removeListener: () => {},
  removeAllListeners: () => {},
  emit: () => {},
  binding: () => { throw new Error('process.binding is not supported'); },
};

export const stdin = process.stdin;
export const stdout = process.stdout;
export const stderr = process.stderr;
export const argv = process.argv;
export const env = process.env;
export const nextTick = process.nextTick;
export const cwd = process.cwd;

export class Buffer {
  length: number;
  private _data: Uint8Array;
  constructor(arg: any) {
    this._data = arg instanceof Uint8Array ? arg : new Uint8Array(0);
    this.length = this._data.length;
  }
  static from(data: any) { return new Buffer(data); }
  static isBuffer(obj: any) { return obj instanceof Buffer; }
  static concat(list: any[]) { return new Buffer(0); }
  static alloc(size: number) { return new Buffer(size); }
  static byteLength(s: string) { return s.length; }
  toString() { return ''; }
  slice() { return new Buffer(0); }
}

// ==========================================
// 2. ASSERT
// ==========================================
export const assert = (condition: any, message?: string) => { 
  if (!condition) console.warn(`Assertion failed: ${message}`); 
};
export const ok = assert;
export const strictEqual = (a: any, b: any) => {};
export const notStrictEqual = (a: any, b: any) => {};
export const equal = (a: any, b: any) => {};
export const notEqual = (a: any, b: any) => {};
export const deepEqual = (a: any, b: any) => {};
export const deepStrictEqual = (a: any, b: any) => {};
export const ifError = (e: any) => {};
export const throws = () => {};
export const doesNotThrow = () => {};
export const match = () => {};

// ==========================================
// 3. READLINE
// ==========================================
export const createInterface = () => ({
  on: () => {},
  close: () => {},
  question: (q: string, cb: any) => cb(''),
  prompt: () => {},
});

// ==========================================
// 4. CRYPTO
// ==========================================
export const createHash = (algo: string) => ({
  update: (data: any) => ({
    digest: (enc?: string) => 'mock-hash-value'
  })
});
export const randomBytes = (size: number) => new Uint8Array(size);
export const getRandomValues = (arr: any) => arr;

// ==========================================
// 5. EVENTS
// ==========================================
export class EventEmitter {
  private _events: any = {};
  on(e: string, l: Function) { return this; }
  once(e: string, l: Function) { return this; }
  emit(e: string, ...args: any[]) { return false; }
  removeListener(e: string, l: Function) { return this; }
  off(e: string, l: Function) { return this; }
  removeAllListeners() { return this; }
  setMaxListeners() { return this; }
}

// ==========================================
// 6. STREAMS
// ==========================================
export class Stream extends EventEmitter { pipe() { return this; } }
export class Readable extends Stream { push() { return true; } }
export class Writable extends Stream { write() { return true; } end() {} }
export class Duplex extends Readable { write() { return true; } end() {} }
export class Transform extends Duplex {}
export class PassThrough extends Transform {}

// ==========================================
// 7. NETWORK & DNS & HTTP
// ==========================================
export const lookup = (hostname: string, options: any, cb: any) => {
  if (typeof options === 'function') cb = options;
  if (hostname === 'localhost') cb(null, '127.0.0.1', 4);
  else cb(new Error(`DNS lookup not supported in browser for ${hostname}`));
};
export const resolve4 = (hostname: string, cb: any) => cb(null, ['127.0.0.1']);
export const promisesDns = {
  lookup: async () => ({ address: '127.0.0.1', family: 4 }),
  resolve4: async () => ['127.0.0.1'],
};

export const isIP = () => 0;
export const isIPv4 = () => false;
export const isIPv6 = () => false;
export class Socket extends EventEmitter {
  connect() { return this; }
  write() { return true; }
  end() {}
  destroy() {}
  unref() {}
  ref() {}
}
export const createConnection = () => new Socket();
export const connect = createConnection;
export const tlsConnect = createConnection;
export const createSecureContext = () => ({});

export const request = () => new ClientRequest();
export const get = () => new ClientRequest();
export class ClientRequest extends EventEmitter {
  end() {}
  write() {}
  abort() {}
  destroy() {}
  setTimeout() {}
}
export class Agent { destroy() {} }
export const globalAgent = new Agent();

// ==========================================
// 8. CHILD PROCESS
// ==========================================
export const spawn = () => ({
  on: () => {},
  stdout: new Readable(),
  stderr: new Readable(),
  stdin: new Writable(),
  kill: () => {},
  unref: () => {},
});
export const spawnSync = () => ({ status: 0, stdout: '', stderr: '', pid: 123, output: [], signal: null });
export const exec = (cmd: string, cb: any) => cb && cb(null, '', '');
export const execSync = () => '';
export const execFile = (file: string, cb: any) => cb && cb(null, '', '');
export const fork = () => spawn();

// ==========================================
// 9. OS & VM & DGRAM
// ==========================================
export const platform = () => 'browser';
export const arch = () => 'x64';
export const homedir = () => '/';
export const tmpdir = () => '/tmp';
export const type = () => 'Browser';
export const release = () => '1.0.0';
export const EOL = '\n';
export const cpus = () => [{ model: 'Intel', speed: 3000, times: {} }];
export const endianness = () => 'LE';
export const freemem = () => 1024 * 1024 * 1024;
export const hostname = () => 'localhost';
export const loadavg = () => [0, 0, 0];
export const networkInterfaces = () => ({});
export const totalmem = () => 1024 * 1024 * 1024 * 4;
export const uptime = () => 0;
export const userInfo = () => ({ username: 'user', uid: 0, gid: 0 });

export const runInNewContext = () => null;
export const runInThisContext = () => null;
export const createContext = () => ({});
export const isContext = () => false;
export const compileFunction = () => () => {};

export const createSocket = () => new EventEmitter();

// ==========================================
// 10. FILE SYSTEM
// ==========================================
export const constants = { F_OK: 0, R_OK: 4, W_OK: 2, X_OK: 1 };
export const accessSync = () => {};
export const appendFileSync = () => {};
export const chmodSync = () => {};
export const chownSync = () => {};
export const copyFileSync = () => {};
export const existsSync = () => false;
export const lstatSync = () => ({ isDirectory: () => false, isFile: () => false, isSymbolicLink: () => false, size: 0 });
export const mkdirSync = () => {};
export const mkdtempSync = () => '/tmp/temp';
export const openSync = () => 0;
export const readFileSync = () => '';
export const readdirSync = () => [];
export const readlinkSync = () => '';
export const realpathSync = (p: string) => p;
export const renameSync = () => {};
export const rmdirSync = () => {};
export const rmSync = () => {};
export const statSync = () => ({ isDirectory: () => false, isFile: () => false, size: 0 });
export const symlinkSync = () => {};
export const truncateSync = () => {};
export const unlinkSync = () => {};
export const utimesSync = () => {};
export const writeFileSync = () => {};
export const writeSync = () => {};
export const createReadStream = () => new Readable();
export const createWriteStream = () => new Writable();
export const access = (p: any, cb: any) => cb && cb(null);
export const mkdir = (p: any, cb: any) => cb && cb(null);
export const readFile = (p: any, cb: any) => cb && cb(null, '');
export const writeFile = (p: any, d: any, cb: any) => cb && cb(null);
export const stat = (p: any, cb: any) => cb && cb(null, {});
export const unlink = (p: any, cb: any) => cb && cb(null);
export const readdir = (p: any, cb: any) => cb && cb(null, []);
export const promisesFs = {
  access: async () => {},
  appendFile: async () => {},
  chmod: async () => {},
  chown: async () => {},
  copyFile: async () => {},
  lstat: async () => ({ isDirectory: () => false, isFile: () => false }),
  mkdir: async () => {},
  mkdtemp: async () => '/tmp/temp',
  open: async () => ({ close: async () => {} }),
  readdir: async () => [],
  readFile: async () => '',
  writeFile: async () => {},
  readlink: async () => '',
  realpath: async () => '',
  rename: async () => {},
  rmdir: async () => {},
  rm: async () => {},
  stat: async () => ({ isDirectory: () => false, isFile: () => false }),
  symlink: async () => {},
  truncate: async () => {},
  unlink: async () => {},
  utimes: async () => {},
};

// ==========================================
// 11. PATH (Added 'relative' here)
// ==========================================
export const join = (...args: string[]) => args.join('/');
export const resolve = (...args: string[]) => '/' + args.join('/').replace(/\/+/g, '/'); 
export const normalize = (p: string) => p; 
export const dirname = (p: string) => p;
export const basename = (p: string) => p;
export const extname = (p: string) => '';
export const sep = '/';
export const isAbsolute = (p: string) => p.startsWith('/');
export const delimiter = ':';
// Added relative and parse to be safe
export const relative = (from: string, to: string) => to.replace(from, '').replace(/^\//, '');
export const parse = (p: string) => ({ root: '/', dir: '', base: '', ext: '', name: '' });

// ==========================================
// 12. UTILS & URL
// ==========================================
export const URL = globalThis.URL;
export const URLSearchParams = globalThis.URLSearchParams;
export const urlToHttpOptions = () => ({});
export const fileURLToPath = (url: any) => url.toString();
export const pathToFileURL = (path: string) => new globalThis.URL(`file://${path}`);

export const promisify = (fn: any) => fn;
export const inherits = (ctor: any, superCtor: any) => {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: { value: ctor, enumerable: false, writable: true, configurable: true }
  });
};
export const callbackify = (fn: any) => fn;
export const format = (...args: any[]) => args.map(String).join(' ');
export const inspect = (val: any) => val;
export const types = { isDate: (d: any) => d instanceof Date };
export const deprecate = (fn: any) => fn;
export const debuglog = (name: string) => (...args: any[]) => {};

// ==========================================
// 13. GLOBAL POLYFILL
// ==========================================
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
  (globalThis as any).process = process;
}

// ==========================================
// 14. DEFAULT EXPORT
// ==========================================
export const promises = promisesFs;
export default {
  // Core
  process, Buffer, EventEmitter,
  Stream, Readable, Writable, Duplex, Transform, PassThrough,
  // Assert
  assert, ok, strictEqual, notStrictEqual, equal, notEqual, deepEqual, deepStrictEqual, ifError, throws, doesNotThrow, match,
  // Network
  lookup, resolve4, promises: promisesDns,
  Socket, createConnection, connect, isIP, isIPv4, isIPv6,
  request, get, ClientRequest, Agent, globalAgent,
  createSocket,
  // VM
  runInNewContext, runInThisContext, createContext, isContext,
  // Readline
  createInterface,
  // Child Process
  spawn, spawnSync, exec, execSync, execFile, fork, 
  // OS
  platform, arch, homedir, tmpdir, type, release, EOL, cpus, endianness, freemem, hostname, loadavg, networkInterfaces, totalmem, uptime, userInfo,
  // FS
  constants, accessSync, appendFileSync, chmodSync, chownSync, copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, openSync, readFileSync, readdirSync, readlinkSync, realpathSync, renameSync, rmdirSync, rmSync, statSync, symlinkSync, truncateSync, unlinkSync, utimesSync, writeFileSync, writeSync, createReadStream, createWriteStream, access, mkdir, readFile, writeFile, stat, unlink, readdir,
  // Path
  join, resolve, normalize, dirname, basename, extname, sep, delimiter, isAbsolute, relative, parse,
  // URL
  URL, URLSearchParams, urlToHttpOptions, fileURLToPath, pathToFileURL,
  // Utils
  promisify, inherits, callbackify, format, inspect, types, deprecate, debuglog,
  // Crypto
  createHash, randomBytes, getRandomValues, 
  // Process Named Exports
  stdin, stdout, stderr, argv, env, nextTick, cwd
};