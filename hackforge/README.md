# SubTracker - Subscription Management Application

A comprehensive React-based subscription tracking application that helps you manage all your recurring payments, prevent forgotten subscriptions, and optimize your monthly expenses.

## Features

### ✨ Dashboard & Analytics
- **Monthly Cost Summary** - View your total monthly spending at a glance
- **Yearly Projections** - See your expected annual costs
- **Active Subscription Counter** - Track how many subscriptions you have
- **Average Cost Per Service** - Understand your spending patterns

### 📊 Smart Analytics
- **Category Breakdown** - Visual breakdown of spending by category (Entertainment, Software, Utilities, etc.)
- **Cost Optimization Insights** - Identify your largest expense categories
- **Monthly Equivalent Calculations** - Automatically converts all billing cycles to monthly amounts

### ⚠️ Renewal Alerts
- **Upcoming Renewals** - Alert system for renewals in the next 7 days
- **Past Due Notifications** - Identify subscriptions that may have already renewed
- **Smart Timing** - Visual indicators for urgent vs. upcoming renewals

### 🎛️ Subscription Management
- **Full CRUD Operations** - Add, edit, delete, and manage subscriptions
- **Status Toggle** - Easily activate/deactivate subscriptions
- **Advanced Filtering** - Search by name, filter by category or status
- **Smart Sorting** - Automatically sorts by renewal date and status

### 📱 Responsive Design
- **Mobile-First** - Optimized for all screen sizes
- **Touch-Friendly** - Easy to use on mobile devices
- **Responsive Grid Layout** - Adapts beautifully to any screen size

## Technology Stack

- **React 19** with TypeScript
- **Custom CSS** (Tailwind-style utilities)
- **Lucide React** icons
- **localStorage** for data persistence
- **Responsive design** with mobile-first approach

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation & Running

1. Navigate to the project directory:
   ```bash
   cd subscription-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Alternative Port
If port 3000 is busy, you can run on a different port:
```bash
npx cross-env PORT=3001 npm start
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - **Note: this is a one-way operation**

## Usage Guide

### Adding Your First Subscription
1. Click the "Add Subscription" button
2. Fill in the service name (e.g., "Netflix", "Spotify")
3. Enter the cost and select billing cycle
4. Choose a category
5. Set the next billing date
6. Save!

### Managing Existing Subscriptions
- **Edit**: Click the blue edit icon on any subscription card
- **Delete**: Click the red trash icon (with confirmation)
- **Toggle Status**: Use the power button to activate/deactivate
- **Filter**: Use the search bar and dropdowns to find specific subscriptions

### Understanding the Dashboard
- **Monthly Cost**: Your total monthly equivalent spending
- **Yearly Projection**: Annual cost estimation
- **Active Subscriptions**: Currently active services
- **Average Per Service**: Monthly cost divided by active subscriptions

### Renewal Alerts
The orange alert banner shows subscriptions renewing in the next 7 days:
- **Today/Tomorrow**: Red indicators for urgent renewals
- **2-3 days**: Orange indicators for soon-to-renew
- **4-7 days**: Yellow indicators for upcoming renewals

## Categories

The app includes these predefined categories:
- **Entertainment** (Netflix, Spotify, etc.)
- **Software** (Adobe, Microsoft, etc.)
- **Utilities** (Internet, Phone, etc.)
- **Health** (Gym, Health apps, etc.)
- **Finance** (Banking, Investment apps, etc.)
- **Education** (Online courses, etc.)
- **Other** (Miscellaneous services)

## Data Storage

Your subscription data is stored locally in your browser using localStorage. This means:
- ✅ Your data stays private and secure
- ✅ No internet required after initial load
- ⚠️ Data is specific to this browser/device
- ⚠️ Clearing browser data will remove subscriptions

## Sample Data

The app comes with sample subscriptions to help you get started:
- Netflix ($15.99/month)
- Adobe Creative Suite ($52.99/month)  
- Amazon Prime ($139/year)
- Spotify Premium ($9.99/month)
- GitHub Pro ($4.00/month, inactive)

You can delete these and add your own subscriptions.

**Built with ❤️ for better subscription management**
