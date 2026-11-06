"""
Marksheet Helper - Application Entry Point (Flask MVC Architecture)
===================================================================
A lightweight, modern marksheet assistant for madrasas and schools.
Employs MVC architecture with local client-side storage isolation,
allowing public deployment without an external database server.
"""

import os
from flask import Flask, render_template, send_from_directory, jsonify

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = os.environ.get('SECRET_KEY', 'marksheet_helper_local_key_2026')

@app.route('/')
@app.route('/result')
@app.route('/results')
def index():
    """Renders the public Badrudheen Madrasa individual result lookup page."""
    return render_template('result.html')

@app.route('/admin')
@app.route('/teacher')
@app.route('/staff')
def admin_portal():
    """Renders the admin and teacher marksheet management portal."""
    return render_template('index.html')

@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404

@app.route('/api/status')
def status():
    """Health check and application metadata endpoint."""
    return jsonify({
        'status': 'online',
        'application': 'Marksheet Helper',
        'architecture': 'MVC (Model-View-Controller)',
        'storage': 'Isolated LocalStorage Vault',
        'version': '1.0.0'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"\n=======================================================")
    print(f"Marksheet Helper is running at http://localhost:{port}")
    print(f"=======================================================\n")
    app.run(host='0.0.0.0', port=port, debug=True)
