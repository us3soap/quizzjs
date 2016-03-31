var randtoken = require('rand-token');

/*
 * Objet représentant un membre d'une salle.
 */
function Member() {
	this.token = randtoken.generate(16);
	this.data = {};
}

/*
 * Retourne le token, identifiant unique du membre, généré aléatoirement à l'instanciation.
 * @return string
 */
Member.prototype.getToken = function() {
	return this.token;
}

/*
 * Valorise la donnée du membre passée en paramètre
 * @param name nom de la donnée à valoriser
 * @param value valeur de la donnée
 */
Member.prototype.set = function(name, value) {
	this.data[name] = value;
	/*var tab = {};
	tab[name] = value;
	this.data = Object.assign(this.data, tab);*/ 
}

/*
 * Retourne la donnée du membre passée en paramètre
 * @param name nom de la donnée à récupérer
 * @return string valeur de la donnée
 */
Member.prototype.get = function(name) {
	return this.data[name];
}

exports.Member = Member;