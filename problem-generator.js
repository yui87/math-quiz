// --- ヘルパー関数 ---

function getRandomInt(min, max, allowZero = false) {
  let num;
  do {
    num = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (num === 0 && !allowZero);
  return num;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// 3つの数の最大公約数（共通因数チェック用）
function gcd3(a, b, c) {
  return gcd(Math.abs(a), gcd(Math.abs(b), Math.abs(c)));
}

function simplifyRadical(n) {
  for (let i = Math.floor(Math.sqrt(n)); i > 1; i--) {
    if (n % (i * i) === 0) {
      return { outside: i, inside: n / (i * i) };
    }
  }
  return { outside: 1, inside: n };
}

// --- LaTeXフォーマット用関数 ---

// 項の整形 (例: -2x^2, +3x, 5)
// isFirst=true の場合、正の符号(+)をつけない
function formatTermLatex(num, variable = '', isFirst = false) {
  if (num === 0) return "";

  let sign = "";
  if (num < 0) sign = "-";
  else if (!isFirst) sign = "+"; // 先頭以外で正なら+をつける

  const absNum = Math.abs(num);
  let numStr = absNum.toString();

  // 変数がある場合、係数が1なら数字を表示しない (例: 1x -> x)
  if (absNum === 1 && variable !== "") numStr = "";

  return `${sign}${numStr}${variable}`;
}

// 分数の整形 (\frac{num}{den})
function formatFractionLatex(num, den) {
  if (num === 0) return "0";
  const common = gcd(Math.abs(num), Math.abs(den));
  const simNum = num / common;
  const simDen = den / common;

  const sign = (simNum * simDen < 0) ? "-" : "";
  const absN = Math.abs(simNum);
  const absD = Math.abs(simDen);

  if (absD === 1) return `${sign}${absN}`;
  return `${sign}\\frac{${absN}}{${absD}}`;
}

// --- 各問題生成ロジック ---

// 1. 展開・因数分解 (共通ロジック)
function generateExpansionLogic(is_a_not_1) {
  let d, f, e, g, a, b, c;
  // 共通因数がなくなるまで再生成 (例: 2x^2 + 4x + 2 のような式を防ぐ)
  do {
    d = is_a_not_1 ? getRandomInt(1, 3) : 1; // xの係数は正にしておく（因数分解の慣例）
    f = is_a_not_1 ? getRandomInt(1, 3) : 1;
    e = getRandomInt(-5, 5);
    if (e === 0) e = 1;
    g = getRandomInt(-5, 5);
    if (g === 0) g = 1;

    a = d * f;
    b = d * g + e * f;
    c = e * g;
  } while (gcd3(a, b, c) > 1 || b === 0 || c === 0);

  // 問題文作成 (dx + e)(fx + g)
  // 最初のカッコ内の先頭は isFirst=true
  const term1 = formatTermLatex(d, 'x', true);
  const term2 = formatTermLatex(e, '', false);
  const term3 = formatTermLatex(f, 'x', true);
  const term4 = formatTermLatex(g, '', false);

  const factoredForm = `$$ (${term1}${term2})(${term3}${term4}) $$`;

  // 展開形 ax^2 + bx + c
  const expTerm1 = formatTermLatex(a, 'x^2', true);
  const expTerm2 = formatTermLatex(b, 'x', false);
  const expTerm3 = formatTermLatex(c, '', false);

  const expandedForm = `$$ ${expTerm1}${expTerm2}${expTerm3} $$`;

  return { factored: factoredForm, expanded: expandedForm };
}

// 展開コース
function generateExpansionCourse(is_a_not_1 = true) {
  const data = generateExpansionLogic(is_a_not_1);
  return { question: data.factored, answer: data.expanded };
}

// 因数分解コース
function generateFactorizationCourse(is_a_not_1 = true) {
  const data = generateExpansionLogic(is_a_not_1);
  return { question: data.expanded, answer: data.factored };
}

// 2. 平方完成
function generateCompletionProblem(is_a_not_1 = true) {
  const a = is_a_not_1 ? getRandomInt(2, 4) : 1;
  const b = getRandomInt(-8, 8); // 偶数・奇数ランダム
  const c = getRandomInt(-9, 9);

  // 問題: ax^2 + bx + c
  let qStr = formatTermLatex(a, 'x^2', true);
  qStr += formatTermLatex(b, 'x', false);
  qStr += formatTermLatex(c, '', false);
  const question = `$$ ${qStr} $$`;

  // 答え: a(x + p)^2 + q
  // p = b / 2a
  // q = c - b^2 / 4a
  const p_num = b;
  const p_den = 2 * a;

  // q = (4ac - b^2) / 4a
  const q_num = 4 * a * c - b * b;
  const q_den = 4 * a;

  const aPart = a === 1 ? "" : a;

  // カッコの中の符号処理
  // formatFractionLatex はマイナスを前に出すので、式中の接続には注意が必要
  // ここでは符号付きで文字列を作り、プラスなら "+" を補う
  let pStr = formatFractionLatex(p_num, p_den);
  if (!pStr.startsWith("-")) pStr = "+" + pStr;

  // qは先頭ではないので、正なら+が必要
  let qStrVal = formatFractionLatex(q_num, q_den);
  if (!qStrVal.startsWith("-") && qStrVal !== "0") qStrVal = "+" + qStrVal;
  if (qStrVal === "0") qStrVal = "";

  const answer = `$$ ${aPart}(x ${pStr})^2 ${qStrVal} $$`;
  return { question, answer };
}

// 3. 二次方程式 (共通因数排除版)
function generateEquationProblem() {
  if (Math.random() < 0.5) {
    // 因数分解できるパターン (x-α)(x-β)=0
    let a, b, c, r1_num, r1_den, r2_num, r2_den;
    do {
        const base_a = getRandomInt(1, 3);
        r1_num = getRandomInt(-5, 5);
        r2_num = getRandomInt(-5, 5);
        const den = getRandomInt(1, 2);
        r1_den = den;
        r2_den = den === 1 ? 1 : getRandomInt(1, 2);

        const common_den = r1_den * r2_den;
        a = base_a * common_den;
        b = -base_a * (r1_num * r2_den + r2_num * r1_den);
        c = base_a * r1_num * r2_num;

    } while (gcd3(a, b, c) > 1 || b === 0 || c === 0 || a === 0);

    let formula = formatTermLatex(a, 'x^2', true);
    formula += formatTermLatex(b, 'x', false);
    formula += formatTermLatex(c, '', false);

    const question = `$$ ${formula} = 0 $$`;
    const answer = `$$ x = ${formatFractionLatex(r1_num, r1_den)}, \\; ${formatFractionLatex(r2_num, r2_den)} $$`;
    return { question, answer };

  } else {
    // 解の公式パターン
    let a, b, c, d;
    do {
      a = getRandomInt(1, 4);
      b = getRandomInt(-9, 9);
      c = getRandomInt(-9, 9);
      d = b * b - 4 * a * c;
    } while (d <= 0 || gcd3(a, b, c) > 1); // 判別式>0 かつ 共通因数なし

    let formula = formatTermLatex(a, 'x^2', true);
    formula += formatTermLatex(b, 'x', false);
    formula += formatTermLatex(c, '', false);
    const question = `$$ ${formula} = 0 $$`;

    let answerStr = "";
    if (Math.sqrt(d) % 1 === 0) {
      const num1 = -b + Math.sqrt(d);
      const num2 = -b - Math.sqrt(d);
      const den = 2 * a;
      answerStr = `$$ x = ${formatFractionLatex(num1, den)}, \\; ${formatFractionLatex(num2, den)} $$`;
    } else {
      const radical = simplifyRadical(d);
      const k = radical.outside;
      const common = gcd(gcd(Math.abs(b), k), 2 * a);

      const fin_b = -b / common;
      const fin_k = k / common;
      const fin_den = (2 * a) / common;
      const radPart = fin_k === 1 ? `\\sqrt{${radical.inside}}` : `${fin_k}\\sqrt{${radical.inside}}`;

      if (fin_den === 1) {
          answerStr = `$$ x = ${fin_b} \\pm ${radPart} $$`;
      } else {
          answerStr = `$$ x = \\frac{${fin_b} \\pm ${radPart}}{${fin_den}} $$`;
      }
    }
    return { question, answer: answerStr };
  }
}

// 4. 微分 (数II) - LaTeX化 & 符号ランダム
function generateDifferentiationProblem() {
  const n = getRandomInt(2, 3);
  const a = getRandomInt(-4, 4, false); // 0以外
  const b = getRandomInt(-5, 5);
  const c = getRandomInt(-9, 9);

  let formula = "";
  if (n === 3) formula += formatTermLatex(a, 'x^3', true);
  else formula += formatTermLatex(a, 'x^2', true);

  formula += formatTermLatex(b, 'x', false);
  formula += formatTermLatex(c, '', false); // 定数項

  if (formula === "") formula = "0";

  const question = `$$ y = ${formula} $$`;

  // 微分計算
  let ansFormula = "";
  const diffA = a * n; // x^(n-1)の係数

  if (n === 3) {
      ansFormula += formatTermLatex(diffA, 'x^2', true);
      ansFormula += formatTermLatex(b, 'x', false); // b*x -> b
      // ここ間違いやすい: bx の微分は b (xつかない)
      // formatTermLatex(b, '', false) だと符号がつく
      // 単独の定数項としての b を足す処理
      if (b !== 0) {
          let sign = b > 0 ? "+" : ""; // 先頭じゃないので+つける
          ansFormula += `${sign}${b}`;
      }
  } else {
      // n=2: y = ax^2 + bx + c -> y' = 2ax + b
      ansFormula += formatTermLatex(diffA, 'x', true);
      if (b !== 0) {
          let sign = b > 0 ? "+" : "";
          ansFormula += `${sign}${b}`;
      }
  }

  // bの微分処理をきれいに修正
  // formatTermLatexを使うと便利
  ansFormula = "";
  if (n === 3) {
      ansFormula += formatTermLatex(diffA, 'x^2', true);
      ansFormula += formatTermLatex(b, '', false);
  } else {
      ansFormula += formatTermLatex(diffA, 'x', true);
      ansFormula += formatTermLatex(b, '', false);
  }

  if (ansFormula === "") ansFormula = "0";

  return { question, answer: `$$ y' = ${ansFormula} $$` };
}

// 5. 定積分 (数II) - 分数解 & LaTeX
function generateIntegrationProblem() {
  const rangeStart = getRandomInt(-3, 2, true);
  const rangeEnd = getRandomInt(rangeStart + 1, rangeStart + 4);

  const a = getRandomInt(-3, 3);
  const b = getRandomInt(-4, 4);
  const c = getRandomInt(-5, 5);

  let formula = "";
  if (a !== 0) formula += formatTermLatex(a, 'x^2', true);
  formula += formatTermLatex(b, 'x', formula === "");
  formula += formatTermLatex(c, '', formula === "");
  if (formula === "") formula = "0";

  const question = `$$ \\displaystyle \\int_{${rangeStart}}^{${rangeEnd}} (${formula}) \\, dx $$`;

  // 積分計算 F(x) = (a/3)x^3 + (b/2)x^2 + cx
  // 共通分母 6 で計算
  const calcNum = (x) => {
      return 2 * a * Math.pow(x, 3) + 3 * b * Math.pow(x, 2) + 6 * c * x;
  };

  const val = calcNum(rangeEnd) - calcNum(rangeStart);
  const answer = `$$ ${formatFractionLatex(val, 6)} $$`;

  return { question, answer };
}

// 6. シグマ (数B) - LaTeX & k^2対応
function generateSigmaProblem() {
    const isQuadratic = Math.random() < 0.15; // 15%で二次式
    const n = getRandomInt(3, 7);
    let question = "";
    let answerVal = 0;

    if (isQuadratic) {
        // Σ(k^2 + ak + b)
        const a = getRandomInt(-3, 3);
        const b = getRandomInt(-5, 5);

        let formula = "k^2";
        formula += formatTermLatex(a, 'k', false);
        formula += formatTermLatex(b, '', false);

        question = `$$ \\displaystyle \\sum_{k=1}^{${n}} (${formula}) $$`;

        const sumK2 = (n * (n + 1) * (2 * n + 1)) / 6;
        const sumK = (n * (n + 1)) / 2;
        answerVal = sumK2 + a * sumK + b * n;

    } else {
        // Σ(ak + b)
        const a = getRandomInt(-4, 4, false);
        const b = getRandomInt(-5, 5);

        let formula = formatTermLatex(a, 'k', true);
        formula += formatTermLatex(b, '', false);
        if (formula === "") formula = "0";

        question = `$$ \\displaystyle \\sum_{k=1}^{${n}} (${formula}) $$`;

        const sumK = (n * (n + 1)) / 2;
        answerVal = a * sumK + b * n;
    }

    return { question, answer: `$$ ${answerVal} $$` };
}

// 7. 三角比 (数I) - LaTeX
function generateTrigProblem() {
  const types = ['\\sin', '\\cos', '\\tan'];
  const type = types[Math.floor(Math.random() * types.length)];
  const angles = [30, 45, 60, 120, 135, 150, 180];
  const angle = angles[Math.floor(Math.random() * angles.length)];

  const question = `$$ ${type} ${angle}^\\circ $$`;
  let answer = "";

  // 値の定義
  if (type === '\\sin') {
    if (angle === 30 || angle === 150) answer = "\\frac{1}{2}";
    if (angle === 45 || angle === 135) answer = "\\frac{1}{\\sqrt{2}}";
    if (angle === 60 || angle === 120) answer = "\\frac{\\sqrt{3}}{2}";
    if (angle === 180) answer = "0";
  } else if (type === '\\cos') {
    if (angle === 60) answer = "\\frac{1}{2}";
    if (angle === 120) answer = "-\\frac{1}{2}";
    if (angle === 45) answer = "\\frac{1}{\\sqrt{2}}";
    if (angle === 135) answer = "-\\frac{1}{\\sqrt{2}}";
    if (angle === 30) answer = "\\frac{\\sqrt{3}}{2}";
    if (angle === 150) answer = "-\\frac{\\sqrt{3}}{2}";
    if (angle === 180) answer = "-1";
  } else if (type === '\\tan') {
    if (angle === 30) answer = "\\frac{1}{\\sqrt{3}}";
    if (angle === 150) answer = "-\\frac{1}{\\sqrt{3}}";
    if (angle === 45) answer = "1";
    if (angle === 135) answer = "-1";
    if (angle === 60) answer = "\\sqrt{3}";
    if (angle === 120) answer = "-\\sqrt{3}";
    if (angle === 180) answer = "0";
  }

  return { question, answer: `$$ ${answer} $$` };
}
