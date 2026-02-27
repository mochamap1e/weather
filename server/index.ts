import fs from "fs";
import path from "path";
import https from "https";
import express from "express";

const certsPath = path.join(__dirname, "..", "certs");
const htmlPath = path.join(__dirname, "..", "public");

const app = express();
const port = 3000;

app.use(express.static(htmlPath));

https.createServer({
    key: fs.readFileSync(path.join(certsPath, "key.pem")),
    cert: fs.readFileSync(path.join(certsPath, "cert.pem"))
}, app).listen(port, () => console.log("Server running on port", port));