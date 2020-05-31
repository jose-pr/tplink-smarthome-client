export type EmptyObject = {
    [name: string]: never
    [name: number]: never
}

export type SmartHomeApi<Methods> = {
    [ns in keyof Methods]: {
        [n in keyof Methods[ns]]: Methods[ns][n]
    }
}

export type SmartHomeApiMethod<NS extends string, N extends string, R = any, A = null | EmptyObject> = {
    [ns in NS]: {
        [n in N]: (arg: A) => R
    }
}
export type GenericSmartHomeApi = SmartHomeApiMethod<string, string, any, any>

export type SmartHomeMethodValidResult<R> ={
    err_code: 0
} & R
export type ErrorSmartHomeMethodResult<R> = { err_code: 1 | 2 | 3 | 4 | 5 } & Partial<R>
export type SmartHomeApiMethodResult<R> = SmartHomeMethodValidResult<R> | ErrorSmartHomeMethodResult<R>

export type SmartHomeApiResponse<Req extends {}, Api extends GenericSmartHomeApi> =
    {
        [ns in keyof Req]-?: ns extends keyof Api ? {
            [n in keyof Req[ns]]-?: n extends keyof Api[ns] ?
                Req[ns][n] extends Parameters<Api[ns][n]>[0] ? 
                    SmartHomeApiMethodResult<ReturnType<Api[ns][n]>>:
                    SmartHomeApiMethodResult<never>
                :SmartHomeApiMethodResult<never>
        } : { [n in keyof Req[ns]]-?: SmartHomeApiMethodResult<never> }
    }
export type SmartHomeApiRequest<Api extends {}> = {
    [ns in keyof Api]?: {
        [n in keyof Api[ns]]?: Parameters<Api[ns][n]>[0]
    }
}

export type SmartHomeValidResponse<R> = {
    [ns in keyof R]-?: {
        [n in keyof R[ns]]-?: {
            [v in Exclude<keyof R[ns][n], 'err_code'>]-?: R[ns][n][v]
        } & { err_code: 0 }
    }
}

export function IsValidSmartHomeMethodResult<A>(result: SmartHomeApiMethodResult<A>): result is SmartHomeMethodValidResult<A> {
    return result.err_code === 0;
}

export function IsValidSmartHomeResponse<A extends SmartHomeApiResponse<GenericSmartHomeApi, GenericSmartHomeApi>>(response: A | SmartHomeValidResponse<A>): response is SmartHomeValidResponse<A> {
    for (let ns in response) {
        for (let n in response[ns]) {
            if (!IsValidSmartHomeMethodResult(response[ns][n])) {
                throw new Error(`Error Code ${response[ns][n].err_code} for result of ${ns}.${n}`)
            }
        }
    }
    return true;
}