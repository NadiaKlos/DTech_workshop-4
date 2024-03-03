export const REGISTRY_PORT = 8080;
export const BASE_ONION_ROUTER_PORT = 4000;
export const BASE_USER_PORT = 3000;
import express from "express";

const registry = express();

registry.get("/status", (req, res) => {
  res.send("live");
});

registry.listen(REGISTRY_PORT, () => {
  console.log(`Registry is listening on port ${REGISTRY_PORT}`);
});