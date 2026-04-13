# Order Heatmap — Geospatial Visualization

A modern, professional web application for visualizing order distribution and density across geographic regions. Built with Leaflet.js, Node.js, and designed for Vercel deployment.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18%2B-green.svg)
![Platform](https://img.shields.io/badge/platform-Vercel-black.svg)

## Features

- **Geospatial Visualization**: Interactive heatmap showing order concentration by density
- **File Upload Support**: Import order data from Excel (.xlsx, .xls) or CSV files
- **Auto-Geocoding**: Automatically detects and matches ZIP codes, cities, and states
- **Real-time Stats**: Live counters for total orders, geocoded locations, and detected columns
- **Professional UI**: Modern dark theme with smooth animations and accessibility support
- **Export Capability**: Download geocoded coordinates as CSV for further analysis
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Vercel-Ready**: Serverless functions for scalable deployment

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Mapping**: [Leaflet.js](https://leafletjs.com/) + [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat)
- **Backend**: Node.js with Express.js
- **File Parsing**: XLSX, CSV-Parse
- **Hosting**: [Vercel](https://vercel.com) (serverless functions)
- **Geocoding**: Built-in ZIP code database

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Server runs on http://localhost:3737
```

### Deployment to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy to Vercel
vercel

# Or connect your GitHub repo to Vercel for automatic deployments
```

## Usage

1. **Upload Data**: Click "Import Data" or drag-and-drop a file
2. **Supported Formats**:
   - `.xlsx` / `.xls` (Excel spreadsheets)
   - `.csv` (Comma-separated values)
3. **Column Detection**: The app automatically detects:
   - ZIP code column
   - City column
   - State/Province column
4. **Visualization**: Once uploaded, the map displays a heatmap of order density
5. **Export Results**: Click "Export" to download geocoded coordinates as CSV

## File Format Requirements

Your input file should contain at least one of these column combinations:

- **ZIP Code** (Primary - most accurate)
- **City + State** (Fallback)

### Column Detection

The app uses keyword matching to find relevant columns:

| Data Type | Detected Keywords |
|-----------|------------------|
| ZIP Code | zip, postal, post code, postcode |
| City | city, town |
| State | state, province |

If keywords don't match, it falls back to default Walmart Seller Center export format (columns O, P, Q).

## Project Structure

```
order-heatmap/
├── api/
│   ├── upload.js          # Vercel serverless upload handler
│   └── server.js          # Local Express.js development server
├── public/
│   └── zips.json          # ZIP code geocoding database
├── index.html             # Main application
├── package.json           # Node.js dependencies
├── vercel.json            # Vercel configuration
└── README.md              # This file
```

## Configuration

### Vercel Deployment

The `vercel.json` file configures:
- Function memory: 3008MB
- Max duration: 60 seconds
- Caching headers for static assets

### Environment Variables

No environment variables required for basic deployment. The ZIP code database is loaded locally.

## Geocoding

The application uses a built-in ZIP code database (`zips.json`) containing:
- ~43,000 US ZIP codes
- Latitude/longitude coordinates
- City and state mapping

**Geocoding Strategy**:
1. **Primary**: ZIP code lookup (most precise)
2. **Fallback**: City + State combination scan

## Performance

- **File Upload**: Handles up to 10MB files
- **Heatmap Rendering**: Optimized for 50,000+ data points
- **API Response**: <2 seconds for typical datasets

## Accessibility

- Color contrast meets WCAG AA standards (4.5:1 minimum)
- Keyboard navigation support
- Screen reader compatible
- Reduced motion support
- Focus indicators on interactive elements

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## API Endpoints

### POST `/api/upload`

Upload and process a data file.

**Request**:
```bash
curl -X POST -F "file=@data.xlsx" http://localhost:3737/api/upload
```

**Response**:
```json
{
  "points": [
    [38.5, -96.5, 1, "Label"],
    [40.7, -74.0, 1, "New York, NY 10001"]
  ],
  "meta": {
    "total": 100,
    "geocoded": 95,
    "skipped": 5,
    "zipCol": "ZIP",
    "cityCol": "City",
    "stateCol": "State"
  }
}
```

## Known Limitations

- US locations only (uses US ZIP code database)
- Requires at least ZIP code or City+State columns
- CSV files must use standard comma delimiter
- Maximum file size: 10MB

## Customization

### Change Geocoding Database

To use a different geography or add international support:
1. Replace `zips.json` with your own database
2. Ensure same format: `{ "zipcode": [lat, lng, city, state] }`
3. Update column detection keywords in `api/server.js` and `api/upload.js`

### Modify Color Scheme

Update CSS variables in `index.html`:
```css
:root {
  --primary: #3b82f6;
  --accent: #f59e0b;
  /* ... more colors ... */
}
```

## Troubleshooting

**File upload fails:**
- Check file format is .xlsx, .xls, or .csv
- Ensure file size is under 10MB
- Verify column headers are present

**No points appearing on map:**
- Check that columns contain valid ZIP codes or City/State pairs
- Verify ZIP codes are 5 digits (padded with zeros)
- Check browser console for error messages

**Slow performance:**
- For large datasets (>50,000 rows), consider filtering data before upload
- Clear browser cache
- Try a different browser

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions:
- GitHub Issues: [pdtribble/order-heatmap/issues](https://github.com/pdtribble/order-heatmap/issues)
- Pull Requests welcome!

## Credits

- **Leaflet.js**: Interactive mapping library
- **CARTO**: Dark map tiles
- **OpenStreetMap**: Geospatial data

---

**Built with** ❤️ **using modern web technologies**
