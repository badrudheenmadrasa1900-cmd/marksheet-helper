/**
 * StorageModel.js
 * MVC - Model Layer: Manages user authentication and isolated LocalStorage data vaults.
 * Each user ID has their own isolated namespace (mh_data_{userId}).
 * Zero external database required.
 */

class StorageModel {
    constructor() {
        this.USERS_KEY = 'mh_auth_users';
        this.SESSION_KEY = 'mh_active_session';
        this._initUsersStore();
    }

    // Initialize the root users dictionary if not existing
    _initUsersStore() {
        if (!localStorage.getItem(this.USERS_KEY)) {
            localStorage.setItem(this.USERS_KEY, JSON.stringify({}));
        }
    }

    // Simple SHA-256 password hash using standard Web Crypto API
    async hashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Get all registered users (credentials vault)
    getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.USERS_KEY)) || {};
        } catch (e) {
            console.error('Error reading users store:', e);
            return {};
        }
    }

    // Register a new user with User ID & Password
    async register(userId, fullName, password) {
        const normalizedId = userId.trim().toLowerCase();
        if (!normalizedId || !password) {
            throw new Error('User ID and Password are required');
        }

        const users = this.getUsers();
        if (users[normalizedId]) {
            throw new Error('User ID is already registered. Please choose another or login.');
        }

        const passwordHash = await this.hashPassword(password);
        users[normalizedId] = {
            userId: normalizedId,
            fullName: fullName.trim() || normalizedId,
            passwordHash: passwordHash,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        // Create empty data vault for this user
        this._saveUserData(normalizedId, {
            classes: [],
            version: '1.0'
        });

        // Set active session
        this.setSession({
            userId: normalizedId,
            fullName: users[normalizedId].fullName,
            loginAt: new Date().toISOString()
        });

        return users[normalizedId];
    }

    // Login with User ID and Password
    async login(userId, password) {
        const normalizedId = userId.trim().toLowerCase();
        const users = this.getUsers();
        const user = users[normalizedId];

        if (!user) {
            throw new Error('User ID not found. Please register first.');
        }

        const passwordHash = await this.hashPassword(password);
        if (user.passwordHash !== passwordHash) {
            throw new Error('Incorrect password. Please try again.');
        }

        this.setSession({
            userId: normalizedId,
            fullName: user.fullName,
            loginAt: new Date().toISOString()
        });

        return user;
    }

    // Session Management
    setSession(sessionData) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    }

    getSession() {
        try {
            const session = localStorage.getItem(this.SESSION_KEY);
            return session ? JSON.parse(session) : null;
        } catch (e) {
            return null;
        }
    }

    logout() {
        localStorage.removeItem(this.SESSION_KEY);
    }

    // ==========================================
    // User-Isolated Data Management
    // ==========================================
    _getUserDataKey(userId) {
        return `mh_data_${userId.trim().toLowerCase()}`;
    }

    _getUserData(userId) {
        const key = this._getUserDataKey(userId);
        try {
            const raw = localStorage.getItem(key);
            if (!raw) {
                const initial = { classes: [], version: '1.0' };
                localStorage.setItem(key, JSON.stringify(initial));
                return initial;
            }
            return JSON.parse(raw);
        } catch (e) {
            console.error('Error reading user data:', e);
            return { classes: [], version: '1.0' };
        }
    }

    _saveUserData(userId, data) {
        const key = this._getUserDataKey(userId);
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Get all classes for currently logged-in user
    getClasses() {
        const session = this.getSession();
        if (!session) return [];
        const userData = this._getUserData(session.userId);
        return userData.classes || [];
    }

    // Get a specific class by ID
    getClass(classId) {
        const classes = this.getClasses();
        return classes.find(c => c.id === classId) || null;
    }

    // Create or update a class
    saveClass(classData) {
        const session = this.getSession();
        if (!session) throw new Error('Not authenticated');

        const userData = this._getUserData(session.userId);
        if (!userData.classes) userData.classes = [];

        const now = new Date().toISOString();

        if (classData.id) {
            // Update existing
            const index = userData.classes.findIndex(c => c.id === classData.id);
            if (index !== -1) {
                userData.classes[index] = {
                    ...userData.classes[index],
                    ...classData,
                    updatedAt: now
                };
            } else {
                classData.updatedAt = now;
                userData.classes.push(classData);
            }
        } else {
            // Create new
            const newClass = {
                id: 'cls_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                madrasaName: classData.madrasaName || 'Madrasa / School',
                className: classData.className || 'Class 1',
                examName: classData.examName || 'Assessment Exam',
                academicYear: classData.academicYear || new Date().getFullYear().toString(),
                passPercentage: Number(classData.passPercentage) || 36,
                topics: classData.topics || [], // [{ id, name, maxMarks }]
                students: classData.students || [], // [{ id, rollNo, name, gender: 'boy'|'girl' }]
                marks: classData.marks || {}, // { studentId: { topicId: number } }
                createdAt: now,
                updatedAt: now
            };
            userData.classes.unshift(newClass);
            classData = newClass;
        }

        this._saveUserData(session.userId, userData);
        return classData;
    }

    // Delete a class
    deleteClass(classId) {
        const session = this.getSession();
        if (!session) throw new Error('Not authenticated');

        const userData = this._getUserData(session.userId);
        userData.classes = (userData.classes || []).filter(c => c.id !== classId);
        this._saveUserData(session.userId, userData);
    }

    // Fast Single Mark Update for Daily Entry
    updateStudentMark(classId, studentId, topicId, value) {
        const session = this.getSession();
        if (!session) return false;

        const userData = this._getUserData(session.userId);
        const cls = (userData.classes || []).find(c => c.id === classId);
        if (!cls) return false;

        if (!cls.marks) cls.marks = {};
        if (!cls.marks[studentId]) cls.marks[studentId] = {};

        if (value === '' || value === null || value === undefined) {
            delete cls.marks[studentId][topicId];
        } else {
            cls.marks[studentId][topicId] = value;
        }

        cls.updatedAt = new Date().toISOString();
        this._saveUserData(session.userId, userData);
        return true;
    }

    // Export user's private data to JSON file
    exportBackup() {
        const session = this.getSession();
        if (!session) throw new Error('Not authenticated');

        const userData = this._getUserData(session.userId);
        const payload = {
            userId: session.userId,
            fullName: session.fullName,
            exportedAt: new Date().toISOString(),
            app: 'Marksheet Helper',
            data: userData
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marksheet_backup_${session.userId}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Import and restore user's private data from JSON file
    importBackup(jsonString) {
        const session = this.getSession();
        if (!session) throw new Error('Not authenticated');

        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.data || !Array.isArray(parsed.data.classes)) {
                throw new Error('Invalid backup file format');
            }
            this._saveUserData(session.userId, parsed.data);
            return true;
        } catch (e) {
            throw new Error('Failed to parse backup: ' + e.message);
        }
    }
}

// Global instance available to controllers
window.storageModel = new StorageModel();
