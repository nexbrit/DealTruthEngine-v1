import pandas as pd
from pathlib import Path
from typing import Tuple, Dict, Any
import chardet


def detect_encoding(file_path: str) -> str:
    """Detect file encoding"""
    with open(file_path, "rb") as f:
        result = chardet.detect(f.read(10000))
    return result["encoding"] or "utf-8"


def parse_file(file_path: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Parse CSV or Excel file and return DataFrame with metadata
    """
    path = Path(file_path)
    metadata = {
        "file_name": path.name,
        "file_type": path.suffix.lower(),
        "file_size": path.stat().st_size,
    }

    if path.suffix.lower() == ".csv":
        encoding = detect_encoding(file_path)
        df = pd.read_csv(file_path, encoding=encoding)
    elif path.suffix.lower() in [".xlsx", ".xls"]:
        df = pd.read_excel(file_path)
    else:
        raise ValueError(f"Unsupported file type: {path.suffix}")

    metadata["row_count"] = len(df)
    metadata["columns"] = df.columns.tolist()

    return df, metadata


def get_sample_data(df: pd.DataFrame, n_rows: int = 3) -> str:
    """Get sample rows as formatted string for prompts"""
    sample = df.head(n_rows)
    return sample.to_string()


def clean_dataframe(df: pd.DataFrame, column_mapping: Dict[str, str]) -> pd.DataFrame:
    """
    Apply column mapping and clean data types
    """
    # Rename columns based on mapping (standard_field -> original_column)
    # We need to reverse this so original_column -> standard_field
    reverse_mapping = {v: k for k, v in column_mapping.items() if v}
    df_clean = df.rename(columns=reverse_mapping)

    # Convert date columns
    date_columns = [
        "close_date",
        "created_date",
        "invoice_date",
        "due_date",
        "period",
        "last_activity_date",
    ]
    for col in date_columns:
        if col in df_clean.columns:
            df_clean[col] = pd.to_datetime(df_clean[col], errors="coerce")

    # Convert numeric columns
    numeric_columns = [
        "amount",
        "probability",
        "billable_hours",
        "available_hours",
        "balance",
        "utilisation_rate",
        "bill_rate",
        "cost_rate",
        "days_in_stage",
        "days_outstanding",
    ]
    for col in numeric_columns:
        if col in df_clean.columns:
            df_clean[col] = pd.to_numeric(df_clean[col], errors="coerce")

    return df_clean
