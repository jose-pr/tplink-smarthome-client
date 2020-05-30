import { SmartHomeClient } from "../src/smarthome-client";
import { ExampleApi, GetTimeZone, GetTime, GetRealtime, GetSysInfo, SysInfo } from "./smarthome-api-declarations";
import { SmartHomeApiResponse, SmartHomeApiMethodResponse, GenericSmartHomeApi, ValidSmartHomeMethodResult } from "../src/smarthome-api";

let client = new SmartHomeClient<ExampleApi>({
    host: "smarthome.lan",
    proto: 'tcp'
})

type VerifiedSmartHomeResponse<R> = {
    [ns in keyof R]-?: {
        [n in keyof R[ns]]-?: {
            [v in Exclude<keyof R[ns][n], 'err_code'>]-?: R[ns][n][v]
        } & { err_code: 0 }
    }
}

function isValidResult<A>(result: SmartHomeApiMethodResponse<A>): result is ValidSmartHomeMethodResult<A> {
    return result.err_code === 0;
}

function verifyResponse<A extends SmartHomeApiResponse<GenericSmartHomeApi, GenericSmartHomeApi>>(response: A | VerifiedSmartHomeResponse<A>): response is VerifiedSmartHomeResponse<A> {
    for (let ns in response) {
        for (let n in response[ns]) {
            if (!isValidResult(response[ns][n])) {
                throw new Error(`Error Code ${response[ns][n].err_code} for result of ${ns}.${n}`)
            }
        }
    }
    return true;
}
function keys<A extends {}>(obj: A) {
    return Object.keys(obj) as any as (Exclude<keyof A, symbol | number>)[]
}

async function using<R, U extends {
    connect: () => Promise<void>
    disconnect: () => Promise<void>
}>(usable: U, action: (usable: U) => Promise<R>) {
    await usable.connect();
    const result = await action(usable);
    await usable.disconnect();
    return result;
}

using(client, async (client) => {
    let apicall = await client.request({
        system: {
            get_sysinfo: null
        },
        time: {
            get_time: null,
            get_timezone: null,
            // get_error:null
        }
    });

    if (verifyResponse(apicall)) {
        for (let ns of keys(apicall)) {
            for (let n of keys(apicall[ns])) {
                for (let v of keys(apicall[ns][n])) {
                    console.log(`${ns}.${n}.${v}: ${JSON.stringify(apicall[ns][n][v], null, 1)}`);
                }
            }
        }
    }
})

