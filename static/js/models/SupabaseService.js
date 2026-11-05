/**
 * SupabaseService.js
 * Central client service for connecting with Supabase Database (profiles & students tables).
 * Supports Admin/Teacher role control and Public Result portal.
 */

class SupabaseService {
    constructor() {
        this.url = "https://wbwghcrvcwwdbayqrivz.supabase.co/rest/v1/";
        this.key = "sb_publishable_CLg__H7hzI-W9eeIib6lnQ_bTd1Y19Q";
        this.headers = {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        // Standard Samastha syllabus subjects with Arabic translations
        this.DEFAULT_SUBJECTS = [
            { id: 'sub_fiqh', subject: "FIQH", arabic: "الفقه", defaultMax: 100, passMark: 36 },
            { id: 'sub_lisan', subject: "LISANUL QUR'AN", arabic: "لسان القرآن", defaultMax: 100, passMark: 36 },
            { id: 'sub_duroos', subject: "DUROOSUL IHSAN", arabic: "دروس الإحسان", defaultMax: 100, passMark: 36 },
            { id: 'sub_thareekh', subject: "THAREEKH", arabic: "التّاريخ", defaultMax: 100, passMark: 36 },
            { id: 'sub_quran', subject: "QUR'AN, HIFZ", arabic: "القرآن والحفظ", defaultMax: 100, passMark: 36 },
            { id: 'sub_thafseer', subject: "THAFSEER", arabic: "التّفسير", defaultMax: 100, passMark: 36 },
            { id: 'sub_thajveed', subject: "LISANUL QUR'AN - THAJVEED", arabic: "التّجويد", defaultMax: 100, passMark: 36 },
            { id: 'sub_aqeeda', subject: "AQEEDA", arabic: "العقيدة", defaultMax: 100, passMark: 36 }
        ];
    }

    /**
     * Authenticate profile against Supabase profiles table
     */
    async login(username, password) {
        const cleanUser = username.trim().toLowerCase();
        const url = `${this.url}profiles?username=eq.${encodeURIComponent(cleanUser)}&select=*`;
        
        const res = await fetch(url, { headers: this.headers });
        if (!res.ok) {
            throw new Error('ഡാറ്റാബേസ് കണക്ഷൻ പരാജയപ്പെട്ടു.');
        }

        const data = await res.json();
        if (!data || data.length === 0) {
            throw new Error('ഉപയോക്തൃ നാമം (User ID) കണ്ടെത്തിയില്ല.');
        }

        const user = data[0];
        if (user.password !== password) {
            throw new Error('തെറ്റായ പാസ്‌വേഡ്! ദയവായി വീണ്ടും ശ്രമിക്കുക.');
        }

        return {
            id: user.id,
            userId: user.username,
            fullName: user.full_name,
            role: user.role || 'teacher', // 'admin' or 'teacher'
            assignedClasses: user.assigned_classes || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        };
    }

    /**
     * Fetch list of all teacher profiles (for Admin management)
     */
    async getTeachers() {
        const url = `${this.url}profiles?order=created_at.asc&select=*`;
        const res = await fetch(url, { headers: this.headers });
        if (!res.ok) throw new Error('അധ്യാപകരുടെ വിവരങ്ങൾ ലഭ്യമാക്കാൻ കഴിഞ്ഞില്ല.');
        return await res.json();
    }

    /**
     * Create or update a teacher profile (Admin only)
     */
    async saveTeacher(teacherData) {
        const cleanUser = teacherData.username.trim().toLowerCase();
        const payload = {
            username: cleanUser,
            password: teacherData.password,
            full_name: teacherData.full_name,
            role: teacherData.role || 'teacher',
            assigned_classes: teacherData.assigned_classes || []
        };

        let method = 'POST';
        let url = `${this.url}profiles`;

        if (teacherData.id) {
            method = 'PATCH';
            url = `${this.url}profiles?id=eq.${teacherData.id}`;
        }

        const res = await fetch(url, {
            method: method,
            headers: this.headers,
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error('ടീച്ചറെ സൂക്ഷിക്കാൻ സാധിച്ചില്ല: ' + err);
        }
        return await res.json();
    }

    /**
     * Delete a teacher (Admin only)
     */
    async deleteTeacher(teacherId) {
        const url = `${this.url}profiles?id=eq.${teacherId}`;
        const res = await fetch(url, {
            method: 'DELETE',
            headers: this.headers
        });
        if (!res.ok) throw new Error('ടീച്ചറെ നീക്കം ചെയ്യാൻ സാധിച്ചില്ല.');
        return true;
    }

    /**
     * Generate unique student Register Number
     */
    async generateNextRegisterNo(classNum) {
        const url = `${this.url}students?class_number=eq.${classNum}&order=created_at.desc&limit=1&select=register_no`;
        try {
            const res = await fetch(url, { headers: this.headers });
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    const lastNum = parseInt(data[0].register_no, 10);
                    if (!isNaN(lastNum)) {
                        return (lastNum + 1).toString();
                    }
                }
            }
        } catch (e) {
            console.warn('Could not auto-fetch last register number:', e);
        }
        return (Math.floor(100 + Math.random() * 900)).toString();
    }

    /**
     * Save student result directly to Supabase students table
     */
    async saveStudentToSupabase(studentData) {
        // Calculate totals, pass status & distinction
        let grandTotal = 0;
        let isFailed = false;

        const marks = studentData.marks || [];
        marks.forEach(m => {
            const markVal = Number(m.mark);
            if (!isNaN(markVal)) {
                grandTotal += markVal;
                if (markVal < (m.passMark || 36)) {
                    isFailed = true;
                }
            } else if (m.mark === 'Ab' || m.mark === 'AB') {
                isFailed = true;
            }
        });

        let status = 'PASS';
        if (isFailed) {
            status = 'FAIL';
        } else if (grandTotal >= 300) {
            status = 'Distinction';
        } else if (grandTotal >= 240) {
            status = 'First Class';
        }

        const payload = {
            register_no: String(studentData.register_no || studentData.rollNo || studentData.id),
            name: (studentData.name || '').toUpperCase().trim(),
            name_arabic: studentData.name_arabic || '',
            parent_name: (studentData.parent_name || '').toUpperCase().trim(),
            parent_name_arabic: studentData.parent_name_arabic || '',
            madrasa_name: studentData.madrasa_name || 'MUHYADHEEN, MITHABAIL',
            madrasa_code: studentData.madrasa_code || '6120',
            class_number: parseInt(studentData.class_number || 1, 10),
            syllabus: studentData.syllabus || 'GENERAL',
            marks: marks,
            grand_total: grandTotal,
            status: status
        };

        // Upsert on register_no
        const url = `${this.url}students?on_conflict=register_no`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                ...this.headers,
                'Prefer': 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('Supabase save student error:', err);
            throw new Error('വിദ്യാർത്ഥിയുടെ റിസൾട്ട് Supabase-ലേക്ക് മാറ്റാൻ സാധിച്ചില്ല: ' + err);
        }
        return await res.json();
    }

    /**
     * Batch Sync entire class of students to Supabase
     */
    async syncClassToSupabase(cls) {
        if (!cls || !cls.students || cls.students.length === 0) return { count: 0 };
        
        const classNumber = parseInt((cls.className || '').replace(/\D/g, '') || '1', 10);
        const topics = cls.topics || [];
        const marksMap = cls.marks || {};

        let syncedCount = 0;
        for (const student of cls.students) {
            const studentMarks = [];
            const stMarks = marksMap[student.id] || {};

            topics.forEach(top => {
                // Find matching standard subject or custom
                const matchedDef = this.DEFAULT_SUBJECTS.find(s => 
                    top.name.toUpperCase().includes(s.subject) || 
                    s.subject.includes(top.name.toUpperCase())
                );

                const markVal = stMarks[top.id];
                studentMarks.push({
                    subject: matchedDef ? matchedDef.subject : top.name,
                    arabic: matchedDef ? matchedDef.arabic : '',
                    mark: (markVal !== undefined && markVal !== '') ? (isNaN(markVal) ? markVal : Number(markVal)) : 0,
                    max: top.maxMarks || 100,
                    passMark: 36
                });
            });

            await this.saveStudentToSupabase({
                register_no: student.rollNo || student.id,
                name: student.name,
                name_arabic: student.arabicName || '',
                parent_name: student.parentName || '',
                parent_name_arabic: student.parentArabicName || '',
                madrasa_name: cls.madrasaName || 'MUHYADHEEN, MITHABAIL',
                madrasa_code: cls.madrasaCode || '6120',
                class_number: classNumber,
                syllabus: 'GENERAL',
                marks: studentMarks
            });
            syncedCount++;
        }

        return { count: syncedCount };
    }
}

window.supabaseService = new SupabaseService();

