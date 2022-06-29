
/**
 * 
 * @file vue-hook生成的模版
 * @author otterh
 * @date 2022-06-28 23:51
 * 
 */

import { HOOK_SECTION_MARK, HOOK_GENERATOR_MARK } from './constants/fetch-hook-mark';

export const VUE_HOOK_IMPORT_CONTENT = `import { ref } from 'vue'\n`

// 生成generator部分的代码模板
const VUE_HOOK_GENERATOR_CONTNET = `
// 默认OK代表成功处理请求
export enum AppErrorCode {
    
    OK = 0,
    
    // 1 - 998 为保留码

    ConnectionFail = 999

}

// 作为App中Error的标准格式
export type AppError< T = any > = {
    message: string
    data: T
    errorCode: AppErrorCode
}

// 需要注入的fetch类型
export type OtterFetch = <P, R>( url: string, params: P ) => Promise< AppError<R> >

/**
 * 
 * @param url 请求的地址
 * @param _fetch 请求方法
 * @returns 生成的针对该接口的hook
 */
export const hookGenerator = < P, R >( url: string, _fetch: OtterFetch ) => {
    
    /**
     * @param params 注入的请求参数
     * @return { data, error, loading } 
     */
    return ( params: P ) => {
        
        // 生成对应的3种状态
        // [ data-error-loading ]
        // 根据不同状态决定页面的展示逻辑
        const data = ref<R>()
        const error = ref<AppError>()
        const loading = ref<boolean>( true )

        _fetch< P, R >( url, params )
        .then( response => {
            if( response.errorCode === AppErrorCode.OK ) {
                data.value = response.data
            } else {
                // 如果不是OK的状态码
                // 则代表处理出现了问题
                error.value = response
            }      
        } )
        .catch( () => {
            error.value = {
                data: {},
                message: "connection fail," +
                " it may not be the matter of the server",
                errorCode: AppErrorCode.ConnectionFail
            }
        } )
        .finally( () => {
            loading.value = false
        } )

        return { data, error, loading }
    }

}

// 生成的hook的类型
export type OtterHookType< P, R > = ReturnType< typeof hookGenerator< P, R > > 

export default class VueFetchHook {
 
    public _fetch: OtterFetch
    ${ HOOK_SECTION_MARK }

    constructor( _fetch: OtterFetch ) {
        this._fetch = _fetch
        ${ HOOK_GENERATOR_MARK }
    }

}
`

export default VUE_HOOK_GENERATOR_CONTNET