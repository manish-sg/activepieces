import { Writable } from 'stream'
import { SUPPORTED_AI_PROVIDERS, SupportedAIProvider } from '@activepieces/common-ai'
import { exceptionHandler } from '@activepieces/server-shared'
import { ActivepiecesError, EnginePrincipal, ErrorCode, isNil, PrincipalType } from '@activepieces/shared'
import proxy from '@fastify/http-proxy'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { FastifyRequest } from 'fastify'
import { aiProviderController } from './ai-provider-controller'
import { aiProviderService } from './ai-provider-service'
import { StreamingParser } from './providers/types'

export const aiProviderModule: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(aiProviderController, { prefix: '/v1/ai-providers' })

    await app.register(proxy, {
        prefix: '/v1/ai-providers/proxy/:provider',
        upstream: '',
        disableRequestLogging: false,
        config: {
            allowedPrincipals: [PrincipalType.ENGINE],
        },
        replyOptions: {
            rewriteRequestHeaders: (_request, headers) => {
                headers['accept-encoding'] = 'identity'
                return headers
            },
            getUpstream(request, _base) {
                return (request as ModifiedFastifyRequest).customUpstream
            },
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onResponse: async (request, reply, response) => {
                request.body = (request as ModifiedFastifyRequest).originalBody

                const principal = request.principal as EnginePrincipal
                const projectId = principal.projectId
                const { provider } = request.params as { provider: string }
                if (aiProviderService.isNonUsageRequest(provider, request)) {
                    return reply.send(response.stream)
                }

                const isStreaming = aiProviderService.isStreaming(provider, request)
                let streamingParser: StreamingParser
                if (isStreaming) {
                    streamingParser = aiProviderService.streamingParser(provider)
                }

                let buffer = Buffer.from('');

                // Types are not properly defined, pipe does not exist but the stream pipe does
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (response as any).stream.pipe(new Writable({
                    write(chunk, encoding, callback) {
                        buffer = Buffer.concat([buffer, chunk])
                        if (isStreaming) {
                            (reply.raw as NodeJS.WritableStream).write(chunk, encoding)
                            streamingParser.onChunk(chunk.toString())
                        }
                        callback()
                    },
                    async final(callback) {
                        if (isStreaming) {
                            reply.raw.end()
                        }
                        else {
                            try {
                                await reply.send(JSON.parse(buffer.toString()))
                            }
                            catch (error) {
                                app.log.error({
                                    projectId,
                                    request,
                                    response: buffer.toString(),
                                }, 'Error response from AI provider')
                                return
                            }
                        }

                        try {
                            if (reply.statusCode >= 400) {
                                app.log.error({
                                    projectId,
                                    request,
                                    response: buffer.toString(),
                                }, 'Error response from AI provider')
                                return
                            }

                            if (isStreaming) {
                                streamingParser.onEnd()
                            }
                            // In community edition, AI usage tracking is not available
                        }
                        catch (error) {
                            exceptionHandler.handle({
                                error,
                                projectId,
                                request,
                                response: buffer.toString(),
                                message: 'Error processing AI provider response',
                            }, app.log)
                        }
                        finally {
                            callback()
                        }
                    },
                }))
            },
        },
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        preHandler: async (request) => {
            const principal = request.principal as EnginePrincipal
            const provider = (request.params as { provider: string }).provider
            aiProviderService.validateRequest(provider, request)

            // In community edition, AI credit limits are not enforced
           
            const userPlatformId = principal.platform.id
            const providerConfig = getProviderConfigOrThrow(provider)

            const platformId = await aiProviderService.getAIProviderPlatformId(userPlatformId)
            const config = await aiProviderService.getConfig(provider, platformId);

            (request as ModifiedFastifyRequest).customUpstream = aiProviderService.getBaseUrl(provider, config)
            request.raw.url = aiProviderService.rewriteUrl(provider, config, request.url)

            const authHeaders = aiProviderService.getAuthHeaders(provider, config)
            Object.entries(authHeaders).forEach(([key, value]) => {
                request.headers[key] = value
            })

            if (providerConfig.auth.headerName !== 'Authorization') {
                delete request.headers['Authorization']
            }

            if (providerConfig.auth.headerName !== 'authorization') {
                delete request.headers['authorization']
            }
        },
        preValidation: (request, _reply, done) => {
            (request as ModifiedFastifyRequest).originalBody = request.body as Record<string, unknown>
            done()
        },
    })
}

function getProviderConfigOrThrow(provider: string | undefined): SupportedAIProvider {
    const providerConfig = !isNil(provider) ? SUPPORTED_AI_PROVIDERS.find((p) => p.provider === provider) : undefined
    if (isNil(providerConfig)) {
        throw new ActivepiecesError({
            code: ErrorCode.PROVIDER_PROXY_CONFIG_NOT_FOUND_FOR_PROVIDER,
            params: {
                provider: provider ?? 'unknown',
            },
        })
    }
    return providerConfig
}

type ModifiedFastifyRequest = FastifyRequest & { customUpstream: string, originalBody: Record<string, unknown> }
