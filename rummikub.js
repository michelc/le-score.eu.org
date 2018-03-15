/* globals docCookies */
/* eslint-env browser */

var Player = (function () {
  function Player (first_name) {
    // Nom du joueur
    this.name = first_name;

    // Points restants à la fin de la manche
    this.minus = 0;

    // Ou points gagnés sinon
    this.plus = 0;

    // Historique des scores du joueur
    this.scores = [];

    // Nombre de victoires
    this.victories = 0;
  }

  Player.prototype.scoreLine = function () {
    // Renvoie une ligne expliquant le score du joueur

    // Retrouve le score en cours et celui de la manche précédente
    var last = 0, previous = 0;
    if (this.scores.length === 1) {
      last = this.scores[0];
    } else {
      last = this.scores[this.scores.length - 1];
      previous = this.scores[this.scores.length - 2];
    }

    // Détail du score en cours
    var text = "";
    // - score précédent
    text += ("    " + previous).slice(-4);
    // - plus ou moins
    text += last < previous ? " - " : " + ";
    // - les points restants / gagnés
    text += ("   " + Math.abs(last - previous)).slice(-3);
    // - donne le score actuel
    text += " = " + ("    " + last).slice(-4);
    // - complété avec nombre de victoires
    text += " (" + this.victories.toString() + ")";
    return text;
  };

  return Player;
}());

var Rummikub = (function () {
  function Rummikub () {
    // Liste des joueurs
    this.players = [];

    // Nombre de joueurs
    this.count = 0;

    // Index et joueur en cours
    this.current = -1;
    this.playing = null;

    // Gagnant de la manche
    this.winner = null;

    // Prochain joueur
    this.next = null;
  }

  Rummikub.prototype.addPlayer = function (first_name) {
    // Ajoute un joueur à la liste des joueurs

    first_name = first_name.trim().toLowerCase().replace(/\|/g, "");
    if (first_name !== "") {
      this.players.push(new Player(first_name));
      this.count++;
    }
  };

  Rummikub.prototype.checkPlayers = function () {
    // Contrôle la liste des joueurs

    // Vérifie qu'il y a assez de joueurs
    if (this.count < 2) return false;

    // Tire au sort le joueur qui va commencer
    this.current = Math.floor(Math.random() * this.count);
    this.playing = this.players[this.current];

    // Tout va bien
    return true;
  };

  Rummikub.prototype.clearPoints = function () {
    // Initialise les points de la manche en cours

    for (var i = 0; i < this.count; i++) {
      this.players[i].minus = 0;
      this.players[i].plus = 0;
    }
    this.winner = null;
  };

  Rummikub.prototype.setPoints = function (index, points) {
    // Défini les points restants d'un joueur

    // Rien à faire s'il s'agit d'un joueur caché
    if (index >= this.count) return;

    // Contrôle que la valeur saisie est bien numérique
    points = 1 * points;
    if (!isNaN(points))
      if (isFinite(points))
        this.players[index].minus = Math.floor(Math.abs(points));
  };

  Rummikub.prototype.checkPoints = function () {
    // Vérifie que les points saisis sont cohérents

    // Calcule le nombre de perdant et qui a gagné
    var losers = 0;
    var total = 0;
    var winner = -1;
    for (var i = 0; i < this.count; i++) {
      if (this.players[i].minus !== 0) {
        losers++;
        total += this.players[i].minus;
      } else {
        winner = i;
      }
    }

    // Rien à faire si tous les points restants n'ont pas été saisis
    if (losers !== this.count - 1) return false;

    // Défini le gagnant de la manche
    this.winner = this.players[winner];
    this.winner.plus = total;

    // Retrouve le prochain joueur à commencer
    var next = this.current + 1 === this.count ? 0 : this.current + 1;
    this.next = this.players[next];

    // Tout va bien
    return true;
  };

  Rummikub.prototype.savePoints = function () {
    // Met à jour les scores avec les points de la manche

    for (var i = 0; i < this.count; i++) {
      var scores = this.players[i].scores;
      var score = scores.length === 0 ? 0 : scores[scores.length - 1];
      score -= this.players[i].minus;
      score += this.players[i].plus;
      scores.push(score);
    }
    this.winner.victories++;
  };

  Rummikub.prototype.undoPoints = function () {
    // Annule les scores de la dernière manche

    for (var i = 0; i < this.count; i++) {
      this.players[i].scores.pop();
    }
    this.winner.victories--;
  };

  Rummikub.prototype.nextRound = function () {
    // Entame une nouvelle manche

    // Au joueur suivant de commencer la nouvelle manche
    var next = this.current + 1 === this.count ? 0 : this.current + 1;
    this.current = next;
    this.playing = this.players[next];

    // Points à zéro pour la nouvelle manche
    this.clearPoints();
  };

  Rummikub.prototype.sortedPlayers = function () {
    // Renvoie la liste des joueurs triés du 1° au dernier

    var players = this.players.concat().sort(function(a, b) {
      var c = b.scores[b.scores.length - 1] - a.scores[a.scores.length - 1];
      if (c === 0) c = b.victories - a.victories;
      if (c === 0) c = b.name < a.name;
      return c;
    });
    return players;
  };

  return Rummikub;
}());

function $(selector) {
  var by_id = true;
  if (selector.indexOf("#") !== -1)
    by_id = false;
  else if (selector.indexOf(".") !== -1)
    by_id = false;
  else if (selector.indexOf(" ") !== -1)
    by_id = false;

  if (by_id) return document.getElementById(selector);

  var list = document.querySelectorAll(selector);
  if (list === null) return null;
  if (list.length === 1) return list[0];
  return list;
}

function $hide(element) { element.style.display = "none"; }
function $show(element) { element.style.display = "block"; }

var le_score = new Rummikub();
Start();

function Start() {
  CookieLoad();
  $("#joueurs input")[0].focus();
  $("#joueurs .action").addEventListener("click", ClearPlayers);
  $("#joueurs button").addEventListener("click", GotoPoints);
  var inputs = $("#points input");
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("input", CheckPoints);
  }
  $("#points button").addEventListener("click", GotoScores);
  $("#scores .action").addEventListener("click", UndoScores);
  $("#scores button").addEventListener("click", NextRound);
}

function CookieLoad()
{
  // Récupère le prénom des derniers joueurs

  var rk_players = docCookies.getItem("rk_players");
  if (rk_players === null) return;
  var names = rk_players.split("|");
  var inputs = $("#joueurs input");
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = names[i] || "";
  }
}

function CookieSave()
{
  // Sauvegarde la liste des joueurs (pendant 10 jours)

  var names = "";
  for (var i = 0; i < le_score.count; i++) {
    names += "|";
    names += le_score.players[i].name;
  }
  docCookies.setItem("rk_players", names.substr(1), 10 * 24 * 60 * 60);
}

function CookieKill()
{
  // Supprime la sauvegarde des joueurs

  docCookies.removeItem("rk_players");
}

function ClearPlayers() {
  // Vide les zones de saisie des prénoms

  // Efface les prénoms déjà saisis
  var inputs = $("#joueurs input");
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
  }

  // Supprime la sauvegarde des joueurs
  CookieKill();
}

function GotoPoints() {
  // Passe de l'écran de saisie des joueurs à celui de saisie des points

  // Retrouve le prénom des différents joueurs
  le_score = new Rummikub();
  var inputs = $("#joueurs input");
  for (var i = 0; i < inputs.length; i++) {
    le_score.addPlayer(inputs[i].value);
  }

  // Vérifie que la partie peut commencer
  if (!le_score.checkPlayers()) {
    beep("Il faut au moins 2 joueurs");
    // alert("Il faut au moins 2 joueurs"); // TODO smartphone ?
    return;
  }

  // Sauvegarde la liste des joueurs (pendant 10 jours)
  CookieSave();

  // Affiche le nom du joueur qui doit commencer
  $("#points h2 strong").textContent = le_score.playing.name;

  // Affiche les joueurs sur l'écran de saisie des points
  var lines = $("#points li");
  var spans = $("#points li span");
  for (i = 0; i < lines.length; i++) {
    if (i < le_score.count)
      spans[i].textContent = le_score.players[i].name;
    else
      $hide(lines[i]);
  }

  // Active l'écran de saisie des points
  ShowPoints();
}

function CheckPoints() {
  // Vérifie la saisie des points en continu

  // Contrôle les points saisis
  le_score.clearPoints();
  var inputs = $("#points input");
  for (var i = 0; i < inputs.length; i++) {
    le_score.setPoints(i, inputs[i].value);
  }

  // Affiche éventuellement qui a gagné
  var html = "";
  if (le_score.checkPoints())
    html = "<span>OK</span> " + le_score.winner.name + " a gagné !";
  else
    html = "<span>...</span> qui c'est qui gagne ?";
  $("#points button").innerHTML = html;

  // Renvoie true s'il y a un gagnant
  return le_score.checkPoints();
}

function GotoScores() {
  // Passe de l'écran de saisie des points à celui d'affichage des scores

  // Vérifie les points restants (et qui a gagné)
  if (!CheckPoints()) {
    var message = "Il faut " + (le_score.count - 1).toString() + " perdant";
    if (le_score.count > 2) message += "s";
    beep(message);
    // alert(message); // TODO smartphone ?
    return;
  }

  // Affiche le nom du gagnant
  $("#scores h2 strong").textContent = le_score.winner.name;

  // Met à jour les scores
  le_score.savePoints();

  // Affiche les scores (du 1° au dernier)
  var players = le_score.sortedPlayers();
  var h3s = $("#scores h3");
  var pres = $("#scores pre");
  for (var i = 0; i < h3s.length; i++) {
    if (i < le_score.count) {
      h3s[i].textContent = players[i].name;
      pres[i].textContent = players[i].scoreLine();
    } else {
      $hide(h3s[i]);
      $hide(pres[i]);
    }
  }

  // Affiche le nom du joueur suivant
  $("#scores button strong").textContent = le_score.next.name;

  // Passe de la saisie des points à l'affichage des scores
  $hide($("points"));
  $show($("scores"));
}

function UndoScores() {
  // Retourne en correction des derniers points saisis

  // Supprime le dernier score
  le_score.undoPoints();

  // Ré-active l'écran de saisie des points
  ShowPoints();
}

function NextRound() {
  // Commence une nouvelle partie

  // Passe au joueur suivant
  le_score.nextRound();
  $("#points h2 strong").textContent = le_score.playing.name;

  // Vide les zones de saisie des points
  var inputs = $("#points input");
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
  }
  CheckPoints();

  // Active l'écran de saisie des points
  ShowPoints();
}

function ShowPoints() {
  // Active l'écran de saisie des points

  $hide($("joueurs"));
  $hide($("scores"));
  $show($("points"));
  var inputs = $("#points input");
  inputs[0].focus();
}

function beep(message) {
  // http://www.rgagnon.com/jsdetails/js-0024.html
  // https://stackoverflow.com/questions/19018859/wait-until-sound-finish-to-use-page

  var beep = "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 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=";
  (new Audio("data:audio/wav;base64," + beep)).play();
  setTimeout(function () { alert(message) }, 50);
}
