// --- 設定部分 (Googleフォームの情報) ---
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
    'random': 'ランダム',
    'expansion': '展開',
    'equation': '方程式',
    'factorization-1': '因数分解 (x²)',
    'factorization-2': '因数分解 (ax²)',
    'completion-1': '平方完成 (x²)',
    'completion-2': '平方完成 (ax²)',
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
      const allTypes = ['expansion', 'equation', 'factorization-1', 'factorization-2', 'completion-1', 'completion-2'];
      currentProblemType = allTypes[Math.floor(Math.random() * allTypes.length)];
    }

    switch(currentProblemType) {
      case 'expansion':
        problem = generateExpansionProblem(true);
        instruction = "式を展開しなさい";
        break;
      case 'factorization-1':
        problem = generateFactorizationProblem(false);
        instruction = "式を因数分解しなさい";
        break;
      case 'factorization-2':
        problem = generateFactorizationProblem(true);
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
    }

    allProblems.push(problem);
    problemsHTML += `<p><b>${i + 1}. ${instruction}</b></p><p>${problem.question}</p><hr>`;
  }

  questionArea.innerHTML = problemsHTML;
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
    answersHTML += `<p>${i + 1}. ${allProblems[i].question} => <strong>${allProblems[i].answer}</strong></p>`;
  }
  answerList.innerHTML = answersHTML;
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

// --- イベントリスナー ---
document.getElementById('start-random').addEventListener('click', () => startQuiz('random'));
document.getElementById('start-expansion').addEventListener('click', () => startQuiz('expansion'));
document.getElementById('start-factorization-1').addEventListener('click', () => startQuiz('factorization-1'));
document.getElementById('start-factorization-2').addEventListener('click', () => startQuiz('factorization-2'));
document.getElementById('start-completion-1').addEventListener('click', () => startQuiz('completion-1'));
document.getElementById('start-completion-2').addEventListener('click', () => startQuiz('completion-2'));
document.getElementById('start-equation').addEventListener('click', () => startQuiz('equation'));
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
