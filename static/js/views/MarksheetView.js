/**
 * MarksheetView.js
 * MVC - View Layer: Mobile-First Marksheet, Sticky Table & Touch Cards View,
 * 1-Click Excel/CSV Importer, Gemini AI Photo Scanner, and A4 Sheet Printing.
 */

class MarksheetView {
    constructor() {
        this.container = document.getElementById('app-root');
        this.activeTab = 'boys'; // 'boys' | 'girls' | 'all' | 'analytics'
        this.viewMode = 'table'; // 'table' | 'cards'
        this.sortOrder = 'asc'; // 'asc' | 'desc'
        this.searchQuery = '';
        this.filterCategory = 'all'; // 'all' | 'pass' | 'fail' | 'fail_1' | 'fail_2' | 'fail_3_plus' | 'absent' | 'top10' | 'subject_fail_<topicId>' | 'subject_pass_<topicId>'
        this.currentClass = null;
    }

    render(cls, activeTab = null) {
        this.currentClass = cls;
        if (activeTab) this.activeTab = activeTab;

        const students = cls.students || [];
        const topics = cls.topics || [];
        const boys = students.filter(s => s.gender === 'boy');
        const girls = students.filter(s => s.gender === 'girl');

        const stats = window.marksheetModel.calculateStats(cls);

        this.container.innerHTML = `
            <div class="app-layout mobile-optimized">
                <!-- Top Breadcrumb & Navbar -->
                <header class="navbar marksheet-navbar">
                    <div class="nav-left">
                        <button class="btn btn-ghost btn-sm" id="btn-back-dashboard" title="Back to Classes">
                            ← <span class="hide-mobile">Classes</span>
                        </button>
                        <div class="nav-class-info">
                            <span class="nav-madrasa-sub">${cls.madrasaName || 'BADRUDHEEN MADRASA'}</span>
                            <h3 class="nav-class-main-title">${cls.className} • ${cls.examName}</h3>
                        </div>
                    </div>
                    <div class="nav-actions">
                        <div class="autosave-badge hide-mobile" id="autosave-status">
                            <span class="save-dot"></span> Saved
                        </div>

                        <!-- 1-Click Excel Import -->
                        <button class="btn btn-outline btn-sm btn-action-excel" id="btn-import-excel" title="Import Excel">
                            <span class="btn-icon-label">📊</span>
                            <span class="action-btn-text">Excel</span>
                        </button>

                        <!-- Gemini Flash AI Photo Scan -->
                        <button class="btn btn-outline btn-sm btn-action-ai" id="btn-scan-gemini" title="AI Camera Scanner">
                            <span class="btn-icon-label">📷</span>
                            <span class="action-btn-text">AI Scan</span>
                        </button>

                        <!-- Publish & Submit to Cloud Button -->
                        ${cls.publishedAt && (!cls.isDirty || (cls.editedStudentIds && cls.editedStudentIds.length === 0)) ? `
                            <button class="btn btn-outline btn-sm" id="btn-sync-cloud" title="Results already published and up to date" style="background: #f0fdf4; color: #158043; border-color: #86efac; cursor: default;">
                                <span class="btn-icon-label">✓</span>
                                <span class="action-btn-text" style="font-weight: 700;">Published & Verified</span>
                            </button>
                        ` : `
                            <button class="btn btn-primary btn-sm" id="btn-sync-cloud" title="Submit mark list to cloud for publishing" style="background: linear-gradient(135deg, #0d5c31 0%, #158043 100%);">
                                <span class="btn-icon-label">🚀</span>
                                <span class="action-btn-text" style="font-weight: 700;">${cls.publishedAt && cls.editedStudentIds && cls.editedStudentIds.length > 0 ? `Publish Changes (${cls.editedStudentIds.length})` : 'Publish / Submit'}</span>
                            </button>
                        `}

                        <!-- Print Button -->
                        <button class="btn btn-outline btn-sm btn-print" id="btn-print-nav" title="Print Marksheet">
                            🖨️ Print
                        </button>

                        <!-- Export dropdown / buttons -->
                        <button class="btn btn-outline btn-sm hide-mobile" id="btn-export-excel" title="Export Excel">
                            Excel
                        </button>
                        <button class="btn btn-outline btn-sm hide-mobile" id="btn-export-pdf" title="Export PDF">
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
                                    Boys <span class="tab-badge">${boys.length}</span>
                                </button>
                                <button class="sheet-tab ${this.activeTab === 'girls' ? 'active' : ''}" data-tab="girls">
                                    Girls <span class="tab-badge">${girls.length}</span>
                                </button>
                                <button class="sheet-tab ${this.activeTab === 'all' ? 'active' : ''}" data-tab="all">
                                    All Students <span class="tab-badge">${students.length}</span>
                                </button>
                                <button class="sheet-tab ${this.activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
                                    Overview
                                </button>
                            </div>
                        </div>

                        <div class="toolbar-right">
                            <!-- View Switcher -->
                            <div class="view-mode-toggle" id="view-mode-group">
                                <button type="button" class="btn-toggle ${this.viewMode === 'table' ? 'active' : ''}" id="btn-mode-table" title="Table View">
                                    <span class="toggle-text">Table</span>
                                </button>
                                <button type="button" class="btn-toggle ${this.viewMode === 'cards' ? 'active' : ''}" id="btn-mode-cards" title="Cards View">
                                    <span class="toggle-text">Cards</span>
                                </button>
                            </div>

                            <button class="btn btn-outline btn-sm" id="btn-reorder-roll" title="Drag & Re-order Register Numbers or auto-sequence 1, 2, 3...">
                                ↕️ Arrange Reg No
                            </button>
                            <button class="btn btn-outline btn-sm" id="btn-share-class-wa" title="Share Register Numbers list to WhatsApp Group with Malayalam instructions" style="color: #15803d; border-color: #86efac; background: #f0fdf4; font-weight: 700;">
                                💬 Share Reg Nos
                            </button>
                            <button class="btn btn-outline btn-sm" id="btn-manage-topics">
                                Subjects (${topics.length})
                            </button>
                            <button class="btn btn-outline btn-sm" id="btn-bulk-add-students" title="Bulk Add Students">
                                📋 Bulk Add
                            </button>
                            <button class="btn btn-outline btn-sm btn-print hide-mobile" id="btn-print-toolbar">
                                Print
                            </button>
                            <button class="btn btn-primary btn-sm" id="btn-add-student">
                                + New Student
                            </button>
                        </div>
                    </div>

                    <!-- Comprehensive Filter & Search Bar for Teachers -->
                    ${this.activeTab !== 'analytics' ? `
                    <div class="marksheet-filter-strip" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; flex: 1;">
                            <div style="position: relative; min-width: 180px; flex: 1; max-width: 280px;">
                                <input 
                                    type="text" 
                                    id="filter-search-input" 
                                    class="form-control" 
                                    placeholder="🔍 Search Name or Reg No..." 
                                    value="${this.searchQuery}" 
                                    style="padding-left: 12px; height: 36px; font-size: 0.85rem;"
                                >
                            </div>

                            <select id="filter-category-select" class="form-control" style="height: 36px; font-size: 0.85rem; font-weight: 700; color: #072718; border-color: #cbd5e1; min-width: 220px; max-width: 320px;">
                                <optgroup label="General Performance">
                                    <option value="all" ${this.filterCategory === 'all' ? 'selected' : ''}>📋 All Students</option>
                                    <option value="pass" ${this.filterCategory === 'pass' ? 'selected' : ''}>✅ All Passed (Full Pass)</option>
                                    <option value="fail" ${this.filterCategory === 'fail' ? 'selected' : ''}>⚠️ Any Failed (&lt;36% / Ab)</option>
                                    <option value="fail_1" ${this.filterCategory === 'fail_1' ? 'selected' : ''}>❗ Failed in Exactly 1 Subject</option>
                                    <option value="fail_2" ${this.filterCategory === 'fail_2' ? 'selected' : ''}>‼️ Failed in Exactly 2 Subjects</option>
                                    <option value="fail_3_plus" ${this.filterCategory === 'fail_3_plus' ? 'selected' : ''}>🚨 Failed in 3 or More Subjects (3+ Fail)</option>
                                    <option value="absent" ${this.filterCategory === 'absent' ? 'selected' : ''}>❌ Absent Students (Ab)</option>
                                    <option value="winners_rank" ${this.filterCategory === 'winners_rank' ? 'selected' : ''}>🏆 Winners Rank List (All-Subject Passed Rankers)</option>
                                    <option value="all_total_rank" ${this.filterCategory === 'all_total_rank' ? 'selected' : ''}>📊 All Students Total Rank List (Rank by Total Marks - Pass & Fail)</option>
                                    <option value="top10" ${this.filterCategory === 'top10' ? 'selected' : ''}>⭐ Top 10 Winners (Rank 1 - 10)</option>
                                    <option value="needs_entry" ${this.filterCategory === 'needs_entry' ? 'selected' : ''}>⏳ Incomplete / Missing Marks</option>
                                </optgroup>
                                ${topics.length > 0 ? `
                                <optgroup label="Subject-Wise: Failed / Absent (<36%)">
                                    ${topics.map(t => `<option value="sub_fail_${t.id}" ${this.filterCategory === `sub_fail_${t.id}` ? 'selected' : ''}>❌ Failed in: ${t.name}</option>`).join('')}
                                </optgroup>
                                <optgroup label="Subject-Wise: Passed (≥36%)">
                                    ${topics.map(t => `<option value="sub_pass_${t.id}" ${this.filterCategory === `sub_pass_${t.id}` ? 'selected' : ''}>✅ Passed in: ${t.name}</option>`).join('')}
                                </optgroup>
                                ` : ''}
                            </select>

                            ${(this.filterCategory !== 'all' || this.searchQuery) ? `
                                <button type="button" class="btn btn-ghost btn-sm" id="btn-reset-filters" style="color: #dc2626; font-size: 0.8rem; padding: 4px 8px;" title="Reset all filters">
                                    ✕ Clear Filter
                                </button>
                            ` : ''}
                        </div>

                        <div style="font-size: 0.82rem; font-weight: 700; color: #475569;" id="filter-result-count">
                            <!-- Populated in _getStudentsToDisplay -->
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
                    <button class="mobile-bar-btn" id="m-btn-print" title="Print">
                        <span class="m-label font-bold">Print</span>
                    </button>
                    <button class="mobile-bar-btn" id="m-btn-excel" title="Excel Import">
                        <span class="m-label">Excel</span>
                    </button>
                    <button class="mobile-bar-btn" id="m-btn-ai" title="AI Scan">
                        <span class="m-label">AI Scan</span>
                    </button>
                    <button class="mobile-bar-btn" id="m-btn-bulk-add" title="Bulk Add">
                        <span class="m-label">Bulk Add</span>
                    </button>
                    <button class="mobile-bar-btn active-highlight" id="m-btn-add-student" title="Add Student">
                        <span class="m-label">+ Student</span>
                    </button>
                    <button class="mobile-bar-btn" id="m-btn-toggle-view" title="Toggle View">
                        <span class="m-label">${this.viewMode === 'cards' ? 'Table' : 'Cards'}</span>
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

        const topics = cls.topics || [];
        const passPct = Number(cls.passPercentage) || 36;
        const marksMap = cls.marks || {};
        const totalBaseCount = studentsToDisplay.length;

        // Map computed results for filtering
        const resultMap = {};
        (sheetResults || []).forEach(r => { resultMap[r.student.id] = r; });

        // Apply Comprehensive Teacher Filter Keyword
        if (this.filterCategory && this.filterCategory !== 'all') {
            studentsToDisplay = studentsToDisplay.filter(st => {
                const res = resultMap[st.id] || window.marksheetModel.computeStudentResult(st, topics, marksMap, passPct);
                const failedCount = res.failedTopicsCount || 0;
                const hasAbsent = !!res.hasAbsent;
                const isPassed = !!res.isPassed;
                const hasAnyMark = !!res.hasAnyMark;

                switch (this.filterCategory) {
                    case 'pass':
                        return isPassed;
                    case 'fail':
                        return !isPassed && hasAnyMark;
                    case 'fail_1':
                        return failedCount === 1;
                    case 'fail_2':
                        return failedCount === 2;
                    case 'fail_3_plus':
                        return failedCount >= 3;
                    case 'absent':
                        return hasAbsent;
                    case 'winners_rank':
                        return isPassed && hasAnyMark && (res.rank !== '-' && res.rank !== '');
                    case 'all_total_rank':
                        return hasAnyMark;
                    case 'top10':
                        return isPassed && (Number(res.rank) >= 1 && Number(res.rank) <= 10);
                    case 'needs_entry':
                        // If any subject mark is missing
                        return topics.some(t => {
                            const val = marksMap[st.id] ? marksMap[st.id][t.id] : undefined;
                            return val === undefined || val === null || val === '';
                        });
                    default:
                        // Subject-wise filters: sub_fail_<topicId> or sub_pass_<topicId>
                        if (this.filterCategory.startsWith('sub_fail_')) {
                            const topicId = this.filterCategory.replace('sub_fail_', '');
                            const tScore = res.topicScores && res.topicScores[topicId];
                            return tScore && (!tScore.isPassed || tScore.isAbsent);
                        } else if (this.filterCategory.startsWith('sub_pass_')) {
                            const topicId = this.filterCategory.replace('sub_pass_', '');
                            const tScore = res.topicScores && res.topicScores[topicId];
                            return tScore && tScore.isPassed && !tScore.isAbsent;
                        }
                        return true;
                }
            });
        }

        // Apply Search query (Name, Roll, Student ID)
        if (this.searchQuery && this.searchQuery.trim() !== '') {
            const q = this.searchQuery.trim().toLowerCase();
            studentsToDisplay = studentsToDisplay.filter(st => {
                const name = (st.name || '').toLowerCase();
                const roll = (st.rollNo || '').toString().toLowerCase();
                const sId = (st.studentId || '').toLowerCase();
                const arName = (st.arabicName || '').toLowerCase();
                return name.includes(q) || roll.includes(q) || sId.includes(q) || arName.includes(q);
            });
        }

        // Update badge count in DOM if strip exists
        const countEl = document.getElementById('filter-result-count');
        if (countEl) {
            countEl.innerHTML = `Showing <strong>${studentsToDisplay.length}</strong> of ${totalBaseCount} students`;
        }

        // Apply ordering:
        // If 'winners_rank' is selected, sort primarily by Winners Merit Rank (1, 2, 3...)
        // If 'all_total_rank' is selected, sort primarily by Overall Total Mark Rank (highest total first)
        // Otherwise sort naturally by roll/register number (asc or desc)
        if (this.filterCategory === 'winners_rank') {
            studentsToDisplay.sort((a, b) => {
                const resA = resultMap[a.id];
                const resB = resultMap[b.id];
                const rankA = (resA && resA.rank && resA.rank !== '-') ? Number(resA.rank) : 999999;
                const rankB = (resB && resB.rank && resB.rank !== '-') ? Number(resB.rank) : 999999;
                return rankA - rankB;
            });
        } else if (this.filterCategory === 'all_total_rank') {
            studentsToDisplay.sort((a, b) => {
                const resA = resultMap[a.id];
                const resB = resultMap[b.id];
                const totA = resA ? (Number(resA.totalScored) || 0) : 0;
                const totB = resB ? (Number(resB.totalScored) || 0) : 0;
                if (totB !== totA) return totB - totA; // Highest total first
                return (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0);
            });
        } else {
            studentsToDisplay.sort((a, b) => {
                const diff = (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0);
                return this.sortOrder === 'desc' ? -diff : diff;
            });
        }

        return { studentsToDisplay, sheetResults };
    }

    _renderSheetTable(cls, stats) {
        const topics = cls.topics || [];
        const { studentsToDisplay, sheetResults } = this._getStudentsToDisplay(cls, stats);

        if (studentsToDisplay.length === 0) {
            return this._renderEmptyState();
        }

        const resultMap = {};
        sheetResults.forEach(r => { resultMap[r.student.id] = r; });

        let sheetTitle = 'All Students Marksheet';
        if (this.activeTab === 'boys') sheetTitle = 'Boys Marksheet';
        else if (this.activeTab === 'girls') sheetTitle = 'Girls Marksheet';

        return `
            <!-- Print-Only Header Block (Aligned for A4 Sheet Printing) -->
            <div class="print-only-header">
                <h1 class="print-institution-name">${cls.madrasaName || 'Marksheet'}</h1>
                <div class="print-meta-line">${cls.className || ''} • ${cls.examName || ''} (${cls.academicYear || ''})</div>
                <div class="print-sheet-title">${sheetTitle}</div>
            </div>

            <div class="table-responsive-container touch-scrollable">
                <table class="marksheet-table" id="marksheet-grid">
                    <thead>
                        <tr>
                            <th class="th-roll sticky-col-1" id="th-sort-roll" style="cursor: pointer; user-select: none;" title="Click to order by Register Number">
                                <div style="display: inline-flex; align-items: center; gap: 4px;">
                                    <span>Roll</span>
                                    <span style="font-size: 0.75rem; color: #0284c7;">${this.sortOrder === 'asc' ? '▲' : '▼'}</span>
                                </div>
                            </th>
                            <th class="th-name sticky-col-2">Student Name</th>
                            ${topics.map(t => {
                                const passMark = Math.ceil(Number(t.maxMarks) * (Number(cls.passPercentage) || 36) / 100);
                                const arMatch = t.name.match(/\((.*?)\)/);
                                const arabicTitle = arMatch ? arMatch[1].trim() : '';
                                return `
                                    <th class="th-topic" data-topic-id="${t.id}" title="${t.name}">
                                        <div class="th-topic-inner">
                                            <span class="topic-name-header screen-only-name">${t.name}</span>
                                            ${arabicTitle ? `<span class="topic-arabic-print-only">${arabicTitle}</span>` : `<span class="topic-arabic-print-only">${t.name}</span>`}
                                            <span class="topic-max-badge">Max: ${t.maxMarks} • Min: ${passMark}</span>
                                        </div>
                                    </th>
                                `;
                            }).join('')}
                            <th class="th-topic" style="min-width: 90px; background: #f8fafc;" title="Attendance (ഹാജർ)">
                                <div class="th-topic-inner">
                                    <span class="topic-name-header" style="color: #0369a1;">ഹാജർ (Att.)</span>
                                    <span class="topic-max-badge" style="background:#e0f2fe; color:#0369a1;">Days / %</span>
                                </div>
                            </th>
                            <th class="th-calc th-total">Total</th>
                            <th class="th-calc th-rank">Rank</th>
                            <th class="th-calc th-status">Status</th>
                            <th class="th-action">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentsToDisplay.map((st, rowIdx) => {
                            const res = resultMap[st.id] || window.marksheetModel.computeStudentResult(st, topics, cls.marks, cls.passPercentage);
                            const attVal = (cls.attendance && cls.attendance[st.id] !== undefined) ? cls.attendance[st.id] : '';
                            return `
                                <tr class="student-row" data-student-id="${st.id}" data-row-idx="${rowIdx}">
                                    <td class="td-roll sticky-col-1">
                                        <span class="roll-badge">${st.rollNo || (rowIdx + 1)}</span>
                                    </td>
                                    <td class="td-name sticky-col-2">
                                        <div class="student-name-box">
                                            <span class="st-gender-dot ${st.gender}"></span>
                                            <div>
                                                <div class="st-name-text">${st.name}</div>
                                                <div style="font-family: monospace; font-size: 0.72rem; color: #0d5c31; font-weight: 700;">${st.studentId || ('1900-C' + ((cls.className||'1').replace(/\D/g,'')||'1') + '-' + String(st.rollNo||(rowIdx+1)).padStart(2,'0'))}</div>
                                            </div>
                                        </div>
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
                                    <td class="td-mark-input" style="background: #f8fafc;">
                                        <input 
                                            type="text" 
                                            class="attendance-input form-control" 
                                            value="${attVal}" 
                                            data-student-id="${st.id}" 
                                            placeholder="—"
                                            maxlength="8"
                                            autocomplete="off"
                                            title="Attendance / ഹാജർ"
                                            style="text-align: center; font-weight: 700; color: #0284c7; padding: 4px;"
                                        >
                                    </td>
                                    <td class="td-calc td-total font-mono" id="total-${st.id}">
                                        <strong>${res.hasAnyMark ? res.totalScored : '-'}</strong>
                                        <span class="text-muted">/${res.totalMax}</span>
                                    </td>
                                    <td class="td-calc td-rank font-mono" id="rank-${st.id}">
                                        ${this.filterCategory === 'all_total_rank' ? (
                                            res.hasAnyMark 
                                                ? `<span class="badge" style="background:#f1f5f9; color:#0f172a; font-weight:800; border:1px solid #cbd5e1;">#${res.totalRank || '-'}</span>` 
                                                : '-'
                                        ) : (
                                            res.hasAnyMark 
                                                ? (res.rank && res.rank !== '-' ? `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:800; border:1px solid #fde68a;">🏆 ${res.rank}</span>` : '-') 
                                                : '-'
                                        )}
                                    </td>
                                    <td class="td-calc td-status" id="status-${st.id}">
                                        ${res.hasAnyMark ? `<span class="badge ${res.statusClass}">${res.status === 'Pass' ? 'Pass' : 'Fail'}</span>` : '-'}
                                    </td>
                                    <td class="td-action">
                                        <button class="btn-icon btn-sync-st-cloud" data-id="${st.id}" title="Publish / Sync this student only" style="color: #0284c7; margin-right: 4px; font-size: 0.95rem;">☁️</button>
                                        <button class="btn-icon btn-share-st-wa" data-id="${st.id}" title="Share this student's Reg No to WhatsApp with Malayalam instructions" style="color: #16a34a; margin-right: 4px; font-size: 0.95rem;">💬</button>
                                        <button class="btn-icon btn-edit-student" data-id="${st.id}" title="Edit Student Details" style="color: #0d5c31; margin-right: 4px; font-size: 0.95rem;">✏️</button>
                                        <button class="btn-icon btn-del-student" data-id="${st.id}" title="Delete">&times;</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Print-Only Footer Block (Signatures for A4 Sheet Printing) -->
            <div class="print-only-footer">
                <div class="print-sig-block">
                    <div class="print-sig-line"></div>
                    <span>Class Teacher Signature</span>
                </div>
                <div class="print-sig-block">
                    <span>Date: ${new Date().toLocaleDateString('en-GB')}</span>
                </div>
                <div class="print-sig-block">
                    <div class="print-sig-line"></div>
                    <span>Headmaster Signature</span>
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
                                            <span class="student-gender-tag ${st.gender}">${st.gender === 'girl' ? 'Girl' : 'Boy'}</span>
                                        </div>
                                    </div>
                                    <div class="card-header-right">
                                        <span class="badge ${res.statusClass}" id="card-status-${st.id}">
                                            ${res.hasAnyMark ? (res.status === 'Pass' ? 'Pass' : 'Fail') : '-'}
                                        </span>
                                        <button class="btn-icon btn-sync-st-cloud" data-id="${st.id}" title="Publish / Sync this student only" style="color: #0284c7; margin-right: 4px; font-size: 0.95rem;">☁️</button>
                                        <button class="btn-icon btn-share-st-wa" data-id="${st.id}" title="Share this student's Reg No on WhatsApp with Malayalam instructions" style="color: #16a34a; margin-right: 4px; font-size: 0.95rem;">💬</button>
                                        <button class="btn-icon btn-edit-student" data-id="${st.id}" title="Edit Student Details" style="color: #0d5c31; margin-right: 4px; font-size: 0.95rem;">✏️</button>
                                        <button class="btn-icon btn-del-student" data-id="${st.id}" title="Delete">&times;</button>
                                    </div>
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
                                                    <span class="card-topic-sub">Max: ${t.maxMarks} • Min: ${passMark}</span>
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
                                        <span class="summary-label">Total</span>
                                        <span class="summary-val font-mono" id="card-total-${st.id}">
                                            ${res.hasAnyMark ? `${res.totalScored}/${res.totalMax}` : '-'}
                                        </span>
                                    </div>
                                    <div class="card-summary-item">
                                        <span class="summary-label">${this.filterCategory === 'all_total_rank' ? 'Total Rank' : 'Rank'}</span>
                                        <span class="summary-val font-mono" id="card-rank-${st.id}">
                                            ${this.filterCategory === 'all_total_rank' 
                                                ? (res.hasAnyMark ? `#${res.totalRank || '-'}` : '-') 
                                                : (res.hasAnyMark ? (res.rank && res.rank !== '-' ? `🏆 ${res.rank}` : '-') : '-')}
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
            <div class="sheet-quick-footer">
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
        const genderLabel = this.activeTab === 'boys' ? 'Boys' : (this.activeTab === 'girls' ? 'Girls' : 'Students');
        return `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <h4 class="empty-title">No ${genderLabel} Added Yet</h4>
                <p class="empty-desc">Add students manually, or import entire class lists using Excel or AI camera scan.</p>
                <div class="empty-actions-row">
                    <button class="btn btn-primary" id="btn-empty-add-st">
                        + Add Student
                    </button>
                    <button class="btn btn-outline" id="btn-empty-excel">
                        📊 Upload Excel
                    </button>
                    <button class="btn btn-outline" id="btn-empty-ai">
                        📷 AI Scan
                    </button>
                </div>
            </div>
        `;
    }

    _renderAnalyticsTab(stats, cls) {
        return `
            <div class="analytics-container">
                <div class="analytics-top-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="margin: 0;">Result Analytics</h4>
                    <button class="btn btn-primary btn-sm btn-print" id="btn-print-analytics">
                        Print Report
                    </button>
                </div>

                <div class="analytics-cards-grid">
                    <div class="stat-card">
                        <div class="stat-label">Total Students</div>
                        <div class="stat-value">${stats.totalStudents}</div>
                        <div class="stat-sub">${stats.boysCount} Boys • ${stats.girlsCount} Girls</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Pass Percentage</div>
                        <div class="stat-value text-success">${stats.passRate}%</div>
                        <div class="stat-sub">${stats.passedCount} Passed • ${stats.failedCount} Failed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Average Score</div>
                        <div class="stat-value font-mono">${stats.avgScore} <span class="font-sm text-muted">/ ${stats.totalMaxMarks}</span></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Subjects</div>
                        <div class="stat-value">${stats.topicsCount}</div>
                    </div>
                </div>

                <div class="analytics-table-card">
                    <h4 class="card-title">Subject-wise Performance</h4>
                    <div class="table-responsive-container">
                        <table class="marksheet-table stats-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Max</th>
                                    <th>Pass</th>
                                    <th>Average</th>
                                    <th>Highest</th>
                                    <th>Count</th>
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

                <!-- 1. Winners Merit Rank List (All-Subject Passed Rankers) -->
                <div class="analytics-table-card" style="border-left: 4px solid #f59e0b;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <div>
                            <h4 class="card-title" style="margin: 0; color: #b45309; display: flex; align-items: center; gap: 6px;">
                                <span>🏆</span> Winners Merit Rank List
                            </h4>
                            <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Students who passed in all subjects, ranked by highest total marks.</p>
                        </div>
                        <span class="badge" style="background: #fef3c7; color: #92400e; font-weight: 700;">
                            ${stats.allResults.filter(r => r.isPassed && r.hasAnyMark && r.rank !== '-').length} Winners
                        </span>
                    </div>

                    <div class="table-responsive-container">
                        <table class="marksheet-table">
                            <thead>
                                <tr>
                                    <th style="width: 80px; text-align: center;">Rank</th>
                                    <th style="width: 70px;">Roll</th>
                                    <th>Student Name</th>
                                    <th style="text-align: center;">Gender</th>
                                    <th style="text-align: right;">Total Scored</th>
                                    <th style="text-align: center;">Percentage</th>
                                    <th style="text-align: center;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(() => {
                                    const winners = [...stats.allResults]
                                        .filter(r => r.isPassed && r.hasAnyMark && r.rank !== '-')
                                        .sort((a, b) => (Number(a.rank) || 999) - (Number(b.rank) || 999));

                                    if (winners.length === 0) {
                                        return `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 20px;">No qualified all-subject passed rankers yet.</td></tr>`;
                                    }

                                    return winners.map(w => {
                                        const rNum = Number(w.rank);
                                        const medal = rNum === 1 ? '🥇 Rank 1' : (rNum === 2 ? '🥈 Rank 2' : (rNum === 3 ? '🥉 Rank 3' : `Rank ${w.rank}`));
                                        const medalStyle = rNum === 1 ? 'background: #fef3c7; color: #92400e; font-weight: 800; border: 1.5px solid #f59e0b;' :
                                                           rNum === 2 ? 'background: #f1f5f9; color: #334155; font-weight: 800; border: 1.5px solid #94a3b8;' :
                                                           rNum === 3 ? 'background: #ffedd5; color: #9a3412; font-weight: 800; border: 1.5px solid #fb923c;' :
                                                           'background: #f8fafc; color: #475569; font-weight: 700;';
                                        return `
                                            <tr>
                                                <td style="text-align: center;">
                                                    <span class="badge" style="${medalStyle} font-size: 0.8rem; padding: 4px 8px;">${medal}</span>
                                                </td>
                                                <td class="font-mono font-bold">${w.student.rollNo || '-'}</td>
                                                <td>
                                                    <div style="font-weight: 700; color: #0f172a;">${w.student.name}</div>
                                                    ${w.student.arabicName ? `<div style="font-family: 'Amiri', serif; color: #0d5c31; font-size: 0.88rem;">${w.student.arabicName}</div>` : ''}
                                                </td>
                                                <td style="text-align: center; text-transform: capitalize; color: #64748b; font-size: 0.82rem;">${w.student.gender || '-'}</td>
                                                <td style="text-align: right;" class="font-mono">
                                                    <strong style="color: #0d5c31; font-size: 1rem;">${w.totalScored}</strong>
                                                    <span style="color: #94a3b8; font-size: 0.78rem;">/${w.totalMax}</span>
                                                </td>
                                                <td style="text-align: center; font-weight: 700; color: #0284c7;" class="font-mono">${w.percentage}%</td>
                                                <td style="text-align: center;">
                                                    <span class="badge badge-pass">Pass</span>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('');
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 2. All Students Total Mark Rank List (Rank by Total Marks - Pass & Fail) -->
                <div class="analytics-table-card" style="border-left: 4px solid #0284c7;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <div>
                            <h4 class="card-title" style="margin: 0; color: #0369a1; display: flex; align-items: center; gap: 6px;">
                                <span>📊</span> All Students Total Mark Rank List
                            </h4>
                            <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Complete ranking of every student purely by total marks obtained (both Pass and Fail included).</p>
                        </div>
                        <span class="badge" style="background: #e0f2fe; color: #0369a1; font-weight: 700;">
                            ${stats.allResults.filter(r => r.hasAnyMark).length} Total Ranked
                        </span>
                    </div>

                    <div class="table-responsive-container">
                        <table class="marksheet-table">
                            <thead>
                                <tr>
                                    <th style="width: 80px; text-align: center;">Total Rank</th>
                                    <th style="width: 70px;">Roll</th>
                                    <th>Student Name</th>
                                    <th style="text-align: center;">Gender</th>
                                    <th style="text-align: right;">Total Scored</th>
                                    <th style="text-align: center;">Percentage</th>
                                    <th style="text-align: center;">Exam Status</th>
                                    <th style="text-align: center;">Winners Merit</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(() => {
                                    const allRanked = [...stats.allResults]
                                        .filter(r => r.hasAnyMark)
                                        .sort((a, b) => (Number(a.totalRank) || 999) - (Number(b.totalRank) || 999));

                                    if (allRanked.length === 0) {
                                        return `<tr><td colspan="8" style="text-align: center; color: #94a3b8; padding: 20px;">No mark entries available yet.</td></tr>`;
                                    }

                                    return allRanked.map(r => {
                                        return `
                                            <tr style="${!r.isPassed ? 'background: #fff8f8;' : ''}">
                                                <td style="text-align: center;">
                                                    <span class="badge" style="background: #f1f5f9; color: #0f172a; font-weight: 800; border: 1px solid #cbd5e1; font-size: 0.82rem; padding: 3px 8px;">
                                                        #${r.totalRank || '-'}
                                                    </span>
                                                </td>
                                                <td class="font-mono font-bold">${r.student.rollNo || '-'}</td>
                                                <td>
                                                    <div style="font-weight: 700; color: #0f172a;">${r.student.name}</div>
                                                    ${r.student.arabicName ? `<div style="font-family: 'Amiri', serif; color: #0d5c31; font-size: 0.88rem;">${r.student.arabicName}</div>` : ''}
                                                </td>
                                                <td style="text-align: center; text-transform: capitalize; color: #64748b; font-size: 0.82rem;">${r.student.gender || '-'}</td>
                                                <td style="text-align: right;" class="font-mono">
                                                    <strong style="color: ${r.isPassed ? '#0d5c31' : '#b91c1c'}; font-size: 1rem;">${r.totalScored}</strong>
                                                    <span style="color: #94a3b8; font-size: 0.78rem;">/${r.totalMax}</span>
                                                </td>
                                                <td style="text-align: center; font-weight: 700; color: #475569;" class="font-mono">${r.percentage}%</td>
                                                <td style="text-align: center;">
                                                    <span class="badge ${r.statusClass}">${r.status === 'Pass' ? 'Pass' : 'Fail'}</span>
                                                </td>
                                                <td style="text-align: center;">
                                                    ${(r.isPassed && r.rank && r.rank !== '-') 
                                                        ? `<span class="badge" style="background: #fef3c7; color: #92400e; font-weight: 800;">🏆 Rank ${r.rank}</span>` 
                                                        : `<span style="color: #94a3b8; font-size: 0.8rem;">—</span>`}
                                                </td>
                                            </tr>
                                        `;
                                    }).join('');
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // 1-Click Excel / CSV Importer Modal
    // =========================================================================
    showExcelImportModal() {
        const cls = this.currentClass;
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal-backdrop" id="excel-modal-backdrop">
                <div class="modal-box modal-lg mobile-sheet">
                    <div class="modal-header">
                        <h3 class="modal-title">Import Excel / CSV</h3>
                        <button class="modal-close" id="btn-close-excel-modal">&times;</button>
                    </div>

                    <div class="modal-body">
                        <div class="excel-import-top">
                            <button type="button" class="btn btn-outline btn-sm" id="btn-download-sample-excel">
                                Download Template
                            </button>
                        </div>

                        <!-- Upload Dropzone Area -->
                        <div class="upload-dropzone" id="excel-dropzone">
                            <h4 class="dropzone-title">Drop Excel / CSV file here</h4>
                            <input type="file" id="excel-file-input" accept=".xlsx, .xls, .csv" style="display:none;">
                            <button type="button" class="btn btn-primary btn-sm" id="btn-browse-excel">
                                Browse File
                            </button>
                        </div>

                        <!-- Parsed Preview Area -->
                        <div id="excel-preview-container" style="display: none; margin-top: 1.25rem;"></div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-ghost" id="btn-cancel-excel">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-confirm-import-excel" disabled>
                            Import to Marksheet
                        </button>
                    </div>
                </div>
            </div>
        `;

        const closeModal = () => { modalContainer.innerHTML = ''; };
        document.getElementById('btn-close-excel-modal').addEventListener('click', closeModal);
        document.getElementById('btn-cancel-excel').addEventListener('click', closeModal);

        document.getElementById('btn-download-sample-excel').addEventListener('click', () => {
            this._downloadExcelTemplate(cls);
        });

        const fileInput = document.getElementById('excel-file-input');
        const browseBtn = document.getElementById('btn-browse-excel');
        const dropzone = document.getElementById('excel-dropzone');

        browseBtn.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('click', (e) => {
            if (e.target !== browseBtn) fileInput.click();
        });

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                this._handleExcelFile(e.dataTransfer.files[0], cls);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this._handleExcelFile(e.target.files[0], cls);
            }
        });
    }

    _downloadExcelTemplate(cls) {
        const XLSX = window.XLSX;
        if (!XLSX) {
            alert('Excel library not available.');
            return;
        }

        const topics = cls.topics || [];
        const headers = [
            'Roll No',
            'Student Name',
            'Gender',
            ...topics.map(t => `${t.name} (${t.maxMarks})`)
        ];

        const sampleRows = [
            headers,
            [1, 'Muhammed Rayan', 'Boy', ...topics.map(t => Math.floor(t.maxMarks * 0.92))],
            [2, 'Fathima Sana', 'Girl', ...topics.map(t => Math.floor(t.maxMarks * 0.74))],
            [3, 'Abdullah', 'Boy', ...topics.map(t => Math.floor(t.maxMarks * 0.48))],
            [4, 'Ahmed Kabeer', 'Boy', ...topics.map(t => Math.floor(t.maxMarks * 0.32))]
        ];

        const ws = XLSX.utils.aoa_to_sheet(sampleRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Marksheet Template');
        const safeName = (cls.className || 'Class').replace(/\s+/g, '_');
        XLSX.writeFile(wb, `${safeName}_Excel_Template.xlsx`);
    }

    _handleExcelFile(file, cls) {
        const XLSX = window.XLSX;
        if (!XLSX) {
            alert('Excel parser not available.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                if (!rawRows || rawRows.length < 2) {
                    alert('No data found in Excel file.');
                    return;
                }

                let headerRowIndex = 0;
                for (let i = 0; i < Math.min(rawRows.length, 6); i++) {
                    const rowStr = rawRows[i].join(' ').toLowerCase();
                    if (rowStr.includes('name') || rowStr.includes('student') || rowStr.includes('roll')  || rowStr.includes('student')) {
                        headerRowIndex = i;
                        break;
                    }
                }

                const headerRow = rawRows[headerRowIndex];
                let rollIdx = -1;
                let nameIdx = -1;
                let genderIdx = -1;
                const topicCols = [];

                headerRow.forEach((col, idx) => {
                    const colStr = (col || '').toString().trim().toLowerCase();
                    if (colStr.includes('roll') || colStr.includes('roll') || colStr.includes('sl') || colStr === 'no') {
                        rollIdx = idx;
                    } else if (colStr.includes('name') || colStr.includes('student') || colStr.includes('student')) {
                        nameIdx = idx;
                    } else if (colStr.includes('gender') || colStr.includes('gender') || colStr.includes('sex')) {
                        genderIdx = idx;
                    } else if (col.toString().trim() !== '') {
                        const rawName = col.toString().trim();
                        let maxMarks = 50;
                        const match = rawName.match(/\b(?:max)?\s*[:=]?\s*(\d+)/i) || rawName.match(/\((\d+)\)/);
                        if (match && match[1]) maxMarks = Number(match[1]);
                        const cleanName = rawName.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
                        topicCols.push({ colIdx: idx, name: cleanName || rawName, maxMarks });
                    }
                });

                if (nameIdx === -1) {
                    nameIdx = (rollIdx === 0) ? 1 : 0;
                }

                const parsedStudents = [];
                const parsedMarks = {};

                for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
                    const row = rawRows[i];
                    if (!row || row.every(c => c === '' || c === undefined || c === null)) continue;

                    const rollVal = (rollIdx !== -1 && row[rollIdx] !== undefined) ? row[rollIdx].toString().trim() : (parsedStudents.length + 1).toString();
                    const nameVal = (nameIdx !== -1 && row[nameIdx] !== undefined) ? row[nameIdx].toString().trim() : `Student ${rollVal}`;
                    const genderVal = (genderIdx !== -1 && row[genderIdx]) 
                        ? (row[genderIdx].toString().toLowerCase().includes('g')  ? 'girl' : 'boy')
                        : 'boy';

                    if (!nameVal && !rollVal) continue;

                    const tempId = 'temp_' + i;
                    parsedStudents.push({
                        _tempId: tempId,
                        rollNo: rollVal,
                        name: nameVal || `Student ${rollVal}`,
                        gender: genderVal
                    });

                    parsedMarks[tempId] = {};
                    topicCols.forEach(tc => {
                        const rawMark = row[tc.colIdx];
                        if (rawMark !== undefined && rawMark !== null && rawMark !== '') {
                            const mStr = rawMark.toString().trim();
                            if (mStr.toLowerCase() === 'ab' || mStr.toLowerCase() === 'a') {
                                parsedMarks[tempId][tc.name] = 'Ab';
                            } else {
                                const num = Number(mStr);
                                parsedMarks[tempId][tc.name] = isNaN(num) ? mStr : num;
                            }
                        }
                    });
                }

                this.parsedExcelData = {
                    students: parsedStudents,
                    topics: topicCols,
                    marks: parsedMarks
                };

                this._renderExcelPreview(this.parsedExcelData);

            } catch (err) {
                alert('Error reading Excel file: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    _renderExcelPreview({ students, topics, marks }) {
        const previewContainer = document.getElementById('excel-preview-container');
        const confirmBtn = document.getElementById('btn-confirm-import-excel');
        if (!previewContainer) return;

        previewContainer.style.display = 'block';
        confirmBtn.disabled = false;

        previewContainer.innerHTML = `
            <div class="preview-badge-bar">
                <span class="preview-count-chip">${students.length} Students</span>
                <span class="preview-count-chip">${topics.length} Subjects</span>
            </div>

            <div class="table-responsive-container preview-table-wrap">
                <table class="marksheet-table stats-table font-sm">
                    <thead>
                        <tr>
                            <th>Roll</th>
                            <th>Student Name</th>
                            <th>Gender</th>
                            ${topics.map(t => `<th>${t.name}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${students.slice(0, 5).map(st => `
                            <tr>
                                <td>${st.rollNo}</td>
                                <td><strong>${st.name}</strong></td>
                                <td>${st.gender === 'girl' ? 'Girl' : 'Boy'}</td>
                                ${topics.map(t => {
                                    const val = marks[st._tempId]?.[t.name] ?? '-';
                                    return `<td>${val}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        confirmBtn.onclick = () => {
            const res = window.marksheetController.importExcelData(this.currentClass.id, this.parsedExcelData);
            if (res && res.success) {
                alert(`Successfully imported!\n• ${res.addedCount} students added.\n• ${res.updatedCount} marks updated.`);
                document.getElementById('modal-container').innerHTML = '';
            }
        };
    }

    // =========================================================================
    // Gemini 1.5 Flash AI Photo / Sheet Scanner Modal
    // =========================================================================
    showGeminiScanModal() {
        const cls = this.currentClass;
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        const savedKey = localStorage.getItem('marksheet_gemini_key') || '';

        modalContainer.innerHTML = `
            <div class="modal-backdrop" id="ai-modal-backdrop">
                <div class="modal-box modal-lg mobile-sheet">
                    <div class="modal-header">
                        <h3 class="modal-title">Gemini AI Photo Scanner</h3>
                        <button class="modal-close" id="btn-close-ai-modal">&times;</button>
                    </div>

                    <div class="modal-body">
                        <!-- Gemini API Key configuration -->
                        <div class="form-group mb-3">
                            <label class="form-label mb-1">Gemini API Key</label>
                            <input 
                                type="password" 
                                id="input-gemini-key" 
                                class="form-control font-mono" 
                                placeholder="API Key" 
                                value="${savedKey}"
                            >
                        </div>

                        <!-- Image Capture / File Picker -->
                        <div class="ai-capture-section">
                            <div class="capture-buttons-row">
                                <label class="btn btn-primary btn-sm flex-1 cursor-pointer">
                                    Camera
                                    <input type="file" id="ai-camera-input" accept="image/*" capture="environment" style="display:none;">
                                </label>
                                <label class="btn btn-outline btn-sm flex-1 cursor-pointer">
                                    Gallery
                                    <input type="file" id="ai-file-input" accept="image/*" style="display:none;">
                                </label>
                            </div>

                            <div id="ai-photo-preview-wrap" style="display:none;" class="photo-preview-card mt-3">
                                <img id="ai-preview-img" src="" alt="Marksheet preview" class="preview-img-tag">
                                <div class="photo-meta-bar">
                                    <span id="photo-file-name" class="font-sm font-bold"></span>
                                    <button type="button" class="btn btn-primary btn-sm" id="btn-start-gemini-ocr">
                                        Extract Data
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div id="ai-loading-box" style="display:none;" class="ai-loading-box">
                            <div class="ai-pulse-spinner"></div>
                            <h4 class="mt-2">Processing marksheet photo...</h4>
                        </div>

                        <div id="ai-results-wrap" style="display:none; margin-top:1.25rem;"></div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-ghost" id="btn-cancel-ai">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-confirm-import-ai" disabled>
                            Import to Marksheet
                        </button>
                    </div>
                </div>
            </div>
        `;

        const closeModal = () => { modalContainer.innerHTML = ''; };
        document.getElementById('btn-close-ai-modal').addEventListener('click', closeModal);
        document.getElementById('btn-cancel-ai').addEventListener('click', closeModal);

        const cameraInput = document.getElementById('ai-camera-input');
        const fileInput = document.getElementById('ai-file-input');
        const previewWrap = document.getElementById('ai-photo-preview-wrap');
        const previewImg = document.getElementById('ai-preview-img');
        const fileNameLabel = document.getElementById('photo-file-name');
        const startBtn = document.getElementById('btn-start-gemini-ocr');
        const keyInput = document.getElementById('input-gemini-key');

        let selectedBase64 = null;
        let selectedMimeType = 'image/jpeg';

        const handleImageSelection = (file) => {
            if (!file) return;
            selectedMimeType = file.type || 'image/jpeg';
            fileNameLabel.innerText = file.name;

            const reader = new FileReader();
            reader.onload = (e) => {
                selectedBase64 = e.target.result;
                previewImg.src = selectedBase64;
                previewWrap.style.display = 'block';
                document.getElementById('ai-results-wrap').style.display = 'none';
            };
            reader.readAsDataURL(file);
        };

        cameraInput.addEventListener('change', (e) => handleImageSelection(e.target.files[0]));
        fileInput.addEventListener('change', (e) => handleImageSelection(e.target.files[0]));

        startBtn.addEventListener('click', async () => {
            const apiKey = keyInput.value.trim();
            if (!apiKey) {
                alert('Please enter your Gemini API Key.');
                keyInput.focus();
                return;
            }
            localStorage.setItem('marksheet_gemini_key', apiKey);

            if (!selectedBase64) {
                alert('Please select an image first.');
                return;
            }

            const loadingBox = document.getElementById('ai-loading-box');
            const resultsWrap = document.getElementById('ai-results-wrap');
            const confirmBtn = document.getElementById('btn-confirm-import-ai');

            loadingBox.style.display = 'block';
            resultsWrap.style.display = 'none';
            confirmBtn.disabled = true;

            try {
                const extractedStudents = await this._runGeminiExtraction(selectedBase64, selectedMimeType, apiKey);
                loadingBox.style.display = 'none';

                if (!Array.isArray(extractedStudents) || extractedStudents.length === 0) {
                    alert('Could not extract data from image. Please provide a clearer photo.');
                    return;
                }

                this.parsedGeminiData = extractedStudents;
                this._renderGeminiPreview(extractedStudents);
            } catch (err) {
                loadingBox.style.display = 'none';
                alert('Error: ' + err.message);
            }
        });
    }

    async _runGeminiExtraction(imageBase64, mimeType, apiKey) {
        try {
            const res = await fetch('/api/gemini-extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Gemini-Key': apiKey },
                body: JSON.stringify({ image: imageBase64, mimeType, apiKey })
            });
            const json = await res.json();
            if (json.success && Array.isArray(json.students)) {
                return json.students;
            }
        } catch (e) {
            console.warn('Backend proxy fallback...', e);
        }

        const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        const prompt = `Extract all students and their subject marks into a JSON array: [{"rollNo": "1", "name": "Student Name", "gender": "boy", "marks": {"Subject1": 45}}]. Return ONLY the valid JSON array without markdown backticks.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const payload = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: mimeType, data: cleanBase64 } }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.1,
                response_mime_type: "application/json"
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Google API Error (${response.status}): ${errBody}`);
        }

        const data = await response.json();
        let textContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        if (textContent.startsWith('```')) {
            textContent = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        return JSON.parse(textContent);
    }

    _renderGeminiPreview(studentsList) {
        const resultsWrap = document.getElementById('ai-results-wrap');
        const confirmBtn = document.getElementById('btn-confirm-import-ai');
        if (!resultsWrap) return;

        resultsWrap.style.display = 'block';
        confirmBtn.disabled = false;

        resultsWrap.innerHTML = `
            <div class="preview-badge-bar">
                <span class="preview-count-chip text-success">${studentsList.length} Students</span>
            </div>

            <div class="table-responsive-container preview-table-wrap">
                <table class="marksheet-table stats-table font-sm">
                    <thead>
                        <tr>
                            <th>Roll</th>
                            <th>Student Name</th>
                            <th>Gender</th>
                            <th>Marks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentsList.map(st => `
                            <tr>
                                <td>${st.rollNo || '-'}</td>
                                <td><strong>${st.name}</strong></td>
                                <td>${st.gender === 'girl' ? 'Girl' : 'Boy'}</td>
                                <td class="font-mono">
                                    ${st.marks && Object.keys(st.marks).length > 0 
                                        ? Object.entries(st.marks).map(([k, v]) => `${k}: ${v}`).join(', ') 
                                        : '<span class="text-muted">-</span>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        confirmBtn.onclick = () => {
            const res = window.marksheetController.importGeminiData(this.currentClass.id, this.parsedGeminiData);
            if (res && res.success) {
                alert(`AI scan completed!\n• ${res.addedCount} students added.\n• ${res.updatedCount} marks updated.`);
                document.getElementById('modal-container').innerHTML = '';
            }
        };
    }

    // =========================================================================
    // Manage Topics & Add Student Modals
    // =========================================================================
    showAddStudentModal(studentToEdit = null) {
        const cls = this.currentClass;
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        const isEditing = !!studentToEdit;
        const modalTitle = isEditing ? 'Edit Student Details' : 'Add Student Registration';
        const submitBtnText = isEditing ? 'Save Changes' : 'Add Student';

        const rollVal = isEditing ? (studentToEdit.rollNo || '') : ((cls.students || []).length + 1).toString();
        const nameVal = isEditing ? (studentToEdit.name || '') : '';
        const arNameVal = isEditing ? (studentToEdit.arabicName || '') : '';
        const parentVal = isEditing ? (studentToEdit.parentName || '') : '';
        const arParentVal = isEditing ? (studentToEdit.parentArabicName || '') : '';
        const isGirl = isEditing ? (studentToEdit.gender === 'girl') : (this.activeTab === 'girls');

        modalContainer.innerHTML = `
            <div class="modal-backdrop" id="add-student-modal-backdrop">
                <div class="modal-box mobile-sheet modal-lg">
                    <div class="modal-header">
                        <h3 class="modal-title">${modalTitle}</h3>
                        <button class="modal-close" id="btn-close-st-modal">&times;</button>
                    </div>
                    <form id="add-student-form">
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group" style="max-width: 140px;">
                                    <label class="form-label">Reg. No / Roll *</label>
                                    <input type="text" id="modal-roll" class="form-control" value="${rollVal}" required>
                                </div>
                                <div class="form-group flex-1">
                                    <label class="form-label">Student Full Name *</label>
                                    <input type="text" id="modal-name" class="form-control" value="${nameVal}" placeholder="e.g. SARA JAZEELA" required autofocus>
                                </div>
                                <div class="form-group flex-1">
                                    <label class="form-label">Name (Arabic)</label>
                                    <input type="text" id="modal-name-ar" class="form-control" value="${arNameVal}" placeholder="الاسم بالعربية (e.g. جميلة)" dir="rtl">
                                </div>
                            </div>

                            <div class="form-row mt-2">
                                <div class="form-group flex-1">
                                    <label class="form-label">Parent / Guardian Name</label>
                                    <input type="text" id="modal-parent" class="form-control" value="${parentVal}" placeholder="D/o or S/o (e.g. ABDUL LATHEEF)">
                                </div>
                                <div class="form-group flex-1">
                                    <label class="form-label">Parent (Arabic)</label>
                                    <input type="text" id="modal-parent-ar" class="form-control" value="${arParentVal}" placeholder="اسم الوالد (e.g. عبد اللطيف)" dir="rtl">
                                </div>
                            </div>

                            <div class="form-group mt-2">
                                <label class="form-label">Gender</label>
                                <div class="radio-group">
                                    <label class="radio-label">
                                        <input type="radio" name="st-gender" value="boy" ${!isGirl ? 'checked' : ''}>
                                        <span>Boy</span>
                                    </label>
                                    <label class="radio-label">
                                        <input type="radio" name="st-gender" value="girl" ${isGirl ? 'checked' : ''}>
                                        <span>Girl</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-ghost" id="btn-cancel-st">Cancel</button>
                            <button type="submit" class="btn btn-primary">${submitBtnText}</button>
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
            const arabicName = document.getElementById('modal-name-ar').value.trim();
            const parentName = document.getElementById('modal-parent').value.trim();
            const parentArabicName = document.getElementById('modal-parent-ar').value.trim();
            const gender = document.querySelector('input[name="st-gender"]:checked').value;

            if (name) {
                if (isEditing) {
                    window.marksheetController.updateStudent(cls.id, studentToEdit.id, {
                        rollNo,
                        name,
                        arabicName,
                        parentName,
                        parentArabicName,
                        gender
                    });
                } else {
                    window.marksheetController.addStudent(cls.id, {
                        rollNo,
                        name,
                        arabicName,
                        parentName,
                        parentArabicName,
                        gender
                    });
                }
                closeModal();
            }
        });
    }

    showBulkAddModal() {
        const cls = this.currentClass;
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        const currentCount = (cls.students || []).length;
        const defaultStartRoll = currentCount + 1;

        modalContainer.innerHTML = `
            <div class="modal-backdrop" id="bulk-add-modal-backdrop">
                <div class="modal-box mobile-sheet modal-lg">
                    <div class="modal-header">
                        <div style="display:flex; align-items:center; gap: 10px;">
                            <span style="font-size: 1.4rem;">📋</span>
                            <div>
                                <h3 class="modal-title" style="margin: 0;">Bulk Add Students</h3>
                                <p style="font-size: 0.78rem; color: #64748b; margin: 0;">Quickly paste multiple student names into this class</p>
                            </div>
                        </div>
                        <button class="modal-close" id="btn-close-bulk-modal">&times;</button>
                    </div>
                    <form id="bulk-add-form">
                        <div class="modal-body" style="padding: 20px;">
                            <div class="form-row" style="margin-bottom: 14px;">
                                <div class="form-group flex-1">
                                    <label class="form-label">Default Gender</label>
                                    <div class="radio-group">
                                        <label class="radio-label">
                                            <input type="radio" name="bulk-gender" value="boy" ${this.activeTab !== 'girls' ? 'checked' : ''}>
                                            <span>Boys</span>
                                        </label>
                                        <label class="radio-label">
                                            <input type="radio" name="bulk-gender" value="girl" ${this.activeTab === 'girls' ? 'checked' : ''}>
                                            <span>Girls</span>
                                        </label>
                                    </div>
                                </div>
                                <div class="form-group" style="max-width: 170px;">
                                    <label class="form-label">Starting Roll No</label>
                                    <input type="number" id="bulk-start-roll" class="form-control" value="${defaultStartRoll}" min="1">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label" style="display: flex; justify-content: space-between;">
                                    <span>Paste Student Names (One per line) *</span>
                                    <span style="font-size: 0.75rem; color: #0d5c31; font-weight: 600;">Supports: Roll No + Name OR Name only</span>
                                </label>
                                <textarea 
                                    id="bulk-names-textarea" 
                                    class="form-control" 
                                    rows="9" 
                                    placeholder="1. MUHAMMED ALI&#10;2. AHMED SHAFEEQ&#10;3. FATHIMA ZAHRA&#10;or simply paste:&#10;SULAIMAN&#10;IBRAHIM" 
                                    required 
                                    style="font-family: monospace; font-size: 0.9rem; line-height: 1.6;"
                                    autofocus
                                ></textarea>
                            </div>

                            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 0.78rem; color: #166534;">
                                💡 <strong>Tip:</strong> You can paste directly from WhatsApp, Excel, or Word. Numbers at the beginning of each line will be recognized as Roll Numbers automatically.
                            </div>
                        </div>

                        <div class="modal-footer" style="padding: 14px 20px;">
                            <button type="button" class="btn btn-ghost" id="btn-cancel-bulk">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="btn-submit-bulk">
                                + Add All Students
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const closeModal = () => { modalContainer.innerHTML = ''; };
        document.getElementById('btn-close-bulk-modal').addEventListener('click', closeModal);
        document.getElementById('btn-cancel-bulk').addEventListener('click', closeModal);

        document.getElementById('bulk-add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const rawText = document.getElementById('bulk-names-textarea').value.trim();
            const startRoll = parseInt(document.getElementById('bulk-start-roll').value, 10) || defaultStartRoll;
            const defaultGender = document.querySelector('input[name="bulk-gender"]:checked').value;

            if (!rawText) return;

            const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
            const parsedList = [];
            let currentRoll = startRoll;

            lines.forEach((line) => {
                // Check if line starts with roll number (e.g. "1. Ali", "1 - Ali", "01 Ali")
                const match = line.match(/^(\d+)[\.\-\)\s\t]+(.*)$/);
                let roll = '';
                let name = line;
                if (match) {
                    roll = match[1];
                    name = match[2].trim();
                } else {
                    roll = currentRoll.toString();
                    currentRoll++;
                }

                if (name) {
                    parsedList.push({
                        rollNo: roll,
                        name: name.toUpperCase(),
                        gender: defaultGender
                    });
                }
            });

            if (parsedList.length === 0) {
                alert('No valid student names found.');
                return;
            }

            window.marksheetController.addBulkStudents(cls.id, parsedList);
            closeModal();
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
                        <h3 class="modal-title">Manage Subjects</h3>
                        <button class="modal-close" id="btn-close-topics-modal">&times;</button>
                    </div>
                    <form id="manage-topics-form">
                        <div class="modal-body">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <label class="form-label" style="margin:0;">Subjects</label>
                                <select id="dropdown-quick-subject" class="form-control" style="max-width:280px; font-size:0.85rem;">
                                    <option value="">-- Add Standard Subject --</option>
                                    <option value="FIQH (الفقه)">FIQH (الفقه)</option>
                                    <option value="LISANUL QUR'AN (لسان القرآن)">LISANUL QUR'AN (لسان القرآن)</option>
                                    <option value="DUROOSUL IHSAN (دروس الإحسان)">DUROOSUL IHSAN (دروس الإحسان)</option>
                                    <option value="THAREEKH (التّاريخ)">THAREEKH (التّاريخ)</option>
                                    <option value="QUR'AN (القرآن الكريم)">QUR'AN (القرآن الكريم)</option>
                                    <option value="HIFZ (الحفظ)">HIFZ (الحفظ)</option>
                                    <option value="THAFSEER (التّفسير)">THAFSEER (التّفسير)</option>
                                    <option value="LISANUL QUR'AN - THAJVEED (التّجويد)">LISANUL QUR'AN - THAJVEED (التّجويد)</option>
                                    <option value="AQEEDA (العقيدة)">AQEEDA (العقيدة)</option>
                                    <option value="PRACTICAL EXAM (امتحان عملي)">PRACTICAL EXAM (امتحان عملي)</option>
                                </select>
                            </div>
                            <div id="modal-topics-list">
                                ${topics.map((t, idx) => `
                                    <div class="topic-manage-row" data-id="${t.id}" data-index="${idx}">
                                        <input type="text" class="form-control topic-edit-name" value="${t.name}" placeholder="Subject Name" required>
                                        <input type="number" class="form-control topic-edit-max" value="${t.maxMarks || 50}" placeholder="Max Mark" min="1" max="1000" style="max-width: 100px;" required>
                                        <button type="button" class="btn-icon btn-del-topic" data-id="${t.id}" title="Delete">&times;</button>
                                    </div>
                                `).join('')}
                            </div>
                            <button type="button" class="btn btn-outline btn-sm mt-2" id="btn-modal-add-topic">
                                + Add Subject
                            </button>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-ghost" id="btn-cancel-topics">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const closeModal = () => { modalContainer.innerHTML = ''; };
        document.getElementById('btn-close-topics-modal').addEventListener('click', closeModal);
        document.getElementById('btn-cancel-topics').addEventListener('click', closeModal);

        const listContainer = document.getElementById('modal-topics-list');
        const quickSubSelect = document.getElementById('dropdown-quick-subject');
        if (quickSubSelect) {
            quickSubSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (!val) return;
                const row = document.createElement('div');
                row.className = 'topic-manage-row';
                row.innerHTML = `
                    <input type="text" class="form-control topic-edit-name" value="${val}" placeholder="Subject Name" required>
                    <input type="number" class="form-control topic-edit-max" value="50" placeholder="Max Mark" min="1" max="1000" style="max-width: 100px;" required>
                    <button type="button" class="btn-icon btn-del-topic" title="Delete">&times;</button>
                `;
                listContainer.appendChild(row);
                row.querySelector('.btn-del-topic').addEventListener('click', () => row.remove());
                e.target.value = '';
            });
        }

        document.getElementById('btn-modal-add-topic').addEventListener('click', () => {
            const row = document.createElement('div');
            row.className = 'topic-manage-row';
            row.innerHTML = `
                <input type="text" class="form-control topic-edit-name" placeholder="Subject Name" required>
                <input type="number" class="form-control topic-edit-max" value="50" placeholder="Max Mark" min="1" max="1000" style="max-width: 100px;" required>
                <button type="button" class="btn-icon btn-del-topic" title="Delete">&times;</button>
            `;
            listContainer.appendChild(row);
            row.querySelector('.btn-del-topic').addEventListener('click', () => row.remove());
        });

        listContainer.querySelectorAll('.btn-del-topic').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('.topic-manage-row');
                if (listContainer.children.length > 1) {
                    row.remove();
                } else {
                    alert('At least one subject is required.');
                }
            });
        });

        document.getElementById('manage-topics-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const updatedTopics = [];
            listContainer.querySelectorAll('.topic-manage-row').forEach((row, i) => {
                const name = row.querySelector('.topic-edit-name').value.trim();
                const max = Number(row.querySelector('.topic-edit-max').value) || 50;
                const existingId = row.getAttribute('data-id') || ('top_' + Date.now() + '_' + i);
                if (name) updatedTopics.push({ id: existingId, name, maxMarks: max });
            });

            if (updatedTopics.length === 0) {
                alert('Please add at least one subject.');
                return;
            }

            window.marksheetController.updateTopics(cls.id, updatedTopics);
            closeModal();
        });
    }

    _bindEvents() {
        // Back to Dashboard
        const backBtn = document.getElementById('btn-back-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.classController.showDashboard();
            });
        }

        // Sheet Tabs (Boys, Girls, All, Analytics)
        document.querySelectorAll('.sheet-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.getAttribute('data-tab');
                this.activeTab = targetTab;
                this.render(this.currentClass);
            });
        });

        // View Mode Switcher
        const modeTable = document.getElementById('btn-mode-table');
        const modeCards = document.getElementById('btn-mode-cards');
        if (modeTable) {
            modeTable.addEventListener('click', () => {
                this.viewMode = 'table';
                this.render(this.currentClass);
            });
        }
        if (modeCards) {
            modeCards.addEventListener('click', () => {
                this.viewMode = 'cards';
                this.render(this.currentClass);
            });
        }

        // Filter Strip Events (Search & Category Selector)
        const filterSearchInput = document.getElementById('filter-search-input');
        if (filterSearchInput) {
            filterSearchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.render(this.currentClass);
                // Keep focus on input after render
                const updatedInput = document.getElementById('filter-search-input');
                if (updatedInput) {
                    updatedInput.focus();
                    const len = updatedInput.value.length;
                    updatedInput.setSelectionRange(len, len);
                }
            });
        }

        const filterCategorySelect = document.getElementById('filter-category-select');
        if (filterCategorySelect) {
            filterCategorySelect.addEventListener('change', (e) => {
                this.filterCategory = e.target.value;
                this.render(this.currentClass);
            });
        }

        const btnResetFilters = document.getElementById('btn-reset-filters');
        if (btnResetFilters) {
            btnResetFilters.addEventListener('click', () => {
                this.filterCategory = 'all';
                this.searchQuery = '';
                this.render(this.currentClass);
            });
        }

        // Print Buttons
        const printNav = document.getElementById('btn-print-nav');
        const printToolbar = document.getElementById('btn-print-toolbar');
        const mPrint = document.getElementById('m-btn-print');
        const printAnalytics = document.getElementById('btn-print-analytics');

        const doPrint = () => window.print();
        if (printNav) printNav.addEventListener('click', doPrint);
        if (printToolbar) printToolbar.addEventListener('click', doPrint);
        if (mPrint) mPrint.addEventListener('click', doPrint);
        if (printAnalytics) printAnalytics.addEventListener('click', doPrint);

        // Excel Import Button
        const excelBtn = document.getElementById('btn-import-excel');
        const mExcelBtn = document.getElementById('m-btn-excel');
        const emptyExcelBtn = document.getElementById('btn-empty-excel');
        if (excelBtn) excelBtn.addEventListener('click', () => this.showExcelImportModal());
        if (mExcelBtn) mExcelBtn.addEventListener('click', () => this.showExcelImportModal());
        if (emptyExcelBtn) emptyExcelBtn.addEventListener('click', () => this.showExcelImportModal());

        // Gemini AI Photo Scan Button
        const aiBtn = document.getElementById('btn-scan-gemini');
        const mAiBtn = document.getElementById('m-btn-ai');
        const emptyAiBtn = document.getElementById('btn-empty-ai');
        if (aiBtn) aiBtn.addEventListener('click', () => this.showGeminiScanModal());
        if (mAiBtn) mAiBtn.addEventListener('click', () => this.showGeminiScanModal());
        if (emptyAiBtn) emptyAiBtn.addEventListener('click', () => this.showGeminiScanModal());

        // Cloud Sync Button
        const syncBtn = document.getElementById('btn-sync-cloud');
        if (syncBtn) {
            syncBtn.addEventListener('click', async () => {
                // If results are already published and no edits have been made, avoid redundant submissions
                if (this.currentClass.publishedAt && (!this.currentClass.isDirty || (this.currentClass.editedStudentIds && this.currentClass.editedStudentIds.length === 0))) {
                    await window.showAlertDialog(
                        'Already Published',
                        'The mark list for this class is already verified and published on the live portal.<br><br>No new changes were made, so no re-submission is necessary.',
                        '✅'
                    );
                    return;
                }

                const totalStudents = (this.currentClass.students || []).length;
                if (totalStudents === 0) {
                    alert('No student records available to sync.');
                    return;
                }

                if (!navigator.onLine) {
                    alert('Network Connection Lost. Please check your internet connection before syncing.');
                    return;
                }

                const session = window.storageModel.getSession();
                const isAdmin = session && session.role === 'admin';

                syncBtn.disabled = true;
                syncBtn.innerHTML = '⏳ Submitting...';

                try {
                    const res = await window.supabaseService.syncClassToSupabase(this.currentClass, isAdmin);
                    
                    // Mark as published and clear pending modified queue
                    this.currentClass.isDirty = false;
                    this.currentClass.editedStudentIds = [];
                    this.currentClass.publishedAt = new Date().toISOString();
                    window.storageModel.saveClass(this.currentClass);

                    if (isAdmin) {
                        alert(`Success! ${res.count} student marksheets verified and published directly to the Public Result Portal.`);
                    } else {
                        const noteMsg = res.isPartial 
                            ? `Updated changes for ${res.count} student(s) submitted for verification!`
                            : `Mark list submitted for publishing (${res.count} students)!`;
                        alert(`${noteMsg}\n\nYour mark list is sent to Sadar Muallim (صدر معلم) for final verification. Once approved in the Control Room, it will be published immediately on the public portal.`);
                    }
                    this.render(this.currentClass);
                } catch (err) {
                    alert('Publish/Sync Error: ' + err.message);
                } finally {
                    syncBtn.disabled = false;
                }
            });
        }

        // Add Student buttons
        const addStBtn = document.getElementById('btn-add-student');
        const mAddStBtn = document.getElementById('m-btn-add-student');
        const emptyAddStBtn = document.getElementById('btn-empty-add-st');
        if (addStBtn) addStBtn.addEventListener('click', () => this.showAddStudentModal());
        if (mAddStBtn) mAddStBtn.addEventListener('click', () => this.showAddStudentModal());
        if (emptyAddStBtn) emptyAddStBtn.addEventListener('click', () => this.showAddStudentModal());

        // Bulk Add Student buttons
        const bulkAddBtn = document.getElementById('btn-bulk-add-students');
        const mBulkAddBtn = document.getElementById('m-btn-bulk-add');
        if (bulkAddBtn) bulkAddBtn.addEventListener('click', () => this.showBulkAddModal());
        if (mBulkAddBtn) mBulkAddBtn.addEventListener('click', () => this.showBulkAddModal());

        // Mobile bottom view toggle
        const mToggleView = document.getElementById('m-btn-toggle-view');
        if (mToggleView) {
            mToggleView.addEventListener('click', () => {
                this.viewMode = this.viewMode === 'cards' ? 'table' : 'cards';
                this.render(this.currentClass);
            });
        }

        // Sort by Roll Number column header click
        const thSortRoll = document.getElementById('th-sort-roll');
        if (thSortRoll) {
            thSortRoll.addEventListener('click', () => {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                this.render(this.currentClass);
            });
        }

        // Reorder / Sequentialize Register Numbers button
        const btnReorder = document.getElementById('btn-reorder-roll');
        if (btnReorder) {
            btnReorder.addEventListener('click', async () => {
                const confirmed = await window.showConfirmDialog(
                    'Fix & Order Register Numbers',
                    `Do you want to assign <strong>unique sequential Register Numbers (1, 2, 3...)</strong> across all students in this class?<br><br><span style="font-size:0.8rem; color:#64748b;">This will remove any duplicate roll numbers between boys and girls, keeping each student's number unique while preserving all marks.</span>`,
                    '🔢',
                    'Yes, Order All (1 to N)',
                    'Cancel'
                );
                if (confirmed) {
                    window.marksheetController.reorderRegisterNumbers(this.currentClass.id, 'all');
                }
            });
        }

        // Manage Topics button
        const manageTopBtn = document.getElementById('btn-manage-topics');
        if (manageTopBtn) manageTopBtn.addEventListener('click', () => this.showManageTopicsModal());

        // Export Actions
        const btnPdf = document.getElementById('btn-export-pdf');
        const mBtnPdf = document.getElementById('m-btn-pdf');
        if (btnPdf) btnPdf.addEventListener('click', () => window.exportView.exportPDF(this.currentClass, this.activeTab));
        if (mBtnPdf) mBtnPdf.addEventListener('click', () => window.exportView.exportPDF(this.currentClass, this.activeTab));

        const btnExcel = document.getElementById('btn-export-excel');
        if (btnExcel) btnExcel.addEventListener('click', () => window.exportView.exportExcel(this.currentClass, this.activeTab));

        // Share entire Class Register Numbers to WhatsApp group with Malayalam instructions
        const btnShareClassWa = document.getElementById('btn-share-class-wa');
        if (btnShareClassWa) {
            btnShareClassWa.addEventListener('click', () => {
                const cls = this.currentClass;
                const students = (cls.students || []).slice().sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0));
                if (students.length === 0) {
                    alert('വിദ്യാർത്ഥികളുടെ വിവരങ്ങൾ ലഭ്യമല്ല.');
                    return;
                }

                const clsNumber = (cls.className || '').replace(/\D/g, '') || '1';
                const portalUrl = window.location.origin;

                let msg = `📢 *${cls.madrasaName || 'BADRUDHEEN MADRASA'}*\n`;
                msg += `📖 *${cls.className} - പരീക്ഷാ ഫലം പ്രസിദ്ധീകരിച്ചു*\n`;
                msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
                msg += `പ്രിയ രക്ഷിതാക്കളെ/വിദ്യാർത്ഥികളെ,\n`;
                msg += `താഴെ നൽകിയിട്ടുള്ള ലിങ്കിൽ കയറി നിങ്ങളുടെ *Class* സെലക്ട് ചെയ്ത ശേഷം നൽകിയിരിക്കുന്ന *Reg. No (റജിസ്റ്റർ നമ്പർ)* നൽകി ഫലം പരിശോധിക്കാവുന്നതാണ്:\n\n`;
                msg += `🔗 *റിസൾട്ട് പോർട്ടൽ ലിങ്ക്:*\n${portalUrl}\n\n`;
                msg += `📋 *വിദ്യാർത്ഥികളും റജിസ്റ്റർ നമ്പറും:*\n`;

                students.forEach((st, idx) => {
                    const rNo = st.rollNo || (idx + 1);
                    const stId = st.studentId || `1900-C${clsNumber}-${String(rNo).padStart(2, '0')}`;
                    msg += `• *Reg No:* \`${rNo}\` (${stId}) - *${st.name}*\n`;
                });

                msg += `\n📌 *നിർദ്ദേശം:*\n`;
                msg += `1. മുകളിൽ നൽകിയ ലിങ്ക് തുറക്കുക (${portalUrl})\n`;
                msg += `2. നിങ്ങളുടെ ക്ലാസ്സ് (*${cls.className}*) തിരഞ്ഞെടുക്കുക\n`;
                msg += `3. മുകളിൽ നിങ്ങളുടെ പേരിനെതിരെ ഉള്ള *Reg No* നൽകി *'Check Result'* ക്ലിക്ക് ചെയ്യുക.\n\n`;
                msg += `_ശുഭാശംസകൾ!_ ✨`;

                const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                window.open(waUrl, '_blank');
            });
        }

        // Single student WhatsApp share button
        document.querySelectorAll('.btn-share-st-wa').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.currentTarget.getAttribute('data-id');
                const cls = this.currentClass;
                const st = (cls.students || []).find(s => s.id === studentId);
                if (!st) return;

                const clsNumber = (cls.className || '').replace(/\D/g, '') || '1';
                const rNo = st.rollNo || '1';
                const fullId = st.studentId || `1900-C${clsNumber}-${String(rNo).padStart(2, '0')}`;
                const portalUrl = window.location.origin;

                let msg = `📢 *${cls.madrasaName || 'BADRUDHEEN MADRASA'}*\n`;
                msg += `📖 *${cls.className} - പരീക്ഷാ ഫലം*\n`;
                msg += `━━━━━━━━━━━━━━━━━━━━\n`;
                msg += `👤 *വിദ്യാർത്ഥിയുടെ പേര്:* *${st.name}*\n`;
                msg += `🆔 *റജിസ്റ്റർ നമ്പർ (Reg No):* \`${rNo}\`\n`;
                msg += `🔢 *Student ID:* \`${fullId}\`\n`;
                msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
                msg += `📌 *മാർക്ക് ഷീറ്റ് പരിശോധിക്കുന്ന വിധം:*\n`;
                msg += `1. താഴെയുള്ള ലിങ്കിൽ ക്ലിക്ക് ചെയ്യുക:\n   👉 ${portalUrl}\n`;
                msg += `2. നിങ്ങളുടെ ക്ലാസ്സ് (*${cls.className}*) സെലക്ട് ചെയ്യുക.\n`;
                msg += `3. മുകളിൽ നൽകിയ റജിസ്റ്റർ നമ്പർ (\`${rNo}\`) നൽകി *'Check Result'* ക്ലിക്ക് ചെയ്യുക.\n\n`;
                msg += `_വിജയാശംസകൾ!_ ✨`;

                const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                window.open(waUrl, '_blank');
            });
        });

        // Individual Student Publish / Cloud Sync button
        document.querySelectorAll('.btn-sync-st-cloud').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const studentId = e.currentTarget.getAttribute('data-id');
                const cls = this.currentClass;
                const st = (cls.students || []).find(s => s.id === studentId);
                if (!st) return;

                const confirmed = await window.showConfirmDialog(
                    'Publish Individual Student',
                    `Do you want to publish / update the marks for <strong>${st.name}</strong> (Reg No: ${st.rollNo || '1'}) only to the live portal?`,
                    '☁️',
                    'Yes, Publish Student',
                    'Cancel'
                );

                if (!confirmed) return;

                const origHtml = e.currentTarget.innerHTML;
                e.currentTarget.innerHTML = '⏳';
                e.currentTarget.disabled = true;

                try {
                    const session = window.storageModel.getSession();
                    const isAdmin = session && session.role === 'admin';
                    const res = await window.supabaseService.syncSingleStudentToSupabase(cls, studentId, isAdmin);

                    if (res && res.success) {
                        // Remove from class modified list if present
                        if (cls.editedStudentIds) {
                            cls.editedStudentIds = cls.editedStudentIds.filter(id => id !== studentId);
                        }
                        if (!cls.editedStudentIds || cls.editedStudentIds.length === 0) {
                            cls.isDirty = false;
                        }
                        window.storageModel.saveClass(cls);

                        await window.showAlertDialog(
                            'Published Successfully',
                            `Marks for <strong>${st.name}</strong> (Reg: ${st.rollNo}) have been updated on the live result portal!`,
                            '✅'
                        );
                        this.render(this.currentClass);
                    } else {
                        throw new Error(res.message || 'Failed to update student');
                    }
                } catch (err) {
                    await window.showAlertDialog('Sync Error', 'Error publishing student: ' + err.message, '⚠️');
                } finally {
                    e.currentTarget.innerHTML = origHtml;
                    e.currentTarget.disabled = false;
                }
            });
        });

        // Edit student buttons
        document.querySelectorAll('.btn-edit-student').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.currentTarget.getAttribute('data-id');
                const stObj = (this.currentClass.students || []).find(s => s.id === studentId);
                if (stObj) {
                    this.showAddStudentModal(stObj);
                }
            });
        });

        // Delete student buttons
        document.querySelectorAll('.btn-del-student').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const studentId = e.currentTarget.getAttribute('data-id');
                const stObj = (this.currentClass.students || []).find(s => s.id === studentId);
                const stName = stObj ? stObj.name : 'this student';
                
                const confirmed = await window.showConfirmDialog(
                    'Remove Student',
                    `Are you sure you want to remove <strong>${stName}</strong>?<br><span style="font-size:0.8rem; color:#64748b;">Their marks in this class will also be cleared.</span>`,
                    '🗑️',
                    'Yes, Remove',
                    'Cancel'
                );

                if (confirmed) {
                    window.marksheetController.deleteStudent(this.currentClass.id, studentId);
                }
            });
        });

        // Attendance / Hajar Inputs
        const attInputs = document.querySelectorAll('.attendance-input');
        attInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const studentId = e.target.getAttribute('data-student-id');
                const val = e.target.value.trim();
                window.storageModel.updateStudentAttendance(this.currentClass.id, studentId, val);
                if (!this.currentClass.attendance) this.currentClass.attendance = {};
                if (val === '') {
                    delete this.currentClass.attendance[studentId];
                } else {
                    this.currentClass.attendance[studentId] = val;
                }
                const autoSave = document.getElementById('autosave-status');
                if (autoSave) {
                    autoSave.innerHTML = `<span class="save-dot saving"></span> Saving...`;
                    setTimeout(() => { autoSave.innerHTML = `<span class="save-dot"></span> Saved`; }, 300);
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
            inputElem.title = `Absent (Fail)`;
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

        // Track this student as modified
        this.currentClass.isDirty = true;
        if (!this.currentClass.editedStudentIds) this.currentClass.editedStudentIds = [];
        if (!this.currentClass.editedStudentIds.includes(studentId)) {
            this.currentClass.editedStudentIds.push(studentId);
        }
        window.storageModel.saveClass(this.currentClass);

        // Synchronize both table and card views
        this._updateAllCalculations();

        const autoSave = document.getElementById('autosave-status');
        if (autoSave) {
            autoSave.innerHTML = `<span class="save-dot saving"></span> Saving...`;
            setTimeout(() => {
                autoSave.innerHTML = `<span class="save-dot"></span> Saved`;
            }, 300);
        }
    }

    _updateAllCalculations() {
        const students = this.currentClass.students || [];
        const topics = this.currentClass.topics || [];
        const passPct = Number(this.currentClass.passPercentage) || 36;
        const results = window.marksheetModel.processSheet(students, topics, this.currentClass.marks, passPct);

        results.forEach(res => {
            const studentId = res.student.id;

            // Table view elements
            const totalCell = document.getElementById(`total-${studentId}`);
            const rankCell = document.getElementById(`rank-${studentId}`);
            const statusCell = document.getElementById(`status-${studentId}`);

            if (totalCell) totalCell.innerHTML = `<strong>${res.hasAnyMark ? res.totalScored : '-'}</strong> <span class="text-muted">/${res.totalMax}</span>`;
            if (rankCell) rankCell.innerText = res.hasAnyMark ? res.rank : '-';
            if (statusCell) statusCell.innerHTML = res.hasAnyMark ? `<span class="badge ${res.statusClass}">${res.status === 'Pass' ? 'Pass' : 'Fail'}</span>` : '-';

            // Card view elements
            const cardTotal = document.getElementById(`card-total-${studentId}`);
            const cardRank = document.getElementById(`card-rank-${studentId}`);
            const cardStatus = document.getElementById(`card-status-${studentId}`);

            if (cardTotal) cardTotal.innerText = res.hasAnyMark ? `${res.totalScored}/${res.totalMax}` : '-';
            if (cardRank) cardRank.innerText = res.hasAnyMark ? res.rank : '-';
            if (cardStatus) {
                cardStatus.className = `badge ${res.statusClass}`;
                cardStatus.innerText = res.hasAnyMark ? (res.status === 'Pass' ? 'Pass' : 'Fail') : '-';
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
            targetInput = document.querySelector(`.mark-input[data-row="${row}"][data-col="${col - 1}"]`);
        }

        if (targetInput) {
            targetInput.focus();
            targetInput.select();
        }
    }
}

window.marksheetView = new MarksheetView();
