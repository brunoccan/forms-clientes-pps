import { LeadForm, FormQuestion, QualificationCriteria } from '@/types/form';

export function generateFormHTML(form: LeadForm): string {
  const primary = form.colors.primary || '#ff8533';
  const secondary = form.colors.secondary || '#ffc933';

  // Sort questions by order
  const sortedQuestions = [...(form.questions || [])].sort((a, b) => a.order - b.order);

  // Generate steps HTML
  const stepsHTML = sortedQuestions.map((q, index) => {
    const stepNum = index + 1;
    const isLast = index === sortedQuestions.length - 1;

    let inputHTML = '';

    switch (q.type) {
      case 'text':
      case 'email':
      case 'phone':
        const inputType = q.type === 'phone' ? 'tel' : q.type === 'email' ? 'email' : 'text';
        const onInput = q.type === 'phone' ? 'validatePhone()' : q.type === 'email' ? 'validateEmail()' : `validateField('${q.id}')`;
        const maxLength = q.type === 'phone' ? 'maxlength="15"' : '';
        inputHTML = `
          <div class="input-group">
            <label for="inp-${q.id}">${q.label}</label>
            <input type="${inputType}" id="inp-${q.id}" placeholder="${q.placeholder || ''}" oninput="${onInput}" ${maxLength} />
            <div class="error-msg" id="err-${q.id}">Preenchimento obrigatório</div>
          </div>
        `;
        break;

      case 'textarea':
        inputHTML = `
          <div class="input-group">
            <label for="inp-${q.id}">${q.label}</label>
            <textarea id="inp-${q.id}" placeholder="${q.placeholder || ''}" oninput="validateField('${q.id}')" rows="4"></textarea>
            <div class="error-msg" id="err-${q.id}">Preenchimento obrigatório</div>
          </div>
        `;
        break;

      case 'select':
      case 'radio':
        const optionsHTML = q.options?.map(opt => `
          <label class="radio-card" onclick="selectOption('${q.id}', '${opt.value.replace(/'/g, "\\'")}', this)">
            <input type="radio" name="${q.id}" value="${opt.value.replace(/"/g, '&quot;')}" />
            <span class="radio-label">${opt.label}</span>
          </label>
        `).join('\n') || '';

        inputHTML = `
          <div class="radio-group" id="group-${q.id}">
            ${optionsHTML}
          </div>
        `;
        break;
    }

    const nextAction = isLast ? 'showReview()' : `showStep(${stepNum + 1})`;
    const btnLabel = isLast ? 'Revisar' : 'Continuar';
    const btnDisabled = q.required ? 'disabled' : '';
    const btnId = `btn-${q.id}`;

    // Back button (except for step 1)
    const backBtn = stepNum > 1
      ? `<button class="btn-back" onclick="showStep(${stepNum - 1})"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg> Voltar</button>`
      : '';

    // Step icon (generic for now, can be customized later)
    const icon = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

    return `
      <!-- STEP ${stepNum}: ${q.label} -->
      <div class="step ${stepNum === 1 ? 'active' : ''}" data-step="${stepNum}" data-qid="${q.id}">
        ${backBtn}
        <div class="step-icon">${icon}</div>
        <h2>${q.label}</h2>
        ${q.placeholder ? `<p class="subtitle">${q.placeholder}</p>` : ''}
        ${inputHTML}
        ${q.type !== 'select' && q.type !== 'radio' ? `<button class="btn-primary" id="${btnId}" ${btnDisabled} onclick="${nextAction}">${btnLabel}</button>` : ''}
      </div>
    `;
  }).join('\n');

  // Logic for qualification
  const criteriaJSON = JSON.stringify(form.qualificationCriteria || { rules: [], logic: 'AND' });
  const questionsJSON = JSON.stringify(sortedQuestions.map(q => ({ id: q.id, type: q.type, required: q.required })));

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${form.customization.pageTitle || 'Formulário'} - ${form.companyName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:linear-gradient(135deg,#fff8f0 0%,#fff 50%,#fffbf0 100%);min-height:100vh;color:#2d2d2d}
.wrapper{max-width:800px;margin:0 auto;padding:30px 40px;min-height:100vh;display:flex;flex-direction:column;justify-content:flex-start;overflow-y:auto}
.header{text-align:center;margin-bottom:30px}
.header img{max-height:60px;margin-bottom:12px}
.header h1{font-size:22px;font-weight:700;color:#2d2d2d;margin-bottom:4px}
.header p{font-size:14px;color:#666}
.progress-wrap{margin-bottom:28px}
.progress-bar-bg{width:100%;height:8px;background:#f0f0f0;border-radius:99px;overflow:hidden}
.progress-bar-fill{height:100%;background:linear-gradient(90deg,${primary},${secondary});border-radius:99px;transition:width .4s ease;width:0%}
.progress-text{text-align:center;font-size:13px;color:#999;margin-top:6px}
.step{display:none;animation:fadeIn .5s ease}
.step.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.step-icon{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,${primary},${secondary});display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
.step-icon svg{width:40px;height:40px;stroke:#fff;stroke-width:2;fill:none}
.step h2{font-size:24px;font-weight:700;text-align:center;margin-bottom:8px;color:#2d2d2d}
.step .subtitle{font-size:16px;color:#666;text-align:center;margin-bottom:24px}
.input-group{margin-bottom:16px}
.input-group label{display:block;font-size:15px;font-weight:600;margin-bottom:6px;color:#2d2d2d}
.input-group input,.input-group textarea{width:100%;padding:16px;border:2px solid #e0e0e0;border-radius:12px;font-size:16px;transition:border-color .2s;outline:none;background:#fff}
.input-group input:focus,.input-group textarea:focus{border-color:${primary}}
.input-group input.error{border-color:#d32f2f}
.error-msg{color:#d32f2f;font-size:13px;margin-top:4px;display:none}
.error-msg.show{display:block}
.radio-group{display:flex;flex-direction:column;gap:10px}
.radio-card{display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid #e0e0e0;border-radius:12px;cursor:pointer;transition:all .2s;background:#fff}
.radio-card:hover{border-color:${primary};background:#fffaf5}
.radio-card.selected{border-color:${primary};background:linear-gradient(135deg,${primary}08,${secondary}08)}
.radio-card input[type="radio"]{display:none}
.radio-label{font-size:15px;font-weight:500;flex:1}
.btn-primary{width:100%;padding:18px;background:linear-gradient(90deg,${primary},${secondary});color:#fff;border:none;border-radius:12px;font-size:18px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:20px;letter-spacing:.3px}
.btn-primary:hover{opacity:.92;transform:translateY(-1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-back{background:none;border:none;color:#999;font-size:14px;cursor:pointer;padding:10px;display:flex;align-items:center;gap:6px;margin-bottom:10px}
.review-cards{display:flex;flex-direction:column;gap:10px}
.review-card{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border:2px solid #e0e0e0;border-radius:12px;transition:border-color .2s;background:#fff}
.review-card-info{flex:1}
.review-card-label{font-size:12px;color:#999;margin-bottom:2px;text-transform:uppercase;letter-spacing:.5px}
.review-card-value{font-size:16px;font-weight:600;color:#2d2d2d}
.review-edit{background:none;border:none;color:${primary};font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;padding:6px 10px;border-radius:8px;}
.commit-btns{display:flex;flex-direction:column;gap:14px;margin-top:24px}
.btn-commit-yes{padding:20px;background:linear-gradient(135deg,#4CAF50,#45a049);color:#fff;border:none;border-radius:14px;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s}
.btn-commit-no{padding:18px;background:#fff;color:#d32f2f;border:2px solid #d32f2f;border-radius:14px;font-size:16px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s}
.btn-commit-yes:hover, .btn-commit-no:hover{opacity:.92;transform:translateY(-1px)}
.success-overlay{position:fixed;inset:0;background:rgba(255,255,255,.98);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:9999}
.success-overlay.show{display:flex}
.success-icon{width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,${primary},${secondary});display:flex;align-items:center;justify-content:center;animation:scaleIn .7s ease}
.success-icon svg{width:50px;height:50px;stroke:#fff;stroke-width:3;fill:none}
@keyframes scaleIn{0%{transform:scale(0)}60%{transform:scale(1.1)}100%{transform:scale(1)}}
.success-title{font-size:32px;font-weight:700;color:#2d2d2d;margin-top:24px;animation:slideUp .6s ease .3s both}
.success-sub{font-size:16px;color:#666;margin-top:8px;animation:slideUp .6s ease .5s both}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:760px){.wrapper{padding:20px}.step-icon{width:60px;height:60px}.step-icon svg{width:28px;height:28px}.step h2{font-size:20px}.btn-primary{font-size:16px;padding:16px}}
</style>
</head>
<body>
<div class="wrapper" id="wrapper">
  <div class="header">
    ${form.logo ? `<img src="${form.logo}" alt="${form.companyName}" />` : ''}
    <h1>${form.customization.heroTitle || form.companyName}</h1>
    <p>${form.customization.heroSubtitle || ''}</p>
  </div>

  <div class="progress-wrap">
    <div class="progress-bar-bg"><div class="progress-bar-fill" id="progressFill"></div></div>
    <div class="progress-text" id="progressText">Etapa 1 de ${sortedQuestions.length + 2}</div>
  </div>

  <form id="leadForm" onsubmit="return false">
    ${stepsHTML}
    
    <!-- REVIEW STEP -->
    <div class="step" data-step="${sortedQuestions.length + 1}" id="step-review">
      <button class="btn-back" onclick="showStep(${sortedQuestions.length})"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg> Voltar</button>
      <div class="step-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg></div>
      <h2>Confirme seus dados</h2>
      <p class="subtitle">Verifique se está tudo correto</p>
      <div class="review-cards" id="reviewCards"></div>
      <button class="btn-primary" onclick="confirmReview()">Confirmar e Continuar</button>
    </div>

    <!-- COMMITMENT STEP -->
    <div class="step" data-step="${sortedQuestions.length + 2}" id="step-commit">
      <div class="step-icon"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
      <h2>Último passo!</h2>
      <p class="subtitle" style="max-width:500px;margin:0 auto 20px">Devido à alta demanda, precisamos confirmar seu interesse real. Um especialista entrará em contato em breve.</p>
      <div class="commit-btns">
        <button class="btn-commit-yes" onclick="submitCommit(true)">
          <svg width="24" height="24" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" stroke="currentColor" fill="none" stroke-width="2"/></svg>
          Sim, aguardo o contato
        </button>
        <button class="btn-commit-no" onclick="submitCommit(false)">
           Não tenho interesse agora
        </button>
      </div>
    </div>
  </form>
</div>

<!-- Success Overlay -->
<div class="success-overlay" id="successOverlay">
  <div class="success-icon"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
  <div class="success-title">Recebemos seus dados!</div>
  <div class="success-sub">Em breve entraremos em contato.</div>
</div>

<script>
(function(){
  var currentStep = 1;
  var totalSteps = ${sortedQuestions.length + 2};
  var formData = {};
  var questions = ${questionsJSON};
  var criteria = ${criteriaJSON};
  var isQualified = true;
  var isEditing = false;
  
  // Initialize formData
  questions.forEach(function(q){ formData[q.id] = ''; });

  function $(id){ return document.getElementById(id); }
  
  window.showStep = function(n){
    if(n < 1) return;
    document.querySelectorAll('.step').forEach(function(s){ s.classList.remove('active'); });
    var el = document.querySelector('.step[data-step="'+n+'"]');
    if(el) el.classList.add('active');
    
    currentStep = n;
    var pct = Math.round(((n-1)/totalSteps)*100);
    $('progressFill').style.width = pct + '%';
    $('progressText').innerText = 'Etapa ' + Math.min(n, totalSteps) + ' de ' + totalSteps;
    
    window.scrollTo(0,0);
  };

  window.validateField = function(qid){
    var val = $('inp-'+qid).value;
    formData[qid] = val;
    
    var q = questions.find(function(x){ return x.id === qid; });
    var isValid = !q.required || val.trim().length > 0;
    
    var btn = $('btn-'+qid);
    if(btn) btn.disabled = !isValid;
    
    var err = $('err-'+qid);
    if(err) err.style.display = isValid ? 'none' : 'block';
    
    return isValid;
  };

  window.validatePhone = function(){
    var el = $('inp-whatsapp');
    if(!el) return; // if id is not whatsapp, generic handling
    var raw = el.value.replace(/[^0-9]/g,'');
    var val = raw;
    
    if(raw.length > 0){
      val = '(' + raw.substring(0,2);
      if(raw.length > 2) val += ') ' + raw.substring(2,7);
      if(raw.length > 7) val += '-' + raw.substring(7,11);
    }
    el.value = val;
    formData['whatsapp'] = val; // Store formatted
    
    var isValid = raw.length >= 10;
    $('btn-whatsapp').disabled = !isValid;
  };

  window.validateEmail = function(){
    var el = $('inp-email');
    if(!el) return;
    var val = el.value;
    formData['email'] = val;
    var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    $('btn-email').disabled = !isValid;
  };
  
  window.selectOption = function(qid, val, el){
    // Update UI
    var group = document.getElementById('group-'+qid);
    if(group.classList.contains('locked')) return; // Prevent double clicks
    group.classList.add('locked'); // Lock selection
    
    group.querySelectorAll('.radio-card').forEach(function(c){ c.classList.remove('selected'); });
    el.classList.add('selected');
    
    // Update Data
    formData[qid] = val;
    
    // Navigation
    if(isEditing){
      isEditing = false;
      showReview();
    } else {
      var step = parseInt(el.closest('.step').getAttribute('data-step'));
      if(step === ${sortedQuestions.length}){
        showReview();
      } else {
        // Safety delay to prevent skips and ensure UI feedback
        setTimeout(function(){ 
          if(step < ${sortedQuestions.length}) showStep(step + 1); 
        }, 450);
      }
    }
  };

  window.showReview = function(){
    var html = '';
    questions.forEach(function(q, idx){
      var val = formData[q.id];
      if(!val) return;
      html += '<div class="review-card">' +
              '<div class="review-card-info">' +
              '<div class="review-card-label">' + q.id.toUpperCase() + '</div>' +
              '<div class="review-card-value">' + val + '</div>' +
              '</div>' +
              '<button class="review-edit" onclick="editStep('+(idx+1)+')">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
              'Editar</button>' +
              '</div>';
    });
    $('reviewCards').innerHTML = html;
    showStep(${sortedQuestions.length + 1});
    checkQualification();
  };

  window.editStep = function(n){
    isEditing = true;
    showStep(n);
  };

  function checkQualification(){
    // Default to true if no rules
    if(!criteria.rules || criteria.rules.length === 0){
        isQualified = true;
        return;
    }

    var rulesPassed = criteria.rules.map(function(rule){
        var answer = formData[rule.questionId];
        if(!answer) return false;
        
        switch(rule.operator){
            case 'equals': return answer === rule.value;
            case 'notEquals': return answer !== rule.value;
            case 'contains': return answer.includes(rule.value);
            case 'greaterThan': return parseFloat(answer.replace(/[^0-9]/g,'')) > parseFloat(rule.value.replace(/[^0-9]/g,''));
            case 'lessThan': return parseFloat(answer.replace(/[^0-9]/g,'')) < parseFloat(rule.value.replace(/[^0-9]/g,''));
            default: return false;
        }
    });

    if(criteria.logic === 'OR'){
        isQualified = rulesPassed.some(function(r){ return r; });
    } else {
        isQualified = rulesPassed.every(function(r){ return r; });
    }
  }

  window.confirmReview = function(){
    if(isQualified){
        showStep(${sortedQuestions.length + 2}); // Commit step
    } else {
        submitForm(false); // Disqualified, submit immediately
    }
  };

  window.submitCommit = function(yes){
    submitForm(yes);
  };

  function submitForm(qualified){
    var status = qualified ? 'qualificado' : 'desqualificado';
    // Use configured webhooks
    var url = qualified ? '${form.webhooks.qualified}' : '${form.webhooks.disqualified}';
    var redirect = qualified ? '${form.redirects.qualified}' : '${form.redirects.disqualified}';
    
    // Add metadata
    formData['status'] = status;
    formData['submittedAt'] = new Date().toISOString();
    
    // Show success
    $('successOverlay').classList.add('show');
    
    // Send webhook
    if(url && url.startsWith('http')){
        fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        }).catch(e => console.error(e));
    }
    
    // Redirect
    setTimeout(function(){
        if(redirect && redirect.startsWith('http')){
            window.location.href = redirect;
        }
    }, 2000);
  }

  // Init
  showStep(1);
})();
</script>
</body>
</html>`;
}
