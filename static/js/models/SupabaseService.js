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

        // Standard Samastha syllabus subjects with Arabic translations (all max marks 50, pass mark 18 = 36%)
        this.DEFAULT_SUBJECTS = [
            { id: 'sub_fiqh', subject: "FIQH", arabic: "الفقه", defaultMax: 50, passMark: 18 },
            { id: 'sub_lisan', subject: "LISANUL QUR'AN", arabic: "لسان القرآن", defaultMax: 50, passMark: 18 },
            { id: 'sub_duroos', subject: "DUROOSUL IHSAN", arabic: "دروس الإحسان", defaultMax: 50, passMark: 18 },
            { id: 'sub_thareekh', subject: "THAREEKH", arabic: "التّاريخ", defaultMax: 50, passMark: 18 },
            { id: 'sub_quran', subject: "QUR'AN", arabic: "القرآن الكريم", defaultMax: 50, passMark: 18 },
            { id: 'sub_hifz', subject: "HIFZ", arabic: "الحفظ", defaultMax: 50, passMark: 18 },
            { id: 'sub_thafseer', subject: "THAFSEER", arabic: "التّفسير", defaultMax: 50, passMark: 18 },
            { id: 'sub_thajveed', subject: "LISANUL QUR'AN - THAJVEED", arabic: "التّجويد", defaultMax: 50, passMark: 18 },
            { id: 'sub_aqeeda', subject: "AQEEDA", arabic: "العقيدة", defaultMax: 50, passMark: 18 }
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
            throw new Error('Database connection failed.');
        }

        const data = await res.json();
        if (!data || data.length === 0) {
            throw new Error('Username (User ID) not found.');
        }

        const user = data[0];
        if (user.password !== password) {
            throw new Error('Incorrect password! Please try again.');
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
        if (!res.ok) throw new Error('Could not fetch teachers list.');
        return await res.json();
    }

    /**
     * Parse teacher metadata (name, email, phone, email approval status)
     * Tags format: [email:ali@gmail.com,phone:9876543210,email_status:approved]
     */
    parseTeacherProfile(rawProfile) {
        const rawFullName = rawProfile.full_name || rawProfile.username || '';
        let baseName = rawFullName;
        let email = '';
        let phone = '';
        let emailStatus = 'pending'; // 'pending' | 'approved'

        const match = rawFullName.match(/^(.*?)\s*\[(.*?)\]$/);
        if (match) {
            baseName = match[1].trim();
            const tags = match[2].split(',');
            tags.forEach(tag => {
                const [k, v] = tag.split(':');
                if (k === 'email') email = (v || '').trim();
                if (k === 'phone') phone = (v || '').trim();
                if (k === 'email_status') emailStatus = (v || '').trim();
            });
        }

        // If email was assigned with no explicit email_status, but has phone/email from admin, check status
        if (!emailStatus) emailStatus = email ? 'approved' : 'none';

        return {
            id: rawProfile.id,
            username: rawProfile.username,
            displayName: baseName,
            fullName: rawFullName,
            email: email,
            phone: phone,
            emailStatus: emailStatus, // 'pending' | 'approved' | 'none'
            role: rawProfile.role || 'teacher',
            assignedClasses: rawProfile.assigned_classes || []
        };
    }

    /**
     * Create or update a teacher profile (Admin only)
     * Stores email, phone, and approval status safely inside full_name metadata tag:
     * e.g., "Usthad Ali [email:ali@gmail.com,phone:9876543210,email_status:approved]"
     */
    async saveTeacher(teacherData) {
        const cleanUser = teacherData.username.trim().toLowerCase();
        
        let formattedName = teacherData.full_name || cleanUser;
        const metaParts = [];
        if (teacherData.email && teacherData.email.trim()) {
            metaParts.push(`email:${teacherData.email.trim().toLowerCase()}`);
        }
        if (teacherData.phone && teacherData.phone.trim()) {
            metaParts.push(`phone:${teacherData.phone.trim()}`);
        }
        const emailStatus = teacherData.emailStatus || (teacherData.email ? 'approved' : 'none');
        if (emailStatus) {
            metaParts.push(`email_status:${emailStatus}`);
        }

        if (metaParts.length > 0) {
            // Strip any previous meta tag
            const baseName = formattedName.replace(/\s*\[.*\]\s*$/, '').trim();
            formattedName = `${baseName} [${metaParts.join(',')}]`;
        }

        const payload = {
            username: cleanUser,
            password: teacherData.password,
            full_name: formattedName,
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
            throw new Error('Could not save teacher: ' + err);
        }
        return await res.json();
    }

    /**
     * Usthad self-registers or adds email for password recovery
     * Sets emailStatus to 'pending' awaiting Sadar Muallim approval
     */
    async requestEmailLinkForTeacher(username, email, phone = '') {
        const cleanUser = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim();

        const url = `${this.url}profiles?username=eq.${encodeURIComponent(cleanUser)}&select=*`;
        const res = await fetch(url, { headers: this.headers });
        if (!res.ok) throw new Error('Database connection failed.');

        const data = await res.json();
        if (!data || data.length === 0) {
            throw new Error(`Usthad username "${username}" not found.`);
        }

        const profile = data[0];
        const parsed = this.parseTeacherProfile(profile);

        // Build new metadata tag with pending status
        const metaParts = [`email:${cleanEmail}`];
        if (cleanPhone || parsed.phone) metaParts.push(`phone:${cleanPhone || parsed.phone}`);
        metaParts.push(`email_status:pending`);

        const newFullName = `${parsed.displayName} [${metaParts.join(',')}]`;

        const patchUrl = `${this.url}profiles?id=eq.${profile.id}`;
        const patchRes = await fetch(patchUrl, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify({ full_name: newFullName })
        });

        if (!patchRes.ok) {
            const err = await patchRes.text();
            throw new Error('Failed to submit email request: ' + err);
        }

        return {
            success: true,
            status: 'pending',
            displayName: parsed.displayName,
            email: cleanEmail
        };
    }

    /**
     * Sadar Muallim approves an Usthad's email linking request
     */
    async approveTeacherEmail(profileId) {
        const url = `${this.url}profiles?id=eq.${profileId}&select=*`;
        const res = await fetch(url, { headers: this.headers });
        if (!res.ok) throw new Error('Database connection error.');
        const data = await res.json();
        if (!data || data.length === 0) throw new Error('Profile not found.');

        const profile = data[0];
        const parsed = this.parseTeacherProfile(profile);

        const metaParts = [];
        if (parsed.email) metaParts.push(`email:${parsed.email}`);
        if (parsed.phone) metaParts.push(`phone:${parsed.phone}`);
        metaParts.push(`email_status:approved`);

        const updatedFullName = `${parsed.displayName} [${metaParts.join(',')}]`;

        const patchUrl = `${this.url}profiles?id=eq.${profileId}`;
        const patchRes = await fetch(patchUrl, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify({ full_name: updatedFullName })
        });
        if (!patchRes.ok) throw new Error('Could not approve email.');
        return true;
    }

    /**
     * Find teacher by username, email, or phone for password recovery
     * Checks if email is approved or phone OTP is verified
     */
    async findTeacherForReset(identifier) {
        const query = identifier.trim().toLowerCase();
        // Fetch profiles
        const url = `${this.url}profiles?select=*`;
        const res = await fetch(url, { headers: this.headers });
        if (!res.ok) throw new Error('Database connection failed.');

        const profiles = await res.json();
        for (const p of profiles) {
            const parsed = this.parseTeacherProfile(p);
            const matchesUser = p.username.toLowerCase() === query;
            const matchesEmail = parsed.email && parsed.email.toLowerCase() === query;
            const matchesPhone = parsed.phone && parsed.phone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, '');

            if (matchesUser || matchesEmail || matchesPhone) {
                // If user matched by email or requested via email:
                if (parsed.email) {
                    if (parsed.emailStatus === 'pending') {
                        return {
                            profile: p,
                            parsed: parsed,
                            isPendingApproval: true,
                            message: `Your email (${parsed.email}) is awaiting approval from Sadar Muallim. Once Sadar Muallim approves it, you can reset your password.`
                        };
                    }
                } else if (!parsed.phone) {
                    // No email and no phone registered
                    return {
                        profile: p,
                        parsed: parsed,
                        needsEmailRegistration: true,
                        message: `No recovery email is linked to account "${p.username}". Please submit your email first. Once Sadar Muallim approves, you can reset your password.`
                    };
                }

                return { profile: p, parsed: parsed, isPendingApproval: false };
            }
        }
        throw new Error('No registered Usthad account matches this username, email, or phone number.');
    }

    /**
     * Update teacher password
     */
    async updatePassword(profileId, newPassword) {
        const url = `${this.url}profiles?id=eq.${profileId}`;
        const res = await fetch(url, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify({ password: newPassword })
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error('Failed to update password: ' + err);
        }
        return true;
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
        if (!res.ok) throw new Error('Could not delete teacher.');
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
            throw new Error('Could not sync student result to Supabase: ' + err);
        }
        return await res.json();
    }

    /**
     * Fetch all submitted results for Admin Review (by class or all)
     */
    async getStudentsForAdmin(classNumber = null) {
        let url = `${this.url}students?order=class_number.asc,register_no.asc&select=*`;
        if (classNumber) {
            url = `${this.url}students?class_number=eq.${classNumber}&order=register_no.asc&select=*`;
        }
        const res = await fetch(url, { headers: this.headers });
        if (!res.ok) throw new Error('Could not fetch student results from Cloud.');
        return await res.json();
    }

    /**
     * Admin Action: Verify and Publish student results to Public Portal
     * Sets syllabus to 'PUBLISHED' or 'PENDING_VERIFICATION'
     */
    async setPublishStatus(registerNo, isPublished = true) {
        const url = `${this.url}students?register_no=eq.${encodeURIComponent(registerNo)}`;
        const statusValue = isPublished ? 'GENERAL' : 'PENDING_APPROVAL';
        const res = await fetch(url, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify({ syllabus: statusValue })
        });
        if (!res.ok) throw new Error('Could not update publication status.');
        return true;
    }

    /**
     * Admin Action: Publish All students of a specific class
     */
    async publishEntireClass(classNumber) {
        const url = `${this.url}students?class_number=eq.${encodeURIComponent(classNumber)}`;
        const res = await fetch(url, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify({ syllabus: 'GENERAL' })
        });
        if (!res.ok) throw new Error('Could not publish class results.');
        return true;
    }

    /**
     * Batch Sync entire class of students to Supabase (Submitted by teacher or admin)
     */
    async syncClassToSupabase(cls, isAutoPublished = false) {
        if (!cls || !cls.students || cls.students.length === 0) return { count: 0 };
        
        const classNumber = parseInt((cls.className || '').replace(/\D/g, '') || '1', 10);
        const topics = cls.topics || [];
        const marksMap = cls.marks || {};

        // Calculate student ranks using standard marksheet model
        const processedSheet = window.marksheetModel.processSheet(cls.students, topics, marksMap, cls.passPercentage || 36);
        const rankMap = {};
        processedSheet.forEach(r => {
            rankMap[r.student.id] = (r.rank && r.rank !== '-') ? String(r.rank) : '';
        });

        let syncedCount = 0;
        for (const student of cls.students) {
            const studentMarks = [];
            const stMarks = marksMap[student.id] || {};
            const attVal = (cls.attendance && cls.attendance[student.id] !== undefined) ? cls.attendance[student.id] : '';

            topics.forEach(top => {
                // Find matching standard subject or custom
                const matchedDef = this.DEFAULT_SUBJECTS.find(s => 
                    top.name.toUpperCase().includes(s.subject) || 
                    s.subject.includes(top.name.toUpperCase())
                );

                const markVal = stMarks[top.id];
                const topMax = Number(top.maxMarks) || 50;
                const passMark = Math.ceil(topMax * 0.36);
                studentMarks.push({
                    subject: matchedDef ? matchedDef.subject : top.name,
                    arabic: matchedDef ? matchedDef.arabic : '',
                    mark: (markVal !== undefined && markVal !== '') ? (isNaN(markVal) ? markVal : Number(markVal)) : 0,
                    max: topMax,
                    passMark: passMark
                });
            });

            // If attendance is present, append as an attendance metric object in marks list
            if (attVal) {
                studentMarks.push({
                    subject: "ATTENDANCE (HAJAR)",
                    arabic: "ഹാജർ",
                    mark: attVal,
                    max: "Att.",
                    isAttendance: true
                });
            }

            const studentRank = rankMap[student.id] || '';
            const statusWithRank = studentRank ? `RANK:${studentRank}` : '';

            await this.saveStudentToSupabase({
                register_no: student.rollNo || student.id,
                name: student.name,
                name_arabic: student.arabicName || '',
                parent_name: student.parentName || '',
                parent_name_arabic: student.parentArabicName || '',
                madrasa_name: cls.madrasaName || 'BADRUDHEEN MADRASA',
                madrasa_code: cls.madrasaCode || '6120',
                class_number: classNumber,
                syllabus: isAutoPublished ? (statusWithRank || 'GENERAL') : 'PENDING_APPROVAL',
                status: statusWithRank || undefined,
                marks: studentMarks
            });
            syncedCount++;
        }

        return { count: syncedCount };
    }
}

window.supabaseService = new SupabaseService();

