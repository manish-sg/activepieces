import {
    ActivepiecesError,
    ApId,
    EndpointScope,
    ErrorCode,
    PlatformWithoutSensitiveData,
    PrincipalType,
    SERVICE_KEY_SECURITY_OPENAPI,
    UpdatePlatformRequestBody,
} from '@activepieces/shared'
import {
    FastifyPluginAsyncTypebox,
    Type,
} from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { platformService } from './platform.service'

export const platformController: FastifyPluginAsyncTypebox = async (app) => {
    app.post('/:id', UpdatePlatformRequest, async (req) => {
        await platformService.update({
            id: req.params.id,
            ...req.body,
        })
        return platformService.getOneWithPlanAndUsageOrThrow(req.params.id)
    })

    app.get('/:id', GetPlatformRequest, async (req) => {
        if (req.principal.platform.id !== req.params.id) {
            throw new ActivepiecesError({
                code: ErrorCode.AUTHORIZATION,
                params: {
                    message: 'You are not authorized to access this platform',
                },
            })
        }
        return platformService.getOneWithPlanAndUsageOrThrow(req.principal.platform.id)
    })
}

const UpdatePlatformRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER] as const,
        scope: EndpointScope.PLATFORM,
    },
    schema: {
        body: UpdatePlatformRequestBody,
        params: Type.Object({
            id: ApId,
        }),
        response: {
            [StatusCodes.OK]: PlatformWithoutSensitiveData,
        },
    },
}


const GetPlatformRequest = {
    config: {
        allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE] as const,
        scope: EndpointScope.PLATFORM,
    },
    schema: {
        tags: ['platforms'],
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        description: 'Get a platform by id',
        params: Type.Object({
            id: ApId,
        }),
        response: {
            [StatusCodes.OK]: PlatformWithoutSensitiveData,
        },
    },
}

