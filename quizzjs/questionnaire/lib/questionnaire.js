var randtoken = require('rand-token');

/*
 * Objet représentant un questionnaire.
 */
function Questionnaire(name, questions, version, token) {
	this.name = name;
	this.token = token;
	this.questions = questions;
	this.version = version;
	this.tabQuestionsPosees = [];
}

///// Accesseurs

/*
 * Retourne le nom du questionnaire.
 * @return string
 */
Questionnaire.prototype.getName = function() {
	return this.name;
}

/*
 * Valorise le nom du questionnaire
 * @param name le nouveau nom du questionnaire
 */
Questionnaire.prototype.setName = function(name) {
	this.name = name;
}

/*
 * Retourne le token, identifiant unique du questionnaire, généré aléatoirement à l'instanciation.
 * @return string
 */
Questionnaire.prototype.getToken = function() {
	return this.token;
}

/*
 * Retourne le tableau des membres du questionnaire
 * @return array.
 */
Questionnaire.prototype.getQuestions = function() {
	return this.questions;
}

/*
 * Retourne le nombre maximum de membres autorisés dans cette salle
 * @return integer.
 */
Questionnaire.prototype.getVersion = function() {
	return this.version;
}

/*
 * Valorise la version du questionnaire
 * @param integer
 */
Questionnaire.prototype.setVersion = function(version) {
		this.version = version;
}

///// Méthodes

/*
 * Methode de création du flux "Question" à envoyer aux clients.
 */
Questionnaire.prototype.getFluxQuestionAleatoire = function(){
    
    do {
        var numQuestionRandom = Math.floor((Math.random() * this.questions.length) + 1) -1;
    }while (this.tabQuestionsPosees.indexOf(numQuestionRandom) > -1);
    this.tabQuestionsPosees.push(numQuestionRandom);
    
    return { idquestion: this.questions[numQuestionRandom].id, 
            question : this.questions[numQuestionRandom].question, 
            reponse1: this.questions[numQuestionRandom].reponse1, 
            reponse2: this.questions[numQuestionRandom].reponse2, 
            reponse3: this.questions[numQuestionRandom].reponse3, 
            reponse4: this.questions[numQuestionRandom].reponse4,
            good: this.questions[numQuestionRandom].good,
            explication: this.questions[numQuestionRandom].explication,
    };
    
}

/*
 * Methode de calcul du résultat sur la question.
 */
Questionnaire.prototype.checkResponse = function(idQuestion, reponse){
    return this.questions[idQuestion].good == reponse;
}

/*
 *Methode permettant de reinitialiser le tableau des questions déjà posées (pour le reload d'une partie).
 */
Questionnaire.prototype.reinitialiserQuestionsPosees = function(){
    this.tabQuestionsPosees = [];
}

exports.Questionnaire = Questionnaire;