from typing import Dict, Any
import pandas as pd
from app.ai.client import call_claude_json
from app.ai.prompts import COLUMN_MAPPING_SYSTEM, COLUMN_MAPPING_USER, SCHEMAS
from app.services.file_parser import get_sample_data


async def auto_map_columns(df: pd.DataFrame, suggested_type: str = None) -> Dict[str, Any]:
    """
    Use Claude to automatically map columns to standard schema
    """
    columns = df.columns.tolist()
    sample = get_sample_data(df)

    # Determine which schema to use
    if suggested_type and suggested_type in SCHEMAS:
        schema = SCHEMAS[suggested_type]
        evidence_type = suggested_type
    else:
        # Combine all schemas and let Claude figure it out
        schema = {k: v for schemas in SCHEMAS.values() for k, v in schemas.items()}
        evidence_type = "unknown"

    prompt = COLUMN_MAPPING_USER.format(
        file_type="data",
        columns="\n".join(f"- {col}" for col in columns),
        sample_data=sample,
        evidence_type=evidence_type,
        schema="\n".join(f"- {k}: {v}" for k, v in schema.items()),
    )

    result = await call_claude_json(COLUMN_MAPPING_SYSTEM, prompt)

    return result
