// Spørsmål, svaralternativer og fasit står samlet her.
const questions = [
    {
        title: "Trær gir skygge på varme dager. Hvordan kan de også kjøle ned omgivelsene?",
        illustration: "./assets/tre-og-skygge.png",
        alt: "En person sitter i skyggen av et tre.",
        answers: [
            "Bladene reflekterer nesten alt sollyset som treffer dem",
            "Vann som fordamper fra bladene, tar opp varme fra omgivelsene",
            "Røttene henter opp kaldt grunnvann som kjøler ned lufta direkte",
        ],
        correctAnswer: "b",
        explanation: "Når vann fordamper fra bladene, tas varme opp i omgivelsene. Sammen med skyggen fra trekronen bidrar dette til svalere omgivelser på varme dager.",
    },
    {
        title: "Hvor stort kan vannopptaket til en stor bjørk bli på en varm dag med god tilgang på vann?",
        illustration: "./assets/bjork-og-vann.png",
        alt: "En bjørk med vann tegnet i stammen og bakken.",
        answers: [
            "Rundt 5 liter på en dag",
            "Rundt 50 liter på en dag",
            "Rundt 500 liter på en dag",
        ],
        correctAnswer: "c",
        explanation: "En stor bjørk i fuktig jord kan ta opp omtrent 500 liter vann på en varm dag. Mye av vannet går videre ut gjennom bladene som vanndamp. Mengden varierer med treets størrelse, været og tilgangen på vann.",
    },
    {
        title: "Hvilken del av treet tar opp vann fra bakken?",
        illustration: "./assets/bjork-og-vann.png",
        alt: "En bjørk med vann tegnet i stammen og bakken.",
        answers: ["Røttene", "Bladene", "Barken"],
        correctAnswer: "a",
        explanation: "Røttene tar opp vann fra jorda. Vannet fraktes videre opp gjennom stammen og ut til bladene.",
    },
];

const progress = document.querySelector("#quiz-progress");
const questionScreen = document.querySelector("#question-screen");
const questionTitle = document.querySelector("#question");
const form = document.querySelector("#quiz-form");
const answers = document.querySelector("#answers");
const answerTexts = answers.querySelectorAll(".quiz-answer-text");
const illustration = document.querySelector("#illustration");
const feedback = document.querySelector("#feedback");
const feedbackTitle = document.querySelector("#feedback-title");
const feedbackExplanation = document.querySelector("#feedback-explanation");
const submitButton = document.querySelector("#submit-answer");
const nextButton = document.querySelector("#next-question");
const resultScreen = document.querySelector("#result-screen");
const resultTitle = document.querySelector("#result-title");
const resultMessage = document.querySelector("#result-message");
const retryButton = document.querySelector("#try-again");

const winScore = 2;
let questionIndex = 0;
let score = 0;

progress.setAttribute("aria-valuemin", "0");
progress.setAttribute("aria-valuemax", questions.length);
const progressSegments = questions.map(() => document.createElement("span"));
progress.append(...progressSegments);

function showQuestion() {
    const question = questions[questionIndex];

    questionTitle.textContent = question.title;
    illustration.src = question.illustration;
    illustration.alt = question.alt;
    answerTexts.forEach((text, index) => {
        text.textContent = question.answers[index];
    });

    form.reset();
    const markedOption = answers.querySelector(".quiz-option[data-result]");
    if (markedOption) delete markedOption.dataset.result;
    answers.disabled = false;
    illustration.hidden = false;
    feedback.hidden = true;
    submitButton.hidden = false;
    nextButton.hidden = true;

    progress.setAttribute("aria-valuenow", questionIndex + 1);
    progress.setAttribute("aria-valuetext", `Spørsmål ${questionIndex + 1} av ${questions.length}`);
    progressSegments.forEach((segment, index) => {
        segment.classList.toggle("is-active", index <= questionIndex);
    });

    resultScreen.hidden = true;
    questionScreen.hidden = false;
}

function showResult() {
    const didWin = score >= winScore;
    resultScreen.dataset.result = didWin ? "win" : "try-again";
    resultTitle.textContent = `Du fikk ${score} av ${questions.length} riktige`;
    resultMessage.textContent = didWin
        ? "Godt jobbet! Nå kjenner du flere av naturens viktige egenskaper."
        : "Her er det mer å lære om naturen. Prøv gjerne én gang til!";
    progress.setAttribute("aria-valuetext", "Alle spørsmål besvart");

    questionScreen.hidden = true;
    resultScreen.hidden = false;
    resultTitle.focus();
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedAnswer = form.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer || answers.disabled) return;

    const question = questions[questionIndex];
    const isCorrect = selectedAnswer.value === question.correctAnswer;
    const result = isCorrect ? "correct" : "wrong";
    if (isCorrect) score += 1;

    selectedAnswer.closest(".quiz-option").dataset.result = result;
    feedback.dataset.result = result;
    feedbackTitle.textContent = isCorrect
        ? "Riktig!"
        : `Feil svar. Riktig svar er ${question.correctAnswer.toUpperCase()}.`;
    feedbackExplanation.textContent = question.explanation;

    illustration.hidden = true;
    feedback.hidden = false;
    answers.disabled = true;
    submitButton.hidden = true;
    nextButton.textContent = questionIndex + 1 === questions.length ? "Se resultat" : "Neste spørsmål";
    nextButton.hidden = false;
    feedback.focus();
});

nextButton.addEventListener("click", () => {
    if (questionIndex + 1 === questions.length) {
        showResult();
        return;
    }

    questionIndex += 1;
    showQuestion();
    questionTitle.focus();
});

retryButton.addEventListener("click", () => {
    score = 0;
    questionIndex = 0;
    showQuestion();
    questionTitle.focus();
});

showQuestion();
