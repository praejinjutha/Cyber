export function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function mean(arr) {
  if (!arr.length) return null;
  return arr.reduce((s, x) => s + x, 0) / arr.length;
}

export function sampleStdDev(arr) {
  if (arr.length < 2) return null;
  const m = mean(arr);
  const variance =
    arr.reduce((s, x) => s + Math.pow(x - m, 2), 0) / (arr.length - 1);

  return Math.sqrt(variance);
}

function gammaln(x) {
  const cof = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953,
  ];

  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);

  let ser = 1.000000000190015;

  for (let j = 0; j < cof.length; j++) {
    y += 1;
    ser += cof[j] / y;
  }

  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

function betacf(a, b, x) {
  const MAXIT = 100;
  const EPS = 3e-7;
  const FPMIN = 1e-30;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;

  let c = 1;
  let d = 1 - (qab * x) / qap;

  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;

  let h = d;

  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;

    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));

    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;

    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;

    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));

    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;

    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;

    d = 1 / d;

    const del = d * c;
    h *= del;

    if (Math.abs(del - 1) < EPS) break;
  }

  return h;
}

function ibeta(x, a, b) {
  if (x < 0 || x > 1) return NaN;
  if (x === 0 || x === 1) return x;

  const bt = Math.exp(
    gammaln(a + b) -
      gammaln(a) -
      gammaln(b) +
      a * Math.log(x) +
      b * Math.log(1 - x)
  );

  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(a, b, x)) / a;
  }

  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

function studentTCdf(t, df) {
  if (!Number.isFinite(t) || !Number.isFinite(df) || df <= 0) return NaN;
  if (t === 0) return 0.5;

  const x = df / (df + t * t);
  const a = df / 2;
  const b = 0.5;
  const ib = ibeta(x, a, b);

  if (t > 0) return 1 - 0.5 * ib;
  return 0.5 * ib;
}

export function pairedTTest(rows) {
  if (!rows || rows.length < 2) {
    return {
      n: rows?.length || 0,
      preMean: null,
      postMean: null,
      gainMean: null,
      sdDiff: null,
      t: null,
      df: null,
      p: null,
      significant: false,
      hasEnoughData: false,
    };
  }

  const pres = rows.map((x) => x.pretest_score);
  const posts = rows.map((x) => x.posttest_score);
  const diffs = rows.map((x) => x.posttest_score - x.pretest_score);

  const preMean = mean(pres);
  const postMean = mean(posts);
  const gainMean = mean(diffs);
  const sdDiff = sampleStdDev(diffs);
  const n = diffs.length;
  const df = n - 1;

  if (sdDiff == null || sdDiff === 0) {
    return {
      n,
      preMean,
      postMean,
      gainMean,
      sdDiff,
      t: null,
      df,
      p: null,
      significant: false,
      hasEnoughData: false,
    };
  }

  const t = gainMean / (sdDiff / Math.sqrt(n));
  const cdf = studentTCdf(Math.abs(t), df);
  const p = 2 * (1 - cdf);

  return {
    n,
    preMean,
    postMean,
    gainMean,
    sdDiff,
    t,
    df,
    p,
    significant: Number.isFinite(p) ? p < 0.05 : false,
    hasEnoughData: true,
  };
}
