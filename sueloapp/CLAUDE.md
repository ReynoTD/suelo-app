# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Suelo Sano** is a React Native mobile application built with Expo for evaluating and reporting soil contamination by hydrocarbons. The app provides two types of reporting mechanisms: basic reports (quick location, photo, and comment) and advanced reports (detailed analysis with hydrocarbon type and concentration).

## Development Commands

### Running the Application
```bash
npm start           # Start Expo development server
npm run android     # Run on Android device/emulator
npm run ios         # Run on iOS device/simulator
npm run web         # Run in web browser
```

### Package Management
```bash
npm install         # Install dependencies
```

## Architecture

### Navigation Structure

The app uses a **nested navigation pattern** combining Stack and Tab navigators:

1. **Root Container** (`App.js`):
   - Contains a custom `Header` component with the "Suelo Sano" branding
   - Wraps `MainTabs` (bottom tab navigator)

2. **MainTabs** (Bottom Tab Navigator):
   - **Reportes** → `HomeStack` (nested stack navigator)
   - **Mapa** → `MapScreen`
   - **Mis Reportes** → `MyReportsScreen`
   - **Perfil** → `ProfileScreen`

3. **HomeStack** (Stack Navigator within Reportes tab):
   - **HomeMain** → `HomeScreen` (entry point showing report type cards)
   - **AdvancedReport** → `AdvancedReportScreen` (detailed report form)

Navigation between screens uses React Navigation:
- Tab switching handled by `MainTabs`
- Stack navigation within HomeStack: `navigation.navigate("AdvancedReport")`
- The basic report screen (`basicReport.js`) exists but is not yet integrated into navigation

### Screen Organization

All screens are located in `/screens/` directory:

- **Authentication**: `login.js`, `register.js` (exist but not integrated into navigation flow)
- **Dashboard**: `dasboard.js` (alternative dashboard, not currently used)
- **Main Flow**:
  - `homescreen.js` - Landing page with report type selection cards
  - `AdvancedReportScreen.js` - Advanced report form with risk calculation
  - `basicReport.js` - Simple report form (not integrated yet)
  - `mapscreen.js` - Map view placeholder
  - `myreportsscreen.js` - User's report history
  - `profilescreen.js` - User profile

### Report Types

#### Basic Report (`basicReport.js`)
Simple form capturing:
- User identification
- Date/Time (auto-populated, editable)
- Soil color, odor, texture
- Substance viscosity
- Residues present
- Additional observations
- Initial risk level (dropdown: Bajo, Medio, Alto, Muy Alto)
- Sync status

#### Advanced Report (`AdvancedReportScreen.js`)
Structured risk assessment form with three sections:

**A. Site Identification**
- Site name, location, coordinates
- Inspection date and inspector

**B. Contaminant Observation**
- Odor level (0: None, 3: Mild, 5: Severe)
- Coloration (0: None, 2: Superficial, 4: Extensive and deep)
- Free phase presence (boolean, 10 points if yes)
- Affected area and depth

**C. Hydrogeology and Environment**
- Land use (Residential: 3, Industrial: 2, Conservation: 4)
- Water table depth (>10m: 2, 5-10m: 5, <5m: 8)
- Soil type
- Nearby water bodies

**Risk Calculation**:
The form calculates a risk index by:
1. Summing points from odor, coloration, free phase, and water table depth
2. Multiplying by land use multiplier
3. Classifying as: Bajo (<30), Medio (30-60), Alto (60-90), Muy Alto (>90)

### Styling Conventions

The app uses a consistent green color scheme:
- Primary green: `#2d7a2e` (header, active tabs)
- Secondary green: `#6b8e23` (buttons)
- Dark green: `#1b5e20` (primary buttons)
- Light green background: `#e8f5e9` (cards)
- Accent: `#9dc183` (logo background)

All screens use inline `StyleSheet.create()` rather than shared style files.

### Empty Directories

The following directories exist but are currently empty:
- `/components/` - Intended for reusable UI components
- `/navigation/` - Navigation is currently defined in App.js
- `/services/` - Intended for API calls and business logic
- `/utils/` - Intended for utility functions and helpers

## Key Patterns

### State Management
- Uses React hooks (`useState`) for local component state
- No global state management (Redux, Context) currently implemented
- Form data stored in local state objects

### Icons
- Uses `@expo/vector-icons` (Ionicons) throughout
- Common icons: `document-text`, `map`, `list`, `person`, `camera`

### Platform Handling
- Uses `Platform.OS` for iOS/Android-specific behavior
- SafeAreaView and KeyboardAvoidingView for proper mobile UI

### Form Patterns
Forms use controlled components with dedicated state for each field and validation before submission. Custom input components (like `CustomInput` in basicReport.js) should be defined outside the main component to avoid re-render focus issues.

## Current State

The application is in active development:
- Core navigation structure is implemented
- Advanced report form is fully functional with risk calculation
- Basic report form exists but not integrated into navigation flow
- Authentication screens exist but not integrated
- Map, reports list, and profile screens are placeholders
- No backend integration (console.log for form submissions)
- Services and utilities directories are empty and ready for implementation
