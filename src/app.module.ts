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
    const minorityLimit = 0.05;
    const majorityLimit = 0.55;
    const parties = ['a', 'b', 'c', 'd'];
    const partiesPro = [
      'a',
      'b',
      'c',
      'd',
      'b',
      'b',
      'c',
      'd',
      'b',
      'b',
      'd',
      'd',
      'b',
      'b',
      'c',
      'd',
      'b',
      'b',
      'd',
      'd',
      'b',
      'b',
      'c',
      'd',
      'b',
      'b',
      'b',
      'b',
      'b',
      'b',
      'b',
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
    const votesCount = parties.reduce(
      (a, v) => ({
        ...a,
        [v]: {
          orderVotes: 0,
          votes: 0,
          removeOverVotes: 0,
          removeUnderVotes: 0,
        },
      }),
      {},
    );
    for (const vote of votes) {
      const firstVote = vote[0];
      votesCount[firstVote].votes++;
    }

    const OverLimitParties = [];
    for (const key in votesCount) {
      const votesPrice = votesCount[key].votes / electorateCount;
      votesCount[key].votesPrice = votesPrice;
      if (votesPrice > majorityLimit) {
        OverLimitParties.push(key);
      }
    }
    let overVotes = 0;

    if (OverLimitParties.length > 0) {
      overVotes =
        votesCount[OverLimitParties[0]].votes - majorityLimit * electorateCount;
    }

    for (const vote of votes) {
      const removeOverVote = vote.find((v) => !OverLimitParties.includes(v));
      votesCount[removeOverVote].removeOverVotes++;
    }

    const underLimitParties = [];
    for (const key in votesCount) {
      if (OverLimitParties.includes(key)) {
        votesCount[key].removeOverVotes = majorityLimit * electorateCount;
      } else {
        const votesPrice = votesCount[key].removeOverVotes / overVotes;
        votesCount[key].removeOverVotes = votesCount[key].votes + votesPrice;
      }
      const removeOverVotesPrice =
        votesCount[key].removeOverVotes / electorateCount;
      votesCount[key].removeOverVotesPrice = removeOverVotesPrice;
      if (removeOverVotesPrice < minorityLimit) {
        underLimitParties.push(key);
      }
    }

    const UnderLimitVotes = underLimitParties.reduce(
      (a, v) => a + votesCount[v].removeOverVotes,
      0,
    );

    for (const vote of votes) {
      const removeUnderVote = vote.find(
        (v) => ![...OverLimitParties, ...underLimitParties].includes(v),
      );
      votesCount[removeUnderVote].removeUnderVotes++;
    }

    for (const key in votesCount) {
      if (OverLimitParties.includes(key)) {
        votesCount[key].removeUnderVotes = majorityLimit * electorateCount;
      } else if (underLimitParties.includes(key)) {
        votesCount[key].removeUnderVotes = 0;
      } else {
        const votesPrice = votesCount[key].removeUnderVotes / UnderLimitVotes;
        votesCount[key].removeUnderVotes =
          votesCount[key].removeOverVotes + votesPrice;
      }
      votesCount[key].removeUnderVotesPrice =
        votesCount[key].removeUnderVotes / electorateCount;
    }

    Logger.log(votesCount);

    const remainedPartiesByOrder = [];

    while (
      [...underLimitParties, ...remainedPartiesByOrder].length < parties.length
    ) {
      const orderedParties = parties
        .filter((party) => {
          return ![...underLimitParties, ...remainedPartiesByOrder].includes(
            party,
          );
        })
        .sort(
          (a, b) =>
            votesCount[a].removeUnderVotes - votesCount[b].removeUnderVotes,
        );
      remainedPartiesByOrder.unshift(orderedParties[0]);
    }

    Logger.log(remainedPartiesByOrder);

    Logger.log('** Voting Finished **');
  }
}
