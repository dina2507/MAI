import firstTimeVoter from "./first-time-voter.json";
import missingName from "./missing-name.json";
import movedCities from "./moved-cities.json";
import migrantWorker from "./migrant-worker.json";
import electionDay from "./election-day.json";
import seniorPwd from "./pwd-senior.json";

export const ALL_JOURNEYS = [
  firstTimeVoter,
  missingName,
  movedCities,
  migrantWorker,
  electionDay,
  seniorPwd,
];

export const JOURNEY_MAP = Object.fromEntries(
  ALL_JOURNEYS.map((j) => [j.id, j])
);

export function getJourney(id) {
  return JOURNEY_MAP[id] || null;
}

// Legacy export for backward compat
export const journeys = ALL_JOURNEYS;
