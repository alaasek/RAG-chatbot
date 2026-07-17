"""
LLM calls are isolated behind generate_answer() so swapping OpenAI for
Gemini/Ollama/local models only requires editing this file.
"""

from app.config import (
    LLM_PROVIDER,
    OPENAI_API_KEY,
    OPENAI_MODEL,
    OLLAMA_MODEL,
    OLLAMA_BASE_URL,
)

SYSTEM_PROMPT = """
You are KnowFlow AI, an intelligent assistant specialized in answering
questions using uploaded documents.

Rules:
1. Answer ONLY using the provided document context.
2. Never invent facts or information.
3. If the answer is not found in the context, reply:
   "I couldn't find that information in the uploaded documents."
4. Combine information from multiple sources naturally when appropriate.
5. Keep answers concise, accurate, and professional.
6. Never use outside knowledge.
7. Never fabricate page numbers or document names.
"""


def build_prompt(question: str, context_chunks: list[dict]) -> str:
    """Builds the prompt sent to the language model."""

    context = "\n\n".join(
        f"""
Document: {chunk['metadata']['filename']}
Page: {chunk['metadata'].get('page', '?')}

{chunk['text']}
"""
        for chunk in context_chunks
    )

    return f"""
========================
CONTEXT
========================

{context}

========================
QUESTION
========================

{question}

========================
INSTRUCTIONS
========================

Answer ONLY using the context above.

If the answer cannot be found in the provided documents, say:

"I couldn't find that information in the uploaded documents."

Do not guess.
"""


def generate_answer(question: str, context_chunks: list[dict]) -> str:
    """
    Generates an answer using the configured LLM.
    """

    if not context_chunks:
        return (
            "I couldn't find any relevant information because no documents "
            "have been indexed yet. Please upload a document first."
        )

    prompt = build_prompt(question, context_chunks)

    if LLM_PROVIDER.lower() == "ollama":
        return _generate_ollama(prompt)

    return _generate_openai(prompt)


def _generate_openai(prompt: str) -> str:
    """
    Generates an answer using OpenAI.
    """

    if not OPENAI_API_KEY:
        return (
            "[No OPENAI_API_KEY configured.\n"
            "Retrieval is working correctly, but answer generation is disabled.\n"
            "Add your API key to backend/.env.]"
        )

    try:
        from openai import OpenAI

        client = OpenAI(api_key=OPENAI_API_KEY)

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.2,
            max_tokens=500,
        )

        answer = response.choices[0].message.content

        if not answer:
            return "The model returned an empty response."

        return answer.strip()

    except Exception as e:
        return f"OpenAI Error: {str(e)}"


def _generate_ollama(prompt: str) -> str:
    """
    Generates an answer using a local Ollama model.
    """

    import requests

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": f"{SYSTEM_PROMPT}\n\n{prompt}",
                "stream": False,
            },
            timeout=120,
        )

        response.raise_for_status()

        return response.json().get("response", "").strip()

    except Exception as e:
        return f"Ollama Error: {str(e)}"