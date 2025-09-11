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
        <div class="row"><button type="submit">Zakończ quiz</button></div>
      </form>
    `;

    // nasłuch na radio
    el.querySelectorAll('input[type=radio]').forEach(rb=>{
      rb.addEventListener('change',(e)=>{
        const qi = +e.target.dataset.qi;
        const oi = +e.target.dataset.oi;
        answersState[qi] = oi;
      });
    });

    // bramka
    el.querySelector('#quizForm').addEventListener('submit',(e)=>{
      e.preventDefault();
      renderGate();
    });
  }

  // 4) Bramka e-mail + zgoda (bez zmian)
  function renderGate(){
    el.innerHTML = `
      <h3>Podaj e-mail, aby zobaczyć wynik</h3>
      <input type="email" id="email" placeholder="np. imie@domena.pl">
      <label class="row" style="align-items:flex-start">
        <input type="checkbox" id="consent">
        <span>Zgadzam się na kontakt i przetwarzanie danych (demo).</span>
      </label>
      <div class="row">
        <button id="seeResult">Pokaż wynik</button>
        <button class="secondary" id="back">Wróć do pytań</button>
      </div>
    `;
    el.querySelector('#back').addEventListener('click', renderQuiz);
    el.querySelector('#seeResult').addEventListener('click', ()=>{
      const email = (document.getElementById('email').value||'').trim();
      const consent = document.getElementById('consent').checked;
      if(!email){ alert('Podaj e-mail.'); return; }
      if(!consent){ alert('Zaznacz zgodę.'); return; }
      renderResult(email);
    });
  }

  // 5) Wynik + szczegóły (dopasowane do „jednej poprawnej” odpowiedzi)
  function renderResult(email){
    let correctCount = 0;

    const details = quiz.map((q,qi)=>{
      const picked = answersState[qi];               // index radiobuttonu
      const correctIdx = q._shuffled.findIndex(o=>o.correct); // index poprawnej w ztasowanej liście
      const ok = picked === correctIdx;
      if(ok) correctCount++;

      const corrTxt = correctIdx >= 0 ? `(${correctIdx+1}) ${escapeHtml(q._shuffled[correctIdx].text)}` : '—';
      const userTxt = (picked != null) ? `(${picked+1}) ${escapeHtml(q._shuffled[picked].text)}` : '—';

      return `<details>
        <summary>${qi+1}. ${escapeHtml(q.text)} ${ok?'✅':'❌'}</summary>
        <p><strong>Twoje:</strong><br>${userTxt}</p>
        <p><strong>Poprawne:</strong><br>${corrTxt}</p>
        ${q.explanation ? `<p class="muted">${escapeHtml(q.explanation)}</p>` : ''}
      </details>`;
    }).join('');

    el.innerHTML = `
      <h3>Wynik: ${correctCount} / ${quiz.length}</h3>
      <p class="muted">E-mail: ${escapeHtml(email)}</p>
      ${details}
    `;
  }

  // utils
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  // Fisher–Yates
  function shuffleFY(a){
    const arr = [...a];
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
})();
