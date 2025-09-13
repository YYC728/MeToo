# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TurtleRocket Time Twister is a React-based calendar optimization tool that:
- Imports ICS calendar files from Google Calendar
- Classifies events by cognitive load using keyword matching
- Re-optimizes schedules based on user-defined energy levels throughout the day
- Exports optimized ICS files that can be imported back into calendar applications

## Important Project Structure Rule

**CRITICAL**: ALL project files MUST be created within the `/Users/linkedin/Desktop/Energy/turtlerocket-time-twister/` directory. 
- Never create files in `/Users/linkedin/Desktop/Energy/` directly
- Always use the full path starting with `/Users/linkedin/Desktop/Energy/turtlerocket-time-twister/` when creating or modifying files
- This includes src/, components/, tests, and any other project files

## Common Development Commands

### Initial Setup
```bash
# Create the React app with TypeScript
npx create-react-app turtlerocket-time-twister --template typescript

# Install required dependencies
npm install ical.js @types/ical.js

# Install testing utilities
npm install --save-dev @testing-library/react @testing-library/user-event
```

### Development
```bash
# Start development server
npm start

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Build for production
npm run build

# Run a single test file
npm test -- ScheduleDisplay.test.tsx

# Run tests in watch mode
npm test -- --watchAll
```

### Code Quality
```bash
# Type checking (if TypeScript is configured)
npx tsc --noEmit

# Format code (if prettier is installed)
npx prettier --write src/

# Lint code (if ESLint is configured)
npm run lint
```

## High-Level Architecture

### Core Concepts

1. **Energy-Based Scheduling**: Users define their energy levels (low/medium/high) for each hour from 8 AM to 8 PM. The optimizer matches cognitively demanding tasks to high-energy periods.

2. **Keyword Classification**: Events are classified by cognitive load based on keyword matching:
   - Heavy: meeting, review, presentation, interview, strategy, analysis
   - Light: lunch, break, coffee, gym, social, optional
   - Medium: Everything else (default)

3. **Test-Driven Development**: The blueprint emphasizes TDD - write tests first, then implementation.

### Component Architecture

```
src/

