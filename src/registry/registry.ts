import bodyParser from "body-parser";
import express from "express";
import { Node, RegisterNodeBody, GetNodeRegistryBody } from "../types";
import { REGISTRY_PORT } from "../config";
import { BASE_ONION_ROUTER_PORT } from "../config";
import { BASE_USER_PORT } from "../config";



const registeredNodes: Node[] = [];

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  _registry.get("/status", (req, res) => {
    res.send("live");
  });

  _registry.post("/registerNode", (req, res) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;
    registeredNodes.push({ nodeId, pubKey });
    res.send("Node registered successfully.");
  });

  _registry.get("/getNodeRegistry", (req, res) => {
    const nodeRegistry: GetNodeRegistryBody = { nodes: registeredNodes };
    res.json(nodeRegistry);
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
