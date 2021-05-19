import { createServer } from "http";
import * as Koa from "koa";
import * as KoaBody from "koa-body";
import * as logger from "koa-logger";
import * as mongoose from "mongoose";
import { Server } from "socket.io";

import * as cors from "@koa/cors";

import { WS_PATH } from "../../werewolf-frontend/shared/constants";
import useHandleError from "./middleware/handleError";
import router from "./routes";
import { setup } from "./ws";

mongoose.connect("mongodb://localhost/werewolf", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = new Koa<
  { isKnownError: Boolean },
  { error: (status: number, msg: string) => void }
>();

const httpServer = createServer(app.callback());

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  path: WS_PATH,
});

// listen to some events
setup(io);

app
  .use(logger())
  .use(
    cors({ credentials: true, origin: "http://localhost:3000" })
  )

  .use(useHandleError())

  .use(KoaBody())

  .use(router.routes())
  .use(router.allowedMethods());

httpServer.listen(3030);

console.log("listen on 3030");

export default io;
