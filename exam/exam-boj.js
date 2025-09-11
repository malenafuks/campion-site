// exam/exam-boj.js
(async function(){
  const el = document.getElementById('exam-widget');

  function renderError(msg){
    el.innerHTML = `<div class="error"><strong>Błąd:</strong> ${msg}<br>
      Upewnij się, że plik <code>exam/boj-questions.json</code> istnieje i że ścieżka jest poprawna.
    </div>`;
  }

  // 1) Wczytaj pełny bank pytań
  let pool = null;
  try{
    const res = await fetch('exam/boj-questions.json', { cache: 'no-store' });
    if(!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    pool = await res.json();
    if(!Array.isArray(pool) || !pool.length) throw new Error('Plik JSON nie zawiera listy pytań.');
  }catch(e){
    console.warn('Nie udało się pobrać JSON:', e);
    renderError(`Nie udało się wczytać <code>exam/boj-questions.json</code> (${e.message}).`);
    return;
  }

  // 2) Losujemy 10 pytań (użyj Fisher–Yates dla stabilniejszego losowania)
  const quiz = shuffleFY(pool.slice()).slice(0, 10);

  // dla radia: jeden wybór na pytanie (index lub null)
  let answersState = quiz.map(()=>null);

  // 3) Render pytań
  renderQuiz();

  function renderQuiz(){
    el.innerHTML = `
      <div class="row">
        <div class="badge">BOJ</div>
        <span class="muted">Zaznacz <strong>jedną poprawną</strong> odpowiedź.</span>
      </div>
      <form id="quizForm">
        ${quiz.map((q,qi)=>{
          // potasuj opcje w ramach pytania
          const options = shuffleFY(q.options.slice());
          // zapamiętaj ztasowane opcje na obiekcie q, by ocena korzystała z tej samej kolejności
          q._shuffled = options;

          return `
            <fieldset>
              <legend>${qi+1}. ${escapeHtml(q.text)}</legend>
              ${options.map((o,oi)=>`
                <label>
                  <input type="radio" name="q${qi}" data-qi="${qi}" data-oi="${oi}" ${answersState[qi]===oi?'checked':''}>
                  ${escapeHtml(o.text)}
                </label>
              `).join('')}
            </fieldset>
          `;
        }).join('')}
        <div class="row"><button type="submit">Zakończ quiz</button
