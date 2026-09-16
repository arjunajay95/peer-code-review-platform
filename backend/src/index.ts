import "dotenv/config";
import app from "./app.js";
import logger from "./config/logger.js";

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
