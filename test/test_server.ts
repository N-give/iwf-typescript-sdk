import Fastify, { FastifyInstance } from "fastify";
import routes from "./routes.ts";

const fastify: FastifyInstance = Fastify({
  // logger: true,
});
fastify.register(routes);
async function start() {
  try {
    await fastify.listen({
      port: 8803,
    });
  } catch (e) {
    fastify.log.error(e);
    fastify.close();
  }
}
start();
