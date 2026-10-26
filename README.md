# 🌱 EcoPulse — Make Every Watt Count

**A smart energy awareness and saving platform that turns electricity consumption data into actionable insights.**

EcoPulse is a sustainability-focused web application built for **ENERGY SIMTECH '26**, under the Software Track theme *Smart Digital Solutions for Energy and Sustainability*.

The platform helps students, households, and institutions understand their electricity consumption, estimate their energy costs and carbon footprint, discover opportunities to reduce energy waste, and build more sustainable habits through personalized recommendations, goals, and rewards.

> **Our mission:** Go beyond showing people how much electricity they consume. Help them understand how they can save it.

---

## 🎯 Problem Statement

### Problem Statement 2: Energy Awareness and Saving Tool

Electricity consumption often goes unnoticed in everyday life. Students, households, and institutions may lack clear insights into their energy usage, its environmental impact, and the practical steps they can take to reduce unnecessary consumption.

Without accessible feedback and motivation, people may struggle to turn energy-saving intentions into consistent habits.

EcoPulse addresses this challenge through an interactive platform that combines consumption tracking, cost estimation, carbon footprint awareness, personalized energy-saving suggestions, and gamified challenges.

## 💡 Our Solution

EcoPulse transforms electricity consumption information into an understandable and actionable experience.

Users can explore their energy usage, estimate associated costs and emissions, simulate potential savings, and track their progress toward energy-saving goals.

The platform also encourages behavioural change through practical challenges, achievement badges, and a points-based reward system.

### ✨ Key Features

- **📊 Energy Dashboard** — View electricity consumption, estimated electricity costs, carbon emissions, and energy-saving progress.
- **📈 Consumption Analytics** — Explore consumption trends through interactive charts and time-based filters.
- **🧮 Bill & Carbon Calculator** — Estimate electricity costs and carbon emissions using configurable assumptions.
- **🤖 Personalized Energy Coach** — Receive actionable recommendations based on available consumption information.
- **⚡ Savings Simulator** — Explore how reducing electricity consumption could affect estimated bills and emissions.
- **🎯 Energy-Saving Goals** — Set targets and monitor progress toward more efficient energy use.
- **🏆 Gamification & Rewards** — Earn points, complete challenges, unlock badges, and compare progress on a leaderboard.
- **🌿 Sustainability Insights** — Understand the potential environmental impact of energy-saving actions.
- **💾 Persistent User Preferences** — Retain supported user settings and progress between visits using browser storage.
- **📱 Responsive Interface** — Access the application across desktop and mobile screen sizes.

*Note: Features and data availability depend on the current prototype implementation.*

## 🔄 How It Works

EcoPulse follows a simple four-step process:

1. **Track:** Collect or enter electricity consumption information.
2. **Understand:** Visualize energy usage, estimated costs, and environmental impact.
3. **Act:** Use personalized recommendations and savings simulations to identify practical improvements.
4. **Improve:** Set goals, complete challenges, and monitor progress over time.

This approach aims to make energy efficiency easier to understand, measure, and practise in everyday life.

## 🧮 How Calculations Work

EcoPulse uses transparent calculations to help users explore the relationship between electricity consumption, cost, and carbon emissions.

### Estimated Electricity Cost

`Estimated Cost = Electricity Consumption (kWh) × Tariff (₹/kWh)`

### Estimated Carbon Emissions

`Estimated Emissions (kg CO₂) = Electricity Consumption (kWh) × Emission Factor (kg CO₂/kWh)`

### Potential Savings

`Estimated Savings = Baseline Estimate − Projected Estimate`

The results depend on user-configured assumptions and the available data. Electricity tariff calculations may exclude fixed charges, taxes, and other bill components.

Carbon emissions are estimates rather than direct measurements. The selected emission factor should be checked against an appropriate, up-to-date source before using the results for official reporting.

## 🛠️ Technology Stack

- **Frontend:** React
- **Programming Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Visualization:** Charting components
- **State & Persistence:** React state and browser localStorage
- **Development Environment:** Vite

The application is designed to support a working demonstration without requiring paid APIs, external hardware, or a dedicated backend.

## 🚀 Getting Started

Follow these steps to run EcoPulse locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) — Use a version supported by the project dependencies.
- npm — Included with Node.js.
- [Git](https://git-scm.com/) — Required to clone the repository.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ecopulse-energy-saver.git
```

Replace `YOUR_USERNAME` with the GitHub account that owns the repository.

### 2. Navigate to the Project Directory

```bash
cd ecopulse-energy-saver
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL printed in your terminal to explore the application.

*If the project uses different scripts or commands, follow the `package.json` included in the repository.*

## 🧪 Demo Data & Limitations

EcoPulse can use sample consumption data to demonstrate its dashboards, analytics, and calculations without requiring a live electricity meter.

- Sample data should not be interpreted as actual household or campus consumption.
- Calculated costs and emissions depend on the configured assumptions.
- Energy-saving recommendations provide guidance and do not guarantee a particular reduction.
- Simulated insights and rewards do not represent independently verified energy savings.
- Live meter integration, if required, would need an appropriate data source or hardware integration.

These limitations keep the prototype transparent while allowing its core experience to be demonstrated during a hackathon.

## 🌍 Expected Impact

EcoPulse aims to encourage more responsible energy consumption by making energy use easier to understand and improvements easier to track.

Potential benefits include:

- Better awareness of electricity consumption and estimated costs.
- Greater visibility into energy-saving opportunities.
- More informed everyday energy decisions.
- Increased motivation through goals, challenges, and rewards.
- Improved understanding of the relationship between electricity use and carbon emissions.

The actual impact would need to be evaluated using real consumption data and observed user behaviour over time.

## 🔮 Future Enhancements

- Integration with smart meters and IoT energy-monitoring devices.
- Campus-wide dashboards with building-level consumption comparisons.
- More advanced anomaly detection and demand forecasting.
- Verified utility tariff and emissions-factor data sources.
- User accounts, shared challenges, and institution-wide leaderboards.
- Long-term energy-saving reports based on measured consumption.
- Integration with verified sustainability and carbon accounting systems.

## 👥 Team

**Project:** EcoPulse — Make Every Watt Count  
**Event:** ENERGY SIMTECH '26  
**Track:** Software  
**Problem Statement:** Energy Awareness and Saving Tool  
**Theme:** Smart Digital Solutions for Energy and Sustainability

**Team Members:** Add your team members' names and contributions here.

## 📄 License

No license has been specified yet. Add a `LICENSE` file if you intend to publish the project for reuse, modification, or distribution. Until then, do not assume others have permission to reuse the code.

---

**EcoPulse — Small changes. Smarter energy use. A more sustainable future.** 🌱⚡
