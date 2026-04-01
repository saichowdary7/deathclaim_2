from fastapi import APIRouter, Depends, Request
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import get_db
from src.core.response import success_response
from src.schemas.party_schema import PartyCreate, PartyUpdate
from src.services.party_services import PartyService
from src.core.dependencies import get_current_user


router = APIRouter(prefix="/party", tags=["Party"])
service = PartyService()


@router.post("/", response_model=dict)
async def create_party(request: Request, payload: PartyCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await service.create_party(db, payload, user, request)
    return success_response(result, request)


@router.get("/", response_model=dict)
async def get_all_parties(request: Request, db: AsyncSession = Depends(get_db)):
    result = await service.get_all_parties(db, request)
    return success_response(result, request)


@router.get("/{party_id}", response_model=dict)
async def get_party(request: Request, party_id: int, db: AsyncSession = Depends(get_db)):
    result = await service.get_party_by_id(db, party_id, request)
    return success_response(result, request)


@router.patch("/{party_id}", response_model=dict)
async def update_party(request: Request, party_id: int, payload: PartyUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await service.update_party(db, party_id, payload, user, request)
    return success_response(result, request)


@router.delete("/{party_id}", response_model=dict)
async def delete_party(request: Request, party_id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await service.delete_party(db, party_id, user, request)
    return success_response(result, request)