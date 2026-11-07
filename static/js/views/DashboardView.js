/**
 * DashboardView.js
 * MVC - View Layer: Class listing, quick overview, class creation modal, backup/restore.
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

        this.container.innerHTML = `
            <div class="app-layout">
                <header class="navbar">
                    <div class="nav-brand">
                        <span class="nav-logo-badge">BM</span>
                        <div class="nav-titles">
                            <span class="nav-title">Badrudheen Madrasa</span>
                            <span class="nav-tagline">${user.role === 'admin' ? 'Sadar Muallim Command' : 'Usthad Portal'}</span>
                        </div>
                    </div>
                    <div class="nav-actions">
                        <div class="user-pill">
                            <span class="user-avatar">${(user.fullName || 'U')[0].toUpperCase()}</span>
                            <span class="user-name">${user.fullName || user.userId}</span>
                            <span class="${user.role === 'admin' ? 'badge-admin' : 'badge-teacher'}">
                                ${user.role === 'admin' ? 'SADAR MUALLIM' : 'USTHAD'}
                            </span>
                        </div>
                        <a href="/" target="_blank" class="btn btn-outline btn-sm nav-hide-mobile" title="View Public Result Portal">
                            Public Portal ↗
                        </a>
                        ${user.role === 'admin' ? `
                            <button class="btn btn-primary btn-sm" id="btn-verify-results" title="Review & Publish Results" style="background:#0d5c31;">
                                ✓ Verify & Publish
                            </button>
                            <button class="btn btn-outline btn-sm nav-hide-mobile" id="btn-manage-teachers" title="Manage Usthads">
                                Usthads
                            </button>
                        ` : ''}
                        <button class="btn btn-outline btn-sm nav-hide-mobile" id="btn-backup" title="Backup Data">
                            Backup
                        </button>
                        <button class="btn btn-ghost btn-sm" id="btn-logout" title="Sign Out">
                            Sign Out
                        </button>
                    </div>
                </header>

                <main class="main-content">
                    <div class="dashboard-hero">
                        <div class="hero-left">
                            <h2 class="hero-title">Welcome, ${user.fullName || 'Usthad'}</h2>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
                                ${user.role === 'admin' ? 'Sadar Muallim: Complete Class Control & Result Verification' : 'Usthad Portal: Manage mark sheets for your authorized classes'}
                            </p>
                        </div>
                        <div class="hero-right">
                            <button class="btn btn-primary" id="btn-add-class">
                                + New Class
                            </button>
                        </div>
                    </div>

                    <!-- Summary Stats Bar -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Total Classes</div>
                            <div class="stat-value">${classes.length}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Total Students</div>
                            <div class="stat-value">${totalStudents}</div>
                            <div class="stat-sub">${totalBoys} Boys • ${totalGirls} Girls</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Database</div>
                            <div class="stat-value text-success">Connected</div>
                        </div>
                    </div>

                    <!-- Classes Section -->
                    <div class="section-header">
                        <h3 class="section-title">Assigned Classes (${classes.length})</h3>
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
                <h4 class="empty-title">No Classes Added Yet</h4>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Click the button below to add your first class.</p>
                <div style="margin-top: 1.25rem;">
                    <button class="btn btn-primary" id="btn-empty-add-class">
                        + Add First Class
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
                                    <button class="btn btn-outline btn-xs btn-edit-class" title="Edit" data-id="${cls.id}">Edit</button>
                                    <button class="btn btn-ghost btn-xs btn-delete-class text-danger" title="Delete" data-id="${cls.id}">Delete</button>
                                </div>
                            </div>
                            <div class="class-card-body">
                                <div class="class-org-name">${cls.madrasaName || ''}</div>
                                <h4 class="class-name-title">${cls.className || 'Class'}</h4>
                                <div class="class-exam-tag">${cls.examName || 'Annual Exam'}</div>

                                <div class="class-metrics">
                                    <div class="metric-item">
                                        <span class="metric-num">${students.length}</span>
                                        <span class="metric-label">Students</span>
                                    </div>
                                    <div class="metric-item">
                                        <span class="metric-num">${boys} / ${girls}</span>
                                        <span class="metric-label">Boys / Girls</span>
                                    </div>
                                    <div class="metric-item">
                                        <span class="metric-num">${topics.length}</span>
                                        <span class="metric-label">Subjects</span>
                                    </div>
                                </div>
                            </div>
                            <div class="class-card-footer">
                                <button class="btn btn-primary btn-block btn-open-class" data-id="${cls.id}">
                                    Open Marksheet
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

        // Default topics if creating new with standard subjects
        const defaultTopics = isEdit ? classData.topics : [
            { id: 'top_1', name: 'FIQH (الفقه)', maxMarks: 100 },
            { id: 'top_2', name: "LISANUL QUR'AN (لسان القرآن)", maxMarks: 100 },
            { id: 'top_3', name: 'DUROOSUL IHSAN (دروس الإحسان)', maxMarks: 100 },
            { id: 'top_4', name: 'THAREEKH (التّاريخ)', maxMarks: 100 },
            { id: 'top_5', name: "QUR'AN, HIFZ (القرآن والحفظ)", maxMarks: 100 }
        ];

        modalContainer.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-box modal-lg">
                    <div class="modal-header">
                        <h3 class="modal-title">${isEdit ? 'Edit Class Details' : 'Create New Class'}</h3>
                        <button class="btn-close" id="btn-close-modal">&times;</button>
                    </div>
                    <form id="class-form">
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group flex-2">
                                    <label class="form-label">Madrasa / Institute Name *</label>
                                    <input 
                                        type="text" 
                                        id="modal-madrasa" 
                                        class="form-control" 
                                        placeholder="e.g. BADRUDHEEN MADRASA" 
                                        value="${isEdit ? (classData.madrasaName || '') : 'BADRUDHEEN MADRASA'}" 
                                        required
                                    >
                                </div>
                                <div class="form-group flex-1">
                                    <label class="form-label">Academic Year</label>
                                    <input 
                                        type="text" 
                                        id="modal-year" 
                                        class="form-control" 
                                        placeholder="2025-2026" 
                                        value="${isEdit ? (classData.academicYear || '') : '2025-2026'}"
                                    >
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group flex-1">
                                    <label class="form-label">Class (e.g. Class 5) *</label>
                                    <input 
                                        type="text" 
                                        id="modal-classname" 
                                        class="form-control" 
                                        placeholder="Class 1 - 12" 
                                        value="${isEdit ? (classData.className || '') : 'Class 5'}" 
                                        required
                                    >
                                </div>
                                <div class="form-group flex-1">
                                    <label class="form-label">Examination Name *</label>
                                    <input 
                                        type="text" 
                                        id="modal-examname" 
                                        class="form-control" 
                                        placeholder="Examination Name" 
                                        value="${isEdit ? (classData.examName || '') : 'Annual Examination 2026'}" 
                                        required
                                    >
                                </div>
                                <div class="form-group flex-1">
                                    <label class="form-label">Pass Mark %</label>
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
                                <div class="section-sub-header">
                                    <h5 class="builder-title">Subjects & Maximum Marks</h5>
                                    <button type="button" class="btn btn-outline btn-sm" id="btn-add-topic-row">+ Add Subject</button>
                                </div>

                                <div class="topic-rows-container" id="topic-rows-container">
                                    ${defaultTopics.map((top, idx) => `
                                        <div class="topic-input-row" data-index="${idx}">
                                            <input 
                                                type="text" 
                                                class="form-control topic-name-input" 
                                                placeholder="Subject Name" 
                                                value="${top.name || ''}" 
                                                required
                                            >
                                            <input 
                                                type="number" 
                                                class="form-control topic-max-input" 
                                                placeholder="Max Mark" 
                                                value="${top.maxMarks || 100}" 
                                                min="1" 
                                                max="1000" 
                                                style="max-width: 110px;" 
                                                required
                                            >
                                            <button type="button" class="btn-icon btn-remove-topic" title="Remove">&times;</button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-ghost" id="btn-cancel-modal">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                ${isEdit ? 'Save Changes' : 'Create Class'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this._bindModalEvents(isEdit, classData);
    }

    _bindModalEvents(isEdit, classData) {
        const closeModal = () => {
            const container = document.getElementById('modal-container');
            if (container) container.innerHTML = '';
        };

        const closeBtn = document.getElementById('btn-close-modal');
        const cancelBtn = document.getElementById('btn-cancel-modal');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        const addTopicBtn = document.getElementById('btn-add-topic-row');
        const topicsContainer = document.getElementById('topic-rows-container');

        if (addTopicBtn && topicsContainer) {
            addTopicBtn.addEventListener('click', () => {
                const newRow = document.createElement('div');
                newRow.className = 'topic-input-row';
                newRow.innerHTML = `
                    <input 
                        type="text" 
                        class="form-control topic-name-input" 
                        placeholder="Subject Name" 
                        required
                    >
                    <input 
                        type="number" 
                        class="form-control topic-max-input" 
                        placeholder="Max Mark" 
                        value="50" 
                        min="1" 
                        max="1000" 
                        style="max-width: 110px;" 
                        required
                    >
                    <button type="button" class="btn-icon btn-remove-topic" title="Remove">&times;</button>
                `;
                topicsContainer.appendChild(newRow);
                newRow.querySelector('.btn-remove-topic').addEventListener('click', () => newRow.remove());
            });

            topicsContainer.querySelectorAll('.btn-remove-topic').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const row = e.target.closest('.topic-input-row');
                    if (topicsContainer.children.length > 1) {
                        row.remove();
                    } else {
                        alert('At least one subject is required.');
                    }
                });
            });
        }

        const form = document.getElementById('class-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const madrasaName = document.getElementById('modal-madrasa').value.trim();
                const className = document.getElementById('modal-classname').value.trim();
                const examName = document.getElementById('modal-examname').value.trim();
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
                    alert('Please add at least one subject.');
                    return;
                }

                const payload = {
                    ...(isEdit ? classData : {}),
                    madrasaName,
                    className,
                    examName,
                    academicYear,
                    passPercentage,
                    topics
                };

                window.classController.saveClass(payload);
                closeModal();
            });
        }
    }

    showBackupModal() {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-box">
                    <div class="modal-header">
                        <h3 class="modal-title">Data Backup & Restore</h3>
                        <button class="btn-close" id="btn-close-backup">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="backup-actions">
                            <div class="backup-card">
                                <h5>Download Backup</h5>
                                <button class="btn btn-primary" id="btn-download-backup">Download JSON</button>
                            </div>

                            <div class="backup-card">
                                <h5>Restore Backup</h5>
                                <input type="file" id="file-restore" accept=".json" style="display:none;">
                                <button class="btn btn-outline" id="btn-trigger-restore">Select JSON File</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-ghost" id="btn-cancel-backup">Close</button>
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
                    alert('Backup restored successfully!');
                    closeModal();
                    window.classController.showDashboard();
                } catch (err) {
                    alert('Error: ' + err.message);
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
                if (confirm('Are you sure you want to sign out?')) {
                    window.authController.handleLogout();
                }
            });
        }

        const backupBtn = document.getElementById('btn-backup');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.showBackupModal());
        }

        const manageTeachersBtn = document.getElementById('btn-manage-teachers');
        if (manageTeachersBtn) {
            manageTeachersBtn.addEventListener('click', () => this.showTeachersModal());
        }

        const verifyResultsBtn = document.getElementById('btn-verify-results');
        if (verifyResultsBtn) {
            verifyResultsBtn.addEventListener('click', () => this.showVerificationModal());
        }

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
                if (confirm('Are you sure you want to delete this class?')) {
                    window.classController.deleteClass(classId);
                }
            });
        });
    }

    async showTeachersModal() {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-box modal-lg">
                    <div class="modal-header">
                        <h3 class="modal-title">Sadar Muallim: Usthad Assignments & Pass Keys</h3>
                        <button class="btn-close" id="btn-close-teachers">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                            <p style="font-size:0.88rem; color:#4b5563; margin:0;">
                                Authorized Usthads, assigned classes, and email verification status.
                            </p>
                            <button class="btn btn-primary btn-sm" id="btn-add-new-teacher">+ Add New Usthad</button>
                        </div>
                        <div id="teachers-list-container">
                            <p style="text-align:center; padding:20px; color:#6b7280;">Loading usthads list...</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-ghost" id="btn-cancel-teachers">Close</button>
                    </div>
                </div>
            </div>
        `;

        const closeModal = () => { modalContainer.innerHTML = ''; };
        document.getElementById('btn-close-teachers').addEventListener('click', closeModal);
        document.getElementById('btn-cancel-teachers').addEventListener('click', closeModal);

        const listContainer = document.getElementById('teachers-list-container');
        const loadTeachers = async () => {
            try {
                const teachers = await window.supabaseService.getTeachers();
                if (!teachers || teachers.length === 0) {
                    listContainer.innerHTML = '<p style="text-align:center; padding:15px;">No usthads found.</p>';
                    return;
                }

                let html = `
                    <table class="table" style="width:100%; font-size:0.88rem;">
                        <thead>
                            <tr style="border-bottom:1.5px solid #e5e7eb; text-align:left;">
                                <th style="padding:8px;">Usthad Name</th>
                                <th style="padding:8px;">Username</th>
                                <th style="padding:8px;">Assigned Classes</th>
                                <th style="padding:8px;">Recovery Email</th>
                                <th style="padding:8px; text-align:right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                teachers.forEach(t => {
                    const parsed = window.supabaseService.parseTeacherProfile ? window.supabaseService.parseTeacherProfile(t) : { displayName: t.full_name || t.username, email: '', emailStatus: 'none' };
                    const classesStr = (t.assigned_classes || []).sort((a,b)=>a-b).join(', ') || 'None';
                    
                    let emailDisplay = '<span style="color:#9ca3af; font-size:0.75rem;">None</span>';
                    if (parsed.email) {
                        if (parsed.emailStatus === 'pending') {
                            emailDisplay = `<span style="background:#fef3c7; color:#b45309; padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:700;">Pending Approval</span>`;
                        } else {
                            emailDisplay = `<span style="color:#16a34a; font-size:0.75rem; font-weight:700;">✓ Verified</span>`;
                        }
                    }

                    html += `
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:8px; font-weight:600;">${parsed.displayName}</td>
                            <td style="padding:8px; font-family:monospace;">${t.username}</td>
                            <td style="padding:8px; color:#156d3b; font-weight:700;">Class ${classesStr}</td>
                            <td style="padding:8px;">${emailDisplay}</td>
                            <td style="padding:8px; text-align:right;">
                                ${t.username !== 'admin' ? `
                                    <button class="btn btn-ghost btn-sm btn-delete-t" data-id="${t.id}" style="color:#dc2626;">Delete</button>
                                ` : '<span style="font-size:0.75rem; color:#9ca3af;">Protected</span>'}
                            </td>
                        </tr>
                    `;
                });

                html += '</tbody></table>';
                listContainer.innerHTML = html;

                listContainer.querySelectorAll('.btn-delete-t').forEach(b => {
                    b.addEventListener('click', async (e) => {
                        const id = e.target.getAttribute('data-id');
                        if (confirm('Are you sure you want to delete this usthad account?')) {
                            try {
                                await window.supabaseService.deleteTeacher(id);
                                loadTeachers();
                            } catch (err) {
                                alert(err.message);
                            }
                        }
                    });
                });
            } catch (err) {
                listContainer.innerHTML = `<p style="color:#dc2626; padding:10px;">Error: ${err.message}</p>`;
            }
        };

        loadTeachers();

        document.getElementById('btn-add-new-teacher').addEventListener('click', () => {
            this.showCustomAddTeacherModal(() => loadTeachers());
        });
    }

    /**
     * Custom Usthad Creation Modal (Sadar Muallim assigns ID, Pass Key, and Classes)
     */
    showCustomAddTeacherModal(onSuccess) {
        const modalContainer = document.getElementById('modal-container');
        const modalDiv = document.createElement('div');
        modalDiv.className = 'modal-backdrop';
        modalDiv.id = 'custom-teacher-create-modal';
        modalDiv.innerHTML = `
            <div class="modal-box" style="max-width: 480px;">
                <div class="modal-header">
                    <div>
                        <h3 class="modal-title">Add New Usthad & Set Pass Key</h3>
                        <p style="font-size:0.82rem; color:var(--text-muted); margin-top:2px;">
                            Enter Usthad credentials, assign their permitted classes, and set their pass key.
                        </p>
                    </div>
                    <button class="btn-close" id="btn-close-teacher-create" title="Close dialog">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="form-create-teacher-custom">
                        <div class="form-group">
                            <label class="form-label" for="t-cust-name">Usthad Full Name *</label>
                            <input type="text" id="t-cust-name" class="form-control" placeholder="e.g. Usthad Ibrahim" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="t-cust-user">Usthad Username (Unique ID) *</label>
                            <input type="text" id="t-cust-user" class="form-control" placeholder="e.g. usthad_class4" required autocomplete="off">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="t-cust-email">Recovery Email (Optional - Pre-approved by Sadar Muallim)</label>
                            <input type="email" id="t-cust-email" class="form-control" placeholder="e.g. usthad@gmail.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="t-cust-phone">Mobile Number (Optional)</label>
                            <input type="tel" id="t-cust-phone" class="form-control" placeholder="e.g. 9876543210">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="t-cust-pass">Usthad Pass Key / Password *</label>
                            <input type="password" id="t-cust-pass" class="form-control" placeholder="Initial pass key" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="t-cust-classes">Permitted Classes (Comma separated) *</label>
                            <input type="text" id="t-cust-classes" class="form-control" placeholder="e.g. 1, 2, 5" value="1, 2, 3" required>
                            <small style="color:var(--text-muted); font-size:0.78rem;">Usthad can only view and manage these class marks.</small>
                        </div>
                        <div id="t-cust-error" class="alert alert-danger" style="display:none; margin-top:10px;"></div>
                        <div class="modal-footer" style="padding: 1rem 0 0 0; margin-top: 1rem;">
                            <button type="button" class="btn btn-outline" id="btn-cancel-teacher-create">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="btn-submit-teacher-create">Save Usthad Account</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);

        const closeModal = () => {
            if (modalDiv && modalDiv.parentNode) modalDiv.parentNode.removeChild(modalDiv);
        };

        modalDiv.querySelector('#btn-close-teacher-create').addEventListener('click', closeModal);
        modalDiv.querySelector('#btn-cancel-teacher-create').addEventListener('click', closeModal);
        modalDiv.addEventListener('click', (e) => {
            if (e.target === modalDiv) closeModal();
        });

        modalDiv.querySelector('#form-create-teacher-custom').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = modalDiv.querySelector('#btn-submit-teacher-create');
            const errDiv = modalDiv.querySelector('#t-cust-error');
            const username = modalDiv.querySelector('#t-cust-user').value.trim();
            const fullName = modalDiv.querySelector('#t-cust-name').value.trim();
            const email = modalDiv.querySelector('#t-cust-email').value.trim();
            const phone = modalDiv.querySelector('#t-cust-phone').value.trim();
            const password = modalDiv.querySelector('#t-cust-pass').value;
            const classesStr = modalDiv.querySelector('#t-cust-classes').value.trim();

            const assigned = classesStr
                .split(',')
                .map(s => parseInt(s.trim(), 10))
                .filter(n => !isNaN(n) && n >= 1 && n <= 12);

            btn.disabled = true;
            btn.textContent = 'Saving...';
            errDiv.style.display = 'none';

            try {
                await window.supabaseService.saveTeacher({
                    username: username,
                    full_name: fullName,
                    email: email,
                    phone: phone,
                    password: password,
                    role: 'teacher',
                    assigned_classes: assigned
                });
                closeModal();
                if (onSuccess) onSuccess();
            } catch (err) {
                errDiv.textContent = err.message || 'Failed to save teacher';
                errDiv.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Save Teacher Account';
            }
        });
    }

    async showVerificationModal() {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-box modal-lg" style="max-width: 900px;">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Admin Result Verification & Publishing Control</h3>
                            <p style="font-size:0.84rem; color:#4b5563; margin-top:2px;">
                                Review teacher-submitted mark sheets. Verify student scores before publishing them to the public result portal.
                            </p>
                        </div>
                        <button class="btn-close" id="btn-close-verify">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <label style="font-size:0.88rem; font-weight:700;">Filter Class:</label>
                                <select id="verify-class-filter" class="form-control" style="max-width:160px; min-height:40px; font-size:0.88rem;">
                                    <option value="">All Classes</option>
                                    <option value="1">Class 1</option>
                                    <option value="2">Class 2</option>
                                    <option value="3">Class 3</option>
                                    <option value="4">Class 4</option>
                                    <option value="5">Class 5</option>
                                    <option value="6">Class 6</option>
                                    <option value="7">Class 7</option>
                                    <option value="8">Class 8</option>
                                    <option value="9">Class 9</option>
                                    <option value="10">Class 10</option>
                                    <option value="11">Class 11</option>
                                    <option value="12">Class 12</option>
                                </select>
                            </div>
                            <button class="btn btn-primary btn-sm" id="btn-publish-all-filtered">
                                ✓ Publish All in Current Filter
                            </button>
                        </div>

                        <div id="verify-list-container" style="max-height: 480px; overflow-y: auto;">
                            <p style="text-align:center; padding:24px; color:#6b7280;">Loading submitted results from cloud...</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-ghost" id="btn-cancel-verify">Close</button>
                    </div>
                </div>
            </div>
        `;

        const closeModal = () => { modalContainer.innerHTML = ''; };
        document.getElementById('btn-close-verify').addEventListener('click', closeModal);
        document.getElementById('btn-cancel-verify').addEventListener('click', closeModal);

        const listContainer = document.getElementById('verify-list-container');
        const filterSelect = document.getElementById('verify-class-filter');

        const loadVerificationData = async () => {
            const classNum = filterSelect.value ? parseInt(filterSelect.value, 10) : null;
            listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#6b7280;">Loading...</p>';

            try {
                const students = await window.supabaseService.getStudentsForAdmin(classNum);
                if (!students || students.length === 0) {
                    listContainer.innerHTML = '<p style="text-align:center; padding:24px; color:#6b7280;">No submitted student marksheets found for this class.</p>';
                    return;
                }

                let html = `
                    <table class="table" style="width:100%; font-size:0.86rem; border-collapse: collapse;">
                        <thead>
                            <tr style="background:#f9fafb; border-bottom:2px solid #e5e7eb; text-align:left;">
                                <th style="padding:10px 8px;">Class</th>
                                <th style="padding:10px 8px;">Reg No</th>
                                <th style="padding:10px 8px;">Student Name</th>
                                <th style="padding:10px 8px;">Total Score</th>
                                <th style="padding:10px 8px;">Status</th>
                                <th style="padding:10px 8px;">Public Status</th>
                                <th style="padding:10px 8px; text-align:right;">Admin Action</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                students.forEach(st => {
                    const isPublished = st.syllabus !== 'PENDING_APPROVAL';
                    html += `
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:10px 8px; font-weight:700;">Class ${st.class_number}</td>
                            <td style="padding:10px 8px; font-family:monospace; font-weight:700;">${st.register_no}</td>
                            <td style="padding:10px 8px; font-weight:600;">${st.name}</td>
                            <td style="padding:10px 8px; font-weight:800; color:#0d5c31;">${st.grand_total}</td>
                            <td style="padding:10px 8px;"><span class="badge ${st.status === 'FAIL' ? 'status-fail' : 'status-pass'}">${st.status || 'PASS'}</span></td>
                            <td style="padding:10px 8px;">
                                ${isPublished 
                                    ? '<span style="color:#059669; font-weight:700; background:#ecfdf5; padding:3px 8px; border-radius:12px;">Live / Published</span>' 
                                    : '<span style="color:#d97706; font-weight:700; background:#fef3c7; padding:3px 8px; border-radius:12px;">Pending Verification</span>'}
                            </td>
                            <td style="padding:10px 8px; text-align:right;">
                                <button class="btn btn-sm ${isPublished ? 'btn-outline' : 'btn-primary'} btn-toggle-publish" 
                                    data-reg="${st.register_no}" 
                                    data-current="${isPublished}">
                                    ${isPublished ? 'Unpublish' : '✓ Verify & Publish'}
                                </button>
                            </td>
                        </tr>
                    `;
                });

                html += '</tbody></table>';
                listContainer.innerHTML = html;

                listContainer.querySelectorAll('.btn-toggle-publish').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const reg = e.target.getAttribute('data-reg');
                        const current = e.target.getAttribute('data-current') === 'true';
                        e.target.disabled = true;
                        e.target.textContent = 'Updating...';

                        try {
                            await window.supabaseService.setPublishStatus(reg, !current);
                            loadVerificationData();
                        } catch (err) {
                            alert(err.message);
                        }
                    });
                });

            } catch (err) {
                listContainer.innerHTML = `<p style="color:#dc2626; padding:12px;">Error loading cloud data: ${err.message}</p>`;
            }
        };

        filterSelect.addEventListener('change', loadVerificationData);
        loadVerificationData();

        document.getElementById('btn-publish-all-filtered').addEventListener('click', async () => {
            const classNum = filterSelect.value ? parseInt(filterSelect.value, 10) : null;
            if (!classNum) {
                alert('Please select a specific class in the filter dropdown to publish all students.');
                return;
            }

            if (confirm(`Are you sure you want to verify and publish all students of Class ${classNum} to the live public portal?`)) {
                try {
                    await window.supabaseService.publishEntireClass(classNum);
                    alert(`Class ${classNum} results verified and published live!`);
                    loadVerificationData();
                } catch (err) {
                    alert('Error publishing class: ' + err.message);
                }
            }
        });
    }
}

window.dashboardView = new DashboardView();
