// types.ts

export interface Node {
    nodeId: number;
    pubKey: string;
}

export interface CircuitNode {
    nodeId: number;
    basePort: number;
    ip: string;
    port: number;
}

export interface RegisterNodeBody {
    nodeId: number;
    pubKey: string;
}

export interface GetNodeRegistryBody {
    nodes: Node[];
}
