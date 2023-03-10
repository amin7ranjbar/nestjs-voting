import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    const MINORITY_LIMIT = 0.05;
    const MAJORITY_LIMIT = 0.75;
    const PARTY_COUNT = 7;
    const ELECTORATE_COUNT = 10000;
    const SEATS_COUNT = 100;

    const parties = [];
    let partiesPro = [];

    for (let index = 0; index < PARTY_COUNT; index++) {
      const random = Math.floor(Math.random() * 1000);
      partiesPro = partiesPro.concat(Array(random).fill(index));

      parties.push({
        index,
        name: String.fromCharCode(index + 65),
        votes: 0,
        votesPercent: 0,
        removeOverVotes: 0,
        removeOverVotesPercent: 0,
        removeUnderVotes: 0,
        removeUnderVotesPercent: 0,
        order: 0,
        seats: 0,
      });
    }

    Logger.log('** Voting Started **');
    const votes = [];
    for (let index = 0; index < ELECTORATE_COUNT; index++) {
      const vote = partiesPro
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
      votes.push(Array.from(new Set(vote)));
    }

    for (const vote of votes) {
      const firstVote = vote[0];
      parties[firstVote].votes++;
    }

    const OverLimitParties = [];
    for (let index = 0; index < parties.length; index++) {
      const votesPercent = parties[index].votes / ELECTORATE_COUNT;
      parties[index].votesPercent = votesPercent;
      if (votesPercent > MAJORITY_LIMIT) {
        OverLimitParties.push(index);
      }
    }
    let overVotes = 0;

    if (OverLimitParties.length > 0) {
      overVotes =
        parties[OverLimitParties[0]].votes - MAJORITY_LIMIT * ELECTORATE_COUNT;
    }

    for (const vote of votes) {
      const removeOverVote = vote.find((v) => !OverLimitParties.includes(v));
      parties[removeOverVote].removeOverVotes++;
    }

    const underLimitParties = [];
    for (let index = 0; index < parties.length; index++) {
      if (OverLimitParties.includes(index)) {
        parties[index].removeOverVotes = MAJORITY_LIMIT * ELECTORATE_COUNT;
      } else {
        const votesPercent = overVotes
          ? parties[index].removeOverVotes / overVotes
          : 0;
        parties[index].removeOverVotes = parties[index].votes + votesPercent;
      }
      const removeOverVotesPercent =
        parties[index].removeOverVotes / ELECTORATE_COUNT;
      parties[index].removeOverVotesPercent = removeOverVotesPercent;
      if (removeOverVotesPercent < MINORITY_LIMIT) {
        underLimitParties.push(index);
      }
    }

    const UnderLimitVotes = underLimitParties.reduce(
      (a, v) => a + parties[v].removeOverVotes,
      0,
    );

    for (const vote of votes) {
      const removeUnderVote = vote.find(
        (v) => ![...OverLimitParties, ...underLimitParties].includes(v),
      );
      parties[removeUnderVote].removeUnderVotes++;
    }

    for (let index = 0; index < parties.length; index++) {
      if (OverLimitParties.includes(index)) {
        parties[index].removeUnderVotes = MAJORITY_LIMIT * ELECTORATE_COUNT;
      } else if (underLimitParties.includes(index)) {
        parties[index].removeUnderVotes = 0;
      } else {
        const votesPercent = UnderLimitVotes
          ? parties[index].removeUnderVotes / UnderLimitVotes
          : 0;
        parties[index].removeUnderVotes =
          parties[index].removeOverVotes + votesPercent;
      }
      const removeUnderVotesPercent =
        parties[index].removeUnderVotes / ELECTORATE_COUNT;
      parties[index].removeUnderVotesPercent = removeUnderVotesPercent;
      parties[index].seats = Math.floor(removeUnderVotesPercent * SEATS_COUNT);
    }

    const remainedPartiesByOrder = [];
    Logger.log('** Voting Finished **');

    Logger.log('** Results For Executive Branch: **');
    while (
      [...underLimitParties, ...remainedPartiesByOrder].length < parties.length
    ) {
      for (const party of parties) {
        party.order = 0;
      }
      for (const vote of votes) {
        const removeOverVote = vote.find(
          (v) => ![...underLimitParties, ...remainedPartiesByOrder].includes(v),
        );
        parties[removeOverVote].order++;
      }
      const orderedParties = parties
        .filter((party) => {
          return ![...underLimitParties, ...remainedPartiesByOrder].includes(
            party.index,
          );
        })
        .map((a) => a.index)
        .sort((a, b) => parties[a].order - parties[b].order);
      if (
        parties.length -
          [...underLimitParties, ...remainedPartiesByOrder].length ==
        2
      ) {
        const twoRemainedParties = parties
          .filter((party) => {
            return party.order > 0;
          })
          .sort((a, b) => b.order - a.order);
        const firstParty = (
          (twoRemainedParties[0].order / ELECTORATE_COUNT) *
          100
        ).toFixed(2);
        const secondParty = (
          (twoRemainedParties[1].order / ELECTORATE_COUNT) *
          100
        ).toFixed(2);

        Logger.log(
          `party ${twoRemainedParties[0].name} with ${firstParty} percent of votes wins Head Of Government position`,
        );
        Logger.log(
          `party ${twoRemainedParties[1].name} with ${secondParty} percent of votes wins Head Of State position`,
        );
      }
      remainedPartiesByOrder.unshift(orderedParties[0]);
    }

    const sumOfSeats = parties.reduce((a, v) => a + v.seats, 0);

    parties[remainedPartiesByOrder[0]].seats += SEATS_COUNT - sumOfSeats;
    Logger.log('** Results For Legislative Branch: **');
    parties
      .sort((a, b) => b.seats - a.seats)
      .map((item) => {
        if (item.seats > 0) {
          Logger.log(`party ${item.name} wins ${item.seats} seats`);
        } else {
          Logger.log(`party ${item.name} did not win any seats`);
        }
      });
    process.exit();
  }
}
