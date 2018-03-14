/**
 * Created by ivan.martinez.ariza on 27/02/18.
 */

const readline = require('readline');
const { log, biglog, errorlog, colorize} =require("./out");
const cmds =require("./cmds");
//para importar todas las sentencias de model que nos hemos llevado a otra clase para que el Main no sea tan sumamente grande. Se pone asi porque es un fichero local

//sale el mensaje de bienvenida
biglog('CORE Quiz', 'green');

//figuro el readline, lee del teclado y saca de la pantalla
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,//nos pinta de color azul el prompt
    prompt: colorize("quiz > ", 'blue'),
    completer: (line) => {
        const completions = 'h help quit q add list show test play p'.split(' ');
        const hits = completions.filter((c) => c.startsWith(line));
        // show all completions if none found
        return [hits.length ? hits : completions, line];
    }
});
//sale el prompt
rl.prompt();

rl
    .on('line', (line) => {

        let args = line.split(" ");
        let cmd = args[0].toLowerCase().trim();

    switch (cmd){
        //caso de vacío no me retorna nada
        case '':
            //como esta función no la tenemos definida ponemos el prompt
            rl.prompt();
            break;
        //mensajes de erro
        case   'h':
        case 'help':
            cmds.helpCmd(rl);
              break;
        case 'quit':
        case 'q':
            cmds.quitCmd(rl);
            break;
        case 'add':
            cmds.addCmd(rl);
            break;
        case 'list':
            cmds.listCmd(rl);
            break;
        case 'show':
            cmds.showCmd(rl,args[1]);
            break;
        case 'test':
            cmds.testCmd(rl,args[1]);
            break;
        case 'play':
        case  'p':
            cmds.playCmd(rl);
            break;
        case 'delete':
            cmds.deleteCmd(rl,args[1]);
            break;
        case 'edit':
            cmds.editCmd(rl,args[1]);
            break;
        case 'credits':
            cmds.creditsCmd(rl);
            break;

        default:
            log(`Comando desconocido: '${colorize(cmd,'red')}'`);
            //cuando el comando es desconocido además meto color y una llamada para ello al método colorize
            log(`Use ${colorize('help','green')} para ver todos los comandos disponibles.`);
            rl.prompt();
            break;
    }
    //movemos el prompt porque son procesos asíncornos en los que el programa sigue trabajando aunque haya
    //impreso ya información. Lo vamos a poner dentro de cada método
    rl.prompt();
})
.on('close',() => {
    log('Adios');
    process.exit(0);
});
