// frontend/src/api/planner.js
import { withPlannerKey } from './plannerHeaders.js';
import { buildPlannerApiUrl } from '../config/api.js';

export async function createCampaign(name) {
  const res = await fetch(buildPlannerApiUrl('/campaigns'), {
    method: "POST",
    headers: withPlannerKey({"Content-Type":"application/json"}),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generatePlans(payload) {
  // First, create a campaign if it doesn't exist
  let campaignId = payload.campaign_id;
  
  try {
    // Try to get the campaign first
    const campaignRes = await fetch(buildPlannerApiUrl(`/campaigns/${campaignId}`), {
      headers: withPlannerKey(),
    });
    if (!campaignRes.ok) {
      // Campaign doesn't exist, create it
      console.log("Creating new campaign...");
      const campaign = await createCampaign(payload.event_name || "New Event");
      campaignId = campaign.id;
      payload.campaign_id = campaignId;
    }
  } catch (error) {
    console.log("Creating campaign due to error:", error.message);
    const campaign = await createCampaign(payload.event_name || "New Event");
    campaignId = campaign.id;
    payload.campaign_id = campaignId;
  }
  
  const url = buildPlannerApiUrl(`/campaigns/${campaignId}/planner/generate`);
  console.log("Calling API:", url);
  console.log("Payload:", payload);
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: withPlannerKey({"Content-Type":"application/json"}),
      body: JSON.stringify(payload),
    });
    
    console.log("Response status:", res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error:", errorText);
      throw new Error(errorText);
    }
    
    const data = await res.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export async function getResults(campaignId) {
  const res = await fetch(buildPlannerApiUrl(`/campaigns/${campaignId}/planner/results`), {
    headers: withPlannerKey(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function selectConcept(campaignId, conceptId) {
  const res = await fetch(buildPlannerApiUrl(`/campaigns/${campaignId}/planner/select`), {
    method: "POST",
    headers: withPlannerKey({"Content-Type":"application/json"}),
    body: JSON.stringify({ concept_id: conceptId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
