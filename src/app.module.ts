import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { filter } from 'rxjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    const minorityLimit = 0.05;
    const majorityLimit = 0.55;
    const parties = [
      {
        index: 0,
        name: 'a',
        votes: 0,
        removeOverVotes: 0,
        removeUnderVotes: 0,
        removeUnderVotesPrice: 0,
        removeOverVotesPrice: 0,
        votesPrice: 0,
      },
      {
        index: 1,
        name: 'b',
        votes: 0,
        removeOverVotes: 0,
        removeUnderVotes: 0,
        removeUnderVotesPrice: 0,
        removeOverVotesPrice: 0,
        votesPrice: 0,
      },
      {
        index: 2,
        name: 'c',
        votes: 0,
        removeOverVotes: 0,
        removeUnderVotes: 0,
        removeUnderVotesPrice: 0,
        removeOverVotesPrice: 0,
        votesPrice: 0,
      },
      {
        index: 3,
        name: 'd',
        votes: 0,
        removeOverVotes: 0,
        removeUnderVotes: 0,
        removeUnderVotesPrice: 0,
        removeOverVotesPrice: 0,
        votesPrice: 0,
      },
    ];
    const partiesPro = [
      0, 1, 2, 3, 1, 1, 2, 3, 1, 1, 3, 3, 1, 1, 2, 3, 1, 1, 3, 3, 1, 1, 2, 3, 1,
      1, 1, 1, 1, 1, 1,
    ];
    const electorateCount = 1000;
    Logger.log('** Voting Started **');
    const votes = [];
    for (let index = 0; index < electorateCount; index++) {
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
    for (const key in parties) {
      const votesPrice = parties[key].votes / electorateCount;
      parties[key].votesPrice = votesPrice;
      if (votesPrice > majorityLimit) {
        OverLimitParties.push(parseInt(key));
      }
    }
    let overVotes = 0;

    if (OverLimitParties.length > 0) {
      overVotes =
        parties[OverLimitParties[0]].votes - majorityLimit * electorateCount;
    }

    for (const vote of votes) {
      const removeOverVote = vote.find((v) => !OverLimitParties.includes(v));
      parties[removeOverVote].removeOverVotes++;
    }

    const underLimitParties = [];
    for (const key in parties) {
      if (OverLimitParties.includes(key)) {
        parties[key].removeOverVotes = majorityLimit * electorateCount;
      } else {
        const votesPrice = parties[key].removeOverVotes / overVotes;
        parties[key].removeOverVotes = parties[key].votes + votesPrice;
      }
      const removeOverVotesPrice =
        parties[key].removeOverVotes / electorateCount;
      parties[key].removeOverVotesPrice = removeOverVotesPrice;
      if (removeOverVotesPrice < minorityLimit) {
        underLimitParties.push(parseInt(key));
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

    for (const key in parties) {
      if (OverLimitParties.includes(key)) {
        parties[key].removeUnderVotes = majorityLimit * electorateCount;
      } else if (underLimitParties.includes(key)) {
        parties[key].removeUnderVotes = 0;
      } else {
        const votesPrice = parties[key].removeUnderVotes / UnderLimitVotes;
        parties[key].removeUnderVotes =
          parties[key].removeOverVotes + votesPrice;
      }
      parties[key].removeUnderVotesPrice =
        parties[key].removeUnderVotes / electorateCount;
    }

    Logger.log(parties);

    const remainedPartiesByOrder = [];

    while (
      [...underLimitParties, ...remainedPartiesByOrder].length < parties.length
    ) {
      const orderedParties = parties
        .filter((party) => {
          return ![...underLimitParties, ...remainedPartiesByOrder].includes(
            party.index,
          );
        })
        .map((a) => a.index)
        .sort(
          (a, b) => parties[a].removeUnderVotes - parties[b].removeUnderVotes,
        );
      remainedPartiesByOrder.unshift(orderedParties[0]);
    }

    Logger.log(remainedPartiesByOrder.map((item) => parties[item].name));

    Logger.log('** Voting Finished **');
  }
}
