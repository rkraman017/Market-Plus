
# MarketPulse - Real-Time Stock Market Dashboard

MarketPulse is a web-based stock market dashboard built using Python and FastAPI. It provides a simple and interactive interface for searching stocks, viewing stock prices and market metrics, analyzing historical price movements, managing a watchlist, viewing portfolio information, and setting price alerts.

The project uses a FastAPI backend to communicate with the market-data provider and an HTML, CSS, and JavaScript frontend for the dashboard interface. Chart.js is used to visualize historical stock prices.

## Features

- Stock search using ticker symbols such as AAPL and MSFT
- Current stock quote information
- Display of last price and percentage change
- Open, High, Low, Previous Close and Volume metrics
- Historical stock price chart
- Chart range controls for 1M, 3M, 6M and 1Y
- Watchlist with add and remove functionality
- Portfolio overview section
- Price alert interface
- Dark and light theme switching
- Responsive dashboard interface
- Market index snapshot section
- FastAPI REST API backend
- Twelve Data integration for market data
- Environment variable based API key configuration

## Technology Stack

### Backend

- Python
- FastAPI
- Uvicorn
- REST API
- Twelve Data API

### Frontend

- HTML5
- CSS3
- JavaScript
- Chart.js

### Tools

- Visual Studio Code
- Git
- GitHub
- Python Virtual Environment

## Project Architecture

MarketPulse follows a layered web architecture.

The frontend runs in the browser and provides the user interface. JavaScript communicates with the FastAPI backend through REST endpoints. The backend validates requests and communicates with the Twelve Data API to retrieve market information.

The API key is kept on the backend and loaded through an environment variable instead of exposing it in frontend JavaScript.

```text
User
  |
  v
Frontend
HTML + CSS + JavaScript
  |
  v
FastAPI Backend
Python
  |
  v
Twelve Data API
  |
  v
Market Data
````

## Project Structure

```text
Stock Maret Project/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── MarketPlus.png
│
├── docs/
│   └── PROJECT_ROADMAP.md
│
├── .gitignore
└── README.md
```

## Backend API Endpoints

### Get Stock Quote

```text
GET /api/quote/{symbol}
```

Example:

```text
/api/quote/AAPL
```

This endpoint fetches quote information for the selected stock.

The response contains normalized stock information such as price, open, high, low, previous close, change and volume.

### Get Historical Data

```text
GET /api/history/{symbol}
```

Example:

```text
/api/history/AAPL
```

This endpoint retrieves historical market data that is used to generate the price-history chart.

### Health Check

```text
GET /api/health
```

This endpoint can be used to check the application and market-data provider configuration.

## How the Application Works

First, the user enters a stock ticker symbol such as AAPL in the search box.

The frontend sends a request to the FastAPI backend using:

```text
/api/quote/{symbol}
```

The FastAPI backend validates the symbol and sends a request to the configured market-data provider.

The market-data provider returns stock information.

The backend processes the provider response and sends a normalized JSON response to the frontend.

The frontend displays the stock price and market metrics.

The frontend then requests historical data from:

```text
/api/history/{symbol}
```

The historical data is processed and displayed using Chart.js.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rkraman017/Market-Plus.git
```

Move into the project directory:

```bash
cd Market-Plus
```

### 2. Open the Project in VS Code

Open the project folder in Visual Studio Code.

```bash
code .
```

### 3. Open the Backend Directory

```bash
cd backend
```

### 4. Create a Virtual Environment

Windows:

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

### 6. Configure Twelve Data API Key

Create a file named:

```text
backend/.env
```

Add your Twelve Data API key:

```env
TWELVE_DATA_API_KEY=YOUR_API_KEY_HERE
```

Replace `YOUR_API_KEY_HERE` with your actual Twelve Data API key.

Do not publish the `.env` file to GitHub.

### 7. Start the Backend

Inside the `backend` directory, run:

```bash
uvicorn main:app --reload
```

The application will normally be available at:

```text
http://127.0.0.1:8000
```

Open the URL in your browser.

## Example

Search for:

```text
AAPL
```

The dashboard can display information such as:

```text
Price
Percentage Change
Open
High
Low
Previous Close
Volume
```

The historical price section can then display the stock's historical movement through an interactive Chart.js graph.

## Dashboard Components

### Header

Contains the application title, market information, refresh control and profile area.

### Stock Search

Allows users to enter a ticker symbol and request stock information.

### Market Snapshot

Contains dashboard cards for market indices such as:

```text
NIFTY 50
BANK NIFTY
SENSEX
Market Status
```

The index values in the current dashboard interface are presentation placeholders and should not be treated as verified live market values.

### Selected Stock

Displays the currently selected stock and its main market information.

### Price Movement

Displays historical stock prices using Chart.js.

Available range controls include:

```text
1M
3M
6M
1Y
```

### Watchlist

Users can add and remove stock symbols and select a symbol to reload its information.

### Portfolio

Provides a dashboard interface for investment, current value, total P&L and performance.

### Alerts

Provides an interface for selecting a stock, an above/below condition and a target price.

### Theme

The dashboard supports dark and light theme switching.

## Security

MarketPulse keeps the Twelve Data API key on the backend.

The API key should be stored in:

```text
backend/.env
```

Example:

```env
TWELVE_DATA_API_KEY=YOUR_API_KEY
```

The `.env` file should not be committed to GitHub.

The project `.gitignore` contains entries for environment files and Python virtual-environment files.

Never hard-code an API key inside:

```text
index.html
app.js
```

If an API key is accidentally exposed in a screenshot, log, chat or public repository, the key should be rotated.

For production deployment, environment secrets should be managed through the hosting platform's secret-management system.

## Testing

The project can be manually tested using the following checks:

```text
Home page
Quote endpoint
History endpoint
Stock search
Historical chart
Watchlist
Theme switching
Invalid symbol handling
API failure handling
```

Example API tests:

```text
GET /api/quote/AAPL
GET /api/history/AAPL
GET /api/health
```

## Current Limitations

The project currently depends on the limits, supported symbols, latency and licensing rules of the selected market-data provider.

The major market-index values shown in the dashboard are currently placeholder values and should not be considered live verified market data.

The portfolio section currently contains demonstration values until real holdings, transactions and portfolio calculations are implemented.

The price-alert section is currently an interface. Persistent server-side monitoring and notification delivery still require backend jobs or event processing.

The chart currently uses daily historical data. True tick-by-tick market visualization would require an appropriate real-time market-data feed and WebSocket architecture.

User authentication, role management and a persistent relational database are not currently included in the basic project.

## Future Scope

The project can be extended in several phases.

### Data Layer

* Improve Twelve Data integration
* Normalize provider errors
* Add caching
* Add API request throttling

### Database

A PostgreSQL database can be added for:

```text
Users
Watchlists
Holdings
Transactions
Alerts
Audit Records
```

Redis can also be introduced for caching and high-speed temporary data.

### Real-Time Market Data

A licensed WebSocket market-data provider can be integrated for low-latency market updates.

### Advanced Charts

Future chart functionality can include:

```text
Candlestick charts
Volume charts
SMA
EMA
RSI
MACD
Multiple time intervals
```

### Portfolio Engine

A complete portfolio engine can calculate:

```text
Cost Basis
Realized P&L
Unrealized P&L
Asset Allocation
Performance History
```

### Price Alerts

Background monitoring can be implemented for price conditions with notifications through supported channels such as:

```text
Browser Notifications
Email
Telegram
```

### Authentication

Secure user authentication can be added using:

```text
JWT
Session Management
Password Hashing
Role-Based Access Control
```

### Production Deployment

The application can later be deployed using:

```text
Docker
Nginx
HTTPS
Cloud Hosting
Logging
Monitoring
```

## Academic and Resume Value

MarketPulse demonstrates practical full-stack development skills through the combination of:

```text
Python Backend Development
FastAPI
REST API Design
External API Integration
JavaScript
HTML/CSS
Chart.js
Responsive UI Design
Environment Variables
API Security Basics
Client-Side State
Modular Application Architecture
```

The project can be presented as a practical full-stack Python stock market dashboard project.

## Project Status

```text
Backend             Python + FastAPI
Frontend            HTML + CSS + JavaScript
Visualization       Chart.js
Market Data         Twelve Data
Authentication      Not implemented
Database            Not implemented
WebSocket           Not implemented
Portfolio Engine    Demo / Presentation UI
Price Alerts        UI implementation
```

## Disclaimer

MarketPulse is an educational and software-development project.

The dashboard should not be considered a financial advisory or investment recommendation system.

Market data availability, accuracy, update frequency and supported instruments depend on the configured external market-data provider and its applicable plan and licensing terms.

## Author

Developed as a practical full-stack Python project using FastAPI, JavaScript and external market-data API integration.

## Repository

GitHub:

[https://github.com/rkraman017/Market-Plus](https://github.com/rkraman017/Market-Plus)

## License

This project can be used for educational and development purposes. Add an appropriate open-source license to this repository if you plan to distribute the project publicly.

```

Ye README tumhare report ke actual scope ko reflect karta hai, including architecture, setup, API endpoints, security, limitations aur future roadmap. Report ke folder structure aur setup details pages 5 and 8 me documented hain, while limitations and future development pages 8–9 me diye gaye hain. :contentReference[oaicite:2]{index=2} :contentReference[oaicite:3]{index=3} :contentReference[oaicite:4]{index=4}

Tum ise directly GitHub ke `README.md` me paste kar sakte ho.
```
