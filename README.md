# <img src="./logo.png" alt="FireStriker Logo" width="40" style="vertical-align: middle"> FireStriker - Spark Pipeline Visualizer

FireStriker is a powerful, interactive web application for designing, visualizing, and generating code for Apache Spark SQL data pipelines. It transforms a complex JSON-based protocol into an intuitive, graph-based DAG (Directed Acyclic Graph), bridging the gap between pipeline design and implementation.

## Key Features

-   **Visual DAG Editor**: A dynamic, drag-and-drop interface to build and modify Spark pipelines. Simply drag steps from the toolbox onto the canvas.
-   **Interactive Inspector**: Click on any node (step) in the graph to view its detailed configuration, including ID, type, inputs, and parameters, in a convenient side panel.
-   **Built-in Protocol Viewer**: Easily access and review the underlying JSON protocol definition and its JSON schema directly within the application.
-   **AI-Powered Code Generation**: With a single click, leverage the power of the Gemini API to translate your entire visual pipeline into a complete, runnable, and production-ready Scala script for Apache Spark.

## The Pipeline Protocol

FireStriker is built around a standardized, graph-based JSON protocol for defining Spark pipelines. Each pipeline is a collection of `steps`, where each step represents a specific operation.

**Core Step Types:**
-   `Read`: Ingest data from various sources like CSV, Parquet, etc.
-   `Transform`: Apply transformations like renaming columns, dropping columns, or custom expressions.
-   `Aggregate`: Perform group-by and aggregation operations.
-   `Join`: Combine two datasets based on specified conditions.
-   `SQL`: Execute arbitrary Spark SQL queries.
-   `Write`: Save the final output to a data sink.

You can view the full protocol specification and JSON Schema in the "Protocol Definition" and "JSON Schema" tabs in the app.

## How to Use

1.  **Explore the Example**: The application loads with a pre-built example pipeline to demonstrate its capabilities.
2.  **Inspect Nodes**: Click on any node in the graph. The right-hand panel will display its detailed properties.
3.  **Build Your Pipeline**: Drag new step nodes from the "Toolbox" on the left onto the canvas to design your own pipeline.
4.  **Generate Scala Code**: Once your pipeline design is complete, click the **"Generate Code"** button in the toolbox. A modal will appear with the complete Spark Scala script, ready to be copied and executed.

## Technology Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **Visualization**: React Flow (@xyflow/react)
-   **Code Generation**: Google Gemini API (@google/genai)
-   **Syntax Highlighting**: react-syntax-highlighter
