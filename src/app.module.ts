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
    const PARTY_COUNT = 4;
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

    while (
      [...underLimitParties, ...remainedPartiesByOrder].length < parties.length
    ) {
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
      remainedPartiesByOrder.unshift(orderedParties[0]);
    }

    const sumOfSeats = parties.reduce((a, v) => a + v.seats, 0);

    parties[remainedPartiesByOrder[0]].seats += SEATS_COUNT - sumOfSeats;

    Logger.log('** Voting Finished **');

    Logger.log('** Results : **');
    remainedPartiesByOrder.map((item) => {
      Logger.log(`party ${parties[item].name} : ${parties[item].seats} seat`);
    });
  }
}
