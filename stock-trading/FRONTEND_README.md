# Stock Trading Frontend

A React-based frontend application for the stock trading simulation system built with Vite, Tailwind CSS, React Router, and Recharts.

## Features

- **Dashboard**: Overview of trading performance, portfolio, and market data
- **Stock Management**: Register new stocks and view price history with charts
- **Trading Operations**: Buy and sell stocks with real-time validation
- **Portfolio Management**: View holdings, allocation, and performance metrics
- **Loan Management**: Request loans with eligibility checks
- **Reports & Analytics**: Comprehensive user and stock performance reports
- **Real-time Updates**: Live price updates and trading notifications

## Tech Stack

- **React 19** with hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Axios** for API communication
- **Vite** for development and build

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.jsx       # Main layout with navigation
│   ├── Dashboard.jsx    # Dashboard overview
│   ├── StockRegistration.jsx  # Stock registration form
│   ├── StockHistory.jsx # Stock price history and charts
│   ├── Trading.jsx      # Buy/sell trading interface
│   ├── LoanManagement.jsx     # Loan application and management
│   └── Reports.jsx      # Analytics and reports
├── pages/               # Page components
│   ├── StocksPage.jsx   # Stock management page
│   └── PortfolioPage.jsx # Portfolio overview page
├── services/            # API communication
│   └── api.js           # API service functions
├── utils/               # Utility functions
│   └── helpers.js       # Formatting and calculation helpers
├── App.jsx              # Main app with routing
└── main.jsx             # App entry point
```

## Component Overview

### Core Components

1. **Layout** (`components/Layout.jsx`)
   - Main application layout
   - Responsive sidebar navigation
   - Mobile-friendly design

2. **Dashboard** (`components/Dashboard.jsx`)
   - Trading performance metrics
   - Market overview charts
   - Recent activities
   - Quick action buttons

3. **StockRegistration** (`components/StockRegistration.jsx`)
   - Form to register new stocks
   - Validation and error handling
   - Integration with backend API

4. **StockHistory** (`components/StockHistory.jsx`)
   - Interactive price charts using Recharts
   - Historical data visualization
   - Stock selection dropdown

5. **Trading** (`components/Trading.jsx`)
   - Buy/Sell stock forms
   - Real-time price updates
   - Portfolio validation
   - Transaction confirmation

6. **LoanManagement** (`components/LoanManagement.jsx`)
   - Loan application form
   - Eligibility calculations
   - Terms and conditions display

7. **Reports** (`components/Reports.jsx`)
   - User performance analytics
   - Stock market reports
   - Top performers leaderboards
   - Interactive charts and tables

### Page Components

1. **StocksPage** (`pages/StocksPage.jsx`)
   - Combines stock registration and history
   - Tabbed interface

2. **PortfolioPage** (`pages/PortfolioPage.jsx`)
   - Portfolio allocation charts
   - Holdings table with P&L
   - Asset breakdown visualization

## API Integration

The frontend connects to your Node.js backend through the `api.js` service:

### Stock APIs
- `POST /api/stocks/register` - Register new stock
- `GET /api/stocks/history` - Get price history
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/report` - Stock performance report
- `GET /api/stocks/top` - Top performing stocks

### User APIs
- `POST /api/users/loan` - Take a loan
- `POST /api/users/buy` - Buy stocks
- `POST /api/users/sell` - Sell stocks
- `GET /api/users/report` - User performance report
- `GET /api/users/top` - Top performing users
- `GET /api/users/:id/portfolio` - User portfolio
- `GET /api/users/:id/balance` - User balance

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Backend URL**
   Update the `API_BASE_URL` in `src/services/api.js` to match your backend server:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api'; // Update this
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Configuration

### Backend Integration
Make sure your backend server is running and accessible. The frontend expects these endpoints:

- Backend API: `http://localhost:3000/api`
- WebSocket: `ws://localhost:3000` (for real-time updates)

### User Management
Currently uses a default user ID (`user1`). You can modify this in each component or implement proper user authentication.

## Features in Detail

### Real-time Updates
- Stock prices update every 5 minutes (configurable)
- WebSocket support for live notifications
- Auto-refresh functionality

### Data Visualization
- Interactive charts using Recharts
- Portfolio allocation pie charts
- Price history line charts
- Performance bar charts

### Responsive Design
- Mobile-first design approach
- Responsive navigation
- Touch-friendly interface
- Cross-browser compatibility

### Error Handling
- API error handling with user-friendly messages
- Form validation
- Loading states
- Fallback content for empty states

## Customization

### Styling
The app uses Tailwind CSS. You can customize the design by:
1. Modifying Tailwind config in `tailwind.config.js`
2. Adding custom CSS in component files
3. Extending the color palette and typography

### API Configuration
- Update `src/services/api.js` for different backend endpoints
- Modify request/response handling as needed
- Add authentication headers if required

### Components
All components are modular and can be easily:
- Styled differently
- Extended with new features
- Composed into different layouts
- Integrated with other systems

## Testing

The application includes:
- Form validation testing
- API integration testing
- Component rendering tests
- User interaction testing

Run tests with:
```bash
npm test
```

## Deployment

Build the app for production:
```bash
npm run build
```

The `dist` folder contains the production build ready for deployment to any static hosting service.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Follow the existing code structure
2. Use Tailwind CSS for styling
3. Implement proper error handling
4. Add loading states for async operations
5. Test on multiple screen sizes
6. Document new features

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend server is running
   - Verify API_BASE_URL in `api.js`
   - Check CORS settings on backend

2. **Charts Not Displaying**
   - Ensure data format matches Recharts requirements
   - Check for JavaScript errors in console
   - Verify chart container dimensions

3. **Navigation Issues**
   - Check React Router configuration
   - Ensure all routes are properly defined
   - Verify component imports

### Performance Optimization

- Implement React.memo for expensive components
- Use useMemo for complex calculations
- Lazy load chart libraries
- Optimize API calls with caching

This frontend provides a complete trading interface that integrates seamlessly with your Node.js backend. All components are production-ready and follow React best practices.
