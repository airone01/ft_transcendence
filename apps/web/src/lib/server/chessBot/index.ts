// To use bot without WebWorker, use this instead as `findBestMoveTimed(state)`
export { findBestMoveTimed } from "./internal/bot/main";

// Use this to use WebWorker
export { getBotMove } from "./internal/chessBot";

