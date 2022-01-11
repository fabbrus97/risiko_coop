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
    }

    /**
     * 
     * @param {string} country 
     * @param {int} tanks 
     */
     addTanks(country, tanks){ //numero dei carri armati in una zona
        this.countries[country] += tanks
    }

    /**
     * 
     * @param {string} country 
     * @param {int} tanks 
     */
    removeTanks(country, tanks){
        this.countries[country] -= tanks

    }
    
    //TODO questa funzione non è chiamata se il primo giocatore droppa la connessione all'inizio, controlla
    start_playing(){
        
        console.log("DEBUG inizio a giocare, il mio turno è " + this.turno)

        let available_cards = cards.countries.copyWithin(0, cards.countries.length)
        let draw_id = parseInt(Math.random()*100%available_cards.length)
        let card = available_cards[card_id]
        available_cards.splice(card_id, 1)
        this.countries[card.nome] = 1
        let message = {"command": "draw", "cards": available_cards, "turno": turno}
        
        console.log("DEBUG Ho pescato la prima carta, passo")

        Communication.sendMessage(message)
        
    }

    draw_card(cards){

        console.log("DEBUG Ho pescato una carta, sono il giocatore " + this.turno)

        let draw_id = parseInt(Math.random()*100%cards.length)
        let card = cards[card_id]
        cards.splice(card_id, 1)
        this.countries[card.nome] = 1
        let message = {};
        if (cards.length > 0){
            message = {"command": "draw", "cards": cards, "turno": turno}
            console.log("DEBUG passo")
        } else {
            console.log("DEBUG carte finite, disporre le truppe")
            message = {"command": "start_putting_tanks"}
            GlobalState.start_putting_tanks();
        }
        Communication.sendMessage(message)
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

        if ((action.turno % this.players.length) + 1 != this.me().turno ){
            return
        }
        
        console.log("DEBUG Tocca a me fare qualcosa!")
        switch (action.command){
            case "draw":
                this.players[0].draw_card(action.cards)
                
            break;
            case "start_putting_tanks":
                this.start_putting_tanks()

            default:
                console.error("Unknown action")
            break;
        }
    }

    /**
     * 
     * @param {Player} player 
     */
    addPlayer(player){
        this.players.push(player)
    }

    start_putting_tanks(){
        //TODO qualcosa di grafico deve succedere
        console.log("Inizia a posizionare i carri...")
    }
}

class PrivateState{
    constructor(objective){
        this.objective = objective
    }

    setBonusCards(cards){
        this.cards = cards;
    }

}

