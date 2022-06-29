### a CLI util to generate doc-like api.ts file 

- how to run in dev-environment

```
git clone git@github.com:skr305/little-star-connect.git

npm i / yarn

cd benchmark

.\api-test.bat or ./api-test.sh

```

+ by ts-node cli.ts yield, you can generate ```api.ts``` by set options 

+ based on ```commander```, you can use ```ts-node cli.ts``` to get help


- by write a *.dog file like

```
    login  { id, pwd }  { id, avatar, nick } 
    reg  { r_id, r_pwd }  { n_id, n_nick } 
``` 

- can generate react/vue hooks to fetch data easily ( by the -r/-v options )

- the result is like ( including some usable hooks )

```ts

/**
 * 
 * @file react-hook生成的模板参照
 * @author otterh
 * @date 2022-06-28 23:51
 * 
 */

 import { useState } from 'react'

 // 默认OK代表成功处理请求
 enum AppErrorCode {
     
     OK = 0,
     
     // 1 - 998 为保留码
 
     ConnectionFail = 999
 
 }
 
 // 作为App中Error的标准格式
 type AppError< T = any > = {
     message: string
     data: T
     errorCode: AppErrorCode
 }
 
 // 需要注入的fetch类型
 type OtterFetch = <P, R>( url: string, params: P ) => Promise< AppError<R> >
 
 // 作为模板的一个api元信息 
 // 无实际意义
 type LoginParams = { id: string }
 
 type LoginResponse = { avatar: Buffer }
 
 const LoginURL = "/login"
 
 /**
  * 
  * @param url 请求的地址
  * @param _fetch 请求方法
  * @returns 生成的针对该接口的hook
  */
 const hookGenerator = < P, R >( url: string, _fetch: OtterFetch ) => {
     
    /**
     * @param params 注入的请求参数
     * @return { [ data, error, loading, setData, setError, setLoading ] } 
     */
     return ( params: P ) => {
         
         // 生成对应的3种状态
         // [ data-error-loading ]
         // 根据不同状态决定页面的展示逻辑
         const [ data, setData ] = useState<R>()
         const [ error, setError ] = useState<AppError>()
         const [ loading, setLoading ] = useState<boolean>( true )
 
         _fetch< P, R >( url, params )
         .then( response => {
             if( response.errorCode === AppErrorCode.OK ) {
                setData ( response.data )
             } else {
                 // 如果不是OK的状态码
                 // 则代表处理出现了问题
                 setError( response )
             }      
         } )
         .catch( () => {
            setError( {
                data: {},
                message: "connection fail," +
                " it may not be the matter of the server",
                errorCode: AppErrorCode.ConnectionFail
            } )
         } )
         .finally( () => {
            setLoading( false )
         } )

         return [ 
            data,
            error, 
            loading, 
            setData, 
            setError, 
            setLoading 
        ]
     }
 
 }
 
 // 生成的hook的类型
 type OtterHookType< P, R > = ReturnType< typeof hookGenerator< P, R > > 
 
 export default class VueFetchHook {
 
     public _fetch: OtterFetch
     public useLogin: OtterHookType< LoginParams, LoginResponse >
 
     constructor( _fetch: OtterFetch ) {
         this._fetch = _fetch
         this.useLogin = hookGenerator< LoginParams, LoginResponse >( LoginURL, this._fetch )
     }
 
 }
```