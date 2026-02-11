import { db } from "@transc/db";
import { chatChannels, games, users } from "@transc/db/schema";
import {
  dbCreateUser,
  dbAddFriend,
  // dbAddSpectator,
  dbCreateGame,
  dbEndGame,
  dbStartGame,
  dbSendToGame,
  dbSendToGlobal,
  dbSendToFriend,
  dbGetGlobalMessages,
  dbGetGameMessages,
  dbGetFriendMessages,
} from "$lib/db-services";

async function clear() {
  try {
    const tablesMap = [users, games, chatChannels];

    await Promise.all(
      tablesMap.map(async (el) => {
        await db.delete(el);
      }),
    );

    console.log("✅ Database cleared");
  } catch (e) {
    console.error("❌ Error clearing database:", e);
    process.exit(1);
  }
}

await clear();

async function globalChat() {
  try {
    await db
      .insert(chatChannels)
      .values({
        id: 1,
        type: "global",
      })
      .returning();
  } catch (_err) {}
}

async function seed() {
  try {
    await globalChat();

    console.log("✅ Global chat created");

    // seed users
    const valentinId = await dbCreateUser({
      username: "Valentin",
      email: "valentin@transcender",
      password: "password",
    });

    const erwannId = await dbCreateUser({
      username: "Erwann",
      email: "erwann@transcender",
      password: "password",
    });

    const enzoId = await dbCreateUser({
      username: "Enzo",
      email: "enzo@transcender",
      password: "password",
    });

    const simonId = await dbCreateUser({
      username: "Simon",
      email: "simon@transcender",
      password: "password",
    });

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    // seed friendships
    await dbAddFriend(valentinId, erwannId);
    // await dbAddFriend(valentinId, enzoId);
    // await dbAddFriend(valentinId, simonId);
    // await dbAddFriend(erwannId, enzoId);

    // seed games
    const game1 = await dbCreateGame({
      whiteUserId: valentinId,
      blackUserId: erwannId,
      timeControlSeconds: 300,
      incrementSeconds: 30,
    });

    await dbStartGame(game1);

    await dbEndGame({
      gameId: game1,
      result: "white_win",
    });

    const game2 = await dbCreateGame({
      whiteUserId: valentinId,
      blackUserId: enzoId,
      timeControlSeconds: 300,
      incrementSeconds: 30,
    });

    await dbStartGame(game2);

    await dbEndGame({
      gameId: game2,
      result: "black_win",
    });

    const game3 = await dbCreateGame({
      whiteUserId: valentinId,
      blackUserId: simonId,
      timeControlSeconds: 300,
      incrementSeconds: 30,
    });

    await dbStartGame(game3);

    await dbEndGame({
      gameId: game3,
      result: "draw",
    });

    const game4 = await dbCreateGame({
      whiteUserId: erwannId,
      blackUserId: enzoId,
      timeControlSeconds: 300,
      incrementSeconds: 30,
    });

    await dbStartGame(game4);

    await dbEndGame({
      gameId: game4,
      result: "black_win",
    });

    const game5 = await dbCreateGame({
      whiteUserId: erwannId,
      blackUserId: simonId,
      timeControlSeconds: 300,
      incrementSeconds: 30,
    });

    await dbStartGame(game5);

    await dbEndGame({
      gameId: game5,
      result: "white_win",
    });

    const game6 = await dbCreateGame({
      whiteUserId: enzoId,
      blackUserId: simonId,
      timeControlSeconds: 300,
      incrementSeconds: 30,
    });

    await dbStartGame(game6);

    await dbEndGame({
      gameId: game6,
      result: "draw",
    });

    const game7 = await dbCreateGame({
      whiteUserId: valentinId,
      blackUserId: erwannId,
      timeControlSeconds: 300,
      incrementSeconds: 30,
    });

    await dbStartGame(game7);

    await dbEndGame({
      gameId: game7,
      result: "draw",
    });

    const game8 = await dbCreateGame({
      whiteUserId: erwannId,
      blackUserId: enzoId,
      timeControlSeconds: 300,
      incrementSeconds: 30,
    });

    // seed messages
    await dbSendToGlobal(valentinId, "Hello world!");
    await dbSendToGlobal(erwannId, "Hello everyone!");
    await dbSendToGlobal(enzoId, "Hello guys!");
    await dbSendToGlobal(simonId, "Hello there!");

    await dbSendToGame(erwannId, game8, "Hello Enzo!");
    await dbSendToGame(enzoId, game8, "Hello Erwann!");

    await dbSendToFriend(valentinId, erwannId, "Hello my friend Erwann!");
    await dbSendToFriend(erwannId, valentinId, "Hello my friend Valentin!");

    await dbSendToFriend(enzoId, erwannId, "Hello my friend Erwann!");
    await dbSendToFriend(erwannId, enzoId, "Hello my friend Enzo!");

    console.table(await dbGetGlobalMessages());
    console.table(await dbGetGameMessages(game8));
    console.table(await dbGetFriendMessages(valentinId, erwannId));

    console.log("✅ Database seeded");
  } catch (e) {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  }
}

await seed();

process.exit(0);
