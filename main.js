const { Transform } = require('stream');
var fs = require("fs");
const args = require('minimist')(process.argv.slice(2));

if( !(args.shift && args.action)) throw new Error( ' you must provide action, shift, inputFile, outputFile' )

const action = args.action;
const shift = args.shift;
const inputFile = args.input? fs.createReadStream(args.input) : process.stdin
const outputFile = args.output? fs.createWriteStream(args.output) : process.stdout

const splitStr = new Transform({
  transform(chunk, encoding, callback) {
    for(let item of chunk.toString()){
        this.push(item)
    }
    callback();
  }
});
function transformChar(char, action, shift){
    let charcode = (char.charCodeAt());
    if( action == 'encode'){
        if(charcode >= 122 - shift){
            return (String.fromCharCode(charcode - 25))
        }else{
            return (String.fromCharCode(charcode + shift))
        }
    }else{
        if(charcode <= 97 + shift){
            return (String.fromCharCode(charcode + 25))
        }else{
            return (String.fromCharCode(charcode - shift))
        }
    }

}
const transformStr = new Transform({
  transform(chunk, encoding, callback) {
    const char = chunk.toString().toLowerCase();
    if( (/[a-z]/i).test(char) ){
        this.push(transformChar(char, action, shift))
    }else{
        this.push(char)
    }    
    callback();
  }
});
inputFile.pipe(splitStr)
         .pipe(transformStr)             
         .pipe(outputFile);