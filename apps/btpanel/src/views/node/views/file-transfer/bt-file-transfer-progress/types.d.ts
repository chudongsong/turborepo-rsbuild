export interface FileTransferProgressProps {
	sourcePath?: string
	targetPath?: string
	targetNode?: string
	sourceNode?: string
	fileCount?: number
	fileComplete?: number
	fileError?: number
}

export type TransferStatus = 'waiting' | 'transferring' | 'completed' | 'error'

export type ProgressStatus = 'success' | 'warning' | 'exception' | undefined
