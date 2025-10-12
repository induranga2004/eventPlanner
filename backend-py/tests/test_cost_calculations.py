from planner.service import (
    calculate_catering_cost,
    calculate_venue_cost,
    generate_dynamic_costs,
)


def test_calculate_venue_cost_uses_fixed_rental():
    data = {
        "name": "Shangri-La Ballroom",
        "avg_cost_lkr": 800_000,
        "capacity": 500,
    }

    cost = calculate_venue_cost(data, attendees=180, concept_id="A1")
    assert cost == 800_000


def test_calculate_venue_cost_per_person_pricing():
    data = {
        "name": "Outdoor Lawn",
        "per_person_cost_lkr": 5000,
    }

    cost = calculate_venue_cost(data, attendees=120, concept_id="A2")
    assert cost == 5000 * 120


def test_calculate_catering_cost_respects_pp_override():
    data = {
        "name": "Premium Catering Co",
        "pp_cost_lkr": 8500,
    }

    cost = calculate_catering_cost(data, attendees=150, concept_id="A1")
    assert cost == 8500 * 150


def test_generate_dynamic_costs_balances_budget():
    venue_data = {
        "name": "Shangri-La Ballroom",
        "avg_cost_lkr": 800_000,
        "capacity": 500,
    }
    catering_data = {
        "name": "Premium Catering Co",
        "pp_cost_lkr": 8_500,
    }

    breakdown = generate_dynamic_costs(
        total_budget_lkr=2_500_000,
        concept_id="A1",
        venue_data=venue_data,
        catering_data=catering_data,
        attendees=180,
    )

    total = sum(amount for _, amount in breakdown)
    assert total == 2_500_000

    # Ensure venue and catering reflect provided pricing
    venue_cost = dict(breakdown)["venue"]
    catering_cost = dict(breakdown)["catering"]
    assert venue_cost == 800_000
    assert catering_cost == 8_500 * 180
