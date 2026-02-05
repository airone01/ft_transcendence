import { and, eq, ne, or } from "drizzle-orm";
import { db } from "@transc/db";
import { games, gamesPlayers, usersStats } from "@transc/db/schema";
import type { CreateGameInput, EndGameInput } from "$lib/db-services";

const getElo = async (userId: number) => {
  return await db
    .select({ elo: usersStats.currentElo })
    .from(usersStats)
    .where(eq(usersStats.userId, userId));
};

export async function dbCreateGame(gameInput: CreateGameInput) {
  try {
    const [game] = await db
      .insert(games)
      .values({
        timeControlSeconds: gameInput.timeControlSeconds,
        incrementSeconds: gameInput.incrementSeconds,
        createdAt: new Date(),
      })
      .returning();

    if (!game) throw new Error("DB: Game not created");

    const [whitePlayerElo] = await getElo(gameInput.whiteUserId);
    const [blackPlayerElo] = await getElo(gameInput.blackUserId);

    if (!whitePlayerElo || !blackPlayerElo)
      throw new Error("DB: Player elo not found");

    const [whitePlayer] = await db
      .insert(gamesPlayers)
      .values({
        gameId: game.id,
        userId: gameInput.whiteUserId,
        color: "white",
        eloBefore: whitePlayerElo.elo,
      })
      .returning();

    const [blackPlayer] = await db
      .insert(gamesPlayers)
      .values({
        gameId: game.id,
        userId: gameInput.blackUserId,
        color: "black",
        eloBefore: blackPlayerElo.elo,
      })
      .returning();

    if (!whitePlayer || !blackPlayer)
      throw new Error("DB: White or black player not added");

    return game.id;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function dbStartGame(gameId: number) {
  try {
    const [game] = await db
      .update(games)
      .set({
        status: "ongoing",
        startedAt: new Date(),
      })
      .where(eq(games.id, gameId))
      .returning();

    if (!game) throw new Error("DB: Game not started");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function dbGetGame(gameId: number) {
  try {
    const [game] = await db.select().from(games).where(eq(games.id, gameId));

    return game;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function dbUpdateGame(gameId: number, newFen: string) {
  try {
    const [game] = await db
      .update(games)
      .set({
        fen: newFen,
      })
      .where(eq(games.id, gameId))
      .returning();

    if (!game) throw new Error("DB: Game not updated");

    return game;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function EloRating(
  rA: number,
  rB: number,
  k: number,
  result: string,
): [number, number] {
  const eA = 1.0 / (1 + Math.pow(10, (rB - rA) / 400.0));
  const eB = 1.0 / (1 + Math.pow(10, (rA - rB) / 400.0));

  let outcome: number = 0.5;
  if (result === "A") outcome = 1;
  else if (result === "B") outcome = 0;

  return [
    Math.round(rA + k * (outcome - eA)),
    Math.round(rB + k * (1 - outcome - eB)),
  ];
}

export async function dbEndGame(endGameInput: EndGameInput) {
  try {
    const [game] = await db
      .update(games)
      .set({
        status: "finished",
        result: endGameInput.result,
        endedAt: new Date(),
      })
      .where(eq(games.id, endGameInput.gameId))
      .returning();

    if (!game) throw new Error("DB: Game not ended");

    const [gamePlayer1, gamePlayer2] = await db
      .select()
      .from(gamesPlayers)
      .where(eq(gamesPlayers.gameId, endGameInput.gameId))
      .limit(2);

    if (!gamePlayer1 || !gamePlayer2) throw new Error("DB: Game not found");

    let result: string = "draw";
    if (endGameInput.result === "white_win")
      result = gamePlayer1.color === "white" ? "A" : "B";
    else if (endGameInput.result === "black_win")
      result = gamePlayer1.color === "black" ? "A" : "B";

    const [newPlayer1Elo, newPlayer2Elo] = EloRating(
      gamePlayer1.eloBefore,
      gamePlayer2.eloBefore,
      30,
      result,
    );

    const gamePlayer1Updated = await db
      .update(gamesPlayers)
      .set({
        eloAfter: newPlayer1Elo,
      })
      .where(
        and(
          eq(gamesPlayers.gameId, game.id),
          eq(gamesPlayers.userId, gamePlayer1.userId),
        ),
      )
      .returning();

    const gamePlayer2Updated = await db
      .update(gamesPlayers)
      .set({
        eloAfter: newPlayer2Elo,
      })
      .where(
        and(
          eq(gamesPlayers.gameId, game.id),
          eq(gamesPlayers.userId, gamePlayer2.userId),
        ),
      )
      .returning();

    if (!gamePlayer1Updated || !gamePlayer2Updated)
      throw new Error("DB: Game player not updated");

    const user1Updated = await db
      .update(usersStats)
      .set({
        currentElo: newPlayer1Elo,
        updatedAt: new Date(),
      })
      .where(eq(usersStats.userId, gamePlayer1.userId))
      .returning();

    const user2Updated = await db
      .update(usersStats)
      .set({
        currentElo: newPlayer2Elo,
        updatedAt: new Date(),
      })
      .where(eq(usersStats.userId, gamePlayer2.userId))
      .returning();

    if (!user1Updated || !user2Updated) throw new Error("DB: User not updated");
  } catch (err) {
    // console.error(err);
    throw err;
  }
}
