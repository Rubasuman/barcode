# Barcode Sticker Generator

A focused app to design and print barcode stickers for your products. Built with React (Vite) and `react-barcode`. Backend/Supabase are optional and not required for sticker generation.

## Features

- 🏷️ **Sticker Designer**: Enter title, SKU, price, barcode value
- 🔢 **Multiple Formats**: Code128 and EAN-13
- 📄 **Print-Ready Layout**: Define label size in mm and number of copies
- 🖨️ **One-Click Print**: Use browser print to paper or PDF
- 🎨 **Clean UI**: Responsive interface with preview grid
- 📥 **Excel Import**: Upload `.xlsx/.xls/.csv` and map columns

## Tech Stack

### Frontend
- React 18
- React Router (single route)
- react-barcode for barcode generation
- Vite for build tooling

### Backend (Optional / Not required)
- Node.js & Express (existing folder, unused for stickers)
- Supabase config present but not needed for sticker printing

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd barcode-system
```

### 2. Frontend Setup (stickers)

```bash
cd frontend
npm install
```

## Running the Application

### Development Mode

Start the frontend:
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` and design your stickers.

### Importing from Excel

1. Choose "Excel" as the data source
2. Upload your file (`.xlsx`, `.xls`, or `.csv`)
3. Map columns to `Title`, `SKU`, `Price`, and `Barcode` (barcode is required)
4. Set label size and copies per row
5. Click "Print Stickers" to generate

### Production Build

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Project Structure

```
barcode-system/
├── backend/
│   ├── config/
│   │   └── supabase.js          # Supabase client configuration
│   ├── controllers/
│   │   └── productController.js # Product CRUD operations
│   ├── routes/
│   │   └── productRoutes.js     # API routes
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Express server
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Sticker.jsx      # Sticker generator page
│   │   ├── App.jsx              # Main app component
│   │   ├── App.css              # Styles
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── schema.sql               # Database schema
└── README.md
```

## API Endpoints

Not needed for sticker generation.

## Usage

### Designing Stickers

1. Open the app
2. Enter title, SKU, price, barcode value
3. Choose format (Code128/EAN-13), size (mm), and copies
4. Click "Print Stickers" and select a printer or "Save as PDF"

## Database Schema

```sql
products
├── id (UUID, Primary Key)
├── name (VARCHAR, NOT NULL)
├── description (TEXT)
├── price (DECIMAL)
├── barcode (VARCHAR, UNIQUE, NOT NULL)
├── category (VARCHAR)
├── stock (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Security Notes

- Always use environment variables for sensitive data
- Enable Row Level Security (RLS) in Supabase for production
- Configure proper CORS settings for production
- Use HTTPS in production

## Troubleshooting

### Camera not working for scanner
- Ensure HTTPS is enabled (required for camera access)
- Check browser permissions
- Try a different browser

### Database connection errors
- Verify Supabase credentials in `.env`
- Check Supabase project status
- Ensure RLS policies are configured correctly

### Port conflicts
- Change PORT in backend `.env` if 5000 is in use
- Update VITE_API_URL in frontend `.env` accordingly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions, please open an issue on GitHub.
