const MINORITY_LIMIT = 0.05;
const MAJORITY_LIMIT = 0.75;
const PARTY_COUNT = 3;
const SEATS_COUNT = 100;

const parties = [];

for (let index = 0; index < PARTY_COUNT; index++) {
  parties.push({
    index,
    name: String.fromCharCode(index + 65),
    votes: 0,
    seats: 0,
  });
}
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

const rankedVotes = generatePermutations(parties.map((item) => item.index)).map(
  (item) => {
    const random = Math.floor(Math.random() * 1000);
    return { vote: item, count: random };
  },
);

const electorates = rankedVotes.reduce((a, v) => a + v.count, 0);

rankedVotes.map((item) => {
  parties[item.vote[0]].votes += item.count;
});

const overMajorityVotes = MAJORITY_LIMIT * electorates;
const underMinorityVotes = MINORITY_LIMIT * electorates;

const overMajorityParty = parties.filter(
  (item) => item.votes > overMajorityVotes,
);

const underMinorityParty = parties.filter(
  (item) => item.votes < underMinorityVotes,
);

console.log(underMinorityParty);
console.log(overMajorityParty);

if (overMajorityParty.length > 0) {
  console.log(overMajorityParty);
} else {
  console.log(overMajorityVotes, underMinorityVotes);
  console.log(electorates);
  console.log(rankedVotes);
  console.log(parties);
}
