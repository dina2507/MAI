import firstTimeVoter from "./first-time-voter.json";
import missingName from "./missing-name.json";
import movedCities from "./moved-cities.json";
import migrantWorker from "./migrant-worker.json";
import electionDay from "./election-day.json";
import pwdSenior from "./pwd-senior.json";

export const journeys = [
  firstTimeVoter,
  missingName,
  movedCities,
  migrantWorker,
  electionDay,
  pwdSenior
];

export function getJourney(id) {
  return journeys.find(j => j.id === id);
}
