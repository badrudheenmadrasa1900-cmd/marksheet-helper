/**
 * MarksheetController.js
 * MVC - Controller Layer: Managing student rows, topic columns, marks entry, and calculations.
 */

class MarksheetController {
    constructor() {}

    openClass(classId, tab = 'boys') {
        const cls = window.storageModel.getClass(classId);
        if (!cls) {
            alert('ക്ലാസ് കണ്ടെത്താനായില്ല.');
            window.classController.showDashboard();
            return;
        }

        window.marksheetView.render(cls, tab);
    }

    addStudent(classId, studentData) {
        const cls = window.storageModel.getClass(classId);
        if (!cls) return;

        if (!cls.students) cls.students = [];

        const newStudent = {
            id: 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            rollNo: studentData.rollNo || (cls.students.length + 1).toString(),
            name: studentData.name,
            gender: studentData.gender || 'boy'
        };

        cls.students.push(newStudent);
        // Sort students naturally by roll number
        cls.students.sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0));

        window.storageModel.saveClass(cls);

        // Render in the added student's gender tab
        const targetTab = newStudent.gender === 'girl' ? 'girls' : 'boys';
        this.openClass(classId, targetTab);
    }

    addBulkStudents(classId, studentsArray) {
        const cls = window.storageModel.getClass(classId);
        if (!cls) return;

        if (!cls.students) cls.students = [];

        studentsArray.forEach(st => {
            cls.students.push({
                id: 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                rollNo: st.rollNo,
                name: st.name,
                gender: st.gender || 'boy'
            });
        });

        cls.students.sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0));
        window.storageModel.saveClass(cls);

        const firstGender = studentsArray[0]?.gender === 'girl' ? 'girls' : 'boys';
        this.openClass(classId, firstGender);
    }

    deleteStudent(classId, studentId) {
        const cls = window.storageModel.getClass(classId);
        if (!cls) return;

        cls.students = (cls.students || []).filter(s => s.id !== studentId);
        if (cls.marks && cls.marks[studentId]) {
            delete cls.marks[studentId];
        }

        window.storageModel.saveClass(cls);
        this.openClass(classId, window.marksheetView.activeTab);
    }

    updateTopics(classId, topics) {
        const cls = window.storageModel.getClass(classId);
        if (!cls) return;

        cls.topics = topics;
        window.storageModel.saveClass(cls);
        this.openClass(classId, window.marksheetView.activeTab);
    }

    /**
     * One-Click Import from Excel / CSV
     */
    importExcelData(classId, { students, topics, marks }) {
        const cls = window.storageModel.getClass(classId);
        if (!cls) return { success: false, error: 'Class not found' };

        if (!cls.students) cls.students = [];
        if (!cls.topics) cls.topics = [];
        if (!cls.marks) cls.marks = {};

        // 1. Discover & Merge Topics
        const topicNameToId = {};
        cls.topics.forEach(t => {
            topicNameToId[t.name.trim().toLowerCase()] = t.id;
        });

        topics.forEach(newTop => {
            const cleanName = newTop.name.trim().toLowerCase();
            if (!topicNameToId[cleanName]) {
                const topicId = 'top_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
                cls.topics.push({
                    id: topicId,
                    name: newTop.name.trim(),
                    maxMarks: Number(newTop.maxMarks) || 50
                });
                topicNameToId[cleanName] = topicId;
            }
        });

        // 2. Merge Students & Mark Columns
        let addedCount = 0;
        let updatedCount = 0;

        students.forEach((st, idx) => {
            const rollStr = (st.rollNo !== undefined && st.rollNo !== null && st.rollNo !== '') 
                ? st.rollNo.toString().trim() 
                : (cls.students.length + 1).toString();
            const nameStr = (st.name || '').toString().trim() || `Student ${rollStr}`;
            const genderStr = (st.gender === 'girl' || st.gender === 'പെൺ') ? 'girl' : 'boy';

            let existing = cls.students.find(s => s.rollNo.toString().trim() === rollStr);
            if (!existing && nameStr) {
                existing = cls.students.find(s => s.name.trim().toLowerCase() === nameStr.toLowerCase());
            }

            let studentId;
            if (existing) {
                studentId = existing.id;
                existing.name = nameStr;
                existing.gender = genderStr;
                updatedCount++;
            } else {
                studentId = 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) + '_' + idx;
                cls.students.push({
                    id: studentId,
                    rollNo: rollStr,
                    name: nameStr,
                    gender: genderStr
                });
                addedCount++;
            }

            // Assign marks to all columns
            const rowMarks = marks[st._tempId] || marks[idx] || marks[rollStr] || {};
            if (!cls.marks[studentId]) cls.marks[studentId] = {};

            Object.keys(rowMarks).forEach(rawTopicName => {
                const cleanTName = rawTopicName.trim().toLowerCase();
                const matchedTopicId = topicNameToId[cleanTName];
                if (matchedTopicId && rowMarks[rawTopicName] !== undefined && rowMarks[rawTopicName] !== '') {
                    cls.marks[studentId][matchedTopicId] = rowMarks[rawTopicName];
                }
            });
        });

        cls.students.sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0));
        window.storageModel.saveClass(cls);
        this.openClass(classId, window.marksheetView.activeTab);
        return { success: true, addedCount, updatedCount, totalStudents: cls.students.length };
    }

    /**
     * Import Extracted Data from Gemini 1.5 Flash Photo Scanner
     */
    importGeminiData(classId, extractedList) {
        const cls = window.storageModel.getClass(classId);
        if (!cls) return { success: false, error: 'Class not found' };

        if (!cls.students) cls.students = [];
        if (!cls.topics) cls.topics = [];
        if (!cls.marks) cls.marks = {};

        const topicNameToId = {};
        cls.topics.forEach(t => {
            topicNameToId[t.name.trim().toLowerCase()] = t.id;
        });

        let addedCount = 0;
        let updatedCount = 0;

        extractedList.forEach((st, idx) => {
            const rollStr = st.rollNo ? st.rollNo.toString().trim() : (cls.students.length + 1).toString();
            const nameStr = (st.name || '').toString().trim();
            if (!nameStr) return;

            const genderStr = (st.gender === 'girl' || st.gender === 'പെൺ') ? 'girl' : 'boy';

            let existing = cls.students.find(s => s.rollNo.toString().trim() === rollStr);
            if (!existing) {
                existing = cls.students.find(s => s.name.trim().toLowerCase() === nameStr.toLowerCase());
            }

            let studentId;
            if (existing) {
                studentId = existing.id;
                existing.name = nameStr;
                existing.gender = genderStr;
                updatedCount++;
            } else {
                studentId = 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) + '_' + idx;
                cls.students.push({
                    id: studentId,
                    rollNo: rollStr,
                    name: nameStr,
                    gender: genderStr
                });
                addedCount++;
            }

            // Merge subject marks
            if (st.marks && typeof st.marks === 'object') {
                if (!cls.marks[studentId]) cls.marks[studentId] = {};
                Object.keys(st.marks).forEach(topicName => {
                    const cleanTName = topicName.trim().toLowerCase();
                    let topicId = topicNameToId[cleanTName];
                    if (!topicId) {
                        topicId = 'top_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
                        cls.topics.push({
                            id: topicId,
                            name: topicName.trim(),
                            maxMarks: 50
                        });
                        topicNameToId[cleanTName] = topicId;
                    }
                    const markVal = st.marks[topicName];
                    if (markVal !== undefined && markVal !== null && markVal !== '') {
                        cls.marks[studentId][topicId] = markVal;
                    }
                });
            }
        });

        cls.students.sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0));
        window.storageModel.saveClass(cls);
        this.openClass(classId, window.marksheetView.activeTab);
        return { success: true, addedCount, updatedCount, totalStudents: cls.students.length };
    }
}

window.marksheetController = new MarksheetController();
