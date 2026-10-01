// age v1 解密核心：口令模式（scrypt）和公钥模式（X25519）都能解。纯函数，不碰 DOM。
// 对照规范读：https://age-encryption.org/v1 。用的人：
//   - vendor/age-init.js：全站打码（`age:…` 小字和 ```age 块），按需加载本文件
//   - posts/wiki-tech/assets/age-passphrase.html：解密演示页
// SHA-256 系（HMAC / HKDF / PBKDF2）用浏览器自带的 Web Crypto；scrypt、ChaCha20-Poly1305、
// X25519、bech32 Web Crypto 没有（或不是每个浏览器都有），手写，不压缩，一眼能对上规范。
(function () {
  const te = new TextEncoder();
  const subtle = crypto.subtle;
  const CHUNK = 64 * 1024;                                // age 内容按 64 KiB 一块加密
  const SCRYPT_LABEL = te.encode("age-encryption.org/v1/scrypt");
  const X25519_INFO = "age-encryption.org/v1/X25519";
  const MAX_LOG_N = 20;                                   // 2^20 要 1 GB 内存，再高浏览器扛不住

  // ---------- 字节小工具 ----------
  function concat(...parts) {
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let off = 0;
    for (const p of parts) { out.set(p, off); off += p.length; }
    return out;
  }
  const hex = b => Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
  function equalBytes(a, b) {
    if (a.length !== b.length) return false;
    let d = 0;
    for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
    return d === 0;
  }
  function leToBigInt(bytes) {
    let n = 0n;
    for (let i = bytes.length - 1; i >= 0; i--) n = (n << 8n) | BigInt(bytes[i]);
    return n;
  }
  function bigIntToLe(n, length) {
    const out = new Uint8Array(length);
    for (let i = 0; i < length; i++) { out[i] = Number(n & 0xffn); n >>= 8n; }
    return out;
  }

  // base64：age 头部用标准字母表、不带 = 填充；armor 外壳和单行 `age:` 小字带不带填充都认
  function b64decode(str) {
    const s = atob(str);
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  function b64rawDecode(str) {
    if (!/^[A-Za-z0-9+/]*$/.test(str) || str.length % 4 === 1) throw new Error("头部的 base64 不合法");
    return b64decode(str + "==".slice(0, (4 - str.length % 4) % 4));
  }

  // ---------- SHA-256 系：浏览器自带的 Web Crypto ----------
  async function hmacSha256(key, data) {
    const k = await subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return new Uint8Array(await subtle.sign("HMAC", k, data));
  }
  async function hkdfSha256(ikm, salt, info, length) {
    const k = await subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
    const bits = await subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info: te.encode(info) }, k, length * 8);
    return new Uint8Array(bits);
  }
  async function pbkdf2Once(password, salt, length) {
    const k = await subtle.importKey("raw", password, "PBKDF2", false, ["deriveBits"]);
    const bits = await subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 1 }, k, length * 8);
    return new Uint8Array(bits);
  }

  // ---------- scrypt（RFC 7914，r = 8，p = 1） ----------
  const rotl = (v, n) => (v << n) | (v >>> (32 - n));

  function salsa20_8(B) {                                 // 原地变换 16 个 32 位字
    let x0 = B[0], x1 = B[1], x2 = B[2], x3 = B[3], x4 = B[4], x5 = B[5], x6 = B[6], x7 = B[7],
        x8 = B[8], x9 = B[9], x10 = B[10], x11 = B[11], x12 = B[12], x13 = B[13], x14 = B[14], x15 = B[15];
    for (let i = 0; i < 8; i += 2) {
      // 列
      x4 ^= rotl(x0 + x12, 7);   x8 ^= rotl(x4 + x0, 9);    x12 ^= rotl(x8 + x4, 13);  x0 ^= rotl(x12 + x8, 18);
      x9 ^= rotl(x5 + x1, 7);    x13 ^= rotl(x9 + x5, 9);   x1 ^= rotl(x13 + x9, 13);  x5 ^= rotl(x1 + x13, 18);
      x14 ^= rotl(x10 + x6, 7);  x2 ^= rotl(x14 + x10, 9);  x6 ^= rotl(x2 + x14, 13);  x10 ^= rotl(x6 + x2, 18);
      x3 ^= rotl(x15 + x11, 7);  x7 ^= rotl(x3 + x15, 9);   x11 ^= rotl(x7 + x3, 13);  x15 ^= rotl(x11 + x7, 18);
      // 行
      x1 ^= rotl(x0 + x3, 7);    x2 ^= rotl(x1 + x0, 9);    x3 ^= rotl(x2 + x1, 13);   x0 ^= rotl(x3 + x2, 18);
      x6 ^= rotl(x5 + x4, 7);    x7 ^= rotl(x6 + x5, 9);    x4 ^= rotl(x7 + x6, 13);   x5 ^= rotl(x4 + x7, 18);
      x11 ^= rotl(x10 + x9, 7);  x8 ^= rotl(x11 + x10, 9);  x9 ^= rotl(x8 + x11, 13);  x10 ^= rotl(x9 + x8, 18);
      x12 ^= rotl(x15 + x14, 7); x13 ^= rotl(x12 + x15, 9); x14 ^= rotl(x13 + x12, 13); x15 ^= rotl(x14 + x13, 18);
    }
    B[0] += x0; B[1] += x1; B[2] += x2; B[3] += x3; B[4] += x4; B[5] += x5; B[6] += x6; B[7] += x7;
    B[8] += x8; B[9] += x9; B[10] += x10; B[11] += x11; B[12] += x12; B[13] += x13; B[14] += x14; B[15] += x15;
  }

  function blockMix(B, Y, X, r) {                         // B 是 2r 个 64 字节块
    X.set(B.subarray((2 * r - 1) * 16, 2 * r * 16));
    for (let i = 0; i < 2 * r; i++) {
      for (let k = 0; k < 16; k++) X[k] ^= B[i * 16 + k];
      salsa20_8(X);
      Y.set(X, ((i & 1) ? r + (i >> 1) : (i >> 1)) * 16); // 偶数块排前、奇数块排后
    }
    B.set(Y);
  }

  // onProgress(0~1)：每算完一段让出一次主线程，好让页面刷新进度
  async function scrypt(password, salt, logN, length, onProgress) {
    const r = 8, N = 2 ** logN, words = 32 * r;
    const bytes = await pbkdf2Once(password, salt, 128 * r);
    const X = new Uint32Array(words);
    const dv = new DataView(bytes.buffer);
    for (let i = 0; i < words; i++) X[i] = dv.getUint32(4 * i, true);
    const V = new Uint32Array(words * N);                 // 吃内存的就是这张表：128 × r × N 字节
    const Y = new Uint32Array(words), T = new Uint32Array(16);
    const step = Math.min(N, 1 << 15);
    for (let i = 0; i < N; i++) {
      V.set(X, i * words);
      blockMix(X, Y, T, r);
      if (onProgress && (i + 1) % step === 0) { onProgress((i + 1) / (2 * N)); await new Promise(f => setTimeout(f)); }
    }
    for (let i = 0; i < N; i++) {
      const j = X[(2 * r - 1) * 16] & (N - 1);            // 按当前状态跳着读表，没法只存一部分
      for (let k = 0; k < words; k++) X[k] ^= V[j * words + k];
      blockMix(X, Y, T, r);
      if (onProgress && (i + 1) % step === 0) { onProgress(0.5 + (i + 1) / (2 * N)); await new Promise(f => setTimeout(f)); }
    }
    for (let i = 0; i < words; i++) dv.setUint32(4 * i, X[i], true);
    return pbkdf2Once(password, bytes, length);
  }

  // ---------- ChaCha20-Poly1305（RFC 8439）解密 ----------
  function chacha20Block(key, counter, nonce) {           // 32 字节钥匙 + 12 字节 nonce → 64 字节密钥流
    const s = new Uint32Array(16);
    s.set([0x61707865, 0x3320646e, 0x79622d32, 0x6b206574]);
    const kv = new DataView(key.buffer, key.byteOffset, 32), nv = new DataView(nonce.buffer, nonce.byteOffset, 12);
    for (let i = 0; i < 8; i++) s[4 + i] = kv.getUint32(4 * i, true);
    s[12] = counter;
    for (let i = 0; i < 3; i++) s[13 + i] = nv.getUint32(4 * i, true);
    const x = Int32Array.from(s);
    const qr = (a, b, c, d) => {
      x[a] += x[b]; x[d] = rotl(x[d] ^ x[a], 16);
      x[c] += x[d]; x[b] = rotl(x[b] ^ x[c], 12);
      x[a] += x[b]; x[d] = rotl(x[d] ^ x[a], 8);
      x[c] += x[d]; x[b] = rotl(x[b] ^ x[c], 7);
    };
    for (let i = 0; i < 10; i++) {
      qr(0, 4, 8, 12); qr(1, 5, 9, 13); qr(2, 6, 10, 14); qr(3, 7, 11, 15);
      qr(0, 5, 10, 15); qr(1, 6, 11, 12); qr(2, 7, 8, 13); qr(3, 4, 9, 14);
    }
    const out = new Uint8Array(64), ov = new DataView(out.buffer);
    for (let i = 0; i < 16; i++) ov.setUint32(4 * i, (x[i] + s[i]) >>> 0, true);
    return out;
  }

  function chacha20Xor(key, nonce, counter, data) {
    const out = new Uint8Array(data.length);
    for (let off = 0; off < data.length; off += 64, counter++) {
      const ks = chacha20Block(key, counter, nonce);
      for (let i = 0; i < 64 && off + i < data.length; i++) out[off + i] = data[off + i] ^ ks[i];
    }
    return out;
  }

  function poly1305(key, msg) {                           // 用 BigInt 直译公式，慢但一眼能对上规范
    const r = leToBigInt(key.subarray(0, 16)) & 0x0ffffffc0ffffffc0ffffffc0fffffffn;
    const s = leToBigInt(key.subarray(16, 32));
    const p = (1n << 130n) - 5n;
    let acc = 0n;
    for (let i = 0; i < msg.length; i += 16) {
      const block = msg.subarray(i, i + 16);
      acc = ((acc + leToBigInt(block) + (1n << BigInt(8 * block.length))) * r) % p;
    }
    return bigIntToLe((acc + s) & ((1n << 128n) - 1n), 16);
  }

  function macInput(ciphertext) {                         // 没有附加数据：密文 ‖ 补零到 16 的倍数 ‖ 0 ‖ 密文长度
    const padded = Math.ceil(ciphertext.length / 16) * 16;
    const m = new Uint8Array(padded + 16);
    m.set(ciphertext);
    new DataView(m.buffer).setBigUint64(padded + 8, BigInt(ciphertext.length), true);
    return m;
  }

  function open(key, nonce, sealed) {                     // 校验码对不上返回 null，一个字节都不解
    if (sealed.length < 16) return null;
    const ct = sealed.subarray(0, sealed.length - 16), tag = sealed.subarray(sealed.length - 16);
    const otk = chacha20Block(key, 0, nonce).subarray(0, 32);
    if (!equalBytes(poly1305(otk, macInput(ct)), tag)) return null;
    return chacha20Xor(key, nonce, 1, ct);
  }

  // ---------- X25519（RFC 7748）：Montgomery ladder，BigInt 直译 ----------
  const P25519 = (1n << 255n) - 19n;
  const mod = a => { const r = a % P25519; return r < 0n ? r + P25519 : r; };
  function powMod(b, e) {
    let r = 1n;
    b = mod(b);
    for (; e > 0n; e >>= 1n) { if (e & 1n) r = r * b % P25519; b = b * b % P25519; }
    return r;
  }
  function x25519(scalar, u) {                            // 32 字节标量 × 32 字节 u 坐标 → 32 字节
    const k = scalar.slice();
    k[0] &= 248; k[31] &= 127; k[31] |= 64;               // clamp
    const n = leToBigInt(k);
    const ub = u.slice();
    ub[31] &= 127;                                        // 最高位按规范忽略
    const x1 = mod(leToBigInt(ub));
    let x2 = 1n, z2 = 0n, x3 = x1, z3 = 1n, swap = 0n;
    for (let t = 254n; t >= 0n; t--) {
      const bit = (n >> t) & 1n;
      if (swap ^ bit) { [x2, x3] = [x3, x2]; [z2, z3] = [z3, z2]; }
      swap = bit;
      const A = mod(x2 + z2), AA = A * A % P25519, B = mod(x2 - z2), BB = B * B % P25519, E = mod(AA - BB);
      const C = mod(x3 + z3), D = mod(x3 - z3), DA = D * A % P25519, CB = C * B % P25519;
      x3 = mod(DA + CB) ** 2n % P25519;
      z3 = x1 * (mod(DA - CB) ** 2n % P25519) % P25519;
      x2 = AA * BB % P25519;
      z2 = E * mod(AA + 121665n * E) % P25519;
    }
    if (swap) { [x2, x3] = [x3, x2]; [z2, z3] = [z3, z2]; }
    return bigIntToLe(x2 * powMod(z2, P25519 - 2n) % P25519, 32);
  }
  const BASE_POINT = bigIntToLe(9n, 32);

  // ---------- 私钥 AGE-SECRET-KEY-1…：bech32（BIP 173，不是 bech32m） ----------
  const BECH32 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  function bech32Polymod(values) {
    const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (const v of values) {
      const top = chk >>> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ v;
      for (let i = 0; i < 5; i++) if ((top >>> i) & 1) chk ^= GEN[i];
    }
    return chk;
  }
  function bech32Decode(str) {
    if (str !== str.toLowerCase() && str !== str.toUpperCase()) throw new Error("私钥大小写混用");
    const s = str.toLowerCase(), pos = s.lastIndexOf("1");
    if (pos < 1 || pos + 7 > s.length) throw new Error("私钥格式不对");
    const hrp = s.slice(0, pos), data = [];
    for (const c of s.slice(pos + 1)) {
      const d = BECH32.indexOf(c);
      if (d < 0) throw new Error("私钥里有 bech32 以外的字符");
      data.push(d);
    }
    const codes = Array.from(hrp, c => c.charCodeAt(0));
    if (bech32Polymod([...codes.map(c => c >> 5), 0, ...codes.map(c => c & 31), ...data]) !== 1) {
      throw new Error("私钥校验和不对：抄错了某个字符");
    }
    let acc = 0, bits = 0;
    const out = [];
    for (const w of data.slice(0, -6)) {                  // 5 位一组 → 8 位一组
      acc = (acc << 5) | w; bits += 5;
      if (bits >= 8) { bits -= 8; out.push((acc >> bits) & 0xff); acc &= (1 << bits) - 1; }
    }
    if (bits >= 5 || acc !== 0) throw new Error("私钥的填充位不对");
    return { hrp, bytes: new Uint8Array(out) };
  }

  const isIdentity = str => /^AGE-SECRET-KEY-1[0-9A-Z]+$/.test(str.trim());

  function parseIdentity(str) {                           // → { sk, pk }，pk 是对应的公钥（32 字节）
    const { hrp, bytes } = bech32Decode(str.trim());
    if (hrp !== "age-secret-key-" || bytes.length !== 32) throw new Error("这不是 age 的 X25519 私钥");
    return { sk: bytes, pk: x25519(bytes, BASE_POINT) };
  }

  // age-keygen 写出的私钥文件里有注释行，挑出 AGE-SECRET-KEY-1… 那一行
  function findIdentity(text) {
    const line = text.split(/\r?\n/).map(l => l.trim()).find(isIdentity);
    if (!line) throw new Error("里面没有 AGE-SECRET-KEY-1 开头的私钥");
    return line;
  }

  // ---------- age v1 文件格式 ----------
  function streamNonce(counter, last) {                   // 11 字节大端计数器 ‖ 1 字节「最后一块」标记
    const n = new Uint8Array(12);
    new DataView(n.buffer).setUint32(7, counter);
    n[11] = last ? 1 : 0;
    return n;
  }

  const memMB = logN => 2 ** (logN - 10);                 // 128 × 8 × 2^logN 字节

  function parseHeader(file) {
    const marker = te.encode("\n--- ");
    let at = -1;
    for (let i = 0; i + marker.length <= file.length; i++) {
      if (marker.every((c, k) => file[i + k] === c)) { at = i; break; }
    }
    const end = at < 0 ? -1 : file.indexOf(0x0a, at + marker.length);
    if (end < 0) throw new Error("找不到头部结尾的 --- 行，这不是 age 文件");
    const headerText = new TextDecoder().decode(file.subarray(0, end));
    const lines = headerText.split("\n");
    if (lines[0] !== "age-encryption.org/v1") throw new Error("第一行不是 age-encryption.org/v1，这不是 age 文件");
    const macLine = lines[lines.length - 1];
    const stanzas = [];
    let i = 1;
    while (i < lines.length - 1) {
      if (!lines[i].startsWith("-> ")) throw new Error("头部格式不对：每段要以 -> 开头");
      const args = lines[i++].slice(3).split(" ");
      let b64 = "";
      for (;;) {
        if (i >= lines.length - 1) throw new Error("头部格式不对：段落没有结束");
        const l = lines[i++];
        b64 += l;
        if (l.length < 64) break;
      }
      stanzas.push({ args, body: b64rawDecode(b64) });
    }
    return {
      headerText,
      headerNoMac: headerText.slice(0, headerText.length - macLine.length + 3),   // 算 MAC 的范围到 --- 为止
      mac: b64rawDecode(macLine.slice(4)),
      stanzas,
      payload: file.subarray(end + 1),
    };
  }

  // 口令段：口令 + 盐 → scrypt → 包装钥匙 → 解开 file key
  async function unwrapScrypt(h, passphrase, log, onProgress) {
    const s = h.stanzas[0];
    if (h.stanzas.length !== 1) throw new Error("口令模式的文件头部只能有一段 scrypt");
    const [, saltB64, logNStr] = s.args;
    const salt = b64rawDecode(saltB64 || "");
    if (salt.length !== 16 || !/^[1-9][0-9]?$/.test(logNStr || "") || s.body.length !== 32) {
      throw new Error("scrypt 段的参数不合法");
    }
    const logN = Number(logNStr);
    if (logN > MAX_LOG_N) throw new Error(`强度 N = 2^${logN} 要 ${memMB(logN)} MB 内存，网页最多做到 2^${MAX_LOG_N}`);
    log({ title: "读头部：取出盐和强度", value: `盐 ${hex(salt)}，N = 2^${logN}`, note: "这两样都明文写在文件里，不是秘密" });

    const t0 = performance.now();
    const wrapKey = await scrypt(te.encode(passphrase), concat(SCRYPT_LABEL, salt), logN, 32, onProgress);
    const ms = Math.round(performance.now() - t0);
    log({ title: `scrypt(口令, 盐) → 包装钥匙，用时 ${ms} 毫秒`,
          note: `占内存 ${memMB(logN)} MB。攻击者每猜一次口令都要付这个代价；口令对不对，这一步还看不出来` });

    const fileKey = open(wrapKey, new Uint8Array(12), s.body);
    if (!fileKey) throw new Error("解不开 file key：校验码对不上，口令不对。不会解出一串乱码，而是直接拒绝");
    log({ title: "用包装钥匙解开 file key ✓", note: "file key 才是真正加密内容的钥匙；校验码对上了，说明口令对" });
    return fileKey;
  }

  // 公钥段：私钥 × 头部里的临时公钥 → shared secret → HKDF → 包装钥匙 → 解开 file key
  async function unwrapX25519(h, identity, log) {
    const stanzas = h.stanzas.filter(s => s.args[0] === "X25519");
    if (!stanzas.length) throw new Error("这段密文不是用公钥加密的，要输口令");
    for (const s of stanzas) {                            // 多个收件人时逐段试，其他类型（grease 等）跳过
      if (s.args.length !== 2 || s.body.length !== 32) throw new Error("X25519 段的参数不合法");
      const epk = b64rawDecode(s.args[1]);
      if (epk.length !== 32) throw new Error("X25519 段的临时公钥不是 32 字节");
      const shared = x25519(identity.sk, epk);
      if (shared.every(b => b === 0)) throw new Error("X25519 段的临时公钥不合法");
      const wrapKey = await hkdfSha256(shared, concat(epk, identity.pk), X25519_INFO, 32);
      const fileKey = open(wrapKey, new Uint8Array(12), s.body);
      if (fileKey) {
        log({ title: "私钥 × 临时公钥 → shared secret → 解开 file key ✓", value: `临时公钥 ${hex(epk)}`,
              note: "临时钥匙是加密时现生成的，每段密文都不一样" });
        return fileKey;
      }
    }
    throw new Error("这把私钥解不开这段密文：它是给别的公钥加密的");
  }

  // secret：{ passphrase } 或 { identity: parseIdentity(...) 的结果 }
  // log({ title, value, note })：每做完一步报一次，页面照着列出来
  async function ageDecrypt(file, secret, log = () => {}, onProgress) {
    const h = parseHeader(file);
    let fileKey;
    if (h.stanzas.some(s => s.args[0] === "scrypt")) {
      if (secret.passphrase === undefined) throw new Error("这段密文是用口令加密的，要输口令");
      fileKey = await unwrapScrypt(h, secret.passphrase, log, onProgress);
    } else {
      if (!secret.identity) throw new Error("这段密文是用公钥加密的，要用私钥解");
      fileKey = await unwrapX25519(h, secret.identity, log);
    }

    const mac = await hmacSha256(await hkdfSha256(fileKey, new Uint8Array(0), "header", 32), te.encode(h.headerNoMac));
    if (!equalBytes(mac, h.mac)) throw new Error("头部 MAC 对不上：头部被改过");
    log({ title: "校验头部 MAC ✓", note: "MAC 的钥匙从 file key 派生，头部没被改过" });

    if (h.payload.length < 16) throw new Error("内容被截断了");
    const nonce = h.payload.subarray(0, 16), body = h.payload.subarray(16);
    const payloadKey = await hkdfSha256(fileKey, nonce, "payload", 32);
    const parts = [];
    for (let off = 0, counter = 0; ; off += CHUNK + 16, counter++) {
      const last = body.length - off <= CHUNK + 16;
      const pt = open(payloadKey, streamNonce(counter, last), body.subarray(off, Math.min(off + CHUNK + 16, body.length)));
      if (!pt) throw new Error(`第 ${counter + 1} 块内容的校验码对不上：内容被改过或被截断`);
      if (last && counter > 0 && pt.length === 0) throw new Error("最后一块不能是空的");
      parts.push(pt);
      if (last) break;
    }
    const plaintext = concat(...parts);
    log({ title: `解开内容 ✓：${body.length} 字节密文 → ${plaintext.length} 字节明文`,
          note: "内容钥匙 = HKDF(file key, 文件里的随机 nonce)；每 64 KB 一块，每块的校验码都对上了" });
    return { plaintext, header: h.headerText + "\n" };
  }

  // armor：age -a 的文本外壳，整个文件转标准 base64，64 列折行
  const ARMOR_BEGIN = "-----BEGIN AGE ENCRYPTED FILE-----", ARMOR_END = "-----END AGE ENCRYPTED FILE-----";
  function dearmor(text) {
    const t = text.trim();
    if (!t.startsWith(ARMOR_BEGIN) || !t.endsWith(ARMOR_END)) {
      throw new Error("密文要以 " + ARMOR_BEGIN + " 开头、" + ARMOR_END + " 结尾（age -a 的文本格式）");
    }
    const body = t.slice(ARMOR_BEGIN.length, t.length - ARMOR_END.length).replace(/\s+/g, "");
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(body) || body.length % 4 !== 0) throw new Error("密文里有不属于 base64 的字符");
    return b64decode(body);
  }

  // 单行小字：age: + 整个 age 文件的 base64（scripts/age-seal.sh 生成）
  function decodeToken(token) {
    const b = token.replace(/^age:/, "").replace(/=+$/, "");
    return b64rawDecode(b);
  }

  globalThis.AgeCore = { ageDecrypt, dearmor, decodeToken, parseHeader, parseIdentity, isIdentity, findIdentity, x25519 };
})();
