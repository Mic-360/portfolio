import type { WasmModule } from '../../../impl/modules'
import type { TransportLayer } from '../../../protocol/protocol'

export declare function dosWorker(
  workerUrl: string,
  wasmModule: WasmModule,
  sessionId: string,
): Promise<TransportLayer>
