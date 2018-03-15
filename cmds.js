// JavaScript source code
const {log, biglog, errorlog, colorize} = require("./out");

const Sequelize = require ('sequelize');
const {models} = require('./model');


exports.helpCmd = rl => {
      log('Comandos');
	  log('h|help-Muestra esta ayuda');
      log('list- Listar los quizzes existentes');
	  log('show <id> -Muestra la pregunta y la respuesta el quiz indicado');
      log('add-Añadir un nuevo quiz interactivamente');
      log('delete <id> -Borrar el quiz indicado');
      log('edit <id> - Borrar el quiz indicado');
	  log('test <id> - Probar el quiz indicado');
      log('p|play -Jugar a preguntar aleatoriamente todos los quizzes');
	  log('credits -Creditos');
      log('q|quit -Salir del programa');
	  rl.prompt();
};


const validateId = id =>{

	return new Sequelize.Promise((resolve, reject)=>{
		if (typeof id === 'undefined'){
		reject(new Error('Falta el parametro id'));
    } else{
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
exports.listCmd = rl => {
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
exports.addCmd = rl => {
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
			 log(`${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
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

exports.deleteCmd =(rl, id)=>{

 validateId(id)
  .then(id => models.quiz.destroy({where: {id}}))
  .catch(error =>{
		 	 errorlog(error.message);
   })
  .then(()=>{
		  	  rl.prompt();
		  });
 };

exports.editCmd = (rl, id) => {
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

exports.testCmd = (rl,id) =>{
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz =>{
  	 if (!quiz){
	  	throw new Error(`No existe un quiz asociado al id=${id}.`);
	 }
	 process.stdout.isTTY && setTimeout( () => {rl.write(quiz.question)},0);
	return makeQuestion(rl, (quiz.question))
	.then(q => {
	 process.stdout.isTTY && setTimeout( () => {rl.write(quiz.answer)},0);
	 return makeQuestion(rl, ' Introduzca la respuesta: ')
	 .then(a =>{
	 if(a.toLowerCase().trim()=== (quiz.answer).toLowerCase().trim()){
			log("Respuesta correcta",'green');
			//rl.prompt();
	  } else{
			log ("Respuesta incorrecta", 'red');
			}
			rl.prompt();
	 //	return {question: q, answer: a};
	 });
	});
	})
	//.then(quiz =>{})
	.catch(Sequelize.ValidationError, error =>{
	   	   errorlog('El quiz es erroneo:');
	})
	.then(() =>{
	   	   rl.prompt();
	});
};
//
//	   if (typeof id === "undefined"){
////		errorlog('Falta el parametro id.');
//		rl.prompt();
//	   } else {
//		  try{
//		  const quiz = model.getByIndex(id);
//		  rl.question(colorize(`${quiz.question}`, 'red'), respuesta1 => {
//		  if(respuesta1.toLowerCase().trim()=== (quiz.answer).toLowerCase().trim()){
	//			log("Respuesta correcta",'green');
	//			//rl.prompt();
//		    } else{
//			  log ("Respuesta incorrecta", 'red');
//			  }
//			  rl.prompt();
//		   });
//		   }catch(error){
//			errorlog(error.message);
//			rl.prompt();
//		   }
//		}
//};

exports.playCmd = rl =>{
	   
	let score = 0;
	let toBeResolved = [];
	models.quiz.findAll()
    .each(quiz => {
        toBeResolved.push(quiz);
    })
	  .then(() => {
            playOne();
        })
 const playOne = () =>{
   if ( toBeResolved.length <= 0 ){
		  log ('No hay mas preguntas','magenta');
		  log("Fin del juego", 'magenta');
		   biglog(`Puntuacion ${colorize(score,'magenta')} `);
		  return;
    }else{
     let randomId = Math.floor(Math.random()*toBeResolved.length);
		   
    // let quiz = model.getByIndex(id);
	//toBeResolved.splice(toBeResolved.indexOf(quizToAsk), 1);
	validateId(randomId)
	 .then(id => models.quiz.findById(randomId))
     .then(quiz =>{
	  if (!quiz){
	  	throw new Error(`No existe un quiz asociado al id=${randomId}.`);
	 }
	  process.stdout.isTTY && setTimeout( () => {rl.write(quiz.question)},0);
	  return makeQuestion(rl, (quiz.question))
	  .then(q => {
	  process.stdout.isTTY && setTimeout( () => {rl.write(quiz.answer)},0);
	  return makeQuestion(rl, ' Introduzca la respuesta: ')
	  .then(a =>{
	   if(a.toLowerCase().trim()=== (quiz.answer).toLowerCase().trim()){
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
	});
    })
	.catch(Sequelize.ValidationError, error =>{
	   	   errorlog('El quiz es erroneo:');
	})
	.then(() =>{
	   	   rl.prompt();
	});
	}
};
	 

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

exports.quitCmd = rl =>{
	rl.close();
};
