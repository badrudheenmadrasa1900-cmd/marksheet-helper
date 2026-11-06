/**
 * AuthView.js
 * MVC - View Layer: Authentication Interface (Teacher Login & Self-Service Password Recovery)
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
                        <h1 class="auth-title">Teacher Portal</h1>
                        <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 4px;">Sign in to enter marks and generate mark sheets</p>
                    </div>

                    ${errorMsg ? `<div class="alert alert-danger" role="alert">${errorMsg}</div>` : ''}

                    <div class="auth-tabs">
                        <button class="auth-tab ${!isRegister ? 'active' : ''}" id="tab-login-btn">Teacher Sign In</button>
                        <button class="auth-tab ${isRegister ? 'active' : ''}" id="tab-register-btn">New Teacher</button>
                    </div>

                    ${!isRegister ? this._renderLoginForm() : this._renderRegisterForm()}

                    <div style="margin-top: 1.5rem; text-align: center; border-top: 1px dashed var(--border-color); padding-top: 1rem;">
                        <a href="/admin" class="text-muted" style="font-size: 0.82rem; text-decoration: none; font-weight: 600;">
                            Headmaster / Management Central Control Room &rarr;
                        </a>
                    </div>
                </div>
            </div>

            <!-- Custom Modal Container for Forgot Password & OTP -->
            <div id="auth-modal-root"></div>
        `;

        this._bindEvents(isRegister);
    }

    _renderLoginForm() {
        return `
            <form id="login-form" class="auth-form" autocomplete="off">
                <div class="form-group">
                    <label class="form-label" for="login-userid">Teacher Username or Phone</label>
                    <input 
                        type="text" 
                        id="login-userid" 
                        class="form-control" 
                        placeholder="e.g. teacher_class5 or 9876543210" 
                        required 
                        autofocus
                    >
                </div>
                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <label class="form-label" for="login-password" style="margin-bottom: 0;">Password</label>
                        <button type="button" id="btn-forgot-password" style="background: none; border: none; color: var(--brand-primary); font-size: 0.82rem; font-weight: 700; cursor: pointer; padding: 0;">
                            Forgot Password?
                        </button>
                    </div>
                    <input 
                        type="password" 
                        id="login-password" 
                        class="form-control" 
                        placeholder="Enter password" 
                        required
                    >
                </div>
                <button type="submit" class="btn btn-primary btn-block">Sign In to Teacher Portal</button>
            </form>
        `;
    }

    _renderRegisterForm() {
        return `
            <form id="register-form" class="auth-form" autocomplete="off">
                <div class="form-group">
                    <label class="form-label" for="reg-fullname">Full Name (Usthad / Teacher)</label>
                    <input 
                        type="text" 
                        id="reg-fullname" 
                        class="form-control" 
                        placeholder="Usthad Name" 
                        required 
                        autofocus
                    >
                </div>
                <div class="form-group">
                    <label class="form-label" for="reg-userid">Choose Teacher Username</label>
                    <input 
                        type="text" 
                        id="reg-userid" 
                        class="form-control" 
                        placeholder="e.g. teacher_class3" 
                        required
                    >
                </div>
                <div class="form-group">
                    <label class="form-label" for="reg-phone">Phone Number (For OTP / Recovery)</label>
                    <input 
                        type="tel" 
                        id="reg-phone" 
                        class="form-control" 
                        placeholder="e.g. 9876543210" 
                    >
                </div>
                <div class="form-group">
                    <label class="form-label" for="reg-password">Create Password</label>
                    <input 
                        type="password" 
                        id="reg-password" 
                        class="form-control" 
                        placeholder="Password (minimum 6 characters)" 
                        required
                    >
                </div>
                <button type="submit" class="btn btn-primary btn-block">Register Teacher Account</button>
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

        const forgotBtn = document.getElementById('btn-forgot-password');
        if (forgotBtn) {
            forgotBtn.addEventListener('click', () => {
                this.openForgotPasswordModal();
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
                const phone = document.getElementById('reg-phone') ? document.getElementById('reg-phone').value : '';
                window.authController.handleRegister(userId, fullName, pass, phone);
            });
        }
    }

    /**
     * Custom Modern Modal for Forgot Password with OTP & Reset Link support
     */
    openForgotPasswordModal() {
        const modalRoot = document.getElementById('auth-modal-root');
        modalRoot.innerHTML = `
            <div class="modal-backdrop" id="forgot-modal-backdrop">
                <div class="modal-box" style="max-width: 440px;">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Reset Teacher Password</h3>
                            <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
                                Verify your identity via Email or Phone SMS OTP
                            </p>
                        </div>
                        <button class="btn-close" id="btn-close-forgot-modal" title="Close dialog">&times;</button>
                    </div>

                    <div class="modal-body">
                        <!-- Step 1: Identifier Entry -->
                        <div id="reset-step-1">
                            <div class="form-group">
                                <label class="form-label" for="reset-ident">Enter Teacher Username, Email or Phone</label>
                                <input 
                                    type="text" 
                                    id="reset-ident" 
                                    class="form-control" 
                                    placeholder="e.g. teacher1 or teacher@gmail.com or 9876543210"
                                    required
                                >
                            </div>
                            <div id="reset-feedback" style="margin-top: 8px; display: none;"></div>
                            <button type="button" class="btn btn-primary btn-block" id="btn-request-otp" style="margin-top: 16px;">
                                Send Verification Code (OTP) &rarr;
                            </button>
                        </div>

                        <!-- Step 2: OTP Verification & New Password -->
                        <div id="reset-step-2" style="display: none;">
                            <div class="alert alert-info" id="otp-sent-info" style="font-size: 0.85rem; margin-bottom: 1rem;">
                                OTP code has been generated.
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="reset-otp-input">Enter 6-Digit OTP</label>
                                <input 
                                    type="text" 
                                    id="reset-otp-input" 
                                    class="form-control" 
                                    placeholder="Enter 6-digit code" 
                                    maxlength="6"
                                    style="letter-spacing: 4px; font-weight: 700; font-size: 1.1rem; text-align: center;"
                                >
                            </div>

                            <div class="form-group" style="margin-top: 12px;">
                                <label class="form-label" for="reset-new-password">New Password</label>
                                <input 
                                    type="password" 
                                    id="reset-new-password" 
                                    class="form-control" 
                                    placeholder="Create new password"
                                >
                            </div>

                            <div class="form-group" style="margin-top: 12px;">
                                <label class="form-label" for="reset-confirm-password">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    id="reset-confirm-password" 
                                    class="form-control" 
                                    placeholder="Re-enter new password"
                                >
                            </div>

                            <div id="reset-step2-feedback" style="margin-top: 8px; display: none;"></div>

                            <button type="button" class="btn btn-primary btn-block" id="btn-verify-and-save" style="margin-top: 16px;">
                                Verify OTP & Update Password
                            </button>
                        </div>

                        <!-- Step 3: Success Screen -->
                        <div id="reset-step-3" style="display: none; text-align: center; padding: 1.5rem 0;">
                            <div style="font-size: 3rem; color: #16a34a; line-height: 1;">✓</div>
                            <h4 style="font-size: 1.15rem; font-weight: 700; margin-top: 12px; color: var(--text-primary);">Password Updated Successfully</h4>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">
                                You can now sign in with your new password.
                            </p>
                            <button type="button" class="btn btn-primary btn-block" id="btn-back-to-login" style="margin-top: 20px;">
                                Proceed to Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this._bindForgotPasswordEvents();
    }

    _bindForgotPasswordEvents() {
        const modalBackdrop = document.getElementById('forgot-modal-backdrop');
        const closeBtn = document.getElementById('btn-close-forgot-modal');
        const modalRoot = document.getElementById('auth-modal-root');

        const closeModal = () => {
            modalRoot.innerHTML = '';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', (e) => {
                if (e.target === modalBackdrop) closeModal();
            });
        }

        let generatedOtp = null;
        let targetTeacher = null;

        // Step 1: Request OTP
        const reqBtn = document.getElementById('btn-request-otp');
        if (reqBtn) {
            reqBtn.addEventListener('click', async () => {
                const ident = document.getElementById('reset-ident').value.trim();
                const feedback = document.getElementById('reset-feedback');

                if (!ident) {
                    feedback.className = 'alert alert-danger';
                    feedback.textContent = 'Please enter your username, email, or phone number.';
                    feedback.style.display = 'block';
                    return;
                }

                reqBtn.disabled = true;
                reqBtn.textContent = 'Verifying Account...';
                feedback.style.display = 'none';

                try {
                    const result = await window.supabaseService.findTeacherForReset(ident);
                    targetTeacher = result;

                    // Generate a 6-digit OTP
                    generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    console.log(`[SECURE RECOVERY] OTP for ${result.parsed.displayName}:`, generatedOtp);

                    // Switch to Step 2
                    document.getElementById('reset-step-1').style.display = 'none';
                    const step2 = document.getElementById('reset-step-2');
                    step2.style.display = 'block';

                    const destinationText = result.parsed.phone 
                        ? `Phone: ${result.parsed.phone}` 
                        : (result.parsed.email ? `Email: ${result.parsed.email}` : `Account: ${result.profile.username}`);

                    const infoAlert = document.getElementById('otp-sent-info');
                    infoAlert.innerHTML = `
                        <strong>Verification Code Sent!</strong><br>
                        Destination: ${destinationText}<br>
                        <span style="font-size:0.78rem; opacity:0.9;">(For instant testing: OTP is <b>${generatedOtp}</b>)</span>
                    `;
                } catch (err) {
                    feedback.className = 'alert alert-danger';
                    feedback.textContent = err.message || 'Account not found.';
                    feedback.style.display = 'block';
                } finally {
                    reqBtn.disabled = false;
                    reqBtn.textContent = 'Send Verification Code (OTP) \u2192';
                }
            });
        }

        // Step 2: Verify OTP and save
        const verifyBtn = document.getElementById('btn-verify-and-save');
        if (verifyBtn) {
            verifyBtn.addEventListener('click', async () => {
                const enteredOtp = document.getElementById('reset-otp-input').value.trim();
                const newPass = document.getElementById('reset-new-password').value;
                const confirmPass = document.getElementById('reset-confirm-password').value;
                const feedback = document.getElementById('reset-step2-feedback');

                feedback.style.display = 'none';

                if (enteredOtp !== generatedOtp) {
                    feedback.className = 'alert alert-danger';
                    feedback.textContent = 'Invalid OTP code! Please check the code and try again.';
                    feedback.style.display = 'block';
                    return;
                }

                if (!newPass || newPass.length < 4) {
                    feedback.className = 'alert alert-danger';
                    feedback.textContent = 'Password must be at least 4 characters long.';
                    feedback.style.display = 'block';
                    return;
                }

                if (newPass !== confirmPass) {
                    feedback.className = 'alert alert-danger';
                    feedback.textContent = 'Passwords do not match!';
                    feedback.style.display = 'block';
                    return;
                }

                verifyBtn.disabled = true;
                verifyBtn.textContent = 'Updating Password...';

                try {
                    await window.supabaseService.updatePassword(targetTeacher.profile.id, newPass);
                    document.getElementById('reset-step-2').style.display = 'none';
                    document.getElementById('reset-step-3').style.display = 'block';
                    const backBtn = document.getElementById('btn-back-to-login');
                    if (backBtn) {
                        backBtn.addEventListener('click', () => {
                            closeModal();
                            window.authController.showLogin();
                        });
                    }
                } catch (err) {
                    feedback.className = 'alert alert-danger';
                    feedback.textContent = 'Failed to update password: ' + err.message;
                    feedback.style.display = 'block';
                    verifyBtn.disabled = false;
                    verifyBtn.textContent = 'Verify OTP & Update Password';
                }
            });
        }
    }
}

window.authView = new AuthView();
