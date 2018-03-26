/**
 * Created by ivan.martinez.ariza on 27/02/18.
 */

const readline = require('readline');
const { log, biglog, errorlog, colorize} =require("./out");
const cmds =require("./cmds");
const net = require("net");

//cada vez que se conecta un cliente

net.createServer(socket =>{

    console.log("Se ha conectado un cliente desde" + socket.remoteAddress);


//para importar todas las sentencias de model que nos hemos llevado a otra clase para que el
// Main no sea tan sumamente grande.
// Se pone asi porque es un fichero local

//sale el mensaje de bienvenida
    biglog(socket, 'CORE Quiz', 'green');

//figuro el readline, lee del teclado y saca de la pantalla
    const rl = readline.createInterface({
        input: socket,
        output: socket,//nos pinta de color azul el prompt
        prompt: colorize("quiz > ", 'blue'),
        completer: (line) => {
            const completions = 'h help quit q add list show test play p'.split(' ');
            const hits = completions.filter((c) => c.startsWith(line));
            // show all completions if none found
            return [hits.length ? hits : completions, line];
        }
    });

    //atender los eventos de los sockets
    socket
        .on("end", ()=>{rl.close()})
        .on("error", ()=>{rl.close()})


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
                    cmds.helpCmd(socket, rl);
                    break;
                case 'quit':
                case 'q':
                    cmds.quitCmd(socket, rl);
                    break;
                case 'add':
                    cmds.addCmd(socket, rl);
                    break;
                case 'list':
                    cmds.listCmd(socket, rl);
                    break;
                case 'show':
                    cmds.showCmd(socket, rl,args[1]);
                    break;
                case 'test':
                    cmds.testCmd(socket, rl,args[1]);
                    break;
                case 'play':
                case  'p':
                    cmds.playCmd(socket, rl);
                    break;
                case 'delete':
                    cmds.deleteCmd(socket, rl,args[1]);
                    break;
                case 'edit':
                    cmds.editCmd(socket, rl,args[1]);
                    break;
                case 'credits':
                    cmds.creditsCmd(socket, rl);
                    break;

                default:
                    log(socket, `Comando desconocido: '${colorize(cmd,'red')}'`);
                    //cuando el comando es desconocido además meto color y una llamada para ello al método colorize
                    log(socket, `Use ${colorize('help','green')} para ver todos los comandos disponibles.`);
                    rl.prompt();
                    break;
            }
            //movemos el prompt porque son procesos asíncornos en los que el programa sigue trabajando aunque haya
            //impreso ya información. Lo vamos a poner dentro de cada método
            rl.prompt();
        })
        .on('close',() => {
            log(socket, 'Adios');
           // process.exit(0); //la quitamos porq mata el servidor
        });


})
.listen(3030); //escucha en el puerto 3030

