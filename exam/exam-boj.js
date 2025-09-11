// exam/exam-boj.js
(async function(){
  const el = document.getElementById('exam-widget');

  function renderError(msg){
    el.innerHTML = `<div class="error"><strong>Błąd:</strong> ${msg}<br>
      Upewnij się, że plik <code>exam/boj-questions.json</code> istnieje i że ścieżka jest poprawna.
    </div>`;
  }

  // 1) Wczytaj pełny bank pytań (JSON leży w tym samym folderze co ten plik JS)
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

  // 2) Losujemy 10 pytań
  const quiz = shuffle(pool).slice(0, 10);
  let answersState = quiz.map(()=>new Set());

  // 3) Render pytań
  renderQuiz();

  function renderQuiz(){
    el.innerHTML = `
      <div class="row">
        <div class="badge">BOJ</div>
        <span class="muted">Zaznacz wszystkie poprawne odpowiedzi.</span>
      </div>
      <form id="quizForm">
        ${quiz.map((q,qi)=>`
          <fieldset>
            <legend>${qi+1}. ${escapeHtml(q.text)}</legend>
            ${q.options.map((o,oi)=>`
              <label>
                <input type="checkbox" data-qi="${qi}" data-oi="${oi}" ${answersState[qi].has(oi)?'checked':''}>
                ${escapeHtml(o.text)}
              </label>
            `).join('')}
          </fieldset>
        `).join('')}
        <div class="row"><button type="submit">Zakończ quiz</button></div>
      </form>
    `;

    // nasłuch na checkboxy
    el.querySelectorAll('input[type=checkbox]').forEach(cb=>{
      cb.addEventListener('change',(e)=>{
        const qi = +e.target.dataset.qi;
        const oi = +e.target.dataset.oi;
        if(e.target.checked) answersState[qi].add(oi);
        else answersState[qi].delete(oi);
      });
    });

    // bramka
    el.querySelector('#quizForm').addEventListener('submit',(e)=>{
      e.preventDefault();
      renderGate();
    });
  }

  // 4) Bramka e-mail + zgoda
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

  // 5) Wynik + szczegóły
  function renderResult(email){
    let correctCount = 0;
    const details = quiz.map((q,qi)=>{
      const user = Array.from(answersState[qi]).sort();
      const correctIdx = q.options.map((o,i)=>o.correct?i:null).filter(i=>i!==null).sort();
      const ok = JSON.stringify(user) === JSON.stringify(correctIdx);
      if(ok) correctCount++;

      const corrTxt = correctIdx.map(i=>`(${i+1}) ${escapeHtml(q.options[i].text)}`).join('<br>');
      const userTxt = user.length ? user.map(i=>`(${i+1}) ${escapeHtml(q.options[i].text)}`).join('<br>') : '—';

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
  function shuffle(a){ return [...a].sort(()=>Math.random()-.5); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
})();

