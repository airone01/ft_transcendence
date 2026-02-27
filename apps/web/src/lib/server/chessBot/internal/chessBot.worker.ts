import { parentPort, workerData } from "worker_threads";
import { findBestMoveTimed } from "./bot/main";

const { state } = workerData;
const bestMove = findBestMoveTimed(state);

parentPort?.postMessage({ bestMove });
