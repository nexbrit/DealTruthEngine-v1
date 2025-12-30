import anthropic
import json
from app.config import get_settings

settings = get_settings()

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)


async def call_claude(
    system_prompt: str, user_prompt: str, max_tokens: int = 4096
) -> str:
    """Make a call to Claude API"""
    message = client.messages.create(
        model=settings.claude_model,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return message.content[0].text


async def call_claude_json(
    system_prompt: str, user_prompt: str, max_tokens: int = 4096
) -> dict:
    """Make a call to Claude API and parse JSON response"""
    response = await call_claude(system_prompt, user_prompt, max_tokens)

    # Extract JSON from response (handle markdown code blocks)
    if "```json" in response:
        response = response.split("```json")[1].split("```")[0]
    elif "```" in response:
        response = response.split("```")[1].split("```")[0]

    return json.loads(response.strip())
