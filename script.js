// --- 設定部分 (Googleフォームの情報) ---
// 必要に応じてここをご自身のURL等に書き換えてください
const FORM_URL = "ここにあなたのGoogleフォームのURLを貼り付け";
const NICKNAME_ENTRY_ID = "ここにニックネームのEntry IDを貼り付け";
const SCORE_ENTRY_ID = "ここに正答数のEntry IDを貼り付け";
const COURSE_ENTRY_ID = "ここにコース名のEntry IDを貼り付け";

// --- HTMLの要素を取得 ---
const selectionArea = document.getElementById('selection-area');
const settingsArea = document.getElementById('settings-area');
const questionArea = document.getElementById('question-area');
const timerElement = document.getElementById('timer');
const timeSelect = document.getElementById('time-select');
const answerArea = document.getElementById('answer-area');
const answerList = document.getElementById('answer-list');
const scoreFormArea = document.getElementById('score-form-area');
const nicknameInput = document.getElementById('nickname-input');
const scoreInput = document.getElementById('score-input');
const submitScoreButton = document.getElementById('submit-score-button');
const homeButton = document.getElementById('home-button');

let timerId;
let allProblems = [];
let selectedCourseName = "";
let selectedTime = 60;

// --- コース名定義 ---
const courseDisplayNames = {
    'random': 'ランダム (全範囲)',
    'expansion': '展開',
    'equation': '二次方程式',
    'factorization-1': '因数分解 (x²)',
    'factorization-2': '因数分解 (ax²)',
    'completion-1': '平方完成 (x²)',
    'completion-2': '平方完成 (ax²)',
    'differentiation': '微分 (数II)',
    'integration': '定積分 (数II)',
    'sigma': 'シグマ計算 (数B)',
    'trig': '三角比 (数I)'
};

// --- ページ読み込み時の処理 ---
window.addEventListener('load', () => {
    const savedTime = localStorage.getItem('timerSetting');
    if (savedTime) {
        selectedTime = parseInt(savedTime, 10);
        timeSelect.value = selectedTime;
        timerElement.textContent = `残り時間: ${selectedTime}秒`;
    }
});

// --- クイズのメインロジック ---
function startQuiz(problemType) {
  settingsArea.classList.add('hidden');
  selectedCourseName = courseDisplayNames[problemType];
  selectionArea.classList.add('hidden');
  questionArea.classList.remove('hidden');
  allProblems = [];
  let problemsHTML = "";

  for (let i = 0; i < 10; i++) {
    let problem;
    let instruction = "";
    let currentProblemType = problemType;

    if (problemType === 'random') {
      const allTypes = [
          'expansion',
          'equation',
          'factorization-1',
          'factorization-2',
          'completion-1',
          'completion-2',
          'differentiation',
          'integration',
          'sigma',
          'trig'
      ];
      currentProblemType = allTypes[Math.floor(Math.random() * allTypes.length)];
    }

    switch(currentProblemType) {
      case 'expansion':
        problem = generateExpansionCourse(true);
        instruction = "式を展開しなさい";
        break;
      case 'factorization-1':
        problem = generateFactorizationCourse(false);
        instruction = "式を因数分解しなさい";
        break;
      case 'factorization-2':
        problem = generateFactorizationCourse(true);
        instruction = "式を因数分解しなさい";
        break;
      case 'completion-1':
        problem = generateCompletionProblem(false);
        instruction = "式を平方完成しなさい";
        break;
      case 'completion-2':
        problem = generateCompletionProblem(true);
        instruction = "式を平方完成しなさい";
        break;
      case 'equation':
        problem = generateEquationProblem();
        instruction = "方程式を解きなさい";
        break;
      case 'differentiation':
        problem = generateDifferentiationProblem();
        instruction = "関数を微分しなさい";
        break;
      case 'integration':
        problem = generateIntegrationProblem();
        instruction = "定積分の値を求めなさい";
        break;
      case 'sigma':
        problem = generateSigmaProblem();
        instruction = "和を求めなさい";
        break;
      case 'trig':
        problem = generateTrigProblem();
        instruction = "三角比の値を求めなさい";
        break;
    }

    allProblems.push(problem);
    problemsHTML += `<div class="problem-container">
        <p class="instruction">Q${i + 1}. ${instruction}</p>
        <div class="math-display">${problem.question}</div>
        <hr>
    </div>`;
  }

  questionArea.innerHTML = problemsHTML;

  // MathJaxで数式をレンダリング
  if (window.MathJax) {
    MathJax.typesetPromise([questionArea]);
  }

  startTimer();
}

function startTimer() {
  let timeLeft = selectedTime;
  timerElement.textContent = `残り時間: ${timeLeft}秒`;
  timerId = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `残り時間: ${timeLeft}秒`;
    if (timeLeft <= 0) {
      clearInterval(timerId);
      timerElement.textContent = "時間切れ！";
      showAnswers();
    }
  }, 1000);
}

function showAnswers() {
  questionArea.classList.add('hidden');
  answerArea.classList.remove('hidden');
  scoreFormArea.classList.remove('hidden');
  let answersHTML = "";

  for (let i = 0; i < allProblems.length; i++) {
    answersHTML += `<div style="border-bottom:1px solid #ccc; margin-bottom:15px; padding-bottom:10px;">
      <p><strong>Q${i + 1}:</strong> ${allProblems[i].question}</p>
      <p style="color:#d00; margin-top:5px;"><strong>A:</strong> ${allProblems[i].answer}</p>
    </div>`;
  }
  answerList.innerHTML = answersHTML;

  // 答えの数式もレンダリング
  if (window.MathJax) {
    MathJax.typesetPromise([answerList]);
  }
}

function goToHome() {
  clearInterval(timerId);
  settingsArea.classList.remove('hidden');
  selectionArea.classList.remove('hidden');
  questionArea.classList.add('hidden');
  answerArea.classList.add('hidden');
  scoreFormArea.classList.add('hidden');
  questionArea.innerHTML = "";
  answerList.innerHTML = "";
  timerElement.textContent = `残り時間: ${selectedTime}秒`;
}

// --- イベントリスナー設定 ---
// コースボタン
const courseIds = [
    'start-random',
    'start-expansion', 'start-equation',
    'start-factorization-1', 'start-factorization-2',
    'start-completion-1', 'start-completion-2',
    'start-differentiation', 'start-integration', 'start-sigma', 'start-trig'
];

// 各ボタンにイベントを付与
courseIds.forEach(id => {
    const elem = document.getElementById(id);
    if (elem) {
        // IDから 'start-' を除いた部分をパラメータとして渡す
        const type = id.replace('start-', '');
        elem.addEventListener('click', () => startQuiz(type));
    }
});

homeButton.addEventListener('click', goToHome);

submitScoreButton.addEventListener('click', () => {
  const nickname = nicknameInput.value;
  const score = scoreInput.value;
  if (!nickname || !score) {
    alert('ニックネームと正答数を入力してください。');
    return;
  }

  const formData = new FormData();
  formData.append(NICKNAME_ENTRY_ID, nickname);
  formData.append(SCORE_ENTRY_ID, score);
  formData.append(COURSE_ENTRY_ID, selectedCourseName);

  fetch(FORM_URL, { method: 'POST', mode: 'no-cors', body: formData })
  .then(() => {
    alert('記録を送信しました！');
    nicknameInput.value = '';
    scoreInput.value = '';
  }).catch((error) => alert('送信に失敗しました。'));
});

timeSelect.addEventListener('change', (event) => {
    selectedTime = parseInt(event.target.value, 10);
    timerElement.textContent = `残り時間: ${selectedTime}秒`;
    localStorage.setItem('timerSetting', selectedTime);
});
