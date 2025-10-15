from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


class Concept(BaseModel):
	concept_id: str
	title: str
	tagline: str = ""
	venue_preference: Optional[str] = None
	music_focus: Optional[str] = None
	lighting_style: Optional[str] = None
	sound_profile: Optional[str] = None
	experience_notes: str = ""
	target_pp_lkr: int = 0
	cost_split: Dict[str, float] = Field(default_factory=dict)
	assumption_prompts: str = ""
	default_features: List[str] = Field(default_factory=list)
	providers: Dict[str, List[str]] = Field(default_factory=dict)
	catering_style: Optional[str] = None  # Backwards compatibility shim

	@field_validator("target_pp_lkr", mode="before")
	def _coerce_target(cls, value: Any) -> int:  # noqa: D417
		try:
			int_value = int(value)
			return max(int_value, 0)
		except (TypeError, ValueError):
			return 0

	@field_validator("cost_split", mode="before")
	def _coerce_split(cls, value: Any) -> Dict[str, float]:  # noqa: D417
		if not value:
			return {}
		if not isinstance(value, dict):
			return {}
		coerced: Dict[str, float] = {}
		for key, weight in value.items():
			try:
				coerced[str(key)] = float(weight)
			except (TypeError, ValueError):
				continue
		return coerced

	@field_validator("default_features", mode="before")
	def _ensure_features(cls, value: Any) -> List[str]:  # noqa: D417
		if not value:
			return []
		if isinstance(value, str):
			value = [value]
		return [str(item).strip() for item in value if str(item).strip()]

	def normalized_split(self) -> Dict[str, float]:
		total = sum(self.cost_split.values())
		if not total:
			return self.cost_split
		return {k: v / total for k, v in self.cost_split.items() if total}


