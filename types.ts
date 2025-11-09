
export enum StepType {
  Read = "Read",
  Transform = "Transform",
  Aggregate = "Aggregate",
  Join = "Join",
  SQL = "SQL",
  Write = "Write",
}

export interface ReadParams {
  format: string;
  path: string;
  options?: Record<string, string>;
  schema?: string | object;
}

export type TransformOperation = 
  | { type: "rename"; old_name: string; new_name: string }
  | { type: "replace_nulls"; col: string; value: string | number }
  | { type: "drop_columns"; cols: string[] }
  | { type: "change_format"; col: string; data_type: string }
  | { type: "custom_expression"; col_name: string; expression: string };

export interface TransformParams {
  operations: TransformOperation[];
}

export interface AggregationExpression {
  col_name: string;
  expression: string;
}

export interface AggregateParams {
  group_by_cols: string[];
  agg_expressions: AggregationExpression[];
}

export interface JoinParams {
  join_type: "inner" | "left_outer" | "right_outer" | "full_outer";
  join_conditions: string[];
}

export interface SQLParams {
  query: string;
}

export interface WriteParams {
  format: string;
  path: string;
  options?: Record<string, string>;
  partition_by?: string[];
}

export interface Step {
  id: string;
  type: StepType;
  inputs: string[];
  params: ReadParams | TransformParams | AggregateParams | JoinParams | SQLParams | WriteParams;
}
