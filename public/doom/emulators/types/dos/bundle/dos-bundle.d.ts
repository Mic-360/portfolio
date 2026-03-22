import type { WasmModule } from '../../impl/modules'

export interface DosArchiveSource {
  url: string
  path: string
  type?: 'zip'
}
export default class DosBundle {
  dosboxConf: string
  jsdosConf: {
    version: string
  }
  sources: Array<DosArchiveSource>
  private libzipWasm
  constructor(libzipWasm: WasmModule)
  autoexec(...lines: Array<string>): DosBundle
  extract(url: string, path?: string, type?: 'zip'): DosBundle
  extractAll(sources: Array<DosArchiveSource>): DosBundle
  toUint8Array(overwriteConfig?: boolean): Promise<Uint8Array>
}
export declare const defaultConfig: string
