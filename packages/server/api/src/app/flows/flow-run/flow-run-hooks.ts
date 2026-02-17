import { FlowRun, isFlowRunStateTerminal } from '@activepieces/shared'
import { FastifyBaseLogger } from 'fastify'

export const flowRunHooks = (_log: FastifyBaseLogger) => ({
    async onFinish(flowRun: FlowRun): Promise<void> {
        if (!isFlowRunStateTerminal({
            status: flowRun.status,
            ignoreInternalError: true,
        })) {
            return
        }
    },
})
