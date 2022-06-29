
/**
 * 
 * @file cli工具 用于生成接口描述文档(api.ts)
 * @file 和对每个接口的hooks(hook.ts)
 * @author otterh
 * @date 2022-06-28 14:39
 * 
 */

import fs from 'fs'
import { join } from 'path';
import chalk from 'chalk';
import REACT_HOOK_GENERATOR_CONTENT, { REACT_HOOK_IMPORT_CONTENT } from './tpl/react-hook-template';
import VUE_HOOK_GENERATOR_CONTNET, { VUE_HOOK_IMPORT_CONTENT } from './tpl/vue-hook-template';
import { Command } from 'commander'
import OtterError, { ErrorCode } from './otter-error'
import compileMapToAst, { MapAst } from './compile-map-ast';
import { HOOK_SECTION_MARK, HOOK_GENERATOR_MARK } from './constants/fetch-hook-mark';

const program = new Command()

/**
 * @function 处理yield命令
 * @function 产生api.ts以及额外产物hook.ts
 * @function hook.ts是否产生将视是否含有--v/--r选项而定
 */
const yieldAPI = async () => {
    const options = program.opts()
    /** 解析命令行参数 */

    // mode 参数
    const { a, v, r } = options
    // 路径参数
    const [ _, i, o ] = program.args

    // 不包含输入或输出路径视为坏输入
    if( !o || !i ) {
        throw new OtterError( 
            ErrorCode.CliOptionError,
            "should specify input and output" +
            " by -i and -o options"
        )
    }

    console.log( 
        chalk.cyanBright( 'the args are load:\n' ) + 
        chalk.blue( 
            `/** ---- **/` +
            `\n` +
            `a: ${a},\n` + 
            `useVueHooks: ${v},\n` +
            `useReactHooks: ${r},\n` +
            `input_path: ${i},\n` + 
            `output_path: ${o}\n` +
            `/** ---- **/` +
            `\n`
        ) 
    )

    let mapToken: MapAst = []

    let apiTsContent: string

    const API_OUTPUT_PATH = join( process.cwd(), o as string, 'api.ts' ) 
    
    const STANDARD_INPUT_SUFFIX = "dog"

    /**
     * 
     * @param content 准备输出的内容
     * @param append 是否是追加模式
     * @returns 
     */
    const output = ( content: string, append: boolean = false ) => 
        fs
            .promises
            .writeFile( 
                API_OUTPUT_PATH,
                content,
                {
                    flag: append ? 'a+' : 'w+'
                }
            )
            .catch( ( error ) => {
                console.log( error )
                throw new OtterError(
                    ErrorCode.CliWriteOutputError,
                    "write output error" +
                    ", check the path of -o: " +
                    o +
                    ", maybe something other wrong"
                )
            } )

    /**
    * @funtion 根据path得到api的名称指代
    * @param path api的路径
    * @returns api的名称
    */
    const getAPIName = ( path: string ) =>
        path
            .split( "/" )
            .map( r => r[0].toUpperCase() + r.slice( 1 ) )
            .join( "" )

    // 得到api各个描述信息的变量或类型名称
    const getURLVarName = ( apiName: string ) => `${apiName}URL`
    const getParamsTypeName = ( apiName: string ) => `${apiName}Params`
    const getResponseTypeName = ( apiName: string ) => `${apiName}Response`
    const getHookMethodName = ( apiName: string ) => `use${apiName}`

    /**
     * @function 进行hooks元信息插入
     * @param rawTemplate 需要进行元信息插入的模板
     * @returns { *string } 获取得到元信息注入(如useLogin这样的具体到接口的hooks)后的可用模板
     */
    const insertTemplateWithAPIMeta = ( rawTemplate: string ) =>
        rawTemplate
        .replace( HOOK_SECTION_MARK, () => {
            return mapToken
                .map( api => {
                    const { path } = api
                    const apiName = getAPIName( path )
                    return `public ${getHookMethodName( apiName )}:` + 
                        `OtterHookType< ${getParamsTypeName( apiName )}` +
                        `, ${getResponseTypeName( apiName )} >` + 
                        `\n    `
                } )
                .join( "" )
        } )   
        .replace( HOOK_GENERATOR_MARK, () => {
            return mapToken
                .map( api => {
                    const { path } = api
                    const apiName = getAPIName( path )
                    return `this.${getHookMethodName( apiName )} = hookGenerator` + 
                    `< ${getParamsTypeName( apiName )}` +
                    `, ${getResponseTypeName( apiName )} >` +
                    `( ${getURLVarName( apiName )}, this._fetch )` +
                    `\n        `
                } )
                .join( "" )
        } )  

    // 检测是否是.map格式的文件
    {   
        const _i = i as string
        const len = _i.length
        const is_valid_fmt = 
            _i.slice( len - STANDARD_INPUT_SUFFIX.length - 1  ) ===
            '.' + STANDARD_INPUT_SUFFIX
        // 不符合格式 报错
        if( !is_valid_fmt ) {
            throw new OtterError(
                ErrorCode.CliInputFmtError,
                `the input file should end with .${ STANDARD_INPUT_SUFFIX }`
            )
        }
    }
    
    // 读取输入的map文件
    // 并根据map内容获取token
    {
        const rawMapContent = await fs
        .promises
        .readFile( join( process.cwd(), i as string ) )
        // 转码为utf-8
        .then( buffer => buffer.toString( 'utf-8' ) )
        .catch( () => {
            throw new OtterError(
                ErrorCode.CliReadInputError,
                "when reading input file:" +
                i + ", error emit "
            )
        } )
        mapToken = compileMapToAst( rawMapContent )
    }

    console.log( chalk.cyan( 'load the map file, ready to generate api content' ) )

    // 生成api.ts
    {   
        // 把如 { id, name } 这样的类型标识转化为
        // { id: string, name: string } 这样的ts类型标准形式
        const getPlainTypeStringByToken = ( token: string[] ) => {
            let plainType = ''
            plainType += '{\n'
            // 插入各个字段
            for( const mark of token ) {
                plainType += '  ' + `${ mark }: string` + '\n'
            }
            plainType += '}\n'
            
            return plainType
        }
        // 根据hooks选项信息 [ a, v, r ] 
        // 选择是否导入react/vue的相应依赖
        // 是否生成相应的hooks-content
        let dependencyContent = ""
        let hooksContent = ""
        if( v ) {
            dependencyContent = VUE_HOOK_IMPORT_CONTENT
            hooksContent = insertTemplateWithAPIMeta( VUE_HOOK_GENERATOR_CONTNET )
        } else if ( r ) {
            dependencyContent = REACT_HOOK_IMPORT_CONTENT
            hooksContent = insertTemplateWithAPIMeta( REACT_HOOK_GENERATOR_CONTENT )
        }
        // 生成前关于接口的描述信息
        apiTsContent = `/** DRAW BY OTTER_CLI */` +
            `\n` +
            `/** ENJOY YOURSELVES */` +
            `\n` +
            dependencyContent +
            `\n` +
            mapToken
            .map( api => {
                const { path, params, response } = api
                const APIName = getAPIName( path )
                return `export const ${ getURLVarName( APIName ) } = '${ path }'`
                    + '\n'
                    + `export type ${ getParamsTypeName( APIName ) } = ${ getPlainTypeStringByToken( params ) }`
                    + '\n'
                    + `export type ${ getResponseTypeName( APIName ) } = ${ getPlainTypeStringByToken( response ) }`
                    + '\n'
            } )
            .join( "" )
            + `\n`
            + `/** AUTO GENERATED BY OTTER-HOOKS */`
            + hooksContent
    }

    console.log( 
        chalk.bgCyan( 
            'api content generated, ready to write to: '
        ) +
        "   " +
        chalk.yellowBright( API_OUTPUT_PATH )
     )

    // 写入指定路径
    await output( apiTsContent )
    
    console.log( chalk.greenBright ( 'write succuess, done' ) )

}

// 配置命令行选项
program
    .option( '--a' ) // 只产生api.ts
    .option( '--v' ) // 产生api.ts和基于vue-next的hook.ts
    .option( '--r' ) // 产生api.ts和基于react的hook.ts
    .option( 
        '-o', 
        'the output directory' +
        ' --output <dir__path>' 
    )
    .option(
        '-i',
        'the path of map file' +
        ' as input --input <map__path>'
    )
    .command( 'yield' ) 
    .description( 
        'generate the produce' +
        ' to the specified directory'
    )
    .action( async() => {
        try {
            await yieldAPI()
        } catch( error ) {
            console.log( chalk.red( JSON.stringify( error ) ) )
        }
    } )

program.parse()