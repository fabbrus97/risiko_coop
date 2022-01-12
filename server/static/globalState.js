const cards = {
    "countries": [
        {"nome": "alaska", "tipo":"fante", "image": ""}, {"nome": "territori_n_o", "tipo":"cannone", "image": ""}, {"nome": "groenlandia", "tipo":"cavallo", "image": ""}, {"nome": "alberta", "tipo":"fante", "image": ""}, {"nome": "ontario", "tipo":"cavallo", "image": ""}, {"nome": "quebec", "tipo":"cannone", "image": ""}, {"nome": "stati_uniti_occidentali", "tipo":"fante", "image": ""}, 
        {"nome": "stati_uniti_orientali", "tipo":"cannone", "image": ""}, {"nome": "america_centrale", "tipo":"cavallo", "image": ""}, {"nome": "islanda", "tipo":"fante", "image": ""}, {"nome": "gran_bretagna", "tipo":"cavallo", "image": ""}, {"nome": "europa_occ", "tipo":"fante", "image": ""}, {"nome": "scandinavia", "tipo":"cannone", "image": ""}, {"nome": "europa_sett", "tipo":"cavallo", "image": ""}, 
        {"nome": "europa_mer", "tipo":"cavallo", "image": ""}, {"nome": "ucraina", "tipo":"cannone", "image": ""}, {"nome": "urali", "tipo":"cavallo", "image": ""}, {"nome": "afghanistan", "tipo":"fante", "image": ""}, {"nome": "medio_or", "tipo":"cannone", "image": ""}, {"nome": "siberia", "tipo":"cannone", "image": ""}, {"nome": "giappone", "tipo":"fante", "image": ""}, {"nome": "jacuzia", "tipo":"cavallo", "image": ""}, {"nome": "kamchatka", "tipo":"cavallo", "image": ""}, 
        {"nome": "cita", "tipo":"fante", "image": ""}, {"nome": "mongolia", "tipo":"cannone", "image": ""}, {"nome": "cina", "tipo":"cavallo", "image": ""}, {"nome": "india", "tipo":"fante", "image": ""}, {"nome": "siam", "tipo":"cannone", "image": ""}, {"nome": "venezuela", "tipo":"cannone", "image": ""}, {"nome": "brasile", "tipo":"cannone", "image": ""}, {"nome": "peru", "tipo":"cavallo", "image": ""}, {"nome": "argentina", "tipo":"fante", "image": ""}, {"nome": "africa_n", "tipo":"cavallo", "image": ""}, 
        {"nome": "egitto", "tipo":"fante", "image": ""}, {"nome": "congo", "tipo":"cavallo", "image": ""}, {"nome": "africa_o", "tipo":"cannone", "image": ""}, {"nome": "africa_s", "tipo":"cannone", "image": ""}, {"nome": "madagascar", "tipo":"fante", "image": ""}, {"nome": "indonesia", "tipo":"cavallo", "image": ""}, {"nome": "nuova_guinea", "tipo":"cavallo", "image": ""}, {"nome": "australia_occ", "tipo":"cannone", "image": ""}, 
        {"nome": "australia_or", "tipo":"fante", "image": ""}, {"nome": "bonus", "tipo": "bonus", "image": ""}, {"nome": "bonus", "tipo": "bonus", "image": ""}],
    //se il campo kill è definito, l'obbiettivo conquer è sempre "conquista 24 territori" (se il giocatore è ucciso o non presente)
    //se il campo conquer è true, bisogna conquistare un terzo continente a scelta
    //se nulla è definito, bisogna conquistare 24 territori
    "objectives": [ 
        {"kill": "green", "conquer": {"countries": [], "extra": null}, "image": ""},
        {"kill": "yellow", "conquer": {"countries": [], "extra": null}, "image": ""},
        {"kill": "black", "conquer": {"countries": [], "extra": null}, "image": ""},
        //conquista europa e oceania e un terzo continente a scelta
        {"kill": "", "conquer": {"countries": [9, 10, 11, 12, 13, 14, 15, 38, 39, 40, 41], "extra": true}, "image": ""},
        //conquista asia e sud america
        {"kill": "", "conquer": {"countries": [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31], "extra": false}, "image": ""},
        //conquista nord america e africa
        {"kill": "", "conquer": {"countries": [0, 1, 2, 3, 4, 5, 6, 7, 8, 32, 33, 34, 35, 36, 37], "extra": false}, "image": ""},
        //conquista 24 territori a scelta
        {"kill": "", "conquer": {"countries": [], "extra": null}, "image": ""}
    ]
}

class Player {
    /**
     * 
     * @param {int} turno 
     * @param {string} color 
     * @param {int} tanks 
     * @param {boolean} enemy 
     */
    constructor  (turno, color, tanks, enemy){
        this.turno  = turno;
        this.color = color;
        this.tanks = tanks;
        this.enemy = enemy;

        this.countries = {}
        this.ps = new PrivateState();
    }

    setCountries( countries ){ //gli stati che ha un giocatore e il numero di carri
        //es. {"cina": 1, "madagascar": 3}
        this.countries = countries
    }

    getColor(){
        return this.color
    }

    addCountry( country){
        this.countries[country] = 1
        this.tanks -= 1
    }

    /**
     * 
     * @param {string} country 
     * @param {int} tanks 
     */
     addTanks(country, tanks){ //numero dei carri armati in una zona
        this.countries[country] += tanks
        this.tanks -= tanks
    }

    /**
     * 
     * @param {string} country 
     * @param {int} tanks 
     */
    removeTanks(country, tanks, increaseCounter){
        //se togliamo carri, potrebbe essere perché li abbiamo persi o stiamo facendo uno spostamento
        //e in quel caso this.tanks va decrementato
        //oppure li stiamo posizionando e in quel caso this.tanks va ri-aumentato (magari abbiamo cambiato
        //idea sul numero di carri armati in una regione)
        this.countries[country] -= tanks
        if (increaseCounter)
            this.tanks += tanks
        else
            this.tanks -= tanks
        if (this.countries[country] == 0){
            //remove country
            delete this.countries[country]
        }
    }

    getTanks(){
        return this.tanks
    }
    
    //TODO questa funzione non è chiamata se il primo giocatore droppa la connessione all'inizio, controlla
    start_playing(_cards){
        
        console.log("DEBUG inizio a giocare")

        //tutti hanno pescato un obiettivo, è di nuovo il mio turno
        // si può cominciare a distribuire i territori
        console.log("Il mio obiettivo è ")
        console.log(this.ps.getObjective())
        if (this.turno == 1 && this.ps.getObjective() != null){
            console.log("Tutti hanno un obiettivo, iniziamo a pescare gli stati")
            //questa funzione pesca una carta e dice agli altri giocatori di pescare
            this.set_countries(cards.countries.copyWithin(0, cards.countries.length))
            return;
        }

        //se sono il giocatore 1, cards è null perché sono io il mazziere
        //ovvero prendo le carte, pesco un obiettivo e passo
        if (this.turno != 1 && _cards == null){
            console.log("Attendo il giocatore 1...")
            return
        }



        //se sono il giocatore > 1 mi vengono passate le carte rimanenti
        //quindi pesco e passo
        let available_cards_obj = {};
        if (_cards == null){
            available_cards_obj = cards.objectives.copyWithin(0, cards.objectives.length)
            console.log("GIOCATORE 1 sto per pescare obiettivo da tutte le carte obiettivo:")
            let c = this.draw_card(available_cards_obj)
            this.ps.setObjective(c)
            console.log("Ho pescato e settato l'obiettivo")
            console.log(c)
        } else {
            console.log("GIOCATORE > 1 sto per pescare obiettivo")
            
            let c = this.draw_card(_cards)
            this.ps.setObjective(c)
            console.log("Ho pescato e settato l'obiettivo")
            console.log(c)
            available_cards_obj = _cards
            console.log("Carte rimanenti: ")
            console.log(available_cards_obj)
        }

        let message = {"command": "draw_obj", "cards": available_cards_obj, "turno": this.turno}
        
        // console.log("DEBUG Ho pescato la prima carta, passo")

        window.comm.sendMessage(message)
        
    }

    draw_card(_cards){
        let draw_id = parseInt(Math.random()*100%_cards.length)
        let card = _cards[draw_id]
        _cards.splice(draw_id, 1)
        return card;
    }
    
    set_countries(_cards){
        console.log("DEBUG Ho pescato una carta, sono il giocatore " + this.turno)
        let card = this.draw_card(_cards)
        if (card.nome != "bonus")
        this.addCountry(card.nome)    
        let message = {};
        if (_cards.length > 0){
            message = {"command": "draw_country", "cards": _cards, "turno": this.turno}
            
        } else {
            console.log("DEBUG carte finite, disporre le truppe")
            message = {"command": "start_putting_tanks"}
            //TODO manda array delle nazioni
            start_putting_tanks(Object.keys(this.countries));
        }
        window.comm.sendMessage(message)
    }


}

class GlobalState{
    /*
        controllo dello stato: un giocatore dichiara cosa sta per fare, in modo che ognuno
        possa verificare la legittimità della mossa, e infine invia lo stato modificato
        in modo che ognuno possa verificare che abbia effettivamente fatto quanto dichiarato
    */

    constructor(player) {
        //player sono io
        this.players = []
        this.players.push(player)
    }

    me(){
        return this.players[0]
    }
    
    /*
    come può cambiare lo stato?
        1. un giocatore posiziona i carri armati che riceve a inizio turno
         => controllare che il numero di stati gli consenta di farlo
        2. un giocatore posiziona carri armati per una combo
         => controlla che la combo dia quel numero di carri armati
         => controlla di non avere una carta della combo
        3. attacco:
         => un giocatore toglie carri armati ad un altro giocatore
         => conquista un nuovo territorio e ci sposta dei carri armati
    */ 
    
    /**
     * 
     * @param {GlobalState} previousState 
     */
    checkState(previousState){
        //controlla che lo stato inviato da un giocatore sia uguale al mio
    }

    action(action){
        console.log("Ricevuta azione: " + action.command)
        if (action.command == "next"){
            console.log("Vediamo lo stati degli altri  giocatori...")
            this.players.forEach( p => {
                if (p.turno == action.turno){
                    p.setCountries(action.countries)
                }
            })
        }
        // console.log("DEBUG devo fare qualcosa? " + (action.turno % this.players.length) + " il mio turno è " + this.me().turno)
        if ((action.turno % this.players.length) + 1 != this.me().turno ){
            console.log("Non è il mio turno: ha giocato " + action.turno + " e io sono " + this.me().turno)
            return
        }
        
        console.log("DEBUG Tocca a me fare qualcosa!")
        switch (action.command){
            case "draw_country":
                this.me().set_countries(action.cards)
                break;
            case "draw_obj":
                this.me().start_playing(action.cards);
                //this.players[0].draw_card(action.cards)
                
            break;
            case "start_putting_tanks":
                start_putting_tanks(Object.keys(this.countries))
            case "next":
                your_turn();
                break;
            default:
                console.error("Unknown action")
            break;
        }
    }

    //funzione per passare il turno
    next(){
        console.log("GIOCATORE " + this.me().turno + ": passo il turno")
        window.comm.sendMessage({"command": "next", "tanks": this.me().countries, "turno": this.me().turno})
    }

    /**
     * 
     * @param {Player} player 
     */
    addPlayer(player){
        this.players.push(player)
    }


}

class PrivateState{
    constructor(){
        this.cards = []
    }

    addCard(card){
        this.cards.push(card)
    }

    removeCard(card){        
        this.cards.splice(this.cards.findIndex(card), 1)
    }

    setObjective(obj){
        this.objective = obj
    }

    getObjective(){
        return this.objective
    }

}

