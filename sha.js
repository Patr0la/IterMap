//@ts-nocheck
var b;
if (!(b = t)) {
    var w = Math,
        y = {},
        B = (y.p = {}),
        aa = function() {},
        C = (B.A = {
            extend: function(a) {
                aa.prototype = this;
                var c = new aa();
                a && c.u(a);
                c.z = this;
                return c;
            },
            create: function() {
                var a = this.extend();
                a.h.apply(a, arguments);
                return a;
            },
            h: function() {},
            u: function(a) {
                for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
                a.hasOwnProperty("toString") && (this.toString = a.toString);
            },
            e: function() {
                return this.z.extend(this);
            },
        }),
        D = (B.i = C.extend({
            h: function(a, c) {
                a = this.d = a || [];
                this.c = void 0 != c ? c : 4 * a.length;
            },
            toString: function(a) {
                return (a || ba).stringify(this);
            },
            concat: function(a) {
                var c = this.d,
                    e = a.d,
                    d = this.c,
                    a = a.c;
                this.t();
                if (d % 4) for (var g = 0; g < a; g++) c[(d + g) >>> 2] |= ((e[g >>> 2] >>> (24 - 8 * (g % 4))) & 255) << (24 - 8 * ((d + g) % 4));
                else if (65535 < e.length) for (g = 0; g < a; g += 4) c[(d + g) >>> 2] = e[g >>> 2];
                else c.push.apply(c, e);
                this.c += a;
                return this;
            },
            t: function() {
                var a = this.d,
                    c = this.c;
                a[c >>> 2] &= 4294967295 << (32 - 8 * (c % 4));
                a.length = w.ceil(c / 4);
            },
            e: function() {
                var a = C.e.call(this);
                a.d = this.d.slice(0);
                return a;
            },
            random: function(a) {
                for (var c = [], e = 0; e < a; e += 4) c.push((4294967296 * w.random()) | 0);
                return D.create(c, a);
            },
        })),
        ca = (y.O = {}),
        ba = (ca.K = {
            stringify: function(a) {
                for (var c = a.d, a = a.c, e = [], d = 0; d < a; d++) {
                    var g = (c[d >>> 2] >>> (24 - 8 * (d % 4))) & 255;
                    e.push((g >>> 4).toString(16));
                    e.push((g & 15).toString(16));
                }
                return e.join("");
            },
            parse: function(a) {
                for (var c = a.length, e = [], d = 0; d < c; d += 2) e[d >>> 3] |= parseInt(a.substr(d, 2), 16) << (24 - 4 * (d % 8));
                return D.create(e, c / 2);
            },
        }),
        da = (ca.M = {
            stringify: function(a) {
                for (var c = a.d, a = a.c, e = [], d = 0; d < a; d++) e.push(String.fromCharCode((c[d >>> 2] >>> (24 - 8 * (d % 4))) & 255));
                return e.join("");
            },
            parse: function(a) {
                for (var c = a.length, e = [], d = 0; d < c; d++) e[d >>> 2] |= (a.charCodeAt(d) & 255) << (24 - 8 * (d % 4));
                return D.create(e, c);
            },
        }),
        ea = (ca.N = {
            stringify: function(a) {
                try {
                    return decodeURIComponent(escape(da.stringify(a)));
                } catch (c) {
                    throw Error("Malformed UTF-8 data");
                }
            },
            parse: function(a) {
                return da.parse(unescape(encodeURIComponent(a)));
            },
        }),
        ia = (B.I = C.extend({
            reset: function() {
                this.g = D.create();
                this.j = 0;
            },
            l: function(a) {
                "string" == typeof a && (a = ea.parse(a));
                this.g.concat(a);
                this.j += a.c;
            },
            m: function(a) {
                var c = this.g,
                    e = c.d,
                    d = c.c,
                    g = this.n,
                    s = d / (4 * g),
                    s = a ? w.ceil(s) : w.max((s | 0) - this.r, 0),
                    a = s * g,
                    d = w.min(4 * a, d);
                if (a) {
                    for (var l = 0; l < a; l += g) this.H(e, l);
                    l = e.splice(0, a);
                    c.c -= d;
                }
                return D.create(l, d);
            },
            e: function() {
                var a = C.e.call(this);
                a.g = this.g.e();
                return a;
            },
            r: 0,
        }));
    B.B = ia.extend({
        h: function() {
            this.reset();
        },
        reset: function() {
            ia.reset.call(this);
            this.q();
        },
        update: function(a) {
            this.l(a);
            this.m();
            return this;
        },
        o: function(a) {
            a && this.l(a);
            this.G();
            return this.f;
        },
        e: function() {
            var a = ia.e.call(this);
            a.f = this.f.e();
            return a;
        },
        n: 16,
        D: function(a) {
            return function(c, e) {
                return a.create(e).o(c);
            };
        },
        F: function(a) {
            return function(c, e) {
                return ja.J.create(a, e).o(c);
            };
        },
    });
    var ja = (y.s = {});
    b = y;
}
var t = b,
    K = t,
    ka = K.p,
    la = ka.A,
    va = ka.i,
    K = (K.w = {});
K.C = la.extend({
    h: function(a, c) {
        this.a = a;
        this.b = c;
    },
});
K.i = la.extend({
    h: function(a, c) {
        a = this.d = a || [];
        this.c = void 0 != c ? c : 8 * a.length;
    },
    v: function() {
        for (var a = this.d, c = a.length, e = [], d = 0; d < c; d++) {
            var g = a[d];
            e.push(g.a);
            e.push(g.b);
        }
        return va.create(e, this.c);
    },
    e: function() {
        for (var a = la.e.call(this), c = (a.d = this.d.slice(0)), e = c.length, d = 0; d < e; d++) c[d] = c[d].e();
        return a;
    },
});
function L() {
    return wa.create.apply(wa, arguments);
}
for (
    var xa = t.p.B,
        M = t.w,
        wa = M.C,
        ya = M.i,
        M = t.s,
        za = [
            L(1116352408, 3609767458),
            L(1899447441, 602891725),
            L(3049323471, 3964484399),
            L(3921009573, 2173295548),
            L(961987163, 4081628472),
            L(1508970993, 3053834265),
            L(2453635748, 2937671579),
            L(2870763221, 3664609560),
            L(3624381080, 2734883394),
            L(310598401, 1164996542),
            L(607225278, 1323610764),
            L(1426881987, 3590304994),
            L(1925078388, 4068182383),
            L(2162078206, 991336113),
            L(2614888103, 633803317),
            L(3248222580, 3479774868),
            L(3835390401, 2666613458),
            L(4022224774, 944711139),
            L(264347078, 2341262773),
            L(604807628, 2007800933),
            L(770255983, 1495990901),
            L(1249150122, 1856431235),
            L(1555081692, 3175218132),
            L(1996064986, 2198950837),
            L(2554220882, 3999719339),
            L(2821834349, 766784016),
            L(2952996808, 2566594879),
            L(3210313671, 3203337956),
            L(3336571891, 1034457026),
            L(3584528711, 2466948901),
            L(113926993, 3758326383),
            L(338241895, 168717936),
            L(666307205, 1188179964),
            L(773529912, 1546045734),
            L(1294757372, 1522805485),
            L(1396182291, 2643833823),
            L(1695183700, 2343527390),
            L(1986661051, 1014477480),
            L(2177026350, 1206759142),
            L(2456956037, 344077627),
            L(2730485921, 1290863460),
            L(2820302411, 3158454273),
            L(3259730800, 3505952657),
            L(3345764771, 106217008),
            L(3516065817, 3606008344),
            L(3600352804, 1432725776),
            L(4094571909, 1467031594),
            L(275423344, 851169720),
            L(430227734, 3100823752),
            L(506948616, 1363258195),
            L(659060556, 3750685593),
            L(883997877, 3785050280),
            L(958139571, 3318307427),
            L(1322822218, 3812723403),
            L(1537002063, 2003034995),
            L(1747873779, 3602036899),
            L(1955562222, 1575990012),
            L(2024104815, 1125592928),
            L(2227730452, 2716904306),
            L(2361852424, 442776044),
            L(2428436474, 593698344),
            L(2756734187, 3733110249),
            L(3204031479, 2999351573),
            L(3329325298, 3815920427),
            L(3391569614, 3928383900),
            L(3515267271, 566280711),
            L(3940187606, 3454069534),
            L(4118630271, 4000239992),
            L(116418474, 1914138554),
            L(174292421, 2731055270),
            L(289380356, 3203993006),
            L(460393269, 320620315),
            L(685471733, 587496836),
            L(852142971, 1086792851),
            L(1017036298, 365543100),
            L(1126000580, 2618297676),
            L(1288033470, 3409855158),
            L(1501505948, 4234509866),
            L(1607167915, 987167468),
            L(1816402316, 1246189591),
        ],
        $ = [],
        Aa = 0;
    80 > Aa;
    Aa++
)
    $[Aa] = L();
M = M.k = xa.extend({
    q: function() {
        this.f = ya.create([L(1779033703, 4089235720), L(3144134277, 2227873595), L(1013904242, 4271175723), L(2773480762, 1595750129), L(1359893119, 2917565137), L(2600822924, 725511199), L(528734635, 4215389547), L(1541459225, 327033209)]);
    },
    H: function(a, c) {
        for (var e = this.f.d, d = e[0], g = e[1], s = e[2], l = e[3], N = e[4], O = e[5], P = e[6], e = e[7], ma = d.a, Q = d.b, na = g.a, R = g.b, oa = s.a, S = s.b, pa = l.a, T = l.b, qa = N.a, U = N.b, ra = O.a, V = O.b, sa = P.a, W = P.b, ta = e.a, X = e.b, m = ma, i = Q, E = na, z = R, F = oa, A = S, fa = pa, G = T, n = qa, j = U, Y = ra, H = V, Z = sa, I = W, ga = ta, J = X, p = 0; 80 > p; p++) {
            var u = $[p];
            if (16 > p)
                var k = (u.a = a[c + 2 * p] | 0),
                    f = (u.b = a[c + 2 * p + 1] | 0);
            else {
                var k = $[p - 15],
                    f = k.a,
                    q = k.b,
                    k = ((q << 31) | (f >>> 1)) ^ ((q << 24) | (f >>> 8)) ^ (f >>> 7),
                    q = ((f << 31) | (q >>> 1)) ^ ((f << 24) | (q >>> 8)) ^ ((f << 25) | (q >>> 7)),
                    x = $[p - 2],
                    f = x.a,
                    h = x.b,
                    x = ((h << 13) | (f >>> 19)) ^ ((f << 3) | (h >>> 29)) ^ (f >>> 6),
                    h = ((f << 13) | (h >>> 19)) ^ ((h << 3) | (f >>> 29)) ^ ((f << 26) | (h >>> 6)),
                    f = $[p - 7],
                    ha = f.a,
                    v = $[p - 16],
                    r = v.a,
                    v = v.b,
                    f = q + f.b,
                    k = k + ha + (f >>> 0 < q >>> 0 ? 1 : 0),
                    f = f + h,
                    k = k + x + (f >>> 0 < h >>> 0 ? 1 : 0),
                    f = f + v,
                    k = k + r + (f >>> 0 < v >>> 0 ? 1 : 0);
                u.a = k;
                u.b = f;
            }
            var ha = (n & Y) ^ (~n & Z),
                v = (j & H) ^ (~j & I),
                u = (m & E) ^ (m & F) ^ (E & F),
                Ba = (i & z) ^ (i & A) ^ (z & A),
                q = ((i << 4) | (m >>> 28)) ^ ((m << 30) | (i >>> 2)) ^ ((m << 25) | (i >>> 7)),
                x = ((m << 4) | (i >>> 28)) ^ ((i << 30) | (m >>> 2)) ^ ((i << 25) | (m >>> 7)),
                h = za[p],
                Ca = h.a,
                ua = h.b,
                h = J + (((n << 18) | (j >>> 14)) ^ ((n << 14) | (j >>> 18)) ^ ((j << 23) | (n >>> 9))),
                r = ga + (((j << 18) | (n >>> 14)) ^ ((j << 14) | (n >>> 18)) ^ ((n << 23) | (j >>> 9))) + (h >>> 0 < J >>> 0 ? 1 : 0),
                h = h + v,
                r = r + ha + (h >>> 0 < v >>> 0 ? 1 : 0),
                h = h + ua,
                r = r + Ca + (h >>> 0 < ua >>> 0 ? 1 : 0),
                h = h + f,
                r = r + k + (h >>> 0 < f >>> 0 ? 1 : 0),
                f = x + Ba,
                u = q + u + (f >>> 0 < x >>> 0 ? 1 : 0),
                ga = Z,
                J = I,
                Z = Y,
                I = H,
                Y = n,
                H = j,
                j = (G + h) | 0,
                n = (fa + r + (j >>> 0 < G >>> 0 ? 1 : 0)) | 0,
                fa = F,
                G = A,
                F = E,
                A = z,
                E = m,
                z = i,
                i = (h + f) | 0,
                m = (r + u + (i >>> 0 < h >>> 0 ? 1 : 0)) | 0;
        }
        Q = d.b = (Q + i) | 0;
        d.a = (ma + m + (Q >>> 0 < i >>> 0 ? 1 : 0)) | 0;
        R = g.b = (R + z) | 0;
        g.a = (na + E + (R >>> 0 < z >>> 0 ? 1 : 0)) | 0;
        S = s.b = (S + A) | 0;
        s.a = (oa + F + (S >>> 0 < A >>> 0 ? 1 : 0)) | 0;
        T = l.b = (T + G) | 0;
        l.a = (pa + fa + (T >>> 0 < G >>> 0 ? 1 : 0)) | 0;
        U = N.b = (U + j) | 0;
        N.a = (qa + n + (U >>> 0 < j >>> 0 ? 1 : 0)) | 0;
        V = O.b = (V + H) | 0;
        O.a = (ra + Y + (V >>> 0 < H >>> 0 ? 1 : 0)) | 0;
        W = P.b = (W + I) | 0;
        P.a = (sa + Z + (W >>> 0 < I >>> 0 ? 1 : 0)) | 0;
        X = e.b = (X + J) | 0;
        e.a = (ta + ga + (X >>> 0 < J >>> 0 ? 1 : 0)) | 0;
    },
    G: function() {
        var a = this.g,
            c = a.d,
            e = 8 * this.j,
            d = 8 * a.c;
        c[d >>> 5] |= 128 << (24 - (d % 32));
        c[(((d + 128) >>> 10) << 5) + 31] = e;
        a.c = 4 * c.length;
        this.m();
        this.f = this.f.v();
    },
    n: 32,
});
t.k = xa.D(M);
t.L = xa.F(M);

module.exports = {
    sha512: a => {
        return t.k(a) + "";
    },
};

//# sourceMappingURL=sha.js.map
