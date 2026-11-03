/**
 * DashboardView.js
 * MVC - View Layer: Class listing, quick overview, class creation modal,
 * Supabase Cloud Sync settings, and JSON backup/restore.
 */

class DashboardView {
    constructor() {
        this.container = document.getElementById('app-root');
    }

    render(classes = [], user = {}) {
        let totalStudents = 0;
        let totalBoys = 0;
        let totalGirls = 0;

        classes.forEach(c => {
            const studs = c.students || [];
            totalStudents += studs.length;
            totalBoys += studs.filter(s => s.gender === 'boy').length;
            totalGirls += studs.filter(s => s.gender === 'girl').length;
        });

        const isCloudConfigured = window.supabaseModel && window.supabaseModel.isConfigured();

        this.container.innerHTML = `
            <div class="app-layout">
                <header class="navbar">
                    <div class="nav-brand">
                        <span class="nav-logo-badge">MH</span>
                        <div class="nav-titles">
                            <span class="nav-title">Marksheet Helper</span>
                            <span class="nav-tagline">മാർക്ക്ഷീറ്റ് സഹായി</span>
                        </div>
                    </div>
                    <div class="nav-actions">
                        <!-- Supabase Cloud Connection Button -->
                        <button class="btn btn-outline btn-sm btn-supabase ${isCloudConfigured ? 'cloud-active' : ''}" id="btn-supabase-modal" title="Supabase ക്ലൗഡ് സ്റ്റോറേജ്">
                            <span class="cloud-status-dot ${isCloudConfigured ? 'status-green' : 'status-amber'}"></span>
                            <span>Supabase ${isCloudConfigured ? 'ക്ലൗഡ്' : 'കണക്റ്റ്'}</span>
                        </button>

                        <div class="user-pill">
                            <span class="user-avatar">${(user.fullName || 'T')[0].toUpperCase()}</span>
                            <span class="user-name">${user.fullName || user.userId}</span>
                        </div>
                        <button class="btn btn-outline btn-sm" id="btn-backup" title="ഡാറ്റ ബാക്കപ്പ്">
                            ബാക്കപ്പ്
                        </button>
                        <button class="btn btn-ghost btn-sm" id="btn-logout" title="പുറത്തിറങ്ങുക">
                            ലോഗ് ഔട്ട്
                        </button>
                    </div>
                </header>

                <main class="main-content">
                    <div class="dashboard-hero">
                        <div class="hero-left">
                            <h2 class="hero-title">സ്വാഗതം, ${user.fullName || 'അധ്യാപകരെ'}</h2>
                            <p class="hero-sub text-muted">150+ കുട്ടികളുടെ മദ്റസ മാർക്ക്ഷീറ്റ് ശേഖരണവും സമസ്ത (SKIMVB) പ്രിന്റും</p>
                        </div>
                        <div class="hero-right">
                            <button class="btn btn-primary" id="btn-add-class">
                                + പുതിയ ക്ലാസ്
                            </button>
                        </div>
                    </div>

                    <!-- Summary Stats Bar -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">ആകെ ക്ലാസുകൾ</div>
                            <div class="stat-value">${classes.length}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">ആകെ വിദ്യാർത്ഥികൾ</div>
                            <div class="stat-value">${totalStudents}</div>
                            <div class="stat-sub">${totalBoys} ആൺ • ${totalGirls} പെൺ</div>
                        </div>
                        <div class="stat-card cursor-pointer" id="card-storage-status">
                            <div class="stat-label">സ്റ്റോറേജ് / ക്ലൗഡ്</div>
                            <div class="stat-value ${isCloudConfigured ? 'text-success' : 'text-primary'}">
                                ${isCloudConfigured ? 'Supabase ക്ലൗഡ്' : 'ലോക്കൽ സ്റ്റോറേജ്'}
                            </div>
                            <div class="stat-sub">${isCloudConfigured ? 'തത്സമയം സിങ്ക് ആകുന്നു' : 'ക്ലൗഡ് കണക്റ്റ് ചെയ്യുക →'}</div>
                        </div>
                    </div>

                    <!-- Classes Section -->
                    <div class="section-header">
                        <h3 class="section-title">ക്ലാസുകൾ (${classes.length})</h3>
                    </div>

                    ${classes.length === 0 ? this._renderEmptyState() : this._renderClassGrid(classes)}
                </main>
            </div>

            <!-- Modal Container -->
            <div id="modal-container"></div>
        `;

        this._bindEvents();
    }

    _renderEmptyState() {
        return `
            <div class="empty-state">
                <h4 class="empty-title">ക്ലാസുകളൊന്നും ചേർത്തിട്ടില്ല</h4>
                <p class="text-muted">മദ്റസ മാർക്ക് ലിസ്റ്റ് തയ്യാറാക്കാൻ പുതിയ ക്ലാസ് ചേർക്കുക.</p>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-primary" id="btn-empty-add-class">
                        ആദ്യ ക്ലാസ് ചേർക്കുക
                    </button>
                </div>
            </div>
        `;
    }

    _renderClassGrid(classes) {
        return `
            <div class="class-grid">
                ${classes.map(cls => {
                    const students = cls.students || [];
                    const boys = students.filter(s => s.gender === 'boy').length;
                    const girls = students.filter(s => s.gender === 'girl').length;
                    const topics = cls.topics || [];

                    return `
                        <div class="class-card" data-class-id="${cls.id}">
                            <div class="class-card-header">
                                <span class="class-badge">${cls.academicYear || '2025-26'}</span>
                                <div class="class-actions-menu">
                                    <button class="btn btn-outline btn-xs btn-edit-class" title="എഡിറ്റ്" data-id="${cls.id}">എഡിറ്റ്</button>
                                    <button class="btn btn-ghost btn-xs btn-delete-class text-danger" title="നീക്കം ചെയ്യുക" data-id="${cls.id}">നീക്കം</button>
                                </div>
                            </div>
                            <div class="class-card-body">
                                <div class="class-org-name">${cls.madrasaName || 'മദ്റസ'} ${cls.place ? `• ${cls.place}` : ''}</div>
                                <h4 class="class-name-title">${cls.className || 'ക്ലാസ്സ്'}</h4>
                                <div class="class-exam-tag">${cls.term || cls.examName || 'വാർഷിക പരീക്ഷ'} ${cls.skimvbRegNo ? `(Reg: ${cls.skimvbRegNo})` : ''}</div>

                                <div class="class-metrics">
                                    <div class="metric-item">
                                        <span class="metric-num">${students.length}</span>
                                        <span class="metric-label">കുട്ടികൾ</span>
                                    </div>
                                    <div class="metric-item">
                                        <span class="metric-num">${boys} / ${girls}</span>
                                        <span class="metric-label">ആൺ / പെൺ</span>
                                    </div>
                                    <div class="metric-item">
                                        <span class="metric-num">${topics.length}</span>
                                        <span class="metric-label">വിഷയങ്ങൾ</span>
                                    </div>
                                </div>
                            </div>
                            <div class="class-card-footer">
                                <button class="btn btn-primary btn-block btn-open-class" data-id="${cls.id}">
                                    മാർക്ക്ഷീറ്റ് തുറക്കുക
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    showClassModal(classData = null) {
        const modalContainer = document.getElementById('modal-container');
        const isEdit = !!classData;

        // Default topics if creating new (SKIMVB standard 8 subjects)
        const skimvbDefaultTopics = [
            { id: 'top_1', name: 'ഖുർആൻ (Quran)', maxMarks: 50 },
            { id: 'top_2', name: 'തജ്‌വീദ് (Tajweed)', maxMarks: 50 },
            { id: 'top_3', name: 'ഫിഖ്ഹ് (Fiqh)', maxMarks: 50 },
            { id: 'top_4', name: 'അഖീദ (Aqeedah)', maxMarks: 50 },
            { id: 'top_5', name: 'താരീഖ് (Tareekh)', maxMarks: 50 },
            { id: 'top_6', name: 'അഖ്‌ലാഖ് (Akhlaq)', maxMarks: 50 },
            { id: 'top_7', name: 'ലിസാൻ / ദുറൂസ് (Lisan)', maxMarks: 50 },
            { id: 'top_8', name: 'തദ്രീബ് / ദിക്ർ (Thadreeb)', maxMarks: 50 }
        ];

        const defaultTopics = isEdit ? (classData.topics || skimvbDefaultTopics.slice(0, 4)) : skimvbDefaultTopics;

        modalContainer.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-box modal-lg">
                    <div class="modal-header">
                        <h3 class="modal-title">${isEdit ? 'ക്ലാസ് എഡിറ്റ് ചെയ്യുക' : 'പുതിയ ക്ലാസ്'}</h3>
                        <button class="btn-close" id="btn-close-modal">&times;</button>
                    </div>
                    <form id="class-form">
                        <div class="modal-body">
                            <!-- Institution & SKIMVB Details -->
                            <div class="form-row">
                                <div class="form-group flex-2">
                                    <label class="form-label">മദ്റസ പേര് *</label>
                                    <input 
                                        type="text" 
                                        id="modal-madrasa" 
                                        class="form-control" 
                                        placeholder="ഉദാ: ബദ്റുദ്ദീൻ മദ്റസ" 
                                        value="${isEdit ? (classData.madrasaName || '') : 'ബദ്റുദ്ദീൻ മദ്റസ'}" 
                                        required
                                    >
                                </div>
                                <div class="form-group flex-1">
                                    <label class="form-label">സ്ഥലം (Place)</label>
                                    <input 
                                        type="text" 
                                        id="modal-place" 
                                        class="form-control" 
                                        placeholder="ഉദാ: കോഴിക്കോട്" 
                                        value="${isEdit ? (classData.place || '') : ''}"
                                    >
                                </div>
                                <div class="form-group flex-1">
                                    <label class="form-label">SKIMVB REG.NO</label>
                                    <input 
                                        type="text" 
                                        id="modal-skimvb" 
                                        class="form-control" 
                                        placeholder="ഉദാ: 1900" 
                                        value="${isEdit ? (classData.skimvbRegNo || '') : ''}"
                                    >
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group flex-1">
                                    <label class="form-label">ക്ലാസ്സ് (CLASS) *</label>
                                    <input 
                                        type="text" 
                                        id="modal-classname" 
                                        class="form-control" 
                                        placeholder="ഉദാ: ക്ലാസ്സ് 5" 
                                        value="${isEdit ? (classData.className || '') : 'ക്ലാസ്സ് 5'}" 
                                        required
                                    >
                                </div>
                                <div class="form-group flex-1">
                                    <label class="form-label">പരീക്ഷാ ടേം (TERM) *</label>
                                    <input 
                                        type="text" 
                                        id="modal-term" 
                                        class="form-control" 
                                        placeholder="ഉദാ: വാർഷിക പരീക്ഷ / ഒന്നാം ടേം" 
                                        value="${isEdit ? (classData.term || classData.examName || '') : 'വാർഷിക പരീക്ഷ'}" 
                                        required
                                    >
                                </div>
                                <div class="form-group flex-1">
                                    <label class="form-label">വർഷം (YEAR)</label>
                                    <input 
                                        type="text" 
                                        id="modal-year" 
                                        class="form-control" 
                                        placeholder="2025-2026" 
                                        value="${isEdit ? (classData.academicYear || '') : '2025-2026'}"
                                    >
                                </div>
                                <div class="form-group" style="max-width: 90px;">
                                    <label class="form-label">പാസ്സ് %</label>
                                    <input 
                                        type="number" 
                                        id="modal-passpct" 
                                        class="form-control" 
                                        min="1" 
                                        max="100" 
                                        value="${isEdit ? (classData.passPercentage || 36) : 36}"
                                    >
                                </div>
                            </div>

                            <div class="topics-builder-section">
                                <div class="section-sub-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                                    <h5 class="builder-title">വിഷയങ്ങൾ (SUBJECTS)</h5>
                                    <div>
                                        <button type="button" class="btn btn-outline btn-xs" id="btn-preset-skimvb" title="സമസ്തയുടെ സാധാരണ 8 വിഷയങ്ങൾ ലോഡ് ചെയ്യുക">
                                            സമസ്ത 8 വിഷയങ്ങൾ
                                        </button>
                                        <button type="button" class="btn btn-outline btn-xs" id="btn-add-topic-row">+ വിഷയം ചേർക്കുക</button>
                                    </div>
                                </div>

                                <div class="topic-rows-container" id="topic-rows-container">
                                    ${defaultTopics.map((top, idx) => `
                                        <div class="topic-input-row" data-index="${idx}">
                                            <input 
                                                type="text" 
                                                class="form-control topic-name-input" 
                                                placeholder="വിഷയത്തിന്റെ പേര്" 
                                                value="${top.name || ''}" 
                                                required
                                            >
                                            <input 
                                                type="number" 
                                                class="form-control topic-max-input" 
                                                placeholder="മാർക്ക്" 
                                                value="${top.maxMarks || 50}" 
                                                min="1" 
                                                max="1000" 
                                                style="max-width: 100px;" 
                                                required
                                            >
                                            <button type="button" class="btn-icon btn-remove-topic" title="നീക്കം ചെയ്യുക">&times;</button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-ghost" id="btn-cancel-modal">റദ്ദാക്കുക</button>
                            <button type="submit" class="btn btn-primary">
                                ${isEdit ? 'സേവ് ചെയ്യുക' : 'ക്ലാസ് സൃഷ്ടിക്കുക'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this._bindModalEvents(isEdit, classData, skimvbDefaultTopics);
    }

    _bindModalEvents(isEdit, classData, skimvbDefaultTopics) {
        const closeModal = () => {
            const container = document.getElementById('modal-container');
            if (container) container.innerHTML = '';
        };

        const closeBtn = document.getElementById('btn-close-modal');
        const cancelBtn = document.getElementById('btn-cancel-modal');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        const addTopicBtn = document.getElementById('btn-add-topic-row');
        const presetBtn = document.getElementById('btn-preset-skimvb');
        const topicsContainer = document.getElementById('topic-rows-container');

        const attachRowRemover = (row) => {
            const remBtn = row.querySelector('.btn-remove-topic');
            if (remBtn) {
                remBtn.addEventListener('click', () => {
                    if (topicsContainer.children.length > 1) {
                        row.remove();
                    } else {
                        alert('കുറഞ്ഞത് ഒരു വിഷയമെങ്കിലും ആവശ്യമാണ്.');
                    }
                });
            }
        };

        if (topicsContainer) {
            topicsContainer.querySelectorAll('.topic-input-row').forEach(attachRowRemover);
        }

        if (addTopicBtn && topicsContainer) {
            addTopicBtn.addEventListener('click', () => {
                const newRow = document.createElement('div');
                newRow.className = 'topic-input-row';
                newRow.innerHTML = `
                    <input 
                        type="text" 
                        class="form-control topic-name-input" 
                        placeholder="വിഷയത്തിന്റെ പേര്" 
                        required
                    >
                    <input 
                        type="number" 
                        class="form-control topic-max-input" 
                        placeholder="മാർക്ക്" 
                        value="50" 
                        min="1" 
                        max="1000" 
                        style="max-width: 100px;" 
                        required
                    >
                    <button type="button" class="btn-icon btn-remove-topic" title="നീക്കം ചെയ്യുക">&times;</button>
                `;
                topicsContainer.appendChild(newRow);
                attachRowRemover(newRow);
            });
        }

        if (presetBtn && topicsContainer) {
            presetBtn.addEventListener('click', () => {
                topicsContainer.innerHTML = '';
                skimvbDefaultTopics.forEach((t, i) => {
                    const row = document.createElement('div');
                    row.className = 'topic-input-row';
                    row.innerHTML = `
                        <input 
                            type="text" 
                            class="form-control topic-name-input" 
                            value="${t.name}" 
                            required
                        >
                        <input 
                            type="number" 
                            class="form-control topic-max-input" 
                            value="${t.maxMarks}" 
                            style="max-width: 100px;" 
                            required
                        >
                        <button type="button" class="btn-icon btn-remove-topic" title="നീക്കം ചെയ്യുക">&times;</button>
                    `;
                    topicsContainer.appendChild(row);
                    attachRowRemover(row);
                });
            });
        }

        const form = document.getElementById('class-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const madrasaName = document.getElementById('modal-madrasa').value.trim();
                const place = document.getElementById('modal-place').value.trim();
                const skimvbRegNo = document.getElementById('modal-skimvb').value.trim();
                const className = document.getElementById('modal-classname').value.trim();
                const term = document.getElementById('modal-term').value.trim();
                const academicYear = document.getElementById('modal-year').value.trim();
                const passPercentage = Number(document.getElementById('modal-passpct').value) || 36;

                const topicRows = document.querySelectorAll('.topic-input-row');
                const topics = [];
                topicRows.forEach((row, i) => {
                    const name = row.querySelector('.topic-name-input').value.trim();
                    const max = Number(row.querySelector('.topic-max-input').value) || 50;
                    if (name) {
                        const existingId = (isEdit && classData.topics && classData.topics[i]) ? classData.topics[i].id : ('top_' + Date.now() + '_' + i);
                        topics.push({ id: existingId, name, maxMarks: max });
                    }
                });

                if (topics.length === 0) {
                    alert('കുറഞ്ഞത് ഒരു വിഷയമെങ്കിലും ചേർക്കുക.');
                    return;
                }

                const payload = {
                    ...(isEdit ? classData : {}),
                    madrasaName,
                    place,
                    skimvbRegNo,
                    className,
                    examName: term,
                    term,
                    academicYear,
                    passPercentage,
                    topics
                };

                window.classController.saveClass(payload);
                closeModal();
            });
        }
    }

    /**
     * Supabase Cloud Connection & Sync Modal
     */
    showSupabaseModal() {
        const modalContainer = document.getElementById('modal-container');
        const config = window.supabaseModel ? window.supabaseModel.getConfig() : {};
        const isConnected = !!(config && config.url && config.anonKey);

        modalContainer.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-box modal-lg">
                    <div class="modal-header">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:1.3rem;">⚡</span>
                            <h3 class="modal-title">Supabase ക്ലൗഡ് കണക്ഷൻ</h3>
                        </div>
                        <button class="btn-close" id="btn-close-sb-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="cloud-banner ${isConnected ? 'banner-connected' : 'banner-pending'}">
                            <div class="banner-status-icon">${isConnected ? '🟢' : '🟡'}</div>
                            <div>
                                <strong>${isConnected ? 'Supabase പ്രോജക്റ്റ് സജീവമാണ്' : 'Supabase കണക്റ്റ് ചെയ്യുക'}</strong>
                                <p class="font-sm text-muted" style="margin:2px 0 0 0;">
                                    ${isConnected 
                                        ? 'വിദ്യാർത്ഥികളുടെ മാർക്കുകൾ നിങ്ങളുടെ Supabase ക്ലൗഡ് ഡാറ്റാബേസിലേക്ക് സ്വയം സിങ്ക് ആകുന്നു.' 
                                        : 'നിങ്ങളുടെ Supabase പ്രോജക്റ്റിലെ URL-ഉം Anon Key-യും നൽകി 150+ കുട്ടികളുടെ വിവരങ്ങൾ ക്ലൗഡിൽ സൂക്ഷിക്കുക.'}
                                </p>
                            </div>
                        </div>

                        <!-- Credentials Inputs -->
                        <div class="form-group mt-3">
                            <label class="form-label font-bold">Supabase Project URL</label>
                            <input 
                                type="text" 
                                id="sb-input-url" 
                                class="form-control font-mono" 
                                placeholder="https://xyzcompany.supabase.co" 
                                value="${config.url || ''}"
                            >
                            <span class="font-xs text-muted">Supabase Dashboard -> Project Settings -> API -> Project URL</span>
                        </div>

                        <div class="form-group mt-3">
                            <label class="form-label font-bold">Supabase Anon Public API Key</label>
                            <input 
                                type="password" 
                                id="sb-input-key" 
                                class="form-control font-mono" 
                                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                                value="${config.anonKey || ''}"
                            >
                            <span class="font-xs text-muted">Supabase Dashboard -> Project Settings -> API -> Project API Keys (anon public)</span>
                        </div>

                        <div id="sb-test-result" style="display:none; margin-top:12px;" class="alert-box"></div>

                        <!-- Action Buttons -->
                        <div class="cloud-actions-row mt-4">
                            <button type="button" class="btn btn-outline" id="btn-sb-test">
                                കണക്ഷൻ പരിശോധിക്കുക (Test)
                            </button>
                            <button type="button" class="btn btn-primary" id="btn-sb-save">
                                സേവ് ചെയ്യുക
                            </button>
                        </div>

                        <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0;">

                        <!-- Data Sync Actions -->
                        <h5 class="font-bold mb-2">ക്ലൗഡ് ഡാറ്റാ സിങ്ക് (Cloud Sync)</h5>
                        <div class="grid-2-col gap-2">
                            <div class="sync-action-card">
                                <h6>ലോക്കൽ ഡാറ്റ ക്ലൗഡിലേക്ക് കയറ്റുക (Push)</h6>
                                <p class="font-xs text-muted">ഈ കമ്പ്യൂട്ടറിലെ എല്ലാ ക്ലാസുകളും 150+ കുട്ടികളുടെ മാർക്കുകളും Supabase-ലേക്ക് കയറ്റുന്നു.</p>
                                <button type="button" class="btn btn-outline btn-sm btn-block mt-2" id="btn-sb-push-all">
                                    ക്ലൗഡിലേക്ക് കയറ്റുക (Push All)
                                </button>
                            </div>
                            <div class="sync-action-card">
                                <h6>ക്ലൗഡിൽ നിന്ന് ഡൗൺലോഡ് ചെയ്യുക (Pull)</h6>
                                <p class="font-xs text-muted">മറ്റൊരു ഫോണിൽ നിന്നോ സിസ്റ്റത്തിൽ നിന്നോ നൽകിയ വിവരങ്ങൾ ഇങ്ങോട്ട് ലഭ്യമാക്കുന്നു.</p>
                                <button type="button" class="btn btn-outline btn-sm btn-block mt-2" id="btn-sb-pull-all">
                                    ക്ലൗഡിൽ നിന്ന് ഡൗൺലോഡ് (Pull All)
                                </button>
                            </div>
                        </div>

                        <!-- SQL Setup Accordion -->
                        <div class="sql-guide-box mt-3">
                            <details>
                                <summary class="font-bold cursor-pointer">
                                    📋 Supabase SQL Schema (ആദ്യമായി ഉപയോഗിക്കുമ്പോൾ റൺ ചെയ്യേണ്ടത്)
                                </summary>
                                <p class="font-xs text-muted mt-2">
                                    നിങ്ങളുടെ Supabase Dashboard തുറന്ന് <strong>SQL Editor -> New Query</strong> ക്ലിക്ക് ചെയ്ത് താഴെയുള്ള കോഡ് പേസ്റ്റ് ചെയ്ത് <strong>Run</strong> അടിക്കുക:
                                </p>
                                <div style="position:relative;">
                                    <textarea readonly class="form-control font-mono font-xs" id="sb-sql-code" rows="8" style="background:#0f172a; color:#38bdf8;">-- Marksheet Helper Supabase Tables
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    madrasa_name TEXT,
    place TEXT,
    skimvb_reg_no TEXT,
    class_name TEXT NOT NULL,
    exam_name TEXT,
    term TEXT,
    academic_year TEXT,
    pass_percentage NUMERIC DEFAULT 36,
    topics JSONB DEFAULT '[]'::jsonb,
    students JSONB DEFAULT '[]'::jsonb,
    marks JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.madrasa_students (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    roll_no TEXT,
    name TEXT NOT NULL,
    gender TEXT DEFAULT 'boy',
    attendance TEXT,
    total_scored NUMERIC DEFAULT 0,
    total_max NUMERIC DEFAULT 0,
    rank TEXT,
    status TEXT,
    marks JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.madrasa_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon classes" ON public.classes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon students" ON public.madrasa_students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
</textarea>
                                    <button type="button" class="btn btn-outline btn-xs" id="btn-copy-sql" style="position:absolute; top:8px; right:8px; background:white;">
                                        SQL കോപ്പി ചെയ്യുക
                                    </button>
                                </div>
                            </details>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-ghost" id="btn-close-sb-footer">അടയ്ക്കുക</button>
                    </div>
                </div>
            </div>
        `;

        const closeModal = () => { modalContainer.innerHTML = ''; };
        document.getElementById('btn-close-sb-modal').addEventListener('click', closeModal);
        document.getElementById('btn-close-sb-footer').addEventListener('click', closeModal);

        const urlInput = document.getElementById('sb-input-url');
        const keyInput = document.getElementById('sb-input-key');
        const resultBox = document.getElementById('sb-test-result');

        const showResult = (msg, isSuccess = true) => {
            resultBox.style.display = 'block';
            resultBox.className = `alert-box ${isSuccess ? 'alert-success' : 'alert-danger'}`;
            resultBox.innerHTML = msg;
        };

        // Test connection
        document.getElementById('btn-sb-test').addEventListener('click', async () => {
            const url = urlInput.value.trim();
            const key = keyInput.value.trim();
            if (!url || !key) {
                showResult('Supabase URL-ഉം Anon Key-യും നൽകുക.', false);
                return;
            }

            showResult('ബന്ധിപ്പിക്കുന്നു... ദയവായി കാത്തിരിക്കുക.', true);
            window.supabaseModel.saveConfig(url, key);

            try {
                const res = await window.supabaseModel.testConnection();
                showResult(`✅ ${res.message}`, true);
            } catch (err) {
                showResult(`❌ ${err.message}`, false);
            }
        });

        // Save credentials
        document.getElementById('btn-sb-save').addEventListener('click', () => {
            const url = urlInput.value.trim();
            const key = keyInput.value.trim();
            window.supabaseModel.saveConfig(url, key);
            showResult('Supabase കോൺഫിഗറേഷൻ സേവ് ചെയ്തു! ഇനി തത്സമയ സിങ്ക് പ്രവർത്തനക്ഷമമാണ്.', true);
            setTimeout(() => {
                closeModal();
                const session = window.storageModel.getSession();
                window.dashboardView.render(window.storageModel.getClasses(), session);
            }, 900);
        });

        // Push All
        document.getElementById('btn-sb-push-all').addEventListener('click', async () => {
            const session = window.storageModel.getSession();
            const classes = window.storageModel.getClasses();
            showResult('ക്ലൗഡിലേക്ക് അപ്‌ലോഡ് ചെയ്യുന്നു...', true);
            try {
                const res = await window.supabaseModel.pushAllClasses(classes, session?.userId || 'default_user');
                showResult(`✅ വിജയകരമായി ${res.count} ക്ലാസുകളും വിദ്യാർത്ഥികളുടെ മാർക്കുകളും Supabase-ലേക്ക് സിങ്ക് ചെയ്തു!`, true);
            } catch (err) {
                showResult(`❌ പിഴവ്: ${err.message}`, false);
            }
        });

        // Pull All
        document.getElementById('btn-sb-pull-all').addEventListener('click', async () => {
            const session = window.storageModel.getSession();
            showResult('ക്ലൗഡിൽ നിന്ന് ലഭ്യമാക്കുന്നു...', true);
            try {
                const cloudClasses = await window.supabaseModel.pullClasses(session?.userId || null);
                if (cloudClasses.length === 0) {
                    showResult('Supabase ക്ലൗഡിൽ ക്ലാസുകളൊന്നും കണ്ടെത്തിയില്ല.', false);
                } else {
                    window.storageModel.mergeCloudClasses(cloudClasses);
                    showResult(`✅ ${cloudClasses.length} ക്ലാസുകൾ ക്ലൗഡിൽ നിന്ന് വിജയകരമായി റീസ്റ്റോർ ചെയ്തു!`, true);
                    setTimeout(() => {
                        closeModal();
                        window.dashboardView.render(window.storageModel.getClasses(), session);
                    }, 1000);
                }
            } catch (err) {
                showResult(`❌ പിഴവ്: ${err.message}`, false);
            }
        });

        // Copy SQL
        document.getElementById('btn-copy-sql').addEventListener('click', () => {
            const sqlText = document.getElementById('sb-sql-code').value;
            navigator.clipboard.writeText(sqlText).then(() => {
                alert('Supabase SQL Schema ക്ലിപ്പ്ബോർഡിലേക്ക് കോപ്പി ചെയ്തു!\n\nഇനി Supabase Dashboard -> SQL Editor-ൽ പേസ്റ്റ് ചെയ്ത് RUN ചെയ്യുക.');
            });
        });
    }

    showBackupModal() {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-box">
                    <div class="modal-header">
                        <h3 class="modal-title">ഡാറ്റ ബാക്കപ്പ്</h3>
                        <button class="btn-close" id="btn-close-backup">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="backup-actions">
                            <div class="backup-card">
                                <h5>ബാക്കപ്പ് ഡൗൺലോഡ്</h5>
                                <p class="font-xs text-muted">നിങ്ങളുടെ സിസ്റ്റത്തിലേക്ക് ഒരു ബാക്കപ്പ് ഫയൽ (.json) ആയി ഡൗൺലോഡ് ചെയ്യുക.</p>
                                <button class="btn btn-primary btn-block mt-2" id="btn-download-backup">ഡൗൺലോഡ്</button>
                            </div>

                            <div class="backup-card mt-3">
                                <h5>ബാക്കപ്പ് റീസ്റ്റോർ</h5>
                                <p class="font-xs text-muted">മുമ്പ് സേവ് ചെയ്ത JSON ബാക്കപ്പ് ഫയൽ തിരഞ്ഞെടുക്കുക.</p>
                                <input type="file" id="file-restore" accept=".json" style="display:none;">
                                <button class="btn btn-outline btn-block mt-2" id="btn-trigger-restore">ഫയൽ തിരഞ്ഞെടുക്കുക</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-ghost" id="btn-cancel-backup">അടയ്ക്കുക</button>
                    </div>
                </div>
            </div>
        `;

        const closeModal = () => { modalContainer.innerHTML = ''; };
        document.getElementById('btn-close-backup').addEventListener('click', closeModal);
        document.getElementById('btn-cancel-backup').addEventListener('click', closeModal);

        document.getElementById('btn-download-backup').addEventListener('click', () => {
            window.storageModel.exportBackup();
        });

        const fileInput = document.getElementById('file-restore');
        document.getElementById('btn-trigger-restore').addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    window.storageModel.importBackup(event.target.result);
                    alert('ബാക്കപ്പ് റീസ്റ്റോർ ചെയ്തു!');
                    closeModal();
                    window.classController.showDashboard();
                } catch (err) {
                    alert('പിഴവ് സംഭവിച്ചു: ' + err.message);
                }
            };
            reader.readAsText(file);
        });
    }

    _bindEvents() {
        const addBtn = document.getElementById('btn-add-class');
        const emptyAddBtn = document.getElementById('btn-empty-add-class');
        if (addBtn) addBtn.addEventListener('click', () => this.showClassModal());
        if (emptyAddBtn) emptyAddBtn.addEventListener('click', () => this.showClassModal());

        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('ലോഗ് ഔട്ട് ചെയ്യണമെന്നുണ്ടോ?')) {
                    window.authController.handleLogout();
                }
            });
        }

        const backupBtn = document.getElementById('btn-backup');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.showBackupModal());
        }

        const sbBtn = document.getElementById('btn-supabase-modal');
        const cardSb = document.getElementById('card-storage-status');
        if (sbBtn) sbBtn.addEventListener('click', () => this.showSupabaseModal());
        if (cardSb) cardSb.addEventListener('click', () => this.showSupabaseModal());

        document.querySelectorAll('.btn-open-class').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const classId = e.currentTarget.getAttribute('data-id');
                window.marksheetController.openClass(classId);
            });
        });

        document.querySelectorAll('.btn-edit-class').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const classId = e.currentTarget.getAttribute('data-id');
                const cls = window.storageModel.getClass(classId);
                if (cls) this.showClassModal(cls);
            });
        });

        document.querySelectorAll('.btn-delete-class').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const classId = e.currentTarget.getAttribute('data-id');
                if (confirm('ഈ ക്ലാസ് നീക്കം ചെയ്യണോ?')) {
                    window.classController.deleteClass(classId);
                }
            });
        });
    }
}

window.dashboardView = new DashboardView();
