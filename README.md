# Web-Based Drone Show Previewer

This project is a web-based viewer designed to simulate drone shows. It renders drone animations in a simulated environment, allowing users to visualize and interact with drone show designs. Based on `.skyc` drone show files, it provides a detailed and interactive 3D visualization, utilizing Three.js for rendering, dat.GUI for user interface controls, Stats.js for performance metrics, and JSZip for handling zip files.

## Features

- **Environment**: Visualize drone shows in a simulated yet realistic environment.
- **Interactivity**: Control and interact with the simulation using dat.GUI controls.
- **Performance Stats**: Monitor real-time performance with Stats.js.
- **File Handling**: Load and parse `.skyc` drone show files using JSZip.

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your system to use npm for installing the dependencies.

### Installation

Clone the repository and navigate to the project directory. Install the dependencies using npm. You can install all dependencies at once with `npm install`.

```bash
git clone <repository-url>
cd <project-directory>

# Install all dependencies
npm install
```
This will install Three.js for 3D rendering, vite for local development server, dat.GUI for graphical user interfaces, Stats.js for performance monitoring, and other necessary packages.

### Running the Application

Start the development server using one of the following commands:

```bash
npm start
# or
npx vite
```

The application will be available at `http://localhost:5173/` by default. Open this URL in your web browser to view and interact with the drone show simulation.

## Dependencies Documentation
For more information on the libraries and tools used in this project, refer to their official documentation:

- [Three.js Documentation](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)
- [dat.GUI GitHub Repository](https://github.com/dataarts/dat.gui)
- [Stats.js GitHub Repository](https://github.com/mrdoob/stats.js)
- [JSZip Documentation](https://stuk.github.io/jszip/)