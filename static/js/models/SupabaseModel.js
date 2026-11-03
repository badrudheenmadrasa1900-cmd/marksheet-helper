/**
 * SupabaseModel.js
 * MVC - Model Layer: Supabase Cloud Database Client & Real-Time Sync Service.
 * Allows storing, collecting, and syncing 150+ students' madrasa mark lists
 * in Supabase PostgreSQL cloud database with zero-dependency native fetch().
 */

class SupabaseModel {
    constructor() {
        this.STORAGE_KEY = 'mh_supabase_config';
        this.statusListeners = [];
        this.syncDebounceTimer = null;
        this.status = 'idle'; // 'idle' | 'syncing' | 'synced' | 'error' | 'disconnected'
        this.lastSyncTime = null;
        this.config = this._loadConfig();
    }

    _loadConfig() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.error('Error reading Supabase config:', e);
        }
        return {
            url: '',
            anonKey: '',
            isConnected: false,
            autoSyncEnabled: true
        };
    }

    saveConfig(url, anonKey, autoSyncEnabled = true) {
        let cleanUrl = (url || '').trim();
        // Remove trailing slash if present
        cleanUrl = cleanUrl.replace(/\/+$/, '');
        // If user provided just project ref (e.g. xyz123), convert to full URL
        if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = `https://${cleanUrl}.supabase.co`;
        }

        this.config = {
            url: cleanUrl,
            anonKey: (anonKey || '').trim(),
            isConnected: false,
            autoSyncEnabled: !!autoSyncEnabled
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
        this._notifyStatus('idle');
        return this.config;
    }

    getConfig() {
        return { ...this.config };
    }

    isConfigured() {
        return !!(this.config && this.config.url && this.config.anonKey);
    }

    onStatusChange(callback) {
        if (typeof callback === 'function') {
            this.statusListeners.push(callback);
            callback(this.status, this.lastSyncTime);
        }
    }

    _notifyStatus(newStatus) {
        this.status = newStatus;
        if (newStatus === 'synced') {
            this.lastSyncTime = new Date();
        }
        this.statusListeners.forEach(cb => {
            try { cb(this.status, this.lastSyncTime); } catch (e) {}
        });
    }

    /**
     * Test connection to user's Supabase project
     */
    async testConnection() {
        if (!this.isConfigured()) {
            throw new Error('Supabase URL-ഉം Anon Key-യും നൽകിയിട്ടില്ല.');
        }

        try {
            this._notifyStatus('syncing');
            // Check health of REST endpoint
            const res = await fetch(`${this.config.url}/rest/v1/classes?select=id&limit=1`, {
                method: 'GET',
                headers: {
                    'apikey': this.config.anonKey,
                    'Authorization': `Bearer ${this.config.anonKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.status === 401 || res.status === 403) {
                this._notifyStatus('error');
                throw new Error('Supabase Anon Key അസാധുവാണ് (Unauthorized). ദയവായി ശരിയായ Anon Public Key നൽകുക.');
            }

            if (res.status === 404) {
                // Table doesn't exist yet, but connection is reached!
                this.config.isConnected = true;
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
                this._notifyStatus('synced');
                return {
                    success: true,
                    needsSchema: true,
                    message: 'Supabase പ്രോജക്റ്റുമായി വിജയകരമായി ബന്ധിപ്പിച്ചു! എന്നാൽ "classes" ടേബിൾ ഇനിയും സൃഷ്ടിക്കേണ്ടതുണ്ട്. ദയവായി താഴെയുള്ള SQL സ്ക്രിപ്റ്റ് Supabase SQL Editor-ൽ റൺ ചെയ്യുക.'
                };
            }

            if (!res.ok) {
                const text = await res.text();
                this._notifyStatus('error');
                throw new Error(`Supabase പിഴവ് (${res.status}): ${text}`);
            }

            this.config.isConnected = true;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
            this._notifyStatus('synced');
            return {
                success: true,
                needsSchema: false,
                message: 'Supabase ക്ലൗഡ് ഡാറ്റാബേസുമായി വിജയകരമായി കണക്റ്റ് ചെയ്തു! (Connected Successfully)'
            };
        } catch (err) {
            this._notifyStatus('error');
            throw err;
        }
    }

    /**
     * Upsert a class and its students/marks to Supabase
     */
    async pushClass(classData, userId = 'default_user') {
        if (!this.isConfigured()) return { success: false, reason: 'not_configured' };

        try {
            this._notifyStatus('syncing');

            const payload = {
                id: classData.id,
                user_id: userId,
                madrasa_name: classData.madrasaName || 'മദ്റസ',
                place: classData.place || '',
                skimvb_reg_no: classData.skimvbRegNo || '',
                class_name: classData.className || 'ക്ലാസ്സ്',
                exam_name: classData.examName || 'പരീക്ഷ',
                term: classData.term || classData.examName || '',
                academic_year: classData.academicYear || '2025-2026',
                pass_percentage: Number(classData.passPercentage) || 36,
                topics: classData.topics || [],
                students: classData.students || [],
                marks: classData.marks || {},
                updated_at: new Date().toISOString()
            };

            const res = await fetch(`${this.config.url}/rest/v1/classes`, {
                method: 'POST',
                headers: {
                    'apikey': this.config.anonKey,
                    'Authorization': `Bearer ${this.config.anonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates,return=representation'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Supabase Push Error: ${errText}`);
            }

            // Sync relational student records if students exist
            if (Array.isArray(classData.students) && classData.students.length > 0) {
                this._syncRelationalStudents(classData).catch(e => console.warn('Students index sync notice:', e));
            }

            this._notifyStatus('synced');
            return { success: true };
        } catch (err) {
            console.error('Supabase pushClass error:', err);
            this._notifyStatus('error');
            return { success: false, error: err.message };
        }
    }

    /**
     * Push individual student records for relational querying of 150+ students
     */
    async _syncRelationalStudents(classData) {
        if (!this.isConfigured() || !classData.students) return;

        const students = classData.students || [];
        const topics = classData.topics || [];
        const marks = classData.marks || {};
        const passPct = classData.passPercentage || 36;

        const results = window.marksheetModel 
            ? window.marksheetModel.processSheet(students, topics, marks, passPct)
            : [];

        const studentRows = results.map(r => ({
            id: r.student.id,
            class_id: classData.id,
            roll_no: r.student.rollNo || '',
            name: r.student.name || '',
            gender: r.student.gender || 'boy',
            attendance: r.student.attendance || '',
            total_scored: r.totalScored || 0,
            total_max: r.totalMax || 0,
            rank: (r.rank !== undefined ? r.rank.toString() : '-'),
            status: r.status || '-',
            marks: marks[r.student.id] || {},
            updated_at: new Date().toISOString()
        }));

        try {
            await fetch(`${this.config.url}/rest/v1/madrasa_students`, {
                method: 'POST',
                headers: {
                    'apikey': this.config.anonKey,
                    'Authorization': `Bearer ${this.config.anonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(studentRows)
            });
        } catch (e) {
            // Non-blocking if table not yet created
            console.warn('Could not update madrasa_students table:', e);
        }
    }

    /**
     * Push all classes in batch to Supabase
     */
    async pushAllClasses(classes, userId = 'default_user') {
        if (!this.isConfigured()) {
            throw new Error('Supabase കോൺഫിഗറേഷൻ നൽകിയിട്ടില്ല.');
        }

        this._notifyStatus('syncing');

        const payloads = (classes || []).map(cls => ({
            id: cls.id,
            user_id: userId,
            madrasa_name: cls.madrasaName || 'മദ്റസ',
            place: cls.place || '',
            skimvb_reg_no: cls.skimvbRegNo || '',
            class_name: cls.className || 'ക്ലാസ്സ്',
            exam_name: cls.examName || 'പരീക്ഷ',
            term: cls.term || cls.examName || '',
            academic_year: cls.academicYear || '2025-2026',
            pass_percentage: Number(cls.passPercentage) || 36,
            topics: cls.topics || [],
            students: cls.students || [],
            marks: cls.marks || {},
            updated_at: new Date().toISOString()
        }));

        if (payloads.length === 0) {
            this._notifyStatus('synced');
            return { success: true, count: 0 };
        }

        const res = await fetch(`${this.config.url}/rest/v1/classes`, {
            method: 'POST',
            headers: {
                'apikey': this.config.anonKey,
                'Authorization': `Bearer ${this.config.anonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(payloads)
        });

        if (!res.ok) {
            const err = await res.text();
            this._notifyStatus('error');
            throw new Error(`ക്ലൗഡ് സിങ്ക് പരാജയപ്പെട്ടു (${res.status}): ${err}`);
        }

        // Sync students index for each class
        for (const cls of classes) {
            if (cls.students && cls.students.length > 0) {
                this._syncRelationalStudents(cls).catch(() => {});
            }
        }

        this._notifyStatus('synced');
        return { success: true, count: payloads.length };
    }

    /**
     * Pull all classes from Supabase
     */
    async pullClasses(userId = null) {
        if (!this.isConfigured()) {
            throw new Error('Supabase കോൺഫിഗറേഷൻ നൽകിയിട്ടില്ല.');
        }

        this._notifyStatus('syncing');

        let url = `${this.config.url}/rest/v1/classes?select=*&order=created_at.desc`;
        if (userId) {
            url += `&user_id=eq.${encodeURIComponent(userId)}`;
        }

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': this.config.anonKey,
                'Authorization': `Bearer ${this.config.anonKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const err = await res.text();
            this._notifyStatus('error');
            throw new Error(`ഡാറ്റ ലഭ്യമാക്കാൻ കഴിഞ്ഞില്ല (${res.status}): ${err}`);
        }

        const rows = await res.json();
        const mappedClasses = (rows || []).map(r => ({
            id: r.id,
            madrasaName: r.madrasa_name || 'മദ്റസ',
            place: r.place || '',
            skimvbRegNo: r.skimvb_reg_no || '',
            className: r.class_name || 'ക്ലാസ്സ്',
            examName: r.exam_name || 'പരീക്ഷ',
            term: r.term || r.exam_name || '',
            academicYear: r.academic_year || '2025-2026',
            passPercentage: Number(r.pass_percentage) || 36,
            topics: r.topics || [],
            students: r.students || [],
            marks: r.marks || {},
            createdAt: r.created_at,
            updatedAt: r.updated_at
        }));

        this._notifyStatus('synced');
        return mappedClasses;
    }

    /**
     * Debounced automatic cloud sync when user makes changes
     */
    autoSync(classData, userId = 'default_user') {
        if (!this.isConfigured() || !this.config.autoSyncEnabled) return;

        if (this.syncDebounceTimer) {
            clearTimeout(this.syncDebounceTimer);
        }

        this._notifyStatus('syncing');
        this.syncDebounceTimer = setTimeout(() => {
            this.pushClass(classData, userId).catch(err => {
                console.warn('Auto-sync notice:', err);
            });
        }, 800);
    }
}

// Global instance
window.supabaseModel = new SupabaseModel();

