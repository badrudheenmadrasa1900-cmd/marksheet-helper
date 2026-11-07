/**
 * app.js
 * MVC Bootstrap & Entrypoint: Initializes the application router, auth listener,
 * and global custom dialog modals (confirm/alert) replacing native browser popups.
 */

// Custom Modal Confirm Dialog (resolves Promise<boolean>)
window.showConfirmDialog = function(title, message, icon = '❓', confirmText = 'Confirm', cancelText = 'Cancel') {
    return new Promise((resolve) => {
        let modalEl = document.getElementById('global-dialog-modal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'global-dialog-modal';
            modalEl.className = 'modal-backdrop';
            modalEl.style.zIndex = '99999';
            document.body.appendChild(modalEl);
        }

        modalEl.innerHTML = `
            <div class="modal-box" style="max-width: 440px; border-radius: 20px; box-shadow: 0 20px 45px rgba(0,0,0,0.25); border: 1px solid #e2e8f0; overflow: hidden; animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
                <div style="background: linear-gradient(135deg, #0d5c31 0%, #158043 100%); padding: 18px 20px; color: #ffffff; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.4rem;">${icon}</span>
                        <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #ffffff;">${title}</h4>
                    </div>
                    <button type="button" id="btn-dialog-x" class="modal-close" style="width: 30px; height: 30px; color: #fff; background: rgba(255,255,255,0.2); border: none;">&times;</button>
                </div>
                <div style="padding: 22px 20px; font-size: 0.95rem; color: #334155; line-height: 1.5;">
                    ${message}
                </div>
                <div style="padding: 14px 20px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" id="btn-dialog-cancel" class="btn btn-outline btn-sm" style="min-width: 90px; border-radius: 10px;">
                        ${cancelText}
                    </button>
                    <button type="button" id="btn-dialog-confirm" class="btn btn-primary btn-sm" style="min-width: 100px; border-radius: 10px; background: linear-gradient(135deg, #0d5c31 0%, #158043 100%);">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;

        modalEl.style.display = 'flex';

        const cleanup = () => {
            modalEl.style.display = 'none';
            modalEl.innerHTML = '';
        };

        const onConfirm = () => { cleanup(); resolve(true); };
        const onCancel = () => { cleanup(); resolve(false); };

        document.getElementById('btn-dialog-confirm').onclick = onConfirm;
        document.getElementById('btn-dialog-cancel').onclick = onCancel;
        document.getElementById('btn-dialog-x').onclick = onCancel;
    });
};

// Custom Modal Alert Dialog (resolves Promise<true>)
window.showAlertDialog = function(title, message, icon = 'ℹ️') {
    return new Promise((resolve) => {
        let modalEl = document.getElementById('global-dialog-modal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'global-dialog-modal';
            modalEl.className = 'modal-backdrop';
            modalEl.style.zIndex = '99999';
            document.body.appendChild(modalEl);
        }

        modalEl.innerHTML = `
            <div class="modal-box" style="max-width: 440px; border-radius: 20px; box-shadow: 0 20px 45px rgba(0,0,0,0.25); border: 1px solid #e2e8f0; overflow: hidden; animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
                <div style="background: linear-gradient(135deg, #0d5c31 0%, #158043 100%); padding: 18px 20px; color: #ffffff; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.4rem;">${icon}</span>
                        <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #ffffff;">${title}</h4>
                    </div>
                    <button type="button" id="btn-dialog-x" class="modal-close" style="width: 30px; height: 30px; color: #fff; background: rgba(255,255,255,0.2); border: none;">&times;</button>
                </div>
                <div style="padding: 22px 20px; font-size: 0.95rem; color: #334155; line-height: 1.5;">
                    ${message}
                </div>
                <div style="padding: 14px 20px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end;">
                    <button type="button" id="btn-dialog-ok" class="btn btn-primary btn-sm" style="min-width: 100px; border-radius: 10px; background: linear-gradient(135deg, #0d5c31 0%, #158043 100%);">
                        OK
                    </button>
                </div>
            </div>
        `;

        modalEl.style.display = 'flex';

        const onOk = () => {
            modalEl.style.display = 'none';
            modalEl.innerHTML = '';
            resolve(true);
        };

        document.getElementById('btn-dialog-ok').onclick = onOk;
        document.getElementById('btn-dialog-x').onclick = onOk;
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // If there is sample data needed on first visit, we can provide a quick demo prompt or clean slate
    window.authController.init();
});
