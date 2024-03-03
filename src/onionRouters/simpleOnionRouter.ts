import axios from "axios";
import bodyParser from "body-parser";
import crypto from "crypto";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";



// Déclaration de l'interface RegisterNodeBody
interface RegisterNodeBody {
    nodeId: number;
    pubKey: string;
}

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

    // Appeler le registre pour enregistrer le nœud
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

    // Générer une clé privée pour le nœud
    privateKey = generatePrivateKey();

    // Enregistrer le nœud
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
