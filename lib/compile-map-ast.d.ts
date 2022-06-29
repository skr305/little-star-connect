/**
 *
 * @file 根据<map>文件生成api接口的工具
 * @author otterh
 * @date 2022-06-27 23:09
 * @description map文件描述见README.md
 */
export declare type MapAst = {
    path: string;
    params: string[];
    response: string[];
}[];
/**
 *
 * @funtion 用于把map文件字符串编译成简单语法树
 * @param mapFileString 由源文件中读取的内容字符串
 * @return
 * @throw 当语法内容不规范时抛出
 */
declare const compileMapToAst: (mapFileString: string) => MapAst;
export default compileMapToAst;
