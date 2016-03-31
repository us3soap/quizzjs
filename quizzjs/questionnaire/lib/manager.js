var Questionnaire = require('./questionnaire').Questionnaire;

/*
 * Gestionnaire des questions.
 */
exports.QuestionnaireManager = {
    questionnaires : [],
    
    loadQuestionnaire : function(data, token) {

		for(var i=0; i<this.questionnaires.length; i++)
		{
			if(this.questionnaires.getToken() == data.token){
			    return this.questionnaires[i];
			} 
				
		}
		var questionnaire = new Questionnaire(data.name, data.questions, data.version, token);
		this.questionnaires.push(questionnaire);
        return questionnaire.getToken();

	},
	
	getQuestionnaire : function(token) {
		for(var i=0; i<this.questionnaires.length; i++)
		{
			if(this.questionnaires[i].getToken() == token)
				return this.questionnaires[i];
		}
		
		return false;
	}
}