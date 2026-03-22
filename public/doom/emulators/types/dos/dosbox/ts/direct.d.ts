import type { WasmModule } from "../../../impl/modules";
import type { TransportLayer } from "../../../protocol/protocol";

export declare function dosDirect(wasmModule: WasmModule, sessionId: string): Promise<TransportLayer>;
