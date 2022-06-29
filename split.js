const { program } = require('commander');

program
  .option('--first')
  .option('-s, --separator <char>');
program
    .command( 'dog' )
    .description( 'dog wow' )
program.parse();

const options = program.opts();
const limit = options.first ? 1 : undefined;
// console.log(program.args[0].split(options.separator, limit));