# Recipe App

A modern, minimalistic React + TypeScript application scaffolded with Vite. This project serves as a frontend interface for interacting with the [Recipe API](https://github.com/codingwitharmand/recipe-api), providing users with a seamless experience to browse and manage recipes.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **React 18** with **TypeScript** for robust and type-safe UI development.
- **Vite** for fast and efficient development and build processes.
- **ESLint** configured with recommended rules for code quality and consistency.
- Ready for integration with the [Recipe API](https://github.com/codingwitharmand/recipe-api) for full-stack functionality.

## Tech Stack

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [ESLint](https://eslint.org/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or above)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/codingwitharmand/recipe-app.git
   cd recipe-app
   ```

2. **Install dependencies:**

   Using npm:

   ```bash
   npm install
   ```

   Or using Yarn:

   ```bash
   yarn install
   ```

3. **Start the development server:**

   Using npm:

   ```bash
   npm run dev
   ```

   Or using Yarn:

   ```bash
   yarn dev
   ```

   The application will be available at `http://localhost:5173`.

## Available Scripts

- `dev`: Starts the development server with hot module replacement.
- `build`: Builds the application for production.
- `preview`: Serves the production build locally.
- `lint`: Runs ESLint to analyze code for potential issues.

## Project Structure

```
recipe-app/
├── public/               # Static assets
├── src/                  # Source code
│   ├── components/       # Reusable components
│   ├── pages/            # Page components
│   ├── App.tsx           # Root component
│   └── main.tsx          # Application entry point
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a new branch:**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit your changes:**

   ```bash
   git commit -m 'Add YourFeature'
   ```

4. **Push to the branch:**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a pull request**

## License

This project is not under the license.