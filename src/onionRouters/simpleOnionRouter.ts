import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";
import { RegisterNodeBody } from "../types";
import axios from "axios";
import crypto from "crypto";

let privateKey: string | null = null;

// Function to generate a private key
function generatePrivateKey(): string {
    const { privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: "pkcs1",
            format: "pem",
        },
        privateKeyEncoding: {
            type: "pkcs1",
            format: "pem",
        },
    });
    return privateKey.toString();
}

export async function simpleOnionRouter(nodeId: number) {
    const onionRouter = express();
    onionRouter.use(express.json());
    onionRouter.use(bodyParser.json());

    onionRouter.get("/status", (req, res) => {
        res.send("live");
    });

    onionRouter.get("/getPrivateKey", (req, res) => {
        res.json({ result: privateKey });
    });

    // Call the registry to register the node
    const registerNode = async () => {
        try {
            const response = await axios.post("http://localhost:3000/registerNode", {
                nodeId,
                pubKey: privateKey,
            } as RegisterNodeBody);
            console.log(response.data);
        } catch (error) {
            console.error("Error registering node:", error);
        }
    };

    // Generate private key for the node
    privateKey = generatePrivateKey();

    // Register the node
    await registerNode();

    const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
        console.log(
            `Onion router ${nodeId} is listening on port ${
                BASE_ONION_ROUTER_PORT + nodeId
            }`
        );
    });

    return server;
}
