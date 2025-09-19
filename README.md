# JSEden Notebook: Interactive Creative Coding with JS-Eden in VS Code

[![Repository URL](https://img.shields.io/badge/GitHub-Repository-blue?style=flat-square&logo=github)](https://github.com/BenFielder1/JSEden-Notebook)

Welcome to JSEden Notebook, a VS Code extension that brings the power of JS-Eden, a fascinating creative coding environment, directly into your coding workflow. This extension allows you to create, edit, and execute JS-Eden code within interactive notebooks, visualize your creations in real-time, and explore the underlying data structures through an intuitive treeview. Unleash your creativity and explore the captivating world of JS-Eden, all within the comfort of your familiar VS Code environment!

## Project Description

JSEden Notebook is designed to provide a seamless and immersive experience for developers working with JS-Eden. It leverages VS Code's notebook interface to enable iterative development and experimentation. The extension consists of a custom notebook serializer, a dedicated JS-Eden kernel for code execution, and webviews for visualizing output and interacting with the environment. Whether you're a seasoned JS-Eden expert or just starting your coding journey, JSEden Notebook offers the tools you need to bring your ideas to life.

## Features

*   **Interactive Notebooks:** Create and manage JS-Eden notebooks directly within VS Code, taking advantage of the rich editing features and organizational capabilities.
*   **JS-Eden Kernel:** Execute JS-Eden code cells seamlessly with a dedicated kernel that handles the compilation and execution of your code.
*   **Real-time Visualization:** Launch multiple canvas webviews to visualize your JS-Eden creations in real-time. See your code come to life with every change you make.
*   **Variable Exploration with Treeview:** Gain insights into the internal state of your JS-Eden environment through a treeview that displays variables and their values.
*   **Interactive Variable Sliders:** Dynamically adjust variable values using intuitive sliders, allowing you to fine-tune your creations and explore different parameters in real-time.
*   **Mouse Interaction:**  Capture mouse movements and clicks within the canvas webview to create interactive experiences.

## Installation

1.  **Install VS Code:** Ensure you have Visual Studio Code installed on your system.
2.  **Clone the Repository:** Clone the JSEden Notebook repository to your local machine:

    ```bash
    git clone --recurse-submodules https://github.com/BenFielder1/JSEden-Notebook.git
    cd JSEden-Notebook
    ```

3.  **Install Dependencies:**  Open the cloned folder in VS Code and install the necessary dependencies:

    ```bash
    npm install
    ```

5.  **Run the Extension:** Press `F5` or go to the `Run and Debug` tab to run the extension in the VS Code Extension Development Host.

## Usage

1.  **Create a New Notebook:** In VS Code, create a new file with the `.notebook` extension.  This will automatically associate the file with the JSEden Notebook extension.
2.  **Add Code Cells:** Add code cells to your notebook and write JS-Eden code.  Make sure the cell type is set to `jseden`.
3.  **Execute Cells:** Execute code cells individually or all at once using the "Run" buttons provided by the notebook interface.
4.  **Launch Visualizations:** Use the following commands from the VS Code command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

    *   `JSEden Notebook: Launch Canvas`: Opens a webview to visualize your JS-Eden output.  You can launch multiple canvases!
    *   `JSEden Notebook: Launch Observables`: Opens a webview to view the JS-Eden variable tree.
    *   `JSEden Notebook: Launch Variable Sliders`: Opens a webview with sliders to control numerical variables in your JS-Eden environment.
5.  **Interact with the Canvas:** Move your mouse within the canvas webview to trigger events and see how your JS-Eden code responds. The canvas also listens for resize events to ensure proper rendering.

## Libraries Used

*   **VS Code API:**  Used extensively for integrating with the VS Code environment, including notebook support, webviews, and commands.
*   **fs (Node.js):**  Used for reading and writing files, such as loading initial JS-Eden code and HTML templates.
*   **path (Node.js):** Used for constructing file paths within the extension.
*   **util (Node.js):**  Used for text encoding and decoding.
*   **js-eden:** The core library for running JS-Eden code. The source is included directly in the project.


