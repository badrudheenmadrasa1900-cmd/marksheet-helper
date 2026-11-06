/**
 * ClassController.js
 * MVC - Controller Layer: Managing classes on the dashboard.
 */

class ClassController {
    constructor() {}

    showDashboard() {
        const session = window.storageModel.getSession();
        if (!session) {
            window.authController.showLogin();
            return;
        }

        let classes = window.storageModel.getClasses();
        // If teacher has assigned classes, filter visible classes accordingly
        if (session.role === 'teacher' && Array.isArray(session.assignedClasses) && session.assignedClasses.length > 0) {
            classes = classes.filter(cls => {
                const clsNum = parseInt((cls.className || '').replace(/\D/g, ''), 10);
                return isNaN(clsNum) || session.assignedClasses.includes(clsNum);
            });
        }

        window.dashboardView.render(classes, session);
    }

    saveClass(classData) {
        try {
            const session = window.storageModel.getSession();
            // Verification: Only Admin or authorized teachers can create/modify classes
            if (session && session.role !== 'admin') {
                const clsNum = parseInt((classData.className || '').replace(/\D/g, ''), 10);
                if (!isNaN(clsNum) && (!session.assignedClasses || !session.assignedClasses.includes(clsNum))) {
                    alert(`Permission Denied: You are only authorized to manage Class: ${(session.assignedClasses || []).join(', ')}. Please contact Admin/Headmaster.`);
                    return;
                }
            }

            const saved = window.storageModel.saveClass(classData);
            // Open the created/updated class directly or refresh dashboard
            if (saved && saved.id) {
                window.marksheetController.openClass(saved.id);
            } else {
                this.showDashboard();
            }
        } catch (err) {
            alert('Error saving class: ' + err.message);
        }
    }

    deleteClass(classId) {
        try {
            window.storageModel.deleteClass(classId);
            this.showDashboard();
        } catch (err) {
            alert('Error deleting class: ' + err.message);
        }
    }
}

window.classController = new ClassController();
