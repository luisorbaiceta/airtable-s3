const fastify = require("fastify");
const dotenv = require("dotenv");
const s3 = require("./s3.js");

// Load environment variables from .env file
dotenv.config();

const port = process.env.PORT || 3000;
const host = "RENDER" in process.env ? `0.0.0.0` : `localhost`;
const server = fastify({
  logger: true,
});

server.get("/", async (request, reply) => {
  const { key } = request.query;

  // Check if the provided key matches the environment variable
  if (key !== process.env.KEY) {
    reply.code(401).send("Unauthorized");
    return;
  }

  try {
    // Execute the synchronize function from s3.js
    await s3.synchronize();
    reply.send("Synchronization successful");
  } catch (error) {
    reply.code(500).send("Internal Server Error");
  }
});

server.listen({ host, port }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Server is running");
});
