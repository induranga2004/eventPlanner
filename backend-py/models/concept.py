from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field, validator


class Concept(BaseModel):
	concept_id: str
	title: str
	tagline: str = ""
	venue_preference: Optional[str] = None
	catering_style: Optional[str] = None
	experience_notes: str = ""
	target_pp_lkr: int = 0
	cost_split: Dict[str, float] = Field(default_factory=dict)
	assumption_prompts: str = ""
	default_features: List[str] = Field(default_factory=list)

	@validator("target_pp_lkr", pre=True, always=True)
	def _coerce_target(cls, value: int) -> int:  # noqa: D417
		try:
			int_value = int(value)
			return max(int_value, 0)
		except (TypeError, ValueError):
			return 0

	@validator("cost_split", pre=True, always=True)
	def _coerce_split(cls, value: Dict[str, float]) -> Dict[str, float]:  # noqa: D417
		if not value:
			return {}
		coerced: Dict[str, float] = {}
		for key, weight in value.items():
			try:
				coerced[str(key)] = float(weight)
			except (TypeError, ValueError):
				continue
		return coerced

	@validator("default_features", pre=True, always=True)
	def _ensure_features(cls, value: List[str]) -> List[str]:  # noqa: D417
		if not value:
			return []
		return [str(item).strip() for item in value if str(item).strip()]

	def normalized_split(self) -> Dict[str, float]:
		total = sum(self.cost_split.values())
		if not total:
			return self.cost_split
		return {k: v / total for k, v in self.cost_split.items() if total}


