/* ============================================================
   WIELERMANAGER 2025 — app.js
   Team: Wout van Aerts
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════
   1. CONSTANTS
══════════════════════════════════════════════ */

const WORLD_TEAMS = [
    'Alpecin-Premier Tech', 'Bahrain - Victorious', 'Decathlon CMA CGM Team',
    'EF Education - EasyPost', 'Groupama - FDJ United', 'INEOS Grenadiers',
    'Lidl - Trek', 'Lotto Intermarché', 'Movistar Team', 'NSN Cycling Team',
    'Red Bull - BORA - hansgrohe', 'Soudal Quick-Step', 'Team Jayco AlUla',
    'Team Picnic PostNL', 'Team Visma | Lease a Bike', 'UAE Team Emirates - XRG',
    'Uno-X Mobility', 'XDS Astana Team',
].sort();

const PRO_TEAMS = [
    'Bardiani CSF 7 Saber', 'Burgos Burpellet BH', 'Caja Rural - Seguros RGA',
    'Cofidis', 'Equipo Kern Pharma', 'Euskaltel - Euskadi', 'MBH Bank CSB Telecom Fort',
    'Modern Adventure Pro Cycling', 'Pinarello Q36.5 Pro Cycling Team',
    'Solution Tech NIPPO Rali', 'Team Flanders - Baloise', 'Team Novo Nordisk',
    'Team Polti VisitMalta', 'TotalEnergies', 'Tudor Pro Cycling Team', 'Unibet Rose Rockets',
].sort();

const RACES = [
    { id: 'r01', date: '28 feb', name: 'Omloop Nieuwsblad',       type: 'World Tour' },
    { id: 'r02', date: '1 mrt',  name: 'Kuurne-Brussel-Kuurne',   type: 'Niet-WT' },
    { id: 'r03', date: '3 mrt',  name: 'Samyn Classic',            type: 'Niet-WT' },
    { id: 'r04', date: '7 mrt',  name: 'Strade Bianche',           type: 'World Tour' },
    { id: 'r05', date: '18 mrt', name: 'Nokere Koerse',            type: 'Niet-WT' },
    { id: 'r06', date: '20 mrt', name: 'Bredene Koksijde Classic', type: 'Niet-WT' },
    { id: 'r07', date: '21 mrt', name: 'Milaan-Sanremo',           type: 'Monument' },
    { id: 'r08', date: '25 mrt', name: 'Ronde van Brugge',         type: 'World Tour' },
    { id: 'r09', date: '27 mrt', name: 'E3 Saxo Classic',          type: 'World Tour' },
    { id: 'r10', date: '29 mrt', name: 'In Flanders Fields',       type: 'World Tour' },
    { id: 'r11', date: '1 apr',  name: 'Dwars door Vlaanderen',    type: 'World Tour' },
    { id: 'r12', date: '5 apr',  name: 'Ronde van Vlaanderen',     type: 'Monument' },
    { id: 'r13', date: '8 apr',  name: 'Scheldeprijs',             type: 'Niet-WT' },
    { id: 'r14', date: '12 apr', name: 'Parijs-Roubaix',           type: 'Monument' },
    { id: 'r15', date: '15 apr', name: 'Ronde van Limburg',        type: 'Niet-WT' },
    { id: 'r16', date: '17 apr', name: 'Brabantse Pijl',           type: 'Niet-WT' },
    { id: 'r17', date: '19 apr', name: 'Amstel Gold Race',         type: 'World Tour' },
    { id: 'r18', date: '22 apr', name: 'Waalse Pijl',              type: 'World Tour' },
    { id: 'r19', date: '26 apr', name: 'Luik-Bastenaken-Luik',     type: 'Monument' },
];

const POINTS_TABLE = {
    'Monument':   [125,100, 80, 70, 60, 55, 50, 45, 40, 37, 34, 31, 28, 25, 22, 20, 18, 16, 14, 12, 10,  9,  8,  7,  6,  5,  4,  3,  2,  1],
    'World Tour': [100, 80, 65, 55, 48, 44, 40, 36, 32, 30, 27, 24, 22, 20, 18, 16, 14, 12, 10,  9,  8,  7,  6,  5,  4,  3,  2,  2,  1,  1],
    'Niet-WT':    [ 80, 64, 52, 44, 38, 35, 32, 29, 26, 24, 22, 20, 18, 16, 14, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3,  3,  2,  2,  1,  1],
};

const KOPMAN_BONUS = { 1: 30, 2: 25, 3: 20, 4: 15, 5: 10, 6: 5 };

/* ══════════════════════════════════════════════
   2. STATE
══════════════════════════════════════════════ */

let state = {
    team: [],
    races: {},
    theme: 'dark',
    activeTab: 'dashboard',
    ploegRaceId: RACES[0].id,
    resRaceId:   RACES[0].id,
};

const STORAGE_KEY = 'wielermanager_v1';

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            state.team         = saved.team         || [];
            state.races        = saved.races        || {};
            state.theme        = saved.theme        || 'dark';
            state.ploegRaceId  = saved.ploegRaceId  || RACES[0].id;
            state.resRaceId    = saved.resRaceId    || RACES[0].id;
        }
    } catch (e) {
        console.error('State load error:', e);
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            team:        state.team,
            races:       state.races,
            theme:       state.theme,
            ploegRaceId: state.ploegRaceId,
            resRaceId:   state.resRaceId,
        }));
    } catch (e) {
        console.error('State save error:', e);
    }
}

/* ══════════════════════════════════════════════
   3. UTILITIES
══════════════════════════════════════════════ */

let _idSeed = Date.now();
function generateId() { return 'r' + (++_idSeed).toString(36); }

function getRaceState(raceId) {
    if (!state.races[raceId]) {
        state.races[raceId] = { starters: [], kopman: null, results: {} };
    }
    return state.races[raceId];
}

function getRider(id) { return state.team.find(r => r.id === id); }

function getActiveTeam() { return state.team.filter(r => !r.deleted); }

function escHtml(s) {
    return String(s)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
}

function badgeClass(type) {
    return type === 'Monument' ? 'badge-monument' : type === 'World Tour' ? 'badge-wt' : 'badge-nwt';
}

/* ══════════════════════════════════════════════
   4. POINT CALCULATION
══════════════════════════════════════════════ */

function calcRacePoints(raceId) {
    const race = RACES.find(r => r.id === raceId);
    const rs = state.races[raceId];
    if (!race || !rs || !rs.starters || rs.starters.length === 0) return {};

    const starters = rs.starters;
    const kopman   = rs.kopman;
    const results  = rs.results || {};

    const winnerId  = starters.find(id => parseInt(results[id]) === 1) || null;
    const winnerTeam = winnerId ? getRider(winnerId)?.team ?? null : null;

    const map = {};
    for (const riderId of starters) {
        const rawPlace = results[riderId] || '';
        const valUpper = String(rawPlace).trim().toUpperCase();

        // Als de renner een DNS heeft, of het veld is volledig leeg: 0 punten.
        if (valUpper === 'DNS' || valUpper === '') {
            map[riderId] = 0;
            continue;
        }

        let pts = 0;
        const place = parseInt(rawPlace);

        // Basis punten
        if (Number.isInteger(place) && place >= 1 && place <= 30) {
            pts += POINTS_TABLE[race.type][place - 1] ?? 0;
        }

        // Kopman bonus (alleen top 6)
        if (riderId === kopman && Number.isInteger(place) && place >= 1 && place <= 6) {
            pts += KOPMAN_BONUS[place] ?? 0;
        }

        // Ploegmaat winnaar bonus
        // We weten dat de renner is gestart (want de check op DNS/leeg is al gepasseerd)
        if (winnerTeam && winnerId && riderId !== winnerId) {
            const riderTeam = getRider(riderId)?.team ?? null;
            if (riderTeam && riderTeam === winnerTeam) {
                pts += 10;
            }
        }

        map[riderId] = pts;
    }
    return map;
}

function raceTotal(raceId) {
    return Object.values(calcRacePoints(raceId)).reduce((a, b) => a + b, 0);
}

function grandTotal() {
    return RACES.reduce((sum, r) => sum + raceTotal(r.id), 0);
}

function pointsBreakdown(raceId, riderId) {
    const race    = RACES.find(r => r.id === raceId);
    const rs      = state.races[raceId];
    if (!race || !rs) return null;

    const kopman   = rs.kopman;
    const starters = rs.starters || [];
    const results  = rs.results  || {};

    const rawPlace = results[riderId] || '';
    const valUpper = String(rawPlace).trim().toUpperCase();

    // Bij DNS of leeg veld tonen we sowieso geen breakdown
    if (valUpper === 'DNS' || valUpper === '') return null;

    const place = parseInt(rawPlace);

    let base = 0;
    if (Number.isInteger(place) && place >= 1 && place <= 30) {
        base = POINTS_TABLE[race.type][place - 1] ?? 0;
    }

    const km = (riderId === kopman && Number.isInteger(place) && place >= 1 && place <= 6) ? (KOPMAN_BONUS[place] ?? 0) : 0;

    const winnerId   = starters.find(id => parseInt(results[id]) === 1);
    const winnerTeam = winnerId ? getRider(winnerId)?.team ?? null : null;
    const tw         = (winnerTeam && winnerId && riderId !== winnerId && (getRider(riderId)?.team ?? '') === winnerTeam) ? 10 : 0;

    if (base === 0 && km === 0 && tw === 0) return null;

    const parts = [];
    if (base > 0) parts.push(`${base} basis`);
    if (km > 0)  parts.push(`+${km} kopman`);
    if (tw > 0)  parts.push(`+${tw} ploegmaat`);

    if (parts.length === 1 && parts[0].startsWith('+')) {
        parts[0] = parts[0].substring(1);
    }

    return { total: base + km + tw, label: parts.join(' · ') };
}

/* ══════════════════════════════════════════════
   5. VALIDATION
══════════════════════════════════════════════ */

function canAddRider(name, team) {
    const activeTeam = getActiveTeam();
    if (!name.trim())  return { ok: false, msg: 'Naam is verplicht.' };
    if (!team)         return { ok: false, msg: 'Kies een ploeg.' };
    if (activeTeam.length >= 20) return { ok: false, msg: 'Selectie is vol (max. 20 actieve renners).' };
    const cnt = activeTeam.filter(r => r.team === team).length;
    if (cnt >= 4)  return { ok: false, msg: `Maximaal 4 renners van ${team} (${cnt}/4 al in selectie).` };
    return { ok: true };
}

/* ══════════════════════════════════════════════
   6. TOP-LEVEL RENDER
══════════════════════════════════════════════ */

function renderApp() {
    document.documentElement.setAttribute('data-theme', state.theme);
    document.getElementById('total-points').textContent = grandTotal().toLocaleString('nl-BE');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        const active = btn.dataset.tab === state.activeTab;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', String(active));
    });

    document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.toggle('active', p.id === 'tab-' + state.activeTab);
    });

    switch (state.activeTab) {
        case 'dashboard':  renderDashboard();  break;
        case 'ploeg':      renderPloeg();      break;
        case 'resultaten': renderResultaten(); break;
        case 'transfers':  renderTransfers();  break;
    }
}

/* ══════════════════════════════════════════════
   7. DASHBOARD
══════════════════════════════════════════════ */

function renderDashboard() {
    const el    = document.getElementById('tab-dashboard');
    const total = grandTotal();
    const activeTeamCount = getActiveTeam().length;

    const completed = RACES.filter(r => {
        const rs = state.races[r.id];
        return rs?.results && Object.keys(rs.results).length > 0;
    }).length;

    const raceRows = RACES.map(race => {
        const rs       = state.races[race.id];
        const hasRes   = !!(rs?.results && Object.keys(rs.results).length > 0);
        const hasLinup = (rs?.starters?.length ?? 0) === 12;
        const pts      = hasRes ? raceTotal(race.id) : null;
        const bc       = badgeClass(race.type);
        return `
      <tr class="${hasRes ? 'has-results' : ''}">
        <td class="race-date">${escHtml(race.date)}</td>
        <td class="race-name">${escHtml(race.name)}</td>
        <td><span class="badge ${bc}">${escHtml(race.type)}</span></td>
        <td class="center">${hasLinup ? '<span class="check">✓</span>' : '<span class="cross">–</span>'}</td>
        <td class="points-cell">${hasRes ? `<strong>${pts}</strong>` : '<span style="color:var(--text-faint)">–</span>'}</td>
      </tr>`;
    }).join('');

    const riderTotals = {};
    RACES.forEach(r => {
        Object.entries(calcRacePoints(r.id)).forEach(([id, p]) => {
            riderTotals[id] = (riderTotals[id] || 0) + p;
        });
    });
    const topScorers = Object.entries(riderTotals)
        .map(([id, pts]) => ({ rider: getRider(id), pts }))
        .filter(x => x.rider && x.pts > 0)
        .sort((a, b) => b.pts - a.pts)
        .slice(0, 10);

    const scorerRows = topScorers.map((x, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td>
        <strong>${escHtml(x.rider.name)}</strong>
        ${x.rider.deleted ? '<span style="font-size:10px; color:var(--text-faint); margin-left:5px;">(Getransfereerd)</span>' : ''}
      </td>
      <td class="team-cell">${escHtml(x.rider.team)}</td>
      <td class="points-cell"><strong>${x.pts}</strong></td>
    </tr>`).join('');

    el.innerHTML = `
    <div class="dashboard-hero">
      <div class="total-display">
        <span class="total-label">Totaal punten</span>
        <span class="total-big">${total.toLocaleString('nl-BE')}</span>
        <span class="total-unit">pt</span>
      </div>
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-num">${completed}</span>
          <span class="stat-label">Gereden</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">${RACES.length - completed}</span>
          <span class="stat-label">Nog te rijden</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">${activeTeamCount}<span style="font-size:13px;opacity:.5">/20</span></span>
          <span class="stat-label">Actieve Renners</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="card-title">📅 Koersoverzicht</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Koers</th>
              <th>Type</th>
              <th class="center">Opstelling</th>
              <th>Punten</th>
            </tr>
          </thead>
          <tbody>${raceRows}</tbody>
        </table>
      </div>
    </div>

    ${topScorers.length > 0 ? `
    <div class="card">
      <h2 class="card-title">🥇 Top Scorers</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>#</th><th>Renner</th><th>Ploeg</th><th>Punten</th></tr></thead>
          <tbody>${scorerRows}</tbody>
        </table>
      </div>
    </div>` : ''}
  `;
}

/* ══════════════════════════════════════════════
   8. MIJN PLOEG
══════════════════════════════════════════════ */

function renderPloeg() {
    const el     = document.getElementById('tab-ploeg');
    const raceId = state.ploegRaceId;
    const rs     = getRaceState(raceId);
    const starters = rs.starters || [];
    const kopman   = rs.kopman;

    const eligibleRiders = state.team.filter(r => !r.deleted || starters.includes(r.id));
    const bus            = eligibleRiders.filter(r => !starters.includes(r.id));
    const startersData   = starters.map(id => getRider(id)).filter(Boolean);

    const raceOpts = RACES.map(r =>
        `<option value="${r.id}" ${r.id === raceId ? 'selected' : ''}>${r.date} – ${escHtml(r.name)}</option>`
    ).join('');

    const kopmanName = kopman ? (getRider(kopman)?.name ?? '–') : null;
    const starterFull = starters.length === 12;

    function riderCard(rider, isStarter) {
        const isKm = isStarter && rider.id === kopman;
        const deletedTag = rider.deleted ? '<span style="font-size:10px; color:var(--danger); border:1px solid var(--danger); padding:0 3px; border-radius:3px; margin-left:5px;">WEG</span>' : '';

        return `
      <div class="rider-card ${isStarter ? 'is-starter' : ''} ${isKm ? 'is-kopman' : ''}">
        <div class="rider-info">
          <span class="rider-name">${escHtml(rider.name)} ${deletedTag}</span>
          <span class="rider-team">${escHtml(rider.team)}</span>
        </div>
        <div class="rider-actions">
          ${isStarter
            ? `<button class="btn-icon btn-kopman ${isKm ? 'active' : ''}"
                 data-action="kopman" data-id="${rider.id}"
                 title="${isKm ? 'Verwijder als kopman' : 'Stel in als kopman'}">👑</button>`
            : ''}
          <button class="btn-icon ${isStarter ? 'btn-remove' : 'btn-add'}"
            data-action="${isStarter ? 'remove-starter' : 'add-starter'}"
            data-id="${rider.id}"
            title="${isStarter ? 'Naar bus' : 'Maak starter'}"
            ${(!isStarter && starterFull) ? 'disabled' : ''}>
            ${isStarter ? '←' : '→'}
          </button>
        </div>
      </div>`;
    }

    el.innerHTML = `
    <div class="section-header">
      <h2>👥 Opstelling per Koers</h2>
      <select class="select-race" id="ploeg-race-sel">${raceOpts}</select>
    </div>

    <div class="lineup-grid">
      <div class="lineup-col">
        <div class="col-header">
          <h3>🚀 Starters <span class="count-badge ${starterFull ? 'full' : starters.length > 0 ? '' : 'warn'}">${starters.length}/12</span></h3>
          <span class="kopman-label ${kopmanName ? '' : 'warn'}">
            ${kopmanName ? `👑 ${escHtml(kopmanName)}` : 'Geen kopman'}
          </span>
        </div>
        <div class="riders-list" id="starters-list">
          ${startersData.length > 0
        ? startersData.map(r => riderCard(r, true)).join('')
        : '<p class="empty-msg">Klik op → bij een renner om hem als starter in te stellen.</p>'}
        </div>
      </div>

      <div class="lineup-col">
        <div class="col-header">
          <h3>🚌 Bus <span class="count-badge">${bus.length}</span></h3>
          ${starterFull ? '<span style="font-size:11px;color:var(--text-faint)">Starters vol</span>' : ''}
        </div>
        <div class="riders-list" id="bus-list">
          ${bus.length > 0
        ? bus.map(r => riderCard(r, false)).join('')
        : state.team.length === 0
            ? '<p class="empty-msg">Voeg eerst renners toe via het tabblad Transfers.</p>'
            : '<p class="empty-msg">Je hebt momenteel geen renners meer over in de bus.</p>'}
        </div>
      </div>
    </div>

    <div class="save-row">
      <button class="btn-primary" id="save-lineup">💾 Opstelling opslaan</button>
      <button class="btn-secondary" id="copy-lineup">🔄 Vorige opstelling overnemen</button>
      ${starterFull && kopmanName
        ? '<span class="success-msg" style="margin-left: 10px;">✓ Opstelling compleet</span>'
        : starterFull
            ? '<span style="color:var(--kopman);font-size:13px;margin-left:10px;">⚠ Kies nog een kopman</span>'
            : ''}
    </div>
  `;

    el.querySelector('#ploeg-race-sel').addEventListener('change', e => {
        state.ploegRaceId = e.target.value;
        renderPloeg();
    });

    el.querySelector('#save-lineup').addEventListener('click', () => {
        saveState();
        showToast('✓ Opstelling opgeslagen!');
        renderApp();
    });

    el.querySelector('#copy-lineup').addEventListener('click', () => {
        const currentIndex = RACES.findIndex(r => r.id === raceId);
        if (currentIndex > 0) {
            const prevRaceId = RACES[currentIndex - 1].id;
            const prevRs = getRaceState(prevRaceId);
            const currentRs = getRaceState(raceId);

            const activePrevStarters = (prevRs.starters || []).filter(id => {
                const r = getRider(id);
                return r && !r.deleted;
            });

            currentRs.starters = [...activePrevStarters];
            currentRs.kopman = activePrevStarters.includes(prevRs.kopman) ? prevRs.kopman : null;

            renderPloeg();
            showToast('Opstelling overgenomen van ' + RACES[currentIndex - 1].name);
        } else {
            showToast('Dit is de eerste koers, er is geen vorige opstelling.');
        }
    });

    el.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const id     = btn.dataset.id;
            const rs     = getRaceState(raceId);

            if (action === 'add-starter') {
                if (rs.starters.length < 12 && !rs.starters.includes(id)) rs.starters.push(id);
            } else if (action === 'remove-starter') {
                rs.starters = rs.starters.filter(s => s !== id);
                if (rs.kopman === id) rs.kopman = null;
            } else if (action === 'kopman') {
                rs.kopman = (rs.kopman === id) ? null : id;
            }
            renderPloeg();
        });
    });
}

/* ══════════════════════════════════════════════
   9. RESULTATEN
══════════════════════════════════════════════ */

function renderResultaten() {
    const el     = document.getElementById('tab-resultaten');
    const raceId = state.resRaceId;
    const race   = RACES.find(r => r.id === raceId);
    const rs     = getRaceState(raceId);
    const starters = rs.starters || [];
    const kopman   = rs.kopman;

    const raceOpts = RACES.map(r =>
        `<option value="${r.id}" ${r.id === raceId ? 'selected' : ''}>${r.date} – ${escHtml(r.name)}</option>`
    ).join('');

    const bc = badgeClass(race.type);

    if (starters.length !== 12) {
        el.innerHTML = `
      <div class="section-header">
        <h2>🏁 Wedstrijd Resultaten</h2>
        <select class="select-race" id="res-race-sel">${raceOpts}</select>
      </div>
      <div class="empty-state">
        <span class="empty-icon">⚠️</span>
        <p>Stel eerst een opstelling van 12 starters in voor <strong>${escHtml(race.name)}</strong> via het tabblad Mijn Ploeg.</p>
        <button class="btn-primary" id="go-ploeg">Naar Mijn Ploeg →</button>
      </div>`;

        el.querySelector('#res-race-sel').addEventListener('change', e => {
            state.resRaceId = e.target.value;
            renderResultaten();
        });
        el.querySelector('#go-ploeg').addEventListener('click', () => {
            state.activeTab   = 'ploeg';
            state.ploegRaceId = raceId;
            renderApp();
        });
        return;
    }

    function buildRows() {
        const pointsMap = calcRacePoints(raceId);
        const results   = rs.results || {};

        return starters.map(id => {
            const rider = getRider(id);
            if (!rider) return '';
            const place = results[id] || '';
            const pts   = pointsMap[id] ?? 0;
            const isKm  = id === kopman;
            const bd    = pts > 0 ? pointsBreakdown(raceId, id) : null;
            const deletedTag = rider.deleted ? '<span style="font-size:10px; color:var(--text-faint); margin-left:5px;">(Transf)</span>' : '';

            return `
        <tr>
          <td>
            <div class="rider-cell">
              <div class="rider-name-row">
                ${isKm ? '<span class="kopman-tag">👑</span>' : ''}
                <span>${escHtml(rider.name)} ${deletedTag}</span>
              </div>
              <span class="rider-team-small">${escHtml(rider.team)}</span>
            </div>
          </td>
          <td>
            <input type="text" class="place-input"
              value="${escHtml(place)}" placeholder="–"
              data-rider-id="${id}">
          </td>
          <td class="points-cell" data-pts-cell="${id}">
            ${pts > 0 ? `<strong>${pts}</strong>${bd ? `<small class="breakdown">${escHtml(bd.label)}</small>` : ''}` : '<span style="color:var(--text-faint)">–</span>'}
          </td>
        </tr>`;
        }).join('');
    }

    const initialTotal = raceTotal(raceId);

    el.innerHTML = `
    <div class="section-header">
      <h2>🏁 Wedstrijd Resultaten</h2>
      <select class="select-race" id="res-race-sel">${raceOpts}</select>
    </div>

    <div class="race-info-bar">
      <span class="badge ${bc}">${escHtml(race.type)}</span>
      <span class="race-full-name">${escHtml(race.name)} — ${escHtml(race.date)}</span>
      <span class="kopman-info">👑 ${kopman ? escHtml(getRider(kopman)?.name ?? '–') : 'Geen kopman'}</span>
    </div>

    <div class="card" style="padding:0 0 4px;">
      <div class="table-wrap">
        <table class="data-table results-table">
          <thead>
            <tr>
              <th>Renner</th>
              <th>Positie (1–30, DNF, DNS...)</th>
              <th>Punten</th>
            </tr>
          </thead>
          <tbody id="results-tbody">${buildRows()}</tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="2"><strong>TOTAAL KOERS</strong></td>
              <td class="points-cell"><strong id="race-total">${initialTotal}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div class="save-row">
      <button class="btn-primary" id="save-results">💾 Opslaan</button>
      <button class="btn-secondary" id="clear-results">🗑 Wis resultaten</button>
    </div>
  `;

    el.querySelector('#res-race-sel').addEventListener('change', e => {
        state.resRaceId = e.target.value;
        renderResultaten();
    });

    function refreshPointCells() {
        const ptsMap = calcRacePoints(raceId);
        const total  = Object.values(ptsMap).reduce((a, b) => a + b, 0);
        document.getElementById('race-total').textContent = total;
        document.getElementById('total-points').textContent = grandTotal().toLocaleString('nl-BE');

        starters.forEach(id => {
            const cell = el.querySelector(`[data-pts-cell="${id}"]`);
            if (!cell) return;
            const pts  = ptsMap[id] ?? 0;
            const bd   = pts > 0 ? pointsBreakdown(raceId, id) : null;
            cell.innerHTML = pts > 0
                ? `<strong>${pts}</strong>${bd ? `<small class="breakdown">${escHtml(bd.label)}</small>` : ''}`
                : '<span style="color:var(--text-faint)">–</span>';
        });
    }

    el.querySelectorAll('.place-input').forEach(input => {
        input.addEventListener('input', () => {
            const id  = input.dataset.riderId;
            const val = input.value.trim().toUpperCase();
            if (val !== '') {
                rs.results[id] = val;
            } else {
                delete rs.results[id];
            }
            refreshPointCells();
        });
    });

    el.querySelector('#save-results').addEventListener('click', () => {
        el.querySelectorAll('.place-input').forEach(input => {
            const id  = input.dataset.riderId;
            const val = input.value.trim().toUpperCase();
            if (val !== '') {
                rs.results[id] = val;
            } else {
                delete rs.results[id];
            }
        });
        saveState();
        document.getElementById('total-points').textContent = grandTotal().toLocaleString('nl-BE');
        showToast('✓ Resultaten opgeslagen!');
    });

    el.querySelector('#clear-results').addEventListener('click', () => {
        if (!confirm(`Alle resultaten voor ${race.name} wissen?`)) return;
        rs.results = {};
        saveState();
        renderResultaten();
        document.getElementById('total-points').textContent = grandTotal().toLocaleString('nl-BE');
        showToast('Resultaten gewist.');
    });
}

/* ══════════════════════════════════════════════
   10. TRANSFERS
══════════════════════════════════════════════ */

function renderTransfers() {
    const el = document.getElementById('tab-transfers');

    const activeTeam = getActiveTeam();

    const teamCounts = {};
    activeTeam.forEach(r => { teamCounts[r.team] = (teamCounts[r.team] || 0) + 1; });

    const riderRows = activeTeam.length > 0
        ? activeTeam.map(rider => `
        <tr>
          <td><strong>${escHtml(rider.name)}</strong></td>
          <td class="team-cell">${escHtml(rider.team)}</td>
          <td class="center">
            <button class="btn-delete" data-action="delete" data-id="${rider.id}" title="Verwijder renner">✕</button>
          </td>
        </tr>`).join('')
        : `<tr><td colspan="3" class="empty-msg">Nog geen renners in selectie.</td></tr>`;

    const teamCountItems = Object.entries(teamCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([team, n]) => `
      <div class="team-count-item ${n >= 4 ? 'at-max' : ''}">
        <span>${escHtml(team)}</span>
        <span class="count-pill">${n}/4</span>
      </div>`).join('');

    const wtOpts  = WORLD_TEAMS.map(t => `<option value="${t}">${escHtml(t)}</option>`).join('');
    const proOpts = PRO_TEAMS.map(t => `<option value="${t}">${escHtml(t)}</option>`).join('');

    el.innerHTML = `
    <div class="transfers-grid">
      <div>
        <div class="card">
          <h2 class="card-title">
            📋 Actieve Selectie
            <span class="count-badge ${activeTeam.length >= 20 ? 'full' : activeTeam.length > 0 ? '' : 'warn'}">${activeTeam.length}/20</span>
          </h2>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Naam</th><th>Ploeg</th><th class="center">Actie</th></tr></thead>
              <tbody>${riderRows}</tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">➕ Renner toevoegen</h2>
          <div id="add-error" class="error-msg hidden"></div>
          <div class="form-row">
            <input type="text" id="new-name" class="text-input" placeholder="Naam renner" autocomplete="off" maxlength="60" />
            <select id="new-team" class="select-input">
              <option value="">– Kies ploeg –</option>
              <optgroup label="WorldTeams">${wtOpts}</optgroup>
              <optgroup label="ProTeams">${proOpts}</optgroup>
            </select>
            <button class="btn-primary" id="add-rider-btn">+ Toevoegen</button>
          </div>
          <p style="margin-top:10px;font-size:12px;color:var(--text-muted);">
            Max. 20 renners in totaal · Max. 4 renners van dezelfde ploeg · Geen budgetlimiet.
          </p>
        </div>
      </div>

      <div>
        <div class="card">
          <h2 class="card-title">🏷 Per ploeg</h2>
          <div class="team-count-list">
            ${teamCountItems || '<p class="empty-msg">Voeg renners toe om de verdeling te zien.</p>'}
          </div>
        </div>
      </div>
    </div>
  `;

    el.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id    = btn.dataset.id;
            const rider = getRider(id);
            if (!rider) return;
            if (!confirm(`${rider.name} verwijderen (transfereren)?\n\nHij blijft bewaard in de koersen waar je al resultaten hebt ingevoerd, maar verdwijnt uit je team voor alle toekomstige wedstrijden.`)) return;

            rider.deleted = true;

            for (const [rId, rs] of Object.entries(state.races)) {
                const hasResults = rs.results && Object.keys(rs.results).length > 0;
                if (!hasResults) {
                    rs.starters = (rs.starters || []).filter(s => s !== id);
                    if (rs.kopman === id) rs.kopman = null;
                }
            }

            saveState();
            renderTransfers();
            document.getElementById('total-points').textContent = grandTotal().toLocaleString('nl-BE');
            showToast(`${rider.name} verwijderd.`);
        });
    });

    const addRider = () => {
        const name      = document.getElementById('new-name').value.trim();
        const team      = document.getElementById('new-team').value;
        const errorDiv  = document.getElementById('add-error');
        const check     = canAddRider(name, team);

        if (!check.ok) {
            errorDiv.textContent = check.msg;
            errorDiv.classList.remove('hidden');
            return;
        }
        errorDiv.classList.add('hidden');

        state.team.push({ id: generateId(), name, team });
        saveState();
        renderTransfers();
        document.getElementById('total-points').textContent = grandTotal().toLocaleString('nl-BE');
        showToast(`✓ ${name} toegevoegd!`);

        requestAnimationFrame(() => {
            const nameEl = document.getElementById('new-name');
            if (nameEl) nameEl.focus();
        });
    };

    el.querySelector('#add-rider-btn').addEventListener('click', addRider);
    el.querySelector('#new-name').addEventListener('keydown', e => { if (e.key === 'Enter') addRider(); });
}

/* ══════════════════════════════════════════════
   11. TOAST
══════════════════════════════════════════════ */

let _toastTimer = null;

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ══════════════════════════════════════════════
   12. INITIALISATION
══════════════════════════════════════════════ */

function init() {
    loadState();

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.activeTab = btn.dataset.tab;
            renderApp();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    document.getElementById('theme-toggle').addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        saveState();
        document.documentElement.setAttribute('data-theme', state.theme);
    });

    renderApp();
}

document.addEventListener('DOMContentLoaded', init);