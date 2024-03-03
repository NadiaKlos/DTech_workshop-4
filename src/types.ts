// types.ts

export interface Node {
    nodeId: number;
    pubKey: string;
}

export interface RegisterNodeBody {
    nodeId: number;
    pubKey: string;
}

export interface GetNodeRegistryBody {
    nodes: Node[];
}
