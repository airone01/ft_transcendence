#!/usr/bin/env bun
import { findBestMoveTimed } from "./bot/main.js"; 
import type { GameState } from "$lib/chess";

let input = "";

process.stdin.setEncoding("utf8");

process.stdin.on("data", (chunk) => {
  input += chunk;
});

process.stdin.on("end", () => {
  try {
    const state: GameState = JSON.parse(input);
    const bestMove = findBestMoveTimed(state);
    
    process.stdout.write(JSON.stringify(bestMove));
    process.exit(0);
  } catch (error) {
    console.error("Bot process error:", error);
    process.exit(1);
  }
});