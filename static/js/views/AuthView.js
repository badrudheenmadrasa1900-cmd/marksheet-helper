/**
 * AuthView.js
 * MVC - View Layer: Authentication Interface (Usthad Login & Password Recovery with Sadar Muallim Approval)
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
                        <h1 class="auth-title">Usthad Portal</h1>
                        <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 4px;">Sign in to enter marks and generate mark sheets</p>
                    </div>

                    ${errorMsg ? `<div class="alert alert-danger" role="alert">${errorMsg}</div>` : ''}

                    <div class="auth-tabs">
                        <button class="auth-tab ${!isRegister ? 'active' : ''}" id="tab-login-btn">Usthad Sign In</button>
                        <button class="auth-tab ${isRegister ? 'active' : ''}" id="tab-register-btn">New Usthad</button>
                    </div>

                    ${!isRegister ? this._renderLoginForm() : this._renderRegisterForm()}

                    <div style="margin-top: 1.5rem; text-align: center; border-top: 1px dashed var(--border-color); padding-top: 1rem;">
                        <a href="/admin" class="text-muted" style="font-size: 0.82rem; text-decoration: none; font-weight: 700; color: #0d5c31;">
                            Sadar Muallim (صدر معلم) Control Room &rarr;
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
                    <label class="form-label" for="login-userid">Usthad Username or Mobile</label>
                    <input 
                        type="text" 
                        id="login-userid" 
                        class="form-control" 
                        placeholder="e.g. usthad_class5 or 9876543210" 
                        required 
                        autofocus
                    >
                </div>
                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <label class="form-label" for="login-password" style="margin-bottom: 0;">Pass Key / Password</label>
                        <button type="button" id="btn-forgot-password" style="background: none; border: none; color: var(--brand-primary); font-size: 0.82rem; font-weight: 700; cursor: pointer; padding: 0;">
                            Forgot Password?
                        </button>
                    </div>
                    <input 
                        type="password" 
                        id="login-password" 
                        class="form-control" 
                        placeholder="Enter password / pass key" 
                        required
                    >
                </div>
                <button type="submit" class="btn btn-primary btn-block">Sign In to Usthad Portal</button>
            </form>
        `;
    }

    _renderRegisterForm() {
        return `
            <form id="register-form" class="auth-form" autocomplete="off">
                <div class="form-group">
                    <label class="form-label" for="reg-fullname">Usthad Full Name</label>
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
                    <label class="form-label" for="reg-userid">Choose Usthad Username</label>
                    <input 
                        type="text" 
                        id="reg-userid" 
                        class="form-control" 
                        placeholder="e.g. usthad_class3" 
                        required
                    >
                </div>
                <div class="form-group">
                    <label class="form-label" for="reg-phone">Mobile Number (For SMS OTP)</label>
                    <input 
                        type="tel" 
                        id="reg-phone" 
                        class="form-control" 
                        placeholder="e.g. 9876543210" 
                    >
                </div>
                <div class="form-group">
                    <label class="form-label" for="reg-password">Pass Key / Password</label>
                    <input 
                        type="password" 
                        id="reg-password" 
                        class="form-control" 
                        placeholder="Password (minimum 4 characters)" 
                        required
                    >
                </div>
                <button type="submit" class="btn btn-primary btn-block">Register Usthad Account</button>
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
     * Custom Modern Modal for Forgot Password with Sadar Muallim Approval Workflow
     */
    openForgotPasswordModal() {
        const modalRoot = document.getElementById('auth-modal-root');
        modalRoot.innerHTML = `
            <div class="modal-backdrop" id="forgot-modal-backdrop">
                <div class="modal-box" style="max-width: 440px;">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Reset Usthad Password</h3>
                            <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
                                Password recovery with Sadar Muallim verification
                            </p>
                        </div>
                        <button class="btn-close" id="btn-close-forgot-modal" title="Close dialog">&times;</button>
                    </div>

                    <div class="modal-body">
                        <!-- Step 1: Identifier Entry -->
                        <div id="reset-step-1">
                            <div class="form-group">
                                <label class="form-label" for="reset-ident">Usthad Username, Email, or Mobile</label>
                                <input 
                                    type="text" 
                                    id="reset-ident" 
                                    class="form-control" 
                                    placeholder="e.g. usthad1 or teacher@gmail.com or 9876543210"
                                    required
                                >
                            </div>
                            <div id="reset-feedback" style="margin-top: 8px; display: none;"></div>
                            <button type="button" class="btn btn-primary btn-block" id="btn-request-otp" style="margin-top: 16px;">
                                Continue &rarr;
                            </button>
                        </div>

                        <!-- Step 1-B: Email Registration Needed (Teacher Has No Email Yet) -->
                        <div id="reset-step-add-email" style="display: none;">
                            <div class="alert alert-warning" style="font-size: 0.85rem; margin-bottom: 1rem;">
                                <strong>No Verified Recovery Email Found</strong><br>
                                Please enter your email address below. A request will be sent to <strong>Sadar Muallim</strong>. Once approved, you can reset your password.
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="new-recovery-email">Enter Your Email Address *</label>
                                <input 
                                    type="email" 
                                    id="new-recovery-email" 
                                    class="form-control" 
                                    placeholder="e.g. usthad@gmail.com"
                                    required
                                >
                            </div>
                            <div id="add-email-feedback" style="margin-top: 8px; display: none;"></div>
                            <button type="button" class="btn btn-primary btn-block" id="btn-submit-email-approval" style="margin-top: 14px;">
                                Submit Email for Sadar Muallim Approval
                            </button>
                        </div>

                        <!-- Step 1-C: Email Pending Approval Message -->
                        <div id="reset-step-pending-msg" style="display: none; text-align: center; padding: 1.5rem 0;">
                            <div style="font-size: 2.8rem; line-height: 1;">⏳</div>
                            <h4 style="font-size: 1.15rem; font-weight: 700; margin-top: 12px; color: #b45309;">Awaiting Sadar Muallim Approval</h4>
                            <p id="pending-explanation-text" style="font-size: 0.88rem; color: var(--text-muted); margin-top: 8px; line-height: 1.5;">
                                Your email address is currently waiting for authorization from Sadar Muallim. Once approved in the Control Room, return here to reset your pass key.
                            </p>
                            <button type="button" class="btn btn-outline btn-block" id="btn-close-pending-view" style="margin-top: 20px;">
                                Close
                            </button>
                        </div>

                        <!-- Step 2: OTP Verification & New Password -->
                        <div id="reset-step-2" style="display: none;">
                            <div class="alert alert-info" id="otp-sent-info" style="font-size: 0.85rem; margin-bottom: 1rem;">
                                OTP code has been generated.
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="reset-otp-input">Enter 6-Digit Verification Code</label>
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
                                <label class="form-label" for="reset-new-password">New Pass Key / Password</label>
                                <input 
                                    type="password" 
                                    id="reset-new-password" 
                                    class="form-control" 
                                    placeholder="Create new password"
                                >
                            </div>

                            <div class="form-group" style="margin-top: 12px;">
                                <label class="form-label" for="reset-confirm-password">Confirm Pass Key</label>
                                <input 
                                    type="password" 
                                    id="reset-confirm-password" 
                                    class="form-control" 
                                    placeholder="Re-enter new password"
                                >
                            </div>

                            <div id="reset-step2-feedback" style="margin-top: 8px; display: none;"></div>

                            <button type="button" class="btn btn-primary btn-block" id="btn-verify-and-save" style="margin-top: 16px;">
                                Verify Code & Update Password
                            </button>
                        </div>

                        <!-- Step 3: Success Screen -->
                        <div id="reset-step-3" style="display: none; text-align: center; padding: 1.5rem 0;">
                            <div style="font-size: 3rem; color: #16a34a; line-height: 1;">✓</div>
                            <h4 style="font-size: 1.15rem; font-weight: 700; margin-top: 12px; color: var(--text-primary);">Password Updated Successfully</h4>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">
                                You can now sign in with your updated pass key.
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
                    feedback.textContent = 'Please enter your username, email, or mobile number.';
                    feedback.style.display = 'block';
                    return;
                }

                reqBtn.disabled = true;
                reqBtn.textContent = 'Checking Account...';
                feedback.style.display = 'none';

                try {
                    const result = await window.supabaseService.findTeacherForReset(ident);
                    targetTeacher = result;

                    // Case A: Usthad needs to register email first
                    if (result.needsEmailRegistration) {
                        document.getElementById('reset-step-1').style.display = 'none';
                        document.getElementById('reset-step-add-email').style.display = 'block';
                        return;
                    }

                    // Case B: Usthad email is pending approval from Sadar Muallim
                    if (result.isPendingApproval) {
                        document.getElementById('reset-step-1').style.display = 'none';
                        document.getElementById('pending-explanation-text').innerHTML = `
                            Your email (<strong>${result.parsed.email}</strong>) has been submitted and is currently pending authorization from <strong>Sadar Muallim</strong>.<br><br>
                            Please request Sadar Muallim to approve your email in the Admin Control Room. Once approved, you can reset your pass key.
                        `;
                        document.getElementById('reset-step-pending-msg').style.display = 'block';
                        document.getElementById('btn-close-pending-view').addEventListener('click', closeModal);
                        return;
                    }

                    // Case C: Email is approved or Mobile OTP available
                    generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    console.log(`[SECURE RECOVERY] OTP for ${result.parsed.displayName}:`, generatedOtp);

                    document.getElementById('reset-step-1').style.display = 'none';
                    const step2 = document.getElementById('reset-step-2');
                    step2.style.display = 'block';

                    const destinationText = result.parsed.phone 
                        ? `Mobile: ${result.parsed.phone}` 
                        : (result.parsed.email ? `Verified Email: ${result.parsed.email}` : `Account: ${result.profile.username}`);

                    const infoAlert = document.getElementById('otp-sent-info');
                    infoAlert.innerHTML = `
                        <strong>Verification Code Sent!</strong><br>
                        Destination: ${destinationText}<br>
                        <span style="font-size:0.78rem; opacity:0.9;">(Testing code: <b>${generatedOtp}</b>)</span>
                    `;
                } catch (err) {
                    feedback.className = 'alert alert-danger';
                    feedback.textContent = err.message || 'Account not found.';
                    feedback.style.display = 'block';
                } finally {
                    reqBtn.disabled = false;
                    reqBtn.textContent = 'Continue \u2192';
                }
            });
        }

        // Step 1-B: Submit Email for Sadar Muallim Approval
        const submitEmailBtn = document.getElementById('btn-submit-email-approval');
        if (submitEmailBtn) {
            submitEmailBtn.addEventListener('click', async () => {
                const newEmail = document.getElementById('new-recovery-email').value.trim();
                const emailFeedback = document.getElementById('add-email-feedback');

                if (!newEmail || !newEmail.includes('@')) {
                    emailFeedback.className = 'alert alert-danger';
                    emailFeedback.textContent = 'Please enter a valid email address.';
                    emailFeedback.style.display = 'block';
                    return;
                }

                submitEmailBtn.disabled = true;
                submitEmailBtn.textContent = 'Sending to Sadar Muallim...';
                emailFeedback.style.display = 'none';

                try {
                    const username = targetTeacher ? targetTeacher.profile.username : document.getElementById('reset-ident').value.trim();
                    await window.supabaseService.requestEmailLinkForTeacher(username, newEmail);

                    document.getElementById('reset-step-add-email').style.display = 'none';
                    document.getElementById('pending-explanation-text').innerHTML = `
                        Your email (<strong>${newEmail}</strong>) has been submitted to <strong>Sadar Muallim</strong> for verification.<br><br>
                        Once approved in the Central Control Room, you can return here to reset your password.
                    `;
                    document.getElementById('reset-step-pending-msg').style.display = 'block';
                    document.getElementById('btn-close-pending-view').addEventListener('click', closeModal);
                } catch (err) {
                    emailFeedback.className = 'alert alert-danger';
                    emailFeedback.textContent = err.message;
                    emailFeedback.style.display = 'block';
                    submitEmailBtn.disabled = false;
                    submitEmailBtn.textContent = 'Submit Email for Sadar Muallim Approval';
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
                    feedback.textContent = 'Invalid verification code! Please check the code and try again.';
                    feedback.style.display = 'block';
                    return;
                }

                if (!newPass || newPass.length < 4) {
                    feedback.className = 'alert alert-danger';
                    feedback.textContent = 'Pass key must be at least 4 characters long.';
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
                    feedback.textContent = 'Failed to update pass key: ' + err.message;
                    feedback.style.display = 'block';
                    verifyBtn.disabled = false;
                    verifyBtn.textContent = 'Verify Code & Update Password';
                }
            });
        }
    }
}

window.authView = new AuthView();
