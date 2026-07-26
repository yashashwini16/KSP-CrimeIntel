"""
Catalyst Basic I/O Function Handler
Robust version with Demo Auth and full fallback data for KSP CrimeIntel.
"""

import os
import sys
import json
import logging
import traceback
import base64
import random

logger = logging.getLogger()

def json_response(data, status=200):
    from flask import make_response, jsonify
    response = make_response(jsonify(data), status)
    return response

def is_demo_auth(headers_lc):
    auth = headers_lc.get('x-ksp-authorization', '')
    if auth.startswith('Bearer '):
        token = auth[7:]
        if token.startswith('demo.') or token.startswith('local-') or token == 'catalyst-token':
            return True
    return False

def handler(request):
    try:
        # Introspect method
        method = getattr(request, 'method', None)
        if not method and hasattr(request, 'get_method'):
            method = request.get_method()
        method = str(method).upper() if method else 'GET'

        # Introspect path
        path = getattr(request, 'path', None)
        if not path and hasattr(request, 'get_path'):
            path = request.get_path()
        path = str(path) if path else '/'

        # Introspect headers
        headers = getattr(request, 'headers', {})
        if callable(headers):
            headers = headers()
        elif not headers and hasattr(request, 'get_headers'):
            headers = request.get_headers()
        
        headers_lc = {str(k).lower(): str(v) for k, v in headers.items()} if isinstance(headers, dict) else {}

        for prefix in ('/server/ksp-backend', '/ksp-backend'):
            if prefix in path:
                path = path.split(prefix, 1)[1] or '/'
                break

        if not path.startswith('/'):
            path = '/' + path

        # Introspect body
        body_raw = getattr(request, 'body', None)
        if not body_raw and hasattr(request, 'get_body'):
            body_raw = request.get_body()
        if not body_raw and hasattr(request, 'get_data'):
            body_raw = request.get_data()
        
        try:
            body = json.loads(body_raw) if body_raw and isinstance(body_raw, (str, bytes)) else {}
        except Exception:
            body = {}

        if method == 'OPTIONS':
            return json_response({})

        if method == 'GET' and path in ('/', '/health'):
            return json_response({'status': 'ok', 'service': 'ksp-crimeintel'})

        # ── Auth routes ───────────────────────────────────────
        if path == '/api/auth/login' and method == 'POST':
            return handle_login(body)
        if path == '/api/auth/logout' and method == 'POST':
            return json_response({'status': 'ok'})

        # ── Demo Auth Bypass ──────────────────────────────────
        has_demo_auth = is_demo_auth(headers_lc)

        # ── Chat routes ───────────────────────────────────────
        if path.endswith('/api/chat/sessions'):
            return json_response([{'id': 1, 'title': 'Investigation Analysis', 'created_at': '2026-07-25'}])
        if path.endswith('/api/chat/stream'):
            return json_response({'content': "Based on the case details, this matches the modus operandi of the 'Chain Snatching Gang' operating in Bangalore South. I recommend checking CCTV feeds near the intersection."})

        # ── Audit & Import ────────────────────────────────────
        if '/api/audit' in path:
            return json_response({'items': [
                {'id': 1, 'user_id': 1, 'action_type': 'LOGIN', 'timestamp': '2026-07-25T10:00:00Z', 'ip_address': '192.168.1.5'},
                {'id': 2, 'user_id': 1, 'action_type': 'VIEW_CASE', 'resource_id': '45', 'timestamp': '2026-07-25T10:05:00Z'}
            ], 'total': 2})
        if '/api/import/preview' in path:
            return json_response({'headers': ['FIR No', 'Date', 'Type', 'District'], 'rows': [['FIR-2026-001', '2026-07-20', 'Theft', 'Bangalore']], 'total_rows': 1, 'valid_rows': 1, 'errors': []})
        if '/api/import/cases' in path:
            return json_response({'imported': 1, 'skipped': 0, 'total_rows': 1})

        # ── Cases routes ──────────────────────────────────────
        if path.endswith('/api/cases') and method == 'GET':
            return handle_cases(has_demo_auth)

        if '/api/cases/' in path and method == 'GET':
            remainder = path.split('/api/cases/')[1]
            parts = remainder.split('/')
            fir_id = parts[0]
            if len(parts) >= 2 and parts[1] == 'similar':
                return json_response([{
                    'id': 99, 'fir_number': 'FIR/2026/089', 'crime_type': 'Theft', 
                    'district': 'Bangalore South', 'similarity_score': 0.92, 
                    'rationale': 'Similar modus operandi involving two-wheelers.'
                }])
            return handle_case_detail(fir_id, has_demo_auth)

        # ── Map routes ────────────────────────────────────────
        if path.endswith('/api/map/hotspots') and method == 'GET':
            return handle_hotspots(has_demo_auth)

        if path.endswith('/api/chat') and method == 'POST':
            return handle_chat(body)

        # ── Analytics routes ──────────────────────────────────
        if path.endswith('/api/analytics/summary') and method == 'GET':
            return handle_analytics(has_demo_auth)

        # ── Forecast routes ───────────────────────────────────
        if '/api/forecast' in path and method == 'GET':
            return handle_forecast(has_demo_auth)

        # ── Alerts routes ─────────────────────────────────────
        if path.endswith('/api/alerts') and method == 'GET':
            return handle_alerts(has_demo_auth)

        # ── Offenders routes ──────────────────────────────────
        if path.endswith('/api/offenders') and method == 'GET':
            return handle_offenders(has_demo_auth)

        if '/api/offenders/' in path and method == 'GET':
            remainder = path.split('/api/offenders/')[1]
            offender_id = remainder.split('/')[0]
            return handle_offender_detail(offender_id, has_demo_auth)

        # ── Network graph ─────────────────────────────────────
        if path == '/api/network/graph' and method == 'GET':
            return json_response({
                'nodes': [
                    {'id': 'c1', 'label': 'FIR/2026/001', 'type': 'case'},
                    {'id': 'c2', 'label': 'FIR/2026/045', 'type': 'case'},
                    {'id': 'c3', 'label': 'FIR/2026/089', 'type': 'case'},
                    {'id': 'c4', 'label': 'FIR/2026/112', 'type': 'case'},
                    {'id': 'o1', 'label': 'Raja (A1)', 'type': 'accused', 'risk_score': 95},
                    {'id': 'o2', 'label': 'Kumar (A2)', 'type': 'accused', 'risk_score': 88},
                    {'id': 'o3', 'label': 'Syed (A3)', 'type': 'accused', 'risk_score': 75},
                    {'id': 'o4', 'label': 'Manju (A4)', 'type': 'accused', 'risk_score': 60},
                    {'id': 'o5', 'label': 'Kiran (A5)', 'type': 'accused', 'risk_score': 82}
                ], 
                'edges': [
                    {'id': 'e1', 'source': 'o1', 'target': 'c1', 'link_type': 'ACCUSED_IN', 'weight': 1, 'directed': True},
                    {'id': 'e2', 'source': 'o2', 'target': 'c1', 'link_type': 'ACCUSED_IN', 'weight': 1, 'directed': True},
                    {'id': 'e3', 'source': 'o1', 'target': 'c2', 'link_type': 'ACCUSED_IN', 'weight': 1, 'directed': True},
                    {'id': 'e4', 'source': 'o3', 'target': 'c2', 'link_type': 'ACCUSED_IN', 'weight': 1, 'directed': True},
                    {'id': 'e5', 'source': 'o4', 'target': 'c3', 'link_type': 'ACCUSED_IN', 'weight': 1, 'directed': True},
                    {'id': 'e6', 'source': 'o5', 'target': 'c3', 'link_type': 'ACCUSED_IN', 'weight': 1, 'directed': True},
                    {'id': 'e7', 'source': 'o2', 'target': 'c4', 'link_type': 'ACCUSED_IN', 'weight': 1, 'directed': True},
                    {'id': 'e8', 'source': 'o5', 'target': 'c4', 'link_type': 'ACCUSED_IN', 'weight': 1, 'directed': True},
                    {'id': 'e9', 'source': 'o1', 'target': 'o2', 'link_type': 'CO_OFFENDER', 'weight': 0.8, 'directed': False},
                    {'id': 'e10', 'source': 'o2', 'target': 'o5', 'link_type': 'KNOWN_ASSOCIATE', 'weight': 0.5, 'directed': False}
                ]
            })

        # ── Forecast ──────────────────────────────────────────
        if path == '/api/forecast' and method == 'GET':
            return json_response({
                'trend': [{'period': '2026-01', 'count': 45}, {'period': '2026-02', 'count': 50}, {'period': '2026-03', 'count': 55}], 
                'forecast': [{'period': '2026-04', 'expected': 60, 'upper': 65, 'lower': 55}, {'period': '2026-05', 'expected': 58, 'upper': 63, 'lower': 53}]
            })

        # ── Exports ───────────────────────────────────────────
        if path.startswith('/api/export/'):
            # Return a simple text file download for the demo
            return json_response({
                'status': 'Export initiated', 
                'url': 'data:text/plain;charset=utf-8,CONFIDENTIAL%20KSP%20REPORT%0A%0AThis%20is%20a%20placeholder%20export%20file%20for%20the%20datathon.%20In%20production%2C%20this%20will%20be%20a%20detailed%20PDF%20report.'
            })

        # ── Database Seeding ──────────────────────────────────
        if path == '/api/admin/seed' and method == 'POST':
            return handle_seed_db()

        # ── 404 ───────────────────────────────────────────────
        return json_response({'error': 'Not found', 'path': path, 'method': method}, 404)

    except Exception as e:
        logger.error(f"Handler error: {e}")
        traceback.print_exc()
        return json_response({'error': str(e), 'type': type(e).__name__}, 500)

# ── Route handlers ────────────────────────────────────────────────────────────

def handle_login(body):
    username = body.get('username', '').lower()
    password = body.get('password', '')
    if not username:
        username = 'investigator'
    
    if username == 'analyst': role = 'analyst'
    elif username == 'supervisor': role = 'supervisor'
    elif username == 'policymaker': role = 'policymaker'
    else: role = 'investigator'
    
    # Always succeed for demo
    payload = json.dumps({'sub': username, 'role': role})
    token = 'demo.' + base64.b64encode(payload.encode()).decode()
    return json_response({'access_token': token, 'username': username, 'role': role})


def handle_cases(has_demo_auth):
    try:
        # if not has_demo_auth:
        import zcatalyst_sdk as catalyst
        app = catalyst.initialize()
        zcql = app.zcql()
        rows = zcql.execute_query('SELECT * FROM Cases LIMIT 20')
        if rows:
            unwrapped = [r.get('Cases', r) for r in rows]
            return json_response({'items': unwrapped, 'total': len(unwrapped), 'page': 1, 'page_size': 20, 'pages': 1})
    except Exception:
        pass
    
    # Fallback Data
    items = []
    districts = ['Bangalore Urban', 'Mysore', 'Hubli-Dharwad', 'Mangalore']
    crimes = ['Cyber Crime', 'Theft', 'Assault', 'Fraud']
    for i in range(1, 21):
        items.append({
            'id': i,
            'ROWID': i,
            'fir_number': f'FIR/2026/{i:03d}',
            'date': '2026-07-20',
            'crime_type': random.choice(crimes),
            'district': random.choice(districts),
            'status': 'Open' if i % 3 == 0 else 'Closed',
            'latitude': 12.9716 + (random.random() * 0.1),
            'longitude': 77.5946 + (random.random() * 0.1)
        })
    return json_response({'items': items, 'total': 20, 'page': 1, 'page_size': 20, 'pages': 1})


def handle_case_detail(fir_id, has_demo_auth):
    try:
        # if not has_demo_auth:
        #     import zcatalyst_sdk as catalyst
        #     app = catalyst.initialize()
        #     zcql = app.zcql()
        #     rows = zcql.execute_query(f'SELECT * FROM Cases WHERE ROWID = {fir_id} LIMIT 1')
        #     if rows:
        #         return json_response(rows[0])
        pass
    except Exception:
        pass
    
    return json_response({
        'id': int(fir_id),
        'fir_number': f'FIR/2026/{str(fir_id).zfill(3)}',
        'date': '2026-07-20',
        'crime_type': 'Cyber Crime',
        'district': 'Bangalore Urban',
        'station': 'Central Police Station',
        'status': 'Open',
        'narrative': 'Victim reported financial fraud via phishing link sent on WhatsApp.',
        'created_at': '2026-07-20T10:00:00Z',
        'accused': [{'id': 1, 'name': 'Unknown', 'role': 'Scammer'}],
        'victims': [{'id': 1, 'name': 'Rahul S', 'age': 34}],
        'locations': [{'id': 1, 'latitude': 12.9716, 'longitude': 77.5946, 'address': 'MG Road, Bangalore'}],
        'audit_trail': [{'id': 1, 'user_id': 1, 'action_type': 'CREATED', 'timestamp': '2026-07-20T10:00:00Z'}]
    })

def handle_hotspots(has_demo_auth):
    return json_response([
        {'latitude': 12.9716, 'longitude': 77.5946, 'district': 'Bangalore Urban', 'crime_type': 'Cyber Crime'},
        {'latitude': 12.2958, 'longitude': 76.6394, 'district': 'Mysore', 'crime_type': 'Theft'}
    ])

def handle_analytics(has_demo_auth):
    return json_response({
        'total_cases': 1250,
        'open_cases': 340,
        'closed_cases': 910,
        'cases_by_type': {'Cyber Crime': 450, 'Theft': 300, 'Assault': 250, 'Fraud': 250},
        'cases_by_district': {'Bangalore Urban': 600, 'Mysore': 200, 'Hubli-Dharwad': 250, 'Other': 200},
        'victim_demographics': {'Male': 600, 'Female': 400},
        'modus_operandi_frequency': {'Phishing': 200, 'UPI Fraud': 150, 'Pickpocket': 100},
        'crime_trend': [
            {'date': '2026-01', 'count': 150, 'label': 'Jan'},
            {'date': '2026-02', 'count': 180, 'label': 'Feb'},
            {'date': '2026-03', 'count': 160, 'label': 'Mar'},
            {'date': '2026-04', 'count': 210, 'label': 'Apr'}
        ]
    })

def handle_forecast(has_demo_auth):
    return json_response({
        'historical': [
            {'date': '2026-01-01', 'district': 'Bangalore', 'crime_type': 'Theft', 'count': 45, 'predicted': False},
            {'date': '2026-02-01', 'district': 'Bangalore', 'crime_type': 'Theft', 'count': 52, 'predicted': False},
            {'date': '2026-03-01', 'district': 'Bangalore', 'crime_type': 'Theft', 'count': 48, 'predicted': False},
            {'date': '2026-04-01', 'district': 'Bangalore', 'crime_type': 'Theft', 'count': 60, 'predicted': False},
            {'date': '2026-05-01', 'district': 'Bangalore', 'crime_type': 'Theft', 'count': 55, 'predicted': False},
            {'date': '2026-06-01', 'district': 'Bangalore', 'crime_type': 'Theft', 'count': 58, 'predicted': False}
        ],
        'forecast': [
            {'date': '2026-07-01', 'district': 'Bangalore', 'crime_type': 'Theft', 'count': 65, 'predicted': True},
            {'date': '2026-08-01', 'district': 'Bangalore', 'crime_type': 'Theft', 'count': 72, 'predicted': True},
            {'date': '2026-09-01', 'district': 'Bangalore', 'crime_type': 'Theft', 'count': 68, 'predicted': True}
        ],
        'summary': 'Our QuickML time-series model detects a 15% upward trend in vehicle thefts in Bangalore Urban over the next quarter. We recommend increased night patrols in South and East divisions.'
    })

def handle_alerts(has_demo_auth):
    return json_response({'items': [
        {'id': 1, 'title': 'High volume of Cyber Crimes in Bangalore', 'severity': 'high', 'created_at': '2026-07-25T10:00:00Z'},
        {'id': 2, 'title': 'New Pattern: UPI Fraud in Mysore', 'severity': 'medium', 'created_at': '2026-07-24T14:30:00Z'}
    ], 'total': 2})

def handle_offenders(has_demo_auth):
    items = []
    for i in range(1, 21):
        items.append({
            'id': i,
            'name': f'Accused {i}',
            'risk_score': random.randint(40, 95),
            'firs_count': random.randint(1, 5),
            'latest_crime': 'Theft'
        })
    return json_response({'items': items, 'total': 20, 'page': 1, 'page_size': 20, 'pages': 1})

def handle_offender_detail(offender_id, has_demo_auth):
    return json_response({
        'id': int(offender_id),
        'name': f'Accused {offender_id}',
        'age': 28,
        'gender': 'Male',
        'address': 'Bangalore',
        'risk_score': 88,
        'created_at': '2026-01-01T00:00:00Z',
        'firs': [
            {'id': 1, 'fir_number': 'FIR/2026/001', 'date': '2026-07-20', 'crime_type': 'Cyber Crime', 'district': 'Bangalore', 'status': 'Open'}
        ],
        'links': [
            {'id': 1, 'linked_accused_id': 2, 'linked_accused_name': 'Associate A', 'link_type': 'Co-accused', 'weight': 0.8}
        ]
    })

def handle_chat(body):
    messages = body.get('messages', [])
    if not messages:
        return json_response({'reply': 'Hello! I am the KSP CrimeIntel AI Assistant. How can I help you today?'})
    
    last_msg = messages[-1].get('content', '').lower()
    
    # Simple keyword-based dummy responses for the hackathon
    if 'theft' in last_msg:
        reply = 'Based on recent data, theft incidents have increased by 15% in Bangalore Urban. I recommend increasing night patrols in the central district.'
    elif 'cyber' in last_msg or 'fraud' in last_msg:
        reply = 'Cyber crime is our top priority. We have flagged 3 repeat offender networks operating via WhatsApp phishing links.'
    elif 'offender' in last_msg or 'accused' in last_msg:
        reply = 'Accused #1 (High Risk) has 1 open FIR and links to 2 other known offenders. Would you like me to map their network?'
    else:
        reply = "I'm analyzing the crime data for your query... As this is a demo, my capabilities are simulated, but in production I would query the KSP database to answer that!"
        
    return json_response({'reply': reply})

def handle_seed_db():
    try:
        import zcatalyst_sdk as catalyst
        app = catalyst.initialize()
        datastore = app.datastore()
        
        # We assume they created a table called 'Cases' with columns 'fir_number', 'crime_type', 'district'
        table = datastore.table('Cases')
        
        # Insert some dummy records
        records = [
            {'fir_number': 'FIR/2026/001', 'crime_type': 'Cyber Crime', 'district': 'Bangalore Urban', 'status': 'Open'},
            {'fir_number': 'FIR/2026/002', 'crime_type': 'Theft', 'district': 'Mysore', 'status': 'Closed'},
            {'fir_number': 'FIR/2026/003', 'crime_type': 'Assault', 'district': 'Hubli-Dharwad', 'status': 'Open'}
        ]
        
        inserted = table.insert_rows(records)
        return json_response({'status': 'success', 'message': f'Inserted {len(inserted)} records into Cases table!', 'inserted': inserted})
    except Exception as e:
        return json_response({'status': 'error', 'message': str(e)})
