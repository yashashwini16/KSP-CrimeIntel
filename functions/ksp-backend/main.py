from flask import Flask, request, jsonify, Response
import json
import logging
import base64
import random

app = Flask(__name__)
logger = logging.getLogger()

# --- CORS Middleware ---
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return jsonify({}), 200

# --- Helper ---
def is_demo_auth():
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        token = auth[7:]
        if token.startswith('demo.') or token.startswith('local-') or token == 'catalyst-token':
            return True
    return False

# --- Health ---
@app.route('/health', methods=['GET'])
@app.route('/', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'ksp-crimeintel'})

# --- Auth ---
@app.route('/api/auth/login', methods=['POST'])
def login():
    body = request.get_json(silent=True) or {}
    username = body.get('username', 'officer')
    payload = json.dumps({'sub': username, 'role': 'analyst'})
    token = 'demo.' + base64.b64encode(payload.encode()).decode()
    return jsonify({'access_token': token, 'username': username, 'role': 'analyst'})

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({'status': 'ok'})

# --- Chat ---
@app.route('/api/chat/sessions', methods=['GET'])
def chat_sessions():
    return jsonify([{'id': 1, 'title': 'Investigation Analysis', 'created_at': '2026-07-25'}])

@app.route('/api/chat/stream', methods=['POST', 'GET'])
def chat_stream():
    return jsonify({'content': "Based on the case details, this matches the modus operandi of the 'Chain Snatching Gang' operating in Bangalore South. I recommend checking CCTV feeds near the intersection."})

# --- Audit & Import ---
@app.route('/api/audit-logs', methods=['GET'])
def audit():
    return jsonify({'items': [
        {'id': 1, 'user_id': 1, 'action_type': 'LOGIN', 'timestamp': '2026-07-25T10:00:00Z', 'ip_address': '192.168.1.5'},
        {'id': 2, 'user_id': 1, 'action_type': 'VIEW_CASE', 'resource_id': '45', 'timestamp': '2026-07-25T10:05:00Z'}
    ], 'total': 2})

@app.route('/api/import/preview', methods=['POST'])
def import_preview():
    return jsonify({'headers': ['FIR No', 'Date', 'Type', 'District'], 'rows': [['FIR-2026-001', '2026-07-20', 'Theft', 'Bangalore']], 'total_rows': 1, 'valid_rows': 1, 'errors': []})

@app.route('/api/import/cases', methods=['POST'])
def import_cases():
    return jsonify({'imported': 1, 'skipped': 0, 'total_rows': 1})

# --- Cases ---
@app.route('/api/cases', methods=['GET'])
def get_cases():
    has_demo_auth = is_demo_auth()
    try:
        if not has_demo_auth:
            import zcatalyst_sdk as catalyst
            zcql = catalyst.initialize().zcql()
            rows = zcql.execute_query('SELECT * FROM Cases LIMIT 20')
            if rows:
                return jsonify({'items': rows, 'total': len(rows), 'page': 1, 'page_size': 20, 'pages': 1})
    except Exception:
        pass
    
    items = []
    districts = ['Bangalore Urban', 'Mysore', 'Hubli-Dharwad', 'Mangalore']
    crimes = ['Cyber Crime', 'Theft', 'Assault', 'Fraud']
    for i in range(1, 21):
        items.append({
            'id': i, 'ROWID': i, 'fir_number': f'FIR/2026/{i:03d}', 'crime_registered_date': '2026-07-20',
            'crime_type': random.choice(crimes), 'district': random.choice(districts),
            'case_status': 'Open' if i % 3 == 0 else 'Closed',
            'latitude': 12.9716 + (random.random() * 0.1), 'longitude': 77.5946 + (random.random() * 0.1)
        })
    return jsonify({'items': items, 'total': 20, 'page': 1, 'page_size': 20, 'pages': 1})

@app.route('/api/cases/<fir_id>', methods=['GET'])
def case_detail(fir_id):
    has_demo_auth = is_demo_auth()
    try:
        if not has_demo_auth:
            import zcatalyst_sdk as catalyst
            zcql = catalyst.initialize().zcql()
            rows = zcql.execute_query(f'SELECT * FROM Cases WHERE ROWID = {fir_id} LIMIT 1')
            if rows:
                return jsonify(rows[0])
    except Exception:
        pass
    
    return jsonify({
        'id': int(fir_id), 'fir_number': f'FIR/2026/{str(fir_id).zfill(3)}', 'date': '2026-07-20',
        'crime_type': 'Cyber Crime', 'district': 'Bangalore Urban', 'station': 'Central Police Station',
        'status': 'Open', 'narrative': 'Victim reported financial fraud via phishing link sent on WhatsApp.',
        'created_at': '2026-07-20T10:00:00Z', 'accused': [{'id': 1, 'name': 'Unknown', 'role': 'Scammer'}],
        'victims': [{'id': 1, 'name': 'Rahul S', 'age': 34}],
        'locations': [{'id': 1, 'latitude': 12.9716, 'longitude': 77.5946, 'address': 'MG Road, Bangalore'}],
        'audit_trail': [{'id': 1, 'user_id': 1, 'action_type': 'CREATED', 'timestamp': '2026-07-20T10:00:00Z'}]
    })

@app.route('/api/cases/<fir_id>/similar', methods=['GET'])
def case_similar(fir_id):
    return jsonify([{
        'id': 99, 'fir_number': 'FIR/2026/089', 'crime_type': 'Theft', 'district': 'Bangalore South',
        'similarity_score': 0.92, 'rationale': 'Similar modus operandi involving two-wheelers.'
    }])

# --- Map ---
@app.route('/api/map/hotspots', methods=['GET'])
def hotspots():
    return jsonify([
        {'latitude': 12.9716, 'longitude': 77.5946, 'district': 'Bangalore Urban', 'crime_type': 'Cyber Crime'},
        {'latitude': 12.2958, 'longitude': 76.6394, 'district': 'Mysore', 'crime_type': 'Theft'}
    ])

# --- Analytics ---
@app.route('/api/analytics/summary', methods=['GET'])
def analytics():
    return jsonify({
        'total_cases': 1250, 'open_cases': 340, 'closed_cases': 910,
        'cases_by_type': {'Cyber Crime': 450, 'Theft': 300, 'Assault': 250, 'Fraud': 250},
        'cases_by_district': {'Bangalore Urban': 600, 'Mysore': 200, 'Hubli-Dharwad': 250, 'Other': 200},
        'victim_demographics': {'Male': 600, 'Female': 400},
        'modus_operandi_frequency': {'Phishing': 200, 'UPI Fraud': 150, 'Pickpocket': 100},
        'crime_trend': [
            {'date': '2026-01', 'count': 150, 'label': 'Jan'}, {'date': '2026-02', 'count': 180, 'label': 'Feb'},
            {'date': '2026-03', 'count': 160, 'label': 'Mar'}, {'date': '2026-04', 'count': 210, 'label': 'Apr'}
        ]
    })

# --- Alerts ---
@app.route('/api/alerts', methods=['GET'])
def alerts():
    return jsonify({'items': [
        {'id': 1, 'title': 'High volume of Cyber Crimes in Bangalore', 'severity': 'high', 'created_at': '2026-07-25T10:00:00Z'},
        {'id': 2, 'title': 'New Pattern: UPI Fraud in Mysore', 'severity': 'medium', 'created_at': '2026-07-24T14:30:00Z'}
    ], 'total': 2})

# --- Offenders ---
@app.route('/api/offenders', methods=['GET'])
def offenders():
    items = []
    for i in range(1, 21):
        items.append({'id': i, 'name': f'Accused {i}', 'risk_score': random.randint(40, 95), 'firs_count': random.randint(1, 5), 'latest_crime': 'Theft'})
    return jsonify({'items': items, 'total': 20, 'page': 1, 'page_size': 20, 'pages': 1})

@app.route('/api/offenders/<offender_id>', methods=['GET'])
def offender_detail(offender_id):
    return jsonify({
        'id': int(offender_id), 'name': f'Accused {offender_id}', 'age': 28, 'gender': 'Male', 'address': 'Bangalore',
        'risk_score': 88, 'created_at': '2026-01-01T00:00:00Z',
        'firs': [{'id': 1, 'fir_number': 'FIR/2026/001', 'date': '2026-07-20', 'crime_type': 'Cyber Crime', 'district': 'Bangalore', 'status': 'Open'}],
        'links': [{'id': 1, 'linked_accused_id': 2, 'linked_accused_name': 'Associate A', 'link_type': 'Co-accused', 'weight': 0.8}]
    })

# --- Network & Forecast ---
@app.route('/api/network/graph', methods=['GET'])
def network():
    return jsonify({'nodes': [{'id': 'c1', 'label': 'FIR/2026/001', 'type': 'case', 'metadata': {}}, {'id': 'o1', 'label': 'Raja', 'type': 'accused', 'risk_score': 85, 'metadata': {}}], 'edges': [{'id': 'e1', 'source': 'o1', 'target': 'c1', 'link_type': 'ACCUSED_IN', 'weight': 1, 'directed': True, 'metadata': {}}]})

@app.route('/api/forecast', methods=['GET'])
def forecast():
    return jsonify({'trend': [{'period': '2026-01', 'count': 45}, {'period': '2026-02', 'count': 50}], 'forecast': [{'period': '2026-04', 'expected': 60, 'upper': 65, 'lower': 55}]})

# --- Exports ---
@app.route('/api/export/<path:path>', methods=['GET'])
def exports(path):
    return jsonify({'status': 'Export initiated', 'download_url': '#'})

# --- 404 Catch All ---
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404
