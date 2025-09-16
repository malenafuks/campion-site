(function(){
  const CONFIG = {
    questionsUrl: "exam/boj-questions.json", // <-- NIE ZMIENIAJ NAZWY; zgodnie z Twoją strukturą
    pick: 10,                // ile pytań losujemy
    shuffle: true,           // tasuj pulę
    PASS_THRESHOLD: 0.7,     // próg zaliczenia pojedynczego pytania
    showModelAnswer: true    // pokazuj wzorzec po sprawdzeniu
  };

  // ---- montaż UI ----
  function mount() {
    const root = document.getElementById("exam-widget") || document.body;
    root.innerHTML = `
      <div class="quiz-app">
        <div class="quiz-card">
          <div class="quiz-progress">
            <div class="bar"><span id="bar" style="width:0%"></span></div>
            <div class="step" id="step">0/0</div>
          </div>
          <h2 class="quiz-question" id="q"></h2>
          <textarea id="ans" class="ta" placeholder="Twoja odpowiedź..." rows="6" style="width:100%;padding:12px;border:1px solid rgba(0,0,0,.12);border-radius:12px;background:#fff"></textarea>
          <div class="quiz-hint" id="hint" style="display:none;margin-top:8px">Napisz odpowiedź i kliknij „Sprawdź”.</div>
          <div class="quiz-actions">
            <button class="btn" id="skip">Pomiń</button>
            <button class="btn btn-primary" id="check">Sprawdź</button>
            <button class="btn" id="next" disabled>Dalej</button>
          </div>
          <div class="feedback" id="fb" style="display:none"></div>
        </div>
      </div>
    `;
    return {
      root,
      bar: root.querySelector("#bar"),
      step: root.querySelector("#step"),
      q: root.querySelector("#q"),
      ans: root.querySelector("#ans"),
      hint: root.querySelector("#hint"),
      skip: root.querySelector("#skip"),
      check: root.querySelector("#check"),
      next: root.querySelector("#next"),
      fb: root.querySelector("#fb")
    };
  }

  // ---- narzędzia oceny ----
  const normalize = (s) => (s||"")
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu,"")
    .replace(/[^a-z0-9\s-]/g," ")
    .replace(/\s+/g," ")
    .trim();

  function containsPhrase(text, phrase){
    const t = " " + normalize(text) + " ";
    const parts = normalize(phrase).split(" ").filter(Boolean);
    return parts.every(p => t.includes(" "+p+" "));
  }

  function scoreByRubric(answer, rubric){
    const req = rubric.require || [];
    const good = rubric.good || [];
    const bad = rubric.forbid || [];

    const hitsReq = req.filter(ph => containsPhrase(answer, ph));
    const hitsGood = good.filter(ph => containsPhrase(answer, ph));
    const hitsBad = bad.filter(ph => containsPhrase(answer, ph));

    const base = (req.length === 0 || hitsReq.length === req.length) ? 1 : 0;
    let bonus = 0;
    if (hitsGood.length) bonus += Math.min(0.5, hitsGood.length * 0.25);
    if (hitsBad.length) bonus -= Math.min(0.5, hitsBad.length * 0.25);
    const total = Math.max(0, Math.min(1, base + bonus));

    return { total, hitsReq, hitsGood, hitsBad };
  }

  function shuffle(a){ const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]} return b }

  // ---- logika quizu ----
  let ui, bank=[], picked=[], idx=0, score=0;

  function renderQuestion(){
    const q = picked[idx];
    ui.q.textContent = q.question;
    ui.ans.value = "";
    ui.hint.style.display = "none";
    ui.fb.style.display = "none";
    ui.fb.innerHTML = "";
    ui.next.disabled = true;
    ui.step.textContent = `${idx+1}/${picked.length}`;
    ui.bar.style.width = `${Math.round((idx/picked.length)*100)}%`;
  }

  function showFeedback(res, modelAnswer){
    ui.fb.style.display =
