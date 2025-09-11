(function () {
  const url = "exam/boj-questions.json";

  /** Fisher–Yates shuffle */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function loadQuestions() {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Nie udało się pobrać pytań.");
    const data = await res.json();
    return data.map(q => ({ ...q, answers: shuffle(q.answers) }));
  }

  const quizApp = document.createElement("div");
  quizApp.className = "quiz-app";
  document.body.appendChild(quizApp);

  let questions = [];
  let idx = 0;
  let score = 0;
  let selected = null;

  function renderQuestion() {
    const q = questions[idx];

    quizApp.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-progress">
          <div class="bar"><span style="width:${(idx / questions.length) * 100}%"></span></div>
          <div class="step">${idx + 1}/${questions.length}</div>
        </div>
        <h2 class="quiz-question">${q.question}</h2>
        <ul class="quiz-answers">
          ${q.answers
            .map((a, i) => `
              <li class="quiz-answer" data-idx="${i}">
                ${a.text}
              </li>`).join("")}
        </ul>
        <div class="quiz-actions">
          <span class="quiz-hint" style="display:none;">Zaznacz odpowiedź, aby przejść dalej</span>
          <button class="btn btn-primary" id="nextBtn">Dalej</button>
        </div>
      </div>
    `;

    const answersEls = quizApp.querySelectorAll(".quiz-answer");
    const nextBtn = quizApp.querySelector("#nextBtn");
    const hint = quizApp.querySelector(".quiz-hint");

    answersEls.forEach((el) => {
      el.addEventListener("click", () => {
        answersEls.forEach(e => e.classList.remove("selected"));
        el.classList.add("selected");
        selected = Number(el.dataset.idx);
        hint.style.display = "none";
      });
    });

    nextBtn.addEventListener("click", () => {
      if (selected === null) {
        hint.style.display = "inline-block";
        return;
      }

      // Sprawdź poprawność
      const qData = questions[idx];
      answersEls.forEach((el, i) => {
        if (qData.answers[i].correct) el.classList.add("correct");
        else if (i === selected) el.classList.add("wrong");
      });

      if (qData.answers[selected].correct) score++;

      nextBtn.disabled = true;

      setTimeout(() => {
        idx++;
        if (idx < questions.length) {
          selected = null;
          renderQuestion();
        } else {
          renderResult();
        }
      }, 900);
    });
  }

  function renderResult() {
    quizApp.innerHTML = `
      <div class="quiz-card quiz-result">
        <h2>Koniec quizu!</h2>
        <p class="score">${score} / ${questions.length}</p>
        <div class="quiz-actions">
          <button class="btn btn-primary" id="retryBtn">Zagraj ponownie</button>
          <a href="index.html#exam" class="btn">Wróć na stronę główną</a>
        </div>
      </div>
    `;

    quizApp.querySelector("#retryBtn").addEventListener("click", () => {
      idx = 0;
      score = 0;
      selected = null;
      questions = questions.map(q => ({ ...q, answers: shuffle(q.answers) }));
      renderQuestion();
    });
  }

  loadQuestions()
    .then((qs) => {
      questions = qs;
      renderQuestion();
    })
    .catch((err) => {
      quizApp.innerHTML = `<p style="color:#b00020">Błąd ładowania quizu: ${err.message}</p>`;
    });
})();
