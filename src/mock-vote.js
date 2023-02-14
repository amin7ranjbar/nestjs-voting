const MINORITY_LIMIT = 0.05;
const MAJORITY_LIMIT = 0.75;
const PARTY_COUNT = 4;
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

const rankedVotes = generatePermutations(parties.map((item) => item.name)).map(
  (item) => {
    const random = Math.floor(Math.random() * 100);
    return { vote: item, count: random };
  },
);

const ELECTORATE_COUNT = rankedVotes.reduce((a, v) => a + v.count, 0);

console.log(ELECTORATE_COUNT);
console.log(rankedVotes);
