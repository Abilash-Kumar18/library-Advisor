from fastapi import APIRouter, Depends
from app.db.session import get_db
from app.services.embedding import embedding_service

router = APIRouter()


@router.post("/ask")
async def ask_question(text: str, anonymous: bool = True, db = Depends(get_db)):
    q_vec = embedding_service.generate(text)

    # Search for similar existing questions
    cursor = db.questions.find({})
    existing = await cursor.to_list(length=50)

    for ex in existing:
        if embedding_service.calculate_similarity(q_vec, ex["embedding"]) > 0.85:
            return {"msg": "Similar question found", "existing_answer": ex.get("answer")}

    # Else, save as new
    await db.questions.insert_one({
        "text": text,
        "embedding": q_vec,
        "is_anonymous": anonymous,
        "answer": None,
    })
    return {"msg": "Question posted successfully"}