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
        illustrationTone: "yellow",
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
        illustrationTone: "yellow",
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
const card = document.querySelector(".quiz-card");
const cardFront = card.querySelector(".quiz-card-front");
const feedback = document.querySelector("#feedback");
const feedbackTitle = document.querySelector("#feedback-title");
const feedbackExplanation = document.querySelector("#feedback-explanation");
const submitButton = document.querySelector("#submit-answer");
const nextButton = document.querySelector("#next-question");
const nextButtonLabel = document.querySelector("#next-question-label");
const resultScreen = document.querySelector("#result-screen");
const resultCard = resultScreen.querySelector(".quiz-result-card");
const resultTitle = document.querySelector("#result-title");
const resultMessage = document.querySelector("#result-message");
const retryButton = document.querySelector("#try-again");

const winScore = 2;
let questionIndex = 0;
let score = 0;
let stepAnimation;

progress.setAttribute("aria-valuemin", "0");
progress.setAttribute("aria-valuemax", questions.length);
const progressSegments = questions.map(() => document.createElement("span"));
progress.append(...progressSegments);

const updateLeafMotion = createResultLeafAnimation(resultScreen);
const reducedQuizMotion = matchMedia("(prefers-reduced-motion: reduce)");

function updateProgress(answeredCount) {
    progress.setAttribute("aria-valuenow", answeredCount);
    progress.setAttribute("aria-valuetext", `${answeredCount} av ${questions.length} spørsmål besvart`);
    progressSegments.forEach((segment, index) => {
        segment.classList.toggle("is-complete", index < answeredCount);
        segment.classList.toggle("is-current", index === answeredCount);
    });
}

function revealStep(element) {
    stepAnimation?.cancel();
    if (reducedQuizMotion.matches) return;

    stepAnimation = element.animate([
        { opacity: 0.6, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
    ], { duration: 180, easing: "cubic-bezier(0.2, 0.75, 0.25, 1)" });
}

function showQuestion() {
    const question = questions[questionIndex];

    questionTitle.textContent = question.title;
    illustration.src = question.illustration;
    illustration.alt = question.alt;
    card.dataset.illustrationTone = question.illustrationTone ?? "green";
    answerTexts.forEach((text, index) => {
        text.textContent = question.answers[index];
    });

    form.reset();
    const markedOption = answers.querySelector(".quiz-option[data-result]");
    if (markedOption) delete markedOption.dataset.result;
    answers.disabled = false;
    card.classList.remove("is-flipped");
    cardFront.inert = false;
    feedback.inert = true;
    feedbackTitle.textContent = "";
    feedbackExplanation.textContent = "";
    delete feedback.dataset.result;
    submitButton.hidden = false;
    nextButton.hidden = true;

    updateProgress(questionIndex);

    resultScreen.hidden = true;
    updateLeafMotion();
    questionScreen.hidden = false;
    revealStep(questionScreen);
}

function showResult() {
    const didWin = score >= winScore;
    resultScreen.dataset.result = didWin ? "win" : "try-again";
    resultTitle.textContent = `Du fikk ${score} av ${questions.length} riktige`;
    resultMessage.textContent = didWin
        ? "Godt jobbet! Nå kjenner du flere av naturens viktige egenskaper."
        : "Her er det mer å lære om naturen. Prøv gjerne én gang til!";
    questionScreen.hidden = true;
    resultScreen.hidden = false;
    updateLeafMotion();
    revealStep(resultCard);
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

    card.classList.add("is-flipped");
    cardFront.inert = true;
    feedback.inert = false;
    answers.disabled = true;
    submitButton.hidden = true;
    nextButtonLabel.textContent = questionIndex + 1 === questions.length ? "Se resultat" : "Neste spørsmål";
    nextButton.hidden = false;
    updateProgress(questionIndex + 1);
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
