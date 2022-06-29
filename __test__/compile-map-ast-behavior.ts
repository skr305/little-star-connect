import compileMapToAst from "../compile-map-ast"
import { join } from 'path' 
import fs from 'fs'

// 
const mockMap = 
`login { id, name, dog } { cache, avatar, nick }
reg { id, pwd, nick } { cache, man }`

const result = compileMapToAst( mockMap )

console.log( result )
fs.promises.writeFile( 
    join( 
        process.cwd(),
        'compile-map-ast-test-log.txt' 
    ),
    JSON.stringify( result ),
    {
        flag: "w+"
    }
)