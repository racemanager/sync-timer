"use strict";

require("dotenv").config();
const server = require("./bin/server");
const port = process.env.PORT || 5005;

server(port);

