from planner.service import calculate_venue_cost, generate_dynamic_costs


def test_calculate_venue_cost_uses_fixed_rental():
    data = {
        "name": "Shangri-La Ballroom",
        "avg_cost_lkr": 800_000,
        "capacity": 500,
    }

    cost = calculate_venue_cost(data, attendees=180, concept_id=None)
    assert cost == 800_000


def test_calculate_venue_cost_per_person_pricing():
    data = {
        "name": "Outdoor Lawn",
        "per_person_cost_lkr": 5000,
    }

    cost = calculate_venue_cost(data, attendees=120, concept_id=None)
    assert cost == 5000 * 120


def test_generate_dynamic_costs_balances_budget():
    venue_data = {
        "name": "Shangri-La Ballroom",
        "avg_cost_lkr": 800_000,
        "capacity": 500,
    }

    breakdown = generate_dynamic_costs(
        total_budget_lkr=2_500_000,
        concept_id=None,
        venue_data=venue_data,
        attendees=180,
    )

    total = sum(amount for _, amount in breakdown)
    assert total == 2_500_000

    # Ensure venue cost reflects provided pricing
    breakdown_dict = dict(breakdown)
    venue_cost = breakdown_dict["venue"]
    assert venue_cost == 800_000
    assert {"venue", "music", "lighting", "sound"}.issubset(breakdown_dict.keys())
