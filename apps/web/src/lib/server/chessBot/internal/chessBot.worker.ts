import { parentPort, workerData } from "worker_threads";
import { findBestMove } from "./bot/main";

const { state } = workerData;
const bestMove = findBestMove(state);

parentPort?.postMessage({ bestMove });
