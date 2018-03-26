// JavaScript source code
const{log, biglog, errorlog, colorize} = require("./out");

const Sequelize = require ('sequelize');
const {models} = require('./model');


exports.helpCmd = (socket, rl)=> {
      log(socket, 'Comandos');
	  log(socket,'h|help-Muestra esta ayuda');
      log(socket,'list- Listar los quizzes existentes');
	  log(socket,'show <id> -Muestra la pregunta y la respuesta el quiz indicado');
      log(socket,'add-A�adir un nuevo quiz interactivamente');
      log(socket,'delete <id> -Borrar el quiz indicado');
      log(socket,'edit <id> - Borrar el quiz indicado');
	  log(socket,'test <id> - Probar el quiz indicado');
      log(socket,'p|play -Jugar a preguntar aleatoriamente todos los quizzes');
	  log(socket,'credits -Creditos');
      log(socket,'q|quit -Salir del programa');
	  rl.prompt();
};


const validateId = id =>{

	return new Sequelize.Promise((resolve, reject)=>{
		if (typeof id === 'undefined'){
		reject(new Error('Falta el parametro id'));
    }else{
		id = parseInt (id); //coge la parte entera y descarta lo demas
		if (Number.isNaN(id)){
			reject(new Error('El valor del parametro <id> no es un numero'));
		} else{
			resolve(id);
		}
	}
	});
};


const makeQuestion = (rl, text) => {
	
	return new Sequelize.Promise ((resolve,reject) =>{
		rl.question(colorize(text, 'red'), answer =>{
			resolve(answer.trim());
		});
	});
};
exports.listCmd = (socket, rl) => {
	models.quiz.findAll()
	.each(quiz =>{
	 		 log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
	})
	.catch(error =>{
		errorlog(error.message);
	})
	.then(() =>{
		rl.prompt();
	});
};
exports.addCmd = (socket, rl) => {
    makeQuestion(rl, ' Introduzca una pregunta:')
	.then(q =>{
		return makeQuestion(rl, ' Introduzca la respuesta ')
		.then(a => {
			return {question: q, answer:a};
		});
	})
	.then(quiz =>{
		return models.quiz.create(quiz);
	})
	.then(quiz =>{
			 log(`${colorize('Se ha a�adido', 'magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
	})
	.catch(Sequelize.ValidationError,  error =>{
		errorlog('El quiz es erroneo:');
		error.errors.forEach(({message})=> errorlog(message));
	})
	.catch(error=> {
	errorlog(error.message);
	})
	.then(() =>{
		rl.prompt();
	});
};

exports.deleteCmd =(socket, rl, id)=>{

 validateId(id)
  .then(id => models.quiz.destroy({where: {id}}))
  .catch(error =>{
      errorlog(error.message);
   })
  .then(()=>{
		  	  rl.prompt();
		  });
 };

exports.editCmd = (socket, rl, id) => {
  validateId(id)
  .then(id => models.quiz.findById(id))
  .then(quiz =>{
  	  if (!quiz){
	  	  throw new Error(`No existe un quiz asociado al id=${id}.`);
	  }

		process.stdout.isTTY && setTimeout( () => {rl.write(quiz.question)},0);
         return makeQuestion(rl, ' Introduzca la pregunta: ')
		 .then(q => {
		 process.stdout.isTTY && setTimeout( () => {rl.write(quiz.answer)},0);
		 return makeQuestion(rl, ' Introduzca la respuesta: ')
		 .then(a => {
		     quiz.question = q;
			 quiz.answer = a;
			 return quiz;
		 });
		});
       })
	   .then(quiz =>{
	   	   return quiz.save();
	   })
	    .then(quiz =>{
	   	  log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	   })
	   .catch(Sequelize.ValidationError, error =>{
	   	   errorlog('El quiz es erroneo:');
	   })
	   .then(() =>{
	   	   rl.prompt();
	   });
};
exports.testCmd = (socket, rl,id) => {
		validateId(id) //primero tenemos que validar el usuario
			.then(id => models.quiz.findById(id))
			.then(quiz => {
			    if(!quiz){
	        throw new Error(`No hay un quiz asociado a ese id=${id}.`);
	        }
	        return makeQuestion(rl, `${quiz.question}?: `) //Hacemos la pregunta que queremos testear
	        .then(respuesta => { //guardo la respuesta que he escrito en la pantalla, de la pregunta que hemos elegido nosotros
	        if((respuesta.toLowerCase()) === ((quiz.answer).toLowerCase().trim())) {
	        log('Respuesta correcta', 'green');
	    } else {
	        log('Respuesta Incorrecta', 'red')
	    }
	})
	})
	.catch(Sequelize.ValidationError, error => { //Si hay errores de validaci�n
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

exports.playCmd = rl => {
	    let score = 0;
	    let toBePlayed = [];
	
	    const playOne = () => {
	
	        return Promise.resolve()
	            .then (() => {
	            if (toBePlayed.length <= 0) {
	            console.log("No quedan m�s preguntas se ha acabado el juegos");
	            return;
	        }
	        let pos = Math.floor(Math.random() * toBePlayed.length);
	        let quiz = toBePlayed[pos];
	        toBePlayed.splice(pos, 1);
	
	        return makeQuestion(rl, `${quiz.question}:`) //
	            .then(respuesta => {
	            if(respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
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
	
	    models.quiz.findAll({raw: true}) //para comprobar que no te repita una pregunta que ya hab�as acertado antes
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
	        console.log(`Tu puntuaci�n actual es:${score}`);
	    rl.prompt();
	})
	};



exports.showCmd = (rl, id)=>{  
  validateId(id)
  .then(id => models.quiz.findById(id))
  .then(quiz =>{
  	  if (!quiz){
	  	  throw new Error(`No existe un quiz asociado al id=${id}.`);
	  }
			 log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}` );
		 })
  .catch(error =>{
		 	 errorlog(error.message);
		   })
  .then(()=>{
		  	  rl.prompt();
		  });
};
//una funcion que realiza preguntas



exports.creditsCmd = rl =>{
	log('Autores de la practica:');
	 log('Cristina Rodriguez Beltran');
	 log('Ivan Martinez Ariza');
	 rl.prompt();
};

exports.quitCmd = (socket, rl) =>{
	rl.close();
	socket.end();
};
