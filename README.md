### Bangalore Local - Business Directory





A comprehensive web application that showcases local businesses, attractions, and points of interest across Bangalore city. This interactive directory allows users to discover, explore, and connect with various establishments throughout the city.

## Features

- **Interactive Business Directory**: Browse through 200+ businesses across Bangalore
- **Advanced Filtering**: Filter businesses by category, location, rating, and more
- **Detailed Business Profiles**: View comprehensive information about each business
- **Interactive Map**: Explore businesses on an interactive map
- **Responsive Design**: Fully responsive interface that works on all devices
- **Contact Form**: Submit inquiries directly through the platform (with MongoDB integration)
- **Search Functionality**: Find specific businesses quickly


## Technologies Used

- **Backend**: Python Flask
- **Database**: MongoDB
- **Frontend**: HTML, CSS, JavaScript
- **Maps Integration**: Google Maps API
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Poppins, Montserrat)


## Screenshots

The application features a clean, modern interface with intuitive navigation and detailed business listings.

## Project Structure

```plaintext
bangalore_local/
├── app.py                  # Main Flask application
├── mongodb_config.py       # MongoDB connection configuration
├── businesses.json         # Business data (200 locations)
├── requirements.txt        # Project dependencies
├── static/                 # Static assets
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   ├── images/
│   │   └── logo.png        # Logo and other images
│   └── js/
│       ├── contact-form.js # Contact form handling
│       ├── main.js         # Main JavaScript functionality
│       └── map-utils.js    # Map functionality
└── templates/              # HTML templates
    ├── index.html          # Homepage template
    └── business.html       # Business detail page template
```

## Installation

1. Clone the repository
2. Install the required dependencies
3. Set up MongoDB
4. Configure environment variables
5. Run the application


For detailed installation instructions, see the [Steps to Run](#steps-to-run) section.

## Steps to Run

See the [steps-to-run.txt](steps-to-run.txt) file for detailed instructions on how to set up and run the project.

## Database

The application uses MongoDB with the following configuration:

- Database name: `bangalore_local`
- Collection: `contacts` (for storing contact form submissions)


## API Endpoints

- `/` - Homepage
- `/business/<id>` - Business detail page
- `/api/businesses` - Get all businesses (with optional filtering)
- `/api/categories` - Get all business categories
- `/api/locations` - Get all business locations
- `/submit-contact` - Submit contact form data


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries, please contact:

- Email: [pranavvp1507@gmail.com](mailto:pranavvp1507@gmail.com)
- Phone: +91 9380833197


## Acknowledgements

- Google Maps API for map integration
- Font Awesome for icons
- Unsplash for stock images


```plaintext file="steps-to-run.txt"
...
```

git clone [https://github.com/yourusername/bangalore-local.git](https://github.com/yourusername/bangalore-local.git)
cd bangalore-local

```plaintext

2. Create and activate a virtual environment (recommended)
```

# On Windows

python -m venv venv
venv\Scripts\activate

# On macOS/Linux

python3 -m venv venv
source venv/bin/activate

```plaintext

3. Install the required dependencies
```

pip install -r requirements.txt

```plaintext

4. Set up MongoDB
- Make sure MongoDB is installed and running on your system
- The default connection string is 'mongodb://localhost:27017/'
- If your MongoDB is running on a different host or port, set the MONGO_URI environment variable:
```

# On Windows

set MONGO_URI=mongodb://your-mongodb-uri

# On macOS/Linux

export MONGO_URI=mongodb://your-mongodb-uri

```plaintext

5. Run the application
```

python app.py

```plaintext

6. Access the application
- Open your web browser and navigate to http://localhost:5000
- The application should now be running and accessible

## Database Information
- Database name: "bangalore_local"
- Collection name: "contacts" (for storing contact form submissions)

## Troubleshooting

1. MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in mongodb_config.py
- Verify network connectivity if using a remote MongoDB instance

2. Missing Dependencies
- If you encounter any missing module errors, try reinstalling the requirements:
```

pip install -r requirements.txt

```plaintext

3. Port Already in Use
- If port 5000 is already in use, you can modify the app.run() line in app.py to use a different port:
```python
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Change to an available port
```

## Additional Notes

- The application uses the Google Maps API. The API key is already included in the HTML templates.
- For development purposes, debug mode is enabled by default. Disable it in production by setting debug=False in app.py.
- The businesses.json file contains 200 business listings that will be loaded when the application starts.


## Functionality

- **Business Listings**: Browse and filter through 200 businesses across Bangalore
- **Business Details**: View detailed information about each business including description, contact information, hours, features, and location
- **Map Integration**: Interactive map showing business locations
- **Contact Form**: Submit inquiries that are stored in MongoDB
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Troubleshooting

- **MongoDB Connection Issues**: Ensure MongoDB is running and check the connection string
- **Missing Dependencies**: Reinstall requirements if you encounter any missing module errors
- **Port Already in Use**: Modify the port in app.py if port 5000 is already in use

## Contact

For any inquiries, please contact:
- Email: pranavvp1507@gmail.com
- Phone: +91 9380833197

## License

This project is licensed under the MIT License.
```
