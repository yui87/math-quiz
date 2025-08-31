// --- 問題生成のためのヘルパー関数 ---
function getRandomInt(min, max, allowZero = false) {
  let num;
  do {
    num = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (num === 0 && !allowZero);
  return num;
}

function formatTerm(num, variable = '') {
  if (num === 0) return "";
  const sign = num > 0 ? '+' : '-';
  const absNum = Math.abs(num);
  if (absNum === 1 && variable) return ` ${sign} ${variable}`;
  return ` ${sign} ${absNum}${variable}`;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function formatFractionTerm(num, den) {
  if (num === 0) return "";
  const common = gcd(Math.abs(num), Math.abs(den));
  const simplifiedNum = Math.abs(num) / common;
  const simplifiedDen = Math.abs(den) / common;
  const sign = num * den > 0 ? '+' : '-';
  if (simplifiedDen === 1) return ` ${sign} ${simplifiedNum}`;
  return ` ${sign} ${simplifiedNum}/${simplifiedDen}`;
}

function simplifyRadical(n) {
  for (let i = Math.floor(Math.sqrt(n)); i > 1; i--) {
    if (n % (i * i) === 0) {
      return { outside: i, inside: n / (i * i) };
    }
  }
  return { outside: 1, inside: n };
}

// --- 各コースの問題を生成する専門の関数 ---
function generateExpansionProblem(is_a_not_1 = true) {
  const d = is_a_not_1 ? getRandomInt(1, 3) : 1;
  const f = is_a_not_1 ? getRandomInt(1, 3) : 1;
  const e = getRandomInt(-5, 5);
  const g = getRandomInt(-5, 5);
  const dTerm = d === 1 ? 'x' : `${d}x`;
  const fTerm = f === 1 ? 'x' : `${f}x`;
  const question = `(${dTerm} ${formatTerm(e)})(${fTerm} ${formatTerm(g)})`;
  const a = d * f;
  const b = d * g + e * f;
  const c = e * g;
  const aTerm = a === 1 ? 'x²' : `${a}x²`;
  const answer = `${aTerm}${formatTerm(b, 'x')}${formatTerm(c)}`;
  return { question, answer };
}

function generateFactorizationProblem(is_a_not_1 = true) {
  const { question: answer, answer: question } = generateExpansionProblem(is_a_not_1);
  return { question, answer };
}

function generateCompletionProblem(is_a_not_1 = true) {
  const a = is_a_not_1 ? getRandomInt(2, 5) : 1;
  const b = getRandomInt(-10, 10);
  const c = getRandomInt(-5, 5);
  const aTerm = a === 1 ? 'x²' : `${a}x²`;
  const question = `${aTerm}${formatTerm(b, 'x')}${formatTerm(c)}`;
  const p_num = b;
  const p_den = 2 * a;
  const q_num = 4 * a * c - b * b;
  const q_den = 4 * a;
  const a_display = a === 1 ? '' : a;
  const answer = `${a_display}(x ${formatFractionTerm(p_num, p_den)})² ${formatFractionTerm(q_num, q_den)}`;
  return { question, answer };
}

function generateEquationProblem() {
  if (Math.random() < 0.5) {
    const a = getRandomInt(1, 3);
    const r1_num = getRandomInt(-5, 5);
    const r2_num = getRandomInt(-5, 5);
    const den = getRandomInt(1, 2);
    const r1_den = den;
    const r2_den = den === 1 ? 1 : getRandomInt(1, 2);
    const b = -a * (r1_num * r2_den + r2_num * r1_den);
    const c = a * r1_num * r2_num;
    const common_den = r1_den * r2_den;
    const final_a = a * common_den;
    const final_b = b;
    const final_c = c;
    const aTerm = final_a === 1 ? 'x²' : `${final_a}x²`;
    const question = `${aTerm}${formatTerm(final_b, 'x')}${formatTerm(final_c)} = 0`;
    const answer = `x = ${formatFractionTerm(r1_num, r1_den)}, ${formatFractionTerm(r2_num, r2_den)}`;
    return { question, answer };
  } else {
    let a, b, c, d;
    do {
      a = getRandomInt(1, 4);
      b = getRandomInt(-10, 10);
      c = getRandomInt(-10, 10);
      d = b * b - 4 * a * c;
    } while (d <= 0);
    const aTerm = a === 1 ? 'x²' : `${a}x²`;
    const question = `${aTerm}${formatTerm(b, 'x')}${formatTerm(c)} = 0`;
    if (Math.sqrt(d) % 1 === 0) {
      const num1 = -b + Math.sqrt(d);
      const num2 = -b - Math.sqrt(d);
      const den = 2 * a;
      const answer = `x = ${formatFractionTerm(num1, den)}, ${formatFractionTerm(num2, den)}`;
      return { question, answer };
    } else {
      const radical = simplifyRadical(d);
      const common = gcd(gcd(Math.abs(b), radical.outside), 2 * a);
      const final_b = -b / common;
      const final_outside = radical.outside / common;
      const final_den = (2 * a) / common;
      const radical_part = final_outside === 1 ? `√${radical.inside}` : `${final_outside}√${radical.inside}`;
      let answer;
      if (final_den === 1 || final_den === -1) {
        answer = `x = ${final_b / final_den} ± ${radical_part}`;
      } else {
        answer = `x = (${final_b} ± ${radical_part}) / ${final_den}`;
      }
      return { question, answer };
    }
  }
}
