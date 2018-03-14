// JavaScript source code
const {log, biglog, errorlog, colorize} = require("./out");
//para acceder a los modelos de sequelize
const {models} = require("./model");
const Sequelize = require('sequelize');

exports.helpCmd = rl => {
      log('Comandos');
	  log('h|help-Muestra esta ayuda');
      log('list- Listar los quizzes existentes');
	  log('show <id> -Muestra la pregunta y la respuesta el quiz indicado');
      log('add-A�adir un nuevo quiz interactivamente');
      log('delete <id> -Borrar el quiz indicado');
      log('edit <id> - Borrar el quiz indicado');
	  log('test <id> - Probar el quiz indicado');
      log('p|play -Jugar a preguntar aleatoriamente todos los quizzes');
	  log('credits -Creditos');
      log('q|quit -Salir del programa');
	  rl.prompt();
};
//ANtes sacabamos todos lo valores del array y haciamos un bucle for para recorrerlo ahora no,
exports.listCmd = rl => {

    /* model.getAll().forEach((quiz, id)=> {
	  log(`[${colorize(id, 'magenta')}]: ${quiz.question}`);

	 });
 rl.prompt();

 */
    models.quiz.findAll() //DModelos de la base de datos, voy a quiz y findall promesa dentro de una rato me devuelve todos los quizzes existentes. Devolviendolo para próximas iteraciones
	//quizzes son todos los objetos que hay en la base de datos, con propiedades pregunta, respuesta, id y lo de las fechas
		//podemos simplificar yua que el sequelize tiene una funcion .each
		.each(quiz => { // Coge todos los quiz que hay dentro del array que devuelve findAll
        log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`)
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});

};
/*
 *Añade un nuevo quiz al modelo
 * Pregunta interactivamente por la pregunta y por la respuesta
 *
 * Hay que recordar que el funcionamiento de la función rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario, es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda llamada a rl.question.
 * @param rl Objeto readline usado para implementar el CLI.
 *
 */

exports.addCmd = rl => {

    makeQuestion(rl, 'Introduzca una pregunta: ') //Hasta que no introduzca una pregunta no finaliza
        .then(q => {
        return makeQuestion(rl, 'Introduce la respuesta: ')
            .then(a => {
            return {question: q, answer: a};
});
})
.then(quiz => {
        return models.quiz.create(quiz);
})
.then((quiz) => {
        log(` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
})
.catch(Sequelize.ValidationError, error => { //Si hay errores de validación
        errorlog('El quiz es erroneo: ');
    error.errors.forEach(({message}) => errorlog(message));
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});
};

/*
exports.addCmd = rl => {
     rl.question(colorize('Introduzca una pregunta:', 'red'), question=>{
	 	 rl.question(colorize('Introduzca la respuesta:', 'red'), answer=>{
		 	 model.add(question, answer);
			 log(`${colorize('Se ha a�adido', 'magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
			 rl.prompt();
		 });
	 });

};
*/
exports.deleteCmd = (rl, id) => {

    validateId(id)
        .then(id => models.quiz.destroy({where: {id}})) //Condición: el elemento que quiero destruir es el que tiene como id el valor id
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});
};

/*
exports.deleteCmd =(rl, id)=>{

 if (typeof id === "undefined"){
		errorlog('Falta el parametro id');
     } else{
	 	 try{
		 	 model.deleteByIndex(id);
		 } catch (error){
		 	 errorlog(error.message);

		 }
	 }
 rl.prompt();
 };
*/
exports.editCmd = (rl, id) => {

    validateId(id)
        .then(id => models.quiz.findById(id))
.then(quiz => {
        if (!quiz) {
        throw new Error(`No existe un quiz asociado al id=${id}.`);
    }

    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
    return makeQuestion(rl, 'Introduzca la pregunta: ')
        .then(q => {
        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
    return makeQuestion(rl, 'Introduzca la respuesta: ')
        .then(a => {
        quiz.question = q;
    quiz.answer = a;
    return quiz;
});
});
})
.then(quiz => {
        return quiz.save();
})
.then(quiz => {
        log(`Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
})
.catch(Sequelize.ValidationError, error => { //Si hay errores de validación
        errorlog('El quiz es erroneo: ');
    error.errors.forEach(({message}) => errorlog(message));
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});
};
/*
exports.editCmd = (rl, id) => {
   if (typeof id === "undefined"){
		errorlog('Falta el parametro id');
		rl.prompt();
	} else {
		try{
		const quiz = model.getByIndex(id);

		process.stdout.isTTY && setTimeout( () => {rl.write(quiz.question)},0);

          rl.question(colorize('Introduzca una pregunta:', 'red'), question=>{

		 	process.stdout.isTTY && setTimeout( () => {rl.write(quiz.answer)},0);

	 	  rl.question(colorize('Introduzca la respuesta:', 'red'), answer=>{
		   model.update(id, question, answer);
		   log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
		   rl.prompt();
		  });
	     });
	    }catch(error){
		errorlog(error.message);
		rl.prompt();
	    }
    }
};
*/
exports.testCmd = (rl,id) => {
	validateId(id) //primero tenemos que validar el usuario
		.then(id => models.quiz.findById(id))
		.then(quiz => {

	})
}

exports.testCmd = (rl, id) =>{

}

/*
exports.testCmd = (rl,id) =>{
	   if (typeof id === "undefined"){
		errorlog('Falta el parametro id.');
		rl.prompt();
	   } else {
		  try{
		  const quiz = model.getByIndex(id);
		  rl.question(colorize(`${quiz.question}`, 'red'), respuesta1 => {
		  if(respuesta1.toLowerCase().trim()=== (quiz.answer).toLowerCase().trim()){
				log("Respuesta correcta",'green');
				//rl.prompt();
		    } else{
			  log ("Respuesta incorrecta", 'red');
			  }
			  rl.prompt();
		   });
		   }catch(error){
			errorlog(error.message);
			rl.prompt();
		   }
		}
};
*/
/*
exports.playCmd = rl =>{
	   
	 let score = 0;
	 let toBeResolved = [];
	  model.getAll().forEach((quiz, id) => {
        toBeResolved[id]= quiz;
      });
	  
	 const playOne = () =>{
	      if ( toBeResolved.length === 0 ){
		  log ('No hay mas preguntas','magenta');
		  log("Fin del juego", 'magenta');
		   biglog(`Puntuacion ${colorize(score,'magenta')} `);
		  rl.prompt();
	      }
	     else{
	       try{
            let randomId = Math.floor(Math.random()*toBeResolved.length);
		    let quiz= toBeResolved[randomId];
            // let quiz = model.getByIndex(id);
			//toBeResolved.splice(toBeResolved.indexOf(quizToAsk), 1);
		    rl.question(colorize(`${quiz.question}`, 'red'), respuesta2 => {
		    if(respuesta2.toLowerCase().trim()=== (quiz.answer).toLowerCase().trim()){
				log("Respuesta correcta",'green');
				score ++;
				log(`Puntuacion ${colorize(score,'green')} `);
				//model.update();
			    toBeResolved.splice(randomId,1);
				playOne();

		     } else{
			  log ("Respuesta incorrecta", 'red');
			  log ("Fin del juego", 'red');
			  biglog(`Puntuacion ${colorize(score,'magenta')} `);
			  rl.prompt();
			 }
		   });
		    }catch(error){
		    errorlog(error.message);
			rl.prompt();
		   }
		   }
	  };
	  playOne();
};
*/
exports.playCmd = rl => {
    let score = 0;
    let toBePlayed = [];

    const playOne = () => {

        return Promise.resolve()
            .then (() => {
            if (toBePlayed.length <= 0) {
            console.log("No quedan más preguntas se ha acabado el juegos");
            return;
        }
        let pos = Math.floor(Math.random() * toBePlayed.length);
        let quiz = toBePlayed[pos];
        toBePlayed.splice(pos, 1);

        return makeQuestion(rl, `${quiz.question}:`)
            .then(answer => {
            if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
            score++;
            log('Resuesta correcta', 'green');
            return playOne();
        } else {
            log('Respuesta incorrecta', 'red');
            log("Fin del juego");
        }
    })
    })
    }

    models.quiz.findAll({raw: true})
        .then(quizzes => {
        toBePlayed = quizzes;
})
.then(() => {
        return playOne();
})
.catch(e => {
        console.log("error: " + e);
})
.then(() => {
        console.log(`Tu puntuación actual es:${score}`);
    rl.prompt();
})
};
/*
Esta funcion devuelve una promesa que:
- Valida que se ha introducido un valor para el parametro
- Convierte el parametro en un numero entero

@param is parametro con el indice a validar
 */
const validateId = id => {

    return new Sequelize.Promise((resolve, reject) => {// Sequilize.Promise - promesas de sequielize
        if (typeof id === "undefined") {
        reject(new Error(`Falta el parametro <id>.`)); //SI no me gusta
    } else {
        id = parseInt(id); //cpgo el id y lo convierto en un numero y si es un numero lo resuelvo
        if (Number.isNaN(id)) {
            reject(new Error(`El valor del parámetro <id> no es un número`))
        } else {
            resolve(id); // Se resuelve la promesa con el id
        }
    }
});
};

/*
Cargo un id para ver si esta bien y si lo encuentra o no lo encuentra hara una cosa u otra
 */

exports.showCmd = (rl, id) => {

    validateId(id)
        .then(id => models.quiz.findById(id)) //Del modelo de datos voy al modelo quiz y busco un quiz por id
	.then(quiz => {
        if (!quiz) {
        throw new Error(`No existe un quiz asociado al id=${id}.`);
    }
    log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
})
.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});
};
/*
ESta función devuelve una promesa que cuando se cumple, proporciona el texto introductorio. Entoncés la llamada a then hay que hacer la promesa devuelta será:
	.then(answer => {...})
	@param rl objeto readline utilizado para implementra el CLI
	@param text pregunta que hay que hacerle al usuario
 */
const makeQuestion = (rl, text) => {

    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
        resolve(answer.trim());
});
});
};

/*
exports.showCmd = (rl, id)=>{
	if (typeof id === "undefined"){
		errorlog('Falta el parametro id');
    } else{
	 	 try{
		 	 const quiz = model.getByIndex(id);
			 log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}` );
		 } catch (error){
		 	 errorlog(error.message);
		   }
	     }
	 rl.prompt();
};
*/
exports.creditsCmd = rl =>{
	log('Autores de la practica:');
	 log('CRISTINA Rodriguez Beltran');
	 log('IVAN Martinez Ariza');
	 rl.prompt();
};
exports.quitCmd = rl =>{
	rl.close();
};
