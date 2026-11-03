/**
 * MarksheetView.js
 * MVC - View Layer: Mobile-First & Desktop Marksheet Manager.
 * Designed for 150+ Students, Instant Search/Filter, Bulk Rapid Ingestion,
 * Official SKIMVB Mark Sheet Format (Samastha Kerala Islam Matha Vidyabhyasa Board),
 * Attendance (ഹാജർ) Column, and Real-Time Supabase Cloud Sync.
 */

class MarksheetView {
    constructor() {
        this.container = document.getElementById('app-root');
        this.activeTab = 'boys'; // 'boys' | 'girls' | 'all' | 'analytics'
        this.viewMode = 'table'; // 'table' | 'cards'
        this.currentClass = null;
        this.searchQuery = '';
    }

    render(cls, activeTab = null) {
        this.currentClass = cls;
        if (activeTab) this.activeTab = activeTab;

        const students = cls.students || [];
        const topics = cls.topics || [];
        const boys = students.filter(s => s.gender === 'boy');
        const girls = students.filter(s => s.gender === 'girl');

        const stats = window.marksheetModel.calculateStats(cls);
        const isCloudConfigured = window.supabaseModel && window.supabaseModel.isConfigured();

        this.container.innerHTML = `
            <div class="app-layout mobile-optimized">
                <!-- Top Breadcrumb & Navbar -->
                <header class="navbar marksheet-navbar">
                    <div class="nav-left">
                        <button class="btn btn-ghost btn-sm" id="btn-back-dashboard" title="ക്ലാസുകൾ">
                            ← <span class="hide-mobile">ക്ലാസുകൾ</span>
                        </button>
                        <div class="nav-class-info">
                            <span class="nav-madrasa-sub">${cls.madrasaName || 'മദ്റസ'}${cls.place ? ` • ${cls.place}` : ''}${cls.skimvbRegNo ? ` (Reg: ${cls.skimvbRegNo})` : ''}</span>
                            <h3 class="nav-class-main-title">${cls.className} • ${cls.term || cls.examName || 'പരീക്ഷ'}</h3>
                        </div>
                    </div>
                    <div class="nav-actions">
                        <!-- Cloud / Autosave Status Badge -->
                        <div class="autosave-badge hide-mobile" id="autosave-status">
                            <span class="save-dot ${isCloudConfigured ? 'cloud-active' : ''}"></span>
                            <span id="autosave-text">${isCloudConfigured ? 'Supabase ക്ലൗഡ്' : 'സേവ് ആയി'}</span>
                        </div>

                        <!-- 150+ Bulk Add Button -->
                        <button class="btn btn-outline btn-sm btn-action-bulk hide-mobile" id="btn-bulk-add-nav" title="150+ കുട്ടികളെ ചേർക്കുക">
                            <span>+ കൂട്ടമായി ചേർക്കുക</span>
                        </button>

                        <!-- 1-Click Excel Import -->
                        <button class="btn btn-outline btn-sm btn-action-excel" id="btn-import-excel" title="Excel ഇംപോർട്ട്">
                            <span class="action-btn-text">Excel</span>
                        </button>

                        <!-- Gemini Flash AI Photo Scan -->
                        <button class="btn btn-outline btn-sm btn-action-ai hide-mobile" id="btn-scan-gemini" title="AI സ്കാൻ">
                            <span class="action-btn-text">AI സ്കാൻ</span>
                        </button>

                        <!-- Print Button -->
                        <button class="btn btn-primary btn-sm btn-print" id="btn-print-nav" title="SKIMVB മാർക്ക് ലിസ്റ്റ് പ്രിന്റ് ചെയ്യുക">
                            പ്രിന്റ്
                        </button>

                        <!-- Export buttons -->
                        <button class="btn btn-outline btn-sm hide-mobile" id="btn-export-excel" title="Excel ഡൗൺലോഡ്">
                            Excel
                        </button>
                        <button class="btn btn-outline btn-sm hide-mobile" id="btn-export-pdf" title="PDF ഡൗൺലോഡ്">
                            PDF
                        </button>
                    </div>
                </header>

                <main class="main-content marksheet-content">
                    <!-- Class Details & Action Toolbar -->
                    <div class="marksheet-toolbar">
                        <div class="toolbar-left">
                            <!-- Sheets Tabs -->
                            <div class="sheet-tabs scrollable-tabs">
                                <button class="sheet-tab ${this.activeTab === 'boys' ? 'active' : ''}" data-tab="boys">
                                    ആൺകുട്ടികൾ <span class="tab-badge">${boys.length}</span>
                                </button>
                                <button class="sheet-tab ${this.activeTab === 'girls' ? 'active' : ''}" data-tab="girls">
                                    പെൺകുട്ടികൾ <span class="tab-badge">${girls.length}</span>
                                </button>
                                <button class="sheet-tab ${this.activeTab === 'all' ? 'active' : ''}" data-tab="all">
                                    എല്ലാവരും <span class="tab-badge">${students.length}</span>
                                </button>
                                <button class="sheet-tab ${this.activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
                                    റിസൾട്ട്
                                </button>
                            </div>
                        </div>

                        <div class="toolbar-right">
                            <!-- View Switcher -->
                            <div class="view-mode-toggle" id="view-mode-group">
                                <button type="button" class="btn-toggle ${this.viewMode === 'table' ? 'active' : ''}" id="btn-mode-table" title="പട്ടിക">
                                    <span class="toggle-text">പട്ടിക</span>
                                </button>
                                <button type="button" class="btn-toggle ${this.viewMode === 'cards' ? 'active' : ''}" id="btn-mode-cards" title="കാർഡുകൾ">
                                    <span class="toggle-text">കാർഡുകൾ</span>
                                </button>
                            </div>

                            <button class="btn btn-outline btn-sm" id="btn-manage-topics">
                                വിഷയങ്ങൾ (${topics.length})
                            </button>
                            <button class="btn btn-primary btn-sm" id="btn-add-student">
                                + പുതിയ കുട്ടി
                            </button>
                        </div>
                    </div>

                    <!-- Fast Instant Search & Filter Bar for 150+ Students -->
                    ${this.activeTab !== 'analytics' ? `
                        <div class="student-search-bar-wrap">
                            <div class="search-input-box">
                                <span class="search-icon">🔍</span>
                                <input 
                                    type="text" 
                                    id="search-students-input" 
                                    class="form-control form-control-sm search-student-field" 
                                    placeholder="വിദ്യാർത്ഥിയെ തിരയുക (പേര് അല്ലെങ്കിൽ റോൾ നമ്പർ)..."
                                    value="${this.searchQuery}"
                                    autocomplete="off"
                                >
                                ${this.searchQuery ? `<button class="btn-clear-search" id="btn-clear-search">&times;</button>` : ''}
                            </div>
                            <div class="search-quick-stats font-xs text-muted">
                                ആകെ: <strong>${students.length}</strong> കുട്ടികൾ
                            </div>
                        </div>
                    ` : ''}

                    <!-- Active Tab Content -->
                    <div class="sheet-content-wrapper">
                        ${this.activeTab === 'analytics' 
                            ? this._renderAnalyticsTab(stats, cls) 
                            : (this.viewMode === 'cards' 
                                ? this._renderCardsView(cls, stats) 
                                : this._renderSheetTable(cls, stats))}
                    </div>
                </main>

                <!-- Mobile Floating / Bottom Action Bar -->
                <nav class="mobile-bottom-bar show-mobile-only">
                    <button class="mobile-bar-btn" id="m-btn-print" title="പ്രിന്റ്">
                        <span class="m-label font-bold">പ്രിന്റ്</span>
                    </button>
                    <button class="mobile-bar-btn" id="m-btn-bulk" title="150+ കുട്ടികൾ">
                        <span class="m-label">+ കൂട്ടമായി</span>
                    </button>
                    <button class="mobile-bar-btn" id="m-btn-excel" title="Excel">
                        <span class="m-label">Excel</span>
                    </button>
                    <button class="mobile-bar-btn active-highlight" id="m-btn-add-student" title="വിദ്യാർത്ഥിയെ ചേർക്കുക">
                        <span class="m-label">+ കുട്ടി</span>
                    </button>
                    <button class="mobile-bar-btn" id="m-btn-toggle-view" title="കാഴ്ച്ച മാറ്റുക">
                        <span class="m-label">${this.viewMode === 'cards' ? 'പട്ടിക' : 'കാർഡ്'}</span>
                    </button>
                    <button class="mobile-bar-btn" id="m-btn-pdf" title="PDF">
                        <span class="m-label">PDF</span>
                    </button>
                </nav>
            </div>

            <!-- Modals Container -->
            <div id="modal-container"></div>
        `;

        this._bindEvents();
    }

    _getStudentsToDisplay(cls, stats) {
        let studentsToDisplay = [];
        let sheetResults = [];

        if (this.activeTab === 'boys') {
            studentsToDisplay = (cls.students || []).filter(s => s.gender === 'boy');
            sheetResults = stats.boysResults;
        } else if (this.activeTab === 'girls') {
            studentsToDisplay = (cls.students || []).filter(s => s.gender === 'girl');
            sheetResults = stats.girlsResults;
        } else {
            studentsToDisplay = cls.students || [];
            sheetResults = stats.allResults;
        }

        // Apply instant search filter if query entered
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase().trim();
            studentsToDisplay = studentsToDisplay.filter(s => 
                (s.name && s.name.toLowerCase().includes(q)) || 
                (s.rollNo && s.rollNo.toString().includes(q))
            );
        }

        return { studentsToDisplay, sheetResults };
    }

    _renderSheetTable(cls, stats) {
        const topics = cls.topics || [];
        const { studentsToDisplay, sheetResults } = this._getStudentsToDisplay(cls, stats);

        if (studentsToDisplay.length === 0 && !this.searchQuery) {
            return this._renderEmptyState();
        }

        const resultMap = {};
        sheetResults.forEach(r => { resultMap[r.student.id] = r; });

        let sheetTitle = 'എല്ലാ വിദ്യാർത്ഥികളുടെയും മാർക്ക് ലിസ്റ്റ് (All Students)';
        if (this.activeTab === 'boys') sheetTitle = 'ആൺകുട്ടികളുടെ മാർക്ക് ലിസ്റ്റ് (Boys Mark List)';
        else if (this.activeTab === 'girls') sheetTitle = 'പെൺകുട്ടികളുടെ മാർക്ക് ലിസ്റ്റ് (Girls Mark List)';

        return `
            <!-- Print-Only Header Block: Exact SKIMVB (Samastha) Design -->
            <div class="print-only-header print-skimvb-box">
                <div class="skimvb-header-row-1">
                    <div class="skimvb-item-madrasa">
                        <span class="skimvb-label">മദ്റസ:</span> 
                        <span class="skimvb-val font-bold">${cls.madrasaName || '...................................................'}</span>
                    </div>
                    <div class="skimvb-item-place">
                        <span class="skimvb-label">സ്ഥലം:</span> 
                        <span class="skimvb-val font-bold">${cls.place || '....................................'}</span>
                    </div>
                </div>
                <div class="skimvb-header-row-2">
                    <div class="skimvb-reg-block">
                        <span class="skimvb-label">SKIMVB REG.NO:</span> 
                        <span class="skimvb-reg-val font-bold">${cls.skimvbRegNo || '...............'}</span>
                    </div>
                    <div class="skimvb-title-center">
                        <div class="skimvb-title-badge">മാർക്ക് ലിസ്റ്റ്</div>
                    </div>
                    <div class="skimvb-meta-right">
                        <div><span class="skimvb-label">YEAR:</span> <span class="font-bold">${cls.academicYear || ''}</span></div>
                        <div><span class="skimvb-label">TERM:</span> <span class="font-bold">${cls.term || cls.examName || ''}</span></div>
                        <div><span class="skimvb-label">CLASS:</span> <span class="font-bold">${cls.className || ''}</span></div>
                    </div>
                </div>
            </div>

            <div class="table-responsive-container touch-scrollable">
                <table class="marksheet-table skimvb-table" id="marksheet-grid">
                    <thead>
                        <tr class="skimvb-head-top">
                            <th class="th-roll sticky-col-1" rowspan="2">No</th>
                            <th class="th-name sticky-col-2" rowspan="2">പേരും ഇനീഷ്യലും</th>
                            <th class="th-att" rowspan="2" title="ഹാജർ">
                                <div class="vertical-text-head">ഹാജർ</div>
                            </th>
                            <th class="th-subjects-super" colspan="${topics.length}">
                                SUBJECTS
                            </th>
                            <th class="th-calc th-total" rowspan="2">
                                <div class="vertical-text-head">TOTAL</div>
                            </th>
                            <th class="th-calc th-remark" rowspan="2">
                                <div class="vertical-text-head">REMARK</div>
                            </th>
                            <th class="th-calc th-rank" rowspan="2">
                                <div class="vertical-text-head">RANK</div>
                            </th>
                            <th class="th-action hide-print" rowspan="2">നീക്കം</th>
                        </tr>
                        <tr class="skimvb-head-sub">
                            ${topics.map(t => {
                                const passMark = Math.ceil(Number(t.maxMarks) * (Number(cls.passPercentage) || 36) / 100);
                                return `
                                    <th class="th-topic" data-topic-id="${t.id}" title="${t.name}">
                                        <div class="th-topic-inner">
                                            <span class="topic-name-header">${t.name}</span>
                                            <span class="topic-max-badge">(${t.maxMarks})</span>
                                        </div>
                                    </th>
                                `;
                            }).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${studentsToDisplay.map((st, rowIdx) => {
                            const res = resultMap[st.id] || window.marksheetModel.computeStudentResult(st, topics, cls.marks, cls.passPercentage);
                            const remarkText = res.hasAnyMark ? (res.status === 'Pass' ? 'വിജയിച്ചു' : 'പരാജയം') : '-';
                            return `
                                <tr class="student-row" data-student-id="${st.id}" data-row-idx="${rowIdx}">
                                    <td class="td-roll sticky-col-1">
                                        <span class="roll-badge">${st.rollNo || (rowIdx + 1)}</span>
                                    </td>
                                    <td class="td-name sticky-col-2">
                                        <div class="student-name-box">
                                            <span class="st-gender-dot ${st.gender}"></span>
                                            <span class="st-name-text">${st.name}</span>
                                        </div>
                                    </td>
                                    <td class="td-att">
                                        <input 
                                            type="text" 
                                            class="att-input" 
                                            value="${st.attendance || ''}" 
                                            data-student-id="${st.id}" 
                                            data-row="${rowIdx}"
                                            placeholder="-"
                                            maxlength="5"
                                            title="ഹാജർ (Attendance)"
                                            autocomplete="off"
                                        >
                                    </td>
                                    ${topics.map((t, colIdx) => {
                                        const scoreObj = (res.topicScores && res.topicScores[t.id]) || { value: '', colorClass: '' };
                                        const val = scoreObj.value !== undefined ? scoreObj.value : '';
                                        const colorClass = scoreObj.colorClass || '';
                                        const passMark = Math.ceil(Number(t.maxMarks) * (Number(cls.passPercentage) || 36) / 100);
                                        const tooltip = scoreObj.value !== '' 
                                            ? `${t.name}: ${scoreObj.value}/${t.maxMarks} (${scoreObj.percentage}%)` 
                                            : `${t.name} (${t.maxMarks})`;
                                        return `
                                            <td class="td-mark-input">
                                                <input 
                                                    type="text" 
                                                    inputmode="decimal"
                                                    class="mark-input ${colorClass}" 
                                                    value="${val}" 
                                                    data-student-id="${st.id}" 
                                                    data-topic-id="${t.id}"
                                                    data-max="${t.maxMarks}"
                                                    data-row="${rowIdx}" 
                                                    data-col="${colIdx}"
                                                    placeholder="-"
                                                    maxlength="4"
                                                    autocomplete="off"
                                                    title="${tooltip}"
                                                >
                                            </td>
                                        `;
                                    }).join('')}
                                    <td class="td-calc td-total font-mono" id="total-${st.id}">
                                        <strong>${res.hasAnyMark ? res.totalScored : '-'}</strong>
                                        <span class="text-muted hide-print">/${res.totalMax}</span>
                                    </td>
                                    <td class="td-calc td-remark" id="remark-${st.id}">
                                        <span class="badge ${res.statusClass}">${remarkText}</span>
                                    </td>
                                    <td class="td-calc td-rank font-mono" id="rank-${st.id}">
                                        <strong>${res.hasAnyMark ? res.rank : '-'}</strong>
                                    </td>
                                    <td class="td-action hide-print">
                                        <button class="btn-icon btn-del-student" data-id="${st.id}" title="നീക്കം ചെയ്യുക">&times;</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Print & Screen Summary Box: Exact SKIMVB Bottom 3x3 Table & Signature -->
            <div class="skimvb-bottom-section">
                <div class="skimvb-summary-table-wrap">
                    <table class="skimvb-summary-table">
                        <thead>
                            <tr>
                                <th class="summary-title-cell">വിവരം</th>
                                <th>ആണ്</th>
                                <th>പെണ്</th>
                                <th>ആകെ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="summary-row-label">വിദ്യാർത്ഥികൾ</td>
                                <td>${stats.skimvbStats.students.boys}</td>
                                <td>${stats.skimvbStats.students.girls}</td>
                                <td><strong>${stats.skimvbStats.students.total}</strong></td>
                            </tr>
                            <tr>
                                <td class="summary-row-label">വിജയികൾ</td>
                                <td>${stats.skimvbStats.passed.boys}</td>
                                <td>${stats.skimvbStats.passed.girls}</td>
                                <td><strong>${stats.skimvbStats.passed.total}</strong></td>
                            </tr>
                            <tr>
                                <td class="summary-row-label">ശതമാനം</td>
                                <td>${stats.skimvbStats.percentage.boys}%</td>
                                <td>${stats.skimvbStats.percentage.girls}%</td>
                                <td><strong>${stats.skimvbStats.percentage.total}%</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="skimvb-signature-box">
                    <div class="sig-line"></div>
                    <span class="sig-title">മുതഅല്ലിം</span>
                    <span class="sig-subtitle font-xs text-muted">(അധ്യാപകന്റെ ഒപ്പ്)</span>
                </div>
            </div>

            ${this._renderQuickFooter()}
        `;
    }

    _renderCardsView(cls, stats) {
        const topics = cls.topics || [];
        const { studentsToDisplay, sheetResults } = this._getStudentsToDisplay(cls, stats);

        if (studentsToDisplay.length === 0) {
            return this._renderEmptyState();
        }

        const resultMap = {};
        sheetResults.forEach(r => { resultMap[r.student.id] = r; });

        return `
            <div class="student-cards-container">
                <div class="student-cards-grid">
                    ${studentsToDisplay.map((st, rowIdx) => {
                        const res = resultMap[st.id] || window.marksheetModel.computeStudentResult(st, topics, cls.marks, cls.passPercentage);
                        return `
                            <div class="student-card" data-student-id="${st.id}">
                                <div class="card-header">
                                    <div class="card-header-left">
                                        <span class="roll-badge">${st.rollNo || (rowIdx + 1)}</span>
                                        <div>
                                            <h4 class="card-student-name">${st.name}</h4>
                                            <span class="student-gender-tag ${st.gender}">${st.gender === 'girl' ? 'പെൺകുട്ടി' : 'ആൺകുട്ടി'}</span>
                                        </div>
                                    </div>
                                    <div class="card-header-right">
                                        <span class="badge ${res.statusClass}" id="card-status-${st.id}">
                                            ${res.hasAnyMark ? (res.status === 'Pass' ? 'പാസ്സ്' : 'തോറ്റു') : '-'}
                                        </span>
                                        <button class="btn-icon btn-del-student" data-id="${st.id}" title="നീക്കം ചെയ്യുക">&times;</button>
                                    </div>
                                </div>

                                <div class="card-att-strip" style="padding: 6px 12px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display:flex; align-items:center; justify-content:space-between;">
                                    <span class="font-xs font-bold text-muted">ഹാജർ (Attendance):</span>
                                    <input 
                                        type="text" 
                                        class="att-input-card font-mono text-center font-bold" 
                                        style="max-width: 80px; padding: 2px 6px; border:1px solid #cbd5e1; border-radius:4px;" 
                                        value="${st.attendance || ''}" 
                                        data-student-id="${st.id}"
                                        placeholder="ഹാജർ"
                                    >
                                </div>

                                <div class="card-scores-grid">
                                    ${topics.map((t, colIdx) => {
                                        const scoreObj = (res.topicScores && res.topicScores[t.id]) || { value: '', colorClass: '' };
                                        const val = scoreObj.value !== undefined ? scoreObj.value : '';
                                        const colorClass = scoreObj.colorClass || '';
                                        const passMark = Math.ceil(Number(t.maxMarks) * (Number(cls.passPercentage) || 36) / 100);
                                        return `
                                            <div class="card-topic-field">
                                                <div class="card-topic-meta">
                                                    <span class="card-topic-name">${t.name}</span>
                                                    <span class="card-topic-sub">Max: ${t.maxMarks}</span>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    inputmode="decimal"
                                                    class="mark-input ${colorClass}" 
                                                    value="${val}" 
                                                    data-student-id="${st.id}" 
                                                    data-topic-id="${t.id}"
                                                    data-max="${t.maxMarks}"
                                                    data-row="${rowIdx}" 
                                                    data-col="${colIdx}"
                                                    placeholder="-"
                                                    maxlength="4"
                                                    autocomplete="off"
                                                >
                                            </div>
                                        `;
                                    }).join('')}
                                </div>

                                <div class="card-summary-bar">
                                    <div class="card-summary-item">
                                        <span class="summary-label">ആകെ</span>
                                        <span class="summary-val font-mono" id="card-total-${st.id}">
                                            ${res.hasAnyMark ? `${res.totalScored}/${res.totalMax}` : '-'}
                                        </span>
                                    </div>
                                    <div class="card-summary-item">
                                        <span class="summary-label">റാങ്ക്</span>
                                        <span class="summary-val font-mono" id="card-rank-${st.id}">
                                            ${res.hasAnyMark ? res.rank : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            ${this._renderQuickFooter()}
        `;
    }

    _renderQuickFooter() {
        return `
            <div class="sheet-quick-footer hide-print">
                <div class="marks-legend-strip">
                    <span class="legend-badge legend-green">
                        <span class="legend-dot green"></span> 90%+
                    </span>
                    <span class="legend-badge legend-blue">
                        <span class="legend-dot blue"></span> 50% - 89%
                    </span>
                    <span class="legend-badge legend-amber">
                        <span class="legend-dot amber"></span> 36% - 49%
                    </span>
                    <span class="legend-badge legend-red">
                        <span class="legend-dot red"></span> &lt;36% / Ab
                    </span>
                </div>
            </div>
        `;
    }

    _renderEmptyState() {
        const genderLabel = this.activeTab === 'boys' ? 'ആൺകുട്ടികൾ' : (this.activeTab === 'girls' ? 'പെൺകുട്ടികൾ' : 'വിദ്യാർത്ഥികൾ');
        return `
            <div class="empty-state">
                <h4>${genderLabel} ചേർത്തിട്ടില്ല</h4>
                <p class="text-muted">ഒറ്റയ്ക്കോ 150+ പേരെ ഒന്നിച്ചോ ചേർക്കാം.</p>
                <div class="empty-actions-row">
                    <button class="btn btn-primary btn-sm" id="btn-empty-add-st">പുതിയ വിദ്യാർത്ഥി</button>
                    <button class="btn btn-outline btn-sm" id="btn-empty-bulk">+ 150+ കുട്ടികളെ ചേർക്കുക</button>
                    <button class="btn btn-outline btn-sm" id="btn-empty-excel">Excel ഇംപോർട്ട്</button>
                </div>
            </div>
        `;
    }

    _renderAnalyticsTab(stats, cls) {
        return `
            <div class="analytics-container">
                <div class="analytics-top-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="margin: 0;">റിസൾട്ട് അവലോകനം (${cls.madrasaName || 'മദ്റസ'})</h4>
                    <button class="btn btn-primary btn-sm btn-print" id="btn-print-analytics">
                        പ്രിന്റ് ചെയ്യുക
                    </button>
                </div>

                <div class="analytics-cards-grid">
                    <div class="stat-card">
                        <div class="stat-label">ആകെ കുട്ടികൾ</div>
                        <div class="stat-value">${stats.totalStudents}</div>
                        <div class="stat-sub">${stats.boysCount} ആൺ • ${stats.girlsCount} പെൺ</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">പാസ്സ് ശതമാനം</div>
                        <div class="stat-value text-success">${stats.passRate}%</div>
                        <div class="stat-sub">${stats.passedCount} പാസ്സ് • ${stats.failedCount} തോറ്റു</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">ശരാശരി മാർക്ക്</div>
                        <div class="stat-value font-mono">${stats.avgScore} <span class="font-sm text-muted">/ ${stats.totalMaxMarks}</span></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">വിഷയങ്ങൾ</div>
                        <div class="stat-value">${stats.topicsCount}</div>
                    </div>
                </div>

                <div class="analytics-table-card mt-3">
                    <h5 class="card-title mb-2">സമസ്ത സംഗ്രഹ പട്ടിക (SKIMVB Summary)</h5>
                    <div class="table-responsive-container">
                        <table class="marksheet-table skimvb-summary-table" style="max-width:500px;">
                            <thead>
                                <tr>
                                    <th>വിവരം</th>
                                    <th>ആണ്</th>
                                    <th>പെണ്</th>
                                    <th>ആകെ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>വിദ്യാർത്ഥികൾ</td>
                                    <td>${stats.skimvbStats.students.boys}</td>
                                    <td>${stats.skimvbStats.students.girls}</td>
                                    <td><strong>${stats.skimvbStats.students.total}</strong></td>
                                </tr>
                                <tr>
                                    <td>വിജയികൾ</td>
                                    <td>${stats.skimvbStats.passed.boys}</td>
                                    <td>${stats.skimvbStats.passed.girls}</td>
                                    <td><strong>${stats.skimvbStats.passed.total}</strong></td>
                                </tr>
                                <tr>
                                    <td>ശതമാനം</td>
                                    <td>${stats.skimvbStats.percentage.boys}%</td>
                                    <td>${stats.skimvbStats.percentage.girls}%</td>
                                    <td><strong>${stats.skimvbStats.percentage.total}%</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="analytics-table-card mt-3">
                    <h5 class="card-title mb-2">വിഷയം തിരിച്ചുള്ള വിശകലനം</h5>
                    <div class="table-responsive-container">
                        <table class="marksheet-table stats-table">
                            <thead>
                                <tr>
                                    <th>വിഷയം</th>
                                    <th>പരമാവധി</th>
                                    <th>പാസ്സ് മാർക്ക്</th>
                                    <th>ശരാശരി</th>
                                    <th>ഉയർന്ന മാർക്ക്</th>
                                    <th>പങ്കെടുത്തവർ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${stats.topicStats.map(ts => {
                                    const minPass = Math.ceil(Number(ts.topic.maxMarks) * (Number(cls.passPercentage) || 36) / 100);
                                    return `
                                        <tr>
                                            <td class="font-bold">${ts.topic.name}</td>
                                            <td class="text-center font-mono">${ts.topic.maxMarks}</td>
                                            <td class="text-center font-mono text-muted">${minPass}</td>
                                            <td class="text-center font-mono">${ts.avg}</td>
                                            <td class="text-center font-mono text-success"><strong>${ts.highest}</strong></td>
                                            <td class="text-center font-mono">${ts.count}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Bulk Add Students Modal: Easily ingest 150+ students in 1 click
     */
    showBulkAddStudentModal() {
        const cls = this.currentClass;
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        const startRoll = ((cls.students || []).length + 1).toString();

        modalContainer.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-box modal-lg mobile-sheet">
                    <div class="modal-header">
                        <h3 class="modal-title">+ 150+ കുട്ടികളെ കൂട്ടമായി ചേർക്കുക (Bulk Add)</h3>
                        <button class="modal-close" id="btn-close-bulk-modal">&times;</button>
                    </div>
                    <form id="bulk-student-form">
                        <div class="modal-body">
                            <p class="font-sm text-muted">
                                വിദ്യാർത്ഥികളുടെ പേരുകൾ താഴെ ഓരോ വരിയിലായി പേസ്റ്റ് ചെയ്യുക (WhatsApp, Excel, രജിസ്റ്റർ എന്നിവയിൽ നിന്ന് കോപ്പി ചെയ്യാം).
                            </p>

                            <div class="form-row mt-2">
                                <div class="form-group flex-1">
                                    <label class="form-label font-bold">ലിംഗം (Gender)</label>
                                    <select id="bulk-gender" class="form-control">
                                        <option value="boy" ${this.activeTab !== 'girls' ? 'selected' : ''}>എല്ലാവരും ആൺകുട്ടികൾ (Boys)</option>
                                        <option value="girl" ${this.activeTab === 'girls' ? 'selected' : ''}>എല്ലാവരും പെൺകുട്ടികൾ (Girls)</option>
                                    </select>
                                </div>
                                <div class="form-group" style="max-width: 140px;">
                                    <label class="form-label font-bold">തുടങ്ങേണ്ട റോൾ നമ്പർ</label>
                                    <input type="number" id="bulk-start-roll" class="form-control" value="${startRoll}" min="1">
                                </div>
                            </div>

                            <div class="form-group mt-2">
                                <label class="form-label font-bold">വിദ്യാർത്ഥികളുടെ പട്ടിക (പേര് ഓരോ വരിയിൽ):</label>
                                <textarea 
                                    id="bulk-names-textarea" 
                                    class="form-control font-mono" 
                                    rows="9" 
                                    placeholder="ഉദാഹരണത്തിന്:\nമുഹമ്മദ് ഷാഫി\nഅബ്ദുല്ല ടി\nഅഹമ്മദ് റിയാസ്\nഫാത്തിമ സന\n..."
                                    required
                                ></textarea>
                                <div id="bulk-count-preview" class="font-xs text-muted mt-1">0 പേരുകൾ കണ്ടെത്തി.</div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-ghost" id="btn-cancel-bulk">റദ്ദാക്കുക</button>
                            <button type="submit" class="btn btn-primary" id="btn-submit-bulk">വിദ്യാർത്ഥികളെ ചേർക്കുക</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const closeModal = () => { modalContainer.innerHTML = ''; };
        document.getElementById('btn-close-bulk-modal').addEventListener('click', closeModal);
        document.getElementById('btn-cancel-bulk').addEventListener('click', closeModal);

        const textarea = document.getElementById('bulk-names-textarea');
        const countPreview = document.getElementById('bulk-count-preview');

        textarea.addEventListener('input', () => {
            const lines = textarea.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            countPreview.innerText = `${lines.length} കുട്ടികളുടെ പേരുകൾ കണ്ടെത്തി.`;
        });

        document.getElementById('bulk-student-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const raw = textarea.value;
            const gender = document.getElementById('bulk-gender').value;
            let startRollNum = parseInt(document.getElementById('bulk-start-roll').value, 10) || 1;

            const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length === 0) {
                alert('ദയവായി കുറഞ്ഞത് ഒരു കുട്ടിയുടെ പേരെങ്കിലും നൽകുക.');
                return;
            }

            const studentsToAdd = lines.map((line, idx) => {
                // If line contains roll number like "1. Muhammed" or "1 - Muhammed"
                let name = line;
                let rollNo = (startRollNum + idx).toString();
                const numMatch = line.match(/^(\d+)[\.\-\s]+(.*)$/);
                if (numMatch) {
                    rollNo = numMatch[1];
                    name = numMatch[2].trim();
                }

                return {
                    rollNo,
                    name,
                    gender,
                    attendance: ''
                };
            });

            window.marksheetController.addBulkStudents(cls.id, studentsToAdd);
            alert(`✅ ${studentsToAdd.length} വിദ്യാർത്ഥികളെ വിജയകരമായി ചേർത്തു!`);
            closeModal();
        });
    }

    // =========================================================================
    // Single Student Add Modal
    // =========================================================================
    showAddStudentModal() {
        const cls = this.currentClass;
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        const nextRoll = ((cls.students || []).length + 1).toString();

        modalContainer.innerHTML = `
            <div class="modal-backdrop" id="add-student-modal-backdrop">
                <div class="modal-box mobile-sheet">
                    <div class="modal-header">
                        <h3 class="modal-title">വിദ്യാർത്ഥിയെ ചേർക്കുക</h3>
                        <button class="modal-close" id="btn-close-st-modal">&times;</button>
                    </div>
                    <form id="add-student-form">
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group" style="max-width: 120px;">
                                    <label class="form-label">റോൾ നമ്പർ</label>
                                    <input type="text" id="modal-roll" class="form-control" value="${nextRoll}" required>
                                </div>
                                <div class="form-group flex-1">
                                    <label class="form-label">പേരും ഇനീഷ്യലും *</label>
                                    <input type="text" id="modal-name" class="form-control" placeholder="പേര്" required autofocus>
                                </div>
                            </div>

                            <div class="form-row mt-2">
                                <div class="form-group flex-1">
                                    <label class="form-label">ഹാജർ (Attendance)</label>
                                    <input type="text" id="modal-att" class="form-control" placeholder="ഉദാ: 85 അല്ലെങ്കിൽ 90%">
                                </div>
                                <div class="form-group flex-1">
                                    <label class="form-label">ലിംഗം</label>
                                    <div class="radio-group">
                                        <label class="radio-label">
                                            <input type="radio" name="st-gender" value="boy" ${this.activeTab !== 'girls' ? 'checked' : ''}>
                                            <span>ആൺകുട്ടി (Boy)</span>
                                        </label>
                                        <label class="radio-label">
                                            <input type="radio" name="st-gender" value="girl" ${this.activeTab === 'girls' ? 'checked' : ''}>
                                            <span>പെൺകുട്ടി (Girl)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-ghost" id="btn-cancel-st">റദ്ദാക്കുക</button>
                            <button type="submit" class="btn btn-primary">ചേർക്കുക</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const closeModal = () => { modalContainer.innerHTML = ''; };
        document.getElementById('btn-close-st-modal').addEventListener('click', closeModal);
        document.getElementById('btn-cancel-st').addEventListener('click', closeModal);

        document.getElementById('add-student-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const rollNo = document.getElementById('modal-roll').value.trim();
            const name = document.getElementById('modal-name').value.trim();
            const attendance = document.getElementById('modal-att').value.trim();
            const gender = document.querySelector('input[name="st-gender"]:checked').value;

            if (name) {
                window.marksheetController.addStudent(cls.id, { rollNo, name, gender, attendance });
                closeModal();
            }
        });
    }

    showManageTopicsModal() {
        const cls = this.currentClass;
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        const topics = cls.topics || [];

        modalContainer.innerHTML = `
            <div class="modal-backdrop" id="topics-modal-backdrop">
                <div class="modal-box modal-lg mobile-sheet">
                    <div class="modal-header">
                        <h3 class="modal-title">വിഷയങ്ങൾ ക്രമീകരിക്കുക</h3>
                        <button class="modal-close" id="btn-close-topics-modal">&times;</button>
                    </div>
                    <form id="manage-topics-form">
                        <div class="modal-body">
                            <div id="modal-topics-list">
                                ${topics.map((t, idx) => `
                                    <div class="topic-manage-row" data-id="${t.id}" data-index="${idx}">
                                        <input type="text" class="form-control topic-edit-name" value="${t.name}" placeholder="വിഷയം" required>
                                        <input type="number" class="form-control topic-edit-max" value="${t.maxMarks || 50}" placeholder="മാർക്ക്" min="1" max="1000" style="max-width: 100px;" required>
                                        <button type="button" class="btn-icon btn-del-topic" data-id="${t.id}" title="നീക്കം ചെയ്യുക">&times;</button>
                                    </div>
                                `).join('')}
                            </div>
                            <button type="button" class="btn btn-outline btn-sm mt-2" id="btn-modal-add-topic">
                                + വിഷയം ചേർക്കുക
                            </button>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-ghost" id="btn-cancel-topics">റദ്ദാക്കുക</button>
                            <button type="submit" class="btn btn-primary">സേവ് ചെയ്യുക</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const closeModal = () => { modalContainer.innerHTML = ''; };
        document.getElementById('btn-close-topics-modal').addEventListener('click', closeModal);
        document.getElementById('btn-cancel-topics').addEventListener('click', closeModal);

        const listContainer = document.getElementById('modal-topics-list');
        const addBtn = document.getElementById('btn-modal-add-topic');

        const attachDel = (row) => {
            const btn = row.querySelector('.btn-del-topic');
            if (btn) {
                btn.addEventListener('click', () => {
                    if (listContainer.children.length > 1) {
                        row.remove();
                    } else {
                        alert('കുറഞ്ഞത് ഒരു വിഷയമെങ്കിലും ആവശ്യമാണ്.');
                    }
                });
            }
        };

        listContainer.querySelectorAll('.topic-manage-row').forEach(attachDel);

        addBtn.addEventListener('click', () => {
            const row = document.createElement('div');
            row.className = 'topic-manage-row';
            row.innerHTML = `
                <input type="text" class="form-control topic-edit-name" placeholder="വിഷയം" required>
                <input type="number" class="form-control topic-edit-max" value="50" placeholder="മാർക്ക്" min="1" max="1000" style="max-width: 100px;" required>
                <button type="button" class="btn-icon btn-del-topic" title="നീക്കം ചെയ്യുക">&times;</button>
            `;
            listContainer.appendChild(row);
            attachDel(row);
        });

        document.getElementById('manage-topics-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const rows = listContainer.querySelectorAll('.topic-manage-row');
            const updatedTopics = [];
            rows.forEach((r, idx) => {
                const name = r.querySelector('.topic-edit-name').value.trim();
                const max = Number(r.querySelector('.topic-edit-max').value) || 50;
                const id = r.getAttribute('data-id') || ('top_' + Date.now() + '_' + idx);
                if (name) {
                    updatedTopics.push({ id, name, maxMarks: max });
                }
            });

            window.marksheetController.updateTopics(cls.id, updatedTopics);
            closeModal();
        });
    }

    _bindEvents() {
        // Dashboard Back button
        const backBtn = document.getElementById('btn-back-dashboard');
        if (backBtn) backBtn.addEventListener('click', () => window.classController.showDashboard());

        // Tab Switching
        document.querySelectorAll('.sheet-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.getAttribute('data-tab');
                this.render(this.currentClass, targetTab);
            });
        });

        // View Mode Switching (Table / Cards)
        const btnModeTable = document.getElementById('btn-mode-table');
        const btnModeCards = document.getElementById('btn-mode-cards');
        const mBtnToggleView = document.getElementById('m-btn-toggle-view');

        if (btnModeTable) btnModeTable.addEventListener('click', () => { this.viewMode = 'table'; this.render(this.currentClass); });
        if (btnModeCards) btnModeCards.addEventListener('click', () => { this.viewMode = 'cards'; this.render(this.currentClass); });
        if (mBtnToggleView) mBtnToggleView.addEventListener('click', () => {
            this.viewMode = this.viewMode === 'table' ? 'cards' : 'table';
            this.render(this.currentClass);
        });

        // Search Input Handling
        const searchInput = document.getElementById('search-students-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                const rows = document.querySelectorAll('.student-row');
                const cards = document.querySelectorAll('.student-card');
                const q = this.searchQuery.toLowerCase().trim();

                rows.forEach(r => {
                    const text = r.innerText.toLowerCase();
                    r.style.display = text.includes(q) ? '' : 'none';
                });

                cards.forEach(c => {
                    const text = c.innerText.toLowerCase();
                    c.style.display = text.includes(q) ? '' : 'none';
                });
            });
        }

        const clearSearchBtn = document.getElementById('btn-clear-search');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.searchQuery = '';
                this.render(this.currentClass);
            });
        }

        // Print Buttons
        const printNav = document.getElementById('btn-print-nav');
        const printToolbar = document.getElementById('btn-print-toolbar');
        const mBtnPrint = document.getElementById('m-btn-print');
        const btnPrintAnalytics = document.getElementById('btn-print-analytics');

        const triggerPrint = () => window.print();
        if (printNav) printNav.addEventListener('click', triggerPrint);
        if (printToolbar) printToolbar.addEventListener('click', triggerPrint);
        if (mBtnPrint) mBtnPrint.addEventListener('click', triggerPrint);
        if (btnPrintAnalytics) btnPrintAnalytics.addEventListener('click', triggerPrint);

        // Manage Topics
        const manageTopicsBtn = document.getElementById('btn-manage-topics');
        if (manageTopicsBtn) manageTopicsBtn.addEventListener('click', () => this.showManageTopicsModal());

        // Add Single Student
        const addStBtn = document.getElementById('btn-add-student');
        const mAddStBtn = document.getElementById('m-btn-add-student');
        const emptyAddStBtn = document.getElementById('btn-empty-add-st');
        if (addStBtn) addStBtn.addEventListener('click', () => this.showAddStudentModal());
        if (mAddStBtn) mAddStBtn.addEventListener('click', () => this.showAddStudentModal());
        if (emptyAddStBtn) emptyAddStBtn.addEventListener('click', () => this.showAddStudentModal());

        // Bulk Add 150+ Students
        const bulkNavBtn = document.getElementById('btn-bulk-add-nav');
        const mBulkBtn = document.getElementById('m-btn-bulk');
        const emptyBulkBtn = document.getElementById('btn-empty-bulk');
        if (bulkNavBtn) bulkNavBtn.addEventListener('click', () => this.showBulkAddStudentModal());
        if (mBulkBtn) mBulkBtn.addEventListener('click', () => this.showBulkAddStudentModal());
        if (emptyBulkBtn) emptyBulkBtn.addEventListener('click', () => this.showBulkAddStudentModal());

        // Export Actions
        const btnPdf = document.getElementById('btn-export-pdf');
        const mBtnPdf = document.getElementById('m-btn-pdf');
        if (btnPdf) btnPdf.addEventListener('click', () => window.exportView.exportPDF(this.currentClass, this.activeTab));
        if (mBtnPdf) mBtnPdf.addEventListener('click', () => window.exportView.exportPDF(this.currentClass, this.activeTab));

        const btnExcel = document.getElementById('btn-export-excel');
        const mBtnExcel = document.getElementById('m-btn-excel');
        const emptyExcelBtn = document.getElementById('btn-empty-excel');
        if (btnExcel) btnExcel.addEventListener('click', () => window.exportView.exportExcel(this.currentClass, this.activeTab));

        // Delete student
        document.querySelectorAll('.btn-del-student').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.currentTarget.getAttribute('data-id');
                if (confirm('ഈ കുട്ടിയെ നീക്കം ചെയ്യണമെന്നുണ്ടോ?')) {
                    window.marksheetController.deleteStudent(this.currentClass.id, studentId);
                }
            });
        });

        // Attendance (ഹാജർ) Inputs
        document.querySelectorAll('.att-input, .att-input-card').forEach(input => {
            input.addEventListener('change', (e) => {
                const studentId = e.target.getAttribute('data-student-id');
                const val = e.target.value.trim();
                window.marksheetController.updateAttendance(this.currentClass.id, studentId, val);
                this._showAutosaveNotice();
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                    e.preventDefault();
                    const row = parseInt(e.target.getAttribute('data-row'), 10);
                    const nextAtt = document.querySelector(`.att-input[data-row="${row + 1}"]`);
                    if (nextAtt) { nextAtt.focus(); nextAtt.select(); }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const row = parseInt(e.target.getAttribute('data-row'), 10);
                    const prevAtt = document.querySelector(`.att-input[data-row="${row - 1}"]`);
                    if (prevAtt) { prevAtt.focus(); prevAtt.select(); }
                } else if (e.key === 'ArrowRight') {
                    const row = parseInt(e.target.getAttribute('data-row'), 10);
                    const firstMark = document.querySelector(`.mark-input[data-row="${row}"][data-col="0"]`);
                    if (firstMark) { firstMark.focus(); firstMark.select(); }
                }
            });
        });

        // Daily Inline Mark Inputs & Keyboard / Touch Navigation
        const markInputs = document.querySelectorAll('.mark-input');
        markInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this._handleMarkInput(e.target);
            });

            input.addEventListener('keydown', (e) => {
                this._handleKeyboardNavigation(e);
            });

            input.addEventListener('focus', (e) => {
                e.target.select();
            });
        });
    }

    _showAutosaveNotice() {
        const autoSave = document.getElementById('autosave-status');
        const text = document.getElementById('autosave-text');
        const isCloud = window.supabaseModel && window.supabaseModel.isConfigured();
        if (autoSave && text) {
            text.innerText = isCloud ? 'Supabase സിങ്ക് ആകുന്നു...' : 'സേവ് ചെയ്യുന്നു...';
            setTimeout(() => {
                text.innerText = isCloud ? 'Supabase ക്ലൗഡ്' : 'സേവ് ആയി';
            }, 600);
        }
    }

    _handleMarkInput(inputElem) {
        const studentId = inputElem.getAttribute('data-student-id');
        const topicId = inputElem.getAttribute('data-topic-id');
        const maxMarks = Number(inputElem.getAttribute('data-max')) || 100;
        const passPercentage = Number(this.currentClass.passPercentage) || 36;
        let rawVal = inputElem.value.trim();

        if (rawVal.toLowerCase() === 'ab' || rawVal.toLowerCase() === 'a') {
            rawVal = 'Ab';
            inputElem.value = 'Ab';
        } else if (rawVal !== '') {
            let num = Number(rawVal);
            if (isNaN(num)) {
                num = 0;
            } else if (num > maxMarks) {
                num = maxMarks;
                inputElem.value = num;
            } else if (num < 0) {
                num = 0;
                inputElem.value = num;
            }
            rawVal = num;
        }

        // Live visual color tier transition
        inputElem.classList.remove('mark-fail', 'mark-pass', 'mark-good', 'mark-excellent');
        if (rawVal === 'Ab') {
            inputElem.classList.add('mark-fail');
            inputElem.title = `Ab (തോറ്റു)`;
        } else if (rawVal !== '') {
            const num = Number(rawVal);
            const pct = maxMarks > 0 ? (num / maxMarks) * 100 : 0;
            const roundedPct = Math.round(pct * 10) / 10;
            if (roundedPct >= 90) {
                inputElem.classList.add('mark-excellent');
            } else if (roundedPct >= 50) {
                inputElem.classList.add('mark-good');
            } else if (roundedPct >= passPercentage) {
                inputElem.classList.add('mark-pass');
            } else {
                inputElem.classList.add('mark-fail');
            }
            inputElem.title = `${rawVal}/${maxMarks} (${roundedPct}%)`;
        } else {
            inputElem.title = '';
        }

        // Save mark
        window.storageModel.updateStudentMark(this.currentClass.id, studentId, topicId, rawVal);

        if (!this.currentClass.marks) this.currentClass.marks = {};
        if (!this.currentClass.marks[studentId]) this.currentClass.marks[studentId] = {};
        if (rawVal === '') {
            delete this.currentClass.marks[studentId][topicId];
        } else {
            this.currentClass.marks[studentId][topicId] = rawVal;
        }

        this._updateAllCalculations();
        this._showAutosaveNotice();
    }

    _updateAllCalculations() {
        const students = this.currentClass.students || [];
        const topics = this.currentClass.topics || [];
        const passPct = Number(this.currentClass.passPercentage) || 36;
        const results = window.marksheetModel.processSheet(students, topics, this.currentClass.marks, passPct);

        results.forEach(res => {
            const studentId = res.student.id;
            const remarkText = res.hasAnyMark ? (res.status === 'Pass' ? 'വിജയിച്ചു' : 'പരാജയം') : '-';

            // Table view elements
            const totalCell = document.getElementById(`total-${studentId}`);
            const rankCell = document.getElementById(`rank-${studentId}`);
            const remarkCell = document.getElementById(`remark-${studentId}`);

            if (totalCell) totalCell.innerHTML = `<strong>${res.hasAnyMark ? res.totalScored : '-'}</strong> <span class="text-muted hide-print">/${res.totalMax}</span>`;
            if (rankCell) rankCell.innerHTML = `<strong>${res.hasAnyMark ? res.rank : '-'}</strong>`;
            if (remarkCell) remarkCell.innerHTML = res.hasAnyMark ? `<span class="badge ${res.statusClass}">${remarkText}</span>` : '-';

            // Card view elements
            const cardTotal = document.getElementById(`card-total-${studentId}`);
            const cardRank = document.getElementById(`card-rank-${studentId}`);
            const cardStatus = document.getElementById(`card-status-${studentId}`);

            if (cardTotal) cardTotal.innerText = res.hasAnyMark ? `${res.totalScored}/${res.totalMax}` : '-';
            if (cardRank) cardRank.innerText = res.hasAnyMark ? res.rank : '-';
            if (cardStatus) {
                cardStatus.className = `badge ${res.statusClass}`;
                cardStatus.innerText = res.hasAnyMark ? (res.status === 'Pass' ? 'പാസ്സ്' : 'തോറ്റു') : '-';
            }
        });
    }

    _handleKeyboardNavigation(e) {
        const currentInput = e.target;
        const row = parseInt(currentInput.getAttribute('data-row'), 10);
        const col = parseInt(currentInput.getAttribute('data-col'), 10);

        let targetInput = null;

        if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            targetInput = document.querySelector(`.mark-input[data-row="${row + 1}"][data-col="${col}"]`);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            targetInput = document.querySelector(`.mark-input[data-row="${row - 1}"][data-col="${col}"]`);
        } else if (e.key === 'ArrowRight' && currentInput.selectionStart === currentInput.value.length) {
            targetInput = document.querySelector(`.mark-input[data-row="${row}"][data-col="${col + 1}"]`);
        } else if (e.key === 'ArrowLeft' && currentInput.selectionStart === 0) {
            if (col === 0) {
                targetInput = document.querySelector(`.att-input[data-row="${row}"]`);
            } else {
                targetInput = document.querySelector(`.mark-input[data-row="${row}"][data-col="${col - 1}"]`);
            }
        }

        if (targetInput) {
            targetInput.focus();
            targetInput.select();
        }
    }
}

window.marksheetView = new MarksheetView();
