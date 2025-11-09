
export const PROTOCOL_DEFINITION_MD_STRING = `
# Spark Pipeline JSON Protocol Definition

This document defines a standardized, graph-based (DAG) JSON protocol for defining and executing Apache Spark SQL data pipelines.

## Root Object

The root of the JSON must be an object with a single key, \`steps\`, which is an array of step objects.

## Step Object

Each object in the \`steps\` array represents a node in the pipeline's graph and must contain the following properties:

-   **id (string, required):** A unique identifier for this step. Downstream steps use this ID to reference this step's output DataFrame.
-   **type (string, required):** The operation to perform. Must be one of: \`Read\`, \`Transform\`, \`Aggregate\`, \`Join\`, \`SQL\`, \`Write\`.
-   **inputs (array of strings, required):** A list of \`id\`s from previous steps that this step consumes. For a \`Read\` step, this array must be empty.
-   **params (object, required):** A flexible object containing the specific parameters required for the given \`type\`.

---

## Parameter Definitions by Type

### type: "Read"

-   **inputs:** \`[]\` (Must be empty)
-   **params:**
    -   \`format\` (string, required): The data source format (e.g., "csv", "parquet", "json").
    -   \`path\` (string, required): The URI for the data source (e.g., "s3://bucket/file.csv").
    -   \`options\` (object, optional): A key-value map of Spark reader options (e.g., \`{"header": "true"}\`).
    -   \`schema\` (string or object, optional): A user-defined DDL string or a StructType in JSON format.

### type: "Transform"

-   **inputs:** \`["id_of_source_dataset"]\` (Must have exactly one input)
-   **params:**
    -   \`operations\` (array of objects, required): An array of transformation operations.
        -   \`{ "type": "rename", "old_name": "col_a", "new_name": "col_b" }\`
        -   \`{ "type": "replace_nulls", "col": "col_c", "value": "0" }\`
        -   \`{ "type": "drop_columns", "cols": ["col_x", "col_y"] }\`
        -   \`{ "type": "change_format", "col": "col_d", "data_type": "timestamp" }\`
        -   \`{ "type": "custom_expression", "col_name": "new_or_existing_col", "expression": "..." }\`

### type: "Aggregate"

-   **inputs:** \`["id_of_source_dataset"]\` (Must have exactly one input)
-   **params:**
    -   \`group_by_cols\` (array of strings, required): Columns to group by.
    -   \`agg_expressions\` (array of objects, required): Aggregation expressions to compute.
        -   Example: \`[{"col_name": "total_sales", "expression": "SUM(sales)"}]\`

### type: "Join"

-   **inputs:** \`["id_of_left_dataset", "id_of_right_dataset"]\` (Must have exactly two inputs)
-   **params:**
    -   \`join_type\` (string, required): One of "inner", "left_outer", "right_outer", "full_outer".
    -   \`join_conditions\` (array of strings, required): SQL-style join conditions (e.g., \`["left.customer_id == right.cust_id"]\`).

### type: "SQL"

-   **inputs:** \`["id_1", "id_2", ...]\` (Can have one or more inputs). Each input DataFrame is registered as a temporary view with its \`id\` as the name.
-   **params:**
    -   \`query\` (string, required): The Spark SQL query to execute.

### type: "Write"

-   **inputs:** \`["id_of_dataset_to_write"]\` (Must have exactly one input)
-   **params:**
    -   \`format\` (string, required): The data sink format (e.g., "parquet").
    -   \`path\` (string, required): The output URI (e.g., "s3://output-bucket/final_data").
    -   \`options\` (object, optional): A key-value map of Spark writer options (e.g., \`{"mode": "override"}\`).
    -   \`partition_by\` (array of strings, optional): Columns to partition the output by.
`;

export const JSON_SCHEMA_STRING = `
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Spark Pipeline Protocol",
  "description": "A JSON schema for defining a Spark SQL data pipeline.",
  "type": "object",
  "properties": {
    "steps": {
      "type": "array",
      "description": "An array of pipeline steps, forming a Directed Acyclic Graph (DAG).",
      "items": {
        "$ref": "#/definitions/step"
      }
    }
  },
  "required": ["steps"],
  "definitions": {
    "step": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "pattern": "^[a-zA-Z0-9_]+$" },
        "type": { "enum": ["Read", "Transform", "Aggregate", "Join", "SQL", "Write"] },
        "inputs": { "type": "array", "items": { "type": "string" } },
        "params": { "type": "object" }
      },
      "required": ["id", "type", "inputs", "params"],
      "oneOf": [
        { "$ref": "#/definitions/readStep" },
        { "$ref": "#/definitions/transformStep" },
        { "$ref": "#/definitions/aggregateStep" },
        { "$ref": "#/definitions/joinStep" },
        { "$ref": "#/definitions/sqlStep" },
        { "$ref": "#/definitions/writeStep" }
      ]
    },
    "readStep": {
      "properties": {
        "type": { "const": "Read" },
        "inputs": { "maxItems": 0 },
        "params": {
          "type": "object",
          "properties": {
            "format": { "type": "string" },
            "path": { "type": "string" },
            "options": { "type": "object" },
            "schema": { "oneOf": [{ "type": "string" }, { "type": "object" }] }
          },
          "required": ["format", "path"]
        }
      }
    },
    "transformStep": {
      "properties": {
        "type": { "const": "Transform" },
        "inputs": { "minItems": 1, "maxItems": 1 },
        "params": {
          "type": "object",
          "properties": {
            "operations": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": { "type": { "type": "string" } },
                "required": ["type"]
              }
            }
          },
          "required": ["operations"]
        }
      }
    },
    "aggregateStep": {
      "properties": {
        "type": { "const": "Aggregate" },
        "inputs": { "minItems": 1, "maxItems": 1 },
        "params": {
          "type": "object",
          "properties": {
            "group_by_cols": { "type": "array", "items": { "type": "string" } },
            "agg_expressions": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "col_name": { "type": "string" },
                  "expression": { "type": "string" }
                },
                "required": ["col_name", "expression"]
              }
            }
          },
          "required": ["group_by_cols", "agg_expressions"]
        }
      }
    },
    "joinStep": {
      "properties": {
        "type": { "const": "Join" },
        "inputs": { "minItems": 2, "maxItems": 2 },
        "params": {
          "type": "object",
          "properties": {
            "join_type": { "enum": ["inner", "left_outer", "right_outer", "full_outer"] },
            "join_conditions": { "type": "array", "items": { "type": "string" } }
          },
          "required": ["join_type", "join_conditions"]
        }
      }
    },
    "sqlStep": {
      "properties": {
        "type": { "const": "SQL" },
        "inputs": { "minItems": 1 },
        "params": {
          "type": "object",
          "properties": {
            "query": { "type": "string" }
          },
          "required": ["query"]
        }
      }
    },
    "writeStep": {
      "properties": {
        "type": { "const": "Write" },
        "inputs": { "minItems": 1, "maxItems": 1 },
        "params": {
          "type": "object",
          "properties": {
            "format": { "type": "string" },
            "path": { "type": "string" },
            "options": { "type": "object" },
            "partition_by": { "type": "array", "items": { "type": "string" } }
          },
          "required": ["format", "path"]
        }
      }
    }
  }
}
`;

export const EXAMPLE_PIPELINE_JSON_STRING = `
{
  "steps": [
    {
      "id": "read_cust",
      "type": "Read",
      "inputs": [],
      "params": {
        "format": "csv",
        "path": "s3://my-bucket/data/customers.csv",
        "options": {
          "header": "true",
          "inferSchema": "true"
        }
      }
    },
    {
      "id": "read_orders",
      "type": "Read",
      "inputs": [],
      "params": {
        "format": "parquet",
        "path": "/data/orders.parquet"
      }
    },
    {
      "id": "clean_cust",
      "type": "Transform",
      "inputs": ["read_cust"],
      "params": {
        "operations": [
          { "type": "rename", "old_name": "cust_id", "new_name": "customer_id" },
          { "type": "replace_nulls", "col": "first_name", "value": "Unknown" }
        ]
      }
    },
    {
      "id": "joined_data",
      "type": "Join",
      "inputs": ["clean_cust", "read_orders"],
      "params": {
        "join_type": "inner",
        "join_conditions": ["clean_cust.customer_id == read_orders.customer_id"]
      }
    },
    {
      "id": "filtered_data",
      "type": "SQL",
      "inputs": ["joined_data"],
      "params": {
        "query": "SELECT order_id, order_date, amount, first_name, last_name FROM joined_data WHERE amount > 100"
      }
    },
    {
      "id": "aggregated_sales",
      "type": "Aggregate",
      "inputs": ["filtered_data"],
      "params": {
        "group_by_cols": ["first_name", "last_name"],
        "agg_expressions": [
          { "col_name": "total_spent", "expression": "SUM(amount)" },
          { "col_name": "order_count", "expression": "COUNT(order_id)" }
        ]
      }
    },
    {
      "id": "write_output",
      "type": "Write",
      "inputs": ["filtered_data"],
      "params": {
        "format": "parquet",
        "path": "s3://output-bucket/final_data",
        "options": {
          "mode": "overwrite"
        }
      }
    }
  ]
}
`;
