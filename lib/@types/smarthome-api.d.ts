export declare type EmptyObject = {
    [name: string]: never;
    [name: number]: never;
};
export declare type SmartHomeApi<Methods> = {
    [ns in keyof Methods]: {
        [n in keyof Methods[ns]]: Methods[ns][n];
    };
};
export declare type SmartHomeApiMethod<NS extends string, N extends string, R = any, A = null | EmptyObject> = {
    [ns in NS]: {
        [n in N]: (arg: A) => R;
    };
};
export declare type GenericSmartHomeApi = SmartHomeApiMethod<string, string, any, any>;
export declare type ValidSmartHomeMethodResult<R> = {
    err_code: 0;
} & R;
export declare type ErrorSmartHomeMethodResult<R> = {
    err_code: 1 | 2 | 3 | 4 | 5;
} & Partial<R>;
export declare type SmartHomeApiMethodResult<R> = ValidSmartHomeMethodResult<R> | ErrorSmartHomeMethodResult<R>;
export declare type SmartHomeApiResponse<Req extends {}, Api extends GenericSmartHomeApi> = {
    [ns in keyof Req]: ns extends keyof Api ? {
        [n in keyof Req[ns]]: n extends keyof Api[ns] ? Req[ns][n] extends Parameters<Api[ns][n]>[0] ? SmartHomeApiMethodResult<ReturnType<Api[ns][n]>> : SmartHomeApiMethodResult<never> : SmartHomeApiMethodResult<never>;
    } : {
        [n in keyof Req[ns]]: SmartHomeApiMethodResult<never>;
    };
};
export declare type SmartHomeApiResponse1<Req extends {}, Api extends GenericSmartHomeApi> = {
    [ns in keyof Req]: ns extends keyof Api ? {
        [n in keyof Req[ns]]: n extends keyof Api[ns] ? Req[ns][n] extends Parameters<Api[ns][n]>[0] ? SmartHomeApiMethodResult<ReturnType<Api[ns][n]>> : SmartHomeApiMethodResult<never> : SmartHomeApiMethodResult<never>;
    } : {
        [n in keyof Req[ns]]: SmartHomeApiMethodResult<never>;
    };
};
export declare type SmartHomeApiRequest<Api extends {}> = {
    [ns in keyof Api]?: {
        [n in keyof Api[ns]]?: Parameters<Api[ns][n]>[0];
    };
};
