(function () {
  const url = (window && window.BOJ_QUESTIONS_URL) || "exam/boj-questions.json";

  /** Fisher–Yates */
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
    // mieszamy ODPOWIEDZI dla każdego pytania (kolejność pytań — bez zmian)
    return data.map(q => ({ ...q, answers: shuffle(q.answers) }));
  }

  const dom = {
    card: document.getElementById("card"),
    next: document.getElementById("nextBtn"),
    progress: document.getElementById("progressBar"),
    resultTpl: document.getElementById("resultTpl")
  };

  let questions = [];
  let idx = 0;
  let score = 0;
  let selectedIndex = null;

  function renderQuestion() {
    const q = questions[idx];
    dom.card.innerHTML = `
      <p class="q">${q.question}</p>
      <div class="answers" role="radiogroup" aria-label="odpowiedzi">
        ${q.answers
          .map((a, i) => `
            <div class="answer">
              <input type="radio" name="ans" id="ans-${i}" value="${i}" />
              <label for="ans-${i}">${a.text}</label>
            </div>
          `).join("")}
      </div>
    `;
    dom.next.disabled = true;
    selectedIndex = null;

    // progress
    const pct = Math.round((idx / questions.length) * 100);
    dom.progress.style.width = `${pct}%`;

    // bind
    dom.card.querySelectorAll('input[name="ans"]').forEach(input => {
      input.addEventListener("change", e => {
        selectedIndex = Number(e.target.value);
        dom.next.disabled = false;
      });
    });
  }

  function renderResult() {
    dom.progress.style.width = "100%";
    const tpl = dom.resultTpl.content.cloneNode(true);
    tpl.getElementById("scoreTxt").textContent = `${score} / ${questions.length}`;
    dom.card.innerHTML = "";
    dom.card.appendChild(tpl);

    const retryBtn = document.getElementById("retryBtn");
    retryBtn.addEventListener("click", () => {
      idx = 0; score = 0; selectedIndex = null;
      // ponowne wymieszanie odpowiedzi
      questions = questions.map(q => ({ ...q, answers: shuffle(q.answers) }));
      renderQuestion();
      dom.next.textContent = "Dalej";
    });
    dom.next.style.display = "none";
  }

  function next() {
    if (selectedIndex == null) return;
    const q = questions[idx];
    if (q.answers[selectedIndex].correct) score += 1;

    idx += 1;
    if (idx < questions.length) {
      renderQuestion();
    } else {
      renderResult();
    }
  }

  // init
  dom.next.addEventListener("click", next);

  loadQuestions()
    .then(qs => { questions = qs; renderQuestion(); })
    .catch(err => {
      dom.card.innerHTML = `<p style="color:#b00020">Błąd: ${err.message}</p>`;
      dom.next.disabled = true;
    });
})();
