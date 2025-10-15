import { getPlannerHeaders } from '../config/api.js';

export function withPlannerKey(headers = {}) {
  return getPlannerHeaders(headers);
}

export { getPlannerHeaders };
