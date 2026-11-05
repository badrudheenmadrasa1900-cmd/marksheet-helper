/**
 * AuthController.js
 * MVC - Controller Layer: Handles authentication logic, registration, login sessions.
 */

class AuthController {
    constructor() {}

    init() {
        const session = window.storageModel.getSession();
        if (session) {
            window.classController.showDashboard();
        } else {
            this.showLogin();
        }
    }

    showLogin(errorMsg = '') {
        window.authView.render(false, errorMsg);
    }

    showRegister(errorMsg = '') {
        window.authView.render(true, errorMsg);
    }

    async handleLogin(userId, password) {
        try {
            // First attempt to authenticate via Supabase cloud
            if (window.supabaseService) {
                try {
                    const cloudProfile = await window.supabaseService.login(userId, password);
                    // Store cloud session
                    window.storageModel.setSession({
                        userId: cloudProfile.userId,
                        fullName: cloudProfile.fullName,
                        role: cloudProfile.role,
                        assignedClasses: cloudProfile.assignedClasses,
                        loginAt: new Date().toISOString()
                    });
                    window.classController.showDashboard();
                    return;
                } catch (cloudErr) {
                    // If cloud login specifically rejected credentials, throw it
                    if (cloudErr.message.includes('തെറ്റായ പാസ്‌വേഡ്') || cloudErr.message.includes('ഉപയോക്തൃ നാമം')) {
                        throw cloudErr;
                    }
                    console.warn('Supabase cloud login fallback to local:', cloudErr);
                }
            }

            // Fallback to local storage vault
            await window.storageModel.login(userId, password);
            window.classController.showDashboard();
        } catch (err) {
            this.showLogin(err.message);
        }
    }

    async handleRegister(userId, fullName, password) {
        try {
            await window.storageModel.register(userId, fullName, password);
            window.classController.showDashboard();
        } catch (err) {
            this.showRegister(err.message);
        }
    }

    handleLogout() {
        window.storageModel.logout();
        this.showLogin();
    }
}

window.authController = new AuthController();
