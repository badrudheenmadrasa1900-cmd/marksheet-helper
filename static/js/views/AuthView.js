/**
 * AuthView.js
 * MVC - View Layer: Authentication Interface (Login & Register)
 */

class AuthView {
    constructor() {
        this.container = document.getElementById('app-root');
    }

    render(isRegister = false, errorMsg = '') {
        this.container.innerHTML = `
            <div class="auth-wrapper">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-brand-badge">Badrudheen Madrasa</div>
                        <h1 class="auth-title">Staff Portal</h1>
                        <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 4px;">Sign in to manage classes and mark sheets</p>
                    </div>

                    ${errorMsg ? `<div class="alert alert-danger" role="alert">${errorMsg}</div>` : ''}

                    <div class="auth-tabs">
                        <button class="auth-tab ${!isRegister ? 'active' : ''}" id="tab-login-btn">Sign In</button>
                        <button class="auth-tab ${isRegister ? 'active' : ''}" id="tab-register-btn">Register</button>
                    </div>

                    ${!isRegister ? this._renderLoginForm() : this._renderRegisterForm()}
                </div>
            </div>
        `;

        this._bindEvents(isRegister);
    }

    _renderLoginForm() {
        return `
            <form id="login-form" class="auth-form" autocomplete="off">
                <div class="form-group">
                    <label class="form-label" for="login-userid">User ID / Username</label>
                    <input 
                        type="text" 
                        id="login-userid" 
                        class="form-control" 
                        placeholder="Enter username (e.g. admin)" 
                        required 
                        autofocus
                    >
                </div>
                <div class="form-group">
                    <label class="form-label" for="login-password">Password</label>
                    <input 
                        type="password" 
                        id="login-password" 
                        class="form-control" 
                        placeholder="Enter password" 
                        required
                    >
                </div>
                <button type="submit" class="btn btn-primary btn-block">Sign In</button>
            </form>
        `;
    }

    _renderRegisterForm() {
        return `
            <form id="register-form" class="auth-form" autocomplete="off">
                <div class="form-group">
                    <label class="form-label" for="reg-fullname">Full Name</label>
                    <input 
                        type="text" 
                        id="reg-fullname" 
                        class="form-control" 
                        placeholder="Full Name" 
                        required 
                        autofocus
                    >
                </div>
                <div class="form-group">
                    <label class="form-label" for="reg-userid">Choose Username</label>
                    <input 
                        type="text" 
                        id="reg-userid" 
                        class="form-control" 
                        placeholder="Username" 
                        required
                    >
                </div>
                <div class="form-group">
                    <label class="form-label" for="reg-password">Create Password</label>
                    <input 
                        type="password" 
                        id="reg-password" 
                        class="form-control" 
                        placeholder="Password" 
                        required
                    >
                </div>
                <button type="submit" class="btn btn-primary btn-block">Register Account</button>
            </form>
        `;
    }

    _bindEvents(isRegister) {
        const loginTabBtn = document.getElementById('tab-login-btn');
        const regTabBtn = document.getElementById('tab-register-btn');

        if (loginTabBtn) {
            loginTabBtn.addEventListener('click', () => {
                window.authController.showLogin();
            });
        }

        if (regTabBtn) {
            regTabBtn.addEventListener('click', () => {
                window.authController.showRegister();
            });
        }

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const userId = document.getElementById('login-userid').value;
                const pass = document.getElementById('login-password').value;
                window.authController.handleLogin(userId, pass);
            });
        }

        const regForm = document.getElementById('register-form');
        if (regForm) {
            regForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const fullName = document.getElementById('reg-fullname').value;
                const userId = document.getElementById('reg-userid').value;
                const pass = document.getElementById('reg-password').value;
                window.authController.handleRegister(userId, fullName, pass);
            });
        }
    }
}

window.authView = new AuthView();
