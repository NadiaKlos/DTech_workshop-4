import bodyParser from "body-parser";
import express from "express";
import fetch from "node-fetch";
import { BASE_USER_PORT } from "../config";
import { CircuitNode } from "../types";

let lastReceivedMessage: string | null = null;

export type SendMessageBody = {
    message: string;
    destinationUserId: number;
};


export async function user(userId: number) {
    const _user = express();
    _user.use(express.json());
    _user.use(bodyParser.json());

    _user.get("/status", (req, res) => {
        res.send("live");
    });

    _user.get("/getLastReceivedMessage", (req, res) => {
        res.json({ result: lastReceivedMessage });
    });

    _user.post("/message", (req, res) => {
        const { message }: { message: string } = req.body;
        lastReceivedMessage = message;
        res.send("Message received successfully.");
    });

    const server = _user.listen(BASE_USER_PORT + userId, () => {
        console.log(
            `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
        );
    });

    return server;
}

// Assurez-vous d'avoir les bonnes importations de types ou de modules nécessaires ici

async function generateSymmetricKey(): Promise<any> {
    try {
        // Générer une clé symétrique aléatoire ici (à remplacer par votre implémentation)
        const symmetricKey = "randomSymmetricKey";
        console.log('Symmetric key generated successfully:', symmetricKey);
        return symmetricKey;
    } catch (error) {
        console.error('Error while generating symmetric key:', error);
        throw error;
    }


    async function forwardMessageThroughCircuit(destinationNode: CircuitNode, encryptedMessage: string, encryptedKeys: string[]): Promise<void> {
        const {ip, port} = destinationNode; // Récupérez l'adresse IP et le port du nœud de destination

        const url = `http://${ip}:${port}/receiveMessage`; // Construisez l'URL de réception du message sur le nœud de destination

        // Préparez les données à envoyer dans le corps de la requête
        const data = {
            encryptedMessage,
            encryptedKeys
        };

        try {
            // Effectuez une requête POST pour envoyer le message et les clés au nœud de destination
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log('Message forwarded successfully.');
            } else {
                console.error('Failed to forward message:', response.statusText);
            }
        } catch (error) {
            console.error('Error while forwarding message:', error);
        }
    }

    async function sendMessageToNode(destination: CircuitNode, encryptedMessage: string, encryptedKey: string): Promise<void> {
        try {
            const response = await fetch(`http://${destination.ip}:${destination.port}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    encryptedMessage: encryptedMessage,
                    encryptedKey: encryptedKey
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to send message to node ${destination.ip}:${destination.port}`);
            }
        } catch (error) {
            console.error(`Error sending message to node ${destination.ip}:${destination.port}:`, error);
            throw error;
        }

    }
}
