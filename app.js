/* ponytail: single-file SPA, no framework, no build step */

const CONFIG = {
  owner: 'youvalue',
  repo: 'open-jobs',
  clientId: 'Ov23liSPwUU05lmZ88Yz',
  scope: 'public_repo',
  apiBase: 'https://api.github.com',
}

let state = {
  user: null,
  token: null,
  lang: 'en',
  country: '',
  city: '',
  role: '',
  type: 'resume',
  issues: [],
  page: 1,
  loading: false,
  search: '',
}

let locales = {}
let countryLang = {}
let roles = []
let cities = {}

async function loadConfig() {
  const [cl, r] = await Promise.all([
    fetch('config/country-language.json').then(r => r.json()),
    fetch('config/roles.json').then(r => r.json()),
  ])
  countryLang = cl; roles = r
  const countryCodes = Object.keys(countryLang)
  const cityResults = await Promise.all(
    countryCodes.map(code =>
      fetch(`config/cities/${code}.json`).then(r => r.json()).catch(() => [])
    )
  )
  cities = {}
  countryCodes.forEach((code, i) => { cities[code] = cityResults[i] })
}

async function loadLocale(lang) {
  try {
    const res = await fetch(`locales/${lang}.json`)
    locales[lang] = await res.json()
  } catch { locales[lang] = {} }
}

function t(key) {
  const val = locales[state.lang] && locales[state.lang][key]
  return val || key
}

function qs(sel) { return document.querySelector(sel) }
function qsa(sel) { return document.querySelectorAll(sel) }
function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') e.className = v
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v)
    else if (k === 'dataset') Object.assign(e.dataset, v)
    else e.setAttribute(k, v)
  }
  for (const c of children) { if (c != null) e.append(typeof c === 'string' ? document.createTextNode(c) : c) }
  return e
}

function showLoading(show) { qs('#loading').style.display = show ? 'block' : 'none' }
function showContent(html) { qs('#content').innerHTML = html }

function openModal(html) {
  qs('#modal').innerHTML = html
  qs('#modal-overlay').classList.remove('hidden')
}
function closeModal() {
  if (window._oauthTimer) { clearTimeout(window._oauthTimer); window._oauthTimer = null }
  qs('#modal-overlay').classList.add('hidden')
}
qs('#modal-overlay').addEventListener('click', e => { if (e.target === qs('#modal-overlay')) closeModal() })

// --- i18n ---
function applyI18n() {
  for (const el of qsa('[data-i18n]')) {
    const key = el.dataset.i18n
    const val = t(key)
    if (val !== key) el.textContent = val
  }
  document.title = t('app.title')
  const desc = qs('meta[name="description"]')
  if (desc) desc.content = t('app.description')
}

async function startDeviceFlow() {
  const proxy = 'https://open-jobs.631008982.workers.dev/?url='
  const deviceRes = await fetch(proxy + encodeURIComponent('https://github.com/login/device/code'), {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CONFIG.clientId, scope: CONFIG.scope })
  })
  const deviceText = await deviceRes.text()
  let device
  try { device = JSON.parse(deviceText) } catch { throw new Error('Proxy returned non-JSON: ' + deviceText.slice(0, 200)) }
  if (device.error) { throw new Error(device.error_description) }

  // Auto-open verification URL in popup
  window.open(device.verification_uri, 'github-auth', 'width=600,height=700')

  openModal(`
    <div class="auth-box">
      <h2>${t('auth.loginTitle')}</h2>
      <p>${t('auth.enterCode')}</p>
      <div class="auth-code">${device.user_code}</div>
      <p><button class="btn btn-sm" onclick="navigator.clipboard.writeText('${device.user_code}')">${t('auth.copyCode')}</button></p>
      <p style="margin-top:12px;font-size:13px;color:var(--text-secondary)">${t('auth.waiting')}</p>
      <p><button class="btn btn-sm" onclick="closeModal()" style="margin-top:12px">${t('common.cancel')}</button></p>
    </div>
  `)

  let timer = null
  let interval = (device.interval || 5) * 1000

  function scheduleNext() {
    timer = setTimeout(poll, interval)
  }

  function poll() {
    fetch(proxy + encodeURIComponent('https://github.com/login/oauth/access_token'), {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CONFIG.clientId,
        device_code: device.device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
      })
    })
    .then(r => r.text())
    .then(text => {
      let data
      try { data = JSON.parse(text) } catch { return scheduleNext() }
      if (data.access_token) {
        closeModal()
        state.token = data.access_token
        localStorage.setItem('gh_token', data.access_token)
        fetchUser().then(() => { renderAuth(); router() })
      } else if (data.error === 'slow_down') {
        interval = Math.max(interval, (data.interval || 10) * 1000)
        scheduleNext()
      } else if (data.error === 'authorization_pending') {
        scheduleNext()
      } else {
        closeModal()
      }
    })
    .catch(() => scheduleNext())
  }

  scheduleNext()
  window._oauthTimer = timer
}

async function fetchUser() {
  if (!state.token) return
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${state.token}`, 'Accept': 'application/vnd.github.v3+json' }
    })
    state.user = await res.json()
  } catch { state.user = null }
}

function renderAuth() {
  const area = qs('#auth-area')
  if (state.user) {
    area.innerHTML = `
      <img src="${state.user.avatar_url}" class="avatar" alt="">
      <span style="font-size:13px">${state.user.login}</span>
      <button class="btn btn-sm" onclick="logout()">${t('nav.logout')}</button>
    `
  } else {
    area.innerHTML = `<button class="btn btn-sm btn-primary" onclick="startDeviceFlow()">${t('nav.login')}</button>`
  }
}

function logout() {
  state.token = null; state.user = null
  localStorage.removeItem('gh_token')
  renderAuth(); router()
}

// --- GitHub API ---
async function gh(path, opts = {}) {
  const headers = { 'Accept': 'application/vnd.github.v3+json' }
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`
  if (opts.body) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${CONFIG.apiBase}${path}`, { ...opts, headers })
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || res.statusText) }
  return res.json()
}

async function listIssues(labels, page = 1, perPage = 30) {
  const params = new URLSearchParams({ state: 'open', per_page: perPage, page })
  if (labels) params.set('labels', labels)
  return gh(`/repos/${CONFIG.owner}/${CONFIG.repo}/issues?${params}`)
}

async function getIssue(number) {
  return gh(`/repos/${CONFIG.owner}/${CONFIG.repo}/issues/${number}`)
}

async function createIssue(data) {
  return gh(`/repos/${CONFIG.owner}/${CONFIG.repo}/issues`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

async function updateIssue(number, data) {
  return gh(`/repos/${CONFIG.owner}/${CONFIG.repo}/issues/${number}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

// --- Router ---
function router() {
  const hash = (location.hash.slice(1).replace(/^\//, '') || 'resumes')
  const [routePath, ...rest] = hash.split('/')
  const parts = [routePath.split('?')[0], ...rest]
  const route = parts[0]

  // Update active tab
  qsa('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === parts[0] || (parts[0] === '' && t.dataset.tab === 'resumes')))

  showLoading(true)
  if (route === '' || route === 'resumes' || route === 'jobs') {
    state.type = route === 'jobs' ? 'job' : 'resume'
    renderList()
  } else if (route === 'new') {
    renderPostForm()
  } else if (route === 'my') {
    renderMyPosts()
  } else if (route === 'issue') {
    renderDetail(parts[1])
  } else if (route === 'about') {
    renderAbout()
  } else {
    showContent(`<p>404</p>`)
    showLoading(false)
  }
}

// --- List View ---
async function renderList(append = false) {
  showLoading(true)
  const labels = [`type-${state.type}`]
  if (state.country) labels.push(`country-${state.country}`)
  if (state.city) labels.push(`city-${state.city}`)
  if (state.role) labels.push(`role-${state.role}`)

  try {
    const issues = await listIssues(labels.join(','), state.page)
    if (append) state.issues = state.issues.concat(issues)
    else state.issues = issues

    const countries = Object.keys(countryLang)
    const citiesList = state.country ? (cities[state.country] || []) : []

    const showHero = !state.country && !state.city && !state.role && !state.search && state.page === 1
    let html = showHero ? `
      <div class="hero">
        <h1>${t('hero.title')}</h1>
        <p class="hero-sub">${t('hero.subtitle')}</p>
        <div class="hero-actions">
          <a href="#/resumes" class="btn btn-primary btn-lg">${t('hero.explore')}</a>
          <a href="#/new?type=job" class="btn btn-lg">${t('hero.post')}</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><span class="hero-stat-icon">💚</span><span>${t('hero.stat1')}</span></div>
          <div class="hero-stat"><span class="hero-stat-icon">🔓</span><span>${t('hero.stat2')}</span></div>
          <div class="hero-stat"><span class="hero-stat-icon">🤝</span><span>${t('hero.stat3')}</span></div>
        </div>
      </div>
    ` : ''

    html += `
      <div class="filters">
        <div class="filter-group" style="flex:1;min-width:200px">
          <label>${t('filter.search')}</label>
          <input id="filter-search" type="text" value="${escapeHtml(state.search)}" placeholder="${t('filter.placeholder')}" onkeyup="onSearchKeyup(event)">
        </div>
        <div class="filter-group">
          <label>${t('filter.country')}</label>
          <select id="filter-country" onchange="onFilterChange()">
            <option value="">${t('filter.all')}</option>
            ${countries.map(c => `<option value="${c}" ${c === state.country ? 'selected' : ''}>${t('country.' + c)}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label>${t('filter.city')}</label>
          <select id="filter-city" onchange="onFilterChange()">
            <option value="">${t('filter.all')}</option>
            ${citiesList.map(c => `<option value="${c}" ${c === state.city ? 'selected' : ''}>${t('city.' + c)}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label>${t('filter.role')}</label>
          <select id="filter-role" onchange="onFilterChange()">
            <option value="">${t('filter.all')}</option>
            ${roles.map(r => `<option value="${r}" ${r === state.role ? 'selected' : ''}>${t('role.' + r)}</option>`).join('')}
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn btn-sm" onclick="clearFilters()">${t('filter.clear')}</button>
          <a href="#/new?type=${state.type}" class="btn btn-sm btn-primary">${t('nav.new')}</a>
        </div>
      </div>
      <div class="issue-list">
    `
    let displayIssues = state.issues
    if (state.search) {
      const q = state.search.toLowerCase()
      displayIssues = displayIssues.filter(i => i.title.toLowerCase().includes(q) || (i.body || '').toLowerCase().includes(q))
    }
    if (displayIssues.length === 0) {
      html += `<p style="text-align:center;padding:48px;color:var(--text-secondary)">${t('common.noResults')}</p>`
    } else {
      for (const issue of displayIssues) {
        const labels = issue.labels.map(l => l.name || l)
        const summary = (issue.body || '').replace(/^\*\*.*?\*\*:\s*[^\n]+\n\n---\n\n/, '').slice(0, 150)
        html += `
          <div class="issue-card" onclick="location.hash='#/issue/${issue.number}'">
            <h3>${escapeHtml(issue.title)}</h3>
            <div class="meta">
              <span>#${issue.number}</span>
              <span>${t('common.postedBy')} ${issue.user.login}</span>
              <span>${t('common.updated')} ${formatDate(issue.updated_at)}</span>
            </div>
            <div class="tags">
              ${labels.filter(l => !l.startsWith('type-')).map(l => {
                let display = l
                if (l.startsWith('role-')) display = t('role.' + l.replace('role-', ''))
                else if (l.startsWith('country-')) display = t('country.' + l.replace('country-', ''))
                else if (l.startsWith('city-')) display = t('city.' + l.replace('city-', ''))
                else if (l.startsWith('status-')) display = t('status.' + l.replace('status-', ''))
                else if (l === 'reviewed') display = t('common.reviewed')
                else if (l === 'spam') display = t('common.spam')
                return `<span class="tag ${l.replace(/[^a-z0-9-]/g, '')}">${display}</span>`
              }).join('')}
            </div>
            ${summary ? `<div class="summary">${escapeHtml(summary)}${summary.length >= 150 ? '...' : ''}</div>` : ''}
          </div>
        `
      }
      if (!state.search && issues.length >= 30) {
        html += `<div style="text-align:center;padding:24px"><button class="btn" onclick="loadMore()">${t('common.loadMore')}</button></div>`
      }
    }
    html += '</div>'
    showContent(html)
  } catch (e) {
    showContent(`<p style="text-align:center;padding:48px;color:var(--danger)">${t('common.error')}: ${e.message}</p>`)
  }
  showLoading(false)
}

function onFilterChange() {
  state.country = qs('#filter-country').value
  state.city = qs('#filter-city').value
  state.role = qs('#filter-role').value
  state.page = 1
  router()
}

function clearFilters() {
  state.country = ''; state.city = ''; state.role = ''; state.search = ''; state.page = 1
  router()
}

function onSearchKeyup(e) {
  if (e.key === 'Enter') {
    state.search = qs('#filter-search').value.trim()
    state.page = 1
    router()
  }
}

function loadMore() {
  state.page++
  renderList(true)
}

// --- Post Form ---
async function renderPostForm() {
  showLoading(true)
  const params = new URLSearchParams(location.hash.split('?')[1] || '')
  const presetType = params.get('type') || state.type
  const countries = Object.keys(countryLang)
  const citiesList = state.country ? (cities[state.country] || []) : []

  const html = `
    <div class="form">
      <h2>${t('post.title')}</h2>
      <div class="form-group">
        <label>${t('post.type')}</label>
        <select id="post-type">
          <option value="resume" ${presetType === 'resume' ? 'selected' : ''}>${t('post.resume')}</option>
          <option value="job" ${presetType === 'job' ? 'selected' : ''}>${t('post.job')}</option>
        </select>
      </div>
      <div class="form-group">
        <label>${t('post.country')}</label>
        <select id="post-country" onchange="onPostCountryChange()">
          <option value="">${t('common.pleaseSelect')}</option>
          ${countries.map(c => `<option value="${c}">${t('country.' + c)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>${t('post.city')}</label>
        <select id="post-city">
          <option value="">${t('common.pleaseSelect')}</option>
        </select>
      </div>
      <div class="form-group">
        <label>${t('post.role')}</label>
        <select id="post-role">
          <option value="">${t('common.pleaseSelect')}</option>
          ${roles.map(r => `<option value="${r}">${t('role.' + r)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>${t('post.titleLabel')}</label>
        <input id="post-title" type="text" placeholder="${t('post.titlePlaceholder')}">
      </div>
      <div class="form-group">
        <label>${t('post.salary')}</label>
        <input id="post-salary" type="text" placeholder="${t('post.salaryPlaceholder')}">
        <div class="form-hint">${t('post.salaryHint')}</div>
      </div>
      <div class="form-group">
        <label>${t('post.description')}</label>
        <textarea id="post-body" placeholder="${t('post.placeholder')}"></textarea>
        <div class="form-hint">${t('common.markdown')}</div>
      </div>
      <div class="form-group">
        <label>${t('post.email')}</label>
        <input id="post-email" type="email" placeholder="${t('post.emailPlaceholder')}">
        <div class="form-hint" style="color:var(--danger)">${t('common.emailPublic')}</div>
      </div>
      <div class="form-actions">
        <button class="btn" onclick="history.back()">${t('common.cancel')}</button>
        <button class="btn btn-primary" onclick="submitPost()">${t('post.submit')}</button>
      </div>
    </div>
  `
  showContent(html)
  showLoading(false)
}

function onPostCountryChange() {
  const country = qs('#post-country').value
  const citySelect = qs('#post-city')
  const citiesList = cities[country] || []
  citySelect.innerHTML = `<option value="">${t('common.pleaseSelect')}</option>` + citiesList.map(c => `<option value="${c}">${t('city.' + c)}</option>`).join('')
  // Auto-switch language based on country
  if (countryLang[country]) {
    state.lang = countryLang[country]
    qs('#lang-select').value = state.lang
    applyI18n()
  }
}

async function submitPost() {
  const type = qs('#post-type').value
  const country = qs('#post-country').value
  const city = qs('#post-city').value
  const role = qs('#post-role').value
  const title = qs('#post-title').value.trim()
  const salary = qs('#post-salary').value.trim()
  const body = qs('#post-body').value.trim()
  const email = qs('#post-email').value.trim()

  if (!country || !city || !title || !body || !email) {
    alert(t('common.error') + ': ' + t('common.pleaseSelect'))
    return
  }

  const labels = [`type-${type}`, `country-${country}`, `city-${city}`, `status-open`]
  if (role) labels.push(`role-${role}`)

  const salaryLine = salary ? `**${t('post.salary')}:** ${salary}\n` : ''
  const issueBody = `${salaryLine}**${t('post.email')}:** ${email}\n\n---\n\n${body}`

  try {
    showLoading(true)
    await createIssue({ title, body: issueBody, labels })
    showContent(`<div style="text-align:center;padding:48px"><h2>${t('post.success')}</h2><p style="margin-top:12px"><a href="#/${type}s">← ${t('nav.resumes')}</a></p></div>`)
  } catch (e) {
    const msg = e.message === 'Requires authentication' ? t('auth.requireLogin') : e.message
    alert(`${t('common.error')}: ${msg}`)
  }
  showLoading(false)
}

// --- My Posts ---
async function renderMyPosts() {
  if (!state.user) { showContent(`<div class="auth-box"><h2>${t('nav.login')}</h2><p>${t('auth.loginDesc')}</p><button class="btn btn-primary" onclick="startDeviceFlow()">${t('auth.loginButton')}</button></div>`); showLoading(false); return }

  showLoading(true)
  try {
    const issues = await gh(`/repos/${CONFIG.owner}/${CONFIG.repo}/issues?state=all&per_page=100&creator=${state.user.login}`)
    let html = `<h2 style="margin-bottom:16px">${t('my.title')}</h2>`
    if (issues.length === 0) {
      html += `<p style="text-align:center;padding:48px;color:var(--text-secondary)">${t('my.empty')}</p>`
    } else {
      html += `<div class="my-list">`
      for (const issue of issues) {
        const labels = issue.labels.map(l => l.name || l)
        const isOpen = issue.state === 'open'
        html += `
          <div class="my-item">
            <div class="info">
              <h3><a href="#/issue/${issue.number}">${escapeHtml(issue.title)}</a></h3>
              <div class="meta">#${issue.number} · ${isOpen ? t('status.open') : t('status.closed')} · ${formatDate(issue.updated_at)}</div>
            </div>
            <div class="actions">
              <button class="btn btn-sm" onclick="editMyIssue(${issue.number})">${t('my.edit')}</button>
              <button class="btn btn-sm ${isOpen ? 'btn-danger' : ''}" onclick="toggleIssue(${issue.number}, ${!isOpen})">${isOpen ? t('my.close') : t('my.reopen')}</button>
            </div>
          </div>
        `
      }
    }
    showContent(html)
  } catch (e) {
    showContent(`<p style="text-align:center;padding:48px;color:var(--danger)">${t('common.error')}: ${e.message}</p>`)
  }
  showLoading(false)
}

async function editMyIssue(number) {
  const issue = await getIssue(number)
  const labels = issue.labels.map(l => l.name || l)
  const body = issue.body || ''
  const salaryMatch = body.match(/\*\*.*?(?:Salary|薪资|給与|Gehalt|Salaire|Зарплата|급여).*?\*\*:\s*([^\n]+)/i)
  const existingSalary = salaryMatch ? salaryMatch[1].trim() : ''
  const emailMatch = body.match(/\*\*.*?(?:Email|邮箱|メール|E-Mail|Email|Электронная|이메일).*?\*\*:\s*([^\n]+)/i)
  const existingEmail = emailMatch ? emailMatch[1].trim() : ''
  const existingBody = emailMatch ? body.replace(/^\*\*.*?\*\*:\s*[^\n]+\n(?:\*\*.*?\*\*:\s*[^\n]+\n)?\n---\n\n/, '') : body

  const type = (labels.find(l => l.startsWith('type-')) || '').replace('type-', '') || 'resume'
  const country = (labels.find(l => l.startsWith('country-')) || '').replace('country-', '')
  const city = (labels.find(l => l.startsWith('city-')) || '').replace('city-', '')
  const role = (labels.find(l => l.startsWith('role-')) || '').replace('role-', '')
  const countries = Object.keys(countryLang)
  const citiesList = country ? (cities[country] || []) : []

  openModal(`
    <h2>${t('my.edit')} #${number}</h2>
    <div class="form-group">
      <label>${t('post.type')}</label>
      <select id="edit-type">
        <option value="resume" ${type === 'resume' ? 'selected' : ''}>${t('post.resume')}</option>
        <option value="job" ${type === 'job' ? 'selected' : ''}>${t('post.job')}</option>
      </select>
    </div>
    <div class="form-group">
      <label>${t('post.country')}</label>
      <input id="edit-country" value="${t('country.' + country)}" disabled style="background:var(--bg-secondary)">
      <input id="edit-country-val" type="hidden" value="${country}">
    </div>
    <div class="form-group">
      <label>${t('post.role')}</label>
      <input id="edit-role" value="${t('role.' + role)}" disabled style="background:var(--bg-secondary)">
      <input id="edit-role-val" type="hidden" value="${role}">
    </div>
    <div class="form-group">
      <label>${t('post.titleLabel')}</label>
      <input id="edit-title" value="${escapeHtml(issue.title)}">
    </div>
    <div class="form-group">
      <label>${t('post.salary')}</label>
      <input id="edit-salary" value="${escapeHtml(existingSalary)}">
    </div>
    <div class="form-group">
      <label>${t('post.description')}</label>
      <textarea id="edit-body">${escapeHtml(existingBody)}</textarea>
      <div class="form-hint">${t('common.markdown')}</div>
    </div>
    <div class="form-group">
      <label>${t('post.email')}</label>
      <input id="edit-email" type="email" value="${escapeHtml(existingEmail)}">
      <div class="form-hint" style="color:var(--danger)">${t('common.emailPublic')}</div>
    </div>
    <div class="form-actions">
      <button class="btn" onclick="closeModal()">${t('common.cancel')}</button>
      <button class="btn btn-primary" onclick="saveEdit(${number})">${t('common.save')}</button>
    </div>
  `)
}

async function saveEdit(number) {
  const title = qs('#edit-title').value.trim()
  const salary = qs('#edit-salary').value.trim()
  const email = qs('#edit-email').value.trim()
  const body = qs('#edit-body').value.trim()
  const type = qs('#edit-type').value
  const country = qs('#edit-country-val').value
  const role = qs('#edit-role-val').value
  if (!title || !body) return

  const labels = [`type-${type}`, `status-open`]
  if (country) labels.push(`country-${country}`)
  if (role) labels.push(`role-${role}`)

  const salaryLine = salary ? `**${t('post.salary')}:** ${salary}\n` : ''
  try {
    showLoading(true)
    await updateIssue(number, { title, body: `${salaryLine}**${t('post.email')}:** ${email}\n\n---\n\n${body}`, labels })
    closeModal()
    if (location.hash.startsWith('#/issue/')) location.hash = `#/issue/${number}`
    else renderMyPosts()
  } catch (e) { alert(`${t('common.error')}: ${e.message}`) }
  showLoading(false)
}

async function toggleIssue(number, open) {
  try {
    showLoading(true)
    await updateIssue(number, { state: open ? 'open' : 'closed' })
    renderMyPosts()
  } catch (e) { alert(`${t('common.error')}: ${e.message}`) }
  showLoading(false)
}

async function deleteIssue(number) {
  if (!confirm(t('my.confirmDelete'))) return
  try {
    showLoading(true)
    await updateIssue(number, { state: 'closed' })
    location.hash = '#/my'
  } catch (e) { alert(`${t('common.error')}: ${e.message}`) }
  showLoading(false)
}

// --- Detail View ---
async function renderDetail(number) {
  showLoading(true)
  try {
    const issue = await getIssue(number)
    const labels = issue.labels.map(l => l.name || l)
    const isResume = labels.includes('type-resume')
    const html = `
      <div class="detail">
        <div class="tags">
          ${labels.map(l => {
            let display = l
            if (l.startsWith('role-')) display = t('role.' + l.replace('role-', ''))
            else if (l.startsWith('country-')) display = t('country.' + l.replace('country-', ''))
            else if (l.startsWith('city-')) display = t('city.' + l.replace('city-', ''))
            else if (l.startsWith('type-')) display = t('post.' + l.replace('type-', ''))
            else if (l.startsWith('status-')) display = t('status.' + l.replace('status-', ''))
            else if (l === 'reviewed') display = t('common.reviewed')
            else if (l === 'spam') display = t('common.spam')
            return `<span class="tag ${l.replace(/[^a-z0-9-]/g, '')}">${display}</span>`
          }).join('')}
        </div>
        <h2>${escapeHtml(issue.title)}</h2>
        <div class="meta">
          #${issue.number} · ${t('common.postedBy')} <a href="${issue.user.html_url}" target="_blank">${issue.user.login}</a>
          · ${t('common.updated')} ${formatDate(issue.updated_at)}
          · ${issue.state === 'open' ? t('status.open') : t('status.closed')}
        </div>
        <div class="body">${renderMarkdown(issue.body || '')}</div>
        <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
          ${state.token && state.user && issue.user.login === state.user.login ? `
            <button class="btn btn-sm" onclick="editMyIssue(${number})">${t('my.edit')}</button>
            <button class="btn btn-sm" onclick="toggleIssue(${number}, ${issue.state === 'open' ? false : true}); location.reload()">${issue.state === 'open' ? t('my.close') : t('my.reopen')}</button>
            <button class="btn btn-sm btn-danger" onclick="deleteIssue(${number})">${t('my.delete')}</button>
          ` : ''}
          ${state.token && state.user && issue.user.login !== state.user.login ? `
            <button class="btn btn-primary" onclick="${isResume ? `showInviteForm(${number})` : `showApplyForm(${number})`}">${isResume ? t('detail.invite') : t('detail.apply')}</button>
          ` : ''}
        </div>
        <div style="margin-top:16px"><a href="#/${isResume ? 'resumes' : 'jobs'}" class="btn">← ${isResume ? t('nav.resumes') : t('nav.jobs')}</a></div>
      </div>
    `
    showContent(html)
  } catch (e) {
    showContent(`<p style="text-align:center;padding:48px;color:var(--danger)">${t('common.error')}: ${e.message}</p>`)
  }
  showLoading(false)
}

function showInviteForm(issueNumber) {
  openModal(`
    <h2>${t('detail.invite')}</h2>
    <div class="form-group">
      <label>${t('invite.yourInfo')}</label>
      <input id="invite-name" placeholder="Your name / Company">
    </div>
    <div class="form-group">
      <label>${t('invite.message')}</label>
      <textarea id="invite-msg" rows="4" placeholder="Write your invitation message..."></textarea>
    </div>
    <div class="form-actions">
      <button class="btn" onclick="closeModal()">${t('common.cancel')}</button>
      <button class="btn btn-primary" onclick="sendInvite(${issueNumber})">${t('invite.send')}</button>
    </div>
  `)
}

async function sendInvite(issueNumber) {
  const name = qs('#invite-name').value.trim()
  const msg = qs('#invite-msg').value.trim()
  if (!name || !msg) return alert(t('common.pleaseSelect'))

  try {
    showLoading(true)
    await createIssue({
      title: `Interview Invitation for #${issueNumber}`,
      body: `**From:** ${name}\n**Target Issue:** #${issueNumber}\n\n${msg}`,
      labels: ['action/send-email']
    })
    closeModal()
    alert(t('detail.inviteSent'))
  } catch (e) { alert(`${t('common.error')}: ${e.message}`) }
  showLoading(false)
}

function showApplyForm(issueNumber) {
  openModal(`
    <h2>${t('detail.apply')}</h2>
    <div class="form-group">
      <label>${t('invite.yourInfo')}</label>
      <input id="apply-name" placeholder="${t('invite.yourInfo')}">
    </div>
    <div class="form-group">
      <label>${t('invite.message')}</label>
      <textarea id="apply-msg" rows="4" placeholder="${t('detail.applyPlaceholder')}"></textarea>
    </div>
    <div class="form-actions">
      <button class="btn" onclick="closeModal()">${t('common.cancel')}</button>
      <button class="btn btn-primary" onclick="sendApply(${issueNumber})">${t('detail.applySend')}</button>
    </div>
  `)
}

async function sendApply(issueNumber) {
  const name = qs('#apply-name').value.trim()
  const msg = qs('#apply-msg').value.trim()
  if (!name || !msg) return alert(t('common.pleaseSelect'))

  try {
    showLoading(true)
    await createIssue({
      title: `Application for #${issueNumber}`,
      body: `**From:** ${name}\n**Target Issue:** #${issueNumber}\n\n${msg}`,
      labels: ['action/send-email']
    })
    closeModal()
    alert(t('detail.applySent'))
  } catch (e) { alert(`${t('common.error')}: ${e.message}`) }
  showLoading(false)
}

function renderAbout() {
  showLoading(false)
  showContent(`
    <div class="about" style="max-width:720px;margin:0 auto;padding:48px 16px">
      <h1 style="margin-bottom:8px">${t('about.title')}</h1>
      <p style="color:var(--text-secondary);font-size:var(--fs-lg);margin-bottom:32px">${t('about.subtitle')}</p>

      <h2>${t('about.whyTitle')}</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0 32px">
        <thead><tr style="border-bottom:2px solid var(--border)">
          <th style="text-align:left;padding:8px"></th>
          <th style="text-align:left;padding:8px">${t('about.traditional')}</th>
          <th style="text-align:left;padding:8px">${t('about.openjobs')}</th>
        </tr></thead>
        <tbody>
          <tr style="border-bottom:1px solid var(--border)"><td style="padding:8px">${t('about.cost')}</td><td style="padding:8px">$200+/mo</td><td style="padding:8px"><strong>$0</strong></td></tr>
          <tr style="border-bottom:1px solid var(--border)"><td style="padding:8px">${t('about.infra')}</td><td style="padding:8px">Servers, DBs, CDN</td><td style="padding:8px"><strong>GitHub Pages</strong></td></tr>
          <tr style="border-bottom:1px solid var(--border)"><td style="padding:8px">${t('about.data')}</td><td style="padding:8px">Private DB</td><td style="padding:8px"><strong>GitHub Issues</strong></td></tr>
          <tr style="border-bottom:1px solid var(--border)"><td style="padding:8px">${t('about.auth')}</td><td style="padding:8px">Email/Password</td><td style="padding:8px"><strong>GitHub OAuth</strong></td></tr>
          <tr><td style="padding:8px">${t('about.moderation')}</td><td style="padding:8px">Black box</td><td style="padding:8px"><strong>GitHub Actions</strong></td></tr>
        </tbody>
      </table>

      <h2>${t('about.featuresTitle')}</h2>
      <ul style="line-height:2;margin:16px 0 32px">
        <li>${t('about.feature1')}</li>
        <li>${t('about.feature2')}</li>
        <li>${t('about.feature3')}</li>
        <li>${t('about.feature4')}</li>
        <li>${t('about.feature5')}</li>
      </ul>

      <h2>${t('about.techTitle')}</h2>
      <ul style="line-height:2;margin:16px 0 32px">
        <li><strong>${t('about.hosting')}</strong> GitHub Pages</li>
        <li><strong>${t('about.database')}</strong> GitHub Issues</li>
        <li><strong>${t('about.automation')}</strong> GitHub Actions</li>
        <li><strong>${t('about.i18n')}</strong> 7 languages</li>
      </ul>

      <p style="margin-top:32px">
        <a href="https://github.com/youvalue/open-jobs" target="_blank" class="btn btn-primary">${t('about.viewOnGitHub')}</a>
      </p>
    </div>
  `)
}

// ponytail: simple regex-based markdown, no lib. Upgrade to marked.js if formatting needs grow.
function renderMarkdown(md) {
  let html = escapeHtml(md)
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold, italic, strikethrough
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links and images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Unordered list
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Ordered list
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
  return `<p>${html}</p>`
}

// --- Utils ---
function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(state.lang === 'zh' ? 'zh-CN' : state.lang === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// --- Init ---
async function init() {
  // Load config
  await loadConfig()

  // Load saved token
  const savedToken = localStorage.getItem('gh_token')
  if (savedToken) { state.token = savedToken; await fetchUser() }

  // Load saved language
  state.lang = localStorage.getItem('lang') || navigator.language.slice(0, 2) || 'en'
  if (!['en', 'zh', 'ja', 'fr', 'ru', 'de', 'ko'].includes(state.lang)) state.lang = 'en'

  // Load locale
  await loadLocale(state.lang)

  // Populate language selector
  const langSelect = qs('#lang-select')
  langSelect.innerHTML = `
    <option value="en">English</option>
    <option value="zh">中文</option>
    <option value="ja">日本語</option>
    <option value="fr">Français</option>
    <option value="ru">Русский</option>
    <option value="de">Deutsch</option>
    <option value="ko">한국어</option>
  `
  langSelect.value = state.lang
  langSelect.addEventListener('change', () => {
    state.lang = langSelect.value
    localStorage.setItem('lang', state.lang)
    loadLocale(state.lang).then(() => { applyI18n(); renderAuth(); router() })
  })

  applyI18n()
  renderAuth()

  // Listen for hash changes
  window.addEventListener('hashchange', router)

  // Initial route
  router()
}

document.addEventListener('DOMContentLoaded', init)
