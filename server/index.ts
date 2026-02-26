import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";

const port = 3000;

const server = new Elysia()
    .use(staticPlugin({ prefix: "/", alwaysStatic: true }))
    .listen(port);

console.log(`Server running on port ${port}`);