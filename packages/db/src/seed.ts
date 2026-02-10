import { db } from ".";
import {
  authSessions,
  chatChannels,
  friendships,
  games,
  gamesPlayers,
  gamesSpectators,
  users,
  usersStats,
} from "./schema";

// delete all data
await db.delete(friendships);
await db.delete(usersStats);
await db.delete(authSessions);
await db.delete(gamesPlayers);
await db.delete(gamesSpectators);
await db.delete(users);
await db.delete(games);

// seed chat

const chatChannel = await db
  .insert(chatChannels)
  .values({
    id: 1,
    type: "global",
  })
  .returning({ id: chatChannels.id });

// seed users

const valentinRes = await db
  .insert(users)
  .values({
    username: "Valentin",
    email: "valentin@transcender",
    password: "password",
  })
  .returning({ id: users.id })
  .then((res) => res.at(0)?.id);

if (!valentinRes) {
  process.exit(0);
}
const valentin = valentinRes;

const erwanRes = await db
  .insert(users)
  .values({
    username: "Erwan",
    email: "erwan@transcender",
    password: "password",
  })
  .returning({ id: users.id })
  .then((res) => res.at(0)?.id);

if (!erwanRes) {
  process.exit(0);
}
const erwann = erwanRes;

const enzoRes = await db
  .insert(users)
  .values({
    username: "Enzo",
    email: "enzo@transcender",
    password: "password",
  })
  .returning({ id: users.id })
  .then((res) => res.at(0)?.id);

if (!enzoRes) {
  process.exit(0);
}
const enzo = enzoRes;

const simonRes = await db
  .insert(users)
  .values({
    username: "Simon",
    email: "simon@transcender",
    password: "password",
  })
  .returning({ id: users.id })
  .then((res) => res.at(0)?.id);

if (!simonRes) {
  process.exit(0);
}
const simon = simonRes;

// seed friendships

await db.insert(friendships).values([
  {
    firstFriendId: Math.min(valentin, erwann),
    secondFriendId: Math.max(valentin, erwann),
  },
  {
    firstFriendId: Math.min(valentin, enzo),
    secondFriendId: Math.max(valentin, enzo),
  },
  {
    firstFriendId: Math.min(valentin, simon),
    secondFriendId: Math.max(valentin, simon),
  },
  {
    firstFriendId: Math.min(erwann, enzo),
    secondFriendId: Math.max(erwann, enzo),
  },
  {
    firstFriendId: Math.min(erwann, simon),
    secondFriendId: Math.max(erwann, simon),
  },
  {
    firstFriendId: Math.min(enzo, simon),
    secondFriendId: Math.max(enzo, simon),
  },
]);

// seed statistics

await db.insert(usersStats).values([
  { userId: valentin, wins: 1, losses: 2, draws: 1, currentElo: 1200 },
  { userId: erwann, wins: 2, losses: 0, draws: 2, currentElo: 1300 },
  { userId: enzo, wins: 1, losses: 1, draws: 0, currentElo: 800 },
  { userId: simon, wins: 3, losses: 1, draws: 0, currentElo: 1500 },
]);

// seed auth sessions
await db.insert(authSessions).values([
  {
    id: "c3eb3df7-62c2-4ee7-9f35-9335c6948e38",
    userId: valentin,
    createdAt: new Date(Date.now() - 2000 * 60 * 60 * 24),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  },
  {
    id: "76f15c39-9208-4571-a42e-0b3fc35cc507",
    userId: erwann,
    createdAt: new Date(Date.now() - 10000 * 60 * 60 * 24),
    expiresAt: new Date(Date.now() - 5000 * 60 * 60 * 24),
  },
  {
    id: "b2ea84d6-106b-428e-b7ee-d7654417bcca",
    userId: enzo,
    createdAt: new Date(Date.now() - 10000 * 60 * 60 * 24),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  },
  {
    id: "7ec5564e-ecb2-4700-adf8-2d9adafdcc06",
    userId: simon,
    createdAt: new Date(Date.now() - 3000 * 60 * 60 * 24),
    expiresAt: new Date(Date.now() + 3000 * 60 * 60 * 24),
  },
]);

// seed games

const gamesRes = await db
  .insert(games)
  .values([
    {
      status: "ongoing",
      timeControlSeconds: 1800,
      incrementSeconds: 300,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0",
      result: null,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 24 - 10000),
      startedAt: new Date(Date.now() - 1 * 60 * 60 * 24),
    },
    {
      status: "finished",
      timeControlSeconds: 1800,
      incrementSeconds: 300,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0",
      result: "white_win",
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 24 - 10000),
      startedAt: new Date(Date.now() - 15 * 60 * 60 * 24),
      endedAt: new Date(Date.now() - 5 * 60 * 60 * 24),
    },
    {
      status: "finished",
      timeControlSeconds: 1800,
      incrementSeconds: 300,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0",
      result: "draw",
      createdAt: new Date(Date.now() - 200 * 60 * 60 * 24 - 10000),
      startedAt: new Date(Date.now() - 150 * 60 * 60 * 24),
      endedAt: new Date(Date.now() - 50 * 60 * 60 * 24),
    },
    {
      status: "finished",
      timeControlSeconds: 1800,
      incrementSeconds: 300,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0",
      result: "black_win",
      createdAt: new Date(Date.now() - 2000 * 60 * 60 * 24 - 10000),
      startedAt: new Date(Date.now() - 1500 * 60 * 60 * 24),
      endedAt: new Date(Date.now() - 500 * 60 * 60 * 24),
    },
  ])
  .returning({ id: games.id });

// seed gamesPlayers

const [game1, game2, game3, _game4]: number[] = gamesRes.map((g) => g.id);

await db.insert(gamesPlayers).values([
  {
    gameId: game1 as number,
    userId: valentin,
    color: "white",
    eloBefore: 1200,
  },
  {
    gameId: game1 as number,
    userId: erwann,
    color: "black",
    eloBefore: 1300,
  },
  {
    gameId: game2 as number,
    userId: valentin,
    color: "black",
    eloBefore: 1300,
    eloAfter: 1200,
  },
  {
    gameId: game2 as number,
    userId: erwann,
    color: "white",
    eloBefore: 1200,
    eloAfter: 1300,
  },
  {
    gameId: game3 as number,
    userId: enzo,
    color: "white",
    eloBefore: 900,
    eloAfter: 800,
  },
  {
    gameId: game3 as number,
    userId: simon,
    color: "black",
    eloBefore: 1400,
    eloAfter: 1500,
  },
]);

// seed gamesSpectators

await db.insert(gamesSpectators).values([
  {
    gameId: game1 as number,
    userId: enzo,
  },
  {
    gameId: game1 as number,
    userId: simon,
  },
]);

console.log("Database seeded");
process.exit(0);
