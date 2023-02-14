const MINORITY_LIMIT = 0.05;
const MAJORITY_LIMIT = 0.75;
const PARTY_COUNT = 3;
const SEATS_COUNT = 100;

const parties = [];
let overMajorityParty = [];
const testData = [
  { vote: [0, 1, 2], count: 425889 },
  { vote: [0, 2, 1], count: 77047 },
  { vote: [1, 0, 2], count: 11737 },
  { vote: [1, 2, 0], count: 31 },
  { vote: [2, 0, 1], count: 86142 },
  { vote: [2, 1, 0], count: 69243 },
];

for (let index = 0; index < PARTY_COUNT; index++) {
  parties.push({
    index,
    name: String.fromCharCode(index + 65),
    votes: 0,
    seats: 0,
    percent: 0,
  });
}

const deletedParties = [];

const rankedVotes = testData
  ? testData
  : generatePermutations(parties.map((item) => item.index)).map((item) => {
      const random = Math.floor(Math.random() * 100000);
      return { vote: item, count: random };
    });

const electorates = rankedVotes.reduce((a, v) => a + v.count, 0);

resetVotes();

const overMajorityVotes = MAJORITY_LIMIT * electorates;
const underMinorityVotes = MINORITY_LIMIT * electorates;

overMajorityParty = parties.filter((item) => item.votes > overMajorityVotes);

console.log(overMajorityParty);
console.log(overMajorityVotes, underMinorityVotes);
console.log(electorates);

console.log(parties);

overMajorityParty.map((item) => deletedParties.push(item.index));
resetVotes();
console.log(parties);

const underMinorityParty = parties.filter(
  (item) => parseFloat(item.percent) < MINORITY_LIMIT,
);

underMinorityParty.map((item) => deletedParties.push(item.index));
resetVotes();
console.log(parties);

function generatePermutations(list, size = list.length) {
  if (size > list.length) return [];
  else if (size == 1) return list.map((d) => [d]);
  return list.flatMap((d) =>
    generatePermutations(
      list.filter((a) => a !== d),
      size - 1,
    ).map((item) => [d, ...item]),
  );
}

function resetVotes() {
  for (const party of parties) {
    party.votes = 0;
  }
  rankedVotes.map((item) => {
    for (const vote of item.vote) {
      if (deletedParties.includes(vote)) {
        continue;
      } else {
        parties[vote].votes += item.count;
        break;
      }
    }
  });
  for (const party of parties) {
    if (overMajorityParty.length > 0) {
      party.percent = (party.votes / electorates / 4).toFixed(2);
    } else {
      party.percent = (party.votes / electorates).toFixed(2);
    }
  }
}
