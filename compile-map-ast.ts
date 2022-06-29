/**
 * 
 * @file 根据<map>文件生成api接口的工具
 * @author otterh
 * @date 2022-06-27 23:09
 * @description map文件描述见README.md
 */

import chalk from "chalk";
import OtterError, { ErrorCode } from "./otter-error";

// 用于匹配花括号中的内容
const CurlyBracketMatcher = /\{(.*?)\}/ig; 

// 正常单句中应匹配的api表达式数量 即params和response
const CORRECT_APIEXP_LEN = 2

/**
 * 
 * @funtion 匹配字符串内的接口描述内容 
 * 用于 { id, name } 这样的表达式
 * @param raw 需要被匹配的字符串  
 * @return
 */
const matchApiExpression = ( raw: string ):string[][] => {
    const matched = raw.matchAll( CurlyBracketMatcher )
    const result: string[][] = []
    for( let m of matched ) {
        // 如 id, name 这样的内容
        const apiBody = m[1]
        // 分解成 [ 'id', 'name' ] 
        // 这样的结构
        // 然后返回入结果集
        result.push( 
            apiBody
            .split( "," )
            .map( 
                field => field.trim() 
            ) 
        )     
    }
    return result
}

// 表示一个map文件信息的语法描述
export type MapAst = {
    path: string
    params: string[]
    response: string[]  
} []

/**
 * 
 * @funtion 用于把map文件字符串编译成简单语法树
 * @param mapFileString 由源文件中读取的内容字符串
 * @return 
 * @throw 当语法内容不规范时抛出
 */
const compileMapToAst = ( mapFileString: string ):MapAst => {
    return mapFileString
    .split( '\n' )
    // 对单行内容进行处理
    .map( line => {
        const apiExps = matchApiExpression( line )
        if( apiExps.length !== CORRECT_APIEXP_LEN ) {
            throw new OtterError( 
                ErrorCode.MapCompilingError,
                "too many api expressions!" +
                "its number should be 2" +
                "\n" + "error line:" +
                "\n" + chalk.redBright( line )    
            )
        }
        // 在 /unauth/login { id, pwd } { id, avatar, nick } 中
        // 抽取 /unauth/login
        const path = line
            .split( " " )[0]
            .trim()
        const [ params, response ] = apiExps
        return { 
            path,
            params,
            response
        }
    } )
}

export default compileMapToAst