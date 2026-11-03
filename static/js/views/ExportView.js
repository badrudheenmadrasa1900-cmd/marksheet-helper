/**
 * ExportView.js
 * MVC - View Layer: Exporting Marksheets to PDF, Excel (.xlsx), and Print.
 * Fully formatted according to Samastha Kerala Islam Matha Vidyabhyasa Board (SKIMVB) standards.
 */

class ExportView {
    constructor() {}

    /**
     * Generate and download professional PDF marksheet (SKIMVB layout)
     */
    exportPDF(cls, activeTab = 'all') {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            alert('PDF ലൈബ്രറി ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല. ദയവായി പേജ് റീഫ്രഷ് ചെയ്യുക അല്ലെങ്കിൽ പ്രിന്റ് ഓപ്ഷൻ ഉപയോഗിക്കുക.');
            window.print();
            return;
        }

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const topics = cls.topics || [];
        const stats = window.marksheetModel.calculateStats(cls);

        let sheetTitle = 'എല്ലാ വിദ്യാർത്ഥികളുടെയും മാർക്ക് ലിസ്റ്റ് (All Students)';
        let results = stats.allResults;

        if (activeTab === 'boys') {
            sheetTitle = 'ആൺകുട്ടികളുടെ മാർക്ക് ലിസ്റ്റ് (Boys Mark List)';
            results = stats.boysResults;
        } else if (activeTab === 'girls') {
            sheetTitle = 'പെൺകുട്ടികളുടെ മാർക്ക് ലിസ്റ്റ് (Girls Mark List)';
            results = stats.girlsResults;
        }

        // Top Border Box (SKIMVB Header Box)
        doc.setDrawColor(20, 20, 20);
        doc.setLineWidth(0.4);
        doc.rect(14, 10, 269, 24); // x, y, w, h

        // Line dividing Row 1 and Row 2
        doc.line(14, 21, 283, 21);

        // Vertical dividers in Row 2
        doc.line(75, 21, 75, 34);
        doc.line(195, 21, 195, 34);

        // Row 1 Content: Madrasa and Place
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`MADRASA: ${cls.madrasaName || ''}`, 18, 17);
        doc.text(`PLACE: ${cls.place || ''}`, 220, 17);

        // Row 2 Content: Left (Reg No)
        doc.setFontSize(9);
        doc.text(`SKIMVB REG.NO: ${cls.skimvbRegNo || '-'}`, 18, 29);

        // Row 2 Content: Center (Mark List Title)
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('MARK LIST (മാർക്ക് ലിസ്റ്റ്)', 135, 29, { align: 'center' });

        // Row 2 Content: Right (Year, Class, Term)
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`YEAR: ${cls.academicYear || ''}   CLASS: ${cls.className || ''}   TERM: ${cls.term || cls.examName || ''}`, 198, 29);

        // Prepare Table Columns & Rows
        const head = [
            [
                'No',
                'Student Name',
                'Att',
                ...topics.map(t => `${t.name}\n(${t.maxMarks})`),
                'TOTAL',
                'REMARK',
                'RANK'
            ]
        ];

        const body = results.map(res => {
            const markCells = topics.map(t => {
                const s = res.topicScores[t.id];
                if (!s || s.isEmpty) return '-';
                if (s.isAbsent) return 'Ab';
                return s.numeric.toString();
            });

            return [
                res.student.rollNo || '-',
                res.student.name,
                res.student.attendance || '-',
                ...markCells,
                `${res.totalScored} / ${res.totalMax}`,
                res.status === 'Pass' ? 'Pass' : 'Fail',
                res.rank
            ];
        });

        // Generate AutoTable
        doc.autoTable({
            head: head,
            body: body,
            startY: 37,
            theme: 'grid',
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
                fontSize: 8.5
            },
            bodyStyles: {
                fontSize: 8.5,
                valign: 'middle',
                halign: 'center',
                textColor: [0, 0, 0]
            },
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 48, halign: 'left' },
                2: { cellWidth: 14 }
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            margin: { left: 14, right: 14, bottom: 25 },
            didDrawPage: function (data) {
                // Footer Page Number
                const pageHeight = doc.internal.pageSize.height || 210;
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(148, 163, 184);
                doc.text(
                    `SKIMVB Mark Sheet Helper  •  Date: ${new Date().toLocaleDateString('en-GB')}`,
                    14,
                    pageHeight - 6
                );
            }
        });

        // SKIMVB Bottom Summary Table and Mu'allim Signature Box
        const finalY = doc.lastAutoTable.finalY + 8;
        const pageHeight = doc.internal.pageSize.height || 210;

        // If not enough room on current page, add new page
        if (finalY > pageHeight - 35) {
            doc.addPage();
        }

        const summaryY = finalY > pageHeight - 35 ? 15 : finalY;

        // Summary Table on the Left
        doc.autoTable({
            startY: summaryY,
            margin: { left: 14 },
            tableWidth: 120,
            theme: 'grid',
            head: [['വിവരം (Details)', 'ആണ് (Boys)', 'പെണ് (Girls)', 'ആകെ (Total)']],
            body: [
                ['വിദ്യാർത്ഥികൾ (Students)', stats.skimvbStats.students.boys, stats.skimvbStats.students.girls, stats.skimvbStats.students.total],
                ['വിജയികൾ (Passed)', stats.skimvbStats.passed.boys, stats.skimvbStats.passed.girls, stats.skimvbStats.passed.total],
                ['ശതമാനം (Percentage)', `${stats.skimvbStats.percentage.boys}%`, `${stats.skimvbStats.percentage.girls}%`, `${stats.skimvbStats.percentage.total}%`]
            ],
            headStyles: {
                fillColor: [241, 245, 249],
                textColor: [15, 23, 42],
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 8
            },
            bodyStyles: {
                fontSize: 8,
                halign: 'center',
                textColor: [0, 0, 0]
            },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold' }
            }
        });

        // Mu'allim (Signature) Box on the Right
        const sigX = 210;
        const sigY = summaryY + 12;
        doc.setDrawColor(20, 20, 20);
        doc.setLineWidth(0.4);
        doc.line(sigX, sigY + 5, sigX + 60, sigY + 5);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('മുതഅല്ലിം (Muallim Signature)', sigX + 30, sigY + 11, { align: 'center' });

        // Save PDF
        const safeOrg = (cls.madrasaName || 'Madrasa').replace(/[^a-zA-Z0-9]/g, '_');
        const safeClass = (cls.className || 'Class').replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`${safeOrg}_${safeClass}_SKIMVB_Marksheet.pdf`);
    }

    /**
     * Generate and download Excel spreadsheet (.xlsx)
     */
    exportExcel(cls, activeTab = 'all') {
        const XLSX = window.XLSX;
        if (!XLSX) {
            alert('Excel ലൈബ്രറി ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല. ദയവായി പേജ് റീഫ്രഷ് ചെയ്യുക.');
            return;
        }

        const stats = window.marksheetModel.calculateStats(cls);
        const topics = cls.topics || [];

        let results = stats.allResults;
        let sheetName = 'All Students';

        if (activeTab === 'boys') {
            results = stats.boysResults;
            sheetName = 'Boys';
        } else if (activeTab === 'girls') {
            results = stats.girlsResults;
            sheetName = 'Girls';
        }

        const rows = [];

        // Meta info header rows matching SKIMVB
        rows.push([cls.madrasaName || 'മദ്റസ', `Place: ${cls.place || ''}`, `SKIMVB Reg: ${cls.skimvbRegNo || ''}`]);
        rows.push([`Class: ${cls.className}`, `Term: ${cls.term || cls.examName || ''}`, `Year: ${cls.academicYear || ''}`]);
        rows.push([`Sheet: ${sheetName}`, `Exported on: ${new Date().toLocaleString()}`]);
        rows.push([]); // blank row

        // Column Headers
        const headerRow = [
            'No (Roll)',
            'Student Name',
            'Gender',
            'Attendance (ഹാജർ)',
            ...topics.map(t => `${t.name} (Max: ${t.maxMarks})`),
            'Total Scored',
            'Total Max',
            'Rank',
            'Remark / Status'
        ];
        rows.push(headerRow);

        // Student Data Rows
        results.forEach(res => {
            const markValues = topics.map(t => {
                const s = res.topicScores[t.id];
                if (!s || s.isEmpty) return '';
                if (s.isAbsent) return 'Ab';
                return s.numeric;
            });

            rows.push([
                res.student.rollNo || '',
                res.student.name,
                res.student.gender === 'girl' ? 'Girl' : 'Boy',
                res.student.attendance || '',
                ...markValues,
                res.totalScored,
                res.totalMax,
                res.rank,
                res.status === 'Pass' ? 'വിജയിച്ചു (Pass)' : 'തോറ്റു (Fail)'
            ]);
        });

        // Summary Rows at Bottom
        rows.push([]);
        rows.push(['--- SKIMVB SUMMARY STATS ---']);
        rows.push(['Details', 'Boys (ആണ്)', 'Girls (പെണ്)', 'Total (ആകെ)']);
        rows.push(['Students (വിദ്യാർത്ഥികൾ)', stats.skimvbStats.students.boys, stats.skimvbStats.students.girls, stats.skimvbStats.students.total]);
        rows.push(['Passed (വിജയികൾ)', stats.skimvbStats.passed.boys, stats.skimvbStats.passed.girls, stats.skimvbStats.passed.total]);
        rows.push(['Percentage (ശതമാനം)', `${stats.skimvbStats.percentage.boys}%`, `${stats.skimvbStats.percentage.girls}%`, `${stats.skimvbStats.percentage.total}%`]);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rows);

        // Auto width for columns
        ws['!cols'] = [
            { wch: 8 },  // Roll
            { wch: 25 }, // Name
            { wch: 10 }, // Gender
            { wch: 14 }, // Attendance
            ...topics.map(() => ({ wch: 16 })),
            { wch: 12 }, // Total
            { wch: 10 }, // Max
            { wch: 8 },  // Rank
            { wch: 15 }  // Status
        ];

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        const safeOrg = (cls.madrasaName || 'Madrasa').replace(/[^a-zA-Z0-9]/g, '_');
        const safeClass = (cls.className || 'Class').replace(/[^a-zA-Z0-9]/g, '_');
        XLSX.writeFile(wb, `${safeOrg}_${safeClass}_${activeTab}_marksheet.xlsx`);
    }
}

window.exportView = new ExportView();
