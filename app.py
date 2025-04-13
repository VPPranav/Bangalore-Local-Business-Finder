# from flask import Flask, render_template, request, jsonify, redirect, url_for
# import json
# import os
# import requests
# from datetime import datetime

# app = Flask(__name__)

# # Load business data from JSON file
# def load_businesses():
#     with open('businesses.json', 'r') as file:
#         return json.load(file)

# @app.route('/')
# def index():
#     # Get any query parameters for pre-filtering
#     search = request.args.get('search', '')
#     category = request.args.get('category', '')
#     location = request.args.get('location', '')
    
#     return render_template('index.html', 
#                           search=search, 
#                           selected_category=category, 
#                           selected_location=location)

# @app.route('/api/businesses')
# def get_businesses():
#     businesses = load_businesses()
    
#     # Get filter parameters
#     category = request.args.get('category')
#     rating = request.args.get('rating')
#     location = request.args.get('location')
#     search_query = request.args.get('search')
#     sort_by = request.args.get('sort', 'rating') # Default sort by rating
    
#     # Apply filters
#     filtered_businesses = businesses
    
#     if category and category != 'all':
#         filtered_businesses = [b for b in filtered_businesses if b['category'] == category]
    
#     if rating:
#         min_rating = float(rating)
#         filtered_businesses = [b for b in filtered_businesses if b['rating'] >= min_rating]
    
#     if location:
#         filtered_businesses = [b for b in filtered_businesses if location.lower() in b['location'].lower()]
    
#     if search_query:
#         filtered_businesses = [b for b in filtered_businesses if search_query.lower() in b['name'].lower() 
#                               or search_query.lower() in b['description'].lower()
#                               or search_query.lower() in b['category'].lower()]
    
#     # Sort results
#     if sort_by == 'rating':
#         filtered_businesses = sorted(filtered_businesses, key=lambda x: x['rating'], reverse=True)
#     elif sort_by == 'reviews':
#         filtered_businesses = sorted(filtered_businesses, key=lambda x: x['reviews'], reverse=True)
#     elif sort_by == 'name':
#         filtered_businesses = sorted(filtered_businesses, key=lambda x: x['name'])
    
#     return jsonify(filtered_businesses)

# @app.route('/business/<int:business_id>')
# def business_detail(business_id):
#     businesses = load_businesses()
#     business = next((b for b in businesses if b['id'] == business_id), None)
    
#     if business:
#         # Get similar businesses (same category, excluding current one)
#         similar_businesses = [b for b in businesses if b['category'] == business['category'] and b['id'] != business_id]
#         # Limit to 3 similar businesses
#         similar_businesses = sorted(similar_businesses, key=lambda x: x['rating'], reverse=True)[:3]
        
#         # Format business hours for display
#         if 'hours' in business and business['hours']:
#             # Already formatted, no need to change
#             pass
#         else:
#             business['hours'] = "Monday-Sunday: 9:00 AM - 9:00 PM"
        
#         # Check if business is currently open
#         is_open, closes_at = check_if_open(business['hours'])
        
#         return render_template('business.html', 
#                               business=business, 
#                               similar_businesses=similar_businesses,
#                               is_open=is_open,
#                               closes_at=closes_at)
#     else:
#         return "Business not found", 404

# def check_if_open(hours_str):
#     """Check if a business is currently open based on its hours string"""
#     # This is a simplified version - in a real app, you'd parse the hours string properly
#     # For now, we'll just assume it's open during business hours (9 AM - 9 PM)
#     now = datetime.now()
#     current_hour = now.hour
    
#     # Simple check - assume open 9 AM to 9 PM
#     is_open = 9 <= current_hour < 21
#     closes_at = "9:00 PM"
    
#     return is_open, closes_at

# @app.route('/api/categories')
# def get_categories():
#     businesses = load_businesses()
#     categories = sorted(list(set(b['category'] for b in businesses)))
#     return jsonify(categories)

# @app.route('/api/locations')
# def get_locations():
#     businesses = load_businesses()
#     locations = sorted(list(set(b['location'] for b in businesses)))
#     return jsonify(locations)

# @app.route('/search')
# def search():
#     query = request.args.get('q', '')
#     return redirect(url_for('index', search=query))

# @app.template_filter('star_rating')
# def star_rating(value):
#     """Convert a numeric rating to HTML star display"""
#     full_stars = int(value)
#     half_star = (value - full_stars) >= 0.5
#     empty_stars = 5 - full_stars - (1 if half_star else 0)
    
#     result = ''
#     result += '<i class="fas fa-star"></i>' * full_stars
#     if half_star:
#         result += '<i class="fas fa-star-half-alt"></i>'
#     result += '<i class="far fa-star"></i>' * empty_stars
    
#     return result

# if __name__ == '__main__':
#     app.run(debug=True)
from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
import requests
from datetime import datetime
from mongodb_config import get_collection, get_database
from bson.json_util import dumps

app = Flask(__name__)

# Load business data from JSON file
def load_businesses():
    with open('businesses.json', 'r') as file:
        return json.load(file)

@app.route('/')
def index():
    # Get any query parameters for pre-filtering
    search = request.args.get('search', '')
    category = request.args.get('category', '')
    location = request.args.get('location', '')
    
    return render_template('index.html', 
                          search=search, 
                          selected_category=category, 
                          selected_location=location)

@app.route('/api/businesses')
def get_businesses():
    businesses = load_businesses()
    
    # Get filter parameters
    category = request.args.get('category')
    rating = request.args.get('rating')
    location = request.args.get('location')
    search_query = request.args.get('search')
    sort_by = request.args.get('sort', 'rating') # Default sort by rating
    
    # Apply filters
    filtered_businesses = businesses
    
    if category and category != 'all':
        filtered_businesses = [b for b in filtered_businesses if b['category'] == category]
    
    if rating:
        min_rating = float(rating)
        filtered_businesses = [b for b in filtered_businesses if b['rating'] >= min_rating]
    
    if location:
        filtered_businesses = [b for b in filtered_businesses if location.lower() in b['location'].lower()]
    
    if search_query:
        filtered_businesses = [b for b in filtered_businesses if search_query.lower() in b['name'].lower() 
                              or search_query.lower() in b['description'].lower()
                              or search_query.lower() in b['category'].lower()]
    
    # Sort results
    if sort_by == 'rating':
        filtered_businesses = sorted(filtered_businesses, key=lambda x: x['rating'], reverse=True)
    elif sort_by == 'reviews':
        filtered_businesses = sorted(filtered_businesses, key=lambda x: x['reviews'], reverse=True)
    elif sort_by == 'name':
        filtered_businesses = sorted(filtered_businesses, key=lambda x: x['name'])
    
    return jsonify(filtered_businesses)

@app.route('/business/<int:business_id>')
def business_detail(business_id):
    businesses = load_businesses()
    business = next((b for b in businesses if b['id'] == business_id), None)
    
    if business:
        # Get similar businesses (same category, excluding current one)
        similar_businesses = [b for b in businesses if b['category'] == business['category'] and b['id'] != business_id]
        # Limit to 3 similar businesses
        similar_businesses = sorted(similar_businesses, key=lambda x: x['rating'], reverse=True)[:3]
        
        # Format business hours for display
        if 'hours' in business and business['hours']:
            # Already formatted, no need to change
            pass
        else:
            business['hours'] = "Monday-Sunday: 9:00 AM - 9:00 PM"
        
        # Check if business is currently open
        is_open, closes_at = check_if_open(business['hours'])
        
        return render_template('business.html', 
                              business=business, 
                              similar_businesses=similar_businesses,
                              is_open=is_open,
                              closes_at=closes_at)
    else:
        return "Business not found", 404

def check_if_open(hours_str):
    """Check if a business is currently open based on its hours string"""
    # This is a simplified version - in a real app, you'd parse the hours string properly
    # For now, we'll just assume it's open during business hours (9 AM - 9 PM)
    now = datetime.now()
    current_hour = now.hour
    
    # Simple check - assume open 9 AM to 9 PM
    is_open = 9 <= current_hour < 21
    closes_at = "9:00 PM"
    
    return is_open, closes_at

@app.route('/api/categories')
def get_categories():
    businesses = load_businesses()
    categories = sorted(list(set(b['category'] for b in businesses)))
    return jsonify(categories)

@app.route('/api/locations')
def get_locations():
    businesses = load_businesses()
    locations = sorted(list(set(b['location'] for b in businesses)))
    return jsonify(locations)

@app.route('/search')
def search():
    query = request.args.get('q', '')
    return redirect(url_for('index', search=query))

# Fixed route to handle contact form submissions
@app.route('/submit-contact', methods=['POST'])
def submit_contact():
    try:
        # Get form data
        name = request.form.get('name')
        email = request.form.get('email')
        subject = request.form.get('subject')
        message = request.form.get('message')
        
        # Validate required fields
        if not all([name, email, message]):
            return jsonify({
                'success': False,
                'message': 'Please fill all required fields'
            })
        
        # Get the database connection
        db = get_database()
        
        # Check if database connection is None (fixed the boolean check)
        if db is None:
            return jsonify({
                'success': False,
                'message': 'Database connection error. Please try again later.'
            })
        
        # Get the contacts collection
        contacts = db['contacts']
        
        # Create contact document
        contact_data = {
            'name': name,
            'email': email,
            'subject': subject or "No Subject",
            'message': message,
            'created_at': datetime.now()
        }
        
        # Insert into MongoDB
        result = contacts.insert_one(contact_data)
        
        if result.inserted_id:
            print(f"Contact form submitted successfully: {result.inserted_id}")
            return jsonify({
                'success': True,
                'message': 'Thank you for your message! We will get back to you soon.'
            })
        else:
            print("Failed to insert contact form data")
            return jsonify({
                'success': False,
                'message': 'Failed to save your message. Please try again.'
            })
            
    except Exception as e:
        print(f"Error submitting contact form: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}. Please try again later.'
        })

@app.template_filter('star_rating')
def star_rating(value):
    """Convert a numeric rating to HTML star display"""
    full_stars = int(value)
    half_star = (value - full_stars) >= 0.5
    empty_stars = 5 - full_stars - (1 if half_star else 0)
    
    result = ''
    result += '<i class="fas fa-star"></i>' * full_stars
    if half_star:
        result += '<i class="fas fa-star-half-alt"></i>'
    result += '<i class="far fa-star"></i>' * empty_stars
    
    return result

if __name__ == '__main__':
    app.run(debug=True)