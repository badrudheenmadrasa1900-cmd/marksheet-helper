/**
 * MarksheetModel.js
 * MVC - Model Layer: Marksheet calculations, totals, ranks, and statistics.
 * Simplified per user request: No Grade and No Overall Percentage.
 * Pass / Fail status is determined strictly per topic:
 * If a student fails (or is absent) in 1 or more subjects (<36%), they fail ('തോറ്റു' - Red).
 * If they pass all subjects, they pass ('പാസ്സ്' - Green).
 */

class MarksheetModel {
    /**
     * Compute score row for a student with single-topic evaluation & color coding
     */
    static computeStudentResult(student, topics, marksMap, passPercentage = 36) {
        const passPct = (Number(passPercentage) === 40 || !passPercentage) ? 36 : Number(passPercentage);
        const studentMarks = (marksMap && marksMap[student.id]) || {};
        let totalScored = 0;
        let totalMax = 0;
        let hasAnyMark = false;
        let hasAbsent = false;
        let failedTopicsCount = 0;
        let enteredTopicsCount = 0;

        const topicScores = {};

        topics.forEach(topic => {
            const rawVal = studentMarks[topic.id];
            const max = Number(topic.maxMarks) || 100;
            totalMax += max;

            if (rawVal === 'Ab' || rawVal === 'ab' || rawVal === 'AB') {
                topicScores[topic.id] = { 
                    value: 'Ab', 
                    numeric: 0, 
                    isAbsent: true,
                    percentage: 0,
                    isPassed: false,
                    colorClass: 'mark-fail',
                    color: '#ef4444'
                };
                hasAbsent = true;
                hasAnyMark = true;
                enteredTopicsCount++;
                failedTopicsCount++;
            } else if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
                const num = Number(rawVal);
                const safeNum = isNaN(num) ? 0 : Math.max(0, Math.min(num, max));
                const topicPct = max > 0 ? ((safeNum / max) * 100) : 0;
                const roundedTopicPct = Math.round(topicPct * 10) / 10;
                
                // Single topic pass threshold (36%)
                const isTopicPassed = roundedTopicPct >= passPct;
                if (!isTopicPassed) {
                    failedTopicsCount++;
                }

                // Color tier logic:
                // >= 90% -> Green (#16a34a)
                // >= 50% -> Blue (#2563eb)
                // >= passPct (36%) -> Pass (Amber #d97706)
                // < passPct -> Fail (Red #ef4444)
                let colorClass = 'mark-fail';
                let color = '#ef4444';

                if (roundedTopicPct >= 90) {
                    colorClass = 'mark-excellent';
                    color = '#16a34a';
                } else if (roundedTopicPct >= 50) {
                    colorClass = 'mark-good';
                    color = '#2563eb';
                } else if (isTopicPassed) {
                    colorClass = 'mark-pass';
                    color = '#d97706';
                }

                topicScores[topic.id] = { 
                    value: safeNum, 
                    numeric: safeNum, 
                    isAbsent: false,
                    percentage: roundedTopicPct,
                    isPassed: isTopicPassed,
                    colorClass,
                    color
                };
                totalScored += safeNum;
                hasAnyMark = true;
                enteredTopicsCount++;
            } else {
                topicScores[topic.id] = { 
                    value: '', 
                    numeric: 0, 
                    isAbsent: false, 
                    isEmpty: true,
                    percentage: 0,
                    isPassed: false,
                    colorClass: '',
                    color: ''
                };
            }
        });

        // Pass/Fail Logic:
        // Evaluated solely based on whether the student failed in 1 or more subjects.
        // If a student failed in 1 or more subjects (<36% or Absent), they fail ('തോറ്റു').
        // If they passed every entered subject, they pass ('പാസ്സ്').
        // No overall percentage evaluation.
        const hasFailedTopics = (failedTopicsCount > 0) || hasAbsent;
        const isPassed = hasAnyMark && !hasFailedTopics;

        let statusText = '-';
        let statusClass = '';
        if (hasAnyMark) {
            statusText = isPassed ? 'Pass' : 'Fail';
            statusClass = isPassed ? 'status-pass' : 'status-fail';
        }

        return {
            student,
            topicScores,
            totalScored,
            totalMax,
            status: statusText,
            statusClass: statusClass,
            failedTopicsCount,
            hasFailedTopics,
            hasAnyMark,
            hasAbsent,
            isPassed
        };
    }

    /**
     * Process an array of students, compute their scores and compute ranks
     */
    static processSheet(students, topics, marksMap, passPercentage = 36) {
        const results = students.map(st => this.computeStudentResult(st, topics, marksMap, passPercentage));

        // Sort by passed status first (passed students get ranks), then by total scored descending
        const sorted = [...results].sort((a, b) => {
            if (a.isPassed && !b.isPassed) return -1;
            if (!a.isPassed && b.isPassed) return 1;
            return b.totalScored - a.totalScored;
        });

        let currentRank = 1;
        sorted.forEach((item, index) => {
            if (!item.hasAnyMark || !item.isPassed) {
                // Students with no marks or who failed any topic do not get a merit rank
                item.rank = '-';
            } else {
                if (index > 0 && sorted[index - 1].isPassed && item.totalScored < sorted[index - 1].totalScored) {
                    currentRank = index + 1;
                }
                item.rank = currentRank;
            }
        });

        // Return back in original student order (usually by Roll No)
        return results;
    }

    /**
     * Calculate summary statistics for a class
     */
    static calculateStats(classData) {
        const students = classData.students || [];
        const topics = classData.topics || [];
        const marks = classData.marks || {};
        const passPct = classData.passPercentage || 36;

        const boys = students.filter(s => s.gender === 'boy');
        const girls = students.filter(s => s.gender === 'girl');

        const allResults = this.processSheet(students, topics, marks, passPct);
        const boysResults = this.processSheet(boys, topics, marks, passPct);
        const girlsResults = this.processSheet(girls, topics, marks, passPct);

        const activeResults = allResults.filter(r => r.hasAnyMark);
        const passedCount = activeResults.filter(r => r.status === 'Pass').length;
        const totalMaxMarks = topics.reduce((sum, t) => sum + (Number(t.maxMarks) || 100), 0);

        const avgScore = activeResults.length > 0 
            ? Math.round((activeResults.reduce((sum, r) => sum + r.totalScored, 0) / activeResults.length) * 10) / 10
            : 0;

        // Topic-wise averages
        const topicStats = topics.map(topic => {
            const scores = [];
            students.forEach(st => {
                const markObj = (marks[st.id] && marks[st.id][topic.id]);
                if (markObj !== undefined && markObj !== '' && markObj !== 'Ab') {
                    scores.push(Number(markObj));
                }
            });
            const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';
            const highest = scores.length > 0 ? Math.max(...scores) : '-';
            return {
                topic,
                avg,
                highest,
                count: scores.length
            };
        });

        return {
            totalStudents: students.length,
            boysCount: boys.length,
            girlsCount: girls.length,
            topicsCount: topics.length,
            totalMaxMarks,
            activeCount: activeResults.length,
            passedCount,
            failedCount: activeResults.length - passedCount,
            passRate: activeResults.length > 0 ? Math.round((passedCount / activeResults.length) * 100) : 0,
            avgScore,
            topicStats,
            allResults,
            boysResults,
            girlsResults
        };
    }
}

window.marksheetModel = MarksheetModel;
